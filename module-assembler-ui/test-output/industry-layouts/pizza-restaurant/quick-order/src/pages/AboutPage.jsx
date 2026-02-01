/**
 * AboutPage - Quick Order Layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, Star, Award } from 'lucide-react';

const COLORS = {
  "primary": "#E63946",
  "secondary": "#F4A261",
  "accent": "#2A9D8F",
  "background": "#1D3557",
  "text": "#F1FAEE"
};

export default function AboutPage() {
  const team = [];

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#E63946',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>About Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Artisan pizzas crafted with passion</p>
      </section>

      {/* Our Story */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8 }}>
            Founded with a commitment to excellence, we have been serving our community with dedication and passion.
          </p>
          <p style={{ marginTop: '24px', fontSize: '16px', opacity: 0.7 }}>Proudly serving since 2018</p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Our Values</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {[
              { icon: 'Heart', title: 'Customer First', desc: 'Your satisfaction is our priority' },
              { icon: 'Shield', title: 'Trust & Integrity', desc: 'Honest and transparent service' },
              { icon: 'Star', title: 'Excellence', desc: 'Committed to the highest standards' },
              { icon: 'Users', title: 'Community', desc: 'Proud to serve our neighbors' }
            ].map((v, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#E6394615',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {v.icon === 'Heart' && <Heart size={28} color="#E63946" />}
                  {v.icon === 'Shield' && <Shield size={28} color="#E63946" />}
                  {v.icon === 'Star' && <Star size={28} color="#E63946" />}
                  {v.icon === 'Users' && <Users size={28} color="#E63946" />}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ opacity: 0.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Meet Our Team</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {team.map((member, idx) => (
                <div key={idx} style={{
                  textAlign: 'center',
                  padding: '32px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#E6394620',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px'
                  }}>
                    {member.name?.charAt(0) || '?'}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                  <p style={{ color: '#E63946', fontWeight: '500', marginBottom: '12px' }}>{member.role || member.title}</p>
                  {member.bio && <p style={{ opacity: 0.7, fontSize: '14px' }}>{member.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
