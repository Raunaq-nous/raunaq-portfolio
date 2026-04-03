# 🚀 Auto-Check Quick Start Guide

Complete guide to set up, run, and test the Auto-Check deck analysis tool.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing the Tool](#testing-the-tool)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Python 3.10+**
   ```bash
   python --version  # Should be 3.10 or higher
   ```

2. **Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   npm --version
   ```

3. **Tesseract OCR** (for chart label extraction)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr

   # macOS
   brew install tesseract

   # Windows
   # Download from: https://github.com/UB-Mannheim/tesseract/wiki
   ```

4. **Ollama** (for open-source AI models - recommended)
   ```bash
   # Install from: https://ollama.com/download

   # Or via command line:
   # Linux/macOS
   curl -fsSL https://ollama.com/install.sh | sh

   # Windows: Download installer from website
   ```

### Optional Software

- **Docker** (if you prefer container deployment)
- **Git** (for version control)

---

## Installation

### Step 1: Clone/Navigate to Repository

```bash
cd /home/user/Auto-Check
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Download spaCy language model (for NLP)
python -m spacy download en_core_web_sm
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install Node.js dependencies
npm install
```

---

## Configuration

### Step 1: Backend Environment

Create environment file:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your preferred settings:
```env
# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
ALLOWED_EXTENSIONS=[".pptx",".pdf"]

# Storage
CHROMA_PERSIST_DIR=./chroma_db
TEMP_DIR=./temp

# OpenAI (OPTIONAL - only if using paid models)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# RAG Settings
RAG_TOP_K=5
RAG_CONFIDENCE_THRESHOLD=0.7

# Logging
LOG_LEVEL=INFO
```

**Note**: You don't need OpenAI API key if using open-source models via Ollama!

### Step 2: Frontend Environment

Create environment file:
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Step 3: Set Up AI Models

**Option A: Open-Source Models (Recommended for Getting Started)**

```bash
# Install Ollama first (see Prerequisites)
# Then pull the recommended models:

# Fast models (recommended)
ollama pull llama3:8b           # Grammar, fact-checking (4GB)
ollama pull nomic-embed-text    # Text embeddings (274MB)

# Alternative: High-quality models (slower but better)
ollama pull llama3:70b          # Best quality (40GB)
ollama pull mistral:7b          # Alternative option (4GB)
```

**Option B: Paid Models**

Get API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Google AI: https://makersuite.google.com/app/apikey
- Cohere: https://dashboard.cohere.com/api-keys

You'll configure these in the UI after starting the app.

### Step 4: Create Required Directories

```bash
cd backend
mkdir -p uploads chroma_db temp
```

---

## Running the Application

### Method 1: Manual Start (Recommended for Development)

**Terminal 1 - Start Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Method 2: Docker (Optional)

```bash
# From project root
docker-compose up
```

### Verify Services

- **Frontend**: Open http://localhost:5173
- **Backend API Docs**: Open http://localhost:8000/docs
- **Backend Health**: `curl http://localhost:8000/health`

---

## Testing the Tool

### Step 1: Configure AI Models (First Time)

1. **Navigate to Settings:**
   - Open http://localhost:5173/settings
   - Or click "Settings" in the navigation menu

2. **Select Models for Each Task:**

   For **open-source setup** (free):
   - Grammar Check: Select "Llama 3 8B"
   - Fact Checking: Select "Llama 3 8B"
   - Text Embeddings: Select "Nomic Embed Text"
   - Click "Select" for each model

   For **paid setup**:
   - Enter API key for your chosen provider
   - Select models (e.g., GPT-4, Claude 3.5)
   - Click "Test Connection" to verify

3. **Apply Performance Profile (Optional but Recommended):**
   ```bash
   # Use the balanced profile for best speed/quality
   curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
     -H "Content-Type: application/json" \
     -d '{"profile": "balanced"}'
   ```

### Step 2: Upload a Test Deck

**Option A: Via Web UI**

1. Go to http://localhost:5173
2. Click "Upload Deck" or drag-and-drop a PPTX/PDF file
3. Wait for upload to complete

**Option B: Via API**

```bash
# Test with a sample file
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@/path/to/your/presentation.pptx"
```

### Step 3: Run Analysis

**Via Web UI:**
1. After upload, click "Analyze Deck"
2. Wait for analysis to complete (progress bar shows status)
3. View issues in the Issues Panel

**Via API:**
```bash
# Replace {deck_id} with the ID from upload response
curl -X POST "http://localhost:8000/api/analyze/{deck_id}"

# Check analysis status
curl "http://localhost:8000/api/status/{deck_id}"
```

### Step 4: Review Issues

The UI will show:
- **Issues Tab**: All detected issues by category
  - Formatting & Hierarchy
  - Language & Style
  - Numeric & Valuation
  - Chart Integrity
  - RAG-Based Facts

- **Changes Tab**: Applied fixes with before/after
  - Each change shows confidence score
  - Rationale and citations provided

### Step 5: Test Undo/Redo

1. Click "Apply" on any issue to auto-fix
2. Use "Undo" button to revert
3. Use "Redo" to reapply
4. Changes are tracked in real-time

### Step 6: Export Results

**Via Web UI:**
1. Click "Export" button
2. Choose format:
   - Annotated PDF (with highlights)
   - JSON report
   - Side-by-side diff

**Via API:**
```bash
curl "http://localhost:8000/api/export/{deck_id}?format=pdf" \
  --output result.pdf
```

---

## Performance Optimization

### Quick Performance Check

```bash
# Benchmark your current setup
curl "http://localhost:8000/api/performance/benchmark"
```

**Target Times:**
- **Good Performance**: <2 seconds per check
- **Acceptable**: 2-5 seconds per check
- **Needs Optimization**: >5 seconds per check

### Speed Up Analysis

**1. Use Fast Models (4-8x faster):**
```bash
# Instead of llama3:70b, use llama3:8b
ollama pull llama3:8b

# Apply fast profile
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "ultra_fast"}'
```

**2. Enable GPU Acceleration (50-100x faster):**
```bash
# Verify GPU is available
ollama list  # Should show GPU info

# GPU is automatically used if available
# Check GPU usage: nvidia-smi (NVIDIA) or rocm-smi (AMD)
```

**3. Check Cache Performance:**
```bash
# View cache statistics
curl "http://localhost:8000/api/performance/cache/stats"

# Good cache hit rate: >50% after a few analyses
```

**4. Use Quantized Models (2-4x faster):**
```bash
# Q4 quantization (faster, good quality)
ollama pull llama3:8b-q4_0

# Q8 quantization (balanced)
ollama pull llama3:8b-q8_0
```

### Performance Profiles

| Profile | Speed | Quality | Best For |
|---------|-------|---------|----------|
| `ultra_fast` | Fastest | Good | Quick checks, drafts |
| `balanced` | Fast | High | ⭐ Recommended for most users |
| `quality` | Slower | Best | Final reviews, critical decks |

Apply a profile:
```bash
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "balanced"}'
```

**📖 Full Performance Guide**: See [docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)

---

## Troubleshooting

### Backend Issues

**Issue: "Module not found" errors**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: "Tesseract not found"**
```bash
# Install Tesseract OCR (see Prerequisites)
# On Linux: sudo apt-get install tesseract-ocr
# Verify: tesseract --version
```

**Issue: "ChromaDB errors"**
```bash
# Delete and recreate database
rm -rf backend/chroma_db
mkdir backend/chroma_db

# Restart backend
```

**Issue: "Port 8000 already in use"**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9  # Linux/macOS
# Or use different port:
uvicorn app.main:app --port 8001
```

### Frontend Issues

**Issue: "Cannot connect to backend"**
- Verify backend is running: `curl http://localhost:8000/health`
- Check `frontend/.env` has correct `VITE_API_URL`
- Check CORS settings in `backend/.env`

**Issue: "npm install fails"**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### AI Model Issues

**Issue: "Ollama connection refused"**
```bash
# Verify Ollama is running
ollama list

# Start Ollama service (if not running)
# Linux/macOS: Should auto-start
# Windows: Check system tray

# Test connection
curl http://localhost:11434/api/tags
```

**Issue: "Model not found"**
```bash
# List available models
ollama list

# Pull missing model
ollama pull llama3:8b
ollama pull nomic-embed-text
```

**Issue: "Out of memory with Llama 70B"**
```bash
# Use smaller model
ollama pull llama3:8b  # Only 4GB instead of 40GB

# Or use quantized version
ollama pull llama3:70b-q4_0  # Reduced memory footprint
```

**Issue: "OpenAI API errors"**
- Verify API key is correct
- Check account has credits/active subscription
- Test in Settings page before analyzing

### Performance Issues

**Issue: "Analysis is too slow"**
```bash
# 1. Apply fast profile
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "ultra_fast"}'

# 2. Use smaller models
ollama pull llama3:8b  # Instead of 70b

# 3. Enable GPU (if available)
# Check: nvidia-smi or rocm-smi

# 4. Reduce deck size for testing
# Use 5-10 slide decks first
```

**Issue: "Cache not helping"**
```bash
# Check cache stats
curl "http://localhost:8000/api/performance/cache/stats"

# Clear and rebuild cache
curl -X POST "http://localhost:8000/api/performance/cache/clear"
```

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Can configure AI models in Settings page
- [ ] Can upload PPTX file
- [ ] Can upload PDF file
- [ ] Analysis completes successfully
- [ ] Issues are displayed in UI
- [ ] Can apply auto-fixes
- [ ] Undo/Redo works correctly
- [ ] Can export results
- [ ] Performance is acceptable (<5s per slide)

---

## Quick Test Script

Run this comprehensive test:

```bash
#!/bin/bash
# Save as test_autocheck.sh and run: bash test_autocheck.sh

echo "🧪 Testing Auto-Check Setup..."

# Test backend
echo "1. Testing backend..."
curl -s http://localhost:8000/health && echo "✅ Backend OK" || echo "❌ Backend FAILED"

# Test model selections
echo "2. Testing AI model config..."
curl -s http://localhost:8000/api/models/tasks | grep -q "grammar" && echo "✅ Model API OK" || echo "❌ Model API FAILED"

# Test Ollama
echo "3. Testing Ollama..."
curl -s http://localhost:11434/api/tags | grep -q "models" && echo "✅ Ollama OK" || echo "❌ Ollama not running"

# Test performance
echo "4. Running performance benchmark..."
curl -s http://localhost:8000/api/performance/benchmark

# Test cache
echo "5. Checking cache stats..."
curl -s http://localhost:8000/api/performance/cache/stats

echo "✅ Test complete!"
```

---

## Next Steps

Once everything is running:

1. **Read the guides:**
   - [Multi-Model Configuration Guide](docs/MULTI_MODEL_GUIDE.md)
   - [Performance Optimization Guide](docs/PERFORMANCE_OPTIMIZATION.md)
   - [RAG Knowledge Base Setup](backend/docs/RAG_SETUP.md)

2. **Configure your knowledge base:**
   ```bash
   cd backend
   python scripts/setup_rag.py
   ```

3. **Try different models:**
   - Compare open-source vs paid
   - Test speed vs quality tradeoffs
   - Find your optimal configuration

4. **Optimize for your use case:**
   - Apply performance profiles
   - Adjust confidence thresholds
   - Customize rule engines

---

## Support

- **Documentation**: See `/docs` folder
- **API Reference**: http://localhost:8000/docs (when running)
- **Issues**: Check troubleshooting section above
- **Performance**: See [PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)

---

**Happy Analyzing! 🎉**
