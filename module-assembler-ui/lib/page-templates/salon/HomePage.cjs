/**
 * Salon HomePage Generator
 */
function generateHomePage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, Clock, MapPin, Phone, Award, Scissors, Sparkles, Heart } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        background: \`linear-gradient(135deg, \${COLORS.primary}ee, \${COLORS.secondary || COLORS.primary}dd)\`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '900px', color: 'white' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '50px', marginBottom: '32px' }}>
            <Award size={20} />
            <span style={{ fontWeight: '500' }}>Award-Winning Salon</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '700', lineHeight: 1.1, marginBottom: '24px' }}>
            ${business.tagline || 'Where Beauty Meets Excellence'}
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', opacity: 0.9, marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
            Experience luxury treatments from our expert stylists
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '18px 36px', borderRadius: '50px', fontSize: '18px', fontWeight: '600', textDecoration: 'none' }}>
              <Calendar size={22} /> Book Appointment
            </Link>
            <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '18px 36px', borderRadius: '50px', fontSize: '18px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px' }}>Our Services</span>
            <h2 style={{ fontSize: '42px', fontWeight: '700', marginTop: '12px' }}>What We Offer</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { icon: 'Scissors', name: 'Hair Services', desc: 'Cuts, color, styling & treatments', price: 'From $45' },
              { icon: 'Sparkles', name: 'Skin Care', desc: 'Facials, peels & rejuvenation', price: 'From $75' },
              { icon: 'Heart', name: 'Nail Services', desc: 'Manicures, pedicures & nail art', price: 'From $35' }
            ].map((s, idx) => (
              <div key={idx} style={{ padding: '40px', backgroundColor: COLORS.background, borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  {s.icon === 'Scissors' && <Scissors size={36} color={COLORS.primary} />}
                  {s.icon === 'Sparkles' && <Sparkles size={36} color={COLORS.primary} />}
                  {s.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>{s.name}</h3>
                <p style={{ opacity: 0.7, marginBottom: '16px' }}>{s.desc}</p>
                <span style={{ color: COLORS.primary, fontWeight: '600' }}>{s.price}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700' }}>Why Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {[
              { num: '15+', label: 'Years Experience' },
              { num: '50+', label: 'Expert Stylists' },
              { num: '10K+', label: 'Happy Clients' },
              { num: '4.9', label: 'Star Rating' }
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', color: COLORS.primary }}>{stat.num}</div>
                <div style={{ opacity: 0.7, fontSize: '18px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700' }}>Client Reviews</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {[
              { name: 'Jessica M.', text: 'Best salon experience ever! My hair has never looked better.', rating: 5 },
              { name: 'Amanda R.', text: 'The team is so talented and the atmosphere is so relaxing.', rating: 5 },
              { name: 'Michelle T.', text: 'I have been coming here for years. Would not go anywhere else!', rating: 5 }
            ].map((r, idx) => (
              <div key={idx} style={{ padding: '32px', backgroundColor: COLORS.background, borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{r.text}"</p>
                <p style={{ fontWeight: '600' }}>{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready for a New Look?</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>Book your appointment today</p>
          <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '18px 36px', borderRadius: '50px', fontSize: '18px', fontWeight: '600', textDecoration: 'none' }}>
            <Calendar size={22} /> Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateHomePage };
