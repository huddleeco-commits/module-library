-- BLINK Admin Database Schema
-- Tracks projects, subscribers, API usage, deployments, and monthly stats

-- Generated Projects Table
CREATE TABLE IF NOT EXISTS generated_projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  bundles TEXT[], -- Array of bundle names used
  domain VARCHAR(255),
  github_repo VARCHAR(255),
  railway_project_id VARCHAR(255),
  user_id INTEGER,
  user_email VARCHAR(255),
  subscriber_id INTEGER REFERENCES subscribers(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, building, completed, build_passed, build_failed, deployed, deploy_failed, failed
  deploy_url VARCHAR(255),
  api_tokens_used INTEGER DEFAULT 0,
  api_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deployed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  -- URL columns for deployed projects
  frontend_url VARCHAR(255),
  admin_url VARCHAR(255),
  backend_url VARCHAR(255),
  github_frontend VARCHAR(255),
  github_backend VARCHAR(255),
  github_admin VARCHAR(255),
  railway_project_url VARCHAR(255),
  -- Companion app tracking columns
  app_type VARCHAR(50) DEFAULT 'website', -- 'website', 'companion-app', 'advanced-app'
  parent_project_id INTEGER REFERENCES generated_projects(id), -- For companion apps, links to parent website
  domain_type VARCHAR(20) DEFAULT 'be1st.io' -- 'be1st.io' for websites, 'be1st.app' for apps
);

-- Subscribers Table (Stripe Integration)
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free', -- free, starter, pro, enterprise
  plan_price DECIMAL(10,2) DEFAULT 0, -- Monthly price
  mrr DECIMAL(10,2) DEFAULT 0, -- Monthly recurring revenue from this user
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  projects_limit INTEGER DEFAULT 1, -- Projects allowed per month
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, past_due, trialing
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Usage Table (Track all external API calls)
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES generated_projects(id),
  user_id INTEGER,
  endpoint VARCHAR(100) NOT NULL, -- claude, openai, ebay, stripe, railway, cloudflare
  operation VARCHAR(100), -- generate_homepage, deploy, dns_setup, etc.
  tokens_used INTEGER DEFAULT 0, -- For AI APIs
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0, -- Cost in USD
  request_data JSONB,
  response_status INTEGER,
  duration_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments Table
CREATE TABLE IF NOT EXISTS deployments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES generated_projects(id),
  platform VARCHAR(50) NOT NULL, -- railway, vercel, netlify
  status VARCHAR(50) DEFAULT 'pending', -- pending, building, success, failed
  deploy_url VARCHAR(255),
  github_repo VARCHAR(255),
  railway_service_id VARCHAR(255),
  railway_environment_id VARCHAR(255),
  deploy_time_seconds INTEGER,
  build_logs TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Monthly Stats Table (Aggregated for fast dashboard queries)
CREATE TABLE IF NOT EXISTS monthly_stats (
  id SERIAL PRIMARY KEY,
  month DATE NOT NULL UNIQUE, -- First day of month, e.g., 2024-01-01
  projects_generated INTEGER DEFAULT 0,
  projects_deployed INTEGER DEFAULT 0,
  projects_failed INTEGER DEFAULT 0,
  new_subscribers INTEGER DEFAULT 0,
  churned_subscribers INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_api_cost DECIMAL(10,2) DEFAULT 0,
  claude_tokens_used BIGINT DEFAULT 0,
  claude_cost DECIMAL(10,2) DEFAULT 0,
  railway_cost DECIMAL(10,2) DEFAULT 0,
  hosting_cost DECIMAL(10,2) DEFAULT 0,
  net_profit DECIMAL(10,2) DEFAULT 0,
  avg_project_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost Tracking Table (Manual cost entries for hosting, etc.)
CREATE TABLE IF NOT EXISTS cost_entries (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- hosting, api, domain, misc
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  billing_period VARCHAR(50), -- monthly, yearly, one-time
  vendor VARCHAR(100), -- railway, cloudflare, anthropic, etc.
  month DATE, -- Which month this cost applies to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance (base columns that always exist)
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON generated_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON generated_projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_user ON generated_projects(user_id);

-- Migration: Add companion app columns to existing tables (safe to run multiple times)
DO $$
BEGIN
  -- Add frontend_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'frontend_url') THEN
    ALTER TABLE generated_projects ADD COLUMN frontend_url VARCHAR(255);
  END IF;
  -- Add admin_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'admin_url') THEN
    ALTER TABLE generated_projects ADD COLUMN admin_url VARCHAR(255);
  END IF;
  -- Add backend_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'backend_url') THEN
    ALTER TABLE generated_projects ADD COLUMN backend_url VARCHAR(255);
  END IF;
  -- Add github_frontend if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'github_frontend') THEN
    ALTER TABLE generated_projects ADD COLUMN github_frontend VARCHAR(255);
  END IF;
  -- Add github_backend if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'github_backend') THEN
    ALTER TABLE generated_projects ADD COLUMN github_backend VARCHAR(255);
  END IF;
  -- Add github_admin if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'github_admin') THEN
    ALTER TABLE generated_projects ADD COLUMN github_admin VARCHAR(255);
  END IF;
  -- Add railway_project_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'railway_project_url') THEN
    ALTER TABLE generated_projects ADD COLUMN railway_project_url VARCHAR(255);
  END IF;
  -- Add app_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'app_type') THEN
    ALTER TABLE generated_projects ADD COLUMN app_type VARCHAR(50) DEFAULT 'website';
  END IF;
  -- Add parent_project_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'parent_project_id') THEN
    ALTER TABLE generated_projects ADD COLUMN parent_project_id INTEGER REFERENCES generated_projects(id);
  END IF;
  -- Add domain_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'domain_type') THEN
    ALTER TABLE generated_projects ADD COLUMN domain_type VARCHAR(20) DEFAULT 'be1st.io';
  END IF;
  -- Add subscriber_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'subscriber_id') THEN
    ALTER TABLE generated_projects ADD COLUMN subscriber_id INTEGER REFERENCES subscribers(id);
  END IF;
  -- Add is_demo if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'is_demo') THEN
    ALTER TABLE generated_projects ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
  END IF;
  -- Add companion_app_url if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'companion_app_url') THEN
    ALTER TABLE generated_projects ADD COLUMN companion_app_url VARCHAR(255);
  END IF;
  -- Add demo_batch_id for grouping demo runs if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_projects' AND column_name = 'demo_batch_id') THEN
    ALTER TABLE generated_projects ADD COLUMN demo_batch_id VARCHAR(100);
  END IF;
END $$;

-- Indexes for companion app columns (created after migration adds them)
CREATE INDEX IF NOT EXISTS idx_projects_app_type ON generated_projects(app_type);
CREATE INDEX IF NOT EXISTS idx_projects_parent ON generated_projects(parent_project_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_demo ON generated_projects(is_demo) WHERE is_demo = TRUE;

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe ON subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_project ON api_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_monthly_stats_month ON monthly_stats(month DESC);

-- Function to update monthly stats
CREATE OR REPLACE FUNCTION update_monthly_stats()
RETURNS void AS $$
DECLARE
  current_month DATE := DATE_TRUNC('month', NOW());
BEGIN
  INSERT INTO monthly_stats (month, projects_generated, projects_deployed, total_api_cost, claude_tokens_used)
  SELECT
    current_month,
    COUNT(*) FILTER (WHERE created_at >= current_month),
    COUNT(*) FILTER (WHERE status = 'deployed' AND deployed_at >= current_month),
    COALESCE(SUM(api_cost) FILTER (WHERE created_at >= current_month), 0),
    COALESCE(SUM(api_tokens_used) FILTER (WHERE created_at >= current_month), 0)
  FROM generated_projects
  ON CONFLICT (month) DO UPDATE SET
    projects_generated = EXCLUDED.projects_generated,
    projects_deployed = EXCLUDED.projects_deployed,
    total_api_cost = EXCLUDED.total_api_cost,
    claude_tokens_used = EXCLUDED.claude_tokens_used,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
