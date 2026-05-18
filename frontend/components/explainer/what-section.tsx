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
          facts as a single fixed-width vector. The math is just vector
          addition and a kind of multiplication called circular convolution.
          There&rsquo;s no training and no embeddings model. Every symbol you
          care about (&ldquo;Sarah&rdquo;, &ldquo;owns&rdquo;, &ldquo;auth
          service&rdquo;) becomes a high-dimensional random vector, generated
          deterministically from its name.
        </p>
        <p>
          Four operations carry the whole system.{" "}
          <strong className="font-semibold text-[color:var(--signal-amber)]">
            Bind
          </strong>{" "}
          glues two vectors into a new one that looks unlike either input.{" "}
          <strong className="font-semibold text-[color:var(--signal-blue)]">
            Superpose
          </strong>{" "}
          adds many bound pairs into a single trace.{" "}
          <strong className="font-semibold text-[color:var(--signal-violet)]">
            Unbind
          </strong>{" "}
          reverses bind: give it the trace and one key, and it returns a noisy
          version of the value.{" "}
          <strong className="font-semibold text-foreground">
            Cleanup
          </strong>{" "}
          snaps that noisy result to the nearest known symbol.
        </p>
        <p>
          Why care? Because together those four operations give you a memory
          you can do algebra on. A single 1024-dimensional vector can hold
          around 50 structured facts and give back any one of them by name,
          and confidence degrades smoothly under noise instead of falling off
          a cliff. The demos below show that happening in milliseconds, with
          every step visible.
        </p>
      </div>

      <div className="mt-10 rounded-md border border-border bg-card/40 p-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          What this site is (and isn&rsquo;t)
        </p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
          An interactive reference for HRR: the operations, the tradeoffs, and
          a small applied example that uses them. It is not a competitor to
          RAG, a vector database, or a production embedding stack. It&rsquo;s
          a small, working demonstration of what vector-symbolic memory can do
          and where its limits are.
        </p>
      </div>
    </section>
  );
}
