from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db.session import get_db
from app.models.document import Document
from app.models.requirement import Requirement
from app.models.response import DraftResponse
from app.schemas.dashboard import DashboardSummary, CategoryCount, PriorityCount, ComplianceOverview

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_docs = db.query(func.count(Document.id)).scalar() or 0
    total_responses = db.query(func.count(DraftResponse.id)).scalar() or 0
    
    req_stats = db.query(
        func.count(Requirement.id).label("total"),
        func.sum(case((Requirement.priority == "Critical", 1), else_=0)).label("critical"),
        func.sum(case((Requirement.status.in_(["RESPONDED", "REVIEWED"]), 1), else_=0)).label("responded"),
        func.sum(case((Requirement.status == "IDENTIFIED", 1), else_=0)).label("identified")
    ).first()
    
    total_reqs = req_stats.total or 0 if req_stats else 0
    critical_reqs = req_stats.critical or 0 if req_stats else 0
    responded = req_stats.responded or 0 if req_stats else 0
    
    if total_responses == 0:
        missing_reqs = req_stats.identified or 0 if req_stats else 0
    else:
        missing_reqs = db.query(func.count(Requirement.id)).outerjoin(
            DraftResponse, Requirement.id == DraftResponse.requirement_id
        ).filter(
            Requirement.status == "IDENTIFIED",
            DraftResponse.id == None
        ).scalar() or 0
    
    compliance_score = ((responded / total_reqs) * 100) if total_reqs > 0 else None
        
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
    stats = db.query(
        func.count(Requirement.id).label("total"),
        func.sum(case((Requirement.status.in_(["RESPONDED", "REVIEWED"]), 1), else_=0)).label("responded"),
        func.sum(case((Requirement.status == "IDENTIFIED", 1), else_=0)).label("missing"),
        func.sum(case((Requirement.status == "ANALYZED", 1), else_=0)).label("needs_review")
    ).first()
    
    total = stats.total or 0 if stats else 0
    responded = stats.responded or 0 if stats else 0
    missing = stats.missing or 0 if stats else 0
    needs_review = stats.needs_review or 0 if stats else 0
    
    compliance_score = ((responded / total) * 100) if total > 0 else None
        
    return ComplianceOverview(
        compliant=responded,
        partially_compliant=0,
        missing=missing,
        needs_review=needs_review,
        compliance_score=compliance_score
    )
