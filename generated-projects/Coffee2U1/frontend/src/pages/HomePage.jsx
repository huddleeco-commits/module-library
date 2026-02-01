/**
 * Coffee2U1 - Home Page
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
          <h1 style={styles.heroTitle}>Premium Coffee Delivered to Your Dallas Doorstep</h1>
          <p style={styles.heroSubtext}>Experience artisan-roasted beans and handcrafted beverages brought directly to you with the convenience you deserve.</p>
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
        <h2 style={styles.sectionTitle}>About Coffee2U1</h2>
        <p style={styles.aboutText}>For five years, Coffee2U1 has been Dallas's go-to destination for exceptional coffee experiences. What started as a simple dream to bring quality beans to our community has evolved into something spec...</p>
        <Link to="/about" style={styles.link}>Read our story <ArrowRight size={16} /></Link>
      </section>

      {/* Testimonials */}
      
      <section style={styles.testimonials}>
        <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
        <div style={styles.testimonialGrid}>
          
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Quote]"</p>
            <p style={styles.testimonialAuthor}>- Sarah, Remote Worker</p>
          </div>
          
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Quote]"</p>
            <p style={styles.testimonialAuthor}>- Marcus, Local Business Owner</p>
          </div>
          
          <div style={styles.testimonialCard}>
            <p style={styles.testimonialQuote}>"[Quote]"</p>
            <p style={styles.testimonialAuthor}>- Jennifer, Neighborhood Regular</p>
          </div>
          
        </div>
      </section>
      

      {/* Location Content */}
      
      <section style={styles.locationSection}>
        <h2 style={styles.sectionTitle}>Proudly Serving Dallas, Texas</h2>
        <p style={styles.locationText}>Coffee2U1 brings premium, carefully sourced beans right to your doorstep across Dallas, from the trendy Bishop Arts District to the bustling heart of Deep Ellum. Whether you're working from your Downtown high-rise or relaxing in your Lakewood bungalow, we're passionate about delivering the same exceptional coffee experience that reflects Dallas's commitment to quality and innovation. Our mobile café service celebrates the spirit of Big D by connecting neighborhoods through thoughtfully crafted beverages that fuel this dynamic city.</p>
      </section>
      

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get started?</h2>
        <Link to="/contact" style={styles.primaryCta}>Order Premium Coffee</Link>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: 'Poppins', sans-serif
  },
  hero: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f122 0%, #06b6d422 100%)',
    padding: '60px 24px'
  },
  heroContent: {
    textAlign: 'center',
    maxWidth: '800px'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: '600',
    fontFamily: 'Poppins', sans-serif,
    color: '#1a1a2e',
    marginBottom: '24px',
    lineHeight: 1.2,
    letterSpacing: 'normal'
  },
  heroSubtext: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    color: '#1a1a2e',
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
    background: '#6366f1',
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '7px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
  },
  secondaryCta: {
    background: 'transparent',
    color: '#6366f1',
    padding: '14px 32px',
    borderRadius: '7px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '2px solid #6366f1',
    transition: 'all 0.25s ease'
  },
  quickInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '24px',
    background: '#6366f1',
    color: '#ffffff',
    flexWrap: 'wrap'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  aboutPreview: {
    padding: '70px 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    fontFamily: 'Poppins', sans-serif,
    color: '#1a1a2e',
    marginBottom: '24px',
    letterSpacing: 'normal'
  },
  aboutText: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.8,
    lineHeight: 1.7,
    marginBottom: '16px'
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500',
    transition: 'all 0.25s ease'
  },
  testimonials: {
    padding: '70px 24px',
    background: '#f8fafc'
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
    padding: '28px',
    borderRadius: '9px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    transition: 'all 0.25s ease'
  },
  testimonialQuote: {
    fontSize: '1rem',
    color: '#1a1a2e',
    fontStyle: 'italic',
    marginBottom: '16px',
    lineHeight: 1.6
  },
  testimonialAuthor: {
    color: '#6366f1',
    fontWeight: '600'
  },
  locationSection: {
    padding: '70px 24px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  locationText: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.8,
    lineHeight: 1.7
  },
  ctaSection: {
    padding: '70px 24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)'
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '24px'
  }
};
