"""Dump symbol_vector() output for a fixed corpus as JSON.

Pair with `scripts/parity_check.mjs` to verify Python<->TS HRR vector parity.

Usage:
    python scripts/dump_vectors.py > /tmp/py_vectors.json
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.memory.hrr import symbol_vector  # noqa: E402


# Mix of role tokens, common words, and edge cases (unicode, digits, casing).
SYMBOLS = [
    "__ROLE_SUBJECT__",
    "__ROLE_PREDICATE__",
    "__ROLE_OBJECT__",
    "__ROLE_ENTITY__",
    "__ROLE_TAG__",
    "__ROLE_TOKEN__",
    "maya",
    "atlas",
    "fastapi",
    "sqlite",
    "postgresql",
    "auth",
    "service",
    "vim",
    "cursor",
    "1",
    "42",
    "ünïcödë",
    "",
]


def main() -> None:
    out: dict[str, list[float]] = {}
    for name in SYMBOLS:
        # Sample first 16 components — full 1024 is unwieldy but 16 is more
        # than enough to detect any algorithmic divergence.
        vec = symbol_vector(name)
        out[name] = [float(x) for x in vec[:16].tolist()]
    json.dump(out, sys.stdout, indent=2)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
