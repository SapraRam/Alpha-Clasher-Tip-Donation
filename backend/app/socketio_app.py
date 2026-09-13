import socketio

from app.config import get_settings
from app.database import SessionLocal
from app.services.donation_service import (
    donation_to_payload,
    get_recent_for_catchup,
    verify_overlay_token,
)

settings = get_settings()

# OBS Browser Source may send null/odd origins — allow all in dev
_cors = "*" if settings.dev_mock_pay else settings.cors_origins

if settings.redis_url:
    mgr = socketio.AsyncRedisManager(settings.redis_url)
    sio = socketio.AsyncServer(
        async_mode="asgi",
        cors_allowed_origins=_cors,
        client_manager=mgr,
    )
else:
    sio = socketio.AsyncServer(
        async_mode="asgi",
        cors_allowed_origins=_cors,
    )


@sio.event
async def connect(sid, environ, auth):
    if not auth:
        print("[socket] rejected: no auth payload")
        return False

    streamer_id = auth.get("streamerId") or auth.get("streamer_id")
    token = auth.get("token")
    if not streamer_id or not token:
        print("[socket] rejected: missing streamerId or token")
        return False

    db = SessionLocal()
    try:
        if not verify_overlay_token(db, streamer_id, token):
            print(f"[socket] rejected: invalid token for {streamer_id}")
            return False
    finally:
        db.close()

    print(f"[socket] overlay connected: {streamer_id} sid={sid}")

    await sio.enter_room(sid, f"streamer_{streamer_id}")

    db = SessionLocal()
    try:
        recent = get_recent_for_catchup(db, streamer_id, seconds=60)
        for donation in recent:
            await sio.emit("new_donation", donation_to_payload(donation), to=sid)
    finally:
        db.close()


async def emit_new_donation(streamer_id: str, payload: dict) -> None:
    await sio.emit("new_donation", payload, room=f"streamer_{streamer_id}")
