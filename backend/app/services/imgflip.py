import httpx
from typing import List
from app.models.meme import MemeObject
from datetime import datetime

IMGFLIP_API_URL = "https://api.imgflip.com/get_memes"

async def fetch_imgflip_templates() -> List[MemeObject]:
    templates: List[MemeObject] = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(IMGFLIP_API_URL)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "memes" in data.get("data", {}):
                    for m in data["data"]["memes"][:50]:
                        template_id = str(m.get("id"))
                        templates.append(
                            MemeObject(
                                id=f"imgflip-{template_id}",
                                source="imgflip",
                                source_id=template_id,
                                title=m.get("name", "Meme Template"),
                                image_url=m.get("url", ""),
                                post_url=f"https://imgflip.com/meme/{template_id}",
                                author="Imgflip",
                                subreddit="templates",
                                category="templates",
                                language="english",
                                score=5000,
                                comments=m.get("box_count", 2) * 10,
                                trend_score=8000.0,
                                created_at=datetime.utcnow().isoformat(),
                                nsfw=False,
                                spoiler=False,
                                tag="Imgflip Template",
                            )
                        )
    except Exception as e:
        print(f"[Imgflip Service] Error fetching templates: {e}")
    return templates
