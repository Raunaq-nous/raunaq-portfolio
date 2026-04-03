"""
Model Providers Configuration
Defines available models for each task type
"""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel


class ModelTask(str, Enum):
    """AI task types"""
    GRAMMAR_CHECK = "grammar_check"
    TEXT_REWRITE = "text_rewrite"
    STYLE_CHECK = "style_check"
    EMBEDDINGS = "embeddings"
    FACT_CHECK = "fact_check"
    REASONING = "reasoning"


class ModelProvider(str, Enum):
    """Model provider types"""
    # Open source
    OLLAMA = "ollama"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"

    # Paid
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    COHERE = "cohere"
    MISTRAL = "mistral"


class ModelConfig(BaseModel):
    """Model configuration"""
    id: str
    name: str
    provider: ModelProvider
    task: ModelTask
    is_open_source: bool
    context_window: int
    cost_per_1k_tokens: Optional[float] = None
    requires_api_key: bool = True
    recommended: bool = False

    # Provider-specific settings
    model_id: str  # e.g., "gpt-4-turbo-preview" or "llama3:70b"
    base_url: Optional[str] = None


# ==================== OPEN SOURCE MODELS ====================

OPEN_SOURCE_MODELS = {
    # Grammar/Language checking
    ModelTask.GRAMMAR_CHECK: [
        ModelConfig(
            id="llama3-70b-grammar",
            name="Llama 3 70B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:70b"
        ),
        ModelConfig(
            id="mixtral-8x7b-grammar",
            name="Mixtral 8x7B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=32768,
            requires_api_key=False,
            model_id="mixtral:8x7b"
        ),
        ModelConfig(
            id="command-r-grammar",
            name="Command R+ (35B)",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=128000,
            requires_api_key=False,
            model_id="command-r:35b"
        ),
    ],

    # Text rewriting
    ModelTask.TEXT_REWRITE: [
        ModelConfig(
            id="llama3-70b-rewrite",
            name="Llama 3 70B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:70b"
        ),
        ModelConfig(
            id="qwen2-72b-rewrite",
            name="Qwen2 72B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=True,
            context_window=32768,
            requires_api_key=False,
            model_id="qwen2:72b"
        ),
    ],

    # Embeddings
    ModelTask.EMBEDDINGS: [
        ModelConfig(
            id="nomic-embed-text",
            name="Nomic Embed Text v1.5",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.EMBEDDINGS,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="nomic-embed-text"
        ),
        ModelConfig(
            id="bge-large-en",
            name="BGE Large EN v1.5",
            provider=ModelProvider.HUGGINGFACE,
            task=ModelTask.EMBEDDINGS,
            is_open_source=True,
            context_window=512,
            requires_api_key=False,
            model_id="BAAI/bge-large-en-v1.5"
        ),
        ModelConfig(
            id="all-minilm-l6",
            name="All MiniLM L6 v2",
            provider=ModelProvider.HUGGINGFACE,
            task=ModelTask.EMBEDDINGS,
            is_open_source=True,
            context_window=256,
            requires_api_key=False,
            model_id="sentence-transformers/all-MiniLM-L6-v2"
        ),
    ],

    # Fact checking
    ModelTask.FACT_CHECK: [
        ModelConfig(
            id="llama3-70b-fact",
            name="Llama 3 70B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.FACT_CHECK,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:70b"
        ),
        ModelConfig(
            id="mixtral-8x22b-fact",
            name="Mixtral 8x22B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.FACT_CHECK,
            is_open_source=True,
            context_window=65536,
            requires_api_key=False,
            model_id="mixtral:8x22b"
        ),
    ],
}


# ==================== PAID MODELS ====================

PAID_MODELS = {
    # Grammar/Language checking
    ModelTask.GRAMMAR_CHECK: [
        ModelConfig(
            id="gpt4-turbo-grammar",
            name="GPT-4 Turbo",
            provider=ModelProvider.OPENAI,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=False,
            context_window=128000,
            cost_per_1k_tokens=0.01,
            recommended=True,
            model_id="gpt-4-turbo-preview"
        ),
        ModelConfig(
            id="claude-opus-grammar",
            name="Claude 3 Opus",
            provider=ModelProvider.ANTHROPIC,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=False,
            context_window=200000,
            cost_per_1k_tokens=0.015,
            recommended=True,
            model_id="claude-3-opus-20240229"
        ),
        ModelConfig(
            id="claude-sonnet-grammar",
            name="Claude 3.5 Sonnet",
            provider=ModelProvider.ANTHROPIC,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=False,
            context_window=200000,
            cost_per_1k_tokens=0.003,
            model_id="claude-3-5-sonnet-20241022"
        ),
        ModelConfig(
            id="gemini-pro-grammar",
            name="Gemini 1.5 Pro",
            provider=ModelProvider.GOOGLE,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=False,
            context_window=2000000,
            cost_per_1k_tokens=0.00125,
            model_id="gemini-1.5-pro"
        ),
    ],

    # Text rewriting
    ModelTask.TEXT_REWRITE: [
        ModelConfig(
            id="gpt4-turbo-rewrite",
            name="GPT-4 Turbo",
            provider=ModelProvider.OPENAI,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=False,
            context_window=128000,
            cost_per_1k_tokens=0.01,
            recommended=True,
            model_id="gpt-4-turbo-preview"
        ),
        ModelConfig(
            id="claude-opus-rewrite",
            name="Claude 3 Opus",
            provider=ModelProvider.ANTHROPIC,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=False,
            context_window=200000,
            cost_per_1k_tokens=0.015,
            model_id="claude-3-opus-20240229"
        ),
        ModelConfig(
            id="gemini-pro-rewrite",
            name="Gemini 1.5 Pro",
            provider=ModelProvider.GOOGLE,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=False,
            context_window=2000000,
            cost_per_1k_tokens=0.00125,
            model_id="gemini-1.5-pro"
        ),
    ],

    # Embeddings
    ModelTask.EMBEDDINGS: [
        ModelConfig(
            id="openai-embed-3-large",
            name="OpenAI text-embedding-3-large",
            provider=ModelProvider.OPENAI,
            task=ModelTask.EMBEDDINGS,
            is_open_source=False,
            context_window=8191,
            cost_per_1k_tokens=0.00013,
            recommended=True,
            model_id="text-embedding-3-large"
        ),
        ModelConfig(
            id="openai-embed-3-small",
            name="OpenAI text-embedding-3-small",
            provider=ModelProvider.OPENAI,
            task=ModelTask.EMBEDDINGS,
            is_open_source=False,
            context_window=8191,
            cost_per_1k_tokens=0.00002,
            model_id="text-embedding-3-small"
        ),
        ModelConfig(
            id="cohere-embed-v3",
            name="Cohere Embed v3",
            provider=ModelProvider.COHERE,
            task=ModelTask.EMBEDDINGS,
            is_open_source=False,
            context_window=512,
            cost_per_1k_tokens=0.0001,
            model_id="embed-english-v3.0"
        ),
    ],

    # Fact checking
    ModelTask.FACT_CHECK: [
        ModelConfig(
            id="gpt4-turbo-fact",
            name="GPT-4 Turbo",
            provider=ModelProvider.OPENAI,
            task=ModelTask.FACT_CHECK,
            is_open_source=False,
            context_window=128000,
            cost_per_1k_tokens=0.01,
            recommended=True,
            model_id="gpt-4-turbo-preview"
        ),
        ModelConfig(
            id="claude-opus-fact",
            name="Claude 3 Opus",
            provider=ModelProvider.ANTHROPIC,
            task=ModelTask.FACT_CHECK,
            is_open_source=False,
            context_window=200000,
            cost_per_1k_tokens=0.015,
            recommended=True,
            model_id="claude-3-opus-20240229"
        ),
        ModelConfig(
            id="gemini-pro-fact",
            name="Gemini 1.5 Pro",
            provider=ModelProvider.GOOGLE,
            task=ModelTask.FACT_CHECK,
            is_open_source=False,
            context_window=2000000,
            cost_per_1k_tokens=0.00125,
            model_id="gemini-1.5-pro"
        ),
    ],
}


def get_models_for_task(task: ModelTask, open_source_only: bool = False) -> List[ModelConfig]:
    """Get available models for a task"""
    models = []

    if open_source_only:
        models.extend(OPEN_SOURCE_MODELS.get(task, []))
    else:
        models.extend(OPEN_SOURCE_MODELS.get(task, []))
        models.extend(PAID_MODELS.get(task, []))

    return models


def get_recommended_model(task: ModelTask, open_source_only: bool = False) -> Optional[ModelConfig]:
    """Get recommended model for a task"""
    models = get_models_for_task(task, open_source_only)
    recommended = [m for m in models if m.recommended]
    return recommended[0] if recommended else (models[0] if models else None)
