import pytest
from unittest.mock import MagicMock, patch
from fastapi import UploadFile
import io
from app.services.document_service import DocumentService
from app.utils.exceptions import DocumentNotFoundError, InvalidFileTypeError, FileTooLargeError

@pytest.fixture
def document_service(test_db):
    return DocumentService(db=test_db)

@pytest.mark.asyncio
async def test_upload_valid_pdf(document_service, test_db):
    file_content = b"%PDF-1.4\n%EOF\n"
    upload_file = UploadFile(filename="test.pdf", file=io.BytesIO(file_content))
    upload_file.content_type = "application/pdf"
    
    with patch("app.core.security.validate_file_size", return_value=True), \
         patch("app.core.security.validate_file_type", return_value=True), \
         patch("app.core.security.generate_unique_filename", return_value="uuid_test.pdf"), \
         patch("builtins.open", MagicMock()):
        
        doc = await document_service.upload_document(file=upload_file, organization="Test Org")
        assert doc.original_filename == "test.pdf"
        assert doc.file_type == "application/pdf"
        assert doc.processing_status == "UPLOADED"
        assert doc.organization == "Test Org"

@pytest.mark.asyncio
async def test_upload_invalid_file_type(document_service):
    file_content = b"Not a PDF"
    upload_file = UploadFile(filename="test.exe", file=io.BytesIO(file_content))
    upload_file.content_type = "application/x-msdownload"
    
    with pytest.raises(InvalidFileTypeError):
        await document_service.upload_document(file=upload_file)

@pytest.mark.asyncio
async def test_upload_file_too_large(document_service):
    # Simulate a file larger than MAX_FILE_SIZE
    upload_file = UploadFile(filename="huge.pdf", file=io.BytesIO(b""))
    upload_file.content_type = "application/pdf"
    
    with patch("fastapi.UploadFile.read", return_value=b"A" * 60_000_000): # 60MB mock read
        with pytest.raises(FileTooLargeError):
            await document_service.upload_document(file=upload_file)

def test_get_document_not_found(document_service):
    with pytest.raises(DocumentNotFoundError):
        document_service.get_document("nonexistent-id")

@pytest.mark.asyncio
async def test_get_documents_empty(document_service):
    docs, total = document_service.get_documents()
    assert docs == []
    assert total == 0

@pytest.mark.asyncio
async def test_delete_document(document_service):
    # First, mock a document creation
    file_content = b"PDF"
    upload_file = UploadFile(filename="delete_me.pdf", file=io.BytesIO(file_content))
    upload_file.content_type = "application/pdf"
    
    with patch("app.core.security.validate_file_size", return_value=True), \
         patch("app.core.security.validate_file_type", return_value=True), \
         patch("app.core.security.generate_unique_filename", return_value="uuid_delete_me.pdf"), \
         patch("builtins.open", MagicMock()):
        
        doc = await document_service.upload_document(file=upload_file)
        doc_id = doc.id
    
    with patch("os.path.exists", return_value=False), \
         patch("app.services.document_service.EmbeddingService") as mock_emb:
        mock_emb.return_value = MagicMock()
        document_service.delete_document(doc_id)
        
        with pytest.raises(DocumentNotFoundError):
            document_service.get_document(doc_id)

@pytest.mark.asyncio
async def test_update_status(document_service):
    file_content = b"PDF"
    upload_file = UploadFile(filename="status_test.pdf", file=io.BytesIO(file_content))
    upload_file.content_type = "application/pdf"
    
    with patch("app.core.security.validate_file_size", return_value=True), \
         patch("app.core.security.validate_file_type", return_value=True), \
         patch("app.core.security.generate_unique_filename", return_value="uuid_status_test.pdf"), \
         patch("builtins.open", MagicMock()):
        
        doc = await document_service.upload_document(file=upload_file)
        doc_id = doc.id
        
        document_service.update_status(doc_id, "COMPLETED", page_count=10)
        
        updated_doc = document_service.get_document(doc_id)
        assert updated_doc.processing_status == "COMPLETED"
        assert updated_doc.page_count == 10
