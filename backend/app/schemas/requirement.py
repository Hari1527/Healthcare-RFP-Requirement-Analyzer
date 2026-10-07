from pydantic import BaseModel, ConfigDict

class RequirementResponse(BaseModel):
    id: str
    document_id: str
    requirement_text: str
    category: str
    priority: str
    requirement_type: str
    page_number: int | None = None
    section: str | None = None
    status: str
    model_config = ConfigDict(from_attributes=True)

class RequirementListResponse(BaseModel):
    requirements: list[RequirementResponse]
    total: int

class ExtractedRequirement(BaseModel):
    """Schema for LLM-extracted requirement before DB storage."""
    requirement_text: str
    category: str = "General"
    priority: str = "Medium"
    requirement_type: str = "Mandatory"
    page_number: int | None = None
    section: str | None = None
