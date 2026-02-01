import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

const NAV_LINKS = [
      { path: '/', label: 'Home' },
      { path: '/services', label: 'Services' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' }
    ];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>Classic Cuts Barbershop</Link>
        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '#1A1A2E' : '#1A1A2E'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={styles.contact}>
          <a href="tel:9725551001" style={styles.phone}><Phone size={16} /> 972-555-1001</a>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#1A1A2E' },
  links: { display: 'flex', gap: '32px' },
  link: { fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' },
  contact: { display: 'flex', alignItems: 'center', gap: '8px' },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '#1A1A2E', fontWeight: '500', fontSize: '14px' }
};
