"""
Performance-Optimized Model Configurations
Fast open-source models for speed-critical applications
"""

from app.models.model_config import ModelConfig, ModelProvider, ModelTask

# ==================== FAST OPEN SOURCE MODELS ====================

FAST_OPEN_SOURCE_MODELS = {
    # Grammar/Language checking - Optimized for speed
    ModelTask.GRAMMAR_CHECK: [
        ModelConfig(
            id="llama3-8b-grammar",
            name="Llama 3 8B Instruct (Fast)",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:8b"
        ),
        ModelConfig(
            id="mistral-7b-grammar",
            name="Mistral 7B Instruct (Very Fast)",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=32768,
            requires_api_key=False,
            recommended=True,
            model_id="mistral:7b"
        ),
        ModelConfig(
            id="phi3-mini-grammar",
            name="Phi-3 Mini (Ultra Fast)",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.GRAMMAR_CHECK,
            is_open_source=True,
            context_window=4096,
            requires_api_key=False,
            model_id="phi3:mini"
        ),
    ],

    # Text rewriting - Balance speed and quality
    ModelTask.TEXT_REWRITE: [
        ModelConfig(
            id="llama3-8b-rewrite",
            name="Llama 3 8B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:8b"
        ),
        ModelConfig(
            id="mistral-7b-rewrite",
            name="Mistral 7B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.TEXT_REWRITE,
            is_open_source=True,
            context_window=32768,
            requires_api_key=False,
            model_id="mistral:7b"
        ),
    ],

    # Embeddings - Already fast
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
            id="all-minilm-l6",
            name="All MiniLM L6 v2 (Fastest)",
            provider=ModelProvider.HUGGINGFACE,
            task=ModelTask.EMBEDDINGS,
            is_open_source=True,
            context_window=256,
            requires_api_key=False,
            model_id="sentence-transformers/all-MiniLM-L6-v2"
        ),
    ],

    # Fact checking - Use larger models only when needed
    ModelTask.FACT_CHECK: [
        ModelConfig(
            id="llama3-8b-fact",
            name="Llama 3 8B Instruct (Fast)",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.FACT_CHECK,
            is_open_source=True,
            context_window=8192,
            requires_api_key=False,
            recommended=True,
            model_id="llama3:8b"
        ),
        ModelConfig(
            id="mistral-7b-fact",
            name="Mistral 7B Instruct",
            provider=ModelProvider.OLLAMA,
            task=ModelTask.FACT_CHECK,
            is_open_source=True,
            context_window=32768,
            requires_api_key=False,
            model_id="mistral:7b"
        ),
    ],
}


# Performance profiles
PERFORMANCE_PROFILES = {
    "ultra_fast": {
        "description": "Fastest possible, may sacrifice some quality",
        "models": {
            ModelTask.GRAMMAR_CHECK: "phi3-mini-grammar",
            ModelTask.TEXT_REWRITE: "mistral-7b-rewrite",
            ModelTask.EMBEDDINGS: "all-minilm-l6",
            ModelTask.FACT_CHECK: "mistral-7b-fact"
        }
    },
    "balanced": {
        "description": "Good balance of speed and quality (recommended)",
        "models": {
            ModelTask.GRAMMAR_CHECK: "llama3-8b-grammar",
            ModelTask.TEXT_REWRITE: "llama3-8b-rewrite",
            ModelTask.EMBEDDINGS: "nomic-embed-text",
            ModelTask.FACT_CHECK: "llama3-8b-fact"
        }
    },
    "quality": {
        "description": "Best quality, slower",
        "models": {
            ModelTask.GRAMMAR_CHECK: "llama3-70b-grammar",
            ModelTask.TEXT_REWRITE: "llama3-70b-rewrite",
            ModelTask.EMBEDDINGS: "nomic-embed-text",
            ModelTask.FACT_CHECK: "llama3-70b-fact"
        }
    }
}


def get_fast_models_for_task(task: ModelTask):
    """Get performance-optimized models for a task"""
    return FAST_OPEN_SOURCE_MODELS.get(task, [])


def get_recommended_fast_model(task: ModelTask):
    """Get recommended fast model for a task"""
    models = get_fast_models_for_task(task)
    recommended = [m for m in models if m.recommended]
    return recommended[0] if recommended else (models[0] if models else None)


def apply_performance_profile(profile_name: str):
    """Get model configuration for a performance profile"""
    if profile_name not in PERFORMANCE_PROFILES:
        raise ValueError(f"Unknown profile: {profile_name}")

    return PERFORMANCE_PROFILES[profile_name]
