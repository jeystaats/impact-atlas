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
