from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.document import Document
from app.models.requirement import Requirement
from app.models.response import DraftResponse
from app.schemas.dashboard import DashboardSummary, CategoryCount, PriorityCount, ComplianceOverview

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_docs = db.query(Document).count()
    total_reqs = db.query(Requirement).count()
    critical_reqs = db.query(Requirement).filter(Requirement.priority == "Critical").count()
    
    missing_reqs = db.query(Requirement).outerjoin(DraftResponse).filter(
        Requirement.status == "IDENTIFIED",
        DraftResponse.id == None
    ).count()
    
    total_responses = db.query(DraftResponse).count()
    
    compliance_score = None
    if total_reqs > 0:
        responded = db.query(Requirement).filter(Requirement.status.in_(["RESPONDED", "REVIEWED"])).count()
        compliance_score = (responded / total_reqs) * 100
        
    return DashboardSummary(
        total_documents=total_docs,
        total_requirements=total_reqs,
        critical_requirements=critical_reqs,
        missing_requirements=missing_reqs,
        draft_responses=total_responses,
        compliance_score=compliance_score
    )

@router.get("/requirements-by-category", response_model=list[CategoryCount])
def get_requirements_by_category(db: Session = Depends(get_db)):
    results = db.query(Requirement.category, func.count(Requirement.id)).group_by(Requirement.category).all()
    return [CategoryCount(category=r[0], count=r[1]) for r in results]

@router.get("/requirements-by-priority", response_model=list[PriorityCount])
def get_requirements_by_priority(db: Session = Depends(get_db)):
    results = db.query(Requirement.priority, func.count(Requirement.id)).group_by(Requirement.priority).all()
    return [PriorityCount(priority=r[0], count=r[1]) for r in results]

@router.get("/compliance-overview", response_model=ComplianceOverview)
def get_compliance_overview(db: Session = Depends(get_db)):
    total = db.query(Requirement).count()
    responded = db.query(Requirement).filter(Requirement.status.in_(["RESPONDED", "REVIEWED"])).count()
    missing = db.query(Requirement).filter(Requirement.status == "IDENTIFIED").count()
    needs_review = db.query(Requirement).filter(Requirement.status == "ANALYZED").count()
    
    compliance_score = None
    if total > 0:
        compliance_score = (responded / total) * 100
        
    return ComplianceOverview(
        compliant=responded,
        partially_compliant=0,
        missing=missing,
        needs_review=needs_review,
        compliance_score=compliance_score
    )
