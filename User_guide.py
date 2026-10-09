import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top banner line (except on cover page)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#0284C7"))  # Brand blue
            self.setLineWidth(1)
            self.line(40, 755, 572, 755)

            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0369A1"))
            self.drawString(40, 760, "HEALTHCARE RFP REQUIREMENT ANALYZER")

            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(572, 760, "Comprehensive Architecture & User Manual")

            # Bottom footer line
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 42, 572, 42)

            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(40, 30, "Confidential - Healthcare Proposal Intelligence Suite")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(572, 30, page_text)

        self.restoreState()

def create_guide_pdf(filename="Healthcare_RFP_Requirement_Analyzer_User_Guide.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_blue = colors.HexColor("#0284C7")
    brand_dark = colors.HexColor("#0F172A")
    slate_body = colors.HexColor("#334155")
    slate_muted = colors.HexColor("#64748B")
    accent_green = colors.HexColor("#10B981")
    card_bg = colors.HexColor("#F8FAFC")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=brand_dark,
        alignment=0,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=brand_blue,
        alignment=0,
        spaceAfter=15,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=brand_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=brand_blue,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=slate_body,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=slate_body,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4,
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=4,
        spaceAfter=6,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=slate_body,
    )

    story = []

    # ==========================
    # COVER / HEADER HERO SECTION
    # ==========================
    hero_table_data = [
        [
            Paragraph("<b>HEALTHCARE ENTERPRISE INTELLIGENCE</b>", ParagraphStyle('HeroPre', fontName='Helvetica-Bold', fontSize=9, textColor=brand_blue)),
        ],
        [
            Paragraph("Healthcare RFP Requirement Analyzer", title_style),
        ],
        [
            Paragraph("Autonomous Contract Parsing, Semantic Vector Retrieval, Audit Gap Matrix & AI RAG Response Suite", subtitle_style),
        ],
        [
            Paragraph("<b>Author & Engineering:</b> Hari &bull; <b>System:</b> Enterprise v1.0.0 &bull; <b>Compliance:</b> HIPAA Safe Architecture &bull; <b>Date:</b> October 2026", ParagraphStyle('HeroMeta', fontName='Helvetica', fontSize=8.5, textColor=slate_muted)),
        ]
    ]

    hero_table = Table(hero_table_data, colWidths=[532])
    hero_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
    ]))
    story.append(hero_table)
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 1: EXECUTIVE OVERVIEW & PURPOSE
    # ========================================================
    story.append(Paragraph("1. Executive Overview & Mission", h1_style))
    story.append(Paragraph(
        "Responding to hospital, healthcare system, and payer Requests for Proposal (RFPs) is traditionally a complex, "
        "manual process spanning hundreds of pages of rigid regulatory, security, clinical, and financial requirements. "
        "A single missed requirement—such as a failure to maintain a Business Associate Agreement (BAA), lack of SOC 2 Type II "
        "evidence, or missing FHIR R4 interoperability—can disqualify an otherwise competitive multi-million dollar proposal.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Healthcare RFP Requirement Analyzer</b> eliminates this bottleneck by combining PDF/DOCX contract parsing, "
        "fine-grained requirement extraction, ChromaDB cosine vector search, weighted audit readiness scoring, "
        "and strict citation-grounded Retrieval-Augmented Generation (RAG) for proposal responses.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # High-level Value Matrix
    val_data = [
        [Paragraph("Core Capability", table_header_style), Paragraph("Conventional Manual Process", table_header_style), Paragraph("Healthcare RFP Analyzer Platform", table_header_style)],
        [
            Paragraph("<b>Contract Ingestion</b>", table_cell_style),
            Paragraph("Manual scanning of 80-200 page PDF documents.", table_cell_style),
            Paragraph("Instant PyMuPDF text & structure chunking in seconds.", table_cell_style)
        ],
        [
            Paragraph("<b>Requirement Extraction</b>", table_cell_style),
            Paragraph("Spreadsheet copy-pasting prone to human omission.", table_cell_style),
            Paragraph("NLP heuristic & LLM extraction categorized across 7 domains.", table_cell_style)
        ],
        [
            Paragraph("<b>Prioritization & Triage</b>", table_cell_style),
            Paragraph("Subjective triage with unclear criticality weighting.", table_cell_style),
            Paragraph("Standardized Critical, High, Medium, Low severity classification.", table_cell_style)
        ],
        [
            Paragraph("<b>Draft Response Creation</b>", table_cell_style),
            Paragraph("40+ hours drafting proposals with unverified claims.", table_cell_style),
            Paragraph("AI RAG responses generated with page/section citations.", table_cell_style)
        ],
        [
            Paragraph("<b>Compliance Gap Analysis</b>", table_cell_style),
            Paragraph("Discovered after bid submission or during disqualification.", table_cell_style),
            Paragraph("Mathematical readiness score & instant missing items list.", table_cell_style)
        ]
    ]
    val_table = Table(val_data, colWidths=[120, 206, 206])
    val_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284C7")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(val_table)
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 2: SYSTEM ARCHITECTURE & TECH STACK
    # ========================================================
    story.append(Paragraph("2. Technical Architecture & Component Stack", h1_style))
    story.append(Paragraph(
        "The platform operates on a decoupled client-server architecture engineered for high speed, "
        "low cognitive latency, and strict enterprise data governance.",
        body_style
    ))

    arch_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technologies", table_header_style), Paragraph("Role & Architecture Responsibilities", table_header_style)],
        [
            Paragraph("<b>Frontend UI/UX</b>", table_cell_style),
            Paragraph("React 18, TypeScript, Vite 5, Tailwind CSS, Recharts, Lucide", table_cell_style),
            Paragraph("Responsive hospital operations dashboard, iOS-style theme switch, real-time notification dropdown, interactive compliance charts.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend API Gateway</b>", table_cell_style),
            Paragraph("FastAPI (Python 3.14 / 3.11), Uvicorn, Pydantic v2", table_cell_style),
            Paragraph("Asynchronous REST gateway, automated OpenAPI / Swagger documentation, multipart document upload handler, CORS security.", table_cell_style)
        ],
        [
            Paragraph("<b>Relational Storage</b>", table_cell_style),
            Paragraph("SQLite 3 with SQLAlchemy ORM, Alembic migrations", table_cell_style),
            Paragraph("Stores documents, parsed requirement metadata, classification flags, draft responses, and compliance audit records.", table_cell_style)
        ],
        [
            Paragraph("<b>Vector Retrieval (ChromaDB)</b>", table_cell_style),
            Paragraph("ChromaDB Persistent Engine, sentence-transformers", table_cell_style),
            Paragraph("Embeds clause chunks into dense vector spaces; enables sub-second semantic search using Cosine distance matching.", table_cell_style)
        ],
        [
            Paragraph("<b>AI / LLM Engine</b>", table_cell_style),
            Paragraph("Modular LLM Provider (OpenAI GPT-4 / Anthropic Claude)", table_cell_style),
            Paragraph("Context-constrained RAG responses: strictly grounds draft paragraphs on retrieved document text, preventing AI hallucinations.", table_cell_style)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[100, 150, 282])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 3: KEY PLATFORM FEATURES
    # ========================================================
    story.append(Paragraph("3. Core Platform Features & Functional Modules", h1_style))

    story.append(Paragraph("A. Executive Analytics Dashboard", h2_style))
    story.append(Paragraph(
        "The landing dashboard provides hospital leadership and proposal directors with real-time portfolio metrics: "
        "<b>Total Processed RFPs</b>, <b>Extracted Specifications</b>, <b>Critical Severity Items</b>, "
        "<b>Missing/Unaddressed Gaps</b>, and <b>Executive Compliance Readiness %</b>. Interactive Recharts breakdowns "
        "visualize distribution across 7 domains (Security, Compliance, Clinical, Technical, Financial, Legal, Operational).",
        body_style
    ))

    story.append(Paragraph("B. RFP Document Repository & Automated Ingestion", h2_style))
    story.append(Paragraph(
        "Upload incoming healthcare bids (PDF, DOCX, TXT) with automatic organization assignment, SHA-256 integrity hashing, "
        "and multi-page extraction. Once uploaded, the parsing pipeline automatically segments paragraphs into structured "
        "requirement line items tagged with page numbers and section headers.",
        body_style
    ))

    story.append(Paragraph("C. Granular Requirements Matrix", h2_style))
    story.append(Paragraph(
        "A searchable, multi-filter table presenting all clauses across all hospital contracts. Users can filter by "
        "<b>Category</b>, <b>Priority (Critical, High, Medium, Low)</b>, and <b>Workflow Status (Identified, Drafted, Reviewed, Compliant)</b>, "
        "with quick 1-click routing to generate draft responses.",
        body_style
    ))

    story.append(Paragraph("D. Semantic Vector Search (ChromaDB)", h2_style))
    story.append(Paragraph(
        "Unlike keyword searches that fail on terminology differences (e.g. 'PHI' vs 'patient medical records'), "
        "the semantic search converts queries into high-dimensional vector embeddings, surfacing conceptually relevant clauses "
        "with exact match confidence percentages.",
        body_style
    ))

    story.append(Paragraph("E. AI Draft Responses with Strict Source Citations (RAG)", h2_style))
    story.append(Paragraph(
        "Generates hospital-ready response text with verifiable source chips indicating originating document name, page number, "
        "and clause excerpt. If supporting evidence is insufficient in the contract, the engine flags missing prerequisites rather than inventing answers.",
        body_style
    ))

    story.append(Paragraph("F. Compliance & Gap Analysis Checklist", h2_style))
    story.append(Paragraph(
        "Calculates an audit readiness percentage using a mathematical weighted scoring formula. Items without validated citations "
        "are placed into a dedicated <i>Gaps & Missing Requirements</i> panel with specific recommended remediation actions.",
        body_style
    ))

    story.append(Paragraph("G. iOS-Style Dark & Light Mode Theme Switch", h2_style))
    story.append(Paragraph(
        "An authentic Apple iOS-style capsule toggle switch with smooth cubic-bezier physics, iOS green active state, and persistent "
        "localStorage synchronization, adapting the entire UI between crisp clinic white and high-contrast enterprise slate-950.",
        body_style
    ))

    story.append(Paragraph("H. Interactive System Notification Center", h2_style))
    story.append(Paragraph(
        "A live notification dropdown in the top navigation providing real-time alerts for critical compliance gaps, vector indexing "
        "milestones, and newly drafted responses, complete with unread counts and 1-click deep navigation.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 4: HOW TO USE THE WEBSITE (STEP-BY-STEP)
    # ========================================================
    story.append(Paragraph("4. Step-by-Step User Manual: How to Use the Website", h1_style))
    story.append(Paragraph(
        "Follow this standard operating workflow to analyze an incoming healthcare RFP from start to finish:",
        body_style
    ))

    steps_data = [
        [
            Paragraph("<b>Step 1: Upload RFP Document</b>", table_cell_style),
            Paragraph("Navigate to <b>RFP Documents</b> in the left sidebar. Click <b>Upload New RFP</b>. Drag & drop your PDF/DOCX contract, specify the healthcare client organization name (e.g. <i>'MetroHealth System'</i>), and click <b>Upload & Process</b>.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 2: Inspect Extracted Clauses</b>", table_cell_style),
            Paragraph("Click on the uploaded RFP to open <b>Document Details</b>. Review extracted clauses, total counts, and critical obligation items. You can filter items in real-time or trigger re-analysis if updated files are uploaded.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 3: Triage the Requirements Matrix</b>", table_cell_style),
            Paragraph("Head to <b>Requirements Matrix</b>. Use the category pills and priority filters (e.g. select <i>'Security'</i> + <i>'Critical'</i>) to immediately identify high-risk contractual mandates like HIPAA encryption or SSO constraints.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 4: Execute Semantic Search</b>", table_cell_style),
            Paragraph("Click <b>Semantic Search</b> in the sidebar (or press <b>⌘K</b> in the topbar). Search queries like <i>'disaster recovery and RTO/RPO SLAs'</i> or <i>'patient consent audit trail'</i> to retrieve matching clauses across all contracts.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 5: Generate AI Draft Responses</b>", table_cell_style),
            Paragraph("Navigate to <b>Draft Responses</b>. Pick an unaddressed requirement from the dropdown menu and click <b>Generate Response</b>. The AI synthesizes a compliant draft backed by exact citations. Use the built-in editor to tailor the text and save revisions.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 6: Audit Readiness & Gap Remediation</b>", table_cell_style),
            Paragraph("Open <b>Compliance Checklist</b> to check the final executive readiness score (0-100%). Review the <b>Gaps & Missing Requirements</b> tab to take corrective action on clauses flagged as non-compliant before proposal submission.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 7: Personalize Interface & Theme</b>", table_cell_style),
            Paragraph("Toggle between Light and Dark mode anytime using the iOS switch in the topbar. Visit <b>Settings</b> to configure custom backend API endpoints and inspect vector indexing health.", table_cell_style)
        ]
    ]

    steps_table = Table(steps_data, colWidths=[150, 382])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(steps_table)
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 5: HOW TO RUN LOCALLY & CLI COMMANDS
    # ========================================================
    story.append(Paragraph("5. Local Deployment & Execution Guide", h1_style))
    story.append(Paragraph(
        "To run the complete platform on your local workstation (`localhost`), open two terminal windows:",
        body_style
    ))

    cli_data = [
        [Paragraph("Terminal", table_header_style), Paragraph("Command & Step", table_header_style), Paragraph("Local Address & Port", table_header_style)],
        [
            Paragraph("<b>Terminal 1<br/>Backend</b>", table_cell_style),
            Paragraph(
                "<code>cd \"Healthcare RFP Requirement Analyzer/backend\"</code><br/>"
                "<code>python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload</code>",
                code_style
            ),
            Paragraph("<b>API:</b> http://127.0.0.1:8000<br/><b>Docs:</b> http://127.0.0.1:8000/docs", table_cell_style)
        ],
        [
            Paragraph("<b>Terminal 2<br/>Frontend</b>", table_cell_style),
            Paragraph(
                "<code>cd \"Healthcare RFP Requirement Analyzer/frontend\"</code><br/>"
                "<code>npm run dev</code>",
                code_style
            ),
            Paragraph("<b>UI Web App:</b><br/>http://localhost:5173", table_cell_style)
        ]
    ]
    cli_table = Table(cli_data, colWidths=[90, 292, 150])
    cli_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(cli_table)
    story.append(Spacer(1, 14))

    # ========================================================
    # SECTION 6: COMPLIANCE FORMULA & SECURITY
    # ========================================================
    story.append(Paragraph("6. Compliance Scoring Formula & Security Safeguards", h1_style))
    story.append(Paragraph(
        "Executive readiness scores are computed mathematically rather than estimated qualitatively:",
        body_style
    ))
    story.append(Paragraph(
        "&bull; <b>Critical Requirement:</b> 4.0x multiplier (e.g. HIPAA Security Rule, Data Encryption at Rest/Transit)<br/>"
        "&bull; <b>High Priority:</b> 3.0x multiplier (e.g. Disaster Recovery SLAs, RPO &lt; 15 min)<br/>"
        "&bull; <b>Medium Priority:</b> 2.0x multiplier (e.g. FHIR interoperability, role-based access control)<br/>"
        "&bull; <b>Low Priority:</b> 1.0x multiplier (e.g. UI customization, brand styling guidelines)",
        bullet_style
    ))
    story.append(Paragraph(
        "<code>Compliance Score (%) = (Sum of Earned Satisfied Weights / Total Possible Weights) &times; 100</code>",
        code_style
    ))
    story.append(Paragraph(
        "<b>HIPAA & Data Privacy Safeguards:</b> All vector embeddings and SQLite databases persist locally on the workstation. "
        "No patient records or confidential contract clauses are transmitted to third-party model providers without user-configured API credentials.",
        body_style
    ))

    # Build PDF with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created: {filename}")

if __name__ == "__main__":
    out_pdf = "/Users/hari/Downloads/Healthcare RFP Requirement Analyzer/Healthcare_RFP_Requirement_Analyzer_User_Guide.pdf"
    create_guide_pdf(out_pdf)
