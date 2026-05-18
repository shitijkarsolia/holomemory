"use client";

export function AppliedIntro() {
  return (
    <section
      id="applied"
      className="mx-auto max-w-3xl px-6 pt-20 sm:pt-24 border-t border-border/30"
    >
      <p className="eyebrow text-[color:var(--signal-blue)]">
        Applied · a memory built on the algebra above
      </p>
      <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        What if you built an agent&rsquo;s memory out of this?
      </h2>
      <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
        The next three sections show a small, working memory system that uses
        HRR underneath, plus a keyword index for literal matches and a
        per-memory trust score that breaks ties when sources disagree. This
        isn&rsquo;t the point of HRR. It&rsquo;s just one applied example of
        what the operations let you build. You&rsquo;ll encode a fact, recall
        it through an indirect query, and watch trust adjudicate a
        contradiction.
      </p>
    </section>
  );
}
