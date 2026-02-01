import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Phone, ArrowRight } from 'lucide-react';

export default function OrderPage() {
  const [orderType, setOrderType] = useState('collection');

  const services = [
    { type: 'collection', title: 'Atelier Collection', desc: 'Visit our atelier to select your pieces in person', time: 'Available daily, 9am - 7pm' },
    { type: 'delivery', title: 'White Glove Delivery', desc: 'Complimentary same-day delivery within the city', time: 'Order by 2pm for same-day' },
    { type: 'custom', title: 'Bespoke Orders', desc: 'Commission a custom creation for your special occasion', time: '48-72 hour lead time' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.label}>ORDERING</span>
        <h1 style={styles.title}>Acquire Our Creations</h1>
        <p style={styles.subtitle}>Experience the art of acquisition</p>
      </header>

      <section style={styles.services}>
        <div style={styles.container}>
          <div style={styles.serviceGrid}>
            {services.map((service, i) => (
              <div
                key={i}
                onClick={() => setOrderType(service.type)}
                style={{...styles.serviceCard, ...(orderType === service.type ? styles.serviceActive : {})}}
              >
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <p style={styles.serviceDesc}>{service.desc}</p>
                <p style={styles.serviceTime}><Clock size={14} /> {service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.action}>
        <div style={styles.actionContent}>
          {orderType === 'collection' && (
            <>
              <h2 style={styles.actionTitle}>Visit Our Atelier</h2>
              <p style={styles.actionText}>Experience our collection in person. Our artisans will guide you through our offerings.</p>
              <Link to="/contact" style={styles.actionBtn}>Schedule Visit <ArrowRight size={16} /></Link>
            </>
          )}
          {orderType === 'delivery' && (
            <>
              <h2 style={styles.actionTitle}>Delivered to You</h2>
              <p style={styles.actionText}>Browse our collection online and have your selection delivered with care.</p>
              <Link to="/menu" style={styles.actionBtn}>View Collection <ArrowRight size={16} /></Link>
            </>
          )}
          {orderType === 'custom' && (
            <>
              <h2 style={styles.actionTitle}>Bespoke Creations</h2>
              <p style={styles.actionText}>Commission a unique piece for your celebration. Our artisans await your vision.</p>
              <a href="tel:(214) 513-2253" style={styles.actionBtn}><Phone size={16} /> (214) 513-2253</a>
            </>
          )}
        </div>
      </section>

      <section style={styles.note}>
        <p style={styles.noteText}>
          For corporate orders, events, or inquiries regarding our seasonal collections,
          please contact our concierge team directly.
        </p>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', color: '#3E2723', minHeight: '100vh' },
  header: { padding: '100px 24px 60px', textAlign: 'center' },
  label: { color: '#DEB887', letterSpacing: '4px', fontSize: '0.85rem' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '300', marginTop: '16px', marginBottom: '12px' },
  subtitle: { color: '#64748b', fontSize: '1.1rem' },
  services: { padding: '60px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  serviceCard: { background: '#F5F3F0', padding: '32px', cursor: 'pointer', transition: 'all 0.3s', border: '1px solid transparent' },
  serviceActive: { borderColor: '#DEB887' },
  serviceTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.25rem', fontWeight: '400', marginBottom: '12px' },
  serviceDesc: { color: '#64748b', lineHeight: 1.6, marginBottom: '16px' },
  serviceTime: { display: 'flex', alignItems: 'center', gap: '8px', color: '#DEB887', fontSize: '0.9rem' },
  action: { padding: '80px 24px', textAlign: 'center', background: '#F5F3F0' },
  actionContent: { maxWidth: '500px', margin: '0 auto' },
  actionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '300', marginBottom: '16px' },
  actionText: { color: '#64748b', lineHeight: 1.6, marginBottom: '32px' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#DEB887', textDecoration: 'none', letterSpacing: '2px', fontSize: '0.9rem', borderBottom: '1px solid #DEB887', paddingBottom: '4px' },
  note: { padding: '60px 24px', textAlign: 'center' },
  noteText: { color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontStyle: 'italic' }
};
