"""
Boshlang'ich ma'lumotlarni yaratuvchi seed skript.

Ilova birinchi marta ishga tushganda (yoki har safar, agar hali mavjud
bo'lmasa) bitta apteka va bitta admin foydalanuvchi yaratadi, shunda
tizimga darhol kirish mumkin bo'ladi.
"""

import logging
import os

from sqlalchemy.orm import Session

from backend.core.security import hash_password
from backend.db.models import Pharmacy, User

logger = logging.getLogger(__name__)

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "admin123")


def seed_initial_data(db: Session) -> None:
    if db.query(User).count() > 0:
        return  # ma'lumotlar allaqachon mavjud — qayta yaratilmaydi

    pharmacy = Pharmacy(name="Asosiy apteka", address=None, phone=None)
    db.add(pharmacy)
    db.flush()  # pharmacy.id ni olish uchun

    admin = User(
        full_name="Administrator",
        username=DEFAULT_ADMIN_USERNAME,
        password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
        role="admin",
        pharmacy_id=pharmacy.id,
    )
    db.add(admin)
    db.commit()

    logger.info(
        "Seed: '%s' apteka va '%s' admin foydalanuvchisi yaratildi (parol: %s).",
        pharmacy.name,
        DEFAULT_ADMIN_USERNAME,
        DEFAULT_ADMIN_PASSWORD,
    )
