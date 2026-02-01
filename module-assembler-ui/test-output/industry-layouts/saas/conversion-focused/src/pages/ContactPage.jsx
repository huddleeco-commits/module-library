/**
 * ContactPage - Conversion Focused Layout
 */
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

const COLORS = {
  "primary": "#6366F1",
  "secondary": "#8B5CF6",
  "accent": "#22D3EE",
  "background": "#F8FAFC",
  "text": "#1E293B"
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: COLORS.background || '#FAFAFA' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#6366F1',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>We would love to hear from you</p>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '60px'
        }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Get in Touch</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <a href="tel:(555) 987-FLOW" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#6366F115',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone size={24} color="#6366F1" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Phone</div>
                  <div style={{ opacity: 0.7 }}>(555) 987-FLOW</div>
                </div>
              </a>

              
              <a href="mailto:hello@flowstack-demo.com" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#6366F115',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={24} color="#6366F1" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Email</div>
                  <div style={{ opacity: 0.7 }}>hello@flowstack-demo.com</div>
                </div>
              </a>

              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#6366F115',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={24} color="#6366F1" />
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Address</div>
                  <div style={{ opacity: 0.7 }}>500 Tech Drive, San Francisco, CA 94107</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#05966920',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Send size={28} color="#059669" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ opacity: 0.7 }}>We will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Send us a message</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px'
                    }}
                  />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    required
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                  <button type="submit" style={{
                    backgroundColor: '#6366F1',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
