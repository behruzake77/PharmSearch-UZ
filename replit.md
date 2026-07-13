# Apteka Ovozli Qidiruv Tizimi (AVQT)

O'zbekiston aptekalari uchun ovozli dori qidiruv tizimi. Foydalanuvchi mikrofon
orqali dori nomini aytadi, tizim ovozni matnga aylantiradi (Whisper), noaniq
talaffuzni to'g'rilaydi (RapidFuzz) va GoPharm (asosiy manba) / Google
(yordamchi — rasm va zaxira qidiruv) orqali natijani ko'rsatadi.

Loyiha 3-4 foydalanuvchi uchun mo'ljallangan — atayin sodda, monolit
arxitektura tanlangan (Elasticsearch, Kubernetes, Microservices, Redis, Celery
ISHLATILMAYDI).

To'liq spetsifikatsiya (arxitektura, DB sxemasi, AI modul, API) loyiha ildizidagi
`01_LOYIHA_UMUMIY_KORINISHI.md` dan `07_REPLIT_AGENT_PROMPTLARI.md` gacha bo'lgan
hujjatlarda keltirilgan. `07_REPLIT_AGENT_PROMPTLARI.md` loyihani bosqichma-bosqich
qurish rejasini o'z ichiga oladi — har bir bosqich foydalanuvchi tasdiqlagandan
keyin bajariladi.

## Texnologiyalar steki

- **Backend**: FastAPI (Python), `uv`/`pyproject.toml` orqali boshqariladi (Replit
  standart python moduli). Kod `backend/` papkasida, modul-modul struktura:
  `api/`, `ai/`, `search/`, `db/`, `core/`.
- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS), `frontend/` papkasida.
- **Ma'lumotlar bazasi**: SQLite (SQLAlchemy orqali) — hali qo'shilmagan, BOSQICH 2 da qo'shiladi.

## Joriy holat (BOSQICH 1 — bajarildi)

- Backend skeleti: `backend/main.py` da FastAPI "hello world" (`/`) va
  `/api/v1/health` endpointlari.
- Frontend skeleti: Next.js standart strukturasi, boshlang'ich sahifa.
- Hali AI, autentifikatsiya va qidiruv logikasi YOZILMAGAN — bular keyingi
  bosqichlarda (`07_REPLIT_AGENT_PROMPTLARI.md` bo'yicha) qo'shiladi.

## Loyihani ishga tushirish

Ikkita workflow sozlangan va avtomatik ishga tushadi:

- **Backend API** (konsol, port 8000): `uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`
- **Start application** (webview, port 5000): `cd frontend && npm run dev`

Frontend `NEXT_PUBLIC_API_BASE_URL` orqali backend manzilini biladi
(`frontend/.env.local`, hozircha `http://localhost:8000`).

## User preferences

- Loyiha bosqichma-bosqich (`07_REPLIT_AGENT_PROMPTLARI.md` dagi BOSQICH 1-11)
  quriladi — har bir bosqichdan keyin to'xtab, foydalanuvchi tasdig'ini kutish kerak.
- Sodda va minimal texnik yechimlar afzal ko'riladi (Elasticsearch, Kubernetes,
  Microservices, Redis, Celery kabi enterprise vositalar ishlatilmaydi).
