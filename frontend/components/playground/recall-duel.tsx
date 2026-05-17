"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scales } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const DUEL_QUERIES = [
  "What does Maya like?",
  "Tell me about the Atlas stack",
  "Who prefers concise answers?",
  "What editor does Maya use?",
];

interface DuelResult {
  query: string;
  holographic: QueryResponse;
  keyword: QueryResponse;
}

export function RecallDuel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DuelResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.duel(query, 5),
    onSuccess: (data) => setResult(data),
  });

  return (
    <section className="border-t border-border/30 px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-serif text-[28px] leading-tight tracking-tight text-foreground sm:text-[32px]">
            Recall duel
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
            Run the same query through plain keyword search and holographic
            recall side by side. The differences show up clearly on indirect
            or paraphrased questions.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {DUEL_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-[12.5px] text-foreground/80 transition-colors hover:border-[color:var(--signal-amber)]/40 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mb-8 flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && mutation.mutate()}
            placeholder="Enter a query to compare modes…"
            className="border-border/50 bg-secondary/40 text-[14.5px]"
          />
          <Button
            onClick={() => mutation.mutate()}
            disabled={!query.trim() || mutation.isPending}
            className="shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-[14px]"
          >
            <Scales className="h-4 w-4" weight="bold" />
            {mutation.isPending ? "Running…" : "Duel"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.query}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="grid gap-4 md:grid-cols-2"
            >
              <DuelColumn
                title="Keyword"
                response={result.keyword}
                delay={0}
              />
              <DuelColumn
                title="Holographic"
                response={result.holographic}
                delay={0.1}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function DuelColumn({
  title,
  response,
  delay,
}: {
  title: string;
  response: QueryResponse;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="rounded-xl border border-border/40 bg-card/40 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <Badge
          variant="outline"
          className="border-[color:var(--signal-amber)]/30 font-mono text-[11px] text-[color:var(--signal-amber)]"
        >
          {title}
        </Badge>
        <span className="font-mono text-[11.5px] text-muted-foreground">
          {response.latency_ms.toFixed(1)} ms
        </span>
      </div>

      {response.results.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted-foreground/70">
          No results.
        </p>
      ) : (
        <div className="space-y-2.5">
          {response.results.map((r, i) => (
            <motion.div
              key={r.memory.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: delay + i * 0.18,
                duration: 0.5,
              }}
              className="rounded-md border border-border/40 bg-secondary/30 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] leading-relaxed text-foreground/90">
                  {r.memory.text}
                </p>
                <span className="shrink-0 font-mono text-[13px] font-semibold text-[color:var(--signal-amber)]">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
              {r.why.length > 0 && (
                <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground/70">
                  {r.why[0]}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
