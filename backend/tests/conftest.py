"""
Pytest fixture'lari — asosiy endpointlar uchun izolyatsiyalangan test muhiti.

Har bir test sessiyasi uchun alohida vaqtinchalik SQLite fayl ishlatiladi
(dev/production'dagi pharmacy.db'ga tegilmaydi), jadvallar to'g'ridan-to'g'ri
Base.metadata orqali yaratiladi (Alembic migratsiyasi shart emas — bu faqat
test uchun).
"""

import os
import tempfile
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("SEED_ADMIN_PASSWORD", "test-admin-pass-123")


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)

    test_engine = create_engine(
        f"sqlite:///{db_path}", connect_args={"check_same_thread": False}
    )
    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    from backend.db import models  # noqa: F401  jadvallarni ro'yxatdan o'tkazish
    from backend.db.database import Base, get_db
    from backend.db.seed import seed_initial_data
    from backend.main import app

    Base.metadata.create_all(bind=test_engine)

    seed_db = TestSessionLocal()
    try:
        seed_initial_data(seed_db)
    finally:
        seed_db.close()

    def override_get_db() -> Generator:
        db = TestSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    test_engine.dispose()
    os.remove(db_path)


@pytest.fixture()
def auth_token(client: TestClient) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": os.environ["SEED_ADMIN_PASSWORD"]},
    )
    assert response.status_code == 200
    return response.json()["access_token"]
