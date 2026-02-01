/**
 * InsurancePage - Healthcare Business
 * Business: Wellness Medical Center
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Shield, FileText, Phone, CheckCircle, HelpCircle,
  ChevronDown, DollarSign, Calendar
} from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

const INSURANCE_PLANS = [
  "Blue Cross Blue Shield",
  "Aetna",
  "Cigna",
  "United Healthcare",
  "Medicare",
  "Medicaid",
  "Harvard Pilgrim",
  "Tufts Health"
];

const BILLING_FAQ = [
  { q: 'What forms of payment do you accept?', a: 'We accept cash, check, all major credit cards, HSA/FSA cards, and offer payment plans for larger balances.' },
  { q: 'Do you offer payment plans?', a: 'Yes! We offer interest-free payment plans for balances over $200. Ask our billing team for details.' },
  { q: 'What if my insurance denies a claim?', a: 'Our billing team will work with your insurance to appeal denials. We\'ll keep you informed throughout the process.' },
  { q: 'Can I see cost estimates before my visit?', a: 'Yes, call our office and we can provide estimates based on your insurance coverage and the expected services.' }
];

export default function InsurancePage() {
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
            Insurance & Billing
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            We make understanding your healthcare costs simple
          </p>
        </div>
      </section>

      {/* Accepted Insurance */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '16px' }}>Accepted Insurance Plans</h2>
          <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '48px' }}>
            We work with most major insurance providers
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {INSURANCE_PLANS.map((plan, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <CheckCircle size={20} color="#059669" />
                <span style={{ fontWeight: '500' }}>{plan}</span>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: '#0284C710',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '16px' }}>
              <strong>Don't see your insurance?</strong> Contact us - we may still be able to work with your plan.
            </p>
            <a href="tel:(555) 789-CARE" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0284C7',
              fontWeight: '600'
            }}>
              <Phone size={18} />
              Call (555) 789-CARE
            </a>
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Payment Options</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {[
              { icon: CreditCard, title: 'Credit & Debit Cards', description: 'We accept Visa, Mastercard, American Express, and Discover' },
              { icon: DollarSign, title: 'HSA/FSA Cards', description: 'Use your health savings or flexible spending account' },
              { icon: Calendar, title: 'Payment Plans', description: 'Interest-free plans available for balances over $200' },
              { icon: FileText, title: 'Online Bill Pay', description: 'Pay your bill securely through our patient portal' }
            ].map((option, idx) => (
              <div key={idx} style={{
                padding: '32px',
                backgroundColor: COLORS.background,
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0284C715',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <option.icon size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{option.title}</h3>
                <p style={{ opacity: 0.7 }}>{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>What to Bring</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {[
              'Insurance card (front and back)',
              'Photo ID (drivers license or passport)',
              'List of current medications',
              'Copay or coinsurance payment',
              'Referral form (if required)',
              'Medical records from previous providers'
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '8px'
              }}>
                <CheckCircle size={20} color="#0284C7" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ ...styles.container, maxWidth: '800px' }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Billing Questions</h2>

          {BILLING_FAQ.map((item, idx) => (
            <FaqItem key={idx} question={item.q} answer={item.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
        textAlign: 'center'
      }}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
            Questions About Your Bill?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            Our billing team is here to help
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:(555) 789-CARE" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              color: '#0284C7',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              <Phone size={20} />
              Call Billing
            </a>
            <Link to="/patient-portal" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              <CreditCard size={20} />
              Pay Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '20px 0' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0
      }}>
        <span style={{ fontWeight: '600', fontSize: '16px' }}>{question}</span>
        <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {isOpen && <p style={{ marginTop: '12px', opacity: 0.7, lineHeight: 1.6 }}>{answer}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  sectionTitle: { fontSize: '36px', fontWeight: '700', textAlign: 'center', color: COLORS.text }
};
