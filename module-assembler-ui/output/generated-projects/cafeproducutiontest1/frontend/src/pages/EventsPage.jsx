/**
 * cafeproducutiontest1 - Events Page
 */
import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function EventsPage() {
  const events = [
    { title: 'Upcoming Event', date: 'January 2026', time: '6:00 PM', description: 'Join us for this special event.' },
    { title: 'Special Occasion', date: 'February 2026', time: '7:00 PM', description: 'Don\'t miss this exciting gathering.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Events</h1>
        <p style={styles.subtitle}>What's happening at cafeproducutiontest1</p>
      </section>

      <section style={styles.content}>
        <div style={styles.list}>
          {events.map((event, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.dateBox}>
                <Calendar size={24} color="#6366f1" />
                <span>{event.date}</span>
              </div>
              <div style={styles.details}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <p style={styles.eventTime}><Clock size={16} /> {event.time}</p>
                <p style={styles.eventDesc}>{event.description}</p>
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
  hero: { padding: '67px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f115 0%, #06b6d415 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '#1a1a2e', opacity: 0.8 },
  content: { padding: '67px 24px' },
  list: { maxWidth: '800px', margin: '0 auto' },
  card: { display: 'flex', gap: '24px', background: '#fff', padding: '27px', borderRadius: '9px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '20px' },
  dateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: '#6366f110', borderRadius: '9px' },
  details: { flex: 1 },
  eventTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' },
  eventTime: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontSize: '0.9rem', marginBottom: '8px' },
  eventDesc: { color: '#1a1a2e', opacity: 0.7 }
};
