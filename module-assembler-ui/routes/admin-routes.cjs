/**
 * BLINK Admin Routes
 * Admin dashboard API endpoints
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Database functions
let db;
try {
  db = require('../database/db.cjs');
} catch (e) {
  console.log('   DB: Database module not loaded yet');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = '1h'; // Reduced from 24h for security - use refresh tokens for longer sessions

// Validate JWT_SECRET is set and sufficiently strong
if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required');
  console.error('   Admin routes will not function without it.');
} else if (JWT_SECRET.length < 32) {
  console.error('❌ CRITICAL: JWT_SECRET is too weak (min 32 characters required)');
  console.error('   Generate a strong secret: openssl rand -base64 48');
} else if (JWT_SECRET.includes('secret') || JWT_SECRET.includes('change') || JWT_SECRET.includes('local')) {
  console.warn('⚠️ WARNING: JWT_SECRET appears to be a placeholder - use a cryptographically random value');
}

// ============================================
// AUTH MIDDLEWARE
// ============================================

function authenticateAdmin(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.admin = decoded;
    next();
  });
}

// ============================================
// AUTH ROUTES
// ============================================

router.post('/login',
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({ success: false, error: 'Server configuration error' });
      }

      const { email, password } = req.body;

      const admin = await db.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await db.updateAdminLastLogin(email);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.get('/me', authenticateAdmin, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ============================================
// DASHBOARD ROUTES
// ============================================

router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    const recentProjects = await db.getRecentProjects(10);

    // Calculate profit margin
    const mrr = parseFloat(stats.total_mrr) || 0;
    const apiCost = parseFloat(stats.api_cost_this_month) || 0;
    const profitMargin = mrr > 0 ? ((mrr - apiCost) / mrr * 100).toFixed(1) : 0;

    // Convert numeric fields in recentProjects
    const processedProjects = recentProjects.map(p => ({
      ...p,
      api_cost: parseFloat(p.api_cost) || 0
    }));

    res.json({
      success: true,
      stats: {
        totalProjects: parseInt(stats.total_projects) || 0,
        deployedProjects: parseInt(stats.deployed_projects) || 0,
        projectsThisMonth: parseInt(stats.projects_this_month) || 0,
        activeSubscribers: parseInt(stats.active_subscribers) || 0,
        mrr: mrr,
        apiCostThisMonth: apiCost,
        tokensThisMonth: parseInt(stats.tokens_this_month) || 0,
        profitMargin: parseFloat(profitMargin)
      },
      recentProjects: processedProjects
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
});

// Overview endpoint - returns data structure expected by generated admin DashboardPage
router.get('/overview', authenticateAdmin, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    const recentProjects = await db.getRecentProjects(10);

    // Parse stats
    const totalUsers = parseInt(stats.total_users) || 0;
    const paidUsers = parseInt(stats.paid_users) || parseInt(stats.active_subscribers) || 0;
    const mrr = parseFloat(stats.total_mrr) || 0;
    const apiCost = parseFloat(stats.api_cost_this_month) || 0;
    const totalGenerations = parseInt(stats.total_projects) || 0;
    const generationsToday = parseInt(stats.projects_today) || 0;
    const successRate = parseFloat(stats.success_rate) || 95.0;
    const avgGenTime = parseInt(stats.avg_generation_time) || 45000;
    const signupsToday = parseInt(stats.signups_today) || 0;

    // Calculate profit margin
    const profitMargin = mrr > 0 ? ((mrr - apiCost) / mrr * 100) : 0;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers * 100) : 0;
    const costPerGeneration = totalGenerations > 0 ? (apiCost / totalGenerations) : 0;

    // Format recent generations for the table
    const recentGenerations = recentProjects.map(p => ({
      id: p.id,
      site_name: p.site_name || p.name || 'Untitled',
      industry: p.industry || 'General',
      user_email: p.user_email || p.email || 'Unknown',
      status: p.status || 'completed',
      generation_time_ms: parseInt(p.generation_time_ms) || parseInt(p.api_cost) * 1000 || 30000,
      created_at: p.created_at
    }));

    // Get tier distribution from subscribers (schema uses 'plan' not 'tier')
    let tierDistribution = [];
    try {
      const tierResult = await db.query(`
        SELECT COALESCE(plan, 'free') as tier, COUNT(*) as count
        FROM subscribers
        GROUP BY plan
        ORDER BY count DESC
      `);
      tierDistribution = tierResult.rows || [];
    } catch (e) {
      // Fallback if subscribers table doesn't exist
      tierDistribution = [
        { tier: 'free', count: Math.max(0, totalUsers - paidUsers) },
        { tier: 'pro', count: paidUsers }
      ];
    }

    // Get 7-day trends
    let trends = [];
    try {
      const trendsResult = await db.query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as generations
        FROM generated_projects
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
      trends = trendsResult.rows.map(r => ({
        date: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
        generations: parseInt(r.generations)
      }));
    } catch (e) {
      // Fallback empty trends
    }

    res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          paid: paidUsers,
          conversionRate: conversionRate.toFixed(1),
          signupsToday
        },
        generations: {
          total: totalGenerations,
          today: generationsToday,
          successRate: successRate.toFixed(1),
          avgTime: avgGenTime
        },
        costs: {
          thisMonth: apiCost,
          perGeneration: costPerGeneration.toFixed(4)
        },
        revenue: {
          mrr,
          profitMargin: profitMargin.toFixed(1)
        },
        alerts: {
          active: 0
        },
        recentGenerations,
        trends,
        tierDistribution
      }
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ success: false, error: 'Failed to load overview' });
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

router.get('/projects', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const data = await db.getAllProjects(page, limit);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Projects error:', err);
    res.status(500).json({ success: false, error: 'Failed to load projects' });
  }
});

router.get('/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM generated_projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Get API usage for this project
    const usage = await db.query(
      'SELECT * FROM api_usage WHERE project_id = $1 ORDER BY timestamp DESC',
      [req.params.id]
    );

    // Get deployments for this project
    const deployments = await db.query(
      'SELECT * FROM deployments WHERE project_id = $1 ORDER BY started_at DESC',
      [req.params.id]
    );

    res.json({
      success: true,
      project: result.rows[0],
      apiUsage: usage.rows,
      deployments: deployments.rows
    });
  } catch (err) {
    console.error('Project detail error:', err);
    res.status(500).json({ success: false, error: 'Failed to load project' });
  }
});

// Delete a project and all associated resources
router.delete('/projects/:id', authenticateAdmin, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Get project details first
    const result = await db.query('SELECT * FROM generated_projects WHERE id = $1', [projectId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = result.rows[0];
    const projectName = project.name;

    // Use project-deleter to remove all resources
    const projectDeleter = require('../lib/services/project-deleter.cjs');

    console.log(`🗑️ API: Deleting project ${projectName} (ID: ${projectId})`);

    const deleteResult = await projectDeleter.deleteProject(projectName, {
      dryRun: false,
      skipVerification: false
    });

    // Remove from database regardless of external deletion results
    await db.query('DELETE FROM api_usage WHERE project_id = $1', [projectId]);
    await db.query('DELETE FROM deployments WHERE project_id = $1', [projectId]);
    await db.query('DELETE FROM generated_projects WHERE id = $1', [projectId]);

    res.json({
      success: true,
      message: `Project "${projectName}" deleted`,
      details: {
        projectId,
        projectName,
        resourcesDeleted: deleteResult.results || {},
        errors: deleteResult.results?.errors || []
      }
    });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
      details: err.message
    });
  }
});

// ============================================
// GENERATIONS ROUTES
// ============================================

// Get paginated list of generations with URLs
router.get('/generations', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Get generations with all URL columns and companion app tracking
    const result = await db.query(`
      SELECT
        id, name as site_name, industry, status,
        user_email, domain,
        frontend_url, admin_url, backend_url,
        github_frontend, github_backend, github_admin,
        railway_project_url, railway_project_id,
        api_cost as total_cost, api_tokens_used as total_tokens,
        created_at, deployed_at, metadata,
        app_type, parent_project_id, domain_type
      FROM generated_projects
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM generated_projects');
    const total = parseInt(countResult.rows[0].count);

    // Parse metadata for each generation to extract additional fields
    const generations = result.rows.map(g => {
      let meta = {};
      try {
        meta = typeof g.metadata === 'string' ? JSON.parse(g.metadata) : (g.metadata || {});
      } catch (e) {}

      return {
        ...g,
        pages_generated: meta.pagesGenerated || 0,
        generation_time_ms: meta.generationTimeMs || 0,
        // Ensure companion app fields have defaults
        app_type: g.app_type || 'website',
        parent_project_id: g.parent_project_id || null,
        domain_type: g.domain_type || 'be1st.io',
        // Extract parent site info from metadata for companion apps
        parent_site_name: meta.parentSiteName || null,
        parent_site_subdomain: meta.parentSiteSubdomain || null
      };
    });

    res.json({
      success: true,
      generations,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Generations error:', err);
    res.status(500).json({ success: false, error: 'Failed to load generations' });
  }
});

// ============================================
// SUBSCRIBERS ROUTES
// ============================================

router.get('/subscribers', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const data = await db.getAllSubscribers(page, limit);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Subscribers error:', err);
    res.status(500).json({ success: false, error: 'Failed to load subscribers' });
  }
});

router.post('/subscribers', authenticateAdmin, async (req, res) => {
  try {
    const subscriber = await db.createOrUpdateSubscriber(req.body);
    res.json({ success: true, subscriber });
  } catch (err) {
    console.error('Create subscriber error:', err);
    res.status(500).json({ success: false, error: 'Failed to create subscriber' });
  }
});

// ============================================
// API USAGE ROUTES
// ============================================

router.get('/usage', authenticateAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await db.getApiUsageStats(days);
    const timeline = await db.getApiUsageTimeline(days);

    // Calculate totals
    const totals = stats.reduce((acc, s) => ({
      requests: acc.requests + parseInt(s.requests),
      tokens: acc.tokens + parseInt(s.total_tokens || 0),
      cost: acc.cost + parseFloat(s.total_cost || 0)
    }), { requests: 0, tokens: 0, cost: 0 });

    res.json({
      success: true,
      stats,
      timeline,
      totals
    });
  } catch (err) {
    console.error('Usage error:', err);
    res.status(500).json({ success: false, error: 'Failed to load usage data' });
  }
});

// ============================================
// COSTS ROUTES
// ============================================

router.get('/costs', authenticateAdmin, async (req, res) => {
  try {
    const month = req.query.month || null;
    const breakdown = await db.getCostBreakdown(month);

    // Get API costs from usage table
    const apiCosts = await db.query(`
      SELECT
        endpoint as category,
        'api' as type,
        SUM(cost) as total
      FROM api_usage
      WHERE timestamp >= DATE_TRUNC('month', NOW())
      GROUP BY endpoint
    `);

    // Calculate totals
    const fixedCosts = breakdown.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);
    const variableCosts = apiCosts.rows.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);

    res.json({
      success: true,
      fixed: breakdown,
      variable: apiCosts.rows,
      totals: {
        fixed: fixedCosts,
        variable: variableCosts,
        total: fixedCosts + variableCosts
      }
    });
  } catch (err) {
    console.error('Costs error:', err);
    res.status(500).json({ success: false, error: 'Failed to load costs' });
  }
});

router.post('/costs', authenticateAdmin, async (req, res) => {
  try {
    const { category, description, amount, vendor, recurring, billingPeriod } = req.body;
    const month = new Date().toISOString().slice(0, 7) + '-01';

    await db.query(
      `INSERT INTO cost_entries (category, description, amount, vendor, recurring, billing_period, month)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [category, description, amount, vendor, recurring, billingPeriod, month]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Add cost error:', err);
    res.status(500).json({ success: false, error: 'Failed to add cost entry' });
  }
});

// ============================================
// ANALYTICS ROUTES
// ============================================

router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    const monthlyStats = await db.getMonthlyStats(12);
    const projectsTimeline = await db.getProjectsOverTime(90);
    const revenueTimeline = await db.getRevenueOverTime(12);

    // Calculate growth rates
    const currentMonth = monthlyStats[0] || {};
    const lastMonth = monthlyStats[1] || {};

    const projectGrowth = lastMonth.projects_generated
      ? ((currentMonth.projects_generated - lastMonth.projects_generated) / lastMonth.projects_generated * 100).toFixed(1)
      : 0;

    const revenueGrowth = lastMonth.total_revenue
      ? ((currentMonth.total_revenue - lastMonth.total_revenue) / lastMonth.total_revenue * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      monthly: monthlyStats,
      projects: projectsTimeline,
      revenue: revenueTimeline,
      growth: {
        projects: parseFloat(projectGrowth),
        revenue: parseFloat(revenueGrowth)
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to load analytics' });
  }
});

// ============================================
// DEMO MANAGEMENT ROUTES
// ============================================

// Get all demo deployments
router.get('/demos', authenticateAdmin, async (req, res) => {
  try {
    const demos = await db.getDemoDeployments(100);
    const batches = await db.getDemoBatches();

    res.json({
      success: true,
      demos,
      batches,
      count: demos.length
    });
  } catch (err) {
    console.error('Demo list error:', err);
    res.status(500).json({ success: false, error: 'Failed to load demos' });
  }
});

// Delete a single demo (resources + DB record)
router.delete('/demos/:id', authenticateAdmin, async (req, res) => {
  try {
    const demoId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Project name required' });
    }

    console.log(`🗑️ API: Deleting demo "${name}" (ID: ${demoId})`);

    // Use project-deleter to remove all cloud resources
    const projectDeleter = require('../lib/services/project-deleter.cjs');

    const deleteResult = await projectDeleter.deleteProject(name, {
      dryRun: false,
      skipVerification: true
    });

    // Remove from database
    await db.deleteDemoRecord(demoId);

    res.json({
      success: true,
      message: `Demo "${name}" deleted`,
      details: deleteResult
    });
  } catch (err) {
    console.error('Demo delete error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete demo',
      details: err.message
    });
  }
});

// Delete all demos
router.delete('/demos/all', authenticateAdmin, async (req, res) => {
  try {
    // Get all demos first
    const demos = await db.getDemoDeployments(500);

    console.log(`🗑️ API: Deleting ALL ${demos.length} demo deployments`);

    const projectDeleter = require('../lib/services/project-deleter.cjs');
    const results = [];

    // Delete each demo's cloud resources
    for (const demo of demos) {
      try {
        await projectDeleter.deleteProject(demo.name, {
          dryRun: false,
          skipVerification: true
        });
        results.push({ name: demo.name, success: true });
      } catch (err) {
        results.push({ name: demo.name, success: false, error: err.message });
      }
    }

    // Clear all demo records from DB
    const deletedCount = await db.deleteAllDemoRecords();

    res.json({
      success: true,
      deleted: deletedCount,
      results
    });
  } catch (err) {
    console.error('Delete all demos error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all demos',
      details: err.message
    });
  }
});

// ============================================
// EXPORT
// ============================================

module.exports = router;
