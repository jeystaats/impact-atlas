# Impact Atlas - Implementation Roadmap

## Overview

This document outlines all incomplete features, placeholder implementations, and missing functionality in the Impact Atlas application, organized by priority.

---

## Priority 1: Critical (Broken User Experience)

### 1.1 Missing Route Pages

| Issue | File | Line |
|-------|------|------|
| `/dashboard/quick-wins` route missing | `src/components/dashboard/Sidebar.tsx` | 17 |
| `/dashboard/plans` route missing | `src/components/dashboard/Sidebar.tsx` | 18 |

**Action Required:**
- Create `src/app/dashboard/quick-wins/page.tsx`
- Create `src/app/dashboard/plans/page.tsx`

### 1.2 Non-Functional Navbar Links

| Link | Current href | File | Line |
|------|--------------|------|------|
| Features | `#features` | `src/components/layout/Navbar.tsx` | 10 |
| Modules | `#modules` | `src/components/layout/Navbar.tsx` | 11 |
| Pricing | `#pricing` | `src/components/layout/Navbar.tsx` | 12 |
| About | `#about` | `src/components/layout/Navbar.tsx` | 13 |

**Action Required:**
- Add corresponding section IDs to landing page, OR
- Create separate pages for each

### 1.3 Non-Functional Buttons

| Button | File | Line | Issue |
|--------|------|------|-------|
| Sign In | `src/components/layout/Navbar.tsx` | 49-51 | No onClick handler |
| Watch Demo | `src/components/landing/Hero.tsx` | 89-91 | No onClick handler |
| Schedule Demo | `src/components/landing/CTA.tsx` | 32-34 | No onClick handler |
| View All (activity) | `src/app/dashboard/page.tsx` | 83-85 | No onClick/href |

---

## Priority 2: Important (Core Feature Gaps)

### 2.1 Authentication System

**Status:** Not implemented

**Current State:**
- "Jane Doe" hardcoded in `src/components/dashboard/Sidebar.tsx`
- Sign In button non-functional

**Required Implementation:**
- [ ] Auth provider integration (NextAuth.js / Clerk / Auth0)
- [ ] Login/Register pages
- [ ] Protected routes for dashboard
- [ ] User session management
- [ ] User profile page

### 2.2 Map Functionality

**Status:** SVG placeholder only

**Current Files:**
- `src/components/landing/Hero.tsx` - Decorative map
- `src/components/modules/MapVisualization.tsx` - Interactive SVG

**Missing Features:**
- [ ] Real map integration (Mapbox/Leaflet/Google Maps)
- [ ] Zoom controls (buttons exist but no handlers) - Line 166-171
- [ ] Pan/drag functionality
- [ ] Real geographic coordinates
- [ ] Geolocation-based hotspots

### 2.3 Module Detail Actions

**File:** `src/app/dashboard/modules/[moduleId]/page.tsx`

| Button | Line | Current State |
|--------|------|---------------|
| Create Action Plan | 143 | `onClick: () => {}` |
| Learn More | 144 | `onClick: () => {}` |
| Export | 147 | `console.log("Export")` |
| Share | 148 | `console.log("Share")` |

**Required Implementation:**
- [ ] Action plan creation workflow
- [ ] Export functionality (PDF/CSV)
- [ ] Share via link/email

### 2.4 Data Layer

**Status:** All data hardcoded

**Hardcoded Data Files:**
- `src/data/modules.ts` - Module definitions, cities
- `src/data/hotspots.ts` - Hotspot locations

**Hardcoded in Components:**
- Dashboard stats (`src/app/dashboard/page.tsx` lines 46-50)
- Activity log (`src/app/dashboard/page.tsx` lines 105-108)
- AI sample responses (`src/components/dashboard/AICopilot.tsx` lines 25-44)

**Required Implementation:**
- [ ] Database setup (PostgreSQL/Supabase/PlanetScale)
- [ ] API routes for CRUD operations
- [ ] Real-time data fetching
- [ ] Data sync with external sources

---

## Priority 3: Standard (Feature Completion)

### 3.1 Footer Links

**File:** `src/components/layout/Footer.tsx` (lines 7-29)

All footer links point to non-existent anchors:
- Product: `#features`, `#modules`, `#pricing`, `#roadmap`
- Developers: `#docs`, `#api`, `#cases`
- Resources: `#blog`, `#about`, `#careers`, `#contact`
- Legal: `#press`, `#privacy`, `#terms`, `#security`

**Decision Required:**
- Create all pages, OR
- Remove footer links, OR
- Link to external resources

### 3.2 Command Palette Actions

**File:** `src/components/copilot/CommandPalette.tsx`

| Action | Line | Current State |
|--------|------|---------------|
| Export Current View | 87 | `console.log("Export")` |
| Share Dashboard | 95 | `console.log("Share")` |

### 3.3 Filter Functionality

**File:** `src/components/modules/ModuleLayout.tsx`

- Filter by Date button exists but has no onClick handler
- No filter state management
- No filter UI implementation

### 3.4 External Data Integration

**Referenced but not connected:**
- Copernicus Climate Data
- NOAA Weather Data
- OpenStreetMap
- GBIF Biodiversity Data
- Global Forest Watch

---

## Priority 4: Nice to Have (Enhancements)

### 4.1 Demo Video
- Create or embed "Watch Demo" video
- Modal player component

### 4.2 Demo Scheduling
- Calendly/Cal.com integration
- Contact form alternative

### 4.3 Email Notifications
- Alert system for hotspot changes
- Weekly/monthly reports

### 4.4 Advanced Visualizations
- D3.js/Recharts graphs
- Time-series data display
- Comparison views

### 4.5 Mobile Optimization
- Responsive sidebar
- Touch-friendly map controls
- Mobile command palette

### 4.6 Internationalization
- Multi-language support
- Localized data formats

---

## Implementation Order Recommendation

```
Phase 1 - Fix Critical UX
├── Create missing route pages
├── Fix navigation links
└── Make all buttons functional (or remove)

Phase 2 - Core Features
├── Authentication system
├── Real map integration
└── Database + API layer

Phase 3 - Feature Complete
├── Export/Share functionality
├── Action plan workflow
├── Filter system
└── Footer pages

Phase 4 - Polish
├── Demo video
├── External data APIs
├── Advanced visualizations
└── Mobile optimization
```

---

## Quick Reference: Files to Modify

| Priority | Files |
|----------|-------|
| P1 | `Sidebar.tsx`, `Navbar.tsx`, `Hero.tsx`, `CTA.tsx`, `page.tsx` (dashboard) |
| P2 | New auth files, `MapVisualization.tsx`, `[moduleId]/page.tsx`, new API routes |
| P3 | `Footer.tsx`, `CommandPalette.tsx`, `ModuleLayout.tsx` |
| P4 | New components for video, scheduling, notifications |
