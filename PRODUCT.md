# Product

## Register

brand

## Users

Mixed audience landing on the homepage, primarily on desktop, in a 30 to 90 second skim window:

- **Primary: technical hiring managers and staff engineers reviewing a portfolio.** They want to decide quickly whether the candidate has taste and depth. They skim first, then dig if something earns it.
- **Secondary: ML and AI infrastructure engineers** researching agent memory architectures. They will read carefully, may open the playground, and judge against their own experience.
- **Tertiary: general software engineers** exploring what vector-symbolic memory is and how it compares to RAG. They need plain-language framing before anything technical lands.

The job to be done across all three: understand what was built, why it exists, and how it works, without committing to actually using the playground.

## Product Purpose

HoloMemory is a portfolio piece that makes AI infrastructure thinking visible. It demonstrates HRR-style vector-symbolic memory with a working FastAPI backend, structured retrieval, and an interactive Next.js playground, but the homepage itself is the deliverable. Success is a reviewer who closes the tab understanding the concept, recognizing the craft, and trusting the engineer behind it. The playground is a credibility artifact, not the daily-use surface.

## Brand Personality

Studio-portfolio polish: visible craft, intentional motion, real visual taste, still restrained. Voice is precise, honest, engineering-focused. Three words: **precise, considered, candid.** The emotional goal is curiosity, not conversion: the visitor should want to understand how it works, not sign up for anything.

## Anti-references

- **Generic SaaS marketing and overclaiming.** No "production-ready memory platform," no "replaces RAG," no "loved by 1000+ teams," no gradient hero with badge rows. The brief explicitly bans product-y language; use "project," "prototype," "demo," and "explores."
- **Card-grid template energy.** Five identical icon-and-heading cards, hero-metric templates (big number, small label, gradient accent), badge rows. The cliched AI-tool template look. Use cards only when they are genuinely the best affordance.
- **Black-and-one-accent palettes.** The current pure-black-plus-emerald state is exactly this trap, and pure-black-plus-cyan or pure-black-plus-violet would be the same mistake one tier deeper. Use a warm dark base with deliberate amber, blue, violet, and muted red roles.
- **Dark-neon AI-tool aesthetic by default.** Glow orbs, gradient text, glassmorphism cards, neon-on-black. Avoid even when the project is about vectors and traces.

## Design Principles

1. **Explanation before decoration.** Every visual element should serve understanding. If a flourish does not help the reader grasp the concept, cut it.
2. **The demo is the hero.** The working artifact (the static fact-to-trace visual, the playground behind it) carries more weight than marketing copy. First viewport must show both the text and a visual of the concept.
3. **Honest tradeoffs.** Name limitations next to strengths. HoloMem is weaker at broad semantic search and production-scale retrieval; the comparison section says so plainly. Different design point, not better.
4. **Craft rewards close reading.** The first-glance impression and the close-read both pay off. Typography, spacing, motion timing, and copy all earn their place.
5. **Preserve the original voice.** The current explanatory text was written deliberately. Improve presentation, do not rewrite for the sake of rewriting.

## Accessibility & Inclusion

No formal WCAG target. Best-effort baseline:

- Readable contrast on all body text (the current faint-text problem is a defect, not a style).
- Focus-visible on all interactives.
- Respect `prefers-reduced-motion`; motion is enhancement, never required for comprehension.
- Semantic landmarks and real headings; alt text on meaningful imagery.
- Keyboard reachable, no hover-only functionality.

Fix specific issues if flagged; do not optimize past best-effort.
