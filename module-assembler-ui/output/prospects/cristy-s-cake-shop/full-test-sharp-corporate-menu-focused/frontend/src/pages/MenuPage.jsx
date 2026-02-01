import React, { useState } from 'react';
import { ShoppingCart, Plus, Filter, Grid, List } from 'lucide-react';

export default function MenuPage() {
  const [view, setView] = useState('grid');
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: 'Signature Box', price: 42, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', category: 'boxes' },
    { id: 2, name: 'Croissant 6-Pack', price: 24, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', category: 'pastries' },
    { id: 3, name: 'Artisan Bread Loaf', price: 9, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', category: 'breads' },
    { id: 4, name: 'Cupcake Dozen', price: 36, image: 'https://images.unsplash.com/photo-1519869325930-281384f3a0d8?w=400', category: 'cakes' },
    { id: 5, name: 'Cookie Assortment', price: 18, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', category: 'cookies' },
    { id: 6, name: 'Birthday Cake', price: 55, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', category: 'cakes' }
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Shop Our Menu</h1>
        <p style={styles.subtitle}>Free shipping on orders over $50</p>
      </header>

      <div style={styles.toolbar}>
        <button style={styles.filterBtn}><Filter size={18} /> Filter</button>
        <div style={styles.viewToggle}>
          <button onClick={() => setView('grid')} style={{...styles.viewBtn, ...(view === 'grid' ? styles.viewActive : {})}}><Grid size={18} /></button>
          <button onClick={() => setView('list')} style={{...styles.viewBtn, ...(view === 'list' ? styles.viewActive : {})}}><List size={18} /></button>
        </div>
        <button style={styles.cartBtn}><ShoppingCart size={18} /> Cart ({cart.length})</button>
      </div>

      <div style={styles.container}>
        <div style={view === 'grid' ? styles.grid : styles.list}>
          {products.map(product => (
            <div key={product.id} style={styles.productCard}>
              <img src={product.image} alt={product.name} style={styles.productImage} />
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>${product.price}</p>
                <button onClick={() => addToCart(product)} style={styles.addBtn}>
                  <Plus size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '#FFF8F5' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723' },
  subtitle: { color: '#666666' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', maxWidth: '1200px', margin: '0 auto' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer' },
  viewToggle: { display: 'flex', gap: '4px' },
  viewBtn: { padding: '10px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', borderRadius: '6px' },
  viewActive: { background: '#8B4513', color: '#fff', borderColor: '#8B4513' },
  cartBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  productCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  productImage: { width: '100%', height: '180px', objectFit: 'cover' },
  productInfo: { padding: '16px' },
  productName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1rem', fontWeight: '600', color: '#3E2723', marginBottom: '4px' },
  productPrice: { color: '#8B4513', fontWeight: '700', marginBottom: '12px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', background: '#8B4513', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};
