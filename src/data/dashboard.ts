import { StatCardData } from "@/components/dashboard/StatCard";

// Static sparkline data to avoid hydration mismatches
// Pre-generated data that looks natural but is deterministic
const sparklinePresets = {
  upSmall: [42, 44, 47, 49, 52, 55, 57],
  upMedium: [65, 68, 72, 78, 82, 85, 89],
  upLarge: [22, 24, 27, 30, 35, 39, 41],
  downSmall: [155, 152, 148, 145, 143, 140, 142],
  downMedium: [108, 105, 102, 100, 98, 96, 98],
  downLarge: [220, 215, 210, 205, 200, 198, 201],
  neutralSmall: [134, 135, 133, 136, 134, 135, 134],
  neutralStatic: [6, 6, 6, 6, 6, 6, 6],
};

export const dashboardStats: StatCardData[] = [
  {
    label: "Active Modules",
    value: 6,
    icon: "dashboard",
    color: "#0D9488", // teal accent
    trend: "neutral",
    sparklineData: [5, 5, 6, 6, 6, 6, 6],
  },
  {
    label: "Quick Wins",
    value: 57,
    icon: "zap",
    color: "#10B981", // emerald
    trend: "up",
    trendValue: "+8",
    sparklineData: sparklinePresets.upSmall,
  },
  {
    label: "Hotspots",
    value: 142,
    icon: "target",
    color: "#F59E0B", // amber
    trend: "down",
    trendValue: "-12",
    sparklineData: sparklinePresets.downSmall,
  },
  {
    label: "AI Insights",
    value: 28,
    icon: "sparkles",
    color: "#8B5CF6", // violet
    trend: "up",
    trendValue: "+5",
    sparklineData: sparklinePresets.upLarge,
  },
];

// City-specific stats (can be expanded later)
export const cityStats: Record<string, StatCardData[]> = {
  amsterdam: dashboardStats,
  copenhagen: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: sparklinePresets.neutralStatic,
    },
    {
      label: "Quick Wins",
      value: 43,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+5",
      sparklineData: [35, 37, 38, 40, 41, 42, 43],
    },
    {
      label: "Hotspots",
      value: 98,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-8",
      sparklineData: sparklinePresets.downMedium,
    },
    {
      label: "AI Insights",
      value: 19,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+3",
      sparklineData: [14, 15, 16, 17, 17, 18, 19],
    },
  ],
  singapore: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: sparklinePresets.neutralStatic,
    },
    {
      label: "Quick Wins",
      value: 72,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+12",
      sparklineData: sparklinePresets.upMedium,
    },
    {
      label: "Hotspots",
      value: 186,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-23",
      sparklineData: sparklinePresets.downLarge,
    },
    {
      label: "AI Insights",
      value: 41,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+9",
      sparklineData: [32, 34, 36, 37, 39, 40, 41],
    },
  ],
  barcelona: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: [5, 5, 6, 6, 6, 6, 6],
    },
    {
      label: "Quick Wins",
      value: 61,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+7",
      sparklineData: [52, 54, 55, 57, 59, 60, 61],
    },
    {
      label: "Hotspots",
      value: 134,
      icon: "target",
      color: "#F59E0B",
      trend: "neutral",
      sparklineData: sparklinePresets.neutralSmall,
    },
    {
      label: "AI Insights",
      value: 33,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+4",
      sparklineData: [28, 29, 30, 31, 31, 32, 33],
    },
  ],
  melbourne: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: sparklinePresets.neutralStatic,
    },
    {
      label: "Quick Wins",
      value: 89,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+15",
      sparklineData: [72, 75, 78, 82, 85, 87, 89],
    },
    {
      label: "Hotspots",
      value: 201,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-18",
      sparklineData: [222, 218, 214, 210, 206, 203, 201],
    },
    {
      label: "AI Insights",
      value: 52,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+11",
      sparklineData: [40, 43, 45, 47, 49, 51, 52],
    },
  ],
};
