# 🍎 Auto-Check Setup Guide for Mac (Corporate Environment)

Complete guide to set up and run Auto-Check on your personal Mac laptop, including workarounds for corporate restrictions.

---

## ✅ **Status Check: Repository is Clean**

All code is committed and pushed to:
- **Branch**: `claude/deck-autocheck-implementation-011CUyprsUqaCsSn2rpBT1Ri`
- **Repository**: `Raunaq-nous/Auto-Check`
- **Status**: ✅ Clean, ready to clone

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Corporate Environment Setup](#corporate-environment-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Verification & Testing](#verification--testing)
7. [Corporate Firewall Workarounds](#corporate-firewall-workarounds)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### System Requirements

- **macOS**: 11.0 (Big Sur) or later
- **RAM**: 8GB minimum (16GB recommended for Llama models)
- **Storage**: 20GB free space
- **Network**: Internet access (initial setup only)

### Check Your Mac Version

```bash
sw_vers
# ProductName: macOS
# ProductVersion: Should be 11.0+
```

---

## 2. Corporate Environment Setup

### Option A: With Admin/Homebrew Access (Recommended)

If you have Homebrew or can install it:

#### 2.1 Install Homebrew (if not already installed)

```bash
# Check if Homebrew is installed
which brew

# If not installed, install it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# If corporate firewall blocks this, see "Option B" below
```

#### 2.2 Install Prerequisites via Homebrew

```bash
# Update Homebrew
brew update

# Install Python 3.10+
brew install python@3.10

# Install Node.js 18+
brew install node@18

# Install Tesseract OCR
brew install tesseract

# Install Git (if not already installed)
brew install git

# Install Ollama (for AI models)
brew install ollama
```

**Verify installations:**
```bash
python3 --version    # Should show 3.10+
node --version       # Should show v18+
npm --version        # Should show 8+
tesseract --version  # Should show 5.0+
git --version        # Should show 2.0+
ollama --version     # Should show 0.1+
```

---

### Option B: Without Homebrew/Admin Access (Corporate Restricted)

If you don't have admin access or Homebrew is blocked:

#### 2.1 Install Python via Official Installer

1. **Download Python:**
   - Go to: https://www.python.org/downloads/macos/
   - Download: Python 3.10+ macOS installer (`.pkg`)
   - Or download on personal device and transfer via USB

2. **Install:**
   - Double-click the `.pkg` file
   - Follow installation wizard
   - Select "Install for me only" (doesn't need admin)

3. **Verify:**
   ```bash
   python3 --version
   ```

#### 2.2 Install Node.js via Official Installer

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download: LTS version macOS installer (`.pkg`)

2. **Install:**
   - Double-click the `.pkg` file
   - Select "Install for me only"

3. **Verify:**
   ```bash
   node --version
   npm --version
   ```

#### 2.3 Install Tesseract (Manual Method)

**Option 1: Pre-built Binary (Easiest)**

```bash
# Create local directory
mkdir -p ~/tools
cd ~/tools

# Download pre-built binary (on personal network or download elsewhere)
# Get from: https://github.com/tesseract-ocr/tesseract/releases

# Extract and add to PATH
echo 'export PATH="$HOME/tools/tesseract/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Option 2: Use Docker (if Docker is available)**

Skip Tesseract installation, use Docker for OCR operations.

#### 2.4 Install Ollama (Manual Method)

```bash
# Download Ollama from https://ollama.com/download
# Install the .dmg file
# No admin rights needed - installs in ~/Applications
```

---

## 3. Installation

### Step 1: Clone the Repository

```bash
# Navigate to where you want the project
cd ~/Desktop
# or
cd ~/Documents

# Clone the repository
git clone https://github.com/Raunaq-nous/Auto-Check.git
cd Auto-Check

# Checkout the correct branch
git checkout claude/deck-autocheck-implementation-011CUyprsUqaCsSn2rpBT1Ri
```

**If corporate firewall blocks GitHub:**

```bash
# Option 1: Use HTTPS with credentials
git clone https://YOUR_USERNAME@github.com/Raunaq-nous/Auto-Check.git

# Option 2: Download ZIP file
# Go to GitHub in browser, download ZIP, extract to Desktop/Auto-Check

# Option 3: Use corporate VPN/proxy
git config --global http.proxy http://proxy.company.com:8080
git clone https://github.com/Raunaq-nous/Auto-Check.git
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd ~/Desktop/Auto-Check/backend
# or wherever you cloned it

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Your prompt should now show (venv)

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm

# Create environment file
cp .env.example .env

# Create required directories
mkdir -p uploads chroma_db temp
```

**If pip install fails due to corporate proxy:**

```bash
# Set pip proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
pip install --proxy http://proxy.company.com:8080 -r requirements.txt

# Or download wheels offline and install manually
# See "Corporate Firewall Workarounds" section
```

### Step 3: Frontend Setup

```bash
# Open new terminal tab (Cmd+T)
cd ~/Desktop/Auto-Check/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**If npm install fails due to corporate proxy:**

```bash
# Set npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or use company's npm registry
npm config set registry http://npm.company.com

# Try again
npm install
```

### Step 4: Install AI Models

```bash
# Start Ollama service (if not auto-started)
ollama serve &

# Pull recommended models
ollama pull llama3:8b
ollama pull nomic-embed-text

# This will download ~4GB of data
# Expected time: 5-15 minutes depending on connection
```

**Progress indicators:**
```
pulling manifest
pulling 4d7d1e5b3e7c... 100% ▕████████████████▏ 4.1 GB
pulling 8c17c2ebb0ea... 100% ▕████████████████▏ 7.0 KB
...
success
```

---

## 4. Configuration

### Step 1: Configure Backend Environment

Edit `backend/.env`:

```bash
# Open in your preferred editor
open -a TextEdit backend/.env
# or
nano backend/.env
# or
code backend/.env  # if using VS Code
```

**Minimal required configuration:**

```env
# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# CORS (allows frontend to connect)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Storage
UPLOAD_DIR=./uploads
CHROMA_PERSIST_DIR=./chroma_db
TEMP_DIR=./temp

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_EXTENSIONS=[".pptx",".pdf"]

# Logging
LOG_LEVEL=INFO
```

**Optional (for paid AI models):**
```env
OPENAI_API_KEY=sk-your-key-here  # Only if using OpenAI
```

### Step 2: Configure Frontend Environment

Edit `frontend/.env`:

```bash
open -a TextEdit frontend/.env
```

```env
VITE_API_URL=http://localhost:8000
```

---

## 5. Running the Application

### Method 1: Using VS Code (Recommended)

If you have VS Code:

```bash
# Open project in VS Code
cd ~/Desktop/Auto-Check
code .

# Then in VS Code:
# Press Cmd+Shift+P
# Type "Tasks: Run Task"
# Select "Start Both (Backend + Frontend)"
```

See [VSCODE_SETUP.md](VSCODE_SETUP.md) for complete VS Code guide.

### Method 2: Using Terminal (Manual)

Open **two terminal windows/tabs**:

**Terminal 1 - Backend:**
```bash
cd ~/Desktop/Auto-Check/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Terminal 2 - Frontend:**
```bash
cd ~/Desktop/Auto-Check/frontend
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Method 3: Using the Test Script

```bash
cd ~/Desktop/Auto-Check
chmod +x test_setup.sh
./test_setup.sh
```

This will verify everything is working before you start.

---

## 6. Verification & Testing

### Step 1: Check Services are Running

**Backend health check:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Frontend check:**
```bash
curl http://localhost:5173
# Should return HTML content
```

### Step 2: Open in Browser

Open **Safari** (or Chrome/Firefox):
```
http://localhost:5173
```

You should see the Auto-Check interface!

### Step 3: Configure AI Models

1. Click **"Settings"** in the top navigation
2. For each task category:
   - Select **"Llama 3 8B"** from dropdown
   - Click **"Select"** button
3. Verify green checkmark appears

**Tasks to configure:**
- ✅ Grammar Check → Llama 3 8B
- ✅ Fact Checking → Llama 3 8B
- ✅ Text Embeddings → Nomic Embed Text
- ✅ Style Guide → Llama 3 8B
- ✅ RAG Embeddings → Nomic Embed Text

### Step 4: Test with a Sample Deck

1. **Upload a test file:**
   - Drag and drop a `.pptx` or `.pdf` file
   - Or click "Upload Deck" button

2. **Run analysis:**
   - Click "Analyze Deck"
   - Wait for progress bar to complete
   - Expected time: 30 seconds - 2 minutes for 10-slide deck

3. **Review results:**
   - Check "Issues" tab for detected problems
   - Check "Changes" tab for applied fixes
   - Test Undo/Redo functionality

4. **Export:**
   - Click "Export" button
   - Download annotated PDF or JSON report

---

## 7. Corporate Firewall Workarounds

### Issue: Cannot Access GitHub

**Solution 1: Download ZIP**
```bash
# On personal network or using phone hotspot:
# 1. Go to https://github.com/Raunaq-nous/Auto-Check
# 2. Click "Code" → "Download ZIP"
# 3. Transfer to Mac via AirDrop/USB
# 4. Extract to desired location
```

**Solution 2: Use Corporate VPN**
```bash
# Connect to corporate VPN first, then clone
git clone https://github.com/Raunaq-nous/Auto-Check.git
```

**Solution 3: Use Git over HTTPS with Proxy**
```bash
git config --global http.proxy http://proxy.company.com:8080
git config --global https.proxy http://proxy.company.com:8080
git clone https://github.com/Raunaq-nous/Auto-Check.git
```

### Issue: pip/npm Cannot Download Packages

**Solution 1: Use Proxy**
```bash
# For pip:
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
pip install -r requirements.txt

# For npm:
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
npm install
```

**Solution 2: Download Dependencies Offline**

```bash
# On personal network (home/phone hotspot):
# 1. Download all dependencies
pip download -r requirements.txt -d ~/Downloads/pip-packages
npm pack  # for frontend dependencies

# 2. Transfer to corporate Mac via USB/AirDrop

# 3. Install from local files
cd ~/Desktop/Auto-Check/backend
source venv/bin/activate
pip install --no-index --find-links ~/Downloads/pip-packages -r requirements.txt
```

**Solution 3: Use Corporate Package Mirrors**
```bash
# If your company has internal mirrors:
pip install --index-url http://pypi.company.com/simple -r requirements.txt
npm config set registry http://npm.company.com
```

### Issue: Ollama Cannot Download Models

**Solution 1: Download on Personal Network**
```bash
# Connect to personal network (home WiFi, phone hotspot)
ollama pull llama3:8b
ollama pull nomic-embed-text

# Models are cached locally, will work offline after download
```

**Solution 2: Use Smaller Models**
```bash
# If bandwidth is limited, use quantized versions:
ollama pull llama3:8b-q4_0  # 2.3GB instead of 4.1GB
ollama pull llama3:8b-q8_0  # 3.8GB, better quality
```

**Solution 3: Manual Model Download**
```bash
# Download model files from Ollama website on personal network
# Transfer to: ~/.ollama/models/
# See: https://github.com/ollama/ollama/blob/main/docs/import.md
```

### Issue: Port 8000 or 5173 Blocked

**Solution: Use Different Ports**

Backend:
```bash
# Edit backend/.env
API_PORT=8888  # or any available port

# Start with custom port
uvicorn app.main:app --reload --port 8888
```

Frontend:
```bash
# Edit frontend/.env
VITE_API_URL=http://localhost:8888

# Start with custom port
npm run dev -- --port 5555
```

---

## 8. Troubleshooting

### Issue: "python3: command not found"

**Fix:**
```bash
# Check if Python is installed
which python
which python3

# If using official installer, it might be at:
/Library/Frameworks/Python.framework/Versions/3.10/bin/python3

# Add to PATH in ~/.zshrc:
echo 'export PATH="/Library/Frameworks/Python.framework/Versions/3.10/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: "venv activation doesn't work"

**Fix:**
```bash
# Check your shell
echo $SHELL
# If /bin/zsh (default on modern macOS):
source venv/bin/activate

# If /bin/bash:
source venv/bin/activate

# Verify activation:
which python  # Should point to venv/bin/python
```

### Issue: "Permission denied" when creating directories

**Fix:**
```bash
# Ensure you own the directory
cd ~/Desktop/Auto-Check/backend
sudo chown -R $(whoami) .

# Or create in home directory only:
mkdir -p ~/Auto-Check-Data/{uploads,chroma_db,temp}

# Update backend/.env:
UPLOAD_DIR=~/Auto-Check-Data/uploads
CHROMA_PERSIST_DIR=~/Auto-Check-Data/chroma_db
TEMP_DIR=~/Auto-Check-Data/temp
```

### Issue: "Ollama service not running"

**Fix:**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama
ollama serve &

# Or start manually in background:
nohup ollama serve > /dev/null 2>&1 &

# Verify:
curl http://localhost:11434/api/tags
```

### Issue: "Port already in use"

**Fix:**
```bash
# Find process using port 8000
lsof -ti :8000

# Kill the process
lsof -ti :8000 | xargs kill -9

# For port 5173:
lsof -ti :5173 | xargs kill -9
```

### Issue: "Module not found" errors

**Fix:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt

# For spaCy model:
python -m spacy download en_core_web_sm
```

### Issue: npm install fails with EACCES

**Fix:**
```bash
# Fix npm permissions (don't use sudo)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Try again
npm install
```

### Issue: Slow performance with AI models

**Fix:**
```bash
# 1. Use smaller/quantized models
ollama pull llama3:8b-q4_0  # Faster, less memory

# 2. Apply performance profile
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -H "Content-Type: application/json" \
  -d '{"profile": "ultra_fast"}'

# 3. Check if using GPU (M1/M2/M3 Macs have GPU acceleration)
# Ollama automatically uses Metal on Apple Silicon

# 4. Close other applications to free RAM
```

### Issue: Corporate antivirus blocks Python/Node

**Fix:**
```bash
# Add exceptions in your antivirus for:
# - Python installation directory
# - Node installation directory
# - Project directory: ~/Desktop/Auto-Check
# - Virtual environment: ~/Desktop/Auto-Check/backend/venv

# Or run from a location antivirus doesn't scan:
# Move project to ~/Documents/Auto-Check
```

---

## 9. Mac-Specific Optimizations

### For Apple Silicon (M1/M2/M3) Macs

**Optimizations automatically enabled:**
- ✅ Ollama uses Metal GPU acceleration (50-100x faster)
- ✅ TensorFlow/PyTorch use Apple Silicon optimizations
- ✅ Native ARM64 Python packages

**Verify GPU usage:**
```bash
# Check Activity Monitor
# Go to: Window → GPU History
# Should show GPU usage when analyzing decks
```

### For Intel Macs

**Use smaller models for better performance:**
```bash
ollama pull llama3:8b-q4_0  # Quantized, faster on CPU
```

**Apply fast performance profile:**
```bash
curl -X POST "http://localhost:8000/api/performance/profiles/apply" \
  -d '{"profile": "ultra_fast"}'
```

---

## 10. Complete Step-by-Step Checklist

Print this and check off as you go:

### Prerequisites
- [ ] macOS 11.0+ verified (`sw_vers`)
- [ ] Python 3.10+ installed (`python3 --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Tesseract installed (`tesseract --version`)
- [ ] Ollama installed (`ollama --version`)
- [ ] Git installed (`git --version`)

### Installation
- [ ] Repository cloned to `~/Desktop/Auto-Check`
- [ ] Checked out correct branch
- [ ] Backend venv created
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] spaCy model downloaded
- [ ] Backend `.env` file created
- [ ] Backend directories created (`uploads`, `chroma_db`, `temp`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend `.env` file created
- [ ] Ollama models pulled (`llama3:8b`, `nomic-embed-text`)

### Configuration
- [ ] Backend `.env` configured correctly
- [ ] Frontend `.env` has correct API URL
- [ ] Python interpreter selected (if using VS Code)

### Running
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check passes: `curl localhost:8000/health`
- [ ] Frontend loads: http://localhost:5173
- [ ] AI models configured in Settings UI

### Testing
- [ ] Test file uploaded successfully
- [ ] Analysis completes without errors
- [ ] Issues are displayed
- [ ] Changes can be applied
- [ ] Undo/Redo works
- [ ] Export works (PDF/JSON)

### Performance
- [ ] Benchmark run: `curl localhost:8000/api/performance/benchmark`
- [ ] Performance acceptable (<5s per check)
- [ ] Cache working (check stats after 2-3 analyses)

---

## 11. Quick Start Commands (Copy-Paste)

```bash
# === STEP 1: CLONE REPOSITORY ===
cd ~/Desktop
git clone https://github.com/Raunaq-nous/Auto-Check.git
cd Auto-Check
git checkout claude/deck-autocheck-implementation-011CUyprsUqaCsSn2rpBT1Ri

# === STEP 2: BACKEND SETUP ===
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env
mkdir -p uploads chroma_db temp

# === STEP 3: FRONTEND SETUP ===
cd ../frontend
npm install
cp .env.example .env

# === STEP 4: AI MODELS ===
ollama serve &
ollama pull llama3:8b
ollama pull nomic-embed-text

# === STEP 5: RUN ===
# Terminal 1:
cd ~/Desktop/Auto-Check/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 (new tab - Cmd+T):
cd ~/Desktop/Auto-Check/frontend
npm run dev

# === STEP 6: OPEN BROWSER ===
# Go to: http://localhost:5173
```

---

## 12. Next Steps After Setup

Once everything is running:

1. **Read the documentation:**
   - [QUICKSTART.md](QUICKSTART.md) - General usage guide
   - [VSCODE_SETUP.md](VSCODE_SETUP.md) - VS Code integration
   - [docs/MULTI_MODEL_GUIDE.md](docs/MULTI_MODEL_GUIDE.md) - AI model options
   - [docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md) - Speed tips

2. **Set up knowledge base (optional):**
   ```bash
   cd backend
   python scripts/setup_rag.py
   ```

3. **Try different models:**
   - Test open-source vs paid
   - Compare speed vs quality
   - Find your optimal setup

4. **Optimize for your workflow:**
   - Apply performance profiles
   - Customize rule engines
   - Set up keyboard shortcuts

---

## 📞 Support

**Documentation:**
- `/docs` folder in project
- http://localhost:8000/docs (API reference when running)

**Common Issues:**
- See "Troubleshooting" section above
- See "Corporate Firewall Workarounds" section

**Performance:**
- [docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)
- Target: <2s per check on Apple Silicon, <5s on Intel

---

## ✅ Verification Command

Run this to verify everything works:

```bash
cd ~/Desktop/Auto-Check
./test_setup.sh
```

Expected output: All tests pass ✅

---

**You're all set! Happy analyzing! 🎉**
