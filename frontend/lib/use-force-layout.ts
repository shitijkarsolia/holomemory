"use client";

import { useMemo } from "react";
import type { Memory, FieldEdge } from "@/lib/types";

interface Position {
  x: number;
  y: number;
}

export function useForceLayout(
  memories: Memory[],
  edges: FieldEdge[]
): Map<string, Position> {
  // Build stable content keys so a refetch that returns *new array
  // references with identical structure* doesn't trigger another
  // 60 × O(n²) layout pass. Layout depends only on graph topology
  // (which nodes exist + which edges connect them by weight), not on
  // mutable fields like text or trust.
  const memKey = useMemo(
    () => memories.map((m) => m.id).join("|"),
    [memories],
  );
  const edgeKey = useMemo(
    () =>
      edges
        .map((e) => `${e.source_id}>${e.target_id}#${e.shared_entities.length}`)
        .join(","),
    [edges],
  );

  return useMemo(() => {
    if (memories.length === 0) return new Map();

    const width = 600;
    const height = 400;
    const padding = 40;

    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();

    // Hash all memory IDs together so two memory sets of the same size
    // but different membership get different initial layouts. (Previous
    // seed = memories.length collapsed all same-size sets to identical
    // starting positions, which made add+delete jolt the whole graph.)
    let seed = 2166136261 >>> 0;
    for (const m of memories) {
      for (let i = 0; i < m.id.length; i++) {
        seed = Math.imul(seed ^ m.id.charCodeAt(i), 16777619) >>> 0;
      }
    }
    let rng = seed >>> 0;
    const random = () => {
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      return rng / 0x100000000;
    };

    memories.forEach((mem) => {
      positions.set(mem.id, {
        x: padding + random() * (width - padding * 2),
        y: padding + random() * (height - padding * 2),
        vx: 0,
        vy: 0,
      });
    });

    const iterations = 60;
    const repulsion = 800;
    const attraction = 0.005;
    const damping = 0.85;

    for (let iter = 0; iter < iterations; iter++) {
      const nodes = Array.from(positions.entries());

      for (let i = 0; i < nodes.length; i++) {
        const [, p1] = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const [, p2] = nodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          p1.vx += fx;
          p1.vy += fy;
          p2.vx -= fx;
          p2.vy -= fy;
        }
      }

      edges.forEach((edge) => {
        const p1 = positions.get(edge.source_id);
        const p2 = positions.get(edge.target_id);
        if (!p1 || !p2) return;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const strength = attraction * edge.shared_entities.length;
        p1.vx += dx * strength;
        p1.vy += dy * strength;
        p2.vx -= dx * strength;
        p2.vy -= dy * strength;
      });

      positions.forEach((p) => {
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(padding, Math.min(width - padding, p.x));
        p.y = Math.max(padding, Math.min(height - padding, p.y));
      });
    }

    const result = new Map<string, Position>();
    positions.forEach((p, id) => {
      result.set(id, { x: p.x, y: p.y });
    });
    return result;
    // memories/edges are intentionally omitted: they're new references on
    // every refetch even when content is unchanged. The two content keys
    // capture the topology that actually drives the layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memKey, edgeKey]);
}
