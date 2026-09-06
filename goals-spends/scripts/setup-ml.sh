#!/bin/bash
# Ensures the ml/venv virtual environment exists with runtime + test dependencies
# installed. Used by `npm run test:ml` and safe to run standalone.

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ML_DIR="$REPO_ROOT/ml"
VENV_DIR="$ML_DIR/venv"

if ! command -v python3 &> /dev/null; then
  echo "✗ Python 3 is not installed" >&2
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment at $VENV_DIR ..."
  python3 -m venv "$VENV_DIR"
fi

PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

if ! "$PYTHON" -c "import fastapi" 2>/dev/null; then
  echo "Installing ml/requirements.txt ..."
  "$PIP" install -q -r "$ML_DIR/requirements.txt"
fi

if ! "$PYTHON" -c "import pytest" 2>/dev/null; then
  echo "Installing ml/requirements-dev.txt ..."
  "$PIP" install -q -r "$ML_DIR/requirements-dev.txt"
fi

echo "✓ ML engine environment ready ($VENV_DIR)"
