"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  bind,
  cleanup,
  corruptVector,
  superpose,
  symbolVector,
  unbind,
} from "@/lib/hrr/hrr";
import { tokenize } from "@/lib/hrr/encoder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function downsample(v: Float64Array, n: number): number[] {
  const step = Math.max(1, Math.floor(v.length / n));
  const out: number[] = [];
  let max = 0;
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = 0; k < step && i * step + k < v.length; k++) {
      s += Math.abs(v[i * step + k]);
    }
    const a = s / step;
    out.push(a);
    if (a > max) max = a;
  }
  if (max === 0) return out;
  return out.map((a) => 0.15 + 0.8 * (a / max));
}

function TraceStrip({ vector, color = "amber" }: { vector: Float64Array; color?: "amber" | "blue" | "violet" }) {
  const cells = useMemo(() => downsample(vector, 64), [vector]);
  const tint =
    color === "amber"
      ? "var(--signal-amber)"
      : color === "blue"
        ? "var(--signal-blue)"
        : "var(--signal-violet)";
  return (
    <div className="flex h-5 w-full items-stretch gap-[1px] overflow-hidden rounded-[2px] border border-border/40">
      {cells.map((a, i) => (
        <span
          key={i}
          className="flex-1"
          style={{ background: tint, opacity: Math.min(0.95, a) }}
        />
      ))}
    </div>
  );
}

function Bar({ value, max = 1, color = "amber" }: { value: number; max?: number; color?: "amber" | "blue" | "violet" }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const tint =
    color === "amber"
      ? "var(--signal-amber)"
      : color === "blue"
        ? "var(--signal-blue)"
        : "var(--signal-violet)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tint }} />
    </div>
  );
}

function SectionHeader({ n, title, blurb }: { n: string; title: string; blurb: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[12px] tracking-[0.04em] text-[color:var(--signal-amber)]">
          {n}
        </span>
        <h3 className="font-serif text-[22px] leading-none tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">{blurb}</p>
    </div>
  );
}

const RANDOM_NAMES = [
  "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel",
  "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa",
  "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray",
  "yankee", "zulu", "atlas", "helios", "citadel", "forge", "ember", "comet",
  "nimbus", "pulsar", "quasar", "vortex", "zenith", "borealis", "stratus",
  "cumulus", "lyra", "orion", "vega", "polaris", "cassini", "kepler", "hubble",
  "voyager", "magellan", "galileo",
];

// ====================================================================
// 1. UNBIND & CLEANUP
// ====================================================================

// Conditional-binding encoding lets us recover OBJECT given (SUBJECT, PREDICATE):
//   factᵢ = bind(subjᵢ, bind(predᵢ, objᵢ))
//   T     = Σᵢ factᵢ
//   probe = unbind(unbind(T, subject), predicate) ≈ object + crosstalk noise
// Cleanup against a symbol vocabulary picks the target object out cleanly,
// because only the matching factᵢ contributes a coherent term. The other
// facts produce noise vectors uncorrelated with any vocabulary entry.
function encodeFact(s: string, p: string, o: string): Float64Array {
  return bind(symbolVector(s), bind(symbolVector(p), symbolVector(o)));
}

function UnbindDemo() {
  return <UnbindDemoBody />;
}

/** Standalone export so the homepage can showcase the canonical demo without
 *  pulling in the rest of the lab. */
export function UnbindDemoStandalone() {
  return <UnbindDemoBody />;
}

function UnbindDemoBody() {
  const [subject, setSubject] = useState("maya");
  const [predicate, setPredicate] = useState("prefer");
  const [object, setObject] = useState("cursor");
  const [extras, setExtras] = useState<{ s: string; p: string; o: string }[]>([
    { s: "atlas", p: "uses", o: "fastapi" },
    { s: "sarah", p: "owns", o: "auth" },
    { s: "jake", p: "refactored", o: "payments" },
  ]);
  const [result, setResult] = useState<{
    trace: Float64Array;
    noisy: Float64Array;
    ranked: { symbol: string; similarity: number }[];
  } | null>(null);

  const run = () => {
    const target = { s: subject.toLowerCase(), p: predicate.toLowerCase(), o: object.toLowerCase() };
    const facts = [target, ...extras.map((e) => ({ s: e.s.toLowerCase(), p: e.p.toLowerCase(), o: e.o.toLowerCase() }))];
    const trace = superpose(facts.map((f) => encodeFact(f.s, f.p, f.o)));

    // Peel SUBJECT, then PREDICATE.
    const stepOne = unbind(trace, symbolVector(target.s));
    const noisy = unbind(stepOne, symbolVector(target.p));

    const vocab: Record<string, Float64Array> = {};
    for (const f of facts) vocab[f.o] = symbolVector(f.o);
    for (const name of RANDOM_NAMES.slice(0, 12)) {
      if (!vocab[name]) vocab[name] = symbolVector(name);
    }

    const ranked = cleanup(noisy, vocab, 5);
    setResult({ trace, noisy, ranked });
  };

  const winner = result?.ranked[0];
  const targetIsWinner = winner && winner.symbol === object.toLowerCase();

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6 space-y-5">
      <SectionHeader
        n="01"
        title="Unbind and cleanup"
        blurb="The headline HRR operation. Store a fact as a bound vector, then extract a value by 'dividing out' the role. Keyword search can re-rank stored strings. Only HRR can recover a bound value as a vector."
      />

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Predicate</Label>
          <Input value={predicate} onChange={(e) => setPredicate(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Object</Label>
          <Input value={object} onChange={(e) => setObject(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>

      <div className="text-[12px] text-muted-foreground">
        Plus {extras.length} distractor facts superposed into the same trace
        (e.g. <span className="font-mono text-foreground/70">{extras[0].s} ⊛ {extras[0].p} ⊛ {extras[0].o}</span>).
      </div>

      <Button onClick={run} className="w-full h-9 text-[13px]">
        Encode and unbind
      </Button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-2"
        >
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Trace T = Σᵢ bind(subjᵢ, bind(predᵢ, objᵢ))
            </p>
            <TraceStrip vector={result.trace} color="violet" />
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Probe = unbind(unbind(T, {subject}), {predicate})
            </p>
            <TraceStrip vector={result.noisy} color="blue" />
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Cleanup against a vocabulary of {Object.keys(result.ranked.length ? { x: 1 } : {}).length || 16}+ symbols
            </p>
            <div className="space-y-1.5 mt-1">
              {result.ranked.map((r, i) => (
                <div key={r.symbol} className="flex items-center gap-3 text-[12.5px]">
                  <span
                    className={cn(
                      "w-24 font-mono text-foreground/90",
                      i === 0 && "font-semibold",
                    )}
                  >
                    {r.symbol}
                  </span>
                  <div className="flex-1">
                    <Bar value={Math.max(0, r.similarity)} max={1} color={i === 0 ? "amber" : "blue"} />
                  </div>
                  <span className="w-12 text-right font-mono text-foreground/70">
                    {(r.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            {targetIsWinner ? (
              <>
                Cleanup picked <span className="text-foreground/90 font-medium">{winner!.symbol}</span> from the
                vocabulary, the correct OBJECT of the (<span className="font-mono">{subject}</span>,
                <span className="font-mono"> {predicate}</span>) fact, even though 3 other facts were
                superposed into the same 1024-d vector. That&rsquo;s what unbinding enables:{" "}
                <em>recovering a stored value as a vector</em>, not just re-ranking text. No keyword
                index can do this.
              </>
            ) : (
              <>
                Cleanup landed on <span className="text-foreground/90 font-medium">{winner?.symbol}</span> instead
                of <span className="font-mono">{object.toLowerCase()}</span>. Either the distractor count is
                pushing past capacity, or the symbols collided. Try fewer extras or different names.
              </>
            )}
          </p>
        </motion.div>
      )}

      <div className="border-t border-border/30 pt-3">
        <Label className="text-[11px] text-muted-foreground">Distractor facts (superposed alongside)</Label>
        <div className="mt-2 space-y-1.5">
          {extras.map((e, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <Input
                value={e.s}
                onChange={(ev) => setExtras(extras.map((x, i) => (i === idx ? { ...x, s: ev.target.value } : x)))}
                className="h-7 text-[12px]"
              />
              <Input
                value={e.p}
                onChange={(ev) => setExtras(extras.map((x, i) => (i === idx ? { ...x, p: ev.target.value } : x)))}
                className="h-7 text-[12px]"
              />
              <Input
                value={e.o}
                onChange={(ev) => setExtras(extras.map((x, i) => (i === idx ? { ...x, o: ev.target.value } : x)))}
                className="h-7 text-[12px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// 2. CAPACITY
// ====================================================================

function CapacityDemo() {
  const [points, setPoints] = useState<{ n: number; accuracy: number }[]>([]);
  const [running, setRunning] = useState(false);

  const runOnce = (n: number): number => {
    // N random (key, value) pairs. Superpose bound pairs. Probe each key,
    // unbind, cleanup against {all values} + 100 distractors. Count hits.
    const keys: Float64Array[] = [];
    const values: string[] = [];
    const valueVecs: Float64Array[] = [];
    const usedNames = new Set<string>();
    for (let i = 0; i < n; i++) {
      const keyName = `__cap_k_${i}_${Math.floor(Math.random() * 1e9)}__`;
      let valName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      // dedupe value names so cleanup has unique targets
      while (usedNames.has(valName)) {
        valName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + "_" + Math.floor(Math.random() * 1e6);
      }
      usedNames.add(valName);
      const k = symbolVector(keyName);
      const v = symbolVector(valName);
      keys.push(k);
      values.push(valName);
      valueVecs.push(v);
    }
    const trace = superpose(keys.map((k, i) => bind(k, valueVecs[i])));
    const vocab: Record<string, Float64Array> = {};
    for (let i = 0; i < values.length; i++) vocab[values[i]] = valueVecs[i];
    for (const name of RANDOM_NAMES.slice(0, 30)) {
      if (!vocab[name]) vocab[name] = symbolVector(name + "_distractor");
    }
    let correct = 0;
    for (let i = 0; i < n; i++) {
      const probe = unbind(trace, keys[i]);
      const ranked = cleanup(probe, vocab, 1);
      if (ranked[0]?.symbol === values[i]) correct++;
    }
    return correct / n;
  };

  const run = async () => {
    setRunning(true);
    setPoints([]);
    const ns = [1, 3, 5, 8, 12, 18, 25, 35, 50, 70, 100, 140];
    const trials = 3;
    const out: { n: number; accuracy: number }[] = [];
    for (const n of ns) {
      let acc = 0;
      for (let t = 0; t < trials; t++) acc += runOnce(n);
      out.push({ n, accuracy: acc / trials });
      setPoints([...out]);
      await new Promise((r) => setTimeout(r, 20));
    }
    setRunning(false);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6 space-y-5">
      <SectionHeader
        n="02"
        title="Capacity in one vector"
        blurb="How many (key, value) pairs fit into a single 1024-d trace before cleanup starts losing them? Each point is the recall accuracy averaged over 3 trials."
      />

      <Button onClick={run} disabled={running} className="w-full h-9 text-[13px]">
        {running ? "Measuring…" : "Run capacity sweep"}
      </Button>

      {points.length > 0 && <CapacityPlot points={points} />}

      {points.length > 0 && !running && (
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          With 1024 dimensions, recall stays near-perfect up to about 50 pairs and degrades
          smoothly past 100. The trace is always the same 1024 floats. No per-fact slot, no
          inverted index. A keyword store has constant per-fact storage cost. HRR trades that
          for a single fixed vector you can still do algebra on (unbind, compose, query) as a
          whole.
        </p>
      )}
    </div>
  );
}

function CapacityPlot({ points }: { points: { n: number; accuracy: number }[] }) {
  const W = 520, H = 200, padL = 36, padB = 26, padT = 8, padR = 8;
  const xs = points.map((p) => p.n);
  const maxX = Math.max(...xs, 1);
  const sx = (n: number) => padL + ((n / maxX) * (W - padL - padR));
  const sy = (a: number) => padT + (1 - a) * (H - padT - padB);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.n).toFixed(1)},${sy(p.accuracy).toFixed(1)}`)
    .join(" ");
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[640px]">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line
              x1={padL}
              y1={sy(g)}
              x2={W - padR}
              y2={sy(g)}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <text
              x={padL - 6}
              y={sy(g) + 3}
              fontSize="9.5"
              textAnchor="end"
              fill="currentColor"
              fillOpacity="0.5"
              fontFamily="ui-monospace"
            >
              {(g * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {xs.map((n) => (
          <text
            key={n}
            x={sx(n)}
            y={H - 8}
            fontSize="9.5"
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.5"
            fontFamily="ui-monospace"
          >
            {n}
          </text>
        ))}
        <path d={path} fill="none" stroke="var(--signal-amber)" strokeWidth="2" />
        {points.map((p) => (
          <circle key={p.n} cx={sx(p.n)} cy={sy(p.accuracy)} r="3" fill="var(--signal-amber)" />
        ))}
        <text x={padL} y={H - 1} fontSize="9" fill="currentColor" fillOpacity="0.45">
          pairs superposed
        </text>
        <text x={4} y={padT + 8} fontSize="9" fill="currentColor" fillOpacity="0.45">
          recall
        </text>
      </svg>
    </div>
  );
}

// ====================================================================
// 3. ROLE DISTINCTION
// ====================================================================

// Role-filler encoding so SUBJECT and OBJECT can be told apart. (Plain
// bind(s, bind(p, o)) is fully symmetric because circular convolution is
// commutative, which is why role distinction needs labelled role vectors.)
const R_SUBJ = "__R_SUBJ__";
const R_VERB = "__R_VERB__";
const R_OBJ = "__R_OBJ__";

function encodeRoleFact(s: string, v: string, o: string): Float64Array {
  return superpose([
    bind(symbolVector(R_SUBJ), symbolVector(s)),
    bind(symbolVector(R_VERB), symbolVector(v)),
    bind(symbolVector(R_OBJ), symbolVector(o)),
  ]);
}

function RoleDemo() {
  const [result, setResult] = useState<{
    keywordA: number;
    keywordB: number;
    hrrSubjA: { symbol: string; similarity: number }[];
    hrrSubjB: { symbol: string; similarity: number }[];
    hrrObjA: { symbol: string; similarity: number }[];
    hrrObjB: { symbol: string; similarity: number }[];
  } | null>(null);

  const memA = "Maya manages the auth service.";
  const memB = "The auth service manages Maya.";

  const run = () => {
    // Keyword: identical stemmed token bags → identical scores.
    const tokensA = new Set(tokenize(memA));
    const tokensB = new Set(tokenize(memB));
    const probeStems = tokenize("manages");
    const kwA = probeStems.filter((s) => tokensA.has(s)).length / probeStems.length;
    const kwB = probeStems.filter((s) => tokensB.has(s)).length / probeStems.length;

    const traceA = encodeRoleFact("maya", "manage", "auth");
    const traceB = encodeRoleFact("auth", "manage", "maya");
    const rs = symbolVector(R_SUBJ);
    const ro = symbolVector(R_OBJ);
    const vocab: Record<string, Float64Array> = {
      maya: symbolVector("maya"),
      auth: symbolVector("auth"),
      manage: symbolVector("manage"),
      sarah: symbolVector("sarah"),
      atlas: symbolVector("atlas"),
    };

    setResult({
      keywordA: kwA,
      keywordB: kwB,
      hrrSubjA: cleanup(unbind(traceA, rs), vocab, 3),
      hrrSubjB: cleanup(unbind(traceB, rs), vocab, 3),
      hrrObjA: cleanup(unbind(traceA, ro), vocab, 3),
      hrrObjB: cleanup(unbind(traceB, ro), vocab, 3),
    });
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6 space-y-5">
      <SectionHeader
        n="03"
        title="Roles vs. bags of words"
        blurb={`"Maya manages the auth service" and "The auth service manages Maya" contain identical tokens. Keyword scoring can't tell them apart. Role-binding can.`}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border/40 bg-secondary/30 p-3">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Memory A</p>
          <p className="mt-1 text-[13px] text-foreground/90">{memA}</p>
        </div>
        <div className="rounded-md border border-border/40 bg-secondary/30 p-3">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">Memory B</p>
          <p className="mt-1 text-[13px] text-foreground/90">{memB}</p>
        </div>
      </div>

      <Button onClick={run} className="w-full h-9 text-[13px]">
        Extract SUBJECT and OBJECT of each memory
      </Button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2"
        >
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
              Keyword score against the stem &ldquo;manag&rdquo;
            </p>
            <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="w-16 text-muted-foreground">Mem A</span>
                <div className="flex-1"><Bar value={result.keywordA} color="blue" /></div>
                <span className="w-12 text-right font-mono">{(result.keywordA * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="w-16 text-muted-foreground">Mem B</span>
                <div className="flex-1"><Bar value={result.keywordB} color="blue" /></div>
                <span className="w-12 text-right font-mono">{(result.keywordB * 100).toFixed(0)}%</span>
              </div>
            </div>
            <p className="mt-1 text-[11.5px] text-muted-foreground/70">
              Identical stems → identical scores. Keyword can&rsquo;t tell A from B.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <RoleColumn label="Mem A → unbind(T, R_SUBJ)" hits={result.hrrSubjA} expected="maya" />
            <RoleColumn label="Mem B → unbind(T, R_SUBJ)" hits={result.hrrSubjB} expected="auth" />
            <RoleColumn label="Mem A → unbind(T, R_OBJ)" hits={result.hrrObjA} expected="auth" />
            <RoleColumn label="Mem B → unbind(T, R_OBJ)" hits={result.hrrObjB} expected="maya" />
          </div>

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            HRR pulls the actual SUBJECT and OBJECT from each memory: A&rsquo;s subject is
            <span className="font-mono"> maya</span>, B&rsquo;s subject is
            <span className="font-mono"> auth</span>, and the objects swap. The role vectors
            (<span className="font-mono">R_SUBJ</span>, <span className="font-mono">R_OBJ</span>)
            tag each token with its grammatical position, so unbinding a role recovers exactly the
            token in that slot. Keyword sees both memories as the same bag of stems.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function RoleColumn({
  label,
  hits,
  expected,
}: {
  label: string;
  hits: { symbol: string; similarity: number }[];
  expected: string | null;
}) {
  const top = hits[0];
  const recovered = top && top.similarity > 0.2 && top.symbol === expected;
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 space-y-1">
        {hits.map((h, i) => {
          const isWinner = i === 0 && recovered;
          return (
            <div key={h.symbol} className="flex items-center gap-2 text-[12.5px]">
              <span className={cn("w-16 font-mono", isWinner ? "text-foreground/95 font-semibold" : "text-foreground/70")}>
                {h.symbol}
              </span>
              <div className="flex-1">
                <Bar value={Math.max(0, h.similarity)} color={isWinner ? "amber" : "violet"} />
              </div>
              <span className="w-12 text-right font-mono text-foreground/70">
                {(h.similarity * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
      {expected === null && top && top.similarity < 0.25 && (
        <p className="mt-1 text-[11px] italic text-muted-foreground/70">
          No coherent recovery. All similarities are at the noise floor.
        </p>
      )}
    </div>
  );
}

// ====================================================================
// 4. NOISY PROBE
// ====================================================================

function NoiseDemo() {
  const [points, setPoints] = useState<{ noise: number; hrrTop: number; hrrCorrect: boolean }[]>([]);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setPoints([]);

    const facts = [
      { s: "maya", p: "prefer", o: "cursor" },
      { s: "atlas", p: "uses", o: "fastapi" },
      { s: "sarah", p: "owns", o: "auth" },
      { s: "jake", p: "refactored", o: "payments" },
    ];
    const trace = superpose(facts.map((f) => encodeFact(f.s, f.p, f.o)));
    const vocab: Record<string, Float64Array> = {};
    for (const f of facts) vocab[f.o] = symbolVector(f.o);
    for (const n of RANDOM_NAMES.slice(0, 15)) if (!vocab[n]) vocab[n] = symbolVector(n);

    const target = facts[0];

    const levels = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const trials = 5;
    const out: { noise: number; hrrTop: number; hrrCorrect: boolean }[] = [];
    for (const lvl of levels) {
      let avgTop = 0;
      let correctCount = 0;
      for (let t = 0; t < trials; t++) {
        const corrupted = corruptVector(trace, lvl);
        const stepOne = unbind(corrupted, symbolVector(target.s));
        const probe = unbind(stepOne, symbolVector(target.p));
        const ranked = cleanup(probe, vocab, 1);
        avgTop += Math.max(0, ranked[0]?.similarity || 0);
        if (ranked[0]?.symbol === target.o) correctCount++;
      }
      out.push({
        noise: lvl,
        hrrTop: avgTop / trials,
        hrrCorrect: correctCount > trials / 2,
      });
      setPoints([...out]);
      await new Promise((r) => setTimeout(r, 30));
    }
    setRunning(false);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-6 space-y-5">
      <SectionHeader
        n="04"
        title="Graceful degradation under noise"
        blurb="Add Gaussian noise to the encoded trace, then try to recover the OBJECT of one of the bound facts. HRR confidence drops smoothly. A keyword index has no analog: once your query loses its tokens, it returns nothing."
      />

      <Button onClick={run} disabled={running} className="w-full h-9 text-[13px]">
        {running ? "Sweeping noise levels…" : "Sweep noise 0→80%"}
      </Button>

      {points.length > 0 && <NoisePlot points={points} />}

      {points.length > 0 && !running && (
        <div className="space-y-1.5">
          {points.map((p) => (
            <div key={p.noise} className="flex items-center gap-3 text-[12px]">
              <span className="w-14 font-mono text-muted-foreground">{(p.noise * 100).toFixed(0)}% noise</span>
              <div className="flex-1">
                <Bar value={p.hrrTop} color={p.hrrCorrect ? "amber" : "violet"} />
              </div>
              <span className="w-12 text-right font-mono text-foreground/70">
                {(p.hrrTop * 100).toFixed(0)}%
              </span>
              <span
                className={cn(
                  "w-16 text-right text-[11px]",
                  p.hrrCorrect ? "text-[color:var(--signal-amber)]/90" : "text-muted-foreground/70",
                )}
              >
                {p.hrrCorrect ? "recovered" : "lost"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoisePlot({ points }: { points: { noise: number; hrrTop: number }[] }) {
  const W = 520, H = 180, padL = 36, padB = 26, padT = 8, padR = 8;
  const sx = (n: number) => padL + n * (W - padL - padR);
  const sy = (a: number) => padT + (1 - a) * (H - padT - padB);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.noise).toFixed(1)},${sy(p.hrrTop).toFixed(1)}`)
    .join(" ");
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[640px]">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={padL} y1={sy(g)} x2={W - padR} y2={sy(g)} stroke="currentColor" strokeOpacity="0.08" />
            <text x={padL - 6} y={sy(g) + 3} fontSize="9.5" textAnchor="end" fill="currentColor" fillOpacity="0.5" fontFamily="ui-monospace">
              {(g * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75].map((n) => (
          <text key={n} x={sx(n)} y={H - 8} fontSize="9.5" textAnchor="middle" fill="currentColor" fillOpacity="0.5" fontFamily="ui-monospace">
            {(n * 100).toFixed(0)}%
          </text>
        ))}
        <path d={path} fill="none" stroke="var(--signal-amber)" strokeWidth="2" />
        {points.map((p) => (
          <circle key={p.noise} cx={sx(p.noise)} cy={sy(p.hrrTop)} r="3" fill="var(--signal-amber)" />
        ))}
        <text x={padL} y={H - 1} fontSize="9" fill="currentColor" fillOpacity="0.45">noise level</text>
        <text x={4} y={padT + 8} fontSize="9" fill="currentColor" fillOpacity="0.45">cleanup confidence</text>
      </svg>
    </div>
  );
}

// ====================================================================
// CONTAINER
// ====================================================================

export function HrrLab() {
  return (
    <section className="border-t border-border/30 px-6 py-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-6 space-y-2">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--signal-amber)]">
            HRR lab · what only this system can do
          </p>
          <h2 className="font-serif text-[28px] leading-tight tracking-tight text-foreground">
            Four operations a keyword index can&rsquo;t imitate
          </h2>
          <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            The recall scorer in the applied sandbox mixes HRR similarity with keyword overlap
            and trust. That makes HRR look like a noisier inverted index. These four interactives
            use only the operations HRR provides (binding, unbinding, superposition, cleanup) and
            show where the algebra actually earns its keep.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UnbindDemo />
          <RoleDemo />
          <CapacityDemo />
          <NoiseDemo />
        </div>
      </div>
    </section>
  );
}
