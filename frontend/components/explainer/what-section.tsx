"use client";

export function WhatSection() {
  return (
    <section
      id="what"
      className="mx-auto max-w-3xl px-6 py-20 sm:py-24 border-t border-border/30"
    >
      <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        What is HRR?
      </h2>
      <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-foreground/85">
        <p>
          Holographic Reduced Representations are a way to store structured
          facts &mdash; like <em className="not-italic text-foreground/95">&ldquo;Sarah owns the auth
          service&rdquo;</em> &mdash; as a single fixed-width vector, using
          nothing more than vector addition and a kind of multiplication called
          circular convolution. No training, no embeddings model: every symbol
          is a deterministic high-dimensional vector seeded by its name.
        </p>
        <p>
          There are four operations.{" "}
          <strong className="font-semibold text-[color:var(--signal-amber)]">
            Bind
          </strong>{" "}
          glues two vectors into one whose shape is unlike either input.{" "}
          <strong className="font-semibold text-[color:var(--signal-blue)]">
            Superpose
          </strong>{" "}
          adds many bound pairs into a single trace.{" "}
          <strong className="font-semibold text-[color:var(--signal-violet)]">
            Unbind
          </strong>{" "}
          is the algebraic inverse of bind &mdash; given the trace and one key,
          it returns the noisy value.{" "}
          <strong className="font-semibold text-foreground">
            Cleanup
          </strong>{" "}
          snaps that noisy result to the nearest known symbol.
        </p>
        <p>
          Why care? Because together those four operations give you a memory
          you can <em className="not-italic text-foreground/95">do math on</em>:
          a single 1024-dimensional vector can hold ~50 structured facts and
          give back any one of them by name, with confidence that degrades
          smoothly under noise. The demos below show this happening in
          milliseconds, with all the math visible.
        </p>
      </div>

      <div className="mt-10 rounded-md border border-border bg-card/40 p-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          What this site is (and isn&rsquo;t)
        </p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
          A working interactive reference for HRR &mdash; the operations, the
          tradeoffs, and a small applied example (a memory system with
          role-aware retrieval and source trust). It is <em className="not-italic text-foreground/85">not</em> a
          competitor to RAG, a vector database, or a production embedding
          stack. It is the smallest honest demonstration of what vector-symbolic
          memory can do.
        </p>
      </div>
    </section>
  );
}
