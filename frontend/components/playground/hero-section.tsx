"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { DemoScriptModal } from "./demo-script-modal";

const STEPS = [
  {
    n: "01",
    title: "Seed the demo",
    body: "Load example memories about a fictional team so there is something to query.",
  },
  {
    n: "02",
    title: "Teach or browse",
    body: "Add facts in plain English on the left, watch them join the memory field in the middle.",
  },
  {
    n: "03",
    title: "Recall and disturb",
    body: "Ask a fuzzy question on the right. Below, inject noise or create contradictions and see how trust adapts.",
  },
];

export function HeroSection() {
  const queryClient = useQueryClient();
  const [showScript, setShowScript] = useState(false);

  const seedMutation = useMutation({
    mutationFn: () => api.demo.seed(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field"] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return (
    <section className="px-6 pt-12 pb-10 sm:pt-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow">The HoloMem lab</p>
            <h1 className="mt-3 font-serif text-[36px] leading-[1.05] tracking-tight text-foreground sm:text-[44px]">
              Teach an agent. Disturb its memory. Watch it remember.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              An interactive sandbox for the same algebra you saw on the
              homepage. Add facts, ask indirect questions, inject noise,
              and inspect every component score behind a result.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="glow-button rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {seedMutation.isPending ? "Seeding…" : "Seed demo memories"}
              </button>
              <button
                onClick={() => setShowScript(true)}
                className="rounded-md border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-card/60"
              >
                Read the demo script
              </button>
              {seedMutation.isSuccess && (
                <span className="font-mono text-[12px] text-[color:var(--signal-amber)]">
                  loaded {seedMutation.data.memories_created} memories
                </span>
              )}
            </div>
          </div>

          <ol className="space-y-5 sm:pt-2">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="grid grid-cols-[44px_1fr] gap-x-4 sm:gap-x-5"
              >
                <span className="font-mono text-[13px] tracking-[0.04em] text-[color:var(--signal-amber)]">
                  {step.n}
                </span>
                <div>
                  <p className="font-serif text-[18px] leading-tight tracking-tight text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <DemoScriptModal open={showScript} onOpenChange={setShowScript} />
    </section>
  );
}
