"use client";

const HOLO_USES = [
  "Agent preferences",
  "Ownership facts",
  "Project state and constraints",
  "Trust-weighted notes",
  "Small local memory stores",
];

const RAG_USES = [
  "Large document collections",
  "Broad semantic search",
  "Open-ended question answering",
  "Production-scale retrieval",
];

const NOTES: Array<{ label: string; body: React.ReactNode }> = [
  {
    label: "vs keywords",
    body: (
      <>
        Keyword search is simple, but it misses relationships.{" "}
        <em className="not-italic text-foreground/85">
          &ldquo;Who handles login?&rdquo;
        </em>{" "}
        should still find{" "}
        <em className="not-italic text-foreground/85">
          &ldquo;Sarah owns the auth service&rdquo;
        </em>{" "}
        when the exact words differ.
      </>
    ),
  },
  {
    label: "vs embeddings",
    body: (
      <>
        Embeddings are powerful, but they add model dependency and opaque
        similarity scores. HRR gives this prototype{" "}
        <span className="text-foreground/85">deterministic vectors</span> and{" "}
        <span className="text-foreground/85">inspectable scoring</span>.
      </>
    ),
  },
  {
    label: "strongest at",
    body: (
      <>
        Air-gapped or local-first prototypes, small agent state, structured
        facts, transparent scoring, dependency-light systems.
      </>
    ),
  },
  {
    label: "weakest at",
    body: (
      <>
        Large-scale retrieval, rich semantic generalization, messy natural
        language extraction, production document search.
      </>
    ),
  },
];

export function WhySection() {
  return (
    <section
      id="why"
      className="border-t border-border/30 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          Why use algebraic memory?
        </h2>
        <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
          RAG is great when you need semantic document search. HoloMem explores
          a smaller niche: local agent memories where{" "}
          <span className="text-foreground/90">relationships</span>,{" "}
          <span className="text-foreground/90">trust</span>, and{" "}
          <span className="text-foreground/90">explainable scoring</span> matter
          more than broad language understanding.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <UseList
            label="use HoloMem when you have"
            accent="var(--signal-amber)"
            items={HOLO_USES}
          />
          <UseList
            label="use RAG / vector DBs when you have"
            accent="var(--signal-blue)"
            items={RAG_USES}
          />
        </div>

        <div className="mt-12 space-y-5 border-t border-border/40 pt-8">
          {NOTES.map((note) => (
            <div
              key={note.label}
              className="grid gap-x-6 gap-y-1 sm:grid-cols-[120px_1fr]"
            >
              <span className="marginalia-label sm:pt-[3px] sm:text-right">
                {note.label}
              </span>
              <p className="text-[15px] leading-relaxed text-foreground/80">
                {note.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseList({
  label,
  accent,
  items,
}: {
  label: string;
  accent: string;
  items: string[];
}) {
  return (
    <div>
      <p
        className="font-mono text-[10.5px] uppercase tracking-[0.14em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-foreground/85">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-[10px] inline-block h-px w-2.5 shrink-0"
              style={{ background: accent, opacity: 0.5 }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
