"""
Citation Data Models
Models for source references and citations
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class SourceReference(BaseModel):
    """Reference to a source document"""
    id: str = Field(..., description="Unique source identifier")
    title: str
    type: str  # guide, standard, article, documentation
    url: Optional[str] = None
    section: Optional[str] = None
    version: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[datetime] = None
    accessed_date: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "src_wcag_2_1",
                "title": "WCAG 2.1 - Contrast (Minimum)",
                "type": "standard",
                "url": "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
                "section": "1.4.3",
                "version": "2.1",
                "publisher": "W3C"
            }
        }


class Citation(BaseModel):
    """Citation linking rule/issue to source"""
    source_id: str
    relevant_text: Optional[str] = None
    page_number: Optional[int] = None
    quote: Optional[str] = None

    # RAG-specific
    retrieval_score: Optional[float] = None
    embedding_id: Optional[str] = None

    # Delta (for fact-checking)
    claimed_value: Optional[Any] = None
    source_value: Optional[Any] = None
    delta: Optional[float] = None
    match: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "source_id": "src_wcag_2_1",
                "relevant_text": "Text must have contrast ratio of at least 4.5:1",
                "retrieval_score": 0.92,
                "match": True
            }
        }
