import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
from app.models.document import Document

class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    requirement_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="General")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Medium")
    requirement_type: Mapped[str] = mapped_column(String(20), nullable=False, default="Mandatory")
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    section: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="IDENTIFIED")
    embedding_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="requirements")
    draft_responses: Mapped[list["DraftResponse"]] = relationship("DraftResponse", back_populates="requirement", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_requirements_document_id", "document_id"),
        Index("ix_requirements_category", "category"),
        Index("ix_requirements_priority", "priority"),
        Index("ix_requirements_status", "status"),
    )
