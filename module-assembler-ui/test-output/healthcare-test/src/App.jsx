/**
 * App.jsx - Healthcare Business
 * Business: Wellness Medical Center
 * Generated: 2026-01-23T20:33:57.162Z
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
              🏥 Wellness Medical Center
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
                border: `2px solid ${COLORS.primary}`,
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
              <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>🏥 Wellness Medical Center</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>Comprehensive Care for Your Whole Family</p>
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
                <p>(555) 789-CARE</p>
                <p>appointments@wellnessmedical-demo.com</p>
                <p>200 Health Plaza, Boston, MA 02108</p>
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
            © 2026 Wellness Medical Center. All rights reserved.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
