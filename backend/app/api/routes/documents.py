import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks
from app.db.session import get_db, SessionLocal
from sqlalchemy.orm import Session
from app.services.document_service import DocumentService
from app.schemas.document import DocumentUploadResponse, DocumentResponse, DocumentListResponse, DocumentStatusResponse
from app.schemas.requirement import RequirementListResponse, RequirementResponse
from app.utils.logging import logger
from app.utils.exceptions import AppException

router = APIRouter(prefix="/api/documents", tags=["Documents"])

async def run_document_analysis(document_id: str):
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        from app.services.requirement_service import RequirementService
        service = RequirementService(db)
        await service.analyze_document(document_id)
    except Exception as e:
        from app.services.document_service import DocumentService
        DocumentService(db).update_status(document_id, 'FAILED')
        logger.error(f'Analysis failed for {document_id}: {e}')
    finally:
        db.close()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    organization: str | None = Form(None),
    db: Session = Depends(get_db)
):
    service = DocumentService(db)
    document = await service.upload_document(file, organization)
    background_tasks.add_task(run_document_analysis, document.id)
    return DocumentUploadResponse.model_validate(document)

@router.get("/", response_model=DocumentListResponse)
def list_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = DocumentService(db)
    docs, total = service.get_documents(skip=skip, limit=limit)
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in docs],
        total=total
    )

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    service = DocumentService(db)
    doc = service.get_document(document_id)
    return DocumentResponse.model_validate(doc)

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    service = DocumentService(db)
    service.delete_document(document_id)
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/analyze")
def analyze_document(document_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    service = DocumentService(db)
    service.get_document(document_id)  # verify exists
    service.update_status(document_id, "PROCESSING")
    background_tasks.add_task(run_document_analysis, document_id)
    return {"message": "Analysis started", "document_id": document_id}

@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(document_id: str, db: Session = Depends(get_db)):
    service = DocumentService(db)
    status_dict = service.get_document_status(document_id)
    return DocumentStatusResponse.model_validate(status_dict)

@router.get("/{document_id}/requirements", response_model=RequirementListResponse)
def get_document_requirements(
    document_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    from app.services.requirement_service import RequirementService
    service = RequirementService(db)
    reqs, total = service.get_requirements(document_id=document_id, skip=skip, limit=limit)
    return RequirementListResponse(
        requirements=[RequirementResponse.model_validate(r) for r in reqs],
        total=total
    )

@router.post("/seed-samples")
def seed_sample_datasets():
    """Endpoint to seed or restore all 5 enterprise healthcare RFP datasets."""
    try:
        import sys
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
        from seed_multiple_datasets import seed_all_datasets
        seed_all_datasets()
        return {"message": "All sample healthcare datasets seeded successfully"}
    except Exception as e:
        logger.error(f"Error seeding datasets: {e}")
        return {"message": f"Datasets seed error: {str(e)}"}

