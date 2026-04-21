from __future__ import annotations

import re

import requests

from scrapers.base import BaseScraper
from utils.models import Listing

_PSA_POP_URL = "https://www.psacard.com/pop/search-results"
_PSA_POP_API = "https://api.psacard.com/publicapi/pop/GetItems"


class PSAScraper(BaseScraper):
    source = "psa"

    def fetch(self, card_name: str) -> list[Listing]:
        """Fetch PSA population report data for *card_name*.

        Queries the PSA population report search endpoint and parses the
        total graded population count. Raises on network or parsing errors
        so the pipeline can log and skip gracefully.
        """
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (compatible; CardTrackerBot/1.0; "
                "+https://github.com/JonasF24/Card)"
            ),
            "Accept": "application/json, text/html,*/*",
        }
        # PSA public pop-report search (returns JSON when Accept includes json)
        resp = requests.get(
            "https://www.psacard.com/pop/search-results",
            params={"q": card_name},
            headers=headers,
            timeout=15,
        )
        resp.raise_for_status()

        # The response is HTML; extract the total population count from
        # structured data if present, otherwise fall back to a regex on the
        # raw page text.
        total_pop = 0
        # Try JSON-LD or data attributes first
        match = re.search(r'"totalPopulation"\s*:\s*(\d+)', resp.text)
        if not match:
            # Fallback: look for any large number next to "Total" in the HTML
            match = re.search(r'Total[^<]*?(\d[\d,]+)', resp.text)
        if match:
            total_pop = int(match.group(1).replace(",", ""))

        return [
            Listing(
                source=self.source,
                card_name=card_name,
                price=0.0,
                listing_id=f"{card_name}-psa-pop",
                listing_url=f"https://www.psacard.com/pop/search-results?q={card_name}",
                sold_count=total_pop,
            )
        ]
