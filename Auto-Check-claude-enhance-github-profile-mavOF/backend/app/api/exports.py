"""
Exports API
Endpoints for exporting analyzed decks and reports
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
import os
import json
from datetime import datetime
import structlog

from app.utils.config import settings

logger = structlog.get_logger()

router = APIRouter()


@router.get("/{deck_id}/pdf")
async def export_annotated_pdf(deck_id: str):
    """
    Export annotated PDF with sticky notes at issue locations

    - **deck_id**: Deck identifier
    """
    try:
        from app.api.decks import decks_db
        from app.api.issues import issues_db
        from app.exports.pdf_exporter import PDFExporter

        deck = decks_db.get(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")

        # Get all issues for this deck
        issues = [issue for issue in issues_db.values() if issue.deck_id == deck_id]

        # Export annotated PDF
        exporter = PDFExporter()
        output_path = await exporter.export_annotated(deck, issues)

        logger.info("pdf_exported", deck_id=deck_id, output_path=output_path)

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=f"{deck.filename}_annotated.pdf"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("pdf_export_failed", deck_id=deck_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"PDF export failed: {str(e)}")


@router.get("/{deck_id}/json")
async def export_json_logs(deck_id: str):
    """
    Export JSON logs with all issues, operations, and changes

    - **deck_id**: Deck identifier
    """
    try:
        from app.api.decks import decks_db
        from app.api.issues import issues_db
        from app.api.operations import operations_db, changes_db

        deck = decks_db.get(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")

        # Collect all data
        issues = [issue.dict() for issue in issues_db.values() if issue.deck_id == deck_id]
        operations = [op.dict() for op in operations_db.values() if op.deck_id == deck_id]
        changes = [ch.dict() for ch in changes_db.values() if ch.deck_id == deck_id]

        export_data = {
            "deck": deck.dict(),
            "export_timestamp": datetime.utcnow().isoformat(),
            "summary": {
                "total_issues": len(issues),
                "total_operations": len(operations),
                "total_changes": len(changes),
                "issues_by_category": {},
                "issues_by_severity": {},
                "operations_by_status": {}
            },
            "issues": issues,
            "operations": operations,
            "changes": changes
        }

        # Calculate summaries
        from collections import Counter
        from app.models.issue import IssueCategory, IssueSeverity
        from app.models.operation import OperationStatus

        category_counts = Counter(issue["category"] for issue in issues)
        severity_counts = Counter(issue["severity"] for issue in issues)
        status_counts = Counter(op["status"] for op in operations)

        export_data["summary"]["issues_by_category"] = dict(category_counts)
        export_data["summary"]["issues_by_severity"] = dict(severity_counts)
        export_data["summary"]["operations_by_status"] = dict(status_counts)

        # Save to file
        output_path = os.path.join(settings.TEMP_DIR, f"{deck_id}_export.json")
        with open(output_path, "w") as f:
            json.dump(export_data, f, indent=2, default=str)

        logger.info("json_exported", deck_id=deck_id, output_path=output_path)

        return FileResponse(
            path=output_path,
            media_type="application/json",
            filename=f"{deck.filename}_export.json"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("json_export_failed", deck_id=deck_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"JSON export failed: {str(e)}")


@router.get("/{deck_id}/diff")
async def export_diff_html(deck_id: str):
    """
    Export HTML diff comparing original and modified versions

    - **deck_id**: Deck identifier
    """
    try:
        from app.api.decks import decks_db
        from app.exports.diff_exporter import DiffExporter

        deck = decks_db.get(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")

        # Generate diff
        exporter = DiffExporter()
        output_path = await exporter.export_html_diff(deck)

        logger.info("diff_exported", deck_id=deck_id, output_path=output_path)

        return FileResponse(
            path=output_path,
            media_type="text/html",
            filename=f"{deck.filename}_diff.html"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("diff_export_failed", deck_id=deck_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Diff export failed: {str(e)}")


@router.get("/{deck_id}/summary")
async def export_summary(deck_id: str):
    """Get export summary without downloading files"""
    try:
        from app.api.decks import decks_db
        from app.api.issues import issues_db
        from app.api.operations import operations_db

        deck = decks_db.get(deck_id)
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")

        issues = [issue for issue in issues_db.values() if issue.deck_id == deck_id]
        operations = [op for op in operations_db.values() if op.deck_id == deck_id]

        from collections import Counter

        return {
            "deck_id": deck_id,
            "deck_name": deck.filename,
            "status": deck.status,
            "summary": {
                "total_issues": len(issues),
                "total_operations": len(operations),
                "applied_operations": len([o for o in operations if o.status == "applied"]),
                "issues_by_category": dict(Counter(issue.category for issue in issues)),
                "issues_by_severity": dict(Counter(issue.severity for issue in issues)),
            },
            "available_exports": {
                "pdf": f"/api/exports/{deck_id}/pdf",
                "json": f"/api/exports/{deck_id}/json",
                "diff": f"/api/exports/{deck_id}/diff"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("summary_failed", deck_id=deck_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Summary failed: {str(e)}")
