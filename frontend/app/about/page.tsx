export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-3xl mx-auto px-6 py-12">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">About HoloMem</h1>
        <p className="text-sm text-muted-foreground">
          How holographic memory works, explained for engineers
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">What is Holographic Memory?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Holographic memory is a brain-inspired approach to storing and retrieving information.
          Instead of indexing memories by keys or keywords, each memory is encoded as a
          high-dimensional vector trace using algebraic operations. Retrieval works by constructing
          a probe vector and finding which stored traces are most similar — an approximate,
          content-addressable lookup rather than an exact database query.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">HRR Operations</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Holographic Reduced Representations (HRR) use three core operations to encode structured
          knowledge into fixed-size vectors:
        </p>
        <div className="space-y-4 mt-4">
          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Symbol Vectors</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Each concept becomes a unique 1024-dimensional vector, generated deterministically
              from the symbol name. Unrelated symbols are nearly orthogonal.
            </p>
          </div>

          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Binding (Circular Convolution)</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Associates two concepts: bind(SUBJECT, &quot;user&quot;) creates a vector representing
              &quot;the subject is user&quot;. Implemented via FFT. The result is dissimilar to both inputs.
            </p>
          </div>

          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Superposition (Addition)</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Multiple bindings are summed into a single trace vector. All associations stored
              in one fixed-size vector. Lossy but approximately recoverable.
            </p>
          </div>

          <div className="rounded-lg border border-border/30 bg-card/50 p-4">
            <h3 className="text-sm font-medium">Unbinding (Circular Correlation)</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Given a trace and a key, approximately recovers the bound value. Cleanup memory
              maps the noisy result back to the nearest known symbol.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Retrieval Modes</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li><span className="font-medium text-foreground">Keyword:</span> Token overlap scoring (baseline)</li>
          <li><span className="font-medium text-foreground">Holographic:</span> Cosine similarity between probe and trace vectors</li>
          <li><span className="font-medium text-foreground">Hybrid:</span> Weighted combination — holographic 40%, keyword 30%, trust 15%, entity overlap 15%</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Tradeoffs vs Vector DB / RAG</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Aspect</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">HoloMemory</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Vector DB + RAG</th>
              </tr>
            </thead>
            <tbody className="text-xs text-muted-foreground">
              <tr className="border-b border-border/30">
                <td className="py-2 font-medium text-foreground">Embedding</td>
                <td className="py-2">Deterministic, no ML model</td>
                <td className="py-2">Requires embedding model</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 font-medium text-foreground">Structure</td>
                <td className="py-2">Encodes roles and relations</td>
                <td className="py-2">Flat semantic similarity</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 font-medium text-foreground">Scale</td>
                <td className="py-2">Prototype (hundreds)</td>
                <td className="py-2">Production (millions)</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 font-medium text-foreground">Dependencies</td>
                <td className="py-2">NumPy + SQLite</td>
                <td className="py-2">External services, API keys</td>
              </tr>
              <tr>
                <td className="py-2 font-medium text-foreground">Explainability</td>
                <td className="py-2">Component scores, matched symbols</td>
                <td className="py-2">Opaque similarity score</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 border-t border-border/30 pt-8">
        <h2 className="text-base font-semibold">Tech Stack</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Backend</p>
            <p>FastAPI, SQLAlchemy, NumPy, SQLite</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Frontend</p>
            <p>Next.js, TypeScript, Tailwind, shadcn/ui</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Math</p>
            <p>FFT-based circular convolution, cosine similarity</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Storage</p>
            <p>SQLite with BLOB vectors, JSON metadata</p>
          </div>
        </div>
      </section>
    </div>
  );
}
