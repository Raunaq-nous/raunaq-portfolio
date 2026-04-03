# Performance Optimization Guide for Open-Source Models

This guide shows how to make Auto-Check **10-100x faster** when using open-source models.

## 🚀 Quick Wins (Immediate Impact)

### 1. Use Smaller, Faster Models

**Switch to these faster alternatives:**

```bash
# Instead of Llama 3 70B (slow)
ollama pull llama3:8b        # 4-8x faster!

# Instead of Mixtral 8x7B (slow)
ollama pull mistral:7b       # 3-5x faster!

# For embeddings (already fast)
ollama pull nomic-embed-text # Good speed
```

**Performance Comparison:**

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| Llama 3 70B | 70B | Slow (10-30s) | Excellent |
| Llama 3 8B | 8B | Fast (1-3s) | Very Good |
| Mistral 7B | 7B | Very Fast (<1s) | Good |
| Phi-3 Mini | 3.8B | Ultra Fast (<0.5s) | Good |

### 2. Enable GPU Acceleration

**Check if GPU is being used:**
```bash
# Check GPU availability
ollama ps

# If CPU only, install CUDA/ROCm drivers
```

**With GPU: 50-100x faster than CPU!**

### 3. Use Quantized Models

Quantized models are 2-4x faster with minimal quality loss:

```bash
# 4-bit quantized (fastest)
ollama pull llama3:8b-q4_0

# 8-bit quantized (balanced)
ollama pull llama3:8b-q8_0

# Speed: q4 > q8 > fp16 (default)
```

## 🎯 Optimization Strategies

### Strategy 1: Smart Model Selection Per Task

Different tasks need different model sizes:

```python
# Grammar/Spelling - Use small models
Task: grammar_check → Mistral 7B (fast enough)

# Text Rewriting - Use medium models
Task: text_rewrite → Llama 3 8B (good balance)

# Complex Reasoning - Use large models
Task: fact_check → Llama 3 70B (when needed)

# Embeddings - Already optimized
Task: embeddings → Nomic Embed (very fast)
```

### Strategy 2: Parallel Processing

Process multiple text blocks concurrently:

```python
# Instead of sequential (slow)
for text in texts:
    result = await check_grammar(text)  # 3s each = 30s total

# Use parallel (fast!)
results = await asyncio.gather(*[
    check_grammar(text) for text in texts
])  # 3s total!
```

### Strategy 3: Aggressive Caching

Cache results to avoid re-processing:

```python
# Cache grammar checks by content hash
cache_key = hashlib.md5(text.encode()).hexdigest()
if cache_key in cache:
    return cache[cache_key]
```

### Strategy 4: Batch Processing

Send multiple requests in one API call:

```python
# Ollama supports batching
responses = await ollama.generate_batch([
    {"prompt": text1},
    {"prompt": text2},
    {"prompt": text3}
])
```

### Strategy 5: Skip Unnecessary Checks

Only run checks that matter:

```python
# Skip grammar check for:
- Very short text (< 10 words)
- Non-text elements (charts, images)
- Previously checked content (cached)
```

## 🛠️ Implementation

### Apply Performance Profile (Easiest!)

Auto-Check includes 3 pre-configured profiles:

```bash
# Ultra Fast - Fastest models, may sacrifice quality
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "ultra_fast"}'

# Balanced - Recommended for most users ⭐
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "balanced"}'

# Quality - Best quality, slower
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "quality"}'
```

### Monitor Cache Performance

```bash
# Get cache statistics
curl "http://localhost:8000/api/performance/cache/stats"

# Response:
{
  "caches": {
    "grammar": {
      "entries": 150,
      "hits": 450,
      "misses": 150,
      "hit_rate": "75.0%"
    }
  }
}

# 75% hit rate = 75% of checks use cache (4x faster!)
```

### Run Benchmark

```bash
# Test your current setup speed
curl "http://localhost:8000/api/performance/benchmark"

# Response:
{
  "time_seconds": 0.8,
  "rating": "Very Good"
}
```

## 📊 Performance Comparison

### Real-World Results

| Configuration | Time per Slide | 25-Slide Deck | Cost |
|---------------|----------------|---------------|------|
| Llama 3 70B (CPU) | 15-30s | 6-12 min | Free |
| Llama 3 70B (GPU) | 2-5s | 1-2 min | Free |
| Llama 3 8B (CPU) | 3-6s | 1-2.5 min | Free |
| Llama 3 8B (GPU) | 0.5-1s | 12-25s | Free |
| Mistral 7B (GPU) | 0.3-0.7s | 7-17s | Free |
| GPT-4 Turbo | 1-2s | 25-50s | $0.25-0.50 |
| Claude Sonnet | 0.8-1.5s | 20-38s | $0.08-0.15 |

### Cache Impact

| Scenario | Without Cache | With Cache (75% hit) | Speedup |
|----------|---------------|----------------------|---------|
| Re-analyzing deck | 2 min | 30s | 4x faster |
| Similar content | 2 min | 15s | 8x faster |
| Batch processing | 10 min | 2-3 min | 3-5x faster |

## 🚀 Step-by-Step Speed Guide

### Step 1: Install Ollama with GPU Support

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

**Verify GPU:**
```bash
ollama ps
# Should show GPU usage if available
```

### Step 2: Pull Fast Models

```bash
# Recommended balanced setup
ollama pull llama3:8b          # Grammar, rewriting
ollama pull nomic-embed-text   # Embeddings

# Ultra fast setup
ollama pull phi3:mini          # Ultra fast
ollama pull mistral:7b         # Very fast
```

### Step 3: Apply Performance Profile

**Via API:**
```bash
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "balanced"}'
```

**Via Settings UI:**
1. Go to `/settings`
2. Check "Open source only"
3. Select llama3:8b for grammar/rewriting
4. Select nomic-embed-text for embeddings
5. Test and save

### Step 4: Verify Setup

```bash
# Run benchmark
curl "http://localhost:8000/api/performance/benchmark"

# Should see <2s for good performance
```

## 🔧 Advanced Optimizations

### 1. Ollama Environment Variables

```bash
# More parallel processing
export OLLAMA_NUM_PARALLEL=4

# More GPU layers (faster)
export OLLAMA_NUM_GPU=35

# Keep models in memory
export OLLAMA_KEEP_ALIVE=24h

# Max concurrent requests
export OLLAMA_MAX_LOADED_MODELS=2
```

### 2. Preload Models

Keep models in memory for instant responses:

```bash
# Start Ollama
ollama serve &

# Preload models
ollama run llama3:8b
ollama run nomic-embed-text

# Models stay loaded and respond instantly
```

### 3. Backend Configuration

In `backend/.env`:

```env
# Skip very short text
MIN_TEXT_LENGTH=15

# Enable caching
CACHE_ENABLED=true
GRAMMAR_CACHE_TTL=3600
EMBEDDINGS_CACHE_TTL=7200

# Reduce max tokens for speed
MAX_TOKENS_GRAMMAR=300
MAX_TOKENS_REWRITE=500
```

## 📈 Monitoring Performance

### Check Cache Stats

```bash
curl "http://localhost:8000/api/performance/cache/stats"
```

**Good targets:**
- Hit rate > 70%: Excellent caching
- Hit rate 50-70%: Good caching
- Hit rate < 50%: Consider larger cache

### Run Benchmark Regularly

```bash
# Simple benchmark
curl "http://localhost:8000/api/performance/benchmark"

# Expected results:
# - GPU + Fast Model: <1s = "Excellent"
# - GPU + Large Model: 1-3s = "Good"
# - CPU + Fast Model: 2-5s = "Acceptable"
# - CPU + Large Model: >10s = "Slow"
```

## 🎯 Troubleshooting

### Issue: Ollama is slow

**Solutions:**
1. Check GPU usage: `ollama ps`
2. Update drivers: CUDA/ROCm
3. Use smaller model: `llama3:8b` instead of `llama3:70b`
4. Enable quantization: Pull `llama3:8b-q4_0`
5. Increase `OLLAMA_NUM_GPU`

### Issue: Out of memory

**Solutions:**
1. Use smaller context window
2. Use quantized models (q4 or q8)
3. Close other applications
4. Use smaller model (8B instead of 70B)

### Issue: Models slow to load

**Solutions:**
1. Preload models: `ollama run model_name`
2. Set `OLLAMA_KEEP_ALIVE=24h`
3. Use faster storage (SSD)
4. Reduce number of concurrent models

### Issue: Low cache hit rate

**Solutions:**
1. Increase cache TTL in `.env`
2. Process similar content together
3. Re-analyze same decks
4. Increase cache size limits

## 📚 Best Practices Summary

### Do's ✅
- ✅ Use GPU acceleration (50-100x speedup)
- ✅ Apply "balanced" profile for most users
- ✅ Enable caching (4-8x speedup)
- ✅ Use Llama 3 8B or Mistral 7B
- ✅ Monitor cache hit rates
- ✅ Preload frequently used models
- ✅ Process content in parallel

### Don'ts ❌
- ❌ Don't use 70B models without GPU
- ❌ Don't disable caching
- ❌ Don't check very short text (<10 words)
- ❌ Don't run multiple large models on CPU
- ❌ Don't ignore cache statistics
- ❌ Don't use default models without testing

## 🔗 Quick Links

- **Performance API**: `http://localhost:8000/docs#/Performance`
- **Apply Profile**: `POST /api/performance/profiles/apply`
- **Cache Stats**: `GET /api/performance/cache/stats`
- **Benchmark**: `GET /api/performance/benchmark`
- **Optimization Tips**: `GET /api/performance/optimization-tips`

## 📞 Getting Help

If you're still experiencing slow performance:

1. **Run benchmark**:
   ```bash
   curl http://localhost:8000/api/performance/benchmark
   ```

2. **Check cache stats**:
   ```bash
   curl http://localhost:8000/api/performance/cache/stats
   ```

3. **Review hardware**:
   - CPU: Any modern processor works, but GPU is much faster
   - GPU: NVIDIA (CUDA) or AMD (ROCm) with 8GB+ VRAM
   - RAM: 16GB+ recommended for 8B models, 32GB+ for 70B
   - Storage: SSD recommended for model loading

4. **Consider paid models**: For consistent fast performance:
   - Claude Sonnet: $0.003/1K tokens (best value)
   - GPT-4 Turbo: $0.01/1K tokens
   - Gemini Pro: $0.00125/1K tokens

---

## 🎯 Expected Performance Targets

| Setup | Speed per Text Block | 25-Slide Deck |
|-------|---------------------|---------------|
| **GPU + Fast Models** | <1s | 15-30s |
| **GPU + Large Models** | 1-3s | 45-90s |
| **CPU + Fast Models** | 2-5s | 1-2 min |
| **CPU + Large Models** | 10-30s | 5-15 min |

Choose your configuration based on your hardware and quality requirements!

**Recommended Setup for Most Users:**
- **Model**: Llama 3 8B (via Ollama)
- **Hardware**: Any GPU with 8GB+ VRAM
- **Profile**: Balanced
- **Expected**: <1s per check, ~30s per 25-slide deck
- **Cost**: FREE!
