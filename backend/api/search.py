"""
Qidiruv endpointlari — 06_API_SPETSIFIKATSIYASI.md 3-bo'limiga mos.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from backend.ai.speech_to_text import SpeechToTextError, transcribe_audio
from backend.core.security import get_current_user
from backend.db.database import get_db
from backend.db.models import SearchQuery, User
from backend.search.pipeline import run_search_pipeline
from backend.search.schemas import SearchHistoryItem, SearchResponse, TextSearchRequest

router = APIRouter(prefix="/api/v1/search", tags=["search"])

ALLOWED_AUDIO_EXTENSIONS = (".wav", ".webm", ".mp3")


def _audio_invalid_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={"error": {"code": "AUDIO_INVALID", "message": "Audio fayl formati qo'llab-quvvatlanmaydi"}},
    )


@router.post("/voice", response_model=SearchResponse)
def search_voice(
    audio_file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    filename = audio_file.filename or ""
    if not filename.lower().endswith(ALLOWED_AUDIO_EXTENSIONS):
        raise _audio_invalid_error()

    try:
        raw_transcript = transcribe_audio(audio_file.file, filename)
    except SpeechToTextError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "AUDIO_INVALID", "message": str(exc)}},
        ) from exc

    return run_search_pipeline(raw_transcript, db, current_user.id)


@router.post("/text", response_model=SearchResponse)
def search_text(
    payload: TextSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    query = payload.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "EMPTY_QUERY", "message": "Qidiruv matni bo'sh bo'lishi mumkin emas"}},
        )

    return run_search_pipeline(query, db, current_user.id)


@router.get("/history")
def search_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    rows = (
        db.query(SearchQuery)
        .filter(SearchQuery.user_id == current_user.id)
        .order_by(desc(SearchQuery.created_at))
        .limit(limit)
        .all()
    )

    history = [
        SearchHistoryItem(
            id=row.id,
            corrected_query=row.corrected_query,
            result_found=row.result_found,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]
    return {"history": history}
