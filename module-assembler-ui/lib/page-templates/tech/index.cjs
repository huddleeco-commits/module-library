/**
 * Tech Industry Templates
 * Covers: SaaS, E-commerce
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateFeaturesPage } = require('./FeaturesPage.cjs');
const { generatePricingPage } = require('./PricingPage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');
const { generateDemoPage } = require('./DemoPage.cjs');
const { generateBlogPage } = require('./BlogPage.cjs');

const TECH_PAGES = {
  home: { name: 'Homepage', generator: generateHomePage },
  features: { name: 'Features', generator: generateFeaturesPage },
  pricing: { name: 'Pricing', generator: generatePricingPage },
  about: { name: 'About', generator: generateAboutPage },
  demo: { name: 'Demo', generator: generateDemoPage },
  blog: { name: 'Blog', generator: generateBlogPage },
  contact: { name: 'Contact', generator: generateContactPage }
};

function generateTechSite(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors || getDefaultColors(business.industry);

  console.log(`\n💻 Generating Tech Site: ${business.name}`);

  const pages = {};
  for (const [pageId, config] of Object.entries(TECH_PAGES)) {
    console.log(`   📄 Generating ${config.name}...`);
    pages[`${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] = config.generator(fixture, { colors });
  }

  pages['App'] = generateAppJsx(fixture, colors);
  return { pages, colors };
}

function getDefaultColors(industry) {
  const schemes = {
    'saas': { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', background: '#F8FAFC', text: '#1E293B' },
    'ecommerce': { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#F59E0B', background: '#FFFFFF', text: '#1E293B' }
  };
  return schemes[industry] || schemes['saas'];
}

function generateAppJsx(fixture, colors) {
  const { business } = fixture;
  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
        <header style={{ backgroundColor: 'white', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ fontWeight: '700', fontSize: '24px', color: COLORS.primary, textDecoration: 'none' }}>${business.name}</Link>
            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link to="/features" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>Features</Link>
              <Link to="/pricing" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>Pricing</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>About</Link>
              <Link to="/blog" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500', opacity: 0.8 }}>Blog</Link>
              <Link to="/demo" style={{ backgroundColor: COLORS.primary, color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Get Demo</Link>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <footer style={{ backgroundColor: COLORS.text, color: 'white', padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontWeight: '700', marginBottom: '16px' }}>${business.name}</h4>
                <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: 1.6 }}>${business.tagline || 'Building the future of work'}</p>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.6 }}>Product</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/features" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Features</Link>
                  <Link to="/pricing" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
                  <Link to="/demo" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Demo</Link>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.6 }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/about" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>About</Link>
                  <Link to="/blog" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
                  <Link to="/contact" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.6 }}>Legal</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a href="#" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Privacy</a>
                  <a href="#" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Terms</a>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', opacity: 0.5 }}>© ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}`;
}

module.exports = { TECH_PAGES, generateTechSite, getDefaultColors };
