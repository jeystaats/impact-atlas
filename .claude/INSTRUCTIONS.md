# Impact Atlas for Cities – Feature Overview

## 0. Product Summary

Impact Atlas for Cities is a web platform that helps **cities, regions and countries** find their **fastest, highest-impact climate and health wins**.

It answers one question:
> "Where should we act first to get the most impact on people and nature?"

Core dimensions:
- Urban heat & tree equity
- Air pollution exposure
- Coastal plastic hotspots
- Port emissions
- Biodiversity-friendly streets
- Land restoration opportunities

The platform has:
- A **landing page**: storytelling, snap-scroll presentation for demos
- An **app dashboard**: simple multi-module view with "quick wins" per city

---

## 1. Primary Users

- City climate officers
- Urban / regional planners
- National environment / climate teams

Constraints:
- Busy, data-literate, not "tech hobbyists"
- Want clear, ranked actions, not raw data dumps

---

## 2. Core Concepts

**City / Region context**
- User selects a city or region (e.g. "Barcelona", "Rotterdam Region").
- All modules and maps are scoped to that selection.

**Module**
- Self-contained domain:
  - Urban Heat & Tree Equity
  - Air Pollution Exposure
  - Coastal Plastic Hotspots
  - Port Emissions Pulse
  - Biodiversity Streets Copilot
  - Restoration Opportunity Finder

**Hotspot**
- A spatial unit (neighborhood / grid cell / coastal segment / port area) with:
  - A risk / opportunity score
  - A short explanation
  - 1–3 suggested actions

**Quick win**
- A ranked action with:
  - Clear "what to do" text
  - Impact estimate (simple)
  - Effort band (low / medium / high)
  - Module tag

---

## 3. Platform – Main Features

### 3.1 App Shell

- **Top bar**
  - Product logo: `Impact Atlas for Cities`
  - City/region selector (pill dropdown)
  - "AI copilot" button
  - User avatar (stubbed for hackathon)

- **Sidebar (floating)**
  - Sections:
    - Overview
    - Modules
    - City Playbook
    - Data & Sources
  - Collapsible icons + labels

### 3.2 Overview Screen: "Impact Radar"

Purpose: One-glance view of **where the biggest wins are** for the selected city.

Features:
- Summary metrics row:
  - `# of heat hotspots`
  - `# of air hotspots`
  - `# of coastal plastic hotspots`
  - `# of restoration areas`
- Bento-style module grid:
  - One tile per module
  - Each tile shows:
    - 1–2 key metrics (e.g. "13 high-risk heat blocks")
    - "Quick wins available: X"
    - "View module" button
- Right side: AI "Next Best Actions" list
  - 3–5 actions across modules
  - For each: title, module, impact tag (high / medium), short sentence

### 3.3 Module Detail – Generic Pattern

All modules follow a **consistent layout**:

- Left side: map or data viz
- Right side: hotspot list + detail panel

#### For each module detail view:

Common features:
- Map / visual:
  - Basemap (city outline)
  - Hotspot polygons or points (colored by score)
- Hotspot list:
  - Ranked list (score desc)
  - Each item: name/ID, main score, "View on map"
- Hotspot detail panel:
  - Title (e.g. neighborhood name / coastal segment / port area)
  - Key metrics (2–4 numbers)
  - Short explanation ("Why this is a hotspot")
  - Simple action list (2–3 bullet actions)
  - Button: "Add to City Playbook"

##### 3.3.1 Urban Heat & Tree Equity

- Map:
  - Neighborhood / grid cells colored by "Heat Equity Index"
- Hotspot metrics:
  - Heat increase vs city avg (°C)
  - Tree canopy % vs target %
  - Population (est.)
- Extra:
  - "Trees needed to hit target canopy" (simple number)
  - Basic list of "candidate planting zones" (sidewalks / parking / parks – text only)

##### 3.3.2 Air Pollution Exposure

- Map:
  - Grid / neighborhoods colored by exposure index
- Hotspot metrics:
  - PM2.5 / NO₂ proxy (simple score)
  - Population exposed
  - Downwind from traffic / port / industry (boolean tags)
- Actions:
  - Low-cost interventions (e.g. "traffic calming", "low-emission zone", "trees as buffer" – text suggestions)

##### 3.3.3 Coastal Plastic Hotspots

- Map:
  - Coastal line segments / beaches colored by plastic risk index
- Metrics:
  - Relative "plastic risk score"
  - Nearby population / visitors (rough)
  - Distance to river mouths / ports (approx tags)
- Actions:
  - "Prioritize cleanup at segment X"
  - "Investigate upstream source area Y"

##### 3.3.4 Port Emissions Pulse

- Map:
  - Port area polygons / grid cells colored by emissions index
- Metrics:
  - Relative "port emissions index"
  - Pop. within buffer distance
  - Wind-exposed neighborhoods (simple tag)
- Actions:
  - "Shore power at berths A/B"
  - "Speed/idle limits in zone C"

##### 3.3.5 Biodiversity Streets Copilot

- Map:
  - Street segments with potential green corridors highlighted
- Metrics:
  - Existing green patch connectivity (simple score)
  - Street length that can be greened
- Actions:
  - Suggestions for planting strips, pocket parks, native species (text)

##### 3.3.6 Restoration Opportunity Finder

- Map:
  - Non-urban land cells colored by "restoration potential" (forest / wetland / grassland)
- Metrics:
  - Area (ha)
  - Suggested restoration type
- Actions:
  - "Convert X ha to wetland / forest" with short co-benefit explanation

### 3.4 City Action Playbook

Purpose: One **central list of actions** chosen from any module.

Features:
- Filter: by module, impact level, effort
- List of actions:
  - Title, module tag, impact (high/medium/low), effort band
  - Short description
  - Linked hotspot / module
- Export:
  - "Export simple CSV / JSON" (stubbed – just a button and sample payload)

### 3.5 AI Copilot (Stubbed UX)

- Right-side drawer that can open from any main screen.
- Initial prompt: "Explain this hotspot" or "Suggest 3 quick wins for [city]."
- For hackathon: generate **dummy, static responses** but design the UX as if real.

---

## 4. Landing Page – Storytelling (Snap Scroll)

The landing page is a **scroll-driven pitch deck** with full-height sections and simple animations (GSAP-style).

### 4.1 Overall

- Snap between full-screen sections.
- Side dots / progress indicator (optional).
- Dark, cinematic style (charcoal background), one accent (teal/blue-green).
- Use Unsplash-style placeholders:
  - Aerial city
  - Heat map overlay
  - Coastal plastic beach
  - Port/ships
  - Forest / restoration

### 4.2 Sections

1. **Problem (Hero)**
   - Headline: cities are blind to their quickest climate & health wins.
   - 2–3 bullet pains:
     - Scattered data
     - Slow analysis
     - People & budgets at risk
   - Visual: split city (hot/smog vs cool/green) – just describe it.

2. **Vision**
   - One sentence: Impact Atlas = "an impact radar for your city".
   - Visual: simple map with glowing hotspots (abstract).

3. **Modules Overview**
   - 5–6 tiles, one per module.
   - For each: name, 1-line description, icon.

4. **How It Works (AI + Data)**
   - Simple 3-step story: "Ingest → Analyze → Suggest quick wins".
   - Logos: Google, NVIDIA, Copernicus, NOAA, GFW, GBIF, OSM (as text or generic badges).

5. **City Story**
   - Example: "In 24 hours for City X, we found: A heat hotspots, B air hotspots, C plastic hotspots, D ha of restoration."
   - Visual: small composed map + metrics.

6. **Call to Action**
   - Headline: "Give your city an Impact Atlas."
   - CTAs:
     - "See demo"
     - "View hackathon prototype"

---

## 5. Hackathon Constraints

- Focus on:
  - Overview screen
  - 1–2 fully designed module detail views (Heat & Trees, Air)
  - City Playbook list
  - Storytelling landing page
- Use stubbed / synthetic data:
  - Enough to look real (scores, counts, maps), no heavy ETL.
- Optimize for:
  - Clear narrative
  - Clean, modern UI
  - Simple but believable data transformations

---

## 6. Design System Notes

- **Theme**: Light theme with clean white/gray backgrounds
- **Accent color**: Teal/blue-green family (`#0D9488` primary)
- **Typography**: Clean sans-serif (Geist Sans)
- **Cards**: Subtle shadows, rounded corners (`16px`)
- **Glass effects**: Light glassmorphism for overlays
- **Animations**: Subtle, purposeful transitions
