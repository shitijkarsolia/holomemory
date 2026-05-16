# HoloMemory Architecture

## System Overview

HoloMemory is a local-first agent memory system that combines human-readable structured records with high-dimensional vector-symbolic traces for approximate algebraic retrieval.

## Components

### Backend (`/backend`)

```
app/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration (DB path, HRR dimension, seed)
├── db.py                # SQLAlchemy engine, session, Base
├── models.py            # ORM models (Memory, MemoryVector, Symbol, QueryLog)
├── schemas.py           # Pydantic request/response schemas
├── seed.py              # Demo seed data
├── cli.py               # CLI interface
├── api/
│   └── routes.py        # All API endpoints
├── memory/
│   ├── hrr.py           # Core HRR operations (bind, unbind, superpose, cleanup)
│   ├── encoder.py       # Memory-to-vector encoding
│   ├── keyword.py       # Keyword baseline retrieval
│   ├── retrieval.py     # Holographic and hybrid retrieval
│   └── experiments.py   # Benchmark runner
└── services/
    ├── memory_service.py # Memory CRUD + vector management
    └── stats_service.py  # Analytics aggregation
```

### Frontend (`/frontend`)

```
app/
├── layout.tsx           # Root layout with sidebar
├── page.tsx             # Dashboard
├── console/page.tsx     # Memory console (add + query)
├── memories/page.tsx    # Memory browser + inspector
├── graph/page.tsx       # Associative graph view
├── experiments/page.tsx # Benchmark runner
└── architecture/page.tsx # Technical explainer
```

## Data Flow

### Memory Creation

1. Client sends `POST /memories` with text, kind, entities, tags, trust
2. Service extracts subject/predicate/object if not provided
3. Encoder generates trace vector: binds role vectors with content, superposes all
4. Memory record + vector BLOB stored in SQLite
5. New symbols registered in symbol table

### Query Execution

1. Client sends `POST /query` with query text, mode, top_k
2. Query tokenized and converted to probe vector
3. Mode determines scoring strategy:
   - **Keyword**: token overlap between query and memory fields
   - **Holographic**: cosine similarity between probe and stored traces
   - **Hybrid**: weighted combination of all signals
4. Results ranked, explanations generated, response returned

## Database Schema

| Table | Purpose |
|-------|---------|
| `memories` | Human-readable memory records with metadata |
| `memory_vectors` | BLOB-stored trace vectors (1024 x float64) |
| `symbols` | Registry of known symbol names |
| `query_logs` | Query history for analytics |
| `experiment_runs` | Benchmark result history |

## Vector Encoding Strategy

Each memory is encoded as:

```
trace = normalize(sum([
    bind(ROLE_SUBJECT, symbol(subject)),
    bind(ROLE_PREDICATE, symbol(predicate)),
    bind(ROLE_OBJECT, symbol(object)),
    bind(ROLE_ENTITY, symbol(entity)) for each entity,
    bind(ROLE_TAG, symbol(tag)) for each tag,
    bind(ROLE_TOKEN, symbol(token)) for first 20 text tokens,
]))
```

This creates a single 1024-dimensional vector that encodes all structural relationships of the memory.
