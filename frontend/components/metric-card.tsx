"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export function MetricCard({ label, value, sub, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}
