import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================
// SATELLITE DATA (Sentinel-5P)
// ============================================

/**
 * Daily satellite data update
 * Fetches Sentinel-5P NO2 data for all cities at 6:00 AM UTC
 * This runs after the satellite typically processes and releases new data
 */
crons.daily(
  "daily-air-quality-update",
  { hourUTC: 6, minuteUTC: 0 },
  internal.satelliteData.fetchSentinel5PNO2AllCities,
  { daysBack: 1 } // Fetch only yesterday's data for daily updates
);

/**
 * Weekly comprehensive update
 * Fetches 7 days of data every Monday at 3:00 AM UTC
 * This ensures we have complete coverage even if daily updates fail
 */
crons.weekly(
  "weekly-air-quality-backfill",
  { hourUTC: 3, minuteUTC: 0, dayOfWeek: "monday" },
  internal.satelliteData.fetchSentinel5PNO2AllCities,
  { daysBack: 7 }
);

// ============================================
// OPENAQ GROUND STATIONS (Real-time)
// ============================================

/**
 * Hourly OpenAQ update
 * Fetches real-time ground station data every hour
 * OpenAQ updates frequently, so hourly polling provides fresh data
 */
crons.hourly(
  "hourly-openaq-update",
  { minuteUTC: 15 }, // Run at :15 past each hour
  internal.openaq.fetchOpenAQAllCities,
  {}
);

// ============================================
// URBAN HEAT (Open-Meteo)
// ============================================

/**
 * Hourly urban heat update
 * Fetches temperature data and calculates heat anomalies
 * Runs at :45 past each hour (offset from OpenAQ)
 */
crons.hourly(
  "hourly-urban-heat-update",
  { minuteUTC: 45 },
  internal.urbanHeat.fetchUrbanHeatAllCities,
  {}
);

// ============================================
// BIODIVERSITY (GBIF)
// ============================================

/**
 * Daily biodiversity update
 * Fetches species occurrence data from GBIF
 * Runs at 4:00 AM UTC (species data doesn't change frequently)
 */
crons.daily(
  "daily-biodiversity-update",
  { hourUTC: 4, minuteUTC: 0 },
  internal.biodiversity.fetchBiodiversityAllCities,
  {}
);

// ============================================
// COASTAL PLASTIC (Open-Meteo Marine)
// ============================================

/**
 * Hourly coastal plastic update
 * Fetches ocean current and wave data for plastic accumulation modeling
 * Runs at :30 past each hour
 */
crons.hourly(
  "hourly-coastal-plastic-update",
  { minuteUTC: 30 },
  internal.coastalPlastic.fetchCoastalAllCities,
  {}
);

// ============================================
// VEGETATION NDVI (Agromonitoring/Satellite)
// ============================================

/**
 * Weekly vegetation health update
 * Fetches NDVI data for green spaces and parks
 * Runs every Wednesday at 5:00 AM UTC (vegetation changes slowly)
 */
crons.weekly(
  "weekly-vegetation-update",
  { hourUTC: 5, minuteUTC: 0, dayOfWeek: "wednesday" },
  internal.vegetation.fetchVegetationAllCities,
  {}
);

// ============================================
// GLOBAL FOREST WATCH (Tree Cover)
// ============================================

/**
 * Weekly forest monitoring update
 * Fetches tree cover loss/gain data from Global Forest Watch
 * Runs every Sunday at 2:00 AM UTC (forest data updates weekly)
 */
crons.weekly(
  "weekly-forest-update",
  { hourUTC: 2, minuteUTC: 0, dayOfWeek: "sunday" },
  internal.globalForestWatch.fetchForestDataAllCities,
  {}
);

export default crons;
