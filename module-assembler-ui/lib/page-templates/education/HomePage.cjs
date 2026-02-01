/**
 * Education HomePage Generator
 */
function generateHomePage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ChevronRight, Star, Calendar, MapPin } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background }}>
      {/* Hero */}
      <section style={{
        minHeight: '85vh',
        background: \`linear-gradient(135deg, \${COLORS.primary}f5, \${COLORS.secondary}e5)\`,
        display: 'flex', alignItems: 'center', padding: '80px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div style={{ color: 'white' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px 20px', borderRadius: '50px', marginBottom: '24px' }}>
              <GraduationCap size={18} /> <span style={{ fontWeight: '500' }}>Enrollment Open for Fall 2024</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', lineHeight: 1.1, marginBottom: '24px' }}>
              ${business.tagline || 'Where Excellence Meets Opportunity'}
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', lineHeight: 1.6 }}>
              Discover your potential at our institution. World-class education, inspiring faculty, and endless opportunities await.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
                Apply Now <ChevronRight size={20} />
              </Link>
              <Link to="/campus" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '16px 32px', borderRadius: '8px', fontSize: '17px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Calendar size={20} /> Schedule a Visit
              </Link>
            </div>
          </div>
          <div style={{ height: '450px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <GraduationCap size={100} color="white" style={{ opacity: 0.4 }} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { num: '95%', label: 'Graduation Rate' },
            { num: '15:1', label: 'Student-Faculty Ratio' },
            { num: '50+', label: 'Programs Offered' },
            { num: '#25', label: 'National Ranking' }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: COLORS.primary }}>{s.num}</div>
              <div style={{ opacity: 0.6, fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Preview */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Academic Programs</h2>
            <p style={{ opacity: 0.6, fontSize: '18px' }}>Discover programs designed to prepare you for success</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { name: 'Business & Management', desc: 'Develop leadership skills and business acumen for the modern economy', students: '2,500+' },
              { name: 'Science & Technology', desc: 'Explore cutting-edge research and innovation in STEM fields', students: '1,800+' },
              { name: 'Arts & Humanities', desc: 'Cultivate creativity and critical thinking across diverse disciplines', students: '1,200+' },
              { name: 'Health Sciences', desc: 'Prepare for careers in healthcare with hands-on clinical experience', students: '1,500+' }
            ].map((program, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <BookOpen size={28} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>{program.name}</h3>
                <p style={{ opacity: 0.6, lineHeight: 1.6, marginBottom: '16px' }}>{program.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', opacity: 0.5 }}>{program.students} students</span>
                  <Link to="/programs" style={{ color: COLORS.primary, fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Learn More <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              View All Programs <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Why Choose ${business.name}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {[
              { icon: Award, title: 'Academic Excellence', desc: 'Rigorous curriculum designed by industry experts and leading academics' },
              { icon: Users, title: 'Diverse Community', desc: 'Students from 80+ countries creating a rich cultural experience' },
              { icon: BookOpen, title: 'Research Opportunities', desc: 'Hands-on research experience with renowned faculty mentors' },
              { icon: GraduationCap, title: 'Career Success', desc: '92% of graduates employed or in grad school within 6 months' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <f.icon size={36} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{f.title}</h3>
                <p style={{ opacity: 0.6, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>Student Stories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {[
              { name: 'Emily Chen', program: 'Computer Science, Class of 2024', text: 'The professors here genuinely care about your success. I landed my dream job at a top tech company thanks to their guidance.' },
              { name: 'Marcus Johnson', program: 'Business Administration, Class of 2023', text: 'The networking opportunities and real-world projects prepared me for my career better than I could have imagined.' },
              { name: 'Sarah Williams', program: 'Pre-Med Biology, Class of 2024', text: 'The research opportunities here are incredible. I have published two papers with my faculty mentor.' }
            ].map((t, i) => (
              <div key={i} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.7, opacity: 0.8 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: \`\${COLORS.primary}20\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: COLORS.primary }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{t.name}</div>
                    <div style={{ fontSize: '14px', opacity: 0.6 }}>{t.program}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Start Your Journey Today</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>Take the first step toward your future. Apply now or schedule a campus visit.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none' }}>
              Apply Now <ChevronRight size={20} />
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'transparent', color: 'white', padding: '18px 36px', borderRadius: '8px', fontSize: '18px', fontWeight: '600', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
              <MapPin size={20} /> Visit Campus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateHomePage };
