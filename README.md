# BLINK Module Assembler v2.0.0

> *"We don't make websites. We make businesses."*

BLINK is an AI-powered full-stack business generation platform that creates complete, deployable web applications by combining pre-built backend modules with AI-generated frontends.

## What Makes BLINK Different

Unlike pure AI code generators, BLINK constrains AI output within pre-tested module boundaries:
- **53 production-ready backend modules** (auth, payments, booking, etc.)
- **AI-generated frontends** with sophisticated prompt engineering
- **65+ industry configurations** for vertical-specific intelligence
- **One-click deployment** to Railway

## Quick Start

### Prerequisites
- Node.js 18.0.0+
- PostgreSQL database
- Redis (for job queues)
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd module-library

# Install dependencies
cd module-assembler-ui
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database credentials

# Initialize database
psql -d your_database -f lib/database/schema.sql

# Start the development server
npm run dev
```

### Running the Application

**Terminal 1: Backend Server**
```bash
cd module-assembler-ui
node server.cjs
# Server runs on http://localhost:3001
```

**Terminal 2: Frontend Dev Server**
```bash
cd module-assembler-ui
npm run dev
# Frontend runs on http://localhost:5173
```

## Project Structure

```
module-library/
├── module-assembler-ui/          # Main application
│   ├── server.cjs               # Express API server
│   ├── worker.cjs               # Background job worker
│   ├── src/                     # React frontend
│   │   ├── App.jsx              # Main application
│   │   ├── components/          # React components
│   │   └── screens/             # Wizard screens
│   └── lib/                     # Backend services
│       ├── routes/              # API endpoints
│       ├── services/            # Business logic
│       ├── generators/          # Page generators
│       └── configs/             # Industry presets
├── backend/                      # 53 pre-built modules
│   ├── auth/                    # Authentication
│   ├── stripe-payments/         # Stripe integration
│   ├── booking/                 # Booking system
│   └── ...                      # 50+ more modules
├── docs/                         # Documentation
└── generated-projects/           # Output directory
```

## Key Features

### Generation Paths
- **Quick Mode** - Generate in 30 seconds with industry presets
- **Reference Mode** - Generate from an existing website URL
- **Rebuild Mode** - Improve an existing site
- **Orchestrator** - Single sentence to full website

### Tier System

| Tier | Name | Pages | Features | Use Case |
|------|------|-------|----------|----------|
| L1 | Landing | 1 | Static page | Simple landing pages |
| L2 | Presence | 6 | Marketing site | Small business websites |
| L3 | Interactive | 10 | Auth, booking | Service businesses |
| L4 | Full BaaS | 15+ | Payments, orders | E-commerce, SaaS |

### Industry Support
Pre-configured for 65+ industries including:
- Restaurants & Food Service
- Healthcare & Wellness
- Professional Services
- E-commerce & Retail
- Fitness & Recreation
- Technology & SaaS

## Documentation

- [Getting Started](./docs/GETTING_STARTED.md) - First-time setup guide
- [Architecture](./docs/ARCHITECTURE.md) - Technical deep dive
- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment guide
- [Contributing](./docs/CONTRIBUTING.md) - Development guidelines

## Tech Stack

**Backend**
- Node.js 18+ with Express.js 5
- PostgreSQL with connection pooling
- Redis + BullMQ for job queues
- Anthropic Claude SDK for AI

**Frontend**
- React 18 with Vite
- Lucide React icons
- Recharts for analytics

**Infrastructure**
- Railway deployment
- Sentry error tracking
- Helmet.js security

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...

# Optional
STRIPE_SECRET_KEY=sk_...
SENTRY_DSN=https://...
ENABLE_PRE_DEPLOY_AUDIT=true
```

## API Overview

The server exposes 194+ endpoints across these categories:

- `/api/auth/*` - Authentication & sessions
- `/api/orchestrator/*` - AI generation orchestration
- `/api/apps/*` - Full-stack app generation
- `/api/deploy/*` - Railway deployment
- `/api/config/*` - Bundles & presets
- `/api/studio/*` - Visual design studio

See [API Reference](./docs/API_REFERENCE.md) for complete documentation.

## License

Proprietary - All rights reserved.

## Support

For issues and feature requests, please contact the development team.
