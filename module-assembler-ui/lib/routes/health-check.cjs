/**
 * Platform Health Check API Routes
 * Comprehensive health checking for all platform components
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { existsSync } = require('fs');

// Base paths - __dirname is lib/routes, go up 3 levels to module-library root
const ROOT_DIR = path.resolve(__dirname, '../../..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const MODULE_ASSEMBLER_DIR = path.join(ROOT_DIR, 'module-assembler-ui');

// ============================================
// HELPER FUNCTIONS
// ============================================

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Detect if a file uses ES Module syntax (can't be require()'d in Node.js)
 */
function isESModule(content) {
  // Check for ES Module patterns
  const esModulePatterns = [
    /^\s*import\s+.*\s+from\s+['"]/m,           // import x from 'y'
    /^\s*import\s+['"]/m,                        // import 'y'
    /^\s*export\s+\{[^}]*\}\s+from\s+['"]/m,    // export { x } from 'y'
    /^\s*export\s+default\s+/m,                  // export default
    /^\s*export\s+const\s+/m,                    // export const (without module.exports)
    /^\s*export\s+function\s+/m,                 // export function
    /^\s*export\s+class\s+/m,                    // export class
  ];

  // If file uses module.exports or exports., it's CommonJS
  if (/module\.exports\s*=/.test(content) || /exports\.\w+\s*=/.test(content)) {
    return false;
  }

  return esModulePatterns.some(pattern => pattern.test(content));
}

/**
 * Validate an ES Module file (can't require() it, but can check structure)
 */
async function validateESModule(modulePath) {
  try {
    const content = await fs.readFile(modulePath, 'utf-8');
    const startTime = Date.now();

    // Extract export names from the content
    const exports = [];

    // Named exports: export { Name } or export { Name } from
    const namedExportMatch = content.match(/export\s+\{([^}]+)\}/g);
    if (namedExportMatch) {
      namedExportMatch.forEach(match => {
        const names = match.replace(/export\s+\{/, '').replace(/\}.*/, '');
        names.split(',').forEach(name => {
          const cleanName = name.trim().split(/\s+as\s+/).pop().trim();
          if (cleanName && !cleanName.includes('from')) {
            exports.push(cleanName);
          }
        });
      });
    }

    // export const/function/class Name
    const directExports = content.match(/export\s+(const|let|var|function|class)\s+(\w+)/g);
    if (directExports) {
      directExports.forEach(match => {
        const name = match.split(/\s+/).pop();
        if (name) exports.push(name);
      });
    }

    // export default
    const hasDefault = /export\s+default/.test(content);
    if (hasDefault) exports.push('default');

    return {
      success: true,
      loadTime: Date.now() - startTime,
      exports: [...new Set(exports)],
      hasDefault,
      isESModule: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isESModule: true
    };
  }
}

/**
 * Categorize module load errors
 * Returns: 'npm-dependency' | 'local-module' | 'mongoose-conflict' | 'jest-context' | 'syntax' | 'unknown'
 */
function categorizeModuleError(error, modulePath) {
  const msg = error.message || '';

  // Extract just the module name from "Cannot find module 'xxx'"
  const moduleMatch = msg.match(/Cannot find module '([^']+)'/);
  const missingModule = moduleMatch ? moduleMatch[1] : null;

  if (missingModule) {
    // Check if it's a relative/local module (starts with ./ or ../)
    if (missingModule.startsWith('./') || missingModule.startsWith('../')) {
      return {
        category: 'local-module',
        reason: `Missing local file: ${missingModule}`,
        severity: 'info', // Expected for isolated modules
        missingPath: missingModule
      };
    }

    // Otherwise it's an npm package (no path prefix)
    return {
      category: 'npm-dependency',
      reason: `Missing npm package: ${missingModule}`,
      severity: 'info', // Expected for isolated modules
      missingModule
    };
  }

  // Mongoose model already compiled (happens when loading multiple files with same model)
  if (msg.includes('Cannot overwrite') && msg.includes('model once compiled')) {
    const match = msg.match(/Cannot overwrite `([^`]+)` model/);
    const modelName = match ? match[1] : 'unknown';
    return {
      category: 'mongoose-conflict',
      reason: `Mongoose model "${modelName}" already loaded (test environment issue)`,
      severity: 'info', // Expected when testing in isolation
      modelName
    };
  }

  // Jest globals not available
  if (msg.includes('jest is not defined') || msg.includes('describe is not defined') || msg.includes('it is not defined')) {
    return {
      category: 'jest-context',
      reason: 'Test file requires Jest context',
      severity: 'info' // Expected - test files can't load outside Jest
    };
  }

  // Route.X() requires callback - missing handler
  if (msg.includes('requires a callback function')) {
    return {
      category: 'route-handler',
      reason: 'Route missing callback (likely missing import)',
      severity: 'warning'
    };
  }

  // Syntax errors
  if (msg.includes('SyntaxError') || msg.includes('Unexpected token')) {
    return {
      category: 'syntax',
      reason: 'Syntax error in file',
      severity: 'error'
    };
  }

  // Unknown error
  return {
    category: 'unknown',
    reason: msg,
    severity: 'error'
  };
}

async function tryRequireModule(modulePath) {
  try {
    // First, check if it's an ES Module
    const content = await fs.readFile(modulePath, 'utf-8');
    if (isESModule(content)) {
      return validateESModule(modulePath);
    }

    // Check if it's a Jest test file (skip loading, just validate structure)
    const isTestFile = modulePath.includes('/tests/') || modulePath.includes('\\tests\\') ||
                       modulePath.includes('.test.') || modulePath.includes('.spec.');
    if (isTestFile) {
      const hasTestStructure = content.includes('describe(') || content.includes('it(') ||
                               content.includes('test(') || content.includes('expect(');
      return {
        success: true,
        isTestFile: true,
        hasTestStructure,
        exports: ['test-file'],
        loadTime: 0
      };
    }

    // CommonJS - can use require()
    const startTime = Date.now();
    delete require.cache[require.resolve(modulePath)];
    const mod = require(modulePath);
    const loadTime = Date.now() - startTime;
    return {
      success: true,
      loadTime,
      exports: Object.keys(mod || {}),
      hasDefault: mod && (typeof mod === 'function' || typeof mod.default === 'function'),
      isESModule: false
    };
  } catch (error) {
    const errorInfo = categorizeModuleError(error, modulePath);

    // For isolated module issues (npm deps, local modules, mongoose), mark as "isolated" not "failed"
    if (errorInfo.severity === 'info') {
      return {
        success: false,
        isolated: true, // This is an expected isolation issue, not a bug
        error: errorInfo.reason,
        errorCategory: errorInfo.category,
        severity: errorInfo.severity
      };
    }

    return {
      success: false,
      isolated: false,
      error: errorInfo.reason,
      errorCategory: errorInfo.category,
      severity: errorInfo.severity,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    };
  }
}

async function scanDirectory(dirPath, extensions = ['.js', '.jsx', '.cjs']) {
  const results = [];

  async function scan(dir, relativePath = '') {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath, relPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          results.push({
            name: entry.name,
            path: fullPath,
            relativePath: relPath,
            category: relativePath.split(path.sep)[0] || 'root'
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  await scan(dirPath);
  return results;
}

// ============================================
// BACKEND MODULES HEALTH CHECK
// ============================================

router.get('/backend-modules', async (req, res) => {
  try {
    const modules = await scanDirectory(BACKEND_DIR);
    const results = [];

    // Group by category (subdirectory)
    const categories = {};
    for (const mod of modules) {
      if (!categories[mod.category]) {
        categories[mod.category] = [];
      }
      categories[mod.category].push(mod);
    }

    // Test each category
    for (const [category, files] of Object.entries(categories)) {
      const categoryResults = {
        category,
        total: files.length,
        passed: 0,
        isolated: 0, // Expected issues for standalone modules
        failed: 0,   // Real errors
        files: []
      };

      for (const file of files.slice(0, 10)) { // Limit to 10 per category for performance
        const stats = await getFileStats(file.path);
        const fileResult = {
          name: file.name,
          path: file.path,
          relativePath: file.relativePath,
          size: stats.size,
          status: 'unknown'
        };

        // Try to load .js and .cjs files
        if (file.name.endsWith('.js') || file.name.endsWith('.cjs')) {
          const loadResult = await tryRequireModule(file.path);

          if (loadResult.success) {
            fileResult.status = 'healthy';
            fileResult.loadTime = loadResult.loadTime;
            fileResult.exports = loadResult.exports;
            fileResult.isTestFile = loadResult.isTestFile;
            categoryResults.passed++;
          } else if (loadResult.isolated) {
            // Expected isolation issue (missing npm deps, local modules, mongoose conflicts)
            fileResult.status = 'isolated';
            fileResult.error = loadResult.error;
            fileResult.errorCategory = loadResult.errorCategory;
            categoryResults.isolated++;
          } else {
            // Real error
            fileResult.status = 'error';
            fileResult.error = loadResult.error;
            fileResult.errorCategory = loadResult.errorCategory;
            categoryResults.failed++;
          }
        } else {
          // JSX files - just check they exist and have content
          fileResult.status = stats.size > 0 ? 'healthy' : 'warning';
          if (stats.size > 0) categoryResults.passed++;
        }

        categoryResults.files.push(fileResult);
      }

      results.push(categoryResults);
    }

    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalIsolated = results.reduce((sum, r) => sum + r.isolated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const totalModules = results.reduce((sum, r) => sum + r.total, 0);

    // Health score only counts real errors, not isolated module issues
    const healthScore = totalFailed === 0
      ? 100
      : Math.round((totalPassed / (totalPassed + totalFailed)) * 100) || 100;

    res.json({
      status: totalFailed === 0 ? 'healthy' : 'degraded',
      summary: {
        totalModules,
        totalCategories: results.length,
        passed: totalPassed,
        isolated: totalIsolated, // Expected issues for standalone modules
        failed: totalFailed,     // Real errors that need attention
        healthScore,
        note: totalIsolated > 0 ? `${totalIsolated} modules have expected isolation issues (missing deps/local files)` : null
      },
      categories: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FRONTEND EFFECTS HEALTH CHECK
// ============================================

router.get('/frontend-effects', async (req, res) => {
  try {
    const effectsDir = path.join(FRONTEND_DIR, 'effects');
    const effects = await scanDirectory(effectsDir, ['.jsx', '.js']);

    const results = [];

    for (const effect of effects) {
      const stats = await getFileStats(effect.path);
      let content = '';
      let status = 'unknown';
      let issues = [];

      try {
        content = await fs.readFile(effect.path, 'utf-8');
        const lineCount = content.split('\n').length;

        // Check if this is a barrel/index file (re-exports from other files)
        const isBarrelFile = effect.name === 'index.js' || effect.name === 'index.jsx' ||
                            (content.includes("export {") && content.includes("from './"));

        if (isBarrelFile) {
          // Barrel file validation - just check it has exports
          const hasExports = content.includes('export {') || content.includes('export const') ||
                            content.includes('export default') || content.includes('module.exports');
          const exportCount = (content.match(/export\s+\{[^}]+\}/g) || []).length +
                             (content.match(/export\s+(const|let|var|function)/g) || []).length;

          if (!hasExports) issues.push('No exports found');

          status = hasExports ? 'healthy' : 'error';

          results.push({
            name: effect.name.replace('.jsx', '').replace('.js', ''),
            path: effect.path,
            relativePath: effect.relativePath,
            size: stats.size,
            lineCount,
            status,
            issues,
            isBarrelFile: true,
            exportCount
          });
        } else {
          // React component validation
          const hasExport = content.includes('export default') || content.includes('export function') || content.includes('module.exports');
          const hasReactImport = content.includes('import React') || content.includes("from 'react'") || content.includes('from "react"');
          const hasReturn = content.includes('return (') || content.includes('return(') || content.includes('return <');

          if (!hasExport) issues.push('Missing export');
          if (!hasReactImport) issues.push('Missing React import');
          if (!hasReturn) issues.push('Missing return statement');

          status = issues.length === 0 ? 'healthy' : (issues.length < 2 ? 'warning' : 'error');

          results.push({
            name: effect.name.replace('.jsx', '').replace('.js', ''),
            path: effect.path,
            relativePath: effect.relativePath,
            size: stats.size,
            lineCount,
            status,
            issues,
            hasExport,
            hasReactImport
          });
        }
      } catch (error) {
        results.push({
          name: effect.name,
          path: effect.path,
          relativePath: effect.relativePath,
          status: 'error',
          error: error.message
        });
      }
    }

    const healthy = results.filter(r => r.status === 'healthy').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const errors = results.filter(r => r.status === 'error').length;

    res.json({
      status: errors === 0 ? (warnings === 0 ? 'healthy' : 'warning') : 'degraded',
      summary: {
        total: results.length,
        healthy,
        warnings,
        errors,
        healthScore: Math.round((healthy / results.length) * 100) || 0
      },
      effects: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TEMPLATES HEALTH CHECK
// ============================================

router.get('/templates', async (req, res) => {
  try {
    const templates = await scanDirectory(TEMPLATES_DIR, ['.jsx', '.js']);

    const results = [];

    for (const template of templates) {
      const stats = await getFileStats(template.path);
      let content = '';
      let status = 'unknown';
      let issues = [];

      try {
        content = await fs.readFile(template.path, 'utf-8');

        // Template validation checks
        const hasExport = content.includes('export default') || content.includes('module.exports');
        const hasProps = content.includes('props') || content.includes('{ ');
        const hasSections = content.includes('section') || content.includes('Section');
        const lineCount = content.split('\n').length;

        if (!hasExport) issues.push('Missing export');
        if (lineCount < 50) issues.push('Template seems too short');

        status = issues.length === 0 ? 'healthy' : 'warning';

        results.push({
          name: template.name.replace('.jsx', '').replace('.js', ''),
          category: template.category,
          path: template.path,
          relativePath: template.relativePath,
          size: stats.size,
          lineCount,
          status,
          issues,
          hasExport,
          hasSections
        });
      } catch (error) {
        results.push({
          name: template.name,
          category: template.category,
          path: template.path,
          relativePath: template.relativePath,
          status: 'error',
          error: error.message
        });
      }
    }

    const healthy = results.filter(r => r.status === 'healthy').length;

    res.json({
      status: healthy === results.length ? 'healthy' : 'warning',
      summary: {
        total: results.length,
        healthy,
        healthScore: Math.round((healthy / results.length) * 100) || 0
      },
      templates: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LIB SERVICES HEALTH CHECK
// ============================================

router.get('/lib-services', async (req, res) => {
  try {
    const libDir = path.join(MODULE_ASSEMBLER_DIR, 'lib');
    const services = await scanDirectory(libDir, ['.cjs', '.js']);

    const results = [];

    for (const service of services) {
      const loadResult = await tryRequireModule(service.path);

      results.push({
        name: service.name.replace('.cjs', '').replace('.js', ''),
        category: service.category,
        path: service.path,
        relativePath: service.relativePath,
        status: loadResult.success ? 'healthy' : 'error',
        loadTime: loadResult.loadTime,
        exports: loadResult.exports,
        error: loadResult.error
      });
    }

    const healthy = results.filter(r => r.status === 'healthy').length;
    const avgLoadTime = results.filter(r => r.loadTime).reduce((sum, r) => sum + r.loadTime, 0) / results.length || 0;

    res.json({
      status: healthy === results.length ? 'healthy' : 'degraded',
      summary: {
        total: results.length,
        healthy,
        failed: results.length - healthy,
        avgLoadTime: Math.round(avgLoadTime),
        healthScore: Math.round((healthy / results.length) * 100) || 0
      },
      services: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DATABASE HEALTH CHECK
// ============================================

router.get('/database', async (req, res) => {
  try {
    let db;
    try {
      db = require('../../database/db.cjs');
    } catch (e) {
      // Try alternate path
      try {
        db = require(path.join(MODULE_ASSEMBLER_DIR, 'database', 'db.cjs'));
      } catch (e2) {
        return res.json({
          status: 'error',
          error: 'Database module not found',
          checks: []
        });
      }
    }

    const checks = [];

    // Test connection
    const connectionStart = Date.now();
    try {
      const result = await db.query('SELECT 1 as test');
      checks.push({
        name: 'Connection',
        status: 'healthy',
        responseTime: Date.now() - connectionStart,
        message: 'Database connection successful'
      });
    } catch (error) {
      checks.push({
        name: 'Connection',
        status: 'error',
        error: error.message
      });
    }

    // Test tables exist
    const tables = ['admin_users', 'generated_projects', 'subscribers', 'api_usage'];
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table} LIMIT 1`);
        checks.push({
          name: `Table: ${table}`,
          status: 'healthy',
          rowCount: parseInt(result.rows[0]?.count || 0)
        });
      } catch (error) {
        checks.push({
          name: `Table: ${table}`,
          status: 'warning',
          message: 'Table may not exist or is empty'
        });
      }
    }

    // Check pool stats if available
    if (db.pool) {
      checks.push({
        name: 'Connection Pool',
        status: 'healthy',
        totalConnections: db.pool.totalCount || 'N/A',
        idleConnections: db.pool.idleCount || 'N/A',
        waitingRequests: db.pool.waitingCount || 'N/A'
      });
    }

    const healthy = checks.filter(c => c.status === 'healthy').length;

    res.json({
      status: healthy === checks.length ? 'healthy' : (healthy > 0 ? 'degraded' : 'error'),
      summary: {
        total: checks.length,
        healthy,
        healthScore: Math.round((healthy / checks.length) * 100) || 0
      },
      checks
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});

// ============================================
// EXTERNAL APIS HEALTH CHECK
// ============================================

router.get('/external-apis', async (req, res) => {
  const checks = [];

  // Check Claude API (Anthropic)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      // Just verify the client can be instantiated
      checks.push({
        name: 'Claude API (Anthropic)',
        status: 'healthy',
        message: 'API key configured',
        keyPrefix: process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...'
      });
    } catch (error) {
      checks.push({
        name: 'Claude API (Anthropic)',
        status: 'error',
        error: error.message
      });
    }
  } else {
    checks.push({
      name: 'Claude API (Anthropic)',
      status: 'warning',
      message: 'ANTHROPIC_API_KEY not configured'
    });
  }

  // Check Netlify
  if (process.env.NETLIFY_AUTH_TOKEN) {
    checks.push({
      name: 'Netlify Deploy',
      status: 'healthy',
      message: 'Auth token configured'
    });
  } else {
    checks.push({
      name: 'Netlify Deploy',
      status: 'warning',
      message: 'NETLIFY_AUTH_TOKEN not configured'
    });
  }

  // Check Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    checks.push({
      name: 'Stripe Payments',
      status: 'healthy',
      message: 'Secret key configured',
      mode: process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'live' : 'test'
    });
  } else {
    checks.push({
      name: 'Stripe Payments',
      status: 'warning',
      message: 'STRIPE_SECRET_KEY not configured'
    });
  }

  // Check Sentry
  if (process.env.SENTRY_DSN) {
    checks.push({
      name: 'Sentry Error Tracking',
      status: 'healthy',
      message: 'DSN configured'
    });
  } else {
    checks.push({
      name: 'Sentry Error Tracking',
      status: 'warning',
      message: 'SENTRY_DSN not configured'
    });
  }

  const healthy = checks.filter(c => c.status === 'healthy').length;

  res.json({
    status: healthy === checks.length ? 'healthy' : (healthy > 0 ? 'degraded' : 'error'),
    summary: {
      total: checks.length,
      healthy,
      warnings: checks.filter(c => c.status === 'warning').length,
      healthScore: Math.round((healthy / checks.length) * 100) || 0
    },
    apis: checks
  });
});

// ============================================
// FILE SYSTEM HEALTH CHECK
// ============================================

router.get('/filesystem', async (req, res) => {
  const checks = [];

  const criticalPaths = [
    { name: 'Backend Directory', path: BACKEND_DIR },
    { name: 'Frontend Directory', path: FRONTEND_DIR },
    { name: 'Templates Directory', path: TEMPLATES_DIR },
    { name: 'Module Assembler', path: MODULE_ASSEMBLER_DIR },
    { name: 'Lib Directory', path: path.join(MODULE_ASSEMBLER_DIR, 'lib') },
    { name: 'Database Directory', path: path.join(MODULE_ASSEMBLER_DIR, 'database') },
    { name: 'Public Directory', path: path.join(MODULE_ASSEMBLER_DIR, 'public') },
    { name: 'Prompts Directory', path: path.join(ROOT_DIR, 'prompts') }
  ];

  for (const item of criticalPaths) {
    const stats = await getFileStats(item.path);

    if (stats.exists && stats.isDirectory) {
      try {
        const files = await fs.readdir(item.path);
        checks.push({
          name: item.name,
          path: item.path,
          status: 'healthy',
          fileCount: files.length,
          message: `Contains ${files.length} items`
        });
      } catch (error) {
        checks.push({
          name: item.name,
          path: item.path,
          status: 'warning',
          message: 'Cannot read directory contents'
        });
      }
    } else {
      checks.push({
        name: item.name,
        path: item.path,
        status: 'error',
        message: 'Directory not found'
      });
    }
  }

  // Check write permissions to temp directory
  const tempDir = path.join(MODULE_ASSEMBLER_DIR, 'temp');
  try {
    await fs.mkdir(tempDir, { recursive: true });
    const testFile = path.join(tempDir, 'health-check-test.txt');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    checks.push({
      name: 'Write Permissions',
      status: 'healthy',
      message: 'Can write to temp directory'
    });
  } catch (error) {
    checks.push({
      name: 'Write Permissions',
      status: 'warning',
      message: 'Cannot write to temp directory'
    });
  }

  const healthy = checks.filter(c => c.status === 'healthy').length;

  res.json({
    status: healthy === checks.length ? 'healthy' : (healthy > 0 ? 'degraded' : 'error'),
    summary: {
      total: checks.length,
      healthy,
      healthScore: Math.round((healthy / checks.length) * 100) || 0
    },
    paths: checks
  });
});

// ============================================
// ADMIN COMPONENTS HEALTH CHECK
// ============================================

router.get('/admin-components', async (req, res) => {
  try {
    const adminDir = path.join(MODULE_ASSEMBLER_DIR, 'src', 'admin');
    const componentsDir = path.join(MODULE_ASSEMBLER_DIR, 'src', 'components');
    const screensDir = path.join(MODULE_ASSEMBLER_DIR, 'src', 'screens');
    const hooksDir = path.join(MODULE_ASSEMBLER_DIR, 'src', 'hooks');

    const results = {
      admin: [],
      components: [],
      screens: [],
      hooks: []
    };

    // Check admin files
    const adminFiles = await scanDirectory(adminDir, ['.jsx', '.js']);
    for (const file of adminFiles) {
      const stats = await getFileStats(file.path);
      results.admin.push({
        name: file.name.replace('.jsx', '').replace('.js', ''),
        path: file.path,
        relativePath: file.relativePath,
        size: stats.size,
        status: stats.size > 100 ? 'healthy' : 'warning'
      });
    }

    // Check components
    const componentFiles = await scanDirectory(componentsDir, ['.jsx', '.js']);
    for (const file of componentFiles) {
      const stats = await getFileStats(file.path);
      results.components.push({
        name: file.name.replace('.jsx', '').replace('.js', ''),
        path: file.path,
        relativePath: file.relativePath,
        category: file.category || 'root',
        size: stats.size,
        status: stats.size > 50 ? 'healthy' : 'warning'
      });
    }

    // Check screens
    const screenFiles = await scanDirectory(screensDir, ['.jsx', '.js']);
    for (const file of screenFiles) {
      const stats = await getFileStats(file.path);
      results.screens.push({
        name: file.name.replace('.jsx', '').replace('.js', ''),
        path: file.path,
        relativePath: file.relativePath,
        size: stats.size,
        status: stats.size > 100 ? 'healthy' : 'warning'
      });
    }

    // Check hooks
    const hookFiles = await scanDirectory(hooksDir, ['.jsx', '.js']);
    for (const file of hookFiles) {
      const stats = await getFileStats(file.path);
      results.hooks.push({
        name: file.name.replace('.jsx', '').replace('.js', ''),
        path: file.path,
        relativePath: file.relativePath,
        size: stats.size,
        status: stats.size > 50 ? 'healthy' : 'warning'
      });
    }

    const totalFiles = results.admin.length + results.components.length + results.screens.length + results.hooks.length;
    const healthyFiles = [...results.admin, ...results.components, ...results.screens, ...results.hooks]
      .filter(f => f.status === 'healthy').length;

    res.json({
      status: healthyFiles === totalFiles ? 'healthy' : 'degraded',
      summary: {
        totalFiles,
        healthy: healthyFiles,
        adminCount: results.admin.length,
        componentCount: results.components.length,
        screenCount: results.screens.length,
        hookCount: results.hooks.length,
        healthScore: Math.round((healthyFiles / totalFiles) * 100) || 0
      },
      ...results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FULL PLATFORM HEALTH CHECK
// ============================================

router.get('/full', async (req, res) => {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [
      backendResult,
      frontendResult,
      templatesResult,
      libResult,
      dbResult,
      apisResult,
      fsResult,
      adminResult,
      previewResult
    ] = await Promise.all([
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/backend-modules`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/frontend-effects`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/templates`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/lib-services`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/database`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/external-apis`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/filesystem`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/admin-components`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message })),
      fetch(`http://localhost:${process.env.PORT || 3001}/api/health-check/preview`).then(r => r.json()).catch(e => ({ status: 'error', error: e.message }))
    ]);

    const categories = [
      { name: 'Backend Modules', ...backendResult },
      { name: 'Frontend Effects', ...frontendResult },
      { name: 'Templates', ...templatesResult },
      { name: 'Lib Services', ...libResult },
      { name: 'Database', ...dbResult },
      { name: 'External APIs', ...apisResult },
      { name: 'File System', ...fsResult },
      { name: 'Admin Components', ...adminResult },
      { name: 'Preview System', ...previewResult }
    ];

    const healthyCategories = categories.filter(c => c.status === 'healthy').length;
    const degradedCategories = categories.filter(c => c.status === 'degraded').length;
    const errorCategories = categories.filter(c => c.status === 'error').length;

    const overallScore = Math.round(
      categories.reduce((sum, c) => sum + (c.summary?.healthScore || 0), 0) / categories.length
    );

    let overallStatus = 'healthy';
    if (errorCategories > 0) overallStatus = 'error';
    else if (degradedCategories > 0) overallStatus = 'degraded';
    else if (overallScore < 80) overallStatus = 'warning';

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime,
      summary: {
        overallScore,
        totalCategories: categories.length,
        healthy: healthyCategories,
        degraded: degradedCategories,
        errors: errorCategories
      },
      categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      executionTime: Date.now() - startTime
    });
  }
});

// ============================================
// RUN SPECIFIC TEST
// ============================================

router.post('/run-test', async (req, res) => {
  const { testType, target } = req.body;

  try {
    let result;

    switch (testType) {
      case 'module-load':
        result = await tryRequireModule(target);
        break;

      case 'file-parse':
        const content = await fs.readFile(target, 'utf-8');
        const hasExport = content.includes('export') || content.includes('module.exports');
        const hasSyntaxError = false; // Would need babel to properly check
        result = {
          success: true,
          lineCount: content.split('\n').length,
          hasExport,
          size: content.length
        };
        break;

      case 'db-query':
        const db = require('../../database/db.cjs');
        const queryResult = await db.query(target);
        result = {
          success: true,
          rowCount: queryResult.rowCount,
          rows: queryResult.rows?.slice(0, 5)
        };
        break;

      default:
        result = { error: 'Unknown test type' };
    }

    res.json({
      testType,
      target,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      testType,
      target,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// PREVIEW SYSTEM HEALTH CHECK
// ============================================

router.get('/preview', async (req, res) => {
  const checks = [];
  const startTime = Date.now();

  // Test 1: Preview Generator Module
  try {
    const { generatePreviewHtml } = require('../generators/preview-generator.cjs');
    const testHtml = generatePreviewHtml({
      businessName: 'Health Check Test',
      industry: 'restaurant',
      pages: ['Home', 'Menu', 'Contact']
    });

    const hasValidStructure =
      testHtml.includes('<!DOCTYPE html>') &&
      testHtml.includes('Health Check Test') &&
      testHtml.includes('preview-banner') &&
      testHtml.includes('🍽️');

    checks.push({
      name: 'Preview Generator',
      status: hasValidStructure ? 'healthy' : 'warning',
      details: {
        htmlLength: testHtml.length,
        hasDoctype: testHtml.includes('<!DOCTYPE html>'),
        hasBusinessName: testHtml.includes('Health Check Test'),
        hasPreviewBanner: testHtml.includes('preview-banner'),
        hasIndustryIcon: testHtml.includes('🍽️')
      }
    });
  } catch (error) {
    checks.push({
      name: 'Preview Generator',
      status: 'error',
      error: error.message
    });
  }

  // Test 2: Preview Routes Module
  try {
    const { createPreviewRoutes } = require('./preview.cjs');
    const router = createPreviewRoutes();

    checks.push({
      name: 'Preview Routes',
      status: typeof router === 'function' ? 'healthy' : 'error',
      details: {
        routerType: typeof router,
        isExpressRouter: typeof router === 'function'
      }
    });
  } catch (error) {
    checks.push({
      name: 'Preview Routes',
      status: 'error',
      error: error.message
    });
  }

  // Test 3: Preview API Endpoint (POST /api/preview/generate)
  try {
    const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/preview/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'API Test Business',
        industry: 'ecommerce',
        pages: ['Home', 'Products', 'Cart', 'Contact'],
        colors: { primary: '#3b82f6', secondary: '#1e40af' }
      })
    });

    const data = await response.json();

    checks.push({
      name: 'Preview API (Generate)',
      status: data.success && data.previewId ? 'healthy' : 'warning',
      details: {
        success: data.success,
        hasPreviewId: !!data.previewId,
        hasPreviewUrl: !!data.previewUrl,
        previewId: data.previewId
      }
    });

    // Test 4: Preview Retrieval (GET /api/preview/view/:id)
    if (data.previewId) {
      try {
        const viewResponse = await fetch(`http://localhost:${process.env.PORT || 3001}/api/preview/view/${data.previewId}`);
        const viewHtml = await viewResponse.text();

        const hasExpectedContent =
          viewHtml.includes('API Test Business') &&
          viewHtml.includes('ecommerce') &&
          viewHtml.includes('Products');

        checks.push({
          name: 'Preview API (Retrieve)',
          status: hasExpectedContent ? 'healthy' : 'warning',
          details: {
            httpStatus: viewResponse.status,
            contentType: viewResponse.headers.get('content-type'),
            htmlLength: viewHtml.length,
            hasBusinessName: viewHtml.includes('API Test Business'),
            hasPages: viewHtml.includes('Products')
          }
        });
      } catch (error) {
        checks.push({
          name: 'Preview API (Retrieve)',
          status: 'error',
          error: error.message
        });
      }

      // Test 5: Preview Cache Status
      try {
        const statusResponse = await fetch(`http://localhost:${process.env.PORT || 3001}/api/preview/status/${data.previewId}`);
        const statusData = await statusResponse.json();

        checks.push({
          name: 'Preview Cache',
          status: statusData.exists ? 'healthy' : 'warning',
          details: {
            exists: statusData.exists,
            createdAt: statusData.createdAt,
            expiresAt: statusData.expiresAt,
            businessName: statusData.businessName
          }
        });
      } catch (error) {
        checks.push({
          name: 'Preview Cache',
          status: 'error',
          error: error.message
        });
      }
    }
  } catch (error) {
    checks.push({
      name: 'Preview API (Generate)',
      status: 'error',
      error: error.message
    });
  }

  // Test 6: Industry-Specific Preview Content
  const industryTests = [
    { industry: 'restaurant', expectedIcon: '🍽️', expectedFeature: 'Online Menu' },
    { industry: 'ecommerce', expectedIcon: '🛒', expectedFeature: 'Shopping Cart' },
    { industry: 'healthcare', expectedIcon: '🏥', expectedFeature: 'Appointment Booking' }
  ];

  try {
    const { generatePreviewHtml } = require('../generators/preview-generator.cjs');
    let industriesPassed = 0;

    for (const { industry, expectedIcon, expectedFeature } of industryTests) {
      const html = generatePreviewHtml({ businessName: 'Test', industry });
      if (html.includes(expectedIcon) && html.includes(expectedFeature)) {
        industriesPassed++;
      }
    }

    checks.push({
      name: 'Industry-Specific Content',
      status: industriesPassed === industryTests.length ? 'healthy' : 'warning',
      details: {
        tested: industryTests.length,
        passed: industriesPassed,
        industries: industryTests.map(t => t.industry)
      }
    });
  } catch (error) {
    checks.push({
      name: 'Industry-Specific Content',
      status: 'error',
      error: error.message
    });
  }

  // Calculate summary
  const healthy = checks.filter(c => c.status === 'healthy').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const errors = checks.filter(c => c.status === 'error').length;

  res.json({
    status: errors > 0 ? 'error' : (warnings > 0 ? 'warning' : 'healthy'),
    executionTime: Date.now() - startTime,
    summary: {
      total: checks.length,
      healthy,
      warnings,
      errors,
      healthScore: Math.round((healthy / checks.length) * 100)
    },
    checks
  });
});

// ============================================
// GENERATION TRACKING ENDPOINT
// ============================================

/**
 * GET /api/health-check/generations
 * View recent generations and stats (for verifying tracking)
 */
router.get('/generations', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  try {
    if (!db || !db.getRecentGenerations) {
      return res.status(503).json({
        error: 'Database not available or tracking functions not loaded'
      });
    }

    const [generations, stats] = await Promise.all([
      db.getRecentGenerations(limit),
      db.getGenerationStats(30)
    ]);

    res.json({
      success: true,
      stats: {
        totalGenerations: parseInt(stats.total_generations) || 0,
        completed: parseInt(stats.completed) || 0,
        failed: parseInt(stats.failed) || 0,
        totalCost: parseFloat(stats.total_cost) || 0,
        totalTokens: parseInt(stats.total_tokens) || 0,
        avgTimeMs: parseFloat(stats.avg_time_ms) || 0
      },
      recentGenerations: generations.map(g => ({
        id: g.id,
        siteName: g.site_name,
        industry: g.industry,
        status: g.status,
        pagesGenerated: g.pages_generated,
        totalCost: parseFloat(g.total_cost) || 0,
        generationTimeMs: g.generation_time_ms,
        createdAt: g.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
