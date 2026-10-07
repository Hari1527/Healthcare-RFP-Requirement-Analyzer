# Healthcare RFP Requirement Analyzer — Frontend

A production-grade, enterprise B2B React + TypeScript frontend application designed for analyzing healthcare Requests for Proposals (RFPs), extracting and classifying requirements, executing semantic vector search via ChromaDB, and drafting evidence-grounded responses using RAG with source citations.

---

## 1. Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **API Client**: Axios with centralized error formatting and interceptors
- **Icons**: Lucide React
- **Analytics & Visualizations**: Recharts
- **Context API**: Authentication state and session management

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── api/                  # Centralized REST API integration layer
│   │   ├── client.ts         # Axios client, base URL & interceptors
│   │   ├── documents.ts      # RFP upload, fetch, and analyze endpoints
│   │   ├── requirements.ts   # Filterable requirements matrix endpoints
│   │   ├── responses.ts      # RAG AI draft response generation & edits
│   │   ├── compliance.ts     # Compliance scores & gap analysis
│   │   └── dashboard.ts      # KPI stats & category analytics
│   ├── components/
│   │   ├── common/           # Button, Card, Badge, Citation, Alert, Skeleton
│   │   ├── layout/           # Sidebar, Topbar, AppLayout
│   │   ├── dashboard/        # KpiStatsGrid, DashboardCharts (Recharts)
│   │   ├── documents/        # DocumentUploadModal (drag & drop), DocumentTable
│   │   ├── requirements/     # RequirementTable with categorization
│   │   └── responses/        # ResponseCard with copy/edit & citations
│   ├── context/              # AuthContext (enterprise persona, token handling)
│   ├── pages/                # Route Pages
│   │   ├── Dashboard.tsx
│   │   ├── Documents.tsx
│   │   ├── DocumentDetails.tsx
│   │   ├── Requirements.tsx
│   │   ├── RequirementDetails.tsx
│   │   ├── DraftResponses.tsx
│   │   ├── Compliance.tsx
│   │   ├── Search.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── types/                # Domain TypeScript models
│   ├── utils/                # Formatters, badge styling, dates, bytes
│   ├── App.tsx               # Main routing & layout
│   └── main.tsx              # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── .env.example
```

---

## 3. Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start on **`http://localhost:3000`**.

### 4. Build for Production
```bash
npm run build
```

---

## 4. Key Functional Features

1. **Executive Dashboard**:
   - Real-time KPI summary (Total RFPs, Requirements, Critical Gaps, Drafts, Compliance Score).
   - Dynamic charts powered by Recharts (Requirements by Category, Priority Breakdown, Compliance Donut).
   - Recent RFP table with direct analysis triggers.

2. **RFP Document Management**:
   - Drag-and-drop file upload supporting PDF, DOCX, and TXT (up to 50MB).
   - Real-time polling of backend processing status (`UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED`).
   - Detailed inspection page showing page-level chunks and extracted clauses.

3. **Requirements Matrix**:
   - Global searchable table filterable by RFP document, Category, and Criticality Priority.
   - Requirement details page featuring cosine-similarity related requirements from ChromaDB.

4. **AI Draft Responses (RAG)**:
   - Select any RFP clause to trigger evidence-grounded response generation.
   - Exact source citations (Document name, Page number, Section, Quote excerpt).
   - In-place editing and instant clipboard copying.

5. **Compliance Checklist & Gap Tracking**:
   - Weighted readiness scoring (`Critical: 4x, High: 3x, Medium: 2x, Low: 1x`).
   - Dedicated "Gaps & Missing Requirements" tab highlighting missing citations with recommended actions.

6. **Semantic Vector Search**:
   - Natural language query interface connected directly to backend embeddings and ChromaDB.
   - Match percentage relevance score visualizer.
