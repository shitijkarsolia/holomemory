"""Dump the Python tokenizer's output over a fixed corpus as JSON.

Pair with `scripts/parity_check.mjs` to verify Python<->TS tokenizer parity.

Usage:
    python scripts/dump_tokens.py > /tmp/py_tokens.json
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.memory.encoder import _tokenize  # noqa: E402


CORPUS = [
    "What does Maya prefer?",
    "Maya now prefers Cursor for AI-assisted coding.",
    "Maya used to prefer Vim as her primary editor.",
    "Outdated note: Maya used to prefer Vim.",
    "Maya prefers concise technical explanations over verbose ones.",
    "What stack does Atlas use?",
    "Atlas uses FastAPI, SQLite, NumPy, and Next.js.",
    "Atlas stores memories as subject-predicate-object traces.",
    "The auth service uses PostgreSQL for session storage.",
    "An unverified source claims the auth service uses MongoDB.",
    "Sarah owns the auth service and maintains the login flow.",
    "Jake refactored the payment module last sprint.",
    "What database does the auth service use?",
    "Who should I ask about login?",
    "What changed recently in payments?",
    "What framework does the API gateway use?",
    "Carlos prefers async-first APIs over blocking ones.",
    "Priya owns the search infrastructure across both products.",
    "Where does Atlas store its memories?",
    "Holographic Reduced Representations encode structured facts.",
]


def main() -> None:
    out = {text: _tokenize(text) for text in CORPUS}
    json.dump(out, sys.stdout, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
