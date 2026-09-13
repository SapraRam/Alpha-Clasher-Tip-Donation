import hashlib

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.streamer import Streamer


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def seed_streamers(db: Session) -> None:
    settings = get_settings()
    streamer_id = "alpha-clasher"
    existing = db.get(Streamer, streamer_id)
    token_hash = hash_token(settings.overlay_token)

    if existing:
        existing.overlay_token_hash = token_hash
        existing.display_name = "Alpha Clasher"
    else:
        db.add(
            Streamer(
                id=streamer_id,
                display_name="Alpha Clasher",
                overlay_token_hash=token_hash,
            )
        )
    db.commit()
