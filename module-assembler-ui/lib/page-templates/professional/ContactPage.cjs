/**
 * Professional Services ContactPage Generator
 */
function generateContactPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContactContent(business.industry);

  return `import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const BUSINESS = ${JSON.stringify({
  name: business.name,
  phone: business.phone || '(555) 123-4567',
  email: business.email || 'info@company.com',
  address: business.address || '123 Main Street'
}, null, 2)};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
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
              {${JSON.stringify(content.hours)}.map((h, idx) => (
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
            <p style={{ fontWeight: '500' }}>{BUSINESS.address}</p>
          </div>

          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>${content.thankYou}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '32px' }}>${content.formTitle}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" placeholder="First Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                    <input type="text" placeholder="Last Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  </div>
                  <input type="email" placeholder="Email" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <input type="tel" placeholder="Phone" style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">How can we help?</option>
                    ${content.inquiryOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n                    ')}
                  </select>
                  <textarea placeholder="Your Message" rows={4} required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', resize: 'vertical' }} />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                    <Send size={20} /> ${content.submitButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function getContactContent(industry) {
  const content = {
    'law-firm': {
      subtitle: 'Schedule your free consultation',
      formTitle: 'Request a Consultation',
      submitButton: 'Send Message',
      thankYou: 'We will contact you within 24 hours to schedule your consultation.',
      hours: [
        { days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
        { days: 'Saturday', time: 'By Appointment' },
        { days: 'Sunday', time: 'Closed' },
        { days: 'Emergency', time: '24/7 Available' }
      ],
      inquiryOptions: [
        { value: 'personal-injury', label: 'Personal Injury' },
        { value: 'family-law', label: 'Family Law' },
        { value: 'business', label: 'Business Law' },
        { value: 'criminal', label: 'Criminal Defense' },
        { value: 'other', label: 'Other' }
      ]
    },
    'real-estate': {
      subtitle: 'Let us help you with your real estate needs',
      formTitle: 'Get in Touch',
      submitButton: 'Send Message',
      thankYou: 'An agent will be in touch within 24 hours.',
      hours: [
        { days: 'Monday - Friday', time: '9:00 AM - 7:00 PM' },
        { days: 'Saturday', time: '10:00 AM - 5:00 PM' },
        { days: 'Sunday', time: '12:00 PM - 4:00 PM' }
      ],
      inquiryOptions: [
        { value: 'buying', label: 'Buying a Home' },
        { value: 'selling', label: 'Selling a Home' },
        { value: 'renting', label: 'Renting' },
        { value: 'investment', label: 'Investment Property' },
        { value: 'other', label: 'Other' }
      ]
    },
    'plumber': {
      subtitle: 'We are here to help with all your plumbing needs',
      formTitle: 'Request Service',
      submitButton: 'Submit Request',
      thankYou: 'We will contact you shortly to confirm your service appointment.',
      hours: [
        { days: 'Monday - Friday', time: '7:00 AM - 7:00 PM' },
        { days: 'Saturday', time: '8:00 AM - 5:00 PM' },
        { days: 'Sunday', time: '9:00 AM - 3:00 PM' },
        { days: 'Emergency', time: '24/7 Available' }
      ],
      inquiryOptions: [
        { value: 'emergency', label: 'Emergency Service' },
        { value: 'repair', label: 'General Repair' },
        { value: 'water-heater', label: 'Water Heater' },
        { value: 'drain', label: 'Drain Cleaning' },
        { value: 'other', label: 'Other' }
      ]
    },
    'cleaning': {
      subtitle: 'Get your free quote today',
      formTitle: 'Request a Quote',
      submitButton: 'Get Quote',
      thankYou: 'We will send you a customized quote within 24 hours.',
      hours: [
        { days: 'Monday - Friday', time: '8:00 AM - 6:00 PM' },
        { days: 'Saturday', time: '9:00 AM - 4:00 PM' },
        { days: 'Sunday', time: 'Closed' }
      ],
      inquiryOptions: [
        { value: 'regular', label: 'Regular Cleaning' },
        { value: 'deep', label: 'Deep Cleaning' },
        { value: 'move', label: 'Move In/Out Cleaning' },
        { value: 'office', label: 'Office Cleaning' },
        { value: 'other', label: 'Other' }
      ]
    },
    'auto-shop': {
      subtitle: 'Schedule your service appointment',
      formTitle: 'Schedule Service',
      submitButton: 'Request Appointment',
      thankYou: 'We will confirm your appointment within 24 hours.',
      hours: [
        { days: 'Monday - Friday', time: '7:30 AM - 6:00 PM' },
        { days: 'Saturday', time: '8:00 AM - 4:00 PM' },
        { days: 'Sunday', time: 'Closed' }
      ],
      inquiryOptions: [
        { value: 'oil-change', label: 'Oil Change' },
        { value: 'brakes', label: 'Brake Service' },
        { value: 'engine', label: 'Engine/Check Engine Light' },
        { value: 'ac', label: 'AC/Heating' },
        { value: 'other', label: 'Other Service' }
      ]
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateContactPage };
