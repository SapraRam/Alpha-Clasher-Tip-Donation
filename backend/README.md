# FastAPI Indian & Global Meme Feed Service

This backend service powers the live stream donation meme feed, built according to the **Meme API Integration Guide**.

## Features
- **Reddit Community Feeds**: Fresh Indian memes (`r/IndianDankMemes`, `r/indiameme`, `r/HindiMemes`, `r/dankinindia`) + Global memes (`r/memes`, `r/dankmemes`, `r/me_irl`).
- **Imgflip Meme Templates**: Real-time access to top 100 official meme templates.
- **In-Memory Caching**: 10-minute TTL cache protecting against upstream rate limits.
- **Ranking & Filtering**: Trend score calculation, duplicate rejection, and NSFW/spoiler checks.
- **Unified Schema**: Normalizes all memes into the internal Meme data model.

## Quick Start

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The service will run on `http://localhost:8000`.

## API Endpoints
- `GET /api/memes`: All memes with optional filters (`?category=indian`, `?category=global`, `?language=hindi`, `?sort=trending`, `?q=search`)
- `GET /api/memes/templates`: Official Imgflip meme templates
- `POST /api/memes/refresh`: Cache invalidation trigger
