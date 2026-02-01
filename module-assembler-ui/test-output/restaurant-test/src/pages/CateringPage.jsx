/**
 * CateringPage - Test Pizza Co
 */
import React, { useState } from 'react';
import { Users, Utensils, Calendar, CheckCircle, Phone, Star } from 'lucide-react';

const COLORS = {
  "primary": "#E63946",
  "secondary": "#F4A261",
  "accent": "#2A9D8F",
  "background": "#1D3557",
  "text": "#F1FAEE"
};

const PACKAGES = [
  {
    name: 'Essential',
    price: '$25',
    unit: 'per person',
    description: 'Perfect for casual gatherings',
    features: ['Choice of 2 entrees', 'House salad', 'Fresh bread', 'Disposable serviceware'],
    minGuests: 15
  },
  {
    name: 'Premium',
    price: '$45',
    unit: 'per person',
    description: 'Our most popular package',
    features: ['Choice of 3 entrees', '2 appetizers', 'Caesar or house salad', 'Dessert selection', 'Real serviceware available'],
    minGuests: 20,
    popular: true
  },
  {
    name: 'Executive',
    price: '$65',
    unit: 'per person',
    description: 'The complete experience',
    features: ['Full menu access', 'Passed appetizers', 'Gourmet salad bar', 'Premium dessert display', 'Dedicated service staff', 'Bar service available'],
    minGuests: 30
  }
];

const TESTIMONIALS = [
  { name: 'Corporate Events Inc.', text: 'They made our annual gala unforgettable. The food was exceptional!', rating: 5 },
  { name: 'Sarah & Mike', text: 'Our wedding reception was perfect thanks to their amazing catering team.', rating: 5 }
];

export default function CateringPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 20px',
        backgroundColor: COLORS.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Catering Services</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Let us make your event unforgettable</p>
      </section>

      {/* Packages */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Catering Packages</h2>
            <p style={{ opacity: 0.7, fontSize: '18px' }}>Choose the perfect package for your event</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {PACKAGES.map((pkg, idx) => (
              <div key={idx} style={{
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                position: 'relative',
                border: pkg.popular ? `2px solid ${COLORS.primary}` : 'none'
              }}>
                {pkg.popular && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: COLORS.primary,
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Most Popular
                  </span>
                )}
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{pkg.name}</h3>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '700', color: COLORS.primary }}>{pkg.price}</span>
                  <span style={{ opacity: 0.6 }}> {pkg.unit}</span>
                </div>
                <p style={{ opacity: 0.7, marginBottom: '24px' }}>{pkg.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                  {pkg.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <CheckCircle size={18} color={COLORS.primary} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '20px' }}>Minimum {pkg.minGuests} guests</p>
                <a href="#inquiry" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  backgroundColor: pkg.popular ? COLORS.primary : 'transparent',
                  color: pkg.popular ? 'white' : COLORS.primary,
                  border: pkg.popular ? 'none' : `2px solid ${COLORS.primary}`,
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}>
                  Get Quote
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Request a Quote</h2>
            <p style={{ opacity: 0.7 }}>Tell us about your event and we will create a custom proposal</p>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: COLORS.background, borderRadius: '16px' }}>
              <CheckCircle size={60} color="#059669" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px' }}>Request Received!</h3>
              <p style={{ opacity: 0.7 }}>Our catering team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: '40px', backgroundColor: COLORS.background, borderRadius: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input type="text" placeholder="Your Name" required style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="text" placeholder="Company/Organization" style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input type="email" placeholder="Email Address" required style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="tel" placeholder="Phone Number" required style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <input type="date" required style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                <input type="number" placeholder="Number of Guests" min="15" required style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
              </div>
              <select style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', marginBottom: '16px', backgroundColor: 'white' }}>
                <option value="">Event Type</option>
                <option value="corporate">Corporate Event</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday Party</option>
                <option value="holiday">Holiday Party</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="Tell us more about your event..." rows={4} style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', marginBottom: '24px', resize: 'vertical' }} />
              <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: COLORS.primary, color: 'white', borderRadius: '8px', border: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}>
                Submit Request
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>What Clients Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
                <p style={{ fontWeight: '600' }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Questions?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>Our catering team is here to help</p>
        <a href="tel:(555) 123-4567" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '50px', fontWeight: '600', textDecoration: 'none' }}>
          <Phone size={20} />
          Call (555) 123-4567
        </a>
      </section>
    </div>
  );
}
