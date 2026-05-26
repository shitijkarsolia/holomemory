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
  "Where does Atlas store its memories?",
];

function scoreTooltip(mode: "hybrid" | "holographic" | "keyword", score: number): string {
  const pct = (score * 100).toFixed(1) + "%";
  if (mode === "hybrid") {
    return `Hybrid score (${pct}) = 0.4·H + 0.3·K + 0.15·T + 0.15·E, blended from this card's component values.`;
  }
  if (mode === "holographic") {
    return `Holographic score (${pct}) is the raw vector cosine similarity. Trust is not factored in for this mode.`;
  }
  return `Keyword score (${pct}) is the fraction of query stems present in this memory. Trust is not factored in for this mode.`;
}

interface Props {
  onResults?: (ids: string[]) => void;
}

export function RecallChallenge({ onResults }: Props) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"hybrid" | "holographic" | "keyword">("hybrid");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.query(query, mode, 5),
    onMutate: () => {
      setErrorMsg(null);
    },
    onSuccess: (data) => {
      setResult(data);
      onResults?.(data.results.map((r) => r.memory.id));
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Recall failed. Try again.";
      setErrorMsg(msg);
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
        <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground/80">
          {mode === "hybrid" &&
            "Weighted blend: 40% vector, 30% keywords, 15% trust, 15% entities."}
          {mode === "holographic" &&
            "Pure vector cosine similarity. Trust is ignored, so stale or low-trust memories can win on raw overlap."}
          {mode === "keyword" &&
            "Fraction of query stems present in the memory. Trust is ignored."}
        </p>
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!query.trim() || mutation.isPending}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-[14px]"
      >
        <MagnifyingGlass className="h-4 w-4" weight="bold" />
        {mutation.isPending ? "Probing…" : "Recall"}
      </Button>

      {errorMsg && (
        <div className="rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-3.5 py-2.5 text-[12.5px] text-foreground/85">
          {errorMsg}
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-3 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

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
                      <span
                        title={scoreTooltip(mode, r.score)}
                        className="shrink-0 cursor-help font-mono text-[13px] font-semibold text-[color:var(--signal-amber)]"
                      >
                        {(r.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                      <span title="Holographic similarity: cosine overlap between the probe vector and the memory trace.">
                        <span className="text-[color:var(--signal-amber)]/80">H</span>{" "}
                        {(r.components.holographic * 100).toFixed(0)}
                      </span>
                      <span title="Keyword overlap: fraction of query stems present in the memory.">
                        <span className="text-[color:var(--signal-blue)]/80">K</span>{" "}
                        {(r.components.keyword * 100).toFixed(0)}
                      </span>
                      <span title="Trust: source-credibility score attached to the memory (0 to 1).">
                        <span className="text-[color:var(--signal-violet)]/80">T</span>{" "}
                        {(r.components.trust * 100).toFixed(0)}
                      </span>
                      <span title="Entity overlap: shared named entities between the query and the memory.">
                        <span style={{ color: "oklch(0.62 0.07 155 / 0.85)" }}>
                          E
                        </span>{" "}
                        {(r.components.entity_overlap * 100).toFixed(0)}
                      </span>
                      {(r.memory.tags || []).includes("outdated") && (
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/40 text-[10px] text-muted-foreground"
                        >
                          outdated
                        </Badge>
                      )}
                      {(r.memory.tags || []).includes("dubious") && (
                        <Badge
                          variant="outline"
                          className="border-[color:var(--signal-red)]/45 text-[10px] text-[color:var(--signal-red)]"
                        >
                          dubious
                        </Badge>
                      )}
                      {(r.memory.status === "stale" ||
                        r.memory.status === "superseded") && (
                        <Badge
                          variant="outline"
                          className="border-muted-foreground/40 text-[10px] text-muted-foreground"
                        >
                          {r.memory.status}
                        </Badge>
                      )}
                      {r.memory.trust < 0.4 && (
                        <Badge
                          variant="outline"
                          className="border-[color:var(--signal-red)]/45 text-[10px] text-[color:var(--signal-red)]"
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
