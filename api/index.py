"""
Vercel Serverless Function entry point for HeatRoute FastAPI Backend.
Exposes ASGI `app` instance for @vercel/python runtime.
"""
import sys
import os

# Add project root and backend directory to Python sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

for p in (PROJECT_ROOT, BACKEND_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app
