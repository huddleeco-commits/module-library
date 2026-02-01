/**
 * PatientPortalPage - Healthcare Business
 * Business: Wellness Medical Center
 * Generated: 2026-01-23T20:33:57.160Z
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Lock, FileText, Calendar, MessageSquare, CreditCard,
  Pill, Activity, Download, Clock, Shield, CheckCircle, ChevronDown
} from 'lucide-react';

const COLORS = {
  "primary": "#0284C7",
  "secondary": "#38BDF8",
  "accent": "#22D3EE",
  "background": "#F0F9FF",
  "text": "#0C4A6E"
};

const PORTAL_FEATURES = [
  { icon: Calendar, title: 'Schedule Appointments', description: 'Book, reschedule, or cancel appointments online 24/7' },
  { icon: FileText, title: 'View Medical Records', description: 'Access your complete health history and test results' },
  { icon: MessageSquare, title: 'Message Your Doctor', description: 'Secure messaging with your healthcare team' },
  { icon: Pill, title: 'Request Refills', description: 'Request prescription refills with one click' },
  { icon: CreditCard, title: 'Pay Bills Online', description: 'View statements and make secure payments' },
  { icon: Download, title: 'Download Records', description: 'Export your records for other providers' }
];

const FAQ = [
  { q: 'How do I create an account?', a: 'Click "Create Account" and enter your information. You\'ll need to verify your identity with your date of birth and phone number.' },
  { q: 'Is my information secure?', a: 'Yes. We use bank-level encryption and are fully HIPAA compliant. Your data is protected at all times.' },
  { q: 'Can I access the portal on my phone?', a: 'Yes! The patient portal is fully mobile-responsive and works on any device.' },
  { q: 'How quickly will I get test results?', a: 'Most results are available within 24-48 hours of your test being completed.' }
];

export default function PatientPortalPage() {
  const [isLogin, setIsLogin] = useState(true);

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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '50px',
            marginBottom: '24px'
          }}>
            <Shield size={18} />
            <span style={{ fontSize: '14px' }}>HIPAA Compliant & Secure</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>
            Patient Portal
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Manage your health anytime, anywhere
          </p>
        </div>
      </section>

      {/* Features + Login */}
      <section style={{ padding: '80px 0' }}>
        <div style={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '60px',
            alignItems: 'start'
          }}>
            {/* Features */}
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>
                What You Can Do
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                {PORTAL_FEATURES.map((feature, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#0284C715',
                      color: '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{feature.title}</h3>
                      <p style={{ opacity: 0.7, fontSize: '14px' }}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '32px',
                backgroundColor: COLORS.background,
                borderRadius: '8px',
                padding: '4px'
              }}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: isLogin ? '#0284C7' : 'transparent',
                    color: isLogin ? 'white' : COLORS.text,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: !isLogin ? '#0284C7' : 'transparent',
                    color: !isLogin ? 'white' : COLORS.text,
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create Account
                </button>
              </div>

              {isLogin ? (
                <form onSubmit={e => e.preventDefault()}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                    <input type="email" placeholder="Enter your email" style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
                    <input type="password" placeholder="Enter your password" style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span style={{ fontSize: '14px' }}>Remember me</span>
                    </label>
                    <a href="#" style={{ color: '#0284C7', fontSize: '14px' }}>Forgot password?</a>
                  </div>
                  <button type="submit" style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#0284C7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <Lock size={18} />
                    Sign In to Portal
                  </button>
                </form>
              ) : (
                <form onSubmit={e => e.preventDefault()}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name</label>
                      <input type="text" placeholder="First name" style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name</label>
                      <input type="text" placeholder="Last name" style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                    <input type="email" placeholder="Enter your email" style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date of Birth</label>
                    <input type="date" style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Create Password</label>
                    <input type="password" placeholder="Create a password" style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }} />
                  </div>
                  <button type="submit" style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#0284C7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <User size={18} />
                    Create Account
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={styles.container}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '48px' }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {FAQ.map((item, idx) => (
              <FaqItem key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={{
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '20px 0'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0
        }}
      >
        <span style={{ fontWeight: '600', fontSize: '16px' }}>{question}</span>
        <ChevronDown size={20} style={{
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s'
        }} />
      </button>
      {isOpen && (
        <p style={{ marginTop: '12px', opacity: 0.7, lineHeight: 1.6 }}>{answer}</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text
  }
};
