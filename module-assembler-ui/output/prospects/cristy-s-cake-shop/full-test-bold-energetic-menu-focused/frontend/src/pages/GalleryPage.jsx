import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState('all');

  const galleryItems = [
    { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', title: 'Signature Collection', category: 'featured', price: '$42', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', title: 'Fresh Pastries', category: 'pastries', price: '$24', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', title: 'Artisan Breads', category: 'breads', price: '$9', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600', title: 'Custom Cakes', category: 'cakes', price: 'From $55', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600', title: 'Cookie Boxes', category: 'cookies', price: '$18', link: '/menu' },
    { src: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=600', title: 'Cupcake Dozen', category: 'cakes', price: '$36', link: '/menu' }
  ];

  const categories = ['all', 'featured', 'pastries', 'breads', 'cakes', 'cookies'];
  const filtered = filter === 'all' ? galleryItems : galleryItems.filter(item => item.category === filter);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Product Gallery</h1>
        <p style={styles.subtitle}>Browse our delicious offerings</p>
      </header>

      <section style={styles.filters}>
        <div style={styles.filterBtns}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{...styles.filterBtn, ...(filter === cat ? styles.filterActive : {})}}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.gallery}>
        <div style={styles.container}>
          <div style={styles.grid}>
            {filtered.map((item, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.imageWrap} onClick={() => setSelectedIndex(i)}>
                  <img src={item.src} alt={item.title} style={styles.image} />
                </div>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <p style={styles.cardPrice}>{item.price}</p>
                  <Link to={item.link} style={styles.shopBtn}><ShoppingBag size={16} /> Shop Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedIndex !== null && (
        <div style={styles.lightbox} onClick={() => setSelectedIndex(null)}>
          <button style={styles.closeBtn}><X size={24} /></button>
          <button style={styles.navBtn} onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex - 1 + filtered.length) % filtered.length); }}><ChevronLeft size={32} /></button>
          <img src={filtered[selectedIndex].src} alt={filtered[selectedIndex].title} style={styles.lightboxImage} />
          <button style={{...styles.navBtn, ...styles.navBtnRight}} onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex + 1) % filtered.length); }}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { background: '#f0f0f0', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '#e5e5e5' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#4b5563' },
  filters: { padding: '24px', borderBottom: '1px solid #d1d5db' },
  filterBtns: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '20px', background: '#ffffff', cursor: 'pointer', fontSize: '0.9rem', color: '#1f2937' },
  filterActive: { background: '#8B4513', color: '#fff', borderColor: '#8B4513' },
  gallery: { padding: '60px 20px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  card: { background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  imageWrap: { cursor: 'pointer', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', transition: 'transform 0.3s' },
  cardInfo: { padding: '16px' },
  cardTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#1f2937', marginBottom: '4px' },
  cardPrice: { color: '#8B4513', fontWeight: '700', marginBottom: '12px' },
  shopBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#8B4513', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  navBtn: { position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBtnRight: { left: 'auto', right: '24px' },
  lightboxImage: { maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain' }
};
