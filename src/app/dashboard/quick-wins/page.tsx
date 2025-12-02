"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, ModuleIcon, IconName } from "@/components/ui/icons";
import { modules } from "@/data/modules";

// Types
type ImpactLevel = "high" | "medium" | "low";
type EffortLevel = "minimal" | "moderate" | "significant";

interface QuickWin {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  estimatedDays: number;
  tags: string[];
}

// Mock Quick Wins Data - organized by module
const quickWinsData: QuickWin[] = [
  // Urban Heat (12)
  { id: "uh-1", title: "Deploy reflective roofing materials", description: "Install high-albedo roofing materials on municipal buildings to reduce surface temperatures by up to 30%.", moduleId: "urban-heat", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["infrastructure", "cooling"] },
  { id: "uh-2", title: "Strategic shade tree planting", description: "Plant native shade trees in identified heat island hotspots to provide immediate cooling benefits.", moduleId: "urban-heat", impact: "high", effort: "moderate", estimatedDays: 7, tags: ["nature-based", "equity"] },
  { id: "uh-3", title: "Cool pavement pilot program", description: "Apply cool pavement coating on 2km of high-traffic roads in vulnerable neighborhoods.", moduleId: "urban-heat", impact: "medium", effort: "significant", estimatedDays: 21, tags: ["infrastructure", "pilot"] },
  { id: "uh-4", title: "Misting stations at transit stops", description: "Install solar-powered misting stations at bus stops in heat-vulnerable areas.", moduleId: "urban-heat", impact: "medium", effort: "minimal", estimatedDays: 5, tags: ["public-health", "transit"] },
  { id: "uh-5", title: "Green corridor mapping", description: "Map and designate shaded walking routes connecting key public facilities.", moduleId: "urban-heat", impact: "low", effort: "minimal", estimatedDays: 3, tags: ["planning", "wayfinding"] },
  { id: "uh-6", title: "Building shade audit", description: "Conduct shade audit of school playgrounds and install temporary shade structures.", moduleId: "urban-heat", impact: "high", effort: "minimal", estimatedDays: 7, tags: ["schools", "public-health"] },
  { id: "uh-7", title: "Cool roof incentive program", description: "Launch rebate program for residential cool roof installations.", moduleId: "urban-heat", impact: "medium", effort: "moderate", estimatedDays: 30, tags: ["incentives", "residential"] },
  { id: "uh-8", title: "Heat emergency response plan", description: "Develop and test heat emergency response protocols with local agencies.", moduleId: "urban-heat", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["emergency", "planning"] },
  { id: "uh-9", title: "Pocket park activation", description: "Convert 3 underutilized parking lots into shaded pocket parks.", moduleId: "urban-heat", impact: "medium", effort: "significant", estimatedDays: 45, tags: ["parks", "conversion"] },
  { id: "uh-10", title: "Urban tree inventory", description: "Complete digital inventory of urban tree canopy using satellite imagery.", moduleId: "urban-heat", impact: "low", effort: "minimal", estimatedDays: 5, tags: ["data", "inventory"] },
  { id: "uh-11", title: "Public building cooling centers", description: "Designate and promote libraries as cooling centers during heat events.", moduleId: "urban-heat", impact: "high", effort: "minimal", estimatedDays: 3, tags: ["public-health", "emergency"] },
  { id: "uh-12", title: "Night-time irrigation schedule", description: "Shift park irrigation to nighttime to reduce daytime humidity and optimize cooling.", moduleId: "urban-heat", impact: "low", effort: "minimal", estimatedDays: 2, tags: ["water", "efficiency"] },

  // Coastal Plastic (6)
  { id: "cp-1", title: "Deploy boom barriers at river mouths", description: "Install floating boom barriers at key river discharge points to intercept floating debris.", moduleId: "coastal-plastic", impact: "high", effort: "moderate", estimatedDays: 10, tags: ["infrastructure", "interception"] },
  { id: "cp-2", title: "Storm drain trash capture", description: "Install inline trash capture devices in top 10 priority storm drains.", moduleId: "coastal-plastic", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["infrastructure", "prevention"] },
  { id: "cp-3", title: "Beach cleanup coordination app", description: "Launch citizen science app for coordinated beach cleanup efforts.", moduleId: "coastal-plastic", impact: "medium", effort: "minimal", estimatedDays: 7, tags: ["community", "technology"] },
  { id: "cp-4", title: "Fishing gear collection program", description: "Partner with fishing communities for derelict gear collection and recycling.", moduleId: "coastal-plastic", impact: "medium", effort: "moderate", estimatedDays: 21, tags: ["partnership", "recycling"] },
  { id: "cp-5", title: "Marina waste reception upgrade", description: "Upgrade waste reception facilities at municipal marina.", moduleId: "coastal-plastic", impact: "medium", effort: "significant", estimatedDays: 30, tags: ["infrastructure", "maritime"] },
  { id: "cp-6", title: "Coastal signage campaign", description: "Install educational signage at beach access points about plastic pollution.", moduleId: "coastal-plastic", impact: "low", effort: "minimal", estimatedDays: 5, tags: ["education", "awareness"] },

  // Ocean Plastic (4)
  { id: "op-1", title: "AI photo classification training", description: "Train volunteers on standardized beach debris photography for AI classification.", moduleId: "ocean-plastic", impact: "medium", effort: "minimal", estimatedDays: 3, tags: ["training", "citizen-science"] },
  { id: "op-2", title: "Microplastic sampling protocol", description: "Establish regular microplastic water sampling at 5 coastal monitoring stations.", moduleId: "ocean-plastic", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["monitoring", "science"] },
  { id: "op-3", title: "School education program", description: "Launch plastic classification workshop program in 10 coastal schools.", moduleId: "ocean-plastic", impact: "medium", effort: "moderate", estimatedDays: 21, tags: ["education", "schools"] },
  { id: "op-4", title: "Data dashboard publication", description: "Publish real-time plastic classification data on public dashboard.", moduleId: "ocean-plastic", impact: "low", effort: "minimal", estimatedDays: 7, tags: ["transparency", "data"] },

  // Port Emissions (9)
  { id: "pe-1", title: "Shore power installation", description: "Install shore power connections at 2 priority berths to enable vessel cold-ironing.", moduleId: "port-emissions", impact: "high", effort: "significant", estimatedDays: 60, tags: ["infrastructure", "electrification"] },
  { id: "pe-2", title: "Vessel speed reduction zone", description: "Implement voluntary 12-knot speed limit within 20nm of port.", moduleId: "port-emissions", impact: "high", effort: "minimal", estimatedDays: 7, tags: ["policy", "ships"] },
  { id: "pe-3", title: "Idle reduction policy", description: "Enact and enforce equipment idling limits for port vehicles.", moduleId: "port-emissions", impact: "medium", effort: "minimal", estimatedDays: 14, tags: ["policy", "equipment"] },
  { id: "pe-4", title: "Electric cargo handling equipment", description: "Replace 5 diesel yard tractors with electric alternatives.", moduleId: "port-emissions", impact: "high", effort: "significant", estimatedDays: 45, tags: ["equipment", "electrification"] },
  { id: "pe-5", title: "Emissions monitoring network", description: "Deploy 10 air quality sensors around port perimeter for real-time monitoring.", moduleId: "port-emissions", impact: "medium", effort: "moderate", estimatedDays: 21, tags: ["monitoring", "data"] },
  { id: "pe-6", title: "Green shipping corridor agreement", description: "Sign MOU with partner port for green shipping corridor pilot.", moduleId: "port-emissions", impact: "medium", effort: "moderate", estimatedDays: 30, tags: ["partnership", "policy"] },
  { id: "pe-7", title: "Truck appointment system", description: "Implement truck appointment system to reduce queuing and idling.", moduleId: "port-emissions", impact: "medium", effort: "moderate", estimatedDays: 28, tags: ["logistics", "efficiency"] },
  { id: "pe-8", title: "LED lighting retrofit", description: "Replace port area lighting with energy-efficient LED fixtures.", moduleId: "port-emissions", impact: "low", effort: "moderate", estimatedDays: 21, tags: ["energy", "infrastructure"] },
  { id: "pe-9", title: "Renewable energy feasibility study", description: "Complete feasibility study for on-site solar and wind installation.", moduleId: "port-emissions", impact: "low", effort: "minimal", estimatedDays: 14, tags: ["planning", "renewables"] },

  // Biodiversity (15)
  { id: "bd-1", title: "Native pollinator gardens", description: "Install native pollinator gardens at 10 public buildings.", moduleId: "biodiversity", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["pollinators", "native-plants"] },
  { id: "bd-2", title: "Wildlife crossing signage", description: "Install wildlife crossing warning signs at 5 identified road segments.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 5, tags: ["wildlife", "roads"] },
  { id: "bd-3", title: "Bird-safe building guidelines", description: "Adopt bird-safe building design guidelines for new construction.", moduleId: "biodiversity", impact: "high", effort: "minimal", estimatedDays: 10, tags: ["policy", "birds"] },
  { id: "bd-4", title: "Invasive species removal", description: "Organize community invasive species removal event in riparian corridor.", moduleId: "biodiversity", impact: "high", effort: "moderate", estimatedDays: 7, tags: ["community", "habitat"] },
  { id: "bd-5", title: "Bat house installation", description: "Install bat houses in 5 parks to support natural pest control.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 3, tags: ["wildlife", "pest-control"] },
  { id: "bd-6", title: "Green roof biodiversity assessment", description: "Assess existing green roofs for biodiversity potential and enhancement.", moduleId: "biodiversity", impact: "low", effort: "minimal", estimatedDays: 7, tags: ["assessment", "roofs"] },
  { id: "bd-7", title: "Urban meadow conversion", description: "Convert 2 hectares of mowed turf to native meadow habitat.", moduleId: "biodiversity", impact: "high", effort: "moderate", estimatedDays: 21, tags: ["habitat", "meadows"] },
  { id: "bd-8", title: "Stormwater pond naturalization", description: "Naturalize margins of 3 stormwater detention ponds.", moduleId: "biodiversity", impact: "medium", effort: "moderate", estimatedDays: 28, tags: ["wetlands", "stormwater"] },
  { id: "bd-9", title: "Dark sky lighting audit", description: "Audit public lighting for wildlife-friendly dark sky compliance.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 10, tags: ["lighting", "nocturnal"] },
  { id: "bd-10", title: "Hedgerow planting program", description: "Plant native hedgerows to connect fragmented green spaces.", moduleId: "biodiversity", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["connectivity", "habitat"] },
  { id: "bd-11", title: "Citizen science biodiversity survey", description: "Launch city-wide biodiversity observation challenge using iNaturalist.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 5, tags: ["citizen-science", "data"] },
  { id: "bd-12", title: "Wildlife corridor mapping", description: "Map and designate priority wildlife corridors in urban matrix.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 14, tags: ["planning", "corridors"] },
  { id: "bd-13", title: "Pesticide reduction policy", description: "Adopt organic land management policy for municipal properties.", moduleId: "biodiversity", impact: "high", effort: "minimal", estimatedDays: 14, tags: ["policy", "organic"] },
  { id: "bd-14", title: "Native seed library", description: "Establish native seed library for residents and community gardens.", moduleId: "biodiversity", impact: "medium", effort: "minimal", estimatedDays: 7, tags: ["community", "native-plants"] },
  { id: "bd-15", title: "School nature play areas", description: "Convert 3 school grounds to include natural play and habitat areas.", moduleId: "biodiversity", impact: "high", effort: "significant", estimatedDays: 45, tags: ["schools", "nature-play"] },

  // Restoration (11)
  { id: "rs-1", title: "Wetland restoration site selection", description: "Identify and prioritize top 5 wetland restoration sites using AI analysis.", moduleId: "restoration", impact: "high", effort: "minimal", estimatedDays: 7, tags: ["planning", "wetlands"] },
  { id: "rs-2", title: "Urban stream daylighting feasibility", description: "Complete feasibility study for daylighting buried urban stream.", moduleId: "restoration", impact: "medium", effort: "moderate", estimatedDays: 30, tags: ["streams", "planning"] },
  { id: "rs-3", title: "Reforestation pilot project", description: "Plant 1,000 native trees on degraded municipal land parcel.", moduleId: "restoration", impact: "high", effort: "moderate", estimatedDays: 14, tags: ["reforestation", "carbon"] },
  { id: "rs-4", title: "Soil health assessment", description: "Conduct soil health assessment at 5 priority restoration sites.", moduleId: "restoration", impact: "low", effort: "minimal", estimatedDays: 10, tags: ["soil", "assessment"] },
  { id: "rs-5", title: "Riparian buffer planting", description: "Plant riparian buffers along 2km of degraded stream banks.", moduleId: "restoration", impact: "high", effort: "moderate", estimatedDays: 21, tags: ["riparian", "water-quality"] },
  { id: "rs-6", title: "Brownfield remediation assessment", description: "Assess 3 brownfield sites for ecological restoration potential.", moduleId: "restoration", impact: "medium", effort: "moderate", estimatedDays: 28, tags: ["brownfields", "assessment"] },
  { id: "rs-7", title: "Carbon sequestration baseline", description: "Establish carbon sequestration baseline for municipal lands.", moduleId: "restoration", impact: "low", effort: "minimal", estimatedDays: 14, tags: ["carbon", "baseline"] },
  { id: "rs-8", title: "Community restoration volunteer program", description: "Launch restoration volunteer program with training and events.", moduleId: "restoration", impact: "medium", effort: "moderate", estimatedDays: 21, tags: ["community", "volunteers"] },
  { id: "rs-9", title: "Native nursery partnership", description: "Establish partnership with local nursery for native plant propagation.", moduleId: "restoration", impact: "medium", effort: "minimal", estimatedDays: 14, tags: ["partnership", "native-plants"] },
  { id: "rs-10", title: "Erosion control on degraded slopes", description: "Implement bioengineering erosion control on 3 priority slopes.", moduleId: "restoration", impact: "high", effort: "moderate", estimatedDays: 21, tags: ["erosion", "bioengineering"] },
  { id: "rs-11", title: "Restoration monitoring protocol", description: "Develop standardized monitoring protocol for all restoration sites.", moduleId: "restoration", impact: "low", effort: "minimal", estimatedDays: 7, tags: ["monitoring", "standards"] },
];

// Helper functions
const getModuleById = (id: string) => modules.find(m => m.id === id);

const impactConfig: Record<ImpactLevel, { label: string; color: string; bgColor: string }> = {
  high: { label: "High Impact", color: "#10B981", bgColor: "rgba(16, 185, 129, 0.15)" },
  medium: { label: "Medium Impact", color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)" },
  low: { label: "Low Impact", color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.15)" },
};

const effortConfig: Record<EffortLevel, { label: string; icon: IconName }> = {
  minimal: { label: "Quick Start", icon: "zap" },
  moderate: { label: "Moderate", icon: "target" },
  significant: { label: "Major Project", icon: "settings" },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const checkVariants = {
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

export default function QuickWinsPage() {
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<ImpactLevel | "all">("all");
  const [completedWins, setCompletedWins] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Computed values
  const filteredWins = useMemo(() => {
    return quickWinsData.filter(win => {
      const matchesModule = selectedModule === "all" || win.moduleId === selectedModule;
      const matchesImpact = selectedImpact === "all" || win.impact === selectedImpact;
      const matchesSearch = searchQuery === "" ||
        win.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        win.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesModule && matchesImpact && matchesSearch;
    });
  }, [selectedModule, selectedImpact, searchQuery]);

  const stats = useMemo(() => {
    const total = quickWinsData.length;
    const highImpact = quickWinsData.filter(w => w.impact === "high").length;
    const quickStarts = quickWinsData.filter(w => w.effort === "minimal").length;
    const completed = completedWins.size;
    return { total, highImpact, quickStarts, completed };
  }, [completedWins]);

  const toggleComplete = (id: string) => {
    setCompletedWins(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center">
              <Icon name="zap" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
              Actionable Insights
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]"
          >
            Quick Wins
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)] mt-1 max-w-xl"
          >
            AI-identified opportunities for immediate climate action across all modules
          </motion.p>
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative w-full lg:w-80"
        >
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]"
          />
          <input
            type="text"
            placeholder="Search quick wins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
          />
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Total Quick Wins", value: stats.total.toString(), icon: "zap" as const, color: "var(--accent)" },
          { label: "High Impact", value: stats.highImpact.toString(), icon: "trendingUp" as const, color: "#10B981" },
          { label: "Quick Starts", value: stats.quickStarts.toString(), icon: "sparkles" as const, color: "#F59E0B" },
          { label: "Completed", value: stats.completed.toString(), icon: "success" as const, color: "#8B5CF6" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="p-4 lg:p-6 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] group cursor-default"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: stat.color + "15" }}
              >
                <Icon name={stat.icon} className="w-5 h-5" style={{ color: stat.color }} />
              </motion.div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-[var(--foreground)] tabular-nums">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col lg:flex-row gap-4 mb-6"
      >
        {/* Module Filter */}
        <div className="flex-1">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
            Filter by Module
          </p>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedModule("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedModule === "all"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
              }`}
            >
              All Modules
            </motion.button>
            {modules.map((module) => (
              <motion.button
                key={module.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedModule(module.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedModule === module.id
                    ? "text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
                }`}
                style={selectedModule === module.id ? { backgroundColor: module.color } : {}}
              >
                <ModuleIcon
                  moduleId={module.id}
                  className="w-3.5 h-3.5"
                  style={selectedModule !== module.id ? { color: module.color } : {}}
                />
                <span className="hidden sm:inline">{module.title.split(" ").slice(0, 2).join(" ")}</span>
                <span className="sm:hidden">{module.title.split(" ")[0]}</span>
                <span className="text-xs opacity-70">({module.quickWinsCount})</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Impact Filter */}
        <div className="lg:w-64">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider mb-2">
            Filter by Impact
          </p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedImpact("all")}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedImpact === "all"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
              }`}
            >
              All
            </motion.button>
            {(["high", "medium", "low"] as ImpactLevel[]).map((impact) => (
              <motion.button
                key={impact}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedImpact(impact)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedImpact === impact
                    ? "text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:bg-[var(--border)] border border-[var(--border)]"
                }`}
                style={selectedImpact === impact ? { backgroundColor: impactConfig[impact].color } : {}}
              >
                {impact}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center justify-between mb-4"
      >
        <p className="text-sm text-[var(--foreground-muted)]">
          Showing <span className="text-[var(--foreground)] font-medium">{filteredWins.length}</span> quick wins
          {selectedModule !== "all" && (
            <> in <span className="text-[var(--foreground)] font-medium">
              {getModuleById(selectedModule)?.title.split(" ").slice(0, 2).join(" ")}
            </span></>
          )}
        </p>
        {completedWins.size > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCompletedWins(new Set())}
            className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Reset completed ({completedWins.size})
          </motion.button>
        )}
      </motion.div>

      {/* Quick Wins List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredWins.map((win) => {
            const module = getModuleById(win.moduleId);
            const isCompleted = completedWins.has(win.id);

            return (
              <motion.div
                key={win.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`group relative p-4 lg:p-5 rounded-xl border transition-all duration-300 ${
                  isCompleted
                    ? "bg-[var(--background-secondary)] border-[var(--border)] opacity-60"
                    : "bg-[var(--background-tertiary)] border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                {/* Accent line on hover */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                  style={{ backgroundColor: module?.color }}
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                />

                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleComplete(win.id)}
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <AnimatePresence>
                      {isCompleted && (
                        <motion.svg
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M5 12l5 5L20 7"
                            variants={checkVariants}
                            initial="unchecked"
                            animate="checked"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                      <h3 className={`font-semibold text-[var(--foreground)] transition-all ${
                        isCompleted ? "line-through opacity-60" : ""
                      }`}>
                        {win.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Module badge */}
                        <div
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: module?.color + "15",
                            color: module?.color
                          }}
                        >
                          <ModuleIcon moduleId={win.moduleId} className="w-3 h-3" style={{ color: module?.color }} />
                          {module?.title.split(" ").slice(0, 2).join(" ")}
                        </div>
                        {/* Impact badge */}
                        <div
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: impactConfig[win.impact].bgColor,
                            color: impactConfig[win.impact].color
                          }}
                        >
                          {impactConfig[win.impact].label}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm text-[var(--foreground-secondary)] mb-3 ${
                      isCompleted ? "line-through opacity-60" : ""
                    }`}>
                      {win.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      {/* Effort */}
                      <div className="flex items-center gap-1.5">
                        <Icon name={effortConfig[win.effort].icon} className="w-3.5 h-3.5" />
                        <span>{effortConfig[win.effort].label}</span>
                      </div>
                      {/* Timeline */}
                      <div className="flex items-center gap-1.5">
                        <Icon name="target" className="w-3.5 h-3.5" />
                        <span>{win.estimatedDays} days</span>
                      </div>
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {win.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <Icon name="more" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredWins.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--background-tertiary)] flex items-center justify-center">
            <Icon name="search" className="w-8 h-8 text-[var(--foreground-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No quick wins found
          </h3>
          <p className="text-[var(--foreground-secondary)] max-w-md mx-auto">
            Try adjusting your filters or search query to find more opportunities.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedModule("all");
              setSelectedImpact("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium"
          >
            Reset Filters
          </motion.button>
        </motion.div>
      )}

      {/* Progress indicator at bottom */}
      {stats.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-2xl flex items-center gap-4"
          style={{ backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-2">
            <Icon name="success" className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm text-[var(--foreground)]">
              <span className="font-semibold">{stats.completed}</span> of{" "}
              <span className="font-semibold">{stats.total}</span> completed
            </span>
          </div>
          <div className="w-32 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#10B981]"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
            {Math.round((stats.completed / stats.total) * 100)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}
