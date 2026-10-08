from sqlalchemy.orm import Session
from app.services.embedding_service import EmbeddingService
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.models.requirement import Requirement
from app.models.document import DocumentChunk

class RetrievalService:
    def __init__(self, db: Session, embedding_service: EmbeddingService):
        self.db = db
        self.embedding_service = embedding_service

    def search(self, request: SearchRequest) -> SearchResponse:
        results = self.embedding_service.search_requirements(
            query=request.query,
            document_id=request.document_id,
            category=request.category,
            top_k=request.top_k
        )
        
        req_ids = [r["id"] for r in results]
        reqs_by_id = {
            req.id: req for req in self.db.query(Requirement).filter(Requirement.id.in_(req_ids)).all()
        } if req_ids else {}
        
        search_results = []
        for r in results:
            req_id = r["id"]
            req = reqs_by_id.get(req_id)
            if req and (not request.priority or req.priority == request.priority):
                # Cosine distance to similarity score
                similarity = max(0.0, min(1.0, 1.0 - r.get("distance", 0.0)))
                
                search_results.append(SearchResult(
                    requirement_id=req.id,
                    requirement_text=req.requirement_text,
                    document_id=req.document_id,
                    similarity_score=similarity,
                    category=req.category,
                    priority=req.priority,
                    page_number=req.page_number,
                    section=req.section,
                    source_text=None
                ))
        
        return SearchResponse(
            results=search_results,
            query=request.query,
            total=len(search_results)
        )

    def get_relevant_chunks(self, requirement_text: str, document_id: str, top_k: int = 5) -> list[dict]:
        results = self.embedding_service.search_chunks(
            query=requirement_text,
            document_id=document_id,
            top_k=top_k
        )
        return results
