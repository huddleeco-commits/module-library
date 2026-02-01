/**
 * Update all prospects with properly extracted city names
 * Uses zipcode lookup for DFW area
 */

const fs = require('fs');
const path = require('path');
const { ScoutAgent } = require('../lib/agents/scout-agent.cjs');

const scout = new ScoutAgent({ verbose: false });
const PROSPECTS_DIR = path.join(__dirname, '../output/prospects');

const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
  try { return fs.statSync(path.join(PROSPECTS_DIR, f)).isDirectory(); }
  catch { return false; }
});

console.log(`Updating city field for ${folders.length} prospects...\n`);

const cityCount = {};
let updated = 0;

for (const folder of folders) {
  const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
  if (!fs.existsSync(prospectFile)) continue;

  const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
  const city = scout.extractCity(data.address);

  if (city !== data.city) {
    data.city = city;
    fs.writeFileSync(prospectFile, JSON.stringify(data, null, 2));
    updated++;
  }

  cityCount[city] = (cityCount[city] || 0) + 1;
}

console.log('Cities found:');
Object.entries(cityCount).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
  console.log(`  ${city}: ${count} prospects`);
});

console.log(`\n✅ Updated ${updated} of ${folders.length} prospects with city field`);
