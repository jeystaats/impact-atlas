# Impact Atlas - Implementation Tasks

Step-by-step tasks organized by priority. Complete each phase before moving to the next.

---

## Phase 1: Fix Broken UX (Critical)

### Task 1.1: Create Missing Pages
```
Files to create:
- src/app/dashboard/quick-wins/page.tsx
- src/app/dashboard/plans/page.tsx
```

**Quick Wins Page Requirements:**
- List all quick wins from all modules
- Filter by module/severity
- Mark as complete functionality

**Action Plans Page Requirements:**
- List saved action plans
- Create new plan workflow
- Plan status tracking

---

### Task 1.2: Fix Navbar Navigation

**File:** `src/components/layout/Navbar.tsx`

Options:
1. Add section IDs to landing page:
   - `id="features"` on ModulesGrid
   - `id="modules"` on modules section
   - Remove Pricing/About (or create pages)

2. Or create separate pages:
   - `/features`
   - `/modules`
   - `/pricing`
   - `/about`

---

### Task 1.3: Fix Non-Functional Buttons

**Sign In Button** (`Navbar.tsx:49-51`)
```tsx
// Add onClick or wrap with Link
<Link href="/auth/signin">
  <Button variant="ghost" size="sm">Sign In</Button>
</Link>
```

**Watch Demo** (`Hero.tsx:89-91`)
```tsx
// Option A: Modal with video
<Button variant="outline" size="lg" onClick={() => setShowDemoModal(true)}>
  Watch Demo
</Button>

// Option B: Link to YouTube/Vimeo
<a href="https://youtube.com/..." target="_blank">
  <Button variant="outline" size="lg">Watch Demo</Button>
</a>
```

**Schedule Demo** (`CTA.tsx:32-34`)
```tsx
// Option A: Calendly embed
<Button variant="outline" size="xl" onClick={() => openCalendly()}>

// Option B: Contact form modal
<Button variant="outline" size="xl" onClick={() => setShowContactForm(true)}>
```

**View All Activity** (`dashboard/page.tsx:83-85`)
```tsx
<Link href="/dashboard/activity">
  <button className="text-sm text-[var(--accent)] hover:underline">
    View all
  </button>
</Link>
```

---

## Phase 2: Core Features

### Task 2.1: Authentication Setup

**Install dependencies:**
```bash
npm install next-auth @auth/prisma-adapter
# or
npm install @clerk/nextjs
```

**Files to create:**
```
src/app/auth/signin/page.tsx
src/app/auth/signup/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/lib/auth.ts
```

**Update existing:**
- `Navbar.tsx` - Sign in/out logic
- `Sidebar.tsx` - Real user data
- `layout.tsx` (dashboard) - Auth check

---

### Task 2.2: Real Map Integration

**Install Mapbox:**
```bash
npm install react-map-gl mapbox-gl
npm install -D @types/mapbox-gl
```

**Replace** `src/components/modules/MapVisualization.tsx`:
- Use react-map-gl
- Convert hotspot positions to lat/lng
- Add zoom/pan controls
- Add click handlers for hotspots

**Update** `src/data/hotspots.ts`:
- Add real coordinates (lat, lng)

---

### Task 2.3: Database Setup

**Option A: Prisma + PostgreSQL**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Schema needs:**
```prisma
model User { ... }
model Module { ... }
model City { ... }
model Hotspot { ... }
model ActionPlan { ... }
model QuickWin { ... }
```

**Option B: Supabase**
```bash
npm install @supabase/supabase-js
```

---

### Task 2.4: API Routes

**Create:**
```
src/app/api/modules/route.ts         - GET all, POST new
src/app/api/modules/[id]/route.ts    - GET one, PUT, DELETE
src/app/api/cities/route.ts          - GET all, POST new
src/app/api/hotspots/route.ts        - GET by module
src/app/api/action-plans/route.ts    - CRUD
src/app/api/quick-wins/route.ts      - CRUD
```

---

## Phase 3: Feature Completion

### Task 3.1: Module Detail Actions

**File:** `src/app/dashboard/modules/[moduleId]/page.tsx`

**Create Action Plan:**
```tsx
const handleCreatePlan = async () => {
  // 1. Open modal with form
  // 2. Collect plan details
  // 3. POST to /api/action-plans
  // 4. Navigate to plans page
}
```

**Export:**
```tsx
const handleExport = async (format: 'pdf' | 'csv') => {
  // 1. Gather module + hotspots data
  // 2. Generate file (use jspdf or similar)
  // 3. Trigger download
}
```

**Share:**
```tsx
const handleShare = async () => {
  // 1. Generate shareable link with params
  // 2. Copy to clipboard / open share modal
}
```

---

### Task 3.2: Command Palette Actions

**File:** `src/components/copilot/CommandPalette.tsx`

Replace console.log with real actions:
```tsx
{
  id: "export",
  action: () => {
    // Call export service
    exportCurrentView()
  }
},
{
  id: "share",
  action: () => {
    // Open share modal or copy link
    shareCurrentView()
  }
}
```

---

### Task 3.3: Filter System

**File:** `src/components/modules/ModuleLayout.tsx`

Add:
```tsx
const [dateFilter, setDateFilter] = useState<DateRange>()

// Filter button opens date picker
<DateRangePicker
  value={dateFilter}
  onChange={setDateFilter}
/>

// Pass filter to map/data components
<MapVisualization hotspots={filteredHotspots} />
```

---

### Task 3.4: Footer Pages

Decide which to implement:
- `/privacy` - Privacy Policy (required)
- `/terms` - Terms of Service (required)
- `/about` - About page (recommended)
- `/contact` - Contact form (recommended)

Others can link to external resources or be removed.

---

## Phase 4: Enhancements

### Task 4.1: Demo Video
- Record product walkthrough
- Host on YouTube/Vimeo
- Create modal player component

### Task 4.2: Demo Scheduling
```bash
npm install react-calendly
```
Or build contact form with email service (Resend/SendGrid)

### Task 4.3: Data Visualizations
```bash
npm install recharts
# or
npm install @nivo/core @nivo/line @nivo/bar
```

Add charts to:
- Dashboard overview
- Module detail (trends over time)

### Task 4.4: Notifications
```bash
npm install sonner  # Toast notifications
```

Add toast notifications for:
- Action completed
- Export ready
- Error states

---

## File Change Summary

### New Files (Minimum)
```
src/app/dashboard/quick-wins/page.tsx
src/app/dashboard/plans/page.tsx
src/app/auth/signin/page.tsx
src/app/auth/signup/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/modules/route.ts
src/app/api/cities/route.ts
src/app/api/hotspots/route.ts
src/app/api/action-plans/route.ts
src/lib/auth.ts
src/lib/db.ts
prisma/schema.prisma
```

### Modified Files
```
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/components/landing/Hero.tsx
src/components/landing/CTA.tsx
src/components/dashboard/Sidebar.tsx
src/components/modules/MapVisualization.tsx
src/components/modules/ModuleLayout.tsx
src/components/copilot/CommandPalette.tsx
src/app/dashboard/page.tsx
src/app/dashboard/modules/[moduleId]/page.tsx
src/data/hotspots.ts
```
