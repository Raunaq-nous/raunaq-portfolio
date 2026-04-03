# Multi-Model AI Support Guide

Auto-Check now supports **both open-source and paid AI models** for all generative AI tasks! You can choose the best model for each specific task and easily switch between providers.

## 🎯 Overview

The system provides two options for every AI task:
1. **Open-Source Models** - Free, run locally or via free APIs (Ollama, HuggingFace)
2. **Paid Models** - Premium models requiring API keys (OpenAI, Anthropic, Google, Cohere)

## 📋 AI Tasks & Models

### 1. Grammar & Spelling Check

**Open Source Options:**
- ✨ **Llama 3 70B Instruct** (Recommended) - Via Ollama
- **Mixtral 8x7B Instruct** - Via Ollama
- **Command R+ 35B** - Via Ollama

**Paid Options:**
- ✨ **GPT-4 Turbo** (Recommended) - OpenAI - $0.01/1K tokens
- ✨ **Claude 3.5 Sonnet** (Recommended) - Anthropic - $0.003/1K tokens
- **Claude 3 Opus** - Anthropic - $0.015/1K tokens
- **Gemini 1.5 Pro** - Google - $0.00125/1K tokens

### 2. Text Rewriting

**Open Source Options:**
- ✨ **Llama 3 70B Instruct** (Recommended)
- **Qwen2 72B Instruct**

**Paid Options:**
- ✨ **GPT-4 Turbo** (Recommended)
- **Claude 3 Opus**
- **Gemini 1.5 Pro**

### 3. Embeddings (RAG)

**Open Source Options:**
- ✨ **Nomic Embed Text v1.5** (Recommended) - Via Ollama
- **BGE Large EN v1.5** - HuggingFace
- **All MiniLM L6 v2** - HuggingFace

**Paid Options:**
- ✨ **text-embedding-3-large** (Recommended) - OpenAI - $0.00013/1K tokens
- **text-embedding-3-small** - OpenAI - $0.00002/1K tokens
- **Cohere Embed v3** - Cohere - $0.0001/1K tokens

### 4. Fact Checking

**Open Source Options:**
- ✨ **Llama 3 70B Instruct** (Recommended)
- **Mixtral 8x22B Instruct**

**Paid Options:**
- ✨ **GPT-4 Turbo** (Recommended)
- ✨ **Claude 3 Opus** (Recommended)
- **Gemini 1.5 Pro**

## 🚀 Quick Start

### Option 1: Use Open Source Models (Free)

1. **Install Ollama**
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh

   # Windows
   # Download from https://ollama.com/download
   ```

2. **Pull Models**
   ```bash
   # For grammar/text tasks
   ollama pull llama3:70b

   # For embeddings
   ollama pull nomic-embed-text
   ```

3. **Start Ollama**
   ```bash
   ollama serve
   ```

4. **Configure in Auto-Check**
   - Navigate to `/settings` in the web UI
   - Check "Open source only"
   - Select models for each task
   - Click "Test" to verify
   - Click "Select" to activate

### Option 2: Use Paid Models

1. **Get API Keys**
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Anthropic**: https://console.anthropic.com/
   - **Google**: https://makersuite.google.com/app/apikey
   - **Cohere**: https://dashboard.cohere.com/api-keys

2. **Configure in UI**
   - Navigate to `/settings`
   - For each task, select your preferred model
   - Enter the API key for that provider
   - Click "Test" to verify
   - Click "Select" to activate

### Option 3: Mix & Match

You can use different models for different tasks! For example:
- **Grammar Check**: Claude 3.5 Sonnet (paid, highest quality)
- **Embeddings**: Nomic Embed Text (free, local)
- **Fact Checking**: Llama 3 70B (free, local)

## 💡 Configuration via API

### Select a Model Programmatically

```bash
curl -X POST "http://localhost:8000/api/models/select" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "grammar_check",
    "model_id": "gpt4-turbo-grammar",
    "api_key": "sk-your-api-key-here"
  }'
```

### Get Available Models

```bash
# All models for grammar checking
curl "http://localhost:8000/api/models/models/grammar_check"

# Only open-source models
curl "http://localhost:8000/api/models/models/grammar_check?open_source_only=true"
```

### Test a Configuration

```bash
curl -X POST "http://localhost:8000/api/models/test" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "grammar_check",
    "model_id": "llama3-70b-grammar"
  }'
```

### Get Current Selections

```bash
curl "http://localhost:8000/api/models/selections"
```

## ⚙️ Configuration via Environment

You can also set default API keys in `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Google
GOOGLE_API_KEY=your-key-here

# Cohere
COHERE_API_KEY=your-key-here

# Ollama (if not on localhost)
OLLAMA_BASE_URL=http://your-server:11434
```

## 🎨 UI Features

The Settings page (`/settings`) provides:

1. **Task List** - All AI tasks in the left sidebar
2. **Model Cards** - Detailed info for each available model
3. **Recommended Badge** - Best model for each task
4. **Open Source Badge** - Indicates free models
5. **API Key Input** - Securely enter API keys (hidden by default)
6. **Test Button** - Verify configuration before selecting
7. **Select Button** - Activate the model for that task
8. **Installation Hints** - For open-source models (Ollama pull commands)

## 📊 Model Comparison

### Grammar Checking

| Model | Type | Cost | Context | Speed | Quality |
|-------|------|------|---------|-------|---------|
| Llama 3 70B | Open | Free | 8K | Medium | High |
| GPT-4 Turbo | Paid | $0.01/1K | 128K | Fast | Highest |
| Claude Sonnet | Paid | $0.003/1K | 200K | Fast | Highest |
| Gemini Pro | Paid | $0.00125/1K | 2M | Fast | High |

### Embeddings

| Model | Type | Cost | Dimensions | Speed |
|-------|------|------|------------|-------|
| Nomic Embed | Open | Free | 768 | Fast |
| BGE Large | Open | Free | 1024 | Medium |
| OpenAI Large | Paid | $0.00013/1K | 3072 | Fast |
| Cohere v3 | Paid | $0.0001/1K | 1024 | Fast |

## 🔍 Best Practices

### For Cost Optimization
1. Use **open-source models for embeddings** (Nomic Embed Text)
2. Use **paid models for critical tasks** (Grammar with Claude)
3. Cache results when possible

### For Quality
1. Use **GPT-4 or Claude Opus** for grammar/language tasks
2. Use **Llama 3 70B** for factchecking (good balance)
3. Test different models and compare results

### For Privacy
1. Use **100% open-source** configuration (all Ollama)
2. Run Ollama on private infrastructure
3. No data leaves your network

### For Speed
1. Use **local models** (Ollama) for low latency
2. Use **GPT-4 Turbo** for fast API responses
3. Consider **Claude Sonnet** for best speed/quality ratio

## 🔧 Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Check available models
ollama list
```

### API Key Issues

- **OpenAI**: Ensure key starts with `sk-`
- **Anthropic**: Ensure key starts with `sk-ant-`
- **Google**: Get key from Google AI Studio, not Cloud Console
- **Cohere**: Verify account is active

### Model Not Found

```bash
# Pull the model first
ollama pull llama3:70b

# Verify it's available
ollama list
```

### Test Failures

1. Check API key is valid
2. Verify model is pulled (for Ollama)
3. Check network connectivity
4. Review logs: Backend shows detailed errors

## 📖 API Reference

### Endpoints

- `GET /api/models/tasks` - List all AI tasks
- `GET /api/models/models/{task}` - Get models for a task
- `POST /api/models/select` - Select a model
- `GET /api/models/selections` - Get current selections
- `DELETE /api/models/selections/{task}` - Clear selection (use default)
- `POST /api/models/test` - Test a model configuration
- `GET /api/models/providers` - List all providers
- `GET /api/models/recommendations` - Get recommended models

### Model Selection Request

```json
{
  "task": "grammar_check",
  "model_id": "gpt4-turbo-grammar",
  "api_key": "sk-your-key",  // Optional for open-source
  "base_url": "http://localhost:11434"  // Optional, for Ollama
}
```

## 🎓 Examples

### Python Client

```python
import requests

# Configure grammar checking with Claude
requests.post("http://localhost:8000/api/models/select", json={
    "task": "grammar_check",
    "model_id": "claude-sonnet-grammar",
    "api_key": "sk-ant-your-key"
})

# Use open-source for embeddings
requests.post("http://localhost:8000/api/models/select", json={
    "task": "embeddings",
    "model_id": "nomic-embed-text"
})
```

### JavaScript/TypeScript

```typescript
import { api } from './services/api'

// Select GPT-4 for grammar
await api.selectModel(
  'grammar_check',
  'gpt4-turbo-grammar',
  'sk-your-openai-key'
)

// Test the configuration
const result = await api.testModel('grammar_check')
console.log(result.success ? 'Working!' : 'Failed')
```

## 🔒 Security Notes

- API keys are **never logged** or stored in plain text
- Keys are **stored in memory** only (not persisted to disk by default)
- Use **environment variables** for production deployments
- Consider **AWS Secrets Manager** or similar for API key management

## 🆘 Support

- Check the [main README](../README.md) for general help
- Review [API documentation](http://localhost:8000/docs) when backend is running
- Open issues on GitHub for bugs or feature requests

## 🚀 Advanced: Adding Custom Models

Want to add your own model? Edit `backend/app/models/model_config.py`:

```python
ModelConfig(
    id="your-custom-model",
    name="Your Custom Model",
    provider=ModelProvider.OLLAMA,  # or your provider
    task=ModelTask.GRAMMAR_CHECK,
    is_open_source=True,
    context_window=8192,
    requires_api_key=False,
    recommended=False,
    model_id="your-model:tag"
)
```

Then restart the backend and it will appear in the UI!
