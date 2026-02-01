/**
 * Coffee2U - About Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { MapPin, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About Coffee2U</h1>
        <p style={styles.heroSubtext}>Learn more about who we are and what drives us</p>
      </section>

      {/* Our Story */}
      <section style={styles.storySection}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.storyText}>Born from a simple belief that exceptional coffee should be accessible to everyone, Coffee2U has been Dallas's neighborhood gathering place for five years. We're passionate about sourcing the finest beans from sustainable farms and crafting each cup with meticulous care. What sets us apart isn't just our expertly roasted coffee—it's the genuine connections we build with every guest who walks through our doors. From our skilled baristas who know your order by heart to our cozy atmosphere that feels like home, we're dedicated to making every visit an experience worth savoring. Welcome to your coffee sanctuary.</p>
        <p style={styles.storyText}>Whether you're catching up with friends in Deep Ellum or need that perfect morning brew before heading to the Arts District, Coffee2U brings premium, locally-roasted coffee right to your Dallas doorstep. We're proud to serve our fellow Dallasites with the same Big D spirit that makes our city great – delivering exceptional quality and genuine hospitality from Downtown to Uptown and everywhere in between.</p>
      </section>

      {/* Values */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>What We Stand For</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <Award size={32} color="#8B4513" />
            <h3 style={styles.valueTitle}>Quality</h3>
            <p style={styles.valueText}>We never compromise on the quality of our products and services.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="#8B4513" />
            <h3 style={styles.valueTitle}>Community</h3>
            <p style={styles.valueText}>We're proud to be part of the Dallas, Texas community.</p>
          </div>
          <div style={styles.valueCard}>
            <Heart size={32} color="#8B4513" />
            <h3 style={styles.valueTitle}>Passion</h3>
            <p style={styles.valueText}>We love what we do and it shows in everything we create.</p>
          </div>
        </div>
      </section>

      
      {/* Stats */}
      <section style={styles.statsSection}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>5+</span>
          <span style={styles.statLabel}>Years in Business</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>1000+</span>
          <span style={styles.statLabel}>Happy Customers</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>100%</span>
          <span style={styles.statLabel}>Satisfaction</span>
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
    background: 'linear-gradient(135deg, #8B451311 0%, #D2691E11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#2C1810',
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
    color: '#2C1810',
    marginBottom: '24px',
    textAlign: 'center'
  },
  storyText: {
    fontSize: '1.1rem',
    color: '#2C1810',
    opacity: 0.8,
    lineHeight: 1.8,
    marginBottom: '16px'
  },
  valuesSection: {
    padding: '80px 24px',
    background: '#FFF8F0'
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
    color: '#2C1810',
    margin: '16px 0 8px'
  },
  valueText: {
    color: '#2C1810',
    opacity: 0.7
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '64px',
    padding: '80px 24px',
    background: '#8B4513',
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
