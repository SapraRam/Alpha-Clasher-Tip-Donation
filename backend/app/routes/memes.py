from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
import time
from app.models.meme import MemeObject
from app.services.reddit import fetch_reddit_memes
from app.services.imgflip import fetch_imgflip_templates

router = APIRouter(prefix="/api/memes", tags=["Memes"])

# In-memory cache store (10 minute TTL as per guide)
cache_store: Dict[str, Any] = {
    "memes": [],
    "templates": [],
    "last_fetched": 0,
}
CACHE_TTL = 600  # 10 minutes

async def get_or_refresh_memes(force: bool = False) -> List[MemeObject]:
    now = time.time()
    if not force and cache_store["memes"] and (now - cache_store["last_fetched"] < CACHE_TTL):
        return cache_store["memes"]

    reddit_memes = await fetch_reddit_memes()
    imgflip_templates = await fetch_imgflip_templates()

    combined = reddit_memes + imgflip_templates
    cache_store["memes"] = combined
    cache_store["templates"] = imgflip_templates
    cache_store["last_fetched"] = now
    return combined

@router.get("", response_model=Dict[str, Any])
async def get_memes(
    category: Optional[str] = Query(None, description="indian | global | templates | all"),
    language: Optional[str] = Query(None, description="hindi | hinglish | english"),
    sort: Optional[str] = Query("trending", description="trending | score | newest"),
    source: Optional[str] = Query(None, description="reddit | imgflip"),
    q: Optional[str] = Query(None, description="Search keyword"),
):
    memes = await get_or_refresh_memes()
    results = list(memes)

    if category and category != "all":
        results = [m for m in results if m.category == category]

    if language:
        results = [m for m in results if m.language == language]

    if source:
        results = [m for m in results if m.source == source]

    if q:
        query_lower = q.lower()
        results = [
            m for m in results
            if query_lower in m.title.lower()
            or (m.subreddit and query_lower in m.subreddit.lower())
            or query_lower in m.author.lower()
            or (m.tag and query_lower in m.tag.lower())
        ]

    if sort == "trending":
        results.sort(key=lambda m: m.trend_score, reverse=True)
    elif sort == "score":
        results.sort(key=lambda m: m.score, reverse=True)
    elif sort == "newest":
        results.sort(key=lambda m: m.created_at, reverse=True)

    return {
        "success": True,
        "total": len(results),
        "category": category or "all",
        "sort": sort,
        "memes": [m.model_dump() for m in results],
    }

@router.get("/templates", response_model=Dict[str, Any])
async def get_templates():
    if not cache_store["templates"]:
        await get_or_refresh_memes()
    return {
        "success": True,
        "total": len(cache_store["templates"]),
        "source": "imgflip",
        "templates": [m.model_dump() for m in cache_store["templates"]],
    }

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_memes():
    memes = await get_or_refresh_memes(force=True)
    return {
        "success": True,
        "message": "Memes successfully refreshed from Reddit and Imgflip",
        "total_memes": len(memes),
        "total_templates": len(cache_store["templates"]),
    }
