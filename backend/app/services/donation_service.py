from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.donation import Donation, DonationStatus
from app.models.streamer import Streamer
from app.seed import hash_token


def get_streamer(db: Session, streamer_id: str) -> Streamer | None:
    return db.get(Streamer, streamer_id)


def verify_overlay_token(db: Session, streamer_id: str, token: str) -> bool:
    streamer = get_streamer(db, streamer_id)
    if not streamer:
        return False
    return streamer.overlay_token_hash == hash_token(token)


def donation_to_payload(donation: Donation) -> dict:
    return {
        "id": donation.id,
        "name": donation.name or "Anonymous",
        "amount": float(donation.amount),
        "meme_url": donation.meme_url,
        "message": donation.message,
        "voice_url": donation.voice_url,
        "created_at": donation.created_at.isoformat() if donation.created_at else None,
    }


def get_recent_confirmed(db: Session, streamer_id: str, limit: int = 20) -> list[Donation]:
    stmt = (
        select(Donation)
        .where(
            Donation.streamer_id == streamer_id,
            Donation.status == DonationStatus.confirmed,
        )
        .order_by(Donation.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_confirmed_since(
    db: Session,
    streamer_id: str,
    since: datetime,
    limit: int = 50,
) -> list[Donation]:
    stmt = (
        select(Donation)
        .where(
            Donation.streamer_id == streamer_id,
            Donation.status == DonationStatus.confirmed,
            Donation.created_at > since,
        )
        .order_by(Donation.created_at.asc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_recent_for_catchup(db: Session, streamer_id: str, seconds: int = 60) -> list[Donation]:
    cutoff = datetime.utcnow() - timedelta(seconds=seconds)
    stmt = (
        select(Donation)
        .where(
            Donation.streamer_id == streamer_id,
            Donation.status == DonationStatus.confirmed,
            Donation.created_at >= cutoff,
        )
        .order_by(Donation.created_at.asc())
    )
    return list(db.scalars(stmt).all())


def expire_stale_pending(db: Session) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=15)
    stmt = select(Donation).where(
        Donation.status == DonationStatus.pending,
        Donation.created_at < cutoff,
    )
    donations = list(db.scalars(stmt).all())
    for donation in donations:
        donation.status = DonationStatus.expired
    if donations:
        db.commit()
    return len(donations)
