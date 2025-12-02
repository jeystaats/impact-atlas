/**
 * Action Extractor - Parses AI responses and hotspot data into structured QuickAction objects
 */

import { QuickAction, EffortLevel } from "@/components/copilot/QuickActionCard";
import { HotspotData } from "@/data/hotspots";

// Patterns for extracting structured data from AI responses
const IMPACT_PATTERNS = [
  // Temperature changes
  /(\d+\.?\d*)\s*°?C?\s*(?:cooling|reduction|decrease|improvement)/i,
  /reduce.*?by\s*(\d+\.?\d*)\s*°?C?/i,
  /(\d+\.?\d*)\s*°C?\s*(?:cooler|warmer)/i,
  // Percentage improvements
  /(\d+\.?\d*)%\s*(?:reduction|decrease|improvement|increase)/i,
  /reduce.*?by\s*(\d+\.?\d*)%/i,
  // Weight/volume metrics
  /(\d+[\d,]*)\s*(?:kg|tonnes?|tons?)\s*(?:per\s*)?(?:week|month|year|day)?/i,
  // CO2 specific
  /(\d+[\d,]*)\s*tonnes?\s*CO2/i,
  // Species/biodiversity
  /(\d+)\+?\s*(?:species|birds?|pollinators?)/i,
  // Tree planting
  /plant(?:ing)?\s*(\d+[\d,]*)\s*trees?/i,
  /(\d+[\d,]*)\s*trees?/i,
  // Generic numbers with context
  /benefit(?:ing)?\s*(\d+[\d,]*)\s*(?:residents?|people|homes?)/i,
];

const EFFORT_KEYWORDS: Record<EffortLevel, string[]> = {
  low: ["simple", "easy", "quick", "minimal", "low cost", "straightforward", "immediate"],
  medium: ["moderate", "requires planning", "some investment", "multi-step"],
  high: ["complex", "significant", "major", "substantial investment", "long-term", "infrastructure"],
};

const TIMEFRAME_PATTERNS = [
  /within\s*(\d+)\s*(weeks?|months?|days?)/i,
  /(\d+)\s*-\s*(\d+)\s*(weeks?|months?|years?)/i,
  /in\s*(\d+)\s*(weeks?|months?)/i,
  /(immediate(?:ly)?|short[- ]term|medium[- ]term|long[- ]term)/i,
];

interface ExtractedImpact {
  value: string;
  unit: string;
  label?: string;
}

/**
 * Extract impact metrics from text
 */
function extractImpact(text: string): ExtractedImpact | null {
  for (const pattern of IMPACT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1].replace(/,/g, "");

      // Determine unit based on context
      if (/°C|celsius|temperature|cooling|heat/i.test(text)) {
        return { value, unit: "cooling potential", label: "temperature reduction" };
      }
      if (/CO2|carbon|emission/i.test(text)) {
        return { value, unit: "tonnes CO2/year", label: "carbon reduction" };
      }
      if (/kg|kilogram/i.test(text)) {
        return { value, unit: "kg reduction", label: "waste reduction" };
      }
      if (/tonnes?|tons?/i.test(text)) {
        return { value, unit: "tonnes/year", label: "impact" };
      }
      if (/%/i.test(match[0])) {
        return { value, unit: "% improvement", label: "efficiency gain" };
      }
      if (/species|biodiversity/i.test(text)) {
        return { value: `+${value}`, unit: "species supported", label: "biodiversity" };
      }
      if (/trees?/i.test(text)) {
        return { value, unit: "trees", label: "tree planting" };
      }
      if (/residents?|people|population/i.test(text)) {
        return { value, unit: "residents benefited", label: "community impact" };
      }

      return { value, unit: "units", label: "impact" };
    }
  }
  return null;
}

/**
 * Determine effort level from text
 */
function extractEffort(text: string): EffortLevel {
  const lower = text.toLowerCase();

  for (const [level, keywords] of Object.entries(EFFORT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return level as EffortLevel;
    }
  }

  // Default based on certain markers
  if (/infrastructure|construction|multi-year/i.test(text)) return "high";
  if (/program|initiative|campaign/i.test(text)) return "medium";

  return "medium"; // Default
}

/**
 * Extract timeframe from text
 */
function extractTimeframe(text: string): string | undefined {
  for (const pattern of TIMEFRAME_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Range format
        if (match[3]) {
          return `${match[1]}-${match[2]} ${match[3]}`;
        }
        return `${match[1]} ${match[2]}`;
      }
      return match[1];
    }
  }
  return undefined;
}

/**
 * Extract location information from text
 */
function extractLocation(text: string): { name: string } | undefined {
  // Common location patterns
  const patterns = [
    /(?:in|at|near|along)\s+(?:the\s+)?([A-Z][a-zA-Z\s]+(?:district|neighborhood|area|zone|corridor|park|street|avenue|waterfront))/i,
    /([A-Z][a-zA-Z]+(?:straat|plein|gracht|weg|laan|park|kade|haven))/g, // Dutch
    /(?:the\s+)?([A-Z][a-zA-Z\s]+(?:Terminal|Harbor|Marina|Beach|Port|Center|Centre))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return { name: match[1].trim() };
    }
  }

  return undefined;
}

/**
 * Parse a single AI response section into a QuickAction
 */
function parseActionFromText(
  text: string,
  index: number,
  moduleId?: string
): QuickAction | null {
  // Skip if text is too short or doesn't look like an action
  if (text.length < 50) return null;

  const impact = extractImpact(text);
  if (!impact) return null; // Only create actions when we can quantify impact

  // Extract title from first sentence or heading
  const titleMatch = text.match(/^(?:#+\s*)?([^.!?\n]+)/);
  const title = titleMatch ? titleMatch[1].trim().slice(0, 80) : "Climate Action";

  // Clean description
  const description = text
    .replace(/^(?:#+\s*)?[^.!?\n]+[.!?]?\s*/, "") // Remove title
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 200);

  return {
    id: `ai-action-${Date.now()}-${index}`,
    title,
    description: description || title,
    impactValue: impact.value,
    impactUnit: impact.unit,
    impactLabel: impact.label,
    effortLevel: extractEffort(text),
    timeframe: extractTimeframe(text),
    location: extractLocation(text),
    moduleId,
    source: "ai",
    confidence: undefined, // Could be enhanced with AI confidence scoring
  };
}

/**
 * Extract multiple actions from an AI response
 */
export function extractActionsFromAIResponse(
  content: string,
  moduleId?: string
): QuickAction[] {
  const actions: QuickAction[] = [];

  // Split by numbered lists, bullet points, or paragraphs
  const sections = content
    .split(/(?:^|\n)(?:\d+\.\s*|\*\s*|-\s*|#{1,3}\s*)/)
    .filter(s => s.trim().length > 50);

  // Also try splitting by double newlines for paragraphs
  if (sections.length === 1) {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
    sections.push(...paragraphs);
  }

  // Deduplicate and parse
  const seen = new Set<string>();
  sections.forEach((section, index) => {
    const normalized = section.trim().slice(0, 100);
    if (seen.has(normalized)) return;
    seen.add(normalized);

    const action = parseActionFromText(section, index, moduleId);
    if (action) {
      actions.push(action);
    }
  });

  return actions.slice(0, 5); // Limit to 5 actions max
}

/**
 * Convert a hotspot into a QuickAction
 */
export function hotspotToQuickAction(
  hotspot: HotspotData,
  moduleId: string
): QuickAction {
  // Parse the value to extract numeric impact
  const valueMatch = hotspot.value?.match(/([+-]?\d+\.?\d*)/);
  const impactValue = valueMatch ? valueMatch[1] : "0";

  // Determine unit based on module context
  const unitMap: Record<string, string> = {
    "urban-heat": "cooling potential",
    "coastal-plastic": "waste/week",
    "ocean-plastic": "items/100m",
    "port-emissions": "CO2/day",
    "biodiversity": "habitat gap",
    "restoration": "CO2/year sequestration",
  };

  // Map severity to effort (inverse relationship)
  const effortMap: Record<string, EffortLevel> = {
    low: "low",
    medium: "medium",
    high: "medium",
    critical: "high",
  };

  return {
    id: `hotspot-${hotspot.id}`,
    title: hotspot.label,
    description: hotspot.description,
    impactValue,
    impactUnit: unitMap[moduleId] || hotspot.value || "units",
    effortLevel: effortMap[hotspot.severity],
    location: {
      name: hotspot.location,
      lat: hotspot.lat,
      lng: hotspot.lng,
    },
    moduleId,
    source: "hotspot",
    trend: hotspot.trend,
    recommendations: hotspot.recommendations,
  };
}

/**
 * Check if an AI response contains actionable content
 */
export function hasActionableContent(content: string): boolean {
  // Look for indicators of actionable recommendations
  const actionPatterns = [
    /recommend|suggest|should|could|priority|quick win|action/i,
    /\d+\.?\d*\s*(?:°C|%|tonnes?|kg|trees?|species)/i,
    /plant|install|deploy|create|implement|reduce/i,
  ];

  return actionPatterns.some(pattern => pattern.test(content));
}

/**
 * Determine the type of action for routing purposes
 */
export function categorizeAction(action: QuickAction): "navigation" | "save" | "map" | "external" {
  if (action.location?.lat && action.location?.lng) {
    return "map";
  }
  if (action.moduleId) {
    return "navigation";
  }
  return "save";
}
