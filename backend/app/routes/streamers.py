from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.donation_service import get_streamer

router = APIRouter(tags=["Streamers"])


@router.get("/streamers/{streamer_id}")
def get_streamer_profile(streamer_id: str, db: Session = Depends(get_db)):
    streamer = get_streamer(db, streamer_id)
    if not streamer:
        raise HTTPException(status_code=404, detail="Streamer not found")
    return {
        "id": streamer.id,
        "display_name": streamer.display_name,
    }
