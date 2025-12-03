import type { Metadata } from "next";
import Script from "next/script";
import FloatingNav from "@/components/navigation/FloatingNav";
import HeroSection from "@/components/sections/HeroSection";
import VisionSection from "@/components/sections/VisionSection";
import ModulesSection from "@/components/sections/ModulesSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ImpactSection from "@/components/sections/ImpactSection";
import CTASection from "@/components/sections/CTASection";
import { LandingScrollTracker } from "@/components/analytics/LandingScrollTracker";

// JSON-LD structured data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Impact Atlas",
  url: "https://impact.staats.dev",
  logo: "https://impact.staats.dev/logo.png",
  description:
    "AI-powered climate intelligence platform helping cities identify and act on their highest-impact climate opportunities.",
  sameAs: [],
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Impact Atlas",
  url: "https://impact.staats.dev",
  applicationCategory: "EnvironmentApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Discover your city's fastest, highest-impact climate wins across urban heat, air quality, coastal plastic, and biodiversity.",
  featureList: [
    "Urban Heat Island Mapping",
    "Air Quality Monitoring",
    "Coastal Plastic Tracking",
    "Port Emissions Analysis",
    "Biodiversity Mapping",
    "Restoration Planning",
    "AI-Powered Insights",
    "Quick Win Recommendations",
  ],
};

export const metadata: Metadata = {
  title: "AI-Powered Climate Intelligence for Cities",
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
    url: "https://impact.staats.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Atlas | Climate Intelligence for Cities",
    description:
      "AI-powered platform revealing climate hotspots and quick wins.",
  },
};

export default function LandingPage() {
  return (
    <div className="landing-dark">
      {/* JSON-LD structured data */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="web-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />

      <FloatingNav />
      <HeroSection />
      <VisionSection />
      <ModulesSection />
      <ProcessSection />
      <ImpactSection />
      <CTASection />
      <LandingScrollTracker />
    </div>
  );
}
