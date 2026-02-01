/**
 * Test Healthcare Page Generation
 * Run: node lib/page-templates/test-healthcare.cjs
 */

const fs = require('fs');
const path = require('path');

// Load healthcare fixture
const fixturesDir = path.join(__dirname, '..', '..', 'test-fixtures');
const healthcareFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'healthcare.json'), 'utf8'));

// Load generators
const { generateHomePage } = require('./healthcare/HomePage.cjs');
const { generateServicesPage } = require('./healthcare/ServicesPage.cjs');
const { generateProvidersPage } = require('./healthcare/ProvidersPage.cjs');
const { generatePatientPortalPage } = require('./healthcare/PatientPortalPage.cjs');
const { generateAppointmentsPage } = require('./healthcare/AppointmentsPage.cjs');
const { generateInsurancePage } = require('./healthcare/InsurancePage.cjs');
const { generateAboutPage } = require('./healthcare/AboutPage.cjs');
const { generateContactPage } = require('./healthcare/ContactPage.cjs');

// Output directory
const outputDir = path.join(__dirname, '..', '..', 'test-output', 'healthcare-test');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(path.join(outputDir, 'src', 'pages'))) {
  fs.mkdirSync(path.join(outputDir, 'src', 'pages'), { recursive: true });
}

console.log('\n🏥 Healthcare Page Template Test');
console.log('================================');
console.log(`Business: ${healthcareFixture.business.name}`);
console.log(`Location: ${healthcareFixture.business.location}`);
console.log(`Output: ${outputDir}\n`);

// Generate all pages
const pages = [
  { name: 'HomePage', generator: generateHomePage },
  { name: 'ServicesPage', generator: generateServicesPage },
  { name: 'ProvidersPage', generator: generateProvidersPage },
  { name: 'PatientPortalPage', generator: generatePatientPortalPage },
  { name: 'AppointmentsPage', generator: generateAppointmentsPage },
  { name: 'InsurancePage', generator: generateInsurancePage },
  { name: 'AboutPage', generator: generateAboutPage },
  { name: 'ContactPage', generator: generateContactPage }
];

let successCount = 0;
let errorCount = 0;

for (const page of pages) {
  try {
    const content = page.generator(healthcareFixture, {});
    const filePath = path.join(outputDir, 'src', 'pages', `${page.name}.jsx`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${page.name}.jsx`);
    successCount++;
  } catch (error) {
    console.log(`❌ ${page.name}: ${error.message}`);
    errorCount++;
  }
}

// Generate App.jsx with routes
const appJsx = `/**
 * App.jsx - Healthcare Business
 * Business: ${healthcareFixture.business.name}
 * Generated: ${new Date().toISOString()}
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ProvidersPage from './pages/ProvidersPage';
import PatientPortalPage from './pages/PatientPortalPage';
import AppointmentsPage from './pages/AppointmentsPage';
import InsurancePage from './pages/InsurancePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const COLORS = ${JSON.stringify(healthcareFixture.theme.colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link to="/" style={{
              fontSize: '20px',
              fontWeight: '700',
              color: COLORS.primary,
              textDecoration: 'none'
            }}>
              🏥 ${healthcareFixture.business.name}
            </Link>

            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link to="/" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Home</Link>
              <Link to="/services" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Services</Link>
              <Link to="/providers" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Providers</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/contact" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Contact</Link>
            </nav>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/patient-portal" style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: COLORS.primary,
                border: \`2px solid \${COLORS.primary}\`,
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Patient Portal
              </Link>
              <Link to="/appointments" style={{
                padding: '10px 20px',
                backgroundColor: COLORS.primary,
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Book Appointment
              </Link>
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/patient-portal" element={<PatientPortalPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>

        {/* Footer */}
        <footer style={{
          backgroundColor: COLORS.text,
          color: 'white',
          padding: '60px 20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px'
          }}>
            <div>
              <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>🏥 ${healthcareFixture.business.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>${healthcareFixture.business.tagline}</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontWeight: '600' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/services" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Services</Link>
                <Link to="/providers" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Our Providers</Link>
                <Link to="/patient-portal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Patient Portal</Link>
                <Link to="/appointments" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Book Appointment</Link>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontWeight: '600' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.7 }}>
                <p>${healthcareFixture.business.phone}</p>
                <p>${healthcareFixture.business.email}</p>
                <p>${healthcareFixture.business.address}</p>
              </div>
            </div>
          </div>
          <div style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            opacity: 0.5
          }}>
            © ${new Date().getFullYear()} ${healthcareFixture.business.name}. All rights reserved.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
`;

fs.writeFileSync(path.join(outputDir, 'src', 'App.jsx'), appJsx);
console.log(`✅ App.jsx (with routes)`);

// Generate package.json
const packageJson = {
  name: 'wellness-medical-center',
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

fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log(`✅ package.json`);

// Generate index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${healthcareFixture.business.tagline}">
  <title>${healthcareFixture.business.name}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏥</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${healthcareFixture.theme.fonts.heading.replace(' ', '+')}:wght@400;500;600;700&family=${healthcareFixture.theme.fonts.body.replace(' ', '+')}:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: '${healthcareFixture.theme.fonts.body}', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${healthcareFixture.theme.fonts.heading}', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
console.log(`✅ index.html`);

// Generate main.jsx
const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

fs.writeFileSync(path.join(outputDir, 'src', 'main.jsx'), mainJsx);
console.log(`✅ main.jsx`);

// Generate vite.config.js
const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
`;

fs.writeFileSync(path.join(outputDir, 'vite.config.js'), viteConfig);
console.log(`✅ vite.config.js`);

console.log('\n================================');
console.log(`✅ Generated ${successCount} pages`);
if (errorCount > 0) {
  console.log(`❌ ${errorCount} errors`);
}
console.log(`\n📁 Output: ${outputDir}`);
console.log('\nTo run:');
console.log(`  cd "${outputDir}"`);
console.log('  npm install');
console.log('  npm run dev');
console.log('\n🎉 Healthcare business generated with ZERO AI cost!\n');
