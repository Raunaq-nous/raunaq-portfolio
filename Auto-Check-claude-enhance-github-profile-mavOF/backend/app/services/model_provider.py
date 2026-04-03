"""
Model Provider Abstraction
Unified interface for different AI model providers
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import structlog
import httpx

from app.models.model_config import ModelConfig, ModelProvider

logger = structlog.get_logger()


class BaseModelProvider(ABC):
    """Base class for model providers"""

    def __init__(self, config: ModelConfig, api_key: Optional[str] = None):
        self.config = config
        self.api_key = api_key

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text completion"""
        pass

    @abstractmethod
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings"""
        pass


class OpenAIProvider(BaseModelProvider):
    """OpenAI model provider"""

    def __init__(self, config: ModelConfig, api_key: str):
        super().__init__(config, api_key)
        self.base_url = "https://api.openai.com/v1"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using OpenAI API"""
        try:
            async with httpx.AsyncClient() as client:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.config.model_id,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except Exception as e:
            logger.error("openai_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/embeddings",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.config.model_id,
                        "input": texts
                    },
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return [item["embedding"] for item in data["data"]]

        except Exception as e:
            logger.error("openai_embeddings_failed", error=str(e))
            raise


class AnthropicProvider(BaseModelProvider):
    """Anthropic Claude model provider"""

    def __init__(self, config: ModelConfig, api_key: str):
        super().__init__(config, api_key)
        self.base_url = "https://api.anthropic.com/v1"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using Anthropic API"""
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "model": self.config.model_id,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }

                if system_prompt:
                    payload["system"] = system_prompt

                response = await client.post(
                    f"{self.base_url}/messages",
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json=payload,
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return data["content"][0]["text"]

        except Exception as e:
            logger.error("anthropic_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Anthropic doesn't provide embeddings, raise error"""
        raise NotImplementedError("Anthropic does not provide embedding models")


class GoogleProvider(BaseModelProvider):
    """Google Gemini model provider"""

    def __init__(self, config: ModelConfig, api_key: str):
        super().__init__(config, api_key)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using Google Gemini API"""
        try:
            async with httpx.AsyncClient() as client:
                full_prompt = prompt
                if system_prompt:
                    full_prompt = f"{system_prompt}\n\n{prompt}"

                response = await client.post(
                    f"{self.base_url}/models/{self.config.model_id}:generateContent?key={self.api_key}",
                    json={
                        "contents": [{
                            "parts": [{"text": full_prompt}]
                        }],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": max_tokens
                        }
                    },
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]

        except Exception as e:
            logger.error("google_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Google API"""
        try:
            embeddings = []
            async with httpx.AsyncClient() as client:
                for text in texts:
                    response = await client.post(
                        f"{self.base_url}/models/text-embedding-004:embedContent?key={self.api_key}",
                        json={
                            "content": {
                                "parts": [{"text": text}]
                            }
                        },
                        timeout=60.0
                    )

                    response.raise_for_status()
                    data = response.json()
                    embeddings.append(data["embedding"]["values"])

            return embeddings

        except Exception as e:
            logger.error("google_embeddings_failed", error=str(e))
            raise


class OllamaProvider(BaseModelProvider):
    """Ollama (local) model provider"""

    def __init__(self, config: ModelConfig, base_url: str = "http://localhost:11434"):
        super().__init__(config, api_key=None)
        self.base_url = base_url

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using Ollama API"""
        try:
            async with httpx.AsyncClient() as client:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.config.model_id,
                        "messages": messages,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    },
                    timeout=120.0
                )

                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]

        except Exception as e:
            logger.error("ollama_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Ollama API"""
        try:
            embeddings = []
            async with httpx.AsyncClient() as client:
                for text in texts:
                    response = await client.post(
                        f"{self.base_url}/api/embeddings",
                        json={
                            "model": self.config.model_id,
                            "prompt": text
                        },
                        timeout=60.0
                    )

                    response.raise_for_status()
                    data = response.json()
                    embeddings.append(data["embedding"])

            return embeddings

        except Exception as e:
            logger.error("ollama_embeddings_failed", error=str(e))
            raise


class CohereProvider(BaseModelProvider):
    """Cohere model provider"""

    def __init__(self, config: ModelConfig, api_key: str):
        super().__init__(config, api_key)
        self.base_url = "https://api.cohere.ai/v1"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using Cohere API"""
        try:
            async with httpx.AsyncClient() as client:
                full_prompt = prompt
                if system_prompt:
                    full_prompt = f"{system_prompt}\n\n{prompt}"

                response = await client.post(
                    f"{self.base_url}/generate",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.config.model_id,
                        "prompt": full_prompt,
                        "temperature": temperature,
                        "max_tokens": max_tokens
                    },
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return data["generations"][0]["text"]

        except Exception as e:
            logger.error("cohere_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Cohere API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/embed",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.config.model_id,
                        "texts": texts,
                        "input_type": "search_document"
                    },
                    timeout=60.0
                )

                response.raise_for_status()
                data = response.json()
                return data["embeddings"]

        except Exception as e:
            logger.error("cohere_embeddings_failed", error=str(e))
            raise


class HuggingFaceProvider(BaseModelProvider):
    """HuggingFace model provider (local or API)"""

    def __init__(self, config: ModelConfig, api_key: Optional[str] = None):
        super().__init__(config, api_key)
        self.base_url = "https://api-inference.huggingface.co/models"
        self._local_model = None

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500
    ) -> str:
        """Generate text using HuggingFace API"""
        try:
            async with httpx.AsyncClient() as client:
                full_prompt = prompt
                if system_prompt:
                    full_prompt = f"{system_prompt}\n\n{prompt}"

                headers = {}
                if self.api_key:
                    headers["Authorization"] = f"Bearer {self.api_key}"

                response = await client.post(
                    f"{self.base_url}/{self.config.model_id}",
                    headers=headers,
                    json={
                        "inputs": full_prompt,
                        "parameters": {
                            "temperature": temperature,
                            "max_new_tokens": max_tokens
                        }
                    },
                    timeout=120.0
                )

                response.raise_for_status()
                data = response.json()
                return data[0]["generated_text"]

        except Exception as e:
            logger.error("huggingface_generation_failed", error=str(e))
            raise

    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using HuggingFace"""
        try:
            # Use sentence-transformers locally for embeddings
            from sentence_transformers import SentenceTransformer

            if self._local_model is None:
                self._local_model = SentenceTransformer(self.config.model_id)

            embeddings = self._local_model.encode(texts)
            return embeddings.tolist()

        except Exception as e:
            logger.error("huggingface_embeddings_failed", error=str(e))
            raise


def create_provider(
    config: ModelConfig,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None
) -> BaseModelProvider:
    """Factory function to create model provider"""

    if config.provider == ModelProvider.OPENAI:
        if not api_key:
            raise ValueError("OpenAI API key required")
        return OpenAIProvider(config, api_key)

    elif config.provider == ModelProvider.ANTHROPIC:
        if not api_key:
            raise ValueError("Anthropic API key required")
        return AnthropicProvider(config, api_key)

    elif config.provider == ModelProvider.GOOGLE:
        if not api_key:
            raise ValueError("Google API key required")
        return GoogleProvider(config, api_key)

    elif config.provider == ModelProvider.OLLAMA:
        return OllamaProvider(config, base_url or "http://localhost:11434")

    elif config.provider == ModelProvider.COHERE:
        if not api_key:
            raise ValueError("Cohere API key required")
        return CohereProvider(config, api_key)

    elif config.provider == ModelProvider.HUGGINGFACE:
        return HuggingFaceProvider(config, api_key)

    else:
        raise ValueError(f"Unsupported provider: {config.provider}")
