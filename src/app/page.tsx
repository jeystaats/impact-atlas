"use client";

import FloatingNav from "@/components/navigation/FloatingNav";
import HeroSection from "@/components/sections/HeroSection";
import VisionSection from "@/components/sections/VisionSection";
import ModulesSection from "@/components/sections/ModulesSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ImpactSection from "@/components/sections/ImpactSection";
import CTASection from "@/components/sections/CTASection";

export default function LandingPage() {
  return (
    <div className="landing-dark">
      <FloatingNav />
      <HeroSection />
      <VisionSection />
      <ModulesSection />
      <ProcessSection />
      <ImpactSection />
      <CTASection />
    </div>
  );
}
