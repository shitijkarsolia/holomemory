# HoloMemory — frontend

Next.js (App Router) + TypeScript explainer and interactive playground for
Holographic Reduced Representations. On the public deploy this runs fully in the
browser: `lib/hrr/` is a TypeScript reimplementation of the Python HRR algebra,
so every demo computes the real math client-side with no backend.

See the [root README](../README.md) for the full project, architecture, and the
Python ↔ TypeScript parity story.

## Develop

```bash
npm install
npm run dev   # http://localhost:3000
```

## Environment

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for SEO / OpenGraph / sitemap | `https://holomemory.vercel.app` on Vercel production, else `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | FastAPI backend URL. **Leave unset** to run fully in-browser (the default). When set, the app calls that backend and falls back to the in-browser engine if it is unreachable. | unset → in-browser engine |
