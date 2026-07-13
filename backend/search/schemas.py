"""
Qidiruv natijalari uchun umumiy sxema — GoPharm va Google modullari
bir xil formatga keltiradi, shunda ularni almashtirish/birlashtirish oson.
"""

from pydantic import BaseModel


class SearchResult(BaseModel):
    name: str
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    source: str  # "gopharm" | "google"


class SearchError(Exception):
    """Tashqi qidiruv xizmati (GoPharm yoki Google) javob bermaganda ko'tariladi."""


class TextSearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    raw_transcript: str
    corrected_query: str | None = None
    confidence: float
    results: list[SearchResult] = []
    alternative_matches: list[str] = []
    message: str | None = None


class SearchHistoryItem(BaseModel):
    id: int
    corrected_query: str | None = None
    result_found: bool
    created_at: str
