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
          The headline demo · unbind &amp; cleanup
        </p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          Pull a stored value back out, by name.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          This is the single operation that justifies HRR&rsquo;s existence.
          We&rsquo;ll superpose four facts into one 1024-d vector, then ask the
          algebra to give us back the object of one specific fact &mdash;
          identified only by its subject and predicate. Cleanup against a
          symbol dictionary lands cleanly on the right answer.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          A keyword index can re-rank stored strings. It cannot{" "}
          <em className="not-italic text-foreground/90">recover</em> a value
          from an encoded trace. That&rsquo;s the line this draws.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <UnbindDemoStandalone />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-[14px] leading-relaxed text-muted-foreground">
          Three more demos in the lab show capacity (how many facts fit in one
          vector), role-binding (telling &ldquo;A manages B&rdquo; apart from
          &ldquo;B manages A&rdquo; when keyword scoring can&rsquo;t), and
          graceful degradation under noise.
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
