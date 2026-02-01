import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Users, Clock, Star, ChevronRight, Zap, Heart, Target, Award } from 'lucide-react';

const COLORS = {
  "primary": "#DC2626",
  "secondary": "#EF4444",
  "accent": "#FCA5A5",
  "background": "#FEF2F2",
  "text": "#1F2937"
};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        background: `linear-gradient(135deg, ${COLORS.primary}ee, ${COLORS.secondary || COLORS.primary}dd)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '900px', color: 'white' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '50px', marginBottom: '32px' }}>
            <Zap size={20} /> <span style={{ fontWeight: '500' }}>Start Your Transformation Today</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px' }}>
            Push Your Limits. Exceed Your Goals.
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', opacity: 0.9, marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
            World-class equipment, expert trainers, and a community that inspires
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/membership" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
            <Link to="/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
              View Classes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { num: '50+', label: 'Classes Weekly' },
            { num: '20+', label: 'Expert Trainers' },
            { num: '5000+', label: 'Active Members' },
            { num: '24/7', label: 'Gym Access' }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>{s.num}</div>
              <div style={{ opacity: 0.7, fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Classes Preview */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700' }}>Popular Classes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { name: 'HIIT Training', desc: 'High-intensity interval training for maximum results', duration: '45 min', level: 'All Levels' },
              { name: 'Strength & Conditioning', desc: 'Build muscle and increase overall strength', duration: '60 min', level: 'Intermediate' },
              { name: 'Yoga Flow', desc: 'Mind-body connection through movement', duration: '60 min', level: 'All Levels' },
              { name: 'Spin Class', desc: 'High-energy cycling for cardio lovers', duration: '45 min', level: 'All Levels' }
            ].map((c, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{c.name}</h3>
                <p style={{ opacity: 0.7, marginBottom: '20px', lineHeight: 1.6 }}>{c.desc}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {c.duration}</span>
                  <span style={{ padding: '4px 12px', backgroundColor: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: '20px', fontWeight: '500' }}>{c.level}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              View All Classes <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700' }}>Why Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { icon: 'Dumbbell', title: 'State-of-the-Art Equipment', desc: 'Premium machines and free weights' },
              { icon: 'Users', title: 'Expert Trainers', desc: 'Certified professionals to guide you' },
              { icon: 'Target', title: 'Personalized Plans', desc: 'Programs tailored to your goals' },
              { icon: 'Heart', title: 'Supportive Community', desc: 'Members who motivate each other' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: `${COLORS.primary}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {f.icon === 'Dumbbell' && <Dumbbell size={36} color={COLORS.primary} />}
                  {f.icon === 'Users' && <Users size={36} color={COLORS.primary} />}
                  {f.icon === 'Target' && <Target size={36} color={COLORS.primary} />}
                  {f.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ opacity: 0.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700' }}>Success Stories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {[
              { name: 'Mike T.', text: 'Lost 40 pounds in 6 months. The trainers here are incredible!', result: '-40 lbs' },
              { name: 'Sarah K.', text: 'Found my passion for fitness. Best decision I ever made!', result: 'Lifestyle Change' },
              { name: 'James R.', text: 'From couch potato to marathon runner. This place changed my life.', result: 'Marathon Finisher' }
            ].map((t, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600' }}>{t.name}</span>
                  <span style={{ padding: '4px 12px', backgroundColor: `${COLORS.primary}15`, color: COLORS.primary, borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{t.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary || COLORS.primary})`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Transform?</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>Start your free 7-day trial today</p>
          <Link to="/membership" style={{ display: 'inline-block', backgroundColor: 'white', color: COLORS.primary, padding: '18px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}