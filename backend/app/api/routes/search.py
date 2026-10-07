from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_embedding_service
from app.services.embedding_service import EmbeddingService
from app.services.retrieval_service import RetrievalService
from app.schemas.search import SearchRequest, SearchResponse

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.post("/", response_model=SearchResponse)
def search_requirements(
    request: SearchRequest,
    db: Session = Depends(get_db),
    embedding_service: EmbeddingService = Depends(get_embedding_service)
):
    service = RetrievalService(db, embedding_service)
    return service.search(request)
