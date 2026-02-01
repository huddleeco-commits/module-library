# BLINK Architecture Guide

This document provides a deep dive into the technical architecture of BLINK.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BLINK PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│   │   Frontend   │    │   Backend    │    │   Worker     │                 │
│   │   (React)    │◄──►│  (Express)   │◄──►│  (BullMQ)    │                 │
│   │  Port 5173   │    │  Port 3001   │    │              │                 │
│   └──────────────┘    └──────────────┘    └──────────────┘                 │
│                              │                    │                         │
│                              ▼                    ▼                         │
│                       ┌──────────────┐    ┌──────────────┐                 │
│                       │  PostgreSQL  │    │    Redis     │                 │
│                       │  (Database)  │    │   (Queue)    │                 │
│                       └──────────────┘    └──────────────┘                 │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                        External Services                              │  │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│   │  │Anthropic│  │ Railway │  │ Stripe  │  │ Sentry  │  │ GitHub  │   │  │
│   │  │   AI    │  │ Deploy  │  │Payments │  │ Errors  │  │  Repos  │   │  │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
module-assembler-ui/
├── server.cjs                 # Main Express server (API entry point)
├── worker.cjs                 # Background job processor
├── deploy-blink.cjs           # Deployment orchestrator
├── cli.cjs                    # Command-line interface
│
├── src/                       # React Frontend
│   ├── App.jsx                # Main application & router
│   ├── main.jsx               # Entry point with Sentry
│   ├── components/            # Reusable UI components
│   │   ├── MainPlatform.jsx   # Core platform UI
│   │   ├── MoodSliders.jsx    # Style selection
│   │   ├── ContentGenerator.jsx
│   │   └── ...
│   ├── screens/               # Page/wizard screens
│   │   ├── ChoosePathStep.jsx # Path selection
│   │   ├── QuickStep.jsx      # Quick generation
│   │   ├── OrchestratorStep.jsx
│   │   └── ...
│   └── admin/                 # Admin dashboard
│
├── lib/                       # Backend Core
│   ├── routes/                # API route handlers (31 files)
│   ├── services/              # Business logic (31 files)
│   ├── generators/            # Page generators (13 files)
│   ├── prompt-builders/       # AI prompt templates
│   ├── configs/               # Industry & feature configs
│   ├── database/              # Schema & migrations
│   ├── models/                # Database models
│   ├── middleware/            # Express middleware
│   └── agents/                # AI agent orchestration
│
└── backend/                   # Pre-built Modules (53)
    ├── auth/
    ├── stripe-payments/
    ├── booking/
    └── ...
```

## Core Components

### 1. Express Server (server.cjs)

The main API server handles:
- Route registration for 194+ endpoints
- Database connection pooling
- Redis connection for job queues
- Sentry error tracking integration
- CORS and security middleware

```javascript
// Key initialization flow
const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/orchestrate', orchestratorRoutes);
app.use('/api/deploy', deployRoutes);
// ... 28 more route groups
```

### 2. Route Architecture

Routes are modular and follow a consistent pattern:

```javascript
// lib/routes/example.cjs
function createExampleRoutes(deps) {
  const router = express.Router();
  const { db, services } = deps;

  router.post('/action', async (req, res) => {
    // Handle request
  });

  return router;
}

module.exports = { createExampleRoutes };
```

**Route Categories:**

| Category | Files | Endpoints | Purpose |
|----------|-------|-----------|---------|
| Auth | 1 | 8 | User authentication |
| Config | 1 | 6 | System configuration |
| Orchestrator | 1 | 6 | AI generation |
| Deploy | 3 | 12 | Railway deployment |
| Apps | 1 | 5 | App generation |
| Studio | 1 | 4 | Visual design |
| Content | 2 | 8 | Content generation |
| Social | 1 | 6 | Social media |
| Utility | 1 | 5 | Misc utilities |

### 3. Service Layer

Services contain business logic, separated from HTTP handling:

```javascript
// lib/services/audit-service.cjs
async function audit1PostGeneration(projectPath, options = {}) {
  // 1. Run Vite build
  // 2. Detect and auto-fix errors
  // 3. Return validation result
  return { success, errors, warnings, autoFixesApplied };
}
```

**Key Services:**

| Service | Purpose |
|---------|---------|
| `ai-pipeline.cjs` | AI generation orchestration (L0-L4) |
| `audit-service.cjs` | Pre-deployment validation |
| `BusinessGenerator.cjs` | Full business generation |
| `one-click-deploy.cjs` | Railway deployment |
| `learning-service.cjs` | ML pattern detection |

### 4. Generator System

Generators create page content based on industry and configuration:

```javascript
// lib/generators/archetype-pages.cjs
function generateLuxuryPage(config) {
  return {
    html: '...',
    css: '...',
    components: ['Hero', 'Gallery', 'Testimonials']
  };
}
```

**Generator Types:**
- `archetype-pages.cjs` - Luxury, Local, Ecommerce templates
- `styled-app-generator.cjs` - Styled applications
- `styled-tool-generator.cjs` - Tool generation
- `companion-generator.cjs` - Mobile app generation
- Industry-specific: fitness, healthcare, grooming, etc.

### 5. Prompt Builder System

The prompt builder constructs AI prompts with context:

```javascript
// lib/prompt-builders/index.cjs (295KB)
function buildPrompt(config) {
  return `
    Create a ${config.industry} website for ${config.businessName}.

    Design Requirements:
    - Layout: ${config.layout}
    - Colors: ${JSON.stringify(config.colors)}
    - Features: ${config.features.join(', ')}

    ...
  `;
}
```

## Data Flow

### Generation Flow

```
┌─────────────────┐
│  User Request   │  "Create pizza shop website"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Orchestrator  │  Analyze input, detect industry
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Feature Detector│  Identify required modules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Pipeline    │  Generate content (L0-L4)
│  (Anthropic)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Page Generators │  Create pages with styling
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Template Engine │  Render with branding
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Audit Service  │  Pre-deployment validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File System    │  Write to generated-projects/
└─────────────────┘
```

### Deployment Flow

```
┌─────────────────┐
│ Deploy Request  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Check    │  Verify audit passed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Push    │  Create/update repository
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Railway Deploy  │  Deploy services
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AUDIT 3        │  Post-deploy validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Live Website   │  https://project.railway.app
└─────────────────┘
```

## Database Schema

### Core Tables

```sql
-- User accounts
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  is_admin BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated projects
CREATE TABLE generated_projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  project_path TEXT,
  status VARCHAR(50) DEFAULT 'building',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployment tracking
CREATE TABLE deployments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES generated_projects(id),
  platform VARCHAR(50) DEFAULT 'railway',
  status VARCHAR(50) DEFAULT 'pending',
  urls JSONB DEFAULT '{}',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

### Status Flow

```
building → completed → build_passed → deployed
              │            │
              │            └─→ deploy_failed
              │
              └─→ build_failed (blocks deployment)
              │
              └─→ failed (code gen failed)
```

## AI Integration

### Tier System

BLINK uses a tiered AI approach based on complexity:

| Tier | Name | AI Level | Use Case |
|------|------|----------|----------|
| L0 | Template | None | Basic text templates |
| L1 | Simple | Minimal | Simple content generation |
| L2 | Guided | Structured | Industry-aware generation |
| L3 | Advanced | Complex | Multi-section layouts |
| L4 | Full | Maximum | Custom business logic |

### AI Pipeline

```javascript
// lib/services/ai-pipeline.cjs
async function runAIPipeline(config) {
  const tier = determineTier(config);

  switch (tier) {
    case 'L0':
      return generateTemplate(config);
    case 'L1':
      return generateSimple(config);
    case 'L2':
      return generateGuided(config);
    case 'L3':
      return generateAdvanced(config);
    case 'L4':
      return generateFull(config);
  }
}
```

### Prompt Engineering

Prompts are constructed with multiple context layers:

```javascript
const prompt = [
  buildSystemContext(),     // Platform context
  buildIndustryContext(),   // Industry-specific guidance
  buildDesignContext(),     // Visual requirements
  buildFeatureContext(),    // Required functionality
  buildOutputFormat()       // Expected response format
].join('\n\n');
```

## Pre-built Modules

BLINK includes 53 production-ready backend modules:

### Module Categories

| Category | Modules | Examples |
|----------|---------|----------|
| Auth & Users | 3 | auth, onboarding, family-groups |
| Payments | 4 | stripe-payments, cashouts, transfers |
| Commerce | 6 | orders, inventory, marketplace |
| Booking | 2 | booking, calendar |
| Social | 4 | chat, posts, social-feed, notifications |
| Content | 3 | documents, file-upload, portfolio |
| Gamification | 5 | achievements, leaderboard, streaks |
| Industry | 8 | meals, menu, healthcare-specific |
| Admin | 3 | admin-api, admin-dashboard, blink-admin |

### Module Structure

Each module follows a consistent structure:

```
backend/auth/
├── index.js          # Main router
├── controller.js     # Request handlers
├── service.js        # Business logic
├── model.js          # Database queries
├── middleware.js     # Auth middleware
└── README.md         # Documentation
```

## Security Architecture

### Authentication Flow

```
┌─────────────────┐
│  Login Request  │  email + password
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Rate Limiter   │  5 req/min per IP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Password Check  │  bcrypt comparison
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JWT Generation │  24h expiration
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Session Tracking│  Database record
└─────────────────┘
```

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Headers | Helmet.js with CSP |
| CORS | Configured origins |
| Rate Limiting | express-rate-limit |
| Password Hashing | bcrypt (12 rounds) |
| Input Validation | express-validator |
| JWT | Short expiration + refresh |
| Error Tracking | Sentry integration |

## Job Queue System

BullMQ handles background jobs:

```javascript
// worker.cjs
const { Worker } = require('bullmq');

const worker = new Worker('generation', async (job) => {
  switch (job.name) {
    case 'generate-project':
      return await generateProject(job.data);
    case 'deploy-project':
      return await deployProject(job.data);
    case 'send-email':
      return await sendEmail(job.data);
  }
}, { connection: redis });
```

### Job Types

| Job | Queue | Priority |
|-----|-------|----------|
| Project Generation | generation | Normal |
| Deployment | deployment | Normal |
| Email Notifications | email | Low |
| Cleanup | maintenance | Low |

## Error Handling

### Error Categories

```javascript
// Custom error classes
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.code = 'VALIDATION_ERROR';
    this.status = 400;
    this.details = details;
  }
}

class AIError extends Error {
  constructor(message) {
    super(message);
    this.code = 'AI_ERROR';
    this.status = 500;
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {},
  "requestId": "uuid"
}
```

## Performance Considerations

### Caching Strategy

| Data | Cache | TTL |
|------|-------|-----|
| Industry Configs | Memory | Application lifetime |
| AI Responses | None | N/A (unique per request) |
| User Sessions | Redis | 24 hours |
| Build Results | Database | Permanent |

### Optimization Techniques

1. **Connection Pooling** - PostgreSQL pool with pg
2. **Lazy Loading** - Generators loaded on demand
3. **Streaming** - SSE for deployment progress
4. **Vite Caching** - Incremental builds for edits

## Extensibility

### Adding a New Route

```javascript
// lib/routes/my-feature.cjs
function createMyFeatureRoutes(deps) {
  const router = express.Router();

  router.post('/action', async (req, res) => {
    // Implementation
  });

  return router;
}

// In server.cjs
const { createMyFeatureRoutes } = require('./lib/routes/my-feature.cjs');
app.use('/api/my-feature', createMyFeatureRoutes(deps));
```

### Adding a New Module

1. Create directory in `backend/`
2. Implement standard structure
3. Add to bundle configuration
4. Update feature detector

### Adding a New Industry

1. Add configuration to `lib/configs/industry-fixtures.cjs`
2. Create page generator (optional)
3. Add to industry selection UI
4. Test generation flow

## Monitoring

### Health Endpoints

- `GET /api/health` - Basic health check
- `GET /api/auth/health` - Auth service status
- `GET /api/deploy/railway-status` - Deployment status

### Metrics (via Sentry)

- Request latency
- Error rates
- AI generation success rate
- Deployment success rate

## Scaling Considerations

### Current Limitations

1. **Single-Node Processing** - Generation runs on main API
2. **Monolithic Files** - Some large files need splitting
3. **No Database Migrations** - Manual schema management

### Recommended Improvements

1. Move generation to dedicated workers
2. Implement proper database migrations
3. Add horizontal scaling for API
4. Implement CDN for static assets
