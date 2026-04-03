"""
Change Data Models
Models for change history and change sets
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class Change(BaseModel):
    """Individual change record"""
    id: str = Field(..., description="Unique change identifier")
    deck_id: str
    operation_id: str

    # Change type
    change_type: str  # applied, undone, redone

    # Snapshot
    before_snapshot: Optional[Dict[str, Any]] = None
    after_snapshot: Optional[Dict[str, Any]] = None

    # Timestamps
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # User info (if manual action)
    user_action: bool = False
    user_id: Optional[str] = None


class ChangeSet(BaseModel):
    """Collection of changes grouped together"""
    id: str = Field(..., description="Unique change set identifier")
    deck_id: str
    name: str
    description: Optional[str] = None

    # Changes
    change_ids: List[str] = Field(default_factory=list)
    operation_ids: List[str] = Field(default_factory=list)

    # Status
    applied: bool = False
    can_rollback: bool = True

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    applied_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "changeset_001",
                "deck_id": "deck_abc123",
                "name": "Apply all language fixes",
                "description": "Batch application of grammar and style corrections",
                "change_ids": ["change_001", "change_002", "change_003"],
                "operation_ids": ["op_001", "op_002", "op_003"],
                "applied": True,
                "can_rollback": True
            }
        }
