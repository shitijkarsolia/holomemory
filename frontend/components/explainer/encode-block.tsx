"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { Memory } from "@/lib/types";

const EXAMPLE_FACTS = [
  {
    text: "Sarah owns the auth service and maintains the login flow.",
    subject: "Sarah",
    predicate: "owns",
    object: "auth service",
  },
  {
    text: "The auth service uses PostgreSQL for session storage.",
    subject: "auth service",
    predicate: "uses",
    object: "PostgreSQL",
  },
  {
    text: "Jake refactored the payment module last sprint.",
    subject: "Jake",
    predicate: "refactored",
    object: "payment module",
  },
];

export function EncodeBlock() {
  const [phase, setPhase] = useState<
    "idle" | "decomposing" | "encoded" | "error"
  >("idle");
  const [triple, setTriple] = useState<{
    s: string;
    p: string;
    o: string;
  } | null>(null);
  const [encoded, setEncoded] = useState<Memory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleEncode = async (
    text: string,
    s: string,
    p: string,
    o: string,
  ) => {
    setPhase("decomposing");
    setTriple({ s, p, o });

    await new Promise((r) => setTimeout(r, 1100));

    try {
      const memory = await api.memories.create({
        text,
        kind: "fact",
        subject: s,
        predicate: p,
        object: o,
        entities: [s, o],
        tags: [],
        source: "user",
        trust: 0.9,
      });
      setEncoded(memory);
      setPhase("encoded");
      queryClient.invalidateQueries({ queryKey: ["field"] });
    } catch {
      setErrorMsg(
        "Backend is not running — the demo above shows the same flow statically.",
      );
      setPhase("error");
    }
  };

  return (
    <section
      id="encode"
      className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30"
    >
      <p className="eyebrow text-[color:var(--signal-amber)]">Try it · encode</p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Encode a fact
      </h2>
      <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
        Pick a fact below. Watch it decompose into a relational triple, then
        get bound into a 1024-dimensional vector trace.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {EXAMPLE_FACTS.map((fact) => (
          <button
            key={fact.text}
            onClick={() =>
              handleEncode(fact.text, fact.subject, fact.predicate, fact.object)
            }
            disabled={phase === "decomposing"}
            className="rounded-md border border-border bg-card/40 px-3.5 py-3 text-left text-[13px] leading-snug text-foreground/90 hover:border-[color:var(--signal-amber)]/40 hover:bg-card/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fact.text}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === "decomposing" && triple && (
          <motion.div
            key="decompose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 rounded-md border border-border bg-card/40 p-5"
          >
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Decomposing into subject / predicate / object
            </p>
            <div className="mt-3 grid grid-cols-[80px_1fr] gap-y-2 gap-x-3 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground self-center">
                subject
              </span>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-md border border-[color:var(--signal-amber)]/40 bg-[color:var(--signal-amber)]/10 px-2.5 py-1 text-[color:var(--signal-amber)] font-medium w-fit"
              >
                {triple.s}
              </motion.span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground self-center">
                predicate
              </span>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-md border border-[color:var(--signal-blue)]/40 bg-[color:var(--signal-blue)]/10 px-2.5 py-1 text-[color:var(--signal-blue)] font-medium w-fit"
              >
                {triple.p}
              </motion.span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground self-center">
                object
              </span>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-md border border-[color:var(--signal-violet)]/40 bg-[color:var(--signal-violet)]/10 px-2.5 py-1 text-[color:var(--signal-violet)] font-medium w-fit"
              >
                {triple.o}
              </motion.span>
            </div>
            <motion.div
              className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--signal-amber)] animate-pulse" />
              Binding via circular convolution…
            </motion.div>
          </motion.div>
        )}

        {phase === "encoded" && encoded && (
          <motion.div
            key="encoded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Stored as a 1024-dim trace
            </p>
            <div className="mt-2 rounded-md border border-[color:var(--signal-amber)]/35 bg-[color:var(--signal-amber)]/[0.06] px-4 py-3">
              <p className="text-[14.5px] text-foreground/90">{encoded.text}</p>
              <p className="mt-1.5 text-[11px] font-mono text-muted-foreground">
                id: {encoded.id.slice(0, 8)}… · trust: {encoded.trust} ·
                status: {encoded.status}
              </p>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Notice: the same fact always produces the same vector. The trace
              is now searchable through algebraic probes.
            </p>
            <button
              onClick={() => {
                setPhase("idle");
                setEncoded(null);
                setTriple(null);
              }}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Encode another →
            </button>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-md border border-[color:var(--signal-red)]/30 bg-[color:var(--signal-red)]/5 px-4 py-3 text-[13px] text-foreground/85"
          >
            {errorMsg}
            <button
              onClick={() => {
                setPhase("idle");
                setErrorMsg(null);
              }}
              className="ml-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
