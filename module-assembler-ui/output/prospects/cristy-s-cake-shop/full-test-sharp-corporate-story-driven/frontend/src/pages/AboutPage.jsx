import React from 'react';

export default function AboutPage() {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <span style={styles.label}>OUR STORY</span>
        <h1 style={styles.heroTitle}>A Legacy of Excellence</h1>
        <p style={styles.heroSubtitle}>Since 2020</p>
      </section>

      <section style={styles.statement}>
        <p style={styles.statementText}>
          At Cristy's Cake Shop, we believe that exceptional quality is not merely a standard—it is an art form.
          Every creation that leaves our atelier represents generations of expertise, meticulous attention
          to detail, and an unwavering commitment to perfection.
        </p>
      </section>

      <section style={styles.imageSection}>
        <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920" alt="Our craft" style={styles.fullImage} />
      </section>

      <section style={styles.philosophy}>
        <div style={styles.container}>
          <div style={styles.philGrid}>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>INGREDIENTS</span>
              <h3 style={styles.philTitle}>Only the Finest</h3>
              <p style={styles.philText}>
                We source the world's most exceptional ingredients—from single-origin cacao
                to imported French butter. Every component is selected with the same care
                we would give to our own family.
              </p>
            </div>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>CRAFTSMANSHIP</span>
              <h3 style={styles.philTitle}>Time-Honored Techniques</h3>
              <p style={styles.philText}>
                Our master artisans train for years to perfect their craft. Each creation
                is handmade using techniques passed down through generations, ensuring
                authenticity in every bite.
              </p>
            </div>
            <div style={styles.philItem}>
              <span style={styles.philLabel}>HERITAGE</span>
              <h3 style={styles.philTitle}>A Timeless Tradition</h3>
              <p style={styles.philText}>
                Founded in 2020, our house has remained dedicated to the same principles
                that guided our founders: excellence, integrity, and the pursuit of perfection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', color: '#3E2723', minHeight: '100vh' },
  hero: { padding: '120px 24px 80px', textAlign: 'center' },
  label: { color: '#daa520', letterSpacing: '4px', fontSize: '0.85rem' },
  heroTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  heroSubtitle: { color: '#64748b', fontSize: '1.1rem' },
  statement: { padding: '60px 24px', textAlign: 'center', background: '#F5F3F0' },
  statementText: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: '300', maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 },
  imageSection: { padding: '0 24px' },
  fullImage: { width: '100%', height: '60vh', objectFit: 'cover' },
  philosophy: { padding: '100px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  philGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' },
  philItem: {},
  philLabel: { color: '#daa520', letterSpacing: '3px', fontSize: '0.75rem' },
  philTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '400', margin: '16px 0' },
  philText: { color: '#64748b', lineHeight: 1.8 }
};
