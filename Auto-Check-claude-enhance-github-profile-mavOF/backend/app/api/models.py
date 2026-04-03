"""
Models Configuration API
Endpoints for managing AI model selection
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

from app.models.model_config import (
    ModelTask,
    ModelProvider,
    get_models_for_task,
    get_recommended_model,
    OPEN_SOURCE_MODELS,
    PAID_MODELS
)
from app.services.model_manager import model_manager
import structlog

logger = structlog.get_logger()

router = APIRouter()


class ModelSelectionRequest(BaseModel):
    """Request to set model for a task"""
    task: ModelTask
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class TestModelRequest(BaseModel):
    """Request to test a model configuration"""
    task: ModelTask
    model_id: Optional[str] = None


@router.get("/tasks")
async def list_tasks():
    """List all available AI tasks"""
    return {
        "tasks": [
            {
                "id": task.value,
                "name": task.value.replace("_", " ").title(),
                "description": _get_task_description(task)
            }
            for task in ModelTask
        ]
    }


@router.get("/models/{task}")
async def get_models_for_task_endpoint(
    task: ModelTask,
    open_source_only: bool = False
):
    """Get available models for a specific task"""
    try:
        models = get_models_for_task(task, open_source_only)

        return {
            "task": task.value,
            "models": [
                {
                    "id": model.id,
                    "name": model.name,
                    "provider": model.provider.value,
                    "is_open_source": model.is_open_source,
                    "context_window": model.context_window,
                    "cost_per_1k_tokens": model.cost_per_1k_tokens,
                    "requires_api_key": model.requires_api_key,
                    "recommended": model.recommended,
                    "model_id": model.model_id
                }
                for model in models
            ],
            "recommended": get_recommended_model(task, open_source_only)
        }

    except Exception as e:
        logger.error("get_models_failed", task=task, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_all_models(open_source_only: bool = False):
    """Get all available models grouped by task"""
    result = {}

    for task in ModelTask:
        models = get_models_for_task(task, open_source_only)
        result[task.value] = {
            "models": [
                {
                    "id": model.id,
                    "name": model.name,
                    "provider": model.provider.value,
                    "is_open_source": model.is_open_source,
                    "recommended": model.recommended
                }
                for model in models
            ]
        }

    return result


@router.post("/select")
async def select_model(request: ModelSelectionRequest):
    """Set model selection for a task"""
    try:
        model_manager.set_model_for_task(
            task=request.task,
            model_id=request.model_id,
            api_key=request.api_key,
            base_url=request.base_url
        )

        logger.info(
            "model_selected",
            task=request.task,
            model_id=request.model_id
        )

        return {
            "success": True,
            "message": f"Model selected for {request.task.value}",
            "selection": {
                "task": request.task.value,
                "model_id": request.model_id
            }
        }

    except Exception as e:
        logger.error("model_selection_failed", error=str(e), exc_info=e)
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/selections")
async def get_selections():
    """Get current model selections"""
    return {
        "selections": model_manager.get_all_selections()
    }


@router.get("/selections/{task}")
async def get_selection_for_task(task: ModelTask):
    """Get current selection for a specific task"""
    selection = model_manager.get_current_selection(task)

    if not selection:
        return {
            "task": task.value,
            "selection": None,
            "message": "Using default recommended model"
        }

    return {
        "task": task.value,
        "selection": selection
    }


@router.delete("/selections/{task}")
async def clear_selection(task: ModelTask):
    """Clear model selection for a task (will use default)"""
    try:
        model_manager.clear_selection(task)

        return {
            "success": True,
            "message": f"Selection cleared for {task.value}, will use default"
        }

    except Exception as e:
        logger.error("clear_selection_failed", task=task, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def test_model(request: TestModelRequest):
    """Test a model configuration"""
    try:
        # If model_id provided, temporarily set it
        original_selection = model_manager.get_current_selection(request.task)

        if request.model_id:
            model_manager.set_model_for_task(
                task=request.task,
                model_id=request.model_id
            )

        # Test the provider
        success = model_manager.test_provider(request.task)

        # Restore original selection if we changed it
        if request.model_id and original_selection:
            model_manager.set_model_for_task(
                task=request.task,
                model_id=original_selection["model_id"]
            )

        return {
            "success": success,
            "message": "Model test successful" if success else "Model test failed",
            "task": request.task.value
        }

    except Exception as e:
        logger.error("model_test_failed", error=str(e), exc_info=e)
        return {
            "success": False,
            "message": f"Test failed: {str(e)}",
            "task": request.task.value
        }


@router.get("/providers")
async def list_providers():
    """List all available providers"""
    return {
        "providers": [
            {
                "id": provider.value,
                "name": provider.value.title(),
                "is_open_source": provider in [
                    ModelProvider.OLLAMA,
                    ModelProvider.HUGGINGFACE,
                    ModelProvider.LOCAL
                ]
            }
            for provider in ModelProvider
        ]
    }


@router.get("/recommendations")
async def get_recommendations():
    """Get recommended models for all tasks"""
    return {
        "recommendations": {
            "open_source": {
                task.value: (
                    get_recommended_model(task, open_source_only=True).dict()
                    if get_recommended_model(task, open_source_only=True)
                    else None
                )
                for task in ModelTask
            },
            "paid": {
                task.value: (
                    get_recommended_model(task, open_source_only=False).dict()
                    if get_recommended_model(task, open_source_only=False)
                    else None
                )
                for task in ModelTask
            }
        }
    }


def _get_task_description(task: ModelTask) -> str:
    """Get description for a task"""
    descriptions = {
        ModelTask.GRAMMAR_CHECK: "Check grammar, spelling, and punctuation in text",
        ModelTask.TEXT_REWRITE: "Rewrite text for clarity and style",
        ModelTask.STYLE_CHECK: "Check compliance with style guides",
        ModelTask.EMBEDDINGS: "Generate vector embeddings for semantic search",
        ModelTask.FACT_CHECK: "Validate factual claims against knowledge base",
        ModelTask.REASONING: "Perform complex reasoning tasks"
    }
    return descriptions.get(task, "")
