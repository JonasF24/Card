from __future__ import annotations

import os

import requests

from scrapers.base import BaseScraper
from utils.models import Listing


class EbayScraper(BaseScraper):
    source = "ebay"

    def __init__(self) -> None:
        self.app_id = os.getenv("EBAY_APP_ID", "")

    def fetch(self, card_name: str) -> list[Listing]:
        if not self.app_id:
            raise RuntimeError(
                "EBAY_APP_ID is not set; cannot fetch eBay listings."
            )

        url = "https://svcs.ebay.com/services/search/FindingService/v1"
        params = {
            "OPERATION-NAME": "findCompletedItems",
            "SERVICE-VERSION": "1.0.0",
            "SECURITY-APPNAME": self.app_id,
            "RESPONSE-DATA-FORMAT": "JSON",
            "keywords": card_name,
            "categoryId": "2536",  # Trading Cards & Accessories
            "itemFilter(0).name": "SoldItemsOnly",
            "itemFilter(0).value": "true",
            "sortOrder": "EndTimeSoonest",
            "paginationInput.entriesPerPage": "10",
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        items = (
            data.get("findCompletedItemsResponse", [{}])[0]
            .get("searchResult", [{}])[0]
            .get("item", [])
        )

        listings: list[Listing] = []
        for item in items:
            try:
                price = float(
                    item["sellingStatus"][0]["currentPrice"][0]["__value__"]
                )
                listing_id = item["itemId"][0]
                listing_url = item["viewItemURL"][0]
            except (KeyError, IndexError, ValueError):
                continue
            listings.append(
                Listing(
                    source=self.source,
                    card_name=card_name,
                    price=price,
                    listing_id=listing_id,
                    listing_url=listing_url,
                    sold_count=1,
                )
            )
        return listings
