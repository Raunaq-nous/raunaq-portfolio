"""
Operations API
Endpoints for applying, undoing, and redoing operations
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from datetime import datetime
import structlog

from app.models.operation import Operation, OperationStatus
from app.models.change import Change, ChangeSet
from app.ops.engine import OperationEngine

logger = structlog.get_logger()

router = APIRouter()

# In-memory storage
operations_db: dict[str, Operation] = {}
changes_db: dict[str, Change] = {}
changesets_db: dict[str, ChangeSet] = {}

# Operation engine
op_engine = OperationEngine()


@router.get("/{deck_id}")
async def get_deck_operations(
    deck_id: str,
    status: Optional[OperationStatus] = None,
    category: Optional[str] = None
):
    """Get all operations for a deck"""
    ops = [op for op in operations_db.values() if op.deck_id == deck_id]

    if status:
        ops = [op for op in ops if op.status == status]
    if category:
        ops = [op for op in ops if op.category == category]

    return {
        "deck_id": deck_id,
        "total": len(ops),
        "operations": ops,
        "by_status": {
            status: len([o for o in ops if o.status == status])
            for status in OperationStatus
        }
    }


@router.post("/apply/{operation_id}")
async def apply_operation(operation_id: str):
    """Apply a single operation"""
    try:
        operation = operations_db.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        if not operation.can_apply():
            raise HTTPException(
                status_code=400,
                detail=f"Operation cannot be applied. Current status: {operation.status}"
            )

        # Apply operation
        result = await op_engine.apply(operation)

        if result.success:
            operation.status = OperationStatus.APPLIED
            operation.applied_at = datetime.utcnow()
            operations_db[operation_id] = operation

            # Create change record
            change = Change(
                id=f"change_{operation_id}",
                deck_id=operation.deck_id,
                operation_id=operation_id,
                change_type="applied",
                before_snapshot=result.before_snapshot,
                after_snapshot=result.after_snapshot
            )
            changes_db[change.id] = change

            logger.info("operation_applied", operation_id=operation_id)

            return {
                "success": True,
                "operation_id": operation_id,
                "change_id": change.id,
                "message": "Operation applied successfully"
            }
        else:
            logger.error("operation_failed", operation_id=operation_id, error=result.error)
            raise HTTPException(status_code=500, detail=result.error)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("apply_error", operation_id=operation_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Failed to apply operation: {str(e)}")


@router.post("/apply-batch")
async def apply_batch_operations(operation_ids: List[str]):
    """Apply multiple operations"""
    results = []
    for op_id in operation_ids:
        try:
            result = await apply_operation(op_id)
            results.append({"operation_id": op_id, "success": True, "result": result})
        except Exception as e:
            results.append({"operation_id": op_id, "success": False, "error": str(e)})

    successful = len([r for r in results if r["success"]])

    return {
        "total": len(operation_ids),
        "successful": successful,
        "failed": len(operation_ids) - successful,
        "results": results
    }


@router.post("/undo/{operation_id}")
async def undo_operation(operation_id: str):
    """Undo an applied operation"""
    try:
        operation = operations_db.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        if not operation.is_reversible():
            raise HTTPException(
                status_code=400,
                detail=f"Operation cannot be undone. Current status: {operation.status}"
            )

        # Undo operation
        result = await op_engine.undo(operation)

        if result.success:
            operation.status = OperationStatus.UNDONE
            operation.undone_at = datetime.utcnow()
            operations_db[operation_id] = operation

            # Create change record
            change = Change(
                id=f"change_undo_{operation_id}",
                deck_id=operation.deck_id,
                operation_id=operation_id,
                change_type="undone"
            )
            changes_db[change.id] = change

            logger.info("operation_undone", operation_id=operation_id)

            return {
                "success": True,
                "operation_id": operation_id,
                "change_id": change.id,
                "message": "Operation undone successfully"
            }
        else:
            logger.error("undo_failed", operation_id=operation_id, error=result.error)
            raise HTTPException(status_code=500, detail=result.error)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("undo_error", operation_id=operation_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Failed to undo operation: {str(e)}")


@router.post("/redo/{operation_id}")
async def redo_operation(operation_id: str):
    """Redo an undone operation"""
    try:
        operation = operations_db.get(operation_id)
        if not operation:
            raise HTTPException(status_code=404, detail="Operation not found")

        if operation.status != OperationStatus.UNDONE:
            raise HTTPException(
                status_code=400,
                detail=f"Operation cannot be redone. Current status: {operation.status}"
            )

        # Redo operation (same as apply)
        result = await op_engine.apply(operation)

        if result.success:
            operation.status = OperationStatus.APPLIED
            operation.applied_at = datetime.utcnow()
            operation.redo_count += 1
            operations_db[operation_id] = operation

            # Create change record
            change = Change(
                id=f"change_redo_{operation_id}_{operation.redo_count}",
                deck_id=operation.deck_id,
                operation_id=operation_id,
                change_type="redone"
            )
            changes_db[change.id] = change

            logger.info("operation_redone", operation_id=operation_id)

            return {
                "success": True,
                "operation_id": operation_id,
                "change_id": change.id,
                "message": "Operation redone successfully"
            }
        else:
            logger.error("redo_failed", operation_id=operation_id, error=result.error)
            raise HTTPException(status_code=500, detail=result.error)

    except HTTPException:
        raise
    except Exception as e:
        logger.error("redo_error", operation_id=operation_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Failed to redo operation: {str(e)}")


@router.get("/changes/{deck_id}")
async def get_change_history(deck_id: str):
    """Get change history for a deck"""
    changes = [c for c in changes_db.values() if c.deck_id == deck_id]
    changes.sort(key=lambda x: x.timestamp, reverse=True)

    return {
        "deck_id": deck_id,
        "total": len(changes),
        "changes": changes
    }


@router.post("/changeset/create")
async def create_changeset(
    deck_id: str,
    name: str,
    operation_ids: List[str],
    description: Optional[str] = None
):
    """Create a changeset from multiple operations"""
    changeset_id = f"changeset_{len(changesets_db) + 1}"

    changeset = ChangeSet(
        id=changeset_id,
        deck_id=deck_id,
        name=name,
        description=description,
        operation_ids=operation_ids
    )

    changesets_db[changeset_id] = changeset

    return {
        "changeset_id": changeset_id,
        "message": "Changeset created successfully",
        "operations_count": len(operation_ids)
    }


@router.post("/changeset/apply/{changeset_id}")
async def apply_changeset(changeset_id: str):
    """Apply all operations in a changeset"""
    changeset = changesets_db.get(changeset_id)
    if not changeset:
        raise HTTPException(status_code=404, detail="Changeset not found")

    result = await apply_batch_operations(changeset.operation_ids)

    if result["successful"] == result["total"]:
        changeset.applied = True
        changeset.applied_at = datetime.utcnow()
        changesets_db[changeset_id] = changeset

    return {
        **result,
        "changeset_id": changeset_id,
        "changeset_applied": changeset.applied
    }
