from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.donation import Donation, DonationStatus
from app.services.media_storage import upload_from_url, upload_voice_bytes
from app.services.donation_service import (
    donation_to_payload,
    get_recent_confirmed,
    get_streamer,
)
from app.services.rate_limit import check_rate_limit
from app.services.razorpay import RazorpayError, create_upi_payment_link, rupees_to_paise
from app.services.sanitize import sanitize_text
from app.socketio_app import emit_new_donation

router = APIRouter(tags=["Donations"])

VOICE_MIN_AMOUNT = 1000
MIN_AMOUNT = 20
MAX_VOICE_BYTES = 1_048_576
ALLOWED_VOICE_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "video/webm",
}


@router.post("/donations/create")
async def create_donation(
    request: Request,
    streamer_id: str = Form(...),
    amount: float = Form(...),
    meme_url: str = Form(...),
    name: str | None = Form(None),
    message: str | None = Form(None),
    voice: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    check_rate_limit(request)

    streamer = get_streamer(db, streamer_id)
    if not streamer:
        raise HTTPException(status_code=404, detail="Streamer not found")

    if amount < MIN_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Minimum donation is ₹{MIN_AMOUNT}")

    if not meme_url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid meme URL")

    clean_name = sanitize_text(name, max_length=64) or "Anonymous"
    clean_message = sanitize_text(message, max_length=300)
    amount_decimal = Decimal(str(round(amount, 2)))
    amount_paise = rupees_to_paise(amount_decimal)

    voice_url: str | None = None
    if voice and voice.filename:
        if amount < VOICE_MIN_AMOUNT:
            raise HTTPException(
                status_code=400,
                detail=f"Voice messages require at least ₹{VOICE_MIN_AMOUNT}",
            )
        content_type = voice.content_type or "audio/webm"
        if content_type not in ALLOWED_VOICE_TYPES:
            raise HTTPException(status_code=400, detail="Unsupported voice format")
        voice_bytes = await voice.read()
        if len(voice_bytes) > MAX_VOICE_BYTES:
            raise HTTPException(status_code=400, detail="Voice clip must be under 1MB")
        voice_url = await upload_voice_bytes(voice_bytes, content_type)
        if not voice_url:
            raise HTTPException(
                status_code=502,
                detail="Voice upload failed. Check STORAGE_BACKEND and disk/S3 configuration.",
            )

    stored_meme_url = await upload_from_url(meme_url)
    donation = Donation(
        streamer_id=streamer_id,
        name=clean_name,
        amount=amount_decimal,
        amount_paise=amount_paise,
        meme_url=stored_meme_url,
        message=clean_message,
        voice_url=voice_url,
        status=DonationStatus.pending,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    settings = get_settings()
    try:
        payment_link = await create_upi_payment_link(
            donation_id=donation.id,
            amount_paise=amount_paise,
            streamer_id=streamer_id,
            donor_name=clean_name,
        )
    except RazorpayError as exc:
        donation.status = DonationStatus.failed
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    donation.payment_link_id = payment_link.get("id")
    db.commit()

    return {
        "donation_id": donation.id,
        "status": donation.status.value,
        "short_url": payment_link.get("short_url"),
        "amount": float(donation.amount),
        "dev_mock_pay": settings.dev_mock_pay,
    }


@router.get("/donations/{streamer_id}/history")
def donation_history(streamer_id: str, db: Session = Depends(get_db)):
    streamer = get_streamer(db, streamer_id)
    if not streamer:
        raise HTTPException(status_code=404, detail="Streamer not found")
    donations = get_recent_confirmed(db, streamer_id, limit=20)
    return {
        "streamer_id": streamer_id,
        "donations": [donation_to_payload(d) for d in donations],
    }


@router.get("/donations/status/{donation_id}")
def get_donation(donation_id: str, db: Session = Depends(get_db)):
    donation = db.get(Donation, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {
        "donation_id": donation.id,
        "status": donation.status.value,
        "amount": float(donation.amount),
        "name": donation.name,
        "message": donation.message,
        "meme_url": donation.meme_url,
        "voice_url": donation.voice_url,
    }


@router.post("/donations/{donation_id}/mock-confirm")
async def mock_confirm_donation(donation_id: str, db: Session = Depends(get_db)):
    settings = get_settings()
    if not settings.dev_mock_pay:
        raise HTTPException(status_code=404, detail="Not found")

    donation = db.get(Donation, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation.status == DonationStatus.confirmed:
        return {"status": "already_confirmed", "donation_id": donation.id}

    if donation.status != DonationStatus.pending:
        raise HTTPException(status_code=400, detail="Donation is not pending")

    donation.status = DonationStatus.confirmed
    donation.transaction_id = f"mock_{donation.id[:12]}"
    db.commit()

    payload = donation_to_payload(donation)
    await emit_new_donation(donation.streamer_id, payload)

    return {"status": "confirmed", "donation_id": donation.id}
