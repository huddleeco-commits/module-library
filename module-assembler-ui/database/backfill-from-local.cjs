/**
 * Backfill Generated Projects from Local Folders
 * Scans the generated-projects directory and imports projects into the database
 * with constructed URLs for easy management and deletion
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const GENERATED_PROJECTS_PATH = process.env.GENERATED_PROJECTS_PATH ||
  path.join(__dirname, '..', '..', '..', 'generated-projects');
const GITHUB_OWNER = 'huddleeco-commits';

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function constructUrls(projectName) {
  const sanitized = sanitizeName(projectName);
  return {
    frontend_url: `https://${sanitized}.be1st.io`,
    admin_url: `https://admin.${sanitized}.be1st.io`,
    backend_url: `https://api.${sanitized}.be1st.io`,
    github_frontend: `https://github.com/${GITHUB_OWNER}/${sanitized}-frontend`,
    github_backend: `https://github.com/${GITHUB_OWNER}/${sanitized}-backend`,
    github_admin: `https://github.com/${GITHUB_OWNER}/${sanitized}-admin`,
    domain: `${sanitized}.be1st.io`
  };
}

async function backfillFromLocal() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     BACKFILL GENERATED PROJECTS FROM LOCAL FOLDERS        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`Scanning: ${GENERATED_PROJECTS_PATH}\n`);

  if (!fs.existsSync(GENERATED_PROJECTS_PATH)) {
    console.error('ERROR: Generated projects path does not exist!');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    // Get list of directories in generated-projects
    const entries = fs.readdirSync(GENERATED_PROJECTS_PATH, { withFileTypes: true });
    const projectDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

    console.log(`Found ${projectDirs.length} project folders\n`);
    console.log('────────────────────────────────────────────────────────────\n');

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const dir of projectDirs) {
      const projectName = dir.name;
      const projectPath = path.join(GENERATED_PROJECTS_PATH, projectName);
      const manifestPath = path.join(projectPath, 'project-manifest.json');
      const brainPath = path.join(projectPath, 'brain.json');

      // Skip if no manifest (not a valid project)
      if (!fs.existsSync(manifestPath) && !fs.existsSync(brainPath)) {
        console.log(`  ⏭️  ${projectName} (no manifest - skipping)`);
        skipped++;
        continue;
      }

      // Check if already exists in database
      const existing = await client.query(
        'SELECT id FROM generated_projects WHERE name = $1',
        [projectName]
      );

      if (existing.rows.length > 0) {
        console.log(`  ✓  ${projectName} (already in DB - id: ${existing.rows[0].id})`);
        skipped++;
        continue;
      }

      // Read manifest for metadata
      let manifest = {};
      let brain = {};

      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
          console.log(`  ⚠️  ${projectName} (invalid manifest)`);
        }
      }

      if (fs.existsSync(brainPath)) {
        try {
          brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
        } catch (e) {}
      }

      // Get folder creation time as generated date
      const stats = fs.statSync(projectPath);
      const createdAt = manifest.generatedAt || stats.birthtime || stats.mtime;

      // Detect industry from manifest or brain
      let industry = manifest.industry || brain.businessType || 'unknown';
      // Simplify industry name
      industry = industry.toLowerCase()
        .replace(/coffee shop \/ cafe/i, 'cafe')
        .replace(/pizza.*restaurant/i, 'pizza')
        .replace(/ /g, '-');

      // Construct URLs
      const urls = constructUrls(projectName);

      // Insert into database
      try {
        await client.query(`
          INSERT INTO generated_projects (
            name, industry, status, domain,
            frontend_url, admin_url, backend_url,
            github_frontend, github_backend, github_admin,
            created_at, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          projectName,
          industry,
          'completed',
          urls.domain,
          urls.frontend_url,
          urls.admin_url,
          urls.backend_url,
          urls.github_frontend,
          urls.github_backend,
          urls.github_admin,
          createdAt,
          JSON.stringify({
            generator: manifest.generator || 'Module Library Assembler',
            bundles: manifest.bundles || [],
            backendModules: manifest.counts?.backendModules || 0,
            frontendModules: manifest.counts?.frontendModules || 0,
            importedFromLocal: true,
            importedAt: new Date().toISOString(),
            localPath: projectPath
          })
        ]);

        console.log(`  ✅ ${projectName}`);
        console.log(`     └─ ${urls.frontend_url}`);
        inserted++;
      } catch (insertErr) {
        console.log(`  ❌ ${projectName}: ${insertErr.message}`);
        errors++;
      }
    }

    console.log('\n────────────────────────────────────────────────────────────');
    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Inserted: ${inserted}`);
    console.log(`   ⏭️  Skipped:  ${skipped}`);
    console.log(`   ❌ Errors:   ${errors}`);
    console.log(`   📁 Total:    ${projectDirs.length}`);

    // Show total in database
    const count = await client.query('SELECT COUNT(*) FROM generated_projects');
    console.log(`\n   📚 Total in database: ${count.rows[0].count}`);

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('Backfill complete! Projects are now visible in admin panel.');
    console.log('════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\nBackfill failed:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the backfill
backfillFromLocal();
