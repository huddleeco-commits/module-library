/**
 * Education ContactPage Generator
 */
function generateContactPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, GraduationCap, Calendar, HelpCircle } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const BUSINESS = ${JSON.stringify({
  name: business.name,
  phone: business.phone || '(555) 123-4567',
  email: business.email || 'admissions@university.edu',
  address: business.address || '123 University Ave'
}, null, 2)};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>We are here to answer your questions</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: GraduationCap, title: 'Admissions Office', phone: BUSINESS.phone, email: 'admissions@university.edu', hours: 'Mon-Fri 8am-5pm' },
            { icon: HelpCircle, title: 'Student Services', phone: '(555) 123-4568', email: 'studentservices@university.edu', hours: 'Mon-Fri 9am-6pm' },
            { icon: Calendar, title: 'Schedule a Visit', phone: '(555) 123-4569', email: 'visits@university.edu', hours: 'Tours daily at 10am & 2pm' }
          ].map((office, idx) => (
            <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <office.icon size={28} color={COLORS.primary} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{office.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={\`tel:\${office.phone}\`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>
                  <Phone size={16} /> {office.phone}
                </a>
                <a href={\`mailto:\${office.email}\`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.primary, textDecoration: 'none' }}>
                  <Mail size={16} /> {office.email}
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '14px' }}>
                  <Clock size={16} /> {office.hours}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Visit Our Campus</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '24px' }}>
              Experience ${business.name} in person. Our beautiful campus is located in the heart of the city with easy access to public transportation.
            </p>
            <div style={{ height: '300px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MapPin size={60} color={COLORS.primary} style={{ opacity: 0.3 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={20} color={COLORS.primary} style={{ marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{BUSINESS.address}</p>
                <a href="#" style={{ color: COLORS.primary, textDecoration: 'none', fontSize: '14px' }}>Get Directions →</a>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>We will respond within 1-2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Send Us a Message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" placeholder="First Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                    <input type="text" placeholder="Last Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  </div>
                  <input type="email" placeholder="Email" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <input type="tel" placeholder="Phone (Optional)" style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">I am a...</option>
                    <option value="prospective">Prospective Student</option>
                    <option value="parent">Parent/Guardian</option>
                    <option value="current">Current Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="other">Other</option>
                  </select>
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">What can we help with?</option>
                    <option value="admissions">Admissions Information</option>
                    <option value="programs">Academic Programs</option>
                    <option value="financial">Financial Aid</option>
                    <option value="visit">Schedule a Visit</option>
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

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Take the Next Step?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Start your application today and join our community of scholars</p>
          <Link to="/admissions" style={{ display: 'inline-block', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateContactPage };
