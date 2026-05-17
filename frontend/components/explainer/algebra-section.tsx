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
  oneLiner: string;
  plain: React.ReactNode;
  formula: string;
};

const OPS: Op[] = [
  {
    label: "1 · bind",
    name: "Stick a label onto a value",
    accent: SIGNAL.amber,
    oneLiner: "Mix two vectors together.",
    plain: (
      <>
        Start with two random lists of numbers, one for the{" "}
        <em className="not-italic text-foreground/85">role</em> (like
        &ldquo;subject&rdquo;) and one for the{" "}
        <em className="not-italic text-foreground/85">value</em> (like{" "}
        &ldquo;Sarah&rdquo;). Mix them together into a third list. The mix
        looks unrelated to either input, but the mixing is reversible:{" "}
        given one ingredient, you can recover the other.
      </>
    ),
    formula: "bind(role, value)  →  one vector",
  },
  {
    label: "2 · superpose",
    name: "Stack them in one place",
    accent: SIGNAL.blue,
    oneLiner: "Add all the bindings together.",
    plain: (
      <>
        For one fact, you do this three times: bind{" "}
        <span className="text-foreground/85">subject</span> with{" "}
        <span className="text-foreground/85">Sarah</span>, bind{" "}
        <span className="text-foreground/85">predicate</span> with{" "}
        <span className="text-foreground/85">owns</span>, bind{" "}
        <span className="text-foreground/85">object</span> with{" "}
        <span className="text-foreground/85">auth service</span>. Then add the
        three results. You get a single list of numbers that quietly contains
        the whole fact.
      </>
    ),
    formula: "bind(s, …) + bind(p, …) + bind(o, …)  →  trace",
  },
  {
    label: "3 · unbind",
    name: "Pull a value back out",
    accent: SIGNAL.violet,
    oneLiner: "Reverse the mix to get one piece back.",
    plain: (
      <>
        To ask &ldquo;what&rsquo;s the subject of this fact?&rdquo;, reverse
        the bind operation using the role. The answer comes back a little
        noisy because the trace has other facts mixed in. A small lookup
        called a <span className="text-foreground/85">cleanup memory</span>{" "}
        compares the noisy answer to known words and snaps to the closest one.
      </>
    ),
    formula: "unbind(trace, role)  →  value  (approximately)",
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
            The math, in three simple operations
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            Everything in the demo is built from three small functions on
            lists of numbers. No neural network, no training. If you can mix
            two ingredients and later separate them, you understand the whole
            thing.
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
              <p
                className="mt-2 font-serif text-[15px] italic text-foreground/85"
                style={{ color: op.accent }}
              >
                {op.oneLiner}
              </p>

              <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
                {op.plain}
              </p>

              <div
                className="mt-5 overflow-x-auto rounded-md border bg-[oklch(0.09_0.012_75)] px-4 py-3"
                style={{
                  borderColor: `color-mix(in oklch, ${op.accent} 22%, transparent)`,
                }}
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  in code
                </p>
                <code
                  className="mt-1 block whitespace-nowrap font-mono text-[13px]"
                  style={{ color: op.accent }}
                >
                  {op.formula}
                </code>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-2 border-t border-border/40 pt-8 sm:grid-cols-[140px_1fr]">
          <p className="marginalia-label sm:pt-1 sm:text-right">
            why it works
          </p>
          <p className="text-[15px] leading-relaxed text-foreground/80">
            When the lists are long (1024 numbers here) and random, any two of
            them are almost guaranteed to be different. Mixing spreads each
            binding across all 1024 positions, so the bindings barely step on
            each other when you add them. The same math that mixes also
            unmixes. That&rsquo;s the whole trick.
          </p>
        </div>
      </div>
    </section>
  );
}
