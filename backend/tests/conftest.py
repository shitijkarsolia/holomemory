"""Test isolation: redirect every DB-using code path to an in-memory SQLite.

Pytest auto-loads `conftest.py` before any test module is imported. We
monkey-patch `app.db.engine` and `app.db.SessionLocal` to point at a fresh
in-memory engine *before* the test modules execute their `from app.db
import engine` lines, so tests pick up the test engine. We also override
FastAPI's `get_db` dependency as belt-and-suspenders.

Without this, the existing tests use the production engine from
`app.config.DATABASE_URL` and the `Base.metadata.drop_all` calls in
`tests/test_api.py` and `tests/test_retrieval.py` happily wipe the
developer's working database (`backend/holomemory.db`) on every pytest run.
"""

from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Build a single shared in-memory engine. StaticPool keeps the *same*
# connection alive across sessions — required for `sqlite:///:memory:`
# because each new connection sees its own empty database.
_TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TEST_SESSION_LOCAL = sessionmaker(
    bind=_TEST_ENGINE,
    class_=Session,
    expire_on_commit=False,
)

# Patch BEFORE the test modules import these names. Anything that does
# `from app.db import engine` after this point gets the test engine.
import app.db as _db  # noqa: E402

_db.engine = _TEST_ENGINE
_db.SessionLocal = _TEST_SESSION_LOCAL

# Also override the FastAPI dependency. Routes use Depends(get_db);
# overriding `get_db` ensures we don't hit the real DB even if some
# import order subtlety leaves the original SessionLocal somewhere.
from app.db import get_db  # noqa: E402
from app.main import app  # noqa: E402


def _override_get_db():
    db = _TEST_SESSION_LOCAL()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture(autouse=True)
def _reset_test_db():
    """Recreate every table before each test, drop after — full isolation."""
    _db.Base.metadata.create_all(bind=_TEST_ENGINE)
    yield
    _db.Base.metadata.drop_all(bind=_TEST_ENGINE)
