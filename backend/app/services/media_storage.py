"""Media storage: local disk (dev/small VPS) or S3-compatible (AWS S3, Oracle OSS, GCS interop)."""

import uuid
from pathlib import Path
from urllib.parse import urlparse

import httpx

from app.config import get_settings

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent / "uploads"
MEME_DIR = UPLOAD_ROOT / "memes"
VOICE_DIR = UPLOAD_ROOT / "voices"

_CONTENT_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "video/webm": "webm",
}


def _ext_from_content_type(content_type: str, fallback: str = "bin") -> str:
    base = (content_type or "").split(";")[0].strip().lower()
    return _CONTENT_EXT.get(base, fallback)


def _public_url(key: str) -> str:
    settings = get_settings()
    base = settings.public_media_url.rstrip("/")
    if base:
        return f"{base}/{key}"
    return f"/uploads/{key}"


def _save_local(folder: str, data: bytes, content_type: str, fallback_ext: str) -> str:
    target_dir = UPLOAD_ROOT / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    ext = _ext_from_content_type(content_type, fallback_ext)
    filename = f"{uuid.uuid4().hex}.{ext}"
    (target_dir / filename).write_bytes(data)
    return _public_url(f"{folder}/{filename}")


def _s3_client():
    import boto3

    settings = get_settings()
    kwargs: dict = {"region_name": settings.s3_region or None}
    if settings.s3_endpoint:
        kwargs["endpoint_url"] = settings.s3_endpoint
    if settings.s3_access_key and settings.s3_secret_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **{k: v for k, v in kwargs.items() if v})


def _save_s3(folder: str, data: bytes, content_type: str, fallback_ext: str) -> str | None:
    settings = get_settings()
    if not settings.s3_bucket:
        return None
    ext = _ext_from_content_type(content_type, fallback_ext)
    key = f"{folder}/{uuid.uuid4().hex}.{ext}"
    try:
        client = _s3_client()
        client.put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=data,
            ContentType=content_type or "application/octet-stream",
        )
        return _public_url(key)
    except Exception:
        return None


def _store_bytes(folder: str, data: bytes, content_type: str, fallback_ext: str) -> str | None:
    settings = get_settings()
    if settings.storage_backend == "s3":
        url = _save_s3(folder, data, content_type, fallback_ext)
        if url:
            return url
    return _save_local(folder, data, content_type, fallback_ext)


async def upload_from_url(url: str, folder: str = "memes") -> str:
    """Download external meme URL and store a stable copy."""
    settings = get_settings()
    if settings.storage_backend == "local" and not settings.mirror_memes:
        return url

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code >= 400:
                return url
            content_type = response.headers.get("content-type", "image/jpeg")
            stored = _store_bytes(folder, response.content, content_type, "jpg")
            return stored or url
    except Exception:
        return url


async def upload_voice_bytes(data: bytes, content_type: str) -> str | None:
    return _store_bytes("voices", data, content_type, "webm")
