/**
 * Education AboutPage Generator
 */
function generateAboutPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, BookOpen, Users, Award, Globe, ChevronRight, GraduationCap } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>About ${business.name}</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>A tradition of excellence since 1892</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Our History</h2>
            <p style={{ opacity: 0.7, lineHeight: 1.8, marginBottom: '16px' }}>
              Founded over a century ago with a vision to provide accessible, high-quality education, ${business.name} has grown from a small regional institution to a nationally recognized university.
            </p>
            <p style={{ opacity: 0.7, lineHeight: 1.8 }}>
              Today, we serve over 15,000 students from all 50 states and 80+ countries, offering more than 50 undergraduate and graduate programs. Our alumni network spans the globe, making an impact in every industry and community.
            </p>
          </div>
          <div style={{ height: '400px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={80} color={COLORS.primary} style={{ opacity: 0.4 }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Our Mission & Values</h2>
          </div>
          <div style={{ backgroundColor: COLORS.background, borderRadius: '20px', padding: '40px', marginBottom: '48px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: COLORS.primary }}>Mission Statement</h3>
            <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.8 }}>
              To educate students for meaningful lives and responsible citizenship by providing a rigorous academic experience, fostering intellectual curiosity, and cultivating a diverse and inclusive community dedicated to the pursuit of knowledge and service to society.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { icon: Target, title: 'Excellence', desc: 'We pursue the highest standards in teaching, research, and service' },
              { icon: Heart, title: 'Integrity', desc: 'We act with honesty, transparency, and ethical responsibility' },
              { icon: Users, title: 'Inclusion', desc: 'We celebrate diversity and create a welcoming community for all' },
              { icon: Globe, title: 'Impact', desc: 'We prepare students to make a positive difference in the world' }
            ].map((value, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '70px', height: '70px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <value.icon size={32} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{value.title}</h3>
                <p style={{ opacity: 0.6, lineHeight: 1.6 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { num: '130+', label: 'Years of Excellence' },
            { num: '15,000+', label: 'Current Students' },
            { num: '100,000+', label: 'Alumni Worldwide' },
            { num: '#25', label: 'National Ranking' }
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>{stat.num}</div>
              <div style={{ opacity: 0.6, fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Leadership</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { name: 'Dr. Elizabeth Warren', title: 'President', since: 'Since 2018' },
              { name: 'Dr. Michael Chen', title: 'Provost', since: 'Since 2020' },
              { name: 'Dr. Sarah Johnson', title: 'VP Academic Affairs', since: 'Since 2019' },
              { name: 'Robert Williams', title: 'VP Administration', since: 'Since 2017' }
            ].map((leader, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: \`\${COLORS.primary}20\`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px', fontWeight: '700', color: COLORS.primary }}>
                  {leader.name.split(' ').slice(1).map(n => n[0]).join('')}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{leader.name}</h3>
                <p style={{ color: COLORS.primary, fontWeight: '500', marginBottom: '4px' }}>{leader.title}</p>
                <p style={{ fontSize: '14px', opacity: 0.5 }}>{leader.since}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Accreditation & Rankings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Regional Accreditation', desc: 'Fully accredited by the Higher Learning Commission' },
              { title: 'Business School', desc: 'AACSB accredited - top 5% worldwide' },
              { title: 'Engineering', desc: 'ABET accredited programs' },
              { title: 'Nursing', desc: 'Commission on Collegiate Nursing Education' }
            ].map((acc, i) => (
              <div key={i} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Award size={24} color={COLORS.primary} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{acc.title}</h3>
                <p style={{ opacity: 0.6, fontSize: '14px' }}>{acc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Join Our Community</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Become part of a tradition of excellence and discover your potential</p>
          <Link to="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Apply Now <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateAboutPage };
