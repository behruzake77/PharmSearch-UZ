"""
Qidiruv pipeline'ini birlashtiruvchi modul — 07_REPLIT_AGENT_PROMPTLARI.md
BOSQICH 7 ga mos: normalizatsiya -> fuzzy matching -> GoPharm -> Google zaxira.

Bu funksiya API qatlamidan (backend/api/search.py) chaqiriladi va DB'ga
yozishni ham o'z ichiga oladi, shunda /search/voice va /search/text bir xil
mantiqni takrorlamaydi.
"""

import logging

from sqlalchemy.orm import Session

from backend.ai.fuzzy_matcher import find_best_matches, load_medicine_dictionary
from backend.ai.text_normalizer import normalize_text, strip_dosage
from backend.db.models import SearchQuery
from backend.search.gopharm_search import search_gopharm
from backend.search.google_search import search_fallback
from backend.search.schemas import SearchError, SearchResponse, SearchResult

logger = logging.getLogger(__name__)

NO_MATCH_MESSAGE = "Dori topilmadi, iltimos qayta urinib ko'ring"


def run_search_pipeline(raw_text: str, db: Session, user_id: int) -> SearchResponse:
    """
    `raw_text` — Whisper transkripti (voice) yoki foydalanuvchi yozgan matn (text).
    Ikkala endpoint ham shu funksiyani chaqiradi — faqat kirish manbai farq qiladi.
    """
    normalized = normalize_text(raw_text)
    clean_query = strip_dosage(normalized)

    dictionary = load_medicine_dictionary()
    matches = find_best_matches(clean_query, dictionary)

    corrected_query = matches[0].name if matches else None
    confidence = round(matches[0].confidence / 100, 2) if matches else 0.0
    alternative_matches = [m.name for m in matches[1:]]

    results: list[SearchResult] = []
    source_used: str | None = None

    if corrected_query:
        try:
            results = search_gopharm(corrected_query)
            if results:
                source_used = "gopharm"
        except SearchError as exc:
            logger.warning("GoPharm qidiruvi muvaffaqiyatsiz: %s", exc)

    if not results:
        # GoPharm hech narsa topa olmasa (yoki mos nom aniqlanmasa), Google
        # zaxira sifatida ishlatiladi. Google sozlanmagan bo'lsa, jim
        # (natijasiz) davom etiladi — Google ixtiyoriy qo'shimcha.
        try:
            results = search_fallback(corrected_query or clean_query)
            if results:
                source_used = "google"
        except SearchError as exc:
            logger.info("Google zaxira qidiruvi ishlatilmadi: %s", exc)

    result_found = bool(results)
    message = None if result_found else NO_MATCH_MESSAGE

    query_record = SearchQuery(
        user_id=user_id,
        raw_transcript=raw_text,
        corrected_query=corrected_query,
        source_used=source_used,
        result_found=result_found,
    )
    db.add(query_record)
    db.commit()

    return SearchResponse(
        raw_transcript=raw_text,
        corrected_query=corrected_query,
        confidence=confidence,
        results=results,
        alternative_matches=alternative_matches,
        message=message,
    )
