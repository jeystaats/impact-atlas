"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";

interface SmartSuggestionsProps {
  moduleId?: string;
  selectedHotspot?: string;
  onSelect: (suggestion: string) => void;
}

const baseSuggestions = [
  { text: "What are the top 3 quick wins?", priority: "high" },
  { text: "Summarize today's insights", priority: "normal" },
  { text: "Compare to similar cities", priority: "normal" },
  { text: "Create an action plan", priority: "normal" },
];

const moduleSuggestions: Record<string, Array<{ text: string; priority: string }>> = {
  "urban-heat": [
    { text: "Where should we plant trees first?", priority: "high" },
    { text: "Which areas have the worst heat equity?", priority: "high" },
    { text: "What's the cooling potential of green corridors?", priority: "normal" },
  ],
  "coastal-plastic": [
    { text: "Where will plastic accumulate this week?", priority: "high" },
    { text: "What's driving the current accumulation pattern?", priority: "normal" },
    { text: "Best locations for cleanup crews?", priority: "high" },
  ],
  "ocean-plastic": [
    { text: "What types of plastic are most common?", priority: "normal" },
    { text: "Which sources should we target first?", priority: "high" },
    { text: "How does our beach compare to others?", priority: "normal" },
  ],
  "port-emissions": [
    { text: "Which vessels are the biggest emitters?", priority: "high" },
    { text: "What's the shore power ROI?", priority: "high" },
    { text: "How do emissions compare to last month?", priority: "normal" },
  ],
  "biodiversity": [
    { text: "Where are the corridor gaps?", priority: "high" },
    { text: "Which species could we support?", priority: "normal" },
    { text: "Best sites for pollinator gardens?", priority: "high" },
  ],
  "restoration": [
    { text: "Which site has the best carbon ROI?", priority: "high" },
    { text: "What's the total sequestration potential?", priority: "normal" },
    { text: "Prioritize sites by feasibility", priority: "high" },
  ],
};

export function SmartSuggestions({ moduleId, selectedHotspot, onSelect }: SmartSuggestionsProps) {
  // Get context-aware suggestions
  const suggestions = moduleId
    ? [...(moduleSuggestions[moduleId] || []), ...baseSuggestions.slice(0, 2)]
    : baseSuggestions;

  // Add hotspot-specific suggestion if one is selected
  if (selectedHotspot) {
    suggestions.unshift({
      text: `Tell me more about this hotspot`,
      priority: "high",
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider px-1">
        Suggested Questions
      </p>
      <div className="space-y-1.5">
        {suggestions.slice(0, 5).map((suggestion, index) => (
          <motion.button
            key={suggestion.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            onClick={() => onSelect(suggestion.text)}
            className={`
              w-full text-left px-3 py-2.5 rounded-lg text-sm
              transition-all duration-200
              border border-transparent
              ${suggestion.priority === "high"
                ? "bg-[var(--accent-bg)] text-[var(--accent-dark)] hover:border-[var(--accent-muted)]"
                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
              }
            `}
          >
            <div className="flex items-center gap-2">
              {suggestion.priority === "high" && (
                <Icon name="zap" className="w-3.5 h-3.5 text-[var(--accent)]" />
              )}
              <span className="flex-1">{suggestion.text}</span>
              <Icon name="chevronRight" className="w-4 h-4 opacity-50" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
