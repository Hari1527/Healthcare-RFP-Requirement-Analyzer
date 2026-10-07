from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.compliance import MissingRequirementsResponse, ComplianceReport
from app.services.compliance_service import ComplianceService

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])

@router.get("/missing", response_model=MissingRequirementsResponse)
def get_missing_requirements(
    document_id: str | None = None,
    db: Session = Depends(get_db)
):
    service = ComplianceService(db)
    return service.get_missing_requirements(document_id=document_id)

@router.get("/{document_id}", response_model=ComplianceReport)
def get_compliance_report(document_id: str, db: Session = Depends(get_db)):
    service = ComplianceService(db)
    return service.analyze_compliance(document_id)
