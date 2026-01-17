/**
 * Cost Tracking Service for Blink Platform
 *
 * Logs every AI API call to the api_usage table for cost analytics.
 * Integrates with the generation flow to track costs per generation.
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Claude pricing per 1M tokens (as of 2024)
const CLAUDE_PRICING = {
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
};

/**
 * Calculate cost based on token usage and model
 */
function calculateCost(inputTokens, outputTokens, model = 'claude-sonnet-4-20250514') {
  const pricing = CLAUDE_PRICING[model] || CLAUDE_PRICING['claude-sonnet-4-20250514'];
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Track an API call in the database
 *
 * @param {Object} params
 * @param {number} params.userId - User ID making the call
 * @param {number} params.generationId - Generation ID (if applicable)
 * @param {string} params.apiName - 'claude', 'openai', 'stripe', 'ebay'
 * @param {string} params.operationType - 'site_generation', 'page_generation', 'rebuild_analysis', etc.
 * @param {number} params.inputTokens - Input token count
 * @param {number} params.outputTokens - Output token count
 * @param {string} params.model - Model used (e.g., 'claude-sonnet-4-20250514')
 * @param {number} params.durationMs - Request duration in milliseconds
 * @param {boolean} params.success - Whether the call succeeded
 * @param {string} params.errorMessage - Error message if failed
 * @param {Object} params.metadata - Additional metadata (industry, pageName, etc.)
 */
async function trackApiCall({
  userId,
  generationId,
  apiName,
  operationType,
  inputTokens = 0,
  outputTokens = 0,
  model = 'claude-sonnet-4-20250514',
  durationMs = 0,
  success = true,
  errorMessage = null,
  metadata = {}
}) {
  try {
    const cost = calculateCost(inputTokens, outputTokens, model);
    const tokensUsed = inputTokens + outputTokens;

    await pool.query(`
      INSERT INTO api_usage (
        user_id, generation_id, api_name, operation_type, call_date,
        input_tokens, output_tokens, tokens_used, cost, model_used,
        duration_ms, success, error_message, metadata, timestamp
      ) VALUES (
        $1, $2, $3, $4, CURRENT_DATE,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, NOW()
      )
    `, [
      userId, generationId, apiName, operationType,
      inputTokens, outputTokens, tokensUsed, cost, model,
      durationMs, success, errorMessage, JSON.stringify(metadata)
    ]);

    // If this is part of a generation, update the generation's total cost
    if (generationId) {
      await pool.query(`
        UPDATE generations SET
          total_cost = COALESCE(total_cost, 0) + $1,
          total_tokens = COALESCE(total_tokens, 0) + $2,
          input_tokens = COALESCE(input_tokens, 0) + $3,
          output_tokens = COALESCE(output_tokens, 0) + $4
        WHERE id = $5
      `, [cost, tokensUsed, inputTokens, outputTokens, generationId]);
    }

    return { success: true, cost, tokensUsed };
  } catch (error) {
    console.error('Cost tracking error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Start tracking a new generation
 *
 * @param {Object} params
 * @param {number} params.userId - User ID
 * @param {string} params.userEmail - User email
 * @param {string} params.siteName - Name of the site being generated
 * @param {string} params.industry - Industry of the site
 * @param {string} params.template - Template being used
 * @param {Array} params.modules - Modules selected for the generation
 */
async function startGeneration({
  userId,
  userEmail,
  siteName,
  industry,
  template,
  modules = []
}) {
  try {
    const result = await pool.query(`
      INSERT INTO generations (
        user_id, user_email, site_name, industry, template_used,
        modules_selected, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'generating', NOW())
      RETURNING id
    `, [userId, userEmail, siteName, industry, template, JSON.stringify(modules)]);

    // Update user's generation count
    await pool.query(`
      UPDATE users SET
        generations_used = COALESCE(generations_used, 0) + 1,
        last_generation_at = NOW()
      WHERE id = $1
    `, [userId]);

    return { success: true, generationId: result.rows[0].id };
  } catch (error) {
    console.error('Start generation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Complete a generation (success or failure)
 *
 * @param {number} generationId - Generation ID
 * @param {Object} params
 * @param {boolean} params.success - Whether generation succeeded
 * @param {number} params.pagesGenerated - Number of pages generated
 * @param {number} params.generationTimeMs - Total generation time in ms
 * @param {string} params.errorMessage - Error message if failed
 * @param {Array} params.errorLog - Array of error entries
 * @param {string} params.downloadUrl - URL to download the generated site
 * @param {string} params.deployedUrl - URL where site is deployed
 */
async function completeGeneration(generationId, {
  success = true,
  pagesGenerated = 0,
  generationTimeMs = 0,
  errorMessage = null,
  errorLog = [],
  downloadUrl = null,
  deployedUrl = null
}) {
  try {
    await pool.query(`
      UPDATE generations SET
        status = $1,
        pages_generated = $2,
        generation_time_ms = $3,
        error_message = $4,
        error_log = $5,
        download_url = $6,
        deployed_url = $7,
        completed_at = NOW()
      WHERE id = $8
    `, [
      success ? 'completed' : 'failed',
      pagesGenerated,
      generationTimeMs,
      errorMessage,
      JSON.stringify(errorLog),
      downloadUrl,
      deployedUrl,
      generationId
    ]);

    return { success: true };
  } catch (error) {
    console.error('Complete generation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get cost summary for a user
 */
async function getUserCostSummary(userId) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_calls,
        SUM(cost) as total_cost,
        SUM(tokens_used) as total_tokens,
        COUNT(*) FILTER (WHERE call_date = CURRENT_DATE) as calls_today,
        SUM(cost) FILTER (WHERE call_date = CURRENT_DATE) as cost_today,
        COUNT(*) FILTER (WHERE call_date >= DATE_TRUNC('month', CURRENT_DATE)) as calls_this_month,
        SUM(cost) FILTER (WHERE call_date >= DATE_TRUNC('month', CURRENT_DATE)) as cost_this_month
      FROM api_usage
      WHERE user_id = $1
    `, [userId]);

    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Get user cost summary error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has exceeded their limits
 */
async function checkUserLimits(userId) {
  try {
    const user = await pool.query(`
      SELECT subscription_tier, generations_used, generations_limit, scans_used
      FROM users WHERE id = $1
    `, [userId]);

    if (user.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const u = user.rows[0];

    // Get tier limits from config or use defaults
    const limits = {
      free: { generations: 3, scans: 5 },
      power: { generations: 20, scans: 100 },
      dealer: { generations: 100, scans: 1000 },
      admin: { generations: 9999, scans: 9999 }
    };

    const tierLimits = limits[u.subscription_tier] || limits.free;

    return {
      success: true,
      data: {
        tier: u.subscription_tier,
        generationsUsed: u.generations_used || 0,
        generationsLimit: u.generations_limit || tierLimits.generations,
        scansUsed: u.scans_used || 0,
        scansLimit: tierLimits.scans,
        canGenerate: (u.generations_used || 0) < (u.generations_limit || tierLimits.generations),
        canScan: (u.scans_used || 0) < tierLimits.scans
      }
    };
  } catch (error) {
    console.error('Check user limits error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create system alert
 */
async function createAlert({
  alertType,
  severity = 'warning',
  title,
  message,
  metricName,
  metricValue,
  thresholdValue,
  metadata = {}
}) {
  try {
    await pool.query(`
      INSERT INTO system_alerts (
        alert_type, severity, title, message,
        metric_name, metric_value, threshold_value, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [alertType, severity, title, message, metricName, metricValue, thresholdValue, JSON.stringify(metadata)]);

    return { success: true };
  } catch (error) {
    console.error('Create alert error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user activity timestamp
 */
async function updateUserActivity(userId) {
  try {
    await pool.query(`
      UPDATE users SET last_active_at = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = $1
    `, [userId]);
    return { success: true };
  } catch (error) {
    console.error('Update user activity error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  calculateCost,
  trackApiCall,
  startGeneration,
  completeGeneration,
  getUserCostSummary,
  checkUserLimits,
  createAlert,
  updateUserActivity,
  CLAUDE_PRICING
};
