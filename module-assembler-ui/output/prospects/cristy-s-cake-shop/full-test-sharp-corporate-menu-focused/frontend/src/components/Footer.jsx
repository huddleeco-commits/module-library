import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, BarChart3, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h3 style={styles.name}>Cristy's Cake Shop</h3>
          <p style={styles.tagline}>Proudly serving our community</p>
        </div>
        <div style={styles.info}>
          <p style={styles.item}><MapPin size={16} /> 3721 Justin Rd #150, Flower Mound, TX 75028, USA</p>
          <p style={styles.item}><Phone size={16} /> (214) 513-2253</p>
        </div>
        <div style={styles.copyright}>
          <p>&copy; 2026 Cristy's Cake Shop. All rights reserved.</p>
          <Link to="/_index" style={styles.dashboardLink}>
            <BarChart3 size={14} /> Site Dashboard & Metrics
          </Link>
        </div>
        <div style={styles.powered}>
          <a href="https://be1st.io" target="_blank" rel="noopener noreferrer" style={styles.poweredLink}>
            <Zap size={14} style={{ color: '#10B981' }} />
            <span style={styles.poweredBlink}>Blink</span>
            <span style={styles.poweredBy}>by</span>
            <span style={styles.poweredBe1st}>BE1st</span>
            <span style={styles.poweredYear}>• ${new Date().getFullYear()}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#3E2723', color: '#fff', padding: '48px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '32px' },
  brand: {},
  name: { fontSize: '24px', fontWeight: '700', marginBottom: '8px' },
  tagline: { opacity: 0.8, fontSize: '14px' },
  info: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.9 },
  copyright: { opacity: 0.6, fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' },
  dashboardLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '8px 16px', background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', opacity: 1 },
  powered: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '8px', textAlign: 'center' },
  poweredLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' },
  poweredBlink: { background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', fontSize: '14px' },
  poweredBy: { color: '#6B7280', fontSize: '12px' },
  poweredBe1st: { color: '#fff', fontWeight: '600', fontSize: '14px' },
  poweredYear: { color: '#6B7280', fontSize: '12px' }
};
