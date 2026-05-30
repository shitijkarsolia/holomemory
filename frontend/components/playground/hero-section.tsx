"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EXTRA_SEED } from "@/lib/demo-data";
import { useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Seed the lab",
    body: "Load a large set of example memories so there is something rich to query against.",
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
  const [extraCount, setExtraCount] = useState<number | null>(null);

  const seedMutation = useMutation({
    mutationFn: async () => {
      await api.reset();
      const demo = await api.demo.seed();
      const created = await Promise.all(
        EXTRA_SEED.map((m) => api.memories.create(m).catch(() => null)),
      );
      const extras = created.filter(Boolean).length;
      setExtraCount(extras);
      return {
        ...demo,
        memories_created: demo.memories_created + extras,
      };
    },
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
            <p className="eyebrow">Playground · HRR Lab and applied sandbox</p>
            <h1 className="mt-3 font-serif text-[36px] leading-[1.05] tracking-tight text-foreground sm:text-[44px]">
              Run the operations. Stress-test the memory.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Below are four HRR interactives (unbind, capacity, role-binding,
              noise), followed by a sandbox for the applied memory system from
              the homepage. Seed the lab to load example memories you can
              teach against, query, and disturb.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="glow-button rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {seedMutation.isPending
                  ? "Seeding the lab…"
                  : "Seed the lab with example memories"}
              </button>
              {seedMutation.isSuccess && extraCount !== null && (
                <span className="font-mono text-[12px] text-[color:var(--signal-amber)]">
                  loaded {seedMutation.data.memories_created} memories
                </span>
              )}
            </div>
            {seedMutation.isPending && (
              <p className="mt-3 font-mono text-[12px] text-muted-foreground">
                Resetting the field, then loading {EXTRA_SEED.length + 5}+ traces…
              </p>
            )}
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
    </section>
  );
}
