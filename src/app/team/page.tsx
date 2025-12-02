"use client";

import FloatingNav from "@/components/navigation/FloatingNav";
import TeamHeroSection from "@/components/sections/team/TeamHeroSection";
import TeamMembersSection from "@/components/sections/team/TeamMembersSection";
import TeamCTASection from "@/components/sections/team/TeamCTASection";

export default function TeamPage() {
  return (
    <div className="landing-dark">
      <FloatingNav />
      <TeamHeroSection />
      <TeamMembersSection />
      <TeamCTASection />
    </div>
  );
}
