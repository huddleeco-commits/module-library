/**
 * Tech HomePage Generator
 */
function generateHomePage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { ${content.icons.join(', ')}, ArrowRight, Check, Star, Play } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      {/* Hero */}
      <section style={{ padding: '100px 20px 80px', background: \`linear-gradient(180deg, \${COLORS.background} 0%, white 100%)\` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: \`\${COLORS.primary}15\`, padding: '8px 16px', borderRadius: '50px', marginBottom: '24px' }}>
            <span style={{ color: COLORS.primary, fontWeight: '600', fontSize: '14px' }}>${content.badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px', color: COLORS.text }}>
            ${business.tagline || content.headline}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.7, marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            ${content.subheadline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <Link to="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, color: 'white', padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>
              ${content.primaryCta} <ArrowRight size={20} />
            </Link>
            <Link to="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.text, padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)' }}>
              <Play size={20} /> Watch Demo
            </Link>
          </div>

          {/* Hero Image Placeholder */}
          <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ height: '400px', backgroundColor: \`\${COLORS.primary}08\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', opacity: 0.4 }}>
                <Zap size={60} color={COLORS.primary} />
                <p style={{ marginTop: '16px', fontWeight: '500' }}>Product Screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '32px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px' }}>Trusted by leading companies</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', opacity: 0.4 }}>
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((name, i) => (
              <div key={i} style={{ fontWeight: '700', fontSize: '20px' }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>${content.featuresTitle}</h2>
            <p style={{ opacity: 0.6, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>${content.featuresSubtitle}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {${JSON.stringify(content.features)}.map((feature, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '56px', height: '56px', background: \`linear-gradient(135deg, \${COLORS.primary}20, \${COLORS.secondary}20)\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  {feature.icon === 'Zap' && <Zap size={28} color={COLORS.primary} />}
                  {feature.icon === 'Shield' && <Shield size={28} color={COLORS.primary} />}
                  {feature.icon === 'BarChart3' && <BarChart3 size={28} color={COLORS.primary} />}
                  {feature.icon === 'Users' && <Users size={28} color={COLORS.primary} />}
                  {feature.icon === 'Globe' && <Globe size={28} color={COLORS.primary} />}
                  {feature.icon === 'Lock' && <Lock size={28} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ opacity: 0.6, lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Loved by Teams Everywhere</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {${JSON.stringify(content.testimonials)}.map((t, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: COLORS.background, borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ marginBottom: '20px', lineHeight: 1.7, opacity: 0.8 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: \`\${COLORS.primary}20\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS.primary }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{t.name}</div>
                    <div style={{ fontSize: '14px', opacity: 0.6 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {${JSON.stringify(content.stats)}.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.num}</div>
              <div style={{ opacity: 0.6, fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>${content.ctaHeadline}</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>${content.ctaSubtext}</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
              ${content.primaryCta} <ArrowRight size={20} />
            </Link>
            <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '16px 32px', borderRadius: '10px', fontSize: '17px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)' }}>
              View Pricing
            </Link>
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
      icons: ['Zap', 'Shield', 'BarChart3', 'Users', 'Globe', 'Lock'],
      badge: 'New: AI-Powered Features',
      headline: 'The Modern Platform for Growing Teams',
      subheadline: 'Streamline your workflow, boost productivity, and scale your business with our all-in-one platform.',
      primaryCta: 'Start Free Trial',
      featuresTitle: 'Everything You Need',
      featuresSubtitle: 'Powerful features to help your team work smarter, not harder',
      ctaHeadline: 'Ready to Transform Your Workflow?',
      ctaSubtext: 'Join thousands of teams already using our platform. Start your free trial today.',
      features: [
        { icon: 'Zap', title: 'Lightning Fast', desc: 'Built for speed. Our platform loads in milliseconds so you can focus on what matters.' },
        { icon: 'Shield', title: 'Enterprise Security', desc: 'Bank-level encryption and compliance certifications keep your data safe.' },
        { icon: 'BarChart3', title: 'Advanced Analytics', desc: 'Real-time insights and custom dashboards to track what matters.' },
        { icon: 'Users', title: 'Team Collaboration', desc: 'Work together seamlessly with real-time editing and commenting.' },
        { icon: 'Globe', title: 'Global Scale', desc: 'Deploy worldwide with 99.99% uptime and automatic scaling.' },
        { icon: 'Lock', title: 'Access Control', desc: 'Fine-grained permissions to keep the right people on the right projects.' }
      ],
      stats: [
        { num: '50K+', label: 'Active Users' },
        { num: '99.99%', label: 'Uptime' },
        { num: '150+', label: 'Countries' },
        { num: '24/7', label: 'Support' }
      ],
      testimonials: [
        { name: 'Sarah Johnson', role: 'CTO at TechCorp', text: 'This platform transformed how our team works. We have cut our project delivery time in half.' },
        { name: 'Mike Chen', role: 'Product Lead at StartupX', text: 'The best investment we made this year. Our productivity has skyrocketed since switching.' },
        { name: 'Emily Roberts', role: 'CEO at GrowthCo', text: 'Finally, a platform that actually delivers on its promises. Our whole company is on board.' }
      ]
    },
    'ecommerce': {
      icons: ['ShoppingCart', 'Truck', 'CreditCard', 'Package', 'Headphones', 'RefreshCw'],
      badge: 'Free Shipping Over $50',
      headline: 'Shop the Latest Trends',
      subheadline: 'Discover our curated collection of premium products with fast shipping and easy returns.',
      primaryCta: 'Shop Now',
      featuresTitle: 'Why Shop With Us',
      featuresSubtitle: 'We make your shopping experience seamless from browse to delivery',
      ctaHeadline: 'Start Shopping Today',
      ctaSubtext: 'Join our community of happy customers and discover amazing products.',
      features: [
        { icon: 'Zap', title: 'Fast Checkout', desc: 'One-click checkout and multiple payment options for a seamless experience.' },
        { icon: 'Shield', title: 'Secure Payments', desc: 'Your payment info is protected with industry-leading encryption.' },
        { icon: 'BarChart3', title: 'Price Match', desc: 'Found it cheaper? We will match any competitor price, guaranteed.' },
        { icon: 'Users', title: 'Rewards Program', desc: 'Earn points on every purchase and redeem for exclusive discounts.' },
        { icon: 'Globe', title: 'Worldwide Shipping', desc: 'We ship to over 100 countries with real-time tracking.' },
        { icon: 'Lock', title: 'Easy Returns', desc: '30-day hassle-free returns. No questions asked.' }
      ],
      stats: [
        { num: '100K+', label: 'Happy Customers' },
        { num: '50K+', label: 'Products' },
        { num: '4.9', label: 'Star Rating' },
        { num: '2-Day', label: 'Shipping' }
      ],
      testimonials: [
        { name: 'Lisa Park', role: 'Verified Buyer', text: 'Amazing quality and super fast shipping! Will definitely shop here again.' },
        { name: 'James Wilson', role: 'Verified Buyer', text: 'Great prices and excellent customer service. My new favorite store!' },
        { name: 'Amanda Lee', role: 'Verified Buyer', text: 'The rewards program is fantastic. I have saved so much on my purchases.' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateHomePage };
