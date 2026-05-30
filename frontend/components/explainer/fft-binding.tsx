"use client";

import { useMemo, useState } from "react";
import { complexMultiply, fft, ifft } from "@/lib/hrr/fft";
import { HRR_DIMENSION, symbolVector } from "@/lib/hrr/hrr";

const VIZ_CELLS = 80;

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

function magnitude(re: Float64Array, im: Float64Array): Float64Array {
  const out = new Float64Array(re.length);
  for (let i = 0; i < re.length; i++) {
    out[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  }
  return out;
}

// Window-average |x[i]| over `step`-sized chunks, then perceptually rescale
// to [0.15, 0.95]. The minimum floor keeps every cell visible; without it,
// near-zero windows render as gaps which read as missing data, not as
// quiet bins. This matches the hero strip's normalization so the two
// visuals share a vocabulary.
function downsample(arr: Float64Array, n: number): number[] {
  const step = Math.max(1, Math.floor(arr.length / n));
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    let count = 0;
    for (let k = 0; k < step && i * step + k < arr.length; k++) {
      s += Math.abs(arr[i * step + k]);
      count++;
    }
    out.push(count > 0 ? s / count : 0);
  }
  return out;
}

function normalize(values: number[]): number[] {
  let max = 0;
  for (const v of values) if (v > max) max = v;
  if (max === 0) return values.map(() => 0.15);
  return values.map((v) => 0.15 + 0.8 * (v / max));
}

function Strip({ cells, color }: { cells: number[]; color: SignalColor }) {
  const tint = oklch(color);
  return (
    <div className="flex h-3.5 flex-1 items-stretch gap-[1px] overflow-hidden rounded-[2px] border border-border/40">
      {cells.map((a, i) => (
        <span
          key={i}
          className="flex-1"
          style={{
            background: tint,
            opacity: Math.min(0.95, Math.max(0.08, a)),
          }}
        />
      ))}
    </div>
  );
}

function Row({
  label,
  cells,
  color,
}: {
  label: string;
  cells: number[];
  color: SignalColor;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-[88px] shrink-0 font-mono text-[11px]"
        style={{ color: oklch(color, 0.95) }}
      >
        {label}
      </span>
      <Strip cells={cells} color={color} />
    </div>
  );
}

function Operator({ label }: { label: string }) {
  return (
    <div aria-hidden className="my-3 flex items-center gap-3 pl-[88px]">
      <span className="h-3 w-px bg-border" />
      <span className="font-mono text-[10.5px] lowercase tracking-[0.04em] text-muted-foreground/80">
        {label}
      </span>
      <span className="h-px flex-1 bg-border/40" />
    </div>
  );
}

export function FftBinding() {
  const [role, setRole] = useState("subject");
  const [value, setValue] = useState("Sarah");

  // Recompute on every keystroke. Two 1024-point FFTs + an IFFT + a
  // complex multiply + magnitude/downsample is fast enough (sub-ms on a
  // modern machine) that debouncing would only add perceptual lag.
  const data = useMemo(() => {
    // symbolVector caches by exact name; an empty string still hashes to a
    // deterministic vector, so we let the user type freely without guards.
    const r = symbolVector(role);
    const v = symbolVector(value);

    const [rRe, rIm] = fft(r);
    const [vRe, vIm] = fft(v);

    const rMag = magnitude(rRe, rIm);
    const vMag = magnitude(vRe, vIm);

    const [pRe, pIm] = complexMultiply(rRe, rIm, vRe, vIm);
    const pMag = magnitude(pRe, pIm);

    // ifft(complexMultiply(fft(r), fft(v))) is exactly bind(r, v) from
    // lib/hrr/hrr.ts — the production code path runs the same five lines.
    const bound = ifft(pRe, pIm);

    return {
      r: normalize(downsample(r, VIZ_CELLS)),
      v: normalize(downsample(v, VIZ_CELLS)),
      rMag: normalize(downsample(rMag, VIZ_CELLS)),
      vMag: normalize(downsample(vMag, VIZ_CELLS)),
      pMag: normalize(downsample(pMag, VIZ_CELLS)),
      bound: normalize(downsample(bound, VIZ_CELLS)),
    };
  }, [role, value]);

  return (
    <figure
      aria-label="Interactive: two symbol vectors r and v, their FFT magnitude spectra, the pointwise product in the frequency domain, and the inverse FFT recovering the bound vector, which exposes the math under bind(r, v)."
      className="demo-panel relative w-full p-6 sm:p-7"
    >
      <header className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Figure · what FFT does inside bind
        </p>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          dim {HRR_DIMENSION}
        </span>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="marginalia-label">role symbol</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            spellCheck={false}
            aria-label="Role symbol name"
            className="mt-1.5 w-full rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[13px] transition-colors focus:border-[color:var(--signal-amber)]/60 focus:outline-none"
            style={{ color: oklch(SIGNAL.amber, 0.95) }}
          />
        </label>
        <label className="block">
          <span className="marginalia-label">value symbol</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            aria-label="Value symbol name"
            className="mt-1.5 w-full rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[13px] transition-colors focus:border-[color:var(--signal-blue)]/60 focus:outline-none"
            style={{ color: oklch(SIGNAL.blue, 0.95) }}
          />
        </label>
      </div>

      <Operator label="time domain · sha256 → seeded normals → unit-norm" />

      <div className="space-y-1.5">
        <Row label="r" cells={data.r} color={SIGNAL.amber} />
        <Row label="v" cells={data.v} color={SIGNAL.blue} />
      </div>

      <Operator label="fft · 1024-point complex transform" />

      <div className="space-y-1.5">
        <Row label="|R|" cells={data.rMag} color={SIGNAL.amber} />
        <Row label="|V|" cells={data.vMag} color={SIGNAL.blue} />
      </div>

      <Operator label="multiply pointwise as complex numbers · R ⊙ V" />

      <div className="space-y-1.5">
        <Row label="|R ⊙ V|" cells={data.pMag} color={SIGNAL.violet} />
      </div>

      <Operator label="ifft · back to time domain" />

      <div
        className="rounded-md border px-4 py-3"
        style={{
          borderColor: oklch(SIGNAL.violet, 0.32),
          background: oklch(SIGNAL.violet, 0.06),
        }}
      >
        <p
          className="marginalia-label"
          style={{ color: oklch(SIGNAL.violet, 0.85) }}
        >
          bind(r, v)
        </p>
        <div className="mt-2">
          <Strip cells={data.bound} color={SIGNAL.violet} />
        </div>
        <p className="mt-2 font-mono text-[10.5px] text-muted-foreground/70">
          bind(r, v) = IFFT( FFT(r) ⊙ FFT(v) ) · {VIZ_CELLS}-cell preview of
          one {HRR_DIMENSION}-d unit vector
        </p>
      </div>

      <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">
        Type into either field. Every strip recomputes from the live engine
        in{" "}
        <code className="font-mono text-[12.5px] text-foreground/85">
          lib/hrr/hrr.ts
        </code>
        . Notice that{" "}
        <code className="font-mono text-[12.5px] text-foreground/85">
          |R ⊙ V|
        </code>{" "}
        looks unrelated to either input spectrum. That&rsquo;s exactly why{" "}
        <code className="font-mono text-[12.5px] text-foreground/85">
          bind(r, v)
        </code>{" "}
        looks unrelated to either input vector. The reverse direction (
        <code className="font-mono text-[12.5px] text-foreground/85">unbind</code>
        ) substitutes the{" "}
        <em className="not-italic text-foreground/85">conjugate</em> of{" "}
        <code className="font-mono text-[12.5px] text-foreground/85">FFT(r)</code>{" "}
        in the same multiply step, which is the math reason a stored value
        can be pulled back out by name.
      </p>
    </figure>
  );
}
