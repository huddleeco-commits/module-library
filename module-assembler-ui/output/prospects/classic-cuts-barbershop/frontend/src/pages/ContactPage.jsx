import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>We'd love to hear from you</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.info}>
              <h2 style={styles.sectionTitle}>Get in Touch</h2>

              <div style={styles.infoItem}>
                <MapPin size={20} color="#1A1A2E" />
                <div>
                  <strong>Address</strong>
                  <p>2145 Main St, Lewisville TX 75067</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <Phone size={20} color="#1A1A2E" />
                <div>
                  <strong>Phone</strong>
                  <p><a href="tel:9725551001" style={styles.link}>972-555-1001</a></p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <Clock size={20} color="#1A1A2E" />
                <div>
                  <strong>Hours</strong>
                  <p>Monday - Friday: 9am - 6pm</p>
                  <p>Saturday: 10am - 4pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div style={styles.formContainer}>
              <h2 style={styles.sectionTitle}>Send us a Message</h2>
              <form style={styles.form}>
                <input type="text" placeholder="Your Name" style={styles.input} />
                <input type="email" placeholder="Your Email" style={styles.input} />
                <input type="tel" placeholder="Your Phone" style={styles.input} />
                <textarea placeholder="Your Message" rows={5} style={styles.textarea}></textarea>
                <button type="submit" style={styles.submitBtn}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '#1A1A2E', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' },
  info: {},
  sectionTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#1A1A2E' },
  infoItem: { display: 'flex', gap: '16px', marginBottom: '24px' },
  link: { color: '#1A1A2E' },
  formContainer: {},
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px' },
  textarea: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', resize: 'vertical' },
  submitBtn: { background: '#1A1A2E', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer' }
};
