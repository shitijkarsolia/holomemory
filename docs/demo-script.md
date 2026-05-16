# Demo Script

Follow this script to demonstrate HoloMemory's capabilities in 90 seconds.

## Setup

```bash
# Terminal 1: Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open http://localhost:3000

## Demo Flow

### 1. Seed the Demo

- Click "Seed Demo" in the hero section
- Watch 10 memories appear in the memory field (center panel)
- Nodes represent memories; edges connect memories that share entities

### 2. Teach a Fact

- In the left panel (Teach the Agent), type: "Maya switched from Vim to Cursor last week."
- Set trust to 0.8, source to "user"
- Click "Encode Memory"
- Watch the new node pulse into existence in the field

### 3. Recall Challenge

- In the right panel, type: "What editor does Maya use?"
- Select "hybrid" mode
- Click Recall
- See results ranked by score with component breakdowns (H/K/T)
- Notice the field highlights matching memories

### 4. Try Example Queries

- Click the example chips: "What does Maya prefer?", "Which memory seems least trustworthy?"
- Switch between hybrid/holographic/keyword modes
- Notice how holographic mode handles fuzzy/indirect queries better

### 5. Recall Duel

- Scroll to the Recall Duel section
- Enter: "Tell me about the Atlas stack"
- Click Duel
- Compare keyword vs holographic results side-by-side
- Point out where holographic finds relevant memories that keyword misses

### 6. Distortion Lab

- Click "Add Noise" — 3 random low-trust memories appear as dim nodes
- Select a memory and click "Create Contradiction" — a conflicting memory appears
- Run a query again — notice trust scores affect ranking
- Click "Clear All" to reset

### 7. How It Works

- Scroll to the explainer section
- Click through Bind, Superpose, Unbind steps
- Show the algebraic notation and explanations

### 8. Experiments

- Navigate to /experiments
- Run a benchmark comparing retrieval modes
- Show recall@k and latency metrics

## Key Talking Points

- No external LLM or embedding API required
- Deterministic: same input always produces same vector
- Explainable: every result shows why it was retrieved
- Structured: encodes roles and relations, not just flat similarity
- Local-first: SQLite + NumPy, no cloud dependencies
- Interactive: teach, query, stress-test, compare — all in one page
