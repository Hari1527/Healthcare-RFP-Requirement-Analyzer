# Healthcare RFP Requirement Analyzer

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.31-red.svg)
![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5.3-orange.svg)
![OpenAI](https://img.shields.io/badge/LLM-OpenAI%20%7C%20Anthropic-black.svg)

## 1. Project Overview
The Healthcare RFP Requirement Analyzer is an AI-powered backend system designed to ingest Request for Proposal (RFP) documents, extract discrete requirements, categorize them, and generate intelligent draft responses using Retrieval-Augmented Generation (RAG). It calculates compliance scores and highlights missing information to streamline the RFP response process for healthcare technology vendors.

## 2. Architecture

```text
[ Document Upload ] --> (PDF/DOCX/TXT) 
        |
        v
[ Text Extraction ] --> (PyMuPDF / docx)
        |
        v
[ Chunking & LLM Extraction ] --> (Extracts Requirements & Classifies)
        |
        +--> [ Vector DB (Chroma) ] (Stores Embeddings)
        |
        v
[ Relational DB (Postgres) ] (Stores Metadata, Req, Status)
        |
        v
[ RAG Pipeline ] --> (Drafts Responses via LLM Context)
```
- **Document Service**: Manages document upload, validation, and storage.
- **Extraction Service**: Parses files into text chunks.
- **Requirement Service**: Interfaces with LLMs to identify and classify specific requirements.
- **Embedding/Retrieval Service**: Manages semantic search and vector storage.
- **Compliance Service**: Analyzes and scores compliance against the RFP.

## 3. Technology Stack
- **Framework**: FastAPI (`0.111.0`), Uvicorn (`0.30.1`)
- **Database ORM**: SQLAlchemy (`2.0.31`), Alembic (`1.13.1`)
- **Database Engine**: PostgreSQL (`16-alpine`), psycopg2-binary (`2.9.9`)
- **Vector Database**: ChromaDB (`0.5.3`)
- **LLM Integrations**: OpenAI (`1.35.3`), Anthropic (`0.30.0`), SentenceTransformers (`3.0.1`)
- **Document Parsers**: PyMuPDF (`1.24.5`), python-docx (`1.1.2`)
- **Testing**: Pytest (`8.2.2`), Pytest-Asyncio (`0.23.7`), Pytest-Cov (`5.0.0`)

## 4. Folder Structure
```text
backend/
├── alembic/              # Migration scripts
├── app/
│   ├── api/              # API router definitions
│   ├── core/             # Configuration and security utilities
│   ├── db/               # Database sessions and base models
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic validation schemas
│   ├── services/         # Business logic (LLM, RAG, Parsing)
│   └── utils/            # Logging, Prompts, Exceptions
├── data/chromadb/        # ChromaDB persistent storage (Auto-created)
├── tests/                # Pytest suites
├── uploads/              # Uploaded documents
├── .env.example          # Environment variables template
├── alembic.ini           # Alembic configuration
├── docker-compose.yml    # Docker services config
├── Dockerfile            # Application container setup
└── requirements.txt      # Python dependencies
```

## 5. Environment Setup
1. **Prerequisites**: Python 3.11+, PostgreSQL 16+.
2. **Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

## 6. Database Setup
1. Install and start PostgreSQL.
2. Create the database and user:
   ```sql
   CREATE USER rfp_user WITH PASSWORD 'rfp_password';
   CREATE DATABASE rfp_analyzer;
   GRANT ALL PRIVILEGES ON DATABASE rfp_analyzer TO rfp_user;
   ```

## 7. Vector Database Setup
ChromaDB is automatically initialized using local persistent storage. 
By default, data is stored in `./data/chromadb` as specified in `.env`.

## 8. LLM Configuration
Set your LLM provider and API key in the `.env` file:
```env
LLM_PROVIDER=openai  # or anthropic
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4      # or claude-3-5-sonnet-20240620
```

## 9. Running Locally
1. Install dependencies: `pip install -r requirements.txt`
2. Configure `.env` from `.env.example`.
3. Run migrations: `alembic upgrade head`
4. Start the server: `uvicorn app.main:app --reload`

## 10. Running with Docker
```bash
docker-compose up --build
```
This starts both the FastAPI backend and a PostgreSQL database.

## 11. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | Health check |
| POST   | `/api/documents/upload` | Upload a new RFP document |
| GET    | `/api/documents/` | List all documents |
| GET    | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete document and relations |
| POST   | `/api/documents/{id}/analyze` | Trigger RFP analysis |
| GET    | `/api/documents/{id}/status` | Check processing status |
| GET    | `/api/documents/{id}/requirements` | Get requirements for a document |
| GET    | `/api/requirements/` | List all requirements (with filters) |
| GET    | `/api/requirements/{id}` | Get requirement details |
| POST   | `/api/search/` | Semantic search over requirements |
| POST   | `/api/responses/generate` | Generate AI draft response |
| GET    | `/api/responses/` | List all draft responses |
| GET    | `/api/responses/{id}` | Get response with sources |
| PUT    | `/api/responses/{id}` | Update a draft response |
| GET    | `/api/compliance/{document_id}` | Get compliance report |
| GET    | `/api/compliance/missing` | Get missing/non-compliant requirements |
| GET    | `/api/dashboard/summary` | Dashboard summary statistics |
| GET    | `/api/dashboard/requirements-by-category` | Requirements grouped by category |
| GET    | `/api/dashboard/requirements-by-priority` | Requirements grouped by priority |
| GET    | `/api/dashboard/compliance-overview` | Compliance status overview |

## 12. Example API Requests
**Upload a Document**:
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
     -H "accept: application/json" \
     -F "file=@sample_rfp.pdf" \
     -F "organization=Acme Healthcare"
```

**Check Processing Status**:
```bash
curl "http://localhost:8000/api/documents/{document_id}/status"
```

**Search Requirements**:
```bash
curl -X POST "http://localhost:8000/api/search/" \
     -H "Content-Type: application/json" \
     -d '{"query": "data encryption standards", "top_k": 5}'
```

**Generate AI Draft Response**:
```bash
curl -X POST "http://localhost:8000/api/responses/generate" \
     -H "Content-Type: application/json" \
     -d '{"requirement_id": "your-requirement-id"}'
```

**Get Compliance Report**:
```bash
curl "http://localhost:8000/api/compliance/{document_id}"
```

## 13. Testing
Run tests using pytest:
```bash
pytest tests/ -v
pytest tests/ --cov=app
```
Tests use an in-memory SQLite database and mocked LLM/Embedding services.

## 14. RAG Workflow
1. **Ingestion**: Document is parsed and chunked.
2. **Embedding**: Text chunks are embedded via `all-MiniLM-L6-v2` and stored in ChromaDB.
3. **Extraction**: LLM extracts requirements from chunks.
4. **Retrieval**: When drafting a response, semantic search queries ChromaDB for relevant document chunks based on the requirement.
5. **Generation**: The retrieved context + the requirement are sent to the LLM to draft a grounded response with source citations.

## 15. Compliance Scoring Methodology
The compliance score is calculated using a weighted formula based on requirement priority:
- **Critical**: 4.0
- **High**: 3.0
- **Medium**: 2.0
- **Low**: 1.0

Statuses map to point values: Compliant (1.0), Partially Compliant (0.5), Missing/Needs Review (0.0).
`Score = (Earned Weights / Total Possible Weights) * 100`

## 16. Limitations
- Large PDFs (>50MB) or scanned documents without OCR may fail or yield poor text extraction.
- Rate limits of the chosen LLM provider can throttle the `analyze` endpoint.
- RAG context window constraints may truncate responses for extremely broad requirements.

## 17. Future Improvements
- Implement Async Celery workers for document processing to avoid blocking.
- Add support for OCR to process scanned PDFs.
- Enhance multi-document RAG capabilities for cross-referencing previous RFP responses.
- Introduce user authentication and RBAC.
