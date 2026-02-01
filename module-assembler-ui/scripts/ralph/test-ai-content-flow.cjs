/**
 * Test AI Content Flow
 * Story #1: Verify where AI content injection occurs (or fails)
 */

const path = require('path');
const fs = require('fs');

// Check for API key
console.log('='.repeat(60));
console.log('AI CONTENT FLOW TEST');
console.log('='.repeat(60));
console.log();

// 1. Check API key availability
const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
console.log('1. API KEY CHECK');
console.log('   CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? 'SET' : 'NOT SET');
console.log('   ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET');
console.log('   Can call AI:', apiKey ? 'YES' : 'NO - BLOCKER!');
console.log();

// 2. Test AIContent service initialization
console.log('2. AI CONTENT SERVICE');
const { AIContent } = require('../../lib/services/ai-content.cjs');
const aiContent = new AIContent({ verbose: true });
console.log('   Service instantiated: YES');

// Check if industries.json exists
const industriesPath = path.join(__dirname, '../../../prompts/industries.json');
console.log('   industries.json exists:', fs.existsSync(industriesPath) ? 'YES' : 'NO');
console.log();

// 3. Test AIPipeline
console.log('3. AI PIPELINE SERVICE');
const { AIPipeline, AI_LEVELS } = require('../../lib/services/ai-pipeline.cjs');
console.log('   AI Levels defined:');
Object.entries(AI_LEVELS).forEach(([level, config]) => {
  console.log(`     L${level}: ${config.name} (composer: ${config.composer}, content: ${config.content})`);
});
console.log();

// 4. Test data flow (mock)
console.log('4. DATA FLOW CHECK');
const mockProspect = {
  name: 'Test Bakery',
  address: '123 Main St, Dallas, TX',
  phone: '555-1234',
  fixtureId: 'bakery'
};

const mockConfig = {
  tier: 'standard',
  pages: ['home', 'menu', 'about', 'contact']
};

console.log('   Mock prospect:', mockProspect.name);
console.log('   Mock config pages:', mockConfig.pages.join(', '));
console.log();

// 5. Test the enhance method WITHOUT API call (level 0)
console.log('5. ENHANCE TEST (Level 0 - No API)');
const pipeline = new AIPipeline({ verbose: true });
pipeline.enhance(mockConfig, mockProspect, 0, () => {})
  .then(result => {
    console.log('   Level 0 result:', result.aiEnhanced ? 'Enhanced' : 'No enhancement (correct for L0)');
    console.log();

    // 6. Summary
    console.log('='.repeat(60));
    console.log('SUMMARY: AI Content Flow Analysis');
    console.log('='.repeat(60));
    console.log();

    if (!apiKey) {
      console.log('❌ BLOCKER: No API key found!');
      console.log('   AI levels 1-4 cannot function without CLAUDE_API_KEY or ANTHROPIC_API_KEY');
      console.log('   Solution: Set environment variable before running generation');
      console.log();
    } else {
      console.log('✅ API key available');
    }

    console.log('Flow: scout.cjs → AIPipeline.enhance() → AIContent.generateContent() → aiEnhancedConfig');
    console.log('      → MasterAgent.generateProject() → generateFromFixture() → createProjectFromFixture()');
    console.log('      → generatePageContent() → archetype-pages.cjs → businessData.aiContent');
    console.log();
    console.log('Key injection points:');
    console.log('  1. scout.cjs:1158 - AIPipeline.enhance() called');
    console.log('  2. scout.cjs:1314-1320 - AI content passed to MasterAgent');
    console.log('  3. master-agent.cjs:561-576 - AI content extracted from options');
    console.log('  4. master-agent.cjs:1285-1292 - AI content passed to generatePageContent');
    console.log('  5. archetype-pages.cjs:95 - AI content used in page template');
    console.log();
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
