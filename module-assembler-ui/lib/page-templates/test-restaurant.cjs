/**
 * Test Restaurant Template Generation
 *
 * Run: node lib/page-templates/test-restaurant.cjs
 */

const fs = require('fs');
const path = require('path');
const { generateRestaurantSite } = require('./restaurant/index.cjs');
const { loadFixture } = require('../../test-fixtures/index.cjs');

// Load pizza restaurant fixture
const fixture = loadFixture('pizza-restaurant');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output', 'restaurant-test');

console.log('\n🍕 Testing Restaurant Template Generation');
console.log('==========================================\n');

// Generate restaurant site
const result = generateRestaurantSite(fixture);

// Ensure directories exist
if (!fs.existsSync(path.join(OUTPUT_DIR, 'src', 'pages'))) {
  fs.mkdirSync(path.join(OUTPUT_DIR, 'src', 'pages'), { recursive: true });
}

// Write all pages
for (const [pageName, content] of Object.entries(result.pages)) {
  const fileName = pageName === 'App' ? 'App.jsx' : `pages/${pageName}.jsx`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'src', fileName), content);
  console.log(`   ✅ ${fileName}`);
}

// Write main.jsx
fs.writeFileSync(path.join(OUTPUT_DIR, 'src', 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`);

// Write package.json
const packageJson = {
  name: 'restaurant-test',
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
fs.writeFileSync(path.join(OUTPUT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

// Write index.html
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fixture.business.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`);

// Write vite.config.js
fs.writeFileSync(path.join(OUTPUT_DIR, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`);

console.log('\n==========================================');
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log('\nTo test:');
console.log(`   cd "${OUTPUT_DIR}"`);
console.log('   npm install && npm run dev');
console.log('\n🎉 Restaurant test complete!\n');
