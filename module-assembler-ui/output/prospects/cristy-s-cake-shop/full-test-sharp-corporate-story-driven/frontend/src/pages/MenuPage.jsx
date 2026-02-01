import React from 'react';

export default function MenuPage() {
  const collections = [
    {
      name: 'Signature Collection',
      items: [
        { name: 'Artisan Croissant', price: '$6', description: 'House-made with imported French butter' },
        { name: 'Dark Chocolate Tart', price: '$12', description: 'Single-origin cacao, caramelized hazelnuts' },
        { name: 'Seasonal Macaron Box', price: '$28', description: 'Twelve pieces, rotating flavors' }
      ]
    },
    {
      name: 'Daily Offerings',
      items: [
        { name: 'Pain de Campagne', price: '$9', description: 'Rustic country loaf, 48-hour ferment' },
        { name: 'Kouign-Amann', price: '$7', description: 'Caramelized Breton pastry' },
        { name: 'Espresso', price: '$4', description: 'House blend, single or double' }
      ]
    }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>THE COLLECTION</span>
        <h1 style={styles.title}>Our Offerings</h1>
      </header>

      <div style={styles.content}>
        {collections.map((collection, ci) => (
          <section key={ci} style={styles.section}>
            <h2 style={styles.collectionName}>{collection.name}</h2>
            <div style={styles.items}>
              {collection.items.map((item, ii) => (
                <div key={ii} style={styles.item}>
                  <div style={styles.itemHeader}>
                    <h3 style={styles.itemName}>{item.name}</h3>
                    <span style={styles.itemPrice}>{item.price}</span>
                  </div>
                  <p style={styles.itemDesc}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', color: '#3E2723', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '#DEB887', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '300', marginTop: '16px' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '0 24px 100px' },
  section: { marginBottom: '80px' },
  collectionName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '400', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #DEB887' },
  items: {},
  item: { padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' },
  itemName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.1rem', fontWeight: '400' },
  itemPrice: { color: '#DEB887' },
  itemDesc: { color: '#6b6b6b', fontSize: '0.95rem' }
};
