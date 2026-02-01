# Getting Started with BLINK

This guide will walk you through setting up BLINK for local development and generating your first project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18.0.0 or higher** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Redis** - [Download](https://redis.io/download/) or use Docker
- **Git** - [Download](https://git-scm.com/)

You'll also need:
- An **Anthropic API key** for AI generation
- A **Stripe account** (optional, for payment features)
- A **Railway account** (optional, for deployment)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd module-library

# Navigate to the main application
cd module-assembler-ui

# Install dependencies
npm install
```

## Step 2: Environment Setup

Create a `.env` file in the `module-assembler-ui` directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/blink_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blink_dev
DB_USER=username
DB_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# AI Configuration (Required)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-secure-secret-key-here
JWT_EXPIRY=24h

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Railway Deployment (Optional)
RAILWAY_TOKEN=your-railway-token

# Error Tracking (Optional)
SENTRY_DSN=https://...

# Feature Flags
ENABLE_PRE_DEPLOY_AUDIT=true
```

## Step 3: Database Setup

### Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE blink_dev;

# Exit psql
\q
```

### Initialize Schema

```bash
# Run the schema file
psql -U username -d blink_dev -f lib/database/schema.sql
```

The schema creates these core tables:
- `users` - User accounts and authentication
- `sessions` - Active sessions
- `generated_projects` - Metadata for generated sites
- `deployments` - Deployment history
- `api_usage` - Usage tracking

## Step 4: Start Redis

Redis is required for the job queue system (BullMQ).

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Using local Redis:**
```bash
redis-server
```

## Step 5: Start the Application

You need two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd module-assembler-ui
node server.cjs
```

You should see:
```
🚀 BLINK Server running on port 3001
📦 Database connected
🔄 Redis connected
```

**Terminal 2 - Frontend Dev Server:**
```bash
cd module-assembler-ui
npm run dev
```

You should see:
```
  VITE v5.0.0  ready

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Access the Application

Open your browser to: **http://localhost:5173**

You'll see the BLINK landing page with options to:
- Create a new account
- Sign in to an existing account

## Your First Generation

### Quick Generation (30 seconds)

1. **Sign In** - Create an account or sign in
2. **Choose "Quick"** - From the path selection screen
3. **Select Industry** - Pick from 9 industry presets (Restaurant, Healthcare, E-commerce, etc.)
4. **Enter Business Name** - Give your business a name
5. **Generate** - Watch the AI create your full-stack application
6. **Preview** - Review the generated site
7. **Deploy** - One-click deploy to Railway (optional)

### Orchestrator Mode (Most Powerful)

1. **Choose "Orchestrator"**
2. **Describe Your Business** - Enter a single sentence like:
   > "Create a luxury steakhouse website for Aurelius in Manhattan with online reservations and a tasting menu showcase"
3. **Let AI Work** - BLINK analyzes your request and selects the optimal tier and features
4. **Review & Deploy**

## Project Output

Generated projects are saved to:
```
C:\Users\huddl\OneDrive\Desktop\module-library\generated-projects\{ProjectName}\
```

Each project contains:
```
{ProjectName}/
├── frontend/           # React application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/            # Express API server
│   ├── routes/
│   ├── services/
│   └── package.json
├── admin/              # Admin dashboard
└── railway.json        # Deployment config
```

## Running Generated Projects

```bash
# Navigate to your generated project
cd generated-projects/YourProject

# Install backend dependencies
cd backend
npm install
node server.js

# In a new terminal, install frontend dependencies
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Check that the database exists: `psql -l | grep blink_dev`

### Redis Connection Failed
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check the REDIS_URL in `.env`

### API Key Errors
- Verify your Anthropic API key is correct
- Ensure the key has sufficient credits

### Port Already in Use
```bash
# Find and kill the process using port 3001
npx kill-port 3001

# Or change the port in .env
PORT=3002
```

### Build Failures During Generation
- Check the server logs for specific errors
- The audit system will show exactly what failed
- Most common: missing icons or import errors (auto-fixed)

## Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md) to understand how BLINK works
- Review the [API Reference](./API_REFERENCE.md) for endpoint documentation
- See [Deployment Guide](./DEPLOYMENT.md) for production setup
- Check [Contributing](./CONTRIBUTING.md) if you want to extend BLINK

## Getting Help

If you encounter issues:
1. Check the server logs for detailed error messages
2. Review the troubleshooting section above
3. Contact the development team with:
   - Error message/screenshot
   - Steps to reproduce
   - Your environment details (Node version, OS, etc.)
