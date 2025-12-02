"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";

const testimonials = [
  {
    quote: "Impact Atlas helped us identify 15 priority tree planting sites in areas with the highest heat vulnerability and lowest canopy cover.",
    author: "Maria Santos",
    role: "Climate Adaptation Lead",
    org: "City of Barcelona",
  },
  {
    quote: "The coastal plastic predictor saved us weeks of manual surveying. We now deploy cleanup crews proactively rather than reactively.",
    author: "Lars Andersen",
    role: "Environmental Director",
    org: "Copenhagen Municipality",
  },
];

const archetypes = [
  { icon: "mapPin" as const, label: "City Climate Teams" },
  { icon: "globe" as const, label: "Regional Planners" },
  { icon: "leaf" as const, label: "Environment Agencies" },
  { icon: "target" as const, label: "Sustainability Officers" },
];

export function SocialProof() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Built for section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-6">
            Built for
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {archetypes.map((archetype, index) => (
              <motion.div
                key={archetype.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background-secondary)] border border-[var(--border)]"
              >
                <Icon name={archetype.icon} className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">{archetype.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="sparkles" className="w-4 h-4 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg text-[var(--foreground)] mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
                  {testimonial.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{testimonial.author}</p>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {testimonial.role}, {testimonial.org}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
