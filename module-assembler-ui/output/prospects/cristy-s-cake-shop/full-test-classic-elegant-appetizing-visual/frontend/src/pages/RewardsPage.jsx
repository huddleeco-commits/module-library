import React from 'react';

export default function RewardsPage() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Rewards</h1>
          <p style={styles.subtitle}>Cristy's Cake Shop</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <p style={styles.text}>Welcome to our rewards page. Content coming soon!</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '#8B4513', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  text: { fontSize: '1.1rem', lineHeight: 1.8, color: '#3E2723' }
};
