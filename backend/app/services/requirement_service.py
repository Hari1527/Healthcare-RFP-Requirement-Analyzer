import logging
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.models.requirement import Requirement
from app.services.extraction_service import ExtractionService
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService
from app.utils.exceptions import RequirementNotFoundError, DocumentNotFoundError
from app.utils.logging import logger
from app.core.config import settings
import os

class RequirementService:
    def __init__(self, db: Session):
        self.db = db

    async def analyze_document(self, document_id: str) -> None:
        try:
            document = self.db.query(Document).filter(Document.id == document_id).first()
            if not document:
                raise DocumentNotFoundError(document_id)
                
            document.processing_status = "PROCESSING"
            self.db.commit()
            
            file_path = os.path.join(settings.UPLOAD_DIR, document.filename)
            
            extracted = ExtractionService.extract_text(file_path, document.file_type)
            document.page_count = max([c.get("page_number") or 1 for c in extracted]) if extracted else 1
            
            chunks = []
            for item in extracted:
                chunk = DocumentChunk(
                    document_id=document.id,
                    page_number=item.get("page_number"),
                    section=item.get("section"),
                    text=item.get("text"),
                    chunk_index=item.get("chunk_index")
                )
                self.db.add(chunk)
                chunks.append(chunk)
            self.db.commit()
            
            embedding_service = EmbeddingService()
            embedding_service.store_chunk_embeddings(chunks)
            
            requirements = await self.extract_requirements(document.id, chunks)
            
            embedding_service.store_requirement_embeddings(requirements)
            
            document.processing_status = "COMPLETED"
            self.db.commit()
        except Exception as e:
            logger.error(f"Error analyzing document {document_id}: {str(e)}")
            if 'document' in locals():
                document.processing_status = "FAILED"
                self.db.commit()

    async def extract_requirements(self, document_id: str, chunks: list[DocumentChunk]) -> list[Requirement]:
        llm_service = LLMService()
        all_requirements = []
        for chunk in chunks:
            extracted_reqs = await llm_service.extract_requirements_from_text(chunk.text)
            for req_data in extracted_reqs:
                req = Requirement(
                    document_id=document_id,
                    requirement_text=req_data.get("requirement_text"),
                    category=req_data.get("category", "General"),
                    priority=req_data.get("priority", "Medium"),
                    requirement_type=req_data.get("requirement_type", "Mandatory"),
                    page_number=chunk.page_number,
                    section=chunk.section
                )
                self.db.add(req)
                all_requirements.append(req)
        self.db.commit()
        return all_requirements

    def get_requirements(
        self, document_id: str | None = None, category: str | None = None,
        priority: str | None = None, skip: int = 0, limit: int = 100
    ) -> tuple[list[Requirement], int]:
        query = self.db.query(Requirement)
        if document_id:
            query = query.filter(Requirement.document_id == document_id)
        if category:
            query = query.filter(Requirement.category == category)
        if priority:
            query = query.filter(Requirement.priority == priority)
            
        total = query.count()
        requirements = query.offset(skip).limit(limit).all()
        return requirements, total

    def get_requirement(self, requirement_id: str) -> Requirement:
        req = self.db.query(Requirement).filter(Requirement.id == requirement_id).first()
        if not req:
            raise RequirementNotFoundError(requirement_id)
        return req
