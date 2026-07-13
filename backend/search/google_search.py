"""
Google qidiruv moduli — FAQAT yordamchi rol uchun:
1) dori rasmi topish;
2) GoPharm hech qanday natija bermagan holatda zaxira qidiruv.

Google Custom Search JSON API ishlatiladi. Ishlashi uchun ikkita muhit
o'zgaruvchisi kerak: GOOGLE_API_KEY va GOOGLE_CSE_ID (Custom Search Engine ID).
Agar ular sozlanmagan bo'lsa, funksiyalar SearchError bilan tushunarli
xatolik qaytaradi — chaqiruvchi kod buni ushlab, natijasiz davom etishi kerak
(GoPharm asosiy manba bo'lgani uchun Google ixtiyoriy qo'shimcha hisoblanadi).
"""

import logging
import os

import requests

from backend.search.schemas import SearchError, SearchResult

GOOGLE_CUSTOM_SEARCH_URL = "https://www.googleapis.com/customsearch/v1"
REQUEST_TIMEOUT_SECONDS = 5

logger = logging.getLogger(__name__)


def _get_credentials() -> tuple[str, str]:
    api_key = os.environ.get("GOOGLE_API_KEY")
    cse_id = os.environ.get("GOOGLE_CSE_ID")
    if not api_key or not cse_id:
        raise SearchError(
            "Google qidiruvi sozlanmagan (GOOGLE_API_KEY / GOOGLE_CSE_ID yo'q)"
        )
    return api_key, cse_id


def search_medicine_image(query: str) -> str | None:
    """Berilgan dori nomi uchun bitta rasm URL manzilini qidiradi."""
    api_key, cse_id = _get_credentials()

    try:
        response = requests.get(
            GOOGLE_CUSTOM_SEARCH_URL,
            params={
                "key": api_key,
                "cx": cse_id,
                "q": f"{query} dori",
                "searchType": "image",
                "num": 1,
                "safe": "active",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Google rasm qidiruvi muvaffaqiyatsiz: %s", exc)
        raise SearchError("Google rasm qidiruvida xatolik yuz berdi") from exc

    items = payload.get("items") or []
    if not items:
        return None
    return items[0].get("link")


def search_fallback(query: str, limit: int = 3) -> list[SearchResult]:
    """
    GoPharm hech narsa topmagan holatlar uchun oddiy matnli zaxira qidiruv.

    Natijalar GoPharm formatidagi kabi narx/rasm bermaydi — faqat nom va
    tavsif (veb-sahifa snippeti) beradi, "source" maydoni "google" bo'ladi.
    """
    api_key, cse_id = _get_credentials()

    try:
        response = requests.get(
            GOOGLE_CUSTOM_SEARCH_URL,
            params={
                "key": api_key,
                "cx": cse_id,
                "q": f"{query} dori narxi",
                "num": limit,
                "safe": "active",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Google zaxira qidiruvi muvaffaqiyatsiz: %s", exc)
        raise SearchError("Google qidiruvida xatolik yuz berdi") from exc

    items = payload.get("items") or []

    return [
        SearchResult(
            name=item.get("title", query),
            description=item.get("snippet"),
            price=None,
            image_url=None,
            source="google",
        )
        for item in items
    ]
