"""
Issue Data Models
Models for validation issues and errors
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any
from datetime import datetime
from enum import Enum


class IssueSeverity(str, Enum):
    """Issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class IssueCategory(str, Enum):
    """Issue categories"""
    FORMATTING = "formatting"
    LANGUAGE = "language"
    NUMERIC = "numeric"
    CHART = "chart"
    FACT_CHECK = "fact_check"
    ACCESSIBILITY = "accessibility"
    STYLE_GUIDE = "style_guide"
    VALUATION = "valuation"


class IssueLocation(BaseModel):
    """Location of issue in deck"""
    slide_number: int
    shape_id: Optional[str] = None
    shape_name: Optional[str] = None
    bounding_box: Optional[Dict[str, float]] = None  # x, y, width, height
    text_range: Optional[Dict[str, int]] = None  # start, end


class Issue(BaseModel):
    """Issue detected in deck"""
    id: str = Field(..., description="Unique issue identifier")
    deck_id: str
    category: IssueCategory
    severity: IssueSeverity

    # Description
    title: str
    description: str
    rationale: str

    # Location
    location: IssueLocation

    # Context
    current_value: Any
    suggested_value: Optional[Any] = None

    # Rule information
    rule_id: str
    rule_name: str

    # Auto-fix
    auto_fixable: bool = False
    operation_id: Optional[str] = None  # If auto-fix available

    # Citations
    citations: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)

    # Status
    status: str = "open"  # open, fixed, dismissed, in_progress
    applied_at: Optional[datetime] = None

    # Timestamps
    detected_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "issue_xyz789",
                "deck_id": "deck_abc123",
                "category": "language",
                "severity": "medium",
                "title": "Number should be spelled out",
                "description": "Numbers less than 10 should be spelled out in body text",
                "rationale": "Per APA style guide, spell out numbers one through nine",
                "location": {
                    "slide_number": 3,
                    "shape_id": "TextBox_5",
                    "bounding_box": {"x": 100, "y": 200, "width": 400, "height": 50}
                },
                "current_value": "We have 5 key areas",
                "suggested_value": "We have five key areas",
                "rule_id": "lang_001",
                "rule_name": "spell_out_small_numbers",
                "auto_fixable": True,
                "citations": ["APA Style Guide - Numbers in Text"],
                "confidence": 0.95,
                "status": "open"
            }
        }
