"""
Autentifikatsiya endpointlari — 06_API_SPETSIFIKATSIYASI.md ga mos.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.security import create_access_token, get_current_user, verify_password
from backend.db.database import get_db
from backend.db.models import User
from backend.search.schemas import SearchResponse
from backend.db.schemas import LoginRequest, TokenResponse, CurrentUserOut

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "UNAUTHORIZED", "message": "Login yoki parol noto'g'ri"}},
        )

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "role": user.role,
            "pharmacy_id": user.pharmacy_id,
        }
    )


@router.get("/me", response_model=CurrentUserOut)
def me(current_user: User = Depends(get_current_user)) -> CurrentUserOut:
    return CurrentUserOut(
        id=current_user.id,
        full_name=current_user.full_name,
        role=current_user.role,
        pharmacy_id=current_user.pharmacy_id,
    )
