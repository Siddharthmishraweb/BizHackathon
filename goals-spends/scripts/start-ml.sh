#!/bin/bash
# Start the Goal Achievement Intelligence Engine

set -e

echo "=========================================="
echo "Goal Achievement Intelligence Engine"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (resolved relative to this script's location, not a hardcoded path)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ML_DIR="$REPO_ROOT/ml"
BACKEND_PORT=5000
ML_API_PORT=8000
VENV_DIR="$ML_DIR/venv"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 found${NC}"

cd "$ML_DIR"

# Use a virtual environment so we don't hit macOS/Homebrew's
# "externally-managed-environment" restriction on system pip
if [ ! -d "$VENV_DIR" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

# Check if dependencies are installed
echo ""
echo "Checking dependencies..."

if ! "$PYTHON" -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing dependencies (this may take a minute)...${NC}"
    if ! "$PIP" install -r requirements.txt > "$ML_DIR/.pip_install.log" 2>&1; then
        echo -e "${RED}✗ Dependency installation failed. Last 40 log lines:${NC}"
        tail -n 40 "$ML_DIR/.pip_install.log"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Start ML API Server
echo ""
echo "Starting ML API Server on port $ML_API_PORT..."
echo ""

"$PYTHON" -m uvicorn api:app --reload --port $ML_API_PORT --host 0.0.0.0 &
ML_PID=$!
trap 'kill $ML_PID 2>/dev/null' EXIT INT TERM

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:$ML_API_PORT/health > /dev/null; then
    echo -e "${GREEN}✓ ML API Server is running${NC}"
    echo ""
    echo "=========================================="
    echo "Services Available:"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}ML API${NC}"
    echo "  URL: http://localhost:$ML_API_PORT"
    echo "  Health: http://localhost:$ML_API_PORT/health"
    echo "  Docs: http://localhost:$ML_API_PORT/docs"
    echo ""
    echo "Endpoints:"
    echo "  POST /api/v1/analyze/situation"
    echo "  POST /api/v1/analyze/goals"
    echo "  POST /api/v1/analyze/comprehensive"
    echo "  POST /api/v1/recommendations/generate"
    echo "  POST /api/v1/simulation/monte-carlo"
    echo ""
    echo -e "${YELLOW}Note: Express backend should be running on port $BACKEND_PORT${NC}"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=========================================="
    echo ""
    
    # Keep the script running
    wait $ML_PID
else
    echo -e "${RED}✗ Failed to start ML API Server${NC}"
    exit 1
fi
