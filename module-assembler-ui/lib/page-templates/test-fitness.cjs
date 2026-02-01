/**
 * Test script for Fitness industry templates
 */

const fs = require('fs');
const path = require('path');
const { generateFitnessSite } = require('./fitness/index.cjs');

// Test fixture
const fitnessFixture = {
  business: {
    name: 'Iron Peak Fitness',
    tagline: 'Push Your Limits. Exceed Your Goals.',
    industry: 'fitness-gym',
    phone: '(555) 987-6543',
    email: 'info@ironpeakfitness.com',
    address: '456 Fitness Blvd, Los Angeles, CA 90001'
  },
  theme: {
    colors: {
      primary: '#DC2626',
      secondary: '#EF4444',
      accent: '#FCA5A5',
      background: '#FEF2F2',
      text: '#1F2937'
    }
  }
};

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../../output/test-fitness-site');

// Generate the site
console.log('\n🏋️ Testing Fitness Templates\n');
console.log('='.repeat(50));

const { pages, colors } = generateFitnessSite(fitnessFixture);

console.log('\n📁 Writing files to:', OUTPUT_DIR);

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(OUTPUT_DIR, 'src'))) {
  fs.mkdirSync(path.join(OUTPUT_DIR, 'src'), { recursive: true });
}
if (!fs.existsSync(path.join(OUTPUT_DIR, 'src/pages'))) {
  fs.mkdirSync(path.join(OUTPUT_DIR, 'src/pages'), { recursive: true });
}

// Write App.jsx
fs.writeFileSync(path.join(OUTPUT_DIR, 'src/App.jsx'), pages['App']);
console.log('   ✓ src/App.jsx');

// Write page files
for (const [pageName, content] of Object.entries(pages)) {
  if (pageName !== 'App') {
    fs.writeFileSync(path.join(OUTPUT_DIR, `src/pages/${pageName}.jsx`), content);
    console.log(`   ✓ src/pages/${pageName}.jsx`);
  }
}

// Write package.json
const packageJson = {
  name: 'iron-peak-fitness',
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview'
  },
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
console.log('   ✓ package.json');

// Write vite.config.js
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5195
  }
});
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'vite.config.js'), viteConfig);
console.log('   ✓ vite.config.js');

// Write index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${fitnessFixture.business.name}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);
console.log('   ✓ index.html');

// Write main.jsx
const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'src/main.jsx'), mainJsx);
console.log('   ✓ src/main.jsx');

console.log('\n' + '='.repeat(50));
console.log('✅ Fitness site generated successfully!');
console.log('\nTo run the site:');
console.log(`   cd ${OUTPUT_DIR}`);
console.log('   npm install');
console.log('   npm run dev');
console.log('\nThen open http://localhost:5195');
console.log('='.repeat(50) + '\n');
