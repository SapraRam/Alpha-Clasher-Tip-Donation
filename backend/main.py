import asyncio
import contextlib
from pathlib import Path

import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routes.donations import router as donations_router
from app.routes.memes import router as memes_router
from app.routes.overlay import router as overlay_router
from app.routes.streamers import router as streamers_router
from app.routes.webhooks import router as webhooks_router
from app.seed import seed_streamers
from app.socketio_app import sio
from app.tasks import run_expiry_loop

settings = get_settings()

fastapi_app = FastAPI(
    title="Gamer Fan Hub — Donations & OBS Alerts API",
    description="Meme feed, Razorpay UPI donations, and realtime OBS overlay alerts.",
    version="2.0.0",
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(memes_router)
fastapi_app.include_router(donations_router)
fastapi_app.include_router(overlay_router)
fastapi_app.include_router(streamers_router)
fastapi_app.include_router(webhooks_router)

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
fastapi_app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@fastapi_app.on_event("startup")
async def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_streamers(db)
    finally:
        db.close()
    fastapi_app.state.expiry_task = asyncio.create_task(run_expiry_loop())


@fastapi_app.on_event("shutdown")
async def on_shutdown() -> None:
    task = getattr(fastapi_app.state, "expiry_task", None)
    if task:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


STATIC_DIR = Path(__file__).resolve().parent / "static"
OBS_OVERLAY_HTML = STATIC_DIR / "obs-overlay.html"


@fastapi_app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "donations-obs-api",
        "endpoints": [
            "/obs",
            "/donations/create",
            "/donations/{streamerId}/history",
            "/streamers/{streamerId}",
            "/webhook/razorpay",
            "/api/memes",
        ],
    }


@fastapi_app.get("/obs")
def obs_overlay():
    """Standalone HTML overlay for OBS Browser Source (no Next.js / React required)."""
    return FileResponse(
        OBS_OVERLAY_HTML,
        media_type="text/html",
        headers={"Cache-Control": "no-store"},
    )


app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="/socket.io")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(__import__("os").getenv("PORT", "8000")), reload=True)
