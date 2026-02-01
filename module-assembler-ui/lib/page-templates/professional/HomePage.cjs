/**
 * Professional Services HomePage Generator
 */
function generateHomePage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const industryContent = getIndustryContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { ${industryContent.icons.join(', ')}, Star, ChevronRight, Phone, Shield, Clock, Award } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      {/* Hero */}
      <section style={{
        minHeight: '85vh',
        background: \`linear-gradient(135deg, \${COLORS.primary}f0, \${COLORS.secondary || COLORS.primary}e0)\`,
        display: 'flex', alignItems: 'center', padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div style={{ color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: '50px', marginBottom: '24px' }}>
              <Shield size={18} /> <span style={{ fontWeight: '500' }}>${industryContent.badge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px' }}>
              ${business.tagline || industryContent.headline}
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', lineHeight: 1.6 }}>
              ${industryContent.subheadline}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
                <Phone size={20} /> ${industryContent.cta}
              </Link>
              <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '16px 32px', borderRadius: '8px', fontSize: '17px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
                Our Services
              </Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            ${industryContent.features.map(f => `
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <${f.icon} size={24} color="white" />
              </div>
              <div style={{ color: 'white' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>${f.title}</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>${f.desc}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section style={{ padding: '40px 20px', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { num: '${industryContent.stats[0]}', label: '${industryContent.statLabels[0]}' },
            { num: '${industryContent.stats[1]}', label: '${industryContent.statLabels[1]}' },
            { num: '${industryContent.stats[2]}', label: '${industryContent.statLabels[2]}' },
            { num: '${industryContent.stats[3]}', label: '${industryContent.statLabels[3]}' }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: COLORS.primary }}>{s.num}</div>
              <div style={{ opacity: 0.6, fontSize: '14px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Preview */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Our Services</h2>
            <p style={{ opacity: 0.7, fontSize: '18px' }}>${industryContent.servicesSubtitle}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {${JSON.stringify(industryContent.services)}.map((service, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Award size={28} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{service.name}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>{service.desc}</p>
                <Link to="/services" style={{ color: COLORS.primary, fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Learn More <ChevronRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Why Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {[
              { icon: Shield, title: 'Licensed & Insured', desc: 'Fully licensed and insured for your peace of mind' },
              { icon: Clock, title: 'Fast Response', desc: 'Quick response times when you need us most' },
              { icon: Award, title: 'Experienced Team', desc: 'Years of expertise delivering quality results' },
              { icon: Star, title: '5-Star Service', desc: 'Consistently rated excellent by our clients' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <f.icon size={36} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>What Our Clients Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {${JSON.stringify(industryContent.testimonials)}.map((t, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.7, opacity: 0.8 }}>"{t.text}"</p>
                <div style={{ fontWeight: '600' }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>${industryContent.ctaHeadline}</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>${industryContent.ctaSubtext}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '18px 40px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
            <Phone size={22} /> ${industryContent.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getIndustryContent(industry) {
  const content = {
    'law-firm': {
      icons: ['Scale', 'Briefcase', 'FileText'],
      badge: 'Trusted Legal Counsel',
      headline: 'Experienced Legal Representation You Can Trust',
      subheadline: 'Dedicated attorneys fighting for your rights with decades of combined experience.',
      cta: 'Free Consultation',
      ctaHeadline: 'Need Legal Help?',
      ctaSubtext: 'Schedule a free consultation with our experienced attorneys',
      servicesSubtitle: 'Comprehensive legal services for individuals and businesses',
      stats: ['500+', '25+', '98%', '24/7'],
      statLabels: ['Cases Won', 'Years Experience', 'Success Rate', 'Available'],
      features: [
        { icon: 'Scale', title: 'Expert Attorneys', desc: 'Specialized legal expertise' },
        { icon: 'Briefcase', title: 'Personalized Service', desc: 'Tailored to your needs' },
        { icon: 'FileText', title: 'Clear Communication', desc: 'Always kept informed' }
      ],
      services: [
        { name: 'Personal Injury', desc: 'Fighting for fair compensation for your injuries' },
        { name: 'Family Law', desc: 'Compassionate support through family matters' },
        { name: 'Business Law', desc: 'Protecting your business interests' },
        { name: 'Criminal Defense', desc: 'Aggressive defense of your rights' }
      ],
      testimonials: [
        { name: 'John M.', text: 'They fought for me when no one else would. Highly recommend!' },
        { name: 'Sarah K.', text: 'Professional, responsive, and got great results for my case.' },
        { name: 'Robert L.', text: 'The best legal team I have ever worked with.' }
      ]
    },
    'real-estate': {
      icons: ['Home', 'Key', 'Building'],
      badge: 'Your Dream Home Awaits',
      headline: 'Find Your Perfect Property',
      subheadline: 'Expert real estate services to help you buy, sell, or invest with confidence.',
      cta: 'Get Started',
      ctaHeadline: 'Ready to Make a Move?',
      ctaSubtext: 'Let our expert agents guide you through the process',
      servicesSubtitle: 'Full-service real estate for buyers, sellers, and investors',
      stats: ['1000+', '15+', '$500M+', '4.9'],
      statLabels: ['Homes Sold', 'Years Experience', 'In Sales', 'Star Rating'],
      features: [
        { icon: 'Home', title: 'Local Expertise', desc: 'Deep market knowledge' },
        { icon: 'Key', title: 'Fast Closings', desc: 'Streamlined process' },
        { icon: 'Building', title: 'Full Service', desc: 'Buy, sell, or invest' }
      ],
      services: [
        { name: 'Buyer Services', desc: 'Find your dream home with expert guidance' },
        { name: 'Seller Services', desc: 'Get top dollar for your property' },
        { name: 'Investment Properties', desc: 'Build wealth through real estate' },
        { name: 'Property Management', desc: 'Hassle-free property management' }
      ],
      testimonials: [
        { name: 'Mike T.', text: 'Found our dream home in just two weeks! Amazing service.' },
        { name: 'Lisa R.', text: 'Sold our house above asking price. Could not be happier!' },
        { name: 'David P.', text: 'Professional and knowledgeable. Highly recommend!' }
      ]
    },
    'plumber': {
      icons: ['Wrench', 'Droplet', 'Home'],
      badge: '24/7 Emergency Service',
      headline: 'Professional Plumbing Services',
      subheadline: 'Fast, reliable plumbing solutions for your home or business.',
      cta: 'Call Now',
      ctaHeadline: 'Plumbing Emergency?',
      ctaSubtext: 'Available 24/7 for all your plumbing needs',
      servicesSubtitle: 'Complete plumbing solutions for residential and commercial',
      stats: ['10K+', '20+', '30min', '100%'],
      statLabels: ['Jobs Completed', 'Years Experience', 'Response Time', 'Satisfaction'],
      features: [
        { icon: 'Wrench', title: '24/7 Emergency', desc: 'Always available' },
        { icon: 'Droplet', title: 'Licensed Plumbers', desc: 'Certified experts' },
        { icon: 'Home', title: 'Upfront Pricing', desc: 'No hidden fees' }
      ],
      services: [
        { name: 'Emergency Repairs', desc: '24/7 emergency plumbing services' },
        { name: 'Drain Cleaning', desc: 'Professional drain cleaning solutions' },
        { name: 'Water Heaters', desc: 'Installation and repair services' },
        { name: 'Pipe Repair', desc: 'Expert pipe repair and replacement' }
      ],
      testimonials: [
        { name: 'Tom H.', text: 'Came out at midnight and fixed our burst pipe. Lifesaver!' },
        { name: 'Nancy W.', text: 'Fair prices and excellent work. Our go-to plumber.' },
        { name: 'Jim K.', text: 'Fast, professional, and cleaned up after themselves.' }
      ]
    },
    'cleaning': {
      icons: ['Sparkles', 'Home', 'CheckCircle'],
      badge: 'Eco-Friendly Cleaning',
      headline: 'Professional Cleaning Services',
      subheadline: 'Sparkling clean spaces with eco-friendly products and attention to detail.',
      cta: 'Get a Quote',
      ctaHeadline: 'Ready for a Cleaner Space?',
      ctaSubtext: 'Get a free quote for your home or office',
      servicesSubtitle: 'Residential and commercial cleaning solutions',
      stats: ['5000+', '15+', '100%', '4.9'],
      statLabels: ['Happy Clients', 'Years Experience', 'Satisfaction', 'Star Rating'],
      features: [
        { icon: 'Sparkles', title: 'Eco-Friendly', desc: 'Safe, green products' },
        { icon: 'Home', title: 'Trained Staff', desc: 'Background checked' },
        { icon: 'CheckCircle', title: 'Guaranteed', desc: 'Satisfaction promise' }
      ],
      services: [
        { name: 'Regular Cleaning', desc: 'Weekly, bi-weekly, or monthly service' },
        { name: 'Deep Cleaning', desc: 'Thorough top-to-bottom cleaning' },
        { name: 'Move In/Out', desc: 'Get your deposit back guaranteed' },
        { name: 'Office Cleaning', desc: 'Professional commercial cleaning' }
      ],
      testimonials: [
        { name: 'Emily S.', text: 'My house has never been cleaner! Love their attention to detail.' },
        { name: 'Mark R.', text: 'Reliable and thorough. Highly recommend their service.' },
        { name: 'Karen L.', text: 'The best cleaning service we have ever used!' }
      ]
    },
    'auto-shop': {
      icons: ['Car', 'Wrench', 'Shield'],
      badge: 'ASE Certified Mechanics',
      headline: 'Expert Auto Repair & Service',
      subheadline: 'Honest, reliable auto repair from certified mechanics you can trust.',
      cta: 'Book Service',
      ctaHeadline: 'Car Trouble?',
      ctaSubtext: 'Schedule your service appointment today',
      servicesSubtitle: 'Complete auto repair and maintenance services',
      stats: ['50K+', '30+', '12mo', '4.9'],
      statLabels: ['Cars Serviced', 'Years Experience', 'Warranty', 'Star Rating'],
      features: [
        { icon: 'Car', title: 'All Makes & Models', desc: 'We fix everything' },
        { icon: 'Wrench', title: 'ASE Certified', desc: 'Expert mechanics' },
        { icon: 'Shield', title: '12-Month Warranty', desc: 'Parts & labor' }
      ],
      services: [
        { name: 'Oil Change', desc: 'Quick oil changes with quality products' },
        { name: 'Brake Service', desc: 'Complete brake repair and replacement' },
        { name: 'Engine Repair', desc: 'Diagnostics and engine repair' },
        { name: 'AC Service', desc: 'Keep cool with AC repair and recharge' }
      ],
      testimonials: [
        { name: 'Chris M.', text: 'Honest mechanics who do not try to upsell. Refreshing!' },
        { name: 'Amanda P.', text: 'Fixed my car same day at a fair price. Great service!' },
        { name: 'Steve B.', text: 'Been bringing my cars here for 10 years. The best!' }
      ]
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateHomePage };
