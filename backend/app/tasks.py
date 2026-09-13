import asyncio

from app.database import SessionLocal
from app.services.donation_service import expire_stale_pending


async def run_expiry_loop() -> None:
    while True:
        db = SessionLocal()
        try:
            expire_stale_pending(db)
        finally:
            db.close()
        await asyncio.sleep(60)
