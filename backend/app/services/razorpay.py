import time
from decimal import Decimal

import httpx

from app.config import get_settings


class RazorpayError(Exception):
    pass


async def create_upi_payment_link(
    *,
    donation_id: str,
    amount_paise: int,
    streamer_id: str,
    donor_name: str | None,
) -> dict:
    settings = get_settings()
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        if settings.dev_mock_pay:
            return {
                "id": f"mock_pl_{donation_id[:8]}",
                "short_url": f"{settings.frontend_url}/donate/{streamer_id}?donation={donation_id}&mock=1",
            }
        raise RazorpayError("Razorpay credentials are not configured")

    expire_by = int(time.time()) + 15 * 60
    payload = {
        "upi_link": True,
        "amount": amount_paise,
        "currency": "INR",
        "accept_partial": False,
        "reference_id": donation_id.replace("-", "")[:40],
        "description": f"Donation to {streamer_id}",
        "expire_by": expire_by,
        "customer": {
            "name": donor_name or "Anonymous",
        },
        "notify": {"sms": False, "email": False},
        "notes": {"donation_id": donation_id},
        "callback_url": f"{settings.frontend_url}/donate/{streamer_id}?donation={donation_id}",
        "callback_method": "get",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.razorpay.com/v1/payment_links",
            json=payload,
            auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
        )
        if response.status_code >= 400:
            raise RazorpayError(response.text)
        return response.json()


def rupees_to_paise(amount: Decimal) -> int:
    return int(amount * 100)
