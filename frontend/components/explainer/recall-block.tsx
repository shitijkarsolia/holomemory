"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryResponse } from "@/lib/types";
import { DEMO_FACTS } from "@/lib/demo-data";

const EXAMPLE_QUERIES = [
  "Who should I ask about login?",
  "What changed recently in payments?",
  "What framework does the API gateway use?",
];

export function RecallBlock() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const seedingRef = useRef(false);

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
    setLoading(true);
    setResult(null);
    setQueryError(null);
    try {
      const res = await api.query(q, "hybrid", 5);
      setResult(res);
    } catch {
      setQueryError(
        "Query failed — the backend is not reachable. Try again once it is running.",
      );
    }
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30">
      <p className="eyebrow text-[color:var(--signal-amber)]">Try it · recall</p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Recall through indirect queries
      </h2>
      <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
        The system is pre-loaded with facts about a fictional engineering team.
        Try asking something indirect — the probe doesn&rsquo;t need to share
        exact words with the stored facts.
      </p>

      {!seeded && !seedError && (
        <p className="mt-5 text-xs text-muted-foreground animate-pulse">
          Loading seed memories…
        </p>
      )}

      {seedError && (
        <div className="mt-5 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
          Couldn&rsquo;t reach the backend to seed memories. The rest of the
          page still works — start the backend (see README) to use this block.
        </div>
      )}

      {seeded && (
        <>
          <div className="mt-6 rounded-md border border-border bg-card/40 p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Seed memories
            </p>
            <ul className="mt-2 space-y-1.5">
              {DEMO_FACTS.slice(0, 4).map((f) => (
                <li
                  key={f.text}
                  className="text-[13px] leading-snug text-foreground/80"
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
              className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[color:var(--signal-amber)]/50"
            />
            <button
              onClick={() => query && handleQuery(query)}
              disabled={loading || !query}
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:scale-[1.02] transition-transform"
            >
              {loading ? "…" : "Probe"}
            </button>
          </div>
        </>
      )}

      {queryError && (
        <div className="mt-4 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
          {queryError}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Results · {result.latency_ms.toFixed(0)} ms
            </p>
            {result.results.slice(0, 4).map((r, i) => (
              <motion.div
                key={r.memory.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-md border border-border bg-card/40 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] text-foreground/90">
                      {r.memory.text}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {r.why[0]}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/10 px-2 py-0.5">
                    <span className="text-[11px] font-mono text-[color:var(--signal-amber)]">
                      {(r.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] font-mono text-muted-foreground">
                  <span>
                    <span className="text-[color:var(--signal-amber)]/80">
                      holo
                    </span>{" "}
                    {r.components.holographic.toFixed(3)}
                  </span>
                  <span>
                    <span className="text-[color:var(--signal-blue)]/80">
                      kw
                    </span>{" "}
                    {r.components.keyword.toFixed(3)}
                  </span>
                  <span>
                    <span className="text-[color:var(--signal-violet)]/80">
                      trust
                    </span>{" "}
                    {r.components.trust.toFixed(2)}
                  </span>
                  <span>
                    <span className="text-muted-foreground">entity</span>{" "}
                    {r.components.entity_overlap.toFixed(3)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
