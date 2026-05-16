#!/bin/bash
# Start both backend and frontend for development

echo "Starting HoloMemory development servers..."

# Start backend
cd "$(dirname "$0")/../backend"
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd "$(dirname "$0")/../frontend"
npm run dev &
FRONTEND_PID=$!

echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
