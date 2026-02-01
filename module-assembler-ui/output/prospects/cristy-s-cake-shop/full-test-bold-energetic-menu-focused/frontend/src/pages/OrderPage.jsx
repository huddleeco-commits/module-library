import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, Shield, ArrowRight, Package } from 'lucide-react';

export default function OrderPage() {
  const [step, setStep] = useState(1);

  const orderSteps = [
    { num: 1, title: 'Browse', desc: 'Select your items' },
    { num: 2, title: 'Cart', desc: 'Review your order' },
    { num: 3, title: 'Checkout', desc: 'Complete purchase' },
    { num: 4, title: 'Enjoy', desc: 'Delivered to you' }
  ];

  const benefits = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Package, title: 'Fresh Guarantee', desc: 'Arrives fresh or free' },
    { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
    { icon: CreditCard, title: 'Easy Returns', desc: '30-day satisfaction guarantee' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Order Online</h1>
        <p style={styles.subtitle}>Fresh baked goods delivered nationwide</p>
      </header>

      <section style={styles.steps}>
        <div style={styles.stepsGrid}>
          {orderSteps.map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{...styles.stepNum, ...(s.num <= step ? styles.stepActive : {})}}>{s.num}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <div style={styles.ctaContent}>
          <ShoppingCart size={48} color="#8B4513" />
          <h2 style={styles.ctaTitle}>Ready to Order?</h2>
          <p style={styles.ctaText}>Browse our menu and add your favorites to cart</p>
          <Link to="/menu" style={styles.ctaBtn}>Shop Menu <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section style={styles.benefits}>
        <div style={styles.container}>
          <div style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <div key={i} style={styles.benefitCard}>
                <b.icon size={28} color="#8B4513" />
                <h3 style={styles.benefitTitle}>{b.title}</h3>
                <p style={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.faq}>
        <div style={styles.container}>
          <h2 style={styles.faqTitle}>Shipping FAQ</h2>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>How long does shipping take?</h4>
              <p style={styles.faqA}>Standard shipping takes 2-3 business days. Express overnight is available.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>How do you keep items fresh?</h4>
              <p style={styles.faqA}>All items are packed with ice packs in insulated boxes for maximum freshness.</p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQ}>Do you ship nationwide?</h4>
              <p style={styles.faqA}>Yes! We ship to all 50 states. Some remote areas may have extended delivery times.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#f0f0f0', minHeight: '100vh' },
  header: { padding: '60px 24px', textAlign: 'center', background: '#e5e5e5' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#4b5563' },
  steps: { padding: '48px 24px', borderBottom: '1px solid #d1d5db' },
  stepsGrid: { display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' },
  stepItem: { textAlign: 'center' },
  stepNum: { width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: '700', color: '#4b5563' },
  stepActive: { background: '#8B4513', borderColor: '#8B4513', color: '#fff' },
  stepTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#1f2937', marginBottom: '4px' },
  stepDesc: { color: '#4b5563', fontSize: '0.9rem' },
  cta: { padding: '80px 24px', textAlign: 'center' },
  ctaContent: { maxWidth: '500px', margin: '0 auto' },
  ctaTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '24px 0 12px' },
  ctaText: { color: '#4b5563', marginBottom: '24px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#8B4513', color: '#fff', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' },
  benefits: { padding: '60px 20px', background: '#e5e5e5' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  benefitsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' },
  benefitCard: { background: '#ffffff', padding: '28px', borderRadius: '8px', textAlign: 'center' },
  benefitTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#1f2937', margin: '12px 0 8px' },
  benefitDesc: { color: '#4b5563', fontSize: '0.9rem' },
  faq: { padding: '60px 20px' },
  faqTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: '48px' },
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  faqItem: { background: '#ffffff', padding: '24px', borderRadius: '8px' },
  faqQ: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#1f2937', marginBottom: '8px' },
  faqA: { color: '#4b5563', lineHeight: 1.6 }
};
