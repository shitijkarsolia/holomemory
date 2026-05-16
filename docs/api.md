# API Reference

Base URL: `http://localhost:8000`

## Core Endpoints

### `GET /health`

Health check.

**Response:**
```json
{"status": "ok", "service": "holomemory"}
```

### `POST /memories`

Create a new memory.

**Request:**
```json
{
  "text": "The user prefers dark mode.",
  "kind": "preference",
  "subject": "user",
  "predicate": "prefers",
  "object": "dark mode",
  "entities": ["user", "dark mode"],
  "tags": ["preference", "ui"],
  "source": "api",
  "trust": 0.9
}
```

Only `text` is required. Other fields are optional and will be auto-extracted if missing.

**Response:** `201` with the created memory object.

### `GET /memories`

List memories with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Text search (ILIKE) |
| `kind` | string | Filter by kind |
| `entity` | string | Filter by entity |
| `tag` | string | Filter by tag |
| `status` | string | Filter by status |
| `min_trust` | float | Minimum trust score |
| `limit` | int | Max results (default 50, max 200) |
| `offset` | int | Pagination offset |

### `GET /memories/{id}`

Get a single memory by ID.

### `PATCH /memories/{id}`

Update memory fields.

**Request:**
```json
{
  "trust": 0.5,
  "status": "stale"
}
```

### `DELETE /memories/{id}`

Soft-delete a memory (sets status to "deleted").

### `POST /query`

Query the memory system.

**Request:**
```json
{
  "query": "What does the user prefer?",
  "mode": "hybrid",
  "top_k": 5
}
```

Modes: `keyword`, `holographic`, `hybrid`

**Response:**
```json
{
  "query": "What does the user prefer?",
  "mode": "hybrid",
  "latency_ms": 12.4,
  "results": [
    {
      "memory": { ... },
      "score": 0.82,
      "components": {
        "holographic": 0.61,
        "keyword": 0.43,
        "trust": 0.85,
        "entity_overlap": 0.5
      },
      "why": ["Matched keywords: user, prefer", "High holographic similarity"]
    }
  ],
  "debug": {
    "query_symbols": ["user", "prefer"],
    "dimension": 1024
  }
}
```

### `POST /experiments/run`

Run a retrieval benchmark.

**Request:**
```json
{"num_queries": 10}
```

### `GET /stats`

Get memory system statistics.

### `POST /seed`

Load basic demo seed data.

## Playground Endpoints

### `POST /demo/seed`

Reset all data and load the curated Maya/Atlas demo scenario (10 memories with interesting relationships, updates, and contradictions).

**Response:**
```json
{
  "status": "ok",
  "memories_created": 10,
  "memories": [...]
}
```

### `GET /memory/field`

Returns all active memories and edges (shared entities between memories) for visualization.

**Response:**
```json
{
  "memories": [...],
  "edges": [
    {
      "source_id": "uuid-1",
      "target_id": "uuid-2",
      "shared_entities": ["maya", "atlas"]
    }
  ]
}
```

### `POST /memory/duel`

Run the same query in both keyword and holographic modes for comparison.

**Request:**
```json
{
  "query": "What does Maya prefer?",
  "top_k": 5
}
```

**Response:**
```json
{
  "query": "What does Maya prefer?",
  "holographic": { "query": "...", "mode": "holographic", "results": [...], ... },
  "keyword": { "query": "...", "mode": "keyword", "results": [...], ... }
}
```

### `POST /memory/noise`

Inject random low-trust nonsense memories for stress-testing.

**Request:**
```json
{"count": 3}
```

**Response:**
```json
{
  "status": "ok",
  "memories_created": 3,
  "memories": [...]
}
```

### `POST /memory/contradiction`

Create a contradicting version of an existing memory.

**Request:**
```json
{"memory_id": "uuid-of-target"}
```

**Response:**
```json
{
  "status": "ok",
  "original_id": "uuid-of-target",
  "contradiction": { ... }
}
```

### `POST /memory/reset`

Hard-delete all memories, vectors, and symbols. Start fresh.

**Response:**
```json
{"status": "ok"}
```
