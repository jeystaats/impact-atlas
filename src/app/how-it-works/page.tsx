"use client";

import FloatingNav from "@/components/navigation/FloatingNav";
import HowItWorksHero from "@/components/sections/how-it-works/HowItWorksHero";
import IntelligenceLoopSection from "@/components/sections/how-it-works/IntelligenceLoopSection";
import DataSourcesSection from "@/components/sections/how-it-works/DataSourcesSection";
import AIEngineSection from "@/components/sections/how-it-works/AIEngineSection";
import ModulesOverviewSection from "@/components/sections/how-it-works/ModulesOverviewSection";
import QuickWinScoringSection from "@/components/sections/how-it-works/QuickWinScoringSection";
import HowItWorksCTA from "@/components/sections/how-it-works/HowItWorksCTA";

export default function HowItWorksPage() {
  return (
    <div className="landing-dark">
      <FloatingNav />
      <HowItWorksHero />
      <IntelligenceLoopSection />
      <DataSourcesSection />
      <AIEngineSection />
      <ModulesOverviewSection />
      <QuickWinScoringSection />
      <HowItWorksCTA />
    </div>
  );
}
