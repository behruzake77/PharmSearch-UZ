"""
GoPharm qidiruv moduli — tizimning ASOSIY qidiruv manbai.

Eslatma: GoPharm.uz'da rasmiy/hujjatlashtirilgan ochiq API topilmadi.
Sayt (gopharm.uz) frontend'i ichki API'dan (api2.gopharm.uz) foydalanadi —
bu API hujjatlashtirilmagan (reverse-engineering orqali aniqlangan), lekin
ochiq va autentifikatsiyasiz ishlaydi (masalan:
https://api2.gopharm.uz/api/v1/drugs?search=parasetamol ).

**Muhim eslatma jamoaga:** Bu hujjatlashtirilmagan API bo'lgani uchun har
qanday vaqtda o'zgarishi yoki ishlamay qolishi mumkin. Ishlab chiqarishga
chiqarishdan oldin GoPharm bilan rasmiy hamkorlik/API kelishuvini so'rash
tavsiya etiladi. Shu sababli bu funksiya har doim try/except bilan o'ralgan
va muvaffaqiyatsizlikda tushunarli xatolik ko'taradi — chaqiruvchi kod
(search endpoint) buni ushlab, Google qidiruviga zaxira sifatida o'tishi kerak.
"""

import logging

import requests

from backend.search.schemas import SearchError, SearchResult

GOPHARM_SEARCH_URL = "https://api2.gopharm.uz/api/v1/drugs"
REQUEST_TIMEOUT_SECONDS = 5

logger = logging.getLogger(__name__)


def search_gopharm(query: str, limit: int = 5) -> list[SearchResult]:
    """Dori nomi bo'yicha GoPharm'dan qidiradi va SearchResult ro'yxatini qaytaradi."""
    if not query:
        return []

    try:
        response = requests.get(
            GOPHARM_SEARCH_URL,
            params={"search": query},
            timeout=REQUEST_TIMEOUT_SECONDS,
            headers={"User-Agent": "AVQT/0.1 (apteka ovozli qidiruv tizimi)"},
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("GoPharm so'roviga javob bo'lmadi: %s", exc)
        raise SearchError("GoPharm xizmati javob bermadi") from exc

    # GoPharm API may wrap results in different keys
    raw = payload.get("results") or payload.get("data") or payload.get("items") or []
    results = raw[:limit]

    items_out = []
    for item in results:
        # Prefer Uzbek international name, fall back to Russian, then category
        intl_name = item.get("international_name_uz") or item.get("international_name")
        category_name = (item.get("category") or {}).get("name")
        description = intl_name or category_name

        # price comes as integer (sum), convert to float
        raw_price = item.get("price")
        price = float(raw_price) if raw_price is not None else None

        # Skip default placeholder images
        raw_img = item.get("image_thumbnail") or ""
        image_url = raw_img if raw_img and "default.png" not in raw_img else None

        items_out.append(SearchResult(
            name=item.get("name", "Noma'lum"),
            description=description,
            price=price,
            image_url=image_url,
            source="gopharm",
        ))

    return items_out
