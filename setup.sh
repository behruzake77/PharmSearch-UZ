#!/bin/bash

# PharmSearch-UZ - Development Setup Script

set -e

echo "🚀 PharmSearch-UZ Setup Boshlanding..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Backend Setup...${NC}"
cd backend

# Create .env.local if not exists
if [ ! -f .env ]; then
    cp ../.env.local .env || true
    echo -e "${YELLOW}⚠️  .env fayli yaratildi. SESSION_SECRET o'zgartiring!${NC}"
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment yaratildi${NC}"
fi

# Activate venv and install dependencies
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
pip install -e . --quiet
echo -e "${GREEN}✅ Backend dependencies o'rnatildi${NC}"

# Create database and run migrations
echo -e "${BLUE}📊 Database Setup...${NC}"
alembic upgrade head 2>/dev/null || python -c "from backend.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
echo -e "${GREEN}✅ Database ready${NC}"

cd ..

echo ""
echo -e "${BLUE}🎨 Frontend Setup...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    npm install --quiet
    echo -e "${GREEN}✅ Frontend dependencies o'rnatildi${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies allaqachon o'rnatilgan${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup Yakunlandi!${NC}"
echo ""
echo -e "${BLUE}🚀 Serverlarni ishga tushiring:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend && npm run dev"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "  Frontend: http://localhost:5000"
echo "  Backend:  http://localhost:8000"
echo "  Docs:     http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}🔑 Default Login:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
