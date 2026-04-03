"""
Caching Utilities
Performance optimization through intelligent caching
"""

import hashlib
import time
from typing import Any, Optional, Dict, Callable
from functools import wraps
import asyncio
import structlog

logger = structlog.get_logger()


class SimpleCache:
    """Simple in-memory cache with TTL"""

    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, tuple[Any, float]] = {}
        self.ttl_seconds = ttl_seconds
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            value, timestamp = self.cache[key]

            # Check if expired
            if time.time() - timestamp < self.ttl_seconds:
                self.hits += 1
                return value
            else:
                # Remove expired entry
                del self.cache[key]

        self.misses += 1
        return None

    def set(self, key: str, value: Any):
        """Set value in cache"""
        self.cache[key] = (value, time.time())

    def clear(self):
        """Clear entire cache"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0

        return {
            "entries": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.1f}%"
        }


# Global caches for different purposes
grammar_cache = SimpleCache(ttl_seconds=3600)  # 1 hour
embeddings_cache = SimpleCache(ttl_seconds=7200)  # 2 hours
rag_cache = SimpleCache(ttl_seconds=1800)  # 30 minutes


def generate_cache_key(text: str, prefix: str = "") -> str:
    """Generate cache key from text"""
    # Use MD5 hash for consistent key generation
    text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
    return f"{prefix}:{text_hash}" if prefix else text_hash


def cache_result(cache: SimpleCache, prefix: str = ""):
    """Decorator to cache function results"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from first argument (usually text)
            if len(args) > 0 and isinstance(args[0], str):
                cache_key = generate_cache_key(args[0], prefix)

                # Check cache
                cached_value = cache.get(cache_key)
                if cached_value is not None:
                    logger.debug("cache_hit", function=func.__name__, key=cache_key)
                    return cached_value

                # Execute function
                result = await func(*args, **kwargs)

                # Cache result
                cache.set(cache_key, result)
                logger.debug("cache_set", function=func.__name__, key=cache_key)

                return result
            else:
                # If no cacheable argument, just execute
                return await func(*args, **kwargs)

        return wrapper
    return decorator


class BatchProcessor:
    """Batch multiple requests together for efficiency"""

    def __init__(self, batch_size: int = 10, wait_time: float = 0.1):
        self.batch_size = batch_size
        self.wait_time = wait_time
        self.queue: list = []
        self.lock = asyncio.Lock()

    async def add(self, item: Any) -> Any:
        """Add item to batch queue"""
        async with self.lock:
            self.queue.append(item)

            # Process if batch is full
            if len(self.queue) >= self.batch_size:
                return await self._process_batch()

        # Wait for more items or timeout
        await asyncio.sleep(self.wait_time)

        async with self.lock:
            if self.queue:
                return await self._process_batch()

    async def _process_batch(self):
        """Process accumulated batch"""
        if not self.queue:
            return []

        batch = self.queue.copy()
        self.queue.clear()

        logger.info("processing_batch", size=len(batch))
        return batch


def should_skip_check(text: str, min_length: int = 10) -> bool:
    """Determine if text check can be skipped"""
    if not text or not text.strip():
        return True

    # Skip very short text
    word_count = len(text.split())
    if word_count < min_length:
        return True

    # Skip if all numbers/symbols
    if not any(c.isalpha() for c in text):
        return True

    return False


class RateLimiter:
    """Rate limiter for API calls"""

    def __init__(self, calls_per_second: int = 10):
        self.calls_per_second = calls_per_second
        self.min_interval = 1.0 / calls_per_second
        self.last_call = 0
        self.lock = asyncio.Lock()

    async def acquire(self):
        """Acquire rate limit"""
        async with self.lock:
            now = time.time()
            time_since_last = now - self.last_call

            if time_since_last < self.min_interval:
                wait_time = self.min_interval - time_since_last
                await asyncio.sleep(wait_time)

            self.last_call = time.time()


def get_cache_stats() -> Dict[str, Dict]:
    """Get statistics for all caches"""
    return {
        "grammar": grammar_cache.get_stats(),
        "embeddings": embeddings_cache.get_stats(),
        "rag": rag_cache.get_stats()
    }


def clear_all_caches():
    """Clear all caches"""
    grammar_cache.clear()
    embeddings_cache.clear()
    rag_cache.clear()
    logger.info("all_caches_cleared")
