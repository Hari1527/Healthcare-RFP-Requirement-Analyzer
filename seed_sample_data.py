"""
Seed script to populate sample Healthcare RFP data into the system.
Run this script to immediately populate the database, ChromaDB vector store, and dashboard.
"""
import os
import sys
import uuid
import datetime

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.db.session import SessionLocal, Base, engine
from app.models.document import Document, DocumentChunk
from app.models.requirement import Requirement
from app.models.response import DraftResponse, SourceReference
from app.services.embedding_service import EmbeddingService

def seed_sample_rfp():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing = db.query(Document).filter(Document.original_filename == "sample_rfp_metrohealth.txt").first()
    if existing:
        print("Sample RFP document is already in the database!")
        db.close()
        return

    print("Seeding sample Healthcare RFP: MetroHealth Regional Medical Center...")
    doc_id = str(uuid.uuid4())
    filename = f"{doc_id}_sample_rfp_metrohealth.txt"
    
    # Copy file to uploads
    os.makedirs("backend/uploads", exist_ok=True)
    with open("sample_rfp_metrohealth.txt", "r") as f:
        content = f.read()
    with open(f"backend/uploads/{filename}", "w") as f:
        f.write(content)

    doc = Document(
        id=doc_id,
        filename=filename,
        original_filename="sample_rfp_metrohealth.txt",
        organization="MetroHealth Regional Medical Center",
        file_type="text/plain",
        file_size=len(content.encode('utf-8')),
        page_count=6,
        processing_status="COMPLETED",
        upload_date=datetime.datetime.utcnow()
    )
    db.add(doc)
    db.commit()

    # Create Document Chunks
    sections = [
        ("1.0", "Executive Summary & Background", "MetroHealth Regional Medical Center operates 4 acute care hospitals, 18 outpatient clinics, and serves over 450,000 active patients annually across the tri-state area. The objective of this RFP is to select a qualified technology vendor to deliver an integrated, next-generation EHR system, interoperability platform, and patient engagement portal.", 1),
        ("2.1", "HIPAA & HITECH Compliance", "The vendor shall maintain full compliance with the Health Insurance Portability and Accountability Act (HIPAA) of 1996, the HITECH Act, and all associated Omnibus regulations. The vendor must sign a Business Associate Agreement (BAA) with MetroHealth prior to contract execution.", 2),
        ("2.2", "Data Encryption Standards", "All Protected Health Information (PHI) and Electronic Protected Health Information (ePHI) must be encrypted at rest utilizing AES-256 bit encryption. All data in transit across public or internal networks shall utilize TLS 1.3 or higher. Unencrypted transmission of patient data is strictly prohibited.", 2),
        ("2.3", "RBAC & Multi-Factor Authentication", "The solution shall provide granular role-based access control (RBAC) enforcing the principle of least privilege. Multi-Factor Authentication (MFA) is mandatory for all administrative access, clinical staff logins, and remote patient portal sessions.", 2),
        ("2.4", "Audit Logging & Traceability", "The platform must maintain comprehensive, immutable audit logs tracking all access, modifications, exports, and deletions of patient health records. Audit logs shall be retained for a minimum of seven (7) years in accordance with federal healthcare compliance guidelines.", 3),
        ("3.1", "Clinical Decision Support", "The system shall incorporate an intelligent Clinical Decision Support engine capable of real-time drug-drug, drug-allergy, and drug-disease interaction alerting based on national clinical databases (e.g., First Databank or Medi-Span).", 3),
        ("3.2", "CPOE & Medication Management", "The platform must support Computerized Physician Order Entry (CPOE) for laboratory tests, diagnostic imaging, and medications with electronic prescribing (e-Prescribing) of controlled substances complying with EPCS regulations.", 4),
        ("4.1", "HL7 FHIR Interoperability", "The system shall expose certified HL7 FHIR (Fast Healthcare Interoperability Resources) Release 4 APIs supporting US Core Implementation Guide profiles. The vendor must enable bidirectional data exchange with external health information exchanges (HIEs), regional lab networks, and third-party payer claims clearinghouses.", 5),
        ("4.2", "Availability & SLAs", "The solution must guarantee 99.99% monthly system uptime (high availability), excluding scheduled off-peak maintenance windows which shall not exceed four (4) hours per calendar month. The vendor must provide 24/7/365 priority-1 incident response with a maximum resolution time of two (2) hours.", 5),
        ("5.1", "Pricing Transparency", "Vendors shall submit an itemized fixed-fee pricing model covering software licensing, implementation services, data migration from legacy Cerner/Epic systems, user training, and ongoing 5-year maintenance. No hidden per-seat licensing fees will be accepted.", 6)
    ]

    db_chunks = []
    for idx, (sec_id, sec_title, text, page) in enumerate(sections):
        chunk = DocumentChunk(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            page_number=page,
            section=f"{sec_id} {sec_title}",
            text=text,
            chunk_index=idx
        )
        db.add(chunk)
        db_chunks.append(chunk)
    db.commit()

    # Requirements specifications
    req_specs = [
        ("The vendor shall maintain full compliance with HIPAA, the HITECH Act, and execute a Business Associate Agreement (BAA).", "Compliance", "Critical", "Mandatory", 2, "2.1 HIPAA & HITECH Compliance", "RESPONDED"),
        ("All PHI and ePHI must be encrypted at rest using AES-256 and in transit using TLS 1.3 or higher.", "Security", "Critical", "Mandatory", 2, "2.2 Data Encryption Standards", "RESPONDED"),
        ("The solution shall provide granular role-based access control (RBAC) and enforce Multi-Factor Authentication (MFA) across all user logins.", "Security", "High", "Mandatory", 2, "2.3 RBAC & MFA", "RESPONDED"),
        ("The platform must maintain immutable audit logs of all patient health record access, retained for at least 7 years.", "Compliance", "High", "Mandatory", 3, "2.4 Audit Logging", "IDENTIFIED"),
        ("The system shall incorporate real-time drug-drug, drug-allergy, and drug-disease interaction clinical decision support.", "Clinical", "High", "Mandatory", 3, "3.1 Clinical Decision Support", "IDENTIFIED"),
        ("The platform must support Computerized Physician Order Entry (CPOE) and certified EPCS e-Prescribing.", "Clinical", "Critical", "Mandatory", 4, "3.2 CPOE & Medication Management", "IDENTIFIED"),
        ("The system shall expose certified HL7 FHIR Release 4 APIs supporting US Core Implementation Guide profiles for bidirectional exchange.", "Technical", "Critical", "Mandatory", 5, "4.1 HL7 FHIR Interoperability", "RESPONDED"),
        ("The solution must guarantee 99.99% monthly system uptime and provide 24/7 priority-1 incident resolution within 2 hours.", "Technical", "High", "Mandatory", 5, "4.2 Availability & SLAs", "IDENTIFIED"),
        ("Vendors shall submit an itemized fixed-fee pricing model covering licensing, migration, and 5-year support with zero hidden fees.", "Financial", "Medium", "Mandatory", 6, "5.1 Pricing Transparency", "IDENTIFIED")
    ]

    db_reqs = []
    for text, cat, prio, rtype, page, sec, stat in req_specs:
        req = Requirement(
            id=str(uuid.uuid4()),
            document_id=doc.id,
            requirement_text=text,
            category=cat,
            priority=prio,
            requirement_type=rtype,
            page_number=page,
            section=sec,
            status=stat
        )
        db.add(req)
        db_reqs.append(req)
    db.commit()

    # Draft Responses with citations for responded requirements
    responded_reqs = [r for r in db_reqs if r.status == "RESPONDED"]
    for r in responded_reqs:
        resp_id = str(uuid.uuid4())
        resp_text = f"[AI-Generated Draft]\nOur enterprise platform fully complies with the specification stated in requirement: '{r.requirement_text}'. All safeguards, cryptographic algorithms (AES-256 / TLS 1.3), and certified interoperability standards (HL7 FHIR R4) are deployed in production across enterprise healthcare networks."
        
        draft = DraftResponse(
            id=resp_id,
            requirement_id=r.id,
            response_text=resp_text,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(draft)
        db.flush()

        # Add SourceReference
        ref = SourceReference(
            id=str(uuid.uuid4()),
            response_id=draft.id,
            document_id=doc.id,
            page_number=r.page_number,
            section=r.section,
            excerpt=f"Supporting excerpt from {r.section}: Verified compliance requirement in MetroHealth RFP."
        )
        db.add(ref)
    db.commit()

    # Index into ChromaDB vector database
    try:
        print("Generating vector embeddings and indexing into ChromaDB...")
        emb_service = EmbeddingService()
        emb_service.store_chunk_embeddings(db_chunks)
        emb_service.store_requirement_embeddings(db_reqs)
        print("Vector store indexing complete!")
    except Exception as e:
        print(f"Note: Vector indexing skipped or deferred: {e}")

    db.close()
    print("Seed complete! Sample Healthcare RFP with requirements and draft responses is live.")

if __name__ == "__main__":
    seed_sample_rfp()
