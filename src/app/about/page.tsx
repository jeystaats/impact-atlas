import type { Metadata } from "next";
import FloatingNav from "@/components/navigation/FloatingNav";
import AboutHeroSection from "@/components/sections/about/AboutHeroSection";
import ProblemSection from "@/components/sections/about/ProblemSection";
import ApproachSection from "@/components/sections/about/ApproachSection";
import VisionMissionSection from "@/components/sections/about/VisionMissionSection";
import FixathonFitSection from "@/components/sections/about/FixathonFitSection";
import AboutCTASection from "@/components/sections/about/AboutCTASection";

export const metadata: Metadata = {
  title: "About Impact Atlas | Our Mission & Vision",
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
    url: "https://impactatlas.earth/about",
    siteName: "Impact Atlas",
    images: [
      {
        url: "/og-image-about.png",
        width: 1200,
        height: 630,
        alt: "About Impact Atlas - Our Mission",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Impact Atlas | Our Mission & Vision",
    description:
      "Combining satellite data, AI, and urban planning for climate action.",
    images: ["/og-image-about.png"],
  },
  robots: {
    index: true,
    follow: true,
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
