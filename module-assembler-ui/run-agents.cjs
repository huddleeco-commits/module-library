#!/usr/bin/env node
/**
 * Blink Agent Runner
 *
 * Simple CLI to run agents without modifying any existing code.
 *
 * Usage:
 *   node run-agents.cjs                        # Run continuous tests
 *   node run-agents.cjs --single pizza        # Test single fixture
 *   node run-agents.cjs --batch 5             # Run 5 parallel tests
 *   node run-agents.cjs --list                # List available fixtures
 */

const { MasterAgent, TestRunnerAgent, RalphWiggumAgent, ScoutAgent } = require('./lib/agents/index.cjs');
const path = require('path');
const fs = require('fs');

// Parse command line args
const args = process.argv.slice(2);

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    BLINK AGENT RUNNER                        ║
╚══════════════════════════════════════════════════════════════╝

Usage: node run-agents.cjs [command] [options]

Commands:
  continuous         Run continuous test loop (default)
  single <fixture>   Test a single fixture
  batch              Run a batch of random fixtures
  validate <path>    Run Ralph Wiggum on existing project
  list               List available fixtures
  scout              Find businesses without websites
  import-csv <file>  Import prospects from CSV file
  generate-prospects Generate sites for all prospects
  preview <name>     Start dev server for a prospect

Options:
  -n, --iterations N     Number of iterations (default: unlimited)
  -p, --parallel N       Parallel jobs per batch (default: 2)
  -d, --delay N          Delay between batches in ms (default: 2000)
  -l, --location LOC     Location for scout (e.g., "Dallas, TX")
  -i, --industry IND     Industry to search (e.g., "salon", "restaurant")
  --stop-on-failure      Stop on first failure
  --no-cleanup           Keep generated test projects
  --quiet                Less verbose output
  -h, --help             Show this help

Examples:
  node run-agents.cjs                          # Run forever
  node run-agents.cjs continuous -n 10 -p 3   # 10 batches, 3 parallel
  node run-agents.cjs single pizza-restaurant # Test pizza fixture
  node run-agents.cjs batch -p 5              # Run 5 random tests
  node run-agents.cjs validate ./my-project   # Check existing project
  node run-agents.cjs scout -l "Dallas, TX" -i salon   # Find salons in Dallas
  node run-agents.cjs import-csv prospects.csv        # Import from CSV
  node run-agents.cjs generate-prospects              # Build all prospect sites
  node run-agents.cjs preview joes-barbershop         # View site in browser
`);
}

// Parse options
const options = {
  command: 'continuous',
  iterations: Infinity,
  parallelJobs: 2,
  delayBetweenBatchesMs: 2000,
  stopOnFailure: false,
  cleanupAfter: true,
  verbose: true,
  fixture: null,
  projectPath: null,
  location: null,
  industry: null,
  csvFile: null
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === 'continuous' || arg === 'single' || arg === 'batch' || arg === 'validate' || arg === 'list' || arg === 'scout' || arg === 'import-csv') {
    options.command = arg;
    if (arg === 'single' && args[i + 1] && !args[i + 1].startsWith('-')) {
      options.fixture = args[++i];
    }
    if (arg === 'validate' && args[i + 1] && !args[i + 1].startsWith('-')) {
      options.projectPath = args[++i];
    }
    if (arg === 'import-csv' && args[i + 1] && !args[i + 1].startsWith('-')) {
      options.csvFile = args[++i];
    }
  } else if (arg === '-n' || arg === '--iterations') {
    options.iterations = parseInt(args[++i]) || Infinity;
  } else if (arg === '-p' || arg === '--parallel') {
    options.parallelJobs = parseInt(args[++i]) || 2;
  } else if (arg === '-d' || arg === '--delay') {
    options.delayBetweenBatchesMs = parseInt(args[++i]) || 2000;
  } else if (arg === '-l' || arg === '--location') {
    options.location = args[++i];
  } else if (arg === '-i' || arg === '--industry') {
    options.industry = args[++i];
  } else if (arg === '--stop-on-failure') {
    options.stopOnFailure = true;
  } else if (arg === '--no-cleanup') {
    options.cleanupAfter = false;
  } else if (arg === '--quiet' || arg === '-q') {
    options.verbose = false;
  } else if (arg === '-h' || arg === '--help') {
    printHelp();
    process.exit(0);
  }
}

// Run the appropriate command
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    BLINK AGENT RUNNER                        ║
║                                                              ║
║   🤖 Master Agent ready                                      ║
║   🧒 Ralph Wiggum ready                                      ║
║   🧪 Test Runner ready                                       ║
║   🔍 Scout Agent ready                                       ║
║                                                              ║
║   Command: ${options.command.padEnd(46)}║
╚══════════════════════════════════════════════════════════════╝
`);

  switch (options.command) {
    case 'list': {
      const runner = new TestRunnerAgent({ verbose: options.verbose });
      const fixtures = runner.getAvailableFixtures();

      console.log('\n📋 Available Fixtures:\n');
      fixtures.forEach(f => {
        const status = f.available ? '✅' : '❌';
        console.log(`   ${status} ${f.id.padEnd(20)} ${f.icon || '📦'} ${f.name}`);
      });
      console.log(`\n   Total: ${fixtures.filter(f => f.available).length} available\n`);
      break;
    }

    case 'single': {
      if (!options.fixture) {
        console.error('❌ Please specify a fixture: node run-agents.cjs single <fixture-id>');
        process.exit(1);
      }

      const master = new MasterAgent({ verbose: options.verbose });
      const result = await master.generateProject({
        projectName: `test-${options.fixture}-${Date.now()}`,
        fixtureId: options.fixture,
        testMode: true,
        runBuild: true
      });

      console.log('\n📊 Result:', result.success ? '✅ PASSED' : '❌ FAILED');
      if (result.errors.length > 0) {
        console.log('   Errors:', result.errors.join(', '));
      }
      if (result.warnings.length > 0) {
        console.log('   Warnings:', result.warnings.length);
      }

      process.exit(result.success ? 0 : 1);
      break;
    }

    case 'batch': {
      const runner = new TestRunnerAgent({ verbose: options.verbose });
      const result = await runner.runBatch(null, { count: options.parallelJobs });

      console.log('\n📊 Batch Result:');
      console.log(`   Passed: ${result.passed}/${result.total}`);
      console.log(`   Failed: ${result.failed}/${result.total}`);

      process.exit(result.failed > 0 ? 1 : 0);
      break;
    }

    case 'validate': {
      if (!options.projectPath) {
        console.error('❌ Please specify a project path: node run-agents.cjs validate <path>');
        process.exit(1);
      }

      const ralph = new RalphWiggumAgent({ verbose: options.verbose });
      const projectPath = path.resolve(options.projectPath);

      console.log(`\n🧒 Running Ralph Wiggum checks on: ${projectPath}\n`);

      const results = [];

      // Run all stages
      results.push(await ralph.validate(projectPath, 'post-generation'));
      results.push(await ralph.validate(projectPath, 'post-build'));
      results.push(await ralph.validate(projectPath, 'pre-deploy'));

      const summary = ralph.getSummary();
      console.log('\n📊 Summary:');
      console.log(`   Checks Run: ${summary.checksRun}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Warnings: ${summary.warnings}`);

      process.exit(summary.failed > 0 ? 1 : 0);
      break;
    }

    case 'scout': {
      const scout = new ScoutAgent({ verbose: options.verbose });

      if (!options.location) {
        console.error('❌ Please specify a location: node run-agents.cjs scout -l "Dallas, TX"');
        console.log('\n💡 Tip: Set YELP_API_KEY or GOOGLE_PLACES_API_KEY environment variable');
        console.log('   Or use import-csv for truly zero-cost scouting\n');
        process.exit(1);
      }

      console.log(`\n🔍 Scouting ${options.location} for ${options.industry || 'all'} businesses...\n`);

      const result = await scout.scan({
        location: options.location,
        industry: options.industry,
        limit: 50
      });

      if (result.prospects.length === 0) {
        console.log('No prospects found without websites.');
        if (!process.env.YELP_API_KEY && !process.env.GOOGLE_PLACES_API_KEY) {
          console.log('\n💡 No API keys set. Try:');
          console.log('   export YELP_API_KEY=your_key_here');
          console.log('   Or use import-csv for zero-cost scouting\n');
        }
      } else {
        console.log(`\n🎯 Found ${result.prospects.length} prospects without websites:\n`);

        result.prospects.slice(0, 10).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name}`);
          console.log(`      📍 ${p.address}`);
          console.log(`      🏷️  ${p.fixtureId} fixture`);
          console.log('');
        });

        if (result.prospects.length > 10) {
          console.log(`   ... and ${result.prospects.length - 10} more\n`);
        }

        // Save prospects
        const saved = await scout.saveProspects(result);
        console.log(`\n💾 Saved to: ${saved.scanFile}`);
        console.log(`📁 Created ${saved.prospectFolders.length} prospect folders\n`);
      }

      console.log('📊 Stats:', scout.getStats());
      break;
    }

    case 'import-csv': {
      if (!options.csvFile) {
        console.error('❌ Please specify a CSV file: node run-agents.cjs import-csv prospects.csv');
        console.log('\n📋 CSV format: name,address,phone,category,website');
        console.log('   (leave website column empty for prospects)\n');
        process.exit(1);
      }

      const csvPath = path.resolve(options.csvFile);

      if (!fs.existsSync(csvPath)) {
        console.error(`❌ File not found: ${csvPath}`);
        process.exit(1);
      }

      const scout = new ScoutAgent({ verbose: options.verbose });
      console.log(`\n📥 Importing from: ${csvPath}\n`);

      const result = await scout.importCSV(csvPath);

      if (result.prospects.length === 0) {
        console.log('No prospects without websites found in CSV.');
      } else {
        console.log(`\n🎯 Found ${result.prospects.length} prospects:\n`);

        result.prospects.slice(0, 10).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.name}`);
          console.log(`      📍 ${p.address}`);
          console.log(`      🏷️  ${p.fixtureId} fixture`);
          console.log('');
        });

        // Save prospects
        const saved = await scout.saveProspects(result);
        console.log(`\n💾 Saved to: ${saved.scanFile}`);
        console.log(`📁 Created ${saved.prospectFolders.length} prospect folders`);
        console.log('\n✅ Ready for generation! Run:');
        console.log('   node run-agents.cjs generate-prospects\n');
      }

      console.log('📊 Stats:', scout.getStats());
      break;
    }

    case 'generate-prospects': {
      const prospectsDir = path.join(__dirname, 'output/prospects');

      if (!fs.existsSync(prospectsDir)) {
        console.error('❌ No prospects found. Run scout or import-csv first.');
        process.exit(1);
      }

      // Find all prospect folders
      const folders = fs.readdirSync(prospectsDir).filter(f => {
        const prospectFile = path.join(prospectsDir, f, 'prospect.json');
        return fs.existsSync(prospectFile);
      });

      if (folders.length === 0) {
        console.error('❌ No prospect folders found.');
        process.exit(1);
      }

      console.log(`\n🏗️  Generating sites for ${folders.length} prospects...\n`);

      const master = new MasterAgent({ verbose: options.verbose });
      const results = { success: 0, failed: 0, skipped: 0 };

      for (const folder of folders) {
        const prospectFile = path.join(prospectsDir, folder, 'prospect.json');
        const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

        // Skip if already generated
        if (prospect.generated) {
          console.log(`⏭️  Skipping ${prospect.name} (already generated)`);
          results.skipped++;
          continue;
        }

        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🏗️  Generating: ${prospect.name}`);
        console.log(`${'─'.repeat(60)}`);

        try {
          const result = await master.generateProject({
            projectName: folder,
            fixtureId: prospect.fixtureId,
            testMode: true,
            runBuild: true,
            outputPath: path.join(prospectsDir, folder),
            prospectData: prospect  // Pass business name, address, phone, etc.
          });

          if (result.success) {
            results.success++;

            // Mark as generated
            prospect.generated = true;
            prospect.generatedAt = new Date().toISOString();
            prospect.projectPath = result.projectPath;
            fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

            console.log(`✅ ${prospect.name} - SUCCESS`);
          } else {
            results.failed++;
            console.log(`❌ ${prospect.name} - FAILED: ${result.errors.join(', ')}`);
          }
        } catch (err) {
          results.failed++;
          console.log(`❌ ${prospect.name} - ERROR: ${err.message}`);
        }
      }

      console.log(`\n${'═'.repeat(60)}`);
      console.log('📊 Generation Complete:');
      console.log(`   ✅ Success: ${results.success}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      console.log(`   ⏭️  Skipped: ${results.skipped}`);
      console.log(`${'═'.repeat(60)}`);

      if (results.success > 0) {
        console.log('\n🎉 To preview a site:');
        console.log(`   node run-agents.cjs preview ${folders[0]}\n`);
      }

      process.exit(results.failed > 0 ? 1 : 0);
      break;
    }

    case 'preview': {
      const prospectName = args.find(a => !a.startsWith('-') && a !== 'preview');

      if (!prospectName) {
        // List available prospects
        const prospectsDir = path.join(__dirname, 'output/prospects');
        const folders = fs.existsSync(prospectsDir)
          ? fs.readdirSync(prospectsDir).filter(f => {
              const prospectFile = path.join(prospectsDir, f, 'prospect.json');
              if (!fs.existsSync(prospectFile)) return false;
              const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
              return data.generated;
            })
          : [];

        if (folders.length === 0) {
          console.error('❌ No generated prospects found. Run generate-prospects first.');
        } else {
          console.log('\n📋 Available prospects to preview:\n');
          folders.forEach(f => console.log(`   node run-agents.cjs preview ${f}`));
          console.log('');
        }
        process.exit(1);
      }

      const prospectDir = path.join(__dirname, 'output/prospects', prospectName);
      const frontendDir = path.join(prospectDir, 'frontend');

      if (!fs.existsSync(frontendDir)) {
        console.error(`❌ Frontend not found at: ${frontendDir}`);
        console.error('   Make sure the prospect has been generated.');
        process.exit(1);
      }

      console.log(`\n🚀 Starting preview server for: ${prospectName}`);
      console.log(`   Directory: ${frontendDir}`);
      console.log('\n   Opening in browser at http://localhost:5173\n');
      console.log('   Press Ctrl+C to stop\n');

      // Start vite dev server
      const { spawn } = require('child_process');
      const vite = spawn('npm', ['run', 'dev'], {
        cwd: frontendDir,
        stdio: 'inherit',
        shell: true
      });

      vite.on('error', (err) => {
        console.error('❌ Failed to start dev server:', err.message);
        process.exit(1);
      });

      break;
    }

    case 'continuous':
    default: {
      const runner = new TestRunnerAgent({ verbose: options.verbose });

      // Handle Ctrl+C gracefully
      process.on('SIGINT', () => {
        console.log('\n\n⛔ Stopping...\n');
        runner.printStats();
        runner.printFixtureBreakdown();
        process.exit(0);
      });

      await runner.runContinuousLoop({
        iterations: options.iterations,
        parallelJobs: options.parallelJobs,
        delayBetweenBatchesMs: options.delayBetweenBatchesMs,
        stopOnFailure: options.stopOnFailure,
        cleanupAfter: options.cleanupAfter
      });
      break;
    }
  }
}

main().catch(err => {
  console.error('❌ Agent runner crashed:', err);
  process.exit(1);
});
