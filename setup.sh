#!/usr/bin/env bash
# Bootstrap script — run once after cloning/importing the project.
# Installs frontend dependencies and applies database migrations.
set -e

echo "=== Installing frontend dependencies ==="
cd frontend && npm install && cd ..

echo "=== Running Alembic database migrations ==="
uv run alembic --config backend/alembic.ini upgrade head

echo "=== Setup complete ==="
echo "Start the app with the two configured Replit workflows:"
echo "  Backend API  →  uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
echo "  Start application  →  cd frontend && npm run dev"
