/**
 * Coffee2U - Contact Page
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Contact Us</h1>
        <p style={styles.heroSubtext}>We'd love to hear from you</p>
      </section>

      <section style={styles.mainSection}>
        <div style={styles.grid}>
          {/* Contact Info */}
          <div style={styles.infoColumn}>
            <h2 style={styles.infoTitle}>Get in Touch</h2>

            
            <div style={styles.infoItem}>
              <MapPin size={20} color="#8B4513" />
              <div>
                <strong>Location</strong>
                <p>Dallas, Texas</p>
              </div>
            </div>
            

            
            <div style={styles.infoItem}>
              <Phone size={20} color="#8B4513" />
              <div>
                <strong>Phone</strong>
                <p>(214) 555-1234</p>
              </div>
            </div>
            

            
            <div style={styles.infoItem}>
              <Mail size={20} color="#8B4513" />
              <div>
                <strong>Email</strong>
                <p>hello@coffeehousecafe.com</p>
              </div>
            </div>
            

            
          </div>

          {/* Contact Form */}
          <div style={styles.formColumn}>
            <h2 style={styles.formTitle}>Send a Message</h2>

            {submitted ? (
              <div style={styles.successMessage}>
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={styles.textarea}
                  />
                </div>
                <button type="submit" style={styles.submitButton}>
                  Send Message <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh'
  },
  hero: {
    padding: '120px 24px 60px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #8B451311 0%, #D2691E11 100%)'
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '16px'
  },
  heroSubtext: {
    fontSize: '1.1rem',
    color: '#2C1810',
    opacity: 0.7
  },
  mainSection: {
    padding: '60px 24px 80px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '48px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  infoColumn: {
    padding: '24px'
  },
  infoTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '32px'
  },
  infoItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    color: '#2C1810'
  },
  formColumn: {
    background: '#f8fafc',
    padding: '32px',
    borderRadius: '12px'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: '24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '500',
    color: '#2C1810'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px'
  },
  textarea: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    resize: 'vertical'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#8B4513',
    color: '#ffffff',
    padding: '14px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  successMessage: {
    background: '#10b98122',
    color: '#10b981',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center'
  }
};
