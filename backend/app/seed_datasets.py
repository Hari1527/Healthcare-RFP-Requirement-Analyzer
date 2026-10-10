"""
Seed script to populate multiple diverse Healthcare RFP datasets into the system:
1. MetroHealth Regional Medical Center - Next-Gen EHR & Interoperability Platform
2. Children's National & Pediatric Specialty Network - Pediatric Telehealth & RPM Platform
3. Cascade Health Plan - AI-Driven Prior Authorization & CMS-0057-F Interoperability
4. Apex Precision Oncology - Enterprise Cloud PACS & Multi-Omic Genomic Lakehouse
5. Veterans Alliance - Behavioral Health & 42 CFR Part 2 Platform
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

DATASETS_CONFIG = [
    {
        "file": "sample_rfp_metrohealth.txt",
        "organization": "MetroHealth Regional Medical Center",
        "page_count": 6,
        "sections": [
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
        ],
        "requirements": [
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
    },
    {
        "file": "sample_rfp_pediatric_telehealth.txt",
        "organization": "Children's National & Pediatric Specialty Network",
        "page_count": 5,
        "sections": [
            ("1.0", "Executive Summary & Network Scope", "Children's National & Pediatric Specialty Network operates 1 central pediatric quaternary hospital, 25 ambulatory subspecialty clinics, and serves over 120,000 pediatric patients with complex chronic conditions including asthma, type 1 diabetes, congenital heart defects, and pediatric oncology. The network is seeking an enterprise software vendor to implement an end-to-end Pediatric Telehealth and Remote Patient Monitoring (RPM) platform.", 1),
            ("2.1", "COPPA, HIPAA & Parental Consent", "The platform must comply with the Children's Online Privacy Protection Act (COPPA) and HIPAA Omnibus rules. The vendor shall provide digital parental and legal guardian consent workflows with age-of-majority transition logic automatically segregating adolescent private medical communications upon the patient reaching 18 years of age.", 2),
            ("2.2", "MDDS & FDA SaMD Compliance", "All RPM diagnostic alerting algorithms must comply with FDA Software as a Medical Device (SaMD) requirements and 21 CFR Part 820 quality system regulations. Algorithms providing automated diagnostic notifications must be backed by clinical validation documentation.", 2),
            ("2.3", "Data Encryption & Media Security", "All live audio/video teleconsultation streams must be encrypted end-to-end utilizing WebRTC SRTP with AES-256. At-rest biometric telemetry must be encrypted using FIPS 140-3 validated cryptographic modules.", 2),
            ("2.4", "SOC 2 & HITRUST Attestation", "The vendor shall provide an annual SOC 2 Type II attestation report and a HITRUST CSF certification covering the entire cloud infrastructure and mobile application ecosystem.", 3),
            ("3.1", "Medical Device Telemetry Integration", "The platform must support direct cellular and Bluetooth Low Energy (BLE) pairing with FDA-cleared pediatric glucometers, spirometers, pulse oximeters, and continuous weight scales without requiring manual numeric entry by children or parents.", 3),
            ("3.2", "Pediatric Vital Sign Alerting", "The system shall incorporate pediatric physiological reference ranges with automated age-adjusted and weight-adjusted z-score alerting thresholds for heart rate, respiratory rate, and blood pressure. Critical alerts must automatically trigger tiered push notifications to on-call pediatric triage nurses.", 4),
            ("4.1", "HL7 FHIR Bulk Data & Device Observations", "The platform shall ingest and export device observations utilizing HL7 FHIR Release 4 Observation resources conforming to the US Core Pediatric Vital Signs profile. Bidirectional integration with Epic and Cerner EHRs is mandatory.", 4),
            ("4.2", "Low-Latency Telehealth Performance", "The video streaming infrastructure must maintain glass-to-glass latency below 200 milliseconds under network bandwidth constraints down to 500 kbps, with automated fallback to audio-only in low-connectivity rural zones.", 5),
            ("5.1", "PPPM Subscription Pricing", "Vendors shall submit a transparent tiered Per-Patient Per-Month (PPPM) billing structure based on active monitored patients, with zero activation fees for dormant accounts.", 5)
        ],
        "requirements": [
            ("The platform must comply with COPPA and HIPAA Omnibus rules with automated age-of-majority consent workflows for adolescent privacy.", "Compliance", "Critical", "Mandatory", 2, "2.1 COPPA, HIPAA & Consent", "RESPONDED"),
            ("All RPM diagnostic alerting algorithms must comply with FDA Software as a Medical Device (SaMD) guidelines and 21 CFR Part 820.", "Compliance", "High", "Mandatory", 2, "2.2 FDA SaMD Compliance", "RESPONDED"),
            ("All live teleconsultation audio/video streams must be encrypted end-to-end using WebRTC SRTP with AES-256 and FIPS 140-3 telemetry modules.", "Security", "Critical", "Mandatory", 2, "2.3 Data Encryption & Media Security", "RESPONDED"),
            ("The vendor shall provide an annual SOC 2 Type II attestation report and HITRUST CSF certification.", "Security", "High", "Mandatory", 3, "2.4 SOC 2 & HITRUST Attestation", "IDENTIFIED"),
            ("The platform must support direct cellular and BLE telemetry pairing with FDA-cleared pediatric medical devices without manual entry.", "Clinical", "High", "Mandatory", 3, "3.1 Device Telemetry Integration", "RESPONDED"),
            ("The system shall incorporate automated age-adjusted and weight-adjusted z-score alerting thresholds for pediatric vital signs.", "Clinical", "Critical", "Mandatory", 4, "3.2 Pediatric Vital Sign Alerting", "IDENTIFIED"),
            ("The platform shall ingest and export device observations using HL7 FHIR R4 US Core Pediatric profiles with Epic/Cerner integration.", "Technical", "Critical", "Mandatory", 4, "4.1 HL7 FHIR & EHR Integration", "RESPONDED"),
            ("The video streaming infrastructure must maintain latency below 200 milliseconds with automatic fallback to audio under low bandwidth.", "Technical", "High", "Mandatory", 5, "4.2 Low-Latency Telehealth", "IDENTIFIED"),
            ("Vendors shall submit a transparent tiered Per-Patient Per-Month (PPPM) billing structure with zero dormant account fees.", "Financial", "Medium", "Mandatory", 5, "5.1 PPPM Subscription Pricing", "IDENTIFIED")
        ]
    },
    {
        "file": "sample_rfp_payer_prior_auth.txt",
        "organization": "Cascade Health Plan & Integrated Provider Network",
        "page_count": 5,
        "sections": [
            ("1.0", "Executive Summary & Business Background", "Cascade Health Plan is an integrated healthcare payer operating commercial health plans, Medicare Advantage, and Medicaid managed care networks serving 1.2 million covered members across four western states. Cascade processes approximately 450,000 prior authorization (PA) requests annually. The goal of this RFP is to deploy an automated, AI-driven prior authorization decision support engine compliant with federal CMS mandates.", 1),
            ("2.1", "CMS-0057-F Interoperability Rule", "The vendor solution must guarantee complete compliance with the CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F). The platform shall support standardized electronic prior authorization APIs, mandatory payer-to-payer data exchange, and federal reporting metrics on prior authorization approval and denial turnaround times.", 2),
            ("2.2", "HIPAA EDI X12 278/275 Standard", "The platform shall ingest and generate standard HIPAA X12 278 transactions (Prior Authorization Request and Response) as well as X12 275 companion transactions for supporting clinical attachments.", 2),
            ("2.3", "HITRUST CSF & Algorithmic Non-Discrimination", "The platform must possess active HITRUST CSF certification. Any AI/ML algorithms deployed for clinical authorization recommendation must maintain an auditable algorithmic decision trail ensuring compliance with Section 1557 of the ACA preventing algorithmic bias.", 2),
            ("3.1", "InterQual & MCG Criteria Engine", "The engine must support out-of-the-box digital integration with industry-standard clinical criteria, specifically InterQual and Milliman Care Guidelines (MCG), enabling automated rule execution against structured EHR clinical data.", 3),
            ("3.2", "Instant Gold Card Provider Approvals", "The platform shall support automated instant approvals for high-performing providers qualifying under state gold-carding legislation, bypassing manual nurse review when historical compliance thresholds exceed 95%.", 3),
            ("4.1", "Da Vinci FHIR Profiles Implementation", "The platform must implement the three HL7 FHIR Da Vinci Project standards: Coverage Requirements Discovery (CRD), Documentation Templates and Rules (DTR), and Prior Authorization Support (PAS). The system shall expose certified RESTful FHIR endpoints compliant with SMART on FHIR authorization.", 4),
            ("4.2", "Decision Engine Response SLA", "Synchronous CRD and DTR inquiries from provider EHRs must return within 1.5 seconds. Automated PAS determinations for non-urgent requests must be finalized within twenty-four (24) hours, and urgent emergency requests must be resolved within seventy-two (72) hours in compliance with federal CMS guidelines.", 4),
            ("4.3", "Core Claims System Integration", "The platform must provide pre-built bidirectional connectors to legacy payer claims adjudication engines, specifically Cognizant TriZetto Facets and HealthEdge HealthRules.", 5),
            ("5.1", "Value-Based Pricing & Indemnification", "Vendors shall submit a pricing model tied to successful transaction processing volume, with fee credits applied if automated authorization decision latency exceeds contractual thresholds. The vendor shall indemnify Cascade against CMS penalties.", 5)
        ],
        "requirements": [
            ("The vendor solution must guarantee complete compliance with CMS Interoperability and Prior Authorization Final Rule CMS-0057-F.", "Compliance", "Critical", "Mandatory", 2, "2.1 CMS-0057-F Interoperability Rule", "RESPONDED"),
            ("The platform shall ingest and generate standard HIPAA EDI X12 278 and X12 275 companion transactions for clinical attachments.", "Technical", "High", "Mandatory", 2, "2.2 HIPAA EDI X12 278/275", "RESPONDED"),
            ("The platform must possess active HITRUST CSF certification and maintain an auditable algorithmic bias governance trail.", "Security", "Critical", "Mandatory", 2, "2.3 HITRUST & Non-Discrimination", "RESPONDED"),
            ("The engine must support digital integration with InterQual and MCG criteria for automated rule execution against clinical data.", "Clinical", "Critical", "Mandatory", 3, "3.1 InterQual & MCG Engine", "RESPONDED"),
            ("The platform shall support automated instant approvals for high-performing physicians qualifying under gold-carding criteria.", "Clinical", "High", "Mandatory", 3, "3.2 Gold Card Provider Approvals", "IDENTIFIED"),
            ("The platform must implement HL7 FHIR Da Vinci standards: CRD, DTR, and PAS compliant with SMART on FHIR authorization.", "Technical", "Critical", "Mandatory", 4, "4.1 Da Vinci FHIR Profiles", "RESPONDED"),
            ("Synchronous CRD/DTR inquiries must return in under 1.5 seconds, with 72-hour max turnaround for urgent PA determinations.", "Technical", "High", "Mandatory", 4, "4.2 Decision Engine Response SLA", "IDENTIFIED"),
            ("The platform must provide pre-built connectors to TriZetto Facets and HealthEdge HealthRules claims engines.", "Technical", "Medium", "Mandatory", 5, "4.3 Core Claims Integration", "IDENTIFIED"),
            ("The vendor shall provide transaction volume pricing with fee credits for latency breaches and CMS non-compliance indemnification.", "Legal", "High", "Mandatory", 5, "5.1 Value Pricing & Indemnification", "IDENTIFIED")
        ]
    },
    {
        "file": "sample_rfp_genomics_pacs.txt",
        "organization": "Apex Precision Oncology & Genomic Research Institute",
        "page_count": 6,
        "sections": [
            ("1.0", "Executive Summary & Precision Medicine", "Apex Precision Oncology & Genomic Research Institute is an NCI-designated comprehensive cancer center treating 45,000 active cancer patients and conducting over 150 clinical trials annually. Apex generates over 75,000 diagnostic imaging studies and 15,000 next-generation sequencing (NGS) genomic assays per year. The objective of this RFP is to deploy a cloud-native Enterprise PACS and Multi-Omic Genomic Data Lakehouse.", 1),
            ("2.1", "FedRAMP High & Cloud Posture", "The entire software platform and hosting infrastructure must maintain FedRAMP High authorization or DoD Impact Level 4 (IL4) equivalency to satisfy federal research grant data handling standards.", 2),
            ("2.2", "Automated PHI De-Identification", "The system shall feature an automated de-identification engine compliant with HIPAA Safe Harbor and Expert Determination methods. It must strip or hash all 18 direct identifiers from DICOM metadata and genomic FASTQ/VCF files prior to research cohort export.", 2),
            ("2.3", "Genomic Consent & Cryptography", "The platform must enforce granular patient dynamic consent tracking under the Common Rule and encrypt all genomic variant files at rest using customer-managed encryption keys (CMEK).", 2),
            ("3.1", "FDA 510(k) Cleared Diagnostic Web Viewer", "The PACS module must deliver an HTML5 zero-footprint web viewer with FDA 510(k) Class II diagnostic clearance supporting 3D volumetric rendering, multi-planar reconstruction (MPR), and maximum intensity projection (MIP).", 3),
            ("3.2", "Genomic Variant Annotation Knowledgebases", "The platform shall ingest genomic VCF files, automatically annotating somatic and germline mutations against certified precision oncology knowledgebases (OncoKB, ClinVar, COSMIC, and CIViC).", 3),
            ("3.3", "Molecular Tumor Board Workspace", "The system must provide an interactive, synchronized Molecular Tumor Board presentation dashboard allowing simultaneous review of radiologic imaging, digital pathology whole slide images (WSI), and genomic biomarkers.", 4),
            ("4.1", "DICOMweb RESTful & HL7 FHIR Genomics", "The imaging tier must natively expose standard DICOMweb RESTful interfaces: WADO-RS, STOW-RS, and QIDO-RS. The genomic tier must expose HL7 FHIR Release 4 APIs supporting the official HL7 FHIR Genomics Reporting Implementation Guide.", 4),
            ("4.2", "Petabyte Tiering & High-Speed Streaming", "The cloud repository must intelligently tier data across hot, warm, and cold storage tiers (targeting over 3.5 Petabytes), rendering images in under 1.5 seconds for standard studies.", 5),
            ("5.1", "Predictable Storage Pricing & Migration", "Vendors shall submit an all-inclusive storage pricing model per Gigabyte/month across active and archive tiers with zero egress charges. The vendor shall migrate 250 TB of legacy DICOM studies within 270 days.", 6)
        ],
        "requirements": [
            ("The hosting infrastructure and platform must maintain FedRAMP High authorization or DoD IL4 equivalency.", "Security", "Critical", "Mandatory", 2, "2.1 FedRAMP High Cloud Posture", "RESPONDED"),
            ("The system shall feature an automated de-identification engine complying with HIPAA Safe Harbor for DICOM and genomic VCF data.", "Compliance", "Critical", "Mandatory", 2, "2.2 Automated PHI De-Identification", "RESPONDED"),
            ("All genomic and pathology data must be encrypted at rest utilizing customer-managed encryption keys (CMEK).", "Security", "High", "Mandatory", 2, "2.3 Genomic Cryptography", "RESPONDED"),
            ("The PACS viewer must hold FDA 510(k) Class II diagnostic clearance supporting 3D rendering and multi-planar reconstruction.", "Clinical", "Critical", "Mandatory", 3, "3.1 FDA 510(k) Diagnostic Viewer", "RESPONDED"),
            ("The platform shall automatically annotate genomic VCF files against OncoKB, ClinVar, COSMIC, and CIViC databases.", "Clinical", "High", "Mandatory", 3, "3.2 Genomic Variant Annotation", "IDENTIFIED"),
            ("The system must provide a collaborative Molecular Tumor Board workspace for synchronized imaging and biomarker review.", "Clinical", "High", "Mandatory", 4, "3.3 Molecular Tumor Board", "IDENTIFIED"),
            ("The platform must natively expose DICOMweb RESTful APIs (WADO-RS, STOW-RS, QIDO-RS) and HL7 FHIR Genomics Reporting APIs.", "Technical", "Critical", "Mandatory", 4, "4.1 DICOMweb & FHIR Genomics", "RESPONDED"),
            ("The cloud repository must tier over 3.5 PB with sub-1.5 second initial image rendering and sub-3.0 second whole slide pathology streaming.", "Technical", "High", "Mandatory", 5, "4.2 Petabyte Tiering & Streaming", "IDENTIFIED"),
            ("Vendors shall provide flat per-gigabyte pricing with zero egress fees and execute 250 TB legacy PACS migration within 270 days.", "Operational", "Medium", "Mandatory", 6, "5.1 Storage Pricing & Migration", "IDENTIFIED")
        ]
    },
    {
        "file": "sample_rfp_behavioral_health.txt",
        "organization": "Veterans Alliance & Community Behavioral Health Network",
        "page_count": 5,
        "sections": [
            ("1.0", "Executive Summary & Community Health Outreach", "The Veterans Alliance & Community Behavioral Health Network is a regional non-profit healthcare system providing comprehensive mental health, substance use disorder (SUD) treatment, suicide prevention, and community reintegration services to 85,000 military veterans and underserved rural populations across 32 clinics and 8 mobile crisis units. The purpose of this RFP is to deploy a trauma-informed electronic behavioral health record and crisis intervention management platform.", 1),
            ("2.1", "42 CFR Part 2 Substance Use Disorder Privacy", "The platform must implement strict, auditable consent management complying with Title 42 of the Code of Federal Regulations (42 CFR Part 2). The system shall enforce granular data segregation ensuring SUD treatment records, methadone/buprenorphine administration, and therapy notes are strictly shielded and require explicit patient redisclosure authorization.", 2),
            ("2.2", "SAMHSA Automated Redaction & CJIS Standards", "The platform must support automated redaction of sensitive substance use diagnoses and billing codes when transmitting mixed records. The system shall comply with FBI Criminal Justice Information Services (CJIS) Security Policy standards.", 2),
            ("2.3", "Data Sovereignty & Domestic Hosting", "The vendor shall sign a federal Business Associate Agreement (BAA) and guarantee that all patient records and therapy session transcripts reside solely within secure, domestic US sovereign data centers.", 2),
            ("3.1", "National 988 Suicide & Crisis Lifeline Integration", "The platform must support bidirectional computer telephony integration (CTI) and API integration with the National 988 Suicide & Crisis Lifeline, enabling instantaneous warm transfers, geolocation dispatch for mobile crisis units, and shared risk assessment logging.", 3),
            ("3.2", "C-SSRS Lethality Scoring & Safety Planning", "The clinical interface shall natively integrate standard psychometric assessment instruments, including the Columbia-Suicide Severity Rating Scale (C-SSRS), PHQ-9, and GAD-7, with automated real-time lethality risk scoring and mandatory safety planning prompts.", 3),
            ("3.3", "Mobile Offline Rural Outreach Charting", "Mobile crisis workers and peer support specialists operating in rural areas with zero cellular connectivity must have access to a secure offline tablet application capable of charting encounters, administering Narcan overdose logs, and queueing records for encrypted background synchronization.", 4),
            ("4.1", "State PDMP Integration & Prescription Safety", "The system shall provide automated, one-click querying of state Prescription Drug Monitoring Programs (PDMP) via Appriss Health / Bamboo Health integrations directly within the clinician's prescribing workflow.", 4),
            ("4.2", "HL7 FHIR Behavioral Health & 99.99% Availability", "The platform shall expose certified HL7 FHIR Release 4 RESTful APIs supporting the US Core profile and HL7 Behavioral Health resources. The platform must guarantee 99.99% system uptime for crisis triage and 988 call handling modules.", 5),
            ("5.1", "HRSA/SAMHSA Grant Funding Model", "Vendors shall structure their commercial proposal to accommodate federal HRSA and SAMHSA grant funding cycles, featuring fixed annual SaaS subscriptions without penalty fees for volunteer crisis counselor accounts.", 5)
        ],
        "requirements": [
            ("The platform must implement strict 42 CFR Part 2 consent workflows and granular data segregation for substance use disorder records.", "Compliance", "Critical", "Mandatory", 2, "2.1 42 CFR Part 2 Privacy", "RESPONDED"),
            ("The system must provide automated SAMHSA-compliant redaction of substance use diagnoses and comply with FBI CJIS standards.", "Compliance", "High", "Mandatory", 2, "2.2 SAMHSA Redaction & CJIS", "RESPONDED"),
            ("All patient records and psychotherapy notes must reside strictly in domestic US sovereign data centers with signed BAA.", "Security", "Critical", "Mandatory", 2, "2.3 Domestic Data Sovereignty", "RESPONDED"),
            ("The platform must support bidirectional CTI and API integration with the National 988 Suicide & Crisis Lifeline.", "Clinical", "Critical", "Mandatory", 3, "3.1 National 988 Lifeline Integration", "RESPONDED"),
            ("The clinical interface shall natively integrate the Columbia-Suicide Severity Rating Scale (C-SSRS) with automated lethality scoring.", "Clinical", "Critical", "Mandatory", 3, "3.2 C-SSRS & Lethality Scoring", "IDENTIFIED"),
            ("Mobile crisis workers must have access to a secure offline tablet application for rural encounter charting and Narcan logs.", "Operational", "High", "Mandatory", 4, "3.3 Mobile Offline Rural Outreach", "RESPONDED"),
            ("The system shall provide automated, one-click querying of state Prescription Drug Monitoring Programs (PDMP) during prescribing.", "Clinical", "High", "Mandatory", 4, "4.1 State PDMP Integration", "IDENTIFIED"),
            ("The platform shall expose certified HL7 FHIR R4 APIs and guarantee 99.99% uptime for 988 crisis call handling modules.", "Technical", "High", "Mandatory", 5, "4.2 FHIR R4 & Crisis Uptime", "IDENTIFIED"),
            ("Vendors shall structure commercial terms for HRSA/SAMHSA grant funding cycles with flat annual licensing for volunteer counselors.", "Financial", "Medium", "Mandatory", 5, "5.1 HRSA/SAMHSA Grant Model", "IDENTIFIED")
        ]
    }
]

def seed_all_datasets():
    print("=" * 70)
    print("HEALTHCARE RFP REQUIREMENT ANALYZER - MULTI-DATASET SEED ENGINE")
    print("=" * 70)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    os.makedirs("backend/uploads", exist_ok=True)
    os.makedirs("datasets", exist_ok=True)

    emb_service = None
    try:
        emb_service = EmbeddingService()
    except Exception as e:
        print(f"Warning: EmbeddingService initialization error: {e}")

    total_docs_created = 0
    total_reqs_created = 0

    for cfg in DATASETS_CONFIG:
        fname = cfg["file"]
        org = cfg["organization"]
        filepath = os.path.join("datasets", fname)
        if not os.path.exists(filepath):
            filepath = os.path.join(os.path.dirname(__file__), "..", "datasets", fname)
        if not os.path.exists(filepath):
            filepath = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", fname)
        if not os.path.exists(filepath):
            filepath = fname
        if not os.path.exists(filepath):
            print(f"File {fname} not found. Skipping.")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        existing = db.query(Document).filter(Document.original_filename == fname).first()
        if existing:
            print(f"[{fname}] already exists in database (ID: {existing.id[:8]}...). Skipping document creation.")
            continue

        doc_id = str(uuid.uuid4())
        upload_fname = f"{doc_id}_{fname}"
        from app.core.config import settings
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(os.path.join(settings.UPLOAD_DIR, upload_fname), "w", encoding="utf-8") as f:
            f.write(content)

        doc = Document(
            id=doc_id,
            filename=upload_fname,
            original_filename=fname,
            organization=org,
            file_type="text/plain",
            file_size=len(content.encode('utf-8')),
            page_count=cfg.get("page_count", 5),
            processing_status="COMPLETED",
            upload_date=datetime.datetime.utcnow()
        )
        db.add(doc)
        db.commit()

        # Create Chunks
        db_chunks = []
        for idx, (sec_id, sec_title, text, page) in enumerate(cfg["sections"]):
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

        # Create Requirements
        db_reqs = []
        for text, cat, prio, rtype, page, sec, stat in cfg["requirements"]:
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

        # Create Responses with citations for RESPONDED
        responded_reqs = [r for r in db_reqs if r.status == "RESPONDED"]
        for r in responded_reqs:
            draft_id = str(uuid.uuid4())
            resp_text = (
                f"[AI-Generated Compliance Draft]\n"
                f"Our enterprise healthcare software suite complies in full with the requirement: '{r.requirement_text}'.\n"
                f"Technical controls, regulatory standards, cryptographic safeguards, and certified clinical integrations "
                f"have been verified in production environments."
            )
            draft = DraftResponse(
                id=draft_id,
                requirement_id=r.id,
                response_text=resp_text,
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow()
            )
            db.add(draft)
            db.flush()

            ref = SourceReference(
                id=str(uuid.uuid4()),
                response_id=draft.id,
                document_id=doc.id,
                page_number=r.page_number,
                section=r.section,
                excerpt=f"Supporting verified specification in {r.section}: '{r.requirement_text}'."
            )
            db.add(ref)
        db.commit()

        # Index Vector Embeddings
        if emb_service:
            try:
                emb_service.store_chunk_embeddings(db_chunks)
                emb_service.store_requirement_embeddings(db_reqs)
                print(f"[{fname}] Successfully indexed {len(db_chunks)} chunks and {len(db_reqs)} requirements into ChromaDB!")
            except Exception as e:
                print(f"[{fname}] Vector indexing error: {e}")

        total_docs_created += 1
        total_reqs_created += len(db_reqs)
        print(f"Seeded: '{org}' ({fname}) -> {len(db_reqs)} requirements.")

    db.close()
    print("=" * 70)
    print(f"MULTI-DATASET SEED COMPLETE: Added {total_docs_created} new documents, {total_reqs_created} new requirements.")
    print("=" * 70)

if __name__ == "__main__":
    seed_all_datasets()
