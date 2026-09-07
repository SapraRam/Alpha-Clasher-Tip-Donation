import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.memes import router as memes_router

app = FastAPI(
    title="Gamer Fan Hub — Indian & Global Meme Feed API",
    description="High performance Reddit + Imgflip meme feed service with caching, filtering, and trend ranking.",
    version="1.0.0",
)

# Enable CORS for React/Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(memes_router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "meme-feed-api",
        "endpoints": [
            "/api/memes",
            "/api/memes?category=indian",
            "/api/memes?category=global",
            "/api/memes/templates",
            "/api/memes/refresh"
        ],
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
