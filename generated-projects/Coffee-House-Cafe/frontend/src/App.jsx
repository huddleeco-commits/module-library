/**
 * Coffee House Cafe - App
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Coffee House Cafe</Link>

      <div style={styles.desktopNav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            <Link to="/menu" style={styles.navLink}>Menu</Link>
            <Link to="/about" style={styles.navLink}>About</Link>
            <Link to="/team" style={styles.navLink}>Team</Link>
            <Link to="/contact" style={styles.navLink}>Contact</Link>
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={styles.menuButton}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuOpen && (
        <div style={styles.mobileNav}>
            <Link to="/" style={styles.mobileNavLink}>Home</Link>
            <Link to="/menu" style={styles.mobileNavLink}>Menu</Link>
            <Link to="/about" style={styles.mobileNavLink}>About</Link>
            <Link to="/team" style={styles.mobileNavLink}>Team</Link>
            <Link to="/contact" style={styles.mobileNavLink}>Contact</Link>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>&copy; 2026 Coffee House Cafe. All rights reserved.</p>
      <p>Dallas, Texas</p>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navigation />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFF8F0',
    color: '#2C1810'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#FFF8F0',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#8B4513',
    textDecoration: 'none'
  },
  desktopNav: {
    display: 'flex',
    gap: '24px'
  },
  navLink: {
    color: '#2C1810',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    opacity: 0.8
  },
  menuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#2C1810',
    cursor: 'pointer'
  },
  mobileNav: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFF8F0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  },
  mobileNavLink: {
    color: '#2C1810',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 0'
  },
  main: {
    flex: 1
  },
  footer: {
    textAlign: 'center',
    padding: '40px 24px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    color: '#2C1810',
    opacity: 0.7
  }
};

export default App;
