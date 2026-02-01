import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h3 style={styles.name}>Classic Cuts Barbershop</h3>
          <p style={styles.tagline}>Proudly serving our community</p>
        </div>
        <div style={styles.info}>
          <p style={styles.item}><MapPin size={16} /> 2145 Main St, Lewisville TX 75067</p>
          <p style={styles.item}><Phone size={16} /> 972-555-1001</p>
        </div>
        <div style={styles.copyright}>
          <p>&copy; 2026 Classic Cuts Barbershop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1A1A2E', color: '#fff', padding: '48px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '32px' },
  brand: {},
  name: { fontSize: '24px', fontWeight: '700', marginBottom: '8px' },
  tagline: { opacity: 0.8, fontSize: '14px' },
  info: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.9 },
  copyright: { opacity: 0.6, fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }
};
