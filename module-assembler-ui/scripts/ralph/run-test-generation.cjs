/**
 * Test Generation Script - Verifies page generation fix
 * Runs a full test generation at MINIMAL level (no AI cost)
 */

const fs = require('fs');
const path = require('path');

// Paths
const BASE = path.join(__dirname, '../..');
const PROSPECTS_DIR = path.join(BASE, 'output/prospects');
const OUTPUT_DIR = path.join(BASE, 'generated-projects');

// Load required modules
const { InputGenerator } = require('../../lib/services/input-generator.cjs');
const { MasterAgent } = require('../../lib/agents/master-agent.cjs');
const { loadFixture } = require('../../test-fixtures/index.cjs');

async function runTestGeneration() {
  console.log('='.repeat(60));
  console.log('TEST GENERATION - MINIMAL LEVEL (L0)');
  console.log('='.repeat(60));
  console.log();

  // 1. Load a prospect (use cristy-s-cake-shop - bakery)
  const prospectFolder = 'cristy-s-cake-shop';
  const prospectFile = path.join(PROSPECTS_DIR, prospectFolder, 'prospect.json');

  if (!fs.existsSync(prospectFile)) {
    console.error('Prospect not found:', prospectFile);
    process.exit(1);
  }

  const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
  console.log('Prospect:', prospect.name);
  console.log('Industry:', prospect.fixtureId || prospect.category);
  console.log();

  // 2. Generate inputs at MINIMAL level
  console.log('--- STEP 1: Generate Inputs (MINIMAL level) ---');
  const inputGen = new InputGenerator({ verbose: true });
  const inputs = inputGen.generateInputs(prospect, 'minimal');

  console.log('inputs.pages:', inputs.pages);
  console.log('pages count:', inputs.pages?.length || 0);
  console.log();

  // 3. Build final config (same as scout.cjs)
  const finalConfig = {
    tier: inputs.pageTier || 'standard',
    pages: inputs.pages || [],
    features: inputs.features || [],
    layout: inputs.layout !== 'auto' ? inputs.layout : null,
    archetype: inputs.archetype !== 'auto' ? inputs.archetype : null
  };

  console.log('--- STEP 2: Final Config ---');
  console.log('tier:', finalConfig.tier);
  console.log('pages:', finalConfig.pages.join(', '));
  console.log('pages count:', finalConfig.pages.length);
  console.log();

  // 4. Create output directory
  const testOutputDir = path.join(OUTPUT_DIR, `ralph-test-${Date.now()}`);
  fs.mkdirSync(testOutputDir, { recursive: true });
  console.log('--- STEP 3: Generate Project ---');
  console.log('Output dir:', testOutputDir);

  // 5. Run MasterAgent generation
  const master = new MasterAgent({ verbose: true });
  const fixtureId = prospect.fixtureId || 'bakery';

  // Normalize page keys
  const normalizedPages = finalConfig.pages.map(p =>
    p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  );

  const result = await master.generateProject({
    projectName: 'ralph-test',
    fixtureId: fixtureId,
    testMode: true,
    runBuild: false,
    outputPath: testOutputDir,
    prospectData: prospect,
    requestedPages: normalizedPages.length > 0 ? normalizedPages : null,
    tier: finalConfig.tier,
    enablePortal: false // Skip portal pages for simpler test
  });

  console.log();
  console.log('--- STEP 4: Results ---');
  console.log('Generation success:', result.success);

  // 6. Count generated pages
  const pagesDir = path.join(testOutputDir, 'frontend/src/pages');
  let pageFiles = [];
  if (fs.existsSync(pagesDir)) {
    pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
  }

  console.log();
  console.log('='.repeat(60));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(60));
  console.log();
  console.log('Pages generated:', pageFiles.length);
  console.log('Page files:', pageFiles.join(', '));
  console.log();
  console.log('Output location:', testOutputDir);
  console.log('Frontend:', path.join(testOutputDir, 'frontend'));
  console.log('Pages dir:', pagesDir);
  console.log();

  // 7. Final verdict
  const expectedMinPages = 3;
  const passed = pageFiles.length >= expectedMinPages;

  if (passed) {
    console.log('✅ TEST PASSED - Generated', pageFiles.length, 'pages (expected', expectedMinPages, '+)');
  } else {
    console.log('❌ TEST FAILED - Only generated', pageFiles.length, 'pages (expected', expectedMinPages, '+)');
  }

  return { passed, pageCount: pageFiles.length, pageFiles, outputDir: testOutputDir };
}

// Run
runTestGeneration()
  .then(result => {
    process.exit(result.passed ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
