/**
 * Professional Services TeamPage Generator
 */
function generateTeamPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getTeamContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Award, ChevronRight } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const TEAM = ${JSON.stringify(content.team, null, 2)};

export default function TeamPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>${content.title}</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          {TEAM.map((member, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '200px', backgroundColor: \`\${COLORS.primary}15\`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: \`\${COLORS.primary}25\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '700', color: COLORS.primary }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: COLORS.primary, fontWeight: '600', marginBottom: '16px' }}>{member.role}</p>
                <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>{member.bio}</p>
                {member.credentials && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                    {member.credentials.map((cred, i) => (
                      <span key={i} style={{ padding: '4px 12px', backgroundColor: \`\${COLORS.primary}10\`, color: COLORS.primary, borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {cred}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={\`mailto:\${member.email || 'contact@company.com'}\`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: COLORS.primary, color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    <Mail size={18} /> Contact
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <Award size={48} color={COLORS.primary} style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>${content.ctaHeadline}</h2>
          <p style={{ opacity: 0.7, fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>${content.ctaText}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '16px 32px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
            ${content.ctaButton} <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getTeamContent(industry) {
  const content = {
    'law-firm': {
      title: 'Our Attorneys',
      subtitle: 'Experienced legal professionals dedicated to your case',
      team: [
        { name: 'Robert Mitchell', role: 'Managing Partner', bio: 'Over 25 years of trial experience in personal injury and civil litigation. Known for aggressive courtroom advocacy.', credentials: ['J.D. Harvard Law', 'Super Lawyer 2024', 'Top 100 Trial Lawyers'] },
        { name: 'Sarah Chen', role: 'Senior Partner', bio: 'Specializing in family law with a focus on divorce and custody matters. Compassionate advocate for families.', credentials: ['J.D. Stanford Law', 'Family Law Specialist', 'Certified Mediator'] },
        { name: 'Michael Torres', role: 'Partner', bio: 'Criminal defense attorney with an exceptional track record. Former prosecutor who knows both sides.', credentials: ['J.D. Columbia Law', 'Ex-District Attorney', 'Criminal Law Expert'] },
        { name: 'Jennifer Adams', role: 'Associate Attorney', bio: 'Business law specialist helping entrepreneurs and established companies protect their interests.', credentials: ['J.D. UCLA Law', 'MBA Finance', 'Corporate Law'] }
      ],
      ctaHeadline: 'Let Us Fight For You',
      ctaText: 'Our experienced attorneys are ready to review your case and discuss your options.',
      ctaButton: 'Schedule Consultation'
    },
    'real-estate': {
      title: 'Our Team',
      subtitle: 'Experienced agents ready to help you',
      team: [
        { name: 'Jennifer Williams', role: 'Principal Broker', bio: 'Over 20 years in real estate with $200M+ in career sales. Expert in luxury properties and negotiations.', credentials: ['Licensed Broker', 'Top Producer', 'Luxury Certified'] },
        { name: 'David Park', role: 'Senior Agent', bio: 'Specializing in first-time buyers and investment properties. Known for patient guidance and market expertise.', credentials: ['15+ Years Experience', 'Buyer Specialist', 'Investment Expert'] },
        { name: 'Amanda Rodriguez', role: 'Listing Specialist', bio: 'Marketing expert who gets homes sold fast and for top dollar. Award-winning staging and photography.', credentials: ['Listing Expert', 'Staging Pro', 'Digital Marketing'] },
        { name: 'Marcus Johnson', role: 'Buyer Agent', bio: 'Dedicated to finding the perfect home for every client. Knows every neighborhood inside and out.', credentials: ['Buyer Representative', 'Relocation Specialist', 'New Construction'] }
      ],
      ctaHeadline: 'Work With the Best',
      ctaText: 'Our team has the experience and dedication to help you achieve your real estate goals.',
      ctaButton: 'Contact Us'
    },
    'plumber': {
      title: 'Our Team',
      subtitle: 'Licensed professionals you can trust',
      team: [
        { name: 'Mike Johnson', role: 'Owner / Master Plumber', bio: 'Founded the company 20 years ago. Oversees all major projects and trains our team to the highest standards.', credentials: ['Master Plumber', '30+ Years Exp', 'Licensed & Bonded'] },
        { name: 'David Martinez', role: 'Lead Technician', bio: 'Specializes in commercial plumbing and complex residential projects. 15 years of experience.', credentials: ['Journeyman Plumber', 'Commercial Specialist', 'Backflow Certified'] },
        { name: 'Chris Thompson', role: 'Service Technician', bio: 'Expert in water heaters and drain cleaning. Known for fast, clean work and friendly service.', credentials: ['Licensed Plumber', 'Water Heater Pro', 'Drain Specialist'] },
        { name: 'Jake Wilson', role: 'Service Technician', bio: 'Handles emergency calls and routine maintenance. Always ready to help day or night.', credentials: ['Licensed Plumber', '24/7 Emergency', 'Leak Detection'] }
      ],
      ctaHeadline: 'Trusted Professionals',
      ctaText: 'Our licensed team delivers quality work you can count on, every time.',
      ctaButton: 'Call Us Now'
    },
    'cleaning': {
      title: 'Our Team',
      subtitle: 'Trusted professionals dedicated to clean',
      team: [
        { name: 'Maria Santos', role: 'Founder / Operations Manager', bio: 'Founded the company 15 years ago. Personally trains every team member and maintains quality standards.', credentials: ['Owner', 'Quality Control', 'Training Lead'] },
        { name: 'Lisa Chen', role: 'Team Lead - Residential', bio: 'Leads our residential cleaning teams. Meticulous attention to detail and customer service focus.', credentials: ['5 Years Exp', 'Deep Clean Specialist', 'Eco-Friendly Expert'] },
        { name: 'Robert Williams', role: 'Team Lead - Commercial', bio: 'Manages commercial accounts and after-hours office cleaning. Reliable and professional.', credentials: ['10 Years Exp', 'Commercial Certified', 'Floor Care Expert'] },
        { name: 'Jennifer Adams', role: 'Customer Success Manager', bio: 'Your point of contact for scheduling and special requests. Ensures complete satisfaction.', credentials: ['Customer Care', 'Scheduling', 'Quality Assurance'] }
      ],
      ctaHeadline: 'Meet Your Cleaning Team',
      ctaText: 'Every member of our team is background-checked, trained, and committed to exceeding your expectations.',
      ctaButton: 'Get Your Quote'
    },
    'auto-shop': {
      title: 'Our Mechanics',
      subtitle: 'ASE certified technicians you can trust',
      team: [
        { name: 'Tony Ramirez', role: 'Owner / Master Technician', bio: 'Started turning wrenches at 16 and opened the shop 30 years ago. ASE Master Tech with dealer training.', credentials: ['ASE Master', '40+ Years Exp', 'Shop Owner'] },
        { name: 'Steve Miller', role: 'Lead Technician', bio: 'Specializes in engine diagnostics and repair. Can troubleshoot any problem with precision.', credentials: ['ASE Certified', 'Engine Specialist', 'Diagnostics Expert'] },
        { name: 'Kevin Park', role: 'Technician', bio: 'Expert in electrical systems, hybrid vehicles, and modern computer-controlled systems.', credentials: ['ASE Certified', 'Hybrid Specialist', 'Electrical Expert'] },
        { name: 'Marcus Brown', role: 'Technician', bio: 'Handles brake, suspension, and alignment work. Known for thorough inspections and quality work.', credentials: ['ASE Certified', 'Brakes & Suspension', 'Alignment Specialist'] }
      ],
      ctaHeadline: 'Mechanics You Can Trust',
      ctaText: 'Our ASE certified team has the training and experience to service any vehicle.',
      ctaButton: 'Schedule Service'
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateTeamPage };
