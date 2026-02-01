/**
 * Update Missing URLs in Generated Projects
 * Constructs URLs for projects that don't have them
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const GITHUB_OWNER = 'huddleeco-commits';

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function updateUrls() {
  console.log('Updating missing URLs in generated_projects...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Get all projects without frontend_url
    const result = await pool.query(`
      SELECT id, name FROM generated_projects
      WHERE frontend_url IS NULL
      ORDER BY id
    `);

    console.log(`Found ${result.rows.length} projects without URLs\n`);

    let updated = 0;
    for (const row of result.rows) {
      const sanitized = sanitizeName(row.name);

      // Construct URLs
      const urls = {
        frontend_url: `https://${sanitized}.be1st.io`,
        admin_url: `https://admin.${sanitized}.be1st.io`,
        backend_url: `https://api.${sanitized}.be1st.io`,
        github_frontend: `https://github.com/${GITHUB_OWNER}/${sanitized}-frontend`,
        github_backend: `https://github.com/${GITHUB_OWNER}/${sanitized}-backend`,
        github_admin: `https://github.com/${GITHUB_OWNER}/${sanitized}-admin`,
        domain: `${sanitized}.be1st.io`
      };

      await pool.query(`
        UPDATE generated_projects SET
          frontend_url = $1,
          admin_url = $2,
          backend_url = $3,
          github_frontend = $4,
          github_backend = $5,
          github_admin = $6,
          domain = $7
        WHERE id = $8
      `, [
        urls.frontend_url,
        urls.admin_url,
        urls.backend_url,
        urls.github_frontend,
        urls.github_backend,
        urls.github_admin,
        urls.domain,
        row.id
      ]);

      console.log(`✅ ${row.name} -> ${urls.frontend_url}`);
      updated++;
    }

    console.log(`\n========================================`);
    console.log(`Updated ${updated} projects with URLs`);
    console.log(`========================================\n`);

  } finally {
    await pool.end();
  }
}

updateUrls();
