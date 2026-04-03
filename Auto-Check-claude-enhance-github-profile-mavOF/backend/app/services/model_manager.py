"""
Model Manager
Manages user model selections and API keys
"""

from typing import Dict, Optional
import structlog
from pydantic import BaseModel

from app.models.model_config import ModelTask, ModelConfig, get_models_for_task, get_recommended_model
from app.services.model_provider import create_provider, BaseModelProvider

logger = structlog.get_logger()


class UserModelSelection(BaseModel):
    """User's model selection for a task"""
    task: ModelTask
    model_id: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class ModelManager:
    """Manages model selections and providers"""

    def __init__(self):
        self.user_selections: Dict[ModelTask, UserModelSelection] = {}
        self.providers: Dict[ModelTask, BaseModelProvider] = {}

    def set_model_for_task(
        self,
        task: ModelTask,
        model_id: str,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        """Set user's model preference for a task"""
        selection = UserModelSelection(
            task=task,
            model_id=model_id,
            api_key=api_key,
            base_url=base_url
        )
        self.user_selections[task] = selection

        # Clear cached provider
        if task in self.providers:
            del self.providers[task]

        logger.info("model_selection_updated", task=task, model_id=model_id)

    def get_provider_for_task(
        self,
        task: ModelTask,
        prefer_open_source: bool = False
    ) -> BaseModelProvider:
        """Get model provider for a task"""

        # Check if provider is already cached
        if task in self.providers:
            return self.providers[task]

        # Get user selection or use recommended
        selection = self.user_selections.get(task)

        if selection:
            # Use user's selected model
            models = get_models_for_task(task)
            config = next((m for m in models if m.id == selection.model_id), None)

            if not config:
                raise ValueError(f"Model {selection.model_id} not found for task {task}")

            provider = create_provider(
                config=config,
                api_key=selection.api_key,
                base_url=selection.base_url
            )
        else:
            # Use recommended model
            config = get_recommended_model(task, open_source_only=prefer_open_source)

            if not config:
                raise ValueError(f"No models available for task {task}")

            # For models requiring API key, check environment
            api_key = None
            if config.requires_api_key:
                from app.utils.config import settings
                api_key = getattr(settings, f"{config.provider.upper()}_API_KEY", None)

                if not api_key:
                    raise ValueError(
                        f"API key required for {config.provider}. "
                        f"Set {config.provider.upper()}_API_KEY in environment or configure via UI."
                    )

            provider = create_provider(config=config, api_key=api_key)

        # Cache provider
        self.providers[task] = provider

        logger.info(
            "provider_created",
            task=task,
            provider=provider.config.provider,
            model=provider.config.model_id
        )

        return provider

    def get_current_selection(self, task: ModelTask) -> Optional[Dict]:
        """Get current model selection for a task"""
        selection = self.user_selections.get(task)
        if selection:
            return {
                "task": selection.task,
                "model_id": selection.model_id,
                "has_api_key": bool(selection.api_key)
            }
        return None

    def get_all_selections(self) -> Dict[str, Dict]:
        """Get all current selections"""
        return {
            task.value: self.get_current_selection(task)
            for task in ModelTask
        }

    def clear_selection(self, task: ModelTask):
        """Clear user selection for a task"""
        if task in self.user_selections:
            del self.user_selections[task]
        if task in self.providers:
            del self.providers[task]

        logger.info("model_selection_cleared", task=task)

    def test_provider(self, task: ModelTask) -> bool:
        """Test if provider is working"""
        try:
            provider = self.get_provider_for_task(task)

            if task == ModelTask.EMBEDDINGS:
                # Test embeddings
                import asyncio
                embeddings = asyncio.run(provider.generate_embeddings(["test"]))
                return len(embeddings) > 0 and len(embeddings[0]) > 0
            else:
                # Test text generation
                import asyncio
                result = asyncio.run(provider.generate_text("Say 'OK' if you can read this."))
                return len(result) > 0

        except Exception as e:
            logger.error("provider_test_failed", task=task, error=str(e))
            return False


# Global instance
model_manager = ModelManager()
