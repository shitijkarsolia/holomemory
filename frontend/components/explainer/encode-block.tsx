"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { makeApi } from "@/lib/api";
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

type Phase = "idle" | "decomposing" | "binding" | "encoded" | "error";

const DECOMPOSE_MS = 3200;
const BIND_MS = 3000;

const STRIP_CELLS = 40;
const TRACE_CELLS = 72;

type SignalColor = { l: number; c: number; h: number };

const SIGNAL: Record<"amber" | "blue" | "violet", SignalColor> = {
  amber: { l: 0.78, c: 0.13, h: 72 },
  blue: { l: 0.7, c: 0.1, h: 215 },
  violet: { l: 0.72, c: 0.11, h: 305 },
};

function oklch(c: SignalColor, alpha = 1): string {
  return alpha >= 1
    ? `oklch(${c.l} ${c.c} ${c.h})`
    : `oklch(${c.l} ${c.c} ${c.h} / ${alpha})`;
}

// NOTE: These strips are a stylized visualization, NOT computed from the live
// HRR algebra in `lib/hrr/hrr.ts`. Real bind() output is near-Gaussian noise
// and visually indistinguishable cell-to-cell, which defeats the figure's
// pedagogical purpose. A hash of (role, value) gives deterministic, visually
// distinct stripes per fact while preserving the "deterministic per input"
// property HRR has. If you want real HRR in the strips, replace
// `bindingAmplitudes` with:
//   const v = bind(symbolVector(`__ROLE_${role.toUpperCase()}__`),
//                  symbolVector(value.toLowerCase()));
//   then downsample 1024 -> n with abs() + window-average and perceptually
//   rescale to [0.15, 0.95]. Visual impact will drop noticeably.
function hash(seed: string, i: number): number {
  let h = 2166136261 ^ (i * 16777619);
  for (let j = 0; j < seed.length; j++) {
    h = Math.imul(h ^ seed.charCodeAt(j), 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function bindingAmplitudes(role: string, value: string, n: number): number[] {
  const seed = `${role}::${value}`;
  return Array.from({ length: n }, (_, i) => {
    const a = hash(seed, i);
    const b = hash(seed, i + 1009);
    return 0.18 + Math.abs(a - 0.5) * 1.6 + b * 0.25;
  });
}

function Strip({
  amplitudes,
  color,
}: {
  amplitudes: number[];
  color: SignalColor;
}) {
  const base = oklch(color);
  return (
    <div className="flex h-3.5 flex-1 items-stretch gap-[1px]">
      {amplitudes.map((a, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px]"
          style={{
            background: base,
            opacity: Math.min(0.95, Math.max(0.08, a)),
          }}
        />
      ))}
    </div>
  );
}

export function EncodeBlock() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [triple, setTriple] = useState<{
    s: string;
    p: string;
    o: string;
  } | null>(null);
  const [encoded, setEncoded] = useState<Memory | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const api = useMemo(() => makeApi(), []);

  const busy = phase === "decomposing" || phase === "binding";

  const strips = useMemo(() => {
    if (!triple) return null;
    return {
      subj: bindingAmplitudes("subj", triple.s, STRIP_CELLS),
      pred: bindingAmplitudes("pred", triple.p, STRIP_CELLS),
      obj: bindingAmplitudes("obj", triple.o, STRIP_CELLS),
      trace: Array.from({ length: TRACE_CELLS }, (_, i) => {
        const s = hash(`subj::${triple.s}`, i);
        const p = hash(`pred::${triple.p}`, i);
        const o = hash(`obj::${triple.o}`, i);
        const max = Math.max(s, p, o);
        const color =
          max === s
            ? SIGNAL.amber
            : max === p
              ? SIGNAL.blue
              : SIGNAL.violet;
        return { color, amplitude: 0.25 + ((s + p + o) / 3) * 0.7 };
      }),
    };
  }, [triple]);

  const handleEncode = async (
    text: string,
    s: string,
    p: string,
    o: string,
  ) => {
    setPhase("decomposing");
    setTriple({ s, p, o });

    await new Promise((r) => setTimeout(r, DECOMPOSE_MS));

    setPhase("binding");
    const apiCall = api.memories.create({
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

    try {
      const [memory] = await Promise.all([
        apiCall,
        new Promise((r) => setTimeout(r, BIND_MS)),
      ]);
      setEncoded(memory);
      setPhase("encoded");
      queryClient.invalidateQueries({ queryKey: ["field"] });
    } catch {
      setErrorMsg(
        "Backend is not running. The demo above shows the same flow statically.",
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
        Pick a fact. You&rsquo;ll see it split into a role-value triple, the
        three pieces mix into colored vectors, then stack into one trace.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {EXAMPLE_FACTS.map((fact) => (
          <button
            key={fact.text}
            onClick={() =>
              handleEncode(fact.text, fact.subject, fact.predicate, fact.object)
            }
            disabled={busy}
            className="rounded-md border border-border bg-card/40 px-3.5 py-3 text-left text-[13px] leading-snug text-foreground/90 hover:border-[color:var(--signal-amber)]/40 hover:bg-card/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fact.text}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(phase === "decomposing" || phase === "binding") && triple && strips && (
          <motion.div
            key="working"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-md border border-border bg-card/40 p-6"
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
              Step 1 of 2 · Split the sentence into role and value
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              The fact is broken into three pieces. Each piece will become one
              binding.
            </p>
            <div className="mt-5 grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-[15px]">
              <span className="self-center font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                subject
              </span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.55 }}
                className="w-fit rounded-md border border-[color:var(--signal-amber)]/40 bg-[color:var(--signal-amber)]/10 px-3 py-1.5 font-medium text-[color:var(--signal-amber)]"
              >
                {triple.s}
              </motion.span>
              <span className="self-center font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                predicate
              </span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.55 }}
                className="w-fit rounded-md border border-[color:var(--signal-blue)]/40 bg-[color:var(--signal-blue)]/10 px-3 py-1.5 font-medium text-[color:var(--signal-blue)]"
              >
                {triple.p}
              </motion.span>
              <span className="self-center font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                object
              </span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9, duration: 0.55 }}
                className="w-fit rounded-md border border-[color:var(--signal-violet)]/40 bg-[color:var(--signal-violet)]/10 px-3 py-1.5 font-medium text-[color:var(--signal-violet)]"
              >
                {triple.o}
              </motion.span>
            </div>

            <AnimatePresence>
              {phase === "binding" && (
                <motion.div
                  key="binding"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 border-t border-border/40 pt-5"
                >
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                    Step 2 of 2 · Mix each role with its value
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    Each colored bar below is one binding. The patterns look
                    unrelated to the words, but the math can reverse them.
                  </p>

                  <div className="mt-5 space-y-3">
                    <BindingRow
                      label="subject ⊛ Sarah"
                      labelOverride={`subject ⊛ ${triple.s}`}
                      delay={0.05}
                      color={SIGNAL.amber}
                      amplitudes={strips.subj}
                    />
                    <BindingRow
                      label="predicate ⊛ owns"
                      labelOverride={`predicate ⊛ ${triple.p}`}
                      delay={0.55}
                      color={SIGNAL.blue}
                      amplitudes={strips.pred}
                    />
                    <BindingRow
                      label="object ⊛ value"
                      labelOverride={`object ⊛ ${triple.o}`}
                      delay={1.1}
                      color={SIGNAL.violet}
                      amplitudes={strips.obj}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7, duration: 0.55 }}
                    className="mt-6"
                  >
                    <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                      Sum them: one trace
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-7 flex-1 overflow-hidden rounded-[2px] border border-border/70">
                        <div className="absolute inset-0 flex items-stretch gap-[1px]">
                          {strips.trace.map((c, i) => (
                            <span
                              key={i}
                              className="flex-1"
                              style={{
                                background: oklch(c.color),
                                opacity: c.amplitude,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                      {TRACE_CELLS}-cell preview of the resulting 1024-number
                      vector
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "encoded" && encoded && strips && triple && (
          <motion.div
            key="encoded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 space-y-5"
          >
            <div className="rounded-md border border-[color:var(--signal-amber)]/35 bg-[color:var(--signal-amber)]/[0.06] p-5">
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--signal-amber)]/85">
                Stored as a trace
              </p>
              <p className="mt-2 text-[15.5px] leading-relaxed text-foreground/90">
                {encoded.text}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <span className="w-[68px] shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  trace
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-[2px] border border-border/60">
                  <div className="absolute inset-0 flex items-stretch gap-[1px]">
                    {strips.trace.map((c, i) => (
                      <span
                        key={i}
                        className="flex-1"
                        style={{
                          background: oklch(c.color),
                          opacity: c.amplitude,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 ml-[80px] font-mono text-[11px] text-muted-foreground/70">
                {TRACE_CELLS}-cell preview of one 1024-number vector
              </p>
            </div>

            <div className="rounded-md border border-border/50 bg-card/30 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                What you just saw
              </p>
              <ul className="mt-3 space-y-2 text-[14.5px] leading-relaxed text-foreground/80">
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-[10px] inline-block h-px w-2.5 shrink-0 bg-[color:var(--signal-amber)]/60" />
                  <span>
                    The same fact will always produce this same trace. Try
                    encoding it again to see.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-[10px] inline-block h-px w-2.5 shrink-0 bg-[color:var(--signal-blue)]/60" />
                  <span>
                    Even though the trace has three facts mixed together, the
                    system can pull any one piece back out by asking with the
                    matching role.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span aria-hidden className="mt-[10px] inline-block h-px w-2.5 shrink-0 bg-[color:var(--signal-violet)]/60" />
                  <span>
                    A query like &ldquo;who handles login?&rdquo; doesn&rsquo;t
                    have to mention the answer directly. It does need to share
                    at least one keyword or named entity with the stored
                    memory. Try the recall block below.
                  </span>
                </li>
              </ul>
              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground">
                  + database details
                </summary>
                <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-muted-foreground/80">
                  id: <span className="text-foreground/70">{encoded.id.slice(0, 8)}…</span>{" "}
                  · trust: <span className="text-foreground/70">{encoded.trust}</span>{" "}
                  · status: <span className="text-foreground/70">{encoded.status}</span>
                </p>
              </details>
            </div>

            <button
              onClick={() => {
                setPhase("idle");
                setEncoded(null);
                setTriple(null);
              }}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
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

function BindingRow({
  label,
  labelOverride,
  delay,
  color,
  amplitudes,
}: {
  label: string;
  labelOverride?: string;
  delay: number;
  color: SignalColor;
  amplitudes: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <span
        className="w-[170px] shrink-0 font-mono text-[11.5px]"
        style={{ color: oklch(color, 0.95) }}
      >
        {labelOverride ?? label}
      </span>
      <Strip amplitudes={amplitudes} color={color} />
    </motion.div>
  );
}
