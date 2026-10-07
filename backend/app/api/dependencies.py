from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService

_embedding_service: EmbeddingService | None = None
_llm_service: LLMService | None = None

def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service

def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
