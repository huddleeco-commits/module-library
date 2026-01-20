/**
 * Migration: Add URL columns to generated_projects table
 * Run with: node scripts/migrate-add-urls.cjs
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:sAqseglxhBcRYMcXJrQPFuiGNRSiFELJ@switchback.proxy.rlwy.net:56719/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('🔄 Running migration: Add URL columns to generated_projects\n');

  const alterStatements = [
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS frontend_url VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS admin_url VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS backend_url VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS github_frontend VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS github_backend VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS github_admin VARCHAR(255)',
    'ALTER TABLE generated_projects ADD COLUMN IF NOT EXISTS railway_project_url VARCHAR(255)'
  ];

  for (const sql of alterStatements) {
    try {
      await pool.query(sql);
      const colName = sql.split('IF NOT EXISTS ')[1]?.split(' ')[0] || sql;
      console.log('✅ Added column:', colName);
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }

  // Verify columns were added
  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'generated_projects'
    ORDER BY ordinal_position
  `);

  console.log('\n📊 All columns in generated_projects:');
  result.rows.forEach(r => console.log('  -', r.column_name));

  await pool.end();
  console.log('\n✅ Migration complete');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
