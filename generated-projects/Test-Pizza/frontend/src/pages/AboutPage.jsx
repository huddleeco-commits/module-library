/**
 * Test Pizza - About Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { MapPin, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About Test Pizza</h1>
        <p style={styles.heroSubtext}>Learn more about who we are and what drives us</p>
      </section>

      {/* Our Story */}
      <section style={styles.storySection}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.storyText}>Test Pizza has been proudly serving the Dallas, TX community with exceptional pizza services. Our dedicated team is committed to providing you with an outstanding experience every time you visit.</p>
        <p style={styles.storyText}>Proudly serving Dallas, TX and the surrounding community.</p>
      </section>

      {/* Values */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>What We Stand For</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <Award size={32} color="#3b82f6" />
            <h3 style={styles.valueTitle}>Quality</h3>
            <p style={styles.valueText}>We never compromise on the quality of our products and services.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="#3b82f6" />
            <h3 style={styles.valueTitle}>Community</h3>
            <p style={styles.valueText}>We're proud to be part of the Dallas, TX community.</p>
          </div>
          <div style={styles.valueCard}>
            <Heart size={32} color="#3b82f6" />
            <h3 style={styles.valueTitle}>Passion</h3>
            <p style={styles.valueText}>We love what we do and it shows in everything we create.</p>
          </div>
        </div>
      </section>

      
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 80px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #3b82f611 0%, #8b5cf611 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.7
  },
  storySection: {
    padding: '80px 24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '24px',
    textAlign: 'center'
  },
  storyText: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.8,
    lineHeight: 1.8,
    marginBottom: '16px'
  },
  valuesSection: {
    padding: '80px 24px',
    background: '#f8fafc'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  valueCard: {
    textAlign: 'center',
    padding: '32px'
  },
  valueTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '16px 0 8px'
  },
  valueText: {
    color: '#1a1a2e',
    opacity: 0.7
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '64px',
    padding: '80px 24px',
    background: '#3b82f6',
    flexWrap: 'wrap'
  },
  stat: {
    textAlign: 'center',
    color: '#ffffff'
  },
  statNumber: {
    display: 'block',
    fontSize: '3rem',
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9
  }
};
