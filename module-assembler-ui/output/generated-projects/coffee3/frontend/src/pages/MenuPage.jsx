/**
 * coffee3 - Menu Page
 */
import React from 'react';

export default function ServicesPage() {
  const items = [
    { name: 'Service One', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Two', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Three', description: 'Description of this service or item.', price: '$XX' },
    { name: 'Service Four', description: 'Description of this service or item.', price: '$XX' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Menu</h1>
        <p style={styles.subtitle}>Explore what we have to offer</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {items.map((item, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.cardImage}></div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{item.name}</h3>
                <p style={styles.cardDesc}>{item.description}</p>
                <span style={styles.price}>{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  hero: { padding: '54px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f115 0%, #06b6d415 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '#1a1a2e', opacity: 0.8 },
  content: { padding: '54px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  card: { background: '#fff', borderRadius: '7px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' },
  cardImage: { height: '180px', background: 'linear-gradient(135deg, #6366f130 0%, #06b6d430 100%)' },
  cardContent: { padding: '22px' },
  cardTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' },
  cardDesc: { fontSize: '0.95rem', color: '#1a1a2e', opacity: 0.7, marginBottom: '12px' },
  price: { fontSize: '1.1rem', fontWeight: '700', color: '#6366f1' }
};
