# UI/UX feedback — HoloMemory

A walk-through of the homepage explainer chain, the playground (HRR Lab + the
three-column memory playground + duel + distortion + interactive explainer),
`/memories`, `/experiments`, `/about`, the design tokens, the existing redesign
brief at `docs/claude-ui-redesign-brief.md`, the API client, the force-layout
hook, and the UI primitives.

## What's already working

The homepage is the strong surface. Editorial palette and typography (Source
Serif / Source Sans / IBM Plex Mono) feel intentional. The hero demo with the
explicit `decompose → bind → superpose → probe` sequence is genuinely
educational and has an excellent `aria-label`. The four signal colors
(amber/blue/violet/red) are used consistently across hero, encode, recall, and
trust blocks. `prefers-reduced-motion` is respected globally in `globals.css`.
Encode, recall, and trust blocks each have explicit per-component error states
with friendly fallback copy. The HRR Lab actually runs the real algebra
(`bind`/`unbind`/`cleanup`/`corruptVector`) instead of faking it, with a smart
honest-comment in `encode-block.tsx` and `hero-demo.tsx` explaining why the
*visualization* uses a hash-driven stylization. `useForceLayout` correctly
rehashes seeds per memory set and uses topology keys to avoid recomputing on
every refetch — that's a real bug fix that survived. Trust block uses a
`DataDrivenSummary` that pulls real numbers from the response. None of this
should change.

The recommendations below assume the portfolio framing in `PRODUCT.md`: the
*homepage* is the deliverable, the playground is a credibility artifact, and
the reviewer has 30–90 seconds.

---

## Tier 1 — fix what hurts the portfolio framing most

These are visible the first time a reviewer clicks past the homepage.

**1. `/memories` and `/experiments` are stylistic strangers.** Both are reachable
from `README.md` and have proper `<Metadata>` blocks, but neither matches the
editorial system the homepage establishes.

- `app/memories/page.tsx` lines 161–164 and 275 use raw Tailwind:
  `text-emerald-600`, `text-amber-600`, `text-zinc-500`, `text-red-500/600`,
  `border-emerald-500/30`, etc. This bypasses `--signal-amber/blue/violet/red`
  entirely. Status pills should use `--signal-amber` (active),
  `--muted-foreground` (stale/superseded), `--signal-red` (deleted). Same colors
  as the playground field once you fix that too — see Tier 2 #5.
- `app/experiments/page.tsx` charts use literal hex grays `#a1a1aa`, `#52525b`,
  `#18181b`, `#71717a` for the three retrieval modes. Map these to
  `var(--signal-amber)` (Holographic), `var(--signal-blue)` (Keyword),
  `var(--signal-violet)` (Hybrid) — the same colors the homepage `RecallBlock`
  uses for H/K/T components. The reviewer who saw H=amber 90% on the homepage
  should see Holographic=amber here.
- Headings on both pages are `text-lg font-semibold` instead of the homepage's
  `font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight`. They look
  like a different app.

Effort: **M**. This is mostly a search-replace + a typography pass on two
files.

**2. Orphan routes.** `TopNav` exposes `/`, `/playground`, `/about`. Nothing in
the UI links to `/memories` or `/experiments` — typing the URL is the only way
in. The `CtaSection` only links to `/playground` and `/about`. Either:

- Add `Memories` and `Experiments` to `TopNav` (with a mobile hamburger — see
  #6), or
- Hide them from the route table in the README and treat them as private
  debug pages.

The current state — fully built, fully orphaned, fully off-brand — is the
worst of both. I'd add them to the nav and fix the styling. Effort: **S** for
the nav change, **M** when combined with #1.

**3. `MemoryField` uses a different color story than the rest of the app.**
`components/playground/memory-field.tsx` hardcodes `oklch(0.65 0.17 160)`
(green) for memory nodes and edges, `oklch(0.4 0.05 160)` for low-trust,
`oklch(0.6 0.2 25)` for contradiction. The rest of the app says memories are
amber, low-trust is muted, contradictions are red. The graph viz is the
most-shared visual on the playground page; it should anchor the palette, not
contradict it.

Map: memory → `var(--signal-amber)`, low-trust → `var(--muted-foreground)` at
low opacity, contradiction → `var(--signal-red)`, edges → `var(--signal-amber)`
at low opacity. The legend already exists, just needs to track the new colors.
Effort: **S**.

**4. There is no footer.** A portfolio site without a "view source" link, a
"built by", and a copyright is missing the smallest possible "I made this"
signal. Add a minimal footer to `app/layout.tsx` after `<main>`: project name,
link to GitHub, link to author's site (already in `lib/seo.ts` as
`SITE_AUTHOR`), and a one-line "client-side TS engine + FastAPI backend"
technical credit. Effort: **S**.

**5. `/about` is a wall of text adjacent to the most visual page on the site.**
It explains the same operations as `AlgebraSection`, `EncodeBlock`, and
`UnbindSection` on the homepage, in plainer prose, with no visualizations. Two
specific issues:

- Its "Tradeoffs vs vector DB / RAG" table partly overlaps with the homepage
  `ComparisonSection`, but with different rows and columns. A reviewer
  comparing the two will notice. Pick one; either remove the about-page table
  or have it cite the homepage table verbatim.
- The "What is holographic memory?" paragraph slides into more abstract framing
  ("brain-inspired", "approximate, content-addressable lookup") than the rest
  of the site. The homepage `WhatSection` is more concrete. Bring this
  paragraph in line.

If you want this page to earn the `/about` URL, give it one thing the homepage
doesn't have: real notation, real code snippets from `lib/hrr/hrr.ts`, or a
small interactive that exposes the FFT under the binding. Otherwise, it's
"click here to read the homepage again." Effort: **M**.

---

## Tier 2 — polish that earns close-reading credit

**6. Mobile nav.** The current `TopNav` is fine at 3 items × 390px. Add
`/memories` + `/experiments` and it overflows. Replace the inline links on
`<sm` with a sheet/dropdown trigger (the `sheet.tsx` and `dropdown-menu.tsx`
primitives are already installed). Also add `aria-current="page"` to the
active link — currently only the visual underline distinguishes it. Effort:
**S**.

**7. "Skip to main content" link.** Add a visually-hidden-until-focused link
as the first child of `<body>` that jumps to `#main`, then put `id="main"` on
the `<main>` in `app/layout.tsx`. The site has heavy interactive content;
keyboard-only users currently tab through the whole nav on every page. Effort:
**XS**.

**8. `MemoryField` interactivity is hover-only.** Nodes aren't focusable, click
does nothing, the tooltip closes the moment you mouse off. For a force-directed
graph that's the centerpiece of the playground:

- Make each node a `<g tabIndex={0}>` with a `role="button"` and `aria-label`
  containing the trace text.
- On click: pin the tooltip until clicked again (or `Esc`), and scroll-to or
  highlight the corresponding row in `RecallChallenge` results / a memories
  sidebar.
- Add a "n traces" counter that's a `<button>` opening a slide-over with the
  full list.

The current viz is decorative. With keyboard nav and click semantics it
becomes a real instrument. Effort: **M**.

**9. `RecallChallenge` shows H/K/T but not E.**
`components/playground/recall-challenge.tsx` lines 226–243 list three component
scores. The hybrid formula explained two lines above is `40·H + 30·K + 15·T +
15·E`. Entity overlap (`r.components.entity_overlap`) is dropped from the chip
row, so a query that wins on shared entities looks unexplained. Add the E chip
with `oklch(0.62 0.07 155)` (the green you already use for entities in
`recall-block.tsx`). Effort: **XS**.

**10. Status badges all look identical.** `RecallChallenge` renders `outdated`,
`dubious`, `stale`, `superseded` badges all with
`border-[color:var(--signal-amber)]/50 text-[color:var(--signal-amber)]`.
Reviewer scanning a result list sees four orange chips and reads them as
redundant. Differentiate by semantics: `outdated`/`stale`/`superseded` →
`--muted-foreground`, `dubious` → `--signal-red`. Use the shadcn `Badge`
`variant` prop to keep this declarative. Effort: **XS**.

**11. Distortion lab Reset is unguarded.** `distortion-lab.tsx` ~line 73:
clicking "Clear All" calls `api.reset()` immediately, wiping a 30-trace seed
and any teaching the visitor has done in the last few minutes. Wrap it in the
`Dialog` primitive (already installed) with a confirm step that names what's
about to disappear ("This deletes 33 memories permanently. Type 'reset' to
confirm." or just a two-step "Are you sure"). Effort: **S**.

**12. Recall mutation errors are silent.** `RecallChallenge`, `RecallDuel`,
`DistortionLab` all use `useMutation` without an `onError` or visible error
path. If `/query` returns 500, the spinner stops and the user sees nothing.
The homepage versions (`EncodeBlock`, `RecallBlock`, `TrustBlock`) all handle
this — port the pattern. Effort: **S**.

**13. HRR Lab capacity & noise sweeps don't expose progress.** `CapacityDemo.run`
runs 12 × 3 trials and updates the chart as it goes (good), but the button text
just toggles "Measuring…/Run capacity sweep". Add a small "n=18 (8 / 12)"
counter, or progress bar, so the user sees that the chart is growing on
purpose. Same for `NoiseDemo` (9 × 5). The sweeps already chunk with
`setTimeout(0)` so a counter is essentially free. Effort: **S**.

**14. Distortion lab "Contradict" only shows first 10 memories.**
`distortion-lab.tsx` `.slice(0, 10)` on the select. Convert the picker to a
search-as-you-type combobox using `dropdown-menu.tsx` or `select.tsx` so any
memory in the field can be contradicted. Effort: **S**.

**15. `/experiments` has hard-coded `num_queries=10`.** Add a small slider or
numeric input (5–50) so the reviewer can run a cheap quick check or a more
representative sweep. Also add a "winner" callout: `recharts` chart + an
above-the-chart banner that says "Hybrid won Recall@5: 0.92 (vs Holographic
0.78, Keyword 0.61)". Numbers without an interpretation ask the reader to do
the interpretation. Effort: **S**.

**16. `/experiments` and `/memories` lack a stats sidebar.** `api.stats()` is
implemented and returns counts, but no UI consumes it. Add a 3-tile strip
(`MetricCard` already exists at `components/metric-card.tsx` — currently
unused) on `/memories` showing total / active / by-source breakdown, and on
`/experiments` showing memories present at run time. Wires up an unused
component and orients first-time visitors. Effort: **S**.

**17. `TeachPanel` form polish.**
- The `<select>` for source is native; the rest of the playground uses native
  selects too — fine — but it doesn't focus-ring like the inputs above it
  because it's not running through `Input.tsx`. Wrap in the shadcn `Select`
  primitive (already installed at `components/ui/select.tsx`).
- Tags are a comma-separated text field. Reviewers read this as 2010-era. Use
  a chip input that creates a chip on `,` or `Enter`. (Quick path: keep the
  input but render tags as chips below the input in real time so users see
  what they typed.)
- Add `Cmd/Ctrl+Enter` to submit from the textarea.
- Wrap the success message in `aria-live="polite"` so screen readers announce
  "Encoded".

Effort: **M** combined.

---

## Tier 3 — structure & robustness

**18. Cut dead code.** Three components ship that nothing imports:

- `components/metric-card.tsx` — fold into Tier 2 #16 instead of deleting.
- `components/playground/demo-script-modal.tsx` — references a "Seed Demo"
  button that doesn't exist anymore (the playground says "Seed the lab").
  Either delete or wire it to a `?` button in the playground hero.
- `components/playground/interactive-explainer.tsx` — semantically duplicates
  `components/explainer/algebra-section.tsx`. Same three operations, same
  notation, less polished. Either delete and rely on the homepage, or
  repurpose as a step-by-step *with the live engine doing each step under the
  cards* — that would actually pay its rent on the playground page.

Effort: **S** to delete, **M** to repurpose `InteractiveExplainer` into a
live-stepped version.

**19. Move `EXTRA_SEED` out of `playground/hero-section.tsx`.** 28 hardcoded
memory objects in a UI component (lines 25–87) is a smell. Move to
`lib/demo-data.ts` next to `DEMO_FACTS`. The hero already imports `api`; the
seed file already exists. Effort: **XS**.

**20. `/memories` editor.** The header copy says "Browse, filter, and **manage**
memories." The inspector only exposes Mark Stale and Delete. Real management
would let the user edit `text`, `trust`, `tags`, `subject/predicate/object`,
and `status` (stale ↔ active). The API supports `PATCH /memories/:id` with a
`MemoryUpdate` partial — only `status` is wired up.

Either rephrase ("Browse, filter, and inspect") or finish the editor. The
simplest finish: open a `Dialog` with an editable form on row click, mirroring
`TeachPanel`. Effort: **M**.

**21. Memory playground at `lg:` is too tight in the middle.**
`lg:grid-cols-[360px_1fr_360px]` puts the field in a ~300px middle column at
exactly 1024px viewport. The `viewBox` is 600×400. Either widen the breakpoint
to `xl`, or let the field span full width on `lg` and stack teach/recall above
it as two columns. The current state forces nodes to overlap or the user to
scroll-zoom the SVG. Effort: **S**.

**22. `HrrLab` unbind demo has cramped distractor inputs on mobile.**
`grid-cols-3 gap-2` for s/p/o + `h-7 text-[12px]` makes them ~80px wide each
at 390px. Switch to a single column on `<sm` with each labeled
`subject/predicate/object`. Same for the main triple inputs above. Effort:
**XS**.

**23. `HeroDemo` honesty gap.** The fact text reads "Sarah owns the auth
service **and maintains the login flow**", but only the first clause's triple
is shown. Either trim the fact to "Sarah owns the auth service.", or render
*two* triples (the second `Sarah / maintains / login flow`) to match. The
bind/superpose path then has 6 strips, which actually reinforces the "many
facts in one trace" claim. Effort: **S**.

**24. `prefer-reduced-motion` coverage of the probe-sweep.** `globals.css`
zeros `.probe-sweep` animation correctly. Verify Framer Motion's per-component
motion in `EncodeBlock`'s 3-second `BindingRow` reveal also collapses to
instant — `Providers` sets `MotionConfig reducedMotion="user"`, which respects
the media query, so this *should* be covered, but the encode flow waits 6.2s
of real-time `setTimeout` between phases regardless of preference. A
reduced-motion user gets a non-animated 6-second wait staring at one panel.
Either skip the timed reveals when reduced-motion is set, or shorten them to
~400ms. Effort: **S**.

**25. Force-layout iteration count is a hot path.** `useForceLayout` runs 60
iterations with O(n²) repulsion every time the topology key changes. With the
playground hero seeding 33 memories, that's ~65k node-pairs on the main
thread. Currently fine, but if Tier 3 #20 increases the realistic memory
count, push to a Web Worker or chunk with `requestIdleCallback`. Effort:
**M**.

---

## Things to consider cutting

- **`InteractiveExplainer`** unless it gets repurposed to drive the engine
  live (Tier 3 #18).
- **The `/about` comparison table** if you keep `ComparisonSection` on the
  homepage. Two tables that disagree about what the comparison is hurts more
  than one table that's missing.
- **The 28 hardcoded `EXTRA_SEED` facts in `playground/hero-section.tsx`** —
  at least move them out (Tier 3 #19); if the playground feels too dense
  after seeding, drop ~10.
- **The kind/status/source native `<select>`s on `/memories`** if you adopt
  the Tier 1 #1 cleanup; replace with the shadcn `Select` primitive that's
  already imported.

---

## Suggested order of operations

If I were applying these myself, I'd batch:

1. **One pass of brand-consistency** — Tier 1 #1, #3, plus the dead-code
   delete in Tier 3 #18. The whole app then looks like one app, which is the
   highest single-PR ROI.
2. **Nav + footer** — Tier 1 #2, #4, plus Tier 2 #6 and #7. Site stops
   feeling unfinished.
3. **Memory field as an instrument** — Tier 2 #8 + Tier 1 #3 together. This
   is the single biggest "wait, that's nice" moment a reviewer will get on
   the playground.
4. **Polish & honesty** — Tier 2 #9, #10, #11, #12, #15, plus Tier 3 #23,
   #24. Each is small, together they read as "the engineer cared."
5. **Editor & restructure** — Tier 3 #20, #21 if `/memories` is meant to be
   a real surface; otherwise rename and ship.

The whole list is roughly two days of focused work, with Tier 1 a half-day
and the highest single-day return.

---

## Decisions made on this branch

The author accepted:

- **#1 + #2** — Remove `/memories` and `/experiments` entirely (not showcased,
  not needed). They're deleted, not relocated; the README route table, the
  sitemap, and the demo-script doc are all updated.
- **#3** — Recolor `MemoryField` and its legend to use `--signal-amber`,
  `--muted-foreground`, and `--signal-red`.
- **#4 (partial)** — Add a footer with project name, copyright, GitHub link,
  and author site. **Not** including the technical credit ("client-side TS
  engine + FastAPI backend") per the author's request.
- **#5** — Trim `/about` of redundant prose and replace it with a small
  interactive that exposes the FFT under the `bind()` operation.

Everything else in this document is open for a later pass.

---

## Implementation status (this branch: `ui/cleanup-and-fft-interactive`)

Shipped:

- **`/memories` and `/experiments` removed.** Deleted `frontend/app/memories/`
  and `frontend/app/experiments/` (page + layout each). Pruned both URLs from
  `frontend/app/sitemap.ts`, both rows from the route table in `README.md`,
  and the "Navigate to /experiments" step from `docs/demo-script.md`. Backend
  API routes under `/memories/*` are untouched — the `TeachPanel`,
  `EncodeBlock`, `RecallBlock`, `TrustBlock`, and the playground hero seed all
  still call them.
- **`MemoryField` recolored.** Memory nodes use `var(--signal-amber)`, low-trust
  nodes use `var(--muted-foreground)`, contradictions use `var(--signal-red)`,
  edges and the new-node pulse ring use `var(--signal-amber)`. The container
  background switched from cold pure black `oklch(0.08 0 0)` to the warm
  `oklch(0.09 0.012 75)` already used by the empty state. Legend swatches
  track the new colors.
- **Site footer added.** New `frontend/components/site-footer.tsx`: project
  name, dynamic `© <year> Shitij Karsolia`, a `Source` link to the GitHub repo,
  and an author-name link to `SITE_AUTHOR.url`. Mounted in `app/layout.tsx`
  after `<main>`. No technical credit.
- **`/about` trimmed and rebuilt around the FFT interactive.** Dropped the
  redundant "What is holographic memory?" paragraph, the four "HRR operations"
  cards, and the duplicate "Tradeoffs vs vector DB / RAG" table. New
  centerpiece is `frontend/components/explainer/fft-binding.tsx`: two text
  inputs (role / value) drive six strips computed live from
  `lib/hrr/fft.ts` — `r` and `v` in time domain, `|R|` and `|V|` magnitude
  spectra, `|R ⊙ V|` product, and `bind(r, v)` after the IFFT. Same code path
  the production engine uses for every memory in the playground. Retrieval
  modes (with the parity-check note) and tech stack stay; both are concrete
  and aren't on the homepage.

Verification:

- `npx tsc --noEmit` — clean after clearing the stale `.next/dev/types/`
  validator artifacts that referenced the deleted route files.
- `npm run lint` — 21 errors remain on this branch versus 22 on `main`. The
  one error this branch fixes is the `setState-during-effect` violation in
  the deleted `app/memories/page.tsx`. The remaining 21 (20 `react-hooks/refs`
  in `memory-field.tsx`'s `NodeTooltip`, plus a `prefer-const` for `u2` in
  `lib/hrr/hrr.ts`'s `gaussianNoise`) are all pre-existing in functions this
  branch did not modify. Net change: **−1 lint error, 0 new lint errors.**

Out of scope here, kept open:

- The 21 pre-existing lint errors. Tier 2 / Tier 3 in this document already
  flag the surrounding code; fixing the ref-reads in `NodeTooltip` properly
  needs a `ResizeObserver` + `useState` rewrite, which is a real change to
  the SVG-letterbox math, not a one-liner.
- Everything else listed in Tier 1 #6 onward and Tier 2 / Tier 3.
