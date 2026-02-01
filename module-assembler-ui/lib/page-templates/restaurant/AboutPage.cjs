/**
 * Restaurant AboutPage Generator
 */

function generateAboutPage(fixture, options = {}) {
  const { business, theme, team } = fixture;
  const colors = options.colors || theme?.colors;

  return `/**
 * AboutPage - ${business.name}
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Heart, Leaf, Users, ChefHat, Clock, Star, MapPin } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TEAM = ${JSON.stringify(team || [
  { name: 'Chef Marco', role: 'Executive Chef', bio: 'Over 20 years of culinary experience' },
  { name: 'Sofia', role: 'Pastry Chef', bio: 'Trained at Le Cordon Bleu' },
  { name: 'James', role: 'General Manager', bio: 'Ensuring every guest feels at home' }
], null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Story</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${business.tagline || 'A passion for great food'}</p>
      </section>

      {/* Story */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '32px' }}>How It All Started</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8, marginBottom: '24px' }}>
            ${business.description || 'What began as a small family dream has grown into a beloved neighborhood destination. Our founders believed that great food should be accessible to everyone, prepared with love, and served with warmth.'}
          </p>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8 }}>
            ${business.established ? `Since ${business.established}, we have been crafting memorable dining experiences for our guests. Every dish tells a story, every ingredient is carefully selected, and every guest becomes part of our family.` : 'Every dish tells a story, every ingredient is carefully selected, and every guest becomes part of our family.'}
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '60px' }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { icon: 'Leaf', title: 'Fresh Ingredients', desc: 'We source locally whenever possible, supporting our community and ensuring peak freshness' },
              { icon: 'Heart', title: 'Made with Love', desc: 'Every dish is prepared with care and attention to detail by our passionate team' },
              { icon: 'Users', title: 'Community First', desc: 'We believe restaurants are gathering places that bring people together' },
              { icon: 'Award', title: 'Excellence', desc: 'We strive for excellence in everything from food quality to customer service' }
            ].map((v, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: \`\${COLORS.primary}15\`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  {v.icon === 'Leaf' && <Leaf size={36} color={COLORS.primary} />}
                  {v.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                  {v.icon === 'Users' && <Users size={36} color={COLORS.primary} />}
                  {v.icon === 'Award' && <Award size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{v.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '60px' }}>Meet Our Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {TEAM.map((member, idx) => (
              <div key={idx} style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: \`\${COLORS.primary}20\`,
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ChefHat size={48} color={COLORS.primary} style={{ opacity: 0.6 }} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: COLORS.primary, fontWeight: '500', marginBottom: '12px' }}>{member.role}</p>
                <p style={{ opacity: 0.7 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.primary,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
          Come Visit Us
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '32px', fontSize: '18px' }}>
          Experience our hospitality for yourself
        </p>
        <Link to="/reservations" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: COLORS.primary,
          padding: '16px 32px',
          borderRadius: '50px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          Make a Reservation
        </Link>
      </section>
    </div>
  );
}
`;
}

module.exports = { generateAboutPage };
