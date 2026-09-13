import hashlib
import hmac
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.donation import Donation, DonationStatus
from app.services.donation_service import donation_to_payload
from app.socketio_app import emit_new_donation

router = APIRouter(tags=["Webhooks"])


def verify_razorpay_signature(body: bytes, signature: str | None) -> bool:
    settings = get_settings()
    if not settings.razorpay_webhook_secret:
        return settings.dev_mock_pay
    if not signature:
        return False
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def _extract_payment_id(payload: dict) -> str | None:
    payment_entity = payload.get("payment", {}).get("entity", {})
    if payment_entity.get("id"):
        return payment_entity["id"]
    entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    return entity.get("id")


def _extract_payment_link_id(payload: dict) -> str | None:
    link_entity = payload.get("payment_link", {}).get("entity", {})
    if link_entity.get("id"):
        return link_entity["id"]
    entity = payload.get("payload", {}).get("payment_link", {}).get("entity", {})
    return entity.get("id")


def _extract_donation_id(payload: dict) -> str | None:
    notes = payload.get("notes") or {}
    if notes.get("donation_id"):
        return notes["donation_id"]
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    payment_notes = payment_entity.get("notes") or {}
    return payment_notes.get("donation_id")


@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")

    if not verify_razorpay_signature(body, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        event = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload") from None

    event_type = event.get("event", "")
    if event_type not in {"payment.captured", "payment_link.paid"}:
        return {"status": "ignored", "event": event_type}

    donation_id = _extract_donation_id(event)
    payment_link_id = _extract_payment_link_id(event)
    payment_id = _extract_payment_id(event)

    donation: Donation | None = None
    if donation_id:
        donation = db.get(Donation, donation_id)
    if not donation and payment_link_id:
        donation = (
            db.query(Donation)
            .filter(Donation.payment_link_id == payment_link_id)
            .first()
        )

    if not donation:
        return {"status": "ignored", "reason": "donation_not_found"}

    if donation.status == DonationStatus.confirmed:
        if donation.transaction_id and payment_id and donation.transaction_id == payment_id:
            return {"status": "already_confirmed"}
        return {"status": "already_confirmed"}

    donation.status = DonationStatus.confirmed
    if payment_id:
        donation.transaction_id = payment_id
    db.commit()

    payload = donation_to_payload(donation)
    await emit_new_donation(donation.streamer_id, payload)

    return {"status": "confirmed", "donation_id": donation.id}
