import type { Metadata } from "next";
import FloatingNav from "@/components/navigation/FloatingNav";
import TeamHeroSection from "@/components/sections/team/TeamHeroSection";
import TeamMembersSection from "@/components/sections/team/TeamMembersSection";
import TeamCTASection from "@/components/sections/team/TeamCTASection";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the Impact Atlas team: sustainability experts, product leaders, and engineers building AI-powered climate intelligence for cities. Built at Norrsken Fixathon Barcelona 2025.",
  keywords: [
    "Impact Atlas team",
    "climate tech founders",
    "sustainability experts",
    "Norrsken Fixathon",
    "climate innovation",
  ],
  openGraph: {
    title: "Our Team | Impact Atlas",
    description:
      "Meet the team building AI-powered climate intelligence for cities.",
    url: "https://impact.staats.dev/team",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Team | Impact Atlas",
    description:
      "Meet the team building AI-powered climate intelligence for cities.",
  },
};

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
