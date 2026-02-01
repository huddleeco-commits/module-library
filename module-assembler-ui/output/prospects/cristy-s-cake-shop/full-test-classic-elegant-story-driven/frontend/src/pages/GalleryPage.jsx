import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const galleryItems = [
    { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', title: 'The Craft', subtitle: 'Artistry in every detail' },
    { src: 'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', title: 'Seasonal Collection', subtitle: 'Limited edition offerings' },
    { src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', title: 'The Atelier', subtitle: 'Where magic happens' },
    { src: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800', title: 'Ingredients', subtitle: 'Only the finest' },
    { src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800', title: 'Presentation', subtitle: 'A feast for the eyes' },
    { src: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800', title: 'Heritage', subtitle: 'Timeless traditions' }
  ];

  const navigate = (dir) => {
    setSelectedIndex((prev) => (prev + dir + galleryItems.length) % galleryItems.length);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>GALLERY</span>
        <h1 style={styles.title}>Visual Journey</h1>
      </header>

      <section style={styles.gallery}>
        <div style={styles.grid}>
          {galleryItems.map((item, i) => (
            <div key={i} style={styles.item} onClick={() => setSelectedIndex(i)}>
              <img src={item.src} alt={item.title} style={styles.image} />
              <div style={styles.itemOverlay}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemSubtitle}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedIndex !== null && (
        <div style={styles.lightbox}>
          <button style={styles.closeBtn} onClick={() => setSelectedIndex(null)}><X size={24} /></button>
          <button style={styles.navBtn} onClick={() => navigate(-1)}><ChevronLeft size={32} /></button>
          <div style={styles.lightboxContent}>
            <img src={galleryItems[selectedIndex].src} alt={galleryItems[selectedIndex].title} style={styles.lightboxImage} />
            <div style={styles.lightboxInfo}>
              <h3 style={styles.lightboxTitle}>{galleryItems[selectedIndex].title}</h3>
              <p style={styles.lightboxSubtitle}>{galleryItems[selectedIndex].subtitle}</p>
            </div>
          </div>
          <button style={{...styles.navBtn, right: '24px', left: 'auto'}} onClick={() => navigate(1)}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#0f172a', color: '#f8fafc', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '#DEB887', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px' },
  gallery: { padding: '0 24px 100px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4px', maxWidth: '1400px', margin: '0 auto' },
  item: { position: 'relative', aspectRatio: '4/3', cursor: 'pointer', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)', transition: 'all 0.5s' },
  itemOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px', opacity: 0, transition: 'opacity 0.3s' },
  itemTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '300', color: '#fff', marginBottom: '4px' },
  itemSubtitle: { color: '#DEB887', letterSpacing: '2px', fontSize: '0.8rem' },
  lightbox: { position: 'fixed', inset: 0, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  closeBtn: { position: 'absolute', top: '32px', right: '32px', background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer' },
  navBtn: { position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: '1px solid #DEB887', color: '#DEB887', width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  lightboxContent: { textAlign: 'center' },
  lightboxImage: { maxWidth: '70vw', maxHeight: '70vh', objectFit: 'contain' },
  lightboxInfo: { marginTop: '32px' },
  lightboxTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '2rem', fontWeight: '300', marginBottom: '8px' },
  lightboxSubtitle: { color: '#DEB887', letterSpacing: '3px', fontSize: '0.85rem' }
};
