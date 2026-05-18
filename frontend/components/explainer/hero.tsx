"use client";

import Link from "next/link";
import { HeroDemo } from "./hero-demo";

const TECH_CHIPS = ["NumPy", "FastAPI", "Next.js", "TypeScript HRR", "FFT"];

export function HeroSection() {
  return (
    <section className="relative px-6 pt-14 pb-20 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="order-1">
          <p className="eyebrow">
            A portfolio project on Holographic Reduced Representations
          </p>
          <h1 className="mt-4 font-serif text-[40px] leading-[1.05] tracking-tight text-foreground sm:text-[52px]">
            One vector. Many facts.
            <br />
            Retrieved by name.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            HRR is a way to store structured information (like &ldquo;Sarah owns
            the auth service&rdquo;) inside a single fixed-size vector. You add
            facts by binding role to value, then pull any one of them back out
            by asking with a key. No model, no embeddings, no API. Every demo
            here runs the real math in your browser.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TECH_CHIPS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card/40 px-2.5 py-1 text-[11px] font-mono text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#unbind"
              className="glow-button rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              See the demo
            </a>
            <Link
              href="/playground"
              className="rounded-md border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground/85 hover:bg-card/60 transition-colors"
            >
              Open the HRR Lab
            </Link>
          </div>
        </div>

        <div className="order-2 lg:order-2">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
