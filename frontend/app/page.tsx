import { HeroSection } from "@/components/explainer/hero";
import { WhatSection } from "@/components/explainer/what-section";
import { AlgebraSection } from "@/components/explainer/algebra-section";
import { UnbindSection } from "@/components/explainer/unbind-section";
import { AppliedIntro } from "@/components/explainer/applied-intro";
import { EncodeBlock } from "@/components/explainer/encode-block";
import { RecallBlock } from "@/components/explainer/recall-block";
import { TrustBlock } from "@/components/explainer/trust-block";
import { WhySection } from "@/components/explainer/why-section";
import { ComparisonSection } from "@/components/explainer/comparison-section";
import { CtaSection } from "@/components/explainer/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatSection />
      <AlgebraSection />
      <UnbindSection />
      <AppliedIntro />
      <EncodeBlock />
      <RecallBlock />
      <TrustBlock />
      <WhySection />
      <ComparisonSection />
      <CtaSection />
    </div>
  );
}
