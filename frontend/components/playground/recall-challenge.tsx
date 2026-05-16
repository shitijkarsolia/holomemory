"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const EXAMPLE_QUERIES = [
  "What does Maya prefer?",
  "What stack does Atlas use?",
  "What changed about Maya's editor?",
  "Which memory seems least trustworthy?",
];

interface Props {
  onResults?: (ids: string[]) => void;
}

export function RecallChallenge({ onResults }: Props) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"hybrid" | "holographic" | "keyword">("hybrid");
  const [result, setResult] = useState<QueryResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.query(query, mode, 5),
    onSuccess: (data) => {
      setResult(data);
      onResults?.(data.results.map((r) => r.memory.id));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Recall Challenge</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Ask something fuzzy, partial, or indirect
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => setQuery(q)}
            className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && query && mutation.mutate()}
          placeholder="Ask something fuzzy..."
          className="pl-9 bg-secondary/50 text-sm border-border/50"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {(["hybrid", "holographic", "keyword"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={!query.trim() || mutation.isPending}
          size="sm"
          className="ml-auto gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MagnifyingGlass className="h-3 w-3" weight="bold" />
          {mutation.isPending ? "..." : "Recall"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.query + result.mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] font-mono border-primary/30 text-primary">
                {result.mode}
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">
                {result.latency_ms.toFixed(1)}ms
              </span>
            </div>

            {result.results.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 py-4 text-center">
                No memories matched this query.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {result.results.map((r, i) => (
                  <motion.div
                    key={r.memory.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
                    className="rounded-md border border-border/30 bg-secondary/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] leading-relaxed line-clamp-2">
                        {r.memory.text}
                      </p>
                      <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                        {(r.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span>H:{(r.components.holographic * 100).toFixed(0)}</span>
                      <span>K:{(r.components.keyword * 100).toFixed(0)}</span>
                      <span>T:{(r.components.trust * 100).toFixed(0)}</span>
                      {r.memory.trust < 0.3 && (
                        <Badge variant="outline" className="text-[8px] border-destructive/30 text-destructive">
                          low trust
                        </Badge>
                      )}
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
        )}
      </AnimatePresence>
    </div>
  );
}
