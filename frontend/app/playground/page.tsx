"use client";

import { HeroSection } from "@/components/playground/hero-section";
import { MemoryPlayground } from "@/components/playground/memory-playground";
import { RecallDuel } from "@/components/playground/recall-duel";
import { DistortionLab } from "@/components/playground/distortion-lab";
import { InteractiveExplainer } from "@/components/playground/interactive-explainer";

export default function PlaygroundPage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <MemoryPlayground />
      <RecallDuel />
      <DistortionLab />
      <InteractiveExplainer />
    </div>
  );
}
