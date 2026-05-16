"use client";

export function WhatSection() {
  return (
    <section id="what" className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        What is holographic memory?
      </h2>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          Holographic Reduced Representations (HRR) are a way to encode
          structured information — like &ldquo;Sarah owns the auth service&rdquo; — into a
          single fixed-width vector using algebra, not a neural network.
        </p>
        <p>
          The key operations are simple. <strong className="text-foreground/80">Bind</strong> associates
          a role with a value (subject + &ldquo;Sarah&rdquo;) via circular convolution.{" "}
          <strong className="text-foreground/80">Superpose</strong> combines multiple bindings into one
          trace by adding them together. <strong className="text-foreground/80">Probe</strong> recovers
          approximate matches by correlating a query vector against stored traces.
        </p>
        <p>
          The result is a memory system that&rsquo;s lightweight (runs on NumPy),
          deterministic (same input always produces the same vector), and
          self-correcting (trust scores let unreliable memories decay naturally).
        </p>
      </div>

      <div className="mt-10 rounded-lg border border-border/30 bg-card/30 p-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/50 mb-3">
          The engineering tradeoff
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This approach trades semantic richness (neural embeddings understand
          that &ldquo;login&rdquo; relates to &ldquo;auth&rdquo;) for architectural simplicity — zero
          external dependencies, sub-millisecond retrieval, and a transparent
          scoring formula you can inspect and tune.
        </p>
      </div>
    </section>
  );
}
