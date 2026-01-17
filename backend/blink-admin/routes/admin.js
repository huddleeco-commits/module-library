/**
 * Blink Admin Dashboard API Routes
 *
 * Comprehensive admin API with 16 dashboard tabs for PostgreSQL:
 * - Overview, Users, Generations, API Costs, Revenue
 * - Industries, Modules, Errors, Performance, Templates
 * - Email, Referrals, Alerts, Data Quality, Config, System
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../auth/middleware/auth');

// Database connection - PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = {
  query: (text, params) => pool.query(text, params),
  pool
};

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// ============================================
// OVERVIEW TAB
// ============================================

router.get('/overview', async (req, res) => {
  try {
    const metrics = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE subscription_tier != 'free') as paid_users,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE) as signups_today,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) as signups_this_week,
        (SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as signups_this_month,
        (SELECT COUNT(*) FROM users WHERE banned = true) as banned_users,
        (SELECT COUNT(*) FROM generations) as total_generations,
        (SELECT COUNT(*) FROM generations WHERE DATE(created_at) = CURRENT_DATE) as generations_today,
        (SELECT COUNT(*) FROM generations WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as generations_this_month,
        (SELECT COUNT(*) FROM generations WHERE status = 'completed') as successful_generations,
        (SELECT COUNT(*) FROM generations WHERE status = 'failed') as failed_generations,
        (SELECT COALESCE(AVG(generation_time_ms), 0) FROM generations WHERE status = 'completed') as avg_generation_time,
        (SELECT COALESCE(SUM(pages_generated), 0) FROM generations) as total_pages,
        (SELECT COALESCE(SUM(cost), 0) FROM api_usage WHERE call_date = CURRENT_DATE OR DATE(timestamp) = CURRENT_DATE) as cost_today,
        (SELECT COALESCE(SUM(cost), 0) FROM api_usage WHERE call_date >= DATE_TRUNC('month', CURRENT_DATE) OR timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as cost_this_month,
        (SELECT COALESCE(SUM(tokens_used), 0) FROM api_usage WHERE call_date >= DATE_TRUNC('month', CURRENT_DATE) OR timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as tokens_this_month,
        (SELECT COALESCE(SUM(mrr), 0) FROM subscribers WHERE status = 'active') as mrr,
        (SELECT COUNT(*) FROM system_alerts WHERE resolved = false) as active_alerts
    `);

    const m = metrics.rows[0];
    const totalGenerations = parseInt(m.total_generations) || 1;
    const successRate = (parseInt(m.successful_generations) / totalGenerations * 100).toFixed(1);
    const conversionRate = ((parseInt(m.paid_users) / (parseInt(m.total_users) || 1)) * 100).toFixed(1);
    const costPerGeneration = (parseFloat(m.cost_this_month) / (parseInt(m.generations_this_month) || 1)).toFixed(4);
    const mrr = parseFloat(m.mrr) || 0;
    const monthlyCost = parseFloat(m.cost_this_month) || 0;
    const profitMargin = mrr > 0 ? (((mrr - monthlyCost) / mrr) * 100).toFixed(1) : 0;

    const recentGenerations = await db.query(`
      SELECT g.id, g.site_name, g.industry, g.status, g.generation_time_ms, g.created_at, u.email as user_email
      FROM generations g LEFT JOIN users u ON g.user_id = u.id
      ORDER BY g.created_at DESC LIMIT 5
    `);

    const trends = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as generations,
        COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COALESCE(SUM(total_cost), 0) as cost
      FROM generations WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at) ORDER BY date
    `);

    res.json({
      success: true,
      overview: {
        users: {
          total: parseInt(m.total_users),
          paid: parseInt(m.paid_users),
          free: parseInt(m.total_users) - parseInt(m.paid_users),
          conversionRate: parseFloat(conversionRate),
          signupsToday: parseInt(m.signups_today),
          signupsThisWeek: parseInt(m.signups_this_week),
          signupsThisMonth: parseInt(m.signups_this_month),
          banned: parseInt(m.banned_users)
        },
        generations: {
          total: parseInt(m.total_generations),
          today: parseInt(m.generations_today),
          thisMonth: parseInt(m.generations_this_month),
          successful: parseInt(m.successful_generations),
          failed: parseInt(m.failed_generations),
          successRate: parseFloat(successRate),
          avgTimeMs: Math.round(parseFloat(m.avg_generation_time)),
          totalPages: parseInt(m.total_pages)
        },
        costs: {
          today: parseFloat(m.cost_today).toFixed(4),
          thisMonth: parseFloat(m.cost_this_month).toFixed(4),
          tokensThisMonth: parseInt(m.tokens_this_month),
          costPerGeneration: parseFloat(costPerGeneration)
        },
        revenue: {
          mrr: mrr.toFixed(2),
          arr: (mrr * 12).toFixed(2),
          profitMargin: parseFloat(profitMargin)
        },
        alerts: { active: parseInt(m.active_alerts) || 0 }
      },
      recentGenerations: recentGenerations.rows,
      trends: trends.rows
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch overview', details: error.message });
  }
});

// ============================================
// USERS TAB
// ============================================

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', tier = '', status = '', sort = 'created_at', order = 'desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(`(email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }
    if (tier) {
      paramCount++;
      conditions.push(`subscription_tier = $${paramCount}`);
      params.push(tier);
    }
    if (status === 'banned') conditions.push('banned = true');
    else if (status === 'active') conditions.push('(banned = false OR banned IS NULL)');

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const validSorts = ['created_at', 'email', 'subscription_tier', 'generations_used'];
    const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const usersQuery = `
      SELECT id, email, full_name, phone, subscription_tier, is_admin, banned, generations_used, scans_used, created_at, updated_at
      FROM users ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(parseInt(limit), offset);

    const users = await db.query(usersQuery, params);
    const countParams = params.slice(0, paramCount);
    const countResult = await db.query(`SELECT COUNT(*) FROM users ${whereClause}`, countParams);
    const total = parseInt(countResult.rows[0].count);

    const tierBreakdown = await db.query(`SELECT subscription_tier, COUNT(*) as count FROM users GROUP BY subscription_tier`);

    res.json({
      success: true,
      users: users.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      tierBreakdown: tierBreakdown.rows.reduce((acc, row) => { acc[row.subscription_tier] = parseInt(row.count); return acc; }, {})
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users', details: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

    const generations = await db.query(`SELECT * FROM generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`, [id]);
    const apiUsage = await db.query(`
      SELECT COALESCE(api_name, endpoint) as api_name, COUNT(*) as calls, SUM(cost) as total_cost, SUM(tokens_used) as total_tokens
      FROM api_usage WHERE user_id = $1 GROUP BY COALESCE(api_name, endpoint)
    `, [id]);

    res.json({ success: true, user: user.rows[0], generations: generations.rows, apiUsage: apiUsage.rows });
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user', details: error.message });
  }
});

router.put('/users/:id/tier', async (req, res) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;
    const validTiers = ['free', 'power', 'dealer', 'admin'];
    if (!validTiers.includes(tier)) return res.status(400).json({ success: false, error: 'Invalid tier' });

    const oldUser = await db.query('SELECT subscription_tier FROM users WHERE id = $1', [id]);
    if (oldUser.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

    await db.query(`UPDATE users SET subscription_tier = $1, updated_at = NOW() WHERE id = $2`, [tier, id]);
    await db.query(`INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, old_value, new_value) VALUES ($1, 'tier_changed', 'user', $2, $3, $4)`,
      [req.user.id, id, JSON.stringify(oldUser.rows[0]), JSON.stringify({ subscription_tier: tier })]);

    res.json({ success: true, message: 'User tier updated' });
  } catch (error) {
    console.error('Admin tier change error:', error);
    res.status(500).json({ success: false, error: 'Failed to update tier', details: error.message });
  }
});

router.put('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { banned, reason } = req.body;

    await db.query(`UPDATE users SET banned = $1, updated_at = NOW() WHERE id = $2`, [banned, id]);
    await db.query(`INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, new_value) VALUES ($1, $2, 'user', $3, $4)`,
      [req.user.id, banned ? 'user_banned' : 'user_unbanned', id, JSON.stringify({ banned, reason })]);

    res.json({ success: true, message: banned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    console.error('Admin ban error:', error);
    res.status(500).json({ success: false, error: 'Failed to update ban status', details: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const user = await db.query('SELECT email FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

    if (hardDelete === 'true') {
      await db.query('DELETE FROM generations WHERE user_id = $1', [id]);
      await db.query('DELETE FROM api_usage WHERE user_id = $1', [id]);
      await db.query('DELETE FROM users WHERE id = $1', [id]);
    } else {
      await db.query(`UPDATE users SET banned = true, email = CONCAT('deleted_', id, '@deleted.local'), full_name = 'Deleted User', updated_at = NOW() WHERE id = $1`, [id]);
    }

    await db.query(`INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, old_value) VALUES ($1, 'user_deleted', 'user', $2, $3)`,
      [req.user.id, id, JSON.stringify({ email: user.rows[0].email, hardDelete })]);

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user', details: error.message });
  }
});

// ============================================
// GENERATIONS TAB
// ============================================

router.get('/generations', async (req, res) => {
  try {
    const { page = 1, limit = 50, status = '', industry = '', dateFrom = '', dateTo = '', userId = '', sort = 'created_at', order = 'desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (status) { paramCount++; conditions.push(`g.status = $${paramCount}`); params.push(status); }
    if (industry) { paramCount++; conditions.push(`g.industry ILIKE $${paramCount}`); params.push(`%${industry}%`); }
    if (dateFrom) { paramCount++; conditions.push(`g.created_at >= $${paramCount}`); params.push(dateFrom); }
    if (dateTo) { paramCount++; conditions.push(`g.created_at <= $${paramCount}`); params.push(dateTo + ' 23:59:59'); }
    if (userId) { paramCount++; conditions.push(`g.user_id = $${paramCount}`); params.push(parseInt(userId)); }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const validSorts = ['created_at', 'generation_time_ms', 'total_cost', 'pages_generated'];
    const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT g.*, u.email as user_email, u.full_name as user_name, u.subscription_tier as user_tier
      FROM generations g LEFT JOIN users u ON g.user_id = u.id
      ${whereClause} ORDER BY g.${sortColumn} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(parseInt(limit), offset);
    const generations = await db.query(query, params);

    const countParams = params.slice(0, paramCount);
    const countResult = await db.query(`SELECT COUNT(*) FROM generations g ${whereClause}`, countParams);
    const total = parseInt(countResult.rows[0].count);

    const statusBreakdown = await db.query(`SELECT status, COUNT(*) as count FROM generations GROUP BY status`);
    const industryBreakdown = await db.query(`SELECT industry, COUNT(*) as count FROM generations WHERE industry IS NOT NULL GROUP BY industry ORDER BY count DESC LIMIT 10`);

    res.json({
      success: true,
      generations: generations.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
      statusBreakdown: statusBreakdown.rows.reduce((acc, row) => { acc[row.status] = parseInt(row.count); return acc; }, {}),
      industryBreakdown: industryBreakdown.rows
    });
  } catch (error) {
    console.error('Admin generations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch generations', details: error.message });
  }
});

// ============================================
// API COSTS TAB
// ============================================

router.get('/cost-analytics', async (req, res) => {
  try {
    const { dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], dateTo = new Date().toISOString().split('T')[0], groupBy = 'day' } = req.query;

    let dateGroup;
    switch (groupBy) {
      case 'week': dateGroup = "DATE_TRUNC('week', COALESCE(call_date::timestamp, timestamp))"; break;
      case 'month': dateGroup = "DATE_TRUNC('month', COALESCE(call_date::timestamp, timestamp))"; break;
      default: dateGroup = "DATE(COALESCE(call_date, DATE(timestamp)))";
    }

    const costTimeline = await db.query(`
      SELECT ${dateGroup} as period, COALESCE(api_name, endpoint) as api, COUNT(*) as calls, SUM(cost) as cost,
        SUM(input_tokens) as input_tokens, SUM(output_tokens) as output_tokens, AVG(duration_ms) as avg_duration
      FROM api_usage WHERE (call_date >= $1 OR DATE(timestamp) >= $1) AND (call_date <= $2 OR DATE(timestamp) <= $2)
      GROUP BY ${dateGroup}, COALESCE(api_name, endpoint) ORDER BY period, api
    `, [dateFrom, dateTo]);

    const costByApi = await db.query(`
      SELECT COALESCE(api_name, endpoint) as api, COUNT(*) as total_calls, SUM(cost) as total_cost,
        SUM(input_tokens) as total_input_tokens, SUM(output_tokens) as total_output_tokens,
        AVG(cost) as avg_cost_per_call, AVG(duration_ms) as avg_duration
      FROM api_usage WHERE (call_date >= $1 OR DATE(timestamp) >= $1) AND (call_date <= $2 OR DATE(timestamp) <= $2)
      GROUP BY COALESCE(api_name, endpoint) ORDER BY total_cost DESC
    `, [dateFrom, dateTo]);

    const costByModel = await db.query(`
      SELECT COALESCE(model_used, 'unknown') as model, COUNT(*) as calls, SUM(cost) as total_cost,
        SUM(input_tokens) as input_tokens, SUM(output_tokens) as output_tokens
      FROM api_usage WHERE (call_date >= $1 OR DATE(timestamp) >= $1) AND (call_date <= $2 OR DATE(timestamp) <= $2) AND model_used IS NOT NULL
      GROUP BY COALESCE(model_used, 'unknown') ORDER BY total_cost DESC
    `, [dateFrom, dateTo]);

    const totals = await db.query(`
      SELECT COUNT(*) as total_calls, SUM(cost) as total_cost, SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens, AVG(cost) as avg_cost_per_call, COUNT(DISTINCT user_id) as unique_users
      FROM api_usage WHERE (call_date >= $1 OR DATE(timestamp) >= $1) AND (call_date <= $2 OR DATE(timestamp) <= $2)
    `, [dateFrom, dateTo]);

    res.json({
      success: true,
      dateRange: { from: dateFrom, to: dateTo },
      summary: {
        totalCalls: parseInt(totals.rows[0].total_calls),
        totalCost: parseFloat(totals.rows[0].total_cost || 0).toFixed(4),
        totalInputTokens: parseInt(totals.rows[0].total_input_tokens || 0),
        totalOutputTokens: parseInt(totals.rows[0].total_output_tokens || 0),
        avgCostPerCall: parseFloat(totals.rows[0].avg_cost_per_call || 0).toFixed(6),
        uniqueUsers: parseInt(totals.rows[0].unique_users || 0)
      },
      timeline: costTimeline.rows,
      byApi: costByApi.rows,
      byModel: costByModel.rows
    });
  } catch (error) {
    console.error('Admin cost analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cost analytics', details: error.message });
  }
});

// ============================================
// REVENUE TAB
// ============================================

router.get('/revenue', async (req, res) => {
  try {
    const mrr = await db.query(`SELECT COALESCE(SUM(mrr), 0) as mrr FROM subscribers WHERE status = 'active'`);
    const mrrByTier = await db.query(`SELECT plan, COUNT(*) as subscribers, SUM(mrr) as mrr FROM subscribers WHERE status = 'active' GROUP BY plan`);
    const revenueTimeline = await db.query(`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as new_subscribers, SUM(plan_price) as revenue
      FROM subscribers WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at) ORDER BY month
    `);
    const churn = await db.query(`
      SELECT COUNT(*) FILTER (WHERE status = 'cancelled' AND cancelled_at >= DATE_TRUNC('month', NOW())) as churned_this_month,
        COUNT(*) FILTER (WHERE status = 'active') as active_subscribers, COUNT(*) as total_subscribers
      FROM subscribers
    `);
    const tierDistribution = await db.query(`SELECT subscription_tier, COUNT(*) as count FROM users GROUP BY subscription_tier`);

    const currentMrr = parseFloat(mrr.rows[0].mrr);
    const activeCount = parseInt(churn.rows[0].active_subscribers) || 1;
    const churnedCount = parseInt(churn.rows[0].churned_this_month);
    const churnRate = ((churnedCount / activeCount) * 100).toFixed(2);

    res.json({
      success: true,
      revenue: {
        mrr: currentMrr.toFixed(2),
        arr: (currentMrr * 12).toFixed(2),
        churnRate: parseFloat(churnRate),
        activeSubscribers: parseInt(churn.rows[0].active_subscribers),
        totalSubscribers: parseInt(churn.rows[0].total_subscribers)
      },
      mrrByTier: mrrByTier.rows,
      timeline: revenueTimeline.rows,
      tierDistribution: tierDistribution.rows.reduce((acc, row) => { acc[row.subscription_tier] = parseInt(row.count); return acc; }, {})
    });
  } catch (error) {
    console.error('Admin revenue error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue data', details: error.message });
  }
});

// ============================================
// INDUSTRIES TAB
// ============================================

router.get('/industries', async (req, res) => {
  try {
    const industries = await db.query(`
      SELECT industry, COUNT(*) as generation_count, COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed, AVG(generation_time_ms) FILTER (WHERE status = 'completed') as avg_time,
        SUM(total_cost) as total_cost, COUNT(DISTINCT user_id) as unique_users
      FROM generations WHERE industry IS NOT NULL GROUP BY industry ORDER BY generation_count DESC
    `);

    res.json({
      success: true,
      industries: industries.rows.map(row => ({
        ...row,
        success_rate: row.generation_count > 0 ? ((parseInt(row.successful) / parseInt(row.generation_count)) * 100).toFixed(1) : 0
      }))
    });
  } catch (error) {
    console.error('Admin industries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch industry data', details: error.message });
  }
});

// ============================================
// MODULES TAB
// ============================================

router.get('/modules', async (req, res) => {
  try {
    const generations = await db.query(`SELECT modules_selected, status, generation_time_ms, industry FROM generations WHERE modules_selected IS NOT NULL`);

    const moduleStats = {};
    generations.rows.forEach(row => {
      const modules = Array.isArray(row.modules_selected) ? row.modules_selected : [];
      modules.forEach(mod => {
        const moduleName = typeof mod === 'string' ? mod : mod.name || mod.id;
        if (!moduleName) return;
        if (!moduleStats[moduleName]) moduleStats[moduleName] = { name: moduleName, usageCount: 0, successCount: 0, failedCount: 0 };
        moduleStats[moduleName].usageCount++;
        if (row.status === 'completed') moduleStats[moduleName].successCount++;
        else if (row.status === 'failed') moduleStats[moduleName].failedCount++;
      });
    });

    const modules = Object.values(moduleStats).map(mod => ({
      ...mod,
      successRate: mod.usageCount > 0 ? ((mod.successCount / mod.usageCount) * 100).toFixed(1) : 0
    })).sort((a, b) => b.usageCount - a.usageCount);

    res.json({ success: true, modules, totalModulesUsed: modules.length, mostPopular: modules.slice(0, 10) });
  } catch (error) {
    console.error('Admin modules error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch module data', details: error.message });
  }
});

// ============================================
// ERRORS TAB
// ============================================

router.get('/errors', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const failures = await db.query(`
      SELECT g.*, u.email as user_email FROM generations g LEFT JOIN users u ON g.user_id = u.id
      WHERE g.status = 'failed' ORDER BY g.created_at DESC LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);

    const countResult = await db.query(`SELECT COUNT(*) FROM generations WHERE status = 'failed'`);
    const errorPatterns = await db.query(`SELECT error_message, COUNT(*) as count FROM generations WHERE status = 'failed' AND error_message IS NOT NULL GROUP BY error_message ORDER BY count DESC LIMIT 20`);
    const errorTrend = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM generations WHERE created_at >= NOW() - INTERVAL '14 days' GROUP BY DATE(created_at) ORDER BY date
    `);

    res.json({
      success: true,
      failures: failures.rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(countResult.rows[0].count), pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)) },
      errorPatterns: errorPatterns.rows,
      errorTrend: errorTrend.rows.map(row => ({ ...row, errorRate: row.total > 0 ? ((parseInt(row.failed) / parseInt(row.total)) * 100).toFixed(1) : 0 }))
    });
  } catch (error) {
    console.error('Admin errors error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch error data', details: error.message });
  }
});

// ============================================
// PERFORMANCE TAB
// ============================================

router.get('/performance', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT AVG(generation_time_ms) FILTER (WHERE status = 'completed') as avg_time,
        MIN(generation_time_ms) FILTER (WHERE status = 'completed') as min_time,
        MAX(generation_time_ms) FILTER (WHERE status = 'completed') as max_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY generation_time_ms) FILTER (WHERE status = 'completed') as median_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY generation_time_ms) FILTER (WHERE status = 'completed') as p95_time
      FROM generations WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const timeline = await db.query(`
      SELECT DATE(created_at) as date, AVG(generation_time_ms) FILTER (WHERE status = 'completed') as avg_time,
        COUNT(*) as total_generations, COUNT(*) FILTER (WHERE generation_time_ms > 120000) as slow_generations
      FROM generations WHERE created_at >= NOW() - INTERVAL '14 days' GROUP BY DATE(created_at) ORDER BY date
    `);

    const slowest = await db.query(`
      SELECT g.id, g.site_name, g.industry, g.pages_generated, g.generation_time_ms, g.created_at, u.email as user_email
      FROM generations g LEFT JOIN users u ON g.user_id = u.id
      WHERE g.status = 'completed' AND g.generation_time_ms IS NOT NULL ORDER BY g.generation_time_ms DESC LIMIT 20
    `);

    res.json({
      success: true,
      stats: {
        avgTimeMs: Math.round(parseFloat(stats.rows[0].avg_time) || 0),
        minTimeMs: Math.round(parseFloat(stats.rows[0].min_time) || 0),
        maxTimeMs: Math.round(parseFloat(stats.rows[0].max_time) || 0),
        medianTimeMs: Math.round(parseFloat(stats.rows[0].median_time) || 0),
        p95TimeMs: Math.round(parseFloat(stats.rows[0].p95_time) || 0)
      },
      timeline: timeline.rows,
      slowest: slowest.rows
    });
  } catch (error) {
    console.error('Admin performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch performance data', details: error.message });
  }
});

// ============================================
// TEMPLATES TAB
// ============================================

router.get('/templates', async (req, res) => {
  try {
    const templates = await db.query(`
      SELECT template_used as template, COUNT(*) as usage_count, COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed, AVG(generation_time_ms) FILTER (WHERE status = 'completed') as avg_time,
        COUNT(DISTINCT user_id) as unique_users
      FROM generations WHERE template_used IS NOT NULL GROUP BY template_used ORDER BY usage_count DESC
    `);

    res.json({
      success: true,
      templates: templates.rows.map(row => ({
        ...row,
        successRate: row.usage_count > 0 ? ((parseInt(row.successful) / parseInt(row.usage_count)) * 100).toFixed(1) : 0
      }))
    });
  } catch (error) {
    console.error('Admin templates error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch template data', details: error.message });
  }
});

// ============================================
// EMAIL TAB
// ============================================

router.get('/email/campaigns', async (req, res) => {
  try {
    const campaigns = await db.query(`SELECT * FROM email_campaigns ORDER BY created_at DESC`);
    res.json({ success: true, campaigns: campaigns.rows });
  } catch (error) {
    console.error('Admin email campaigns error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch campaigns', details: error.message });
  }
});

router.post('/email/campaigns', async (req, res) => {
  try {
    const { name, subject, bodyHtml, bodyText, segment, scheduledAt } = req.body;
    const result = await db.query(`
      INSERT INTO email_campaigns (name, subject, body_html, body_text, segment, scheduled_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [name, subject, bodyHtml, bodyText, segment || 'all', scheduledAt, req.user.id]);
    res.json({ success: true, campaign: result.rows[0] });
  } catch (error) {
    console.error('Admin create campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to create campaign', details: error.message });
  }
});

// ============================================
// REFERRALS TAB
// ============================================

router.get('/referrals', async (req, res) => {
  try {
    const referrals = await db.query(`SELECT r.*, u.email as owner_email, u.full_name as owner_name FROM referral_codes r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.total_signups DESC`);
    const stats = await db.query(`SELECT COUNT(*) as total_codes, SUM(total_signups) as total_referrals, COUNT(*) FILTER (WHERE active = true) as active_codes FROM referral_codes`);
    const recentSignups = await db.query(`SELECT u.id, u.email, u.full_name, u.referred_by, u.created_at FROM users u WHERE u.referred_by IS NOT NULL ORDER BY u.created_at DESC LIMIT 20`);
    res.json({ success: true, referrals: referrals.rows, stats: stats.rows[0], recentSignups: recentSignups.rows });
  } catch (error) {
    console.error('Admin referrals error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch referral data', details: error.message });
  }
});

router.post('/referrals', async (req, res) => {
  try {
    const { code, userId, maxUses, expiresAt, rewardType, rewardValue } = req.body;
    const result = await db.query(`INSERT INTO referral_codes (code, user_id, max_uses, expires_at, reward_type, reward_value) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [code.toLowerCase(), userId, maxUses, expiresAt, rewardType || 'free_generation', rewardValue || 0]);
    res.json({ success: true, referralCode: result.rows[0] });
  } catch (error) {
    console.error('Admin create referral error:', error);
    res.status(500).json({ success: false, error: 'Failed to create referral code', details: error.message });
  }
});

// ============================================
// ALERTS TAB
// ============================================

router.get('/alerts', async (req, res) => {
  try {
    const { resolved = 'false' } = req.query;
    const alerts = await db.query(`SELECT * FROM system_alerts WHERE resolved = $1 ORDER BY created_at DESC LIMIT 100`, [resolved === 'true']);
    const rules = await db.query(`SELECT * FROM alert_rules ORDER BY name`);
    res.json({ success: true, alerts: alerts.rows, rules: rules.rows });
  } catch (error) {
    console.error('Admin alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts', details: error.message });
  }
});

router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE system_alerts SET resolved = true, resolved_at = NOW(), resolved_by = $1 WHERE id = $2`, [req.user.id, id]);
    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('Admin resolve alert error:', error);
    res.status(500).json({ success: false, error: 'Failed to resolve alert', details: error.message });
  }
});

router.post('/alerts/check', async (req, res) => {
  try {
    await db.query('SELECT check_alert_rules()');
    res.json({ success: true, message: 'Alert check completed' });
  } catch (error) {
    console.error('Admin check alerts error:', error);
    res.status(500).json({ success: false, error: 'Failed to check alerts', details: error.message });
  }
});

// ============================================
// DATA QUALITY TAB
// ============================================

router.get('/data-quality', async (req, res) => {
  try {
    const orphanedGenerations = await db.query(`SELECT COUNT(*) as count FROM generations g LEFT JOIN users u ON g.user_id = u.id WHERE g.user_id IS NOT NULL AND u.id IS NULL`);
    const duplicateEmails = await db.query(`SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1`);
    const staleGenerations = await db.query(`SELECT COUNT(*) as count FROM generations WHERE status IN ('pending', 'generating') AND created_at < NOW() - INTERVAL '1 hour'`);
    const recentLogs = await db.query(`SELECT * FROM data_quality_log ORDER BY created_at DESC LIMIT 20`);
    res.json({
      success: true,
      checks: { orphanedGenerations: parseInt(orphanedGenerations.rows[0].count), duplicateEmails: duplicateEmails.rows.length, staleGenerations: parseInt(staleGenerations.rows[0].count) },
      duplicateEmailsList: duplicateEmails.rows,
      recentLogs: recentLogs.rows
    });
  } catch (error) {
    console.error('Admin data quality error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data quality', details: error.message });
  }
});

router.post('/data-quality/fix/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let recordsFixed = 0;

    switch (type) {
      case 'stale-generations':
        const result = await db.query(`UPDATE generations SET status = 'failed', error_message = 'Timed out - marked as failed by admin' WHERE status IN ('pending', 'generating') AND created_at < NOW() - INTERVAL '1 hour'`);
        recordsFixed = result.rowCount;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unknown fix type' });
    }

    await db.query(`INSERT INTO data_quality_log (check_type, records_found, records_fixed, run_by) VALUES ($1, $2, $3, $4)`, [type, recordsFixed, recordsFixed, req.user.id]);
    res.json({ success: true, message: `Fixed ${recordsFixed} records`, recordsFixed });
  } catch (error) {
    console.error('Admin data fix error:', error);
    res.status(500).json({ success: false, error: 'Failed to fix data', details: error.message });
  }
});

// ============================================
// CONFIG TAB
// ============================================

router.get('/config', async (req, res) => {
  try {
    const config = await db.query(`SELECT * FROM platform_config ORDER BY key`);
    res.json({
      success: true,
      config: config.rows.reduce((acc, row) => { acc[row.key] = { value: row.value, description: row.description, updatedAt: row.updated_at }; return acc; }, {})
    });
  } catch (error) {
    console.error('Admin config error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch config', details: error.message });
  }
});

router.put('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const old = await db.query('SELECT value FROM platform_config WHERE key = $1', [key]);
    await db.query(`INSERT INTO platform_config (key, value, updated_by, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()`,
      [key, JSON.stringify(value), req.user.id]);
    await db.query(`INSERT INTO admin_audit_log (admin_id, action, target_type, old_value, new_value) VALUES ($1, 'config_updated', 'config', $2, $3)`,
      [req.user.id, old.rows[0]?.value, JSON.stringify(value)]);
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    console.error('Admin config update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update config', details: error.message });
  }
});

// ============================================
// SYSTEM TAB
// ============================================

router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const dbCheck = await db.query('SELECT NOW() as time, pg_database_size(current_database()) as db_size');
    const dbResponseTime = Date.now() - startTime;

    const poolStats = pool ? { totalConnections: pool.totalCount || 0, idleConnections: pool.idleCount || 0, waitingClients: pool.waitingCount || 0 } : { totalConnections: 0, idleConnections: 0, waitingClients: 0 };
    const activeUsers = await db.query(`SELECT COUNT(*) as count FROM users WHERE last_active_at >= NOW() - INTERVAL '5 minutes'`);
    const uptimeSeconds = process.uptime();

    res.json({
      success: true,
      health: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: { seconds: Math.floor(uptimeSeconds), formatted: formatUptime(uptimeSeconds) },
        database: { status: 'connected', responseTimeMs: dbResponseTime, sizeBytes: parseInt(dbCheck.rows[0].db_size), sizeMB: (parseInt(dbCheck.rows[0].db_size) / 1024 / 1024).toFixed(2) },
        pool: poolStats,
        metrics: { activeUsers: parseInt(activeUsers.rows[0].count) },
        memory: { heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), rss: Math.round(process.memoryUsage().rss / 1024 / 1024) },
        node: { version: process.version, platform: process.platform }
      }
    });
  } catch (error) {
    console.error('Admin health error:', error);
    res.status(500).json({ success: false, health: { status: 'unhealthy' }, error: error.message });
  }
});

// ============================================
// EXPORTS
// ============================================

router.get('/export/users', async (req, res) => {
  try {
    const users = await db.query(`SELECT id, email, full_name, phone, subscription_tier, is_admin, banned, generations_used, scans_used, created_at FROM users ORDER BY created_at DESC`);
    const csv = generateCSV(users.rows, ['id', 'email', 'full_name', 'phone', 'subscription_tier', 'is_admin', 'banned', 'generations_used', 'scans_used', 'created_at']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Admin export users error:', error);
    res.status(500).json({ success: false, error: 'Failed to export users', details: error.message });
  }
});

router.get('/export/generations', async (req, res) => {
  try {
    const generations = await db.query(`SELECT id, user_email, site_name, industry, pages_generated, total_cost, generation_time_ms, status, created_at FROM generations ORDER BY created_at DESC`);
    const csv = generateCSV(generations.rows, ['id', 'user_email', 'site_name', 'industry', 'pages_generated', 'total_cost', 'generation_time_ms', 'status', 'created_at']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=generations-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Admin export generations error:', error);
    res.status(500).json({ success: false, error: 'Failed to export generations', details: error.message });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateCSV(rows, columns) {
  if (rows.length === 0) return columns.join(',') + '\n';
  const header = columns.join(',');
  const body = rows.map(row => columns.map(col => {
    let value = row[col];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') value = JSON.stringify(value);
    value = String(value);
    if (value.includes(',') || value.includes('\n') || value.includes('"')) value = '"' + value.replace(/"/g, '""') + '"';
    return value;
  }).join(',')).join('\n');
  return header + '\n' + body;
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.length > 0 ? parts.join(' ') : '< 1m';
}

module.exports = router;
