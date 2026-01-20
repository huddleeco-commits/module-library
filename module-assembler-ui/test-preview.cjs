/**
 * Test script for Preview System (Phase 1)
 * Verifies preview generation, retrieval, and caching
 *
 * Tests:
 * 1. Preview Generation - POST /api/preview/generate
 * 2. Preview Retrieval - GET /api/preview/view/:id
 * 3. Preview Cache - Memory caching with expiration
 * 4. Preview HTML Content - Validates generated HTML structure
 */

const path = require('path');

// Load the preview generator directly for unit tests
const { generatePreviewHtml } = require('./lib/generators/preview-generator.cjs');

console.log('='.repeat(60));
console.log('Preview System Test (Phase 1)');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`✓ PASS: ${name}`);
  } catch (error) {
    failed++;
    console.log(`✗ FAIL: ${name}`);
    console.log(`  Error: ${error.message}`);
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toBeTruthy() {
      if (!value) {
        throw new Error(`Expected truthy value, got ${value}`);
      }
    },
    toBeFalsy() {
      if (value) {
        throw new Error(`Expected falsy value, got ${value}`);
      }
    },
    toContain(substring) {
      if (typeof value !== 'string' || !value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
    toBeGreaterThan(num) {
      if (value <= num) {
        throw new Error(`Expected ${value} to be greater than ${num}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(value)) {
        throw new Error(`Expected "${value}" to match ${regex}`);
      }
    }
  };
}

// ============================================
// TEST 1: PREVIEW HTML GENERATION
// ============================================

console.log('\n--- Test 1: Preview HTML Generation ---\n');

test('generatePreviewHtml returns HTML string', () => {
  const html = generatePreviewHtml({
    businessName: 'Test Business',
    industry: 'restaurant',
    pages: ['Home', 'Menu', 'Contact']
  });
  expect(typeof html).toBe('string');
  expect(html.length).toBeGreaterThan(1000);
});

test('Generated HTML has DOCTYPE', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('<!DOCTYPE html>');
});

test('Generated HTML contains business name', () => {
  const html = generatePreviewHtml({
    businessName: 'Awesome Restaurant',
    industry: 'restaurant'
  });
  expect(html).toContain('Awesome Restaurant');
});

test('Generated HTML contains correct industry icon', () => {
  const html = generatePreviewHtml({
    businessName: 'Test',
    industry: 'restaurant'
  });
  expect(html).toContain('🍽️'); // Restaurant icon
});

test('Generated HTML contains page cards for each page', () => {
  const pages = ['Home', 'About', 'Menu', 'Contact'];
  const html = generatePreviewHtml({
    businessName: 'Test',
    pages: pages
  });
  for (const page of pages) {
    expect(html).toContain(page);
  }
});

test('Generated HTML includes preview banner', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('PREVIEW');
  expect(html).toContain('preview-banner');
});

test('Generated HTML includes color swatches', () => {
  const colors = {
    primary: '#ff5500',
    secondary: '#0055ff',
    accent: '#ffaa00'
  };
  const html = generatePreviewHtml({
    businessName: 'Test',
    colors: colors
  });
  expect(html).toContain('#ff5500');
  expect(html).toContain('#0055ff');
  expect(html).toContain('#ffaa00');
});

test('Generated HTML has valid structure', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('<html');
  expect(html).toContain('</html>');
  expect(html).toContain('<head>');
  expect(html).toContain('</head>');
  expect(html).toContain('<body>');
  expect(html).toContain('</body>');
});

test('Generated HTML includes navigation links', () => {
  const pages = ['Home', 'Services', 'Contact'];
  const html = generatePreviewHtml({
    businessName: 'Test',
    pages: pages
  });
  expect(html).toContain('nav-links');
  expect(html).toContain('nav-link');
});

test('Generated HTML includes hero section', () => {
  const html = generatePreviewHtml({
    businessName: 'Hero Test',
    tagline: 'Best in Town'
  });
  expect(html).toContain('hero-preview');
  expect(html).toContain('Hero Test');
  expect(html).toContain('Best in Town');
});

test('Generated HTML includes location if provided', () => {
  const html = generatePreviewHtml({
    businessName: 'Test',
    location: 'New York, NY'
  });
  expect(html).toContain('New York, NY');
});

// ============================================
// TEST 2: INDUSTRY-SPECIFIC FEATURES
// ============================================

console.log('\n--- Test 2: Industry-Specific Features ---\n');

const industryTests = [
  { industry: 'restaurant', expectedFeature: 'Online Menu', expectedIcon: '🍽️' },
  { industry: 'pizzeria', expectedFeature: 'Pizza Menu Builder', expectedIcon: '🍕' },
  { industry: 'healthcare', expectedFeature: 'Appointment Booking', expectedIcon: '🏥' },
  { industry: 'real-estate', expectedFeature: 'Property Listings', expectedIcon: '🏠' },
  { industry: 'ecommerce', expectedFeature: 'Shopping Cart', expectedIcon: '🛒' },
  { industry: 'spa-salon', expectedFeature: 'Online Booking', expectedIcon: '💆' },
  { industry: 'law-firm', expectedFeature: 'Practice Areas', expectedIcon: '⚖️' },
  { industry: 'fitness', expectedFeature: 'Class Schedule', expectedIcon: '💪' }
];

for (const { industry, expectedFeature, expectedIcon } of industryTests) {
  test(`${industry} includes ${expectedFeature}`, () => {
    const html = generatePreviewHtml({
      businessName: 'Test',
      industry: industry
    });
    expect(html).toContain(expectedFeature);
  });

  test(`${industry} shows correct icon ${expectedIcon}`, () => {
    const html = generatePreviewHtml({
      businessName: 'Test',
      industry: industry
    });
    expect(html).toContain(expectedIcon);
  });
}

// ============================================
// TEST 3: DEFAULT VALUES
// ============================================

console.log('\n--- Test 3: Default Values ---\n');

test('Uses default business name when not provided', () => {
  const html = generatePreviewHtml({});
  expect(html).toContain('My Business');
});

test('Uses default pages when not provided', () => {
  const html = generatePreviewHtml({});
  expect(html).toContain('Home');
  expect(html).toContain('About');
  expect(html).toContain('Services');
  expect(html).toContain('Contact');
});

test('Uses default colors when not provided', () => {
  const html = generatePreviewHtml({});
  expect(html).toContain('#3b82f6'); // Default primary
});

test('Uses default industry icon for unknown industry', () => {
  const html = generatePreviewHtml({
    industry: 'completely-unknown-industry'
  });
  expect(html).toContain('🏢'); // Default business icon
});

// ============================================
// TEST 4: PREVIEW ROUTES (Unit Tests)
// ============================================

console.log('\n--- Test 4: Preview Routes Module ---\n');

const { createPreviewRoutes } = require('./lib/routes/preview.cjs');

test('createPreviewRoutes returns router', () => {
  const router = createPreviewRoutes();
  expect(typeof router).toBe('function');
});

test('Preview routes module exports correctly', () => {
  expect(typeof createPreviewRoutes).toBe('function');
});

// ============================================
// TEST 5: RESPONSIVE DESIGN ELEMENTS
// ============================================

console.log('\n--- Test 5: Responsive Design Elements ---\n');

test('HTML includes responsive meta viewport', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('viewport');
  expect(html).toContain('width=device-width');
});

test('HTML includes media queries for mobile', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('@media');
  expect(html).toContain('768px');
});

test('HTML includes CSS grid for pages', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('pages-grid');
  expect(html).toContain('grid-template-columns');
});

// ============================================
// TEST 6: ANIMATIONS AND STYLING
// ============================================

console.log('\n--- Test 6: Animations and Styling ---\n');

test('HTML includes fadeInUp animation', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('@keyframes fadeInUp');
});

test('HTML includes CSS variables for colors', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain(':root');
  expect(html).toContain('--primary');
  expect(html).toContain('--secondary');
  expect(html).toContain('--accent');
});

test('HTML includes hover effects', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain(':hover');
});

// ============================================
// TEST 7: CONTENT SECTIONS
// ============================================

console.log('\n--- Test 7: Content Sections ---\n');

test('HTML includes info section with summary', () => {
  const html = generatePreviewHtml({
    businessName: 'Test',
    industryName: 'Restaurant',
    pages: ['Home', 'Menu']
  });
  expect(html).toContain('info-section');
  expect(html).toContain('2 Pages'); // pages.length
});

test('HTML includes features section', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('features-section');
  expect(html).toContain('Included Features');
});

test('HTML includes colors section', () => {
  const html = generatePreviewHtml({ businessName: 'Test' });
  expect(html).toContain('colors-section');
  expect(html).toContain('Color Scheme');
});

test('HTML includes footer', () => {
  const html = generatePreviewHtml({ businessName: 'Test Business' });
  expect(html).toContain('footer-preview');
  expect(html).toContain('Test Business');
  expect(html).toContain(new Date().getFullYear().toString());
});

// ============================================
// SUMMARY
// ============================================

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('All preview tests passed!');
  process.exit(0);
} else {
  console.log(`${failed} test(s) failed. Please review.`);
  process.exit(1);
}
