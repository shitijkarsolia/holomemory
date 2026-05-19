"use client";

const ROWS: Array<{ label: string; kw: string; rag: string; holo: string }> = [
  { label: "Recover a stored value by name", kw: "No", rag: "No", holo: "Yes (unbind)" },
  { label: "Encodes role / structure", kw: "No", rag: "Weak", holo: "Yes" },
  { label: "Many facts in one vector", kw: "No (per-token index)", rag: "No (per-doc vectors)", holo: "Yes" },
  { label: "Semantic generalization", kw: "No", rag: "Strong", holo: "Weak (no learned embeddings)" },
  { label: "Graceful under noisy probes", kw: "Cliff", rag: "Moderate", holo: "Smooth degradation" },
  { label: "Explainable scoring", kw: "Yes", rag: "Opaque", holo: "Yes (per-component)" },
  { label: "Needs an embedding model", kw: "No", rag: "Yes", holo: "No" },
  { label: "Runs fully local", kw: "Yes", rag: "Depends", holo: "Yes" },
  {
    label: "Best fit",
    kw: "Exact lookup over small text",
    rag: "Semantic search over documents",
    holo: "Compact structured memory, algebraic queries",
  },
];

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 sm:py-24 border-t border-border/30">
      <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        How it compares
      </h2>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        HRR isn&rsquo;t a replacement for keyword search or RAG. It&rsquo;s a
        different point in the design space. Here&rsquo;s the cross-cut.
      </p>

      <div className="mt-8 overflow-x-auto rounded-md border border-border bg-card/30">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground" />
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Keyword
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                RAG / Vector DB
              </th>
              <th className="py-3 px-4 font-mono text-[11px] uppercase tracking-wider text-[color:var(--signal-amber)]">
                HRR
              </th>
            </tr>
          </thead>
          <tbody className="text-foreground/85">
            {ROWS.map((row, i) => (
              <tr
                key={row.label}
                className={i === ROWS.length - 1 ? "" : "border-b border-border/60"}
              >
                <td className="py-2.5 px-4 font-medium text-foreground">
                  {row.label}
                </td>
                <td className="py-2.5 px-4 text-muted-foreground">{row.kw}</td>
                <td className="py-2.5 px-4 text-muted-foreground">{row.rag}</td>
                <td className="py-2.5 px-4 text-[color:var(--signal-amber)]/90">
                  {row.holo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground">
        Every cell in that table is something you can actually watch happen in
        the lab or the applied demo. None of it is marketing copy.
      </p>
    </section>
  );
}
