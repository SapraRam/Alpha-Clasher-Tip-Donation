from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.donation_service import (
    donation_to_payload,
    get_confirmed_since,
    get_streamer,
    verify_overlay_token,
)

router = APIRouter(tags=["Overlay"])


@router.get("/overlay/poll")
def overlay_poll(
    streamer_id: str = Query(..., alias="streamer"),
    token: str = Query(...),
    since: str | None = Query(None, description="ISO timestamp; only donations after this"),
    db: Session = Depends(get_db),
):
    """Lightweight OBS poll — token required, returns only new confirmed donations."""
    if not get_streamer(db, streamer_id):
        raise HTTPException(status_code=404, detail="Streamer not found")
    if not verify_overlay_token(db, streamer_id, token):
        raise HTTPException(status_code=401, detail="Invalid overlay token")

    since_dt = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(seconds=120)
    if since:
        try:
            parsed = datetime.fromisoformat(since.replace("Z", "+00:00"))
            if parsed.tzinfo:
                parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
            since_dt = parsed
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid since timestamp") from None

    donations = get_confirmed_since(db, streamer_id, since_dt)
    server_now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    return {
        "streamer_id": streamer_id,
        "server_time": server_now,
        "donations": [donation_to_payload(d) for d in donations],
    }
