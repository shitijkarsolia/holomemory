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
  return useMemo(() => {
    if (memories.length === 0) return new Map();

    const width = 600;
    const height = 400;
    const padding = 40;

    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();

    const seed = memories.length;
    let rng = seed;
    const random = () => {
      rng = (rng * 1664525 + 1013904223) & 0xffffffff;
      return (rng >>> 0) / 0xffffffff;
    };

    memories.forEach((mem) => {
      positions.set(mem.id, {
        x: padding + random() * (width - padding * 2),
        y: padding + random() * (height - padding * 2),
        vx: 0,
        vy: 0,
      });
    });

    const edgeMap = new Map<string, Set<string>>();
    edges.forEach((e) => {
      if (!edgeMap.has(e.source_id)) edgeMap.set(e.source_id, new Set());
      if (!edgeMap.has(e.target_id)) edgeMap.set(e.target_id, new Set());
      edgeMap.get(e.source_id)!.add(e.target_id);
      edgeMap.get(e.target_id)!.add(e.source_id);
    });

    const iterations = 60;
    const repulsion = 800;
    const attraction = 0.005;
    const damping = 0.85;

    for (let iter = 0; iter < iterations; iter++) {
      const nodes = Array.from(positions.entries());

      for (let i = 0; i < nodes.length; i++) {
        const [id1, p1] = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const [id2, p2] = nodes[j];
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
  }, [memories, edges]);
}
