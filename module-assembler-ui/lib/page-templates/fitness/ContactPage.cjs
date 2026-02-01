/**
 * Fitness ContactPage Generator
 */
function generateContactPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Instagram, Facebook, Youtube } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const BUSINESS = ${JSON.stringify({
  name: business.name,
  phone: business.phone || '(555) 123-4567',
  email: business.email || 'info@gym.com',
  address: business.address || '123 Fitness Ave'
}, null, 2)};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>We're here to help you on your fitness journey</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { icon: Phone, label: 'Call Us', value: BUSINESS.phone, href: 'tel:' + BUSINESS.phone.replace(/[^0-9]/g, '') },
            { icon: Mail, label: 'Email', value: BUSINESS.email, href: 'mailto:' + BUSINESS.email },
            { icon: MapPin, label: 'Visit Us', value: 'Get Directions', href: '#' }
          ].map((item, idx) => (
            <a key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={24} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.6 }}>{item.label}</div>
                <div style={{ fontWeight: '600' }}>{item.value}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px' }}>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '24px' }}>Hours of Operation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
              {[
                { days: 'Monday - Friday', time: '5:00 AM - 11:00 PM' },
                { days: 'Saturday', time: '6:00 AM - 10:00 PM' },
                { days: 'Sunday', time: '7:00 AM - 9:00 PM' },
                { days: 'Holidays', time: '8:00 AM - 6:00 PM' }
              ].map((h, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontWeight: '500' }}>{h.days}</span>
                  <span style={{ opacity: 0.7 }}>{h.time}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '24px' }}>Location</h3>
            <div style={{ height: '250px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={48} color={COLORS.primary} style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontWeight: '500', marginBottom: '24px' }}>{BUSINESS.address}</p>

            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" style={{ width: '44px', height: '44px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={COLORS.primary} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '32px' }}>Send a Message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" placeholder="First Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                    <input type="text" placeholder="Last Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  </div>
                  <input type="email" placeholder="Email" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <input type="tel" placeholder="Phone" style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">What can we help with?</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="pt">Personal Training</option>
                    <option value="classes">Class Information</option>
                    <option value="tour">Schedule a Tour</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea placeholder="Your Message" rows={4} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', resize: 'vertical' }} />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                    <Send size={20} /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: COLORS.primary, textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Ready to Get Started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>Start your free 7-day trial today</p>
        <Link to="/membership" style={{ display: 'inline-block', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
          View Membership Plans
        </Link>
      </section>
    </div>
  );
}`;
}

module.exports = { generateContactPage };
