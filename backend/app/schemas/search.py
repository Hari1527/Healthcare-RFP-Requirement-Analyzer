from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    query: str
    document_id: str | None = None
    category: str | None = None
    priority: str | None = None
    top_k: int = Field(default=10, ge=1, le=100)

class SearchResult(BaseModel):
    requirement_id: str
    requirement_text: str
    document_id: str
    similarity_score: float
    category: str
    priority: str
    page_number: int | None = None
    section: str | None = None
    source_text: str | None = None

class SearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    total: int
