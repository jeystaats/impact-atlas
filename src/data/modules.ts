import { Module, DataSource, City } from "@/types";

export const modules: Module[] = [
  {
    id: "urban-heat",
    title: "Urban Heat & Tree Equity Mapper",
    description: "Identify heat islands and optimize tree planting for maximum cooling impact and equitable distribution.",
    icon: "thermometer",
    color: "#EF4444",
    metrics: [
      { label: "Heat Islands", value: 23, trend: "down", trendValue: "-3" },
      { label: "Tree Cover Gap", value: "18%", trend: "down", trendValue: "-2.1%" },
    ],
    quickWinsCount: 12,
    status: "active",
  },
  {
    id: "coastal-plastic",
    title: "Coastal Plastic Hotspot Predictor",
    description: "Predict where ocean plastic will accumulate on your coastlines using current and weather models.",
    icon: "waves",
    color: "#3B82F6",
    metrics: [
      { label: "Accumulation Zones", value: 8, trend: "neutral" },
      { label: "Next 7 Days Risk", value: "High", trend: "up" },
    ],
    quickWinsCount: 6,
    status: "active",
  },
  {
    id: "ocean-plastic",
    title: "Ocean Plastic Classifier",
    description: "AI-powered citizen science tool to classify and track plastic debris from beach photos.",
    icon: "camera",
    color: "#8B5CF6",
    metrics: [
      { label: "Photos Classified", value: 15420, trend: "up", trendValue: "+1.2K" },
      { label: "Volunteers Active", value: 342, trend: "up", trendValue: "+28" },
    ],
    quickWinsCount: 4,
    status: "active",
  },
  {
    id: "port-emissions",
    title: "Port Emissions Pulse",
    description: "Real-time tracking of port and maritime emissions with vessel-level attribution.",
    icon: "ship",
    color: "#F59E0B",
    metrics: [
      { label: "CO2 Today", value: "2.4K", unit: "tonnes", trend: "down", trendValue: "-12%" },
      { label: "Vessels Tracked", value: 156, trend: "neutral" },
    ],
    quickWinsCount: 9,
    status: "active",
  },
  {
    id: "biodiversity",
    title: "Biodiversity Urban Design Copilot",
    description: "AI assistant for designing streets, parks, and buildings that support local wildlife.",
    icon: "leaf",
    color: "#10B981",
    metrics: [
      { label: "Species Supported", value: 47, trend: "up", trendValue: "+5" },
      { label: "Green Corridors", value: 3, trend: "neutral" },
    ],
    quickWinsCount: 15,
    status: "active",
  },
  {
    id: "restoration",
    title: "Local Restoration Finder",
    description: "Discover high-impact land restoration opportunities using satellite imagery and ecological models.",
    icon: "sprout",
    color: "#84CC16",
    metrics: [
      { label: "Restoration Sites", value: 28, trend: "up", trendValue: "+4" },
      { label: "Potential CO2 Offset", value: "12K", unit: "tonnes/yr" },
    ],
    quickWinsCount: 11,
    status: "active",
  },
  {
    id: "air-quality",
    title: "Air Quality & Pollution Monitor",
    description: "Real-time air quality monitoring with pollutant tracking, health risk assessment, and emission source identification.",
    icon: "wind",
    color: "#06B6D4",
    metrics: [
      { label: "AQI Now", value: 78, trend: "down", trendValue: "-12" },
      { label: "PM2.5 Hotspots", value: 14, trend: "down", trendValue: "-3" },
    ],
    quickWinsCount: 8,
    status: "active",
  },
];

export const dataSources: DataSource[] = [
  {
    id: "copernicus",
    name: "Copernicus",
    description: "EU Earth observation programme providing satellite data for climate monitoring.",
    url: "https://www.copernicus.eu",
  },
  {
    id: "noaa",
    name: "NOAA",
    description: "US agency providing weather, ocean, and atmospheric data.",
    url: "https://www.noaa.gov",
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    description: "Open-source geographic database of the world.",
    url: "https://www.openstreetmap.org",
  },
  {
    id: "gbif",
    name: "GBIF",
    description: "Global Biodiversity Information Facility with species occurrence data.",
    url: "https://www.gbif.org",
  },
  {
    id: "gfw",
    name: "Global Forest Watch",
    description: "Real-time monitoring of forests worldwide.",
    url: "https://www.globalforestwatch.org",
  },
];

export const cities: City[] = [
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    population: 872680,
    coordinates: { lat: 52.3676, lng: 4.9041 },
  },
  {
    id: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    population: 644431,
    coordinates: { lat: 55.6761, lng: 12.5683 },
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    population: 5850000,
    coordinates: { lat: 1.3521, lng: 103.8198 },
  },
  {
    id: "barcelona",
    name: "Barcelona",
    country: "Spain",
    population: 1620343,
    coordinates: { lat: 41.3851, lng: 2.1734 },
  },
  {
    id: "melbourne",
    name: "Melbourne",
    country: "Australia",
    population: 5078193,
    coordinates: { lat: -37.8136, lng: 144.9631 },
  },
];

// City-specific module stats (fallback when Convex data is not available)
export const cityModuleStats: Record<string, Record<string, { hotspots: number; quickWins: number }>> = {
  amsterdam: {
    "urban-heat": { hotspots: 23, quickWins: 12 },
    "coastal-plastic": { hotspots: 8, quickWins: 6 },
    "ocean-plastic": { hotspots: 5, quickWins: 4 },
    "port-emissions": { hotspots: 12, quickWins: 9 },
    "biodiversity": { hotspots: 15, quickWins: 15 },
    "restoration": { hotspots: 18, quickWins: 11 },
    "air-quality": { hotspots: 11, quickWins: 7 },
  },
  copenhagen: {
    "urban-heat": { hotspots: 15, quickWins: 8 },
    "coastal-plastic": { hotspots: 6, quickWins: 5 },
    "ocean-plastic": { hotspots: 4, quickWins: 3 },
    "port-emissions": { hotspots: 8, quickWins: 7 },
    "biodiversity": { hotspots: 12, quickWins: 12 },
    "restoration": { hotspots: 14, quickWins: 8 },
    "air-quality": { hotspots: 8, quickWins: 5 },
  },
  singapore: {
    "urban-heat": { hotspots: 35, quickWins: 18 },
    "coastal-plastic": { hotspots: 14, quickWins: 10 },
    "ocean-plastic": { hotspots: 9, quickWins: 7 },
    "port-emissions": { hotspots: 22, quickWins: 15 },
    "biodiversity": { hotspots: 18, quickWins: 14 },
    "restoration": { hotspots: 12, quickWins: 8 },
    "air-quality": { hotspots: 18, quickWins: 10 },
  },
  barcelona: {
    "urban-heat": { hotspots: 28, quickWins: 14 },
    "coastal-plastic": { hotspots: 11, quickWins: 8 },
    "ocean-plastic": { hotspots: 7, quickWins: 5 },
    "port-emissions": { hotspots: 15, quickWins: 11 },
    "biodiversity": { hotspots: 14, quickWins: 13 },
    "restoration": { hotspots: 16, quickWins: 10 },
    "air-quality": { hotspots: 14, quickWins: 8 },
  },
  melbourne: {
    "urban-heat": { hotspots: 32, quickWins: 20 },
    "coastal-plastic": { hotspots: 18, quickWins: 12 },
    "ocean-plastic": { hotspots: 12, quickWins: 9 },
    "port-emissions": { hotspots: 19, quickWins: 14 },
    "biodiversity": { hotspots: 25, quickWins: 22 },
    "restoration": { hotspots: 28, quickWins: 12 },
    "air-quality": { hotspots: 16, quickWins: 9 },
  },
};

// Get modules with city-specific stats (for fallback use)
export function getModulesForCity(citySlug: string): Module[] {
  const cityStats = cityModuleStats[citySlug] || cityModuleStats.barcelona;

  return modules.map((module) => {
    const stats = cityStats[module.id] || { hotspots: 0, quickWins: 0 };
    return {
      ...module,
      metrics: [
        { label: "Hotspots", value: stats.hotspots, trend: "neutral" as const },
        { label: "Quick Wins", value: stats.quickWins },
      ],
      quickWinsCount: stats.quickWins,
    };
  });
}
