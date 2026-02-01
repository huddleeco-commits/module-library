import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'breads', 'pastries', 'cakes', 'drinks'];

  const menuItems = [
    { name: 'Sourdough Loaf', category: 'breads', price: '$8.00', description: 'Our signature 24-hour fermented loaf', popular: true },
    { name: 'Butter Croissant', category: 'pastries', price: '$4.50', description: 'Flaky, buttery perfection', popular: true },
    { name: 'Chocolate Cake', category: 'cakes', price: '$32.00', description: 'Rich chocolate layers with ganache', popular: false },
    { name: 'Cinnamon Roll', category: 'pastries', price: '$5.00', description: 'Warm with cream cheese glaze', popular: true },
    { name: 'Baguette', category: 'breads', price: '$6.00', description: 'Crispy crust, soft interior', popular: false },
    { name: 'Cappuccino', category: 'drinks', price: '$4.50', description: 'Double shot with steamed milk', popular: false }
  ];

  const filtered = menuItems.filter(item =>
    (activeCategory === 'all' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Our Menu</h1>
        <p style={styles.subtitle}>Fresh baked daily with love</p>
      </header>

      <div style={styles.controls}>
        <div style={styles.search}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search menu..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{...styles.categoryBtn, ...(activeCategory === cat ? styles.categoryActive : {})}}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {filtered.map((item, i) => (
            <div key={i} style={styles.card}>
              {item.popular && <span style={styles.badge}><Star size={12} /> Popular</span>}
              <h3 style={styles.itemName}>{item.name}</h3>
              <p style={styles.itemDesc}>{item.description}</p>
              <p style={styles.itemPrice}>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#0f172a', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '#FFF8F0' },
  title: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' },
  subtitle: { color: '#94a3b8', fontSize: '1.1rem' },
  controls: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  search: { position: 'relative', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '14px 14px 14px 48px', border: '1px solid #e5e7eb', borderRadius: '16px', fontSize: '1rem' },
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  categoryBtn: { padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.95rem' },
  categoryActive: { background: '#8B4513', color: '#fff', borderColor: '#8B4513' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px 60px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { position: 'relative', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  badge: { position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '4px', background: '#8B4513', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  itemName: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' },
  itemDesc: { color: '#94a3b8', marginBottom: '12px', lineHeight: 1.5 },
  itemPrice: { color: '#8B4513', fontWeight: '700', fontSize: '1.1rem' }
};
