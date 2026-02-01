import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, Award, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { number: '6+', label: 'Years of Excellence' },
    { number: '50K+', label: 'Happy Customers' },
    { number: '100%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, title: 'Secure Checkout', desc: '100% protected payments' },
    { icon: Award, title: 'Quality Guaranteed', desc: 'Fresh or your money back' },
    { icon: Heart, title: 'Made with Care', desc: 'Handcrafted with love' }
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>Our Story</span>
          <h1 style={styles.heroTitle}>Cristy's Cake Shop</h1>
          <p style={styles.heroSubtitle}>Handcrafted Baked Goods, Made Fresh Daily</p>
        </div>
      </section>

      <section style={styles.stats}>
        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.mission}>
        <div style={styles.container}>
          <div style={styles.missionGrid}>
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920" alt="Our mission" style={styles.missionImage} />
            <div style={styles.missionContent}>
              <h2 style={styles.sectionTitle}>Our Mission</h2>
              <p style={styles.missionText}>
                Since 2020, we've been on a mission to deliver the finest artisan products
                right to your doorstep. What began as a small family operation has grown into
                a nationwide brand, but our commitment to quality remains unchanged.
              </p>
              <p style={styles.missionText}>
                Every item is crafted with care using premium ingredients, then carefully
                packaged to arrive fresh at your door. We believe everyone deserves access
                to exceptional quality, no matter where they live.
              </p>
              <Link to="/menu" style={styles.cta}>Shop Now <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.container}>
          <div style={styles.featuresGrid}>
            {features.map((feature, i) => (
              <div key={i} style={styles.featureCard}>
                <feature.icon size={28} color="#8B4513" />
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#0f172a', minHeight: '100vh' },
  hero: { padding: '80px 24px', textAlign: 'center', background: '#1e293b' },
  heroContent: { maxWidth: '700px', margin: '0 auto' },
  badge: { display: 'inline-block', background: '#8B4513', color: '#fff', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', marginBottom: '20px' },
  heroTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' },
  heroSubtitle: { color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 },
  stats: { padding: '48px 24px', background: '#8B4513' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' },
  statCard: { color: '#fff' },
  statNumber: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '4px' },
  statLabel: { opacity: 0.9 },
  mission: { padding: '80px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  missionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  missionImage: { width: '100%', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  missionContent: {},
  sectionTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '20px' },
  missionText: { color: '#94a3b8', lineHeight: 1.8, marginBottom: '16px' },
  cta: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#8B4513', color: '#fff', padding: '14px 28px', borderRadius: '16px', textDecoration: 'none', fontWeight: '600', marginTop: '8px' },
  features: { padding: '80px 20px', background: '#1e293b' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
  featureCard: { background: '#1e293b', padding: '28px', borderRadius: '16px', textAlign: 'center' },
  featureTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc', margin: '12px 0 8px' },
  featureDesc: { color: '#94a3b8', fontSize: '0.95rem' }
};
