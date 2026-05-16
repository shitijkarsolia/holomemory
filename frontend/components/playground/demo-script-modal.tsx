"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STEPS = [
  { step: 1, action: "Click \"Seed Demo\" to load a curated scenario about Maya and Atlas." },
  { step: 2, action: "In the Recall panel, ask: \"What does Maya prefer?\"" },
  { step: 3, action: "Notice how holographic recall finds related memories even without exact keyword matches." },
  { step: 4, action: "Scroll to Distortion Lab and click \"Add Noise\" to inject unreliable memories." },
  { step: 5, action: "Ask the same query again. Watch how trust scores help filter noise." },
  { step: 6, action: "Scroll to Recall Duel. Try: \"What changed about Maya's editor?\"" },
  { step: 7, action: "Compare holographic vs keyword results side-by-side." },
  { step: 8, action: "Scroll to How It Works to see binding, superposition, and unbinding visualized." },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoScriptModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            90-Second Demo Walkthrough
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {STEPS.map(({ step, action }) => (
            <div key={step} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {step}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
