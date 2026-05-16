"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { Memory } from "@/lib/types";

const EXAMPLE_FACTS = [
  { text: "Sarah owns the auth service and maintains the login flow.", subject: "Sarah", predicate: "owns", object: "auth service" },
  { text: "The auth service uses PostgreSQL for session storage.", subject: "auth service", predicate: "uses", object: "PostgreSQL" },
  { text: "Jake refactored the payment module last sprint.", subject: "Jake", predicate: "refactored", object: "payment module" },
];

export function EncodeBlock() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "decomposing" | "encoded">("idle");
  const [triple, setTriple] = useState<{ s: string; p: string; o: string } | null>(null);
  const [encoded, setEncoded] = useState<Memory | null>(null);
  const queryClient = useQueryClient();

  const handleEncode = async (text: string, s: string, p: string, o: string) => {
    setInput(text);
    setPhase("decomposing");
    setTriple({ s, p, o });

    await new Promise((r) => setTimeout(r, 1200));

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
      setPhase("idle");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-24 border-t border-border/10">
      <p className="text-[11px] font-mono uppercase tracking-wider text-primary/70 mb-2">
        Try it
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Encode a fact
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Pick a fact below. Watch it decompose into a relational triple, then get
        bound into a 1024-dimensional vector trace.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {EXAMPLE_FACTS.map((fact) => (
          <button
            key={fact.text}
            onClick={() => handleEncode(fact.text, fact.subject, fact.predicate, fact.object)}
            disabled={phase !== "idle"}
            className="rounded-md border border-border/40 bg-card/40 px-3 py-2 text-left text-xs text-foreground/80 hover:border-primary/30 hover:bg-card/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="mt-8 space-y-4"
          >
            <p className="text-[11px] font-mono text-muted-foreground/50">
              Decomposing into subject / predicate / object
            </p>
            <div className="flex items-center gap-3">
              <motion.span
                className="rounded-md bg-primary/15 border border-primary/25 px-3 py-1.5 text-sm font-medium text-primary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {triple.s}
              </motion.span>
              <motion.span
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {triple.p}
              </motion.span>
              <motion.span
                className="rounded-md bg-foreground/5 border border-border/40 px-3 py-1.5 text-sm font-medium text-foreground/80"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {triple.o}
              </motion.span>
            </div>
            <motion.div
              className="flex items-center gap-2 text-xs text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Binding via circular convolution...
            </motion.div>
          </motion.div>
        )}

        {phase === "encoded" && encoded && (
          <motion.div
            key="encoded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-3"
          >
            <p className="text-[11px] font-mono text-muted-foreground/50">
              Stored as a 1024-dim trace
            </p>
            <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm text-foreground/80">{encoded.text}</p>
              <p className="mt-1 text-[10px] font-mono text-muted-foreground/50">
                id: {encoded.id.slice(0, 8)}... | trust: {encoded.trust} | status: {encoded.status}
              </p>
            </div>
            <button
              onClick={() => { setPhase("idle"); setEncoded(null); setTriple(null); setInput(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Encode another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
