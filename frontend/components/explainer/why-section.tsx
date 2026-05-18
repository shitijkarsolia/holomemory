"use client";

const STRENGTHS = [
  {
    title: "Algebra you can query",
    body: "Bind glues role and value; unbind pulls the value back out by role. The retrieval step is a multiplication in the Fourier domain — no model, no learned weights, no training data.",
  },
  {
    title: "Many facts, one vector",
    body: "A 1024-dimensional trace holds dozens of structured facts before cross-talk dominates. Storage cost is constant in the number of facts; compute is one FFT.",
  },
  {
    title: "Role-aware by construction",
    body: '"Maya manages auth" and "Auth manages Maya" share a token bag but encode to different traces, because each token is bound to its grammatical role. Bag-of-words scoring collapses both; HRR keeps them apart.',
  },
  {
    title: "Graceful under noise",
    body: "Corrupt the trace by 50% and chained unbind still returns the right value at lower confidence. Inverted indices, by contrast, fall off a cliff the moment a query token vanishes.",
  },
];

const TRADEOFFS = [
  {
    title: "No semantic generalization",
    body: "Symbol vectors are deterministic random vectors, not learned embeddings. \"editor\" and \"IDE\" are uncorrelated. If you need synonym handling, pair HRR with an embedding model or a manual alias table.",
  },
  {
    title: "Capacity is finite",
    body: "Past ~100 superposed facts in a 1024-d vector, cleanup starts losing items. The curve degrades smoothly — but at scale you want either bigger vectors (cheap) or hierarchical traces (work).",
  },
  {
    title: "Symbol vocabulary matters",
    body: "Cleanup is a cosine search against a known dictionary. If the answer isn't in the dictionary, HRR can't materialize it. Provisioning the vocabulary is part of the design.",
  },
  {
    title: "Not a document search engine",
    body: "HRR shines on small numbers of structured facts. For RAG-style search across many prose documents, an embedding model + vector DB will outperform.",
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
            Where HRR shines &mdash; and where it doesn&rsquo;t
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            HRR isn&rsquo;t a silver bullet. It&rsquo;s an unusual point in the
            design space &mdash; algebraic, deterministic, compositional. The
            honest accounting:
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <Column
            label="strengths"
            accent="var(--signal-amber)"
            items={STRENGTHS}
          />
          <Column
            label="tradeoffs"
            accent="var(--signal-blue)"
            items={TRADEOFFS}
          />
        </div>
      </div>
    </section>
  );
}

function Column({
  label,
  accent,
  items,
}: {
  label: string;
  accent: string;
  items: { title: string; body: string }[];
}) {
  return (
    <div>
      <p
        className="font-mono text-[11px] uppercase tracking-[0.14em]"
        style={{ color: accent }}
      >
        {label}
      </p>
      <ul className="mt-4 space-y-5">
        {items.map((it) => (
          <li key={it.title}>
            <p className="font-serif text-[17px] leading-tight tracking-tight text-foreground">
              {it.title}
            </p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">
              {it.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
