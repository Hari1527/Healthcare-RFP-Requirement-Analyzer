# Healthcare RFP Requirement Analyzer - Deployment Guide

This project is ready to deploy to free and production cloud hosting providers (Render, Vercel, Railway, Fly.io, or Docker).

---

## Option 1: 1-Click Deployment on Render (Recommended for Full Stack)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint that deploys both the **FastAPI Backend** and the **React Vite Frontend** automatically.

### Steps:
1. Go to [render.com](https://render.com) and sign in with your GitHub account.
2. In the Render Dashboard, click **New +** &rarr; **Blueprint**.
3. Select your GitHub repository: `Healthcare-RFP-Requirement-Analyzer`.
4. Render will detect `render.yaml` and configure two services:
   - `healthcare-rfp-backend` (Python Web Service)
   - `healthcare-rfp-frontend` (Static Web Service)
5. Click **Apply**.
6. When both services build and deploy:
   - Your frontend will be live at `https://healthcare-rfp-frontend.onrender.com`.
   - Your backend API will be live at `https://healthcare-rfp-backend.onrender.com`.

---

## Option 2: Deploy Frontend on Vercel + Backend on Render / Railway

### A. Deploy Backend (Render or Railway)
- **Repository**: Connect your GitHub repo.
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Copy your deployed Backend URL** (e.g. `https://your-backend.onrender.com`).

### B. Deploy Frontend (Vercel)
- Go to [vercel.com](https://vercel.com) &rarr; **Add New Project**.
- Select the `Healthcare-RFP-Requirement-Analyzer` repository.
- Set **Root Directory** to `frontend`.
- Under **Environment Variables**, add:
  - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
- Click **Deploy**. Vercel will build and provide a live URL (e.g. `https://healthcare-rfp.vercel.app`).

---

## Option 3: Deploy with Docker Compose (VPS / DigitalOcean / AWS EC2)

On any Linux server with Docker and Docker Compose installed:

```bash
git clone https://github.com/Hari1527/Healthcare-RFP-Requirement-Analyzer.git
cd Healthcare-RFP-Requirement-Analyzer
docker-compose up -d --build
```
- Frontend will be available on port `3000` (or reverse-proxied to port `80`/`443`).
- Backend API will be available on port `8000`.
