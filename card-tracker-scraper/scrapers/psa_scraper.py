from __future__ import annotations

import logging
import re
from urllib.parse import quote_plus

import requests

from scrapers.base import BaseScraper
from utils.models import Listing

logger = logging.getLogger(__name__)

_PSA_POP_URL = "https://www.psacard.com/pop/search-results"


class PSAScraper(BaseScraper):
    source = "psa"

    def fetch(self, card_name: str) -> list[Listing]:
        """Fetch PSA population report data for *card_name*.

        Queries the PSA population report search endpoint and parses the
        total graded population count. Raises on network errors so the
        pipeline can log and skip gracefully. If the population count
        cannot be parsed from the page, a warning is logged and
        ``sold_count`` is set to 0.
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
            _PSA_POP_URL,
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
        else:
            logger.warning(
                "PSA pop-report: could not parse population count for %r; "
                "returning sold_count=0.",
                card_name,
            )

        return [
            Listing(
                source=self.source,
                card_name=card_name,
                price=0.0,
                listing_id=f"{card_name}-psa-pop",
                listing_url=f"{_PSA_POP_URL}?q={quote_plus(card_name)}",
                sold_count=total_pop,
            )
        ]
