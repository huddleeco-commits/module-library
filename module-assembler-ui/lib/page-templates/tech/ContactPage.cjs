/**
 * Tech ContactPage Generator
 */
function generateContactPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone, MapPin, Clock, Send, CheckCircle, HelpCircle, Book, Users } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const BUSINESS = ${JSON.stringify({
  name: business.name,
  email: business.email || 'hello@company.com',
  phone: business.phone || '1-800-123-4567'
}, null, 2)};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.7 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '0 20px 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {${JSON.stringify(content.contactMethods)}.map((method, idx) => (
            <a key={idx} href={method.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', color: 'inherit', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '60px', height: '60px', background: \`linear-gradient(135deg, \${COLORS.primary}15, \${COLORS.secondary}15)\`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                {method.icon === 'Mail' && <Mail size={28} color={COLORS.primary} />}
                {method.icon === 'MessageSquare' && <MessageSquare size={28} color={COLORS.primary} />}
                {method.icon === 'Phone' && <Phone size={28} color={COLORS.primary} />}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{method.title}</h3>
              <p style={{ opacity: 0.6, fontSize: '14px' }}>{method.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '24px' }}>Get in Touch</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '32px' }}>${content.formIntro}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {${JSON.stringify(content.helpLinks)}.map((link, idx) => (
                <a key={idx} href="#" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {link.icon === 'HelpCircle' && <HelpCircle size={24} color={COLORS.primary} />}
                    {link.icon === 'Book' && <Book size={24} color={COLORS.primary} />}
                    {link.icon === 'Users' && <Users size={24} color={COLORS.primary} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '14px', opacity: 0.6 }}>{link.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#05966920', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Send a Message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" placeholder="First Name" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                    <input type="text" placeholder="Last Name" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  </div>
                  <input type="email" placeholder="Email" required style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <input type="text" placeholder="Company (Optional)" style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <select style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">What can we help with?</option>
                    ${content.inquiryOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n                    ')}
                  </select>
                  <textarea placeholder="Your Message" rows={4} required style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '16px', resize: 'vertical' }} />
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', padding: '16px', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                    <Send size={20} /> Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Office Location</h2>
          <p style={{ opacity: 0.6, marginBottom: '24px' }}>${content.officeAddress}</p>
          <div style={{ height: '300px', backgroundColor: \`\${COLORS.primary}08\`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={60} color={COLORS.primary} style={{ opacity: 0.3 }} />
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function getContent(industry) {
  const content = {
    'saas': {
      subtitle: 'We are here to help you succeed',
      formIntro: 'Have a question or need help? Fill out the form and our team will get back to you within 24 hours.',
      officeAddress: '123 Tech Street, San Francisco, CA 94105',
      contactMethods: [
        { icon: 'Mail', title: 'Email Us', desc: 'hello@company.com', href: 'mailto:hello@company.com' },
        { icon: 'MessageSquare', title: 'Live Chat', desc: 'Chat with our team', href: '#' },
        { icon: 'Phone', title: 'Call Us', desc: '1-800-123-4567', href: 'tel:18001234567' }
      ],
      helpLinks: [
        { icon: 'HelpCircle', title: 'Help Center', desc: 'Browse our comprehensive help documentation' },
        { icon: 'Book', title: 'API Documentation', desc: 'Technical docs for developers' },
        { icon: 'Users', title: 'Community Forum', desc: 'Connect with other users' }
      ],
      inquiryOptions: [
        { value: 'sales', label: 'Sales Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'billing', label: 'Billing Question' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'other', label: 'Other' }
      ]
    },
    'ecommerce': {
      subtitle: 'Here to help with your order',
      formIntro: 'Have a question about your order or need assistance? Our customer service team is ready to help.',
      officeAddress: '456 Commerce Ave, New York, NY 10001',
      contactMethods: [
        { icon: 'Mail', title: 'Email Us', desc: 'support@store.com', href: 'mailto:support@store.com' },
        { icon: 'MessageSquare', title: 'Live Chat', desc: '24/7 customer support', href: '#' },
        { icon: 'Phone', title: 'Call Us', desc: '1-800-SHOP-NOW', href: 'tel:18007467669' }
      ],
      helpLinks: [
        { icon: 'HelpCircle', title: 'FAQs', desc: 'Find answers to common questions' },
        { icon: 'Book', title: 'Shipping Info', desc: 'Delivery times and tracking' },
        { icon: 'Users', title: 'Returns', desc: 'Easy returns and exchanges' }
      ],
      inquiryOptions: [
        { value: 'order', label: 'Order Status' },
        { value: 'return', label: 'Returns & Exchanges' },
        { value: 'product', label: 'Product Question' },
        { value: 'shipping', label: 'Shipping Inquiry' },
        { value: 'other', label: 'Other' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateContactPage };
