import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Truck, Award, Star, Clock } from 'lucide-react';

export default function HomePage() {
  const featuredProducts = [
    { id: 1, name: 'Signature Item', price: '$4.50', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920', badge: 'Best Seller' },
    { id: 2, name: 'Popular Pick', price: '$6.00', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=1920', badge: 'Popular' },
    { id: 3, name: 'Fresh Daily', price: '$4.00', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920', badge: null },
    { id: 4, name: 'New Arrival', price: '$3.50', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', badge: 'New' }
  ];

  const categories = [
    { name: 'Featured', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920', link: '/menu?cat=featured' },
    { name: 'Specialties', image: 'https://images.unsplash.com/photo-1486427944544-d2c6128c6e75?w=1920', link: '/menu?cat=specialties' },
    { name: 'Popular', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1920', link: '/menu?cat=popular' }
  ];

  return (
    <div style={{ background: '#FFF8F0' }}>
      {/* Announcement Bar */}
      <div style={styles.announcementBar}>
        <span>Free shipping on orders over $50! Use code SWEET20 for 20% off</span>
      </div>

      {/* Hero Section - Split Layout */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroImages}>
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920" alt="Featured" style={styles.heroMainImage} />
          </div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>Handcrafted Baked Goods, Made Fresh Daily</h1>
            <p style={styles.heroSubtitle}>Fresh-baked happiness delivered to your door. Order online for pickup or nationwide shipping.</p>
            <div style={styles.heroCtas}>
              <Link to="/menu" style={styles.primaryBtn}>
                <ShoppingBag size={18} /> Order Pickup
              </Link>
              <Link to="/menu" style={styles.secondaryBtn}>
                <Truck size={18} /> Ship Nationwide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div style={styles.trustStrip}>
        <div style={styles.trustItem}><Star size={16} /> Baked Fresh Daily</div>
        <div style={styles.trustItem}><Truck size={16} /> Free Shipping $50+</div>
        <div style={styles.trustItem}><Award size={16} /> 100% Satisfaction</div>
        <div style={styles.trustItem}><Clock size={16} /> Same-Day Pickup</div>
      </div>

      {/* Featured Products */}
      <section style={styles.featured}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Fan Favorites</h2>
            <Link to="/menu" style={styles.viewAllLink}>Shop All <ArrowRight size={16} /></Link>
          </div>
          <div style={styles.productGrid}>
            {featuredProducts.map(product => (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} style={styles.productImage} />
                  {product.badge && <span style={styles.productBadge}>{product.badge}</span>}
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>{product.price}</p>
                <button style={styles.addToCartBtn}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.categories}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <div style={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link key={i} to={cat.link} style={styles.categoryCard}>
                <img src={cat.image} alt={cat.name} style={styles.categoryImage} />
                <div style={styles.categoryOverlay}>
                  <span style={styles.categoryName}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  announcementBar: { background: '#8B4513', color: '#fff', padding: '10px 20px', textAlign: 'center', fontSize: '14px' },
  hero: { padding: '80px 20px', background: '#FFF8F5' },
  heroContainer: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' },
  heroImages: { display: 'grid', gap: '16px' },
  heroMainImage: { width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '400px' },
  heroContent: {},
  heroTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', color: '#3E2723', marginBottom: '16px', lineHeight: 1.2 },
  heroSubtitle: { color: '#64748b', fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.6 },
  heroCtas: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#8B4513', color: '#fff', padding: '18px 36px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '1rem' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#8B4513', padding: '18px 36px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', border: '2px solid #8B4513' },
  trustStrip: { display: 'flex', justifyContent: 'center', gap: '32px', padding: '20px', background: '#FFF8F0', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' },
  featured: { padding: '80px 20px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  sectionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.75rem', fontWeight: '700', color: '#3E2723' },
  viewAllLink: { display: 'flex', alignItems: 'center', gap: '4px', color: '#8B4513', textDecoration: 'none', fontWeight: '600' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
  productCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: '200px', objectFit: 'cover' },
  productBadge: { position: 'absolute', top: '12px', left: '12px', background: '#8B4513', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  productName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', padding: '16px 16px 4px', color: '#3E2723' },
  productPrice: { padding: '0 16px', color: '#8B4513', fontWeight: '700', fontSize: '1.1rem' },
  addToCartBtn: { margin: '16px', width: 'calc(100% - 32px)', background: '#8B4513', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  categories: { padding: '80px 20px', background: '#FFF8F5' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  categoryCard: { position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', textDecoration: 'none' },
  categoryImage: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '20px' },
  categoryName: { color: '#fff', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '600' }
};
