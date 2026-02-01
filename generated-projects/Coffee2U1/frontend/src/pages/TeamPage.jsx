/**
 * Coffee2U1 - Team Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function TeamPage() {
  const team = [
    {
        "name": "Team Member",
        "bio": "A dedicated professional."
    }
];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Our Team</h1>
        <p style={styles.heroSubtext}>The people behind Coffee2U1</p>
      </section>

      <section style={styles.teamSection}>
        <div style={styles.teamGrid}>
          {team.map((member, index) => (
            <div key={index} style={styles.teamCard}>
              <div style={styles.avatar}>
                {member.name.charAt(0)}
              </div>
              <h3 style={styles.memberName}>{member.name}</h3>
              {member.role && <p style={styles.memberRole}>{member.role}</p>}
              <p style={styles.memberBio}>{member.bio}</p>
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
    color: '#1a1a2e'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#1a1a2e',
    opacity: 0.7,
    marginTop: '16px'
  },
  teamSection: {
    padding: '60px 24px 80px'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  teamCard: {
    textAlign: 'center',
    padding: '32px'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 auto 20px'
  },
  memberName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  memberRole: {
    color: '#6366f1',
    fontWeight: '500',
    margin: '8px 0'
  },
  memberBio: {
    color: '#1a1a2e',
    opacity: 0.7,
    lineHeight: 1.6
  }
};
