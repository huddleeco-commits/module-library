import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';

const NAV_LINKS = [
      { path: '/', label: 'Home' },
      { path: '/menu', label: 'Menu' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
      { path: '/services', label: 'Services' },
      { path: '/gallery', label: 'Gallery' },
      { path: '/testimonials', label: 'Testimonials' }
    ];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>AI Test Bakery</Link>
        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '#8B4513' : '#3E2723'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={styles.contact}>
          <a href="tel:4155559876" style={styles.phone}><Phone size={16} /> (415) 555-9876</a>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#8B4513', textDecoration: 'none' },
  links: { display: 'flex', gap: '32px' },
  link: { fontSize: '15px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' },
  contact: { display: 'flex', alignItems: 'center', gap: '8px' },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '#8B4513', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }
};
