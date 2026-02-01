#!/usr/bin/env node
/**
 * Browser Test Runner CLI
 *
 * Runs browser tests on a deployed Blink project using either:
 * - ClawdBot (via Telegram)
 * - Claude --chrome (native CLI integration)
 *
 * Usage:
 *   node scripts/run-browser-test.cjs <folder> [options]
 *
 * Options:
 *   --url <url>       Override the deployed URL to test
 *   --source <type>   Source type: 'prospects' (default) or 'projects'
 *   --generate        Regenerate test manifest before running
 *   --clawdbot        Output formatted message for ClawdBot
 *   --json            Output results as JSON
 *
 * Examples:
 *   node scripts/run-browser-test.cjs marios-pizza
 *   node scripts/run-browser-test.cjs marios-pizza --url https://marios-pizza.be1st.io
 *   node scripts/run-browser-test.cjs marios-pizza --clawdbot
 */

const fs = require('fs');
const path = require('path');
const { TestManifestGenerator } = require('../lib/services/test-manifest-generator.cjs');

const PROSPECTS_DIR = path.join(__dirname, '../output/prospects');
const PROJECTS_DIR = path.join(__dirname, '../output/generated-projects');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    folder: null,
    url: null,
    source: 'prospects',
    generate: false,
    clawdbot: false,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg === '--generate') {
      options.generate = true;
    } else if (arg === '--clawdbot') {
      options.clawdbot = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (!arg.startsWith('--') && !options.folder) {
      options.folder = arg;
    }
  }

  return options;
}

function findProjectDir(folder, source) {
  const baseDir = source === 'prospects' ? PROSPECTS_DIR : PROJECTS_DIR;

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

  return path.join(baseDir, folder, 'full-test');
}

function getDeployedUrl(folder, source) {
  const baseDir = source === 'prospects' ? PROSPECTS_DIR : PROJECTS_DIR;
  const prospectFile = path.join(baseDir, folder, 'prospect.json');

  if (fs.existsSync(prospectFile)) {
    try {
      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      return prospect.deployedUrl || `https://test-${folder}.be1st.io`;
    } catch (e) {}
  }

  return `https://test-${folder}.be1st.io`;
}

function main() {
  const options = parseArgs();

  if (!options.folder) {
    console.log(`
Browser Test Runner - Test deployed Blink projects

Usage:
  node scripts/run-browser-test.cjs <folder> [options]

Options:
  --url <url>       Override the deployed URL to test
  --source <type>   Source type: 'prospects' (default) or 'projects'
  --generate        Regenerate test manifest before running
  --clawdbot        Output formatted message for ClawdBot
  --json            Output results as JSON

Examples:
  node scripts/run-browser-test.cjs marios-pizza
  node scripts/run-browser-test.cjs marios-pizza --generate --url https://marios-pizza.be1st.io
  node scripts/run-browser-test.cjs marios-pizza --clawdbot
    `);
    process.exit(1);
  }

  const projectDir = findProjectDir(options.folder, options.source);
  const deployedUrl = options.url || getDeployedUrl(options.folder, options.source);

  console.log(`\n🧪 Browser Test Runner`);
  console.log(`   Folder: ${options.folder}`);
  console.log(`   Project: ${projectDir}`);
  console.log(`   URL: ${deployedUrl}`);

  // Check if manifest exists or if we need to generate
  const manifestPath = path.join(projectDir, 'test-manifest.json');
  const instructionsPath = path.join(projectDir, 'test-instructions.md');

  if (!fs.existsSync(manifestPath) || options.generate) {
    console.log(`\n📋 Generating test manifest...`);
    try {
      const generator = new TestManifestGenerator(projectDir);
      const result = generator.generate(deployedUrl);
      console.log(`   ✅ Manifest: ${result.outputPath}`);
      console.log(`   ✅ Instructions: ${result.instructionsPath}`);
    } catch (err) {
      console.error(`   ❌ Failed to generate manifest: ${err.message}`);
      process.exit(1);
    }
  }

  // Output based on mode
  if (options.clawdbot) {
    console.log(`\n📱 ClawdBot Message:`);
    console.log('─'.repeat(60));

    const instructions = fs.readFileSync(instructionsPath, 'utf-8');
    const telegramMessage = `🧪 BLINK AUTOMATED TEST REQUEST

I need you to test a deployed website and report any issues.

${instructions}

---

IMPORTANT: After completing the tests, please provide your results in the JSON format specified at the end of the instructions.`;

    console.log(telegramMessage);
    console.log('─'.repeat(60));
    console.log(`\n📋 Character count: ${telegramMessage.length}`);
    console.log('📝 Copy the message above and send to ClawdBot on Telegram\n');
  } else if (options.json) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(JSON.stringify(manifest, null, 2));
  } else {
    // Default: show instructions for Claude --chrome
    console.log(`\n📋 Test Instructions:`);
    console.log('─'.repeat(60));

    const instructions = fs.readFileSync(instructionsPath, 'utf-8');
    console.log(instructions);

    console.log('─'.repeat(60));
    console.log(`\n🚀 To run with Claude --chrome:`);
    console.log(`   claude --chrome "Run the tests from ${instructionsPath}"`);
    console.log(`\n📱 To run with ClawdBot:`);
    console.log(`   node scripts/run-browser-test.cjs ${options.folder} --clawdbot`);
    console.log(`\n📤 To submit results:`);
    console.log(`   POST http://localhost:4200/api/browser-test/results/${options.folder}`);
    console.log('');
  }
}

main();
