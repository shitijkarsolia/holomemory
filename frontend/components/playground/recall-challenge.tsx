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
import { Label } from "@/components/ui/label";

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
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Ask something fuzzy, partial, or indirect. Matching memories light
          up in the field, with each component score broken out.
        </p>
      </div>

      <div>
        <Label className="text-[12px] text-muted-foreground">Try one of these</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-left text-[12.5px] text-foreground/80 transition-colors hover:border-[color:var(--signal-amber)]/40 hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[12px] text-muted-foreground">Probe</Label>
        <div className="relative mt-2">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && mutation.mutate()}
            placeholder="Who handles login?"
            className="border-border/50 bg-secondary/40 pl-10 text-[14.5px]"
          />
        </div>
      </div>

      <div>
        <Label className="text-[12px] text-muted-foreground">Retrieval mode</Label>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {(["hybrid", "holographic", "keyword"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!query.trim() || mutation.isPending}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-[14px]"
      >
        <MagnifyingGlass className="h-4 w-4" weight="bold" />
        {mutation.isPending ? "Probing…" : "Recall"}
      </Button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.query + result.mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-4">
              <Badge
                variant="outline"
                className="border-[color:var(--signal-amber)]/30 font-mono text-[11px] text-[color:var(--signal-amber)]"
              >
                {result.mode}
              </Badge>
              <span className="font-mono text-[11.5px] text-muted-foreground">
                {result.latency_ms.toFixed(1)} ms
              </span>
            </div>

            {result.results.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-muted-foreground/70">
                No memories matched this query.
              </p>
            ) : (
              <div className="max-h-[340px] space-y-2 overflow-y-auto">
                {result.results.map((r, i) => (
                  <motion.div
                    key={r.memory.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.18, duration: 0.45 }}
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
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                      <span>
                        <span className="text-[color:var(--signal-amber)]/80">H</span>{" "}
                        {(r.components.holographic * 100).toFixed(0)}
                      </span>
                      <span>
                        <span className="text-[color:var(--signal-blue)]/80">K</span>{" "}
                        {(r.components.keyword * 100).toFixed(0)}
                      </span>
                      <span>
                        <span className="text-[color:var(--signal-violet)]/80">T</span>{" "}
                        {(r.components.trust * 100).toFixed(0)}
                      </span>
                      {r.memory.trust < 0.3 && (
                        <Badge
                          variant="outline"
                          className="border-destructive/40 text-[10px] text-destructive"
                        >
                          low trust
                        </Badge>
                      )}
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
        )}
      </AnimatePresence>
    </div>
  );
}
