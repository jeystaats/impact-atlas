# Impact Atlas - Comprehensive Improvement Plan

**Generated**: December 3, 2025
**Tech Stack**: Next.js 16, React 19, Convex, Clerk, Mapbox, Framer Motion, Zustand, Tailwind CSS 4
**Codebase**: 136 TypeScript files, 90 components, ~27K lines

---

## Executive Summary

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Component LOC compliance | 69% | >95% | High |
| SSR adoption | 0% | 60% | High |
| SEO coverage | 7.7% | 100% | High |
| Mobile touch compliance | ~40% | 100% | Medium |
| Type duplication | High | <5% | Medium |
| Widescreen optimization | None | Full | Low |

---

## 1. By Page

### Landing Page (`/page.tsx`)

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| Fully client-side | Convert to Server Component with static content | High |
| No page-level SEO | Add comprehensive metadata, OG images | High |
| No structured data | Add Organization + WebApplication schema | Medium |
| Hero text sizing | Reduce on mobile (currently `clamp(2.5rem, 8vw, 5.5rem)`) | Low |

**Implementation:**
```typescript
// app/page.tsx (Server Component)
export const metadata: Metadata = {
  title: "Impact Atlas | AI-Powered Climate Intelligence for Cities",
  description: "Discover your city's fastest, highest-impact climate wins...",
  openGraph: {
    images: [{ url: "/og-image-home.png", width: 1200, height: 630 }],
  },
};

export default function LandingPage() {
  return (
    <div className="landing-dark">
      <HeroSection />
      <Suspense fallback={<ModulesSkeleton />}>
        <ClientInteractiveSections />
      </Suspense>
    </div>
  );
}
```

---

### Dashboard (`/dashboard/page.tsx`)

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| All client-side | Hybrid approach with preloaded data | High |
| Stats cards layout | Horizontal scroll on mobile | Medium |
| Map height | Reduce from 450px to 300px on mobile | Medium |
| No widescreen layout | Add 3-column grid on 1920px+ | Low |

**Implementation:**
```typescript
// Use Convex preloadQuery for initial data
import { preloadQuery } from "convex/nextjs";

export default async function DashboardPage() {
  const preloadedCity = await preloadQuery(api.cities.getDefault);
  return <ClientDashboard preloadedCity={preloadedCity} />;
}
```

---

### Plans Page (`/dashboard/plans/page.tsx`) - 1,030 lines

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| File too large (1,030 lines) | Split into 5 components | Critical |
| Mock data inline | Move to `/data/mockActionPlans.ts` | Medium |

**Split into:**
1. `PlansPageContainer.tsx` (150 lines) - layout, state
2. `PlanCard.tsx` (120 lines) - individual plan display
3. `PlanFilters.tsx` (100 lines) - filtering UI
4. `PlanStats.tsx` (80 lines) - statistics section
5. `EmptyPlansState.tsx` (50 lines) - empty state

---

### Quick Wins Page (`/dashboard/quick-wins/page.tsx`) - 798 lines

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| File too large (798 lines) | Split into 4 components | Critical |

**Split into:**
1. `QuickWinsContainer.tsx` (150 lines)
2. `QuickWinCard.tsx` (100 lines)
3. `QuickWinFilters.tsx` (120 lines)
4. `ImpactMatrix.tsx` (80 lines)

---

### Module Pages (`/dashboard/modules/[moduleId]/page.tsx`)

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No dynamic metadata | Add `generateMetadata` function | High |
| Filter panel | Convert to bottom sheet on mobile | Medium |
| Legend | Make collapsible on mobile | Medium |

**Implementation:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const module = await getModule(params.moduleId);
  return {
    title: `${module.name} | Impact Atlas`,
    description: module.description,
    openGraph: { images: [`/og-modules/${params.moduleId}.png`] }
  };
}
```

---

### Settings Page (`/dashboard/settings/page.tsx`)

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| No SEO (expected for authenticated) | Add `robots: { index: false }` | Low |
| Form inputs | Add `inputMode` and `autocomplete` | Medium |

---

### About & Team Pages

| Issue | Recommendation | Priority |
|-------|----------------|----------|
| Fully client-side | Convert to Server Components | High |
| No metadata | Add page-specific SEO | High |

---

## 2. By Feature

### Maps (5 implementations, 4,000+ lines total)

**Current State:**
- `AirQualityMap.tsx` - 998 lines
- `OceanDebrisMap.tsx` - 772 lines
- `MapVisualization.tsx` - 686 lines
- `PlasticFlowMap.tsx` - 537 lines
- `CityOverviewMap.tsx`

**Issues:**
- Duplicated Mapbox initialization
- Duplicated navigation controls
- Duplicated marker rendering
- No shared layer system

**Recommendation:** Create layered architecture

```
src/components/maps/
  BaseMap.tsx (200 lines)
    - Initialization
    - Controls
    - Style management

  layers/
    HeatmapLayer.tsx
    MarkerLayer.tsx
    GeoJSONLayer.tsx
    FlowAnimationLayer.tsx

  controls/
    MapControls.tsx
    MapLegend.tsx
```

**Mobile Optimization:**
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

<Map
  touchZoomRotate={isMobile}
  dragRotate={!isMobile}
  cooperativeGestures={isMobile}
/>
```

---

### Charts (4 implementations, 2,900+ lines total)

**Current State:**
- `BarChart.tsx` - 735 lines
- `AreaChart.tsx` - 718 lines
- `DonutChart.tsx` - ~700 lines
- `TrendChart.tsx` - ~700 lines

**Issues:**
- Duplicated configuration logic
- Duplicated axis/grid components
- Duplicated tooltip implementations

**Recommendation:** Unified chart system

```typescript
// src/components/charts/Chart.tsx
export const Chart = ({ type, data, config }) => {
  const ChartComponent = chartTypes[type];
  return (
    <ChartContainer config={config}>
      <ChartComponent data={data} />
    </ChartContainer>
  );
};

// Shared utilities
// src/lib/chartConfig.ts
// src/lib/chartUtils.ts
```

---

### Cards (5+ implementations)

**Current State:**
- ModuleCard
- StatCard
- QuickWinCard
- ActionPlanCard
- Custom implementations

**Recommendation:** Create `<UniversalCard />`

```typescript
// src/components/ui/card-system.tsx
export const Card = ({ variant, interactive, children }) => (
  <div className={cn("card", variants[variant], interactive && "card-interactive")}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, actions }) => (/* ... */);
export const CardBody = ({ children }) => (/* ... */);
export const CardFooter = ({ children }) => (/* ... */);
```

---

### Modals (4+ implementations)

**Current State:**
- ActionPlanModal (601 lines)
- EnhancedCityLoadingModal (554 lines)
- AISuggestionModal
- Custom modals in pages

**Recommendation:** Radix Dialog + variants

```typescript
// src/components/modals/Modal.tsx
import * as Dialog from '@radix-ui/react-dialog';

export const Modal = ({ size, children }) => (
  <Dialog.Root>
    <Dialog.Portal>
      <Dialog.Overlay className="modal-overlay" />
      <Dialog.Content className={cn("modal-content", sizes[size])}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

---

### Filters

**Current State:**
- `FilterPanel.tsx` - 817 lines
- Duplicated filter logic across modules
- Animation variants repeated

**Recommendation:**
1. Centralize to `/lib/filters.ts` (already exists)
2. Create `<UniversalFilterPanel />`
3. Convert to bottom sheet on mobile

---

### Authentication (Clerk)

**Current State:** Well-integrated with Clerk

**Improvements:**
- Add Convex + Clerk SSR integration
- Pre-fetch user data server-side

```typescript
// app/dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  const preloadedUser = await preloadQuery(api.users.get, { clerkId: userId });

  return (
    <PreloadedQueryProvider preloadedQuery={preloadedUser}>
      <DashboardShell>{children}</DashboardShell>
    </PreloadedQueryProvider>
  );
}
```

---

## 3. By Topic

### Architecture

#### Component Size Violations

| Component | Lines | Max | Action |
|-----------|-------|-----|--------|
| plans/page.tsx | 1,030 | 300 | Split into 5 files |
| AirQualityMap.tsx | 998 | 300 | Split into 6 files |
| FilterPanel.tsx | 817 | 300 | Extract reusable filters |
| quick-wins/page.tsx | 798 | 300 | Split into 4 files |
| OceanDebrisMap.tsx | 772 | 300 | Use BaseMap system |
| TeamMembersSection.tsx | 742 | 300 | Extract sub-components |
| CitySearchInput.tsx | 735 | 300 | Split logic/UI |
| BarChart.tsx | 735 | 300 | Use Chart system |
| AreaChart.tsx | 718 | 300 | Use Chart system |
| MapVisualization.tsx | 686 | 300 | Use BaseMap system |

**Total:** 28 files exceed 400 lines (31% non-compliant)

---

### TypeScript

#### Type Duplication (Critical)

**Problem:** Types defined in both `/src/types/index.ts` AND `convex/schema.ts`

| Type | Frontend | Convex | Action |
|------|----------|--------|--------|
| Module | 8 fields | 20+ fields | Use Convex types |
| City | 6 fields | 10+ fields | Use Convex types |
| Hotspot | 9 fields | 15+ fields | Use Convex types |
| QuickWin | 7 fields | 12+ fields | Use Convex types |

**Solution:**
```typescript
// Delete /src/types/index.ts
// Use throughout app:
import { Doc, Id } from "@/convex/_generated/dataModel";

type Module = Doc<"modules">;
type City = Doc<"cities">;
```

#### Missing Utility Types

```typescript
// src/types/geo.ts
export type Coordinates = { lat: number; lng: number };
export type BoundingBox = { north: number; south: number; east: number; west: number };

// src/types/api.ts
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

#### `v.any()` Usage in Schema

| Location | Line | Recommendation |
|----------|------|----------------|
| hotspots.metadata | 192 | Define explicit schema |
| aiInsights.metadata | 398 | Define explicit schema |
| chatMessages.metadata | 495 | Define explicit schema |
| satelliteData.rawMetadata | 609 | Define explicit schema |

---

### Performance

#### SSR Adoption

**Current:** 0% (110 "use client" files, 0 "use server" files)

**Target Architecture:**
```
Server Components (60%):
  - Landing page shell
  - About page
  - Team page
  - Dashboard shells
  - Initial data loading

Client Components (40%):
  - Interactive maps
  - Charts
  - Forms
  - Real-time data
```

**Implementation Priority:**
1. Landing page → Server Component
2. About/Team pages → Server Components
3. Dashboard shell → Server Component with client islands
4. Module pages → Hybrid with preloaded data

---

### SEO

#### Coverage

| Page | Has Metadata | Has OG | Has Structured Data |
|------|--------------|--------|---------------------|
| Layout (global) | Yes | Partial | No |
| Landing | No | No | No |
| About | No | No | No |
| Team | No | No | No |
| Dashboard | No | No | N/A |
| Plans | No | No | N/A |
| Quick Wins | No | No | N/A |
| Settings | No | No | N/A |
| Modules | No | No | No |

#### Required Actions

1. **Add metadata to all public pages**
2. **Create OG images** for each page
3. **Add structured data:**
   - Organization schema
   - WebApplication schema
   - BreadcrumbList schema
   - Dataset schema (for climate data)
4. **Create sitemap.ts**
5. **Create robots.ts**

---

### Mobile UX

#### Touch Targets (Critical)

**Undersized elements found:**
- Icon buttons: `w-4 h-4` (16px) - below 44px minimum
- Filter chips: ~32px height
- Map markers

**Fix:**
```typescript
const TouchableIcon = ({ size = "md", children }) => (
  <button className="min-w-[44px] min-h-[44px] flex items-center justify-center">
    <Icon className={iconSizes[size]} />
  </button>
);
```

#### Layout Issues

| Issue | Location | Fix |
|-------|----------|-----|
| Horizontal overflow | Stats grid | Add `overflow-x-auto snap-x` |
| Map too tall | Dashboard | Reduce to 300px on mobile |
| Filter panel | Modules | Convert to bottom sheet |
| Form zoom | Inputs | Ensure `text-base` (16px min) |

---

### Widescreen / TV

#### Current State
- Max container: 1400px
- No `xl:`/`2xl:` usage beyond `lg:`
- No spatial navigation
- No keyboard shortcuts

#### Recommendations

```typescript
// tailwind.config.ts - Add breakpoints
theme: {
  screens: {
    '3xl': '1920px',
    'ultrawide': '2560px',
  }
}
```

**Dashboard widescreen layout:**
```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 3xl:grid-cols-6 gap-4">
  {stats.map(stat => <StatCard {...stat} />)}
</div>
```

**Keyboard navigation:**
```typescript
useKeyboardShortcuts({
  'ArrowLeft': () => previousModule(),
  'ArrowRight': () => nextModule(),
  'Enter': () => selectHotspot(),
  'Escape': () => closePanel(),
});
```

---

### Accessibility

#### Missing ARIA

- Icon-only buttons lack `aria-label`
- Map markers missing `role="button"`
- Filter checkboxes missing proper labeling

#### Color Contrast

- `--foreground-muted: #9CA3AF` may fail WCAG AA on white
- Chart colors need verification

#### Keyboard Navigation

- Skip links missing
- Focus indicators could be stronger

---

### Analytics (Umami)

**Current State:** Umami script added via Next.js `Script` component

#### Best Practices Checklist

| Practice | Status | Notes |
|----------|--------|-------|
| Use Next.js `Script` component | ✅ Done | Using `strategy="afterInteractive"` |
| Defer loading | ✅ Done | `defer` attribute included |
| Script in `<head>` | ✅ Done | Placed in layout.tsx head |
| CSP headers configured | ⬜ TODO | Add `cloud.umami.is` to script-src |
| Self-hosted consideration | ⬜ Review | Evaluate for GDPR compliance |
| Event tracking setup | ⬜ TODO | Add custom events for CRO |
| Goals configured in Umami | ⬜ TODO | Define conversion goals |
| Funnel tracking | ⬜ TODO | Track user journey funnels |

#### Required Custom Events (CRO)

```typescript
// src/lib/analytics.ts
export const trackEvent = (name: string, data?: object) => {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(name, data);
  }
};

// Key events to track:
// - module_view: User views a module
// - hotspot_click: User clicks on a hotspot
// - quick_win_save: User saves a quick win
// - plan_create: User creates an action plan
// - plan_complete: User completes an action plan
// - cta_click: User clicks a call-to-action
// - signup_start: User begins signup flow
// - signup_complete: User completes signup
```

#### Implementation Priority

1. **Add Content Security Policy header** for `cloud.umami.is`
2. **Create analytics utility** (`/src/lib/analytics.ts`)
3. **Add type declarations** for `window.umami`
4. **Implement key conversion events**
5. **Configure goals and funnels** in Umami dashboard
6. **Add A/B testing capability** for CRO experiments

---

### Norrsken Fixathon Integration

**Status:** Link integration needed

The project was developed during the Norrsken Fixathon. All mentions of "Fixathon" should link to the official event page.

#### Required Changes

| Location | Action |
|----------|--------|
| Landing page | Add "Built at Norrsken Fixathon" badge with link |
| About page | Link Fixathon mentions to https://www.norrsken.org/fixathon |
| Footer | Add Fixathon attribution link |
| README.md | Add Fixathon badge/attribution |

#### Implementation

```typescript
// src/components/ui/FixathonBadge.tsx
export function FixathonBadge() {
  return (
    <a
      href="https://www.norrsken.org/fixathon"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a2e] border border-[#2d2d44] hover:border-[var(--accent)] transition-colors"
    >
      <span className="text-xs text-[var(--foreground-muted)]">Built at</span>
      <span className="text-xs font-semibold text-[var(--foreground)]">Norrsken Fixathon</span>
    </a>
  );
}
```

#### Implementation Priority

1. **Update About page** - Link Fixathon mentions
2. **Add FixathonBadge component** - Reusable component with proper styling
3. **Update landing page footer** - Add attribution
4. **Update README** - Add Fixathon badge

---

### Convex Backend

#### Strengths
- Well-documented schema (689 lines)
- Proper indexing on lookup fields
- Normalized relationships

#### Improvements

1. **Replace `v.any()` with explicit schemas**
2. **Add compound indexes:**
```typescript
.index("by_city_status_priority", ["cityId", "status", "priority"])
```
3. **Add input validation layer**
4. **Add webhook handlers for real-time data**
5. **Add periodic aggregations for dashboard stats**

---

## Implementation Timeline

### Week 1 (Critical)
- [x] Split `plans/page.tsx` into 5 components ✅
- [x] Split `quick-wins/page.tsx` into 4 components ✅
- [x] Add SEO metadata to landing page ✅
- [x] Add SEO metadata to about/team pages ✅
- [x] Fix touch targets (44px minimum) ✅

### Week 2 (High Priority)
- [x] Create BaseMap system ✅
- [x] Refactor AirQualityMap to use BaseMap ✅
- [x] Remove type duplication (use Convex types) ✅
- [ ] Convert landing page to Server Component
- [x] Create OG images ✅

### Week 3 (Medium Priority)
- [ ] Create unified Chart system
- [ ] Create UniversalCard component
- [x] Add structured data (JSON-LD) ✅
- [x] Create sitemap.ts and robots.ts ✅
- [x] Add horizontal scroll for mobile stats ✅
- [x] Set up Umami analytics utility with event tracking ✅
- [x] Add CSP headers for Umami ✅

### Week 4 (Polish)
- [ ] Refactor remaining map components
- [ ] Add widescreen breakpoints
- [x] Add keyboard shortcuts ✅
- [x] Implement reduced motion in components ✅
- [ ] Complete accessibility audit

---

## Metrics Tracking

| Metric | Current | Week 2 | Week 4 | Target |
|--------|---------|--------|--------|--------|
| Component compliance | 69% | 80% | 90% | >95% |
| SSR adoption | 0% | 30% | 50% | 60% |
| SEO coverage | 7.7% | 50% | 100% | 100% |
| Mobile touch compliance | 40% | 70% | 100% | 100% |
| Type duplication | High | Medium | Low | <5% |

---

## Files Reference

### Largest Components (Priority Refactor)
1. `/src/app/dashboard/plans/page.tsx` - 1,030 lines
2. `/src/components/modules/AirQualityMap.tsx` - 998 lines
3. `/src/components/dashboard/FilterPanel.tsx` - 817 lines
4. `/src/app/dashboard/quick-wins/page.tsx` - 798 lines
5. `/src/components/modules/OceanDebrisMap.tsx` - 772 lines

### Type Files
- `/src/types/index.ts` - DELETE (use Convex types)
- `/convex/schema.ts` - Source of truth
- `/convex/_generated/dataModel.d.ts` - Generated types

### CSS
- `/src/app/globals.css` - 620+ lines, well-organized

---

*Generated by Agent Orchestrator coordinating 10 specialist agents*
