/**
 * Companion App Routes
 *
 * Generates and deploys companion apps (mobile PWAs) that connect to existing websites
 * Companion apps deploy to be1st.app and call be1st.io/api
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { generateCompanionApp } = require('../generators/companion-generator.cjs');
const { deployCompanionApp, checkCredentials, DOMAINS } = require('../../services/deploy-service.cjs');
const db = require('../../database/db.cjs');

// Output directory for generated companion apps
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'output', 'companion-apps');

/**
 * POST /api/companion/generate
 * Generate a companion app
 */
router.post('/generate', async (req, res) => {
  try {
    const { appType, appTypes, industry, quickActions, parentSite, parentProjectId } = req.body;

    // Support both single appType and array of appTypes
    const selectedAppTypes = appTypes || [appType || 'customer'];

    // Validate required fields
    if (!parentSite || !parentSite.subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Parent site information is required'
      });
    }

    if (!quickActions || quickActions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one quick action is required'
      });
    }

    console.log(`\n📱 Generating companion app(s) for ${parentSite.name}...`);
    console.log(`   App Types: ${selectedAppTypes.join(', ')}`);
    console.log(`   Industry: ${industry}`);
    console.log(`   Quick Actions: ${quickActions.join(', ')}`);
    console.log(`   Parent Site: ${parentSite.subdomain}.be1st.io`);

    // Find parent project ID if not provided
    let resolvedParentId = parentProjectId;
    if (!resolvedParentId) {
      resolvedParentId = await db.findParentProjectBySubdomain(parentSite.subdomain);
    }

    // Generate app(s) for each selected type
    const generatedApps = [];

    for (const currentAppType of selectedAppTypes) {
      const isStaff = currentAppType === 'staff';
      const projectName = isStaff
        ? `${parentSite.subdomain}-admin-companion`
        : `${parentSite.subdomain}-companion`;
      const outputPath = path.join(OUTPUT_DIR, projectName);

      // Track companion app in database
      let companionProjectId;
      try {
        companionProjectId = await db.trackCompanionAppStart({
          appName: projectName,
          name: parentSite.name ? `${parentSite.name} ${isStaff ? 'Admin' : ''} App` : projectName,
          industry,
          parentProjectId: resolvedParentId,
          parentSiteName: parentSite.name,
          parentSiteSubdomain: parentSite.subdomain,
          quickActions,
          companionType: currentAppType
        });
        console.log(`   DB: Tracking ${currentAppType} companion app with ID ${companionProjectId}`);
      } catch (dbErr) {
        console.warn(`   DB: Failed to track ${currentAppType} companion app:`, dbErr.message);
      }

      // Generate the companion app
      await generateCompanionApp(
        { appType: currentAppType, industry, quickActions, parentSite },
        outputPath
      );

      generatedApps.push({
        id: companionProjectId,
        name: projectName,
        path: outputPath,
        type: currentAppType,
        parentSite: `${parentSite.subdomain}.be1st.io`,
        parentProjectId: resolvedParentId,
        companionUrl: isStaff ? `${parentSite.subdomain}-admin.be1st.app` : `${parentSite.subdomain}.be1st.app`,
        downloadUrl: `/api/companion/download/${projectName}`
      });
    }

    // Return success with project info (first project for backward compatibility)
    res.json({
      success: true,
      project: generatedApps[0],
      projects: generatedApps,
      appTypes: selectedAppTypes
    });

  } catch (error) {
    console.error('Companion app generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Generation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/companion/deploy
 * Deploy a companion app to be1st.app
 */
router.post('/deploy', async (req, res) => {
  try {
    const { projectPath, projectName, parentSiteSubdomain, projectId } = req.body;

    // Validate required fields
    if (!projectPath || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project path and name are required'
      });
    }

    if (!parentSiteSubdomain) {
      return res.status(400).json({
        success: false,
        error: 'Parent site subdomain is required'
      });
    }

    // Check credentials
    if (!checkCredentials('companion-app')) {
      return res.status(500).json({
        success: false,
        error: 'Deployment credentials not configured. Check .env for RAILWAY_TOKEN, GITHUB_TOKEN, CLOUDFLARE_TOKEN, CLOUDFLARE_ZONE_ID, and CLOUDFLARE_ZONE_ID_APP'
      });
    }

    console.log(`\n📱 Deploying companion app: ${projectName}`);
    console.log(`   Path: ${projectPath}`);
    console.log(`   Parent Site: ${parentSiteSubdomain}.be1st.io`);
    if (projectId) console.log(`   DB Project ID: ${projectId}`);

    // Set up SSE for progress updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Deploy the companion app
    const result = await deployCompanionApp(projectPath, projectName, {
      parentSiteSubdomain,
      onProgress: sendProgress
    });

    // Update database with deployment URLs if we have a project ID
    if (projectId && result.success) {
      try {
        await db.updateCompanionAppDeployment(projectId, {
          companion: result.urls.companion,
          frontend: result.urls.companion,
          parentSite: result.urls.parentSite,
          parentApi: result.urls.parentApi,
          github: result.urls.github,
          railway: result.urls.railway,
          railwayProjectId: result.railwayProjectId,
          domain: result.urls.companion?.replace('https://', '')
        });
        console.log(`   DB: Updated companion app ${projectId} with deployment URLs`);
      } catch (dbErr) {
        console.warn('   DB: Failed to update deployment URLs:', dbErr.message);
      }
    } else if (projectId && !result.success) {
      // Mark as failed in DB
      try {
        await db.trackDeploymentFailed(projectId, {
          message: result.errors?.join(', ') || 'Deployment failed',
          stage: 'companion-deploy'
        });
      } catch (dbErr) {
        console.warn('   DB: Failed to mark deployment as failed:', dbErr.message);
      }
    }

    // Send final result
    sendProgress({
      step: 'complete',
      status: result.success ? 'Companion app deployed!' : 'Deployment failed',
      icon: result.success ? '✅' : '❌',
      progress: 100,
      result: {
        ...result,
        projectId
      }
    });

    res.end();

  } catch (error) {
    console.error('Companion app deployment failed:', error);

    // If we've started SSE, send error that way
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({
        step: 'error',
        status: `Deployment failed: ${error.message}`,
        icon: '❌',
        progress: 0
      })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        success: false,
        error: 'Deployment failed',
        details: error.message
      });
    }
  }
});

/**
 * GET /api/companion/download/:projectName
 * Download a generated companion app as zip
 */
router.get('/download/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const projectPath = path.join(OUTPUT_DIR, projectName);

    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Create zip file
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);

    archive.pipe(res);
    archive.directory(projectPath, false);
    await archive.finalize();

  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed',
      details: error.message
    });
  }
});

/**
 * GET /api/companion/domains
 * Get domain configuration info
 */
router.get('/domains', (req, res) => {
  res.json({
    success: true,
    domains: DOMAINS,
    info: {
      website: 'Websites deploy to be1st.io',
      'companion-app': 'Companion apps deploy to be1st.app (frontend only, calls .io backend)',
      'advanced-app': 'Standalone apps deploy to be1st.app (full stack)'
    }
  });
});

module.exports = router;
