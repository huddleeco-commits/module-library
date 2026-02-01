import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ReservationsPage from './pages/ReservationsPage';
import CateringPage from './pages/CateringPage';
import GalleryPage from './pages/GalleryPage';

const COLORS = {
  "primary": "#E63946",
  "secondary": "#F4A261",
  "accent": "#2A9D8F",
  "background": "#1D3557",
  "text": "#F1FAEE"
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
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
              fontSize: '24px',
              color: COLORS.primary,
              textDecoration: 'none'
            }}>
              Test Pizza Co
            </Link>

            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link to="/menu" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Menu</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/gallery" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Gallery</Link>
              <Link to="/contact" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Contact</Link>
              <Link to="/reservations" style={{
                backgroundColor: COLORS.primary,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Reserve Table
              </Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Routes>

        {/* Footer */}
        <footer style={{
          backgroundColor: COLORS.text,
          color: 'white',
          padding: '60px 20px 40px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Test Pizza Co</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>Artisan pizzas crafted with passion</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Hours</h4>
              <p style={{ opacity: 0.7 }}>Mon-Thu: 11am - 10pm</p>
              <p style={{ opacity: 0.7 }}>Fri-Sat: 11am - 11pm</p>
              <p style={{ opacity: 0.7 }}>Sun: 10am - 9pm</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Contact</h4>
              <p style={{ opacity: 0.7 }}>123 Main Street, Austin, TX 78701</p>
              <p style={{ opacity: 0.7 }}>(555) 123-4567</p>
              <p style={{ opacity: 0.7 }}>hello@testpizzaco.com</p>
            </div>
          </div>
          <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p style={{ opacity: 0.5, fontSize: '14px' }}>© 2026 Test Pizza Co. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
