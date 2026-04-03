"""
Rule Data Models
Models for validation rules and rule results
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Any, Callable
from enum import Enum


class RuleCategory(str, Enum):
    """Rule categories"""
    FORMATTING = "formatting"
    HIERARCHY = "hierarchy"
    LANGUAGE = "language"
    STYLE = "style"
    NUMERIC = "numeric"
    CHART = "chart"
    ACCESSIBILITY = "accessibility"
    VALUATION = "valuation"
    FACT_CHECK = "fact_check"


class RuleSeverity(str, Enum):
    """Default severity for rules"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Rule(BaseModel):
    """Validation rule definition"""
    id: str = Field(..., description="Unique rule identifier")
    name: str
    category: RuleCategory
    severity: RuleSeverity

    # Description
    title: str
    description: str
    rationale: str

    # Configuration
    enabled: bool = True
    auto_fixable: bool = False
    deterministic: bool = True  # vs LLM-based

    # Parameters
    parameters: Dict[str, Any] = Field(default_factory=dict)

    # Citations
    source_references: List[str] = Field(default_factory=list)
    style_guides: List[str] = Field(default_factory=list)

    # Execution
    priority: int = 100  # Lower runs first

    class Config:
        json_schema_extra = {
            "example": {
                "id": "fmt_001",
                "name": "check_wcag_contrast",
                "category": "accessibility",
                "severity": "high",
                "title": "WCAG Contrast Ratio",
                "description": "Ensure text meets WCAG AA contrast requirements",
                "rationale": "4.5:1 for normal text, 3:1 for large text per WCAG 2.1",
                "enabled": True,
                "auto_fixable": True,
                "deterministic": True,
                "parameters": {
                    "normal_ratio": 4.5,
                    "large_ratio": 3.0,
                    "large_text_size": 18
                },
                "source_references": ["WCAG 2.1 - Contrast (Minimum)"],
                "priority": 10
            }
        }


class RuleResult(BaseModel):
    """Result from rule execution"""
    rule_id: str
    passed: bool
    issues_found: int = 0

    # Details
    message: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

    # Issues created
    issue_ids: List[str] = Field(default_factory=list)

    # Operations suggested
    operation_ids: List[str] = Field(default_factory=list)

    # Metrics
    execution_time_ms: float = 0.0
    confidence: float = 1.0
