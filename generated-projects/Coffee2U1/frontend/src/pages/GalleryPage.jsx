/**
 * Coffee2U1 - Gallery Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function GalleryPage() {
  // Placeholder gallery images
  const images = [
    { id: 1, alt: 'Gallery image 1' },
    { id: 2, alt: 'Gallery image 2' },
    { id: 3, alt: 'Gallery image 3' },
    { id: 4, alt: 'Gallery image 4' },
    { id: 5, alt: 'Gallery image 5' },
    { id: 6, alt: 'Gallery image 6' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Gallery</h1>
        <p style={styles.heroSubtext}>See what we do</p>
      </section>

      <section style={styles.gallerySection}>
        <div style={styles.galleryGrid}>
          {images.map((img) => (
            <div key={img.id} style={styles.galleryItem}>
              <div style={styles.placeholder}>
                <span>Photo</span>
              </div>
            </div>
          ))}
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
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #6366f111 0%, #06b6d411 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.7,
    marginTop: '16px'
  },
  gallerySection: {
    padding: '60px 24px 80px'
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  galleryItem: {
    aspectRatio: '4/3',
    overflow: 'hidden',
    borderRadius: '12px'
  },
  placeholder: {
    width: '100%',
    height: '100%',
    background: '#6366f122',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6366f1',
    fontSize: '1.25rem'
  }
};
