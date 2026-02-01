import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', title: 'The Art of Pastry', subtitle: 'Handcrafted with passion' },
    { image: 'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', title: 'Seasonal Collection', subtitle: 'Discover our latest offerings' },
    { image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', title: 'Made Fresh Daily', subtitle: 'Using the finest ingredients' }
  ];

  const signatureProducts = [
    { name: 'Signature Item', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920', price: '$48' },
    { name: 'Popular Choice', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=1920', price: '$52' },
    { name: 'Classic', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920', price: '$6' }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div style={styles.page}>
      {/* Hero Carousel */}
      <section style={styles.hero}>
        <div style={styles.slide}>
          <img src={slides[currentSlide].image} alt="" style={styles.slideImage} />
          <div style={styles.slideOverlay}>
            <div style={styles.slideContent}>
              <span style={styles.slideLabel}>ARTISAN BAKERY</span>
              <h1 style={styles.slideTitle}>{slides[currentSlide].title}</h1>
              <p style={styles.slideSubtitle}>{slides[currentSlide].subtitle}</p>
              <Link to="/menu" style={styles.slideBtn}>Explore Collection <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} style={{...styles.navBtn, left: '24px'}}><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} style={{...styles.navBtn, right: '24px'}}><ChevronRight size={24} /></button>
        <div style={styles.dots}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{...styles.dot, opacity: i === currentSlide ? 1 : 0.4}} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section style={styles.statement}>
        <p style={styles.statementText}>
          Where tradition meets artistry. Each creation is a testament to our unwavering commitment to excellence.
        </p>
      </section>

      {/* Signature Products */}
      <section style={styles.products}>
        <div style={styles.container}>
          <h2 style={styles.sectionLabel}>SIGNATURE COLLECTION</h2>
          <div style={styles.productGrid}>
            {signatureProducts.map((product, i) => (
              <Link key={i} to="/menu" style={styles.productCard}>
                <div style={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>{product.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Experience Excellence</h2>
        <p style={styles.ctaText}>Visit our atelier or order for delivery</p>
        <div style={styles.ctaBtns}>
          <Link to="/menu" style={styles.ctaBtn}>View Menu</Link>
          <Link to="/contact" style={styles.ctaBtnOutline}>Book a Visit</Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#f0f0f0', color: '#1f2937' },
  hero: { position: 'relative', height: '85vh', minHeight: '600px' },
  slide: { height: '100%', position: 'relative' },
  slideImage: { width: '100%', height: '100%', objectFit: 'cover' },
  slideOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', display: 'flex', alignItems: 'center' },
  slideContent: { padding: '0 80px', maxWidth: '600px' },
  slideLabel: { color: '#DEB887', letterSpacing: '4px', fontSize: '0.85rem', marginBottom: '16px', display: 'block' },
  slideTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginBottom: '16px', lineHeight: 1.1, color: '#fff' },
  slideSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '32px' },
  slideBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#DEB887', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', borderBottom: '1px solid #DEB887', paddingBottom: '4px' },
  navBtn: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer' },
  statement: { padding: '100px 24px', textAlign: 'center', background: '#e5e5e5' },
  statementText: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '300', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6, color: '#1f2937' },
  products: { padding: '100px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  sectionLabel: { textAlign: 'center', letterSpacing: '4px', fontSize: '0.85rem', color: '#DEB887', marginBottom: '48px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' },
  productCard: { textDecoration: 'none', color: '#1f2937' },
  productImageWrap: { overflow: 'hidden', marginBottom: '20px' },
  productImage: { width: '100%', aspectRatio: '4/5', objectFit: 'cover', transition: 'transform 0.5s', filter: 'grayscale(20%)' },
  productName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '400', marginBottom: '8px' },
  productPrice: { color: '#DEB887', letterSpacing: '1px' },
  cta: { padding: '120px 24px', textAlign: 'center', background: '#e5e5e5' },
  ctaTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: '300', marginBottom: '16px' },
  ctaText: { color: '#4b5563', marginBottom: '32px' },
  ctaBtns: { display: 'flex', gap: '16px', justifyContent: 'center' },
  ctaBtn: { background: '#DEB887', color: '#f0f0f0', padding: '16px 40px', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.85rem' },
  ctaBtnOutline: { background: 'transparent', color: '#1f2937', padding: '16px 40px', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.85rem', border: '1px solid #1f2937' }
};
