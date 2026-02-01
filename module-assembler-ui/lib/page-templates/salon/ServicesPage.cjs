/**
 * Salon ServicesPage Generator
 */
function generateServicesPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Scissors, Sparkles, Heart, Eye } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const SERVICES = {
  hair: {
    name: 'Hair Services',
    items: [
      { name: 'Womens Haircut', price: '$55+', duration: '45 min', desc: 'Consultation, cut, and style' },
      { name: 'Mens Haircut', price: '$35+', duration: '30 min', desc: 'Classic or modern cuts' },
      { name: 'Blow Dry & Style', price: '$45+', duration: '45 min', desc: 'Wash and professional styling' },
      { name: 'Full Color', price: '$95+', duration: '2 hrs', desc: 'Single process color' },
      { name: 'Highlights', price: '$125+', duration: '2.5 hrs', desc: 'Partial or full highlights' },
      { name: 'Balayage', price: '$175+', duration: '3 hrs', desc: 'Hand-painted highlights' },
      { name: 'Deep Conditioning', price: '$35+', duration: '20 min', desc: 'Intensive hair treatment' },
      { name: 'Keratin Treatment', price: '$250+', duration: '3 hrs', desc: 'Smoothing treatment' }
    ]
  },
  skin: {
    name: 'Skin Care',
    items: [
      { name: 'Classic Facial', price: '$85', duration: '60 min', desc: 'Deep cleanse and hydration' },
      { name: 'Anti-Aging Facial', price: '$125', duration: '75 min', desc: 'Targeted wrinkle treatment' },
      { name: 'Chemical Peel', price: '$150', duration: '45 min', desc: 'Skin resurfacing treatment' },
      { name: 'Microdermabrasion', price: '$135', duration: '60 min', desc: 'Exfoliation treatment' }
    ]
  },
  nails: {
    name: 'Nail Services',
    items: [
      { name: 'Classic Manicure', price: '$35', duration: '30 min', desc: 'File, shape, polish' },
      { name: 'Gel Manicure', price: '$50', duration: '45 min', desc: 'Long-lasting gel polish' },
      { name: 'Classic Pedicure', price: '$55', duration: '45 min', desc: 'Soak, scrub, polish' },
      { name: 'Spa Pedicure', price: '$75', duration: '60 min', desc: 'Deluxe treatment with mask' },
      { name: 'Nail Art', price: '$10+', duration: '15 min', desc: 'Per nail design' }
    ]
  },
  makeup: {
    name: 'Makeup',
    items: [
      { name: 'Full Makeup Application', price: '$85', duration: '60 min', desc: 'Complete look' },
      { name: 'Bridal Makeup', price: '$150', duration: '90 min', desc: 'Your perfect wedding look' },
      { name: 'Lash Extensions', price: '$175', duration: '2 hrs', desc: 'Full set application' },
      { name: 'Brow Shaping', price: '$25', duration: '20 min', desc: 'Wax or tweeze' }
    ]
  }
};

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('hair');
  const categories = Object.keys(SERVICES);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Services & Pricing</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Expert treatments for your beauty needs</p>
      </section>

      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '72px', zIndex: 50 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '8px', padding: '16px 20px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '12px 24px', borderRadius: '50px', border: 'none',
              backgroundColor: activeCategory === cat ? COLORS.primary : 'transparent',
              color: activeCategory === cat ? 'white' : COLORS.text,
              fontWeight: '600', cursor: 'pointer'
            }}>
              {SERVICES[cat].name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '40px' }}>{SERVICES[activeCategory].name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {SERVICES[activeCategory].items.map((item, idx) => (
              <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{item.name}</h3>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>{item.price}</span>
                </div>
                <p style={{ opacity: 0.7, marginBottom: '8px' }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '14px' }}>
                  <Clock size={14} /> {item.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Book?</h2>
        <Link to="/booking" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          <Calendar size={20} /> Book Appointment
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateServicesPage };
