/**
 * Tech DemoPage Generator
 */
function generateDemoPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React, { useState } from 'react';
import { Check, Play, Calendar, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '44px', fontWeight: '700', marginBottom: '16px' }}>${content.headline}</h1>
            <p style={{ fontSize: '18px', opacity: 0.7, marginBottom: '32px', lineHeight: 1.6 }}>${content.subheadline}</p>

            <div style={{ marginBottom: '32px' }}>
              {${JSON.stringify(content.benefits)}.map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', backgroundColor: '#05966915', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} color="#059669" />
                  </div>
                  <span style={{ fontWeight: '500' }}>{benefit}</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={24} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>Prefer to talk first?</div>
                <div style={{ opacity: 0.6, fontSize: '14px' }}>Schedule a call with our team</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '80px', height: '80px', background: \`linear-gradient(135deg, #05966920, #05966940)\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>${content.thankYouTitle}</h3>
                <p style={{ opacity: 0.7, marginBottom: '24px' }}>${content.thankYouMessage}</p>
                <div style={{ backgroundColor: COLORS.background, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>While you wait</div>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.primary, fontWeight: '600', textDecoration: 'none' }}>
                    <Play size={18} /> Watch a quick product tour
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>${content.formTitle}</h3>
                <p style={{ opacity: 0.6, marginBottom: '24px' }}>${content.formSubtitle}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input type="text" placeholder="First Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                    <input type="text" placeholder="Last Name" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  </div>
                  <input type="email" placeholder="Work Email" required style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <input type="text" placeholder="Company Name" style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }} />
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">Company Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  <select style={{ padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px', backgroundColor: 'white' }}>
                    <option value="">${content.selectPlaceholder}</option>
                    ${content.selectOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('\n                    ')}
                  </select>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', padding: '16px', borderRadius: '10px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                    ${content.submitButton} <ArrowRight size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '16px', textAlign: 'center' }}>
                  By submitting, you agree to our Terms and Privacy Policy
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>What to Expect</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {${JSON.stringify(content.expectations)}.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', margin: '0 auto 16px' }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ opacity: 0.6, fontSize: '14px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function getContent(industry) {
  const content = {
    'saas': {
      headline: 'Get Your Free Demo',
      subheadline: 'See how our platform can transform the way your team works. Our product experts will walk you through everything.',
      benefits: ['Personalized walkthrough of features', 'Answer all your questions', 'Custom recommendations for your team', 'No pressure, no commitments'],
      formTitle: 'Request a Demo',
      formSubtitle: 'Fill out the form and we will be in touch soon',
      selectPlaceholder: 'What are you most interested in?',
      selectOptions: ['Project Management', 'Team Collaboration', 'Analytics & Reporting', 'Integrations', 'Everything'],
      submitButton: 'Get My Demo',
      thankYouTitle: 'Demo Requested!',
      thankYouMessage: 'We will email you within 24 hours to schedule your personalized demo.',
      expectations: [
        { title: 'Submit Form', desc: 'Fill out the form with your details' },
        { title: 'Get Contacted', desc: 'We will reach out within 24 hours' },
        { title: 'See the Demo', desc: 'Get a personalized walkthrough' },
        { title: 'Start Your Trial', desc: 'Try it free with our help' }
      ]
    },
    'ecommerce': {
      headline: 'Get Started Today',
      subheadline: 'Create your free account and start shopping smarter. Join our community of happy customers.',
      benefits: ['Exclusive member discounts', 'Earn rewards on every purchase', 'Free shipping on qualifying orders', 'Early access to sales'],
      formTitle: 'Create Your Account',
      formSubtitle: 'Join thousands of happy shoppers',
      selectPlaceholder: 'How did you hear about us?',
      selectOptions: ['Social Media', 'Friend/Family', 'Search Engine', 'Advertisement', 'Other'],
      submitButton: 'Create Account',
      thankYouTitle: 'Welcome Aboard!',
      thankYouMessage: 'Check your email to verify your account and start shopping.',
      expectations: [
        { title: 'Sign Up', desc: 'Create your free account' },
        { title: 'Verify Email', desc: 'Check your inbox to confirm' },
        { title: 'Start Shopping', desc: 'Browse our amazing products' },
        { title: 'Earn Rewards', desc: 'Get points on every purchase' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateDemoPage };
