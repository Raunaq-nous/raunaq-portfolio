"""
Issues API
Endpoints for retrieving and managing issues
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models.issue import Issue, IssueCategory, IssueSeverity

router = APIRouter()

# In-memory storage
issues_db: dict[str, Issue] = {}


@router.get("/{deck_id}")
async def get_deck_issues(
    deck_id: str,
    category: Optional[IssueCategory] = None,
    severity: Optional[IssueSeverity] = None,
    status: Optional[str] = None,
    slide_number: Optional[int] = None,
    auto_fixable: Optional[bool] = None
):
    """
    Get all issues for a deck with optional filters

    - **deck_id**: Deck identifier
    - **category**: Filter by category
    - **severity**: Filter by severity
    - **status**: Filter by status (open, fixed, dismissed)
    - **slide_number**: Filter by slide number
    - **auto_fixable**: Filter by auto-fixable flag
    """
    deck_issues = [
        issue for issue in issues_db.values()
        if issue.deck_id == deck_id
    ]

    # Apply filters
    if category:
        deck_issues = [i for i in deck_issues if i.category == category]
    if severity:
        deck_issues = [i for i in deck_issues if i.severity == severity]
    if status:
        deck_issues = [i for i in deck_issues if i.status == status]
    if slide_number is not None:
        deck_issues = [i for i in deck_issues if i.location.slide_number == slide_number]
    if auto_fixable is not None:
        deck_issues = [i for i in deck_issues if i.auto_fixable == auto_fixable]

    # Group by category
    by_category = {}
    for issue in deck_issues:
        cat = issue.category.value
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(issue)

    return {
        "deck_id": deck_id,
        "total": len(deck_issues),
        "issues": deck_issues,
        "by_category": {k: len(v) for k, v in by_category.items()},
        "by_severity": {
            severity: len([i for i in deck_issues if i.severity == severity])
            for severity in IssueSeverity
        }
    }


@router.get("/detail/{issue_id}")
async def get_issue(issue_id: str):
    """Get issue by ID"""
    issue = issues_db.get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.patch("/{issue_id}/status")
async def update_issue_status(issue_id: str, status: str):
    """Update issue status"""
    issue = issues_db.get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    valid_statuses = ["open", "fixed", "dismissed", "in_progress"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    issue.status = status
    issues_db[issue_id] = issue

    return {"message": "Status updated", "issue_id": issue_id, "status": status}


@router.post("/{issue_id}/dismiss")
async def dismiss_issue(issue_id: str, reason: Optional[str] = None):
    """Dismiss an issue"""
    issue = issues_db.get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.status = "dismissed"
    if reason:
        issue.metadata = issue.metadata or {}
        issue.metadata["dismiss_reason"] = reason

    issues_db[issue_id] = issue

    return {"message": "Issue dismissed", "issue_id": issue_id}
