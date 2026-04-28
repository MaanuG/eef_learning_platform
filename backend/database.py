from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Default: embedded SQLite at backend/data/eef.sqlite (no external database process).
# Set DATABASE_URL to use PostgreSQL (e.g. docker-compose, Render, Neon).
_backend_dir = Path(__file__).resolve().parent
_data_dir = _backend_dir / "data"
_data_dir.mkdir(exist_ok=True)
_embedded_db = _data_dir / "eef.sqlite"
_default_embedded = f"sqlite:///{_embedded_db.resolve().as_posix()}"

DATABASE_URL = os.getenv("DATABASE_URL", _default_embedded)

# Fix for Render's postgres:// URL format
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    # Required when using SQLite with FastAPI/uvicorn (multiple threads)
    _connect_args["check_same_thread"] = False
elif DATABASE_URL.startswith("postgresql"):
    _connect_args["connect_timeout"] = 10

# SQLite does not benefit from connection pooling the same way; pre_ping still ok on postgres
_use_pre_ping = not DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=_use_pre_ping,
    connect_args=_connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
