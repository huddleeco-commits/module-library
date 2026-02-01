import React from 'react';
import { Heart, Award, Users, Clock, Star, MapPin } from 'lucide-react';

export default function AboutPage() {
  const milestones = [
    { year: '2020', event: 'Founded with a dream and a family recipe' },
    { year: '2022', event: 'Opened our first storefront' },
    { year: '2025', event: 'Expanded to serve the whole community' },
    { year: 'Today', event: 'Proudly serving neighbors like you' }
  ];

  const values = [
    { icon: Heart, title: 'Made with Love', desc: 'Every item is crafted with care and passion' },
    { icon: Award, title: 'Quality First', desc: 'We use only the finest ingredients' },
    { icon: Users, title: 'Community', desc: 'Our neighbors are our family' }
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Story</h1>
          <p style={styles.heroSubtitle}>A family tradition since 2020</p>
        </div>
      </section>

      <section style={styles.story}>
        <div style={styles.container}>
          <div style={styles.storyGrid}>
            <div style={styles.storyImage}>
              <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920" alt="Our story" style={styles.storyImg} />
            </div>
            <div style={styles.storyContent}>
              <h2 style={styles.sectionTitle}>How It All Started</h2>
              <p style={styles.storyText}>
                AI Test Bakery began with a simple dream: to share our family recipes with the community.
                What started in a small kitchen has grown into a beloved neighborhood destination.
              </p>
              <p style={styles.storyText}>
                For over 6 years, we've been waking up before dawn
                to bring you the freshest baked goods. Every recipe has been passed down through generations,
                and we take pride in keeping those traditions alive.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.values}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>What We Believe In</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, i) => (
              <div key={i} style={styles.valueCard}>
                <value.icon size={32} color="#8B4513" />
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueDesc}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.timeline}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitleCenter}>Our Journey</h2>
          <div style={styles.milestones}>
            {milestones.map((m, i) => (
              <div key={i} style={styles.milestone}>
                <div style={styles.milestoneYear}>{m.year}</div>
                <div style={styles.milestoneDot} />
                <div style={styles.milestoneEvent}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', minHeight: '100vh' },
  hero: { position: 'relative', height: '50vh', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))' },
  heroContent: { position: 'relative', textAlign: 'center', color: '#fff' },
  heroTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '700', marginBottom: '12px' },
  heroSubtitle: { fontSize: '1.25rem', opacity: 0.9 },
  story: { padding: '80px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  storyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  storyImage: {},
  storyImg: { width: '100%', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' },
  storyContent: {},
  sectionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', marginBottom: '20px' },
  sectionTitleCenter: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', textAlign: 'center', marginBottom: '48px' },
  storyText: { color: '#64748b', lineHeight: 1.8, marginBottom: '16px', fontSize: '1.05rem' },
  values: { padding: '80px 20px', background: '#FFF8F0' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' },
  valueCard: { background: '#fff', padding: '32px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  valueTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '600', color: '#3E2723', margin: '16px 0 8px' },
  valueDesc: { color: '#64748b', lineHeight: 1.6 },
  timeline: { padding: '80px 20px' },
  milestones: { display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px', margin: '0 auto' },
  milestone: { display: 'grid', gridTemplateColumns: '100px 24px 1fr', alignItems: 'center', gap: '16px' },
  milestoneYear: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '700', color: '#8B4513', textAlign: 'right' },
  milestoneDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#8B4513' },
  milestoneEvent: { color: '#3E2723' }
};
