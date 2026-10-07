#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting Healthcare RFP Requirement Analyzer Full Stack "
echo "=========================================================="

# 1. Setup Backend environment if missing
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env from backend/.env.example..."
    cp backend/.env.example backend/.env
fi

# 2. Setup Frontend environment if missing
if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env from frontend/.env.example..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "Option A: If Docker is installed on your machine, run:"
echo "   docker compose up --build"
echo ""
echo "Option B: Running natively:"
echo "   1) Backend (Terminal 1):"
echo "      cd backend"
echo "      python3 -m venv venv && source venv/bin/activate"
echo "      pip install -r requirements.txt"
echo "      uvicorn app.main:app --reload --port 8000"
echo ""
echo "   2) Frontend (Terminal 2):"
echo "      cd frontend"
echo "      npm install"
echo "      npm run dev"
echo ""
echo "The Frontend (http://localhost:3000) will automatically connect to"
echo "the Backend (http://localhost:8000) through Vite proxy & CORS!"
echo "=========================================================="
