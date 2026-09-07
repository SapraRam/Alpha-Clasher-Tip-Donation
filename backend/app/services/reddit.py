import httpx
from typing import List, Set
from app.models.meme import MemeObject
from datetime import datetime

INDIAN_SUBREDDITS = [
    "IndianDankMemes",
    "indiameme",
    "HindiMemes",
    "dankinindia",
]

GLOBAL_SUBREDDITS = [
    "memes",
    "dankmemes",
    "me_irl",
    "funny",
]

def is_valid_media_url(url: str) -> bool:
    if not url:
        return False
    clean = url.lower().split("?")[0]
    return (
        clean.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif"))
        or "i.redd.it" in url
        or "i.imgflip.com" in url
    )

def calculate_trend_score(ups: int, comments: int) -> float:
    # Formula from guide: trend_score = upvotes * 0.5 + comments * 0.1 + freshness_score * 0.4
    return (ups * 0.5) + (comments * 0.1) + 400.0

async def fetch_reddit_memes() -> List[MemeObject]:
    memes: List[MemeObject] = []
    seen_urls: Set[str] = set()

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Ingest Indian Feeds
        for sub in INDIAN_SUBREDDITS:
            try:
                resp = await client.get(f"https://meme-api.com/gimme/{sub}/12")
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("memes", []):
                        url = item.get("url", "")
                        if item.get("nsfw") or item.get("spoiler") or not is_valid_media_url(url) or url in seen_urls:
                            continue
                        seen_urls.add(url)
                        ups = int(item.get("ups", 0))
                        post_id = item.get("postLink", "").split("/")[-1] or str(hash(url))
                        memes.append(
                            MemeObject(
                                id=f"reddit-{sub}-{post_id}",
                                source="reddit",
                                source_id=item.get("postLink") or url,
                                title=item.get("title") or "Indian Stream Meme",
                                image_url=url,
                                post_url=item.get("postLink") or f"https://reddit.com/r/{sub}",
                                author=item.get("author") or "reddit_user",
                                subreddit=sub,
                                category="indian",
                                language="hindi" if sub == "HindiMemes" else "hinglish",
                                score=ups,
                                comments=12,
                                trend_score=calculate_trend_score(ups, 12),
                                created_at=datetime.utcnow().isoformat(),
                                nsfw=False,
                                spoiler=False,
                                tag=f"r/{sub}",
                            )
                        )
            except Exception as e:
                print(f"[Reddit Service] Warning fetching {sub}: {e}")

        # Ingest Global Feeds
        for sub in GLOBAL_SUBREDDITS:
            try:
                resp = await client.get(f"https://meme-api.com/gimme/{sub}/8")
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("memes", []):
                        url = item.get("url", "")
                        if item.get("nsfw") or item.get("spoiler") or not is_valid_media_url(url) or url in seen_urls:
                            continue
                        seen_urls.add(url)
                        ups = int(item.get("ups", 0))
                        post_id = item.get("postLink", "").split("/")[-1] or str(hash(url))
                        memes.append(
                            MemeObject(
                                id=f"reddit-{sub}-{post_id}",
                                source="reddit",
                                source_id=item.get("postLink") or url,
                                title=item.get("title") or "Global Trending Meme",
                                image_url=url,
                                post_url=item.get("postLink") or f"https://reddit.com/r/{sub}",
                                author=item.get("author") or "reddit_user",
                                subreddit=sub,
                                category="global",
                                language="english",
                                score=ups,
                                comments=25,
                                trend_score=calculate_trend_score(ups, 25),
                                created_at=datetime.utcnow().isoformat(),
                                nsfw=False,
                                spoiler=False,
                                tag=f"r/{sub}",
                            )
                        )
            except Exception as e:
                print(f"[Reddit Service] Warning fetching {sub}: {e}")

    return memes
