class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class DocumentNotFoundError(AppException):
    def __init__(self, document_id: str):
        super().__init__("DOCUMENT_NOT_FOUND", f"Document not found: {document_id}", 404)

class RequirementNotFoundError(AppException):
    def __init__(self, requirement_id: str):
        super().__init__("REQUIREMENT_NOT_FOUND", f"Requirement not found: {requirement_id}", 404)

class ResponseNotFoundError(AppException):
    def __init__(self, response_id: str):
        super().__init__("RESPONSE_NOT_FOUND", f"Response not found: {response_id}", 404)

class InvalidFileTypeError(AppException):
    def __init__(self, file_type: str):
        super().__init__("INVALID_FILE_TYPE", f"Unsupported file type: {file_type}", 400)

class FileTooLargeError(AppException):
    def __init__(self, max_size: int):
        super().__init__("FILE_TOO_LARGE", f"File exceeds maximum size of {max_size // (1024*1024)}MB", 400)

class DocumentProcessingError(AppException):
    def __init__(self, message: str = "Unable to process the document."):
        super().__init__("DOCUMENT_PROCESSING_FAILED", message, 500)

class LLMServiceError(AppException):
    def __init__(self, message: str = "LLM service encountered an error."):
        super().__init__("LLM_SERVICE_ERROR", message, 503)

class EmbeddingServiceError(AppException):
    def __init__(self, message: str = "Embedding service encountered an error."):
        super().__init__("EMBEDDING_SERVICE_ERROR", message, 503)

class VectorDBError(AppException):
    def __init__(self, message: str = "Vector database error."):
        super().__init__("VECTOR_DB_ERROR", message, 503)
