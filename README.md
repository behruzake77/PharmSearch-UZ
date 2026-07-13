# PharmSearch-UZ (AVQT) - Apteka Ovozli Qidiruv Tizimi

**Uzbek Pharmacy Voice Search System** - Ovozli dori qidiruv tizimi

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Loyihaning Tavsifi

AVQT - aptekalardagi farmatsevtlar uchun dorilarni ovozli va matn orqali qidirish tizimi. Tizim:

- 🎤 **Ovozli Qidiruv** - OpenAI Whisper-ni ishlatib ovozni matnga o'zgartiradi
- 🔍 **Fuzzy Matching** - RapidFuzz-ni ishlatib nomni to'g'rilaydi
- 🏥 **GoPharm Integratsiya** - Asosiy dori bazasi
- 🌐 **Google Qidiruv** - Zaxira qidiruv manbai
- 💾 **Tarix** - Qidiruvlar tarixini saqlaydi
- 🔐 **JWT Autentifikatsiya** - Secure login

## 🛠️ Texnologiya Steki

### Backend
- **FastAPI** - Modern async Python web framework
- **SQLAlchemy** - ORM va Database management
- **SQLite** - Default database (production uchun PostgreSQL tavsiya etiladi)
- **Whisper** - Speech-to-text (OpenAI)
- **RapidFuzz** - Fuzzy string matching
- **JWT (PyJWT)** - Token-based authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React 19** - UI library
- **zustand** - State management (optional)

## 📁 Loyiha Strukturasi

```
PharmSearch-UZ/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── api/                 # API endpoints
│   │   ├── auth.py          # Login, auth endpoints
│   │   └── search.py        # Search endpoints
│   ├── ai/                  # AI modules
│   │   ├── speech_to_text.py    # Whisper integration
│   │   ├── fuzzy_matcher.py     # RapidFuzz matching
│   │   ├── text_normalizer.py   # Text preprocessing
│   │   └── medicine_dictionary.json
│   ├── search/              # External search
│   │   ├── pipeline.py      # Search orchestration
│   │   ├── gopharm_search.py    # GoPharm API
│   │   ├── google_search.py     # Google fallback
│   │   └── schemas.py
│   ├── db/                  # Database
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── seed.py          # Initial data
│   ├── core/                # Configuration
│   │   ├── config.py        # Settings
│   │   └── security.py      # Auth logic
│   └── alembic/             # Migrations
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main search page
│   │   ├── layout.tsx       # Root layout
│   │   ├── login/
│   │   │   └── page.tsx     # Login page
│   │   ├── history/
│   │   │   └── page.tsx     # Search history
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── NavBar.tsx       # Navigation
│   │   └── ResultCard.tsx   # Result display
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── .env.example
├── .env.local              # Development env
├─��� pyproject.toml          # Python dependencies
└── README.md
```

## 🚀 Tez Boshlash

### Talablar
- Python 3.11+
- Node.js 18+
- npm yoki yarn
- SQLite3

### 1️⃣ Backend Setup

```bash
# Backend direktoriasiga o'ting
cd backend

# Virtual environment yarating (opsional lekin tavsiya etiladi)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# yoki
venv\Scripts\activate  # Windows

# Dependensiyalarni o'rnatish
pip install -r requirements.txt

# Yoki uv bilan (tez):
uv sync

# Database migrations
alembic upgrade head

# Backend serverini ishga tushirish
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2️⃣ Frontend Setup

```bash
# Frontend direktoriasiga o'ting
cd frontend

# Dependensiyalarni o'rnatish
npm install
# yoki
yarn install

# Dev serverini ishga tushirish
npm run dev
# yoki
yarn dev
```

### 3️⃣ Brauzerda Ochish

- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs (Swagger UI)

## 🔑 Environment Variables

`.env.local` faylini yarating (`.env.example` asosida):

```bash
# Backend
SESSION_SECRET=your-super-secret-key-here  # JWT secret
GOOGLE_API_KEY=                             # Optional: Google Search API key
GOOGLE_CSE_ID=                              # Optional: Google Custom Search Engine ID
```

**SESSION_SECRET yaratish:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📝 Default Login

- **Username:** admin
- **Password:** admin123

> ⚠️ Production-da parolni o'zgartiring!

## 🔌 API Endpoints

### Authentication

```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json
{
  "username": "admin",
  "password": "admin123"
}

# Get current user
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Search

```bash
# Text search
POST /api/v1/search/text
Authorization: Bearer <token>
Content-Type: application/json
{
  "query": "paracetamol"
}

# Voice search
POST /api/v1/search/voice
Authorization: Bearer <token>
Content-Type: multipart/form-data
File: audio.webm

# Search history
GET /api/v1/search/history?limit=20
Authorization: Bearer <token>
```

### Health Check

```bash
GET /api/v1/health
```

## 🧪 Testing

### Frontend

```bash
cd frontend

# Build
npm run build

# Production serverini ishga tushirish
npm run start

# Lint
npm run lint
```

### Backend

```bash
cd backend

# Tests (agar mavjud bo'lsa)
pytest

# Linting
pylint backend/

# Type checking
mypy backend/
```

## 📦 Production Deploy

### Backend Production

```bash
cd backend

# ASGI server (gunicorn + uvicorn)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Production

```bash
cd frontend

# Build
npm run build

# Start
npm run start
```

### Docker (Optional)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
```

## 🤝 Contributing

Hissa qo'shish uchun:

1. Fork repository
2. Feature branch yarating (`git checkout -b feature/amazing-feature`)
3. O'zgarishlarni commit qiling (`git commit -m 'Add amazing feature'`)
4. Branch'ga push qiling (`git push origin feature/amazing-feature`)
5. Pull Request oching

## 📄 License

Bu loyiha MIT License ostida tarqatiladi. Qarang: [LICENSE](LICENSE) fayli.

## 📧 Contact

- **Email:** behruzismatullayev36@gmail.com
- **GitHub:** [@behruzake77](https://github.com/behruzake77)

## 🙏 Acknowledgments

- OpenAI Whisper - Speech-to-text
- RapidFuzz - Fuzzy matching
- GoPharm - Medicine database
- FastAPI - Backend framework
- Next.js - Frontend framework

## 🐛 Known Issues

- Google Search integratsiyasi (Google API kaliti kerak)
- Production-da PostgreSQL tavsiya etiladi
- Whisper modelini birinchi marta yuklab olishi vaqt oladi (~2-3 sekund)

## 📊 Project Status

- ✅ Backend API - Complete
- ✅ Frontend UI - Complete
- ✅ Authentication - Complete
- ✅ Voice Search - Complete
- ✅ Search History - Complete
- 🔄 Admin Panel - In Progress
- 🔄 Analytics - Planned
- 🔄 Mobile App - Planned

---

**Saytni to'liq tuzatish yakunlandi!** 🎉
