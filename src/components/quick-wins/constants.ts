import type { IconName } from "@/components/ui/icons";
import type { ImpactLevel, EffortLevel, NormalizedQuickWin } from "./types";

export const impactConfig: Record<
  ImpactLevel,
  { label: string; color: string; bgColor: string }
> = {
  high: {
    label: "High Impact",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
  },
  medium: {
    label: "Medium Impact",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
  },
  low: {
    label: "Low Impact",
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.15)",
  },
};

export const effortConfig: Record<EffortLevel, { label: string; icon: IconName }> = {
  low: { label: "Quick Start", icon: "zap" },
  medium: { label: "Moderate", icon: "target" },
  high: { label: "Major Project", icon: "settings" },
};

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export const checkVariants = {
  unchecked: { scale: 1, pathLength: 0 },
  checked: {
    scale: [1, 1.2, 1],
    pathLength: 1,
    transition: {
      scale: { duration: 0.3, ease: "easeOut" as const },
      pathLength: { duration: 0.4, ease: "easeOut" as const },
    },
  },
};

// Fallback quick wins data
export const fallbackQuickWinsData: NormalizedQuickWin[] = [
  // Urban Heat (12)
  {
    id: "uh-1",
    title: "Deploy reflective roofing materials",
    description:
      "Install high-albedo roofing materials on municipal buildings to reduce surface temperatures by up to 30%.",
    moduleId: "urban-heat",
    impact: "high",
    effort: "medium",
    estimatedDays: 14,
    tags: ["infrastructure", "cooling"],
  },
  {
    id: "uh-2",
    title: "Strategic shade tree planting",
    description:
      "Plant native shade trees in identified heat island hotspots to provide immediate cooling benefits.",
    moduleId: "urban-heat",
    impact: "high",
    effort: "medium",
    estimatedDays: 7,
    tags: ["nature-based", "equity"],
  },
  {
    id: "uh-3",
    title: "Cool pavement pilot program",
    description:
      "Apply cool pavement coating on 2km of high-traffic roads in vulnerable neighborhoods.",
    moduleId: "urban-heat",
    impact: "medium",
    effort: "high",
    estimatedDays: 21,
    tags: ["infrastructure", "pilot"],
  },
  {
    id: "uh-4",
    title: "Misting stations at transit stops",
    description:
      "Install solar-powered misting stations at bus stops in heat-vulnerable areas.",
    moduleId: "urban-heat",
    impact: "medium",
    effort: "low",
    estimatedDays: 5,
    tags: ["public-health", "transit"],
  },
  {
    id: "uh-5",
    title: "Green corridor mapping",
    description:
      "Map and designate shaded walking routes connecting key public facilities.",
    moduleId: "urban-heat",
    impact: "low",
    effort: "low",
    estimatedDays: 3,
    tags: ["planning", "wayfinding"],
  },
  {
    id: "uh-6",
    title: "Building shade audit",
    description:
      "Conduct shade audit of school playgrounds and install temporary shade structures.",
    moduleId: "urban-heat",
    impact: "high",
    effort: "low",
    estimatedDays: 7,
    tags: ["schools", "public-health"],
  },
  // Coastal Plastic (6)
  {
    id: "cp-1",
    title: "Deploy boom barriers at river mouths",
    description:
      "Install floating boom barriers at key river discharge points to intercept floating debris.",
    moduleId: "coastal-plastic",
    impact: "high",
    effort: "medium",
    estimatedDays: 10,
    tags: ["infrastructure", "interception"],
  },
  {
    id: "cp-2",
    title: "Storm drain trash capture",
    description:
      "Install inline trash capture devices in top 10 priority storm drains.",
    moduleId: "coastal-plastic",
    impact: "high",
    effort: "medium",
    estimatedDays: 14,
    tags: ["infrastructure", "prevention"],
  },
  {
    id: "cp-3",
    title: "Beach cleanup coordination app",
    description:
      "Launch citizen science app for coordinated beach cleanup efforts.",
    moduleId: "coastal-plastic",
    impact: "medium",
    effort: "low",
    estimatedDays: 7,
    tags: ["community", "technology"],
  },
  // Biodiversity (6)
  {
    id: "bd-1",
    title: "Native pollinator gardens",
    description: "Install native pollinator gardens at 10 public buildings.",
    moduleId: "biodiversity",
    impact: "high",
    effort: "medium",
    estimatedDays: 14,
    tags: ["pollinators", "native-plants"],
  },
  {
    id: "bd-2",
    title: "Wildlife crossing signage",
    description:
      "Install wildlife crossing warning signs at 5 identified road segments.",
    moduleId: "biodiversity",
    impact: "medium",
    effort: "low",
    estimatedDays: 5,
    tags: ["wildlife", "roads"],
  },
  {
    id: "bd-3",
    title: "Bird-safe building guidelines",
    description:
      "Adopt bird-safe building design guidelines for new construction.",
    moduleId: "biodiversity",
    impact: "high",
    effort: "low",
    estimatedDays: 10,
    tags: ["policy", "birds"],
  },
  // Port Emissions (4)
  {
    id: "pe-1",
    title: "Shore power installation",
    description:
      "Install shore power connections at 2 priority berths to enable vessel cold-ironing.",
    moduleId: "port-emissions",
    impact: "high",
    effort: "high",
    estimatedDays: 60,
    tags: ["infrastructure", "electrification"],
  },
  {
    id: "pe-2",
    title: "Vessel speed reduction zone",
    description: "Implement voluntary 12-knot speed limit within 20nm of port.",
    moduleId: "port-emissions",
    impact: "high",
    effort: "low",
    estimatedDays: 7,
    tags: ["policy", "ships"],
  },
  // Restoration (4)
  {
    id: "rs-1",
    title: "Wetland restoration site selection",
    description:
      "Identify and prioritize top 5 wetland restoration sites using AI analysis.",
    moduleId: "restoration",
    impact: "high",
    effort: "low",
    estimatedDays: 7,
    tags: ["planning", "wetlands"],
  },
  {
    id: "rs-2",
    title: "Reforestation pilot project",
    description: "Plant 1,000 native trees on degraded municipal land parcel.",
    moduleId: "restoration",
    impact: "high",
    effort: "medium",
    estimatedDays: 14,
    tags: ["reforestation", "carbon"],
  },
];
