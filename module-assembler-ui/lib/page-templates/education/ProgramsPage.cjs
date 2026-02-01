/**
 * Education ProgramsPage Generator
 */
function generateProgramsPage(fixture, options = {}) {
  const colors = options.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, Award, ChevronRight, GraduationCap, Briefcase, Microscope, Palette } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const PROGRAMS = [
  {
    category: 'Business',
    icon: 'Briefcase',
    programs: [
      { name: 'Business Administration', degree: 'B.S.', duration: '4 years', desc: 'Comprehensive business education covering management, finance, and marketing' },
      { name: 'Accounting', degree: 'B.S.', duration: '4 years', desc: 'Prepare for CPA certification with rigorous accounting curriculum' },
      { name: 'MBA', degree: 'M.B.A.', duration: '2 years', desc: 'Accelerate your career with our nationally ranked MBA program' },
      { name: 'Finance', degree: 'B.S.', duration: '4 years', desc: 'Master financial analysis, investments, and corporate finance' }
    ]
  },
  {
    category: 'Science & Technology',
    icon: 'Microscope',
    programs: [
      { name: 'Computer Science', degree: 'B.S.', duration: '4 years', desc: 'Learn programming, algorithms, and software development' },
      { name: 'Data Science', degree: 'M.S.', duration: '2 years', desc: 'Master data analysis, machine learning, and statistics' },
      { name: 'Biology', degree: 'B.S.', duration: '4 years', desc: 'Explore life sciences with hands-on lab experience' },
      { name: 'Engineering', degree: 'B.S.', duration: '4 years', desc: 'Design and innovate in mechanical, electrical, or civil engineering' }
    ]
  },
  {
    category: 'Arts & Humanities',
    icon: 'Palette',
    programs: [
      { name: 'English Literature', degree: 'B.A.', duration: '4 years', desc: 'Study classic and contemporary literature with expert faculty' },
      { name: 'Psychology', degree: 'B.A.', duration: '4 years', desc: 'Understand human behavior and mental processes' },
      { name: 'Communications', degree: 'B.A.', duration: '4 years', desc: 'Master media, journalism, and public relations' },
      { name: 'Fine Arts', degree: 'B.F.A.', duration: '4 years', desc: 'Develop your artistic vision in studio art or design' }
    ]
  },
  {
    category: 'Health Sciences',
    icon: 'GraduationCap',
    programs: [
      { name: 'Nursing', degree: 'B.S.N.', duration: '4 years', desc: 'Prepare for a rewarding career in healthcare' },
      { name: 'Pre-Medicine', degree: 'B.S.', duration: '4 years', desc: 'Rigorous preparation for medical school admission' },
      { name: 'Public Health', degree: 'M.P.H.', duration: '2 years', desc: 'Lead community health initiatives and policy' },
      { name: 'Physical Therapy', degree: 'D.P.T.', duration: '3 years', desc: 'Doctoral program in physical therapy' }
    ]
  }
];

export default function ProgramsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPrograms = activeCategory === 'all'
    ? PROGRAMS
    : PROGRAMS.filter(p => p.category.toLowerCase().includes(activeCategory));

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Academic Programs</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Over 50 undergraduate and graduate programs to choose from</p>
      </section>

      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '72px', zIndex: 50 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '8px', padding: '16px 20px', justifyContent: 'center', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Programs' },
            { id: 'business', label: 'Business' },
            { id: 'science', label: 'Science & Tech' },
            { id: 'arts', label: 'Arts & Humanities' },
            { id: 'health', label: 'Health Sciences' }
          ].map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeCategory === cat.id ? COLORS.primary : 'transparent', color: activeCategory === cat.id ? 'white' : COLORS.text, fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {filteredPrograms.map((category, idx) => (
            <div key={idx} style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: \`\${COLORS.primary}15\`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {category.icon === 'Briefcase' && <Briefcase size={24} color={COLORS.primary} />}
                  {category.icon === 'Microscope' && <Microscope size={24} color={COLORS.primary} />}
                  {category.icon === 'Palette' && <Palette size={24} color={COLORS.primary} />}
                  {category.icon === 'GraduationCap' && <GraduationCap size={24} color={COLORS.primary} />}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '700' }}>{category.category}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {category.programs.map((program, i) => (
                  <div key={i} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{program.name}</h3>
                      <span style={{ padding: '4px 10px', backgroundColor: \`\${COLORS.primary}15\`, color: COLORS.primary, borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{program.degree}</span>
                    </div>
                    <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>{program.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {program.duration}
                      </span>
                      <a href="#" style={{ color: COLORS.primary, fontWeight: '600', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Details <ChevronRight size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Why Our Programs Stand Out</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[
              { icon: Award, title: 'Accredited', desc: 'All programs fully accredited by national bodies' },
              { icon: Users, title: 'Small Classes', desc: 'Average class size of 20 students' },
              { icon: BookOpen, title: 'Internships', desc: 'Guaranteed internship opportunities' },
              { icon: GraduationCap, title: 'Job Placement', desc: '92% employment rate within 6 months' }
            ].map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <f.icon size={28} color={COLORS.primary} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ opacity: 0.6, fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Ready to Apply?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Start your application today and join our community of scholars</p>
          <Link to="/admissions" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Apply Now <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateProgramsPage };
