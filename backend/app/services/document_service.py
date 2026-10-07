import os
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.config import settings
from app.core.security import validate_file_type, validate_file_size, generate_unique_filename
from app.utils.exceptions import DocumentNotFoundError, InvalidFileTypeError, FileTooLargeError

class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    async def upload_document(self, file: UploadFile, organization: str | None = None) -> Document:
        file_content = await file.read()
        file_size = len(file_content)
        
        if not validate_file_size(file_size):
            raise FileTooLargeError(settings.MAX_FILE_SIZE)
            
        if not validate_file_type(file.filename or "", file.content_type or ""):
            raise InvalidFileTypeError(file.content_type or "unknown")

        filename = generate_unique_filename(file.filename or "uploaded_file")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(file_content)

        document = Document(
            filename=filename,
            original_filename=file.filename or "uploaded_file",
            organization=organization,
            file_type=file.content_type or "unknown",
            file_size=file_size,
            processing_status="UPLOADED"
        )
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_document(self, document_id: str) -> Document:
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise DocumentNotFoundError(document_id)
        return document

    def get_documents(self, skip: int = 0, limit: int = 100) -> tuple[list[Document], int]:
        total = self.db.query(Document).count()
        documents = self.db.query(Document).offset(skip).limit(limit).all()
        return documents, total

    def delete_document(self, document_id: str) -> None:
        document = self.get_document(document_id)
        
        file_path = os.path.join(settings.UPLOAD_DIR, document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
        from app.services.embedding_service import EmbeddingService
        embedding_service = EmbeddingService()
        embedding_service.delete_document_embeddings(document_id)

        self.db.delete(document)
        self.db.commit()

    def get_document_status(self, document_id: str) -> dict:
        document = self.get_document(document_id)
        return {
            "id": document.id,
            "processing_status": document.processing_status,
            "page_count": document.page_count
        }

    def update_status(self, document_id: str, status: str, page_count: int | None = None) -> None:
        document = self.get_document(document_id)
        document.processing_status = status
        if page_count is not None:
            document.page_count = page_count
        self.db.commit()
