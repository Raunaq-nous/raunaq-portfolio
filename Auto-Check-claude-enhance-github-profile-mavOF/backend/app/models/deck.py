"""
Deck Data Models
Models for presentation deck representation
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum


class DeckStatus(str, Enum):
    """Deck processing status"""
    UPLOADED = "uploaded"
    PARSING = "parsing"
    ANALYZING = "analyzing"
    READY = "ready"
    ERROR = "error"


class DeckMetadata(BaseModel):
    """Deck metadata"""
    title: Optional[str] = None
    author: Optional[str] = None
    created_at: Optional[datetime] = None
    modified_at: Optional[datetime] = None
    slide_count: int = 0
    format: str  # "pptx" or "pdf"
    file_size: int
    page_dimensions: Dict[str, float] = Field(default_factory=dict)  # width, height
    theme: Optional[str] = None


class Deck(BaseModel):
    """Main deck model"""
    id: str = Field(..., description="Unique deck identifier")
    filename: str
    file_path: str
    status: DeckStatus = DeckStatus.UPLOADED
    metadata: DeckMetadata

    # Analysis results
    issues: List[str] = Field(default_factory=list)  # Issue IDs
    operations: List[str] = Field(default_factory=list)  # Operation IDs
    change_history: List[str] = Field(default_factory=list)  # Change IDs

    # Version tracking
    version: int = 1
    reference_deck_id: Optional[str] = None

    # Timestamps
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None

    # Configuration
    brand_pack: Optional[Dict[str, Any]] = None
    style_guide: Optional[Dict[str, Any]] = None
    custom_rules: Optional[Dict[str, Any]] = None

    # Cache
    asset_graph_cache: Optional[Dict[str, Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "deck_abc123",
                "filename": "Q4_Review.pptx",
                "file_path": "/uploads/deck_abc123.pptx",
                "status": "ready",
                "metadata": {
                    "title": "Q4 Business Review",
                    "author": "Jane Doe",
                    "slide_count": 25,
                    "format": "pptx",
                    "file_size": 5242880,
                    "page_dimensions": {"width": 10, "height": 7.5}
                }
            }
        }
