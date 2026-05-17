"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FieldResponse } from "@/lib/types";
import { useForceLayout } from "@/lib/use-force-layout";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface Props {
  highlightedIds?: string[];
  lastEncodedId?: string | null;
}

export function MemoryField({ highlightedIds = [], lastEncodedId }: Props) {
  const { data } = useQuery<FieldResponse>({
    queryKey: ["field"],
    queryFn: api.field,
    refetchInterval: 5000,
  });

  const memories = data?.memories || [];
  const edges = data?.edges || [];

  const positions = useForceLayout(memories, edges);

  const highlightSet = useMemo(() => new Set(highlightedIds), [highlightedIds]);

  if (memories.length === 0) {
    return (
      <div className="flex h-full min-h-[440px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-[oklch(0.09_0.012_75)]">
        <div className="max-w-[280px] px-6 text-center">
          <p className="font-serif text-[18px] tracking-tight text-foreground">
            Memory field is empty
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Click <span className="text-foreground/85">Seed demo memories</span>{" "}
            above, or teach a memory on the left. Nodes will appear here and
            cluster by shared entities.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60">
            force-directed graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border/30 bg-[oklch(0.08_0_0)]">
      <svg
        viewBox="0 0 600 400"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edges.map((edge, i) => {
          const p1 = positions.get(edge.source_id);
          const p2 = positions.get(edge.target_id);
          if (!p1 || !p2) return null;
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="oklch(0.65 0.17 160)"
              strokeOpacity={0.08 + edge.shared_entities.length * 0.04}
              strokeWidth={0.5}
            />
          );
        })}

        <AnimatePresence>
          {memories.map((mem) => {
            const pos = positions.get(mem.id);
            if (!pos) return null;
            const isHighlighted = highlightSet.has(mem.id);
            const isNew = mem.id === lastEncodedId;
            const isLowTrust = mem.trust < 0.3;
            const isContradiction = mem.tags.includes("contradiction");
            const radius = 4 + mem.trust * 6;

            return (
              <motion.g
                key={mem.id}
                initial={isNew ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={
                    isContradiction
                      ? "oklch(0.6 0.2 25)"
                      : isLowTrust
                        ? "oklch(0.4 0.05 160)"
                        : "oklch(0.65 0.17 160)"
                  }
                  fillOpacity={isHighlighted ? 0.9 : 0.3 + mem.trust * 0.4}
                  filter={isHighlighted ? "url(#glow-strong)" : isNew ? "url(#glow)" : undefined}
                  animate={
                    isHighlighted
                      ? { r: radius * 1.4, fillOpacity: 0.95 }
                      : { r: radius, fillOpacity: 0.3 + mem.trust * 0.4 }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
                {isNew && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill="none"
                    stroke="oklch(0.65 0.17 160)"
                    strokeWidth={1}
                    initial={{ r: radius, opacity: 1 }}
                    animate={{ r: radius * 4, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[9px] text-muted-foreground/60">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-primary/60" />
          Memory
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-destructive/60" />
          Conflict
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-primary/20" />
          Low trust
        </span>
      </div>

      <div className="absolute top-3 right-3 font-mono text-[9px] text-muted-foreground/40">
        {memories.length} traces
      </div>
    </div>
  );
}
