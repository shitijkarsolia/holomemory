"use client";

const ROWS: Array<{ label: string; kw: string; rag: string; holo: string }> = [
  { label: "Indirect recall", kw: "No", rag: "Yes", holo: "Partial" },
  { label: "Encodes structure", kw: "No", rag: "No", holo: "Yes" },
  { label: "Trust scoring", kw: "No", rag: "No", holo: "Yes" },
  { label: "Explains matches", kw: "No", rag: "No", holo: "Yes" },
  { label: "Needs external model", kw: "No", rag: "Yes", holo: "No" },
  { label: "Runs fully local", kw: "Yes", rag: "Depends", holo: "Yes" },
  { label: "Semantic generalization", kw: "No", rag: "Strong", holo: "Weak" },
  { label: "Retrieval latency", kw: "Fast", rag: "Moderate", holo: "Fast" },
  {
    label: "Best fit",
    kw: "Exact lookup over small text",
    rag: "Semantic search over documents",
    holo: "Structured local agent facts",
  },
];

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 sm:py-24 border-t border-border/30">
      <h2 className="font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
        Where it fits
      </h2>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
        This isn&rsquo;t a replacement for RAG or vector databases. It&rsquo;s a
        different point in the design space — optimized for lightweight, local,
        structured agent memory.
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
                HoloMem
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
        HoloMem is strongest for air-gapped, single-agent, dependency-light
        setups where you want transparent, tunable retrieval over structured
        facts.
      </p>
    </section>
  );
}
