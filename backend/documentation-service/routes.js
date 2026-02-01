/**
 * API Routes for the Self-Documenting Wiki
 *
 * Handles receiving and persisting documentation events.
 */

const express = require('express');
const router = express.Router();
// Assuming db.cjs is correctly configured in the main server to handle DB operations.
// We would create a new table 'documentation_logs' in the database.
const db = require('../../module-assembler-ui/database/db.cjs'); 

/**
 * @route   POST /api/docs/log
 * @desc    Receives a structured documentation log and saves it.
 * @access  Private (should be protected by an API key or internal network rule in production)
 *
 * @body    {
 *   "source": "string", // e.g., "Assembler", "AI_Prompt_Engine", "CI"
 *   "event": "string", // e.g., "Module_Injected", "AI_Prompt_Generated", "Build_Success"
 *   "logLevel": "string", // "info", "warn", "error"
 *   "details": { ... } // Flexible JSON object with context-specific details
 * }
 */
router.post('/log', async (req, res) => {
  const { source, event, logLevel, details } = req.body;

  if (!source || !event || !details) {
    return res.status(400).json({ success: false, error: 'Missing required fields: source, event, details' });
  }

  try {
    // In a real implementation, you would create a dedicated db function like db.createDocLog()
    // For now, we assume a table 'documentation_logs' exists.
    const queryText = `
      INSERT INTO documentation_logs(source, event, log_level, details)
      VALUES($1, $2, $3, $4)
      RETURNING id, created_at;
    `;
    const values = [source, event, logLevel || 'info', details];

    // Check if the database connection and query method exist
    if (db && typeof db.query === 'function') {
      const result = await db.query(queryText, values);
      res.status(201).json({ 
        success: true, 
        message: 'Log event saved.',
        logId: result.rows[0].id,
        timestamp: result.rows[0].created_at
      });
    } else {
      // Fallback for testing if DB is not connected
      console.log('--- MOCK DOC LOG (DB not connected) ---');
      console.log({ source, event, logLevel, details });
      res.status(201).json({
        success: true,
        message: 'Log event processed (mock response).'
      });
    }
  } catch (err) {
    console.error('Error saving documentation log:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error while saving log.' });
  }
});

module.exports = router;
