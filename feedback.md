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

**1. ✅ `/memories` and `/experiments` are stylistic strangers.** *Done — both
routes deleted on `ui/cleanup-and-fft-interactive`. Sitemap, README route
table, and demo-script all updated. The styling-fix path is moot now.*

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

**2. ✅ Orphan routes.** *Done — resolved by removing the routes outright.*

- Add `Memories` and `Experiments` to `TopNav` (with a mobile hamburger — see
  #6), or
- Hide them from the route table in the README and treat them as private
  debug pages.

The current state — fully built, fully orphaned, fully off-brand — is the
worst of both. I'd add them to the nav and fix the styling. Effort: **S** for
the nav change, **M** when combined with #1.

**3. ✅ `MemoryField` uses a different color story than the rest of the app.**
*Done — memory nodes use `var(--signal-amber)`, low-trust uses
`var(--muted-foreground)`, contradictions use `var(--signal-red)`, edges and
the new-node pulse ring use `var(--signal-amber)`. Legend tracks the new
colors. Container background switched to the warm `oklch(0.09 0.012 75)`.*

Map: memory → `var(--signal-amber)`, low-trust → `var(--muted-foreground)` at
low opacity, contradiction → `var(--signal-red)`, edges → `var(--signal-amber)`
at low opacity. The legend already exists, just needs to track the new colors.
Effort: **S**.

**4. ✅ There is no footer.** *Done — `components/site-footer.tsx` shipped:
project name, dynamic `© <year> Shitij Karsolia`, `Source` link to the GitHub
repo, author-name link. Mounted in `app/layout.tsx` after `<main>`. Technical
credit was intentionally omitted per the author's preference.*

**5. ✅ `/about` is a wall of text adjacent to the most visual page on the
site.** *Done — page rebuilt around `components/explainer/fft-binding.tsx`,
a live interactive that runs the real `fft → complex multiply → ifft` pipeline
on every keystroke. The "What is holographic memory?" prose, the four "HRR
operations" cards, and the duplicate comparison table were dropped. Retrieval
modes (now with the parity-check callout) and tech stack stay.*

---

## Tier 2 — polish that earns close-reading credit

**6. Mobile nav.** The current `TopNav` is fine at 3 items × 390px. Add
`/memories` + `/experiments` and it overflows. Replace the inline links on
`<sm` with a sheet/dropdown trigger (the `sheet.tsx` and `dropdown-menu.tsx`
primitives are already installed). Also add `aria-current="page"` to the
active link — currently only the visual underline distinguishes it. Effort:
**S**.

**7. ✅ "Skip to main content" link.** *Done — `app/layout.tsx` now renders a
`sr-only focus:not-sr-only` skip link as the first child of `<body>`, and
the `<main>` element carries `id="main"`. Tab once on any route to surface
it.*

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

**9. ✅ `RecallChallenge` shows H/K/T but not E.** *Done — added the **E**
chip alongside H/K/T using `oklch(0.62 0.07 155)` (the same green
`recall-block.tsx` uses for entities). The chip row now matches the hybrid
formula advertised two lines above it.*

**10. ✅ Status badges all look identical.** *Done — passive states
(`outdated`, `stale`, `superseded`) re-tinted to `--muted-foreground`;
concern states (`dubious`, `low trust`) re-tinted to `--signal-red`. The two
groups now scan as different categories at a glance.*

**11. ✅ Distortion lab Reset is unguarded.** *Done — wrapped the trigger in
the shadcn `Dialog` primitive. Clicking "Clear All" now opens a confirmation
that names the count of memories about to disappear; Cancel / Clear all
memories actions live in the footer. The button is also disabled when the
field is already empty.*

**12. ✅ Recall mutation errors are silent.** *Done — `RecallChallenge`,
`RecallDuel`, and all three mutations in `DistortionLab` (noise,
contradiction, reset) now carry `onError` handlers that surface a friendly
inline error block beneath the trigger, mirroring the homepage pattern. Each
error is dismissible.*

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

**16. ↻ Stats sidebar (re-targeted).** *Original targets (`/memories`,
`/experiments`) are gone. The idea still applies if you want a small live
counter on `/playground` — `api.stats()` is implemented. `MetricCard` was
deleted in the Tier 3 #18 cleanup, so a future stats strip would build a
tiny inline tile component instead. One option for the playground hero: a
3-tile strip showing total / active / by-source counts that updates after
teach / noise / contradict actions.* Effort: **S**.

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

**18. ✅ Cut dead code.** *Done — all three unused components removed:
`InteractiveExplainer` (in the prior commit), plus `MetricCard` and
`DemoScriptModal` in this cleanup pass. The homepage `AlgebraSection` is now
the only explainer for bind/superpose/unbind on the site, and nothing in
the bundle ships orphaned UI.*

**19. ✅ Move `EXTRA_SEED` out of `playground/hero-section.tsx`.** *Done — the
28 hardcoded memory objects now live in `lib/demo-data.ts` next to
`DEMO_FACTS`, exported as `EXTRA_SEED`. The hero imports it. UI file is back
to being about UI.*

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
- **The 28 hardcoded `EXTRA_SEED` facts in `playground/hero-section.tsx`** —
  at least move them out (Tier 3 #19); if the playground feels too dense
  after seeding, drop ~10.

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

### Playground polish batch (same branch, follow-up commit)

Shipped Tier 2 #7, #9, #10, #11, #12 as a single follow-up:

- **#7** — `app/layout.tsx` got a `sr-only focus:not-sr-only` skip link as
  the first child of `<body>`, plus `id="main"` on the `<main>` element.
- **#9** — `RecallChallenge` result cards now show the **E** (entity overlap)
  chip alongside H/K/T, tinted with the same green `recall-block.tsx` uses.
- **#10** — `RecallChallenge` status badges differentiated: passive states
  (`outdated`, `stale`, `superseded`) on `--muted-foreground`; concern states
  (`dubious`, `low trust`) on `--signal-red`.
- **#11** — `DistortionLab` Reset wrapped in the `Dialog` primitive. Confirm
  modal names the count of memories about to be wiped; Cancel / "Clear all
  memories" actions in the footer. Reset button also disables when the field
  is already empty.
- **#12** — `RecallChallenge`, `RecallDuel`, and all three `DistortionLab`
  mutations (noise, contradiction, reset) gained `onError` handlers with
  inline dismissable error blocks that mirror the homepage pattern. Each
  `onMutate` clears any previous error so the UI never stacks them.

Verification: `tsc --noEmit` clean. Lint count unchanged at 21 (same
pre-existing errors in `memory-field.tsx`'s `NodeTooltip` and
`lib/hrr/hrr.ts`'s `gaussianNoise`); the batch added zero new errors.

### Delete `InteractiveExplainer` (same branch)

Shipped the `InteractiveExplainer` half of Tier 3 #18:

- **#18 (partial)** — `components/playground/interactive-explainer.tsx`
  deleted. Import + render dropped from `app/playground/page.tsx`. The
  homepage `AlgebraSection` is now the single explainer for the three
  operations; no more two-explanations-of-the-same-thing on the same site.
  `MetricCard` and `DemoScriptModal` still ship unused — left for a later
  cleanup pass.

Verification: `tsc --noEmit` clean. Lint count unchanged at 21.

### Cleanup pass — finish #18 + #19 (same branch)

Shipped the rest of Tier 3 #18 and all of #19:

- **#18 (rest)** — `components/metric-card.tsx` and
  `components/playground/demo-script-modal.tsx` both deleted. Neither was
  imported anywhere; both shipped in the bundle for nothing. The
  `DemoScriptModal` in particular pointed at a "Seed Demo" button that had
  been renamed to "Seed the lab" months ago, so the modal could never have
  opened from the current UI.
- **#19** — the 28 hardcoded `EXTRA_SEED` memory objects moved out of
  `components/playground/hero-section.tsx` and into `lib/demo-data.ts` next
  to `DEMO_FACTS`. Hero now imports `EXTRA_SEED` rather than declaring it
  inline. Same data, same behavior. UI file is back to being about UI.

Verification: `tsc --noEmit` clean. Lint count unchanged at 21.


---

## Next up — recommended

The original "playground polish" batch (Tier 2 #7, #9, #10, #11, #12) shipped
on this branch, then Tier 3 #18 + #19 (cleanup pass). At this point the
high-leverage items in Tier 1, the playground polish, and the codebase
tidy-up are all done.

What's left is small and optional:

- **Tier 2 #6** — mobile nav refinement (hamburger / `aria-current`).
- **Tier 2 #13** — sweep progress counter on the HRR Lab capacity / noise
  sweeps.
- **Tier 2 #14** — search-as-you-type combobox for the Distortion lab
  contradict picker.
- **Tier 2 #17** — `TeachPanel` form polish (chip-input tags, `Cmd+Enter`,
  `aria-live`).
- **Tier 3 #21** — widen the playground 3-column breakpoint so the memory
  field isn't squeezed at 1024px.
- **Tier 3 #22** — single-column on `<sm` for the HRR Lab unbind distractor
  inputs.
- **Tier 3 #23** — render both clauses of the example sentence in `HeroDemo`
  (two triples), or trim the fact text to the single clause shown.
- **Tier 3 #24** — skip the `EncodeBlock` 6-second timed reveal under
  `prefers-reduced-motion`.
- **Tier 3 #25** — push `useForceLayout`'s 60-iteration O(n²) repulsion into
  a Web Worker if memory counts grow.

Pick by appetite. None of these are blockers.

> Tier 2 #8 (`MemoryField` as instrument) is **parked** at the author's
> request and won't be re-recommended.

---

## Status summary

| Tier | Done | Parked | Open |
|---|---|---|---|
| 1 | #1 #2 #3 #4 #5 | — | — |
| 2 | #7 #9 #10 #11 #12 | #8 | #6 #13 #14 #16 #17 |
| 3 | #18 #19 | — | #21 #22 #23 #24 #25 |

Tier 1 done. Playground polish batch (Tier 2 #7, #9, #10, #11, #12) done.
The codebase cleanup (Tier 3 #18, #19) done. Tier 2 #8 (MemoryField as
instrument) parked at the author's request. Remaining items are small polish
and optimization.
