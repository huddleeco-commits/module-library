/**
 * Salon GalleryPage Generator
 */
function generateGalleryPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, X, Scissors, Sparkles, Heart } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const GALLERY = [
  { id: 1, category: 'hair', title: 'Balayage Transformation' },
  { id: 2, category: 'hair', title: 'Precision Bob Cut' },
  { id: 3, category: 'nails', title: 'Nail Art Design' },
  { id: 4, category: 'hair', title: 'Vivid Color' },
  { id: 5, category: 'skin', title: 'Glowing Skin Results' },
  { id: 6, category: 'hair', title: 'Bridal Updo' },
  { id: 7, category: 'nails', title: 'French Manicure' },
  { id: 8, category: 'hair', title: 'Mens Modern Cut' },
  { id: 9, category: 'skin', title: 'Facial Treatment' },
  { id: 10, category: 'hair', title: 'Highlights' },
  { id: 11, category: 'nails', title: 'Gel Extensions' },
  { id: 12, category: 'hair', title: 'Color Correction' }
];

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'hair', name: 'Hair' },
  { id: 'nails', name: 'Nails' },
  { id: 'skin', name: 'Skin' }
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = activeCategory === 'all' ? GALLERY : GALLERY.filter(g => g.category === activeCategory);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Work</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>See the transformations we create</p>
      </section>

      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '72px', zIndex: 50 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '8px', padding: '16px 20px', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '12px 24px', borderRadius: '50px', border: 'none', backgroundColor: activeCategory === cat.id ? COLORS.primary : 'transparent', color: activeCategory === cat.id ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map(item => (
            <div key={item.id} onClick={() => setSelected(item)} style={{ aspectRatio: '1', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {item.category === 'hair' && <Scissors size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {item.category === 'nails' && <Heart size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {item.category === 'skin' && <Sparkles size={48} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '40px 16px 16px', color: 'white' }}>
                <p style={{ fontWeight: '600' }}>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={24} color="white" />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '1', backgroundColor: \`\${COLORS.primary}20\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selected.category === 'hair' && <Scissors size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {selected.category === 'nails' && <Heart size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
              {selected.category === 'skin' && <Sparkles size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />}
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{selected.title}</h3>
              <Link to="/booking" style={{ display: 'inline-block', backgroundColor: COLORS.primary, color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Book This Service</Link>
            </div>
          </div>
        </div>
      )}

      <section style={{ padding: '80px 20px', backgroundColor: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Love What You See?</h2>
        <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px 32px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          <Calendar size={20} /> Book Your Appointment
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateGalleryPage };
