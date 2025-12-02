import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ModulesGrid } from "@/components/landing/ModulesGrid";
import { DataStory } from "@/components/landing/DataStory";
import { SocialProof } from "@/components/landing/SocialProof";
import { CTA } from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <Hero />
        <ModulesGrid />
        <DataStory />
        <SocialProof />
        <CTA />
      </div>
      <Footer />
    </main>
  );
}
