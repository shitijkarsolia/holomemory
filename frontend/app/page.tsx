"use client";

import { HeroSection } from "@/components/explainer/hero";
import { WhatSection } from "@/components/explainer/what-section";
import { AlgebraSection } from "@/components/explainer/algebra-section";
import { WhySection } from "@/components/explainer/why-section";
import { EncodeBlock } from "@/components/explainer/encode-block";
import { RecallBlock } from "@/components/explainer/recall-block";
import { TrustBlock } from "@/components/explainer/trust-block";
import { ComparisonSection } from "@/components/explainer/comparison-section";
import { CtaSection } from "@/components/explainer/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatSection />
      <AlgebraSection />
      <WhySection />
      <EncodeBlock />
      <RecallBlock />
      <TrustBlock />
      <ComparisonSection />
      <CtaSection />
    </div>
  );
}
