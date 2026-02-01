/**
 * Industry Layout Demo
 *
 * Demonstrates the universal generator across multiple industries.
 * Each industry gets 3 layout variants - SAME data, DIFFERENT looks.
 *
 * Run: node lib/page-templates/demo-all-industries.cjs
 */

const fs = require('fs');
const path = require('path');
const { generateSite, generateAppJsx, getAvailableIndustryLayouts } = require('./universal-generator.cjs');
const { loadFixture, getAvailableFixtures } = require('../../test-fixtures/index.cjs');

// Output directory
const OUTPUT_BASE = path.join(__dirname, '..', '..', 'test-output', 'industry-layouts');

// Industries to demo (pick a few representative ones)
const DEMO_INDUSTRIES = [
  'healthcare',
  'pizza-restaurant',
  'salon-spa',
  'fitness-gym',
  'law-firm',
  'saas'
];

console.log('\n🏢 UNIVERSAL INDUSTRY GENERATOR DEMO');
console.log('=====================================');
console.log('Generating sites for multiple industries with 3 layouts each\n');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_BASE)) {
  fs.mkdirSync(OUTPUT_BASE, { recursive: true });
}

// Generate for each demo industry
for (const industryId of DEMO_INDUSTRIES) {
  console.log(`\n📦 Industry: ${industryId.toUpperCase()}`);
  console.log('─'.repeat(40));

  // Load fixture
  let fixture;
  try {
    fixture = loadFixture(industryId);
  } catch (e) {
    console.log(`   ⚠️  Fixture not found, skipping`);
    continue;
  }

  // Get available layouts for this industry
  const layouts = getAvailableIndustryLayouts(industryId);
  console.log(`   Business: ${fixture.business.name}`);
  console.log(`   Layouts available: ${layouts.length}`);

  // Generate each layout variant
  for (const layoutConfig of layouts) {
    const layoutId = layoutConfig.id;
    const isDefault = layoutConfig.isDefault ? ' (default)' : '';

    console.log(`\n   📐 ${layoutConfig.name}${isDefault}`);
    console.log(`      Style: ${layoutConfig.style.heroStyle} hero, ${layoutConfig.style.cardStyle} cards`);

    // Generate site
    const result = generateSite(fixture, layoutId);

    // Create output directory
    const outputDir = path.join(OUTPUT_BASE, industryId, layoutId);
    if (!fs.existsSync(path.join(outputDir, 'src', 'pages'))) {
      fs.mkdirSync(path.join(outputDir, 'src', 'pages'), { recursive: true });
    }

    // Write pages
    for (const [pageName, pageContent] of Object.entries(result.pages)) {
      fs.writeFileSync(
        path.join(outputDir, 'src', 'pages', `${pageName}.jsx`),
        pageContent
      );
    }

    // Write App.jsx
    const appJsx = generateAppJsx(fixture, result.layout, result.colors, result.routes);
    fs.writeFileSync(path.join(outputDir, 'src', 'App.jsx'), appJsx);

    // Write main.jsx
    fs.writeFileSync(path.join(outputDir, 'src', 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`);

    // Write package.json
    const packageJson = {
      name: `${industryId}-${layoutId}`.replace(/[^a-z0-9-]/g, '-'),
      version: '1.0.0',
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build' },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.294.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0'
      }
    };
    fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Write index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fixture.business.name} - ${layoutConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);

    // Write vite.config.js
    fs.writeFileSync(path.join(outputDir, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`);

    console.log(`      ✅ Generated: ${Object.keys(result.pages).length} pages`);
  }
}

// Summary
console.log('\n=====================================');
console.log('📁 Output: ' + OUTPUT_BASE);
console.log('\nGenerated structure:');
console.log('  industry-layouts/');
for (const industryId of DEMO_INDUSTRIES) {
  console.log(`    ${industryId}/`);
  const layouts = getAvailableIndustryLayouts(industryId);
  for (const layout of layouts) {
    console.log(`      ${layout.id}/`);
  }
}

console.log('\n🎯 To test a specific layout:');
console.log('   cd test-output/industry-layouts/healthcare/patient-focused');
console.log('   npm install && npm run dev');

console.log('\n💡 Key points:');
console.log('   • Same fixture data → 3 different visual experiences');
console.log('   • Zero AI cost for all layout variants');
console.log('   • AI Visual Freedom can customize individual sections');
console.log('   • Works across ALL 19 industries');

console.log('\n🎉 Demo complete!\n');
