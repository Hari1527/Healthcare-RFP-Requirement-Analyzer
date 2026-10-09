"""
Document text extraction service.

Handles extraction from PDF (PyMuPDF), DOCX (python-docx), and TXT files.
Includes text cleaning and chunking for embedding generation.
"""

import re
try:
    import pymupdf as fitz  # Modern PyMuPDF API
except ImportError:
    import fitz  # Fallback for older PyMuPDF versions
import docx
from app.utils.logging import logger


class ExtractionService:
    """Service for extracting and chunking text from uploaded documents."""

    @staticmethod
    def extract_text(file_path: str, file_type: str) -> list[dict]:
        """
        Extract text from a document based on its file type.
        
        Returns list of dicts with keys: page_number, section, text, chunk_index
        """
        if "pdf" in file_type.lower() or file_path.lower().endswith(".pdf"):
            return ExtractionService.extract_pdf(file_path)
        elif "wordprocessingml" in file_type.lower() or file_path.lower().endswith(".docx"):
            return ExtractionService.extract_docx(file_path)
        elif "text" in file_type.lower() or file_path.lower().endswith(".txt"):
            return ExtractionService.extract_txt(file_path)
        else:
            logger.warning(f"Unsupported file type for extraction: {file_type}")
            return []

    @staticmethod
    def extract_pdf(file_path: str) -> list[dict]:
        """Extract text from PDF using PyMuPDF, preserving page-level information."""
        chunks: list[dict] = []
        try:
            doc = fitz.open(file_path)
            chunk_index = 0
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                if not text.strip():
                    continue

                # Detect section headings: short lines that are uppercase or title-case
                current_section = None
                lines = text.split("\n")
                for line in lines:
                    line_clean = line.strip()
                    if (
                        line_clean
                        and len(line_clean) < 80
                        and (line_clean.isupper() or re.match(r'^\d+[\.\)]\s+\S', line_clean))
                    ):
                        current_section = line_clean

                cleaned_text = ExtractionService.clean_text(text)
                if cleaned_text:
                    sub_chunks = ExtractionService.chunk_text(cleaned_text)
                    for sub in sub_chunks:
                        chunks.append({
                            "page_number": page_num + 1,
                            "section": current_section,
                            "text": sub,
                            "chunk_index": chunk_index
                        })
                        chunk_index += 1
            doc.close()
            logger.info(f"PDF extraction complete: {len(chunks)} chunks from {file_path}")
        except Exception as e:
            logger.error(f"Error extracting PDF {file_path}: {e}")
        return chunks

    @staticmethod
    def extract_docx(file_path: str) -> list[dict]:
        """Extract text from DOCX using python-docx, detecting heading styles as sections."""
        chunks: list[dict] = []
        try:
            document = docx.Document(file_path)
            chunk_index = 0
            current_section: str | None = None
            current_text: list[str] = []

            for para in document.paragraphs:
                if para.style and para.style.name and para.style.name.startswith("Heading"):
                    # Flush accumulated text as chunks
                    if current_text:
                        cleaned = ExtractionService.clean_text("\n".join(current_text))
                        if cleaned:
                            sub_chunks = ExtractionService.chunk_text(cleaned)
                            for sub in sub_chunks:
                                chunks.append({
                                    "page_number": None,
                                    "section": current_section,
                                    "text": sub,
                                    "chunk_index": chunk_index
                                })
                                chunk_index += 1
                        current_text = []
                    current_section = para.text.strip()
                elif para.text.strip():
                    current_text.append(para.text)

            # Flush remaining text
            if current_text:
                cleaned = ExtractionService.clean_text("\n".join(current_text))
                if cleaned:
                    sub_chunks = ExtractionService.chunk_text(cleaned)
                    for sub in sub_chunks:
                        chunks.append({
                            "page_number": None,
                            "section": current_section,
                            "text": sub,
                            "chunk_index": chunk_index
                        })
                        chunk_index += 1

            logger.info(f"DOCX extraction complete: {len(chunks)} chunks from {file_path}")
        except Exception as e:
            logger.error(f"Error extracting DOCX {file_path}: {e}")
        return chunks

    @staticmethod
    def extract_txt(file_path: str) -> list[dict]:
        """Extract text from plain text file."""
        chunks: list[dict] = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
            cleaned = ExtractionService.clean_text(text)
            if cleaned:
                sub_chunks = ExtractionService.chunk_text(cleaned)
                for i, sub in enumerate(sub_chunks):
                    chunks.append({
                        "page_number": None,
                        "section": None,
                        "text": sub,
                        "chunk_index": i
                    })
            logger.info(f"TXT extraction complete: {len(chunks)} chunks from {file_path}")
        except Exception as e:
            logger.error(f"Error extracting TXT {file_path}: {e}")
        return chunks

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text: remove control characters, normalize whitespace."""
        # Remove control characters (keep newlines and tabs)
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        # Collapse excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Strip leading/trailing whitespace
        return text.strip()

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
        """
        Split text into overlapping chunks by word count.
        
        Args:
            text: Input text to chunk
            chunk_size: Target number of words per chunk
            overlap: Number of overlapping words between consecutive chunks
        
        Returns:
            List of text chunks
        """
        words = text.split()
        if not words:
            return []
        
        chunks: list[str] = []
        start = 0
        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            if end >= len(words):
                break
            start += chunk_size - overlap
        
        return chunks
