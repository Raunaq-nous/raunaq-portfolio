"""
RAG API
Endpoints for managing the RAG knowledge base
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional, List
import structlog

from app.rag.service import rag_service
from app.models.citation import SourceReference

logger = structlog.get_logger()

router = APIRouter()


@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    doc_type: str = Form(...),
    url: Optional[str] = Form(None),
    section: Optional[str] = Form(None),
    publisher: Optional[str] = Form(None)
):
    """
    Ingest a document into the RAG knowledge base

    - **file**: Document file (PDF, TXT, MD)
    - **title**: Document title
    - **doc_type**: Type (guide, standard, article, documentation)
    - **url**: Optional source URL
    - **section**: Optional section identifier
    - **publisher**: Optional publisher name
    """
    try:
        # Read file content
        content = await file.read()

        # Create source reference
        source_ref = SourceReference(
            id=f"src_{len(rag_service.sources) + 1}",
            title=title,
            type=doc_type,
            url=url,
            section=section,
            publisher=publisher
        )

        # Ingest document
        result = await rag_service.ingest_document(
            content=content,
            source_ref=source_ref,
            filename=file.filename
        )

        logger.info(
            "document_ingested",
            source_id=source_ref.id,
            title=title,
            chunks=result["chunks_created"]
        )

        return {
            "success": True,
            "source_id": source_ref.id,
            "message": "Document ingested successfully",
            **result
        }

    except Exception as e:
        logger.error("ingest_failed", title=title, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@router.post("/query")
async def query_knowledge_base(
    query: str,
    top_k: int = 5,
    min_confidence: float = 0.7
):
    """
    Query the RAG knowledge base

    - **query**: Search query
    - **top_k**: Number of results to return
    - **min_confidence**: Minimum confidence threshold
    """
    try:
        results = await rag_service.query(
            query=query,
            top_k=top_k,
            min_confidence=min_confidence
        )

        return {
            "query": query,
            "results_count": len(results),
            "results": results
        }

    except Exception as e:
        logger.error("query_failed", query=query, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.post("/validate-claim")
async def validate_claim(
    claim: str,
    claimed_value: Optional[str] = None,
    context: Optional[dict] = None
):
    """
    Validate a claim against the knowledge base

    - **claim**: The claim to validate
    - **claimed_value**: Optional specific value claimed
    - **context**: Optional context (entity, metric, period, unit)
    """
    try:
        validation = await rag_service.validate_claim(
            claim=claim,
            claimed_value=claimed_value,
            context=context or {}
        )

        return validation

    except Exception as e:
        logger.error("validation_failed", claim=claim, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/sources")
async def list_sources():
    """List all sources in the knowledge base"""
    return {
        "total": len(rag_service.sources),
        "sources": [src.dict() for src in rag_service.sources.values()]
    }


@router.get("/sources/{source_id}")
async def get_source(source_id: str):
    """Get source details"""
    source = rag_service.sources.get(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


@router.delete("/sources/{source_id}")
async def delete_source(source_id: str):
    """Delete a source from the knowledge base"""
    try:
        await rag_service.delete_source(source_id)
        logger.info("source_deleted", source_id=source_id)
        return {"message": "Source deleted successfully", "source_id": source_id}
    except Exception as e:
        logger.error("delete_failed", source_id=source_id, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.post("/reindex")
async def reindex_knowledge_base():
    """Reindex the entire knowledge base"""
    try:
        await rag_service.reindex()
        logger.info("knowledge_base_reindexed")
        return {"message": "Knowledge base reindexed successfully"}
    except Exception as e:
        logger.error("reindex_failed", error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Reindex failed: {str(e)}")


@router.get("/stats")
async def get_rag_stats():
    """Get RAG system statistics"""
    stats = await rag_service.get_stats()
    return stats
