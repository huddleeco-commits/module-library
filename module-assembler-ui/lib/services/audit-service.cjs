/**
 * Blink Audit Service
 *
 * Pre-deployment validation system with three audit checkpoints:
 * - AUDIT 1: Post-generation (full build validation)
 * - AUDIT 2: Post-customization (incremental validation)
 * - AUDIT 3: Post-deployment (live site checks)
 *
 * Architecture designed to support future preview and customization features.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Error pattern database for classification and auto-fix
const ERROR_PATTERNS = {
  // Import/Module errors
  IMPORT_NOT_FOUND: {
    pattern: /Could not resolve ["']([^"']+)["']/i,
    severity: 'error',
    autoFixable: true,
    category: 'import',
    getSuggestion: (match) => `Module "${match[1]}" not found. Check import path or install package.`
  },
  IMPORT_PATH_MISMATCH: {
    pattern: /from ['"]\.\.\/modules\//,
    severity: 'error',
    autoFixable: true,
    category: 'import',
    fix: (code) => code.replace(/from ['"]\.\.\/modules\//g, "from '../components/")
  },

  // Syntax errors
  UNTERMINATED_STRING: {
    pattern: /Unterminated string literal/i,
    severity: 'error',
    autoFixable: false,
    category: 'syntax'
  },
  UNEXPECTED_TOKEN: {
    pattern: /Unexpected token/i,
    severity: 'error',
    autoFixable: false,
    category: 'syntax'
  },

  // JSX errors
  JSX_UNCLOSED: {
    pattern: /Expected corresponding JSX closing tag for <(\w+)>/i,
    severity: 'error',
    autoFixable: false,
    category: 'jsx'
  },
  JSX_INVALID_CHILD: {
    pattern: /JSX element '(\w+)' has no corresponding closing tag/i,
    severity: 'error',
    autoFixable: false,
    category: 'jsx'
  },

  // React/Hook errors
  MISSING_PROVIDER: {
    pattern: /useCart must be used within|useContext.*null/i,
    severity: 'error',
    autoFixable: true,
    category: 'react',
    getSuggestion: () => 'Component using context is not wrapped in required Provider.'
  },
  INVALID_HOOK_CALL: {
    pattern: /Invalid hook call/i,
    severity: 'error',
    autoFixable: false,
    category: 'react'
  },

  // Icon errors (Lucide)
  INVALID_ICON: {
    pattern: /export '(\w+)' was not found in 'lucide-react'/i,
    severity: 'error',
    autoFixable: true,
    category: 'icon'
  },

  // CSS/Style errors
  INVALID_CSS_VALUE: {
    pattern: /Invalid CSS value/i,
    severity: 'warning',
    autoFixable: false,
    category: 'style'
  }
};

// Build output cache for incremental validation
const buildCache = new Map();

/**
 * Fix nested font quotes in all JSX files
 * AI often generates: heading: "'Playfair Display', Georgia, serif"
 * Should be:          heading: "Playfair Display, Georgia, serif"
 *
 * This runs BEFORE the build to proactively fix known issues.
 */
function fixNestedFontQuotes(frontendPath) {
  const srcPath = path.join(frontendPath, 'src');
  if (!fs.existsSync(srcPath)) return { fixed: 0, files: [] };

  const files = getAllFiles(srcPath, ['.jsx', '.js', '.tsx', '.ts']);
  let totalFixed = 0;
  const fixedFiles = [];

  // Patterns to fix (same as in validateGeneratedCode)
  const patterns = [
    // fontFamily: "'Font'" -> fontFamily: "Font"
    { regex: /fontFamily:\s*["']'([^']+)'["']/g, replacement: 'fontFamily: "$1"' },
    // fontFamily: "'Font', fallback" -> fontFamily: "Font, fallback"
    { regex: /fontFamily:\s*["']'([^']+)'([^"']*)["']/g, replacement: 'fontFamily: "$1$2"' },
    // heading: "'Font', fallback" -> heading: "Font, fallback" (THEME objects)
    { regex: /(heading|body|primary|secondary|display|text):\s*["']'([^']+)'([^"']*)["']/g, replacement: '$1: "$2$3"' },
    // Generic: any property with nested font quotes
    { regex: /:\s*["']'([A-Z][a-zA-Z\s]+)'(,\s*[^"']+)?["']/g, replacement: ': "$1$2"' }
  ];

  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf-8');
      let modified = false;

      for (const { regex, replacement } of patterns) {
        // Reset regex lastIndex
        regex.lastIndex = 0;
        if (regex.test(content)) {
          regex.lastIndex = 0;
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(file, content);
        totalFixed++;
        fixedFiles.push(path.relative(frontendPath, file));
      }
    } catch (e) {
      console.warn(`   ⚠️ Font fix failed for ${file}: ${e.message}`);
    }
  }

  return { fixed: totalFixed, files: fixedFiles };
}

/**
 * Calculate hash of relevant files for change detection
 */
function calculateProjectHash(projectPath, targetDirs = ['src']) {
  const hashes = [];

  for (const dir of targetDirs) {
    const fullPath = path.join(projectPath, dir);
    if (fs.existsSync(fullPath)) {
      const files = getAllFiles(fullPath, ['.jsx', '.js', '.tsx', '.ts', '.css']);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        hashes.push(crypto.createHash('md5').update(content).digest('hex'));
      }
    }
  }

  return crypto.createHash('md5').update(hashes.join('')).digest('hex');
}

/**
 * Get all files with specified extensions recursively
 */
function getAllFiles(dir, extensions) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse Vite/esbuild error output into structured format
 */
function parseViteBuildErrors(stderr) {
  const errors = [];
  const warnings = [];

  // Split into lines and process
  const lines = stderr.split('\n');
  let currentError = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check against known patterns
    for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
      const match = line.match(config.pattern);
      if (match) {
        const error = {
          type: errorType,
          category: config.category,
          severity: config.severity,
          message: line.trim(),
          autoFixable: config.autoFixable,
          rawMatch: match,
          suggestion: config.getSuggestion ? config.getSuggestion(match) : null
        };

        // Try to extract file and line info
        const fileMatch = line.match(/(?:in|at|from)\s+([^\s:]+):(\d+)(?::(\d+))?/);
        if (fileMatch) {
          error.file = fileMatch[1];
          error.line = parseInt(fileMatch[2]);
          error.column = fileMatch[3] ? parseInt(fileMatch[3]) : null;
        }

        if (config.severity === 'error') {
          errors.push(error);
        } else {
          warnings.push(error);
        }
        break;
      }
    }

    // Generic error extraction for unmatched patterns
    if (line.includes('error') || line.includes('Error')) {
      const existingError = errors.find(e => e.message === line.trim());
      if (!existingError && line.trim().length > 10) {
        errors.push({
          type: 'UNKNOWN',
          category: 'unknown',
          severity: 'error',
          message: line.trim(),
          autoFixable: false
        });
      }
    }
  }

  return { errors, warnings };
}

/**
 * Run npm install if needed
 */
async function ensureDependencies(projectPath, options = {}) {
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return { success: false, error: 'No package.json found' };
  }

  // Check if node_modules exists and is recent
  if (fs.existsSync(nodeModulesPath)) {
    const stat = fs.statSync(nodeModulesPath);
    const ageMs = Date.now() - stat.mtimeMs;
    const maxAgeMs = options.maxCacheAge || 24 * 60 * 60 * 1000; // 24 hours default

    if (ageMs < maxAgeMs) {
      console.log('   📦 Using cached node_modules');
      return { success: true, cached: true };
    }
  }

  console.log('   📦 Installing dependencies...');
  const startTime = Date.now();

  try {
    execSync('npm install --legacy-peer-deps', {
      cwd: projectPath,
      stdio: 'pipe',
      timeout: 120000 // 2 min timeout
    });

    return {
      success: true,
      cached: false,
      durationMs: Date.now() - startTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString() || ''
    };
  }
}

/**
 * Run Vite build and capture output
 */
async function runViteBuild(projectPath, options = {}) {
  const startTime = Date.now();
  const timeout = options.timeout || 120000; // 2 min default

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: projectPath,
      shell: true,
      stdio: 'pipe'
    });

    const timeoutId = setTimeout(() => {
      buildProcess.kill('SIGTERM');
      resolve({
        success: false,
        error: 'Build timeout',
        durationMs: Date.now() - startTime,
        stdout,
        stderr
      });
    }, timeout);

    buildProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    buildProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        success: code === 0,
        exitCode: code,
        durationMs: Date.now() - startTime,
        stdout,
        stderr
      });
    });

    buildProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        error: error.message,
        durationMs: Date.now() - startTime,
        stdout,
        stderr
      });
    });
  });
}

/**
 * AUDIT 1: Post-Generation Full Build Validation
 *
 * Runs after AI generates code, before marking as "completed"
 * - Full npm install (or use cache)
 * - Full vite build
 * - Parse and classify errors
 * - Attempt auto-fixes
 * - Retry build if fixes applied
 */
async function audit1PostGeneration(projectPath, options = {}) {
  const frontendPath = path.join(projectPath, 'frontend');
  const maxRetries = options.maxRetries || 2;
  const auditResult = {
    auditType: 'audit1',
    success: false,
    durationMs: 0,
    errors: [],
    warnings: [],
    autoFixesApplied: [],
    buildLog: '',
    retryCount: 0
  };

  const startTime = Date.now();
  console.log('\n   ═══════════════════════════════════════════════════');
  console.log('   🔍 AUDIT 1: Post-Generation Build Validation');
  console.log('   ═══════════════════════════════════════════════════');

  // Check frontend exists
  if (!fs.existsSync(frontendPath)) {
    auditResult.errors.push({
      type: 'MISSING_FRONTEND',
      message: 'Frontend directory not found',
      severity: 'error'
    });
    auditResult.durationMs = Date.now() - startTime;
    return auditResult;
  }

  // Install dependencies
  console.log('   📦 Step 1: Checking dependencies...');
  const depsResult = await ensureDependencies(frontendPath, options);
  if (!depsResult.success) {
    auditResult.errors.push({
      type: 'DEPENDENCY_ERROR',
      message: depsResult.error,
      severity: 'error'
    });
    auditResult.buildLog = depsResult.stderr || '';
    auditResult.durationMs = Date.now() - startTime;
    return auditResult;
  }

  // Pre-build font fix (proactively fix known AI mistakes)
  console.log('   🔧 Step 1.5: Fixing known font quote issues...');
  const fontFixes = fixNestedFontQuotes(frontendPath);
  if (fontFixes.fixed > 0) {
    console.log(`   ✅ Fixed nested font quotes in ${fontFixes.fixed} file(s)`);
    auditResult.autoFixesApplied.push({
      type: 'NESTED_FONT_QUOTES',
      description: `Fixed nested font quotes in ${fontFixes.fixed} files`,
      files: fontFixes.files
    });
  }

  // Build loop with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    auditResult.retryCount = attempt;
    console.log(`   🔨 Step 2: Running build (attempt ${attempt + 1}/${maxRetries + 1})...`);

    const buildResult = await runViteBuild(frontendPath, options);
    auditResult.buildLog = buildResult.stderr + '\n' + buildResult.stdout;

    if (buildResult.success) {
      console.log('   ✅ Build passed!');
      auditResult.success = true;
      auditResult.durationMs = Date.now() - startTime;

      // Calculate hash for future incremental builds
      const hash = calculateProjectHash(frontendPath);
      buildCache.set(projectPath, { hash, timestamp: Date.now() });

      return auditResult;
    }

    // Parse errors
    const { errors, warnings } = parseViteBuildErrors(buildResult.stderr);
    auditResult.errors = errors;
    auditResult.warnings = warnings;

    console.log(`   ❌ Build failed with ${errors.length} error(s)`);

    // Attempt auto-fixes if not last attempt
    if (attempt < maxRetries) {
      const fixes = await attemptAutoFixes(frontendPath, errors);
      if (fixes.length > 0) {
        console.log(`   🔧 Applied ${fixes.length} auto-fix(es), retrying...`);
        auditResult.autoFixesApplied.push(...fixes);
        continue;
      }
    }

    // No fixes possible or last attempt
    break;
  }

  auditResult.durationMs = Date.now() - startTime;
  console.log(`   ⏱️ Audit completed in ${(auditResult.durationMs / 1000).toFixed(1)}s`);

  return auditResult;
}

/**
 * AUDIT 2: Post-Customization Incremental Validation
 *
 * Runs after user makes changes (logo, colors, text)
 * - Check if files actually changed (hash comparison)
 * - If only CSS changed, skip build
 * - If JSX changed, incremental build
 */
async function audit2PostCustomization(projectPath, options = {}) {
  const frontendPath = path.join(projectPath, 'frontend');
  const auditResult = {
    auditType: 'audit2',
    success: false,
    durationMs: 0,
    errors: [],
    warnings: [],
    skipped: false,
    reason: null,
    buildLog: ''
  };

  const startTime = Date.now();
  console.log('\n   🔍 AUDIT 2: Post-Customization Validation');

  // Check cache for previous build
  const cached = buildCache.get(projectPath);
  if (cached) {
    const currentHash = calculateProjectHash(frontendPath);
    if (currentHash === cached.hash) {
      console.log('   ⏭️ No changes detected, skipping build');
      auditResult.success = true;
      auditResult.skipped = true;
      auditResult.reason = 'no_changes';
      auditResult.durationMs = Date.now() - startTime;
      return auditResult;
    }
  }

  // Check if only CSS changed
  const cssOnlyChanged = await checkCssOnlyChanges(frontendPath, cached);
  if (cssOnlyChanged) {
    console.log('   ⏭️ Only CSS changed, skipping full build');
    auditResult.success = true;
    auditResult.skipped = true;
    auditResult.reason = 'css_only';
    auditResult.durationMs = Date.now() - startTime;

    // Update hash
    const hash = calculateProjectHash(frontendPath);
    buildCache.set(projectPath, { hash, timestamp: Date.now() });

    return auditResult;
  }

  // Run incremental build (same as full build but faster due to Vite cache)
  console.log('   🔨 Running incremental build...');
  const buildResult = await runViteBuild(frontendPath, { timeout: 60000 }); // Shorter timeout

  auditResult.buildLog = buildResult.stderr;
  auditResult.success = buildResult.success;

  if (buildResult.success) {
    const hash = calculateProjectHash(frontendPath);
    buildCache.set(projectPath, { hash, timestamp: Date.now() });
  } else {
    const { errors, warnings } = parseViteBuildErrors(buildResult.stderr);
    auditResult.errors = errors;
    auditResult.warnings = warnings;
  }

  auditResult.durationMs = Date.now() - startTime;
  return auditResult;
}

/**
 * AUDIT 3: Post-Deployment Live Validation
 *
 * Runs after Railway deployment completes
 * - HTTP checks on all URLs
 * - SSL verification
 * - API endpoint checks
 * - Response time measurement
 */
async function audit3PostDeployment(urls, options = {}) {
  const auditResult = {
    auditType: 'audit3',
    success: true,
    durationMs: 0,
    checks: [],
    errors: [],
    warnings: []
  };

  const startTime = Date.now();
  console.log('\n   🔍 AUDIT 3: Post-Deployment Validation');

  const timeout = options.timeout || 10000; // 10s per check
  const retries = options.retries || 3;
  const retryDelay = options.retryDelay || 5000; // 5s between retries

  // Define checks
  const checks = [
    { name: 'Frontend', url: urls.frontend, expectedStatus: 200 },
    { name: 'Admin', url: urls.admin, expectedStatus: 200 },
    { name: 'Backend Health', url: urls.backend ? `${urls.backend}/api/health` : null, expectedStatus: 200 }
  ].filter(c => c.url);

  for (const check of checks) {
    let checkResult = {
      name: check.name,
      url: check.url,
      success: false,
      statusCode: null,
      responseTimeMs: null,
      ssl: null,
      error: null
    };

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const checkStart = Date.now();
        const response = await fetch(check.url, {
          method: 'GET',
          timeout,
          redirect: 'follow'
        });

        checkResult.statusCode = response.status;
        checkResult.responseTimeMs = Date.now() - checkStart;
        checkResult.ssl = check.url.startsWith('https://');
        checkResult.success = response.status === check.expectedStatus;

        if (checkResult.success) {
          console.log(`   ✅ ${check.name}: ${response.status} (${checkResult.responseTimeMs}ms)`);
          break;
        }
      } catch (error) {
        checkResult.error = error.message;
        if (attempt < retries - 1) {
          console.log(`   ⏳ ${check.name}: Retry ${attempt + 1}/${retries}...`);
          await new Promise(r => setTimeout(r, retryDelay));
        }
      }
    }

    auditResult.checks.push(checkResult);

    if (!checkResult.success) {
      auditResult.success = false;
      auditResult.errors.push({
        type: 'HTTP_CHECK_FAILED',
        message: `${check.name} check failed: ${checkResult.error || `Status ${checkResult.statusCode}`}`,
        severity: 'error'
      });
    }
  }

  auditResult.durationMs = Date.now() - startTime;
  return auditResult;
}

/**
 * Check if only CSS files changed (for AUDIT 2 optimization)
 */
async function checkCssOnlyChanges(frontendPath, cached) {
  if (!cached) return false;

  // Get current file hashes
  const jsxFiles = getAllFiles(path.join(frontendPath, 'src'), ['.jsx', '.js', '.tsx', '.ts']);
  const currentJsxHash = jsxFiles.map(f => {
    const content = fs.readFileSync(f, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  }).join('');

  // If we had stored the JSX-only hash, compare
  // For now, this is a placeholder - would need to track JSX hash separately
  return false;
}

/**
 * Attempt to auto-fix known error patterns
 */
async function attemptAutoFixes(frontendPath, errors) {
  const fixes = [];

  for (const error of errors) {
    if (!error.autoFixable) continue;

    const config = ERROR_PATTERNS[error.type];
    if (!config || !config.fix) continue;

    // Find the file to fix
    if (error.file) {
      const filePath = path.isAbsolute(error.file)
        ? error.file
        : path.join(frontendPath, error.file);

      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const fixed = config.fix(content);

          if (fixed !== content) {
            fs.writeFileSync(filePath, fixed);
            fixes.push({
              type: error.type,
              file: error.file,
              description: `Applied ${error.type} fix`
            });
          }
        } catch (e) {
          console.warn(`   ⚠️ Auto-fix failed for ${error.file}: ${e.message}`);
        }
      }
    }
  }

  return fixes;
}

/**
 * Get summary of audit result for display
 */
function getAuditSummary(result) {
  const status = result.success ? '✅ PASSED' : '❌ FAILED';
  const errorCount = result.errors?.length || 0;
  const warningCount = result.warnings?.length || 0;
  const fixCount = result.autoFixesApplied?.length || 0;

  return {
    status,
    success: result.success,
    errorCount,
    warningCount,
    fixCount,
    durationMs: result.durationMs,
    skipped: result.skipped || false,
    topErrors: (result.errors || []).slice(0, 3).map(e => e.message)
  };
}

module.exports = {
  // Main audit functions
  audit1PostGeneration,
  audit2PostCustomization,
  audit3PostDeployment,

  // Utility functions
  parseViteBuildErrors,
  attemptAutoFixes,
  getAuditSummary,
  calculateProjectHash,

  // For testing
  ERROR_PATTERNS,
  runViteBuild,
  ensureDependencies
};
