/**
 * Cleanup all Demo-* projects from Railway, GitHub, Cloudflare, and local
 *
 * Usage:
 *   node scripts/cleanup-demo-projects.cjs           # Delete all Demo-* projects
 *   node scripts/cleanup-demo-projects.cjs --dry-run # Preview what would be deleted
 *   node scripts/cleanup-demo-projects.cjs --prefix Test  # Delete all Test-* projects
 */
const { deleteProject, deleteAllByPrefix, findRailwayProjectsByPrefix } = require('../lib/services/project-deleter.cjs');
const fs = require('fs');
const path = require('path');

const GENERATED_PROJECTS_PATH = process.env.GENERATED_PROJECTS_PATH ||
  path.join(__dirname, '..', '..', '..', 'generated-projects');

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const prefixIndex = args.indexOf('--prefix');
const prefix = prefixIndex >= 0 && args[prefixIndex + 1] ? args[prefixIndex + 1] : 'Demo-';

async function cleanupAll() {
  console.log('');
  console.log('═'.repeat(60));
  console.log(`🧹 CLEANUP ALL ${prefix.toUpperCase()}* PROJECTS`);
  console.log('═'.repeat(60));
  console.log('');
  console.log(`Prefix: ${prefix}`);
  console.log(`Dry run: ${dryRun ? 'YES (no changes will be made)' : 'NO'}`);
  console.log('');

  // Find all matching Railway projects
  console.log('🔍 Searching Railway...');
  const railwayProjects = await findRailwayProjectsByPrefix(prefix);

  if (railwayProjects.length === 0) {
    console.log('   No matching Railway projects found');
  } else {
    console.log(`   Found ${railwayProjects.length} projects:`);
    railwayProjects.forEach(p => {
      const created = new Date(p.createdAt).toLocaleString();
      console.log(`   • ${p.name} (created: ${created})`);
    });
  }

  // Find all matching local folders
  console.log('\n🔍 Searching local folders...');
  const localFolders = [];
  if (fs.existsSync(GENERATED_PROJECTS_PATH)) {
    const entries = fs.readdirSync(GENERATED_PROJECTS_PATH, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith(prefix)) {
        localFolders.push(entry.name);
      }
    }
  }

  if (localFolders.length === 0) {
    console.log('   No matching local folders found');
  } else {
    console.log(`   Found ${localFolders.length} folders:`);
    localFolders.forEach(f => console.log(`   • ${f}`));
  }

  const totalItems = railwayProjects.length + localFolders.length;

  if (totalItems === 0) {
    console.log('\n✅ Nothing to clean up!');
    return;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`Total items to delete: ${totalItems}`);
  console.log('─'.repeat(60));

  if (dryRun) {
    console.log('\n🏃 DRY RUN - No changes made');
    console.log('   Run without --dry-run to actually delete');
    return;
  }

  // Delete each project properly (handles GitHub, Cloudflare, etc.)
  console.log('\n🗑️  Deleting projects...\n');

  const results = [];
  const projectNames = new Set([
    ...railwayProjects.map(p => p.name),
    ...localFolders
  ]);

  for (const projectName of projectNames) {
    try {
      console.log(`\n${'─'.repeat(50)}`);
      const result = await deleteProject(projectName, { skipVerification: true });
      results.push({ project: projectName, success: result.success });
    } catch (err) {
      console.error(`❌ Error deleting ${projectName}: ${err.message}`);
      results.push({ project: projectName, success: false, error: err.message });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 CLEANUP SUMMARY');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successfully cleaned: ${successful.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.map(f => f.project).join(', ')}`);
  }
  console.log('═'.repeat(60));
}

cleanupAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
