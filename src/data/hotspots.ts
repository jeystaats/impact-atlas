export interface HotspotData {
  id: string;
  lat: number;
  lng: number;
  severity: "low" | "medium" | "high" | "critical";
  label: string;
  value?: string;
  description: string;
  location: string;
  recommendations: string[];
}

// Amsterdam-centered hotspots (default city)
export const moduleHotspots: Record<string, HotspotData[]> = {
  "urban-heat": [
    {
      id: "uh-1",
      lat: 52.3702,
      lng: 4.8952,
      severity: "critical",
      label: "Downtown Core",
      value: "+5.2°C",
      location: "Central Business District",
      description: "Severe heat island effect with temperatures 5.2°C above baseline. Low tree canopy coverage (8%) and high building density contribute to elevated temperatures.",
      recommendations: [
        "Plant 200 shade trees along Main Street corridor",
        "Install cool roofing on municipal buildings",
        "Create pocket parks with shade structures",
      ],
    },
    {
      id: "uh-2",
      lat: 52.3849,
      lng: 4.9028,
      severity: "high",
      label: "Industrial Zone",
      value: "+4.1°C",
      location: "Harbor Industrial Area",
      description: "Industrial activity and lack of vegetation create persistent heat accumulation. Vulnerable worker populations affected.",
      recommendations: [
        "Implement cool pavement coatings",
        "Add green buffer zones around facilities",
      ],
    },
    {
      id: "uh-3",
      lat: 52.3589,
      lng: 4.8721,
      severity: "medium",
      label: "Shopping District",
      value: "+2.8°C",
      location: "West End Mall Area",
      description: "Large parking areas and dark surfaces contribute to moderate heat island effect.",
      recommendations: [
        "Install shade structures over parking lots",
        "Replace dark asphalt with reflective surfaces",
      ],
    },
    {
      id: "uh-4",
      lat: 52.3812,
      lng: 4.9215,
      severity: "low",
      label: "Residential North",
      value: "+1.2°C",
      location: "Oakwood Neighborhood",
      description: "Good tree coverage but aging canopy needs maintenance. Opportunity for preventive action.",
      recommendations: [
        "Schedule tree maintenance program",
        "Plant replacement trees for aging specimens",
      ],
    },
  ],
  "coastal-plastic": [
    {
      id: "cp-1",
      lat: 52.3915,
      lng: 4.9395,
      severity: "critical",
      label: "Marina Beach",
      value: "2,400 kg/week",
      location: "Eastern Marina",
      description: "Primary accumulation zone based on current patterns. Storm drains and river outflow converge here.",
      recommendations: [
        "Install floating boom barriers",
        "Schedule weekly cleanup operations",
        "Deploy sensor monitoring network",
      ],
    },
    {
      id: "cp-2",
      lat: 52.3756,
      lng: 4.9462,
      severity: "high",
      label: "River Mouth",
      value: "1,800 kg/week",
      location: "Riverside Delta",
      description: "River-borne plastic accumulates at delta. Microplastic concentration is elevated.",
      recommendations: [
        "Install river trash traps upstream",
        "Partner with watershed communities",
      ],
    },
    {
      id: "cp-3",
      lat: 52.3621,
      lng: 4.9158,
      severity: "medium",
      label: "Tourist Beach",
      value: "600 kg/week",
      location: "Central Beach",
      description: "Moderate accumulation, mostly consumer waste. Popular area requires regular maintenance.",
      recommendations: [
        "Increase bin capacity during peak season",
        "Launch visitor awareness campaign",
      ],
    },
  ],
  "ocean-plastic": [
    {
      id: "op-1",
      lat: 52.3695,
      lng: 4.8812,
      severity: "high",
      label: "Beach Survey Zone A",
      value: "342 items/100m",
      location: "North Beach",
      description: "High concentration of fishing-related debris. Citizen science volunteers active in area.",
      recommendations: [
        "Organize monthly cleanup events",
        "Partner with fishing community",
      ],
    },
    {
      id: "op-2",
      lat: 52.3758,
      lng: 4.9075,
      severity: "medium",
      label: "Beach Survey Zone B",
      value: "128 items/100m",
      location: "Central Coastline",
      description: "Moderate debris levels, mostly packaging materials identified by AI classification.",
      recommendations: [
        "Focus on packaging waste reduction",
        "Engage local businesses",
      ],
    },
  ],
  "port-emissions": [
    {
      id: "pe-1",
      lat: 52.3895,
      lng: 4.9125,
      severity: "critical",
      label: "Container Terminal",
      value: "850 tonnes CO2/day",
      location: "Main Port Terminal",
      description: "Highest emission density from cargo operations. Opportunity for shore power installation.",
      recommendations: [
        "Install shore power infrastructure",
        "Incentivize low-emission vessels",
        "Optimize berth scheduling",
      ],
    },
    {
      id: "pe-2",
      lat: 52.3778,
      lng: 4.9245,
      severity: "high",
      label: "Cruise Terminal",
      value: "320 tonnes CO2/day",
      location: "Passenger Terminal",
      description: "Cruise ships idling during turnaround create emission spikes. High visibility location.",
      recommendations: [
        "Implement shore power for cruise ships",
        "Reduce turnaround times",
      ],
    },
    {
      id: "pe-3",
      lat: 52.3645,
      lng: 4.8925,
      severity: "medium",
      label: "Fishing Harbor",
      value: "45 tonnes CO2/day",
      location: "West Fishing Port",
      description: "Small vessel emissions. Opportunity for fleet modernization program.",
      recommendations: [
        "Subsidize electric vessel conversion",
        "Install charging infrastructure",
      ],
    },
  ],
  "biodiversity": [
    {
      id: "bd-1",
      lat: 52.3612,
      lng: 4.8795,
      severity: "high",
      label: "Corridor Gap",
      value: "500m break",
      location: "Central Park to River",
      description: "Critical gap in green corridor network. Species movement restricted between key habitats.",
      recommendations: [
        "Create pollinator pathway with native plants",
        "Install wildlife crossing features",
        "Partner with adjacent property owners",
      ],
    },
    {
      id: "bd-2",
      lat: 52.3725,
      lng: 4.8985,
      severity: "medium",
      label: "Urban Meadow Site",
      value: "12 species gap",
      location: "Civic Center Grounds",
      description: "Underutilized lawn area ideal for meadow conversion. Could support 12+ additional species.",
      recommendations: [
        "Convert lawn to native meadow",
        "Install insect hotels and bird boxes",
      ],
    },
    {
      id: "bd-3",
      lat: 52.3856,
      lng: 4.9168,
      severity: "low",
      label: "Street Tree Opportunity",
      value: "8 nesting sites",
      location: "Oak Avenue",
      description: "Mature tree corridor with potential for enhanced nesting habitat.",
      recommendations: [
        "Install nest boxes for target species",
        "Protect existing mature trees",
      ],
    },
  ],
  "restoration": [
    {
      id: "rs-1",
      lat: 52.3545,
      lng: 4.8652,
      severity: "high",
      label: "Wetland Site",
      value: "4,200 tonnes CO2/yr",
      location: "Former Industrial Land",
      description: "Degraded wetland with high restoration potential. Could sequester 4,200 tonnes CO2 annually.",
      recommendations: [
        "Remove invasive species",
        "Restore natural hydrology",
        "Plant native wetland species",
      ],
    },
    {
      id: "rs-2",
      lat: 52.3825,
      lng: 4.8875,
      severity: "medium",
      label: "Urban Forest",
      value: "2,100 tonnes CO2/yr",
      location: "North Hill Slopes",
      description: "Reforestation opportunity on underutilized slopes. Native forest could provide multiple benefits.",
      recommendations: [
        "Plant native tree mix",
        "Create access trails for community",
      ],
    },
    {
      id: "rs-3",
      lat: 52.3665,
      lng: 4.9285,
      severity: "medium",
      label: "Riparian Zone",
      value: "1,500 tonnes CO2/yr",
      location: "River Corridor",
      description: "Degraded riverbank with erosion issues. Riparian restoration would improve water quality and habitat.",
      recommendations: [
        "Stabilize banks with bioengineering",
        "Plant riparian buffer vegetation",
      ],
    },
  ],
};

export const moduleInsights: Record<string, Array<{
  type: "insight" | "recommendation" | "warning";
  title: string;
  description: string;
  confidence?: number;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
}>> = {
  "urban-heat": [
    {
      type: "insight",
      title: "Temperature Trend Analysis",
      description: "Urban core temperatures have increased 0.8°C over the past 5 years, outpacing regional climate trends by 40%.",
      confidence: 94,
    },
    {
      type: "recommendation",
      title: "Priority: Tree Planting Program",
      description: "Planting 500 trees in identified hotspots could reduce peak temperatures by 2-3°C and benefit 45,000 residents.",
      impact: "high",
      effort: "medium",
    },
    {
      type: "warning",
      title: "Vulnerable Population Alert",
      description: "3 senior care facilities located in high-heat zones. Consider cooling center expansion.",
      confidence: 89,
    },
  ],
  "coastal-plastic": [
    {
      type: "insight",
      title: "7-Day Accumulation Forecast",
      description: "Easterly winds forecast will increase Marina Beach accumulation by 40% this week. Pre-position cleanup resources.",
      confidence: 87,
    },
    {
      type: "recommendation",
      title: "Install River Interceptors",
      description: "Three strategically placed river boom systems could capture 60% of plastic before it reaches the coast.",
      impact: "high",
      effort: "medium",
    },
  ],
  "ocean-plastic": [
    {
      type: "insight",
      title: "Debris Classification Summary",
      description: "AI analysis of 15,420 items: 45% packaging, 28% fishing gear, 15% single-use plastics, 12% other.",
      confidence: 92,
    },
    {
      type: "recommendation",
      title: "Target Fishing Gear",
      description: "Partner with fishing cooperatives on gear return program. Could reduce marine debris by 28%.",
      impact: "high",
      effort: "low",
    },
  ],
  "port-emissions": [
    {
      type: "insight",
      title: "Emission Pattern Analysis",
      description: "Peak emissions occur Tuesday-Thursday during cargo operations. Weekend cruise traffic creates secondary peak.",
      confidence: 96,
    },
    {
      type: "recommendation",
      title: "Shore Power Priority",
      description: "Installing shore power at berths 1-3 would eliminate 40% of port emissions.",
      impact: "high",
      effort: "high",
    },
    {
      type: "warning",
      title: "Air Quality Impact",
      description: "Port emissions contribute to 15% of downtown PM2.5 levels during peak operations.",
      confidence: 82,
    },
  ],
  "biodiversity": [
    {
      type: "insight",
      title: "Species Connectivity Analysis",
      description: "Current green corridor network supports 47 species. Closing 2 key gaps could increase this to 65+ species.",
      confidence: 88,
    },
    {
      type: "recommendation",
      title: "Pollinator Pathway",
      description: "Creating 2km pollinator pathway would connect 4 isolated habitat patches and support 12 bee species.",
      impact: "high",
      effort: "low",
    },
  ],
  "restoration": [
    {
      type: "insight",
      title: "Carbon Sequestration Potential",
      description: "Identified sites could sequester 12,000 tonnes CO2 annually when fully restored - equivalent to 2,600 cars.",
      confidence: 91,
    },
    {
      type: "recommendation",
      title: "Wetland Restoration Priority",
      description: "The former industrial site offers best ROI: $45 per tonne CO2 sequestered, plus flood mitigation benefits.",
      impact: "high",
      effort: "medium",
    },
  ],
};
