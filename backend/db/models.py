"""
SQLAlchemy modellari — 04_MALUMOTLAR_BAZASI.md sxemasiga mos.

Jami 4 ta jadval: users, pharmacies, search_queries, medicines_cache.
Murakkab abstraksiyalarsiz, sodda va tushunarli.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(String(500), default=None)
    phone: Mapped[str | None] = mapped_column(String(50), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    users: Mapped[list["User"]] = relationship(back_populates="pharmacy")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="pharmacist")  # "admin" | "pharmacist"
    pharmacy_id: Mapped[int | None] = mapped_column(ForeignKey("pharmacies.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    pharmacy: Mapped[Pharmacy | None] = relationship(back_populates="users")
    search_queries: Mapped[list["SearchQuery"]] = relationship(back_populates="user")


class SearchQuery(Base):
    __tablename__ = "search_queries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    raw_transcript: Mapped[str] = mapped_column(Text)
    corrected_query: Mapped[str | None] = mapped_column(Text, default=None)
    source_used: Mapped[str | None] = mapped_column(String(50), default=None)  # "gopharm" | "google"
    result_found: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    user: Mapped[User] = relationship(back_populates="search_queries")


class MedicineCache(Base):
    __tablename__ = "medicines_cache"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, default=None)
    price: Mapped[float | None] = mapped_column(Numeric(12, 2), default=None)
    image_url: Mapped[str | None] = mapped_column(Text, default=None)
    source: Mapped[str | None] = mapped_column(String(50), default=None)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
