import React, { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your inquiry. Our concierge team will be in touch shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>CONTACT</span>
        <h1 style={styles.title}>Get in Touch</h1>
        <p style={styles.subtitle}>We would be honored to hear from you</p>
      </header>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.info}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>VISIT</span>
                <p style={styles.infoText}>3721 Justin Rd #150, Flower Mound, TX 75028, USA</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>CALL</span>
                <p style={styles.infoText}>(214) 513-2253</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>EMAIL</span>
                <p style={styles.infoText}>hello@business.com</p>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>HOURS</span>
                <p style={styles.infoText}>Monday - Saturday: 9am - 7pm</p>
                <p style={styles.infoText}>Sunday: By Appointment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <h2 style={styles.formTitle}>Private Inquiry</h2>
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.input} />
              <textarea placeholder="Your message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={styles.textarea} rows={5} required />
              <button type="submit" style={styles.submitBtn}>Submit Inquiry</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#f0f0f0', color: '#1f2937', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '#DEB887', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  subtitle: { color: '#4b5563', fontSize: '1.1rem' },
  content: { padding: '60px 24px 100px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' },
  info: { display: 'flex', flexDirection: 'column', gap: '32px' },
  infoItem: {},
  infoLabel: { color: '#DEB887', letterSpacing: '3px', fontSize: '0.75rem', display: 'block', marginBottom: '8px' },
  infoText: { color: '#4b5563', lineHeight: 1.6 },
  form: { background: '#e5e5e5', padding: '40px', borderRadius: '4px' },
  formTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '300', marginBottom: '32px' },
  input: { width: '100%', padding: '16px', border: 'none', borderBottom: '1px solid #d1d5db', fontSize: '1rem', marginBottom: '20px', background: 'transparent', color: '#1f2937' },
  textarea: { width: '100%', padding: '16px', border: 'none', borderBottom: '1px solid #d1d5db', fontSize: '1rem', marginBottom: '20px', resize: 'vertical', background: 'transparent', color: '#1f2937' },
  submitBtn: { width: '100%', background: '#DEB887', color: '#f0f0f0', border: 'none', padding: '16px', fontSize: '0.9rem', letterSpacing: '2px', cursor: 'pointer' }
};
