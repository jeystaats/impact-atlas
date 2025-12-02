export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics: ModuleMetric[];
  quickWinsCount: number;
  status: "active" | "coming-soon" | "beta";
}

export interface ModuleMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Hotspot {
  id: string;
  moduleId: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  aiInsights: AIInsight[];
  actions: QuickWin[];
}

export interface AIInsight {
  id: string;
  type: "observation" | "recommendation" | "warning" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  dataSource: string;
}

export interface QuickWin {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  estimatedCost?: string;
  estimatedBenefit?: string;
  priority: number;
}

export interface DataSource {
  id: string;
  name: string;
  logo?: string;
  description: string;
  url: string;
}
