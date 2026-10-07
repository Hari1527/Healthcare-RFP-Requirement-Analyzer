# Healthcare RFP Requirement Analyzer

An end-to-end, enterprise AI-powered platform for ingesting healthcare Requests for Proposals (RFPs), extracting and classifying requirements, performing semantic vector retrieval, generating evidence-backed draft responses with source citations, and running automated compliance audits.

---

## Repository Structure

```text
.
├── backend/                  # FastAPI + SQLAlchemy + PostgreSQL + ChromaDB backend
│   ├── app/
│   │   ├── api/routes/       # REST API endpoints (documents, search, responses, etc.)
│   │   ├── core/             # Configuration & security sanitization
│   │   ├── models/           # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── services/         # Extraction, ChromaDB embeddings, LLM RAG, compliance
│   │   └── utils/            # Structured logging, prompts, exceptions
│   ├── tests/                # Pytest suites
│   ├── Dockerfile            # Container configuration
│   ├── docker-compose.yml    # Backend + PostgreSQL service orchestrator
│   └── README.md             # Detailed backend guide
│
└── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS frontend
    ├── src/
    │   ├── api/              # Centralized Axios client & REST endpoints
    │   ├── components/       # Enterprise UI components, charts (Recharts) & layouts
    │   ├── context/          # Authentication & user session context
    │   ├── pages/            # Dashboard, Documents, Requirements, RAG, Compliance, Search
    │   └── types/            # Complete TypeScript domain schemas
    ├── vite.config.ts        # Vite configuration & proxy
    └── README.md             # Detailed frontend guide
```

---

## Quick Start Guide

### Option 1: Full System with Docker (Recommended)

1. **Start Backend & Database**:
   ```bash
   cd backend
   cp .env.example .env       # Provide your LLM_API_KEY (OpenAI or Anthropic)
   docker compose up --build
   ```
   *FastAPI Swagger documentation will be available at:* **`http://localhost:8000/docs`**

2. **Start Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   *Frontend application will be live at:* **`http://localhost:3000`**

---

### Option 2: Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Core Capabilities

- **Multi-Format Extraction**: Parses PDF, DOCX, and TXT documents, preserving page-level and section metadata for citations.
- **Automated NLP Classification**: Classifies requirements into 8 categories (*Clinical, Technical, Security, Compliance, Financial, Legal, Operational, General*) and 4 priority tiers (*Critical, High, Medium, Low*).
- **Semantic Vector Store**: Generates embeddings using `sentence-transformers/all-MiniLM-L6-v2` stored in persistent ChromaDB.
- **Grounded RAG Pipeline**: AI draft proposal generation that strictly quotes retrieved context and explicitly warns when evidence is missing.
- **Weighted Compliance Scoring**: Mathematical gap scoring (`Critical: 4x, High: 3x, Medium: 2x, Low: 1x`) with automated audit checklists.
