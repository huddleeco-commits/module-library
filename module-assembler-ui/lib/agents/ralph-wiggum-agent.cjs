/**
 * Ralph Wiggum Agent
 *
 * Sanity check agent that validates projects at multiple checkpoints.
 * Named after the Simpsons character - catches obvious mistakes that
 * more sophisticated systems might miss.
 *
 * "Me fail English? That's unpossible!"
 *
 * This is ADDITIVE - does not modify existing pipeline.
 * Call it manually or integrate when ready.
 */

const fs = require('fs');
const path = require('path');

// Ralph's wisdom quotes for different situations
const RALPH_QUOTES = {
  start: [
    "I'm helping!",
    "My cat's breath smells like cat food.",
    "I bent my wookie.",
  ],
  success: [
    "I'm a unitard!",
    "Yay! I'm a detective!",
    "That's where I saw the leprechaun!",
  ],
  failure: [
    "Me fail English? That's unpossible!",
    "I heard your dad went into a restaurant...",
    "The doctor said I wouldn't have so many nose bleeds if I kept my finger outta there.",
  ],
  checking: [
    "I'm learnding!",
    "My cat's name is Mittens.",
    "When I grow up, I'm going to Bovine University!",
  ]
};

function getRandomQuote(type) {
  const quotes = RALPH_QUOTES[type] || RALPH_QUOTES.checking;
  return quotes[Math.floor(Math.random() * quotes.length)];
}

class RalphWiggumAgent {
  constructor(options = {}) {
    this.name = 'Ralph Wiggum';
    this.verbose = options.verbose !== false;
    this.strict = options.strict || false; // If true, warnings become failures
    this.results = {
      checksRun: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    if (!this.verbose) return;

    const prefix = type === 'error' ? '   ❌' :
                   type === 'warning' ? '   ⚠️' :
                   type === 'success' ? '   ✅' : '   📋';
    console.log(`${prefix} ${message}`);
  }

  /**
   * Run all checkpoint validations for a stage
   * @param {string} projectPath - Path to the generated project
   * @param {string} stage - 'post-generation' | 'post-build' | 'pre-deploy' | 'post-deploy'
   * @param {Object} context - Additional context (industry, pages, etc.)
   */
  async validate(projectPath, stage, context = {}) {
    console.log(`\n🧒 [Ralph Wiggum] "${getRandomQuote('start')}" - Checking ${stage}...`);

    const failures = [];
    const warnings = [];

    try {
      switch(stage) {
        case 'post-generation':
          const genResults = await this.checkPostGeneration(projectPath, context);
          failures.push(...genResults.failures);
          warnings.push(...genResults.warnings);
          break;

        case 'post-build':
          const buildResults = await this.checkPostBuild(projectPath, context);
          failures.push(...buildResults.failures);
          warnings.push(...buildResults.warnings);
          break;

        case 'pre-deploy':
          const preDeployResults = await this.checkPreDeploy(projectPath, context);
          failures.push(...preDeployResults.failures);
          warnings.push(...preDeployResults.warnings);
          break;

        case 'post-deploy':
          const postDeployResults = await this.checkPostDeploy(projectPath, context);
          failures.push(...postDeployResults.failures);
          warnings.push(...postDeployResults.warnings);
          break;

        default:
          console.log(`🧒 [Ralph Wiggum] Unknown stage: ${stage}`);
      }
    } catch (err) {
      failures.push(`Ralph crashed: ${err.message}`);
    }

    // Update stats
    this.results.checksRun++;
    if (failures.length > 0) {
      this.results.failed++;
      this.results.errors.push(...failures);
    } else {
      this.results.passed++;
    }
    this.results.warnings += warnings.length;

    // Report
    if (failures.length > 0) {
      console.log(`🧒 [Ralph Wiggum] "${getRandomQuote('failure')}" Found ${failures.length} issue(s):`);
      failures.forEach(f => this.log(f, 'error'));

      if (warnings.length > 0) {
        console.log(`   Plus ${warnings.length} warning(s):`);
        warnings.forEach(w => this.log(w, 'warning'));
      }

      return {
        success: false,
        stage,
        failures,
        warnings,
        quote: getRandomQuote('failure')
      };
    }

    if (warnings.length > 0) {
      console.log(`🧒 [Ralph Wiggum] Passed with ${warnings.length} warning(s):`);
      warnings.forEach(w => this.log(w, 'warning'));
    } else {
      console.log(`🧒 [Ralph Wiggum] "${getRandomQuote('success')}" All ${stage} checks passed!`);
    }

    return {
      success: true,
      stage,
      failures: [],
      warnings,
      quote: getRandomQuote('success')
    };
  }

  /**
   * POST-GENERATION CHECKS
   * Run after AI/fixture generates the code, before npm install/build
   */
  async checkPostGeneration(projectPath, context = {}) {
    const failures = [];
    const warnings = [];

    this.log(`Checking post-generation for: ${path.basename(projectPath)}`);

    // 1. Check project root exists
    if (!fs.existsSync(projectPath)) {
      failures.push(`Project directory does not exist: ${projectPath}`);
      return { failures, warnings };
    }

    // 2. Check required directories
    const requiredDirs = ['frontend', 'frontend/src'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(projectPath, dir);
      if (!fs.existsSync(dirPath)) {
        failures.push(`Missing required directory: ${dir}`);
      }
    }

    // 3. Check required files
    const requiredFiles = [
      { path: 'frontend/package.json', critical: true },
      { path: 'frontend/vite.config.js', critical: true },
      { path: 'frontend/index.html', critical: true },
      { path: 'frontend/src/main.jsx', critical: true },
      { path: 'frontend/src/App.jsx', critical: true },
      { path: 'brain.json', critical: false },
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(projectPath, file.path);
      if (!fs.existsSync(filePath)) {
        if (file.critical) {
          failures.push(`Missing critical file: ${file.path}`);
        } else {
          warnings.push(`Missing optional file: ${file.path}`);
        }
      }
    }

    // 4. Check App.jsx content
    const appJsxPath = path.join(projectPath, 'frontend/src/App.jsx');
    if (fs.existsSync(appJsxPath)) {
      const appContent = fs.readFileSync(appJsxPath, 'utf8');

      // Must have export default
      if (!appContent.includes('export default')) {
        failures.push('App.jsx missing "export default"');
      }

      // Must have some routes (unless it's a single-page tool)
      if (!appContent.includes('<Route') && !appContent.includes('BrowserRouter')) {
        warnings.push('App.jsx has no React Router setup');
      }

      // Check for common AI mistakes
      if (appContent.includes("from '../modules/")) {
        failures.push('App.jsx has incorrect import path "../modules/" (should be "../components/")');
      }

      // Check for incomplete generation
      if (appContent.includes('// TODO') || appContent.includes('// FIXME')) {
        warnings.push('App.jsx contains TODO/FIXME comments');
      }

      // Check for placeholder text
      if (appContent.includes('Lorem ipsum') || appContent.includes('lorem ipsum')) {
        warnings.push('App.jsx contains Lorem ipsum placeholder text');
      }

      // Check file isn't empty or nearly empty
      if (appContent.length < 200) {
        failures.push(`App.jsx suspiciously small (${appContent.length} chars)`);
      }
    }

    // 5. Check pages directory
    const pagesDir = path.join(projectPath, 'frontend/src/pages');
    if (fs.existsSync(pagesDir)) {
      const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

      if (pages.length === 0) {
        warnings.push('Pages directory exists but is empty');
      } else {
        this.log(`Found ${pages.length} page(s): ${pages.join(', ')}`, 'success');

        // Check each page file
        for (const page of pages) {
          const pagePath = path.join(pagesDir, page);
          const pageContent = fs.readFileSync(pagePath, 'utf8');

          if (!pageContent.includes('export default')) {
            failures.push(`${page} missing "export default"`);
          }

          if (pageContent.length < 100) {
            warnings.push(`${page} suspiciously small (${pageContent.length} chars)`);
          }

          // Check for nested font quotes (common AI mistake)
          if (pageContent.match(/fontFamily:\s*["']'[^']+'/)) {
            warnings.push(`${page} has nested font quotes (will be auto-fixed by audit)`);
          }
        }
      }
    } else if (context.pages && context.pages.length > 0) {
      failures.push(`Expected ${context.pages.length} pages but pages directory doesn't exist`);
    }

    // 6. Check package.json is valid JSON
    const pkgPath = path.join(projectPath, 'frontend/package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (!pkg.name) {
          warnings.push('package.json missing "name" field');
        }

        if (!pkg.scripts?.build) {
          failures.push('package.json missing "build" script');
        }

        if (!pkg.scripts?.dev) {
          warnings.push('package.json missing "dev" script');
        }

        // Check for required dependencies
        const requiredDeps = ['react', 'react-dom'];
        for (const dep of requiredDeps) {
          if (!pkg.dependencies?.[dep]) {
            failures.push(`package.json missing required dependency: ${dep}`);
          }
        }

      } catch (e) {
        failures.push(`package.json is not valid JSON: ${e.message}`);
      }
    }

    // 7. Check brain.json if exists
    const brainPath = path.join(projectPath, 'brain.json');
    if (fs.existsSync(brainPath)) {
      try {
        const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));

        if (!brain.businessName) {
          warnings.push('brain.json missing businessName');
        }

        this.log(`brain.json valid: ${brain.businessName || 'unnamed'}`, 'success');

      } catch (e) {
        failures.push(`brain.json is not valid JSON: ${e.message}`);
      }
    }

    return { failures, warnings };
  }

  /**
   * POST-BUILD CHECKS
   * Run after npm install and vite build complete
   */
  async checkPostBuild(projectPath, context = {}) {
    const failures = [];
    const warnings = [];

    this.log(`Checking post-build for: ${path.basename(projectPath)}`);

    // 1. Check node_modules exists
    const nodeModulesPath = path.join(projectPath, 'frontend/node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      failures.push('node_modules directory missing - npm install may have failed');
    }

    // 2. Check dist directory exists
    const distPath = path.join(projectPath, 'frontend/dist');
    if (!fs.existsSync(distPath)) {
      failures.push('dist directory missing - vite build may have failed');
      return { failures, warnings };
    }

    // 3. Check dist/index.html exists
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      failures.push('dist/index.html missing');
    } else {
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Check for script tags
      if (!indexContent.includes('<script')) {
        failures.push('dist/index.html has no script tags');
      }

      // Check for basic HTML structure
      if (!indexContent.includes('<!DOCTYPE html') && !indexContent.includes('<!doctype html')) {
        warnings.push('dist/index.html missing DOCTYPE');
      }
    }

    // 4. Check for JS bundles
    const assetsDir = path.join(distPath, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assets = fs.readdirSync(assetsDir);
      const jsFiles = assets.filter(f => f.endsWith('.js'));
      const cssFiles = assets.filter(f => f.endsWith('.css'));

      if (jsFiles.length === 0) {
        failures.push('No JavaScript bundles in dist/assets');
      } else {
        this.log(`Found ${jsFiles.length} JS bundle(s)`, 'success');
      }

      if (cssFiles.length === 0) {
        warnings.push('No CSS files in dist/assets (may be using JS-based styles)');
      }

      // Check bundle sizes
      for (const jsFile of jsFiles) {
        const filePath = path.join(assetsDir, jsFile);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);

        if (sizeKB > 1000) {
          warnings.push(`Large bundle detected: ${jsFile} (${sizeKB}KB)`);
        }

        if (sizeKB < 1) {
          failures.push(`Suspiciously small bundle: ${jsFile} (${sizeKB}KB)`);
        }
      }
    } else {
      failures.push('dist/assets directory missing');
    }

    // 5. Check for source maps (optional, but good for debugging)
    if (fs.existsSync(assetsDir)) {
      const assets = fs.readdirSync(assetsDir);
      const mapFiles = assets.filter(f => f.endsWith('.map'));

      if (mapFiles.length === 0 && context.includeMaps) {
        warnings.push('No source maps generated');
      }
    }

    return { failures, warnings };
  }

  /**
   * PRE-DEPLOY CHECKS
   * Run before pushing to Railway/GitHub
   */
  async checkPreDeploy(projectPath, context = {}) {
    const failures = [];
    const warnings = [];

    this.log(`Checking pre-deploy for: ${path.basename(projectPath)}`);

    // 1. Run post-build checks first (dist must exist)
    const buildResults = await this.checkPostBuild(projectPath, context);
    failures.push(...buildResults.failures);
    warnings.push(...buildResults.warnings);

    if (failures.length > 0) {
      return { failures, warnings }; // Don't continue if build failed
    }

    const distPath = path.join(projectPath, 'frontend/dist');

    // 2. Check for secrets/sensitive data in dist
    const sensitivePatterns = [
      { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI/Anthropic API key' },
      { pattern: /ANTHROPIC_API_KEY\s*=/, name: 'Anthropic key assignment' },
      { pattern: /API_KEY\s*=\s*['"][^'"]+['"]/, name: 'Hardcoded API key' },
      { pattern: /password\s*[:=]\s*['"][^'"]+['"]/, name: 'Hardcoded password' },
      { pattern: /mongodb\+srv:\/\/[^'"]+/, name: 'MongoDB connection string' },
      { pattern: /postgres:\/\/[^'"]+/, name: 'PostgreSQL connection string' },
    ];

    const distFiles = this.getAllFiles(distPath);
    for (const file of distFiles) {
      if (file.endsWith('.map')) continue; // Skip source maps

      try {
        const content = fs.readFileSync(file, 'utf8');

        for (const { pattern, name } of sensitivePatterns) {
          if (pattern.test(content)) {
            failures.push(`SECURITY: Potential ${name} found in ${path.relative(distPath, file)}`);
          }
        }
      } catch (e) {
        // Binary file, skip
      }
    }

    // 3. Check .env.example exists (good practice)
    const envExamplePath = path.join(projectPath, 'frontend/.env.example');
    if (!fs.existsSync(envExamplePath)) {
      warnings.push('No .env.example file for frontend');
    }

    // 4. Check admin directory if it should exist
    const adminPath = path.join(projectPath, 'admin');
    if (context.includeAdmin !== false) {
      if (!fs.existsSync(adminPath)) {
        warnings.push('Admin directory missing');
      } else {
        const adminPkg = path.join(adminPath, 'package.json');
        if (!fs.existsSync(adminPkg)) {
          warnings.push('Admin package.json missing');
        }
      }
    }

    // 5. Check backend if it should exist
    const backendPath = path.join(projectPath, 'backend');
    if (context.includeBackend !== false && fs.existsSync(backendPath)) {
      const backendPkg = path.join(backendPath, 'package.json');
      if (!fs.existsSync(backendPkg)) {
        warnings.push('Backend package.json missing');
      }
    }

    return { failures, warnings };
  }

  /**
   * POST-DEPLOY CHECKS
   * Run after deployment to verify live site
   */
  async checkPostDeploy(projectPath, context = {}) {
    const failures = [];
    const warnings = [];

    this.log(`Checking post-deploy for: ${path.basename(projectPath)}`);

    const { urls } = context;

    if (!urls || !urls.frontend) {
      warnings.push('No frontend URL provided for post-deploy checks');
      return { failures, warnings };
    }

    // 1. Check frontend is responding
    try {
      const response = await fetch(urls.frontend, {
        method: 'GET',
        timeout: 10000
      });

      if (response.status !== 200) {
        failures.push(`Frontend returned ${response.status} instead of 200`);
      } else {
        this.log(`Frontend responding: ${urls.frontend}`, 'success');
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/html')) {
        warnings.push(`Frontend content-type is ${contentType}, expected text/html`);
      }

    } catch (e) {
      failures.push(`Frontend not reachable: ${e.message}`);
    }

    // 2. Check admin if URL provided
    if (urls.admin) {
      try {
        const response = await fetch(urls.admin, {
          method: 'GET',
          timeout: 10000
        });

        if (response.status !== 200) {
          warnings.push(`Admin returned ${response.status}`);
        } else {
          this.log(`Admin responding: ${urls.admin}`, 'success');
        }
      } catch (e) {
        warnings.push(`Admin not reachable: ${e.message}`);
      }
    }

    // 3. Check backend health if URL provided
    if (urls.backend) {
      try {
        const healthUrl = urls.backend.replace(/\/$/, '') + '/api/health';
        const response = await fetch(healthUrl, {
          method: 'GET',
          timeout: 10000
        });

        if (response.status !== 200) {
          warnings.push(`Backend health check returned ${response.status}`);
        } else {
          this.log(`Backend healthy: ${healthUrl}`, 'success');
        }
      } catch (e) {
        warnings.push(`Backend health check failed: ${e.message}`);
      }
    }

    return { failures, warnings };
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          this.getAllFiles(fullPath, files);
        } else {
          files.push(fullPath);
        }
      } catch (e) {
        // Skip inaccessible files
      }
    }
    return files;
  }

  /**
   * Get summary of all checks run
   */
  getSummary() {
    return {
      agent: this.name,
      ...this.results,
      successRate: this.results.checksRun > 0
        ? Math.round((this.results.passed / this.results.checksRun) * 100)
        : 0
    };
  }

  /**
   * Reset stats for new run
   */
  reset() {
    this.results = {
      checksRun: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
  }
}

module.exports = { RalphWiggumAgent };
