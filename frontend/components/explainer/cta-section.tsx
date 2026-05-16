"use client";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 border-t border-border/10 text-center">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Explore the full system
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        The playground lets you teach arbitrary facts, probe memory with any
        query, inject noise, compare retrieval modes side-by-side, and inspect
        the memory field graph.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <a
          href="/playground"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Open Playground
        </a>
        <a
          href="/about"
          className="rounded-md border border-border/40 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Technical Details
        </a>
      </div>
    </section>
  );
}
