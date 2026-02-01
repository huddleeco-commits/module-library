/**
 * Coffee2U1 - Menu Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';

export default function MenuPage() {
  const menuItems = [
    {
        "name": "Signature Item",
        "description": "Our most popular choice.",
        "price": 12,
        "category": "Main"
    }
];

  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category || 'Menu'))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredItems = menuItems.filter(item => (item.category || 'Menu') === activeCategory);

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Menu</h1>
        <p style={styles.heroSubtext}>Fresh, delicious, made with love</p>
      </section>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div style={styles.categoryTabs}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.categoryTab,
                ...(activeCategory === cat ? styles.categoryTabActive : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <section style={styles.menuSection}>
        <div style={styles.menuGrid}>
          {filteredItems.map((item, index) => (
            <div key={index} style={styles.menuItem}>
              <div style={styles.menuItemHeader}>
                <h3 style={styles.menuItemName}>{item.name}</h3>
                {item.price && <span style={styles.menuItemPrice}>${item.price}</span>}
              </div>
              {item.description && <p style={styles.menuItemDesc}>{item.description}</p>}
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
    color: '#1a1a2e',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.7
  },
  categoryTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '24px',
    flexWrap: 'wrap',
    borderBottom: '1px solid #eee'
  },
  categoryTab: {
    padding: '10px 24px',
    border: 'none',
    background: 'transparent',
    color: '#1a1a2e',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '20px',
    transition: 'all 0.2s'
  },
  categoryTabActive: {
    background: '#6366f1',
    color: '#ffffff'
  },
  menuSection: {
    padding: '40px 24px 80px'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  menuItem: {
    padding: '24px',
    borderBottom: '1px solid #eee'
  },
  menuItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  menuItemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  menuItemPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#6366f1'
  },
  menuItemDesc: {
    marginTop: '8px',
    color: '#1a1a2e',
    opacity: 0.7,
    fontSize: '0.95rem'
  }
};
