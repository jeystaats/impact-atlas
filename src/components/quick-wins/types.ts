import { Id } from "../../../convex/_generated/dataModel";

export type ImpactLevel = "high" | "medium" | "low";
export type EffortLevel = "low" | "medium" | "high";

export interface NormalizedQuickWin {
  id: string;
  convexId?: Id<"quickWins">;
  title: string;
  description: string;
  moduleId: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  estimatedDays: number;
  tags: string[];
}

export interface NormalizedModule {
  id: string;
  title: string;
  color: string;
  quickWinsCount: number;
}

export interface QuickWinStats {
  total: number;
  highImpact: number;
  aiGenerated: number;
  completed: number;
}
