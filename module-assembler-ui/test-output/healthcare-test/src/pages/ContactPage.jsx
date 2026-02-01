/**
 * ContactPage - Healthcare Business
 * Business: Wellness Medical Center
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, Calendar, Send, CheckCircle,
  AlertCircle, MessageSquare, Car
} from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

const BUSINESS = {
  "name": "Wellness Medical Center",
  "location": "Boston, MA",
  "tagline": "Comprehensive Care for Your Whole Family",
  "industry": "healthcare",
  "teamSize": "20-50",
  "priceRange": "$$$",
  "established": "2005",
  "phone": "(555) 789-CARE",
  "email": "appointments@wellnessmedical-demo.com",
  "address": "200 Health Plaza, Boston, MA 02108",
  "hours": {
    "monday": "8:00 AM - 6:00 PM",
    "tuesday": "8:00 AM - 6:00 PM",
    "wednesday": "8:00 AM - 6:00 PM",
    "thursday": "8:00 AM - 6:00 PM",
    "friday": "8:00 AM - 5:00 PM",
    "saturday": "9:00 AM - 1:00 PM",
    "sunday": "Closed"
  }
};

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('success');
  };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '100px 0 60px',
        background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            We're here to help. Reach out anytime.
          </p>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section style={{ padding: '0', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {[
              { icon: Phone, label: 'Call Us', value: BUSINESS.phone || '(555) 789-CARE', action: 'tel:' + (BUSINESS.phone?.replace(/[^0-9]/g, '') || '5557894567'), color: '#0284C7' },
              { icon: Calendar, label: 'Book Online', value: 'Schedule 24/7', action: '/appointments', isLink: true, color: '#059669' },
              { icon: MessageSquare, label: 'Patient Portal', value: 'Message Your Doctor', action: '/patient-portal', isLink: true, color: '#7C3AED' },
              { icon: AlertCircle, label: 'Emergency', value: 'Call 911', action: 'tel:911', color: '#DC2626' }
            ].map((item, idx) => (
              item.isLink ? (
                <Link key={idx} to={item.action} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  color: COLORS.text
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: item.color + '15',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <item.icon size={28} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontWeight: '600' }}>{item.value}</p>
                  </div>
                </Link>
              ) : (
                <a key={idx} href={item.action} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  color: COLORS.text
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: item.color + '15',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <item.icon size={28} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ fontWeight: '600' }}>{item.value}</p>
                  </div>
                </a>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Location & Form */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px'
          }}>
            {/* Location Info */}
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Visit Our Office</h2>

              {/* Map Placeholder */}
              <div style={{
                height: '250px',
                backgroundColor: '#0284C715',
                borderRadius: '16px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={48} color="#0284C7" style={{ opacity: 0.3 }} />
              </div>

              {/* Address */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px'
              }}>
                <MapPin size={24} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>Address</h3>
                  <p style={{ opacity: 0.7 }}>200 Health Plaza, Boston, MA 02108</p>
                </div>
              </div>

              {/* Hours */}
              <div style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <Clock size={24} color="#0284C7" style={{ flexShrink: 0 }} />
                  <h3 style={{ fontWeight: '600' }}>Office Hours</h3>
                </div>
                <div style={{ display: 'grid', gap: '8px', paddingLeft: '40px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>monday</span>
                    <span style={{ fontWeight: '500' }}>8:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>tuesday</span>
                    <span style={{ fontWeight: '500' }}>8:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>wednesday</span>
                    <span style={{ fontWeight: '500' }}>8:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>thursday</span>
                    <span style={{ fontWeight: '500' }}>8:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>friday</span>
                    <span style={{ fontWeight: '500' }}>8:00 AM - 5:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>saturday</span>
                    <span style={{ fontWeight: '500' }}>9:00 AM - 1:00 PM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textTransform: 'capitalize' }}>sunday</span>
                    <span style={{ fontWeight: '500' }}>Closed</span>
                  </div>
                </div>
              </div>

              {/* Parking */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px'
              }}>
                <Car size={24} color="#0284C7" style={{ flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>Parking</h3>
                  <p style={{ opacity: 0.7 }}>Free parking available in the building garage. Enter from Main Street.</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Send Us a Message</h2>
              <p style={{ opacity: 0.7, marginBottom: '32px' }}>We'll respond within 1 business day</p>

              {formStatus === 'success' ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#05966915',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                  }}>
                    <CheckCircle size={40} />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Message Sent!</h3>
                  <p style={{ opacity: 0.7, marginBottom: '24px' }}>We'll get back to you within 1 business day.</p>
                  <button onClick={() => setFormStatus(null)} style={{
                    backgroundColor: '#0284C7',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name *</label>
                      <input required type="text" style={styles.input} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name *</label>
                      <input required type="text" style={styles.input} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email *</label>
                    <input required type="email" style={styles.input} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phone</label>
                    <input type="tel" style={styles.input} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subject *</label>
                    <select required style={styles.input}>
                      <option value="">Select a topic</option>
                      <option value="appointment">Appointment Question</option>
                      <option value="billing">Billing Question</option>
                      <option value="records">Medical Records</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Message *</label>
                    <textarea required rows={5} style={{ ...styles.input, resize: 'vertical' }} placeholder="How can we help you?" />
                  </div>
                  <button type="submit" style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#0284C7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid rgba(0,0,0,0.1)',
    borderRadius: '8px',
    fontSize: '16px'
  }
};
