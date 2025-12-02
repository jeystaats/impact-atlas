import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS
  // ============================================
  users: defineTable({
    // Clerk integration
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // Role and permissions
    role: v.union(v.literal("user"), v.literal("admin"), v.literal("analyst")),

    // User preferences
    preferences: v.object({
      defaultCityId: v.optional(v.id("cities")),
      favoriteModules: v.array(v.string()),
      notificationsEnabled: v.boolean(),
    }),

    // Onboarding
    onboardingCompleted: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ============================================
  // CITIES
  // ============================================
  cities: defineTable({
    // Identification
    slug: v.string(), // "amsterdam", "copenhagen", etc.
    name: v.string(),
    country: v.string(),
    region: v.optional(v.string()),

    // Location
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),

    // City info
    population: v.number(),
    area: v.optional(v.number()), // km²
    climateZone: v.optional(v.string()),
    timezone: v.optional(v.string()),

    // Display
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),

    // Aggregated stats (updated periodically)
    stats: v.object({
      totalHotspots: v.number(),
      totalQuickWins: v.number(),
      activeModules: v.number(),
      completedQuickWins: v.number(),
      activeActionPlans: v.number(),
    }),

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // ============================================
  // MODULES
  // ============================================
  modules: defineTable({
    // Identification
    slug: v.string(), // "urban-heat", "coastal-plastic", etc.
    name: v.string(),
    description: v.string(),

    // Categorization
    category: v.union(
      v.literal("pollution"),
      v.literal("climate"),
      v.literal("ecosystem")
    ),

    // Display
    icon: v.string(),
    color: v.string(), // hex color
    gradient: v.optional(v.string()), // gradient CSS

    // Module metrics definition
    metrics: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        unit: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),

    // Data source info
    dataSourceInfo: v.optional(v.string()),
    dataSourceUrl: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("beta"),
      v.literal("coming-soon")
    ),
    isActive: v.boolean(),
    sortOrder: v.number(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active_order", ["isActive", "sortOrder"]),

  // ============================================
  // HOTSPOTS
  // ============================================
  hotspots: defineTable({
    // References
    cityId: v.id("cities"),
    moduleId: v.id("modules"),

    // Identification
    name: v.string(),
    description: v.string(),

    // Location
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    address: v.optional(v.string()),
    neighborhood: v.optional(v.string()),

    // Severity and status
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("monitoring"),
      v.literal("resolved")
    ),

    // Metrics (module-specific values)
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

    // Display value (e.g., "+5.2°C", "2,400 kg/week")
    displayValue: v.optional(v.string()),

    // Media
    imageUrl: v.optional(v.string()),

    // Additional data
    metadata: v.optional(v.any()),

    // Timestamps
    detectedAt: v.number(),
    lastUpdated: v.number(),
    createdAt: v.number(),
  })
    .index("by_city", ["cityId"])
    .index("by_module", ["moduleId"])
    .index("by_city_module", ["cityId", "moduleId"])
    .index("by_city_severity", ["cityId", "severity"])
    .index("by_status", ["status"]),

  // ============================================
  // QUICK WINS
  // ============================================
  quickWins: defineTable({
    // References
    cityId: v.optional(v.id("cities")), // Optional: can be city-agnostic
    moduleId: v.id("modules"),
    hotspotId: v.optional(v.id("hotspots")), // Optional: linked to specific hotspot

    // Content
    title: v.string(),
    description: v.string(),

    // Impact assessment
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    effort: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),

    // Estimates
    estimatedCost: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
        currency: v.string(),
      })
    ),
    estimatedTimeWeeks: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      })
    ),
    estimatedDays: v.optional(v.number()), // Simple estimate in days

    // Environmental impact
    co2ReductionTons: v.optional(v.number()),
    treesEquivalent: v.optional(v.number()),

    // Categorization
    category: v.optional(v.string()),
    tags: v.array(v.string()),

    // Implementation details
    steps: v.optional(v.array(v.string())),
    resources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
        })
      )
    ),

    // Priority and ordering
    priority: v.optional(v.number()),
    sortOrder: v.number(),

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_city", ["cityId"])
    .index("by_module", ["moduleId"])
    .index("by_city_module", ["cityId", "moduleId"])
    .index("by_city_impact", ["cityId", "impact"])
    .index("by_module_impact", ["moduleId", "impact"])
    .index("by_hotspot", ["hotspotId"])
    .index("by_active", ["isActive"]),

  // ============================================
  // ACTION PLANS
  // ============================================
  actionPlans: defineTable({
    // Owner
    userId: v.id("users"),
    cityId: v.id("cities"),

    // Content
    title: v.string(),
    description: v.optional(v.string()),

    // Status and progress
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    progress: v.number(), // 0-100

    // Priority
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),

    // Linked items
    quickWinIds: v.array(v.id("quickWins")),
    moduleIds: v.array(v.string()), // Module slugs for filtering

    // Timeline
    targetDate: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    // Budget tracking
    budget: v.optional(
      v.object({
        allocated: v.number(),
        spent: v.number(),
        currency: v.string(),
      })
    ),

    // Collaboration
    collaboratorIds: v.optional(v.array(v.id("users"))),

    // Notes
    notes: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_city", ["cityId"])
    .index("by_user_city", ["userId", "cityId"]),

  // ============================================
  // USER COMPLETED WINS
  // ============================================
  userCompletedWins: defineTable({
    // References
    userId: v.id("users"),
    quickWinId: v.id("quickWins"),
    actionPlanId: v.optional(v.id("actionPlans")),

    // Completion details
    completedAt: v.number(),
    notes: v.optional(v.string()),

    // Actual results (vs estimates)
    actualCost: v.optional(v.number()),
    actualTimeWeeks: v.optional(v.number()),

    // Feedback
    rating: v.optional(v.number()), // 1-5
    feedback: v.optional(v.string()),

    // Evidence
    evidenceUrls: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_quick_win", ["quickWinId"])
    .index("by_user_quick_win", ["userId", "quickWinId"])
    .index("by_action_plan", ["actionPlanId"])
    .index("by_user_completed_at", ["userId", "completedAt"]),

  // ============================================
  // AI INSIGHTS
  // ============================================
  aiInsights: defineTable({
    // Reference
    hotspotId: v.id("hotspots"),

    // Content
    type: v.union(
      v.literal("recommendation"),
      v.literal("prediction"),
      v.literal("analysis"),
      v.literal("alert"),
      v.literal("opportunity")
    ),
    title: v.string(),
    content: v.string(),

    // Confidence and priority
    confidence: v.number(), // 0-1
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),

    // Related items
    relatedQuickWinIds: v.optional(v.array(v.id("quickWins"))),

    // Metadata
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        sources: v.optional(v.array(v.string())),
        generationParams: v.optional(v.any()),
      })
    ),

    // Lifecycle
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),

    // Timestamps
    generatedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_hotspot", ["hotspotId"])
    .index("by_hotspot_type", ["hotspotId", "type"])
    .index("by_priority", ["priority"])
    .index("by_active", ["isActive", "generatedAt"]),

  // ============================================
  // DASHBOARD STATS
  // ============================================
  dashboardStats: defineTable({
    // Scope
    cityId: v.id("cities"),
    moduleId: v.optional(v.id("modules")), // Optional: city-wide or module-specific

    // Time period
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    periodStart: v.number(), // Start of period timestamp

    // Metrics
    metrics: v.object({
      hotspotsDetected: v.number(),
      hotspotsResolved: v.number(),
      quickWinsCompleted: v.number(),
      actionPlansCreated: v.number(),
      actionPlansCompleted: v.number(),
      activeUsers: v.number(),
      co2Reduced: v.optional(v.number()),
    }),

    // Trends (compared to previous period)
    trends: v.optional(
      v.object({
        hotspotsDetected: v.optional(
          v.union(v.literal("up"), v.literal("down"), v.literal("stable"))
        ),
        hotspotsResolved: v.optional(
          v.union(v.literal("up"), v.literal("down"), v.literal("stable"))
        ),
        quickWinsCompleted: v.optional(
          v.union(v.literal("up"), v.literal("down"), v.literal("stable"))
        ),
      })
    ),

    // Sparkline data (7 data points)
    sparklineData: v.optional(v.array(v.number())),

    // Timestamps
    generatedAt: v.number(),
  })
    .index("by_city_period", ["cityId", "period"])
    .index("by_city_date", ["cityId", "periodStart"])
    .index("by_city_module_period", ["cityId", "moduleId", "period"]),

  // ============================================
  // CHAT MESSAGES
  // ============================================
  chatMessages: defineTable({
    // Owner
    userId: v.id("users"),
    sessionId: v.string(), // Group messages into conversations

    // Message
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),

    // Context (what was the user looking at)
    context: v.optional(
      v.object({
        cityId: v.optional(v.id("cities")),
        moduleId: v.optional(v.id("modules")),
        hotspotId: v.optional(v.id("hotspots")),
        pageUrl: v.optional(v.string()),
      })
    ),

    // Metadata
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokensUsed: v.optional(v.number()),
        latencyMs: v.optional(v.number()),
      })
    ),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_user_session", ["userId", "sessionId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ============================================
  // CITY ONBOARDING (tracks AI data generation progress)
  // ============================================
  cityOnboarding: defineTable({
    // Reference
    cityId: v.id("cities"),

    // Overall status
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),

    // Current stage for display
    currentStage: v.string(), // "locating", "urban-heat", "coastal-plastic", etc.
    currentStageLabel: v.string(), // "Scanning urban heat patterns..."

    // Overall progress (0-100)
    progress: v.number(),

    // Per-module status
    moduleProgress: v.array(
      v.object({
        moduleSlug: v.string(),
        status: v.union(
          v.literal("pending"),
          v.literal("generating"),
          v.literal("completed"),
          v.literal("failed")
        ),
        hotspotsCreated: v.number(),
        quickWinsCreated: v.number(),
        error: v.optional(v.string()),
      })
    ),

    // Error tracking
    error: v.optional(v.string()),

    // Who initiated
    initiatedBy: v.optional(v.string()), // user ID or "system"

    // Timestamps
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_city", ["cityId"])
    .index("by_status", ["status"]),

  // ============================================
  // SATELLITE DATA (Real-time environmental measurements)
  // ============================================
  satelliteData: defineTable({
    // Geographic reference
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    hotspotId: v.optional(v.id("hotspots")),

    // Location
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    boundingBox: v.optional(
      v.object({
        north: v.number(),
        south: v.number(),
        east: v.number(),
        west: v.number(),
      })
    ),

    // Data source
    dataSourceSlug: v.string(), // "sentinel-5p", "sentinel-3", etc.
    satelliteId: v.string(), // e.g., "S5P_NRTI_L2__NO2"
    productType: v.string(), // e.g., "NO2", "SO2", "LST"

    // Measurements
    measurements: v.array(
      v.object({
        key: v.string(), // e.g., "NO2_column_density"
        value: v.number(),
        unit: v.string(), // e.g., "mol/m²", "µg/m³"
        qualityFlag: v.optional(v.number()), // 0-100 quality percentage
      })
    ),

    // Processing info
    processingLevel: v.optional(v.string()), // "L2", "L3", etc.
    cloudCoverage: v.optional(v.number()), // 0-100 percentage

    // Time
    measurementDate: v.number(), // When satellite captured data
    ingestionDate: v.number(), // When we fetched it

    // Raw reference (for debugging/auditing)
    sourceUrl: v.optional(v.string()),
    rawMetadata: v.optional(v.any()),
  })
    .index("by_city", ["cityId"])
    .index("by_city_module", ["cityId", "moduleId"])
    .index("by_hotspot", ["hotspotId"])
    .index("by_measurement_date", ["measurementDate"])
    .index("by_city_date", ["cityId", "measurementDate"])
    .index("by_source", ["dataSourceSlug", "measurementDate"]),

  // ============================================
  // DATA INGESTION LOG (Track satellite data fetches)
  // ============================================
  dataIngestionLog: defineTable({
    // What was fetched
    dataSourceSlug: v.string(),
    cityId: v.id("cities"),
    moduleId: v.optional(v.id("modules")),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),

    // Results
    recordsFetched: v.number(),
    recordsStored: v.number(),
    hotspotsCreated: v.number(),
    hotspotsUpdated: v.number(),

    // Time range of data
    dataStartDate: v.optional(v.number()),
    dataEndDate: v.optional(v.number()),

    // Error tracking
    error: v.optional(v.string()),
    retryCount: v.number(),

    // Timestamps
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_source", ["dataSourceSlug"])
    .index("by_city", ["cityId"])
    .index("by_status", ["status"])
    .index("by_started", ["startedAt"]),

  // ============================================
  // DATA SOURCES
  // ============================================
  dataSources: defineTable({
    // Identification
    slug: v.string(),
    name: v.string(),
    description: v.string(),

    // Provider info
    provider: v.string(),
    url: v.string(),
    logoUrl: v.optional(v.string()),

    // Which modules use this source
    moduleIds: v.array(v.id("modules")),

    // Data info
    updateFrequency: v.optional(v.string()), // "hourly", "daily", "weekly"
    lastUpdated: v.optional(v.number()),

    // Status
    isActive: v.boolean(),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),
});
