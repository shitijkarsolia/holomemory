"use client";

import Link from "next/link";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30 text-center">
      <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Open the lab
      </h2>
      <p className="mt-4 max-w-xl mx-auto text-[16px] leading-relaxed text-muted-foreground">
        The playground hosts the full HRR Lab (four interactives) and a
        sandbox for the applied memory system. You can add facts, run
        role-aware queries, inject noise, compare retrieval modes, and watch
        the memory field react.
      </p>
      <div className="mt-7 flex items-center justify-center gap-3">
        <Link
          href="/playground"
          className="glow-button rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Open the playground
        </Link>
        <Link
          href="/about"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground/85 hover:bg-card/60 transition-colors"
        >
          Technical details
        </Link>
      </div>
    </section>
  );
}
