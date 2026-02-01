/**
 * Coffee House Cafe - Team Page
 * Generated with Smart Template Mode
 */
import React from 'react';

export default function TeamPage() {
  const team = [
    {
        "name": "SARAH JOHNSON",
        "bio": "Sarah combines her passion for exceptional coffee with warm hospitality as the heart and soul of Coffee House Cafe. With over eight years of barista experience and a dedication to sourcing the finest beans, she creates an inviting space where every cup tells a story. Her commitment to quality and community connection drives everything we do."
    },
    {
        "name": "MIKE CHEN",
        "bio": "Mike brings artistry and precision to every batch as our master roaster, transforming green beans into the complex, flavorful profiles that define our signature blends. With a background in culinary arts and five years specializing in small-batch roasting, he approaches each roast with meticulous attention to origin characteristics and flavor development. His expertise ensures every"
    }
];

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Meet Our Team</h1>
        <p style={styles.heroSubtext}>The people behind Coffee House Cafe</p>
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
