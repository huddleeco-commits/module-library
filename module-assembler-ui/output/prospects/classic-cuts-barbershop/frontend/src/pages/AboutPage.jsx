import React from 'react';
import { Award, Users, Heart, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>About Classic Cuts Barbershop</h1>
          <p style={styles.subtitle}>Learn more about who we are and what drives us</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.story}>
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.text}>
              Classic Cuts Barbershop was founded with a simple mission: to provide outstanding general services
              to our local community. We believe in building lasting relationships with our customers
              through quality, reliability, and genuine care.
            </p>
            <p style={styles.text}>
              Located in 2145 Main St, Lewisville TX 75067, we're proud to be a part of this wonderful community.
              Every day, we strive to exceed expectations and deliver an experience that keeps
              our customers coming back.
            </p>
          </div>

          <div style={styles.values}>
            <h2 style={styles.sectionTitle}>Our Values</h2>
            <div style={styles.valueGrid}>
              <div style={styles.valueCard}>
                <Award size={28} color="#1A1A2E" />
                <h3>Excellence</h3>
                <p>We never settle for anything less than our best.</p>
              </div>
              <div style={styles.valueCard}>
                <Users size={28} color="#1A1A2E" />
                <h3>Community</h3>
                <p>We're neighbors first, business second.</p>
              </div>
              <div style={styles.valueCard}>
                <Heart size={28} color="#1A1A2E" />
                <h3>Passion</h3>
                <p>We love what we do and it shows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '#1A1A2E', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  story: { marginBottom: '60px' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: '600', color: '#1A1A2E', marginBottom: '24px' },
  text: { fontSize: '1.1rem', lineHeight: 1.8, color: '#1A1A2E', opacity: 0.85, marginBottom: '16px' },
  values: {},
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' },
  valueCard: { padding: '24px', background: '#f9fafb', borderRadius: '12px', textAlign: 'center' }
};
