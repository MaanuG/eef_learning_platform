"""
Vercel discovers FastAPI via app.py, server.py, or index.py — not main.py.
This module re-exports the app so `uvicorn main:app` and Vercel both work.
"""
from main import app  # noqa: F401

__all__ = ["app"]
