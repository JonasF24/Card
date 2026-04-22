# Card Capital Scraper

Automated backend pipeline for collecting daily trading card market data from multiple sources and saving enriched results to Supabase.

## Features
- Multi-source scraping: eBay, TCGPlayer, CardMarket, PSA
- Deduplication and rate limiting
- Gemini-based sentiment and investment scoring
- Supabase persistence
- Daily automation via GitHub Actions

## Quick start
1. Copy `.env.example` to `.env` and fill credentials.
2. Install dependencies: `pip install -r requirements.txt`
3. Run once: `python run_pipeline.py`

## Project layout
- `scrapers/`: source-specific scrapers
- `enrichment/`: Gemini enrichment logic
- `database/`: Supabase persistence
- `utils/`: shared data models and helpers
- `../.github/workflows/daily-scrape.yml`: automation workflow
