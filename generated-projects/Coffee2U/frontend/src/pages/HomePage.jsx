/**
 * Coffee2U - Home Page
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
          <h1 style={styles.heroTitle}>Your Perfect Cup, Delivered With Care</h1>
          <p style={styles.heroSubtext}>Experience Dallas's finest artisan coffee crafted with premium beans and served with genuine warmth every single time.</p>
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryCta}>Reserve Your Brew</Link>
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
        <h2 style={styles.sectionTitle}>About Coffee2U</h2>
        <p style={styles.aboutText}>Born from a simple belief that exceptional coffee should be accessible to everyone, Coffee2U has been Dallas's neighborhood gathering place for five years. We're passionate about sourcing the finest b...</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      
      <section style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Coffee2U has become my Monday-through-Friday ritual! As someone who's incredibly picky about my morning latte, I can honestly say their baristas nail it every single time. The beans have this amazing rich flavor without any bitterness, and they actually remember how I like my drink prepared. It's those little touches that make rushing between meetings so much better.]"</p>
            <p style={styles.testimonialAuthor}>- Sarah, Marketing Executive</p>
          </div>
          
        </div>
      </section>
      

      {/* Location Content */}
      
      <section style={styles.locationSection}>
        <h2 style={styles.sectionTitle}>Proudly Serving Dallas, Texas</h2>
        <p style={styles.locationText}>Whether you're catching up with friends in Deep Ellum or need that perfect morning brew before heading to the Arts District, Coffee2U brings premium, locally-roasted coffee right to your Dallas doorstep. We're proud to serve our fellow Dallasites with the same Big D spirit that makes our city great – delivering exceptional quality and genuine hospitality from Downtown to Uptown and everywhere in between.</p>
      </section>
      

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>Taste Quality Now</Link>
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
