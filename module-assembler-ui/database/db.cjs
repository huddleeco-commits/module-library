/**
 * BLINK Database Connection
 * PostgreSQL connection helper with connection pooling
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('   DB: Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('   DB: Unexpected error on idle client', err);
});

// Initialize database schema
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('   DB: Schema initialized successfully');

    // Create default admin if none exists
    const adminCheck = await pool.query('SELECT COUNT(*) FROM admin_users');
    if (parseInt(adminCheck.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@blink.be1st.io';
      const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
      const hash = await bcrypt.hash(adminPassword, 10);

      await pool.query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [adminEmail, hash, 'Admin', 'super_admin']
      );
      console.log(`   DB: Default admin created (${adminEmail})`);
    }

    return true;
  } catch (err) {
    console.error('   DB: Failed to initialize schema:', err.message);
    return false;
  }
}

// Query helper with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log(`   DB: Slow query (${duration}ms):`, text.substring(0, 80));
    }
    return res;
  } catch (err) {
    console.error('   DB: Query error:', err.message);
    throw err;
  }
}

// Transaction helper
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ============================================
// PROJECT TRACKING
// ============================================

async function trackProjectStart(data) {
  const result = await query(
    `INSERT INTO generated_projects
     (name, industry, bundles, user_email, status, metadata)
     VALUES ($1, $2, $3, $4, 'building', $5)
     RETURNING id`,
    [data.name, data.industry, data.bundles || [], data.userEmail, data.metadata || {}]
  );
  return result.rows[0].id;
}

async function trackProjectDeployed(projectId, data) {
  await query(
    `UPDATE generated_projects SET
     status = 'deployed',
     domain = $2,
     deploy_url = $3,
     github_repo = $4,
     railway_project_id = $5,
     api_tokens_used = $6,
     api_cost = $7,
     deployed_at = NOW()
     WHERE id = $1`,
    [projectId, data.domain, data.deployUrl, data.githubRepo, data.railwayProjectId, data.tokensUsed || 0, data.apiCost || 0]
  );
}

async function trackProjectFailed(projectId, error) {
  await query(
    `UPDATE generated_projects SET status = 'failed', metadata = metadata || $2 WHERE id = $1`,
    [projectId, { error: error.message || error }]
  );
}

// ============================================
// API USAGE TRACKING
// ============================================

async function trackApiUsage(data) {
  await query(
    `INSERT INTO api_usage
     (project_id, endpoint, operation, tokens_used, input_tokens, output_tokens, cost, duration_ms, response_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      data.projectId,
      data.endpoint,
      data.operation,
      data.tokensUsed || 0,
      data.inputTokens || 0,
      data.outputTokens || 0,
      data.cost || 0,
      data.durationMs || 0,
      data.responseStatus || 200
    ]
  );
}

// Calculate Claude API cost (per 1M tokens)
function calculateClaudeCost(inputTokens, outputTokens, model = 'claude-sonnet-4-20250514') {
  const pricing = {
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  };
  const rates = pricing[model] || pricing['claude-sonnet-4-20250514'];
  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;
  return inputCost + outputCost;
}

// ============================================
// GENERATION TRACKING (uses generated_projects table)
// ============================================

/**
 * Start tracking a new generation
 * Call this when generation begins
 */
async function trackGenerationStart(data) {
  const result = await query(
    `INSERT INTO generated_projects
     (name, industry, user_email, status, metadata)
     VALUES ($1, $2, $3, 'building', $4)
     RETURNING id`,
    [
      data.siteName || data.name,
      data.industry,
      data.userEmail || null,
      JSON.stringify({
        templateUsed: data.templateUsed || 'blink-orchestrator',
        modulesSelected: data.modulesSelected || []
      })
    ]
  );
  return result.rows[0].id;
}

/**
 * Mark generation as completed with cost/token data
 * Call this when generation succeeds
 */
async function trackGenerationComplete(generationId, data) {
  await query(
    `UPDATE generated_projects SET
     status = 'completed',
     api_tokens_used = $2,
     api_cost = $3,
     metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
     WHERE id = $1`,
    [
      generationId,
      data.totalTokens || (data.inputTokens || 0) + (data.outputTokens || 0),
      data.totalCost || 0,
      JSON.stringify({
        pagesGenerated: data.pagesGenerated || 0,
        generationTimeMs: data.generationTimeMs || 0,
        inputTokens: data.inputTokens || 0,
        outputTokens: data.outputTokens || 0
      })
    ]
  );
}

/**
 * Update deployment URLs after successful deployment
 * Call this after deploy completes
 */
async function updateProjectDeploymentUrls(projectId, urls) {
  await query(
    `UPDATE generated_projects SET
     status = 'deployed',
     deployed_at = NOW(),
     domain = $2,
     deploy_url = $3,
     frontend_url = $4,
     admin_url = $5,
     backend_url = $6,
     github_frontend = $7,
     github_backend = $8,
     github_admin = $9,
     railway_project_url = $10,
     railway_project_id = $11
     WHERE id = $1`,
    [
      projectId,
      urls.domain || null,
      urls.frontend || urls.deployUrl || null,
      urls.frontend || null,
      urls.admin || null,
      urls.backend || null,
      urls.githubFrontend || null,
      urls.githubBackend || null,
      urls.githubAdmin || null,
      urls.railway || null,
      urls.railwayProjectId || null
    ]
  );
}

/**
 * Mark generation as failed with error info
 * Call this when generation fails
 */
async function trackGenerationFailed(generationId, error) {
  await query(
    `UPDATE generated_projects SET
     status = 'failed',
     metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
     WHERE id = $1`,
    [generationId, JSON.stringify({
      error: error.message || error,
      failedAt: new Date().toISOString(),
      errorStack: error.stack || null
    })]
  );
}

/**
 * Mark deployment as failed with error info
 * Call this when code generation succeeded but deployment failed
 */
async function trackDeploymentFailed(generationId, error) {
  await query(
    `UPDATE generated_projects SET
     status = 'deploy_failed',
     metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
     WHERE id = $1`,
    [generationId, JSON.stringify({
      deployError: error.message || error,
      deployFailedAt: new Date().toISOString(),
      deployStage: error.stage || null
    })]
  );
}

/**
 * Track build validation result (AUDIT 1 & 2)
 * Call this after running vite build validation
 */
async function trackBuildResult(generationId, result) {
  const status = result.success ? 'build_passed' : 'build_failed';
  await query(
    `UPDATE generated_projects SET
     status = $2,
     metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
     WHERE id = $1`,
    [generationId, status, JSON.stringify({
      buildResult: {
        success: result.success,
        auditType: result.auditType || 'audit1', // audit1, audit2, audit3
        durationMs: result.durationMs || 0,
        errorCount: result.errors?.length || 0,
        warningCount: result.warnings?.length || 0,
        errors: (result.errors || []).slice(0, 10), // Limit stored errors
        warnings: (result.warnings || []).slice(0, 5),
        autoFixesApplied: result.autoFixesApplied || [],
        buildLog: (result.buildLog || '').substring(0, 5000), // Truncate log
        timestamp: new Date().toISOString()
      }
    })]
  );
}

/**
 * Update project metadata (generic merge)
 * Useful for adding arbitrary data at any stage
 */
async function updateProjectMetadata(projectId, newMetadata) {
  await query(
    `UPDATE generated_projects SET
     metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
     WHERE id = $1`,
    [projectId, JSON.stringify(newMetadata)]
  );
}

/**
 * Get recent generations (for dashboard)
 */
async function getRecentGenerations(limit = 20) {
  const result = await query(
    `SELECT id, name as site_name, industry, status,
            api_cost as total_cost, api_tokens_used as total_tokens,
            frontend_url, admin_url, backend_url,
            github_frontend, github_backend, github_admin,
            railway_project_url, railway_project_id,
            user_email, created_at, deployed_at, metadata,
            app_type, parent_project_id, domain_type
     FROM generated_projects
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

// ============================================
// COMPANION APP TRACKING
// ============================================

/**
 * Track a new companion app generation
 * Returns the new project ID
 */
async function trackCompanionAppStart(data) {
  const result = await query(
    `INSERT INTO generated_projects
     (name, industry, user_email, status, app_type, parent_project_id, domain_type, metadata)
     VALUES ($1, $2, $3, 'building', 'companion-app', $4, 'be1st.app', $5)
     RETURNING id`,
    [
      data.appName || data.name,
      data.industry || null,
      data.userEmail || null,
      data.parentProjectId || null,
      JSON.stringify({
        parentSiteName: data.parentSiteName,
        parentSiteSubdomain: data.parentSiteSubdomain,
        quickActions: data.quickActions || [],
        companionType: data.companionType || 'customer' // customer or staff
      })
    ]
  );
  return result.rows[0].id;
}

/**
 * Update companion app with deployment URLs after successful deployment
 */
async function updateCompanionAppDeployment(projectId, urls) {
  await query(
    `UPDATE generated_projects SET
     status = 'deployed',
     deployed_at = NOW(),
     domain = $2,
     frontend_url = $3,
     backend_url = $4,
     github_frontend = $5,
     railway_project_url = $6,
     railway_project_id = $7,
     metadata = COALESCE(metadata, '{}'::jsonb) || $8::jsonb
     WHERE id = $1`,
    [
      projectId,
      urls.domain || null,
      urls.companion || urls.frontend || null,
      urls.parentApi || null,  // Companion apps use parent's API
      urls.github || null,
      urls.railway || null,
      urls.railwayProjectId || null,
      JSON.stringify({
        parentSiteUrl: urls.parentSite || null,
        deployedAt: new Date().toISOString()
      })
    ]
  );
}

/**
 * Get companion apps for a specific parent project
 */
async function getCompanionAppsForProject(parentProjectId) {
  const result = await query(
    `SELECT id, name as site_name, status, frontend_url,
            github_frontend, railway_project_url, created_at, deployed_at, metadata
     FROM generated_projects
     WHERE parent_project_id = $1 AND app_type = 'companion-app'
     ORDER BY created_at DESC`,
    [parentProjectId]
  );
  return result.rows;
}

/**
 * Find parent project ID by subdomain
 */
async function findParentProjectBySubdomain(subdomain) {
  const result = await query(
    `SELECT id FROM generated_projects
     WHERE (domain LIKE $1 OR frontend_url LIKE $2)
       AND app_type = 'website'
     ORDER BY created_at DESC
     LIMIT 1`,
    [`${subdomain}.%`, `%${subdomain}.be1st.io%`]
  );
  return result.rows[0]?.id || null;
}

/**
 * Get generation stats for a time period
 */
async function getGenerationStats(days = 30) {
  const result = await query(`
    SELECT
      COUNT(*) as total_generations,
      COUNT(*) FILTER (WHERE status = 'completed' OR status = 'deployed') as completed,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COALESCE(SUM(api_cost), 0) as total_cost,
      COALESCE(SUM(api_tokens_used), 0) as total_tokens
    FROM generated_projects
    WHERE created_at >= NOW() - $1 * INTERVAL '1 day'
  `, [days]);
  return result.rows[0];
}

// ============================================
// ADMIN DASHBOARD QUERIES
// ============================================

async function getDashboardStats() {
  const stats = await query(`
    SELECT
      (SELECT COUNT(*) FROM generated_projects) as total_projects,
      (SELECT COUNT(*) FROM generated_projects WHERE status = 'deployed') as deployed_projects,
      (SELECT COUNT(*) FROM generated_projects WHERE created_at >= DATE_TRUNC('month', NOW())) as projects_this_month,
      (SELECT COUNT(*) FROM generated_projects WHERE created_at >= CURRENT_DATE) as projects_today,
      (SELECT COUNT(*) FROM subscribers WHERE status = 'active') as active_subscribers,
      (SELECT COUNT(*) FROM subscribers) as total_users,
      (SELECT COUNT(*) FROM subscribers WHERE plan != 'free' AND status = 'active') as paid_users,
      (SELECT COUNT(*) FROM subscribers WHERE created_at >= CURRENT_DATE) as signups_today,
      (SELECT COALESCE(SUM(mrr), 0) FROM subscribers WHERE status = 'active') as total_mrr,
      (SELECT COALESCE(SUM(cost), 0) FROM api_usage WHERE timestamp >= DATE_TRUNC('month', NOW())) as api_cost_this_month,
      (SELECT COALESCE(SUM(tokens_used), 0) FROM api_usage WHERE timestamp >= DATE_TRUNC('month', NOW())) as tokens_this_month,
      (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (deployed_at - created_at)) * 1000), 45000)
       FROM generated_projects WHERE deployed_at IS NOT NULL) as avg_generation_time,
      (SELECT ROUND(
        (COUNT(*) FILTER (WHERE status IN ('deployed', 'completed')))::numeric /
        NULLIF(COUNT(*), 0)::numeric * 100, 1
      ) FROM generated_projects) as success_rate
  `);
  return stats.rows[0];
}

async function getRecentProjects(limit = 20) {
  const result = await query(
    `SELECT
       gp.id, gp.name as site_name, gp.industry, gp.domain, gp.status,
       gp.deploy_url, gp.api_cost, gp.created_at, gp.deployed_at,
       COALESCE(s.email, gp.user_email, 'Unknown') as user_email,
       EXTRACT(EPOCH FROM (COALESCE(gp.deployed_at, NOW()) - gp.created_at)) * 1000 as generation_time_ms
     FROM generated_projects gp
     LEFT JOIN subscribers s ON gp.subscriber_id = s.id
     ORDER BY gp.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getAllProjects(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT * FROM generated_projects ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query('SELECT COUNT(*) FROM generated_projects');
  return {
    projects: result.rows,
    total: parseInt(count.rows[0].count),
    page,
    pages: Math.ceil(count.rows[0].count / limit)
  };
}

async function getAllSubscribers(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT * FROM subscribers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const count = await query('SELECT COUNT(*) FROM subscribers');
  return {
    subscribers: result.rows,
    total: parseInt(count.rows[0].count),
    page,
    pages: Math.ceil(count.rows[0].count / limit)
  };
}

async function getApiUsageStats(days = 30) {
  const result = await query(`
    SELECT
      endpoint,
      COUNT(*) as requests,
      SUM(tokens_used) as total_tokens,
      SUM(cost) as total_cost,
      AVG(duration_ms) as avg_duration
    FROM api_usage
    WHERE timestamp >= NOW() - $1 * INTERVAL '1 day'
    GROUP BY endpoint
    ORDER BY total_cost DESC
  `, [days]);
  return result.rows;
}

async function getApiUsageTimeline(days = 30) {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', timestamp) as day,
      endpoint,
      COUNT(*) as requests,
      SUM(cost) as cost
    FROM api_usage
    WHERE timestamp >= NOW() - $1 * INTERVAL '1 day'
    GROUP BY DATE_TRUNC('day', timestamp), endpoint
    ORDER BY day DESC
  `, [days]);
  return result.rows;
}

async function getCostBreakdown(month = null) {
  if (month) {
    const result = await query(`
      SELECT
        category,
        vendor,
        SUM(amount) as total
      FROM cost_entries
      WHERE month = $1
      GROUP BY category, vendor
      ORDER BY total DESC
    `, [month]);
    return result.rows;
  } else {
    const result = await query(`
      SELECT
        category,
        vendor,
        SUM(amount) as total
      FROM cost_entries
      GROUP BY category, vendor
      ORDER BY total DESC
    `);
    return result.rows;
  }
}

async function getMonthlyStats(months = 12) {
  const result = await query(`
    SELECT * FROM monthly_stats
    ORDER BY month DESC
    LIMIT $1`,
    [months]
  );
  return result.rows;
}

async function getProjectsOverTime(days = 90) {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at) as day,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE status = 'deployed') as deployed
    FROM generated_projects
    WHERE created_at >= NOW() - $1 * INTERVAL '1 day'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY day
  `, [days]);
  return result.rows;
}

async function getRevenueOverTime(months = 12) {
  const result = await query(`
    SELECT
      DATE_TRUNC('month', created_at) as month,
      SUM(plan_price) as revenue,
      COUNT(*) as new_subscribers
    FROM subscribers
    WHERE created_at >= NOW() - $1 * INTERVAL '1 month'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month
  `, [months]);
  return result.rows;
}

// ============================================
// SUBSCRIBER MANAGEMENT
// ============================================

async function createOrUpdateSubscriber(data) {
  const result = await query(
    `INSERT INTO subscribers (email, name, stripe_customer_id, plan, plan_price, mrr, status)
     VALUES ($1, $2, $3, $4, $5, $5, $6)
     ON CONFLICT (email) DO UPDATE SET
       name = COALESCE($2, subscribers.name),
       stripe_customer_id = COALESCE($3, subscribers.stripe_customer_id),
       plan = $4,
       plan_price = $5,
       mrr = $5,
       status = $6,
       updated_at = NOW()
     RETURNING *`,
    [data.email, data.name, data.stripeCustomerId, data.plan, data.planPrice || 0, data.status || 'active']
  );
  return result.rows[0];
}

async function updateSubscriberStatus(email, status) {
  await query(
    `UPDATE subscribers SET status = $2, cancelled_at = CASE WHEN $2 = 'cancelled' THEN NOW() ELSE NULL END WHERE email = $1`,
    [email, status]
  );
}

// ============================================
// DEMO DEPLOYMENT TRACKING
// ============================================

/**
 * Track a demo deployment
 */
async function trackDemoDeployment(data) {
  const result = await query(
    `INSERT INTO generated_projects
     (name, industry, status, is_demo, demo_batch_id, app_type, metadata,
      frontend_url, admin_url, backend_url, companion_app_url,
      github_frontend, github_backend, github_admin,
      railway_project_id, railway_project_url, domain)
     VALUES ($1, $2, $3, TRUE, $4, 'website', $5,
      $6, $7, $8, $9,
      $10, $11, $12,
      $13, $14, $15)
     RETURNING id`,
    [
      data.name,
      data.industry,
      data.status || 'deployed',
      data.demoBatchId,
      JSON.stringify({
        originalName: data.originalName,
        tagline: data.tagline,
        location: data.location,
        deployedAt: new Date().toISOString(),
        stats: data.stats || {}
      }),
      data.urls?.frontend || null,
      data.urls?.admin || null,
      data.urls?.backend || null,
      data.urls?.companion || null,
      data.github?.frontend || null,
      data.github?.backend || null,
      data.github?.admin || null,
      data.railwayProjectId || null,
      data.railwayProjectUrl || null,
      data.domain || null
    ]
  );
  return result.rows[0].id;
}

/**
 * Get all demo deployments
 */
async function getDemoDeployments(limit = 50) {
  const result = await query(
    `SELECT
       id, name, industry, status, domain,
       frontend_url, admin_url, backend_url, companion_app_url,
       github_frontend, github_backend, github_admin,
       railway_project_id, railway_project_url,
       demo_batch_id, created_at, deployed_at, metadata
     FROM generated_projects
     WHERE is_demo = TRUE
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Get demo deployments by batch ID
 */
async function getDemosByBatch(batchId) {
  const result = await query(
    `SELECT * FROM generated_projects
     WHERE is_demo = TRUE AND demo_batch_id = $1
     ORDER BY created_at DESC`,
    [batchId]
  );
  return result.rows;
}

/**
 * Delete a demo deployment record
 */
async function deleteDemoRecord(projectId) {
  await query('DELETE FROM generated_projects WHERE id = $1 AND is_demo = TRUE', [projectId]);
}

/**
 * Delete all demo records (just DB records, not actual deployments)
 */
async function deleteAllDemoRecords() {
  const result = await query('DELETE FROM generated_projects WHERE is_demo = TRUE RETURNING id');
  return result.rowCount;
}

/**
 * Get unique demo batch IDs for grouping
 */
async function getDemoBatches() {
  const result = await query(
    `SELECT
       demo_batch_id,
       MIN(created_at) as created_at,
       COUNT(*) as project_count,
       array_agg(name ORDER BY name) as project_names
     FROM generated_projects
     WHERE is_demo = TRUE AND demo_batch_id IS NOT NULL
     GROUP BY demo_batch_id
     ORDER BY MIN(created_at) DESC`
  );
  return result.rows;
}

// ============================================
// ADMIN AUTH
// ============================================

async function getAdminByEmail(email) {
  const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);
  return result.rows[0];
}

async function updateAdminLastLogin(email) {
  await query('UPDATE admin_users SET last_login = NOW() WHERE email = $1', [email]);
}

module.exports = {
  pool,
  query,
  transaction,
  initializeDatabase,
  // Project tracking (generated_projects table)
  trackProjectStart,
  trackProjectDeployed,
  trackProjectFailed,
  // Generation tracking (uses generated_projects table)
  trackGenerationStart,
  trackGenerationComplete,
  trackGenerationFailed,
  trackDeploymentFailed,
  trackBuildResult,
  updateProjectMetadata,
  updateProjectDeploymentUrls,
  getRecentGenerations,
  getGenerationStats,
  // Companion app tracking
  trackCompanionAppStart,
  updateCompanionAppDeployment,
  getCompanionAppsForProject,
  findParentProjectBySubdomain,
  // API tracking
  trackApiUsage,
  calculateClaudeCost,
  // Dashboard
  getDashboardStats,
  getRecentProjects,
  getAllProjects,
  getAllSubscribers,
  getApiUsageStats,
  getApiUsageTimeline,
  getCostBreakdown,
  getMonthlyStats,
  getProjectsOverTime,
  getRevenueOverTime,
  // Subscribers
  createOrUpdateSubscriber,
  updateSubscriberStatus,
  // Admin
  getAdminByEmail,
  updateAdminLastLogin,
  // Demo tracking
  trackDemoDeployment,
  getDemoDeployments,
  getDemosByBatch,
  deleteDemoRecord,
  deleteAllDemoRecords,
  getDemoBatches
};
