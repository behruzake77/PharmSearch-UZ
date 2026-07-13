"""
Matnni normalizatsiya qilish — Whisper natijasini tozalash.

Speech-to-text va fuzzy matching o'rtasidagi oddiy, mustaqil qadam.
"""

import re

# "500 mg", "500mg", "500 ml" kabi dozirovka ifodalarini ajratib olish uchun.
_DOSAGE_PATTERN = re.compile(r"\b(\d+(?:[.,]\d+)?)\s*(mg|mkg|ml|g)\b", re.IGNORECASE)


def normalize_text(raw_text: str) -> str:
    """Kichik harflarga o'tkazadi va ortiqcha bo'shliqlarni olib tashlaydi."""
    text = raw_text.strip().lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,%]", "", text, flags=re.UNICODE)
    return text.strip()


def extract_dosage(text: str) -> str | None:
    """Matn ichidan dozirovkani (masalan, '500mg') topib qaytaradi, bo'lmasa None."""
    match = _DOSAGE_PATTERN.search(text)
    if not match:
        return None
    amount, unit = match.groups()
    return f"{amount}{unit.lower()}"


def strip_dosage(text: str) -> str:
    """Dori nomini dozirovkadan tozalab qaytaradi (fuzzy matching uchun qulay)."""
    return _DOSAGE_PATTERN.sub("", text).strip()
