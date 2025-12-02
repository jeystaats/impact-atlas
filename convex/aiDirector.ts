import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Module definitions with AI generation prompts
const MODULE_CONFIGS = {
  "urban-heat": {
    name: "Urban Heat",
    systemPrompt: `You are an expert on urban heat islands and tree equity. Generate realistic hotspot data for cities.
For each hotspot, include:
- A specific neighborhood or district name (use real names for the city)
- Temperature anomaly in °C (typically +2 to +8°C above baseline)
- Surface type (asphalt, concrete, industrial, parking)
- Nearby landmarks or cross-streets
- Tree canopy coverage percentage (typically 5-40%)

Generate data that reflects real urban heat patterns:
- Industrial areas and parking lots are hottest
- Areas near water or parks are cooler
- Downtown centers often have heat islands
- Low-income neighborhoods often have less tree cover`,
    quickWinPrompt: `Suggest practical quick wins to reduce urban heat:
- Tree planting locations
- Cool roof installations
- Shade structure placement
- Parking lot greening
- Community cooling centers

Each quick win should be achievable in 1-6 months with low to medium budget.`,
  },
  "coastal-plastic": {
    name: "Coastal Plastic",
    systemPrompt: `You are an expert on coastal plastic pollution and marine debris. Generate realistic hotspot data.
For each hotspot, include:
- Specific beach, harbor, or waterway name (use real names)
- Estimated plastic accumulation rate (kg/week)
- Primary plastic types (bottles, bags, microplastics, fishing gear)
- Source indicators (river outflow, maritime, local dumping)
- Tidal patterns affecting accumulation

Generate data reflecting real coastal plastic patterns:
- River mouths and estuaries accumulate more debris
- Popular beaches have more consumer waste
- Harbors have more industrial and fishing-related plastic
- Currents and wind affect where plastic accumulates`,
    quickWinPrompt: `Suggest practical quick wins to address coastal plastic:
- Beach cleanup organization points
- Trash trap installation locations
- Public awareness campaign areas
- Waste bin placement optimization
- Fishing net collection programs

Each quick win should be achievable in 1-6 months with measurable impact.`,
  },
  "ocean-plastic": {
    name: "Ocean Plastic",
    systemPrompt: `You are an expert on ocean plastic classification and tracking. Generate realistic debris monitoring data.
For each hotspot, include:
- Coastal area or offshore zone name
- Debris density (items per km²)
- Composition breakdown (percentage by type)
- Movement patterns (where debris is heading)
- Seasonal variation notes

Focus on classifiable debris that citizen science can track.`,
    quickWinPrompt: `Suggest citizen science and classification quick wins:
- Monitoring station locations
- App-based reporting zones
- School partnership opportunities
- Volunteer coordination points
- Data collection protocols`,
  },
  "port-emissions": {
    name: "Port Emissions",
    systemPrompt: `You are an expert on maritime emissions and port air quality. Generate realistic emissions data.
For each hotspot, include:
- Specific berth, terminal, or anchorage name
- Estimated daily emissions (tons CO2, NOx, SOx, PM2.5)
- Vessel types typically present (container, tanker, cruise, bulk)
- Peak emission times
- Wind patterns affecting dispersion

Generate data reflecting real port emission patterns:
- Anchorages have ships idling for extended periods
- Container terminals have crane and truck emissions
- Cruise terminals have peak loads during embarkation
- Tanker berths have vapor emissions`,
    quickWinPrompt: `Suggest practical quick wins to reduce port emissions:
- Shore power connection priorities
- Vessel speed reduction zones
- Electric equipment upgrades
- Monitoring station placements
- Green shipping lane designations

Focus on actions achievable within 6 months.`,
  },
  "biodiversity": {
    name: "Biodiversity",
    systemPrompt: `You are an expert on urban biodiversity and ecological corridors. Generate realistic biodiversity opportunity data.
For each hotspot, include:
- Specific park, vacant lot, or green space name
- Current biodiversity score (1-10)
- Key species present or missing
- Connectivity to other green spaces
- Improvement potential

Focus on urban wildlife habitat opportunities:
- Pollinator corridors along streets
- Bird nesting sites on buildings
- Pond and wetland creation spots
- Native plant restoration areas`,
    quickWinPrompt: `Suggest biodiversity enhancement quick wins:
- Native plant garden locations
- Bee hotel and bird box placements
- Green roof opportunities
- Wildlife corridor connections
- Invasive species removal priorities

Each action should show results within one growing season.`,
  },
  "restoration": {
    name: "Restoration",
    systemPrompt: `You are an expert on ecological restoration and land recovery. Generate realistic restoration opportunity data.
For each hotspot, include:
- Specific site name (brownfield, degraded park, vacant lot)
- Current condition assessment
- Restoration potential (1-10)
- Estimated restoration cost range
- Timeline for visible improvement

Focus on realistic urban restoration opportunities:
- Brownfield remediation sites
- Degraded wetlands
- Abandoned industrial land
- Neglected urban parks
- Streambank restoration zones`,
    quickWinPrompt: `Suggest land restoration quick wins:
- Community garden conversions
- Native meadow seeding areas
- Stream daylighting opportunities
- Soil remediation priorities
- Tree planting zones

Focus on sites where visible improvement is possible within 6 months.`,
  },
};

// Generate structured JSON schema for hotspots
const HOTSPOT_SCHEMA = {
  type: "object",
  properties: {
    hotspots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Descriptive name for the hotspot" },
          description: { type: "string", description: "2-3 sentence description" },
          neighborhood: { type: "string", description: "Real neighborhood or district name" },
          address: { type: "string", description: "Street or landmark reference" },
          latOffset: { type: "number", description: "Latitude offset from city center (-0.05 to 0.05)" },
          lngOffset: { type: "number", description: "Longitude offset from city center (-0.05 to 0.05)" },
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          displayValue: { type: "string", description: "Key metric display (e.g., '+5.2°C', '450 kg/week')" },
          metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "number" },
                unit: { type: "string" },
                trend: { type: "string", enum: ["up", "down", "stable"] },
              },
              required: ["key", "value"],
            },
          },
        },
        required: ["name", "description", "neighborhood", "latOffset", "lngOffset", "severity", "displayValue"],
      },
    },
  },
  required: ["hotspots"],
};

const QUICK_WIN_SCHEMA = {
  type: "object",
  properties: {
    quickWins: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Action-oriented title" },
          description: { type: "string", description: "2-3 sentence description with specific location" },
          impact: { type: "string", enum: ["low", "medium", "high"] },
          effort: { type: "string", enum: ["low", "medium", "high"] },
          estimatedDays: { type: "number", description: "Days to implement (7-180)" },
          co2ReductionTons: { type: "number", description: "Estimated annual CO2 reduction" },
          tags: { type: "array", items: { type: "string" } },
          steps: { type: "array", items: { type: "string" }, description: "3-5 implementation steps" },
        },
        required: ["title", "description", "impact", "effort", "estimatedDays", "tags"],
      },
    },
  },
  required: ["quickWins"],
};

// Internal query to get module by slug
export const getModuleBySlug = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modules")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// Internal mutation to create onboarding record
export const createOnboarding = internalMutation({
  args: {
    cityId: v.id("cities"),
  },
  handler: async (ctx, args) => {
    const moduleProgress = Object.keys(MODULE_CONFIGS).map((slug) => ({
      moduleSlug: slug,
      status: "pending" as const,
      hotspotsCreated: 0,
      quickWinsCreated: 0,
    }));

    return await ctx.db.insert("cityOnboarding", {
      cityId: args.cityId,
      status: "generating",
      currentStage: "locating",
      currentStageLabel: "Locating city data...",
      progress: 0,
      moduleProgress,
      startedAt: Date.now(),
    });
  },
});

// Internal mutation to update onboarding progress
export const updateOnboardingProgress = internalMutation({
  args: {
    onboardingId: v.id("cityOnboarding"),
    currentStage: v.string(),
    currentStageLabel: v.string(),
    progress: v.number(),
    moduleSlug: v.optional(v.string()),
    moduleStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    hotspotsCreated: v.optional(v.number()),
    quickWinsCreated: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const onboarding = await ctx.db.get(args.onboardingId);
    if (!onboarding) return;

    let moduleProgress = onboarding.moduleProgress;

    if (args.moduleSlug && args.moduleStatus) {
      moduleProgress = moduleProgress.map((m) =>
        m.moduleSlug === args.moduleSlug
          ? {
              ...m,
              status: args.moduleStatus!,
              hotspotsCreated: args.hotspotsCreated ?? m.hotspotsCreated,
              quickWinsCreated: args.quickWinsCreated ?? m.quickWinsCreated,
              error: args.error,
            }
          : m
      );
    }

    await ctx.db.patch(args.onboardingId, {
      currentStage: args.currentStage,
      currentStageLabel: args.currentStageLabel,
      progress: args.progress,
      moduleProgress,
    });
  },
});

// Internal mutation to complete onboarding
export const completeOnboarding = internalMutation({
  args: {
    onboardingId: v.id("cityOnboarding"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.onboardingId, {
      status: args.status,
      completedAt: Date.now(),
      error: args.error,
    });
  },
});

// Internal mutation to insert hotspots
export const insertHotspots = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    hotspots: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        coordinates: v.object({ lat: v.number(), lng: v.number() }),
        address: v.optional(v.string()),
        neighborhood: v.optional(v.string()),
        severity: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
          v.literal("critical")
        ),
        displayValue: v.optional(v.string()),
        metrics: v.array(
          v.object({
            key: v.string(),
            value: v.number(),
            unit: v.optional(v.string()),
            trend: v.optional(
              v.union(v.literal("up"), v.literal("down"), v.literal("stable"))
            ),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids: Id<"hotspots">[] = [];

    for (const hotspot of args.hotspots) {
      const id = await ctx.db.insert("hotspots", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        name: hotspot.name,
        description: hotspot.description,
        coordinates: hotspot.coordinates,
        address: hotspot.address,
        neighborhood: hotspot.neighborhood,
        severity: hotspot.severity,
        status: "active",
        metrics: hotspot.metrics,
        displayValue: hotspot.displayValue,
        detectedAt: now,
        lastUpdated: now,
        createdAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal mutation to insert quick wins
export const insertQuickWins = internalMutation({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    quickWins: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        effort: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        estimatedDays: v.optional(v.number()),
        co2ReductionTons: v.optional(v.number()),
        tags: v.array(v.string()),
        steps: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids: Id<"quickWins">[] = [];

    for (let i = 0; i < args.quickWins.length; i++) {
      const qw = args.quickWins[i];
      const id = await ctx.db.insert("quickWins", {
        cityId: args.cityId,
        moduleId: args.moduleId,
        title: qw.title,
        description: qw.description,
        impact: qw.impact,
        effort: qw.effort,
        estimatedDays: qw.estimatedDays,
        co2ReductionTons: qw.co2ReductionTons,
        tags: [...qw.tags, "ai-generated"],
        steps: qw.steps,
        sortOrder: i,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});

// Internal mutation to update city stats
export const updateCityStats = internalMutation({
  args: { cityId: v.id("cities") },
  handler: async (ctx, args) => {
    // Count hotspots
    const hotspots = await ctx.db
      .query("hotspots")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .collect();

    // Count quick wins
    const quickWins = await ctx.db
      .query("quickWins")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Count active modules (modules with hotspots)
    const moduleIds = new Set(hotspots.map((h) => h.moduleId.toString()));

    await ctx.db.patch(args.cityId, {
      stats: {
        totalHotspots: hotspots.length,
        totalQuickWins: quickWins.length,
        activeModules: moduleIds.size,
        completedQuickWins: 0,
        activeActionPlans: 0,
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Main action: Generate all data for a new city
 */
export const generateCityData = action({
  args: {
    cityId: v.id("cities"),
    cityName: v.string(),
    country: v.string(),
    coordinates: v.object({ lat: v.number(), lng: v.number() }),
    population: v.number(),
    // User preferences
    temperatureUnit: v.optional(v.union(v.literal("celsius"), v.literal("fahrenheit"))),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const tempUnit = args.temperatureUnit || "celsius";
    // Create onboarding record first - always do this so the UI can show progress
    const onboardingId = await ctx.runMutation(internal.aiDirector.createOnboarding, {
      cityId: args.cityId,
    });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      // Mark onboarding as failed with clear error
      await ctx.runMutation(internal.aiDirector.completeOnboarding, {
        onboardingId,
        status: "failed",
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY in Convex environment variables.",
      });
      return { success: false, error: "OpenAI API key not configured" };
    }

    const modules = Object.keys(MODULE_CONFIGS) as Array<keyof typeof MODULE_CONFIGS>;
    const progressPerModule = 90 / modules.length; // Save 10% for final steps

    try {
      for (let i = 0; i < modules.length; i++) {
        const moduleSlug = modules[i];
        const moduleConfig = MODULE_CONFIGS[moduleSlug];

        // Update progress: starting this module
        await ctx.runMutation(internal.aiDirector.updateOnboardingProgress, {
          onboardingId,
          currentStage: moduleSlug,
          currentStageLabel: `Analyzing ${moduleConfig.name.toLowerCase()} patterns...`,
          progress: Math.round(5 + i * progressPerModule),
          moduleSlug,
          moduleStatus: "generating",
        });

        // Get module from database
        const module = await ctx.runQuery(internal.aiDirector.getModuleBySlug, {
          slug: moduleSlug,
        });

        if (!module) {
          console.error(`[AI Director] ERROR: Module "${moduleSlug}" not found in database!`);
          console.error(`[AI Director] Run 'npx convex run seed:seedModules' to seed modules.`);
          // Mark as failed with clear message
          await ctx.runMutation(internal.aiDirector.updateOnboardingProgress, {
            onboardingId,
            currentStage: moduleSlug,
            currentStageLabel: `Module ${moduleSlug} not found`,
            progress: Math.round(5 + (i + 1) * progressPerModule),
            moduleSlug,
            moduleStatus: "failed",
            error: `Module "${moduleSlug}" not in database. Run seedModules.`,
          });
          continue;
        }

        try {
          // Generate hotspots
          const hotspots = await generateHotspotsWithAI(
            OPENAI_API_KEY,
            args.cityName,
            args.country,
            args.coordinates,
            args.population,
            moduleSlug,
            moduleConfig,
            tempUnit
          );

          // Insert hotspots
          if (hotspots.length > 0) {
            await ctx.runMutation(internal.aiDirector.insertHotspots, {
              cityId: args.cityId,
              moduleId: module._id,
              hotspots: hotspots.map((h) => ({
                name: h.name,
                description: h.description,
                coordinates: {
                  lat: args.coordinates.lat + (h.latOffset || 0),
                  lng: args.coordinates.lng + (h.lngOffset || 0),
                },
                address: h.address,
                neighborhood: h.neighborhood,
                severity: h.severity,
                displayValue: h.displayValue,
                metrics: h.metrics || [],
              })),
            });
          }

          // Generate quick wins
          const quickWins = await generateQuickWinsWithAI(
            OPENAI_API_KEY,
            args.cityName,
            args.country,
            moduleSlug,
            moduleConfig
          );

          // Insert quick wins
          if (quickWins.length > 0) {
            await ctx.runMutation(internal.aiDirector.insertQuickWins, {
              cityId: args.cityId,
              moduleId: module._id,
              quickWins: quickWins.map((qw) => ({
                title: qw.title,
                description: qw.description,
                impact: qw.impact as "low" | "medium" | "high",
                effort: qw.effort as "low" | "medium" | "high",
                estimatedDays: qw.estimatedDays,
                co2ReductionTons: qw.co2ReductionTons,
                tags: qw.tags || [moduleSlug],
                steps: qw.steps,
              })),
            });
          }

          // Update progress: completed this module
          await ctx.runMutation(internal.aiDirector.updateOnboardingProgress, {
            onboardingId,
            currentStage: moduleSlug,
            currentStageLabel: `${moduleConfig.name} analysis complete`,
            progress: Math.round(5 + (i + 1) * progressPerModule),
            moduleSlug,
            moduleStatus: "completed",
            hotspotsCreated: hotspots.length,
            quickWinsCreated: quickWins.length,
          });
        } catch (moduleError) {
          console.error(`Error generating data for ${moduleSlug}:`, moduleError);

          // Mark module as failed but continue
          await ctx.runMutation(internal.aiDirector.updateOnboardingProgress, {
            onboardingId,
            currentStage: moduleSlug,
            currentStageLabel: `${moduleConfig.name} analysis failed`,
            progress: Math.round(5 + (i + 1) * progressPerModule),
            moduleSlug,
            moduleStatus: "failed",
            error: moduleError instanceof Error ? moduleError.message : "Unknown error",
          });
        }
      }

      // Update city stats
      await ctx.runMutation(internal.aiDirector.updateOnboardingProgress, {
        onboardingId,
        currentStage: "insights",
        currentStageLabel: "Finalizing city data...",
        progress: 95,
      });

      await ctx.runMutation(internal.aiDirector.updateCityStats, {
        cityId: args.cityId,
      });

      // Complete onboarding
      await ctx.runMutation(internal.aiDirector.completeOnboarding, {
        onboardingId,
        status: "completed",
      });

      return { success: true };
    } catch (error) {
      console.error("Error generating city data:", error);

      await ctx.runMutation(internal.aiDirector.completeOnboarding, {
        onboardingId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Helper function to call OpenAI for hotspots
async function generateHotspotsWithAI(
  apiKey: string,
  cityName: string,
  country: string,
  coordinates: { lat: number; lng: number },
  population: number,
  moduleSlug: string,
  moduleConfig: { name: string; systemPrompt: string },
  temperatureUnit: "celsius" | "fahrenheit" = "celsius"
): Promise<Array<{
  name: string;
  description: string;
  neighborhood: string;
  address?: string;
  latOffset: number;
  lngOffset: number;
  severity: "low" | "medium" | "high" | "critical";
  displayValue: string;
  metrics?: Array<{ key: string; value: number; unit?: string; trend?: "up" | "down" | "stable" }>;
}>> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: moduleConfig.systemPrompt,
        },
        {
          role: "user",
          content: `Generate 4-6 realistic ${moduleConfig.name.toLowerCase()} hotspots for ${cityName}, ${country}.

City info:
- Population: ${population.toLocaleString()}
- Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}
- Temperature unit preference: ${temperatureUnit === "fahrenheit" ? "Fahrenheit (°F)" : "Celsius (°C)"}

Module context for ${moduleConfig.name}:
${moduleSlug === "urban-heat" ? `- Focus on heat islands, lack of tree cover, industrial zones
- Use ${temperatureUnit === "fahrenheit" ? "°F" : "°C"} for temperature differences
- Typical range: ${temperatureUnit === "fahrenheit" ? "+3.6°F to +14.4°F" : "+2°C to +8°C"} above baseline` : ""}
${moduleSlug === "coastal-plastic" ? "- Focus on beaches, harbors, river mouths\n- Measure plastic accumulation in kg/week\n- Consider tourism, fishing, urban runoff sources" : ""}
${moduleSlug === "ocean-plastic" ? "- Focus on offshore areas, current patterns\n- Measure debris density in items/km²\n- Track movement patterns and sources" : ""}
${moduleSlug === "port-emissions" ? "- Focus on terminals, berths, anchorages\n- Measure emissions in tons CO₂/day\n- Consider vessel types and idling patterns" : ""}
${moduleSlug === "biodiversity" ? "- Focus on parks, green spaces, corridors\n- Use biodiversity score scale (1-10)\n- Consider habitat connectivity and species" : ""}
${moduleSlug === "restoration" ? "- Focus on brownfields, degraded areas, vacant lots\n- Use restoration potential score (1-10)\n- Consider remediation needs and community impact" : ""}

Use REAL neighborhood names, streets, and landmarks from ${cityName}.
Generate realistic severity levels (mix of low, medium, high, with 1-2 critical if appropriate).
Use latOffset and lngOffset between -0.04 and 0.04 to spread hotspots around the city center.

Return JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Could not read error body");
    console.error(`[AI Director] OpenAI API error for hotspots:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      module: moduleSlug,
      city: cityName,
    });
    throw new Error(`OpenAI API error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.error(`[AI Director] Empty OpenAI response for hotspots:`, {
      module: moduleSlug,
      city: cityName,
      response: JSON.stringify(data).slice(0, 500),
    });
    throw new Error("No content in OpenAI response");
  }

  try {
    const parsed = JSON.parse(content);
    const hotspots = parsed.hotspots || [];

    // Validate and sanitize each hotspot
    return hotspots
      .filter((h: Record<string, unknown>) => h.name) // Must have a name
      .map((h: Record<string, unknown>) => ({
        name: String(h.name || "Unknown Hotspot"),
        description: String(h.description || `${moduleConfig.name} hotspot detected in ${cityName}`),
        neighborhood: String(h.neighborhood || "City Center"),
        address: h.address ? String(h.address) : undefined,
        latOffset: Number(h.latOffset) || (Math.random() - 0.5) * 0.04,
        lngOffset: Number(h.lngOffset) || (Math.random() - 0.5) * 0.04,
        severity: (["low", "medium", "high", "critical"].includes(String(h.severity))
          ? String(h.severity)
          : "medium") as "low" | "medium" | "high" | "critical",
        displayValue: String(h.displayValue || ""),
        metrics: Array.isArray(h.metrics) ? h.metrics : [],
      }));
  } catch (parseError) {
    console.error(`[AI Director] Failed to parse hotspots JSON:`, {
      module: moduleSlug,
      city: cityName,
      error: parseError instanceof Error ? parseError.message : "Unknown parse error",
      content: content.slice(0, 500),
    });
    return [];
  }
}

// Helper function to call OpenAI for quick wins
async function generateQuickWinsWithAI(
  apiKey: string,
  cityName: string,
  country: string,
  moduleSlug: string,
  moduleConfig: { name: string; quickWinPrompt: string }
): Promise<Array<{
  title: string;
  description: string;
  impact: string;
  effort: string;
  estimatedDays?: number;
  co2ReductionTons?: number;
  tags?: string[];
  steps?: string[];
}>> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: moduleConfig.quickWinPrompt,
        },
        {
          role: "user",
          content: `Generate 3-4 practical quick wins for ${moduleConfig.name.toLowerCase()} improvements in ${cityName}, ${country}.

Module context for ${moduleConfig.name}:
${moduleSlug === "urban-heat" ? "- Focus on tree planting, cool roofs, shade structures, parking lot greening\n- Prioritize low-income and underserved neighborhoods\n- Consider existing green spaces that can be enhanced" : ""}
${moduleSlug === "coastal-plastic" ? "- Focus on beach cleanups, trash traps, waste bin placement, awareness campaigns\n- Partner with schools, NGOs, local businesses\n- Address both visible litter and microplastics" : ""}
${moduleSlug === "ocean-plastic" ? "- Focus on monitoring stations, citizen science, data collection\n- Partner with research institutions and volunteers\n- Establish tracking and classification protocols" : ""}
${moduleSlug === "port-emissions" ? "- Focus on shore power, speed reduction zones, electric equipment\n- Work with port authority and shipping companies\n- Prioritize high-traffic berths and terminals" : ""}
${moduleSlug === "biodiversity" ? "- Focus on native plants, pollinator corridors, green roofs, wildlife habitats\n- Connect isolated green spaces\n- Remove invasive species and add nesting sites" : ""}
${moduleSlug === "restoration" ? "- Focus on community gardens, native meadows, stream restoration\n- Prioritize sites with high visibility and community engagement\n- Consider soil remediation where needed" : ""}

Each quick win should:
- Reference specific locations and neighborhoods in ${cityName}
- Be achievable in 1-6 months
- Have clear, measurable outcomes
- Include 3-5 implementation steps

Balance the impact/effort matrix (not all high impact).

Return JSON with a "quickWins" array.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Could not read error body");
    console.error(`[AI Director] OpenAI API error for quick wins:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      module: moduleSlug,
      city: cityName,
    });
    throw new Error(`OpenAI API error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    console.error(`[AI Director] Empty OpenAI response for quick wins:`, {
      module: moduleSlug,
      city: cityName,
      response: JSON.stringify(data).slice(0, 500),
    });
    throw new Error("No content in OpenAI response");
  }

  try {
    const parsed = JSON.parse(content);
    const quickWins = parsed.quickWins || [];

    // Validate and sanitize each quick win
    return quickWins
      .filter((qw: Record<string, unknown>) => qw.title) // Must have a title
      .map((qw: Record<string, unknown>) => ({
        title: String(qw.title || "Untitled Quick Win"),
        description: String(qw.description || `${moduleConfig.name} improvement opportunity in ${cityName}`),
        impact: (["low", "medium", "high"].includes(String(qw.impact))
          ? String(qw.impact)
          : "medium"),
        effort: (["low", "medium", "high"].includes(String(qw.effort))
          ? String(qw.effort)
          : "medium"),
        estimatedDays: typeof qw.estimatedDays === "number" ? qw.estimatedDays : 30,
        co2ReductionTons: typeof qw.co2ReductionTons === "number" ? qw.co2ReductionTons : undefined,
        tags: Array.isArray(qw.tags) ? qw.tags.map(String) : [moduleSlug],
        steps: Array.isArray(qw.steps) ? qw.steps.map(String) : undefined,
      }));
  } catch (parseError) {
    console.error(`[AI Director] Failed to parse quick wins JSON:`, {
      module: moduleSlug,
      city: cityName,
      error: parseError instanceof Error ? parseError.message : "Unknown parse error",
      content: content.slice(0, 500),
    });
    return [];
  }
}
