from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.requirement_service import RequirementService
from app.schemas.requirement import RequirementResponse, RequirementListResponse

router = APIRouter(prefix="/api/requirements", tags=["Requirements"])

@router.get("/", response_model=RequirementListResponse)
def list_requirements(
    document_id: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = RequirementService(db)
    reqs, total = service.get_requirements(
        document_id=document_id, 
        category=category, 
        priority=priority, 
        skip=skip, 
        limit=limit
    )
    return RequirementListResponse(
        requirements=[RequirementResponse.model_validate(r) for r in reqs],
        total=total
    )

@router.get("/{requirement_id}", response_model=RequirementResponse)
def get_requirement(requirement_id: str, db: Session = Depends(get_db)):
    service = RequirementService(db)
    req = service.get_requirement(requirement_id)
    return RequirementResponse.model_validate(req)
