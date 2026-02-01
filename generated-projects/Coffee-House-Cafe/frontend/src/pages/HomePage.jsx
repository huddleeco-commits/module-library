/**
 * Coffee House Cafe - Home Page
 * Generated with Smart Template Mode
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Where Every Cup Tells a Story</h1>
          <p style={styles.heroSubtext}>Crafted with passion in the heart of Dallas, we serve exceptional coffee that brings neighbors together daily.</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryCta}>Reserve Your Spot</Link>
            <Link to="/about" style={styles.secondaryCta}>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section style={styles.quickInfo}>
        <div style={styles.infoItem}><MapPin size={20} /> <span>Dallas, Texas</span></div>
        <div style={styles.infoItem}><Phone size={20} /> <span>(214) 555-1234</span></div>
      </section>

      {/* About Preview */}
      <section style={styles.aboutPreview}>
        <h2 style={styles.sectionTitle}>About Coffee House Cafe</h2>
        <p style={styles.aboutText}>For five years, Coffee House Cafe has been Dallas's beloved neighborhood gathering spot, where every cup tells a story of passion and precision. We're more than just another cafe—we're coffee artisans...</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      

      {/* Location Content */}
      
      <section style={styles.locationSection}>
        <h2 style={styles.sectionTitle}>Proudly Serving Dallas, Texas</h2>
        <p style={styles.locationText}>At Coffee House Cafe, we're proud to serve Dallas with the same warmth and quality that makes our city shine as bright as the Reunion Tower. Whether you're fueling up before exploring Deep Ellum's vibrant arts scene or taking a peaceful break from downtown's bustling energy, our expertly crafted coffee celebrates the rich flavors and genuine hospitality that define Big D. From Uptown professionals to Oak Cliff creatives, we're honored to be part of the diverse tapestry that makes Dallas such an incredible place to call home.</p>
      </section>
      

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>Taste the Difference</Link>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #8B451322 0%, #D2691E22 100%)',
    padding: '60px 24px'
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: '800px'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '24px',
    lineHeight: 1.2
  },
  heroSubtext: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#2C1810',
    opacity: 0.8,
    marginBottom: '32px'
  },
  heroCtas: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryCta: {
    background: '#8B4513',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px'
  },
  secondaryCta: {
    background: 'transparent',
    color: '#8B4513',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid #8B4513'
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    background: '#8B4513',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  aboutPreview: {
    padding: '80px 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '24px'
  },
  aboutText: {
    fontSize: '1.1rem',
    color: '#2C1810',
    opacity: 0.8,
    lineHeight: 1.7,
    marginBottom: '16px'
  },
  link: {
    color: '#8B4513',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500'
  },
  testimonials: {
    padding: '80px 24px',
    background: '#FFF8F0'
  },
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  testimonialCard: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  testimonialQuote: {
    fontSize: '1rem',
    color: '#2C1810',
    fontStyle: 'italic',
    marginBottom: '16px',
    lineHeight: 1.6
  },
  testimonialAuthor: {
    color: '#8B4513',
    fontWeight: '600'
  },
  locationSection: {
    padding: '80px 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  locationText: {
    fontSize: '1.1rem',
    color: '#2C1810',
    opacity: 0.8,
    lineHeight: 1.7
  },
  ctaSection: {
    padding: '80px 24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px'
  }
};
