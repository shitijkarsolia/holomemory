"use client";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
      <p className="text-xs font-mono text-muted-foreground/60 mb-4 tracking-wide">
        A portfolio project exploring algebraic agent memory
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl leading-[1.1]">
        Structured vector memory for AI agents
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
        HoloMem encodes relational facts into fixed-width vectors using circular
        convolution, then retrieves them through algebraic probes. No embeddings
        model. No external API. Fully local.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {["FastAPI", "NumPy", "SQLite", "Next.js", "HRR"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-border/40 px-3 py-1 text-[11px] font-mono text-muted-foreground/70"
          >
            {t}
          </span>
        ))}
      </div>
      <a
        href="#what"
        className="mt-10 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
      >
        See how it works
      </a>
    </section>
  );
}
