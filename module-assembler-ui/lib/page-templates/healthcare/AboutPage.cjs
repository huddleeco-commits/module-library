/**
 * Healthcare About Page Template
 */

function generateAboutPage(fixture, options = {}) {
  const { business, theme, pages } = fixture;
  const colors = theme.colors;
  const aboutData = pages?.about || {};
  const team = aboutData?.team || [];

  return `/**
 * AboutPage - Healthcare Business
 * Business: ${business.name}
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Award, Users, Clock, Target, Shield, Star,
  Calendar, CheckCircle, MapPin
} from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TEAM = ${JSON.stringify(team.length > 0 ? team : [
  { name: 'Dr. Priya Patel, MD', role: 'Medical Director', bio: 'Harvard Medical School, 20 years experience' },
  { name: 'Dr. Michael Chen, MD', role: 'Pediatrics', bio: 'Boston Childrens Hospital trained' },
  { name: 'Dr. Sarah Williams, MD', role: 'OB/GYN', bio: 'Specializing in high-risk pregnancy' }
], null, 2)};

const VALUES = [
  { icon: Heart, title: 'Compassion', description: 'We treat every patient like family, with empathy and understanding' },
  { icon: Award, title: 'Excellence', description: 'We pursue the highest standards in medical care and patient outcomes' },
  { icon: Users, title: 'Accessibility', description: 'Quality healthcare should be available to everyone in our community' },
  { icon: Shield, title: 'Integrity', description: 'We are honest, transparent, and always put patients first' }
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 0 60px',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            About ${business.name}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            ${aboutData.hero?.subheadline || 'Caring for our community since ' + (business.established || '2005')}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ ...styles.container, maxWidth: '900px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Our Mission</h2>
              <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8, marginBottom: '24px' }}>
                ${aboutData.sections?.find(s => s.type === 'story')?.content ||
                  `Founded in ${business.established || '2005'}, ${business.name} was built on a simple belief: healthcare should be accessible, compassionate, and comprehensive. Our team of physicians, nurses, and staff are dedicated to treating the whole person, not just symptoms.`}
              </p>
              <Link to="/appointments" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '${colors.primary}',
                fontWeight: '600',
                textDecoration: 'none'
              }}>
                <Calendar size={18} />
                Schedule Your First Visit
              </Link>
            </div>
            <div style={{
              height: '400px',
              backgroundColor: '${colors.primary}20',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={80} color="${colors.primary}" style={{ opacity: 0.3 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Our Values</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {VALUES.map((value, idx) => (
              <div key={idx} style={{
                padding: '32px',
                backgroundColor: COLORS.background,
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '${colors.primary}15',
                  color: '${colors.primary}',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <value.icon size={28} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{value.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})'
      }}>
        <div style={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            textAlign: 'center'
          }}>
            {[
              { value: '50,000+', label: 'Patients Served' },
              { value: String(new Date().getFullYear() - parseInt(business.established || '2005')), label: 'Years of Service' },
              { value: '15+', label: 'Physicians' },
              { value: '4.8★', label: 'Patient Rating' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                  {stat.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Preview */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>Our Leadership</h2>
          <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '48px' }}>
            Meet the team dedicated to your care
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {TEAM.slice(0, 4).map((member, idx) => (
              <div key={idx} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  height: '200px',
                  backgroundColor: '${colors.primary}15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '${colors.primary}',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: '600'
                  }}>
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                  <p style={{ color: '${colors.primary}', fontWeight: '500', marginBottom: '8px' }}>{member.role}</p>
                  <p style={{ opacity: 0.7, fontSize: '14px' }}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/providers" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '${colors.primary}',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              <Users size={20} />
              Meet All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Certifications & Accreditations</h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '24px'
          }}>
            {['JCAHO Accredited', 'NCQA Recognized', 'Patient-Centered Medical Home', 'HIPAA Compliant'].map((cert, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: COLORS.background,
                borderRadius: '8px'
              }}>
                <Award size={20} color="${colors.primary}" />
                <span style={{ fontWeight: '500' }}>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
            Become Part of Our Family
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            We're accepting new patients and would love to meet you
          </p>
          <Link to="/appointments" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={20} />
            Schedule Your First Visit
          </Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  sectionTitle: { fontSize: '36px', fontWeight: '700', textAlign: 'center', color: COLORS.text }
};
`;
}

module.exports = { generateAboutPage };
