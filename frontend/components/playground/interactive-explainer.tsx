"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "bind",
    title: "Bind",
    subtitle: "Circular convolution",
    description:
      "Each fact is encoded as role-filler pairs. 'subject' is bound to 'Maya' by convolving their symbol vectors. This creates a single vector that represents the relationship.",
    visual: "subject ⊛ Maya → bound_vector",
    detail: "The binding is invertible: given the role vector, you can recover the filler.",
  },
  {
    id: "superpose",
    title: "Superpose",
    subtitle: "Vector addition",
    description:
      "Multiple bindings are summed into one trace vector. A single memory trace holds subject, predicate, object, and metadata, all superposed.",
    visual: "(subject ⊛ Maya) + (predicate ⊛ prefers) + (object ⊛ concise) → trace",
    detail: "Superposition is lossy but graceful; more items means more noise, but retrieval still works.",
  },
  {
    id: "unbind",
    title: "Unbind",
    subtitle: "Correlation / cleanup",
    description:
      "To recall, convolve the trace with the inverse of a role vector. The result is noisy but close to the original filler. Cleanup memory finds the nearest known symbol.",
    visual: "trace ⊛ subject⁻¹ ≈ Maya + noise → cleanup → Maya",
    detail: "This is why holographic memory handles fuzzy queries; partial matches still activate.",
  },
];

export function InteractiveExplainer() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="border-t border-border/30 px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-serif text-[28px] leading-tight tracking-tight text-foreground sm:text-[32px]">
            How it works
          </h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">
            Three operations power holographic memory. Click each step to
            walk through bind, superpose, and unbind with worked notation.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          <div className="flex gap-2 lg:flex-col">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "flex-1 rounded-lg px-4 py-3.5 text-left transition-all lg:flex-none",
                  activeStep === i
                    ? "border border-[color:var(--signal-amber)]/40 bg-[color:var(--signal-amber)]/[0.08]"
                    : "border border-border/30 bg-card/30 hover:bg-card/60",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                      activeStep === i
                        ? "bg-[color:var(--signal-amber)] text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "font-serif text-[16px] tracking-tight",
                      activeStep === i
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="mt-1.5 pl-[34px] font-mono text-[11.5px] lowercase tracking-[0.02em] text-muted-foreground">
                  {step.subtitle}
                </p>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-border/40 bg-card/40 p-6 sm:p-7"
            >
              <h3 className="font-serif text-[22px] leading-tight tracking-tight text-foreground">
                {STEPS[activeStep].title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {STEPS[activeStep].description}
              </p>

              <div className="mt-5 overflow-x-auto rounded-md border border-[color:var(--signal-amber)]/25 bg-[oklch(0.09_0.012_75)] px-4 py-4">
                <code className="block whitespace-nowrap font-mono text-[14px] text-[color:var(--signal-amber)]">
                  {STEPS[activeStep].visual}
                </code>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground/80">
                {STEPS[activeStep].detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
