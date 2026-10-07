import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from app.services.requirement_service import RequirementService
from app.utils.exceptions import RequirementNotFoundError
from app.models.document import Document
from app.models.requirement import Requirement

@pytest.fixture
def requirement_service(test_db):
    return RequirementService(db=test_db)

def test_get_requirements_empty(requirement_service):
    reqs, total = requirement_service.get_requirements()
    assert reqs == []
    assert total == 0

def test_get_requirement_not_found(requirement_service):
    with pytest.raises(RequirementNotFoundError):
        requirement_service.get_requirement("nonexistent-id")

def test_get_requirements_with_filters(requirement_service, test_db):
    doc = Document(filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()
    test_db.refresh(doc)
    
    req1 = Requirement(document_id=doc.id, requirement_text="Req 1", category="Technical", priority="High")
    req2 = Requirement(document_id=doc.id, requirement_text="Req 2", category="Clinical", priority="Low")
    test_db.add_all([req1, req2])
    test_db.commit()

    reqs, total = requirement_service.get_requirements(category="Technical")
    assert total == 1
    assert reqs[0].category == "Technical"

    reqs, total = requirement_service.get_requirements(priority="Low")
    assert total == 1
    assert reqs[0].priority == "Low"

@pytest.mark.asyncio
@patch("app.services.requirement_service.LLMService")
async def test_extract_requirements_mocked(mock_llm_cls, requirement_service, test_db):
    mock_instance = AsyncMock()
    mock_instance.extract_requirements_from_text = AsyncMock(return_value=[
        {
            "requirement_text": "The system must be secure.",
            "category": "Security",
            "priority": "High",
            "requirement_type": "Mandatory",
            "page_number": 1,
            "section": "1.0"
        }
    ])
    mock_llm_cls.return_value = mock_instance
    
    doc = Document(filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()
    test_db.refresh(doc)

    chunks = [MagicMock(text="Chunk text", page_number=1, section="1.0")]
    
    reqs = await requirement_service.extract_requirements(doc.id, chunks)
    
    assert len(reqs) == 1
    assert reqs[0].requirement_text == "The system must be secure."
    assert reqs[0].category == "Security"
