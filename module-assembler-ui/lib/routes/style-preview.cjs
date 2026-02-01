/**
 * Style Preview Routes
 *
 * Generate multiple archetype variants for comparison and selective deployment.
 *
 * Features:
 * - Generate 1, 2, or all 3 archetypes at once
 * - Unique project names per archetype
 * - Preview gallery page to compare styles
 * - Deploy any/all variants
 * - One-click cleanup (local + git + Railway + Cloudflare)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import archetype system
let archetypeSystem = null;
try {
  archetypeSystem = require('../config/layout-archetypes.cjs');
} catch (e) {
  console.log('[Style Preview] Archetype system not available:', e.message);
}

// Import test fixtures
const { loadFixture, applyCustomizations } = require('../../test-fixtures/index.cjs');

// Import generators
const { writeTestDashboard } = require('../generators/test-dashboard-generator.cjs');

// Import deploy service
let deployService = null;
try {
  deployService = require('../../services/deploy-service.cjs');
} catch (e) {
  console.log('[Style Preview] Deploy service not available');
}

// Store active preview sessions
const previewSessions = new Map();

/**
 * GET /api/style-preview/archetypes
 * List available archetypes
 */
router.get('/archetypes', (req, res) => {
  if (!archetypeSystem) {
    return res.json({ success: false, error: 'Archetype system not available' });
  }

  const archetypes = archetypeSystem.getAllArchetypes().map(arch => ({
    id: arch.id,
    name: arch.name,
    description: arch.description,
    bestFor: arch.bestFor,
    realExamples: arch.realExamples,
    vibe: arch.style?.vibe
  }));

  res.json({ success: true, archetypes });
});

/**
 * GET /api/style-preview/sessions
 * List all preview sessions
 */
router.get('/sessions', (req, res) => {
  const sessions = Array.from(previewSessions.entries()).map(([id, session]) => ({
    id,
    businessName: session.businessName,
    createdAt: session.createdAt,
    variants: session.variants.map(v => ({
      archetype: v.archetype,
      projectName: v.projectName,
      path: v.path,
      deployed: v.deployed,
      urls: v.urls
    }))
  }));

  res.json({ success: true, sessions });
});

/**
 * GET /api/style-preview/sessions/:sessionId
 * Get a specific preview session
 */
router.get('/sessions/:sessionId', (req, res) => {
  const session = previewSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }
  res.json({ success: true, session });
});

/**
 * POST /api/style-preview/generate
 * Generate multiple archetype variants for comparison
 *
 * Body: {
 *   fixtureId: string,           // e.g., 'bakery'
 *   businessName?: string,       // Override business name
 *   archetypes: string[],        // ['local', 'luxury', 'ecommerce'] or subset
 *   customizations?: object      // Optional fixture customizations
 * }
 */
router.post('/generate', async (req, res) => {
  const {
    fixtureId,
    businessName: customBusinessName,
    archetypes = ['local', 'luxury', 'ecommerce'],
    customizations = {}
  } = req.body;

  // Validate
  if (!fixtureId) {
    return res.status(400).json({ success: false, error: 'fixtureId is required' });
  }

  if (!archetypeSystem) {
    return res.status(500).json({ success: false, error: 'Archetype system not available' });
  }

  const validArchetypes = ['local', 'luxury', 'ecommerce'];
  const requestedArchetypes = archetypes.filter(a => validArchetypes.includes(a));

  if (requestedArchetypes.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid archetypes specified. Use: local, luxury, ecommerce'
    });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('start', { message: 'Starting style preview generation...' });

    // Load fixture
    let fixture;
    try {
      fixture = loadFixture(fixtureId);
    } catch (e) {
      sendEvent('error', { message: `Fixture not found: ${fixtureId}` });
      res.end();
      return;
    }

    const businessName = customBusinessName || fixture.business.name;
    const baseSlug = businessName.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    sendEvent('progress', { step: 'Fixture loaded', message: `Business: ${businessName}` });

    // Create session
    const sessionId = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const session = {
      id: sessionId,
      businessName,
      fixtureId,
      createdAt: new Date().toISOString(),
      variants: []
    };

    // Generate each archetype variant
    for (const archetypeId of requestedArchetypes) {
      sendEvent('progress', {
        step: 'Generating variant',
        message: `Generating ${archetypeId.toUpperCase()} variant...`
      });

      const archetype = archetypeSystem.getArchetype(archetypeId);
      const projectName = `${baseSlug}-${archetypeId}`;
      const projectPath = path.join(
        process.env.OUTPUT_DIR || path.join(__dirname, '../../..', 'generated-projects'),
        projectName
      );

      // Check if already exists
      if (fs.existsSync(projectPath)) {
        sendEvent('log', { message: `  Removing existing ${projectName}...` });
        fs.rmSync(projectPath, { recursive: true, force: true });
      }

      // Generate using test-mode logic (import the generate function)
      const generateResult = await generateArchetypeVariant({
        fixture,
        customizations,
        archetypeId,
        projectName,
        projectPath,
        sendEvent
      });

      if (generateResult.success) {
        session.variants.push({
          archetype: archetypeId,
          archetypeName: archetype.name,
          projectName,
          path: projectPath,
          deployed: false,
          urls: null,
          generatedAt: new Date().toISOString()
        });

        sendEvent('log', { message: `  ✅ ${archetype.name} variant generated` });
      } else {
        sendEvent('log', { message: `  ❌ Failed to generate ${archetypeId}: ${generateResult.error}` });
      }
    }

    // Store session
    previewSessions.set(sessionId, session);

    sendEvent('complete', {
      message: `Generated ${session.variants.length} style variants`,
      sessionId,
      session
    });

    res.end();

  } catch (error) {
    console.error('[Style Preview] Generation error:', error);
    sendEvent('error', { message: error.message });
    res.end();
  }
});

/**
 * POST /api/style-preview/deploy/:sessionId/:archetype
 * Deploy a specific variant
 */
router.post('/deploy/:sessionId/:archetype', async (req, res) => {
  const { sessionId, archetype } = req.params;

  const session = previewSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const variant = session.variants.find(v => v.archetype === archetype);
  if (!variant) {
    return res.status(404).json({ success: false, error: `Variant ${archetype} not found in session` });
  }

  if (!deployService) {
    return res.status(500).json({ success: false, error: 'Deploy service not available' });
  }

  try {
    const result = await deployService.deploy({
      projectPath: variant.path,
      projectName: variant.projectName
    });

    if (result.success) {
      variant.deployed = true;
      variant.urls = result.urls;
      variant.credentials = result.credentials;
      variant.deployedAt = new Date().toISOString();
    }

    res.json({
      success: result.success,
      variant: variant.archetype,
      urls: result.urls,
      credentials: result.credentials,
      errors: result.errors
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/style-preview/deploy-all/:sessionId
 * Deploy all variants in a session
 */
router.post('/deploy-all/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  const session = previewSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  if (!deployService) {
    return res.status(500).json({ success: false, error: 'Deploy service not available' });
  }

  const results = [];

  for (const variant of session.variants) {
    try {
      const result = await deployService.deploy({
        projectPath: variant.path,
        projectName: variant.projectName
      });

      if (result.success) {
        variant.deployed = true;
        variant.urls = result.urls;
        variant.credentials = result.credentials;
        variant.deployedAt = new Date().toISOString();
      }

      results.push({
        archetype: variant.archetype,
        success: result.success,
        urls: result.urls,
        errors: result.errors
      });

    } catch (error) {
      results.push({
        archetype: variant.archetype,
        success: false,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    deployed: results.filter(r => r.success).length,
    total: session.variants.length,
    results
  });
});

/**
 * DELETE /api/style-preview/sessions/:sessionId
 * Delete entire session (all variants, local files, git repos, deployments)
 */
router.delete('/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { deleteDeployments = true, deleteGitRepos = true } = req.query;

  const session = previewSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const results = {
    localFiles: [],
    gitRepos: [],
    deployments: []
  };

  for (const variant of session.variants) {
    // Delete local files
    if (fs.existsSync(variant.path)) {
      try {
        fs.rmSync(variant.path, { recursive: true, force: true });
        results.localFiles.push({ name: variant.projectName, success: true });
      } catch (e) {
        results.localFiles.push({ name: variant.projectName, success: false, error: e.message });
      }
    }

    // Delete git repos
    if (deleteGitRepos === 'true' && variant.urls) {
      const repoNames = [
        `${variant.projectName}-backend`,
        `${variant.projectName}-frontend`,
        `${variant.projectName}-admin`
      ];

      for (const repoName of repoNames) {
        try {
          execSync(`gh repo delete huddleeco-commits/${repoName} --yes`, {
            stdio: 'pipe',
            timeout: 30000
          });
          results.gitRepos.push({ name: repoName, success: true });
        } catch (e) {
          results.gitRepos.push({ name: repoName, success: false, error: 'Not found or already deleted' });
        }
      }
    }

    // Delete Railway deployment
    if (deleteDeployments === 'true' && variant.urls?.railway) {
      // Extract project ID from Railway URL
      const railwayMatch = variant.urls.railway?.match(/project\/([a-f0-9-]+)/);
      if (railwayMatch) {
        try {
          execSync(`railway delete -y`, {
            env: { ...process.env, RAILWAY_PROJECT_ID: railwayMatch[1] },
            stdio: 'pipe',
            timeout: 30000
          });
          results.deployments.push({ name: variant.projectName, success: true });
        } catch (e) {
          results.deployments.push({ name: variant.projectName, success: false, error: e.message });
        }
      }
    }
  }

  // Remove session
  previewSessions.delete(sessionId);

  res.json({
    success: true,
    message: `Deleted session ${sessionId}`,
    results
  });
});

/**
 * DELETE /api/style-preview/variant/:sessionId/:archetype
 * Delete a single variant
 */
router.delete('/variant/:sessionId/:archetype', async (req, res) => {
  const { sessionId, archetype } = req.params;
  const { deleteDeployment = true, deleteGitRepo = true } = req.query;

  const session = previewSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const variantIndex = session.variants.findIndex(v => v.archetype === archetype);
  if (variantIndex === -1) {
    return res.status(404).json({ success: false, error: `Variant ${archetype} not found` });
  }

  const variant = session.variants[variantIndex];
  const results = { localFiles: null, gitRepos: [], deployment: null };

  // Delete local files
  if (fs.existsSync(variant.path)) {
    try {
      fs.rmSync(variant.path, { recursive: true, force: true });
      results.localFiles = { success: true };
    } catch (e) {
      results.localFiles = { success: false, error: e.message };
    }
  }

  // Delete git repos
  if (deleteGitRepo === 'true' && variant.urls) {
    const repoNames = [
      `${variant.projectName}-backend`,
      `${variant.projectName}-frontend`,
      `${variant.projectName}-admin`
    ];

    for (const repoName of repoNames) {
      try {
        execSync(`gh repo delete huddleeco-commits/${repoName} --yes`, {
          stdio: 'pipe',
          timeout: 30000
        });
        results.gitRepos.push({ name: repoName, success: true });
      } catch (e) {
        results.gitRepos.push({ name: repoName, success: false });
      }
    }
  }

  // Remove from session
  session.variants.splice(variantIndex, 1);

  // If no variants left, delete session
  if (session.variants.length === 0) {
    previewSessions.delete(sessionId);
  }

  res.json({
    success: true,
    message: `Deleted ${archetype} variant`,
    results,
    sessionDeleted: session.variants.length === 0
  });
});

/**
 * GET /api/style-preview/gallery/:sessionId
 * Serve the preview gallery HTML page
 */
router.get('/gallery/:sessionId', (req, res) => {
  const session = previewSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).send('Session not found');
  }

  const html = generateGalleryHTML(session);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

/**
 * Helper: Generate archetype variant using the assemble script
 */
async function generateArchetypeVariant({ fixture, customizations, archetypeId, projectName, projectPath, sendEvent }) {
  const { spawn } = require('child_process');

  // Paths
  const MODULE_LIBRARY = path.join(__dirname, '../..');
  const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, 'scripts', 'assemble.cjs');
  const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(__dirname, '../../..', 'generated-projects');

  // Prepare fixture with archetype override
  const customizedFixture = {
    ...fixture,
    ...customizations,
    business: { ...fixture.business, ...customizations?.business },
    theme: { ...fixture.theme, ...customizations?.theme },
    _archetypeOverride: archetypeId
  };

  const industry = customizedFixture.business?.industry || 'bakery';

  return new Promise((resolve) => {
    // Check if assemble script exists
    if (!fs.existsSync(ASSEMBLE_SCRIPT)) {
      sendEvent('log', { message: `  ⚠️ Assemble script not found: ${ASSEMBLE_SCRIPT}` });
      resolve({ success: false, error: 'Assemble script not found' });
      return;
    }

    const args = [
      ASSEMBLE_SCRIPT,
      '--name', projectName,
      '--industry', industry,
      '--test-mode', 'true',
      '--output', OUTPUT_DIR
    ];

    sendEvent('log', { message: `  Running: node ${args.join(' ')}` });

    const child = spawn('node', args, {
      cwd: MODULE_LIBRARY,
      env: {
        ...process.env,
        TEST_MODE: 'true',
        TEST_FIXTURE: JSON.stringify(customizedFixture),
        ARCHETYPE_OVERRIDE: archetypeId
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', async (code) => {
      const finalPath = path.join(OUTPUT_DIR, projectName);

      if (code === 0 && fs.existsSync(finalPath)) {
        // Generate archetype-specific pages
        try {
          const pagesDir = path.join(finalPath, 'frontend', 'src', 'pages');
          if (fs.existsSync(pagesDir)) {
            // Generate home page with archetype
            const homePage = generatePageWithArchetype('home', null, customizedFixture, archetypeId);
            if (homePage) {
              fs.writeFileSync(path.join(pagesDir, 'HomePage.jsx'), homePage);
            }

            // Generate menu page with archetype
            const menuPage = generatePageWithArchetype('menu', null, customizedFixture, archetypeId);
            if (menuPage) {
              fs.writeFileSync(path.join(pagesDir, 'MenuPage.jsx'), menuPage);
            }
          }

          // Generate TestDashboard
          writeTestDashboard(finalPath, {
            projectName,
            industry,
            prospect: { name: customizedFixture.business?.name || projectName },
            adminCredentials: {
              email: 'admin@be1st.io',
              password: Math.random().toString(36).slice(2, 18)
            }
          });

          // Build frontend
          try {
            execSync('npm run build', {
              cwd: path.join(finalPath, 'frontend'),
              stdio: 'pipe',
              timeout: 120000
            });
          } catch (buildError) {
            sendEvent('log', { message: `  ⚠️ Build warning: ${buildError.message}` });
          }

        } catch (e) {
          sendEvent('log', { message: `  ⚠️ Post-processing error: ${e.message}` });
        }

        resolve({ success: true, projectPath: finalPath });
      } else {
        resolve({
          success: false,
          error: `Assembly failed (code ${code}): ${stderr || 'Unknown error'}`
        });
      }
    });

    child.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    // Timeout after 3 minutes
    setTimeout(() => {
      child.kill();
      resolve({ success: false, error: 'Generation timed out' });
    }, 180000);
  });
}

/**
 * Helper: Generate page with specific archetype
 */
function generatePageWithArchetype(pageName, pageData, fixture, archetypeId) {
  if (!archetypeSystem) return null;

  const archetypePages = require('../generators/archetype-pages.cjs');
  const { name, tagline, location, phone } = fixture.business;
  const colors = fixture.theme.colors;

  const businessData = {
    name,
    tagline,
    industry: fixture.business.industry || 'bakery',
    description: fixture.business.description || tagline,
    phone: phone || '',
    address: location || ''
  };

  if (pageName === 'home') {
    return archetypePages.generateHomePage(archetypeId, businessData, colors);
  } else if (pageName === 'menu') {
    return archetypePages.generateMenuPage(archetypeId, businessData, colors);
  }

  // For other pages, return null to use default generator
  return null;
}

/**
 * Helper: Generate gallery comparison HTML
 */
function generateGalleryHTML(session) {
  const variants = session.variants;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Style Preview: ${session.businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 24px 32px;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 24px; font-weight: 600; }
    .header .meta { color: #94a3b8; font-size: 14px; }
    .tabs {
      display: flex;
      gap: 8px;
      padding: 16px 32px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .tab {
      padding: 12px 24px;
      background: transparent;
      border: 1px solid #475569;
      color: #94a3b8;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .tab:hover { border-color: #60a5fa; color: #60a5fa; }
    .tab.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }
    .preview-container {
      padding: 24px;
      height: calc(100vh - 140px);
    }
    .preview-frame {
      display: none;
      height: 100%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .preview-frame.active { display: block; }
    .preview-frame iframe {
      width: 100%;
      height: calc(100% - 60px);
      border: none;
    }
    .preview-actions {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-deploy {
      background: #22c55e;
      color: white;
    }
    .btn-deploy:hover { background: #16a34a; }
    .btn-delete {
      background: #ef4444;
      color: white;
    }
    .btn-delete:hover { background: #dc2626; }
    .btn-secondary {
      background: #e2e8f0;
      color: #475569;
    }
    .btn-secondary:hover { background: #cbd5e1; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-deployed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .archetype-info {
      padding: 8px 16px;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
      color: #64748b;
    }
    .split-view {
      display: grid;
      grid-template-columns: repeat(${Math.min(variants.length, 3)}, 1fr);
      gap: 16px;
      height: 100%;
    }
    .split-view .preview-frame {
      display: block;
      height: 100%;
    }
    .mode-toggle {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }
    .mode-btn {
      padding: 8px 12px;
      background: #334155;
      border: none;
      color: #94a3b8;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .mode-btn.active { background: #3b82f6; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Style Preview: ${session.businessName}</h1>
      <div class="meta">Session: ${session.id} | Generated: ${new Date(session.createdAt).toLocaleString()}</div>
    </div>
    <div class="mode-toggle">
      <button class="mode-btn active" onclick="setMode('tabs')">Tabs</button>
      <button class="mode-btn" onclick="setMode('split')">Split View</button>
    </div>
  </div>

  <div class="tabs" id="tabs">
    ${variants.map((v, i) => `
      <button class="tab ${i === 0 ? 'active' : ''}" onclick="showVariant('${v.archetype}', this)">
        ${v.archetypeName || v.archetype.toUpperCase()}
        ${v.deployed ? '<span class="status-badge status-deployed">Deployed</span>' : ''}
      </button>
    `).join('')}
    <button class="btn btn-deploy" style="margin-left: auto;" onclick="deployAll()">Deploy All</button>
    <button class="btn btn-delete" onclick="deleteSession()">Delete All</button>
  </div>

  <div class="preview-container" id="preview-container">
    ${variants.map((v, i) => `
      <div class="preview-frame ${i === 0 ? 'active' : ''}" data-archetype="${v.archetype}">
        <div class="archetype-info">
          <strong>${v.archetypeName}</strong> - ${archetypeSystem?.getArchetype(v.archetype)?.description || ''}
        </div>
        <iframe src="file://${v.path.replace(/\\/g, '/')}/frontend/dist/index.html" title="${v.archetype}"></iframe>
        <div class="preview-actions">
          ${v.deployed
            ? `<span class="status-badge status-deployed">✓ Deployed</span>
               <a href="${v.urls?.frontend}" target="_blank" class="btn btn-secondary">Open Live Site</a>`
            : `<button class="btn btn-deploy" onclick="deployVariant('${v.archetype}')">Deploy This Style</button>`
          }
          <button class="btn btn-delete" onclick="deleteVariant('${v.archetype}')">Delete</button>
          <a href="file://${v.path.replace(/\\/g, '/')}" class="btn btn-secondary">Open Folder</a>
        </div>
      </div>
    `).join('')}
  </div>

  <script>
    const sessionId = '${session.id}';
    let currentMode = 'tabs';

    function showVariant(archetype, btn) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.preview-frame').forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(\`.preview-frame[data-archetype="\${archetype}"]\`).classList.add('active');
    }

    function setMode(mode) {
      currentMode = mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');

      const container = document.getElementById('preview-container');
      if (mode === 'split') {
        container.classList.add('split-view');
        document.querySelectorAll('.preview-frame').forEach(f => f.classList.add('active'));
        document.getElementById('tabs').style.display = 'none';
      } else {
        container.classList.remove('split-view');
        document.querySelectorAll('.preview-frame').forEach((f, i) => {
          f.classList.toggle('active', i === 0);
        });
        document.getElementById('tabs').style.display = 'flex';
      }
    }

    async function deployVariant(archetype) {
      if (!confirm(\`Deploy \${archetype} variant?\`)) return;
      const res = await fetch(\`/api/style-preview/deploy/\${sessionId}/\${archetype}\`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(\`Deployed! URL: \${data.urls?.frontend}\`);
        location.reload();
      } else {
        alert(\`Deploy failed: \${data.error}\`);
      }
    }

    async function deployAll() {
      if (!confirm('Deploy ALL variants?')) return;
      const res = await fetch(\`/api/style-preview/deploy-all/\${sessionId}\`, { method: 'POST' });
      const data = await res.json();
      alert(\`Deployed \${data.deployed} of \${data.total} variants\`);
      location.reload();
    }

    async function deleteVariant(archetype) {
      if (!confirm(\`Delete \${archetype} variant? This will remove local files, git repos, and deployments.\`)) return;
      const res = await fetch(\`/api/style-preview/variant/\${sessionId}/\${archetype}?deleteDeployment=true&deleteGitRepo=true\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert(\`Delete failed: \${data.error}\`);
      }
    }

    async function deleteSession() {
      if (!confirm('Delete ALL variants? This will remove all local files, git repos, and deployments.')) return;
      const res = await fetch(\`/api/style-preview/sessions/\${sessionId}?deleteDeployments=true&deleteGitRepos=true\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        window.close();
      }
    }
  </script>
</body>
</html>`;
}

module.exports = router;
