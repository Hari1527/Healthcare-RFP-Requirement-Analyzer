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
        
        search_results = []
        for r in results:
            # Reconstruct from DB if needed, but metadata has what we need
            req_id = r["id"]
            
            req = self.db.query(Requirement).filter(Requirement.id == req_id).first()
            if req and (not request.priority or req.priority == request.priority):
                # Cosine distance to similarity score
                similarity = 1.0 - r["distance"]
                
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
