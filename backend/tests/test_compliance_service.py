import pytest
from app.services.compliance_service import ComplianceService
from app.schemas.compliance import ComplianceItem


class TestComplianceScoring:
    """Test compliance score calculation as a standalone function."""

    def _make_service(self, test_db):
        return ComplianceService(test_db)

    def test_calculate_compliance_score_all_compliant(self, test_db):
        service = self._make_service(test_db)
        items = [
            ComplianceItem(requirement_id="1", requirement_text="Req1", category="General", priority="High", status="Compliant", reason="OK", recommended_action="None"),
            ComplianceItem(requirement_id="2", requirement_text="Req2", category="General", priority="Medium", status="Compliant", reason="OK", recommended_action="None"),
        ]
        score = service.calculate_compliance_score(items)
        assert score == 100.0

    def test_calculate_compliance_score_none_compliant(self, test_db):
        service = self._make_service(test_db)
        items = [
            ComplianceItem(requirement_id="1", requirement_text="Req1", category="General", priority="High", status="Missing", reason="No response", recommended_action="Draft"),
            ComplianceItem(requirement_id="2", requirement_text="Req2", category="General", priority="Medium", status="Missing", reason="No response", recommended_action="Draft"),
        ]
        score = service.calculate_compliance_score(items)
        assert score == 0.0

    def test_calculate_compliance_score_mixed(self, test_db):
        service = self._make_service(test_db)
        items = [
            ComplianceItem(requirement_id="1", requirement_text="Req1", category="General", priority="Medium", status="Compliant", reason="OK", recommended_action="None"),
            ComplianceItem(requirement_id="2", requirement_text="Req2", category="General", priority="Medium", status="Partially Compliant", reason="Partial", recommended_action="Add sources"),
            ComplianceItem(requirement_id="3", requirement_text="Req3", category="General", priority="Medium", status="Missing", reason="No response", recommended_action="Draft"),
        ]
        # Total weight = 3 * 2.0 = 6.0. Earned = 2.0 + 1.0 + 0 = 3.0. Score = (3/6)*100 = 50.0
        score = service.calculate_compliance_score(items)
        assert score == 50.0

    def test_calculate_compliance_score_weighted(self, test_db):
        service = self._make_service(test_db)
        items = [
            ComplianceItem(requirement_id="1", requirement_text="Req1", category="General", priority="Critical", status="Compliant", reason="OK", recommended_action="None"),
            ComplianceItem(requirement_id="2", requirement_text="Req2", category="General", priority="Low", status="Missing", reason="No response", recommended_action="Draft"),
        ]
        # Total weight = 4.0 + 1.0 = 5.0. Earned = 4.0. Score = (4/5)*100 = 80.0
        score = service.calculate_compliance_score(items)
        assert score == 80.0

    def test_calculate_compliance_score_empty(self, test_db):
        service = self._make_service(test_db)
        score = service.calculate_compliance_score([])
        assert score == 0.0


class TestComplianceAnalysis:
    """Test compliance analysis with DB fixtures."""

    def test_analyze_compliance_empty_document(self, test_db):
        service = ComplianceService(test_db)
        report = service.analyze_compliance("nonexistent-doc")
        assert report.total_requirements == 0
        assert report.compliance_score == 0.0
        assert report.compliant == 0

    def test_get_missing_requirements_empty(self, test_db):
        service = ComplianceService(test_db)
        result = service.get_missing_requirements()
        assert result.total == 0
        assert result.requirements == []

    def test_get_missing_requirements_with_data(self, test_db):
        from app.models.document import Document
        from app.models.requirement import Requirement

        doc = Document(id="doc-comp-1", filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
        test_db.add(doc)
        test_db.flush()

        req1 = Requirement(id="req-comp-1", document_id="doc-comp-1", requirement_text="Must have encryption", category="Security", priority="Critical", requirement_type="Mandatory")
        req2 = Requirement(id="req-comp-2", document_id="doc-comp-1", requirement_text="Should provide reports", category="Operational", priority="Medium", requirement_type="Optional")
        test_db.add_all([req1, req2])
        test_db.commit()

        service = ComplianceService(test_db)
        result = service.get_missing_requirements(document_id="doc-comp-1")
        # Both requirements have no draft responses, so both should be "Missing"
        assert result.total == 2
        assert all(r.status == "Missing" for r in result.requirements)
