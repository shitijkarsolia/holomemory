"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { makeApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryResponse, RetrievalResult } from "@/lib/types";
import { DEMO_FACTS } from "@/lib/demo-data";
import { HYBRID_WEIGHTS, trustSignal } from "@/lib/hrr/retrieval";

const EXAMPLE_QUERIES = [
  "Who should I ask about login?",
  "What changed recently in payments?",
  "What framework does the API gateway use?",
];

type SignalColor = { l: number; c: number; h: number };

const SIGNAL: Record<"amber" | "blue" | "violet", SignalColor> = {
  amber: { l: 0.78, c: 0.13, h: 72 },
  blue: { l: 0.7, c: 0.1, h: 215 },
  violet: { l: 0.72, c: 0.11, h: 305 },
};

function oklch(c: SignalColor, alpha = 1): string {
  return alpha >= 1
    ? `oklch(${c.l} ${c.c} ${c.h})`
    : `oklch(${c.l} ${c.c} ${c.h} / ${alpha})`;
}

function hash(seed: string, i: number): number {
  let h = 2166136261 ^ (i * 16777619);
  for (let j = 0; j < seed.length; j++) {
    h = Math.imul(h ^ seed.charCodeAt(j), 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function vectorPreview(seed: string, n: number, color: SignalColor) {
  return Array.from({ length: n }, (_, i) => {
    const a = hash(seed, i);
    const b = hash(seed, i + 2003);
    return {
      color,
      amplitude: 0.18 + Math.abs(a - 0.5) * 1.55 + b * 0.22,
    };
  });
}

function MiniTrace({
  cells,
  className = "",
}: {
  cells: { color: SignalColor; amplitude: number }[];
  className?: string;
}) {
  return (
    <div
      className={`relative h-5 overflow-hidden rounded-[2px] border border-border/60 ${className}`}
    >
      <div className="absolute inset-0 flex items-stretch gap-[1px]">
        {cells.map((c, i) => (
          <span
            key={i}
            className="flex-1"
            style={{
              background: oklch(c.color),
              opacity: Math.min(0.95, c.amplitude),
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function RecallBlock() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const seedingRef = useRef(false);
  const api = useMemo(() => makeApi(), []);

  useEffect(() => {
    if (seedingRef.current) return;
    seedingRef.current = true;

    const seed = async () => {
      try {
        await api.reset();
        for (const fact of DEMO_FACTS) {
          await api.memories.create({
            text: fact.text,
            kind: fact.kind,
            subject: fact.subject,
            predicate: fact.predicate,
            object: fact.object,
            entities: fact.entities,
            tags: fact.tags,
            source: fact.source,
            trust: fact.trust,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["field"] });
        setSeeded(true);
      } catch {
        setSeedError(true);
      }
    };
    seed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuery = async (q: string) => {
    setQuery(q);
    setSubmittedQuery(q);
    setLoading(true);
    setResult(null);
    setQueryError(null);
    try {
      const [res] = await Promise.all([
        api.query(q, "hybrid", 5),
        new Promise((r) => setTimeout(r, 900)),
      ]);
      setResult(res);
    } catch {
      setQueryError(
        "Query failed. The backend is not reachable. Try again once it is running.",
      );
    }
    setLoading(false);
  };

  const probeCells = useMemo(
    () => (submittedQuery ? vectorPreview(submittedQuery, 64, SIGNAL.blue) : null),
    [submittedQuery],
  );

  const topResult: RetrievalResult | null = result?.results[0] ?? null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30">
      <p className="eyebrow text-[color:var(--signal-amber)]">Try it · recall</p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Recall through indirect queries
      </h2>
      <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
        The system is pre-loaded with facts about a fictional engineering
        team. A question doesn&rsquo;t have to mention the answer directly,
        but it does need to share at least one keyword or named entity with
        the stored memory. The probe builds a vector from your question and
        scores it against every stored trace.
      </p>

      {!seeded && !seedError && (
        <p className="mt-5 text-[13px] text-muted-foreground animate-pulse">
          Loading seed memories…
        </p>
      )}

      {seedError && (
        <div className="mt-5 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
          Couldn&rsquo;t reach the backend to seed memories. The rest of the
          page still works. Start the backend (see README) to use this block.
        </div>
      )}

      {seeded && (
        <>
          <div className="mt-6 rounded-md border border-border bg-card/40 p-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Seed memories
            </p>
            <ul className="mt-2 space-y-1.5">
              {DEMO_FACTS.slice(0, 4).map((f) => (
                <li
                  key={f.text}
                  className="text-[13.5px] leading-snug text-foreground/80"
                >
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleQuery(q)}
                disabled={loading}
                className="rounded-md border border-border bg-card/40 px-3 py-2.5 text-left text-[13px] text-foreground/90 hover:border-[color:var(--signal-amber)]/40 hover:bg-card/70 transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && query && handleQuery(query)
              }
              placeholder="Or type your own probe…"
              className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[color:var(--signal-amber)]/50"
            />
            <button
              onClick={() => query && handleQuery(query)}
              disabled={loading || !query}
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-40 hover:scale-[1.02] transition-transform"
            >
              {loading ? "Probing…" : "Probe"}
            </button>
          </div>
        </>
      )}

      {queryError && (
        <div className="mt-4 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
          {queryError}
        </div>
      )}

      {loading && submittedQuery && probeCells && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-md border border-border bg-card/40 p-5"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Probe vector built from your question
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
            &ldquo;{submittedQuery}&rdquo;
          </p>
          <div className="mt-4">
            <MiniTrace cells={probeCells} />
          </div>
          <p className="mt-2 flex items-center gap-2 font-mono text-[11.5px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--signal-amber)]" />
            Scoring against every stored trace…
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {result && submittedQuery && probeCells && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-5"
          >
            <div className="rounded-md border border-border bg-card/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Probe vector
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
                &ldquo;{submittedQuery}&rdquo;
              </p>
              <div className="mt-3">
                <MiniTrace cells={probeCells} />
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                The system built this vector from your question and compared
                it against every stored trace in {result.latency_ms.toFixed(0)} ms.
              </p>
            </div>

            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Top matches, ranked
              </p>
              <div className="mt-3 space-y-3">
                {result.results.slice(0, 4).map((r, i) => (
                  <ResultRow key={r.memory.id} r={r} index={i} />
                ))}
              </div>
            </div>

            {topResult && (
              <div className="rounded-md border border-border/50 bg-card/30 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  What you just saw
                </p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
                  The probe matched{" "}
                  <span className="text-foreground/95">
                    &ldquo;{topResult.memory.text}&rdquo;
                  </span>{" "}
                  with a {(topResult.score * 100).toFixed(0)}% combined score.
                  After weighting each component by its share of the hybrid
                  formula, the biggest contribution came from{" "}
                  <BiggestComponent r={topResult} />. That&rsquo;s what
                  tipped this memory above the others.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ResultRow({ r, index }: { r: RetrievalResult; index: number }) {
  const traceCells = useMemo(
    () =>
      vectorPreview(
        `trace::${r.memory.subject ?? ""}::${r.memory.predicate ?? ""}::${
          r.memory.object ?? r.memory.text
        }`,
        64,
        SIGNAL.amber,
      ),
    [r.memory],
  );

  const components = [
    {
      label: "holographic",
      short: "vector match",
      value: r.components.holographic,
      color: SIGNAL.amber,
    },
    {
      label: "keyword",
      short: "shared words",
      value: r.components.keyword,
      color: SIGNAL.blue,
    },
    {
      label: "trust",
      short: "source trust",
      value: r.components.trust,
      color: SIGNAL.violet,
    },
    {
      label: "entity",
      short: "shared entities",
      value: r.components.entity_overlap,
      color: { l: 0.62, c: 0.07, h: 155 },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.28, duration: 0.55 }}
      className="rounded-md border border-border bg-card/40 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[14.5px] leading-relaxed text-foreground/90">
          {r.memory.text}
        </p>
        <div className="shrink-0 rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/10 px-2.5 py-1">
          <span className="font-mono text-[12.5px] text-[color:var(--signal-amber)]">
            {(r.score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="mt-3">
        <MiniTrace cells={traceCells} />
      </div>

      <div className="mt-3 space-y-1.5">
        {components.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="w-[110px] shrink-0 font-mono text-[11px] text-muted-foreground">
              {c.short}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, c.value * 100))}%`,
                  background: oklch(c.color, 0.85),
                }}
              />
            </div>
            <span className="w-[44px] shrink-0 text-right font-mono text-[11px] text-foreground/70">
              {(c.value * 100).toFixed(0)}
            </span>
          </div>
        ))}
      </div>

      {r.why.length > 0 && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground/85">
          {r.why[0]}
        </p>
      )}
    </motion.div>
  );
}

function BiggestComponent({ r }: { r: RetrievalResult }) {
  // Report the largest WEIGHTED contribution, not the largest unweighted
  // component value. The trust component enters the score *centered* at 0.5
  // (see retrieval.ts `trustSignal`), so we apply the same transform here —
  // otherwise raw trust=0.9 would still appear to dominate even though its
  // actual contribution to the final score is small.
  const entries = [
    {
      label: "holographic similarity (vector overlap)",
      value: r.components.holographic,
      weight: HYBRID_WEIGHTS.holographic,
      color: "var(--signal-amber)",
    },
    {
      label: "shared keywords",
      value: r.components.keyword,
      weight: HYBRID_WEIGHTS.keyword,
      color: "var(--signal-blue)",
    },
    {
      label: "trust in the source",
      value: trustSignal(r.components.trust),
      weight: HYBRID_WEIGHTS.trust,
      color: "var(--signal-violet)",
    },
    {
      label: "shared entities",
      value: r.components.entity_overlap,
      weight: HYBRID_WEIGHTS.entity,
      color: "oklch(0.62 0.07 155)",
    },
  ];
  const top = entries.reduce((a, b) =>
    b.value * b.weight > a.value * a.weight ? b : a,
  );
  return (
    <span style={{ color: top.color }} className="font-medium">
      {top.label}
    </span>
  );
}
