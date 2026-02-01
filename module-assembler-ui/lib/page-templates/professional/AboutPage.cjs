/**
 * Professional Services AboutPage Generator
 */
function generateAboutPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getAboutContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Users, Target, Heart, Clock, Star, ChevronRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>About ${business.name}</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Our Story</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.8, marginBottom: '16px' }}>
              ${content.story1}
            </p>
            <p style={{ opacity: 0.7, lineHeight: 1.8 }}>
              ${content.story2}
            </p>
          </div>
          <div style={{ height: '400px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={80} color={COLORS.primary} style={{ opacity: 0.4 }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {${JSON.stringify(content.values)}.map((value, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {value.icon === 'Shield' && <Shield size={36} color={COLORS.primary} />}
                  {value.icon === 'Award' && <Award size={36} color={COLORS.primary} />}
                  {value.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                  {value.icon === 'Target' && <Target size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {${JSON.stringify(content.stats)}.map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>{stat.num}</div>
              <div style={{ opacity: 0.7, fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Why Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {${JSON.stringify(content.whyUs)}.map((item, i) => (
              <div key={i} style={{ padding: '24px', backgroundColor: COLORS.background, borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Star size={48} color={COLORS.primary} style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>${content.ctaHeadline}</h2>
          <p style={{ opacity: 0.7, fontSize: '18px', marginBottom: '32px' }}>${content.ctaText}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
            Contact Us <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getAboutContent(industry) {
  const content = {
    'law-firm': {
      subtitle: 'Experienced legal counsel dedicated to your success',
      story1: 'Founded over two decades ago, our firm was built on a simple principle: every client deserves exceptional legal representation, regardless of the size of their case. What started as a small practice has grown into a respected firm with a reputation for excellence.',
      story2: 'Today, we continue that tradition with a team of dedicated attorneys who are passionate about the law and committed to achieving the best possible outcomes for our clients. We combine aggressive advocacy with personalized attention.',
      values: [
        { icon: 'Shield', title: 'Integrity', desc: 'We uphold the highest ethical standards in everything we do' },
        { icon: 'Award', title: 'Excellence', desc: 'We strive for excellence in every case we handle' },
        { icon: 'Heart', title: 'Compassion', desc: 'We treat every client with empathy and respect' },
        { icon: 'Target', title: 'Results', desc: 'We are relentlessly focused on achieving positive outcomes' }
      ],
      stats: [
        { num: '500+', label: 'Cases Won' },
        { num: '25+', label: 'Years Experience' },
        { num: '98%', label: 'Success Rate' },
        { num: '10K+', label: 'Clients Served' }
      ],
      whyUs: [
        { title: 'Proven Track Record', desc: 'Decades of successful case outcomes and satisfied clients' },
        { title: 'Personalized Attention', desc: 'You work directly with experienced attorneys, not paralegals' },
        { title: 'Clear Communication', desc: 'We keep you informed every step of the way' },
        { title: 'No Win, No Fee', desc: 'For personal injury cases, you pay nothing unless we win' },
        { title: 'Free Consultations', desc: 'Discuss your case with us at no cost or obligation' },
        { title: 'Available 24/7', desc: 'Emergencies do not wait, and neither do we' }
      ],
      ctaHeadline: 'Ready to Discuss Your Case?',
      ctaText: 'Schedule your free consultation today'
    },
    'real-estate': {
      subtitle: 'Your trusted partner in real estate',
      story1: 'We started this real estate company with a vision: to make buying and selling homes a positive, stress-free experience. Having experienced the frustrations of the traditional real estate process ourselves, we knew there had to be a better way.',
      story2: 'Over the years, we have helped thousands of families find their dream homes and sellers get top dollar for their properties. Our success is built on relationships, market expertise, and an unwavering commitment to our clients.',
      values: [
        { icon: 'Shield', title: 'Trust', desc: 'We build lasting relationships based on honesty' },
        { icon: 'Award', title: 'Expertise', desc: 'Deep local market knowledge you can rely on' },
        { icon: 'Heart', title: 'Care', desc: 'Your goals become our goals' },
        { icon: 'Target', title: 'Results', desc: 'We are driven to exceed expectations' }
      ],
      stats: [
        { num: '1000+', label: 'Homes Sold' },
        { num: '$500M+', label: 'In Sales' },
        { num: '15+', label: 'Years Experience' },
        { num: '4.9', label: 'Star Rating' }
      ],
      whyUs: [
        { title: 'Local Market Experts', desc: 'We know every neighborhood and market trend' },
        { title: 'Proven Marketing', desc: 'Your listing gets maximum exposure' },
        { title: 'Skilled Negotiators', desc: 'We fight for the best terms on your behalf' },
        { title: 'Full Service', desc: 'We handle everything from start to close' },
        { title: 'Technology Forward', desc: 'Modern tools for a better experience' },
        { title: 'Client First', desc: 'Your satisfaction is our top priority' }
      ],
      ctaHeadline: 'Ready to Get Started?',
      ctaText: 'Let us help you achieve your real estate goals'
    },
    'plumber': {
      subtitle: 'Professional plumbing you can trust',
      story1: 'As a family-owned plumbing company, we have been serving our community for over 20 years. What started as one truck and a commitment to honest service has grown into a team of skilled plumbers ready to handle any job.',
      story2: 'We built our reputation one satisfied customer at a time, always prioritizing quality workmanship and fair pricing. Today, we are proud to be the plumber families and businesses trust.',
      values: [
        { icon: 'Shield', title: 'Honesty', desc: 'Upfront pricing with no hidden fees' },
        { icon: 'Award', title: 'Quality', desc: 'Work done right the first time' },
        { icon: 'Heart', title: 'Respect', desc: 'We treat your home like our own' },
        { icon: 'Target', title: 'Reliability', desc: 'We show up on time, every time' }
      ],
      stats: [
        { num: '10K+', label: 'Jobs Completed' },
        { num: '20+', label: 'Years Experience' },
        { num: '30min', label: 'Avg Response' },
        { num: '100%', label: 'Satisfaction' }
      ],
      whyUs: [
        { title: '24/7 Emergency Service', desc: 'Plumbing problems do not wait for business hours' },
        { title: 'Licensed & Insured', desc: 'Fully licensed plumbers with insurance coverage' },
        { title: 'Upfront Pricing', desc: 'Know the cost before work begins' },
        { title: 'Guaranteed Work', desc: 'We stand behind everything we do' },
        { title: 'Clean & Courteous', desc: 'We leave your space cleaner than we found it' },
        { title: 'Local & Family-Owned', desc: 'Part of the community we serve' }
      ],
      ctaHeadline: 'Need a Plumber?',
      ctaText: 'Call us anytime - we are here to help'
    },
    'cleaning': {
      subtitle: 'Professional cleaning with a personal touch',
      story1: 'We founded our cleaning company with a simple belief: everyone deserves to come home to a clean, healthy space. Starting with just a few clients, we focused on delivering exceptional service with attention to detail.',
      story2: 'Word spread, and today we serve thousands of homes and businesses with the same dedication to quality that defined us from day one. Our team is trained, trusted, and committed to exceeding your expectations.',
      values: [
        { icon: 'Shield', title: 'Trust', desc: 'Background-checked, bonded cleaners' },
        { icon: 'Award', title: 'Quality', desc: 'Meticulous attention to every detail' },
        { icon: 'Heart', title: 'Care', desc: 'We treat your space with respect' },
        { icon: 'Target', title: 'Consistency', desc: 'Reliable service you can count on' }
      ],
      stats: [
        { num: '5000+', label: 'Happy Clients' },
        { num: '15+', label: 'Years Experience' },
        { num: '100%', label: 'Satisfaction' },
        { num: '4.9', label: 'Star Rating' }
      ],
      whyUs: [
        { title: 'Eco-Friendly Products', desc: 'Safe for your family, pets, and the planet' },
        { title: 'Trained Professionals', desc: 'Our team is trained to the highest standards' },
        { title: 'Background Checked', desc: 'Every cleaner is vetted and trustworthy' },
        { title: 'Satisfaction Guaranteed', desc: 'Not happy? We make it right' },
        { title: 'Flexible Scheduling', desc: 'Service when it works for you' },
        { title: 'Bonded & Insured', desc: 'Full protection for your peace of mind' }
      ],
      ctaHeadline: 'Ready for a Cleaner Space?',
      ctaText: 'Get your free quote today'
    },
    'auto-shop': {
      subtitle: 'Honest auto repair from certified mechanics',
      story1: 'We opened our shop over 30 years ago with a commitment that still drives us today: provide honest, quality auto repair at fair prices. In an industry known for distrust, we set out to be different.',
      story2: 'Today, we are proud that many of our customers have been with us for decades, and their children now bring their cars to us. That loyalty is earned through consistent honesty and quality workmanship.',
      values: [
        { icon: 'Shield', title: 'Honesty', desc: 'We recommend only what you need' },
        { icon: 'Award', title: 'Quality', desc: 'ASE certified mechanics you can trust' },
        { icon: 'Heart', title: 'Care', desc: 'We treat every car like it is our own' },
        { icon: 'Target', title: 'Fairness', desc: 'Competitive pricing on all services' }
      ],
      stats: [
        { num: '50K+', label: 'Cars Serviced' },
        { num: '30+', label: 'Years Experience' },
        { num: '12mo', label: 'Warranty' },
        { num: '4.9', label: 'Star Rating' }
      ],
      whyUs: [
        { title: 'ASE Certified', desc: 'Our mechanics hold the highest certifications' },
        { title: 'All Makes & Models', desc: 'Domestic and import specialists' },
        { title: '12-Month Warranty', desc: 'Parts and labor guaranteed' },
        { title: 'Digital Inspections', desc: 'See exactly what we see with photos' },
        { title: 'Honest Estimates', desc: 'No surprises when you pick up your car' },
        { title: 'Loaner Cars Available', desc: 'Stay mobile while we work on your car' }
      ],
      ctaHeadline: 'Time for Service?',
      ctaText: 'Schedule your appointment today'
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateAboutPage };
