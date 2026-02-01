import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', alt: 'Fresh baked goods', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', alt: 'Our pastries', category: 'Products' },
    { src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', alt: 'Inside our shop', category: 'Shop' },
    { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', alt: 'Happy customers', category: 'Community' },
    { src: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600', alt: 'Baking process', category: 'Behind the Scenes' },
    { src: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', alt: 'Fresh ingredients', category: 'Behind the Scenes' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Our Gallery</h1>
        <p style={styles.subtitle}>A peek inside Cristy's Cake Shop</p>
      </header>

      <section style={styles.gallery}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {galleryImages.map((img, i) => (
              <div key={i} style={styles.imageCard} onClick={() => setSelectedImage(img)}>
                <img src={img.src} alt={img.alt} style={styles.image} />
                <div style={styles.imageOverlay}>
                  <span style={styles.imageCategory}>{img.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}><X size={24} /></button>
          <img src={selectedImage.src} alt={selectedImage.alt} style={styles.lightboxImage} />
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#0f172a', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '#1e293b' },
  title: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' },
  subtitle: { color: '#94a3b8', fontSize: '1.1rem' },
  gallery: { padding: '80px 20px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  imageCard: { position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', display: 'flex', alignItems: 'flex-end', padding: '16px', opacity: 0, transition: 'opacity 0.3s' },
  imageCategory: { color: '#fff', fontSize: '0.9rem', fontWeight: '500' },
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  lightboxImage: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }
};
