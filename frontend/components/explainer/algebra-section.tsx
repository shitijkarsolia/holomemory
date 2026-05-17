"use client";

const SIGNAL = {
  amber: "var(--signal-amber)",
  blue: "var(--signal-blue)",
  violet: "var(--signal-violet)",
} as const;

type Op = {
  label: string;
  name: string;
  accent: string;
  formula: string;
  body: React.ReactNode;
  note: string;
};

const OPS: Op[] = [
  {
    label: "1 · bind",
    name: "Tie a role to a value",
    accent: SIGNAL.amber,
    formula: "r ⊛ v  =  F⁻¹( F(r) ⊙ F(v) )",
    body: (
      <>
        Circular convolution of two unit vectors. Computed with FFT in{" "}
        <span className="font-mono text-foreground/85">O(n log n)</span>. The
        result is a third vector that is approximately orthogonal to both
        inputs, yet decodable.
      </>
    ),
    note: "fft · pointwise multiply · inverse fft",
  },
  {
    label: "2 · superpose",
    name: "Sum the bindings",
    accent: SIGNAL.blue,
    formula:
      "trace  =  bind(r_s, v_s)  +  bind(r_p, v_p)  +  bind(r_o, v_o)",
    body: (
      <>
        Plain vector addition. One fixed-width vector now carries every role
        in the fact. Adding more bindings raises the noise floor but never
        increases the size of the trace.
      </>
    ),
    note: "no growth · lossy · graceful",
  },
  {
    label: "3 · unbind",
    name: "Recover a value",
    accent: SIGNAL.violet,
    formula: "v̂  =  trace ⊛ r⁻¹  ≈  v  +  noise",
    body: (
      <>
        Circular correlation with the inverse of a role pulls the bound value
        back out, plus interference from the other bindings. A{" "}
        <span className="text-foreground/85">cleanup memory</span> then snaps{" "}
        <span className="font-mono text-foreground/85">v̂</span> to the
        nearest known symbol by cosine similarity.
      </>
    ),
    note: "correlate · cleanup · cosine",
  },
];

export function AlgebraSection() {
  return (
    <section
      id="algebra"
      className="border-t border-border/30 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
            The math, in three operations
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            No black boxes. Holographic memory is three small functions over
            real-valued vectors. Everything you see in the demo above is built
            from these.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {OPS.map((op) => (
            <article key={op.label} className="flex flex-col">
              <p
                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: op.accent }}
              >
                {op.label}
              </p>
              <h3 className="mt-2 font-serif text-[22px] leading-tight tracking-tight text-foreground">
                {op.name}
              </h3>

              <div
                className="mt-4 overflow-x-auto rounded-md border bg-[oklch(0.09_0.012_75)] px-4 py-4"
                style={{ borderColor: `color-mix(in oklch, ${op.accent} 28%, transparent)` }}
              >
                <code
                  className="block whitespace-nowrap font-mono text-[14px]"
                  style={{ color: op.accent }}
                >
                  {op.formula}
                </code>
              </div>

              <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
                {op.body}
              </p>

              <p
                className="mt-3 font-mono text-[11.5px] lowercase tracking-[0.02em] text-muted-foreground"
              >
                {op.note}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-2 border-t border-border/40 pt-8 sm:grid-cols-[140px_1fr]">
          <p className="marginalia-label sm:pt-1 sm:text-right">why it works</p>
          <p className="text-[15px] leading-relaxed text-foreground/80">
            High-dimensional random vectors are nearly orthogonal. Convolution
            spreads each binding across the entire vector so they barely
            interfere; addition stacks them like superposed waves. The same
            algebra that lets you encode is what lets you decode, which is
            why the result is fully inspectable and deterministic.
          </p>
        </div>
      </div>
    </section>
  );
}
