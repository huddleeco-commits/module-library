/**
 * Deployments Routes
 * User-facing deployment management API
 */

const express = require('express');
const router = express.Router();
const db = require('../../database/db.cjs');

/**
 * GET /api/deployments/my
 * Get all deployments for the current session/user
 * For now, returns all deployed projects (can be scoped by user later)
 */
router.get('/my', async (req, res) => {
  try {
    // Get deployed projects with companion app info
    const result = await db.query(`
      SELECT
        id, name as site_name, industry, status,
        user_email, domain,
        frontend_url, admin_url, backend_url,
        github_frontend, github_backend, github_admin,
        railway_project_url, railway_project_id,
        created_at, deployed_at,
        app_type, parent_project_id, domain_type
      FROM generated_projects
      WHERE status IN ('deployed', 'building', 'build_passed')
      ORDER BY
        CASE WHEN app_type = 'companion-app' THEN 1 ELSE 0 END,
        created_at DESC
      LIMIT 50
    `);

    // Group by parent/child relationship for frontend
    const deployments = result.rows.map(row => ({
      ...row,
      app_type: row.app_type || 'website',
      domain_type: row.domain_type || 'be1st.io'
    }));

    res.json({
      success: true,
      deployments,
      total: deployments.length
    });

  } catch (error) {
    console.error('Deployments fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deployments/:id
 * Get details for a specific deployment
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT
        id, name as site_name, industry, status,
        user_email, domain,
        frontend_url, admin_url, backend_url,
        github_frontend, github_backend, github_admin,
        railway_project_url, railway_project_id,
        created_at, deployed_at, metadata,
        app_type, parent_project_id, domain_type
      FROM generated_projects
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    const deployment = result.rows[0];

    // Get companion apps if this is a website
    let companions = [];
    if (deployment.app_type !== 'companion-app') {
      const companionResult = await db.query(`
        SELECT
          id, name as site_name, frontend_url, status,
          railway_project_id, created_at, deployed_at
        FROM generated_projects
        WHERE parent_project_id = $1 AND app_type = 'companion-app'
        ORDER BY created_at DESC
      `, [id]);
      companions = companionResult.rows;
    }

    res.json({
      success: true,
      deployment: {
        ...deployment,
        app_type: deployment.app_type || 'website',
        domain_type: deployment.domain_type || 'be1st.io',
        companions
      }
    });

  } catch (error) {
    console.error('Deployment fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deployments/:id/companions
 * Get companion apps for a deployment
 */
router.get('/:id/companions', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT
        id, name as site_name, frontend_url, status,
        railway_project_id, railway_project_url,
        created_at, deployed_at
      FROM generated_projects
      WHERE parent_project_id = $1 AND app_type = 'companion-app'
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      companions: result.rows
    });

  } catch (error) {
    console.error('Companions fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/deployments/stats
 * Get deployment statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'deployed') as total_deployed,
        COUNT(*) FILTER (WHERE app_type = 'website') as websites,
        COUNT(*) FILTER (WHERE app_type = 'companion-app') as companion_apps,
        COUNT(*) FILTER (WHERE app_type = 'advanced-app') as advanced_apps,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as deployed_today
      FROM generated_projects
    `);

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('Stats fetch failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
