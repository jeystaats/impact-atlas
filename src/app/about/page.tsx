"use client";

import FloatingNav from "@/components/navigation/FloatingNav";
import AboutHeroSection from "@/components/sections/about/AboutHeroSection";
import ProblemSection from "@/components/sections/about/ProblemSection";
import ApproachSection from "@/components/sections/about/ApproachSection";
import VisionMissionSection from "@/components/sections/about/VisionMissionSection";
import FixathonFitSection from "@/components/sections/about/FixathonFitSection";
import AboutCTASection from "@/components/sections/about/AboutCTASection";

export default function AboutPage() {
  return (
    <div className="landing-dark">
      <FloatingNav />
      <AboutHeroSection />
      <ProblemSection />
      <ApproachSection />
      <VisionMissionSection />
      <FixathonFitSection />
      <AboutCTASection />
    </div>
  );
}
