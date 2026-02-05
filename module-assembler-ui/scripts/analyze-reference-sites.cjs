#!/usr/bin/env node
/**
 * Analyze Reference Sites Script
 *
 * Reads all test fixtures, analyzes each reference website URL using the
 * /api/analyze-site endpoint, and stores the extracted theme data back
 * in the fixture files.
 *
 * Usage:
 *   node scripts/analyze-reference-sites.cjs
 *   node scripts/analyze-reference-sites.cjs --dry-run  (preview only)
 *   node scripts/analyze-reference-sites.cjs --fixture coffee-cafe  (single fixture)
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const FIXTURES_DIR = path.join(__dirname, '..', 'test-fixtures');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const DELAY_BETWEEN_CALLS = 2000; // 2 seconds between API calls to avoid rate limiting

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const singleFixture = args.find(a => a.startsWith('--fixture='))?.split('=')[1]
  || (args.includes('--fixture') ? args[args.indexOf('--fixture') + 1] : null);

console.log('');
console.log('═'.repeat(60));
console.log('🔍 REFERENCE SITE ANALYZER');
console.log('═'.repeat(60));
console.log(`   Server: ${SERVER_URL}`);
console.log(`   Dry Run: ${dryRun}`);
console.log(`   Single Fixture: ${singleFixture || 'all'}`);
console.log('');

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Analyze a single URL using the API
 */
async function analyzeUrl(url) {
  try {
    const response = await axios.post(`${SERVER_URL}/api/analyze-site`, { url }, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.success && response.data.analysis) {
      return {
        success: true,
        theme: {
          colors: response.data.analysis.colors,
          fonts: response.data.analysis.fonts,
          style: response.data.analysis.style,
          mood: response.data.analysis.mood
        },
        method: response.data.analysis.method || 'vision',
        analyzedAt: new Date().toISOString()
      };
    }

    return { success: false, error: 'No analysis data returned' };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || err.message
    };
  }
}

/**
 * Process a single fixture file
 */
async function processFixture(fixturePath) {
  const fixtureName = path.basename(fixturePath, '.json');
  console.log(`\n📁 Processing: ${fixtureName}`);

  // Read the fixture
  let fixture;
  try {
    const content = fs.readFileSync(fixturePath, 'utf-8');
    fixture = JSON.parse(content);
  } catch (err) {
    console.log(`   ❌ Failed to read fixture: ${err.message}`);
    return { name: fixtureName, success: false, error: err.message };
  }

  // Check if it has design research with reference websites
  if (!fixture.designResearch?.referenceWebsites?.length) {
    console.log(`   ⚠️  No reference websites found, skipping`);
    return { name: fixtureName, success: true, skipped: true };
  }

  const refs = fixture.designResearch.referenceWebsites;
  console.log(`   📌 Found ${refs.length} reference websites`);

  let analyzedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    console.log(`   ${i + 1}. ${ref.name} - ${ref.url}`);

    // Skip if already analyzed
    if (ref.extractedTheme && !args.includes('--force')) {
      console.log(`      ✓ Already analyzed, skipping`);
      skippedCount++;
      continue;
    }

    if (dryRun) {
      console.log(`      🔍 Would analyze (dry run)`);
      continue;
    }

    // Analyze the URL
    console.log(`      🔍 Analyzing...`);
    const result = await analyzeUrl(ref.url);

    if (result.success) {
      // Store the extracted theme
      ref.extractedTheme = result.theme;
      ref.analyzedAt = result.analyzedAt;
      ref.analysisMethod = result.method;

      console.log(`      ✅ Success: ${result.theme.style} / ${result.theme.mood}`);
      console.log(`         Primary: ${result.theme.colors?.primary || 'N/A'}`);
      console.log(`         Heading font: ${result.theme.fonts?.heading || 'N/A'}`);
      analyzedCount++;
    } else {
      console.log(`      ❌ Failed: ${result.error}`);
      failedCount++;
    }

    // Wait between API calls
    if (i < refs.length - 1) {
      await sleep(DELAY_BETWEEN_CALLS);
    }
  }

  // Save the updated fixture
  if (!dryRun && analyzedCount > 0) {
    try {
      fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));
      console.log(`   💾 Saved fixture with ${analyzedCount} new analyses`);
    } catch (err) {
      console.log(`   ❌ Failed to save: ${err.message}`);
      return { name: fixtureName, success: false, error: err.message };
    }
  }

  return {
    name: fixtureName,
    success: true,
    analyzed: analyzedCount,
    skipped: skippedCount,
    failed: failedCount
  };
}

/**
 * Main function
 */
async function main() {
  // Get all fixture files
  let fixtureFiles;
  try {
    fixtureFiles = fs.readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(FIXTURES_DIR, f));
  } catch (err) {
    console.error(`Failed to read fixtures directory: ${err.message}`);
    process.exit(1);
  }

  // Filter to single fixture if specified
  if (singleFixture) {
    fixtureFiles = fixtureFiles.filter(f =>
      path.basename(f, '.json') === singleFixture ||
      path.basename(f, '.json').includes(singleFixture)
    );

    if (fixtureFiles.length === 0) {
      console.error(`No fixture found matching: ${singleFixture}`);
      process.exit(1);
    }
  }

  console.log(`Found ${fixtureFiles.length} fixture files`);

  // Test server connectivity first
  if (!dryRun) {
    console.log('\nTesting server connectivity...');
    try {
      await axios.get(`${SERVER_URL}/api/health`, { timeout: 5000 });
      console.log('✓ Server is reachable');
    } catch (err) {
      console.log(`⚠️  Server check failed: ${err.message}`);
      console.log('   Make sure the server is running: npm run dev');
      console.log('   Or use --dry-run to preview without API calls');
      process.exit(1);
    }
  }

  // Process each fixture
  const results = [];
  for (const fixturePath of fixtureFiles) {
    const result = await processFixture(fixturePath);
    results.push(result);
  }

  // Print summary
  console.log('\n');
  console.log('═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalAnalyzed = results.reduce((sum, r) => sum + (r.analyzed || 0), 0);
  const totalSkipped = results.reduce((sum, r) => sum + (r.skipped || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);

  console.log(`   Fixtures processed: ${results.length}`);
  console.log(`   Successful: ${successful.length}`);
  console.log(`   Failed: ${failed.length}`);
  console.log('');
  console.log(`   URLs analyzed: ${totalAnalyzed}`);
  console.log(`   URLs skipped (already done): ${totalSkipped}`);
  console.log(`   URLs failed: ${totalFailed}`);

  if (failed.length > 0) {
    console.log('\n   Failed fixtures:');
    failed.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
  }

  if (dryRun) {
    console.log('\n   This was a dry run. Use without --dry-run to execute.');
  }

  console.log('');
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
