/**
 * Browser Test API Routes
 *
 * Endpoints for browser-based testing of deployed Blink projects.
 * Supports both ClawdBot (Telegram) and Claude --chrome (CLI).
 *
 * The test manifest is browser-agnostic - same format works for both tools.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { TestManifestGenerator } = require('../services/test-manifest-generator.cjs');

const PROSPECTS_DIR = path.join(__dirname, '../../output/prospects');
const PROJECTS_DIR = path.join(__dirname, '../../output/generated-projects');

/**
 * Helper to find project directory
 */
function findProjectDir(folder, source = 'prospects') {
  const baseDir = source === 'prospects' ? PROSPECTS_DIR : PROJECTS_DIR;

  // Try different possible structures
  const possibilities = [
    path.join(baseDir, folder, 'full-test'),
    path.join(baseDir, folder, 'test'),
    path.join(baseDir, folder)
  ];

  for (const dir of possibilities) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'frontend'))) {
      return dir;
    }
  }

  // Return best guess
  return path.join(baseDir, folder, 'full-test');
}

/**
 * POST /api/browser-test/generate-manifest
 * Generate test manifest for a project
 */
router.post('/generate-manifest', (req, res) => {
  const { projectPath, deployedUrl, folder, source = 'prospects' } = req.body;

  // Allow either direct path or folder name
  const resolvedPath = projectPath || findProjectDir(folder, source);

  if (!resolvedPath || !deployedUrl) {
    return res.status(400).json({
      error: 'projectPath (or folder) and deployedUrl required',
      example: {
        folder: 'marios-pizza',
        deployedUrl: 'https://marios-pizza.be1st.io',
        source: 'prospects'
      }
    });
  }

  try {
    const generator = new TestManifestGenerator(resolvedPath);
    const result = generator.generate(deployedUrl);

    console.log(`\n📋 Test manifest generated for: ${deployedUrl}`);
    console.log(`   Manifest: ${result.outputPath}`);
    console.log(`   Instructions: ${result.instructionsPath}`);

    res.json({
      success: true,
      manifestPath: result.outputPath,
      instructionsPath: result.instructionsPath,
      manifest: result.manifest,
      usage: {
        clawdbot: `GET /api/browser-test/clawdbot-message/${folder || path.basename(resolvedPath)}`,
        claudeChrome: `claude --chrome "Run tests from ${result.instructionsPath}"`
      }
    });
  } catch (err) {
    console.error('Failed to generate test manifest:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/browser-test/instructions/:folder
 * Get test instructions (markdown) for ClawdBot/Claude
 */
router.get('/instructions/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;

  const projectDir = findProjectDir(folder, source);
  const instructionsPath = path.join(projectDir, 'test-instructions.md');

  if (!fs.existsSync(instructionsPath)) {
    return res.status(404).json({
      error: 'Test instructions not found',
      hint: 'Generate manifest first: POST /api/browser-test/generate-manifest',
      checkedPath: instructionsPath
    });
  }

  const instructions = fs.readFileSync(instructionsPath, 'utf-8');

  // Return based on Accept header
  if (req.accepts('text/markdown')) {
    res.type('text/markdown').send(instructions);
  } else {
    res.json({
      folder,
      instructionsPath,
      content: instructions
    });
  }
});

/**
 * POST /api/browser-test/results/:folder
 * Receive test results from ClawdBot or Claude --chrome
 */
router.post('/results/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;
  const results = req.body;

  const projectDir = findProjectDir(folder, source);
  const baseDir = source === 'prospects' ? PROSPECTS_DIR : PROJECTS_DIR;

  // Validate results structure
  if (!results.testedAt && !results.results) {
    return res.status(400).json({
      error: 'Invalid results format',
      expectedFormat: {
        testedAt: 'ISO timestamp',
        testedBy: 'ClawdBot or Claude --chrome',
        url: 'https://...',
        results: {
          navigation: { passed: 0, failed: 0, issues: [] },
          forms: { passed: 0, failed: 0, issues: [] },
          responsive: { passed: 0, failed: 0, issues: [] }
        },
        consoleErrors: [],
        recommendations: [],
        overallStatus: 'PASS or FAIL'
      }
    });
  }

  // Add timestamp if missing
  if (!results.testedAt) {
    results.testedAt = new Date().toISOString();
  }

  // Ensure directory exists
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  // Save results
  const resultsPath = path.join(projectDir, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  // Calculate summary
  const summary = {
    passed: 0,
    failed: 0,
    issues: []
  };

  for (const category of ['navigation', 'forms', 'responsive', 'auth', 'api']) {
    if (results.results?.[category]) {
      summary.passed += results.results[category].passed || 0;
      summary.failed += results.results[category].failed || 0;
      if (results.results[category].issues) {
        summary.issues.push(...results.results[category].issues);
      }
    }
  }

  // Update prospect.json if this is a prospect
  const prospectFile = path.join(baseDir, folder, 'prospect.json');
  if (fs.existsSync(prospectFile)) {
    try {
      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      prospect.lastTested = results.testedAt;
      prospect.testResults = summary;
      prospect.testStatus = results.overallStatus || (summary.failed === 0 ? 'PASS' : 'FAIL');
      fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));
    } catch (e) {
      console.warn('Could not update prospect.json:', e.message);
    }
  }

  console.log(`\n🧪 Test results received for: ${folder}`);
  console.log(`   Tested at: ${results.testedAt}`);
  console.log(`   Tested by: ${results.testedBy || 'unknown'}`);
  console.log(`   Passed: ${summary.passed}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Status: ${results.overallStatus || 'N/A'}`);

  if (results.consoleErrors?.length > 0) {
    console.log(`   ⚠️ Console errors: ${results.consoleErrors.length}`);
  }

  if (summary.issues.length > 0) {
    console.log(`   📋 Issues found: ${summary.issues.length}`);
    summary.issues.slice(0, 3).forEach(issue => {
      console.log(`      - ${issue}`);
    });
    if (summary.issues.length > 3) {
      console.log(`      ... and ${summary.issues.length - 3} more`);
    }
  }

  res.json({
    success: true,
    message: 'Test results saved',
    resultsPath,
    summary,
    overallStatus: results.overallStatus || (summary.failed === 0 ? 'PASS' : 'FAIL')
  });
});

/**
 * GET /api/browser-test/results/:folder
 * Get stored test results
 */
router.get('/results/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;

  const projectDir = findProjectDir(folder, source);
  const resultsPath = path.join(projectDir, 'test-results.json');

  if (!fs.existsSync(resultsPath)) {
    return res.status(404).json({
      error: 'No test results found',
      hint: 'Run tests first, then POST results to this endpoint'
    });
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  res.json(results);
});

/**
 * GET /api/browser-test/clawdbot-message/:folder
 * Get a formatted message to send to ClawdBot via Telegram
 */
router.get('/clawdbot-message/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;

  const projectDir = findProjectDir(folder, source);
  const instructionsPath = path.join(projectDir, 'test-instructions.md');

  if (!fs.existsSync(instructionsPath)) {
    return res.status(404).json({
      error: 'Test instructions not found',
      hint: 'Generate manifest first: POST /api/browser-test/generate-manifest'
    });
  }

  const instructions = fs.readFileSync(instructionsPath, 'utf-8');

  // Format for Telegram - add context for ClawdBot
  const telegramMessage = `🧪 BLINK AUTOMATED TEST REQUEST

I need you to test a deployed website and report any issues.

${instructions}

---

IMPORTANT: After completing the tests, please provide your results in the JSON format specified at the end of the instructions. I'll save the results for tracking.

If you find critical bugs, describe them clearly so they can be fixed.`;

  res.json({
    message: telegramMessage,
    characterCount: telegramMessage.length,
    hint: 'Copy this message and send it to ClawdBot on Telegram',
    note: 'For very long instructions, you may need to send in chunks or summarize'
  });
});

/**
 * GET /api/browser-test/status/:folder
 * Get test status summary for a project
 */
router.get('/status/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;

  const baseDir = source === 'prospects' ? PROSPECTS_DIR : PROJECTS_DIR;
  const projectDir = findProjectDir(folder, source);

  const status = {
    folder,
    hasManifest: fs.existsSync(path.join(projectDir, 'test-manifest.json')),
    hasInstructions: fs.existsSync(path.join(projectDir, 'test-instructions.md')),
    hasResults: fs.existsSync(path.join(projectDir, 'test-results.json')),
    lastTested: null,
    testStatus: null,
    summary: null
  };

  // Check prospect.json for test info
  const prospectFile = path.join(baseDir, folder, 'prospect.json');
  if (fs.existsSync(prospectFile)) {
    try {
      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      status.lastTested = prospect.lastTested || null;
      status.testStatus = prospect.testStatus || null;
      status.summary = prospect.testResults || null;
    } catch (e) {}
  }

  // Also check results file directly
  if (status.hasResults) {
    try {
      const results = JSON.parse(fs.readFileSync(path.join(projectDir, 'test-results.json'), 'utf-8'));
      status.lastTested = status.lastTested || results.testedAt;
      status.testStatus = status.testStatus || results.overallStatus;
    } catch (e) {}
  }

  res.json(status);
});

/**
 * DELETE /api/browser-test/results/:folder
 * Clear test results (for re-testing)
 */
router.delete('/results/:folder', (req, res) => {
  const { folder } = req.params;
  const { source = 'prospects' } = req.query;

  const projectDir = findProjectDir(folder, source);
  const resultsPath = path.join(projectDir, 'test-results.json');

  if (fs.existsSync(resultsPath)) {
    fs.unlinkSync(resultsPath);
    console.log(`🗑️ Cleared test results for: ${folder}`);
  }

  res.json({ success: true, message: 'Test results cleared' });
});

module.exports = router;
