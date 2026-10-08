import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from app.models.document import Document
from app.models.requirement import Requirement

class DraftResponse(Base):
    __tablename__ = "draft_responses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requirement_id: Mapped[str] = mapped_column(String(36), ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False)
    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requirement: Mapped["Requirement"] = relationship("Requirement", back_populates="draft_responses")
    source_references: Mapped[list["SourceReference"]] = relationship("SourceReference", back_populates="response", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_draft_responses_requirement_id", "requirement_id"),
    )


class SourceReference(Base):
    __tablename__ = "source_references"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    response_id: Mapped[str] = mapped_column(String(36), ForeignKey("draft_responses.id", ondelete="CASCADE"), nullable=False)
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    section: Mapped[str | None] = mapped_column(String(255), nullable=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)

    response: Mapped["DraftResponse"] = relationship("DraftResponse", back_populates="source_references")
    document: Mapped["Document"] = relationship("Document")

    __table_args__ = (
        Index("ix_source_references_response_id", "response_id"),
    )
