/**
 * Tech FeaturesPage Generator
 */
function generateFeaturesPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, BarChart3, Users, Globe, Lock, Check, ArrowRight, Sparkles } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const FEATURES = ${JSON.stringify(content.features, null, 2)};

export default function FeaturesPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: \`\${COLORS.primary}15\`, padding: '8px 16px', borderRadius: '50px', marginBottom: '24px' }}>
          <Sparkles size={18} color={COLORS.primary} />
          <span style={{ color: COLORS.primary, fontWeight: '600', fontSize: '14px' }}>Powerful Features</span>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>${content.headline}</h1>
        <p style={{ fontSize: '20px', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>${content.subheadline}</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {FEATURES.map((feature, idx) => (
            <div key={idx} style={{ marginBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
              <div style={{ order: idx % 2 === 0 ? 1 : 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: \`\${COLORS.primary}15\`, padding: '6px 12px', borderRadius: '20px', marginBottom: '16px' }}>
                  {feature.icon === 'Zap' && <Zap size={16} color={COLORS.primary} />}
                  {feature.icon === 'Shield' && <Shield size={16} color={COLORS.primary} />}
                  {feature.icon === 'BarChart3' && <BarChart3 size={16} color={COLORS.primary} />}
                  {feature.icon === 'Users' && <Users size={16} color={COLORS.primary} />}
                  {feature.icon === 'Globe' && <Globe size={16} color={COLORS.primary} />}
                  {feature.icon === 'Lock' && <Lock size={16} color={COLORS.primary} />}
                  <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.primary }}>{feature.category}</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>{feature.title}</h2>
                <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '24px', fontSize: '17px' }}>{feature.description}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#05966915', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={14} color="#059669" />
                      </div>
                      <span style={{ opacity: 0.8 }}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ order: idx % 2 === 0 ? 2 : 1, height: '350px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ opacity: 0.3 }}>
                  {feature.icon === 'Zap' && <Zap size={80} color={COLORS.primary} />}
                  {feature.icon === 'Shield' && <Shield size={80} color={COLORS.primary} />}
                  {feature.icon === 'BarChart3' && <BarChart3 size={80} color={COLORS.primary} />}
                  {feature.icon === 'Users' && <Users size={80} color={COLORS.primary} />}
                  {feature.icon === 'Globe' && <Globe size={80} color={COLORS.primary} />}
                  {feature.icon === 'Lock' && <Lock size={80} color={COLORS.primary} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Compare Plans</h2>
            <p style={{ opacity: 0.6 }}>See which features are included in each plan</p>
          </div>
          <div style={{ backgroundColor: COLORS.background, borderRadius: '16px', padding: '32px', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Feature</th>
                  <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Starter</th>
                  <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)', backgroundColor: \`\${COLORS.primary}10\` }}>Pro</th>
                  <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {${JSON.stringify(content.comparison)}.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{row.feature}</td>
                    <td style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{row.starter ? <Check size={20} color="#059669" /> : '—'}</td>
                    <td style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: \`\${COLORS.primary}05\` }}>{row.pro ? <Check size={20} color="#059669" /> : '—'}</td>
                    <td style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{row.enterprise ? <Check size={20} color="#059669" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Get Started?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Start your free trial today. No credit card required.</p>
          <Link to="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
            Start Free Trial <ArrowRight size={20} />
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
      headline: 'Features Built for Scale',
      subheadline: 'Everything you need to run your business, all in one platform',
      features: [
        { icon: 'Zap', category: 'Performance', title: 'Lightning Fast Performance', description: 'Our platform is built from the ground up for speed. Every interaction feels instant, keeping your team productive and focused.', bullets: ['Sub-100ms response times', 'Global CDN delivery', 'Optimized for any device', 'Offline-first architecture'] },
        { icon: 'BarChart3', category: 'Analytics', title: 'Powerful Analytics & Insights', description: 'Make data-driven decisions with real-time analytics. Track everything that matters and uncover insights you never knew existed.', bullets: ['Custom dashboards', 'Real-time reporting', 'Export to any format', 'AI-powered insights'] },
        { icon: 'Users', category: 'Collaboration', title: 'Seamless Team Collaboration', description: 'Work together in real-time, no matter where your team is located. Comments, mentions, and sharing built right in.', bullets: ['Real-time editing', '@mentions and comments', 'Version history', 'Guest access'] },
        { icon: 'Shield', category: 'Security', title: 'Enterprise-Grade Security', description: 'Your data security is our top priority. We use the same encryption standards as major financial institutions.', bullets: ['SOC 2 Type II certified', 'End-to-end encryption', 'SSO/SAML support', 'Audit logs'] }
      ],
      comparison: [
        { feature: 'Users', starter: true, pro: true, enterprise: true },
        { feature: 'Storage', starter: true, pro: true, enterprise: true },
        { feature: 'Custom domains', starter: false, pro: true, enterprise: true },
        { feature: 'Analytics', starter: false, pro: true, enterprise: true },
        { feature: 'API access', starter: false, pro: true, enterprise: true },
        { feature: 'Priority support', starter: false, pro: false, enterprise: true },
        { feature: 'SLA guarantee', starter: false, pro: false, enterprise: true },
        { feature: 'Custom integrations', starter: false, pro: false, enterprise: true }
      ]
    },
    'ecommerce': {
      headline: 'Shopping Made Simple',
      subheadline: 'We have thought of everything to make your shopping experience perfect',
      features: [
        { icon: 'Zap', category: 'Checkout', title: 'Fast & Easy Checkout', description: 'Get through checkout in seconds with our streamlined process. Save your info for even faster purchases next time.', bullets: ['One-click checkout', 'Multiple payment options', 'Guest checkout available', 'Auto-fill addresses'] },
        { icon: 'Shield', category: 'Security', title: 'Secure Shopping', description: 'Shop with confidence knowing your personal and payment information is protected by industry-leading security.', bullets: ['Bank-level encryption', 'Fraud protection', 'Secure payment gateway', 'Privacy guaranteed'] },
        { icon: 'Globe', category: 'Shipping', title: 'Fast Worldwide Shipping', description: 'We ship to over 100 countries with multiple shipping options. Track your package every step of the way.', bullets: ['Free shipping over $50', '2-day express option', 'Real-time tracking', 'International shipping'] },
        { icon: 'Users', category: 'Support', title: 'Exceptional Customer Service', description: 'Our support team is here to help whenever you need it. Easy returns and quick response times guaranteed.', bullets: ['24/7 live chat', '30-day returns', 'Price match guarantee', 'Loyalty rewards'] }
      ],
      comparison: [
        { feature: 'Free shipping', starter: false, pro: true, enterprise: true },
        { feature: 'Rewards points', starter: true, pro: true, enterprise: true },
        { feature: 'Early access sales', starter: false, pro: true, enterprise: true },
        { feature: 'Free returns', starter: false, pro: true, enterprise: true },
        { feature: 'Priority support', starter: false, pro: true, enterprise: true },
        { feature: 'Exclusive products', starter: false, pro: false, enterprise: true },
        { feature: 'Personal shopper', starter: false, pro: false, enterprise: true },
        { feature: 'VIP events', starter: false, pro: false, enterprise: true }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateFeaturesPage };
