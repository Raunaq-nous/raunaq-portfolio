"""
Operation Data Models
Models for change operations with undo/redo support
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class OperationType(str, Enum):
    """Types of operations"""
    TEXT_REPLACE = "text_replace"
    TEXT_REWRITE = "text_rewrite"
    FORMAT_CHANGE = "format_change"
    COLOR_CHANGE = "color_change"
    ALIGNMENT_CHANGE = "alignment_change"
    FONT_CHANGE = "font_change"
    SIZE_CHANGE = "size_change"
    POSITION_CHANGE = "position_change"
    CHART_UPDATE = "chart_update"
    TABLE_UPDATE = "table_update"
    SHAPE_DELETE = "shape_delete"
    SHAPE_ADD = "shape_add"
    MASTER_ATTACH = "master_attach"
    COMPOSITE = "composite"  # Multiple operations grouped


class OperationStatus(str, Enum):
    """Operation status"""
    PENDING = "pending"
    APPLIED = "applied"
    UNDONE = "undone"
    FAILED = "failed"


class OperationTarget(BaseModel):
    """Target of operation"""
    slide_number: int
    shape_id: Optional[str] = None
    shape_name: Optional[str] = None
    path: Optional[List[str]] = None  # For nested elements (e.g., table cell)


class OperationChange(BaseModel):
    """Before/after state"""
    property: str
    before: Any
    after: Any
    visual_diff: Optional[Dict[str, Any]] = None  # Bbox snapshot for visual changes


class Operation(BaseModel):
    """Change operation with undo/redo support"""
    id: str = Field(..., description="Unique operation identifier")
    deck_id: str
    issue_id: Optional[str] = None

    # Operation details
    type: OperationType
    target: OperationTarget
    changes: List[OperationChange]

    # Metadata
    rule_id: str
    rule_name: str
    category: str
    rationale: str
    citations: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)

    # Dependencies
    depends_on: List[str] = Field(default_factory=list)  # Operation IDs
    blocks: List[str] = Field(default_factory=list)  # Operations blocked by this one

    # Status
    status: OperationStatus = OperationStatus.PENDING

    # Undo/redo tracking
    applied_at: Optional[datetime] = None
    undone_at: Optional[datetime] = None
    redo_count: int = 0

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Composite operations
    child_operations: List[str] = Field(default_factory=list)  # For composite ops

    def is_reversible(self) -> bool:
        """Check if operation can be undone"""
        return self.status == OperationStatus.APPLIED

    def can_apply(self) -> bool:
        """Check if operation can be applied"""
        return self.status in [OperationStatus.PENDING, OperationStatus.UNDONE]

    class Config:
        json_schema_extra = {
            "example": {
                "id": "op_001",
                "deck_id": "deck_abc123",
                "issue_id": "issue_xyz789",
                "type": "text_rewrite",
                "target": {
                    "slide_number": 3,
                    "shape_id": "TextBox_5"
                },
                "changes": [
                    {
                        "property": "text",
                        "before": "We have 5 key areas",
                        "after": "We have five key areas"
                    }
                ],
                "rule_id": "lang_001",
                "rule_name": "spell_out_small_numbers",
                "category": "language",
                "rationale": "Numbers less than 10 should be spelled out per APA style",
                "citations": ["APA Style Guide - Numbers in Text"],
                "confidence": 0.95,
                "status": "pending"
            }
        }
