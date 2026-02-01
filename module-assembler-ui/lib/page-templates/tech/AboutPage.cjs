/**
 * Tech AboutPage Generator
 */
function generateAboutPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, Users, Zap, Award, Globe, ArrowRight, Linkedin, Twitter } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TEAM = ${JSON.stringify(content.team, null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>About ${business.name}</h1>
        <p style={{ fontSize: '20px', opacity: 0.7, maxWidth: '600px', margin: '0 auto' }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '60px 20px' }}>
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
          <div style={{ height: '400px', background: \`linear-gradient(135deg, \${COLORS.primary}20, \${COLORS.secondary}20)\`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={80} color={COLORS.primary} style={{ opacity: 0.4 }} />
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
                <div style={{ width: '80px', height: '80px', background: \`linear-gradient(135deg, \${COLORS.primary}15, \${COLORS.secondary}15)\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  {value.icon === 'Target' && <Target size={36} color={COLORS.primary} />}
                  {value.icon === 'Heart' && <Heart size={36} color={COLORS.primary} />}
                  {value.icon === 'Zap' && <Zap size={36} color={COLORS.primary} />}
                  {value.icon === 'Users' && <Users size={36} color={COLORS.primary} />}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {${JSON.stringify(content.stats)}.map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.num}</div>
              <div style={{ opacity: 0.6, fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Meet Our Team</h2>
            <p style={{ opacity: 0.6 }}>The people building the future</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {TEAM.map((member, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: \`linear-gradient(135deg, \${COLORS.primary}20, \${COLORS.secondary}20)\`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '48px', fontWeight: '700', color: COLORS.primary }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: COLORS.primary, fontWeight: '500', marginBottom: '12px' }}>{member.role}</p>
                <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{member.bio}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <a href="#" style={{ width: '36px', height: '36px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Linkedin size={18} color={COLORS.primary} />
                  </a>
                  <a href="#" style={{ width: '36px', height: '36px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Twitter size={18} color={COLORS.primary} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Award size={48} color={COLORS.primary} style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Want to Join Us?</h2>
          <p style={{ opacity: 0.7, fontSize: '18px', marginBottom: '32px' }}>We are always looking for talented people to join our team.</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px 32px', borderRadius: '10px', fontWeight: '700', textDecoration: 'none' }}>
            View Open Positions <ArrowRight size={20} />
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
      subtitle: 'Building the future of work, one feature at a time',
      story1: 'We started with a simple idea: work software should not be complicated. After years of frustration with bloated tools and complex interfaces, we set out to build something better.',
      story2: 'Today, our platform helps thousands of teams work smarter. But we are just getting started. Every day, we are building new features and improving our product based on feedback from customers like you.',
      values: [
        { icon: 'Target', title: 'Customer First', desc: 'Every decision starts with our customers. Their success is our success.' },
        { icon: 'Zap', title: 'Move Fast', desc: 'We ship quickly, learn from feedback, and iterate constantly.' },
        { icon: 'Heart', title: 'Quality Obsessed', desc: 'We sweat the details because we know they matter.' },
        { icon: 'Users', title: 'Team Spirit', desc: 'We work together, support each other, and celebrate wins as a team.' }
      ],
      stats: [
        { num: '50K+', label: 'Active Users' },
        { num: '120+', label: 'Countries' },
        { num: '99.99%', label: 'Uptime' },
        { num: '45', label: 'Team Members' }
      ],
      team: [
        { name: 'Alex Chen', role: 'CEO & Co-Founder', bio: 'Former Google engineer turned entrepreneur. Passionate about simplifying complex problems.' },
        { name: 'Sarah Miller', role: 'CTO & Co-Founder', bio: 'Built infrastructure at Netflix. Loves distributed systems and scaling challenges.' },
        { name: 'Marcus Johnson', role: 'VP Product', bio: 'Led product teams at Slack. Obsessed with delightful user experiences.' },
        { name: 'Emily Rodriguez', role: 'VP Engineering', bio: '15 years building software. Champion of clean code and happy engineers.' }
      ]
    },
    'ecommerce': {
      subtitle: 'Bringing you the best products at the best prices',
      story1: 'We believe shopping should be easy, enjoyable, and trustworthy. That is why we founded this company: to create a shopping experience that puts customers first.',
      story2: 'From carefully curating our product selection to offering hassle-free returns, everything we do is designed with you in mind. We are not just a store; we are your shopping partner.',
      values: [
        { icon: 'Target', title: 'Quality Products', desc: 'Every item is carefully selected and quality-checked.' },
        { icon: 'Zap', title: 'Fast Delivery', desc: 'We work with the best shipping partners for speedy delivery.' },
        { icon: 'Heart', title: 'Customer Love', desc: 'Your satisfaction is our top priority, always.' },
        { icon: 'Users', title: 'Community', desc: 'We are building a community of happy shoppers.' }
      ],
      stats: [
        { num: '100K+', label: 'Happy Customers' },
        { num: '50K+', label: 'Products' },
        { num: '100+', label: 'Countries' },
        { num: '4.9', label: 'Star Rating' }
      ],
      team: [
        { name: 'Jennifer Lee', role: 'CEO & Founder', bio: 'Former retail executive with a passion for exceptional shopping experiences.' },
        { name: 'David Park', role: 'COO', bio: 'Operations expert who keeps everything running smoothly.' },
        { name: 'Amanda Smith', role: 'Head of Product', bio: 'Curates our collection with an eye for quality and trends.' },
        { name: 'Michael Brown', role: 'Customer Experience', bio: 'Dedicated to making every customer interaction outstanding.' }
      ]
    }
  };
  return content[industry] || content['saas'];
}

module.exports = { generateAboutPage };
