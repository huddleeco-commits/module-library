require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

async function checkUrls() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT id, name, status, frontend_url, admin_url
      FROM generated_projects
      WHERE status IN ('deployed', 'completed')
      ORDER BY created_at DESC
      LIMIT 30
    `);

    console.log('\nID | Name | Status | Frontend URL');
    console.log('---|------|--------|-------------');
    result.rows.forEach(row => {
      const url = row.frontend_url ? row.frontend_url.substring(0, 40) : '(none)';
      console.log(`${row.id} | ${row.name.substring(0, 25)} | ${row.status} | ${url}`);
    });

    // Count with/without URLs
    const withUrls = result.rows.filter(r => r.frontend_url).length;
    const withoutUrls = result.rows.filter(r => !r.frontend_url).length;
    console.log(`\nWith URLs: ${withUrls}, Without URLs: ${withoutUrls}`);

  } finally {
    await pool.end();
  }
}

checkUrls();
