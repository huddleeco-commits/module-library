/**
 * coffee3 - About Page
 */
import React from 'react';
import { Users, Award, Heart, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>About coffee3</h1>
        <p style={styles.subtitle}>Your trusted cafe partner</p>
      </section>

      <section style={styles.story}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.text}>
          For 5 years, coffee3 has been dedicated to providing exceptional
          service to our community in Lewisville, TX. What started as a simple vision
          has grown into something we're truly proud of.
        </p>
      </section>

      <section style={styles.values}>
        <h2 style={styles.sectionTitle}>Our Values</h2>
        <div style={styles.valueGrid}>
          <div style={styles.valueCard}>
            <Heart size={32} color="#6366f1" />
            <h3>Passion</h3>
            <p>We love what we do and it shows in every interaction.</p>
          </div>
          <div style={styles.valueCard}>
            <Award size={32} color="#6366f1" />
            <h3>Excellence</h3>
            <p>We strive for the highest quality in everything we do.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="#6366f1" />
            <h3>Community</h3>
            <p>We're proud to serve and be part of Lewisville, TX.</p>
          </div>
          <div style={styles.valueCard}>
            <Clock size={32} color="#6366f1" />
            <h3>Reliability</h3>
            <p>You can count on us to be there when you need us.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  hero: { padding: '54px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f115 0%, #06b6d415 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '#1a1a2e', opacity: 0.8 },
  story: { padding: '54px 24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '24px' },
  text: { fontSize: '1.1rem', color: '#1a1a2e', opacity: 0.85, lineHeight: 1.8 },
  values: { padding: '54px 24px', background: '#f8fafc' },
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  valueCard: { background: '#ffffff', padding: '22px', borderRadius: '7px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center' }
};
