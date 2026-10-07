import pytest
from app.services.extraction_service import ExtractionService


def test_clean_text():
    raw_text = "Hello\x00World\n\n\n\nTest"
    cleaned = ExtractionService.clean_text(raw_text)
    # Should remove control chars and collapse excessive newlines
    assert "\x00" not in cleaned
    assert "\n\n\n" not in cleaned
    assert "Hello" in cleaned
    assert "World" in cleaned


def test_clean_text_whitespace():
    raw_text = "  Some   text   with   spaces  "
    cleaned = ExtractionService.clean_text(raw_text)
    assert cleaned == "Some   text   with   spaces"


def test_chunk_text_basic():
    words = ["word"] * 2000
    text = " ".join(words)
    chunks = ExtractionService.chunk_text(text, chunk_size=1000, overlap=200)
    assert len(chunks) >= 2
    # Each chunk should have content
    for chunk in chunks:
        assert len(chunk) > 0


def test_chunk_text_small_input():
    text = "Just a few words here"
    chunks = ExtractionService.chunk_text(text, chunk_size=1000, overlap=200)
    assert len(chunks) == 1
    assert chunks[0] == text


def test_chunk_text_overlap():
    words = [f"w{i}" for i in range(100)]
    text = " ".join(words)
    chunks = ExtractionService.chunk_text(text, chunk_size=30, overlap=10)
    assert len(chunks) > 1
    # Verify overlap exists — last words of chunk N appear in chunk N+1
    chunk0_words = chunks[0].split()
    chunk1_words = chunks[1].split()
    overlap_words = set(chunk0_words) & set(chunk1_words)
    assert len(overlap_words) > 0


def test_extract_txt(sample_txt_file):
    extracted = ExtractionService.extract_txt(sample_txt_file)
    assert len(extracted) > 0
    assert "Sample requirement text for testing." in extracted[0]["text"]
    assert extracted[0]["page_number"] is None
    assert extracted[0]["chunk_index"] == 0


def test_extract_text_unsupported_type():
    # For unsupported file types, extract_text returns empty list
    result = ExtractionService.extract_text("dummy.exe", "application/x-msdownload")
    assert result == []


def test_extract_text_delegates_to_txt(sample_txt_file):
    result = ExtractionService.extract_text(sample_txt_file, "text/plain")
    assert len(result) > 0
    assert "Sample requirement text" in result[0]["text"]
