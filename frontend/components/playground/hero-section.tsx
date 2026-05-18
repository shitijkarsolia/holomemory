"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MemoryCreate } from "@/lib/types";
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

const EXTRA_SEED: MemoryCreate[] = [
  // Ownership facts
  { text: "Sarah owns the auth service and reviews every login PR.", kind: "fact", subject: "Sarah", predicate: "owns", object: "auth service", entities: ["Sarah", "auth service"], tags: ["ownership"], source: "user", trust: 0.92 },
  { text: "Jake owns the payments module after last sprint's refactor.", kind: "fact", subject: "Jake", predicate: "owns", object: "payments module", entities: ["Jake", "payments module"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Priya owns the search infrastructure across both products.", kind: "fact", subject: "Priya", predicate: "owns", object: "search infrastructure", entities: ["Priya", "search infrastructure"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Carlos owns the deployment pipeline and the on-call rotation.", kind: "fact", subject: "Carlos", predicate: "owns", object: "deployment pipeline", entities: ["Carlos", "deployment pipeline", "on-call"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Nora owns the analytics service and the dashboard tooling.", kind: "fact", subject: "Nora", predicate: "owns", object: "analytics service", entities: ["Nora", "analytics service"], tags: ["ownership"], source: "user", trust: 0.88 },

  // Tech stack
  { text: "The Atlas project uses FastAPI and SQLite for its prototype.", kind: "fact", subject: "Atlas project", predicate: "uses", object: "FastAPI", entities: ["Atlas project", "FastAPI", "SQLite"], tags: ["tech-stack"], source: "user", trust: 0.9 },
  { text: "The Helios service runs on Python 3.11 with asyncio everywhere.", kind: "fact", subject: "Helios service", predicate: "runs on", object: "Python 3.11", entities: ["Helios service", "Python 3.11", "asyncio"], tags: ["tech-stack"], source: "user", trust: 0.88 },
  { text: "The Forge build system migrated from Webpack to Vite in March.", kind: "fact", subject: "Forge", predicate: "migrated to", object: "Vite", entities: ["Forge", "Webpack", "Vite"], tags: ["migration", "tech-stack"], source: "user", trust: 0.85 },
  { text: "The Citadel project uses Postgres with read replicas in three regions.", kind: "fact", subject: "Citadel", predicate: "uses", object: "Postgres", entities: ["Citadel", "Postgres"], tags: ["tech-stack"], source: "user", trust: 0.9 },
  { text: "The Comet event bus runs Kafka with twelve partitions per topic.", kind: "fact", subject: "Comet", predicate: "uses", object: "Kafka", entities: ["Comet", "Kafka"], tags: ["tech-stack"], source: "user", trust: 0.86 },
  { text: "The Ember frontend uses Next.js and Tailwind.", kind: "fact", subject: "Ember frontend", predicate: "uses", object: "Next.js", entities: ["Ember frontend", "Next.js", "Tailwind"], tags: ["tech-stack"], source: "user", trust: 0.88 },

  // Preferences
  { text: "Maya prefers concise technical answers and dislikes filler text.", kind: "preference", subject: "Maya", predicate: "prefers", object: "concise answers", entities: ["Maya"], tags: ["preference"], source: "user", trust: 0.85 },
  { text: "Maya uses Cursor as her primary editor since April.", kind: "preference", subject: "Maya", predicate: "uses", object: "Cursor", entities: ["Maya", "Cursor"], tags: ["preference"], source: "user", trust: 0.9 },
  { text: "Jake prefers tests written with pytest, not unittest.", kind: "preference", subject: "Jake", predicate: "prefers", object: "pytest", entities: ["Jake", "pytest"], tags: ["preference"], source: "user", trust: 0.82 },
  { text: "Carlos prefers async-first APIs over blocking ones.", kind: "preference", subject: "Carlos", predicate: "prefers", object: "async APIs", entities: ["Carlos"], tags: ["preference"], source: "user", trust: 0.84 },
  { text: "Priya prefers writing design docs before any code is committed.", kind: "preference", subject: "Priya", predicate: "prefers", object: "design docs", entities: ["Priya"], tags: ["preference"], source: "user", trust: 0.86 },

  // Recent changes
  { text: "The login flow now uses passkeys as the default factor.", kind: "fact", subject: "login flow", predicate: "uses", object: "passkeys", entities: ["login flow", "passkeys"], tags: ["recent-change"], source: "user", trust: 0.88 },
  { text: "Payments switched the fraud check vendor from Stripe Radar to in-house.", kind: "fact", subject: "payments", predicate: "switched to", object: "in-house fraud check", entities: ["payments", "Stripe Radar"], tags: ["recent-change"], source: "user", trust: 0.82 },
  { text: "Analytics added a new cohort retention dashboard last week.", kind: "fact", subject: "analytics", predicate: "added", object: "cohort retention dashboard", entities: ["analytics", "dashboard"], tags: ["recent-change"], source: "user", trust: 0.86 },
  { text: "The deployment pipeline now runs canary releases for every service.", kind: "fact", subject: "deployment pipeline", predicate: "runs", object: "canary releases", entities: ["deployment pipeline", "canary"], tags: ["recent-change"], source: "user", trust: 0.9 },

  // Constraints
  { text: "Atlas must respond in under 200ms for the home feed.", kind: "constraint", subject: "Atlas", predicate: "responds in", object: "<200ms", entities: ["Atlas"], tags: ["constraint", "performance"], source: "user", trust: 0.9 },
  { text: "Helios must run on a single VM with 8GB of RAM.", kind: "constraint", subject: "Helios", predicate: "runs on", object: "single VM", entities: ["Helios"], tags: ["constraint"], source: "user", trust: 0.88 },
  { text: "All services must emit OpenTelemetry traces with the team's standard tags.", kind: "constraint", subject: "services", predicate: "emit", object: "OpenTelemetry", entities: ["OpenTelemetry"], tags: ["constraint", "observability"], source: "user", trust: 0.9 },

  // Cross-project facts
  { text: "Atlas and Helios share the same auth service.", kind: "fact", subject: "Atlas", predicate: "shares", object: "auth service", entities: ["Atlas", "Helios", "auth service"], tags: ["cross-project"], source: "user", trust: 0.86 },
  { text: "Forge bundles the Ember frontend before deploying to Citadel.", kind: "fact", subject: "Forge", predicate: "bundles", object: "Ember frontend", entities: ["Forge", "Ember frontend", "Citadel"], tags: ["cross-project"], source: "user", trust: 0.82 },

  // Lower-trust / contradictory candidates
  { text: "An unverified source claims the analytics service uses Redshift, not Postgres.", kind: "note", subject: "analytics service", predicate: "uses", object: "Redshift", entities: ["analytics service", "Redshift"], tags: ["dubious"], source: "synthetic", trust: 0.22 },
  { text: "Someone in chat said Jake handles auth now, but no PR confirms it.", kind: "note", subject: "Jake", predicate: "owns", object: "auth", entities: ["Jake", "auth"], tags: ["dubious"], source: "chat", trust: 0.25 },
  { text: "Outdated note: Maya used to prefer Vim.", kind: "note", subject: "Maya", predicate: "preferred", object: "Vim", entities: ["Maya", "Vim"], tags: ["outdated"], source: "document", trust: 0.35 },
  { text: "Rumor: the Citadel project will move off Postgres next quarter.", kind: "note", subject: "Citadel", predicate: "may migrate from", object: "Postgres", entities: ["Citadel", "Postgres"], tags: ["dubious", "speculation"], source: "chat", trust: 0.3 },
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
