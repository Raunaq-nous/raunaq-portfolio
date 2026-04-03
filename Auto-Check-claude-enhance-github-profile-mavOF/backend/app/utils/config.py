"""
Configuration Management
Environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_WORKERS: int = 4

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: List[str] = [".pptx", ".pdf"]

    # Storage
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    TEMP_DIR: str = "./temp"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # RAG Settings
    RAG_CHUNK_SIZE: int = 800
    RAG_CHUNK_OVERLAP: int = 200
    RAG_TOP_K: int = 5
    RAG_CONFIDENCE_THRESHOLD: float = 0.7

    # Rule Engine Settings
    WCAG_NORMAL_TEXT_RATIO: float = 4.5
    WCAG_LARGE_TEXT_RATIO: float = 3.0
    MIN_FONT_SIZE_LARGE: int = 18

    # Language Check Settings
    GRAMMAR_CONFIDENCE_THRESHOLD: float = 0.85
    STYLE_GUIDE_DEFAULT: str = "microsoft"  # microsoft, gov_uk, plain_language

    # Numeric Validation
    NUMERIC_TOLERANCE: float = 0.01  # 1% tolerance for rounding
    CURRENCY_FORMATS: List[str] = ["USD", "EUR", "GBP", "JPY"]

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.TEMP_DIR, exist_ok=True)
