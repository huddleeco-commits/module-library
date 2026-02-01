import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const hours = [
    { day: 'Monday - Friday', time: '7:00 AM - 6:00 PM' },
    { day: 'Saturday', time: '8:00 AM - 5:00 PM' },
    { day: 'Sunday', time: '9:00 AM - 3:00 PM' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Get In Touch</h1>
        <p style={styles.subtitle}>We would love to hear from you!</p>
      </header>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.contactInfo}>
              <div style={styles.infoCard}>
                <MapPin size={24} color="#8B4513" />
                <div>
                  <h3 style={styles.infoTitle}>Visit Us</h3>
                  <p style={styles.infoText}>3721 Justin Rd #150, Flower Mound, TX 75028, USA</p>
                </div>
              </div>
              <div style={styles.infoCard}>
                <Phone size={24} color="#8B4513" />
                <div>
                  <h3 style={styles.infoTitle}>Call Us</h3>
                  <p style={styles.infoText}>(214) 513-2253</p>
                </div>
              </div>
              <div style={styles.infoCard}>
                <Mail size={24} color="#8B4513" />
                <div>
                  <h3 style={styles.infoTitle}>Email Us</h3>
                  <p style={styles.infoText}>hello@business.com</p>
                </div>
              </div>
              <div style={styles.hoursCard}>
                <Clock size={24} color="#8B4513" />
                <div>
                  <h3 style={styles.infoTitle}>Hours</h3>
                  {hours.map((h, i) => (
                    <div key={i} style={styles.hourRow}>
                      <span>{h.day}</span>
                      <span style={styles.hourTime}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <h2 style={styles.formTitle}>Send Us a Message</h2>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                required
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                style={styles.textarea}
                rows={5}
                required
              />
              <button type="submit" style={styles.submitBtn}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#0f172a', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '#1e293b' },
  title: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '2.5rem', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' },
  subtitle: { color: '#94a3b8', fontSize: '1.1rem' },
  content: { padding: '120px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: '24px' },
  infoCard: { display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  hoursCard: { display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontWeight: '600', color: '#f8fafc', marginBottom: '4px' },
  infoText: { color: '#94a3b8' },
  hourRow: { display: 'flex', justifyContent: 'space-between', gap: '24px', color: '#94a3b8', marginTop: '8px' },
  hourTime: { fontWeight: '500', color: '#f8fafc' },
  form: { background: '#1e293b', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  formTitle: { fontFamily: "'Inter', 'Outfit', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '600', color: '#f8fafc', marginBottom: '24px' },
  input: { width: '100%', padding: '14px 16px', border: '1px solid #334155', borderRadius: '16px', fontSize: '1rem', marginBottom: '16px', background: '#0f172a', color: '#f8fafc' },
  textarea: { width: '100%', padding: '14px 16px', border: '1px solid #334155', borderRadius: '16px', fontSize: '1rem', marginBottom: '16px', resize: 'vertical', background: '#0f172a', color: '#f8fafc' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '#8B4513', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }
};
