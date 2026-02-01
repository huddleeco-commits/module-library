import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';

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
      <div>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: COLORS.primary }}>
            🏥 Wellness Medical Center
          </div>
          <div style={{
            padding: '6px 12px',
            backgroundColor: '#7C3AED15',
            color: '#7C3AED',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Clinical Dashboard Layout
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}