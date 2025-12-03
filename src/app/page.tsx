import type { Metadata } from "next";
import FloatingNav from "@/components/navigation/FloatingNav";
import HeroSection from "@/components/sections/HeroSection";
import VisionSection from "@/components/sections/VisionSection";
import ModulesSection from "@/components/sections/ModulesSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ImpactSection from "@/components/sections/ImpactSection";
import CTASection from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Impact Atlas | AI-Powered Climate Intelligence for Cities",
  description:
    "Discover your city's fastest, highest-impact climate wins across urban heat, air quality, coastal plastic, and biodiversity. AI-powered insights from satellite data help cities take action faster.",
  keywords: [
    "climate intelligence",
    "urban planning",
    "satellite data",
    "AI climate",
    "city sustainability",
    "urban heat islands",
    "air quality monitoring",
    "biodiversity mapping",
    "climate action",
    "environmental data",
  ],
  openGraph: {
    title: "Impact Atlas | AI-Powered Climate Intelligence for Cities",
    description:
      "AI-powered platform revealing climate hotspots and quick wins for cities worldwide.",
    url: "https://impactatlas.earth",
    siteName: "Impact Atlas",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Impact Atlas - Climate Intelligence Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Atlas | Climate Intelligence for Cities",
    description:
      "AI-powered platform revealing climate hotspots and quick wins.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
