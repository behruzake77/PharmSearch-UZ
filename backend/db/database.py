"""
Ma'lumotlar bazasi ulanishi (SQLAlchemy engine/session).

Sodda, bitta fayl — 3-4 foydalanuvchi uchun qo'shimcha connection-pool
sozlamalari yoki alohida DB-server kerak emas.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.core.config import DATABASE_URL

# SQLite fayl-asosida ishlaganda bir nechta thread'dan foydalanish uchun
# check_same_thread=False kerak (FastAPI so'rovlari turli thread'larda ishlashi mumkin).
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Barcha SQLAlchemy modellari uchun asosiy klass."""

    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — har bir so'rov uchun DB sessiyasi ochib, yopadi."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
