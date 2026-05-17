export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <header className="mb-12">
        <p className="eyebrow">About this project</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          About HoloMem
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          How holographic memory works, explained for engineers.
        </p>
      </header>

      <section className="space-y-4 border-t border-border/30 pt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          What is holographic memory?
        </h2>
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Holographic memory is a brain-inspired approach to storing and
          retrieving information. Instead of indexing memories by keys or
          keywords, each memory is encoded as a high-dimensional vector trace
          using algebraic operations. Retrieval works by constructing a probe
          vector and finding which stored traces are most similar: an
          approximate, content-addressable lookup rather than an exact
          database query.
        </p>
      </section>

      <section className="space-y-4 border-t border-border/30 pt-12 mt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          HRR operations
        </h2>
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Holographic Reduced Representations (HRR) use three core operations
          to encode structured knowledge into fixed-size vectors.
        </p>
        <div className="mt-6 space-y-4">
          <article className="rounded-lg border border-border/40 bg-card/30 p-5">
            <h3 className="font-serif text-[20px] tracking-tight text-foreground">
              Symbol vectors
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Each concept becomes a unique 1024-dimensional vector, generated
              deterministically from the symbol name. Unrelated symbols are
              nearly orthogonal.
            </p>
          </article>

          <article className="rounded-lg border border-border/40 bg-card/30 p-5">
            <h3 className="font-serif text-[20px] tracking-tight text-foreground">
              Binding (circular convolution)
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Associates two concepts: bind(SUBJECT, &ldquo;user&rdquo;)
              creates a vector representing &ldquo;the subject is user&rdquo;.
              Implemented via FFT. The result is dissimilar to both inputs.
            </p>
          </article>

          <article className="rounded-lg border border-border/40 bg-card/30 p-5">
            <h3 className="font-serif text-[20px] tracking-tight text-foreground">
              Superposition (addition)
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Multiple bindings are summed into a single trace vector. All
              associations stored in one fixed-size vector. Lossy but
              approximately recoverable.
            </p>
          </article>

          <article className="rounded-lg border border-border/40 bg-card/30 p-5">
            <h3 className="font-serif text-[20px] tracking-tight text-foreground">
              Unbinding (circular correlation)
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Given a trace and a key, approximately recovers the bound value.
              Cleanup memory maps the noisy result back to the nearest known
              symbol.
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/30 pt-12 mt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Retrieval modes
        </h2>
        <ul className="space-y-2 text-[15.5px] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Keyword:</span>{" "}
            Token overlap scoring (baseline).
          </li>
          <li>
            <span className="font-medium text-foreground">Holographic:</span>{" "}
            Cosine similarity between probe and trace vectors.
          </li>
          <li>
            <span className="font-medium text-foreground">Hybrid:</span>{" "}
            Weighted combination of holographic 40%, keyword 30%, trust 15%,
            entity overlap 15%.
          </li>
        </ul>
      </section>

      <section className="space-y-4 border-t border-border/30 pt-12 mt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Tradeoffs vs vector DB / RAG
        </h2>
        <div className="overflow-x-auto rounded-md border border-border/40 bg-card/30">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Aspect
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[color:var(--signal-amber)]">
                  HoloMemory
                </th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Vector DB + RAG
                </th>
              </tr>
            </thead>
            <tbody className="text-foreground/85">
              {[
                ["Embedding", "Deterministic, no ML model", "Requires embedding model"],
                ["Structure", "Encodes roles and relations", "Flat semantic similarity"],
                ["Scale", "Prototype (hundreds)", "Production (millions)"],
                ["Dependencies", "NumPy + SQLite", "External services, API keys"],
                ["Explainability", "Component scores, matched symbols", "Opaque similarity score"],
              ].map((row, i, arr) => (
                <tr
                  key={row[0]}
                  className={i === arr.length - 1 ? "" : "border-b border-border/40"}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {row[0]}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row[1]}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/30 pt-12 mt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Tech stack
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 text-[15px] leading-relaxed text-muted-foreground">
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
