/**
 * Layout Demo - Shows same data with different layouts
 *
 * Run: node lib/page-templates/demo-layouts.cjs
 *
 * Generates:
 * - patient-focused/   (warm, welcoming)
 * - medical-professional/   (clean, clinical)
 * - clinical-dashboard/   (compact, efficient)
 */

const fs = require('fs');
const path = require('path');
const { generateSiteWithLayout, getAvailableLayouts } = require('./layout-generator.cjs');

// Load healthcare fixture
const fixturesDir = path.join(__dirname, '..', '..', 'test-fixtures');
const fixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'healthcare.json'), 'utf8'));

// Output base directory
const outputBase = path.join(__dirname, '..', '..', 'test-output', 'layout-demo');

console.log('\n🎨 LAYOUT DEMO - Same Data, Different Layouts');
console.log('==============================================');
console.log(`Business: ${fixture.business.name}`);
console.log(`Industry: ${fixture.business.industry}\n`);

// Get available layouts
const layouts = getAvailableLayouts();

console.log('Available Layouts:');
layouts.forEach(l => {
  console.log(`  • ${l.name}: ${l.description}`);
});
console.log('');

// Generate each layout variant
for (const layout of layouts) {
  console.log(`\n📐 Generating: ${layout.name}`);
  console.log(`   Hero style: ${layout.style.heroStyle}`);
  console.log(`   Card style: ${layout.style.cardStyle}`);
  console.log(`   Emphasis: ${layout.emphasis.join(', ')}`);

  const outputDir = path.join(outputBase, layout.id);

  // Create directories
  if (!fs.existsSync(path.join(outputDir, 'src', 'pages'))) {
    fs.mkdirSync(path.join(outputDir, 'src', 'pages'), { recursive: true });
  }

  // Generate site with this layout
  const result = generateSiteWithLayout(fixture, layout.id);

  // Write HomePage
  fs.writeFileSync(
    path.join(outputDir, 'src', 'pages', 'HomePage.jsx'),
    result.pages.HomePage
  );

  // Write simple App.jsx
  const appJsx = `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';

const COLORS = ${JSON.stringify(fixture.theme.colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: COLORS.primary }}>
            🏥 ${fixture.business.name}
          </div>
          <div style={{
            padding: '6px 12px',
            backgroundColor: '${layout.id === 'patient-focused' ? '#059669' : layout.id === 'medical-professional' ? '#0284C7' : '#7C3AED'}15',
            color: '${layout.id === 'patient-focused' ? '#059669' : layout.id === 'medical-professional' ? '#0284C7' : '#7C3AED'}',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ${layout.name} Layout
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}`;

  fs.writeFileSync(path.join(outputDir, 'src', 'App.jsx'), appJsx);

  // Write package.json
  const packageJson = {
    name: `healthcare-${layout.id}`,
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
  <title>${fixture.business.name} - ${layout.name}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>">
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

  // Write main.jsx
  fs.writeFileSync(path.join(outputDir, 'src', 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);`);

  // Write vite.config.js
  fs.writeFileSync(path.join(outputDir, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });`);

  console.log(`   ✅ Generated: ${outputDir}`);
}

console.log('\n==============================================');
console.log('📁 Output: ' + outputBase);
console.log('\nTo compare layouts, run each one:');
layouts.forEach((l, i) => {
  const port = 5173 + i;
  console.log(`\n  ${l.name}:`);
  console.log(`    cd "${path.join(outputBase, l.id)}"`);
  console.log(`    npm install && npm run dev -- --port ${port}`);
});

console.log('\n🎉 Same healthcare data rendered with 3 different layouts!\n');
