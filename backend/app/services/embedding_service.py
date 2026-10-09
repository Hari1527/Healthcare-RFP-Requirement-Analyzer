import os
import functools
# Ensure SentenceTransformers operates in high-speed offline mode using local cache
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from app.core.config import settings
from app.models.document import DocumentChunk
from app.models.requirement import Requirement
from app.utils.logging import logger
from app.utils.exceptions import EmbeddingServiceError, VectorDBError

class EmbeddingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._client = None
            cls._instance._chunks_collection = None
            cls._instance._requirements_collection = None
        return cls._instance

    @property
    def model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                try:
                    self._model = SentenceTransformer(settings.EMBEDDING_MODEL, local_files_only=True)
                except Exception:
                    self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                raise EmbeddingServiceError("Failed to load embedding model")
        return self._model

    @property
    def client(self):
        if self._client is None:
            try:
                import chromadb
                os.makedirs(os.path.dirname(settings.VECTOR_DB_PATH) or '.', exist_ok=True)
                self._client = chromadb.PersistentClient(path=settings.VECTOR_DB_PATH)
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                raise VectorDBError("Failed to initialize ChromaDB")
        return self._client

    @property
    def chunks_collection(self):
        if self._chunks_collection is None:
            self._chunks_collection = self.client.get_or_create_collection("document_chunks", metadata={"hnsw:space": "cosine"})
        return self._chunks_collection

    @property
    def requirements_collection(self):
        if self._requirements_collection is None:
            self._requirements_collection = self.client.get_or_create_collection("requirements", metadata={"hnsw:space": "cosine"})
        return self._requirements_collection

    @functools.lru_cache(maxsize=1024)
    def _encode_cached(self, text: str) -> tuple[float, ...]:
        return tuple(self.model.encode(text, normalize_embeddings=True).tolist())

    def generate_embedding(self, text: str) -> list[float]:
        try:
            return list(self._encode_cached(text))
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise EmbeddingServiceError("Error generating embedding")

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        try:
            return self.model.encode(texts, batch_size=32, show_progress_bar=False, normalize_embeddings=True).tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise EmbeddingServiceError("Error generating embeddings")

    def store_chunk_embeddings(self, chunks: list[DocumentChunk]) -> None:
        if not chunks:
            return
        try:
            texts = [c.text for c in chunks]
            embeddings = self.generate_embeddings(texts)
            ids = [str(c.id) for c in chunks]
            metadatas = [
                {"document_id": str(c.document_id), "page_number": c.page_number or -1, "section": c.section or ""}
                for c in chunks
            ]
            self.chunks_collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)
        except Exception as e:
            logger.error(f"Error storing chunk embeddings: {e}")
            raise VectorDBError("Error storing chunk embeddings")

    def store_requirement_embeddings(self, requirements: list[Requirement]) -> None:
        if not requirements:
            return
        try:
            texts = [r.requirement_text for r in requirements]
            embeddings = self.generate_embeddings(texts)
            ids = [str(r.id) for r in requirements]
            metadatas = [
                {
                    "document_id": str(r.document_id),
                    "category": r.category or "General",
                    "priority": r.priority or "Medium",
                    "page_number": r.page_number or -1,
                    "section": r.section or ""
                }
                for r in requirements
            ]
            self.requirements_collection.add(ids=ids, embeddings=embeddings, documents=texts, metadatas=metadatas)
        except Exception as e:
            logger.error(f"Error storing requirement embeddings: {e}")
            raise VectorDBError("Error storing requirement embeddings")

    def search_chunks(self, query: str, document_id: str | None = None, top_k: int = 10) -> list[dict]:
        try:
            query_emb = self.generate_embedding(query)
            where = {"document_id": document_id} if document_id else None
            results = self.chunks_collection.query(query_embeddings=[query_emb], n_results=top_k, where=where)
            
            out = []
            if results and results["ids"] and len(results["ids"]) > 0:
                for i in range(len(results["ids"][0])):
                    out.append({
                        "id": results["ids"][0][i],
                        "text": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i] if results["distances"] else 0.0
                    })
            return out
        except Exception as e:
            logger.error(f"Error searching chunks: {e}")
            raise VectorDBError("Error searching chunks")

    def search_requirements(self, query: str, document_id: str | None = None, category: str | None = None, top_k: int = 10) -> list[dict]:
        try:
            query_emb = self.generate_embedding(query)
            where = {}
            if document_id:
                where["document_id"] = document_id
            if category:
                where["category"] = category
                
            # chroma syntax for multiple conditions might need `$and` if multiple, but we simplify for now
            if document_id and category:
                where = {"$and": [{"document_id": document_id}, {"category": category}]}
            elif not where:
                where = None
                
            results = self.requirements_collection.query(query_embeddings=[query_emb], n_results=top_k, where=where)
            
            out = []
            if results and results["ids"] and len(results["ids"]) > 0:
                for i in range(len(results["ids"][0])):
                    out.append({
                        "id": results["ids"][0][i],
                        "text": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i] if results["distances"] else 0.0
                    })
            return out
        except Exception as e:
            logger.error(f"Error searching requirements: {e}")
            raise VectorDBError("Error searching requirements")

    def delete_document_embeddings(self, document_id: str) -> None:
        try:
            where = {"document_id": document_id}
            self.chunks_collection.delete(where=where)
            self.requirements_collection.delete(where=where)
        except Exception as e:
            logger.error(f"Error deleting embeddings for document {document_id}: {e}")
            # Do not raise, just log
