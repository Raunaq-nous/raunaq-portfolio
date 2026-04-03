# 🍎 Auto-Check for Mac - Quick Reference

This is your quick reference guide for running Auto-Check on macOS.

---

## ⚡ Quick Start (5 Minutes)

### First Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/Raunaq-nous/Auto-Check.git
cd Auto-Check
git checkout claude/deck-autocheck-implementation-011CUyprsUqaCsSn2rpBT1Ri

# 2. Run automated setup
./setup_mac.sh

# This will:
# ✅ Check all prerequisites
# ✅ Set up backend (Python virtual environment)
# ✅ Set up frontend (npm install)
# ✅ Download AI models
# ✅ Create launcher scripts
```

### Every Day Usage

```bash
# Start Auto-Check
./start.sh

# Open browser to http://localhost:5173

# When done, stop it
./stop.sh
```

---

## 📋 Prerequisites (Install These First)

Before running `setup_mac.sh`, install:

1. **Python 3.10+**
   - Download: https://www.python.org/downloads/macos/
   - Verify: `python3 --version`

2. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

3. **Ollama**
   - Download: https://ollama.com/download
   - Verify: `ollama --version`

4. **Tesseract OCR** (Optional)
   ```bash
   brew install tesseract
   # or download from: https://github.com/tesseract-ocr/tesseract
   ```

---

## 🚀 Available Commands

### Setup & Management

```bash
./setup_mac.sh       # First-time setup (run once)
./start.sh           # Start both backend and frontend
./stop.sh            # Stop all services
./test_setup.sh      # Run diagnostic tests
```

### Manual Control

```bash
# Backend only
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend only
cd frontend
npm run dev
```

---

## 🌐 URLs

Once started with `./start.sh`:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Settings**: http://localhost:5173/settings

---

## 📊 System Requirements

### Minimum
- macOS 11.0+
- 8GB RAM
- 20GB free space
- Intel or Apple Silicon processor

### Recommended
- macOS 12.0+
- 16GB RAM (for Llama 70B)
- Apple Silicon (M1/M2/M3) for GPU acceleration
- 50GB free space

---

## 🎯 First Run Checklist

After running `./setup_mac.sh` and `./start.sh`:

1. **Open browser**: http://localhost:5173
2. **Go to Settings**: Click "Settings" in navigation
3. **Select AI models**:
   - Grammar Check → Llama 3 8B
   - Fact Checking → Llama 3 8B
   - Text Embeddings → Nomic Embed Text
   - Click "Select" for each
4. **Upload test deck**: Drag and drop a PPTX or PDF
5. **Run analysis**: Click "Analyze Deck"
6. **Review results**: Check Issues and Changes tabs
7. **Test features**: Try Undo/Redo, Export

---

## 🔧 Troubleshooting

### Setup Script Fails

```bash
# Check prerequisites manually
python3 --version  # Should be 3.10+
node --version     # Should be 18+
ollama --version   # Should be installed

# Re-run setup
./setup_mac.sh
```

### Services Won't Start

```bash
# Stop everything first
./stop.sh

# Kill any stuck processes
lsof -ti :8000 | xargs kill -9
lsof -ti :5173 | xargs kill -9

# Try again
./start.sh
```

### Ollama Models Missing

```bash
# Check installed models
ollama list

# Download required models
ollama pull llama3:8b
ollama pull nomic-embed-text
```

### Port Already in Use

```bash
# Find and kill process on port 8000
lsof -ti :8000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti :5173 | xargs kill -9
```

### Performance is Slow

```bash
# Apply fast performance profile
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "ultra_fast"}'

# Or use smaller models
ollama pull llama3:8b-q4_0  # Quantized, faster
```

---

## 📚 Documentation

Full documentation available in the project:

- **MAC_SETUP.md** - Complete Mac setup guide (this file's detailed version)
- **QUICKSTART.md** - General usage guide
- **VSCODE_SETUP.md** - VS Code integration
- **docs/MULTI_MODEL_GUIDE.md** - AI model configuration
- **docs/PERFORMANCE_OPTIMIZATION.md** - Speed optimization

---

## 🏢 Corporate Environment

Working on corporate Mac with restrictions? See **MAC_SETUP.md** section 7 for:

- Using proxies for npm/pip
- Offline installation methods
- Firewall workarounds
- Alternative ports
- VPN considerations

---

## 💡 Tips & Tricks

### Apple Silicon (M1/M2/M3) Optimization

Ollama automatically uses Metal GPU acceleration:
- 50-100x faster than CPU
- Enable in Activity Monitor → Window → GPU History to verify

### Faster Analysis

```bash
# Use quantized models
ollama pull llama3:8b-q4_0

# Apply ultra-fast profile
curl -X POST "localhost:8000/api/performance/profiles/apply" \
  -d '{"profile": "ultra_fast"}'
```

### Keyboard Shortcuts (in Browser)

- **Upload**: Drag and drop file
- **Analyze**: Click button (or will auto-start)
- **Undo**: Click Undo button or Cmd+Z
- **Redo**: Click Redo button or Cmd+Shift+Z

### View Logs

```bash
# Backend logs
tail -f backend/backend.log

# Frontend logs
tail -f frontend/frontend.log

# Live updates
tail -f backend/backend.log frontend/frontend.log
```

---

## 🔄 Updating

Pull latest changes:

```bash
# Stop services
./stop.sh

# Pull updates
git pull origin claude/deck-autocheck-implementation-011CUyprsUqaCsSn2rpBT1Ri

# Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
npm install

# Restart
cd ..
./start.sh
```

---

## ❓ Quick FAQ

**Q: Do I need admin rights?**
A: No, everything installs in your user directory.

**Q: Does it work offline?**
A: Yes, after initial setup and model downloads.

**Q: How much disk space do I need?**
A: ~20GB (15GB for models, 5GB for dependencies).

**Q: Can I use paid AI models instead?**
A: Yes! Configure API keys in Settings UI.

**Q: Is my data private?**
A: Yes, everything runs locally. Data never leaves your Mac (unless using paid APIs).

**Q: What file formats are supported?**
A: PPTX and PDF files.

**Q: Maximum file size?**
A: 100MB by default (configurable in backend/.env).

---

## 📞 Getting Help

1. **Check logs**: `tail -f backend/backend.log`
2. **Run diagnostics**: `./test_setup.sh`
3. **Read full guide**: `cat MAC_SETUP.md`
4. **Check API docs**: http://localhost:8000/docs (when running)

---

## ✅ Verification

Everything working? Check these:

```bash
# All services running
curl http://localhost:8000/health
curl http://localhost:5173

# Models available
ollama list

# Performance check
curl http://localhost:8000/api/performance/benchmark
```

Expected: All commands return successfully.

---

**Happy Analyzing! 🎉**

For detailed setup instructions, see: **MAC_SETUP.md**
