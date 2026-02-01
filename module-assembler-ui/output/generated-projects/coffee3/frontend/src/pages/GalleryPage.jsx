/**
 * coffee3 - Gallery Page
 */
import React from 'react';

export default function GalleryPage() {
  const images = Array(9).fill(null);

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Gallery</h1>
        <p style={styles.subtitle}>A glimpse into coffee3</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {images.map((_, i) => (
            <div key={i} style={styles.imageCard}>
              <div style={styles.placeholder}></div>
            </div>
          ))}
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
  content: { padding: '54px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto' },
  imageCard: { borderRadius: '7px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  placeholder: { aspectRatio: '4/3', background: 'linear-gradient(135deg, #6366f125 0%, #06b6d425 100%)' }
};
