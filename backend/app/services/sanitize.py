import re

_TAG_RE = re.compile(r"<[^>]+>")


def sanitize_text(value: str | None, max_length: int = 300) -> str | None:
    if value is None:
        return None
    cleaned = _TAG_RE.sub("", value).strip()
    if not cleaned:
        return None
    return cleaned[:max_length]
