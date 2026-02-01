/**
 * Test Full AI Generation
 * Story #3: Verify AI content appears in generated pages
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('AI GENERATION TEST (Level 2 - AI Content)');
console.log('='.repeat(60));
console.log();

// Check API key
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
if (!apiKey) {
  console.log('ERROR: No API key found');
  process.exit(1);
}
console.log('API Key: Loaded');

// Load services
const { AIPipeline } = require('../../lib/services/ai-pipeline.cjs');
const { MasterAgent } = require('../../lib/agents/master-agent.cjs');
const { InputGenerator } = require('../../lib/services/input-generator.cjs');

const OUTPUT_DIR = path.join(__dirname, '../../generated-projects');

async function runAIGeneration() {
  // Test prospect
  const prospect = {
    name: 'AI Test Bakery',
    address: '789 Tech Lane, San Francisco, CA 94102',
    phone: '(415) 555-9876',
    fixtureId: 'bakery',
    research: {
      rating: 4.7,
      reviewCount: 89
    }
  };

  console.log('Prospect:', prospect.name);
  console.log('Industry:', prospect.fixtureId);
  console.log('AI Level: 2 (Content Only)');
  console.log();

  // 1. Generate inputs
  console.log('--- Step 1: Generate Inputs ---');
  const inputGen = new InputGenerator({ verbose: false });
  const inputs = inputGen.generateInputs(prospect, 'minimal');
  console.log('Pages:', inputs.pages.join(', '));
  console.log();

  // 2. Run AI Pipeline
  console.log('--- Step 2: AI Pipeline Enhancement ---');
  const pipeline = new AIPipeline({ verbose: true });

  const config = {
    tier: inputs.pageTier || 'standard',
    pages: inputs.pages || [],
    features: []
  };

  const aiLevel = 2; // Content only
  const aiEnhanced = await pipeline.enhance(config, prospect, aiLevel, (progress) => {
    console.log(`   ${progress.step}: ${progress.status}`);
  });

  console.log();
  console.log('AI Enhanced:', aiEnhanced.aiEnhanced ? 'YES' : 'NO');
  console.log('AI Content generated:', aiEnhanced.aiContent ? 'YES' : 'NO');

  if (aiEnhanced.aiContent) {
    console.log('AI Hero headline:', aiEnhanced.aiContent.hero?.headline);
    console.log('AI Cost:', '$' + (aiEnhanced.aiTotalCost || 0).toFixed(4));
  }
  console.log();

  // 3. Run MasterAgent generation
  console.log('--- Step 3: Generate Project ---');
  const outputPath = path.join(OUTPUT_DIR, `ai-test-${Date.now()}`);
  fs.mkdirSync(outputPath, { recursive: true });

  const master = new MasterAgent({ verbose: true });

  const result = await master.generateProject({
    projectName: 'ai-test',
    fixtureId: prospect.fixtureId,
    testMode: true,
    runBuild: false,
    outputPath: outputPath,
    prospectData: prospect,
    requestedPages: inputs.pages,
    tier: config.tier,
    enablePortal: false,
    // Pass AI content!
    aiContent: aiEnhanced.aiContent,
    aiMenu: aiEnhanced.aiMenu,
    aiComposition: aiEnhanced.aiComposition
  });

  console.log();
  console.log('Generation success:', result.success);
  console.log();

  // 4. Verify AI content in generated files
  console.log('--- Step 4: Verify AI Content in Output ---');
  const homePage = path.join(outputPath, 'frontend/src/pages/HomePage.jsx');

  if (!fs.existsSync(homePage)) {
    console.log('ERROR: HomePage.jsx not found');
    return false;
  }

  const homeContent = fs.readFileSync(homePage, 'utf-8');

  // Check for AI-generated headline (should NOT be fixture default)
  const hasAIHeadline = !homeContent.includes('Welcome to AI Test Bakery') &&
                        aiEnhanced.aiContent?.hero?.headline &&
                        homeContent.includes(aiEnhanced.aiContent.hero.headline);

  // Check for fixture headline (should NOT appear if AI worked)
  const hasFixtureHeadline = homeContent.includes('Welcome to') || homeContent.includes('Your trusted');

  console.log();
  console.log('='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));
  console.log();
  console.log('AI headline in code:', hasAIHeadline ? 'YES' : 'NO');
  console.log('Fixture fallback used:', hasFixtureHeadline && !hasAIHeadline ? 'YES (problem)' : 'NO');
  console.log();

  // Show what's actually in the file
  const headlineMatch = homeContent.match(/heroTitle[^>]*>([^<]+)/);
  if (headlineMatch) {
    console.log('Actual headline in HomePage.jsx:', headlineMatch[1]);
  }

  console.log();
  console.log('Output location:', outputPath);
  console.log();

  const passed = hasAIHeadline || (aiEnhanced.aiContent && !hasFixtureHeadline);
  console.log(passed ? '✅ TEST PASSED - AI content injected' : '❌ TEST FAILED - AI content not found');

  return passed;
}

runAIGeneration()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
