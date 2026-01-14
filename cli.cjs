#!/usr/bin/env node

/**
 * BE1st CLI
 *
 * Simple command-line interface for the module library.
 *
 * Usage:
 *   node cli.cjs create --name "MyProject" --industry restaurant
 *   node cli.cjs list industries
 *   node cli.cjs list bundles
 *   node cli.cjs list modules
 *   node cli.cjs validate
 *   node cli.cjs help
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPTS_DIR = path.join(__dirname, 'scripts');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function c(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showBanner() {
  console.log(`
${c('cyan', '╔═══════════════════════════════════════════════════════════════╗')}
${c('cyan', '║')}  ${c('bright', 'BE1st Module Library CLI')}                                    ${c('cyan', '║')}
${c('cyan', '║')}  ${c('dim', 'Build full-stack apps in minutes, not months')}                 ${c('cyan', '║')}
${c('cyan', '╚═══════════════════════════════════════════════════════════════╝')}
`);
}

function showHelp() {
  showBanner();
  console.log(`${c('bright', 'COMMANDS:')}`);
  console.log(`
  ${c('green', 'create')}     Create a new project
             ${c('dim', 'node cli.cjs create --name "MyApp" --industry restaurant')}
             ${c('dim', 'node cli.cjs create --name "MyApp" --bundles core,commerce')}

  ${c('green', 'list')}       List available options
             ${c('dim', 'node cli.cjs list industries')}  - Show all industry presets
             ${c('dim', 'node cli.cjs list bundles')}     - Show all module bundles
             ${c('dim', 'node cli.cjs list modules')}     - Show all available modules

  ${c('green', 'validate')}   Validate all modules in the library
             ${c('dim', 'node cli.cjs validate')}

  ${c('green', 'help')}       Show this help message

${c('bright', 'OPTIONS:')}`);
  console.log(`
  --name       Project name (required for create)
  --industry   Industry preset (e.g., restaurant, healthcare, ecommerce)
  --bundles    Comma-separated bundle names (e.g., core,commerce,social)
  --output     Output directory (default: ../generated-projects)

${c('bright', 'EXAMPLES:')}`);
  console.log(`
  ${c('dim', '# Create a restaurant app')}
  node cli.cjs create --name "TastyBites" --industry restaurant

  ${c('dim', '# Create with specific bundles')}
  node cli.cjs create --name "MyStore" --bundles core,commerce,dashboard

  ${c('dim', '# List all industries')}
  node cli.cjs list industries
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { command: args[0], options: {} };

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      parsed.options[key] = value;
      if (value !== true) i++;
    } else if (!parsed.subcommand) {
      parsed.subcommand = args[i];
    }
  }

  return parsed;
}

function runScript(script, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [path.join(SCRIPTS_DIR, script), ...args], {
      stdio: 'inherit',
      cwd: __dirname
    });

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Script exited with code ${code}`));
    });
  });
}

function listIndustries() {
  const industriesPath = path.join(__dirname, 'prompts', 'industries.json');

  if (!fs.existsSync(industriesPath)) {
    console.log(c('yellow', 'Industries config not found.'));
    return;
  }

  const industries = JSON.parse(fs.readFileSync(industriesPath, 'utf-8'));

  console.log(`\n${c('bright', 'Available Industries:')}\n`);

  for (const [key, value] of Object.entries(industries)) {
    console.log(`  ${c('green', key.padEnd(20))} ${value.name || key}`);
  }

  console.log(`\n${c('dim', `Total: ${Object.keys(industries).length} industries`)}\n`);
}

function listBundles() {
  // Read bundles from assemble-project.cjs (could also be a separate JSON)
  const bundles = {
    core: 'Auth, file upload, header, footer, modals',
    dashboard: 'Admin dashboard, analytics, stats, data tables',
    commerce: 'Stripe payments, inventory, marketplace, checkout',
    social: 'Notifications, chat, social feed, posts',
    collectibles: 'AI scanner, collections, NFC tags, showcase',
    sports: 'Fantasy, betting, leaderboard, pools',
    healthcare: 'Booking, settings panel',
    family: 'Calendar, tasks, meals, kids banking, documents',
    gamification: 'Achievements, portfolio',
    'survey-rewards': 'Full rewards platform with surveys, spins, streaks'
  };

  console.log(`\n${c('bright', 'Available Bundles:')}\n`);

  for (const [key, desc] of Object.entries(bundles)) {
    console.log(`  ${c('green', key.padEnd(18))} ${c('dim', desc)}`);
  }

  console.log(`\n${c('dim', `Total: ${Object.keys(bundles).length} bundles`)}\n`);
}

function listModules() {
  const backendPath = path.join(__dirname, 'backend');
  const frontendPath = path.join(__dirname, 'frontend');

  const backendModules = fs.existsSync(backendPath)
    ? fs.readdirSync(backendPath).filter(f =>
        fs.statSync(path.join(backendPath, f)).isDirectory()
      )
    : [];

  const frontendModules = fs.existsSync(frontendPath)
    ? fs.readdirSync(frontendPath).filter(f =>
        fs.statSync(path.join(frontendPath, f)).isDirectory()
      )
    : [];

  console.log(`\n${c('bright', 'Backend Modules')} (${backendModules.length}):\n`);
  for (const mod of backendModules) {
    console.log(`  ${c('blue', '▪')} ${mod}`);
  }

  console.log(`\n${c('bright', 'Frontend Modules')} (${frontendModules.length}):\n`);
  for (const mod of frontendModules) {
    console.log(`  ${c('magenta', '▪')} ${mod}`);
  }

  console.log(`\n${c('dim', `Total: ${backendModules.length + frontendModules.length} modules`)}\n`);
}

async function createProject(options) {
  if (!options.name) {
    console.error(c('red', 'Error: --name is required'));
    console.log(c('dim', 'Example: node cli.cjs create --name "MyProject" --industry restaurant'));
    process.exit(1);
  }

  const args = ['--name', options.name];

  if (options.industry) {
    args.push('--industry', options.industry);
  } else if (options.bundles) {
    args.push('--bundles', options.bundles);
  }

  console.log(`\n${c('cyan', '🚀 Creating project:')} ${c('bright', options.name)}\n`);

  try {
    await runScript('assemble-project.cjs', args);
  } catch (err) {
    console.error(c('red', 'Failed to create project'));
    process.exit(1);
  }
}

async function main() {
  const { command, subcommand, options } = parseArgs();

  switch (command) {
    case 'create':
      await createProject(options);
      break;

    case 'list':
      showBanner();
      switch (subcommand) {
        case 'industries':
          listIndustries();
          break;
        case 'bundles':
          listBundles();
          break;
        case 'modules':
          listModules();
          break;
        default:
          console.log(c('yellow', 'Usage: node cli.cjs list [industries|bundles|modules]'));
      }
      break;

    case 'validate':
      showBanner();
      console.log(`${c('cyan', '🔍 Validating modules...')}\n`);
      await runScript('validate-modules.cjs');
      break;

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;

    default:
      console.log(c('red', `Unknown command: ${command}`));
      showHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error(c('red', `Error: ${err.message}`));
  process.exit(1);
});
