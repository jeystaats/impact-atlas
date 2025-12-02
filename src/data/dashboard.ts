import { StatCardData } from "@/components/dashboard/StatCard";

// Generate realistic-looking sparkline data
function generateSparklineData(
  trend: "up" | "down" | "neutral",
  baseValue: number,
  variance: number = 0.15
): number[] {
  const points = 7; // 7 days
  const data: number[] = [];

  let current = baseValue * (1 - variance);

  for (let i = 0; i < points; i++) {
    // Add some randomness
    const noise = (Math.random() - 0.5) * baseValue * variance * 0.5;

    // Apply trend
    if (trend === "up") {
      current += (baseValue * variance * 2) / points + noise;
    } else if (trend === "down") {
      current -= (baseValue * variance * 2) / points - noise;
    } else {
      current += noise;
    }

    data.push(Math.max(0, current));
  }

  return data;
}

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
    sparklineData: generateSparklineData("up", 50, 0.2),
  },
  {
    label: "Hotspots",
    value: 142,
    icon: "target",
    color: "#F59E0B", // amber
    trend: "down",
    trendValue: "-12",
    sparklineData: generateSparklineData("down", 150, 0.15),
  },
  {
    label: "AI Insights",
    value: 28,
    icon: "sparkles",
    color: "#8B5CF6", // violet
    trend: "up",
    trendValue: "+5",
    sparklineData: generateSparklineData("up", 25, 0.25),
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
      sparklineData: [6, 6, 6, 6, 6, 6, 6],
    },
    {
      label: "Quick Wins",
      value: 43,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+5",
      sparklineData: generateSparklineData("up", 40, 0.2),
    },
    {
      label: "Hotspots",
      value: 98,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-8",
      sparklineData: generateSparklineData("down", 105, 0.12),
    },
    {
      label: "AI Insights",
      value: 19,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+3",
      sparklineData: generateSparklineData("up", 18, 0.2),
    },
  ],
  singapore: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: [6, 6, 6, 6, 6, 6, 6],
    },
    {
      label: "Quick Wins",
      value: 72,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+12",
      sparklineData: generateSparklineData("up", 65, 0.18),
    },
    {
      label: "Hotspots",
      value: 186,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-23",
      sparklineData: generateSparklineData("down", 200, 0.15),
    },
    {
      label: "AI Insights",
      value: 41,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+9",
      sparklineData: generateSparklineData("up", 35, 0.22),
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
      sparklineData: generateSparklineData("up", 55, 0.2),
    },
    {
      label: "Hotspots",
      value: 134,
      icon: "target",
      color: "#F59E0B",
      trend: "neutral",
      sparklineData: generateSparklineData("neutral", 135, 0.08),
    },
    {
      label: "AI Insights",
      value: 33,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+4",
      sparklineData: generateSparklineData("up", 30, 0.2),
    },
  ],
  melbourne: [
    {
      label: "Active Modules",
      value: 6,
      icon: "dashboard",
      color: "#0D9488",
      trend: "neutral",
      sparklineData: [6, 6, 6, 6, 6, 6, 6],
    },
    {
      label: "Quick Wins",
      value: 89,
      icon: "zap",
      color: "#10B981",
      trend: "up",
      trendValue: "+15",
      sparklineData: generateSparklineData("up", 78, 0.2),
    },
    {
      label: "Hotspots",
      value: 201,
      icon: "target",
      color: "#F59E0B",
      trend: "down",
      trendValue: "-18",
      sparklineData: generateSparklineData("down", 215, 0.12),
    },
    {
      label: "AI Insights",
      value: 52,
      icon: "sparkles",
      color: "#8B5CF6",
      trend: "up",
      trendValue: "+11",
      sparklineData: generateSparklineData("up", 45, 0.25),
    },
  ],
};
