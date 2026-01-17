/**
 * Automated Alert Service for Blink Platform
 *
 * Monitors system metrics and generates alerts based on configurable rules.
 * Runs periodically to check thresholds and create alerts.
 */

const { Pool } = require('pg');
const costTracker = require('./costTracker');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Default alert rules if none exist in database
const DEFAULT_RULES = [
  {
    name: 'high_error_rate',
    metric_name: 'error_rate',
    threshold_value: 5,
    comparison: '>',
    severity: 'warning',
    check_interval_minutes: 15,
    alert_title: 'High Error Rate Detected',
    alert_message: 'Error rate has exceeded 5% in the last hour'
  },
  {
    name: 'critical_error_rate',
    metric_name: 'error_rate',
    threshold_value: 15,
    comparison: '>',
    severity: 'critical',
    check_interval_minutes: 5,
    alert_title: 'Critical Error Rate',
    alert_message: 'Error rate has exceeded 15% - immediate attention required'
  },
  {
    name: 'high_api_cost',
    metric_name: 'daily_cost',
    threshold_value: 50,
    comparison: '>',
    severity: 'warning',
    check_interval_minutes: 60,
    alert_title: 'High Daily API Cost',
    alert_message: 'Daily API costs have exceeded $50'
  },
  {
    name: 'critical_api_cost',
    metric_name: 'daily_cost',
    threshold_value: 100,
    comparison: '>',
    severity: 'critical',
    check_interval_minutes: 30,
    alert_title: 'Critical Daily API Cost',
    alert_message: 'Daily API costs have exceeded $100 - review usage immediately'
  },
  {
    name: 'low_success_rate',
    metric_name: 'success_rate',
    threshold_value: 90,
    comparison: '<',
    severity: 'warning',
    check_interval_minutes: 30,
    alert_title: 'Low Generation Success Rate',
    alert_message: 'Generation success rate has dropped below 90%'
  },
  {
    name: 'high_response_time',
    metric_name: 'avg_response_time',
    threshold_value: 30000,
    comparison: '>',
    severity: 'warning',
    check_interval_minutes: 15,
    alert_title: 'High Response Times',
    alert_message: 'Average response time has exceeded 30 seconds'
  },
  {
    name: 'failed_generations_spike',
    metric_name: 'failed_generations_hour',
    threshold_value: 10,
    comparison: '>',
    severity: 'warning',
    check_interval_minutes: 15,
    alert_title: 'Spike in Failed Generations',
    alert_message: 'More than 10 generations have failed in the last hour'
  }
];

/**
 * Initialize default alert rules if none exist
 */
async function initializeDefaultRules() {
  try {
    const existing = await pool.query('SELECT COUNT(*) FROM alert_rules');
    if (parseInt(existing.rows[0].count) === 0) {
      for (const rule of DEFAULT_RULES) {
        await pool.query(`
          INSERT INTO alert_rules (
            name, metric_name, threshold_value, comparison, severity,
            check_interval_minutes, alert_title, alert_message, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
          ON CONFLICT (name) DO NOTHING
        `, [
          rule.name, rule.metric_name, rule.threshold_value, rule.comparison,
          rule.severity, rule.check_interval_minutes, rule.alert_title, rule.alert_message
        ]);
      }
      console.log('[AlertService] Initialized default alert rules');
    }
  } catch (error) {
    console.error('[AlertService] Error initializing default rules:', error);
  }
}

/**
 * Get current metric values for alert checking
 */
async function getCurrentMetrics() {
  const metrics = {};

  try {
    // Error rate (last hour)
    const errorRateResult = await pool.query(`
      SELECT
        CASE WHEN COUNT(*) > 0
          THEN (COUNT(*) FILTER (WHERE success = false)::FLOAT / COUNT(*) * 100)
          ELSE 0
        END as error_rate
      FROM api_usage
      WHERE timestamp > NOW() - INTERVAL '1 hour'
    `);
    metrics.error_rate = parseFloat(errorRateResult.rows[0]?.error_rate || 0);

    // Daily cost
    const dailyCostResult = await pool.query(`
      SELECT COALESCE(SUM(cost), 0) as daily_cost
      FROM api_usage
      WHERE call_date = CURRENT_DATE
    `);
    metrics.daily_cost = parseFloat(dailyCostResult.rows[0]?.daily_cost || 0);

    // Success rate (last 24 hours)
    const successRateResult = await pool.query(`
      SELECT
        CASE WHEN COUNT(*) > 0
          THEN (COUNT(*) FILTER (WHERE status = 'completed')::FLOAT / COUNT(*) * 100)
          ELSE 100
        END as success_rate
      FROM generations
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    metrics.success_rate = parseFloat(successRateResult.rows[0]?.success_rate || 100);

    // Average response time (last hour)
    const avgTimeResult = await pool.query(`
      SELECT COALESCE(AVG(duration_ms), 0) as avg_response_time
      FROM api_usage
      WHERE timestamp > NOW() - INTERVAL '1 hour'
    `);
    metrics.avg_response_time = parseFloat(avgTimeResult.rows[0]?.avg_response_time || 0);

    // Failed generations in last hour
    const failedGensResult = await pool.query(`
      SELECT COUNT(*) as failed_count
      FROM generations
      WHERE status = 'failed' AND created_at > NOW() - INTERVAL '1 hour'
    `);
    metrics.failed_generations_hour = parseInt(failedGensResult.rows[0]?.failed_count || 0);

    // Total tokens today
    const tokensResult = await pool.query(`
      SELECT COALESCE(SUM(tokens_used), 0) as daily_tokens
      FROM api_usage
      WHERE call_date = CURRENT_DATE
    `);
    metrics.daily_tokens = parseInt(tokensResult.rows[0]?.daily_tokens || 0);

    // Active users today
    const activeUsersResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM api_usage
      WHERE call_date = CURRENT_DATE AND user_id IS NOT NULL
    `);
    metrics.active_users = parseInt(activeUsersResult.rows[0]?.active_users || 0);

  } catch (error) {
    console.error('[AlertService] Error fetching metrics:', error);
  }

  return metrics;
}

/**
 * Check if a metric value triggers an alert based on comparison
 */
function evaluateCondition(value, threshold, comparison) {
  switch (comparison) {
    case '>': return value > threshold;
    case '>=': return value >= threshold;
    case '<': return value < threshold;
    case '<=': return value <= threshold;
    case '=': return value === threshold;
    case '!=': return value !== threshold;
    default: return false;
  }
}

/**
 * Check if an alert for this rule was recently created (to avoid spam)
 */
async function wasRecentlyAlerted(ruleName, minutes = 60) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) FROM system_alerts
      WHERE alert_type = $1
        AND created_at > NOW() - INTERVAL '${minutes} minutes'
        AND resolved = false
    `, [ruleName]);
    return parseInt(result.rows[0].count) > 0;
  } catch {
    return false;
  }
}

/**
 * Create an alert in the system
 */
async function createAlert(rule, metricValue) {
  try {
    await pool.query(`
      INSERT INTO system_alerts (
        alert_type, severity, title, message,
        metric_name, metric_value, threshold_value, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      rule.name,
      rule.severity,
      rule.alert_title,
      `${rule.alert_message}. Current value: ${metricValue.toFixed(2)}, Threshold: ${rule.threshold_value}`,
      rule.metric_name,
      metricValue,
      rule.threshold_value,
      JSON.stringify({ triggered_at: new Date().toISOString() })
    ]);

    console.log(`[AlertService] Created ${rule.severity} alert: ${rule.alert_title}`);
    return true;
  } catch (error) {
    console.error('[AlertService] Error creating alert:', error);
    return false;
  }
}

/**
 * Run all alert rule checks
 */
async function checkAlertRules() {
  try {
    // Get active rules
    const rulesResult = await pool.query(`
      SELECT * FROM alert_rules WHERE is_active = true
    `);

    if (rulesResult.rows.length === 0) {
      return { checked: 0, triggered: 0 };
    }

    // Get current metrics
    const metrics = await getCurrentMetrics();

    let triggered = 0;

    for (const rule of rulesResult.rows) {
      const metricValue = metrics[rule.metric_name];

      if (metricValue === undefined) {
        console.warn(`[AlertService] Unknown metric: ${rule.metric_name}`);
        continue;
      }

      // Check if condition is met
      if (evaluateCondition(metricValue, parseFloat(rule.threshold_value), rule.comparison)) {
        // Check if we already alerted for this recently
        const recentlyAlerted = await wasRecentlyAlerted(rule.name, rule.check_interval_minutes);

        if (!recentlyAlerted) {
          const created = await createAlert(rule, metricValue);
          if (created) triggered++;
        }
      }

      // Update last checked timestamp
      await pool.query(`
        UPDATE alert_rules SET last_checked = NOW() WHERE id = $1
      `, [rule.id]);
    }

    return { checked: rulesResult.rows.length, triggered, metrics };
  } catch (error) {
    console.error('[AlertService] Error checking alert rules:', error);
    return { checked: 0, triggered: 0, error: error.message };
  }
}

/**
 * Auto-resolve stale alerts that are no longer relevant
 */
async function autoResolveStaleAlerts() {
  try {
    // Resolve alerts older than 24 hours that haven't been manually resolved
    const result = await pool.query(`
      UPDATE system_alerts
      SET resolved = true, resolved_at = NOW(), resolved_by = 'system_auto'
      WHERE resolved = false
        AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `);

    if (result.rowCount > 0) {
      console.log(`[AlertService] Auto-resolved ${result.rowCount} stale alerts`);
    }

    return result.rowCount;
  } catch (error) {
    console.error('[AlertService] Error auto-resolving alerts:', error);
    return 0;
  }
}

/**
 * Get alert summary for dashboard
 */
async function getAlertSummary() {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE resolved = false) as active_count,
        COUNT(*) FILTER (WHERE resolved = false AND severity = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE resolved = false AND severity = 'warning') as warning_count,
        COUNT(*) FILTER (WHERE resolved = false AND severity = 'info') as info_count,
        COUNT(*) FILTER (WHERE resolved = true AND resolved_at > NOW() - INTERVAL '24 hours') as resolved_today
      FROM system_alerts
    `);

    return result.rows[0];
  } catch (error) {
    console.error('[AlertService] Error getting alert summary:', error);
    return { active_count: 0, critical_count: 0, warning_count: 0, info_count: 0, resolved_today: 0 };
  }
}

// Interval reference for cleanup
let checkInterval = null;

/**
 * Start the alert monitoring service
 */
function startAlertService(intervalMinutes = 5) {
  console.log(`[AlertService] Starting alert service (checking every ${intervalMinutes} minutes)`);

  // Initialize default rules on first run
  initializeDefaultRules();

  // Run initial check
  checkAlertRules().then(result => {
    console.log(`[AlertService] Initial check: ${result.checked} rules, ${result.triggered} alerts triggered`);
  });

  // Set up periodic checks
  checkInterval = setInterval(async () => {
    const result = await checkAlertRules();
    if (result.triggered > 0) {
      console.log(`[AlertService] Check complete: ${result.triggered} new alerts`);
    }

    // Also auto-resolve stale alerts periodically
    await autoResolveStaleAlerts();
  }, intervalMinutes * 60 * 1000);

  return checkInterval;
}

/**
 * Stop the alert monitoring service
 */
function stopAlertService() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
    console.log('[AlertService] Alert service stopped');
  }
}

module.exports = {
  initializeDefaultRules,
  getCurrentMetrics,
  checkAlertRules,
  autoResolveStaleAlerts,
  getAlertSummary,
  createAlert,
  startAlertService,
  stopAlertService,
  DEFAULT_RULES
};
