"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { dataSources } from "@/data/modules";

export function DataStory() {
  return (
    <section className="py-24 bg-[var(--background-secondary)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Story content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-muted)] text-sm text-[var(--accent-dark)] mb-6">
              <Icon name="sparkles" className="w-4 h-4" />
              <span>Powered by Open Data & AI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-6">
              Global data, local action
            </h2>

            <p className="text-lg text-[var(--foreground-secondary)] mb-8 leading-relaxed">
              Impact Atlas synthesizes data from the world&apos;s leading environmental monitoring systems. Our AI processes satellite imagery, sensor networks, and citizen science contributions to surface opportunities that would take teams months to discover manually.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: "globe" as const,
                  title: "Satellite Intelligence",
                  description: "Real-time Earth observation from Copernicus, Landsat, and commercial providers.",
                },
                {
                  icon: "target" as const,
                  title: "Local Context",
                  description: "OpenStreetMap, municipal datasets, and biodiversity records for ground truth.",
                },
                {
                  icon: "sparkles" as const,
                  title: "AI Synthesis",
                  description: "Machine learning models trained on climate science to find patterns humans miss.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center">
                    <Icon name={item.icon} className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Data sources visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative p-8 rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-lg">
              {/* Connection lines (decorative) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central hub */}
              <div className="relative z-10 flex flex-col items-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center shadow-lg"
                >
                  <Icon name="sparkles" className="w-10 h-10 text-white" />
                </motion.div>
                <p className="mt-4 text-sm font-medium text-[var(--foreground)]">Impact Atlas AI</p>
                <p className="text-xs text-[var(--foreground-muted)]">Processing 50+ data streams</p>
              </div>

              {/* Data source cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dataSources.map((source, index) => (
                  <motion.a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent-muted)] transition-all group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center mb-2 group-hover:bg-[var(--accent-bg)] transition-colors">
                        <Icon name="globe" className="w-4 h-4 text-[var(--foreground-secondary)] group-hover:text-[var(--accent)]" />
                      </div>
                      <p className="text-xs font-medium text-[var(--foreground)]">{source.name}</p>
                    </div>
                    <Icon
                      name="externalLink"
                      className="absolute top-2 right-2 w-3 h-3 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </motion.a>
                ))}
              </div>

              {/* Animated connection dots */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-[var(--accent)]"
                    initial={{
                      x: "50%",
                      y: "20%",
                      opacity: 0,
                    }}
                    animate={{
                      x: ["50%", `${20 + i * 15}%`],
                      y: ["20%", `${60 + i * 8}%`],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.4,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
