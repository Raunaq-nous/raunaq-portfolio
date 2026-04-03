"""
Performance API
Endpoints for performance monitoring and optimization
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.models.performance_config import (
    PERFORMANCE_PROFILES,
    get_fast_models_for_task,
    apply_performance_profile
)
from app.models.model_config import ModelTask
from app.utils.cache import get_cache_stats, clear_all_caches
from app.services.model_manager import model_manager
import structlog

logger = structlog.get_logger()

router = APIRouter()


class ApplyProfileRequest(BaseModel):
    """Request to apply performance profile"""
    profile: str  # ultra_fast, balanced, quality


@router.get("/profiles")
async def list_performance_profiles():
    """List available performance profiles"""
    return {
        "profiles": [
            {
                "id": profile_id,
                "description": profile_data["description"],
                "models": profile_data["models"]
            }
            for profile_id, profile_data in PERFORMANCE_PROFILES.items()
        ],
        "current": "balanced"  # TODO: Track current profile
    }


@router.post("/profiles/apply")
async def apply_profile(request: ApplyProfileRequest):
    """Apply a performance profile"""
    try:
        profile = apply_performance_profile(request.profile)

        # Apply model selections for each task
        applied = []
        for task_str, model_id in profile["models"].items():
            try:
                task = ModelTask(task_str)
                model_manager.set_model_for_task(task, model_id)
                applied.append(task_str)
            except Exception as e:
                logger.warning("profile_task_failed", task=task_str, error=str(e))

        logger.info("performance_profile_applied", profile=request.profile, tasks=len(applied))

        return {
            "success": True,
            "profile": request.profile,
            "description": profile["description"],
            "applied_tasks": applied,
            "message": f"Applied {request.profile} profile to {len(applied)} tasks"
        }

    except Exception as e:
        logger.error("profile_apply_failed", error=str(e), exc_info=e)
        return {
            "success": False,
            "message": f"Failed to apply profile: {str(e)}"
        }


@router.get("/cache/stats")
async def get_cache_statistics():
    """Get cache performance statistics"""
    stats = get_cache_stats()

    return {
        "caches": stats,
        "total_entries": sum(cache["entries"] for cache in stats.values() if isinstance(cache, dict)),
        "summary": {
            "grammar_hit_rate": stats["grammar"]["hit_rate"],
            "embeddings_hit_rate": stats["embeddings"]["hit_rate"],
            "rag_hit_rate": stats["rag"]["hit_rate"]
        }
    }


@router.post("/cache/clear")
async def clear_caches():
    """Clear all caches"""
    clear_all_caches()

    logger.info("caches_cleared_via_api")

    return {
        "success": True,
        "message": "All caches cleared"
    }


@router.get("/fast-models")
async def get_fast_models():
    """Get performance-optimized model recommendations"""
    recommendations = {}

    for task in ModelTask:
        models = get_fast_models_for_task(task)
        if models:
            recommendations[task.value] = [
                {
                    "id": m.id,
                    "name": m.name,
                    "model_id": m.model_id,
                    "provider": m.provider.value,
                    "recommended": m.recommended
                }
                for m in models
            ]

    return {
        "fast_models": recommendations,
        "note": "These models are optimized for speed while maintaining quality"
    }


@router.get("/optimization-tips")
async def get_optimization_tips():
    """Get performance optimization tips"""
    return {
        "tips": [
            {
                "category": "Model Selection",
                "tips": [
                    "Use Llama 3 8B instead of 70B for 5-10x speedup",
                    "Use Mistral 7B for very fast inference",
                    "Use Phi-3 Mini for ultra-fast checks",
                    "Consider quantized models (q4, q8) for 2-4x speedup"
                ]
            },
            {
                "category": "Hardware",
                "tips": [
                    "Enable GPU acceleration (50-100x faster than CPU)",
                    "Use CUDA/ROCm drivers for GPU support",
                    "Allocate more RAM for larger context windows",
                    "Use SSD for faster model loading"
                ]
            },
            {
                "category": "Configuration",
                "tips": [
                    "Enable caching (check /api/performance/cache/stats)",
                    "Apply 'ultra_fast' or 'balanced' performance profile",
                    "Reduce max_tokens in prompts for faster generation",
                    "Skip checks on short text (<10 words)"
                ]
            },
            {
                "category": "Ollama Specific",
                "tips": [
                    "Keep Ollama running in background",
                    "Preload models: ollama run llama3:8b",
                    "Use ollama ps to check GPU usage",
                    "Update to latest Ollama version for performance fixes"
                ]
            }
        ],
        "quick_wins": [
            "Apply 'balanced' profile: POST /api/performance/profiles/apply",
            "Install Ollama: curl -fsSL https://ollama.com/install.sh | sh",
            "Pull fast model: ollama pull llama3:8b",
            "Enable GPU acceleration"
        ]
    }


@router.get("/benchmark")
async def run_simple_benchmark():
    """Run simple benchmark to test model speed"""
    import time

    try:
        provider = model_manager.get_provider_for_task(ModelTask.GRAMMAR_CHECK)

        start = time.time()
        result = await provider.generate_text(
            prompt="Say 'OK' if you can read this.",
            max_tokens=10
        )
        elapsed = time.time() - start

        return {
            "success": True,
            "response": result,
            "time_seconds": round(elapsed, 2),
            "tokens_per_second": round(10 / elapsed, 1) if elapsed > 0 else 0,
            "rating": _rate_speed(elapsed)
        }

    except Exception as e:
        logger.error("benchmark_failed", error=str(e))
        return {
            "success": False,
            "error": str(e)
        }


def _rate_speed(elapsed: float) -> str:
    """Rate speed based on elapsed time"""
    if elapsed < 0.5:
        return "Excellent (GPU accelerated)"
    elif elapsed < 1.0:
        return "Very Good"
    elif elapsed < 3.0:
        return "Good"
    elif elapsed < 10.0:
        return "Acceptable"
    else:
        return "Slow (consider faster model or GPU)"
