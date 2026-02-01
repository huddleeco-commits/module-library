/**
 * Screenshot Service
 *
 * Automatically captures screenshots of generated sites for preview/comparison
 * Uses Puppeteer to render React pages and capture them
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class ScreenshotService {
  constructor() {
    this.browser = null;
    this.serverProcess = null;
  }

  /**
   * Take screenshots of all pages in a generated project
   * @param {string} projectPath - Path to the generated project (e.g., output/prospects/cristy-s-cake-shop/full-test)
   * @param {Object} options - Configuration options
   * @returns {Object} - Screenshot results with paths and metadata
   */
  async captureProject(projectPath, options = {}) {
    const {
      pages = null, // Array of page paths to capture, or null for auto-detect
      viewports = [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'mobile', width: 375, height: 812 }
      ],
      fullPage = true,
      quality = 90,
      format = 'jpeg' // jpeg is faster and smaller than png
    } = options;

    const frontendPath = path.join(projectPath, 'frontend');
    const screenshotDir = path.join(projectPath, 'screenshots');
    const galleryDir = path.join(projectPath, '..', '..', '..', 'screenshot-gallery');

    // Create screenshot directories
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    if (!fs.existsSync(galleryDir)) {
      fs.mkdirSync(galleryDir, { recursive: true });
    }

    const results = {
      projectPath,
      capturedAt: new Date().toISOString(),
      screenshots: [],
      errors: [],
      summary: {}
    };

    try {
      // Step 1: Ensure dependencies are installed
      console.log('[Screenshot] Checking dependencies...');
      await this.ensureDependencies(frontendPath);

      // Step 2: Start dev server
      console.log('[Screenshot] Starting preview server...');
      const port = await this.startDevServer(frontendPath);
      const baseUrl = `http://localhost:${port}`;

      // Step 3: Launch browser
      console.log('[Screenshot] Launching browser...');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Step 4: Detect pages if not provided
      const pagesToCapture = pages || this.detectPages(frontendPath);
      console.log(`[Screenshot] Capturing ${pagesToCapture.length} pages...`);

      // Step 5: Capture each page at each viewport
      for (const pagePath of pagesToCapture) {
        for (const viewport of viewports) {
          try {
            const screenshot = await this.capturePage(
              baseUrl,
              pagePath,
              viewport,
              screenshotDir,
              { fullPage, quality, format }
            );
            results.screenshots.push(screenshot);
            console.log(`[Screenshot] ✓ ${pagePath} @ ${viewport.name}`);
          } catch (err) {
            const error = {
              page: pagePath,
              viewport: viewport.name,
              error: err.message
            };
            results.errors.push(error);
            console.error(`[Screenshot] ✗ ${pagePath} @ ${viewport.name}: ${err.message}`);
          }
        }
      }

      // Step 6: Generate gallery manifest
      results.summary = {
        totalPages: pagesToCapture.length,
        totalScreenshots: results.screenshots.length,
        totalErrors: results.errors.length,
        viewports: viewports.map(v => v.name)
      };

      // Save manifest
      const manifestPath = path.join(screenshotDir, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));

      // Copy to central gallery with timestamp
      const projectName = path.basename(path.dirname(projectPath));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const galleryProjectDir = path.join(galleryDir, `${projectName}-${timestamp}`);
      await this.copyDirectory(screenshotDir, galleryProjectDir);

      results.galleryPath = galleryProjectDir;
      console.log(`[Screenshot] Gallery saved to: ${galleryProjectDir}`);

    } catch (err) {
      results.errors.push({ general: err.message });
      console.error('[Screenshot] Fatal error:', err.message);
    } finally {
      // Cleanup
      await this.cleanup();
    }

    return results;
  }

  /**
   * Ensure npm dependencies are installed
   */
  async ensureDependencies(frontendPath) {
    const nodeModulesPath = path.join(frontendPath, 'node_modules');

    if (fs.existsSync(nodeModulesPath)) {
      console.log('[Screenshot] Dependencies already installed');
      return;
    }

    console.log('[Screenshot] Installing dependencies (this may take a moment)...');

    return new Promise((resolve, reject) => {
      const npmInstall = spawn('npm', ['install'], {
        cwd: frontendPath,
        shell: true,
        stdio: 'pipe'
      });

      let output = '';
      npmInstall.stdout.on('data', (data) => { output += data; });
      npmInstall.stderr.on('data', (data) => { output += data; });

      npmInstall.on('close', (code) => {
        if (code === 0) {
          console.log('[Screenshot] Dependencies installed');
          resolve();
        } else {
          reject(new Error(`npm install failed: ${output}`));
        }
      });

      npmInstall.on('error', reject);
    });
  }

  /**
   * Start Vite dev server and return the port
   */
  async startDevServer(frontendPath) {
    return new Promise((resolve, reject) => {
      // Find an available port
      const port = 5173 + Math.floor(Math.random() * 100);

      this.serverProcess = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
        cwd: frontendPath,
        shell: true,
        stdio: 'pipe'
      });

      let started = false;
      const timeout = setTimeout(() => {
        if (!started) {
          reject(new Error('Dev server timeout'));
        }
      }, 60000);

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        // Vite outputs "Local: http://localhost:PORT" when ready
        if (output.includes('Local:') || output.includes('localhost')) {
          if (!started) {
            started = true;
            clearTimeout(timeout);
            // Give it a moment to fully initialize
            setTimeout(() => resolve(port), 2000);
          }
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        // Vite also outputs to stderr sometimes
        if (output.includes('Local:') || output.includes('localhost')) {
          if (!started) {
            started = true;
            clearTimeout(timeout);
            setTimeout(() => resolve(port), 2000);
          }
        }
      });

      this.serverProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.serverProcess.on('close', (code) => {
        if (!started && code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`Dev server exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Detect pages from the generated project
   */
  detectPages(frontendPath) {
    const pagesDir = path.join(frontendPath, 'src', 'pages');
    const pages = ['/home']; // Always include home

    if (fs.existsSync(pagesDir)) {
      const files = fs.readdirSync(pagesDir);
      for (const file of files) {
        if (file.endsWith('Page.jsx') || file.endsWith('Page.tsx')) {
          const pageName = file.replace(/Page\.(jsx|tsx)$/, '').toLowerCase();
          if (pageName !== 'home' && pageName !== 'testdashboard') {
            pages.push(`/${pageName}`);
          }
        }
      }
    }

    return pages;
  }

  /**
   * Capture a single page screenshot
   */
  async capturePage(baseUrl, pagePath, viewport, outputDir, options) {
    const page = await this.browser.newPage();

    try {
      // Set viewport
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 2 // Retina quality
      });

      // Navigate to page
      const url = `${baseUrl}${pagePath}`;
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate filename
      const safePath = pagePath.replace(/\//g, '-').replace(/^-/, '') || 'home';
      const filename = `${safePath}-${viewport.name}.${options.format}`;
      const filepath = path.join(outputDir, filename);

      // Take screenshot
      await page.screenshot({
        path: filepath,
        fullPage: options.fullPage,
        type: options.format,
        quality: options.format === 'jpeg' ? options.quality : undefined
      });

      return {
        page: pagePath,
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        filename,
        filepath,
        url
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        // Ignore
      }
      this.browser = null;
    }

    if (this.serverProcess) {
      const pid = this.serverProcess.pid;
      try {
        // Kill the process tree on Windows (sync to ensure completion)
        if (process.platform === 'win32') {
          const { execSync } = require('child_process');
          try {
            execSync(`taskkill /pid ${pid} /f /t`, { stdio: 'pipe', shell: true });
            console.log(`[Screenshot] Killed dev server process tree (PID: ${pid})`);
          } catch (killErr) {
            // Process might already be dead, that's fine
          }
        } else {
          this.serverProcess.kill('SIGTERM');
        }
      } catch (e) {
        // Ignore
      }
      this.serverProcess = null;

      // Wait a moment for file handles to be released
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Quick capture - single viewport, essential pages only
   * For fast iteration during development
   */
  async quickCapture(projectPath) {
    return this.captureProject(projectPath, {
      viewports: [{ name: 'desktop', width: 1440, height: 900 }],
      pages: ['/home', '/menu', '/about', '/contact'],
      fullPage: false,
      quality: 80
    });
  }

  /**
   * Compare two layout generations
   * @param {string} projectPath1 - First project path
   * @param {string} projectPath2 - Second project path
   * @returns {Object} - Comparison data
   */
  async compareLayouts(projectPath1, projectPath2) {
    const [results1, results2] = await Promise.all([
      this.captureProject(projectPath1),
      this.captureProject(projectPath2)
    ]);

    return {
      layout1: results1,
      layout2: results2,
      comparedAt: new Date().toISOString(),
      pages: results1.screenshots.map(s1 => {
        const s2 = results2.screenshots.find(
          s => s.page === s1.page && s.viewport === s1.viewport
        );
        return {
          page: s1.page,
          viewport: s1.viewport,
          screenshot1: s1.filepath,
          screenshot2: s2?.filepath || null
        };
      })
    };
  }
}

// Singleton instance
const screenshotService = new ScreenshotService();

module.exports = {
  ScreenshotService,
  screenshotService,

  // Convenience functions
  captureProject: (projectPath, options) => screenshotService.captureProject(projectPath, options),
  quickCapture: (projectPath) => screenshotService.quickCapture(projectPath),
  compareLayouts: (path1, path2) => screenshotService.compareLayouts(path1, path2)
};
