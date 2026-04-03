#!/bin/bash

# Auto-Check Mac Setup Script
# Automates the complete setup process on macOS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is for macOS only!"
    exit 1
fi

print_header "🍎 Auto-Check Mac Setup Script"

# Check prerequisites
print_header "📋 Step 1: Checking Prerequisites"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_success "Python $PYTHON_VERSION found"
else
    print_error "Python 3 not found!"
    print_info "Install from: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION found"
else
    print_error "Node.js not found!"
    print_info "Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION found"
else
    print_error "npm not found!"
    exit 1
fi

# Check Tesseract (optional)
if command -v tesseract &> /dev/null; then
    TESSERACT_VERSION=$(tesseract --version | head -1)
    print_success "Tesseract found: $TESSERACT_VERSION"
else
    print_warning "Tesseract not found (optional, for OCR)"
    print_info "Install with: brew install tesseract"
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version)
    print_success "Ollama found: $OLLAMA_VERSION"
else
    print_warning "Ollama not found!"
    print_info "Install from: https://ollama.com/download"
    read -p "Continue without Ollama? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

print_info "Project directory: $SCRIPT_DIR"

# Backend setup
print_header "🐍 Step 2: Setting Up Backend"

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
print_info "Installing Python dependencies (this may take a few minutes)..."
pip install -r requirements.txt --quiet
print_success "Python dependencies installed"

# Download spaCy model
print_info "Downloading spaCy language model..."
python -m spacy download en_core_web_sm --quiet
print_success "spaCy model downloaded"

# Create .env file
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

# Create directories
print_info "Creating required directories..."
mkdir -p uploads chroma_db temp
print_success "Directories created"

cd ..

# Frontend setup
print_header "⚛️  Step 3: Setting Up Frontend"

cd frontend

# Install dependencies
print_info "Installing Node.js dependencies (this may take a few minutes)..."
npm install --silent
print_success "Node.js dependencies installed"

# Create .env file
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

cd ..

# Ollama setup
if command -v ollama &> /dev/null; then
    print_header "🤖 Step 4: Setting Up AI Models"

    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
        print_info "Starting Ollama service..."
        ollama serve > /dev/null 2>&1 &
        sleep 2
        print_success "Ollama service started"
    else
        print_info "Ollama service already running"
    fi

    # Check if models are already downloaded
    MODELS=$(ollama list 2>/dev/null || echo "")

    if echo "$MODELS" | grep -q "llama3:8b"; then
        print_info "Llama 3 8B model already downloaded"
    else
        print_info "Downloading Llama 3 8B model (this will take several minutes)..."
        print_warning "Download size: ~4.1 GB"
        ollama pull llama3:8b
        print_success "Llama 3 8B model downloaded"
    fi

    if echo "$MODELS" | grep -q "nomic-embed-text"; then
        print_info "Nomic Embed model already downloaded"
    else
        print_info "Downloading Nomic Embed Text model..."
        print_warning "Download size: ~274 MB"
        ollama pull nomic-embed-text
        print_success "Nomic Embed model downloaded"
    fi
else
    print_header "⚠️  Step 4: Ollama Setup Skipped"
    print_warning "Ollama not installed. You'll need to install it later."
    print_info "Download from: https://ollama.com/download"
fi

# Create a launcher script
print_header "🚀 Step 5: Creating Launcher Scripts"

cat > start.sh << 'EOF'
#!/bin/bash

# Auto-Check Launcher Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🚀 Starting Auto-Check${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Start backend in background
echo -e "${GREEN}Starting backend...${NC}"
cd backend
source venv/bin/activate
nohup uvicorn app.main:app --reload --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend in background
echo -e "${GREEN}Starting frontend...${NC}"
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}✅ Auto-Check is running!${NC}"
echo ""
echo "📊 Backend:  http://localhost:8000"
echo "🌐 Frontend: http://localhost:5173"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend/backend.log"
echo "  Frontend: tail -f frontend/frontend.log"
echo ""
echo "To stop:"
echo "  ./stop.sh"
echo ""

# Save PIDs
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
EOF

chmod +x start.sh
print_success "Created start.sh launcher"

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash

# Auto-Check Stop Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}Stopping Auto-Check...${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Stop backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo "Backend stopped (PID: $BACKEND_PID)"
    fi
    rm .backend.pid
fi

# Stop frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo "Frontend stopped (PID: $FRONTEND_PID)"
    fi
    rm .frontend.pid
fi

# Kill any remaining processes on ports
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✅ Auto-Check stopped${NC}"
EOF

chmod +x stop.sh
print_success "Created stop.sh script"

# Final summary
print_header "✅ Setup Complete!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Auto-Check is ready to use!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📂 Installation directory: $SCRIPT_DIR"
echo ""
echo "🚀 To start Auto-Check:"
echo "   ./start.sh"
echo ""
echo "⏹  To stop Auto-Check:"
echo "   ./stop.sh"
echo ""
echo "🔍 To run diagnostics:"
echo "   ./test_setup.sh"
echo ""
echo "📖 Documentation:"
echo "   - Quick Start: cat QUICKSTART.md"
echo "   - Mac Guide:   cat MAC_SETUP.md"
echo "   - VS Code:     cat VSCODE_SETUP.md"
echo ""
echo "⚙️  Next steps:"
echo "   1. Run ./start.sh to start the application"
echo "   2. Open http://localhost:5173 in your browser"
echo "   3. Go to Settings and configure AI models"
echo "   4. Upload a test deck and try it out!"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
