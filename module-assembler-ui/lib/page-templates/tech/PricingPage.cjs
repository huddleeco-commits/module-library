/**
 * Tech PricingPage Generator
 */
function generatePricingPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle, ArrowRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const PLANS = ${JSON.stringify(content.plans, null, 2)};

const FAQS = ${JSON.stringify(content.faqs, null, 2)};

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>${content.headline}</h1>
        <p style={{ fontSize: '20px', opacity: 0.7, marginBottom: '40px' }}>${content.subheadline}</p>

        <div style={{ display: 'inline-flex', backgroundColor: 'white', borderRadius: '12px', padding: '4px', marginBottom: '48px' }}>
          <button onClick={() => setBilling('monthly')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: billing === 'monthly' ? COLORS.primary : 'transparent', color: billing === 'monthly' ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>
            Monthly
          </button>
          <button onClick={() => setBilling('annual')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: billing === 'annual' ? COLORS.primary : 'transparent', color: billing === 'annual' ? 'white' : COLORS.text, fontWeight: '600', cursor: 'pointer' }}>
            Annual <span style={{ backgroundColor: '#05966920', color: '#059669', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', marginLeft: '8px' }}>Save 20%</span>
          </button>
        </div>
      </section>

      <section style={{ padding: '0 20px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {PLANS.map((plan, idx) => (
            <div key={idx} style={{ padding: '40px', backgroundColor: 'white', borderRadius: '20px', boxShadow: plan.popular ? '0 20px 60px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.06)', border: plan.popular ? \`2px solid \${COLORS.primary}\` : 'none', position: 'relative', transform: plan.popular ? 'scale(1.05)' : 'none' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</h3>
              <p style={{ opacity: 0.6, marginBottom: '24px' }}>{plan.description}</p>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800' }}>\${billing === 'annual' ? Math.round(plan.price * 0.8) : plan.price}</span>
                <span style={{ opacity: 0.6 }}>/{billing === 'annual' ? 'mo, billed annually' : 'month'}</span>
              </div>
              <Link to="/demo" style={{ display: 'block', textAlign: 'center', padding: '14px', backgroundColor: plan.popular ? COLORS.primary : 'transparent', color: plan.popular ? 'white' : COLORS.primary, border: plan.popular ? 'none' : \`2px solid \${COLORS.primary}\`, borderRadius: '10px', fontWeight: '600', textDecoration: 'none', marginBottom: '32px' }}>
                {plan.cta}
              </Link>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Check size={20} color="#059669" />
                    <span style={{ opacity: 0.8 }}>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded && plan.notIncluded.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', opacity: 0.4 }}>
                    <X size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>{faq.q}</span>
                <HelpCircle size={20} color={openFaq === idx ? COLORS.primary : '#999'} />
              </button>
              {openFaq === idx && (
                <div style={{ paddingBottom: '24px', opacity: 0.7, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Need a Custom Plan?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Contact our sales team to discuss enterprise pricing and custom solutions.</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
            Contact Sales <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getContent(industry) {
  const content = {
    'saas': {
      headline: 'Simple, Transparent Pricing',
      subheadline: 'Start free, upgrade when you are ready',
      plans: [
        { name: 'Starter', description: 'Perfect for small teams getting started', price: 0, cta: 'Get Started Free', features: ['Up to 5 users', '5GB storage', 'Basic analytics', 'Email support', 'API access'], notIncluded: ['Custom domains', 'Priority support'] },
        { name: 'Pro', description: 'For growing teams that need more', price: 29, popular: true, cta: 'Start Free Trial', features: ['Unlimited users', '100GB storage', 'Advanced analytics', 'Priority support', 'API access', 'Custom domains', 'SSO/SAML'] },
        { name: 'Enterprise', description: 'For large organizations', price: 99, cta: 'Contact Sales', features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Advanced security', 'Onboarding help'] }
      ],
      faqs: [
        { q: 'Can I change plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
        { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.' },
        { q: 'Can I cancel anytime?', a: 'Absolutely. You can cancel your subscription at any time with no cancellation fees.' }
      ]
    },
    'ecommerce': {
      headline: 'Membership Tiers',
      subheadline: 'Join our loyalty program and start saving',
      plans: [
        { name: 'Basic', description: 'Free membership for all shoppers', price: 0, cta: 'Sign Up Free', features: ['Earn 1 point per dollar', 'Birthday discount', 'Early sale access', 'Order tracking', 'Wishlist'], notIncluded: ['Free shipping', 'Exclusive products'] },
        { name: 'Premium', description: 'For serious shoppers', price: 9, popular: true, cta: 'Join Premium', features: ['Earn 2 points per dollar', 'Free shipping on all orders', 'Early sale access', 'Exclusive products', 'Priority customer service', 'Free returns'] },
        { name: 'VIP', description: 'The ultimate shopping experience', price: 29, cta: 'Go VIP', features: ['Earn 3 points per dollar', 'Free express shipping', 'First access to new products', 'Personal shopper', 'VIP events invites', 'Unlimited free returns', 'Price protection'] }
      ],
      faqs: [
        { q: 'How do I earn points?', a: 'You earn points on every purchase. The more you spend, the more points you earn. Points can be redeemed for discounts on future orders.' },
        { q: 'Do points expire?', a: 'Points are valid for 12 months from the date earned. As long as you make a purchase within 12 months, your points stay active.' },
        { q: 'Can I gift a membership?', a: 'Yes! Premium and VIP memberships make great gifts. Contact our support team to arrange a gift membership.' },
        { q: 'Is there a return policy?', a: 'All members enjoy our 30-day return policy. Premium and VIP members get free returns on all orders.' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generatePricingPage };
