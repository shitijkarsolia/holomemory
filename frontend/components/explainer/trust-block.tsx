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

    await new Promise((r) => setTimeout(r, 2200));
    setPhase("querying");

    try {
      const [res] = await Promise.all([
        api.query("What database does the auth service use?", "hybrid", 5),
        new Promise((r) => setTimeout(r, 1800)),
      ]);
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
        Every memory has a trust score between 0 and 1. When two memories
        match a query equally well, the more trusted one wins. Trust changes
        ranking, not truth.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/[0.05] p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--signal-amber)]/85">
            High trust · 0.85
          </p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/90">
            The auth service uses PostgreSQL for session storage.
          </p>
        </div>
        <div className="rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/[0.05] p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--signal-red)]/85">
            Low trust · 0.20
          </p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
            An unverified source claims the auth service uses MongoDB.
          </p>
        </div>
      </div>

      {phase === "idle" && (
        <button
          onClick={handleRun}
          className="mt-6 rounded-md border border-[color:var(--signal-red)]/40 bg-[color:var(--signal-red)]/[0.06] px-4 py-2.5 text-[14px] font-medium text-foreground/90 hover:bg-[color:var(--signal-red)]/[0.12] transition-colors"
        >
          Inject contradictory memory and probe
        </button>
      )}

      {phase === "injecting" && (
        <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--signal-red)]" />
          Step 1 of 2 · Injecting the unreliable claim into the field…
        </div>
      )}

      {phase === "querying" && (
        <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--signal-amber)]" />
          Step 2 of 2 · Probing: &ldquo;What database does the auth service use?&rdquo;
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
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Results, ranked
            </p>
            {result.results.slice(0, 4).map((r, i) => {
              const isLowTrust = r.memory.trust < 0.4;
              const matchPct = r.components.holographic * 100;
              const trustPct = r.components.trust * 100;
              return (
                <motion.div
                  key={r.memory.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.55 }}
                  className={`rounded-md border p-4 ${
                    isLowTrust
                      ? "border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/[0.06]"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[14.5px] leading-relaxed text-foreground/90">
                      {r.memory.text}
                    </p>
                    <div className="shrink-0 rounded-md border border-[color:var(--signal-amber)]/30 bg-[color:var(--signal-amber)]/10 px-2.5 py-1">
                      <span className="font-mono text-[12.5px] text-[color:var(--signal-amber)]">
                        {(r.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-[110px_1fr_60px] items-center gap-x-3 gap-y-1 font-mono text-[11.5px] text-muted-foreground">
                    <span>vector match</span>
                    <Bar value={matchPct} color="var(--signal-amber)" />
                    <span className="text-right text-foreground/70">
                      {matchPct.toFixed(0)}
                    </span>

                    <span>source trust</span>
                    <Bar
                      value={trustPct}
                      color={
                        isLowTrust
                          ? "var(--signal-red)"
                          : "var(--signal-violet)"
                      }
                    />
                    <span className="text-right text-foreground/70">
                      {trustPct.toFixed(0)}
                    </span>
                  </div>

                  {isLowTrust && (
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-[color:var(--signal-red)]/85">
                      Low-trust source. The match score is OK, but the trust
                      factor drags this memory&rsquo;s final rank down.
                    </p>
                  )}
                </motion.div>
              );
            })}

            <div className="rounded-md border border-border/50 bg-card/30 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                What you just saw
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
                Both memories matched the query well on vector similarity:
                they share the word &ldquo;database&rdquo; and the entity
                &ldquo;auth service&rdquo;. The high-trust PostgreSQL fact
                still ranks above the low-trust MongoDB claim, because the
                final score blends in <span className="text-foreground/95">15% trust</span>{" "}
                weighting from the hybrid formula. Without that, the system
                would have to treat both claims as equally believable.
              </p>
            </div>

            <button
              onClick={() => {
                setPhase("idle");
                setResult(null);
              }}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-1.5 overflow-hidden rounded-full bg-border/40">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
