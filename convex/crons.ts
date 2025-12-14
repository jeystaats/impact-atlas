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

export default crons;
