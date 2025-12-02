"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-[var(--accent-bg)] via-[var(--background)] to-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-6">
            Start finding climate wins today
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto">
            Join forward-thinking cities using AI to accelerate their climate action. Free for public sector teams during our pilot program.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild>
              <Link href="/dashboard">
                Get Started Free
                <Icon name="arrowUpRight" className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl">
              Schedule a Demo
            </Button>
          </div>

          <p className="mt-8 text-sm text-[var(--foreground-muted)]">
            No credit card required. Free for cities and public agencies.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
