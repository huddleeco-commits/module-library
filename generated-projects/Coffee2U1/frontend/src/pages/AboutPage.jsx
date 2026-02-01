/**
 * Coffee2U1 - About Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { MapPin, Award, Users, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>About Coffee2U1</h1>
        <p style={styles.heroSubtext}>Learn more about who we are and what drives us</p>
      </section>

      {/* Our Story */}
      <section style={styles.storySection}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.storyText}>For five years, Coffee2U1 has been Dallas's go-to destination for exceptional coffee experiences. What started as a simple dream to bring quality beans to our community has evolved into something special—a place where passion meets precision in every cup. We source premium beans from sustainable farms worldwide, roasting them fresh to unlock their unique flavor profiles. Our skilled baristas combine artistry with expertise, creating beverages that celebrate coffee's true potential. More than just a café, we're coffee enthusiasts dedicated to sharing our love for the craft with fellow Dallas coffee lovers, one perfectly brewed cup at a time.</p>
        <p style={styles.storyText}>Coffee2U1 brings premium, carefully sourced beans right to your doorstep across Dallas, from the trendy Bishop Arts District to the bustling heart of Deep Ellum. Whether you're working from your Downtown high-rise or relaxing in your Lakewood bungalow, we're passionate about delivering the same exceptional coffee experience that reflects Dallas's commitment to quality and innovation. Our mobile café service celebrates the spirit of Big D by connecting neighborhoods through thoughtfully crafted beverages that fuel this dynamic city.</p>
      </section>

      {/* Values */}
      <section style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>What We Stand For</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <Award size={32} color="#6366f1" />
            <h3 style={styles.valueTitle}>Quality</h3>
            <p style={styles.valueText}>We never compromise on the quality of our products and services.</p>
          </div>
          <div style={styles.valueCard}>
            <Users size={32} color="#6366f1" />
            <h3 style={styles.valueTitle}>Community</h3>
            <p style={styles.valueText}>We're proud to be part of the Dallas, Texas community.</p>
          </div>
          <div style={styles.valueCard}>
            <Heart size={32} color="#6366f1" />
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
    background: 'linear-gradient(135deg, #6366f111 0%, #06b6d411 100%)'
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
    background: '#6366f1',
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
