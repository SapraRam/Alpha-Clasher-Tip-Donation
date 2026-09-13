# Gamer Fan Hub — Donations & OBS Alerts API

FastAPI backend for UPI donations (Razorpay Payment Links), meme feed, and realtime OBS overlay alerts via Socket.io.

## Features

- **POST /donations/create** — multipart donation with meme + optional voice (₹1000+)
- **POST /webhook/razorpay** — HMAC-verified payment confirmation
- **GET /donations/{streamerId}/history** — recent confirmed donations
- **GET /streamers/{streamerId}** — public streamer profile
- **Socket.io** — `new_donation` events to overlay room `streamer_{id}`
- **Meme feed** — existing `/api/memes` routes

## Quick Start

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Set DEV_MOCK_PAY=1 for local testing without Razorpay live UPI
python main.py
```

API runs at `http://localhost:8000`. Socket.io at `http://localhost:8000/socket.io`.

## Database

Uses Postgres in production (`DATABASE_URL`). Falls back to SQLite (`sqlite:///./donations.db`) locally.

```bash
alembic upgrade head
```

On startup, tables are created and `alpha-clasher` streamer is seeded from `OVERLAY_TOKEN`.

## Razorpay UPI Payment Links

1. Create Razorpay account and enable UPI Payment Links (live mode).
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
3. Register webhook: `https://<your-api-host>/webhook/razorpay`
   - Events: `payment.captured`, `payment_link.paid`
4. UPI links open GPay/PhonePe on Android; desktop shows UPI QR.

**Local dev:** set `DEV_MOCK_PAY=1`. Donations auto-redirect with `?mock=1`; frontend calls `POST /donations/{id}/mock-confirm`.

## OBS Overlay Setup

1. Set a strong `OVERLAY_TOKEN` in backend `.env`.
2. In OBS, add **Browser Source**:
   ```
   http://localhost:3000/overlay/alpha-clasher?token=YOUR_OVERLAY_TOKEN
   ```
3. Width: **1920**, Height: **1080**
4. **Shutdown source when not visible: OFF**
5. **Control audio via OBS: ON** (required for voice clips on YouTube)

## Environment

See [`.env.example`](.env.example) for all variables.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string |
| `RAZORPAY_*` | Payment + webhook HMAC |
| `STORAGE_BACKEND` | `local` (VM disk) or `s3` (AWS / Oracle OSS / GCS interop) |
| `PUBLIC_MEDIA_URL` | Public base URL for media, e.g. `https://api.yourdomain.com/uploads` or CloudFront URL |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` | Object storage when `STORAGE_BACKEND=s3` |
| `REDIS_URL` | Multi-worker Socket.io (optional locally) |
| `OVERLAY_TOKEN` | Secret for OBS browser source |
| `FRONTEND_URL` | Payment callback + CORS |
| `DEV_MOCK_PAY` | Skip Razorpay locally |

## Frontend

Next.js app uses `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

- Donate: `/donate/alpha-clasher`
- Overlay: `/overlay/alpha-clasher?token=...`
