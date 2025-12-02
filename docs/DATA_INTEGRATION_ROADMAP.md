# Impact Atlas - Data Integration Roadmap

> Last updated: December 2, 2025

This document outlines the step-by-step implementation plan for integrating real satellite and environmental datasets into the Impact Atlas platform.

---

## Table of Contents

1. [Current State](#current-state)
2. [Phase 1: Air Quality (Sentinel-5P)](#phase-1-air-quality-sentinel-5p) - DONE
3. [Phase 2: Urban Heat Islands (Sentinel-3)](#phase-2-urban-heat-islands-sentinel-3)
4. [Phase 3: Biodiversity & Ecosystem (NDVI)](#phase-3-biodiversity--ecosystem-ndvi)
5. [Phase 4: Port Emissions](#phase-4-port-emissions)
6. [Phase 5: Coastal Plastic](#phase-5-coastal-plastic)
7. [Data Sources Reference](#data-sources-reference)
8. [Technical Architecture](#technical-architecture)

---

## Current State

### Completed Infrastructure
- [x] `satelliteData` table in Convex schema
- [x] `dataIngestionLog` table for tracking fetches
- [x] Convex HTTP actions framework
- [x] Scheduled cron jobs (daily/weekly)
- [x] Module page reactive to city changes
- [x] Air Quality module seed data

### Available Cities with Bounding Boxes
| City | Coordinates | Bounding Box |
|------|-------------|--------------|
| Amsterdam | 52.37°N, 4.90°E | 52.28-52.45°N, 4.75-5.02°E |
| Copenhagen | 55.68°N, 12.57°E | 55.60-55.75°N, 12.45-12.68°E |
| Singapore | 1.35°N, 103.82°E | 1.22-1.47°N, 103.6-104.0°E |
| Barcelona | 41.39°N, 2.17°E | 41.32-41.47°N, 2.05-2.23°E |
| Melbourne | 37.81°S, 144.96°E | 37.65-37.90°S, 144.85-145.15°E |

---

## Phase 1: Air Quality (Sentinel-5P)

**Status: COMPLETED**

### What Was Built
- `fetchSentinel5PNO2` action in `convex/satelliteData.ts`
- WHO-based severity thresholds for NO2
- Automatic hotspot creation/update from satellite data
- Daily cron job at 6 AM UTC

### How to Test
```bash
# Seed the database with air-quality module
npx convex run seed:runFullSeed

# Trigger manual fetch for Amsterdam
npx convex run satelliteData:triggerFetch '{"citySlug": "amsterdam"}'

# Check ingestion logs
# View in Convex dashboard: dataIngestionLog table
```

### Thresholds Used
| Severity | NO2 Level (µmol/m²) |
|----------|---------------------|
| Low | < 10 |
| Medium | 10-25 |
| High | 25-50 |
| Critical | > 50 |

---

## Phase 2: Urban Heat Islands (Sentinel-3)

**Status: PLANNED**

### Overview
Urban Heat Islands (UHI) occur when cities become significantly warmer than surrounding areas due to dark surfaces, lack of vegetation, and building density. Sentinel-3 SLSTR provides Land Surface Temperature (LST) data perfect for detecting these patterns.

### Data Source
- **Satellite**: Sentinel-3A/B SLSTR
- **Product**: Land Surface Temperature (LST)
- **Resolution**: 1km
- **Update Frequency**: Daily (day and night passes)
- **API**: Copernicus Data Space STAC

### Implementation Steps

#### Step 1: Add Sentinel-3 Constants
```typescript
// convex/satelliteData.ts

// Land Surface Temperature thresholds (temperature anomaly in °C)
const LST_THRESHOLDS = {
  low: 2,      // < 2°C above city average
  medium: 4,   // 2-4°C above average
  high: 6,     // 4-6°C above average
  critical: 6, // > 6°C above average
};
```

#### Step 2: Create Fetch Action
```typescript
// convex/satelliteData.ts

export const fetchSentinel3LST = internalAction({
  args: {
    citySlug: v.string(),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Get city and urban-heat module
    // 2. Create ingestion log
    // 3. Fetch from Copernicus STAC API
    //    - Collection: "SENTINEL-3"
    //    - Product: "SL_2_LST___"
    // 4. Calculate temperature anomaly vs city average
    // 5. Store in satelliteData table
    // 6. Create/update hotspots for areas with high anomaly
  },
});
```

#### Step 3: STAC API Query
```json
{
  "collections": ["SENTINEL-3"],
  "bbox": [west, south, east, north],
  "datetime": "2025-12-01/2025-12-02",
  "query": {
    "productType": { "eq": "SL_2_LST___" }
  },
  "limit": 20
}
```

#### Step 4: Processing Logic
1. Fetch LST raster data for city bounding box
2. Calculate city-wide average temperature
3. Identify grid cells with temperature > average + threshold
4. Convert high-anomaly cells to hotspot coordinates
5. Determine severity based on anomaly magnitude

#### Step 5: Update HeatmapOverlay Component
The existing `HeatmapOverlay` component needs to:
- Accept real LST data from Convex query
- Render temperature gradient on map
- Show hotspot markers for critical areas

#### Step 6: Add Cron Job
```typescript
// convex/crons.ts
crons.daily(
  "daily-urban-heat-update",
  { hourUTC: 7, minuteUTC: 0 },
  internal.satelliteData.fetchSentinel3LSTAllCities,
  { daysBack: 1 }
);
```

### Schema Additions (if needed)
```typescript
// Metrics specific to urban heat
metrics: [
  { key: "surfaceTemp", value: 42.5, unit: "°C" },
  { key: "anomaly", value: 5.2, unit: "°C" },
  { key: "nightCooling", value: 3.1, unit: "°C/hr" },
]
```

### UI Updates Required
- [ ] Update `HeatmapOverlay` to fetch from `satelliteData.getByCityModule`
- [ ] Add temperature legend to map
- [ ] Show "Last updated" timestamp from satellite pass
- [ ] Add data source attribution

---

## Phase 3: Biodiversity & Ecosystem (NDVI)

**Status: PLANNED**

### Overview
Normalized Difference Vegetation Index (NDVI) measures vegetation health and density. It's essential for:
- **Biodiversity module**: Correlate vegetation with species habitats
- **Restoration module**: Track reforestation/revegetation progress

### Data Source
- **Primary**: Microsoft Planetary Computer - Landsat 8/9
- **Alternative**: Copernicus Sentinel-2
- **Resolution**: 30m (Landsat) / 10m (Sentinel-2)
- **Update Frequency**: 16-day revisit (Landsat), 5-day (Sentinel-2)

### NDVI Calculation
```
NDVI = (NIR - Red) / (NIR + Red)
```
- Values range from -1 to +1
- Healthy vegetation: 0.6 to 0.9
- Sparse vegetation: 0.2 to 0.4
- Water/bare soil: < 0.1

### Implementation Steps

#### Step 1: Add NDVI Constants
```typescript
// Vegetation health thresholds
const NDVI_THRESHOLDS = {
  barren: 0.1,      // < 0.1: No vegetation
  sparse: 0.2,      // 0.1-0.2: Sparse/stressed
  moderate: 0.4,    // 0.2-0.4: Moderate
  healthy: 0.6,     // 0.4-0.6: Healthy
  dense: 0.6,       // > 0.6: Dense/thriving
};
```

#### Step 2: Microsoft Planetary Computer Integration
```typescript
// Use pystac-client equivalent in TypeScript
const PLANETARY_COMPUTER_URL = "https://planetarycomputer.microsoft.com/api/stac/v1";

// Search for Landsat scenes
const searchParams = {
  collections: ["landsat-c2-l2"],
  bbox: [west, south, east, north],
  datetime: "2025-11-01/2025-12-01",
  query: {
    "eo:cloud_cover": { "lt": 20 }
  }
};
```

#### Step 3: Processing Steps
1. Fetch Landsat scene metadata
2. Download Band 4 (Red) and Band 5 (NIR) COG files
3. Calculate NDVI for each pixel
4. Identify areas with:
   - Low NDVI (potential restoration sites)
   - Declining NDVI trend (biodiversity concern)
   - High NDVI (green corridors)
5. Create hotspots for areas needing attention

#### Step 4: Time Series Analysis
Track NDVI changes over time to detect:
- Deforestation/vegetation loss
- Successful restoration projects
- Seasonal patterns vs anomalies

### Modules Using This Data

#### Biodiversity Module
- Overlay NDVI with species occurrence data (GBIF)
- Identify green corridors connecting habitats
- Detect vegetation fragmentation

#### Restoration Module
- Before/after NDVI comparison for restoration sites
- Carbon sequestration estimates based on vegetation growth
- Progress tracking for reforestation projects

### UI Updates Required
- [ ] Add NDVI layer to map visualization
- [ ] Create vegetation health gradient legend
- [ ] Time slider for historical comparison
- [ ] Trend charts showing NDVI over time

---

## Phase 4: Port Emissions

**Status: PLANNED**

### Overview
Combine Sentinel-5P atmospheric data with AIS ship tracking to attribute emissions to specific vessels and port activities.

### Data Sources
1. **Sentinel-5P TROPOMI**: NO2, SO2, CO emissions
2. **AIS Ship Tracking**: Vessel positions and movements
3. **Emission Factors Database**: Emissions per vessel type

### Implementation Steps

#### Step 1: Enhance Sentinel-5P Fetch
```typescript
// Fetch multiple pollutants for port areas
const pollutants = ["NO2", "SO2", "CO"];

// Focus on port bounding boxes (smaller than city)
const PORT_AREAS = {
  amsterdam: { north: 52.42, south: 52.38, east: 4.95, west: 4.85 }, // Port of Amsterdam
  singapore: { north: 1.30, south: 1.24, east: 103.85, west: 103.75 }, // PSA terminals
  // ...
};
```

#### Step 2: AIS Data Integration
Options:
1. **MarineTraffic API** (paid)
2. **VesselFinder API** (paid)
3. **Open AIS data** (limited, delayed)

```typescript
// Fetch vessel positions in port area
const vessels = await fetchAISData({
  bbox: PORT_AREAS[citySlug],
  timestamp: measurementDate,
});

// Correlate with emission hotspots
const attributedEmissions = correlateEmissionsToVessels(
  emissionHotspots,
  vessels
);
```

#### Step 3: Emission Attribution
```typescript
// Estimate emissions based on vessel type
const EMISSION_FACTORS = {
  container_ship: { NO2: 45, SO2: 12, CO2: 850 }, // kg/hour at berth
  tanker: { NO2: 38, SO2: 15, CO2: 720 },
  cruise_ship: { NO2: 52, SO2: 8, CO2: 950 },
  // ...
};
```

#### Step 4: ShipTracker Component Update
Update `ShipTracker` component to:
- Show real vessel positions from AIS
- Color-code by emission levels
- Display vessel info on hover
- Show emission plumes on map

### Complexity Note
This is the most complex integration due to:
- Multiple data sources to correlate
- Real-time AIS data costs
- Attribution algorithms
- Maritime domain knowledge needed

Consider starting with Sentinel-5P emissions only, adding AIS later.

---

## Phase 5: Coastal Plastic

**Status: PLANNED**

### Overview
Detecting marine plastic debris from satellites is challenging. This module requires a hybrid approach combining:
1. Satellite imagery for large accumulations
2. Citizen science data for ground truth
3. Ocean current models for prediction

### Data Sources
1. **Sentinel-2**: Visual detection of large debris patches (10m resolution)
2. **Ocean Current Models**: NOAA HYCOM for drift prediction
3. **Citizen Science**: Beach cleanup reports, sighting data

### Approach

#### Option A: Visual Detection (Complex)
```typescript
// Sentinel-2 bands for plastic detection
// Floating Debris Index (FDI)
FDI = NIR - (Red + (SWIR - Red) * ((NIR_wavelength - Red_wavelength) / (SWIR_wavelength - Red_wavelength)))

// High FDI values may indicate floating debris
// Requires ML model for accurate classification
```

Challenges:
- Distinguishing plastic from seaweed, foam, ships
- Cloud cover interference
- Small debris not visible at 10m resolution

#### Option B: Predictive Model (Recommended Start)
```typescript
// Use ocean currents to predict accumulation zones
const predictAccumulationZones = async (citySlug: string) => {
  // 1. Get coastal geometry
  // 2. Fetch NOAA ocean current data
  // 3. Simulate particle drift from known sources
  // 4. Identify convergence zones
  // 5. Create hotspots at predicted accumulation points
};
```

#### Option C: Citizen Science Integration
```typescript
// Schema for citizen reports
citizenReports: defineTable({
  location: v.object({ lat: v.number(), lng: v.number() }),
  reportType: v.union(
    v.literal("debris_sighting"),
    v.literal("cleanup_event"),
    v.literal("beach_survey")
  ),
  plasticAmount: v.optional(v.string()), // "none", "low", "medium", "high"
  photoUrl: v.optional(v.string()),
  reportedAt: v.number(),
  verified: v.boolean(),
});
```

### Implementation Recommendation
1. **Start with**: Ocean current prediction model
2. **Add**: Citizen science reporting feature
3. **Future**: ML-based satellite detection (requires training data)

### UI Updates Required
- [ ] Update `PlasticFlowMap` with real current data
- [ ] Add prediction visualization (particle animation)
- [ ] Citizen report submission form
- [ ] Cleanup event tracker

---

## Data Sources Reference

### Copernicus Data Space (Primary)
- **URL**: https://dataspace.copernicus.eu/
- **API**: STAC REST API
- **Authentication**: Free registration required
- **Rate Limits**: Generous for research use
- **Data Available**:
  - Sentinel-1 (SAR)
  - Sentinel-2 (Optical)
  - Sentinel-3 (Ocean/Land temperature)
  - Sentinel-5P (Atmospheric)

### Microsoft Planetary Computer
- **URL**: https://planetarycomputer.microsoft.com/
- **API**: STAC + Python SDK
- **Authentication**: Free for research
- **Data Available**:
  - Landsat Collection 2
  - MODIS
  - NAIP (US only)
  - Various climate datasets

### Climate Data Store (ERA5)
- **URL**: https://cds.climate.copernicus.eu/
- **API**: REST with API key
- **Data Available**:
  - Historical weather/climate
  - Reanalysis data
  - Climate projections

### GBIF (Biodiversity)
- **URL**: https://www.gbif.org/
- **API**: REST API
- **Data Available**:
  - Species occurrence records
  - Taxonomic information
  - Biodiversity metrics

---

## Technical Architecture

### Data Flow
```
External API (Copernicus/Planetary Computer)
              ↓
    Convex Internal Action
    (fetchSentinel*)
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
satelliteData      hotspots
   table             table
    └─────────┬─────────┘
              ↓
    Convex Real-time Subscription
              ↓
    Next.js Frontend Components
    (Maps, Charts, Cards)
```

### Scheduled Jobs
| Job | Schedule | Action |
|-----|----------|--------|
| Air Quality | Daily 6 AM UTC | `fetchSentinel5PNO2AllCities` |
| Urban Heat | Daily 7 AM UTC | `fetchSentinel3LSTAllCities` |
| NDVI | Weekly Monday 4 AM | `fetchNDVIAllCities` |
| Backfill | Weekly Monday 3 AM | All sources, 7 days |

### Error Handling
```typescript
// Each fetch action should:
// 1. Create ingestion log with status "pending"
// 2. Update to "fetching" when API call starts
// 3. Update to "processing" when parsing data
// 4. Update to "completed" or "failed" with details
// 5. Implement retry logic (max 3 retries)
// 6. Alert on repeated failures (future: webhook/email)
```

### Performance Considerations
- Convex actions timeout after 10 minutes
- Batch large cities into tiles if needed
- Cache frequently accessed data
- Use pagination for large result sets
- Consider rate limiting external API calls

---

## Next Steps (Priority Order)

1. **Test Air Quality Integration**
   - Run seed and trigger fetch
   - Verify data appears in dashboard
   - Check hotspot creation

2. **Build Urban Heat Integration**
   - Implement `fetchSentinel3LST`
   - Update `HeatmapOverlay` component
   - Add to cron schedule

3. **Add NDVI for Biodiversity**
   - Integrate Planetary Computer
   - Create vegetation health visualization
   - Link to restoration tracking

4. **Enhance Port Emissions**
   - Add multiple pollutants
   - Research AIS data options
   - Update `ShipTracker` component

5. **Design Coastal Plastic Approach**
   - Evaluate prediction model options
   - Plan citizen science feature
   - Update `PlasticFlowMap` component

---

## Resources

### Documentation
- [Copernicus STAC API](https://documentation.dataspace.copernicus.eu/APIs/STAC.html)
- [Planetary Computer Docs](https://planetarycomputer.microsoft.com/docs/overview/about)
- [Sentinel-5P User Guide](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-5p-tropomi)
- [Sentinel-3 SLSTR](https://sentinel.esa.int/web/sentinel/technical-guides/sentinel-3-slstr)

### Tools
- [STAC Browser](https://radiantearth.github.io/stac-browser/) - Explore STAC catalogs
- [Copernicus Browser](https://browser.dataspace.copernicus.eu/) - Visual data exploration
- [EO Browser](https://apps.sentinel-hub.com/eo-browser/) - Sentinel imagery viewer

---

## Additional Improvements & Enhancements

### Immediate Polish (Quick Wins)

#### 1. Test the Air Quality Pipeline
```bash
# Seed the database with all modules including air-quality
npx convex run seed:runFullSeed

# Trigger manual fetch for a single city
npx convex run satelliteData:triggerFetch '{"citySlug": "amsterdam"}'

# Trigger fetch for all cities
npx convex run satelliteData:triggerFetchAll '{"daysBack": 7}'

# View results in Convex dashboard
# Tables to check: satelliteData, dataIngestionLog, hotspots
```

#### 2. Fix Pre-existing TypeScript Errors
Location: `src/app/dashboard/modules/[moduleId]/page.tsx`

Known issues:
- `SearchBar` component has incorrect prop names
- `FilterChip` component has incorrect prop names

```typescript
// Find the correct prop interface and update usage
// Check: src/components/dashboard/SearchBar.tsx
// Check: src/components/dashboard/FilterChip.tsx
```

---

### UI/UX Enhancements

#### 3. Real-time Data Indicators

**File**: `src/components/dashboard/ModuleCard.tsx` (or create new component)

Features to add:
- "Last updated" timestamp showing when satellite data was last fetched
- Loading spinner/skeleton while data is being fetched
- "Stale data" warning if data is older than 48 hours
- Refresh button to manually trigger data update

```typescript
// Example implementation
interface DataFreshnessIndicatorProps {
  lastUpdated: number | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const DataFreshnessIndicator = ({ lastUpdated, isLoading, onRefresh }: DataFreshnessIndicatorProps) => {
  const isStale = lastUpdated && Date.now() - lastUpdated > 48 * 60 * 60 * 1000;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isStale ? (
        <AlertTriangle className="h-3 w-3 text-amber-500" />
      ) : (
        <CheckCircle className="h-3 w-3 text-green-500" />
      )}
      <span>
        {lastUpdated
          ? `Updated ${formatDistanceToNow(lastUpdated)} ago`
          : "No data yet"}
      </span>
      <button onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  );
};
```

#### 4. Data Visualization - Time Series Charts

**New Component**: `src/components/charts/TimeSeriesChart.tsx`

Features:
- Line chart showing metric trends over days/weeks
- Support for multiple metrics (NO2, temperature, NDVI)
- Zoom and pan functionality
- Export to PNG/CSV

```typescript
// Use Recharts (already installed) or similar
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TimeSeriesChartProps {
  data: Array<{
    date: number;
    value: number;
    unit: string;
  }>;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Add Convex query to fetch historical data
// convex/satelliteData.ts
export const getTimeSeries = query({
  args: {
    cityId: v.id("cities"),
    moduleId: v.id("modules"),
    metricKey: v.string(),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = Date.now() - (args.daysBack || 30) * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("satelliteData")
      .withIndex("by_city_module", (q) =>
        q.eq("cityId", args.cityId).eq("moduleId", args.moduleId)
      )
      .filter((q) => q.gte(q.field("measurementDate"), startDate))
      .order("asc")
      .collect();
  },
});
```

#### 5. Hotspot Detail Drawer Enhancements

**File**: `src/components/dashboard/HotspotDetailDrawer.tsx`

Current state: Basic implementation exists

Enhancements needed:
- Show satellite data metrics directly
- Display measurement date and data quality
- Add trend sparklines
- Show related AI insights
- Link to historical data view

```typescript
// Enhanced drawer content structure
interface EnhancedHotspotDetail {
  // Basic info
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";

  // Location
  coordinates: { lat: number; lng: number };
  address?: string;
  neighborhood?: string;

  // Satellite data
  measurements: Array<{
    key: string;
    value: number;
    unit: string;
    qualityFlag?: number;
    trend?: "up" | "down" | "stable";
  }>;
  measurementDate: number;
  satelliteId: string;

  // AI insights
  insights: Array<{
    title: string;
    content: string;
    confidence: number;
  }>;

  // Quick wins
  recommendations: Array<{
    title: string;
    priority: "high" | "medium" | "low";
    estimatedImpact: string;
  }>;
}
```

---

### Backend Improvements

#### 6. Error Handling & Retries

**File**: `convex/satelliteData.ts`

Current state: Basic error logging exists

Enhancements:
- Implement exponential backoff for retries
- Add alerting for repeated failures
- Create error recovery mechanisms

```typescript
// Enhanced error handling pattern
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fetchFn, retryCount + 1);
    }
    throw error;
  }
}

// Add webhook notification for failures
export const notifyOnFailure = internalAction({
  args: {
    logId: v.id("dataIngestionLog"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    // Option 1: Slack webhook
    // Option 2: Email via SendGrid/Resend
    // Option 3: Store for admin dashboard alert

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `⚠️ Data ingestion failed: ${args.error}`,
        blocks: [/* ... */],
      }),
    });
  },
});
```

#### 7. Data Caching Layer

**Purpose**: Reduce external API calls, improve response times

```typescript
// Add to convex/schema.ts
dataCache: defineTable({
  cacheKey: v.string(), // e.g., "sentinel5p:amsterdam:2025-12-01"
  data: v.any(),
  expiresAt: v.number(),
  createdAt: v.number(),
})
  .index("by_key", ["cacheKey"])
  .index("by_expiry", ["expiresAt"]),

// Helper functions in convex/cache.ts
export const getCached = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("dataCache")
      .withIndex("by_key", (q) => q.eq("cacheKey", args.key))
      .unique();

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  },
});

export const setCache = mutation({
  args: {
    key: v.string(),
    data: v.any(),
    ttlSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete existing
    const existing = await ctx.db
      .query("dataCache")
      .withIndex("by_key", (q) => q.eq("cacheKey", args.key))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Insert new
    await ctx.db.insert("dataCache", {
      cacheKey: args.key,
      data: args.data,
      expiresAt: Date.now() + args.ttlSeconds * 1000,
      createdAt: Date.now(),
    });
  },
});

// Cron to clean expired cache
crons.daily(
  "clean-expired-cache",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cache.cleanExpired
);
```

#### 8. Rate Limiting for External APIs

**Purpose**: Respect API limits, prevent blocking

```typescript
// convex/rateLimiter.ts
export const RATE_LIMITS = {
  copernicus: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
  },
  planetaryComputer: {
    requestsPerMinute: 100,
    requestsPerDay: 50000,
  },
};

// Track API calls
apiRateLimits: defineTable({
  apiName: v.string(),
  windowStart: v.number(),
  requestCount: v.number(),
})
  .index("by_api_window", ["apiName", "windowStart"]),

// Check before making request
export const canMakeRequest = query({
  args: { apiName: v.string() },
  handler: async (ctx, args) => {
    const limits = RATE_LIMITS[args.apiName as keyof typeof RATE_LIMITS];
    if (!limits) return true;

    const minuteWindow = Math.floor(Date.now() / 60000);
    const record = await ctx.db
      .query("apiRateLimits")
      .withIndex("by_api_window", (q) =>
        q.eq("apiName", args.apiName).eq("windowStart", minuteWindow)
      )
      .unique();

    return !record || record.requestCount < limits.requestsPerMinute;
  },
});
```

---

### New Features

#### 9. City Comparison View

**New Page**: `src/app/dashboard/compare/page.tsx`

Features:
- Side-by-side city metrics comparison
- Radar chart for multi-metric overview
- Ranking table with sortable columns
- Historical trend comparison

```typescript
// Component structure
const ComparisonPage = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("no2Level");

  // Fetch data for all selected cities
  const cityData = useQueries(
    selectedCities.map(citySlug =>
      convexQuery(api.satelliteData.getLatestByCity, { citySlug })
    )
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* City selector */}
      {/* Metric selector */}
      {/* Comparison charts */}
      {/* Ranking table */}
    </div>
  );
};
```

#### 10. Export/Reports Feature

**New Component**: `src/components/reports/ReportGenerator.tsx`

Features:
- Export data as CSV/JSON
- Generate PDF reports with charts
- Schedule automated reports
- Email delivery option

```typescript
// Client-side export utilities
export const exportToCSV = (data: any[], filename: string) => {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row).map(v =>
      typeof v === "string" ? `"${v}"` : v
    ).join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
};

// PDF generation (use @react-pdf/renderer or jspdf)
export const generatePDFReport = async (reportData: ReportData) => {
  // ... PDF generation logic
};

// Convex mutation to schedule reports
export const scheduleReport = mutation({
  args: {
    userId: v.id("users"),
    reportType: v.string(),
    schedule: v.string(), // cron expression
    emailTo: v.string(),
    config: v.object({
      cities: v.array(v.string()),
      modules: v.array(v.string()),
      dateRange: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledReports", {
      ...args,
      nextRunAt: calculateNextRun(args.schedule),
      createdAt: Date.now(),
    });
  },
});
```

---

### Infrastructure

#### 11. Environment Variables Setup

**File**: `.env.local` (create from `.env.example`)

```bash
# Copernicus Data Space
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret

# Microsoft Planetary Computer
PLANETARY_COMPUTER_API_KEY=your_api_key

# Climate Data Store
CDS_API_KEY=your_cds_key

# Optional: Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SENDGRID_API_KEY=your_sendgrid_key

# Feature flags
ENABLE_SATELLITE_DATA=true
ENABLE_SCHEDULED_JOBS=true
```

**File**: `convex/convex.config.ts` (if using Convex env vars)
```typescript
// Access env vars in Convex actions
const clientId = process.env.COPERNICUS_CLIENT_ID;
```

#### 12. Admin Monitoring Dashboard

**New Page**: `src/app/admin/ingestion/page.tsx`

Features:
- Real-time ingestion job status
- Success/failure rates
- Data freshness per city/module
- Manual trigger buttons
- Error log viewer

```typescript
// Dashboard showing ingestion status
const AdminIngestionPage = () => {
  const logs = useQuery(api.satelliteData.getIngestionLog, {
    limit: 100,
    status: undefined, // all statuses
  });

  const stats = useMemo(() => {
    if (!logs) return null;

    return {
      total: logs.length,
      completed: logs.filter(l => l.status === "completed").length,
      failed: logs.filter(l => l.status === "failed").length,
      avgDuration: calculateAvgDuration(logs),
      lastRun: Math.max(...logs.map(l => l.completedAt || 0)),
    };
  }, [logs]);

  return (
    <div>
      {/* Stats cards */}
      {/* Status timeline */}
      {/* Error details */}
      {/* Manual trigger buttons */}
    </div>
  );
};

// Add to convex/satelliteData.ts
export const getIngestionStats = query({
  args: { daysBack: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const since = Date.now() - (args.daysBack || 7) * 24 * 60 * 60 * 1000;

    const logs = await ctx.db
      .query("dataIngestionLog")
      .filter((q) => q.gte(q.field("startedAt"), since))
      .collect();

    return {
      totalJobs: logs.length,
      successRate: logs.filter(l => l.status === "completed").length / logs.length,
      failedJobs: logs.filter(l => l.status === "failed"),
      avgRecordsPerJob: logs.reduce((sum, l) => sum + l.recordsStored, 0) / logs.length,
      byCity: groupBy(logs, "cityId"),
      bySource: groupBy(logs, "dataSourceSlug"),
    };
  },
});
```

#### 13. Unit Tests for Data Processing

**Directory**: `convex/__tests__/`

```typescript
// convex/__tests__/satelliteData.test.ts
import { describe, it, expect } from "vitest";
import { determineSeverity, calculateAnomalies, parseSTACResponse } from "../satelliteData";

describe("Severity Classification", () => {
  it("classifies NO2 levels correctly", () => {
    expect(determineSeverity(5, "NO2")).toBe("low");
    expect(determineSeverity(15, "NO2")).toBe("medium");
    expect(determineSeverity(35, "NO2")).toBe("high");
    expect(determineSeverity(60, "NO2")).toBe("critical");
  });

  it("classifies temperature anomalies correctly", () => {
    expect(determineSeverity(1.5, "LST_ANOMALY")).toBe("low");
    expect(determineSeverity(3, "LST_ANOMALY")).toBe("medium");
    expect(determineSeverity(5, "LST_ANOMALY")).toBe("high");
    expect(determineSeverity(7, "LST_ANOMALY")).toBe("critical");
  });
});

describe("STAC Response Parsing", () => {
  it("extracts measurement values from STAC features", () => {
    const mockResponse = {
      features: [
        {
          id: "test-product",
          properties: {
            datetime: "2025-12-01T00:00:00Z",
            "s5p:processing_mode": "NRTI",
          },
          assets: {
            NO2: { href: "https://..." },
          },
        },
      ],
    };

    const result = parseSTACResponse(mockResponse);
    expect(result).toHaveLength(1);
    expect(result[0].productType).toBe("NO2");
  });
});

describe("Anomaly Calculation", () => {
  it("calculates temperature anomalies correctly", () => {
    const cityAvg = 25.5;
    const measurements = [28.0, 30.5, 24.0, 32.0];

    const anomalies = calculateAnomalies(measurements, cityAvg);

    expect(anomalies[0]).toBe(2.5);  // 28.0 - 25.5
    expect(anomalies[1]).toBe(5.0);  // 30.5 - 25.5
    expect(anomalies[2]).toBe(-1.5); // 24.0 - 25.5
    expect(anomalies[3]).toBe(6.5);  // 32.0 - 25.5
  });
});
```

**Run tests:**
```bash
# Add to package.json scripts
"test:convex": "vitest run convex/__tests__"

# Run
npm run test:convex
```

---

### Mobile Responsiveness Audit

#### Areas to Review:
- [ ] City selection modal on small screens
- [ ] Map controls and touch interactions
- [ ] Hotspot detail drawer on mobile
- [ ] Chart readability on narrow viewports
- [ ] Navigation and sidebar collapse

#### Key Breakpoints:
```typescript
// Tailwind breakpoints to test
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Ensure components adapt properly at each breakpoint
```

---

### Performance Optimization

#### Lazy Loading:
```typescript
// Lazy load heavy components
const MapWithHotspots = dynamic(
  () => import("@/components/maps/MapWithHotspots"),
  {
    loading: () => <MapSkeleton />,
    ssr: false
  }
);

const TimeSeriesChart = dynamic(
  () => import("@/components/charts/TimeSeriesChart"),
  { loading: () => <ChartSkeleton /> }
);
```

#### Data Pagination:
```typescript
// Add pagination to large queries
export const listSatelliteDataPaginated = query({
  args: {
    cityId: v.id("cities"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let query = ctx.db
      .query("satelliteData")
      .withIndex("by_city", (q) => q.eq("cityId", args.cityId))
      .order("desc");

    if (args.cursor) {
      query = query.filter((q) =>
        q.lt(q.field("_creationTime"), parseInt(args.cursor!))
      );
    }

    const results = await query.take(limit + 1);
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;

    return {
      data,
      nextCursor: hasMore ? String(data[data.length - 1]._creationTime) : null,
    };
  },
});
```

---

### Security Considerations

#### API Key Management:
- Never expose API keys in client-side code
- Use Convex actions (server-side) for all external API calls
- Rotate keys periodically
- Implement key scoping where supported

#### Input Validation:
- All Convex functions already validate via `v.` validators
- Add additional business logic validation where needed
- Sanitize any user-provided data before storage

#### Rate Limiting for Users:
```typescript
// Prevent abuse of manual trigger endpoints
export const triggerFetch = mutation({
  args: { citySlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check user's recent triggers
    const recentTriggers = await ctx.db
      .query("userActions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.eq(q.field("action"), "trigger_fetch"),
          q.gte(q.field("timestamp"), Date.now() - 60000)
        )
      )
      .collect();

    if (recentTriggers.length >= 5) {
      throw new Error("Rate limit exceeded. Please wait before triggering again.");
    }

    // Log action
    await ctx.db.insert("userActions", {
      userId: identity.subject,
      action: "trigger_fetch",
      timestamp: Date.now(),
    });

    // Proceed with fetch...
  },
});
```

---

## Implementation Priority Matrix

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 High | Test Air Quality Pipeline | Low | High |
| 🔴 High | Fix TypeScript Errors | Low | Medium |
| 🟡 Medium | Real-time Data Indicators | Medium | High |
| 🟡 Medium | Time Series Charts | Medium | High |
| 🟡 Medium | Error Handling & Retries | Medium | High |
| 🟡 Medium | Environment Variables Setup | Low | High |
| 🟢 Low | Data Caching Layer | Medium | Medium |
| 🟢 Low | City Comparison View | High | Medium |
| 🟢 Low | Export/Reports | High | Medium |
| 🟢 Low | Admin Monitoring Dashboard | High | Medium |
| 🟢 Low | Unit Tests | Medium | Low |

---

*This document should be updated as implementation progresses.*
