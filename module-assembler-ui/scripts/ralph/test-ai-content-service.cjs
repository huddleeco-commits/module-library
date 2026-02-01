/**
 * Test AI Content Service
 * Story #2: Verify AI content generation works
 */

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

console.log('='.repeat(60));
console.log('AI CONTENT SERVICE TEST');
console.log('='.repeat(60));
console.log();

// Check API key
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
console.log('API Key loaded:', apiKey ? 'YES (from .env)' : 'NO');
if (!apiKey) {
  console.log('ERROR: No API key found even after loading .env');
  process.exit(1);
}
console.log();

// Test AI Content Service
const { AIContent } = require('../../lib/services/ai-content.cjs');

async function testAIContent() {
  console.log('--- Testing AIContent Service ---');
  console.log();

  const aiContent = new AIContent({ verbose: true });

  // Test business info
  const testBusiness = {
    name: 'Test Business For AI',  // Generic name to see if AI generates unique content
    address: '456 Oak Ave, Austin, TX 78701',
    phone: '(512) 555-0123',
    description: 'A cozy neighborhood bakery specializing in artisan breads and pastries',
    rating: 4.8,
    reviewCount: 127
  };

  console.log('Test Business:', testBusiness.name);
  console.log('Industry: bakery');
  console.log();

  try {
    console.log('Calling AIContent.generateContent()...');
    console.log();

    const startTime = Date.now();
    const content = await aiContent.generateContent(testBusiness, 'bakery');
    const duration = Date.now() - startTime;

    console.log();
    console.log('='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log();

    if (content._fallback) {
      console.log('⚠️  Result: FALLBACK CONTENT (AI call failed)');
    } else {
      console.log('✅ Result: AI-GENERATED CONTENT');
    }

    console.log();
    console.log('Hero Content:');
    console.log('  Headline:', content.hero?.headline);
    console.log('  Subheadline:', content.hero?.subheadline);
    console.log('  CTA:', content.hero?.cta);
    console.log();

    console.log('About Content:');
    console.log('  Headline:', content.about?.headline);
    console.log('  Paragraphs:', content.about?.paragraphs?.length || 0);
    console.log('  First paragraph:', content.about?.paragraphs?.[0]?.substring(0, 100) + '...');
    console.log();

    console.log('SEO:');
    console.log('  Title:', content.seo?.title);
    console.log('  Description:', content.seo?.description);
    console.log();

    if (content._usage) {
      console.log('API Usage:');
      console.log('  Input tokens:', content._usage.inputTokens);
      console.log('  Output tokens:', content._usage.outputTokens);
      console.log('  Estimated cost: $' + content._usage.estimatedCost?.toFixed(4));
    }

    console.log();
    console.log('Duration:', duration + 'ms');
    console.log();

    // Verify it's not fixture content
    const isFixtureContent = content.hero?.headline?.includes('Welcome to') &&
                            content.hero?.subheadline?.includes('trusted');

    console.log('='.repeat(60));
    console.log('VERIFICATION');
    console.log('='.repeat(60));
    console.log();
    console.log('Is AI-generated (not fixture):', !isFixtureContent && !content._fallback ? 'YES' : 'NO');
    console.log('Has unique headline:', content.hero?.headline !== 'Welcome to Test Business For AI' ? 'YES' : 'NO');
    console.log('Has CTA:', content.hero?.cta ? 'YES' : 'NO');
    console.log('Has about content:', content.about?.paragraphs?.length > 0 ? 'YES' : 'NO');
    console.log();

    const passed = !content._fallback && content.hero?.headline && content.about?.paragraphs?.length > 0;
    console.log(passed ? '✅ TEST PASSED' : '❌ TEST FAILED');

    return passed;

  } catch (error) {
    console.error('ERROR:', error.message);
    return false;
  }
}

testAIContent()
  .then(passed => process.exit(passed ? 0 : 1))
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
