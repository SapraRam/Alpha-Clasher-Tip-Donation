import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DonationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    expired = "expired"
    failed = "failed"


class Donation(Base):
    __tablename__ = "donations"
    __table_args__ = (
        Index("ix_donations_streamer_created", "streamer_id", "created_at"),
        Index("ix_donations_status_created", "status", "created_at"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    streamer_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("streamers.id"), nullable=False
    )
    name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    amount_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    meme_url: Mapped[str] = mapped_column(Text, nullable=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    voice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[DonationStatus] = mapped_column(
        Enum(DonationStatus), default=DonationStatus.pending, nullable=False
    )
    transaction_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    payment_link_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    streamer = relationship("Streamer", back_populates="donations")
