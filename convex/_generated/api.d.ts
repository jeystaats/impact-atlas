/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actionPlans from "../actionPlans.js";
import type * as activity from "../activity.js";
import type * as aiDirector from "../aiDirector.js";
import type * as aiInsights from "../aiInsights.js";
import type * as cities from "../cities.js";
import type * as cityOnboarding from "../cityOnboarding.js";
import type * as crons from "../crons.js";
import type * as hotspots from "../hotspots.js";
import type * as http from "../http.js";
import type * as model_auth from "../model/auth.js";
import type * as modules from "../modules.js";
import type * as quickWins from "../quickWins.js";
import type * as satelliteData from "../satelliteData.js";
import type * as seed from "../seed.js";
import type * as seed_cities from "../seed/cities.js";
import type * as seed_modules from "../seed/modules.js";
import type * as seed_quickWins from "../seed/quickWins.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actionPlans: typeof actionPlans;
  activity: typeof activity;
  aiDirector: typeof aiDirector;
  aiInsights: typeof aiInsights;
  cities: typeof cities;
  cityOnboarding: typeof cityOnboarding;
  crons: typeof crons;
  hotspots: typeof hotspots;
  http: typeof http;
  "model/auth": typeof model_auth;
  modules: typeof modules;
  quickWins: typeof quickWins;
  satelliteData: typeof satelliteData;
  seed: typeof seed;
  "seed/cities": typeof seed_cities;
  "seed/modules": typeof seed_modules;
  "seed/quickWins": typeof seed_quickWins;
  stats: typeof stats;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
