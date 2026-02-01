/**
 * Coffee2U - Team Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function TeamPage() {
  const team = [
    {
        "name": "**SARAH JOHNSON",
        "bio": "** Sarah founded Coffee2U with a passion for creating exceptional coffee experiences and building genuine connections with every customer. With over eight years of barista expertise and specialty coffee certifications, she leads by example behind the espresso machine while ensuring each cup meets her exacting standards. Her warm leadership style and commitment to quality have made Coffee2U a beloved community gathering place."
    },
    {
        "name": "**MIKE CHEN",
        "bio": "** Mike brings artisanal roasting expertise to Coffee2U, carefully sourcing premium beans from sustainable farms around the world. His precise roasting techniques and deep understanding of flavor profiles ensure every batch delivers the perfect balance of complexity and smoothness. With a background in coffee science and years of hands-on experience,"
    }
];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Meet Our Team</h1>
        <p style={styles.heroSubtext}>The people behind Coffee2U</p>
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
    background: 'linear-gradient(135deg, #8B451311 0%, #D2691E11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#2C1810'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#2C1810',
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
    background: '#8B4513',
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
    color: '#2C1810'
  },
  memberRole: {
    color: '#8B4513',
    fontWeight: '500',
    margin: '8px 0'
  },
  memberBio: {
    color: '#2C1810',
    opacity: 0.7,
    lineHeight: 1.6
  }
};
