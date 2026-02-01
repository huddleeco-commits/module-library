/**
 * Platform Learning Service
 *
 * Tracks generation attempts, outcomes, errors, and patterns for continuous improvement.
 * All operations are NON-BLOCKING - they won't slow down generation even if logging fails.
 *
 * Features:
 * - Log every generation attempt with full context
 * - Track errors and auto-discovered fixes
 * - Monitor slider effectiveness by industry
 * - Build learning patterns over time
 */

const crypto = require('crypto');

// Database connection (lazy loaded)
let db = null;
let isInitialized = false;
let initError = null;

/**
 * Initialize the learning service
 * Call this at server startup
 */
async function initialize() {
  if (isInitialized) return true;

  try {
    // Try to load the database module
    db = require('../../database/db.cjs');

    // Run the learning schema migration
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../../database/migrations/002_platform_learning.sql');

    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await db.query(migration);
      console.log('   🧠 Learning service: Schema initialized');
    }

    isInitialized = true;
    return true;
  } catch (err) {
    initError = err;
    console.warn('   ⚠️ Learning service unavailable:', err.message);
    return false;
  }
}

/**
 * Check if learning service is available
 */
function isAvailable() {
  return isInitialized && db !== null;
}

// =====================================================
// GENERATION LOGGING
// =====================================================

/**
 * Start logging a generation attempt
 * Call this at the beginning of /api/assemble
 *
 * @param {Object} params - Generation parameters
 * @returns {Promise<number|null>} Log ID for completing later
 */
async function startGenerationLog(params) {
  if (!isAvailable()) return null;

  try {
    const {
      businessName,
      industryKey,
      industryDetected,
      descriptionText,
      moodSliders,
      pagesRequested,
      adminTier,
      adminModules,
      layoutKey,
      effects,
      testMode,
      enhanceMode
    } = params;

    const result = await db.query(
      `INSERT INTO generation_logs (
        business_name, industry_key, industry_detected, description_text, description_length,
        mood_vibe, mood_energy, mood_era, mood_density, mood_price, mood_preset,
        pages_requested, admin_tier, admin_modules, layout_key, effects,
        test_mode, enhance_mode, status, input_params
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'started', $19)
      RETURNING id`,
      [
        businessName || null,
        industryKey || null,
        industryDetected || null,
        descriptionText || null,
        (descriptionText || '').length,
        moodSliders?.vibe || null,
        moodSliders?.energy || null,
        moodSliders?.era || null,
        moodSliders?.density || null,
        moodSliders?.price || null,
        moodSliders?.preset || null,
        pagesRequested || [],
        adminTier || null,
        adminModules || [],
        layoutKey || null,
        effects || [],
        testMode || false,
        enhanceMode || false,
        JSON.stringify(params)
      ]
    );

    return result.rows[0]?.id || null;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to start log:', err.message);
    return null;
  }
}

/**
 * Complete a generation log with results
 *
 * @param {number} logId - The log ID from startGenerationLog
 * @param {Object} result - Generation results
 */
async function completeGenerationLog(logId, result) {
  if (!isAvailable() || !logId) return;

  // Run async - don't block generation
  setImmediate(async () => {
    try {
      const {
        success,
        projectId,
        pagesGenerated,
        errorType,
        errorMessage,
        errorFile,
        errorLine,
        auditPassed,
        auditErrors,
        auditWarnings,
        auditFixes,
        generationTimeMs,
        auditTimeMs,
        inputTokens,
        outputTokens,
        cost
      } = result;

      await db.query(
        `UPDATE generation_logs SET
          project_id = $1,
          status = $2,
          success = $3,
          pages_generated = $4,
          error_type = $5,
          error_message = $6,
          error_file = $7,
          error_line = $8,
          audit_passed = $9,
          audit_errors = $10,
          audit_warnings = $11,
          audit_fixes_applied = $12,
          generation_time_ms = $13,
          audit_time_ms = $14,
          total_time_ms = $15,
          api_input_tokens = $16,
          api_output_tokens = $17,
          api_cost = $18,
          completed_at = NOW(),
          output_summary = $19
        WHERE id = $20`,
        [
          projectId || null,
          success ? 'completed' : (auditPassed === false ? 'audit_failed' : 'failed'),
          success,
          pagesGenerated || 0,
          errorType || null,
          errorMessage || null,
          errorFile || null,
          errorLine || null,
          auditPassed,
          auditErrors || 0,
          auditWarnings || 0,
          auditFixes || 0,
          generationTimeMs || null,
          auditTimeMs || null,
          (generationTimeMs || 0) + (auditTimeMs || 0),
          inputTokens || 0,
          outputTokens || 0,
          cost || 0,
          JSON.stringify(result),
          logId
        ]
      );

      // Also update slider effectiveness if sliders were used
      const logResult = await db.query('SELECT * FROM generation_logs WHERE id = $1', [logId]);
      const log = logResult.rows[0];

      if (log && log.mood_vibe !== null) {
        await updateSliderEffectiveness(log, success, auditPassed);
      }

      // Record error pattern if failed
      if (!success && errorMessage) {
        await recordErrorPattern({
          errorMessage,
          errorType,
          industry: log?.industry_key,
          pageType: null,
          filePattern: errorFile
        });
      }

    } catch (err) {
      console.warn('   ⚠️ Learning: Failed to complete log:', err.message);
    }
  });
}

/**
 * Mark a generation as rebuilt by user (signals poor quality)
 */
async function markAsRebuilt(logId) {
  if (!isAvailable() || !logId) return;

  try {
    await db.query(
      'UPDATE generation_logs SET user_rebuilt = TRUE WHERE id = $1',
      [logId]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to mark rebuilt:', err.message);
  }
}

/**
 * Add user feedback/rating to a generation
 */
async function addUserFeedback(logId, rating, feedback) {
  if (!isAvailable() || !logId) return;

  try {
    await db.query(
      'UPDATE generation_logs SET user_rating = $1, user_feedback = $2 WHERE id = $3',
      [rating, feedback, logId]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to add feedback:', err.message);
  }
}

// =====================================================
// ERROR PATTERN TRACKING
// =====================================================

/**
 * Record an error pattern for learning
 */
async function recordErrorPattern(params) {
  if (!isAvailable()) return;

  try {
    const { errorMessage, errorType, industry, pageType, filePattern } = params;

    // Normalize error message and create hash
    const normalized = normalizeErrorMessage(errorMessage);
    const hash = crypto.createHash('md5').update(normalized).digest('hex');

    await db.query(
      `INSERT INTO error_patterns (error_hash, error_type, error_message, industry, page_type, error_file_pattern)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (error_hash) DO UPDATE SET
         occurrence_count = error_patterns.occurrence_count + 1,
         last_seen_at = NOW()`,
      [hash, errorType, errorMessage, industry, pageType, filePattern]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to record error:', err.message);
  }
}

/**
 * Normalize an error message for consistent hashing
 */
function normalizeErrorMessage(msg) {
  if (!msg) return '';
  return msg
    .replace(/:\d+:\d+/g, ':X:X') // Remove line:col numbers
    .replace(/line \d+/gi, 'line X') // Remove "line N"
    .replace(/\/[^\s]+\//g, '/PATH/') // Remove file paths
    .replace(/[a-f0-9]{8,}/gi, 'HASH') // Remove hashes
    .trim()
    .substring(0, 500);
}

/**
 * Mark an error pattern as fixed
 */
async function markErrorFixed(errorHash, fixType, fixDescription) {
  if (!isAvailable()) return;

  try {
    await db.query(
      `UPDATE error_patterns SET
         fix_available = TRUE,
         fix_type = $1,
         fix_description = $2,
         fixed_count = fixed_count + 1
       WHERE error_hash = $3`,
      [fixType, fixDescription, errorHash]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to mark error fixed:', err.message);
  }
}

/**
 * Get known fixes for an error type
 */
async function getKnownFixes(errorType, industry = null) {
  if (!isAvailable()) return [];

  try {
    const result = await db.query(
      `SELECT * FROM error_patterns
       WHERE error_type = $1
         AND fix_available = TRUE
         AND (industry IS NULL OR industry = $2)
       ORDER BY fixed_count DESC
       LIMIT 5`,
      [errorType, industry]
    );
    return result.rows;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to get fixes:', err.message);
    return [];
  }
}

// =====================================================
// SLIDER EFFECTIVENESS TRACKING
// =====================================================

/**
 * Update slider effectiveness stats
 */
async function updateSliderEffectiveness(log, success, auditPassed) {
  if (!isAvailable()) return;

  try {
    // Bucket values to nearest 10
    const bucket = (v) => Math.round((v || 50) / 10) * 10;

    await db.query(
      `INSERT INTO slider_effectiveness (
        industry, vibe_bucket, energy_bucket, era_bucket, density_bucket, price_bucket,
        usage_count, success_count, audit_pass_count
      ) VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8)
      ON CONFLICT (industry, vibe_bucket, energy_bucket, era_bucket, density_bucket, price_bucket)
      DO UPDATE SET
        usage_count = slider_effectiveness.usage_count + 1,
        success_count = slider_effectiveness.success_count + $7,
        audit_pass_count = slider_effectiveness.audit_pass_count + $8,
        last_used_at = NOW()`,
      [
        log.industry_key || 'unknown',
        bucket(log.mood_vibe),
        bucket(log.mood_energy),
        bucket(log.mood_era),
        bucket(log.mood_density),
        bucket(log.mood_price),
        success ? 1 : 0,
        auditPassed ? 1 : 0
      ]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to update slider stats:', err.message);
  }
}

/**
 * Get recommended sliders for an industry based on historical success
 */
async function getRecommendedSliders(industry) {
  if (!isAvailable()) return null;

  try {
    const result = await db.query(
      `SELECT
        vibe_bucket as vibe,
        energy_bucket as energy,
        era_bucket as era,
        density_bucket as density,
        price_bucket as price,
        usage_count,
        success_count,
        ROUND(100.0 * success_count / NULLIF(usage_count, 0), 1) as success_rate
       FROM slider_effectiveness
       WHERE industry = $1
         AND usage_count >= 5
       ORDER BY success_rate DESC, usage_count DESC
       LIMIT 1`,
      [industry]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        vibe: row.vibe,
        energy: row.energy,
        era: row.era,
        density: row.density,
        price: row.price,
        confidence: parseFloat(row.success_rate),
        sampleSize: row.usage_count
      };
    }
    return null;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to get recommended sliders:', err.message);
    return null;
  }
}

// =====================================================
// LEARNING PATTERNS
// =====================================================

/**
 * Record a learning pattern
 */
async function recordPattern(params) {
  if (!isAvailable()) return;

  try {
    const { patternType, patternKey, industry, conditions, insight, actionRecommended, autoApply } = params;

    await db.query(
      `INSERT INTO learning_patterns (
        pattern_type, pattern_key, industry, conditions, insight, action_recommended, auto_apply
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (pattern_type, pattern_key) DO UPDATE SET
        occurrence_count = learning_patterns.occurrence_count + 1,
        last_seen_at = NOW()`,
      [patternType, patternKey, industry, JSON.stringify(conditions), insight, actionRecommended, autoApply || false]
    );
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to record pattern:', err.message);
  }
}

/**
 * Get auto-apply patterns for an industry
 */
async function getAutoApplyPatterns(industry) {
  if (!isAvailable()) return [];

  try {
    const result = await db.query(
      `SELECT * FROM learning_patterns
       WHERE auto_apply = TRUE
         AND (industry IS NULL OR industry = $1)
         AND confidence_score >= 70
       ORDER BY confidence_score DESC`,
      [industry]
    );
    return result.rows;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to get patterns:', err.message);
    return [];
  }
}

// =====================================================
// ANALYTICS QUERIES
// =====================================================

/**
 * Get success rate by industry for last N days
 */
async function getIndustrySuccessRates(days = 30) {
  if (!isAvailable()) return [];

  try {
    const result = await db.query(
      `SELECT
        industry_key,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE success = TRUE) as successful,
        ROUND(100.0 * COUNT(*) FILTER (WHERE success = TRUE) / NULLIF(COUNT(*), 0), 1) as success_rate,
        ROUND(AVG(generation_time_ms)::numeric, 0) as avg_time_ms,
        ROUND(AVG(api_cost)::numeric, 4) as avg_cost
       FROM generation_logs
       WHERE created_at > NOW() - INTERVAL '1 day' * $1
       GROUP BY industry_key
       ORDER BY total DESC`,
      [days]
    );
    return result.rows;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to get success rates:', err.message);
    return [];
  }
}

/**
 * Get most common errors for last N days
 */
async function getCommonErrors(days = 30, limit = 20) {
  if (!isAvailable()) return [];

  try {
    const result = await db.query(
      `SELECT
        error_type,
        error_message,
        industry,
        occurrence_count,
        fix_available,
        fix_description
       FROM error_patterns
       WHERE last_seen_at > NOW() - INTERVAL '1 day' * $1
       ORDER BY occurrence_count DESC
       LIMIT $2`,
      [days, limit]
    );
    return result.rows;
  } catch (err) {
    console.warn('   ⚠️ Learning: Failed to get common errors:', err.message);
    return [];
  }
}

module.exports = {
  // Initialization
  initialize,
  isAvailable,

  // Generation logging
  startGenerationLog,
  completeGenerationLog,
  markAsRebuilt,
  addUserFeedback,

  // Error patterns
  recordErrorPattern,
  markErrorFixed,
  getKnownFixes,

  // Slider effectiveness
  updateSliderEffectiveness,
  getRecommendedSliders,

  // Learning patterns
  recordPattern,
  getAutoApplyPatterns,

  // Analytics
  getIndustrySuccessRates,
  getCommonErrors
};
