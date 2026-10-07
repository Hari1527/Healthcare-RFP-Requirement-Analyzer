from pydantic import BaseModel

class ComplianceItem(BaseModel):
    requirement_id: str
    requirement_text: str
    category: str
    priority: str
    status: str  # Compliant, Partially Compliant, Missing, Needs Review
    evidence: str | None = None
    reason: str
    source: str | None = None
    recommended_action: str

class ComplianceReport(BaseModel):
    document_id: str
    compliance_score: float
    total_requirements: int
    compliant: int
    partially_compliant: int
    missing: int
    needs_review: int
    items: list[ComplianceItem]
    scoring_methodology: str

class MissingRequirement(BaseModel):
    requirement_id: str
    requirement_text: str
    category: str
    priority: str
    status: str
    reason: str
    recommended_action: str

class MissingRequirementsResponse(BaseModel):
    requirements: list[MissingRequirement]
    total: int
