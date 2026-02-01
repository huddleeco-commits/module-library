import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ClassesPage from './pages/ClassesPage';
import MembershipPage from './pages/MembershipPage';
import TrainersPage from './pages/TrainersPage';
import SchedulePage from './pages/SchedulePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const COLORS = {
  "primary": "#DC2626",
  "secondary": "#EF4444",
  "accent": "#FCA5A5",
  "background": "#FEF2F2",
  "text": "#1F2937"
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
        <header style={{ backgroundColor: 'white', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ fontWeight: '700', fontSize: '24px', color: COLORS.primary, textDecoration: 'none' }}>Iron Peak Fitness</Link>
            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link to="/classes" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Classes</Link>
              <Link to="/trainers" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Trainers</Link>
              <Link to="/schedule" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Schedule</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/membership" style={{ backgroundColor: COLORS.primary, color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Join Now</Link>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <footer style={{ backgroundColor: COLORS.text, color: 'white', padding: '60px 20px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Iron Peak Fitness</h3>
            <p style={{ opacity: 0.7, marginBottom: '24px' }}>Push Your Limits. Exceed Your Goals.</p>
            <p style={{ fontSize: '14px', opacity: 0.5 }}>© 2026 Iron Peak Fitness. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}