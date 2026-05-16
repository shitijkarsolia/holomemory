"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ExperimentResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flask } from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ExperimentsPage() {
  const [result, setResult] = useState<ExperimentResponse | null>(null);

  const runMutation = useMutation({
    mutationFn: () => api.experiments.run(10),
    onSuccess: (data) => setResult(data),
  });

  const chartData = result
    ? [
        { metric: "Recall@1", keyword: result.keyword.recall_at_1, holographic: result.holographic.recall_at_1, hybrid: result.hybrid.recall_at_1 },
        { metric: "Recall@3", keyword: result.keyword.recall_at_3, holographic: result.holographic.recall_at_3, hybrid: result.hybrid.recall_at_3 },
        { metric: "Recall@5", keyword: result.keyword.recall_at_5, holographic: result.holographic.recall_at_5, hybrid: result.hybrid.recall_at_5 },
      ]
    : [];

  const latencyData = result
    ? [
        { mode: "Keyword", latency: result.keyword.avg_latency_ms },
        { mode: "Holographic", latency: result.holographic.avg_latency_ms },
        { mode: "Hybrid", latency: result.hybrid.avg_latency_ms },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Experiments</h1>
          <p className="text-sm text-muted-foreground">
            Benchmark retrieval modes against synthetic queries
          </p>
        </div>
        <Button
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="gap-2"
          size="sm"
        >
          <Flask className="h-3.5 w-3.5" weight="bold" />
          {runMutation.isPending ? "Running..." : "Run Experiment"}
        </Button>
      </div>

      {!result && !runMutation.isPending && (
        <div className="rounded-lg border border-dashed border-border p-16 text-center">
          <Flask className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Run an experiment to compare keyword, holographic, and hybrid retrieval.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The benchmark uses 10 synthetic queries against all active memories.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-[11px]">
              {result.num_memories} memories
            </Badge>
            <Badge variant="secondary" className="font-mono text-[11px]">
              {result.num_queries} queries
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Recall Comparison
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="#71717a" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#71717a" domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="keyword" fill="#a1a1aa" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="holographic" fill="#52525b" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="hybrid" fill="#18181b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Average Latency (ms)
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData}>
                    <XAxis dataKey="mode" tick={{ fontSize: 11 }} stroke="#71717a" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="latency" fill="#71717a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed table */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
              Detailed Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-[11px] font-medium text-muted-foreground">Mode</th>
                    <th className="pb-2 text-right text-[11px] font-medium text-muted-foreground">Recall@1</th>
                    <th className="pb-2 text-right text-[11px] font-medium text-muted-foreground">Recall@3</th>
                    <th className="pb-2 text-right text-[11px] font-medium text-muted-foreground">Recall@5</th>
                    <th className="pb-2 text-right text-[11px] font-medium text-muted-foreground">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Keyword", data: result.keyword },
                    { name: "Holographic", data: result.holographic },
                    { name: "Hybrid", data: result.hybrid },
                  ].map(({ name, data }) => (
                    <tr key={name} className="border-b border-border last:border-0">
                      <td className="py-2.5 font-medium">{name}</td>
                      <td className="py-2.5 text-right font-mono">{(data.recall_at_1 * 100).toFixed(0)}%</td>
                      <td className="py-2.5 text-right font-mono">{(data.recall_at_3 * 100).toFixed(0)}%</td>
                      <td className="py-2.5 text-right font-mono">{(data.recall_at_5 * 100).toFixed(0)}%</td>
                      <td className="py-2.5 text-right font-mono">{data.avg_latency_ms.toFixed(1)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </h2>
            <ul className="space-y-1.5">
              {result.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
