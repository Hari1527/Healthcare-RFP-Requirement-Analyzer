from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_date: datetime
    processing_status: str
    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    organization: str | None = None
    upload_date: datetime
    file_type: str
    file_size: int
    processing_status: str
    page_count: int | None = None
    model_config = ConfigDict(from_attributes=True)

class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int

class DocumentStatusResponse(BaseModel):
    id: str
    processing_status: str
    page_count: int | None = None
