"use client";

const FACT = "Sarah owns the auth service and maintains the login flow.";

// Two triples that share a subject. The page's headline claim is "many facts
// in one trace"; this hero now actually demonstrates two facts entering the
// same vector instead of waving at the second clause and only encoding the
// first.
const TRIPLES = [
  { subject: "Sarah", predicate: "owns", object: "auth service" },
  { subject: "Sarah", predicate: "maintains", object: "login flow" },
];

const STRIP_CELLS = 36;
const TRACE_CELLS = 64;
const TRACE_DIMS = 1024;

type SignalColor = { l: number; c: number; h: number };

const SIGNAL: Record<"amber" | "blue" | "violet", SignalColor> = {
  amber: { l: 0.78, c: 0.13, h: 72 },
  blue: { l: 0.7, c: 0.1, h: 215 },
  violet: { l: 0.72, c: 0.11, h: 305 },
};

function oklch(color: SignalColor, alpha = 1): string {
  return alpha >= 1
    ? `oklch(${color.l} ${color.c} ${color.h})`
    : `oklch(${color.l} ${color.c} ${color.h} / ${alpha})`;
}

// NOTE: These strips are a stylized visualization, NOT computed from the live
// HRR algebra in `lib/hrr/hrr.ts`. Real bind() output is near-Gaussian noise
// and visually indistinguishable cell-to-cell, which defeats the figure's
// pedagogical purpose. A hash of (role, value) gives deterministic, visually
// distinct stripes per fact while preserving the "deterministic per input"
// property HRR has — which is also why the two `r_s ⊛ Sarah` strips below
// look identical: same role + same value → same vector. If you want real HRR
// in the strips, replace `bindingAmplitudes` with:
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
  label,
  className = "",
}: {
  amplitudes: number[];
  color: SignalColor;
  label: string;
  className?: string;
}) {
  const base = oklch(color);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="marginalia-label w-[68px] shrink-0 text-right">
        {label}
      </span>
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
    </div>
  );
}

function Pill({
  color,
  children,
}: {
  color: SignalColor;
  children: React.ReactNode;
}) {
  return (
    <span
      className="w-fit rounded-md border px-2.5 py-1 font-medium"
      style={{
        borderColor: oklch(color, 0.4),
        background: oklch(color, 0.1),
        color: oklch(color),
      }}
    >
      {children}
    </span>
  );
}

function FactLabel({ index }: { index: number }) {
  return (
    <p className="ml-[68px] mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
      fact {index + 1}
    </p>
  );
}

export function HeroDemo() {
  const factAmps = TRIPLES.map((t) => ({
    subj: bindingAmplitudes("subj", t.subject, STRIP_CELLS),
    pred: bindingAmplitudes("pred", t.predicate, STRIP_CELLS),
    obj: bindingAmplitudes("obj", t.object, STRIP_CELLS),
  }));

  // Combined trace cells. Five distinct bindings contribute, but the subject
  // appears in both facts so we double-weight its hash — which makes amber
  // visibly more present in the trace, honoring the math: bind(SUBJECT, Sarah)
  // is added twice when both fact triples are summed.
  const traceCells = Array.from({ length: TRACE_CELLS }, (_, i) => {
    const sBase = hash(`subj::${TRIPLES[0].subject}`, i);
    const p1 = hash(`pred::${TRIPLES[0].predicate}`, i);
    const o1 = hash(`obj::${TRIPLES[0].object}`, i);
    const p2 = hash(`pred::${TRIPLES[1].predicate}`, i);
    const o2 = hash(`obj::${TRIPLES[1].object}`, i);
    const sWeighted = sBase * 2;

    const max = Math.max(sWeighted, p1, o1, p2, o2);
    const color =
      max === sWeighted
        ? SIGNAL.amber
        : max === p1 || max === p2
          ? SIGNAL.blue
          : SIGNAL.violet;

    // Average over 6 unit-contributions (subject counted twice).
    const amplitude = 0.25 + ((sWeighted + p1 + o1 + p2 + o2) / 6) * 0.7;
    return { color: oklch(color), amplitude };
  });

  return (
    <figure
      aria-label="Diagram: a sentence with two clauses decomposes into two subject/predicate/object triples that share a subject. Each role binds to its value, all six bindings superpose into a single 1024-dimensional trace, and an algebraic probe recovers the subject of the question and the matching object — the second clause's value."
      className="demo-panel relative w-full p-6 sm:p-7"
    >
      <header className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Figure 1 · Encode then probe
        </p>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          dim {TRACE_DIMS}
        </span>
      </header>

      <div className="mt-5 rounded-md border border-border bg-card/60 px-4 py-3">
        <p className="marginalia-label">fact · two clauses</p>
        <p className="mt-1 text-[15px] leading-snug text-foreground">{FACT}</p>
      </div>

      <Operator label="decompose · two triples, shared subject" />

      <div className="space-y-3">
        {TRIPLES.map((triple, idx) => (
          <div key={idx}>
            <FactLabel index={idx} />
            <div className="grid grid-cols-[68px_1fr] gap-x-3 gap-y-1.5 text-sm">
              <span className="marginalia-label self-center text-right">
                subject
              </span>
              <Pill color={SIGNAL.amber}>{triple.subject}</Pill>
              <span className="marginalia-label self-center text-right">
                predicate
              </span>
              <Pill color={SIGNAL.blue}>{triple.predicate}</Pill>
              <span className="marginalia-label self-center text-right">
                object
              </span>
              <Pill color={SIGNAL.violet}>{triple.object}</Pill>
            </div>
          </div>
        ))}
      </div>

      <Operator label="bind  ⊛" />

      <div className="space-y-3">
        {TRIPLES.map((_, idx) => (
          <div key={idx}>
            <FactLabel index={idx} />
            <div className="space-y-1.5">
              <Strip
                amplitudes={factAmps[idx].subj}
                color={SIGNAL.amber}
                label="r_s ⊛ v_s"
              />
              <Strip
                amplitudes={factAmps[idx].pred}
                color={SIGNAL.blue}
                label="r_p ⊛ v_p"
              />
              <Strip
                amplitudes={factAmps[idx].obj}
                color={SIGNAL.violet}
                label="r_o ⊛ v_o"
              />
            </div>
          </div>
        ))}
      </div>

      <Operator label="superpose  +" />

      <div className="flex items-center gap-3">
        <span className="marginalia-label w-[68px] shrink-0 text-right">
          trace
        </span>
        <div className="relative h-6 flex-1 overflow-hidden rounded-[2px] border border-border/70">
          <div className="absolute inset-0 flex items-stretch gap-[1px]">
            {traceCells.map((c, i) => (
              <span
                key={i}
                className="flex-1"
                style={{ background: c.color, opacity: c.amplitude }}
              />
            ))}
          </div>
          <div
            aria-hidden
            className="probe-sweep pointer-events-none absolute inset-y-0 w-[14%]"
            style={{
              background: `linear-gradient(90deg, transparent, ${oklch(SIGNAL.amber, 0.67)}, transparent)`,
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
      <p className="ml-[80px] mt-1.5 font-mono text-[10px] text-muted-foreground/70">
        {TRACE_CELLS}-cell preview · both facts in one {TRACE_DIMS}-d vector
      </p>

      <Operator label="probe" />

      <div
        className="rounded-md border px-4 py-3"
        style={{
          borderColor: oklch(SIGNAL.amber, 0.3),
          background: oklch(SIGNAL.amber, 0.06),
        }}
      >
        <p
          className="marginalia-label"
          style={{ color: oklch(SIGNAL.amber, 0.8) }}
        >
          unbind
        </p>
        <p className="mt-1 text-[14px] text-foreground/90">
          &ldquo;Who handles login?&rdquo;
          <span className="text-muted-foreground"> → </span>
          <span className="font-medium" style={{ color: oklch(SIGNAL.amber) }}>
            {TRIPLES[0].subject}
          </span>
          <span className="text-muted-foreground"> · </span>
          <span
            className="font-medium"
            style={{ color: oklch(SIGNAL.violet) }}
          >
            {TRIPLES[1].object}
          </span>
        </p>
      </div>
    </figure>
  );
}

function Operator({ label }: { label: string }) {
  return (
    <div aria-hidden className="my-3 flex items-center gap-3 pl-[68px]">
      <span className="h-3 w-px bg-border" />
      <span className="font-mono text-[10.5px] lowercase tracking-[0.04em] text-muted-foreground/80">
        {label}
      </span>
      <span className="h-px flex-1 bg-border/40" />
    </div>
  );
}
