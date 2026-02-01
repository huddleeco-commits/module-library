/**
 * One-Click Deploy Routes
 * Simplified deployment API endpoints
 *
 * Endpoints:
 * - POST /api/one-click-deploy - Deploy a project with SSE streaming
 * - GET /api/one-click-deploy/status - Get deployment service status
 * - GET /api/one-click-deploy/recent - Get recent deployments
 * - POST /api/one-click-deploy/redeploy/:projectId - Re-deploy existing project
 * - GET /api/one-click-deploy/railway/:projectId - Get Railway service status
 */

const express = require('express');
const fs = require('fs');
const {
  createOneClickDeployService,
  getOneClickDeployService,
  DEPLOY_PHASES
} = require('../services/one-click-deploy.cjs');

/**
 * Create one-click deploy routes
 * @param {Object} deps - Dependencies
 * @param {Object} deps.deployService - Deploy service module
 * @param {Object} deps.db - Database module
 */
function createOneClickDeployRoutes(deps = {}) {
  const router = express.Router();
  const { deployService, db } = deps;

  // Initialize the one-click deploy service
  const oneClickService = createOneClickDeployService({
    deployService,
    db,
    railwayToken: process.env.RAILWAY_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    cloudflareToken: process.env.CLOUDFLARE_TOKEN,
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID
  });

  /**
   * GET /api/one-click-deploy/status
   * Check if deployment service is ready
   */
  router.get('/status', (req, res) => {
    const status = oneClickService.getStatus();
    res.json({
      success: true,
      ...status
    });
  });

  /**
   * POST /api/one-click-deploy
   * Execute one-click deployment with SSE streaming
   */
  router.post('/', async (req, res) => {
    const { projectPath, projectName, adminEmail, appType } = req.body;

    // Validate inputs
    if (!projectPath || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'projectPath and projectName are required'
      });
    }

    // Check service readiness
    if (!oneClickService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Deployment service not configured. Check RAILWAY_TOKEN and GITHUB_TOKEN environment variables.'
      });
    }

    // Check project exists
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({
        success: false,
        error: `Project not found: ${projectPath}`
      });
    }

    console.log(`\n🚀 One-Click Deploy: ${projectName}`);
    console.log(`   Path: ${projectPath}`);

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      message: 'Deployment stream connected'
    })}\n\n`);

    try {
      const result = await oneClickService.deploy({
        projectPath,
        projectName,
        adminEmail: adminEmail || 'admin@be1st.io',
        appType: appType || 'website'
      }, (progress) => {
        // Stream progress updates
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          ...progress
        })}\n\n`);
      });

      // Send final result
      res.write(`data: ${JSON.stringify({
        type: result.success ? 'complete' : 'error',
        result
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error('One-Click Deploy error:', error);

      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message,
        phase: DEPLOY_PHASES.FAILED
      })}\n\n`);

      res.end();
    }
  });

  /**
   * GET /api/one-click-deploy/recent
   * Get recent deployments
   */
  router.get('/recent', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const result = await oneClickService.getRecentDeployments(limit);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  });

  /**
   * POST /api/one-click-deploy/redeploy/:projectId
   * Re-deploy an existing Railway project
   */
  router.post('/redeploy/:projectId', async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    if (!process.env.RAILWAY_TOKEN) {
      return res.status(503).json({
        success: false,
        error: 'Railway token not configured'
      });
    }

    console.log(`\n🔄 Re-deploying project: ${projectId}`);

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const result = await oneClickService.redeploy(projectId, (progress) => {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          ...progress
        })}\n\n`);
      });

      res.write(`data: ${JSON.stringify({
        type: 'complete',
        result
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error('Re-deploy error:', error);

      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: error.message
      })}\n\n`);

      res.end();
    }
  });

  /**
   * GET /api/one-click-deploy/railway/:projectId
   * Get Railway deployment status
   */
  router.get('/railway/:projectId', async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    try {
      const status = await oneClickService.getRailwayStatus(projectId);
      res.json(status);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/one-click-deploy/quick
   * Quick deployment from project ID (database lookup)
   */
  router.post('/quick/:id', async (req, res) => {
    const { id } = req.params;

    if (!db) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured'
      });
    }

    try {
      // Look up project
      const projectResult = await db.query(
        `SELECT id, name, project_path, status, railway_project_id
         FROM generated_projects WHERE id = $1`,
        [id]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const project = projectResult.rows[0];

      // If already has Railway project, trigger re-deploy
      if (project.railway_project_id) {
        return res.redirect(307, `/api/one-click-deploy/redeploy/${project.railway_project_id}`);
      }

      // Otherwise, deploy fresh
      if (!project.project_path || !fs.existsSync(project.project_path)) {
        return res.status(400).json({
          success: false,
          error: 'Project files not found. Generate the project first.'
        });
      }

      // Redirect to main deploy endpoint
      req.body = {
        projectPath: project.project_path,
        projectName: project.name,
        adminEmail: req.body.adminEmail || 'admin@be1st.io'
      };

      // Set up SSE streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const result = await oneClickService.deploy({
        projectPath: project.project_path,
        projectName: project.name,
        adminEmail: req.body.adminEmail || 'admin@be1st.io'
      }, (progress) => {
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          ...progress
        })}\n\n`);
      });

      res.write(`data: ${JSON.stringify({
        type: result.success ? 'complete' : 'error',
        result
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error('Quick deploy error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createOneClickDeployRoutes };
