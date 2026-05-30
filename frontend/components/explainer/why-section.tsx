"use client";

import Link from "next/link";

// Representative result from the live capacity sweep in the HRR Lab: N random
// (key, value) pairs superposed into one 1024-d trace, each key probed back via
// unbind + cleanup. Recall stays near-perfect to ~50 pairs, then degrades
// smoothly. Illustrative curve — the lab runs the real sweep in-browser.
const CAPACITY_CURVE: { n: number; recall: number }[] = [
  { n: 1, recall: 1.0 },
  { n: 5, recall: 1.0 },
  { n: 12, recall: 0.99 },
  { n: 25, recall: 0.98 },
  { n: 35, recall: 0.96 },
  { n: 50, recall: 0.93 },
  { n: 70, recall: 0.82 },
  { n: 100, recall: 0.61 },
  { n: 140, recall: 0.41 },
];

const STRENGTHS = [
  {
    title: "Algebra you can query",
    body: "Bind glues role to value; unbind pulls the value back out by role. Retrieval is a multiplication in the Fourier domain. No model, no learned weights, no training data.",
  },
  {
    title: "Many facts, one vector",
    body: "A 1024-dimensional trace holds dozens of structured facts before cross-talk starts dominating. Storage cost stays constant in the number of facts; recall is one FFT.",
  },
  {
    title: "Role-aware by construction",
    body: '"Maya manages auth" and "Auth manages Maya" share a token bag but encode to different traces, because each token is bound to its grammatical role. Bag-of-words scoring collapses both into one. HRR keeps them apart.',
  },
  {
    title: "Graceful under noise",
    body: "Corrupt half the trace and chained unbind still finds the right value at lower confidence. Inverted indices fall off a cliff the moment a query token disappears.",
  },
];

const TRADEOFFS = [
  {
    title: "No semantic generalization",
    body: "Symbol vectors are random vectors, not learned embeddings. \"editor\" and \"IDE\" are uncorrelated. If you need synonym handling, pair HRR with an embedding model or a manual alias table.",
  },
  {
    title: "Capacity is finite",
    body: "Past around 100 superposed facts in a 1024-d vector, cleanup starts losing items. The curve degrades smoothly, but at scale you want either bigger vectors (cheap) or hierarchical traces (work).",
  },
  {
    title: "Symbol vocabulary matters",
    body: "Cleanup is a cosine search against a known dictionary. If the answer isn't in the dictionary, HRR can't pull it out. Provisioning the vocabulary is part of the design.",
  },
  {
    title: "Not a document search engine",
    body: "HRR shines on small numbers of structured facts. For RAG-style search across many prose documents, an embedding model and a vector DB will outperform.",
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
            Where HRR shines, and where it doesn&rsquo;t
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            HRR isn&rsquo;t a silver bullet. It&rsquo;s an unusual point in
            the design space: algebraic, deterministic, compositional. Here&rsquo;s
            what it does well and where it falls down.
          </p>
        </div>

        <CapacityFigure />

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

function CapacityFigure() {
  const W = 560;
  const H = 200;
  const padL = 40;
  const padR = 16;
  const padT = 12;
  const padB = 30;
  const maxN = 140;
  const sx = (n: number) => padL + (n / maxN) * (W - padL - padR);
  const sy = (r: number) => padT + (1 - r) * (H - padT - padB);
  const path = CAPACITY_CURVE.map(
    (p, i) => `${i === 0 ? "M" : "L"}${sx(p.n).toFixed(1)},${sy(p.recall).toFixed(1)}`,
  ).join(" ");
  const knee = sx(50);

  return (
    <figure className="mt-10 rounded-xl border border-border/40 bg-card/40 p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--signal-amber)]">
          Capacity · one 1024-d vector
        </p>
        <Link
          href="/playground#hrr-lab"
          className="font-mono text-[11px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          run the live sweep →
        </Link>
      </figcaption>
      <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
        Recall stays near-perfect to about{" "}
        <span className="text-foreground/90">50 superposed facts</span>, then
        degrades smoothly. There&rsquo;s no per-fact slot and no index. The
        trace is always the same 1024 floats. This is a representative curve;
        the lab runs the real sweep in your browser.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full max-w-[640px] text-muted-foreground"
        role="img"
        aria-label="Capacity curve: recall accuracy stays near 100% up to about 50 facts superposed into a single 1024-dimensional vector, then falls to roughly 60% at 100 facts and 40% at 140 facts."
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              y1={sy(g)}
              x2={W - padR}
              y2={sy(g)}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <text
              x={padL - 6}
              y={sy(g) + 3}
              fontSize="9.5"
              textAnchor="end"
              fill="currentColor"
              fillOpacity="0.5"
              fontFamily="ui-monospace"
            >
              {(g * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        <line
          x1={knee}
          y1={padT}
          x2={knee}
          y2={H - padB}
          stroke="var(--signal-amber)"
          strokeOpacity="0.35"
          strokeDasharray="3 3"
        />
        <text
          x={knee + 5}
          y={padT + 10}
          fontSize="9.5"
          fill="var(--signal-amber)"
          fillOpacity="0.9"
          fontFamily="ui-monospace"
        >
          ~50 facts
        </text>
        {CAPACITY_CURVE.map((p) => (
          <text
            key={p.n}
            x={sx(p.n)}
            y={H - 10}
            fontSize="9.5"
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.5"
            fontFamily="ui-monospace"
          >
            {p.n}
          </text>
        ))}
        <path d={path} fill="none" stroke="var(--signal-amber)" strokeWidth="2" />
        {CAPACITY_CURVE.map((p) => (
          <circle
            key={p.n}
            cx={sx(p.n)}
            cy={sy(p.recall)}
            r="3"
            fill="var(--signal-amber)"
          />
        ))}
        <text x={padL} y={H - 1} fontSize="9" fill="currentColor" fillOpacity="0.45">
          facts superposed
        </text>
        <text x={4} y={padT + 6} fontSize="9" fill="currentColor" fillOpacity="0.45">
          recall
        </text>
      </svg>
    </figure>
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
