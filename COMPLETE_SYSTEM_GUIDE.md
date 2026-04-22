# Card Capital - Complete System Guide

## System Overview
Card Capital is a full-stack trading card investment platform with:
1. **Frontend dashboard** (`card-tracker-dashboard.html`, `CardTracker.jsx`)
2. **Backend pipeline** (`card-tracker-scraper/`)
3. **Automation** (`.github/workflows/daily-scrape.yml`)

## Architecture
1. Scrapers collect listings and market signals from eBay, TCGPlayer, CardMarket, and PSA.
2. The enrichment layer adds Gemini-based sentiment and investment scoring.
3. Supabase persists both raw listings and market snapshots.
4. The dashboard consumes snapshot history for charts and market panels.

## Data Tracked
- Average price
- High/low range
- Trading volume
- Graded card counts
- Market sentiment
- Investment score
- Trend window data

## Deployment Path
1. Configure environment variables from `.env.example`.
2. Run pipeline locally with `python run_pipeline.py`.
3. Set GitHub Actions secrets.
4. Enable scheduled daily automation.

## Recommended Extension
Add a lightweight API layer (FastAPI or Next.js API routes) for dashboard querying, auth, and historical filtering.
