# BLINK Deployment Guide

This guide covers deploying BLINK to production and configuring generated project deployments.

## Deployment Options

BLINK supports multiple deployment targets:

| Platform | Primary Use | Features |
|----------|-------------|----------|
| Railway | Production | Integrated, one-click |
| Vercel | Frontend | Fast, CDN |
| Netlify | Frontend | Easy, CDN |
| Docker | Self-hosted | Full control |

## Deploying BLINK Platform

### Option 1: Railway (Recommended)

Railway provides the simplest deployment path with integrated PostgreSQL and Redis.

#### Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed
- GitHub repository connected

#### Steps

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Create Railway Project**
```bash
cd module-assembler-ui
railway init
```

3. **Add Services**
```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis
```

4. **Configure Environment Variables**

In Railway dashboard, set:
```
DATABASE_URL=<auto-populated>
REDIS_URL=<auto-populated>
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-secure-secret
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.railway.app
```

5. **Deploy**
```bash
railway up
```

6. **Verify Deployment**
```bash
# Check service status
railway status

# View logs
railway logs
```

### Option 2: Docker

For self-hosted or custom infrastructure.

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.cjs"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/blink
      - REDIS_URL=redis://redis:6379
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=blink
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./lib/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  worker:
    build: .
    command: node worker.cjs
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/blink
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f app

# Initialize database
docker-compose exec app psql -f lib/database/schema.sql
```

### Option 3: Traditional VPS

For deployment on DigitalOcean, AWS EC2, or similar.

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2 for process management
npm install -g pm2
```

#### Application Setup

```bash
# Clone repository
git clone <repository-url>
cd module-library/module-assembler-ui

# Install dependencies
npm install

# Build frontend
npm run build

# Create .env file
cp .env.example .env
nano .env  # Edit with production values

# Initialize database
psql -U postgres -d blink -f lib/database/schema.sql
```

#### Start with PM2

```bash
# Start main server
pm2 start server.cjs --name blink-api

# Start worker
pm2 start worker.cjs --name blink-worker

# Save process list
pm2 save

# Enable startup on boot
pm2 startup
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Generated Project Deployment

BLINK can deploy generated projects to Railway automatically.

### Configuration

Set these environment variables in BLINK:

```bash
# Railway API token for deployment
RAILWAY_TOKEN=your-railway-token

# GitHub token for repository creation
GITHUB_TOKEN=ghp_...

# Optional: Custom domain
RAILWAY_DOMAIN=.up.railway.app
```

### Deployment Process

When a user clicks "Deploy", BLINK:

1. **Validates Build** - Runs AUDIT 1 to ensure code compiles
2. **Creates GitHub Repo** - Pushes code to GitHub
3. **Creates Railway Project** - Sets up services
4. **Deploys Services** - Frontend, Backend, Admin
5. **Configures DNS** - Sets up custom domain
6. **Runs AUDIT 3** - Validates live site

### Service Architecture

Each generated project deploys with:

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Project                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │   Frontend   │  │   Backend    │  │    Admin     │    │
│   │   (Vite)     │  │  (Express)   │  │   (React)    │    │
│   │   Port 80    │  │  Port 3001   │  │   Port 80    │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
│                            │                                │
│                            ▼                                │
│                    ┌──────────────┐                        │
│                    │  PostgreSQL  │                        │
│                    │  (Shared)    │                        │
│                    └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### URLs

Generated projects receive URLs in this format:
- Frontend: `https://{project-name}.up.railway.app`
- Admin: `https://admin-{project-name}.up.railway.app`
- API: `https://api-{project-name}.up.railway.app`

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `JWT_SECRET` | JWT signing secret | Random 64+ char string |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `STRIPE_SECRET_KEY` | Stripe API key | - |
| `SENTRY_DSN` | Sentry error tracking | - |
| `RAILWAY_TOKEN` | Railway deployment token | - |
| `GITHUB_TOKEN` | GitHub API token | - |

### Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_PRE_DEPLOY_AUDIT` | Run build validation | `true` |
| `ENABLE_PREVIEW_MODE` | Enable preview feature | `false` |
| `AUDIT_BUILD_TIMEOUT` | Build timeout (ms) | `120000` |
| `AUDIT_MAX_RETRIES` | Auto-fix retry count | `2` |

## SSL/TLS Configuration

### Railway (Automatic)

Railway provides automatic SSL for all deployments.

### Custom Domain with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Nginx with SSL

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Database Management

### Backups

```bash
# Manual backup
pg_dump -U postgres blink > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 0 * * * pg_dump -U postgres blink > /backups/blink_$(date +\%Y\%m\%d).sql
```

### Restore

```bash
psql -U postgres -d blink < backup_20240118.sql
```

### Migrations

Currently, schema changes are manual. Run:

```bash
psql -U postgres -d blink -f lib/database/schema.sql
```

## Monitoring

### Health Checks

Configure health checks in your load balancer:

- Endpoint: `GET /api/health`
- Expected: `200 OK` with `{"status":"ok"}`
- Interval: 30 seconds
- Timeout: 10 seconds

### Sentry Integration

```bash
# Set Sentry DSN
SENTRY_DSN=https://...@sentry.io/...
```

Sentry captures:
- Unhandled exceptions
- API errors
- Performance metrics
- User context

### Log Management

With PM2:
```bash
# View logs
pm2 logs

# Monitor
pm2 monit

# Flush logs
pm2 flush
```

With Docker:
```bash
# View logs
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

## Scaling

### Horizontal Scaling

For high traffic, scale the API:

**PM2 Cluster Mode:**
```bash
pm2 start server.cjs -i max --name blink-api
```

**Docker Swarm:**
```yaml
services:
  app:
    deploy:
      replicas: 3
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3
```

### Database Scaling

For high load:
1. Add read replicas
2. Implement connection pooling (PgBouncer)
3. Consider managed PostgreSQL (Railway, AWS RDS)

### Redis Scaling

For high job volume:
1. Increase Redis memory
2. Consider Redis Cluster
3. Separate queues by priority

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process
lsof -i :3001
kill -9 <PID>
```

**Database Connection Failed**
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check firewall rules

**Redis Connection Failed**
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` format

**Deployment Stuck**
- Check Railway/Vercel logs
- Verify environment variables
- Check build output

### Debug Mode

Enable debug logging:
```bash
DEBUG=* node server.cjs
```

### Support Channels

1. Check server logs: `pm2 logs` or `docker-compose logs`
2. Check Sentry for errors
3. Review Railway/Vercel deployment logs
4. Contact development team with:
   - Error messages
   - Steps to reproduce
   - Environment details
