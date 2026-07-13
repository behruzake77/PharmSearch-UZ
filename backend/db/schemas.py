"""
Pydantic sxemalari — request/response uchun, SQLAlchemy modellaridan alohida.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# --- Pharmacy ---

class PharmacyBase(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None


class PharmacyCreate(PharmacyBase):
    pass


class PharmacyOut(PharmacyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# --- User ---

class UserBase(BaseModel):
    full_name: str
    username: str
    role: str = "pharmacist"
    pharmacy_id: int | None = None


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class UserPublic(BaseModel):
    """Login javobi ichida qaytariladigan qisqartirilgan foydalanuvchi ma'lumoti."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    role: str
    pharmacy_id: int | None = None


# --- SearchQuery ---

class SearchQueryBase(BaseModel):
    raw_transcript: str
    corrected_query: str | None = None
    source_used: str | None = None
    result_found: bool = False


class SearchQueryCreate(SearchQueryBase):
    user_id: int


class SearchQueryOut(SearchQueryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime


# --- Auth ---

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class CurrentUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    role: str
    pharmacy_id: int | None = None


# --- MedicineCache ---

class MedicineCacheBase(BaseModel):
    name: str
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    source: str | None = None


class MedicineCacheOut(MedicineCacheBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    last_updated: datetime
