from datetime import datetime
from pydantic import BaseModel, ConfigDict

class GenerateResponseRequest(BaseModel):
    requirement_id: str

class SourceReferenceResponse(BaseModel):
    document_id: str
    document_name: str
    page: int | None = None
    section: str | None = None
    excerpt: str | None = None

class DraftResponseOut(BaseModel):
    id: str
    requirement_id: str
    requirement_text: str
    draft_response: str
    sources: list[SourceReferenceResponse]
    created_at: datetime
    updated_at: datetime

class DraftResponseListResponse(BaseModel):
    responses: list[DraftResponseOut]
    total: int

class UpdateResponseRequest(BaseModel):
    response_text: str
