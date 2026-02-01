/**
 * Salon AboutPage Generator
 */
function generateAboutPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Heart, Leaf, Users, Calendar, Scissors } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '100px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>About Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${business.tagline || 'Your beauty destination'}</p>
      </section>

      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '32px' }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8, marginBottom: '24px' }}>
            ${business.description || 'Founded with a passion for beauty and wellness, we have grown into a beloved destination for those seeking exceptional salon services. Our team of skilled professionals is dedicated to helping you look and feel your best.'}
          </p>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8 }}>
            ${business.established ? 'Since ' + business.established + ', we have been committed to excellence, staying current with the latest trends and techniques while providing personalized service to each and every client.' : 'We believe beauty is about more than appearance - it is about confidence, self-expression, and feeling amazing in your own skin.'}
          </p>
        </div>
      </section>

      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '60px' }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {[
              { icon: 'Award', title: 'Excellence', desc: 'We never stop learning and improving our craft' },
              { icon: 'Heart', title: 'Care', desc: 'Every client is treated like family' },
              { icon: 'Leaf', title: 'Quality Products', desc: 'We use only premium, professional-grade products' },
              { icon: 'Users', title: 'Community', desc: 'Building lasting relationships with our clients' }
            ].map((v, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {v.icon === 'Award' && <Award size={36} color={COLORS.primary} />}
                  {v.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                  {v.icon === 'Leaf' && <Leaf size={36} color={COLORS.primary} />}
                  {v.icon === 'Users' && <Users size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{v.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { num: '15+', label: 'Years of Experience' },
            { num: '50+', label: 'Skilled Professionals' },
            { num: '10K+', label: 'Happy Clients' },
            { num: '100+', label: 'Awards Won' }
          ].map((stat, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: COLORS.primary }}>{stat.num}</div>
              <div style={{ opacity: 0.7, fontSize: '18px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Experience the Difference?</h2>
        <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          <Calendar size={20} /> Book Your Visit
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateAboutPage };
