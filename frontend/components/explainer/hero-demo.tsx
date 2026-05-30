"use client";

const FACT = "Sarah owns the auth service and maintains the login flow.";
const TRIPLE = {
  subject: "Sarah",
  predicate: "owns",
  object: "auth service",
};

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

export function HeroDemo() {
  const subjAmps = bindingAmplitudes("subj", TRIPLE.subject, STRIP_CELLS);
  const predAmps = bindingAmplitudes("pred", TRIPLE.predicate, STRIP_CELLS);
  const objAmps = bindingAmplitudes("obj", TRIPLE.object, STRIP_CELLS);

  const traceCells = Array.from({ length: TRACE_CELLS }, (_, i) => {
    const s = hash(`subj::${TRIPLE.subject}`, i);
    const p = hash(`pred::${TRIPLE.predicate}`, i);
    const o = hash(`obj::${TRIPLE.object}`, i);
    const max = Math.max(s, p, o);
    const color =
      max === s ? SIGNAL.amber : max === p ? SIGNAL.blue : SIGNAL.violet;
    const amplitude = 0.25 + ((s + p + o) / 3) * 0.7;
    return { color: oklch(color), amplitude };
  });

  return (
    <figure
      aria-label="Diagram: a sentence decomposes into a subject/predicate/object triple, each role is bound to its value, the three bindings superpose into one 1024-dimensional trace, and an algebraic probe recovers the answer."
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
        <p className="marginalia-label">fact</p>
        <p className="mt-1 text-[15px] leading-snug text-foreground">{FACT}</p>
      </div>

      <Operator label="decompose" />

      <div className="grid grid-cols-[68px_1fr] gap-x-3 gap-y-1.5 text-sm">
        <span className="marginalia-label self-center text-right">subject</span>
        <Pill color={SIGNAL.amber}>{TRIPLE.subject}</Pill>
        <span className="marginalia-label self-center text-right">predicate</span>
        <Pill color={SIGNAL.blue}>{TRIPLE.predicate}</Pill>
        <span className="marginalia-label self-center text-right">object</span>
        <Pill color={SIGNAL.violet}>{TRIPLE.object}</Pill>
      </div>

      <Operator label="bind  ⊛" />

      <div className="space-y-1.5">
        <Strip amplitudes={subjAmps} color={SIGNAL.amber} label="r_s ⊛ v_s" />
        <Strip amplitudes={predAmps} color={SIGNAL.blue} label="r_p ⊛ v_p" />
        <Strip amplitudes={objAmps} color={SIGNAL.violet} label="r_o ⊛ v_o" />
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
        {TRACE_CELLS}-cell preview of one {TRACE_DIMS}-d vector
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
            {TRIPLE.subject}
          </span>
          <span className="text-muted-foreground"> · </span>
          <span
            className="font-medium"
            style={{ color: oklch(SIGNAL.violet) }}
          >
            {TRIPLE.object}
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
