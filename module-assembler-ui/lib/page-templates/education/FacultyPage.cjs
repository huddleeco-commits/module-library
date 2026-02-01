/**
 * Education FacultyPage Generator
 */
function generateFacultyPage(fixture, options = {}) {
  const colors = options.colors;

  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, BookOpen, Award, GraduationCap, Search, ChevronRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const FACULTY = [
  { name: 'Dr. Sarah Mitchell', title: 'Professor of Computer Science', dept: 'Science & Technology', expertise: 'Artificial Intelligence, Machine Learning', education: 'Ph.D. MIT', publications: 85 },
  { name: 'Dr. James Chen', title: 'Professor of Economics', dept: 'Business', expertise: 'Behavioral Economics, Public Policy', education: 'Ph.D. Harvard', publications: 62 },
  { name: 'Dr. Maria Rodriguez', title: 'Associate Professor of Biology', dept: 'Science & Technology', expertise: 'Molecular Biology, Genetics', education: 'Ph.D. Stanford', publications: 45 },
  { name: 'Dr. Michael Thompson', title: 'Professor of English', dept: 'Arts & Humanities', expertise: '20th Century Literature, Creative Writing', education: 'Ph.D. Yale', publications: 38 },
  { name: 'Dr. Emily Park', title: 'Professor of Psychology', dept: 'Arts & Humanities', expertise: 'Cognitive Psychology, Neuroscience', education: 'Ph.D. Berkeley', publications: 71 },
  { name: 'Dr. Robert Williams', title: 'Clinical Professor of Nursing', dept: 'Health Sciences', expertise: 'Critical Care, Healthcare Management', education: 'D.N.P. Johns Hopkins', publications: 28 },
  { name: 'Dr. Lisa Chang', title: 'Associate Professor of Finance', dept: 'Business', expertise: 'Corporate Finance, Investment Analysis', education: 'Ph.D. Wharton', publications: 34 },
  { name: 'Dr. David Martinez', title: 'Professor of Engineering', dept: 'Science & Technology', expertise: 'Renewable Energy, Sustainable Design', education: 'Ph.D. Caltech', publications: 56 }
];

const DEPARTMENTS = ['All', 'Business', 'Science & Technology', 'Arts & Humanities', 'Health Sciences'];

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');

  const filtered = FACULTY.filter(f =>
    (dept === 'All' || f.dept === dept) &&
    (search === '' || f.name.toLowerCase().includes(search.toLowerCase()) || f.expertise.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Faculty</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>World-class educators and researchers dedicated to your success</p>
      </section>

      <section style={{ padding: '40px 20px', backgroundColor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setDept(d)} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: dept === d ? COLORS.primary : '#F3F4F6', color: dept === d ? 'white' : COLORS.text, fontWeight: '500', cursor: 'pointer' }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {filtered.map((faculty, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ height: '120px', backgroundColor: \`\${COLORS.primary}15\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: \`\${COLORS.primary}25\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', color: COLORS.primary }}>
                  {faculty.name.split(' ').slice(1).map(n => n[0]).join('')}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{faculty.name}</h3>
                <p style={{ color: COLORS.primary, fontWeight: '500', marginBottom: '12px' }}>{faculty.title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: '#F3F4F6', borderRadius: '20px', fontSize: '12px' }}>{faculty.dept}</span>
                  <span style={{ padding: '4px 10px', backgroundColor: '#F3F4F6', borderRadius: '20px', fontSize: '12px' }}>{faculty.education}</span>
                </div>
                <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '16px' }}>
                  <strong>Expertise:</strong> {faculty.expertise}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '13px', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} /> {faculty.publications} publications
                  </span>
                  <a href={\`mailto:\${faculty.name.split(' ')[1].toLowerCase()}@school.edu\`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: COLORS.primary, fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                    <Mail size={16} /> Contact
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ opacity: 0.6 }}>No faculty members found matching your search.</p>
          </div>
        )}
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>Faculty Excellence</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { num: '200+', label: 'Full-Time Faculty' },
              { num: '95%', label: 'With Terminal Degrees' },
              { num: '2000+', label: 'Publications Annually' },
              { num: '15:1', label: 'Student-Faculty Ratio' }
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '42px', fontWeight: '800', color: COLORS.primary }}>{stat.num}</div>
                <div style={{ opacity: 0.6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <Award size={48} color="white" style={{ marginBottom: '24px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>Learn from the Best</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Our faculty are leaders in their fields, committed to mentoring the next generation</p>
          <Link to="/programs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            Explore Programs <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

module.exports = { generateFacultyPage };
