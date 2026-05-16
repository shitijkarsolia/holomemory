"""CLI for HoloMemory."""

import sys

from app.db import SessionLocal, init_db
from app.memory.retrieval import query_memories
from app.schemas import MemoryCreate
from app.seed import seed_database
from app.services.memory_service import create_memory


def main():
    if len(sys.argv) < 2:
        print("Usage: python -m app.cli <command> [args]")
        print("Commands: init-db, seed, add <text>, query <text>, benchmark")
        sys.exit(1)

    command = sys.argv[1]

    if command == "init-db":
        init_db()
        print("Database initialized.")

    elif command == "seed":
        init_db()
        db = SessionLocal()
        try:
            count = seed_database(db)
            print(f"Seeded {count} memories.")
        finally:
            db.close()

    elif command == "add":
        if len(sys.argv) < 3:
            print("Usage: python -m app.cli add <text>")
            sys.exit(1)
        text = " ".join(sys.argv[2:])
        init_db()
        db = SessionLocal()
        try:
            mem = create_memory(db, MemoryCreate(text=text))
            print(f"Created memory: {mem.id}")
            print(f"  text: {mem.text}")
            print(f"  subject: {mem.subject}")
            print(f"  predicate: {mem.predicate}")
        finally:
            db.close()

    elif command == "query":
        if len(sys.argv) < 3:
            print("Usage: python -m app.cli query <text>")
            sys.exit(1)
        query_text = " ".join(sys.argv[2:])
        init_db()
        db = SessionLocal()
        try:
            response = query_memories(db, query_text, mode="hybrid", top_k=5)
            print(f"Query: {response.query}")
            print(f"Mode: {response.mode}")
            print(f"Latency: {response.latency_ms:.1f}ms")
            print(f"Results: {len(response.results)}")
            for i, r in enumerate(response.results, 1):
                print(f"\n  [{i}] score={r.score:.4f}")
                print(f"      text: {r.memory.text[:80]}")
                print(f"      why: {', '.join(r.why[:3])}")
        finally:
            db.close()

    elif command == "benchmark":
        from app.memory.experiments import run_experiment

        init_db()
        db = SessionLocal()
        try:
            result = run_experiment(db)
            print(f"Benchmark: {result.num_memories} memories, {result.num_queries} queries\n")
            for mode_name, mode_result in [("Keyword", result.keyword), ("Holographic", result.holographic), ("Hybrid", result.hybrid)]:
                print(f"  {mode_name}:")
                print(f"    recall@1={mode_result.recall_at_1:.3f}  recall@3={mode_result.recall_at_3:.3f}  recall@5={mode_result.recall_at_5:.3f}")
                print(f"    avg_latency={mode_result.avg_latency_ms:.1f}ms")
            print("\nNotes:")
            for note in result.notes:
                print(f"  - {note}")
        finally:
            db.close()

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
