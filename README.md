# Impact Atlas

A real-time environmental monitoring dashboard for cities, helping urban planners and sustainability officers track and address environmental challenges like urban heat islands, coastal plastic pollution, ocean debris, port emissions, biodiversity loss, and ecosystem restoration.

## Features

- **Multi-city Support**: Add and monitor multiple cities with AI-generated environmental data
- **Six Environmental Modules**:
  - Urban Heat Islands - Track temperature anomalies and heat hotspots
  - Coastal Plastic - Monitor plastic debris along coastlines
  - Ocean Plastic - Track ocean-borne plastic pollution
  - Port Emissions - Monitor shipping and port environmental impact
  - Biodiversity - Track species health and habitat conditions
  - Restoration - Monitor ecosystem restoration projects
- **AI-Powered Insights**: OpenAI-generated hotspots, quick wins, and recommendations
- **Interactive Maps**: Mapbox-powered visualizations with real-time data layers
- **Action Planning**: Create and track environmental action plans
- **Quick Wins**: Actionable sustainability tasks with impact tracking

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Convex (real-time backend)
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **AI**: OpenAI GPT-4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account
- OpenAI API key
- Mapbox access token

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI
OPENAI_API_KEY=sk-...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyj...
```

### Installation

```bash
# Install dependencies
npm install

# Start Convex development server (in a separate terminal)
npx convex dev

# Seed the database with initial data
npx convex run seed:seedModules
npx convex run seed:seedCities

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard pages
│   │   ├── modules/        # Module-specific views
│   │   ├── plans/          # Action plans
│   │   └── quick-wins/     # Quick wins page
│   └── api/                # API routes
├── components/             # React components
│   ├── charts/             # Chart components
│   ├── copilot/            # AI copilot components
│   ├── dashboard/          # Dashboard UI components
│   ├── modals/             # Modal dialogs
│   ├── modules/            # Module-specific components
│   ├── notifications/      # Toast & notification components
│   └── ui/                 # Shared UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── stores/                 # Zustand state stores
├── types/                  # TypeScript type definitions
└── data/                   # Static data and configurations

convex/                     # Convex backend
├── schema.ts               # Database schema
├── cities.ts               # City operations
├── modules.ts              # Module operations
├── hotspots.ts             # Hotspot operations
├── quickWins.ts            # Quick wins operations
├── actionPlans.ts          # Action plan operations
├── aiDirector.ts           # AI generation logic
└── seed.ts                 # Database seeding
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx convex dev       # Start Convex development server
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Convex Production

```bash
npx convex deploy
```

## Architecture

- **Frontend**: Next.js with React Server Components where possible, client components for interactivity
- **Backend**: Convex handles real-time data synchronization, mutations, and queries
- **AI Integration**: OpenAI generates city-specific environmental data during onboarding
- **Maps**: Mapbox renders interactive map visualizations with custom data layers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

MIT
