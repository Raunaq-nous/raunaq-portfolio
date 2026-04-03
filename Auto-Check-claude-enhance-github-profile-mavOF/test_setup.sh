#!/bin/bash

# Auto-Check Setup Test Script
# Run this script to verify your installation

set -e

echo "================================================"
echo "🧪 Auto-Check Installation Test"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test a command
test_command() {
    local name=$1
    local command=$2

    echo -n "Testing $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Testing $name... "
    if curl -s "$url" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "📋 Checking Prerequisites..."
echo "-------------------------------------------"

# Check Python
test_command "Python 3.10+" "python3 --version | grep -E 'Python 3\.(1[0-9]|[2-9][0-9])'"

# Check Node.js
test_command "Node.js 18+" "node --version | grep -E 'v(1[8-9]|[2-9][0-9])'"

# Check npm
test_command "npm" "npm --version"

# Check pip
test_command "pip" "pip --version"

# Check Tesseract
test_command "Tesseract OCR" "tesseract --version"

# Check Ollama (optional but recommended)
if test_command "Ollama" "curl -s http://localhost:11434/api/tags"; then
    echo -e "${YELLOW}ℹ️  Checking Ollama models...${NC}"

    # Check for recommended models
    OLLAMA_MODELS=$(curl -s http://localhost:11434/api/tags)

    if echo "$OLLAMA_MODELS" | grep -q "llama3"; then
        echo -e "  ${GREEN}✓${NC} Llama 3 model found"
    else
        echo -e "  ${YELLOW}!${NC} Llama 3 not found. Run: ollama pull llama3:8b"
    fi

    if echo "$OLLAMA_MODELS" | grep -q "nomic-embed"; then
        echo -e "  ${GREEN}✓${NC} Nomic Embed model found"
    else
        echo -e "  ${YELLOW}!${NC} Nomic Embed not found. Run: ollama pull nomic-embed-text"
    fi
else
    echo -e "${YELLOW}⚠️  Ollama not running or not installed${NC}"
    echo -e "   Install from: https://ollama.com/download"
fi

echo ""
echo "📦 Checking Project Setup..."
echo "-------------------------------------------"

# Check backend directory
test_command "Backend directory" "test -d backend"

# Check frontend directory
test_command "Frontend directory" "test -d frontend"

# Check backend dependencies
test_command "Backend venv" "test -d backend/venv"

# Check frontend dependencies
test_command "Frontend node_modules" "test -d frontend/node_modules"

# Check environment files
if test -f backend/.env; then
    echo -e "Backend .env... ${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Backend .env... ${YELLOW}⚠️  WARNING${NC} (copy from .env.example)"
fi

if test -f frontend/.env; then
    echo -e "Frontend .env... ${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "Frontend .env... ${YELLOW}⚠️  WARNING${NC} (copy from .env.example)"
fi

echo ""
echo "🌐 Checking Running Services..."
echo "-------------------------------------------"

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "Backend API... ${GREEN}✅ RUNNING${NC}"
    ((PASSED++))

    # Test API endpoints
    test_endpoint "Health endpoint" "http://localhost:8000/health" "status"
    test_endpoint "Model tasks API" "http://localhost:8000/api/models/tasks" "grammar"
    test_endpoint "Performance API" "http://localhost:8000/api/performance/profiles" "ultra_fast"

    # Get cache stats
    echo -n "Cache statistics... "
    CACHE_STATS=$(curl -s http://localhost:8000/api/performance/cache/stats)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        echo "$CACHE_STATS" | python3 -m json.tool 2>/dev/null | head -20
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi

else
    echo -e "Backend API... ${RED}❌ NOT RUNNING${NC}"
    echo -e "   Start with: cd backend && uvicorn app.main:app --reload"
    ((FAILED++))
fi

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "Frontend... ${GREEN}✅ RUNNING${NC}"
    ((PASSED++))
else
    echo -e "Frontend... ${YELLOW}⚠️  NOT RUNNING${NC}"
    echo -e "   Start with: cd frontend && npm run dev"
fi

echo ""
echo "🚀 Performance Check..."
echo "-------------------------------------------"

if curl -s http://localhost:8000/api/performance/benchmark > /dev/null 2>&1; then
    echo "Running benchmark..."
    BENCHMARK=$(curl -s http://localhost:8000/api/performance/benchmark)
    echo "$BENCHMARK" | python3 -m json.tool 2>/dev/null || echo "$BENCHMARK"

    # Check if performance is good
    AVG_TIME=$(echo "$BENCHMARK" | grep -oP '"average_time":\s*\K[0-9.]+' 2>/dev/null || echo "999")
    if (( $(echo "$AVG_TIME < 2.0" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${GREEN}✅ Performance: EXCELLENT (<2s)${NC}"
    elif (( $(echo "$AVG_TIME < 5.0" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}⚠️  Performance: ACCEPTABLE (2-5s)${NC}"
    else
        echo -e "${RED}❌ Performance: NEEDS OPTIMIZATION (>5s)${NC}"
        echo -e "   See: docs/PERFORMANCE_OPTIMIZATION.md"
    fi
fi

echo ""
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "🎉 Your Auto-Check installation is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:5173 in your browser"
    echo "  2. Configure AI models in Settings"
    echo "  3. Upload a test deck"
    echo "  4. Run analysis"
    echo ""
    echo "📖 See QUICKSTART.md for detailed usage guide"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    echo "See QUICKSTART.md for troubleshooting help."
    exit 1
fi
