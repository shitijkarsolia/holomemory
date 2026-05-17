"use client";

type Scenario = {
  who: string;
  remembers: string;
  question: string;
  answer: string;
};

const SCENARIOS: Scenario[] = [
  {
    who: "A coding assistant",
    remembers:
      "Sarah owns auth. Jake owns payments. The team uses PostgreSQL. Tabs not spaces.",
    question: "Who should review my login fix?",
    answer:
      "Sarah, because she owns the auth service. The agent never needed to ask, it just knew.",
  },
  {
    who: "An onboarding bot",
    remembers:
      "New hires learn: who maintains each service, which channels track which incidents, what languages each team prefers.",
    question: "Day 3, the new hire asks: who reviews payment changes?",
    answer:
      "Jake. The bot recalls the ownership fact even when the question doesn't use the word \"owns\".",
  },
  {
    who: "A personal note-taking agent",
    remembers:
      "Maya prefers concise answers, uses Cursor, doesn't drink coffee, has a cat named Atlas.",
    question: "Two months later: what was Maya's editor again?",
    answer:
      "Cursor. The most recent and most trusted memory wins, even though older notes contradict it.",
  },
  {
    who: "A long-running customer-support agent",
    remembers:
      "Ticket #4112 was about billing, was escalated to Maya, was resolved by refunding $40.",
    question: "Reopens months later, no thread context loaded.",
    answer:
      "The agent recalls the relevant facts by name, owner, and outcome without re-reading the whole ticket history.",
  },
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
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
            Why use algebraic memory?
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            RAG is great when you need to search a pile of documents. HoloMem
            explores a smaller niche: agent memory, where the system needs to
            remember{" "}
            <span className="text-foreground/90">specific facts</span>,{" "}
            <span className="text-foreground/90">who knows what</span>, and{" "}
            <span className="text-foreground/90">how much to trust each one</span>.
          </p>
        </div>

        <div className="mt-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--signal-amber)]">
            real-world scenarios
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {SCENARIOS.map((s) => (
              <article
                key={s.who}
                className="rounded-lg border border-border/40 bg-card/30 p-5"
              >
                <p className="font-serif text-[18px] leading-tight tracking-tight text-foreground">
                  {s.who}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  <span className="marginalia-label">remembers · </span>
                  {s.remembers}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">
                  <span className="marginalia-label">asks · </span>
                  &ldquo;{s.question}&rdquo;
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">
                  <span
                    className="marginalia-label"
                    style={{ color: "var(--signal-amber)" }}
                  >
                    answers ·{" "}
                  </span>
                  {s.answer}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <UseList
            label="use HoloMem when you have"
            accent="var(--signal-amber)"
            items={[
              "Agent preferences and ownership facts",
              "Project state, constraints, and conventions",
              "Trust-weighted or contradictable notes",
              "Small, local, dependency-light memory stores",
            ]}
          />
          <UseList
            label="use RAG / vector DBs when you have"
            accent="var(--signal-blue)"
            items={[
              "Large document collections",
              "Broad semantic search across prose",
              "Open-ended question answering",
              "Production-scale retrieval",
            ]}
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
