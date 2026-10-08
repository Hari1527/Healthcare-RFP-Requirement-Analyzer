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

---

## Multi-Domain Healthcare RFP Datasets

The platform includes 5 realistic, domain-specific healthcare procurement RFP datasets located in `datasets/`:

1. **MetroHealth Regional Medical Center** (`datasets/sample_rfp_metrohealth.txt`)
   - **Domain**: Acute Care Hospital System, Next-Gen EHR & Interoperability.
   - **Key Topics**: CPOE, EPCS e-Prescribing, HL7 FHIR R4, HIPAA Omnibus, AES-256 / TLS 1.3, 99.99% SLA.
2. **Children's National & Pediatric Specialty Network** (`datasets/sample_rfp_pediatric_telehealth.txt`)
   - **Domain**: Pediatric Telehealth, Remote Patient Monitoring (RPM) & Chronic Care.
   - **Key Topics**: COPPA & adolescent privacy consent, FDA SaMD 21 CFR 820, cellular BLE telemetry, age-adjusted vital z-score alerts, WebRTC SRTP video.
3. **Cascade Health Plan & Integrated Provider Network** (`datasets/sample_rfp_payer_prior_auth.txt`)
   - **Domain**: Healthcare Payer Prior Authorization & Federal Interoperability.
   - **Key Topics**: CMS-0057-F mandate, HIPAA EDI X12 278/275, HL7 FHIR Da Vinci (CRD, DTR, PAS), HITRUST CSF, ACA 1557 non-discrimination, 72h urgent SLA.
4. **Apex Precision Oncology & Genomic Research Institute** (`datasets/sample_rfp_genomics_pacs.txt`)
   - **Domain**: Cloud Enterprise Imaging (PACS) & Multi-Omic Genomic Lakehouse.
   - **Key Topics**: DICOMweb (WADO-RS, STOW-RS, QIDO-RS), HL7 FHIR Genomics, FDA 510(k) Class II diagnostic viewer, Safe Harbor de-identification, FedRAMP High.
5. **Veterans Alliance & Community Behavioral Health Network** (`datasets/sample_rfp_behavioral_health.txt`)
   - **Domain**: Behavioral Health, Crisis Intervention & Substance Use Disorder (SUD).
   - **Key Topics**: 42 CFR Part 2 privacy segregation, National 988 Suicide & Crisis Lifeline integration, Columbia-Suicide Severity Rating Scale (C-SSRS), offline mobile tablet charting.

### Seeding Datasets
Run the multi-dataset seed engine to load and index all datasets into the database and ChromaDB vector store:
```bash
python3 seed_multiple_datasets.py
```
Or click **"Load Sample Datasets"** directly from the RFP Documents Repository in the web application.
