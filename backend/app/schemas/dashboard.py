from pydantic import BaseModel

class DashboardSummary(BaseModel):
    total_documents: int
    total_requirements: int
    critical_requirements: int
    missing_requirements: int
    draft_responses: int
    compliance_score: float | None = None

class CategoryCount(BaseModel):
    category: str
    count: int

class PriorityCount(BaseModel):
    priority: str
    count: int

class ComplianceOverview(BaseModel):
    compliant: int
    partially_compliant: int
    missing: int
    needs_review: int
    compliance_score: float | None = None
