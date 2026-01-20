require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  const result = await pool.query(`
    SELECT name, frontend_url, admin_url
    FROM generated_projects
    WHERE frontend_url IS NOT NULL
    ORDER BY name
    LIMIT 10
  `);

  console.log('Projects with URLs in database:');
  console.log('');
  result.rows.forEach(r => {
    console.log('Name:', r.name);
    console.log('  Frontend:', r.frontend_url);
    console.log('  Admin:', r.admin_url || '(none)');
    console.log('');
  });

  const countResult = await pool.query('SELECT COUNT(*) FROM generated_projects WHERE frontend_url IS NOT NULL');
  console.log('Total projects with URLs:', countResult.rows[0].count);

  await pool.end();
}

verify().catch(console.error);
