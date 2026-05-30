import type { Metadata } from "next";
import { FftBinding } from "@/components/explainer/fft-binding";

export const metadata: Metadata = {
  title: "About — what FFT does inside bind",
  description:
    "The single piece the homepage waves at without showing: the FFT-based circular convolution under HRR's bind operation. Type two symbols, watch every step run live in the browser engine.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About HoloMemory — what FFT does inside bind",
    description:
      "An interactive that exposes the FFT under bind(r, v): the time-domain vectors, their magnitude spectra, the pointwise product, and the inverse FFT.",
    url: "/about",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "About HoloMemory — what FFT does inside bind",
    description:
      "An interactive that exposes the FFT under bind(r, v).",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
      <header className="mb-12">
        <p className="eyebrow">About this project</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          About HoloMemory
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          The homepage walks through HRR conceptually. This page shows the
          one piece the homepage waves at without showing: the FFT-based
          circular convolution under{" "}
          <code className="font-mono text-[14.5px] text-foreground/85">
            bind
          </code>
          .
        </p>
      </header>

      <section className="border-t border-border/30 pt-12">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Inside the binding operation
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
          Binding is three steps in the frequency domain: take the FFT of
          both vectors, multiply pointwise as complex numbers, then inverse
          FFT. The result is a new unit-norm vector that looks nothing like
          either input but is invertible given one of them. The figure below
          runs all three steps live on whatever symbols you type — same code
          path the production engine uses for every memory in the
          playground.
        </p>
        <div className="mt-8">
          <FftBinding />
        </div>
      </section>

      <section className="border-t border-border/30 pt-12 mt-16">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Retrieval modes
        </h2>
        <p className="mt-4 text-[15.5px] leading-relaxed text-muted-foreground">
          The applied memory system on the homepage and playground exposes
          three retrieval modes against the same store of traces.
        </p>
        <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Keyword.</span>{" "}
            Token overlap scoring against a stemmed bag of words. Stems are
            computed with Snowball English and kept byte-identical between
            the Python and TypeScript implementations by{" "}
            <code className="font-mono text-[13.5px] text-foreground/85">
              scripts/parity_check.mjs
            </code>
            .
          </li>
          <li>
            <span className="font-medium text-foreground">Holographic.</span>{" "}
            Cosine similarity between a probe vector built from the query
            and each stored trace. Trust is not factored in for this mode,
            so stale or low-trust memories can win on raw vector overlap.
          </li>
          <li>
            <span className="font-medium text-foreground">Hybrid.</span>{" "}
            <code className="font-mono text-[13.5px] text-foreground/85">
              0.4·H + 0.3·K + 0.15·T + 0.15·E
            </code>{" "}
            — holographic, keyword, trust, and entity overlap. Same weights
            on both sides of the parity check.
          </li>
        </ul>
      </section>

      <section className="border-t border-border/30 pt-12 mt-16">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
          Tech stack
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 text-[15px] leading-relaxed text-muted-foreground">
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
