"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const scoringFactors = [
  {
    id: "impact",
    label: "Impact Potential",
    description: "Environmental and health benefits achievable",
    weight: 40,
    color: "--ld-teal",
  },
  {
    id: "feasibility",
    label: "Feasibility",
    description: "Technical and political ease of implementation",
    weight: 30,
    color: "--ld-bio",
  },
  {
    id: "cost",
    label: "Cost Efficiency",
    description: "Return on investment and budget fit",
    weight: 30,
    color: "--ld-heat",
  },
];

const exampleQuickWins = [
  {
    title: "Plant trees on Carrer de València",
    score: 94,
    impact: "Reduce local temp by 2.3°C",
    module: "Urban Heat",
    color: "--ld-heat",
  },
  {
    title: "Beach cleanup at Barceloneta north",
    score: 87,
    impact: "Prevent 2.4T plastic entering sea",
    module: "Coastal Plastic",
    color: "--ld-ocean",
  },
  {
    title: "Green corridor Parc → Marina",
    score: 82,
    impact: "Connect 3 fragmented habitats",
    module: "Biodiversity",
    color: "--ld-bio",
  },
];

export default function QuickWinScoringSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [weights, setWeights] = useState({
    impact: 40,
    feasibility: 30,
    cost: 30,
  });

  const handleWeightChange = (id: string, value: number) => {
    const others = Object.entries(weights).filter(([key]) => key !== id);
    const remaining = 100 - value;
    const otherTotal = others.reduce((sum, [, v]) => sum + v, 0);

    const newWeights = { ...weights, [id]: value };
    if (otherTotal > 0) {
      others.forEach(([key, v]) => {
        newWeights[key as keyof typeof weights] = Math.round((v / otherTotal) * remaining);
      });
    }
    setWeights(newWeights);
  };

  return (
    <section
      ref={sectionRef}
      className="ld-section relative"
      style={{ background: "var(--ld-navy-dark)" }}
    >
      <div className="ld-section-content relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="ld-caption mb-4"
          >
            Prioritization
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="ld-display-lg mb-6"
          >
            <span className="ld-gradient-text">Quick Win</span> scoring
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="ld-body-lg"
          >
            Not all opportunities are equal. Our scoring algorithm helps cities focus
            on actions that deliver maximum impact with available resources.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Scoring factors with sliders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--ld-white)" }}
            >
              Customize Priorities
            </h3>

            <div className="space-y-6">
              {scoringFactors.map((factor) => (
                <div key={factor.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span
                        className="font-medium"
                        style={{ color: "var(--ld-white-90)" }}
                      >
                        {factor.label}
                      </span>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--ld-white-50)" }}
                      >
                        {factor.description}
                      </p>
                    </div>
                    <span
                      className="text-lg font-mono font-bold"
                      style={{ color: `var(${factor.color})` }}
                    >
                      {weights[factor.id as keyof typeof weights]}%
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={weights[factor.id as keyof typeof weights]}
                      onChange={(e) => handleWeightChange(factor.id, parseInt(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, var(${factor.color}) 0%, var(${factor.color}) ${weights[factor.id as keyof typeof weights]}%, var(--ld-navy-mid) ${weights[factor.id as keyof typeof weights]}%, var(--ld-navy-mid) 100%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Formula */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 p-4 rounded-xl font-mono text-sm"
              style={{
                background: "var(--ld-navy-deep)",
                border: "1px solid var(--ld-white-10)",
              }}
            >
              <span style={{ color: "var(--ld-white-50)" }}>Score = </span>
              <span style={{ color: "var(--ld-teal)" }}>{weights.impact}%</span>
              <span style={{ color: "var(--ld-white-30)" }}> × Impact + </span>
              <span style={{ color: "var(--ld-bio)" }}>{weights.feasibility}%</span>
              <span style={{ color: "var(--ld-white-30)" }}> × Feasibility + </span>
              <span style={{ color: "var(--ld-heat)" }}>{weights.cost}%</span>
              <span style={{ color: "var(--ld-white-30)" }}> × Cost</span>
            </motion.div>
          </motion.div>

          {/* Right: Example quick wins */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--ld-white)" }}
            >
              Example Quick Wins
            </h3>

            <div className="space-y-4">
              {exampleQuickWins.map((win, i) => (
                <motion.div
                  key={win.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: "var(--ld-navy-deep)",
                    border: `1px solid color-mix(in srgb, var(${win.color}) 30%, transparent)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Module badge */}
                      <div
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mb-2"
                        style={{
                          background: `color-mix(in srgb, var(${win.color}) 15%, transparent)`,
                          color: `var(${win.color})`,
                        }}
                      >
                        {win.module}
                      </div>

                      {/* Title */}
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--ld-white)" }}
                      >
                        {win.title}
                      </h4>

                      {/* Impact */}
                      <p
                        className="text-sm"
                        style={{ color: "var(--ld-white-50)" }}
                      >
                        {win.impact}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div
                        className="text-3xl font-bold font-mono"
                        style={{ color: "var(--ld-teal)" }}
                      >
                        {win.score}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--ld-white-40)" }}
                      >
                        score
                      </div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ld-navy-mid)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${win.score}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, var(${win.color}), var(--ld-teal))`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--ld-white);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--ld-white);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </section>
  );
}
