"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";

export function TrustBlock() {
  const [phase, setPhase] = useState<"idle" | "injecting" | "querying" | "done">("idle");
  const [result, setResult] = useState<QueryResponse | null>(null);

  const handleRun = async () => {
    setPhase("injecting");
    try {
      await api.memories.create({
        text: "An unverified source claims the auth service uses MongoDB.",
        kind: "note",
        subject: "auth service",
        predicate: "uses",
        object: "MongoDB",
        entities: ["auth service", "MongoDB"],
        tags: ["dubious"],
        source: "synthetic",
        trust: 0.2,
      });
    } catch {
      // may already exist
    }

    await new Promise((r) => setTimeout(r, 800));
    setPhase("querying");

    const res = await api.query("What database does the auth service use?", "hybrid", 5);
    setResult(res);
    setPhase("done");
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 border-t border-border/10">
      <p className="text-[11px] font-mono uppercase tracking-wider text-primary/70 mb-2">
        Try it
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Trust-aware recall
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Every memory carries a trust score. When contradictory information enters
        the system from an unreliable source, the scoring formula naturally
        suppresses it. High-trust facts dominate recall.
      </p>

      <div className="mt-6 rounded-md border border-border/30 bg-card/20 p-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40 mb-2">
          The scenario
        </p>
        <p className="text-xs text-muted-foreground/70">
          The system already knows: &ldquo;The auth service uses PostgreSQL for session
          storage&rdquo; (trust: 0.85). We&rsquo;ll inject a low-trust contradictory fact
          claiming it uses MongoDB (trust: 0.2), then ask what database auth uses.
        </p>
      </div>

      {phase === "idle" && (
        <button
          onClick={handleRun}
          className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive/80 hover:bg-destructive/10 transition-colors"
        >
          Inject contradictory memory and query
        </button>
      )}

      {phase === "injecting" && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          Injecting low-trust memory...
        </div>
      )}

      {phase === "querying" && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Probing: &ldquo;What database does the auth service use?&rdquo;
        </div>
      )}

      <AnimatePresence>
        {phase === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40">
              Results — trust determines ranking
            </p>
            {result.results.slice(0, 4).map((r, i) => {
              const isLowTrust = r.memory.trust < 0.4;
              return (
                <motion.div
                  key={r.memory.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-md border px-4 py-3 ${
                    isLowTrust
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-border/20 bg-card/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground/85">{r.memory.text}</p>
                      {isLowTrust && (
                        <p className="mt-1 text-[10px] text-destructive/60">
                          Low-trust source — suppressed in ranking
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground/50">
                      trust: {r.memory.trust.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <p className="mt-4 text-xs text-muted-foreground/60">
              The high-trust PostgreSQL fact ranks above the low-trust MongoDB
              claim, even though both match the query equally well on keywords.
            </p>
            <button
              onClick={() => { setPhase("idle"); setResult(null); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
