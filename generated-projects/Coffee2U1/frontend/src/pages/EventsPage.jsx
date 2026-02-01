/**
 * Coffee2U1 - Events Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function EventsPage() {
  const events = [
    { title: 'Weekly Special', date: 'Every Friday', description: 'Join us for our weekly featured event.' },
    { title: 'Live Entertainment', date: 'Saturdays', description: 'Enjoy live music and entertainment.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Events</h1>
        <p style={styles.heroSubtext}>What's happening at Coffee2U1</p>
      </section>

      <section style={styles.eventsSection}>
        <div style={styles.eventsGrid}>
          {events.map((event, index) => (
            <div key={index} style={styles.eventCard}>
              <span style={styles.eventDate}>{event.date}</span>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventDesc}>{event.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh' },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #6366f111 0%, #06b6d411 100%)'
  },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', color: '#1a1a2e' },
  heroSubtext: { fontSize: '1.1rem', color: '#1a1a2e', opacity: 0.7, marginTop: '16px' },
  eventsSection: { padding: '60px 24px 80px' },
  eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  eventCard: { padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  eventDate: { color: '#6366f1', fontWeight: '600', fontSize: '14px' },
  eventTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a2e', margin: '12px 0' },
  eventDesc: { color: '#1a1a2e', opacity: 0.7, lineHeight: 1.6 }
};
