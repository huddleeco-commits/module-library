/**
 * Salon TeamPage Generator
 */
function generateTeamPage(fixture, options = {}) {
  const { business, theme, team } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Instagram, Award, Scissors } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TEAM = ${JSON.stringify(team || [
  { name: 'Sarah Johnson', role: 'Master Stylist & Owner', bio: '15+ years experience in hair artistry. Specializes in balayage and color corrections.', specialties: ['Balayage', 'Color Correction', 'Bridal'] },
  { name: 'Michelle Chen', role: 'Senior Colorist', bio: 'Trained at Vidal Sassoon Academy. Expert in vivid colors and creative techniques.', specialties: ['Vivid Colors', 'Highlights', 'Ombre'] },
  { name: 'Emily Rodriguez', role: 'Stylist', bio: 'Passionate about creating personalized looks. Loves modern cuts and styling.', specialties: ['Precision Cuts', 'Styling', 'Extensions'] },
  { name: 'David Kim', role: 'Esthetician', bio: 'Licensed esthetician specializing in anti-aging treatments and facials.', specialties: ['Facials', 'Chemical Peels', 'Microdermabrasion'] },
  { name: 'Lisa Park', role: 'Nail Technician', bio: 'Nail artist with an eye for detail. Creates stunning nail art designs.', specialties: ['Nail Art', 'Gel Nails', 'Pedicures'] }
], null, 2)};

export default function TeamPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Meet Our Team</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Expert stylists dedicated to your beauty</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {TEAM.map((member, idx) => (
              <div key={idx} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ height: '280px', backgroundColor: \`\${COLORS.primary}15\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '120px', height: '120px', backgroundColor: \`\${COLORS.primary}25\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={48} color={COLORS.primary} style={{ opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{member.name}</h3>
                  <p style={{ color: COLORS.primary, fontWeight: '500', marginBottom: '16px' }}>{member.role}</p>
                  <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '20px' }}>{member.bio}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {member.specialties?.map((s, i) => (
                      <span key={i} style={{ padding: '6px 12px', backgroundColor: \`\${COLORS.primary}10\`, color: COLORS.primary, borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Join Our Team</h2>
        <p style={{ opacity: 0.7, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          We are always looking for talented stylists to join our family. If you are passionate about beauty, we would love to hear from you.
        </p>
        <Link to="/contact" style={{ display: 'inline-block', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          Get in Touch
        </Link>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Book with Your Favorite Stylist</h2>
        <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          <Calendar size={20} /> Book Appointment
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateTeamPage };
