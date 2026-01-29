/**
 * Verification script for pages array fix
 * Story #3: Verify fix end-to-end
 */

const path = require('path');

// Load InputGenerator
const { InputGenerator } = require('../../lib/services/input-generator.cjs');
const gen = new InputGenerator({ verbose: false });

// Test prospect
const prospect = {
  name: 'Test Bakery',
  fixtureId: 'bakery',
  address: '123 Main St',
  research: {}
};

console.log('=== Testing InputGenerator Pages Flow ===\n');
console.log('Prospect:', prospect.name, '(' + prospect.fixtureId + ')\n');

let allPassed = true;

// Test all three levels
['minimal', 'moderate', 'extreme'].forEach(level => {
  const inputs = gen.generateInputs(prospect, level);
  const pages = inputs.pages || [];
  const hasPages = pages.length >= 3;

  console.log(`${level.toUpperCase()} level:`);
  console.log(`  inputs.pages exists: ${inputs.pages !== undefined}`);
  console.log(`  pages count: ${pages.length}`);
  console.log(`  pages: ${pages.join(', ')}`);
  console.log(`  PASS: ${hasPages ? 'YES' : 'NO - Expected 3+ pages'}`);
  console.log();

  if (!hasPages) allPassed = false;
});

console.log('=== RESULT ===');
if (allPassed) {
  console.log('ALL TESTS PASSED - Pages array flows correctly at all levels');
  process.exit(0);
} else {
  console.log('SOME TESTS FAILED - Check output above');
  process.exit(1);
}
