"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FieldResponse, Memory } from "@/lib/types";
import { useForceLayout } from "@/lib/use-force-layout";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";

interface Props {
  highlightedIds?: string[];
  lastEncodedId?: string | null;
}

const VIEW_W = 600;
const VIEW_H = 400;

export function MemoryField({ highlightedIds = [], lastEncodedId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { data } = useQuery<FieldResponse>({
    queryKey: ["field"],
    queryFn: api.field,
    refetchInterval: 5000,
  });

  const memories = useMemo(() => data?.memories ?? [], [data?.memories]);
  const edges = useMemo(() => data?.edges ?? [], [data?.edges]);

  const positions = useForceLayout(memories, edges);

  const highlightSet = useMemo(() => new Set(highlightedIds), [highlightedIds]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = useMemo(
    () => memories.find((m) => m.id === hoveredId) ?? null,
    [memories, hoveredId],
  );
  const hoveredPos = hoveredId ? positions.get(hoveredId) : null;

  if (memories.length === 0) {
    return (
      <div className="flex h-full min-h-[440px] items-center justify-center rounded-xl border border-dashed border-border/40 bg-[oklch(0.09_0.012_75)]">
        <div className="max-w-[280px] px-6 text-center">
          <p className="font-serif text-[18px] tracking-tight text-foreground">
            Memory field is empty
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Click <span className="text-foreground/85">Seed the lab</span>{" "}
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
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-border/30 bg-[oklch(0.09_0.012_75)]"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoveredId(null)}
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
          const isHoverEdge =
            hoveredId === edge.source_id || hoveredId === edge.target_id;
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--signal-amber)"
              strokeOpacity={
                isHoverEdge
                  ? 0.45
                  : 0.08 + edge.shared_entities.length * 0.04
              }
              strokeWidth={isHoverEdge ? 1 : 0.5}
            />
          );
        })}

        <AnimatePresence>
          {memories.map((mem) => {
            const pos = positions.get(mem.id);
            if (!pos) return null;
            const isHighlighted = highlightSet.has(mem.id);
            const isNew = mem.id === lastEncodedId;
            const trust = typeof mem.trust === "number" && Number.isFinite(mem.trust) ? mem.trust : 0.5;
            const isLowTrust = trust < 0.3;
            const isContradiction = mem.tags.includes("contradiction");
            const isHovered = hoveredId === mem.id;
            const radius = 4 + trust * 6;
            const baseFillOpacity = 0.3 + trust * 0.4;

            return (
              <motion.g
                key={mem.id}
                initial={isNew ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onMouseEnter={() => setHoveredId(mem.id)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 8}
                  fill="transparent"
                  pointerEvents="all"
                />
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={
                    isContradiction
                      ? "var(--signal-red)"
                      : isLowTrust
                        ? "var(--muted-foreground)"
                        : "var(--signal-amber)"
                  }
                  fillOpacity={isHovered || isHighlighted ? 0.95 : baseFillOpacity}
                  filter={
                    isHighlighted || isHovered
                      ? "url(#glow-strong)"
                      : isNew
                        ? "url(#glow)"
                        : undefined
                  }
                  initial={{ r: radius, fillOpacity: baseFillOpacity }}
                  animate={
                    isHighlighted || isHovered
                      ? { r: radius * 1.4, fillOpacity: 0.95 }
                      : { r: radius, fillOpacity: baseFillOpacity }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
                {isNew && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill="none"
                    stroke="var(--signal-amber)"
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

      {hovered && hoveredPos && (
        <NodeTooltip
          mem={hovered}
          x={hoveredPos.x}
          y={hoveredPos.y}
          svgRef={svgRef}
          containerRef={containerRef}
        />
      )}

      <FieldLegend total={memories.length} />
    </div>
  );
}

function NodeTooltip({
  mem,
  x,
  y,
  svgRef,
  containerRef,
}: {
  mem: Memory;
  x: number;
  y: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Convert SVG user-space (x, y) into pixel coordinates relative to
  // the container. preserveAspectRatio='xMidYMid meet' letterboxes the
  // SVG when the container's aspect ratio differs from VIEW_W:VIEW_H,
  // so a naive percentage from SVG coords drifts off the actual node.
  // getScreenCTM gives us the live transform that includes that letterbox.
  let leftPx = (x / VIEW_W) * (containerRef.current?.clientWidth ?? VIEW_W);
  let topPx = (y / VIEW_H) * (containerRef.current?.clientHeight ?? VIEW_H);
  const svg = svgRef.current;
  const container = containerRef.current;
  if (svg && container) {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = x;
      pt.y = y;
      const screen = pt.matrixTransform(ctm);
      const rect = container.getBoundingClientRect();
      leftPx = screen.x - rect.left;
      topPx = screen.y - rect.top;
    }
  }

  const containerW = containerRef.current?.clientWidth ?? VIEW_W;
  const containerH = containerRef.current?.clientHeight ?? VIEW_H;
  const placeLeft = leftPx > containerW * 0.6;
  const placeAbove = topPx > containerH * 0.65;

  return (
    <div
      className="pointer-events-none absolute z-10 max-w-[260px] rounded-md border border-border/70 bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur-sm"
      style={{
        left: `${leftPx}px`,
        top: `${topPx}px`,
        transform: `translate(${placeLeft ? "calc(-100% - 14px)" : "14px"}, ${
          placeAbove ? "calc(-100% - 14px)" : "14px"
        })`,
      }}
    >
      <p className="text-[12.5px] leading-snug text-foreground">{mem.text}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10.5px] text-muted-foreground">
        <span>
          trust{" "}
          <span
            className="text-foreground/80"
            style={
              mem.trust < 0.3
                ? { color: "var(--signal-red)" }
                : undefined
            }
          >
            {mem.trust.toFixed(2)}
          </span>
        </span>
        <span>
          source <span className="text-foreground/80">{mem.source}</span>
        </span>
        {mem.tags.length > 0 && (
          <span>
            tags <span className="text-foreground/80">{mem.tags.join(", ")}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function FieldLegend({ total }: { total: number }) {
  return (
    <>
      <div className="pointer-events-none absolute top-3 right-3 font-mono text-[10.5px] text-muted-foreground/70">
        {total} traces
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] text-muted-foreground/80">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--signal-amber)]/85" />
          memory
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--muted-foreground)]/70" />
          low trust
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--signal-red)]/85" />
          contradiction
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-px w-4 bg-[color:var(--signal-amber)]/60" />
          shared entity
        </span>
        <span className="ml-auto hidden text-muted-foreground/60 sm:inline">
          hover a node for details
        </span>
      </div>
    </>
  );
}
