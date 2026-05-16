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
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Recall Duel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Same query, two retrieval modes. See where holographic memory wins.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {DUEL_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-md bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && mutation.mutate()}
            placeholder="Enter a query to compare modes..."
            className="bg-secondary/50 text-sm border-border/50"
          />
          <Button
            onClick={() => mutation.mutate()}
            disabled={!query.trim() || mutation.isPending}
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Scales className="h-3.5 w-3.5" weight="bold" />
            {mutation.isPending ? "..." : "Duel"}
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
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
      className="rounded-xl border border-border/30 bg-card/50 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className="text-[10px] font-mono border-primary/30 text-primary"
        >
          {title}
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">
          {response.latency_ms.toFixed(1)}ms
        </span>
      </div>

      {response.results.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-6 text-center">
          No results
        </p>
      ) : (
        <div className="space-y-2">
          {response.results.map((r, i) => (
            <motion.div
              key={r.memory.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: delay + i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="rounded-md border border-border/20 bg-secondary/30 p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] leading-relaxed line-clamp-2">
                  {r.memory.text}
                </p>
                <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
              {r.why.length > 0 && (
                <p className="mt-1 text-[9px] text-muted-foreground/60 line-clamp-1">
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
