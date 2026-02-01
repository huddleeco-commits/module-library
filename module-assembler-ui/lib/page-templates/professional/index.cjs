/**
 * Professional Services Industry Templates
 * Covers: Law Firm, Real Estate, Plumber, Cleaning, Auto Shop
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateServicesPage } = require('./ServicesPage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');
const { generateTeamPage } = require('./TeamPage.cjs');
const { generateTestimonialsPage } = require('./TestimonialsPage.cjs');
const { generateFAQPage } = require('./FAQPage.cjs');

const PROFESSIONAL_PAGES = {
  home: { name: 'Homepage', generator: generateHomePage },
  services: { name: 'Services', generator: generateServicesPage },
  about: { name: 'About', generator: generateAboutPage },
  team: { name: 'Team', generator: generateTeamPage },
  testimonials: { name: 'Testimonials', generator: generateTestimonialsPage },
  faq: { name: 'FAQ', generator: generateFAQPage },
  contact: { name: 'Contact', generator: generateContactPage }
};

function generateProfessionalSite(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors || getDefaultColors(business.industry);

  console.log(`\n🏢 Generating Professional Site: ${business.name}`);

  const pages = {};
  for (const [pageId, config] of Object.entries(PROFESSIONAL_PAGES)) {
    console.log(`   📄 Generating ${config.name}...`);
    pages[`${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] = config.generator(fixture, { colors });
  }

  pages['App'] = generateAppJsx(fixture, colors);
  return { pages, colors };
}

function getDefaultColors(industry) {
  const schemes = {
    'law-firm': { primary: '#1E3A5F', secondary: '#2D5A87', accent: '#C9A961', background: '#F8F9FA', text: '#1F2937' },
    'real-estate': { primary: '#0D47A1', secondary: '#1976D2', accent: '#FF8F00', background: '#FAFAFA', text: '#1F2937' },
    'plumber': { primary: '#1565C0', secondary: '#42A5F5', accent: '#FFA726', background: '#F5F5F5', text: '#1F2937' },
    'cleaning': { primary: '#00897B', secondary: '#26A69A', accent: '#7CB342', background: '#F0FDF4', text: '#1F2937' },
    'auto-shop': { primary: '#D32F2F', secondary: '#F44336', accent: '#FFC107', background: '#FAFAFA', text: '#1F2937' }
  };
  return schemes[industry] || schemes['law-firm'];
}

function generateAppJsx(fixture, colors) {
  const { business } = fixture;
  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import TestimonialsPage from './pages/TestimonialsPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
        <header style={{ backgroundColor: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ fontWeight: '700', fontSize: '24px', color: COLORS.primary, textDecoration: 'none' }}>${business.name}</Link>
            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link to="/services" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Services</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/team" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Team</Link>
              <Link to="/testimonials" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Reviews</Link>
              <Link to="/contact" style={{ backgroundColor: COLORS.primary, color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Contact Us</Link>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <footer style={{ backgroundColor: COLORS.primary, color: 'white', padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>${business.name}</h3>
            <p style={{ opacity: 0.8, marginBottom: '24px' }}>${business.tagline || 'Professional Service You Can Trust'}</p>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>© ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}`;
}

module.exports = { PROFESSIONAL_PAGES, generateProfessionalSite, getDefaultColors };
