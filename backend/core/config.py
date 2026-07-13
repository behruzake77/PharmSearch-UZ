"""
Umumiy konfiguratsiya va sozlamalar.

Hozircha faqat ma'lumotlar bazasi manzili kerak. Kelajakda JWT sirlari,
tashqi API kalitlari (Google, GoPharm) shu yerga qo'shiladi.
"""

from pathlib import Path

# backend/ papkasining absolyut yo'li — ishga tushirish joyidan (cwd) qat'i
# nazar, DB fayli doim shu yerda bo'lishi uchun.
BACKEND_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = f"sqlite:///{BACKEND_DIR / 'pharmacy.db'}"
