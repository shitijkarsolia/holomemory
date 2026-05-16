"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { QueryResponse } from "@/lib/types";

export function TrustBlock() {
  const [phase, setPhase] = useState<
    "idle" | "injecting" | "querying" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setPhase("injecting");
    setErrorMsg(null);
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
      // may already exist; continue
    }

    await new Promise((r) => setTimeout(r, 700));
    setPhase("querying");

    try {
      const res = await api.query(
        "What database does the auth service use?",
        "hybrid",
        5,
      );
      setResult(res);
      setPhase("done");
    } catch {
      setErrorMsg(
        "Couldn't reach the backend to run the trust comparison. Start it and try again.",
      );
      setPhase("error");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30">
      <p className="eyebrow text-[color:var(--signal-amber)]">Try it · trust</p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Trust-aware recall
      </h2>
      <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
        Every memory carries a trust score. When contradictory information
        enters the system from an unreliable source, the scoring formula
        naturally suppresses it. Trust changes ranking, not truth.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/[0.05] p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--signal-amber)]/80">
            High trust · 0.85
          </p>
          <p className="mt-2 text-[14px] leading-snug text-foreground/90">
            The auth service uses PostgreSQL for session storage.
          </p>
        </div>
        <div className="rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/[0.05] p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[color:var(--signal-red)]/80">
            Low trust · 0.20
          </p>
          <p className="mt-2 text-[14px] leading-snug text-foreground/80">
            An unverified source claims the auth service uses MongoDB.
          </p>
        </div>
      </div>

      {phase === "idle" && (
        <button
          onClick={handleRun}
          className="mt-6 rounded-md border border-[color:var(--signal-red)]/40 bg-[color:var(--signal-red)]/[0.06] px-4 py-2 text-[13px] font-medium text-foreground/90 hover:bg-[color:var(--signal-red)]/[0.12] transition-colors"
        >
          Inject contradictory memory and probe
        </button>
      )}

      {phase === "injecting" && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--signal-red)] animate-pulse" />
          Injecting low-trust memory…
        </div>
      )}

      {phase === "querying" && (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--signal-amber)] animate-pulse" />
          Probing: &ldquo;What database does the auth service use?&rdquo;
        </div>
      )}

      {phase === "error" && errorMsg && (
        <div className="mt-6 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85">
          {errorMsg}
          <button
            onClick={() => setPhase("idle")}
            className="ml-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <AnimatePresence>
        {phase === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
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
                      ? "border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/[0.06]"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] text-foreground/90">
                        {r.memory.text}
                      </p>
                      {isLowTrust && (
                        <p className="mt-1 text-[11px] text-[color:var(--signal-red)]/80">
                          Low-trust source — suppressed in ranking
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground">
                      trust {r.memory.trust.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <p className="mt-4 text-[13px] text-muted-foreground">
              The high-trust PostgreSQL fact ranks above the low-trust MongoDB
              claim, even though both match the query equally well on keywords.
            </p>
            <button
              onClick={() => {
                setPhase("idle");
                setResult(null);
              }}
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
