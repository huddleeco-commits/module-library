/**
 * Fitness ClassesPage Generator
 */
function generateClassesPage(fixture, options = {}) {
  const colors = options.colors;
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Zap, Heart, Dumbbell, Activity } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const CLASSES = [
  { id: 1, name: 'HIIT Training', category: 'cardio', duration: '45 min', level: 'All Levels', desc: 'High-intensity intervals for maximum calorie burn', instructor: 'Coach Mike' },
  { id: 2, name: 'Strength & Power', category: 'strength', duration: '60 min', level: 'Intermediate', desc: 'Build muscle and increase strength', instructor: 'Coach Sarah' },
  { id: 3, name: 'Yoga Flow', category: 'mind-body', duration: '60 min', level: 'All Levels', desc: 'Connect mind and body through movement', instructor: 'Instructor Amy' },
  { id: 4, name: 'Spin Class', category: 'cardio', duration: '45 min', level: 'All Levels', desc: 'High-energy indoor cycling', instructor: 'Coach Jake' },
  { id: 5, name: 'Boxing Fitness', category: 'cardio', duration: '60 min', level: 'All Levels', desc: 'Learn boxing while getting fit', instructor: 'Coach Marcus' },
  { id: 6, name: 'Pilates Core', category: 'mind-body', duration: '45 min', level: 'Beginner', desc: 'Strengthen your core foundation', instructor: 'Instructor Lisa' },
  { id: 7, name: 'CrossFit WOD', category: 'strength', duration: '60 min', level: 'Advanced', desc: 'Workout of the day challenge', instructor: 'Coach Dave' },
  { id: 8, name: 'Stretch & Recovery', category: 'mind-body', duration: '30 min', level: 'All Levels', desc: 'Active recovery and flexibility', instructor: 'Instructor Amy' }
];

const CATEGORIES = [
  { id: 'all', name: 'All Classes' },
  { id: 'cardio', name: 'Cardio' },
  { id: 'strength', name: 'Strength' },
  { id: 'mind-body', name: 'Mind & Body' }
];

export default function ClassesPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? CLASSES : CLASSES.filter(c => c.category === filter);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Classes</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Find the perfect workout for your fitness journey</p>
      </section>

      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '72px', zIndex: 50 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '8px', padding: '16px 20px', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: filter === cat.id ? COLORS.primary : 'transparent', color: filter === cat.id ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {filtered.map(c => (
            <div key={c.id} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{c.name}</h3>
                <span style={{ padding: '6px 12px', backgroundColor: \`\${COLORS.primary}15\`, color: COLORS.primary, borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{c.level}</span>
              </div>
              <p style={{ opacity: 0.7, marginBottom: '20px', lineHeight: 1.6 }}>{c.desc}</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '14px', opacity: 0.7 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> {c.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={16} /> {c.instructor}</span>
              </div>
              <Link to="/schedule" style={{ display: 'inline-block', color: COLORS.primary, fontWeight: '600', textDecoration: 'none' }}>View Schedule →</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Get Started?</h2>
        <Link to="/membership" style={{ display: 'inline-block', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
          Join Now
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateClassesPage };
