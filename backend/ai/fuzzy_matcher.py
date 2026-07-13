"""
Fuzzy Matching moduli — RapidFuzz yordamida noaniq talaffuzni tuzatish.

Whisper natijasidagi (normalizatsiyadan o'tgan) matnni oldindan tayyorlangan
dori nomlari lug'ati bilan solishtirib, eng yaqin nomzodlarni qaytaradi.
"""

import json
from dataclasses import dataclass
from pathlib import Path

from rapidfuzz import fuzz, process

DICTIONARY_PATH = Path(__file__).resolve().parent / "medicine_dictionary.json"

# 05_AI_MODUL.md bo'yicha: shu foizdan past o'xshashlik "topilmadi" hisoblanadi.
CONFIDENCE_THRESHOLD = 70.0
MAX_CANDIDATES = 3


@dataclass
class MatchCandidate:
    name: str
    confidence: float  # 0-100 oralig'ida


def load_medicine_dictionary() -> list[str]:
    """Dori nomlari lug'atini JSON fayldan yuklaydi.

    Kelajakda bu funksiya GoPharm bazasidan dinamik yuklaydigan bo'ladi —
    hozircha statik JSON fayl yetarli.
    """
    with open(DICTIONARY_PATH, encoding="utf-8") as f:
        return json.load(f)


def find_best_matches(
    query: str,
    dictionary: list[str] | None = None,
    limit: int = MAX_CANDIDATES,
    threshold: float = CONFIDENCE_THRESHOLD,
) -> list[MatchCandidate]:
    """
    Tozalangan matnni lug'at bilan solishtirib, eng yaqin 1-limit ta
    nomzodni ishonchlilik foizi bilan qaytaradi.

    Ishonchlilik `threshold` dan past bo'lgan nomzodlar chiqarib tashlanadi
    — natijada bo'sh ro'yxat "topilmadi" holatini bildiradi.
    """
    if not query:
        return []

    candidates = dictionary if dictionary is not None else load_medicine_dictionary()
    if not candidates:
        return []

    results = process.extract(
        query,
        candidates,
        scorer=fuzz.WRatio,
        limit=limit,
    )

    return [
        MatchCandidate(name=name, confidence=round(score, 2))
        for name, score, _ in results
        if score >= threshold
    ]
