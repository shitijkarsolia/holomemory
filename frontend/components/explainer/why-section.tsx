"use client";

const FIT_ROWS = [
  {
    label: "Use this for",
    accent: "var(--signal-amber)",
    body: "Agent preferences, ownership facts, project state, constraints, trust-weighted notes, and small local memory stores.",
  },
  {
    label: "Use RAG / vector DBs for",
    accent: "var(--signal-blue)",
    body: "Large document collections, broad semantic search, open-ended question answering, and production-scale retrieval.",
  },
];

const CONTRAST_ROWS = [
  {
    title: "Why not keywords?",
    body: "Keyword search is simple, but it misses relationships. “Who handles login?” should still find “Sarah owns the auth service” when the exact words differ.",
  },
  {
    title: "Why not embeddings?",
    body: "Embeddings are powerful, but they add model dependency and opaque similarity scores. HRR gives this prototype deterministic vectors and inspectable scoring.",
  },
  {
    title: "Where HoloMem is strongest",
    body: "Air-gapped or local-first prototypes, small agent state, structured facts, transparent scoring, and dependency-light systems.",
  },
  {
    title: "Where it is weak",
    body: "Large-scale retrieval, rich semantic generalization, messy natural language extraction, and production document search.",
  },
];

export function WhySection() {
  return (
    <section
      id="why"
      className="border-t border-border/30 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <p className="eyebrow">Why this exists</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
            Why use algebraic memory?
          </h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            RAG is great when you need semantic document search. HoloMem
            explores a smaller niche: local agent memories where{" "}
            <span className="text-foreground/90">relationships</span>,{" "}
            <span className="text-foreground/90">trust</span>, and{" "}
            <span className="text-foreground/90">explainable scoring</span>{" "}
            matter more than broad language understanding.
          </p>

          <div className="mt-7 space-y-3">
            {FIT_ROWS.map((row) => (
              <div
                key={row.label}
                className="rounded-md border border-border bg-card/40 p-4"
              >
                <p
                  className="text-[11px] font-mono uppercase tracking-wider"
                  style={{ color: row.accent }}
                >
                  {row.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                  {row.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTRAST_ROWS.map((row) => (
            <div
              key={row.title}
              className="rounded-md border border-border bg-card/30 p-4"
            >
              <p className="font-serif text-[17px] tracking-tight text-foreground">
                {row.title}
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {row.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
