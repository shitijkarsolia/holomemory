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
  const queryClient = useQueryClient();
  const seedingRef = useRef(false);

  useEffect(() => {
    if (seedingRef.current) return;
    seedingRef.current = true;

    const seed = async () => {
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
    };
    seed();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuery = async (q: string) => {
    setQuery(q);
    setLoading(true);
    setResult(null);
    try {
      const res = await api.query(q, "hybrid", 5);
      setResult(res);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 border-t border-border/10">
      <p className="text-[11px] font-mono uppercase tracking-wider text-primary/70 mb-2">
        Try it
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Recall through indirect queries
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        The system is pre-loaded with facts about a fictional engineering team.
        Try asking something indirect — the query doesn&rsquo;t need to share exact
        words with the stored facts.
      </p>

      {!seeded && (
        <p className="mt-4 text-xs text-muted-foreground/50 animate-pulse">
          Loading facts...
        </p>
      )}

      {seeded && (
        <>
          <div className="mt-5 rounded-md border border-border/30 bg-card/20 p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40 mb-2">
              Stored facts
            </p>
            <ul className="space-y-1">
              {DEMO_FACTS.slice(0, 4).map((f) => (
                <li key={f.text} className="text-xs text-muted-foreground/70">
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleQuery(q)}
                disabled={loading}
                className="rounded-md border border-border/40 bg-card/40 px-3 py-2 text-xs text-foreground/80 hover:border-primary/30 transition-colors disabled:opacity-40"
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
              onKeyDown={(e) => e.key === "Enter" && query && handleQuery(query)}
              placeholder="Or type your own query..."
              className="flex-1 rounded-md border border-border/30 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
            />
            <button
              onClick={() => query && handleQuery(query)}
              disabled={loading || !query}
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              {loading ? "..." : "Probe"}
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40">
              Results ({result.latency_ms.toFixed(0)}ms)
            </p>
            {result.results.slice(0, 4).map((r, i) => (
              <motion.div
                key={r.memory.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-md border border-border/20 bg-card/30 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground/85">{r.memory.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/50">
                      {r.why[0]}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] font-mono text-muted-foreground/50">
                      {(r.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-3 text-[9px] font-mono text-muted-foreground/40">
                  <span>holo: {r.components.holographic.toFixed(3)}</span>
                  <span>kw: {r.components.keyword.toFixed(3)}</span>
                  <span>trust: {r.components.trust.toFixed(2)}</span>
                  <span>entity: {r.components.entity_overlap.toFixed(3)}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
