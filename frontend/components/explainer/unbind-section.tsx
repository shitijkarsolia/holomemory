"use client";

import Link from "next/link";
import { UnbindDemoStandalone } from "@/components/playground/hrr-lab";

export function UnbindSection() {
  return (
    <section
      id="unbind"
      className="border-t border-border/30 px-6 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-[color:var(--signal-amber)]">
          The headline demo · unbind and cleanup
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          Pull a stored value back out, by name.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          This is the operation that makes HRR worth knowing about. We pack
          four facts into one 1024-dimensional vector, then ask for the value
          of a single fact back. The only thing we hand over is its subject
          and predicate. Cleanup against a small symbol dictionary lands on
          the right answer.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          A keyword index can re-rank stored strings. It can&rsquo;t recover a
          value from an encoded trace. That&rsquo;s the line this demo draws.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <UnbindDemoStandalone />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Three more demos in the lab show capacity (how many facts fit before
          recall starts losing them), role-binding (telling &ldquo;A manages
          B&rdquo; apart from &ldquo;B manages A&rdquo; when keyword scoring
          can&rsquo;t), and how confidence degrades when you corrupt the trace
          with noise.
        </p>
        <div className="mt-4">
          <Link
            href="/playground#hrr-lab"
            className="inline-block rounded-md border border-border bg-card/40 px-4 py-2 text-sm font-medium text-foreground/85 hover:bg-card/70 transition-colors"
          >
            Open the full HRR Lab →
          </Link>
        </div>
      </div>
    </section>
  );
}
