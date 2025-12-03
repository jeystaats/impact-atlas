import type { Metadata } from "next";
import FloatingNav from "@/components/navigation/FloatingNav";
import AboutHeroSection from "@/components/sections/about/AboutHeroSection";
import ProblemSection from "@/components/sections/about/ProblemSection";
import ApproachSection from "@/components/sections/about/ApproachSection";
import VisionMissionSection from "@/components/sections/about/VisionMissionSection";
import FixathonFitSection from "@/components/sections/about/FixathonFitSection";
import AboutCTASection from "@/components/sections/about/AboutCTASection";

export const metadata: Metadata = {
  title: "About | Our Mission & Vision",
  description:
    "Learn how Impact Atlas combines satellite data, AI, and urban planning to help cities tackle climate challenges faster and smarter. Built at Norrsken Fixathon Barcelona.",
  keywords: [
    "climate technology",
    "urban sustainability",
    "satellite analytics",
    "AI for climate",
    "Norrsken Fixathon",
    "climate solutions",
    "environmental intelligence",
  ],
  openGraph: {
    title: "About Impact Atlas | Our Mission & Vision",
    description:
      "Combining satellite data, AI, and urban planning to help cities tackle climate challenges.",
    url: "https://impact.staats.dev/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Impact Atlas | Our Mission & Vision",
    description:
      "Combining satellite data, AI, and urban planning for climate action.",
  },
};

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
