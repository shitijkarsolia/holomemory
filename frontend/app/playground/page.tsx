import type { Metadata } from "next";
import { HeroSection } from "@/components/playground/hero-section";
import { HrrLab } from "@/components/playground/hrr-lab";
import { MemoryPlayground } from "@/components/playground/memory-playground";
import { RecallDuel } from "@/components/playground/recall-duel";
import { DistortionLab } from "@/components/playground/distortion-lab";
import { InteractiveExplainer } from "@/components/playground/interactive-explainer";

export const metadata: Metadata = {
  title: "HRR Playground — bind, unbind, and break the algebra",
  description:
    "Hands-on playground for Holographic Reduced Representations: chained unbind on a single 1024-d vector, role-vs-filler retrieval, capacity sweeps, and a noise-tolerance lab. The real HRR math runs in your browser.",
  alternates: { canonical: "/playground" },
  openGraph: {
    title: "HRR Playground — bind, unbind, and break the algebra",
    description:
      "Chained unbind, role-vs-filler retrieval, capacity sweeps, and noise tolerance for HRR — running live in the browser.",
    url: "/playground",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HRR Playground",
    description:
      "Chained unbind, role-vs-filler retrieval, capacity sweeps, and noise tolerance for HRR — running live in the browser.",
  },
};

export default function PlaygroundPage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <div id="hrr-lab">
        <HrrLab />
      </div>
      <MemoryPlayground />
      <RecallDuel />
      <DistortionLab />
      <InteractiveExplainer />
    </div>
  );
}
