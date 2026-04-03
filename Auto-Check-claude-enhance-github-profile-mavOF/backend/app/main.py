"""
FastAPI Main Application
Entry point for the Auto-Check backend API
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import structlog

from app.api import decks, issues, operations, exports, rag, models, performance
from app.utils.config import settings

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("startup", msg="Starting Auto-Check backend")

    # Initialize services
    from app.rag.service import rag_service
    await rag_service.initialize()

    yield

    logger.info("shutdown", msg="Shutting down Auto-Check backend")
    await rag_service.cleanup()


# Create FastAPI application
app = FastAPI(
    title="Auto-Check API",
    description="Intelligent deck analysis and auto-correction system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error("unhandled_exception", exc_info=exc, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__}
    )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


# Include routers
app.include_router(decks.router, prefix="/api/decks", tags=["Decks"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])
app.include_router(operations.router, prefix="/api/operations", tags=["Operations"])
app.include_router(exports.router, prefix="/api/exports", tags=["Exports"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])
app.include_router(performance.router, prefix="/api/performance", tags=["Performance"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Auto-Check API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
