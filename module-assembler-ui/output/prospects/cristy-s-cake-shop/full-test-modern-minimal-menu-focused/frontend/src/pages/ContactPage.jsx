import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Package, CreditCard, Truck, ArrowRight, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for contacting us! We will respond within 24 hours.');
    setFormData({ name: '', email: '', orderNumber: '', subject: '', message: '' });
  };

  const supportOptions = [
    { icon: Package, title: 'Order Issues', desc: 'Track, modify, or cancel orders', link: '/orders' },
    { icon: Truck, title: 'Shipping', desc: 'Delivery questions and updates', link: '/shipping' },
    { icon: CreditCard, title: 'Returns', desc: 'Easy 30-day return policy', link: '/returns' },
    { icon: MessageCircle, title: 'General', desc: 'Product questions and more', link: '#form' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>How Can We Help?</h1>
        <p style={styles.subtitle}>Our support team is here for you 24/7</p>
      </header>

      <section style={styles.options}>
        <div style={styles.container}>
          <div style={styles.optionsGrid}>
            {supportOptions.map((opt, i) => (
              <a key={i} href={opt.link} style={styles.optionCard}>
                <opt.icon size={28} color="#8B4513" />
                <h3 style={styles.optionTitle}>{opt.title}</h3>
                <p style={styles.optionDesc}>{opt.desc}</p>
                <span style={styles.optionLink}>Learn more <ArrowRight size={14} /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="form" style={styles.formSection}>
        <div style={styles.container}>
          <div style={styles.formGrid}>
            <div style={styles.formInfo}>
              <h2 style={styles.formTitle}>Contact Us Directly</h2>
              <p style={styles.formText}>
                Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
              </p>
              <div style={styles.quickContact}>
                <a href="tel:(214) 513-2253" style={styles.quickLink}><Phone size={18} /> (214) 513-2253</a>
                <a href="mailto:hello@business.com" style={styles.quickLink}><Mail size={18} /> hello@business.com</a>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.input} required />
              </div>
              <input type="text" placeholder="Order Number (optional)" value={formData.orderNumber} onChange={(e) => setFormData({...formData, orderNumber: e.target.value})} style={styles.input} />
              <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} style={styles.input} required>
                <option value="">Select a topic</option>
                <option value="order">Order Issue</option>
                <option value="shipping">Shipping Question</option>
                <option value="return">Return Request</option>
                <option value="product">Product Question</option>
                <option value="other">Other</option>
              </select>
              <textarea placeholder="How can we help?" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} style={styles.textarea} rows={4} required />
              <button type="submit" style={styles.submitBtn}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '#FFF8F5' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', marginBottom: '8px' },
  subtitle: { color: '#64748b' },
  options: { padding: '48px 24px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  optionCard: { background: '#fff', padding: '24px', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s', display: 'block' },
  optionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#3E2723', margin: '12px 0 4px' },
  optionDesc: { color: '#64748b', fontSize: '0.9rem', marginBottom: '12px' },
  optionLink: { display: 'flex', alignItems: 'center', gap: '4px', color: '#8B4513', fontSize: '0.9rem', fontWeight: '500' },
  formSection: { padding: '120px 20px', background: '#FFF8F5' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' },
  formInfo: {},
  formTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.75rem', fontWeight: '700', color: '#3E2723', marginBottom: '16px' },
  formText: { color: '#64748b', lineHeight: 1.6, marginBottom: '24px' },
  quickContact: { display: 'flex', flexDirection: 'column', gap: '12px' },
  quickLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '#8B4513', textDecoration: 'none', fontWeight: '500' },
  form: { background: '#fff', padding: '28px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '12px', background: '#FFF8F0', color: '#3E2723' },
  textarea: { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '12px', resize: 'vertical', background: '#FFF8F0', color: '#3E2723' },
  submitBtn: { width: '100%', background: '#8B4513', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }
};
