"""
Deck Management API
Endpoints for uploading and managing decks
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List
import uuid
import shutil
import os
from pathlib import Path

from app.models.deck import Deck, DeckMetadata, DeckStatus
from app.utils.config import settings
from app.parsers.pptx_parser import PPTXParser
from app.parsers.pdf_parser import PDFParser
from app.rule_engines.analyzer import DeckAnalyzer
import structlog

logger = structlog.get_logger()

router = APIRouter()

# In-memory storage (replace with database in production)
decks_db: dict[str, Deck] = {}


def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return Path(filename).suffix.lower()


async def analyze_deck_background(deck_id: str):
    """Background task to analyze deck"""
    try:
        deck = decks_db.get(deck_id)
        if not deck:
            logger.error("deck_not_found", deck_id=deck_id)
            return

        # Update status
        deck.status = DeckStatus.ANALYZING
        decks_db[deck_id] = deck

        # Run analysis
        analyzer = DeckAnalyzer()
        results = await analyzer.analyze(deck)

        # Update deck with results
        deck.issues = [issue.id for issue in results.issues]
        deck.operations = [op.id for op in results.operations]
        deck.status = DeckStatus.READY
        deck.analyzed_at = results.completed_at

        decks_db[deck_id] = deck

        logger.info(
            "deck_analyzed",
            deck_id=deck_id,
            issues=len(results.issues),
            operations=len(results.operations)
        )

    except Exception as e:
        logger.error("analysis_failed", deck_id=deck_id, error=str(e), exc_info=e)
        if deck_id in decks_db:
            decks_db[deck_id].status = DeckStatus.ERROR


@router.post("/upload")
async def upload_deck(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    reference_deck_id: Optional[str] = None,
    auto_analyze: bool = True
):
    """
    Upload a deck file (PPTX or PDF)

    - **file**: Deck file to upload
    - **reference_deck_id**: Optional reference deck for version diff
    - **auto_analyze**: Automatically start analysis after upload
    """
    try:
        # Validate file extension
        ext = get_file_extension(file.filename)
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type {ext} not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
            )

        # Generate unique deck ID
        deck_id = f"deck_{uuid.uuid4().hex[:12]}"

        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{deck_id}{ext}")
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        file_size = os.path.getsize(file_path)

        # Validate file size
        if file_size > settings.MAX_FILE_SIZE:
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes"
            )

        # Parse metadata
        logger.info("parsing_deck", deck_id=deck_id, filename=file.filename, format=ext)

        if ext == ".pptx":
            parser = PPTXParser()
            metadata = await parser.extract_metadata(file_path)
        else:  # PDF
            parser = PDFParser()
            metadata = await parser.extract_metadata(file_path)

        # Create deck object
        deck = Deck(
            id=deck_id,
            filename=file.filename,
            file_path=file_path,
            status=DeckStatus.UPLOADED,
            metadata=metadata,
            reference_deck_id=reference_deck_id
        )

        # Store in database
        decks_db[deck_id] = deck

        logger.info(
            "deck_uploaded",
            deck_id=deck_id,
            filename=file.filename,
            slides=metadata.slide_count,
            size=file_size
        )

        # Start analysis in background if requested
        if auto_analyze:
            background_tasks.add_task(analyze_deck_background, deck_id)
            deck.status = DeckStatus.PARSING

        return {
            "deck_id": deck_id,
            "filename": file.filename,
            "status": deck.status,
            "metadata": metadata,
            "message": "Deck uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("upload_failed", filename=file.filename, error=str(e), exc_info=e)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{deck_id}")
async def get_deck(deck_id: str):
    """Get deck by ID"""
    deck = decks_db.get(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck


@router.get("/{deck_id}/status")
async def get_deck_status(deck_id: str):
    """Get deck processing status"""
    deck = decks_db.get(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    return {
        "deck_id": deck_id,
        "status": deck.status,
        "issues_count": len(deck.issues),
        "operations_count": len(deck.operations),
        "analyzed_at": deck.analyzed_at
    }


@router.post("/{deck_id}/analyze")
async def analyze_deck(deck_id: str, background_tasks: BackgroundTasks):
    """Trigger deck analysis"""
    deck = decks_db.get(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if deck.status == DeckStatus.ANALYZING:
        return {
            "message": "Analysis already in progress",
            "status": deck.status
        }

    background_tasks.add_task(analyze_deck_background, deck_id)
    deck.status = DeckStatus.PARSING
    decks_db[deck_id] = deck

    return {
        "message": "Analysis started",
        "deck_id": deck_id,
        "status": deck.status
    }


@router.delete("/{deck_id}")
async def delete_deck(deck_id: str):
    """Delete deck"""
    deck = decks_db.get(deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    # Delete file
    try:
        if os.path.exists(deck.file_path):
            os.remove(deck.file_path)
    except Exception as e:
        logger.warning("file_delete_failed", deck_id=deck_id, error=str(e))

    # Remove from database
    del decks_db[deck_id]

    logger.info("deck_deleted", deck_id=deck_id)

    return {"message": "Deck deleted successfully", "deck_id": deck_id}


@router.get("/")
async def list_decks():
    """List all decks"""
    return {
        "decks": list(decks_db.values()),
        "total": len(decks_db)
    }
