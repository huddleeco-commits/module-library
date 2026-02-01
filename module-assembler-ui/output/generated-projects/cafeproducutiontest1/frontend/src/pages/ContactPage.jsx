/**
 * cafeproducutiontest1 - Contact Page
 */
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>We'd love to hear from you</p>
      </section>

      <section style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.info}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>

            <div style={styles.infoItem}>
              <MapPin size={24} color="#6366f1" />
              <div>
                <strong>Location</strong>
                <p>Lewisville, TX</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Phone size={24} color="#6366f1" />
              <div>
                <strong>Phone</strong>
                <p>(555) 123-4567</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Mail size={24} color="#6366f1" />
              <div>
                <strong>Email</strong>
                <p>hello@cafeproducutiontest1.com</p>
              </div>
            </div>
          </div>

          <div style={styles.form}>
            <h2 style={styles.sectionTitle}>Send a Message</h2>
            <form>
              <input type="text" placeholder="Your Name" style={styles.input} />
              <input type="email" placeholder="Your Email" style={styles.input} />
              <textarea placeholder="Your Message" rows={5} style={styles.textarea}></textarea>
              <button type="submit" style={styles.button}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  hero: { padding: '67px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f115 0%, #06b6d415 100%)' },
  title: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '16px' },
  subtitle: { fontSize: '1.25rem', color: '#1a1a2e', opacity: 0.8 },
  content: { padding: '67px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '24px' },
  info: { padding: '27px' },
  infoItem: { display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' },
  form: { background: '#f8fafc', padding: '27px', borderRadius: '9px' },
  input: { width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '16px' },
  textarea: { width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '9px', fontSize: '16px', resize: 'vertical' },
  button: { width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};
