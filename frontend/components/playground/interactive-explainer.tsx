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
    detail: "The binding is invertible — given the role vector, you can recover the filler.",
  },
  {
    id: "superpose",
    title: "Superpose",
    subtitle: "Vector addition",
    description:
      "Multiple bindings are summed into one trace vector. A single memory trace holds subject, predicate, object, and metadata — all superposed.",
    visual: "(subject ⊛ Maya) + (predicate ⊛ prefers) + (object ⊛ concise) → trace",
    detail: "Superposition is lossy but graceful — more items means more noise, but retrieval still works.",
  },
  {
    id: "unbind",
    title: "Unbind",
    subtitle: "Correlation / cleanup",
    description:
      "To recall, convolve the trace with the inverse of a role vector. The result is noisy but close to the original filler. Cleanup memory finds the nearest known symbol.",
    visual: "trace ⊛ subject⁻¹ ≈ Maya + noise → cleanup → Maya",
    detail: "This is why holographic memory handles fuzzy queries — partial matches still activate.",
  },
];

export function InteractiveExplainer() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <h2 className="text-lg font-semibold tracking-tight">How It Works</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Three operations power holographic memory. Click each step to explore.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="flex lg:flex-col gap-2">
            {STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "rounded-lg px-4 py-3 text-left transition-all",
                  activeStep === i
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary/30 border border-border/20 hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      activeStep === i
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      activeStep === i ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground pl-7">
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-xl border border-border/30 bg-card/50 p-6"
            >
              <h3 className="text-base font-semibold mb-2">
                {STEPS[activeStep].title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {STEPS[activeStep].description}
              </p>

              <div className="rounded-lg bg-[oklch(0.06_0_0)] border border-border/20 p-4 mb-4">
                <code className="text-xs text-primary font-mono">
                  {STEPS[activeStep].visual}
                </code>
              </div>

              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                {STEPS[activeStep].detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
