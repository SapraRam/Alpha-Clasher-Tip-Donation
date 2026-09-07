from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class MemeObject(BaseModel):
    id: str = Field(description="Internal unique identifier")
    source: Literal["reddit", "imgflip", "classic"] = Field(description="Meme data source")
    source_id: str = Field(description="Original post ID or template ID")
    title: str = Field(description="Meme title or template name")
    image_url: str = Field(description="Direct URL to meme image")
    post_url: str = Field(description="URL to original post or template")
    author: str = Field(default="anonymous", description="Post author username")
    subreddit: Optional[str] = Field(default=None, description="Subreddit origin for Reddit memes")
    category: Literal["indian", "global", "templates", "classic"] = Field(default="global")
    language: Literal["hinglish", "hindi", "english"] = Field(default="english")
    score: int = Field(default=0, description="Upvotes / points")
    comments: int = Field(default=0, description="Comment count")
    trend_score: float = Field(default=0.0, description="Calculated trending score")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    nsfw: bool = Field(default=False)
    spoiler: bool = Field(default=False)
    dialogue: Optional[str] = Field(default=None, description="Iconic dialogue or punchline")
    tag: Optional[str] = Field(default=None, description="Community tag or flair")
