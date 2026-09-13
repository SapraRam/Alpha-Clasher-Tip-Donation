import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache
def get_settings():
    return Settings()


class Settings:
    def __init__(self) -> None:
        self.database_url: str = os.getenv(
            "DATABASE_URL", "sqlite:///./donations.db"
        )
        self.razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "")
        self.razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "")
        self.razorpay_webhook_secret: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
        # Media: local (VM disk) or s3 (AWS S3 / Oracle Object Storage / GCS S3-interop)
        self.storage_backend: str = os.getenv("STORAGE_BACKEND", "local")
        self.mirror_memes: bool = os.getenv("MIRROR_MEMES", "1") == "1"
        self.public_media_url: str = os.getenv("PUBLIC_MEDIA_URL", "")
        self.s3_bucket: str = os.getenv("S3_BUCKET", "")
        self.s3_region: str = os.getenv("S3_REGION", "ap-south-1")
        self.s3_endpoint: str = os.getenv("S3_ENDPOINT", "")
        self.s3_access_key: str = os.getenv("S3_ACCESS_KEY", "")
        self.s3_secret_key: str = os.getenv("S3_SECRET_KEY", "")
        self.redis_url: str = os.getenv("REDIS_URL", "")        self.overlay_token: str = os.getenv(
            "OVERLAY_TOKEN", "dev-overlay-token-change-me"
        )
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.dev_mock_pay: bool = os.getenv("DEV_MOCK_PAY", "0") == "1"
        self.cors_origins: list[str] = [
            o.strip()
            for o in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if o.strip()
        ]
        self.donation_rate_limit: int = int(os.getenv("DONATION_RATE_LIMIT", "10"))
        self.donation_rate_window: int = int(os.getenv("DONATION_RATE_WINDOW", "60"))
