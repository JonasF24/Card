# Deployment Guide

## 1) Prerequisites
- Python 3.11+
- GitHub repository
- Supabase project

## 2) Local bootstrap
```bash
cd card-tracker-scraper
cp .env.example .env
pip install -r requirements.txt
python run_pipeline.py
```

## 3) Database tables
Create two tables in Supabase:

### `market_listings`
Use JSON-compatible columns for payload fields or create typed columns matching the Pydantic model in `utils/models.py`.
Add a unique constraint on `(source, listing_id)` so that `upsert` correctly deduplicates rows instead of inserting duplicates.

### `market_snapshots`
Add a unique constraint on `(source, card_name, generated_at)` (or a surrogate key) so that `upsert` behaviour is deterministic.

## 4) GitHub Actions secrets
Set these repository secrets:
- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `EBAY_APP_ID`
- `TCGPLAYER_PUBLIC_KEY`
- `TCGPLAYER_PRIVATE_KEY`
- `CARDMARKET_APP_TOKEN`
- `CARDMARKET_APP_SECRET`
- `CARDMARKET_ACCESS_TOKEN`
- `CARDMARKET_ACCESS_TOKEN_SECRET`

## 5) Enable automation
Push to default branch. The workflow is located at `.github/workflows/daily-scrape.yml` (repository root) and runs daily at 02:00 UTC.
