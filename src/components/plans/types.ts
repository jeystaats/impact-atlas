import { Id } from "../../../convex/_generated/dataModel";

export type PlanStatus = "draft" | "active" | "completed";

export interface LinkedModule {
  id: string;
  title: string;
  color: string;
}

export interface NormalizedActionPlan {
  id: string;
  convexId?: Id<"actionPlans">;
  title: string;
  description: string;
  status: PlanStatus;
  progress: number;
  dueDate: string;
  linkedModules: LinkedModule[];
  quickWinsCount: number;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export interface EditPlanData {
  id: Id<"actionPlans">;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  targetDate?: number;
  quickWinIds: Id<"quickWins">[];
  notes?: string;
}
