"use client";

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 border-t border-border/10">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Where it fits
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        This isn&rsquo;t a replacement for RAG or vector databases. It&rsquo;s a different
        point in the design space — optimized for lightweight, local, structured
        agent memory.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/20">
              <th className="pb-3 pr-6 font-medium text-muted-foreground/60" />
              <th className="pb-3 pr-6 font-medium text-muted-foreground/60">Keyword</th>
              <th className="pb-3 pr-6 font-medium text-muted-foreground/60">RAG</th>
              <th className="pb-3 font-medium text-primary/70">HoloMem</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground/80">
            <Row label="Indirect recall" kw="No" rag="Yes" holo="Partial" />
            <Row label="Encodes structure" kw="No" rag="No" holo="Yes" />
            <Row label="Trust scoring" kw="No" rag="No" holo="Yes" />
            <Row label="Explains matches" kw="No" rag="No" holo="Yes" />
            <Row label="Needs external model" kw="No" rag="Yes" holo="No" />
            <Row label="Runs fully local" kw="Yes" rag="Depends" holo="Yes" />
            <Row label="Semantic generalization" kw="No" rag="Strong" holo="Weak" />
            <Row label="Retrieval latency" kw="Fast" rag="Moderate" holo="Fast" />
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted-foreground/50">
        HoloMem is strongest for air-gapped, single-agent, dependency-light
        setups where you want transparent, tunable retrieval over structured
        facts.
      </p>
    </section>
  );
}

function Row({ label, kw, rag, holo }: { label: string; kw: string; rag: string; holo: string }) {
  return (
    <tr className="border-b border-border/10">
      <td className="py-2.5 pr-6 font-medium text-foreground/70">{label}</td>
      <td className="py-2.5 pr-6">{kw}</td>
      <td className="py-2.5 pr-6">{rag}</td>
      <td className="py-2.5 text-foreground/80">{holo}</td>
    </tr>
  );
}
