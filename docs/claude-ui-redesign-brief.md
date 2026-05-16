# HoloMemory UI Redesign Handoff for Claude

This document is the single source of truth for the UI redesign. It captures the decisions from the design discussion, the rationale, the exact content direction, and a practical implementation plan for another agent to build from.

## Project Context

HoloMemory is a portfolio project, not a production product. The UI should help a technical reviewer quickly understand what was built, why it exists, and how it works. The user does not expect visitors to spend much time using the playground, so the homepage itself must demonstrate the concept clearly.

Repository root:

```txt
/Users/shitijmathur/Developer/projects/holomemory
```

Frontend stack:

- Next.js `16.2.6` App Router
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- shadcn-style UI components
- React Query
- Framer Motion
- Phosphor icons and lucide are installed

Important local instructions:

- `frontend/AGENTS.md` says this is a newer Next version and to read relevant docs in `node_modules/next/dist/docs/` before writing code.
- This project uses `app/layout.tsx`, `app/page.tsx`, route folders, and global CSS in `app/globals.css`.
- Current app has a font token bug: `globals.css` maps `--font-sans: var(--font-sans)`, but layout defines `--font-geist-sans`, so the UI appears to fall back to a less intentional serif-like browser font in places. Fix typography deliberately.

Current major frontend files:

```txt
frontend/app/layout.tsx
frontend/app/page.tsx
frontend/app/globals.css
frontend/components/top-nav.tsx
frontend/components/explainer/hero.tsx
frontend/components/explainer/what-section.tsx
frontend/components/explainer/encode-block.tsx
frontend/components/explainer/recall-block.tsx
frontend/components/explainer/trust-block.tsx
frontend/components/explainer/comparison-section.tsx
frontend/components/explainer/cta-section.tsx
frontend/components/playground/*
frontend/lib/api.ts
frontend/lib/demo-data.ts
```

## Baseline Findings From Visual Review

Observed baseline at `http://localhost:3000` after running the frontend dev server:

- The homepage is functional but visually underpowered for a portfolio demo.
- The first viewport has too much empty space and does not immediately show the demo.
- Text contrast is too faint in several places.
- Typography appears unintentional because of the font token issue.
- The palette is mostly black plus emerald, which makes the project feel one-note.
- The playground is functional but reads as a set of forms inside boxes rather than a polished demonstration surface.
- The strongest content in the current version is the original explanatory copy. Preserve it.

Design discussion path:

- Scope choice: the user selected **Whole Experience** over only playground or only landing.
- Initial recommended direction was a technical “Instrument Console”; the user instead selected a more editorial direction.
- The editorial direction was then corrected by user feedback: keep the project-demo framing, do not make it product-like, keep the original text, make the demo the hero, and add a clear “Why?” section.

Reference brainstorming screens were generated under:

```txt
.superpowers/brainstorm/35597-1778971960/content/
```

The final useful mockup reference is:

```txt
.superpowers/brainstorm/35597-1778971960/content/portfolio-demo-design-v2.html
```

Do not depend on those files for implementation. This markdown document is the durable handoff.

## Design Goal

Improve the UI significantly while preserving the project-demo character. Do not turn the site into a product landing page. The strongest first impression should be:

> This is a polished portfolio demo that makes a technical memory-system idea immediately understandable.

The homepage should be the demo. The playground can still exist, but visitors should understand the core idea without clicking into it.

## User Feedback That Must Guide the Build

The user explicitly said:

- They liked the original text.
- It is basically a project demo for their portfolio, not an actual product.
- They do not expect people to actually use the playground.
- The demo has to be the hero.
- The text should be simple, intuitive, and easy to understand.
- Use better fonts.
- Add a section explaining WHY someone would use this and in which situations compared to RAG and alternatives.

## Chosen Direction

Use a **portfolio-demo editorial** direction:

- Keep the original headline and plain-language explanation.
- Put a compact visual demo in the hero: fact → subject/predicate/object → vector trace → probe result.
- Add an early “Why this exists” section comparing this approach to RAG, embeddings/vector DBs, and keyword search.
- Use better typography: editorial headings, readable body text, technical mono labels.
- Make the visual tone warmer and more intentional than the current black/emerald one-note palette.
- Keep the playground polished but secondary.

Rejected or de-emphasized directions:

- Do not make it a SaaS/product dashboard.
- Do not make the playground the only meaningful demo.
- Do not add a generic marketing hero.
- Do not use vague product claims like “memory platform” or “production-ready.”
- Do not overuse cards as decoration.
- Avoid a one-note emerald-on-black palette.

## Font Plan

Use Google fonts through `next/font/google`.

Recommended imports in `frontend/app/layout.tsx`:

```tsx
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
```

These exports were confirmed to exist in the installed Next font typings.

Recommended configuration:

```tsx
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
```

Recommended global font tokens:

```css
@theme inline {
  --font-sans: var(--font-source-sans);
  --font-serif: var(--font-source-serif);
  --font-mono: var(--font-plex-mono);
  --font-heading: var(--font-source-serif);
}
```

Usage:

- Major homepage headings: `font-serif`
- Body and UI: `font-sans`
- Small technical labels, vector dimensions, scores, metadata: `font-mono`
- Playground panels should mostly use `font-sans`; reserve `font-serif` for page-level headings only.

## Visual Style

Target palette:

- Background: very dark warm black, not pure black.
- Main text: warm off-white.
- Muted text: warm gray.
- Primary accent: amber/gold for the core trace and primary calls to action.
- Secondary accents: muted blue/cyan for predicate/query signals, soft violet for object/entity signals, muted red for conflicts/low trust.

Example token direction:

```css
:root {
  --background: oklch(0.075 0.012 75);
  --foreground: oklch(0.94 0.018 82);
  --card: oklch(0.12 0.014 75);
  --card-foreground: oklch(0.94 0.018 82);
  --popover: oklch(0.12 0.014 75);
  --popover-foreground: oklch(0.94 0.018 82);
  --primary: oklch(0.73 0.12 72);
  --primary-foreground: oklch(0.11 0.018 75);
  --secondary: oklch(0.17 0.014 75);
  --secondary-foreground: oklch(0.88 0.02 82);
  --muted: oklch(0.18 0.014 75);
  --muted-foreground: oklch(0.67 0.025 82);
  --accent: oklch(0.22 0.03 215);
  --accent-foreground: oklch(0.9 0.025 210);
  --destructive: oklch(0.64 0.16 28);
  --border: oklch(0.92 0.025 82 / 12%);
  --input: oklch(0.92 0.025 82 / 16%);
  --ring: oklch(0.73 0.12 72);
  --chart-1: oklch(0.73 0.12 72);
  --chart-2: oklch(0.68 0.09 215);
  --chart-3: oklch(0.7 0.11 305);
  --chart-4: oklch(0.64 0.16 28);
  --chart-5: oklch(0.62 0.07 155);
  --radius: 0.5rem;
}
```

Design constraints:

- Keep border radius mostly `6px` to `8px`; avoid overly pill-like cards except tiny tech chips.
- Do not use gradient orb backgrounds or decorative bokeh.
- Do not use huge empty hero whitespace.
- First viewport must show both the explanatory text and a demo visual.
- Ensure text contrast is materially better than the current UI.
- Use stable responsive dimensions for the hero demo so it does not collapse awkwardly.
- On mobile, the hero text should appear first, then the demo visual.

## Homepage Content and Structure

The homepage should remain composed from explainer components under `frontend/components/explainer/`, but the content flow should be updated.

Recommended route component order in `frontend/app/page.tsx`:

```tsx
<HeroSection />
<WhatSection />
<WhySection />
<EncodeBlock />
<RecallBlock />
<TrustBlock />
<ComparisonSection />
<CtaSection />
```

Add:

```txt
frontend/components/explainer/why-section.tsx
```

### Hero Section

Keep the original text:

Eyebrow:

```txt
A portfolio project exploring algebraic agent memory
```

Headline:

```txt
Structured vector memory for AI agents
```

Body:

```txt
HoloMem encodes relational facts into fixed-width vectors using circular convolution, then retrieves them through algebraic probes. No embeddings model. No external API. Fully local.
```

Tech chips:

```txt
FastAPI
NumPy
SQLite
Next.js
HRR
```

Primary action:

```txt
Watch the demo
```

Secondary action:

```txt
Open playground
```

Hero visual:

Create a component inside `hero.tsx` or a new `hero-demo.tsx` that shows the concept in one glance:

1. A fact card:

```txt
Sarah owns the auth service and maintains the login flow.
```

2. Structured triple rows:

```txt
subject   Sarah
predicate owns
object    auth service
```

3. A vector trace panel:

- Warm dark panel with a radial trace field.
- Several small nodes/dots using amber, blue, violet.
- A highlighted main amber node.
- A small caption:

```txt
Probe: “Who handles login?” → Sarah / auth service
```

4. A small top label:

```txt
STRUCTURED FACT → VECTOR TRACE
```

This can be a static, CSS-driven visual. It does not need backend data. It should feel like a demo artifact, not a fake dashboard.

Responsive behavior:

- Desktop: two-column layout, text left and demo right.
- Mobile: text first, demo below.
- The hero should leave a hint of the next section on common desktop viewports.

### What Section

Keep the educational explanation from the current `what-section.tsx`, but improve layout and typography.

Current content is good:

- Explain HRR in simple terms.
- Explain Bind, Superpose, Probe.
- Explain local/deterministic/trust-aware properties.
- Keep “The engineering tradeoff” note, but make it visually secondary and clear.

Do not make this section too long.

### New Why Section

Purpose:

Explain why someone would choose this kind of memory system and where it fits compared with RAG and alternatives.

Suggested section title:

```txt
Why use algebraic memory?
```

Suggested subtitle:

```txt
RAG is great when you need semantic document search. HoloMem explores a smaller niche: local agent memories where relationships, trust, and explainable scoring matter more than broad language understanding.
```

Suggested framing cards or rows:

Use this for:

```txt
Agent preferences, ownership facts, project state, constraints, trust-weighted notes, and small local memory stores.
```

Use RAG / vector DBs for:

```txt
Large document collections, broad semantic search, open-ended question answering, and production-scale retrieval.
```

Why not keywords?

```txt
Keyword search is simple, but it misses relationships. “Who handles login?” should still find “Sarah owns the auth service” when the exact words differ.
```

Why not embeddings?

```txt
Embeddings are powerful, but they add model dependency and opaque similarity scores. HRR gives this prototype deterministic vectors and inspectable scoring.
```

Where HoloMem is strongest:

```txt
Air-gapped or local-first prototypes, small agent state, structured facts, transparent scoring, and dependency-light systems.
```

Where it is weak:

```txt
Large-scale retrieval, rich semantic generalization, messy natural language extraction, and production document search.
```

Tone:

- Honest and engineering-focused.
- Do not claim it replaces RAG.
- Say it explores a different design point.

### Encode Block

Current component demonstrates “pick a fact and encode it.” Keep behavior but improve presentation:

- Use better section heading hierarchy.
- Make example fact buttons easier to scan.
- Use colored role pills for subject/predicate/object.
- Make the encoded state look like a trace record.
- Add a concise explanation of what the viewer should notice.

Current sample facts are fine:

```txt
Sarah owns the auth service and maintains the login flow.
The auth service uses PostgreSQL for session storage.
Jake refactored the payment module last sprint.
```

Important: the homepage demo should not depend on the backend being alive. If backend calls fail in `EncodeBlock`, show a friendly inline message rather than silently resetting.

### Recall Block

Current component preloads demo facts and lets users query. Keep this, but make it clearer as a story:

- Label stored facts as “Seed memories.”
- Show the query examples as probes.
- Make results visually explain scoring.
- Keep latency and component scores, but make them readable.

Add inline error state if the backend query fails.

### Trust Block

Keep the contradiction/trust example, but make it visually easier:

- Side-by-side or stacked comparison between high-trust PostgreSQL and low-trust MongoDB.
- Use muted red only for the low-trust contradictory memory.
- Explain that trust changes ranking, not truth.

Suggested wording to preserve:

```txt
The high-trust PostgreSQL fact ranks above the low-trust MongoDB claim, even though both match the query equally well on keywords.
```

### Comparison Section

Keep the comparison table, but align it with the new Why section. The table should be honest, not promotional.

Rows to include:

- Indirect recall
- Encodes structure
- Trust scoring
- Explains matches
- Needs external model
- Runs fully local
- Semantic generalization
- Retrieval latency
- Best fit

Columns:

- Keyword
- RAG / Vector DB
- HoloMem

For “Best fit,” suggested values:

```txt
Keyword: exact lookup over small text
RAG / Vector DB: semantic search over documents
HoloMem: structured local agent facts
```

### CTA Section

CTA should not sound like a product conversion pitch.

Suggested title:

```txt
Open the interactive playground
```

Suggested body:

```txt
The playground lets you add facts, query memory, inject noise, compare retrieval modes, and inspect the memory field graph.
```

Buttons:

```txt
Open Playground
Technical Details
```

## Playground Improvements

The playground is secondary, but should not look unfinished.

Keep existing behavior and API calls:

- `TeachPanel` creates memories.
- `MemoryField` displays graph nodes.
- `RecallChallenge` queries.
- `RecallDuel`, `DistortionLab`, and `InteractiveExplainer` stay present.

Improve:

- Use the new typography and tokens.
- Increase contrast.
- Make panel headers clearer.
- Reduce the “form inside boxes” feeling.
- Make empty memory field look intentional and educational.
- Use the amber/blue/violet/red palette in graph nodes and score chips.
- Keep the layout dense enough on desktop, but avoid tiny unreadable text.

Do not rewrite the playground architecture unless needed. This task is primarily UI.

## Top Navigation

Update `frontend/components/top-nav.tsx`:

- Use new fonts and colors.
- Keep brand as `HoloMem`.
- Add active state that is subtle but visible.
- Consider links:

```txt
Playground
About
```

Optional: add an in-page `Why` anchor only if it does not clutter the nav. Keep nav simple.

## About Page

The request is primarily homepage plus shared polish. If time allows:

- Apply the new typography and theme to `frontend/app/about/page.tsx`.
- Improve section spacing and tables.
- Do not rewrite all content unless necessary.

## Implementation Plan

### Step 1: Prep and verification

Commands:

```bash
cd /Users/shitijmathur/Developer/projects/holomemory/frontend
npm install
npm run lint
```

If lint currently fails before changes, record the existing failure. Otherwise keep lint passing.

### Step 2: Typography and theme

Files:

```txt
frontend/app/layout.tsx
frontend/app/globals.css
```

Tasks:

- Replace Geist imports with `Source_Sans_3`, `Source_Serif_4`, and `IBM_Plex_Mono`.
- Add their CSS variables to the `<html>` className.
- Fix `@theme inline` font token mapping.
- Update color tokens to the warm editorial palette.
- Keep existing shadcn variable names intact.
- Add a few reusable utility classes only if needed, for example:
  - `.text-balance` if desired and supported.
  - `.demo-panel`
  - `.trace-glow`
- Remove or repurpose emerald-specific utility naming like `--emerald` if it is no longer used.

### Step 3: Update the homepage route

File:

```txt
frontend/app/page.tsx
```

Tasks:

- Import and render the new `WhySection`.
- Keep the section order listed above.
- Ensure the page background and spacing work with the new hero.

### Step 4: Rebuild hero around static demo

File:

```txt
frontend/components/explainer/hero.tsx
```

Optional new file:

```txt
frontend/components/explainer/hero-demo.tsx
```

Tasks:

- Preserve original text exactly or nearly exactly.
- Add two-column hero layout.
- Add static trace demo.
- Add primary anchor to the demo/explainer section and secondary link to `/playground`.
- Use `Link` from `next/link` for route navigation.
- Make mobile layout stack cleanly.
- Ensure first viewport is not mostly empty.

### Step 5: Add WhySection

New file:

```txt
frontend/components/explainer/why-section.tsx
```

Tasks:

- Use the content in the “New Why Section” above.
- Layout can be split: explanation on left, compact comparison cards on right.
- On mobile, stack cards under the explanation.
- Do not nest cards inside cards.
- Keep claims honest and precise.

### Step 6: Restyle existing explainer sections

Files:

```txt
frontend/components/explainer/what-section.tsx
frontend/components/explainer/encode-block.tsx
frontend/components/explainer/recall-block.tsx
frontend/components/explainer/trust-block.tsx
frontend/components/explainer/comparison-section.tsx
frontend/components/explainer/cta-section.tsx
```

Tasks:

- Update typography, spacing, borders, and section widths.
- Use consistent section labels.
- Add visible error states where API failures currently disappear.
- Keep current interactions working.
- Replace overly faint text with readable muted text.
- Avoid overdecorating each section with heavy cards.

### Step 7: Light playground polish

Files likely involved:

```txt
frontend/components/playground/hero-section.tsx
frontend/components/playground/memory-playground.tsx
frontend/components/playground/memory-field.tsx
frontend/components/playground/teach-panel.tsx
frontend/components/playground/recall-challenge.tsx
frontend/components/playground/recall-duel.tsx
frontend/components/playground/distortion-lab.tsx
frontend/components/playground/interactive-explainer.tsx
```

Tasks:

- Apply theme and typography.
- Make panels feel deliberate.
- Improve empty states and score chips.
- Keep existing behavior and callbacks.
- Do not spend most of the effort here; homepage is the priority.

### Step 8: Verify

Commands:

```bash
cd /Users/shitijmathur/Developer/projects/holomemory/frontend
npm run lint
npm run build
```

Run app:

```bash
npm run dev
```

Browser verification:

- Homepage desktop at `http://localhost:3000`
- Homepage mobile width around `390px`
- Playground desktop at `http://localhost:3000/playground`
- If backend is running, test encode/query flows.
- If backend is not running, verify the homepage still looks useful and API-dependent sections show graceful states.

Backend startup if needed:

```bash
cd /Users/shitijmathur/Developer/projects/holomemory/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Acceptance Criteria

The work is successful when:

- The first viewport clearly communicates the project as a portfolio demo.
- The original headline and core explanation are preserved.
- The hero includes a visual demo of structured fact → vector trace → probe result.
- Typography feels intentional and materially better than the current fallback.
- The “Why use this?” section explains fit compared to RAG, vector DBs, embeddings, and keyword search.
- The UI no longer feels like a black page with faint text and sparse sections.
- The playground is visually coherent with the homepage, even if secondary.
- Lint passes.
- Production build passes.
- Desktop and mobile screenshots show no broken layout, text overlap, or unreadably faint text.

## Risks and Notes

- Backend-dependent homepage interactions currently call live APIs. If the backend is not running, parts of the current page can fail or silently reset. Add inline error states or keep the hero demo static so the homepage still works as a portfolio artifact.
- Do not accidentally make the page sound like a commercial product. Use “project,” “prototype,” “demo,” and “explores” where appropriate.
- Avoid saying HoloMem is better than RAG. Say it serves a different niche.
- Keep the comparison honest: HoloMem is weaker at broad semantic generalization and production-scale retrieval.
- The design should be explanatory before it is decorative.

## Claude Build Prompt

Use this prompt if handing the task to Claude:

```txt
Please implement the UI redesign described in docs/claude-ui-redesign-brief.md. Treat that document as the source of truth. The app is a portfolio demo, not a product landing page. Preserve the original homepage text, make the static demo the hero, add the “Why use this?” section comparing HoloMem to RAG/vector DBs/keyword search, upgrade typography using Source Serif 4, Source Sans 3, and IBM Plex Mono through next/font/google, and lightly polish the playground to match. Keep backend/API contracts unchanged. Run npm run lint and npm run build, then verify homepage and playground at desktop and mobile widths.
```
