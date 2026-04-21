from __future__ import annotations

import json
import logging
import os
from statistics import mean

from google import genai
from google.genai import types

from utils.models import EnrichedSnapshot, Listing

logger = logging.getLogger(__name__)

_SENTIMENT_PROMPT = """\
You are a trading card market analyst. Given the following market data for \
the card "{card_name}" sourced from "{source}", provide a one-word sentiment \
(bullish, bearish, or neutral) and an investment score from 0 to 100 \
(higher = better investment). Respond in JSON format only, like:
{{"sentiment": "bullish", "investment_score": 72.5}}

Market data:
- Average price: ${avg_price}
- Min price: ${min_price}
- Max price: ${max_price}
- Total volume (sold count): {volume}
"""


class GeminiEnricher:
    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        self._use_ai = bool(api_key)
        if self._use_ai:
            self._client = genai.Client(api_key=api_key)
        else:
            logger.warning(
                "GEMINI_API_KEY is not set; falling back to rule-based enrichment."
            )

    def enrich(self, source: str, card_name: str, listings: list[Listing]) -> EnrichedSnapshot:
        prices = [entry.price for entry in listings if entry.price > 0]
        if not prices:
            prices = [0.0]
        avg_price = mean(prices)
        min_price = min(prices)
        max_price = max(prices)
        volume = sum(item.sold_count for item in listings)

        sentiment = "neutral"
        score = 0.0

        if self._use_ai:
            try:
                prompt = _SENTIMENT_PROMPT.format(
                    card_name=card_name,
                    source=source,
                    avg_price=round(avg_price, 2),
                    min_price=round(min_price, 2),
                    max_price=round(max_price, 2),
                    volume=volume,
                )
                response = self._client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    ),
                )
                parsed = json.loads(response.text)
                sentiment = str(parsed.get("sentiment", "neutral")).lower()
                score = float(parsed.get("investment_score", 0.0))
                score = min(100.0, max(0.0, score))
            except Exception:
                logger.exception(
                    "Gemini enrichment failed for %r/%r; using rule-based fallback.",
                    source,
                    card_name,
                )
                sentiment, score = self._rule_based(avg_price)
        else:
            sentiment, score = self._rule_based(avg_price)

        return EnrichedSnapshot(
            source=source,
            card_name=card_name,
            avg_price=round(avg_price, 2),
            min_price=round(min_price, 2),
            max_price=round(max_price, 2),
            volume=volume,
            sentiment=sentiment,
            investment_score=round(score, 2),
        )

    @staticmethod
    def _rule_based(avg_price: float) -> tuple[str, float]:
        score = min(100.0, max(0.0, avg_price / 5))
        sentiment = "bullish" if score >= 50 else "neutral"
        return sentiment, score
