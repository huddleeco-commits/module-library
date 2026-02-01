/**
 * Salon & Spa Industry Templates
 * Covers: Salon, Spa, Barbershop, Beauty
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateServicesPage } = require('./ServicesPage.cjs');
const { generateTeamPage } = require('./TeamPage.cjs');
const { generateBookingPage } = require('./BookingPage.cjs');
const { generateGalleryPage } = require('./GalleryPage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');

const SALON_PAGES = {
  home: { name: 'Homepage', generator: generateHomePage },
  services: { name: 'Services & Pricing', generator: generateServicesPage },
  team: { name: 'Our Team', generator: generateTeamPage },
  booking: { name: 'Book Appointment', generator: generateBookingPage },
  gallery: { name: 'Gallery', generator: generateGalleryPage },
  about: { name: 'About Us', generator: generateAboutPage },
  contact: { name: 'Contact', generator: generateContactPage }
};

function generateSalonSite(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors || getDefaultColors(business.industry);

  console.log(`\n💇 Generating Salon Site: ${business.name}`);

  const pages = {};
  for (const [pageId, config] of Object.entries(SALON_PAGES)) {
    console.log(`   📄 Generating ${config.name}...`);
    pages[`${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] = config.generator(fixture, { colors });
  }

  pages['App'] = generateAppJsx(fixture, colors);
  return { pages, colors };
}

function getDefaultColors(industry) {
  const schemes = {
    'salon-spa': { primary: '#831843', secondary: '#9D174D', accent: '#F9A8D4', background: '#FDF2F8', text: '#1F2937' },
    'barbershop': { primary: '#1F2937', secondary: '#374151', accent: '#B91C1C', background: '#F9FAFB', text: '#1F2937' }
  };
  return schemes[industry] || schemes['salon-spa'];
}

function generateAppJsx(fixture, colors) {
  const { business } = fixture;
  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import TeamPage from './pages/TeamPage';
import BookingPage from './pages/BookingPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
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
              <Link to="/team" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Team</Link>
              <Link to="/gallery" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Gallery</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/booking" style={{ backgroundColor: COLORS.primary, color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Book Now</Link>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <footer style={{ backgroundColor: COLORS.text, color: 'white', padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>${business.name}</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>${business.tagline || 'Beauty & Wellness'}</p>
            <p style={{ fontSize: '14px', opacity: 0.5 }}>© ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}`;
}

module.exports = { SALON_PAGES, generateSalonSite, getDefaultColors };
