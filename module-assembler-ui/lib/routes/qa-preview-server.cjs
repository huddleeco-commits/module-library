/**
 * QA Preview Server
 *
 * Single server that can preview ANY generated industry site.
 * Serves static files and provides live preview URLs.
 *
 * URL Pattern: /qa-preview/:industry/:view/*
 * - industry: pizza-restaurant, law-firm, etc.
 * - view: customer, admin, backend
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('vite');
const { spawn } = require('child_process');

const QA_SITES_DIR = path.join(__dirname, '../../output/qa-suite/sites');

/**
 * Run npm install in a directory
 */
async function installDependencies(dir) {
  return new Promise((resolve, reject) => {
    console.log(`[QA Preview] Installing dependencies in ${dir}...`);
    const isWindows = process.platform === 'win32';
    const npm = isWindows ? 'npm.cmd' : 'npm';

    const proc = spawn(npm, ['install'], {
      cwd: dir,
      stdio: 'pipe',
      shell: isWindows
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => { stdout += data; });
    proc.stderr.on('data', data => { stderr += data; });

    proc.on('close', code => {
      if (code === 0) {
        console.log(`[QA Preview] Dependencies installed successfully`);
        resolve();
      } else {
        reject(new Error(`npm install failed: ${stderr || stdout}`));
      }
    });

    proc.on('error', reject);

    // Timeout after 2 minutes
    setTimeout(() => {
      proc.kill();
      reject(new Error('npm install timed out'));
    }, 120000);
  });
}

/**
 * Create QA Preview routes
 * This serves the generated sites for live preview
 */
function createQAPreviewRoutes() {
  const router = express.Router();

  // Track running Vite dev servers
  const viteServers = new Map();
  let nextPort = 5100;

  /**
   * GET /qa-preview/status
   * Get status of all preview servers
   */
  router.get('/status', (req, res) => {
    const servers = {};
    viteServers.forEach((server, key) => {
      servers[key] = {
        port: server.port,
        url: `http://localhost:${server.port}`,
        industry: server.industry,
        view: server.view
      };
    });
    res.json({ success: true, servers, count: viteServers.size });
  });

  /**
   * POST /qa-preview/start/:industry/:view
   * Start a Vite dev server for a specific industry/view
   */
  router.post('/start/:industry/:view', async (req, res) => {
    const { industry, view } = req.params;
    const key = `${industry}-${view}`;

    // Check if already running
    if (viteServers.has(key)) {
      const existing = viteServers.get(key);
      return res.json({
        success: true,
        message: 'Server already running',
        url: `http://localhost:${existing.port}`,
        port: existing.port
      });
    }

    // Determine the directory
    let siteDir;
    switch (view) {
      case 'customer':
        siteDir = path.join(QA_SITES_DIR, industry, 'frontend');
        break;
      case 'admin':
        siteDir = path.join(QA_SITES_DIR, industry, 'admin');
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid view. Use: customer, admin' });
    }

    if (!fs.existsSync(siteDir)) {
      return res.status(404).json({ success: false, error: `Site not found: ${siteDir}` });
    }

    // Check if it has a package.json (Vite project)
    const hasPackageJson = fs.existsSync(path.join(siteDir, 'package.json'));

    if (!hasPackageJson) {
      // Serve as static files instead
      return res.json({
        success: true,
        message: 'Static site - use /qa-preview/static endpoint',
        staticUrl: `/qa-preview/static/${industry}/${view}`
      });
    }

    // Check if node_modules exists, install if not
    const hasNodeModules = fs.existsSync(path.join(siteDir, 'node_modules'));
    if (!hasNodeModules) {
      try {
        await installDependencies(siteDir);
      } catch (installErr) {
        console.error(`[QA Preview] Failed to install dependencies:`, installErr.message);
        return res.status(500).json({
          success: false,
          error: `Dependencies not installed. Run: cd ${siteDir} && npm install`,
          details: installErr.message
        });
      }
    }

    try {
      const port = nextPort++;

      // Create Vite dev server
      const server = await createServer({
        root: siteDir,
        server: {
          port,
          strictPort: true,
          host: true
        },
        logLevel: 'error'
      });

      await server.listen();

      viteServers.set(key, {
        server,
        port,
        industry,
        view,
        startedAt: new Date().toISOString()
      });

      console.log(`[QA Preview] Started ${key} on port ${port}`);

      res.json({
        success: true,
        url: `http://localhost:${port}`,
        port,
        industry,
        view
      });

    } catch (err) {
      console.error(`[QA Preview] Failed to start ${key}:`, err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /qa-preview/stop/:industry/:view
   * Stop a running preview server
   */
  router.post('/stop/:industry/:view', async (req, res) => {
    const { industry, view } = req.params;
    const key = `${industry}-${view}`;

    if (!viteServers.has(key)) {
      return res.status(404).json({ success: false, error: 'Server not running' });
    }

    try {
      const { server } = viteServers.get(key);
      await server.close();
      viteServers.delete(key);
      console.log(`[QA Preview] Stopped ${key}`);
      res.json({ success: true, stopped: key });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * POST /qa-preview/start-all
   * Start preview servers for ALL generated industries
   * Query params: ?views=customer,admin (default: customer only)
   */
  router.post('/start-all', async (req, res) => {
    const { views = ['customer'] } = req.body;
    const viewsToStart = Array.isArray(views) ? views : [views];

    // Find all generated industries
    if (!fs.existsSync(QA_SITES_DIR)) {
      return res.json({ success: true, started: [], message: 'No sites generated yet' });
    }

    const industries = fs.readdirSync(QA_SITES_DIR).filter(dir => {
      const stat = fs.statSync(path.join(QA_SITES_DIR, dir));
      return stat.isDirectory();
    });

    const started = [];
    const failed = [];
    const skipped = [];

    for (const industry of industries) {
      for (const view of viewsToStart) {
        const key = `${industry}-${view}`;

        // Skip if already running
        if (viteServers.has(key)) {
          skipped.push({ industry, view, reason: 'already running' });
          continue;
        }

        // Determine directory
        let siteDir;
        if (view === 'customer') {
          siteDir = path.join(QA_SITES_DIR, industry, 'frontend');
        } else if (view === 'admin') {
          siteDir = path.join(QA_SITES_DIR, industry, 'admin');
        } else {
          continue;
        }

        // Skip if directory doesn't exist
        if (!fs.existsSync(siteDir)) {
          skipped.push({ industry, view, reason: 'not generated' });
          continue;
        }

        // Skip if no package.json
        if (!fs.existsSync(path.join(siteDir, 'package.json'))) {
          skipped.push({ industry, view, reason: 'no package.json' });
          continue;
        }

        try {
          // Install dependencies if needed
          if (!fs.existsSync(path.join(siteDir, 'node_modules'))) {
            await installDependencies(siteDir);
          }

          const port = nextPort++;
          const server = await createServer({
            root: siteDir,
            server: { port, strictPort: true, host: true },
            logLevel: 'error'
          });

          await server.listen();

          viteServers.set(key, {
            server,
            port,
            industry,
            view,
            startedAt: new Date().toISOString()
          });

          started.push({ industry, view, port, url: `http://localhost:${port}` });
          console.log(`[QA Preview] Started ${key} on port ${port}`);

        } catch (err) {
          console.error(`[QA Preview] Failed to start ${key}:`, err.message);
          failed.push({ industry, view, error: err.message });
        }
      }
    }

    res.json({
      success: true,
      started,
      failed,
      skipped,
      total: viteServers.size
    });
  });

  /**
   * POST /qa-preview/stop-all
   * Stop all running preview servers
   */
  router.post('/stop-all', async (req, res) => {
    const stopped = [];
    for (const [key, { server }] of viteServers) {
      try {
        await server.close();
        stopped.push(key);
      } catch (err) {
        console.error(`[QA Preview] Error stopping ${key}:`, err.message);
      }
    }
    viteServers.clear();
    nextPort = 5100;
    res.json({ success: true, stopped });
  });

  /**
   * Serve static files for generated sites
   * GET /qa-preview/static/:industry/:view/*
   */
  router.use('/static/:industry/:view', (req, res, next) => {
    const { industry, view } = req.params;

    let baseDir;
    switch (view) {
      case 'customer':
        baseDir = path.join(QA_SITES_DIR, industry, 'frontend', 'dist');
        // Fallback to src if no dist
        if (!fs.existsSync(baseDir)) {
          baseDir = path.join(QA_SITES_DIR, industry, 'frontend');
        }
        break;
      case 'admin':
        baseDir = path.join(QA_SITES_DIR, industry, 'admin', 'dist');
        if (!fs.existsSync(baseDir)) {
          baseDir = path.join(QA_SITES_DIR, industry, 'admin');
        }
        break;
      default:
        return res.status(400).send('Invalid view');
    }

    if (!fs.existsSync(baseDir)) {
      return res.status(404).send(`Site not found: ${industry}/${view}`);
    }

    // Serve static files
    express.static(baseDir)(req, res, next);
  });

  return router;
}

module.exports = { createQAPreviewRoutes };
