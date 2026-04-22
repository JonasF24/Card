from __future__ import annotations

import os
from urllib.parse import quote_plus

import requests
from requests_oauthlib import OAuth1

from scrapers.base import BaseScraper
from utils.models import Listing

_CM_API_BASE = "https://api.cardmarket.com/ws/v2.0/output.json"
_CM_SEARCH_URL = "https://www.cardmarket.com/en/Search"


class CardMarketScraper(BaseScraper):
    source = "cardmarket"

    def __init__(self) -> None:
        self.app_token = os.getenv("CARDMARKET_APP_TOKEN", "")
        self.app_secret = os.getenv("CARDMARKET_APP_SECRET", "")
        self.access_token = os.getenv("CARDMARKET_ACCESS_TOKEN", "")
        self.access_token_secret = os.getenv("CARDMARKET_ACCESS_TOKEN_SECRET", "")

    def fetch(self, card_name: str) -> list[Listing]:
        if not all(
            [
                self.app_token,
                self.app_secret,
                self.access_token,
                self.access_token_secret,
            ]
        ):
            raise RuntimeError(
                "CardMarket OAuth credentials are not fully set "
                "(CARDMARKET_APP_TOKEN, CARDMARKET_APP_SECRET, "
                "CARDMARKET_ACCESS_TOKEN, CARDMARKET_ACCESS_TOKEN_SECRET); "
                "cannot fetch CardMarket listings."
            )

        auth = OAuth1(
            self.app_token,
            self.app_secret,
            self.access_token,
            self.access_token_secret,
        )
        resp = requests.get(
            f"{_CM_API_BASE}/products/find",
            params={"search": card_name, "exact": 0, "onlyExact": 0, "maxResults": 5},
            auth=auth,
            timeout=10,
        )
        resp.raise_for_status()

        listings: list[Listing] = []
        for product in resp.json().get("product", []):
            product_id = product.get("idProduct")
            price_info = product.get("priceGuide", {})
            market_price = price_info.get("SELL") or price_info.get("AVG1")
            if market_price is None:
                continue
            # Use a generic search URL so it works for any card game, not just Magic.
            listing_url = f"{_CM_SEARCH_URL}?searchString={quote_plus(card_name)}"
            listings.append(
                Listing(
                    source=self.source,
                    card_name=card_name,
                    price=float(market_price),
                    currency="EUR",
                    listing_id=f"cm-{product_id}",
                    listing_url=listing_url,
                    sold_count=0,
                )
            )
        return listings
