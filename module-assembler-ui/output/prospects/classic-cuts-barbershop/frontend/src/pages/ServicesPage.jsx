import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const services = [
    { name: 'Service One', description: 'High-quality service tailored to your needs.' },
    { name: 'Service Two', description: 'Professional and reliable, every time.' },
    { name: 'Service Three', description: 'Customized solutions for your unique situation.' },
    { name: 'Service Four', description: 'Exceptional value and outstanding results.' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Our Services</h1>
          <p style={styles.subtitle}>Discover what Classic Cuts Barbershop can do for you</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.serviceGrid}>
            {services.map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <CheckCircle size={32} color="#1A1A2E" />
                <h3 style={styles.serviceName}>{service.name}</h3>
                <p style={styles.serviceDesc}>{service.description}</p>
              </div>
            ))}
          </div>

          <div style={styles.cta}>
            <h2>Ready to get started?</h2>
            <p>Contact us today to learn more about our services.</p>
            <Link to="/contact" style={styles.ctaBtn}>Contact Us <ArrowRight size={16} /></Link>
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
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '60px' },
  serviceCard: { padding: '32px', background: '#f9fafb', borderRadius: '12px', textAlign: 'center' },
  serviceName: { fontSize: '1.25rem', fontWeight: '600', margin: '16px 0 8px', color: '#1A1A2E' },
  serviceDesc: { color: '#1A1A2E', opacity: 0.7, lineHeight: 1.6 },
  cta: { textAlign: 'center', padding: '48px', background: '#1A1A2E11', borderRadius: '16px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1A1A2E', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', marginTop: '20px' }
};
