/**
 * Backfill URLs Script
 * Parses blink-projects-directory.html and updates generated_projects table
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Normalize name for matching (lowercase, remove special chars, convert spaces to dashes)
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')           // Remove apostrophes
    .replace(/&/g, 'and')           // & to and
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to dashes
    .replace(/-+/g, '-')            // Multiple dashes to single
    .replace(/^-|-$/g, '');         // Trim dashes
}

async function backfillUrls() {
  console.log('');
  console.log('═'.repeat(60));
  console.log('📊 BACKFILL URLs FROM blink-projects-directory.html');
  console.log('═'.repeat(60));
  console.log('');

  // Read and parse HTML
  const htmlPath = 'C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects\\blink-projects-directory.html';
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Extract projects using regex
  const projectRegex = /<div class="project-name">([^<]+)<\/div>\s*<div class="links">\s*<a href="([^"]+)" target="_blank" class="link link-frontend">[^<]+<\/a>(?:\s*<a href="([^"]+)" target="_blank" class="link link-admin">[^<]+<\/a>)?/g;

  const htmlProjects = [];
  let match;
  while ((match = projectRegex.exec(html)) !== null) {
    htmlProjects.push({
      name: match[1].trim(),
      frontendUrl: match[2],
      adminUrl: match[3] || null,
      normalized: normalizeName(match[1].trim())
    });
  }

  console.log(`📄 Found ${htmlProjects.length} projects in HTML file:`);
  htmlProjects.forEach(p => console.log(`   - ${p.name}`));
  console.log('');

  // Get all projects from database
  const dbResult = await pool.query('SELECT id, name FROM generated_projects');
  const dbProjects = dbResult.rows.map(row => ({
    id: row.id,
    name: row.name,
    normalized: normalizeName(row.name)
  }));

  console.log(`💾 Found ${dbProjects.length} projects in database`);
  console.log('');

  // Match and update
  let matched = 0;
  let updated = 0;
  const unmatched = [];

  for (const htmlProject of htmlProjects) {
    // Try exact normalized match first
    let dbMatch = dbProjects.find(db => db.normalized === htmlProject.normalized);

    // If no match, try partial matching
    if (!dbMatch) {
      // Try if DB name contains HTML name or vice versa
      dbMatch = dbProjects.find(db =>
        db.normalized.includes(htmlProject.normalized) ||
        htmlProject.normalized.includes(db.normalized)
      );
    }

    // Try matching by extracting key words
    if (!dbMatch) {
      const htmlWords = htmlProject.normalized.split('-').filter(w => w.length > 2);
      dbMatch = dbProjects.find(db => {
        const dbWords = db.normalized.split('-').filter(w => w.length > 2);
        const commonWords = htmlWords.filter(w => dbWords.includes(w));
        return commonWords.length >= 2; // At least 2 words match
      });
    }

    if (dbMatch) {
      matched++;
      try {
        await pool.query(
          `UPDATE generated_projects
           SET frontend_url = $2, admin_url = $3, status = 'deployed', deployed_at = COALESCE(deployed_at, NOW())
           WHERE id = $1`,
          [dbMatch.id, htmlProject.frontendUrl, htmlProject.adminUrl]
        );
        updated++;
        console.log(`✅ Updated: "${htmlProject.name}" → DB id ${dbMatch.id} (${dbMatch.name})`);
      } catch (err) {
        console.error(`❌ Failed to update ${htmlProject.name}:`, err.message);
      }
    } else {
      unmatched.push(htmlProject.name);
    }
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('📊 RESULTS');
  console.log('═'.repeat(60));
  console.log(`   Projects in HTML:     ${htmlProjects.length}`);
  console.log(`   Matched in DB:        ${matched}`);
  console.log(`   Updated:              ${updated}`);
  console.log(`   Unmatched:            ${unmatched.length}`);
  console.log('');

  if (unmatched.length > 0) {
    console.log('⚠️  Unmatched projects (not found in database):');
    unmatched.forEach(name => console.log(`   - ${name}`));
  }

  console.log('');
  console.log('═'.repeat(60));

  await pool.end();
}

backfillUrls().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
