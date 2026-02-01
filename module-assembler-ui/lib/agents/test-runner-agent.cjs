/**
 * Test Runner Agent
 *
 * Runs continuous test generation loops using fixtures (no AI API costs).
 * Can run multiple projects in parallel to stress test the system and
 * find edge cases.
 *
 * This is ADDITIVE - does not modify existing pipeline.
 * Run separately: node lib/agents/test-runner-agent.cjs
 */

const path = require('path');
const fs = require('fs');
const { RalphWiggumAgent } = require('./ralph-wiggum-agent.cjs');

// Load test fixtures
const FIXTURES_PATH = path.join(__dirname, '../../test-fixtures');

class TestRunnerAgent {
  constructor(options = {}) {
    this.name = 'Test Runner Agent';
    this.ralph = new RalphWiggumAgent({ verbose: options.verbose !== false });
    this.verbose = options.verbose !== false;
    this.outputPath = options.outputPath || path.join(__dirname, '../../output/test-runs');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    // Stats
    this.stats = {
      totalRuns: 0,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: null,
      fixtures: {}
    };
  }

  /**
   * Get available test fixtures
   */
  getAvailableFixtures() {
    try {
      const indexPath = path.join(FIXTURES_PATH, 'index.cjs');
      if (fs.existsSync(indexPath)) {
        const { getAvailableFixtures } = require(indexPath);
        return getAvailableFixtures().filter(f => f.available);
      }
    } catch (e) {
      console.warn('Could not load fixtures index:', e.message);
    }

    // Fallback: scan directory
    const files = fs.readdirSync(FIXTURES_PATH).filter(f => f.endsWith('.json'));
    return files.map(f => ({
      id: f.replace('.json', ''),
      name: f.replace('.json', '').replace(/-/g, ' '),
      file: f,
      available: true
    }));
  }

  /**
   * Pick random fixtures for a batch
   */
  pickRandomFixtures(count) {
    const available = this.getAvailableFixtures();
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Run a single test with a fixture
   */
  async runSingleTest(fixtureId, runId) {
    const testStartTime = Date.now();
    const projectName = `test-${fixtureId}-${runId}`;
    const projectPath = path.join(this.outputPath, projectName);

    console.log(`\n🧪 [Test Runner] Starting test: ${projectName}`);

    try {
      // Load the test-mode generator
      const testModeRoutes = require('../routes/test-mode.cjs');

      // Create a mock request/response to call the generator
      const result = await this.runTestModeGeneration(fixtureId, projectName);

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      // Run Ralph Wiggum checks
      console.log(`\n🧒 [Ralph] Validating ${projectName}...`);

      const genCheck = await this.ralph.validate(projectPath, 'post-generation', {
        fixtureId,
        pages: result.pages || []
      });

      if (!genCheck.success) {
        return {
          success: false,
          fixtureId,
          projectName,
          stage: 'post-generation',
          errors: genCheck.failures,
          warnings: genCheck.warnings,
          durationMs: Date.now() - testStartTime
        };
      }

      // If we got here, run build validation
      const buildCheck = await this.runBuildValidation(projectPath);

      if (buildCheck.success) {
        // Run post-build Ralph check
        const postBuildCheck = await this.ralph.validate(projectPath, 'post-build');

        return {
          success: postBuildCheck.success,
          fixtureId,
          projectName,
          stage: 'post-build',
          errors: postBuildCheck.failures,
          warnings: [...genCheck.warnings, ...postBuildCheck.warnings],
          buildResult: buildCheck,
          durationMs: Date.now() - testStartTime
        };
      }

      return {
        success: false,
        fixtureId,
        projectName,
        stage: 'build',
        errors: buildCheck.errors || ['Build failed'],
        warnings: genCheck.warnings,
        durationMs: Date.now() - testStartTime
      };

    } catch (err) {
      console.error(`❌ [Test Runner] ${projectName} failed:`, err.message);

      return {
        success: false,
        fixtureId,
        projectName,
        stage: 'error',
        errors: [err.message],
        warnings: [],
        durationMs: Date.now() - testStartTime
      };
    }
  }

  /**
   * Run test mode generation (uses existing test-mode infrastructure)
   */
  async runTestModeGeneration(fixtureId, projectName) {
    try {
      // Load fixtures
      const { loadFixture, applyCustomizations } = require('../../test-fixtures/index.cjs');

      // Load the fixture
      const fixture = loadFixture(fixtureId);

      // Apply customizations (use unique name)
      const customized = applyCustomizations(fixture, {
        businessName: `Test ${fixture.business?.name || fixtureId}`
      });

      // Run the generation using the post-assembly service
      const postAssembly = require('../services/post-assembly.cjs');

      const projectPath = path.join(this.outputPath, projectName);

      // Create project structure
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      // Create minimal frontend structure
      const frontendPath = path.join(projectPath, 'frontend');
      const srcPath = path.join(frontendPath, 'src');
      const pagesPath = path.join(srcPath, 'pages');

      fs.mkdirSync(pagesPath, { recursive: true });

      // Copy template files or create minimal ones
      await this.createMinimalProjectStructure(projectPath, customized);

      return {
        success: true,
        projectPath,
        pages: Object.keys(customized.pages || {})
      };

    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Create minimal project structure from fixture
   */
  async createMinimalProjectStructure(projectPath, fixture) {
    const frontendPath = path.join(projectPath, 'frontend');
    const srcPath = path.join(frontendPath, 'src');
    const pagesPath = path.join(srcPath, 'pages');

    // Ensure directories
    fs.mkdirSync(pagesPath, { recursive: true });

    // Create package.json
    const packageJson = {
      name: fixture.business?.name?.toLowerCase().replace(/\s+/g, '-') || 'test-project',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.294.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0'
      }
    };
    fs.writeFileSync(path.join(frontendPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create vite.config.js
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});
`;
    fs.writeFileSync(path.join(frontendPath, 'vite.config.js'), viteConfig);

    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fixture.business?.name || 'Test Site'}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`;
    fs.writeFileSync(path.join(frontendPath, 'index.html'), indexHtml);

    // Create main.jsx
    const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    fs.writeFileSync(path.join(srcPath, 'main.jsx'), mainJsx);

    // Create App.jsx with routes
    const pages = Object.keys(fixture.pages || { home: {} });
    const imports = pages.map(p => {
      const name = p.charAt(0).toUpperCase() + p.slice(1);
      return `import ${name}Page from './pages/${name}Page';`;
    }).join('\n');

    const routes = pages.map(p => {
      const name = p.charAt(0).toUpperCase() + p.slice(1);
      const path = p === 'home' ? '/' : `/${p}`;
      return `        <Route path="${path}" element={<${name}Page />} />`;
    }).join('\n');

    const appJsx = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
${imports}

function App() {
  return (
    <BrowserRouter>
      <Routes>
${routes}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(srcPath, 'App.jsx'), appJsx);

    // Create page files
    for (const pageName of pages) {
      const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      const pageData = fixture.pages?.[pageName] || {};

      const pageJsx = `import React from 'react';

function ${componentName}Page() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>${pageData.title || componentName}</h1>
      <p>${pageData.description || `Welcome to the ${componentName} page.`}</p>
    </div>
  );
}

export default ${componentName}Page;
`;
      fs.writeFileSync(path.join(pagesPath, `${componentName}Page.jsx`), pageJsx);
    }

    // Create brain.json
    const brainJson = {
      businessName: fixture.business?.name || 'Test Business',
      industry: fixture.type || fixture.business?.industry || fixture.industry || 'general',
      generatedAt: new Date().toISOString(),
      testMode: true
    };
    fs.writeFileSync(path.join(projectPath, 'brain.json'), JSON.stringify(brainJson, null, 2));
  }

  /**
   * Run build validation
   */
  async runBuildValidation(projectPath) {
    try {
      const auditService = require('../services/audit-service.cjs');
      const result = await auditService.audit1PostGeneration(projectPath, {
        maxRetries: 1,
        timeout: 60000
      });

      return {
        success: result.success,
        errors: result.errors?.map(e => e.message) || [],
        warnings: result.warnings?.map(w => w.message) || [],
        durationMs: result.durationMs
      };
    } catch (err) {
      return {
        success: false,
        errors: [err.message],
        warnings: []
      };
    }
  }

  /**
   * Run continuous test loop
   */
  async runContinuousLoop(options = {}) {
    const {
      iterations = Infinity,
      parallelJobs = 2,
      delayBetweenBatchesMs = 2000,
      stopOnFailure = false,
      cleanupAfter = true
    } = options;

    this.stats.startTime = Date.now();
    let runId = 0;

    console.log('\n' + '='.repeat(60));
    console.log('🔄 TEST RUNNER AGENT - CONTINUOUS MODE');
    console.log('='.repeat(60));
    console.log(`   Parallel Jobs: ${parallelJobs}`);
    console.log(`   Iterations: ${iterations === Infinity ? 'Unlimited' : iterations}`);
    console.log(`   Available Fixtures: ${this.getAvailableFixtures().length}`);
    console.log('='.repeat(60));

    while (runId < iterations) {
      runId++;
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📦 BATCH #${runId}`);
      console.log(`${'─'.repeat(60)}`);

      // Pick random fixtures
      const batch = this.pickRandomFixtures(parallelJobs);
      console.log(`   Testing: ${batch.map(f => f.id).join(', ')}`);

      // Run in parallel
      const batchPromises = batch.map((fixture, idx) =>
        this.runSingleTest(fixture.id, `${runId}-${idx}`)
      );

      const results = await Promise.allSettled(batchPromises);

      // Process results
      for (const result of results) {
        this.stats.totalRuns++;

        if (result.status === 'fulfilled') {
          const testResult = result.value;

          // Track by fixture
          if (!this.stats.fixtures[testResult.fixtureId]) {
            this.stats.fixtures[testResult.fixtureId] = { passed: 0, failed: 0 };
          }

          if (testResult.success) {
            this.stats.passed++;
            this.stats.fixtures[testResult.fixtureId].passed++;
            console.log(`   ✅ ${testResult.projectName} (${testResult.durationMs}ms)`);
          } else {
            this.stats.failed++;
            this.stats.fixtures[testResult.fixtureId].failed++;
            this.stats.errors.push({
              fixture: testResult.fixtureId,
              stage: testResult.stage,
              errors: testResult.errors
            });
            console.log(`   ❌ ${testResult.projectName}: ${testResult.errors[0]}`);

            if (stopOnFailure) {
              console.log('\n⛔ Stopping on first failure');
              break;
            }
          }

          // Cleanup test project
          if (cleanupAfter && testResult.projectName) {
            const projectPath = path.join(this.outputPath, testResult.projectName);
            if (fs.existsSync(projectPath)) {
              try {
                fs.rmSync(projectPath, { recursive: true, force: true });
              } catch (e) {
                // Ignore cleanup errors
              }
            }
          }
        } else {
          this.stats.failed++;
          this.stats.errors.push({
            fixture: 'unknown',
            stage: 'promise',
            errors: [result.reason?.message || 'Unknown error']
          });
        }
      }

      // Print stats every 5 batches
      if (runId % 5 === 0) {
        this.printStats();
      }

      // Check for stop condition
      if (stopOnFailure && this.stats.failed > 0) {
        break;
      }

      // Delay between batches
      if (runId < iterations) {
        await this.delay(delayBetweenBatchesMs);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST RUN COMPLETE');
    console.log('='.repeat(60));
    this.printStats();
    this.printFixtureBreakdown();

    return this.stats;
  }

  /**
   * Run a single batch (for one-off testing)
   */
  async runBatch(fixtureIds = null, options = {}) {
    const fixtures = fixtureIds
      ? fixtureIds.map(id => ({ id }))
      : this.pickRandomFixtures(options.count || 3);

    console.log(`\n🧪 Running batch test with ${fixtures.length} fixture(s)...`);

    const results = await Promise.allSettled(
      fixtures.map((f, idx) => this.runSingleTest(f.id, `batch-${idx}`))
    );

    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      results: []
    };

    for (const result of results) {
      if (result.status === 'fulfilled') {
        summary.results.push(result.value);
        if (result.value.success) {
          summary.passed++;
        } else {
          summary.failed++;
        }
      } else {
        summary.failed++;
        summary.results.push({
          success: false,
          error: result.reason?.message
        });
      }
    }

    return summary;
  }

  /**
   * Print current stats
   */
  printStats() {
    const elapsed = this.stats.startTime
      ? Math.round((Date.now() - this.stats.startTime) / 1000)
      : 0;

    const successRate = this.stats.totalRuns > 0
      ? Math.round((this.stats.passed / this.stats.totalRuns) * 100)
      : 0;

    console.log(`\n📊 STATS: ${this.stats.passed}/${this.stats.totalRuns} passed (${successRate}%) | Elapsed: ${elapsed}s`);

    // Ralph's summary
    const ralphSummary = this.ralph.getSummary();
    console.log(`🧒 Ralph: ${ralphSummary.passed}/${ralphSummary.checksRun} checks passed | ${ralphSummary.warnings} warnings`);
  }

  /**
   * Print fixture breakdown
   */
  printFixtureBreakdown() {
    console.log('\n📋 FIXTURE BREAKDOWN:');
    console.log('─'.repeat(40));

    const sorted = Object.entries(this.stats.fixtures)
      .sort((a, b) => (b[1].passed + b[1].failed) - (a[1].passed + a[1].failed));

    for (const [fixture, stats] of sorted) {
      const total = stats.passed + stats.failed;
      const rate = total > 0 ? Math.round((stats.passed / total) * 100) : 0;
      const icon = rate === 100 ? '✅' : rate >= 80 ? '⚠️' : '❌';
      console.log(`   ${icon} ${fixture}: ${stats.passed}/${total} (${rate}%)`);
    }

    // List common errors
    if (this.stats.errors.length > 0) {
      console.log('\n❌ COMMON ERRORS:');
      console.log('─'.repeat(40));

      // Group by error message
      const errorCounts = {};
      for (const err of this.stats.errors) {
        const key = err.errors?.[0] || 'Unknown';
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      }

      const sortedErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      for (const [error, count] of sortedErrors) {
        console.log(`   ${count}x: ${error.substring(0, 60)}...`);
      }
    }
  }

  /**
   * Helper: delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    iterations: Infinity,
    parallelJobs: 2,
    delayBetweenBatchesMs: 2000
  };

  // Parse args
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' || args[i] === '-n') {
      options.iterations = parseInt(args[++i]) || Infinity;
    }
    if (args[i] === '--parallel' || args[i] === '-p') {
      options.parallelJobs = parseInt(args[++i]) || 2;
    }
    if (args[i] === '--delay' || args[i] === '-d') {
      options.delayBetweenBatchesMs = parseInt(args[++i]) || 2000;
    }
    if (args[i] === '--stop-on-failure') {
      options.stopOnFailure = true;
    }
    if (args[i] === '--no-cleanup') {
      options.cleanupAfter = false;
    }
    if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Test Runner Agent - Continuous Test Mode

Usage: node test-runner-agent.cjs [options]

Options:
  -n, --iterations N     Number of batches to run (default: unlimited)
  -p, --parallel N       Number of parallel tests per batch (default: 2)
  -d, --delay N          Delay between batches in ms (default: 2000)
  --stop-on-failure      Stop on first failure
  --no-cleanup           Keep generated test projects
  -h, --help             Show this help

Examples:
  node test-runner-agent.cjs                    # Run forever
  node test-runner-agent.cjs -n 10 -p 3        # 10 batches, 3 parallel
  node test-runner-agent.cjs --stop-on-failure  # Stop on first error
`);
      process.exit(0);
    }
  }

  // Run
  const runner = new TestRunnerAgent();
  runner.runContinuousLoop(options)
    .then(stats => {
      console.log('\nFinal stats:', JSON.stringify(stats, null, 2));
      process.exit(stats.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('Runner crashed:', err);
      process.exit(1);
    });
}

module.exports = { TestRunnerAgent };
