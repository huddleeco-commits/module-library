/**
 * Education Industry Templates
 * Covers: Schools, Training Centers, Tutoring
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateProgramsPage } = require('./ProgramsPage.cjs');
const { generateAdmissionsPage } = require('./AdmissionsPage.cjs');
const { generateFacultyPage } = require('./FacultyPage.cjs');
const { generateCampusPage } = require('./CampusPage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');

const EDUCATION_PAGES = {
  home: { name: 'Homepage', generator: generateHomePage },
  programs: { name: 'Programs', generator: generateProgramsPage },
  admissions: { name: 'Admissions', generator: generateAdmissionsPage },
  faculty: { name: 'Faculty', generator: generateFacultyPage },
  campus: { name: 'Campus', generator: generateCampusPage },
  about: { name: 'About', generator: generateAboutPage },
  contact: { name: 'Contact', generator: generateContactPage }
};

function generateEducationSite(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors || getDefaultColors(business.industry);

  console.log(`\n🎓 Generating Education Site: ${business.name}`);

  const pages = {};
  for (const [pageId, config] of Object.entries(EDUCATION_PAGES)) {
    console.log(`   📄 Generating ${config.name}...`);
    pages[`${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] = config.generator(fixture, { colors });
  }

  pages['App'] = generateAppJsx(fixture, colors);
  return { pages, colors };
}

function getDefaultColors(industry) {
  const schemes = {
    'school': { primary: '#1E40AF', secondary: '#3B82F6', accent: '#F59E0B', background: '#F8FAFC', text: '#1E293B' },
    'training': { primary: '#059669', secondary: '#10B981', accent: '#F59E0B', background: '#F0FDF4', text: '#1E293B' },
    'tutoring': { primary: '#7C3AED', secondary: '#8B5CF6', accent: '#EC4899', background: '#FAF5FF', text: '#1E293B' }
  };
  return schemes[industry] || schemes['school'];
}

function generateAppJsx(fixture, colors) {
  const { business } = fixture;
  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProgramsPage from './pages/ProgramsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import FacultyPage from './pages/FacultyPage';
import CampusPage from './pages/CampusPage';
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
              <Link to="/programs" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Programs</Link>
              <Link to="/admissions" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Admissions</Link>
              <Link to="/faculty" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Faculty</Link>
              <Link to="/campus" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Campus</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/admissions" style={{ backgroundColor: COLORS.primary, color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Apply Now</Link>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/campus" element={<CampusPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <footer style={{ backgroundColor: COLORS.primary, color: 'white', padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '20px' }}>${business.name}</h4>
                <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: 1.6 }}>${business.tagline || 'Empowering minds, shaping futures'}</p>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.7 }}>Academics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/programs" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Programs</Link>
                  <Link to="/faculty" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Faculty</Link>
                  <Link to="/campus" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Campus Life</Link>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.7 }}>Admissions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/admissions" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Apply Now</Link>
                  <Link to="/admissions" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Requirements</Link>
                  <Link to="/contact" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Schedule Visit</Link>
                </div>
              </div>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', opacity: 0.7 }}>Connect</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/contact" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link>
                  <Link to="/about" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '14px' }}>About Us</Link>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', opacity: 0.6 }}>© ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}`;
}

module.exports = { EDUCATION_PAGES, generateEducationSite, getDefaultColors };
