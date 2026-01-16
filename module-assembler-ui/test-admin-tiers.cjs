/**
 * Test script for Admin Tier System
 * Verifies suggestAdminTier works correctly for various scenarios
 */

const path = require('path');

// Load the admin module loader
const { suggestAdminTier, getModulesForTier, resolveModules, getAdminTiers } = require('./lib/services/admin-module-loader.cjs');

console.log('='.repeat(60));
console.log('Admin Tier System Test');
console.log('='.repeat(60));

// Test scenarios from the documentation
const testCases = [
  // ORCHESTRATOR MODE SCENARIOS
  { name: 'Photography portfolio', industry: 'photography', description: 'Photography portfolio', expectedTier: 'lite' },
  { name: 'Pizza restaurant with delivery', industry: 'restaurant', description: 'Pizza restaurant with delivery', expectedTier: 'standard' },
  { name: 'Yoga studio with class booking', industry: 'yoga', description: 'Yoga studio with class booking', expectedTier: 'standard' },
  { name: 'E-commerce store', industry: 'ecommerce', description: 'E-commerce store', expectedTier: 'pro' },
  { name: 'Restaurant franchise 5 locations', industry: 'franchise', description: 'Restaurant franchise 5 locations', expectedTier: 'enterprise' },

  // Additional test cases
  { name: 'Personal blog', industry: 'personal-blog', description: 'Personal blog about travel', expectedTier: 'lite' },
  { name: 'Hair salon', industry: 'salon', description: 'Hair salon and spa', expectedTier: 'standard' },
  { name: 'Retail store', industry: 'retail', description: 'Retail clothing store', expectedTier: 'pro' },
  { name: 'Unknown industry with delivery keyword', industry: 'unknown', description: 'New business with delivery service', expectedTier: 'pro' }, // delivery requires admin-orders which is Pro tier
  { name: 'Unknown industry (fallback)', industry: 'unknown', description: '', expectedTier: 'standard' },
];

let passed = 0;
let failed = 0;

console.log('\n--- Testing suggestAdminTier() ---\n');

for (const test of testCases) {
  const result = suggestAdminTier(test.industry, test.description);
  const status = result.tier === test.expectedTier ? '✓ PASS' : '✗ FAIL';

  if (result.tier === test.expectedTier) {
    passed++;
  } else {
    failed++;
  }

  console.log(`${status}: ${test.name}`);
  console.log(`  Industry: ${test.industry}`);
  console.log(`  Description: "${test.description}"`);
  console.log(`  Expected: ${test.expectedTier}, Got: ${result.tier}`);
  console.log(`  Modules (${result.moduleCount}): ${result.modules.join(', ')}`);
  console.log(`  Reason: ${result.reason}`);
  console.log(`  Source: ${result.source}`);
  console.log('');
}

console.log('='.repeat(60));
console.log('--- Testing getModulesForTier() ---\n');

const tiers = ['lite', 'standard', 'pro', 'enterprise'];
for (const tier of tiers) {
  const modules = getModulesForTier(tier);
  console.log(`${tier.toUpperCase()} (${modules.length} modules):`);
  console.log(`  ${modules.join(', ')}`);
  console.log('');
}

console.log('='.repeat(60));
console.log('--- Testing resolveModules() with dependencies ---\n');

// Test that requesting admin-orders also includes its dependencies
const requestedModules = ['admin-orders'];
const resolved = resolveModules(requestedModules);
console.log(`Requested: ${requestedModules.join(', ')}`);
console.log(`Resolved: ${resolved.join(', ')}`);
console.log('');

console.log('='.repeat(60));
console.log('--- Testing Keyword Detection ---\n');

const keywordTests = [
  { description: 'Business with online booking', expectedModules: ['admin-bookings'] },
  { description: 'Store with delivery and shop features', expectedModules: ['admin-orders', 'admin-products'] },
  { description: 'Multi-branch franchise business', expectedModules: ['admin-locations'] },
];

for (const test of keywordTests) {
  const result = suggestAdminTier(null, test.description);
  console.log(`Description: "${test.description}"`);
  console.log(`  Tier: ${result.tier}`);
  console.log(`  Detected reason: ${result.reason}`);
  console.log('');
}

console.log('='.repeat(60));
console.log('\nSUMMARY');
console.log('='.repeat(60));
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('All tests passed!');
  process.exit(0);
} else {
  console.log(`${failed} test(s) failed. Please review.`);
  process.exit(1);
}
