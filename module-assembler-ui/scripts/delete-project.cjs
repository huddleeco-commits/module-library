#!/usr/bin/env node

/**
 * Delete Project CLI
 *
 * Safely removes ALL traces of a generated project:
 * - GitHub repos (backend, frontend, admin)
 * - Railway project and all services
 * - Cloudflare DNS records
 * - Local files
 *
 * Usage:
 *   node scripts/delete-project.cjs --name PrimePizza
 *   node scripts/delete-project.cjs --name PrimePizza --force
 *   node scripts/delete-project.cjs --name PrimePizza --dry-run
 *   node scripts/delete-project.cjs --name PrimePizza --local-only
 *   node scripts/delete-project.cjs --name PrimePizza --cloud-only
 */

const readline = require('readline');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { deleteProject, discoverProjectResources, sanitizeName } = require('../lib/services/project-deleter.cjs');

// ============================================
// ARGUMENT PARSING
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    name: null,
    force: false,
    dryRun: false,
    localOnly: false,
    cloudOnly: false,
    skipVerification: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--name' || arg === '-n') {
      options.name = args[++i];
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true;
    } else if (arg === '--local-only') {
      options.localOnly = true;
    } else if (arg === '--cloud-only') {
      options.cloudOnly = true;
    } else if (arg === '--skip-verify') {
      options.skipVerification = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!options.name && !arg.startsWith('-')) {
      // Allow name without --name flag
      options.name = arg;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🗑️  Delete Project CLI
═══════════════════════════════════════════════════

Safely removes ALL traces of a generated project.

USAGE:
  node scripts/delete-project.cjs --name <ProjectName> [options]

OPTIONS:
  --name, -n <name>    Project name to delete (required)
  --force, -f          Skip confirmation prompt
  --dry-run, -d        Show what would be deleted without doing it
  --local-only         Only delete local files
  --cloud-only         Only delete cloud resources (GitHub, Railway, Cloudflare)
  --skip-verify        Skip post-deletion verification
  --help, -h           Show this help message

EXAMPLES:
  # Interactive delete with confirmation
  node scripts/delete-project.cjs --name PrimePizza

  # Force delete without confirmation
  node scripts/delete-project.cjs --name PrimePizza --force

  # Dry run - see what would be deleted
  node scripts/delete-project.cjs --name PrimePizza --dry-run

  # Delete only local files
  node scripts/delete-project.cjs --name PrimePizza --local-only --force

  # Delete only cloud resources
  node scripts/delete-project.cjs --name PrimePizza --cloud-only

WHAT GETS DELETED:
  GitHub:
    • huddleeco-commits/{name}-backend
    • huddleeco-commits/{name}-frontend
    • huddleeco-commits/{name}-admin

  Railway:
    • Project and all services (backend, frontend, admin, postgres)

  Cloudflare DNS:
    • {name}.be1st.io
    • api.{name}.be1st.io
    • admin.{name}.be1st.io

  Local:
    • generated-projects/{Name}

SAFETY:
  • Exact name matching only - no wildcards
  • Confirmation required unless --force
  • Pre-deletion manifest saved for reference
  • Deletion log with timestamps
  • Post-deletion verification
`);
}

// ============================================
// CONFIRMATION PROMPT
// ============================================

async function promptConfirmation(projectName, resources) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Count what exists
  const githubCount = resources.github.repos.filter(r => r.exists).length;
  const hasRailway = !!resources.railway.project;
  const cloudflareCount = resources.cloudflare.records.length;
  const hasLocal = resources.local.exists;

  console.log('');
  console.log('═'.repeat(50));
  console.log(`⚠️  CONFIRM DELETION: ${projectName}`);
  console.log('═'.repeat(50));
  console.log('');
  console.log('This will permanently delete:');

  if (githubCount > 0) {
    console.log(`  • ${githubCount} GitHub repo(s)`);
  }
  if (hasRailway) {
    console.log(`  • Railway project + ${resources.railway.services.length} service(s)`);
  }
  if (cloudflareCount > 0) {
    console.log(`  • ${cloudflareCount} DNS record(s)`);
  }
  if (hasLocal) {
    console.log(`  • Local folder`);
  }

  console.log('');
  console.log('═'.repeat(50));

  const confirmString = `DELETE ${projectName.toUpperCase()}`;

  return new Promise((resolve) => {
    rl.question(`\nType '${confirmString}' to confirm: `, (answer) => {
      rl.close();
      resolve(answer.trim() === confirmString);
    });
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.name) {
    console.error('❌ Error: Project name is required');
    console.error('');
    console.error('Usage: node scripts/delete-project.cjs --name <ProjectName>');
    console.error('       node scripts/delete-project.cjs --help');
    process.exit(1);
  }

  // Validate environment
  const requiredEnvVars = ['GITHUB_TOKEN', 'RAILWAY_TOKEN', 'CLOUDFLARE_TOKEN', 'CLOUDFLARE_ZONE_ID'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0 && !options.localOnly) {
    console.error('❌ Error: Missing required environment variables:');
    for (const v of missingVars) {
      console.error(`   • ${v}`);
    }
    console.error('');
    console.error('Set these in your .env file or use --local-only to skip cloud deletion.');
    process.exit(1);
  }

  const projectName = options.name;

  console.log('');
  console.log('🗑️  DELETE PROJECT: ' + projectName);
  console.log('═'.repeat(50));

  // Dry run mode
  if (options.dryRun) {
    console.log('');
    console.log('🏃 DRY RUN MODE - No changes will be made');
    console.log('');

    const result = await deleteProject(projectName, {
      dryRun: true,
      localOnly: options.localOnly,
      cloudOnly: options.cloudOnly
    });

    process.exit(0);
  }

  // Discover resources first for confirmation
  if (!options.force) {
    console.log('');
    console.log('🔍 Discovering project resources...');
    const resources = await discoverProjectResources(projectName);

    // Check if anything exists
    const githubCount = resources.github.repos.filter(r => r.exists).length;
    const hasRailway = !!resources.railway.project;
    const cloudflareCount = resources.cloudflare.records.length;
    const hasLocal = resources.local.exists;

    if (githubCount === 0 && !hasRailway && cloudflareCount === 0 && !hasLocal) {
      console.log('');
      console.log('⚠️  No resources found for project: ' + projectName);
      console.log('');
      console.log('Nothing to delete. The project may have already been removed.');
      process.exit(0);
    }

    // Show confirmation
    const confirmed = await promptConfirmation(projectName, resources);

    if (!confirmed) {
      console.log('');
      console.log('❌ Deletion cancelled');
      process.exit(0);
    }
  }

  // Perform deletion
  try {
    const result = await deleteProject(projectName, {
      dryRun: false,
      localOnly: options.localOnly,
      cloudOnly: options.cloudOnly,
      skipVerification: options.skipVerification
    });

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('');
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
