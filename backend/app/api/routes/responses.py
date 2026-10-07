from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.api.dependencies import get_embedding_service, get_llm_service
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService
from app.services.requirement_service import RequirementService
from app.services.retrieval_service import RetrievalService
from app.schemas.response import GenerateResponseRequest, DraftResponseOut, DraftResponseListResponse, UpdateResponseRequest, SourceReferenceResponse
from app.models.response import DraftResponse, SourceReference
from app.utils.exceptions import RequirementNotFoundError, ResponseNotFoundError

router = APIRouter(prefix="/api/responses", tags=["Responses"])

@router.post("/generate", response_model=DraftResponseOut)
async def generate_response(
    request: GenerateResponseRequest,
    db: Session = Depends(get_db),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    llm_service: LLMService = Depends(get_llm_service)
):
    req_service = RequirementService(db)
    requirement = req_service.get_requirement(request.requirement_id)
    
    retrieval_service = RetrievalService(db, embedding_service)
    chunks = retrieval_service.get_relevant_chunks(
        requirement_text=requirement.requirement_text,
        document_id=requirement.document_id,
        top_k=5
    )
    
    draft_dict = await llm_service.generate_draft_response(
        requirement_text=requirement.requirement_text,
        context_chunks=chunks
    )
    
    draft = DraftResponse(
        requirement_id=requirement.id,
        response_text=draft_dict["response_text"]
    )
    db.add(draft)
    db.flush()
    
    for src in draft_dict.get("sources", []):
        ref = SourceReference(
            response_id=draft.id,
            document_id=requirement.document_id,
            page_number=src.get("page_number"),
            section=src.get("section"),
            excerpt=src.get("excerpt")
        )
        db.add(ref)
    
    requirement.status = "RESPONDED"
    db.commit()
    db.refresh(draft)
    
    return DraftResponseOut(
        id=draft.id,
        requirement_id=draft.requirement_id,
        requirement_text=requirement.requirement_text,
        draft_response=draft.response_text,
        sources=[
            SourceReferenceResponse(
                document_id=s.document_id,
                document_name=s.document.filename if s.document else "",
                page=s.page_number,
                section=s.section,
                excerpt=s.excerpt
            ) for s in draft.source_references
        ],
        created_at=draft.created_at,
        updated_at=draft.updated_at
    )

@router.get("/", response_model=DraftResponseListResponse)
def list_responses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    responses = db.query(DraftResponse).offset(skip).limit(limit).all()
    total = db.query(DraftResponse).count()
    
    out_list = []
    for r in responses:
        out_list.append(DraftResponseOut(
            id=r.id,
            requirement_id=r.requirement_id,
            requirement_text=r.requirement.requirement_text if r.requirement else "",
            draft_response=r.response_text,
            sources=[
                SourceReferenceResponse(
                    document_id=s.document_id,
                    document_name=s.document.filename if s.document else "",
                    page=s.page_number,
                    section=s.section,
                    excerpt=s.excerpt
                ) for s in r.source_references
            ],
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return DraftResponseListResponse(responses=out_list, total=total)

@router.get("/{response_id}", response_model=DraftResponseOut)
def get_response(response_id: str, db: Session = Depends(get_db)):
    r = db.query(DraftResponse).filter(DraftResponse.id == response_id).first()
    if not r:
        raise ResponseNotFoundError(response_id)
        
    return DraftResponseOut(
        id=r.id,
        requirement_id=r.requirement_id,
        requirement_text=r.requirement.requirement_text if r.requirement else "",
        draft_response=r.response_text,
        sources=[
            SourceReferenceResponse(
                document_id=s.document_id,
                document_name=s.document.filename if s.document else "",
                page=s.page_number,
                section=s.section,
                excerpt=s.excerpt
            ) for s in r.source_references
        ],
        created_at=r.created_at,
        updated_at=r.updated_at
    )

@router.put("/{response_id}", response_model=DraftResponseOut)
def update_response(response_id: str, request: UpdateResponseRequest, db: Session = Depends(get_db)):
    r = db.query(DraftResponse).filter(DraftResponse.id == response_id).first()
    if not r:
        raise ResponseNotFoundError(response_id)
    r.response_text = request.response_text
    r.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(r)
    
    return DraftResponseOut(
        id=r.id,
        requirement_id=r.requirement_id,
        requirement_text=r.requirement.requirement_text if r.requirement else "",
        draft_response=r.response_text,
        sources=[
            SourceReferenceResponse(
                document_id=s.document_id,
                document_name=s.document.filename if s.document else "",
                page=s.page_number,
                section=s.section,
                excerpt=s.excerpt
            ) for s in r.source_references
        ],
        created_at=r.created_at,
        updated_at=r.updated_at
    )
