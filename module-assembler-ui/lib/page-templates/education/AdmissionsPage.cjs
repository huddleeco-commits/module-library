/**
 * Education AdmissionsPage Generator
 */
function generateAdmissionsPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock, CheckCircle, ChevronRight, ChevronDown, ChevronUp, HelpCircle, GraduationCap, DollarSign, Home } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const DEADLINES = [
  { type: 'Early Decision', date: 'November 1', notification: 'December 15' },
  { type: 'Early Action', date: 'November 15', notification: 'January 31' },
  { type: 'Regular Decision', date: 'January 15', notification: 'April 1' },
  { type: 'Transfer Students', date: 'March 1', notification: 'May 1' }
];

const REQUIREMENTS = [
  { item: 'Completed Application Form', required: true },
  { item: 'Official High School Transcript', required: true },
  { item: 'SAT or ACT Scores (test-optional)', required: false },
  { item: 'Two Letters of Recommendation', required: true },
  { item: 'Personal Essay (500-650 words)', required: true },
  { item: 'Application Fee ($60)', required: true }
];

const FAQS = [
  { q: 'Is the application fee waivable?', a: 'Yes, fee waivers are available for students who demonstrate financial need. Contact our admissions office for more information.' },
  { q: 'Do you require standardized test scores?', a: 'We are test-optional for the 2024-2025 cycle. You may submit SAT or ACT scores if you feel they represent your abilities well.' },
  { q: 'Can I apply for financial aid?', a: 'Yes! Over 70% of our students receive financial aid. Complete the FAFSA and CSS Profile by our priority deadline for maximum consideration.' },
  { q: 'How do I schedule a campus visit?', a: 'Visit our Campus page or contact the admissions office to schedule a tour and information session.' }
];

export default function AdmissionsPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Admissions</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Your journey to ${business.name} starts here</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {[
            { icon: GraduationCap, title: 'Undergraduate', desc: 'First-year and transfer applications', link: '#undergraduate' },
            { icon: FileText, title: 'Graduate', desc: 'Masters and doctoral programs', link: '#graduate' },
            { icon: DollarSign, title: 'Financial Aid', desc: 'Scholarships and aid information', link: '#financial-aid' },
            { icon: Home, title: 'Campus Visit', desc: 'Schedule a tour', link: '/contact' }
          ].map((card, idx) => (
            <a key={idx} href={card.link} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', color: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <card.icon size={28} color={COLORS.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{card.title}</h3>
                <p style={{ opacity: 0.6, fontSize: '14px' }}>{card.desc}</p>
              </div>
              <ChevronRight size={20} color={COLORS.primary} />
            </a>
          ))}
        </div>
      </section>

      <section id="undergraduate" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Application Deadlines</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {DEADLINES.map((d, idx) => (
              <div key={idx} style={{ padding: '24px', backgroundColor: COLORS.background, borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', marginBottom: '16px', color: COLORS.primary }}>{d.type}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Calendar size={18} color={COLORS.primary} />
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>{d.date}</span>
                </div>
                <div style={{ fontSize: '14px', opacity: 0.6 }}>Notification: {d.notification}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Application Requirements</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {REQUIREMENTS.map((req, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: idx < REQUIREMENTS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div style={{ width: '28px', height: '28px', backgroundColor: '#05966915', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} color="#059669" />
                </div>
                <span style={{ flex: 1 }}>{req.item}</span>
                {!req.required && <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#F3F4F6', borderRadius: '20px' }}>Optional</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="financial-aid" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '24px' }}>Financial Aid & Scholarships</h2>
          <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '48px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            We are committed to making education accessible. Over 70% of students receive financial assistance.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              { amount: '$50,000', label: 'Average Aid Package', desc: 'For students with demonstrated need' },
              { amount: '70%', label: 'Students Receiving Aid', desc: 'Through grants, scholarships, and loans' },
              { amount: '$25M', label: 'Annual Scholarships', desc: 'Merit and need-based awards' }
            ].map((stat, idx) => (
              <div key={idx} style={{ padding: '32px', backgroundColor: COLORS.background, borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: COLORS.primary, marginBottom: '8px' }}>{stat.amount}</div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '14px', opacity: 0.6 }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Frequently Asked Questions</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx < FAQS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={20} color={COLORS.primary} /> : <ChevronDown size={20} opacity={0.5} />}
                </button>
                {openFaq === idx && (
                  <div style={{ paddingBottom: '20px', opacity: 0.7, lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Apply?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Start your application today and join our community</p>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Start Application <ChevronRight size={20} />
          </a>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateAdmissionsPage };
