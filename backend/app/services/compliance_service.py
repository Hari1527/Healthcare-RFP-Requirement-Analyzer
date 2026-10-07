from sqlalchemy.orm import Session
from app.models.requirement import Requirement
from app.schemas.compliance import ComplianceReport, ComplianceItem, MissingRequirement, MissingRequirementsResponse
from app.core.config import settings
from sqlalchemy.orm import joinedload

class ComplianceService:
    def __init__(self, db: Session):
        self.db = db

    def analyze_compliance(self, document_id: str) -> ComplianceReport:
        requirements = self.db.query(Requirement).options(
            joinedload(Requirement.draft_responses).joinedload("source_references")
        ).filter(Requirement.document_id == document_id).all()
        
        items = []
        counts = {"Compliant": 0, "Partially Compliant": 0, "Missing": 0, "Needs Review": 0}
        
        for req in requirements:
            status, evidence, reason, recommended_action = self._determine_compliance_status(req)
            counts[status] += 1
            
            source = None
            if evidence and req.draft_responses:
                refs = req.draft_responses[0].source_references
                if refs:
                    source = f"Doc: {refs[0].document_id} Page: {refs[0].page_number}"
                    
            items.append(ComplianceItem(
                requirement_id=req.id,
                requirement_text=req.requirement_text,
                category=req.category,
                priority=req.priority,
                status=status,
                evidence=evidence,
                reason=reason,
                source=source,
                recommended_action=recommended_action
            ))
            
        score = self.calculate_compliance_score(items)
        
        return ComplianceReport(
            document_id=document_id,
            compliance_score=score,
            total_requirements=len(requirements),
            compliant=counts["Compliant"],
            partially_compliant=counts["Partially Compliant"],
            missing=counts["Missing"],
            needs_review=counts["Needs Review"],
            items=items,
            scoring_methodology="Critical=4, High=3, Medium=2, Low=1. Score = sum(weight * is_compliant) / sum(weight) * 100."
        )

    def get_missing_requirements(self, document_id: str | None = None) -> MissingRequirementsResponse:
        query = self.db.query(Requirement).options(joinedload(Requirement.draft_responses))
        if document_id:
            query = query.filter(Requirement.document_id == document_id)
            
        requirements = query.all()
        missing = []
        for req in requirements:
            status, _, reason, recommended_action = self._determine_compliance_status(req)
            if status in ["Missing", "Partially Compliant", "Needs Review"]:
                missing.append(MissingRequirement(
                    requirement_id=req.id,
                    requirement_text=req.requirement_text,
                    category=req.category,
                    priority=req.priority,
                    status=status,
                    reason=reason,
                    recommended_action=recommended_action
                ))
                
        return MissingRequirementsResponse(
            requirements=missing,
            total=len(missing)
        )

    def calculate_compliance_score(self, items: list[ComplianceItem]) -> float:
        if not items:
            return 0.0
            
        weights = {
            "Critical": settings.WEIGHT_CRITICAL,
            "High": settings.WEIGHT_HIGH,
            "Medium": settings.WEIGHT_MEDIUM,
            "Low": settings.WEIGHT_LOW
        }
        
        total_weight = 0.0
        earned_weight = 0.0
        
        for item in items:
            w = weights.get(item.priority, settings.WEIGHT_MEDIUM)
            total_weight += w
            if item.status == "Compliant":
                earned_weight += w
            elif item.status == "Partially Compliant":
                earned_weight += w * 0.5
                
        if total_weight == 0:
            return 0.0
            
        return round((earned_weight / total_weight) * 100, 2)

    def _determine_compliance_status(self, requirement: Requirement) -> tuple[str, str | None, str, str]:
        responses = requirement.draft_responses
        if not responses:
            return "Missing", None, "No response has been drafted for this requirement.", "Draft a response for this requirement."
            
        # Check first response for simplicity
        response = responses[0]
        
        if not response.source_references:
            return "Partially Compliant", response.response_text, "Response drafted but lacks source evidence.", "Link evidence to the drafted response."
            
        # Simplistic logic: if we have response and sources, we are compliant
        # You can add logic for 'Needs Review' if response text contains uncertainty
        if "evidence not found" in response.response_text.lower():
            return "Needs Review", response.response_text, "Response indicates missing information in sources.", "Review manual source documents to provide evidence."
            
        return "Compliant", response.response_text, "Response is complete with cited sources.", "None"
