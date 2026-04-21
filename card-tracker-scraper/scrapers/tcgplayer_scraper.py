from __future__ import annotations

import os

import requests

from scrapers.base import BaseScraper
from utils.models import Listing

_TCGPLAYER_TOKEN_URL = "https://api.tcgplayer.com/token"
_TCGPLAYER_API_BASE = "https://api.tcgplayer.com/v1.39.0"


class TCGPlayerScraper(BaseScraper):
    source = "tcgplayer"

    def __init__(self) -> None:
        self.public_key = os.getenv("TCGPLAYER_PUBLIC_KEY", "")
        self.private_key = os.getenv("TCGPLAYER_PRIVATE_KEY", "")

    def _get_access_token(self) -> str:
        resp = requests.post(
            _TCGPLAYER_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self.public_key,
                "client_secret": self.private_key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()["access_token"]

    def fetch(self, card_name: str) -> list[Listing]:
        if not self.public_key or not self.private_key:
            raise RuntimeError(
                "TCGPLAYER_PUBLIC_KEY or TCGPLAYER_PRIVATE_KEY is not set; "
                "cannot fetch TCGPlayer listings."
            )

        access_token = self._get_access_token()
        headers = {"Authorization": f"bearer {access_token}"}

        search_resp = requests.get(
            f"{_TCGPLAYER_API_BASE}/catalog/products",
            params={"productName": card_name, "limit": 5, "offset": 0},
            headers=headers,
            timeout=10,
        )
        search_resp.raise_for_status()

        listings: list[Listing] = []
        for product in search_resp.json().get("results", []):
            product_id = product["productId"]
            price_resp = requests.get(
                f"{_TCGPLAYER_API_BASE}/pricing/product/{product_id}",
                headers=headers,
                timeout=10,
            )
            if price_resp.status_code != 200:
                continue
            for price_info in price_resp.json().get("results", []):
                market_price = price_info.get("marketPrice")
                if market_price is None:
                    continue
                sub_type = price_info.get("subTypeName", "normal")
                listings.append(
                    Listing(
                        source=self.source,
                        card_name=card_name,
                        price=float(market_price),
                        listing_id=f"{product_id}-{sub_type}",
                        listing_url=f"https://www.tcgplayer.com/product/{product_id}",
                        sold_count=int(price_info.get("lowQuantity") or 0),
                    )
                )
        return listings
