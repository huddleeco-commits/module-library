import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProvidersPage from './pages/ProvidersPage';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background || '#FAFAFA' }}>
        {/* Navigation */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link to="/" style={{
              fontWeight: '700',
              fontSize: '20px',
              color: COLORS.primary,
              textDecoration: 'none'
            }}>
              Wellness Medical Center
            </Link>

            <nav style={{ display: 'flex', gap: '24px' }}>
              <Link to="/" style={{ color: COLORS.text || '#1F2937', textDecoration: 'none', fontWeight: '500' }}>
                Home
              </Link>
              <Link to="/services" style={{ color: COLORS.text || '#1F2937', textDecoration: 'none', fontWeight: '500' }}>
                Services
              </Link>
              <Link to="/about" style={{ color: COLORS.text || '#1F2937', textDecoration: 'none', fontWeight: '500' }}>
                About
              </Link>
              <Link to="/contact" style={{ color: COLORS.text || '#1F2937', textDecoration: 'none', fontWeight: '500' }}>
                Contact
              </Link>
            </nav>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
        </Routes>

        {/* Footer */}
        <footer style={{
          backgroundColor: COLORS.text || '#1F2937',
          color: 'white',
          padding: '60px 20px 40px',
          marginTop: 'auto'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Wellness Medical Center</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>Comprehensive Care for Your Whole Family</p>
            <p style={{ fontSize: '14px', opacity: 0.5 }}>
              © 2026 Wellness Medical Center. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
