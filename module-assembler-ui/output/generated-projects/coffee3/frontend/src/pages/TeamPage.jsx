/**
 * coffee3 - Our Baristas Page
 */
import React from 'react';

export default function TeamPage() {
  const team = [
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' },
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' },
    { name: 'Team Member', role: 'Role/Title', bio: 'Brief bio or description.' }
  ];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Our Baristas</h1>
        <p style={styles.subtitle}>Meet the people behind coffee3</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          {team.map((member, i) => (
            <div key={i} style={styles.card}>
              <div style={styles.avatar}></div>
              <h3 style={styles.name}>{member.name}</h3>
              <p style={styles.role}>{member.role}</p>
              <p style={styles.bio}>{member.bio}</p>
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' },
  card: { background: '#fff', padding: '22px', borderRadius: '7px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center' },
  avatar: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f140 0%, #06b6d440 100%)', margin: '0 auto 20px' },
  name: { fontSize: '1.25rem', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' },
  role: { fontSize: '0.95rem', color: '#6366f1', fontWeight: '500', marginBottom: '12px' },
  bio: { fontSize: '0.9rem', color: '#1a1a2e', opacity: 0.7, lineHeight: 1.6 }
};
