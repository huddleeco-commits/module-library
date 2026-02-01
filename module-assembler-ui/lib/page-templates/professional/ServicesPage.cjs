/**
 * Professional Services ServicesPage Generator
 */
function generateServicesPage(fixture, options = {}) {
  const { business } = fixture;
  const colors = options.colors;
  const content = getServicesContent(business.industry);

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Check, Phone } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const SERVICES = ${JSON.stringify(content.services, null, 2)};

export default function ServicesPage() {
  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <section style={{ padding: '80px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Services</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${content.subtitle}</p>
      </section>

      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {SERVICES.map((service, idx) => (
            <div key={idx} style={{ marginBottom: '60px', padding: '40px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>{service.name}</h2>
                  <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '24px', fontSize: '17px' }}>{service.description}</p>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                    {service.features.map((feature, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '24px', height: '24px', backgroundColor: '#05966915', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} color="#059669" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: COLORS.primary, color: 'white', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
                    ${content.cta} <ChevronRight size={18} />
                  </Link>
                </div>
                <div style={{ height: '300px', backgroundColor: \`\${COLORS.primary}10\`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '80px', opacity: 0.3 }}>{service.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>${content.processTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {${JSON.stringify(content.process)}.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: COLORS.primary, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', margin: '0 auto 16px' }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 20px', background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.secondary || COLORS.primary})\`, textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>${content.ctaHeadline}</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>${content.ctaSubtext}</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: COLORS.primary, padding: '16px 36px', borderRadius: '8px', fontSize: '17px', fontWeight: '700', textDecoration: 'none' }}>
            <Phone size={20} /> Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}`;
}

function getServicesContent(industry) {
  const content = {
    'law-firm': {
      subtitle: 'Comprehensive legal services for individuals and businesses',
      cta: 'Schedule Consultation',
      processTitle: 'How We Work',
      ctaHeadline: 'Ready to Discuss Your Case?',
      ctaSubtext: 'Schedule a free consultation with our experienced attorneys',
      process: [
        { title: 'Free Consultation', desc: 'Discuss your case with an attorney' },
        { title: 'Case Evaluation', desc: 'We review all details and options' },
        { title: 'Strategy Development', desc: 'Create a winning legal strategy' },
        { title: 'Representation', desc: 'Fight for your rights' }
      ],
      services: [
        { name: 'Personal Injury', icon: '⚖️', description: 'If you have been injured due to someone else\'s negligence, we will fight to get you the compensation you deserve for medical bills, lost wages, and pain and suffering.', features: ['Auto Accidents', 'Slip & Fall', 'Medical Malpractice', 'Wrongful Death'] },
        { name: 'Family Law', icon: '👨‍👩‍👧', description: 'Navigate family legal matters with compassionate, experienced counsel. We handle sensitive cases with discretion and dedication to your family\'s best interests.', features: ['Divorce & Separation', 'Child Custody', 'Child Support', 'Prenuptial Agreements'] },
        { name: 'Business Law', icon: '🏢', description: 'Protect your business with comprehensive legal services. From formation to contracts to disputes, we have your business covered.', features: ['Business Formation', 'Contract Review', 'Employment Law', 'Business Disputes'] },
        { name: 'Criminal Defense', icon: '🛡️', description: 'Facing criminal charges? Our experienced defense attorneys will fight aggressively to protect your rights and freedom.', features: ['DUI Defense', 'Drug Charges', 'Assault & Battery', 'White Collar Crime'] }
      ]
    },
    'real-estate': {
      subtitle: 'Full-service real estate for buyers, sellers, and investors',
      cta: 'Get Started',
      processTitle: 'Our Simple Process',
      ctaHeadline: 'Ready to Make Your Move?',
      ctaSubtext: 'Contact us today to start your real estate journey',
      process: [
        { title: 'Consultation', desc: 'Discuss your goals and needs' },
        { title: 'Search/Preparation', desc: 'Find properties or prep your listing' },
        { title: 'Negotiation', desc: 'Get the best possible terms' },
        { title: 'Closing', desc: 'Smooth transaction to the finish' }
      ],
      services: [
        { name: 'Buyer Representation', icon: '🏠', description: 'Find your dream home with an experienced buyer\'s agent. We handle the search, negotiations, and paperwork so you can focus on your new home.', features: ['Home Search', 'Market Analysis', 'Offer Negotiation', 'Closing Coordination'] },
        { name: 'Seller Services', icon: '💰', description: 'Get top dollar for your property with our proven marketing strategies and expert pricing. We make selling stress-free.', features: ['Home Valuation', 'Professional Staging', 'Marketing Campaign', 'Buyer Screening'] },
        { name: 'Investment Properties', icon: '📈', description: 'Build wealth through real estate investment. We help you find and acquire profitable investment properties.', features: ['ROI Analysis', 'Property Sourcing', 'Due Diligence', 'Portfolio Building'] },
        { name: 'Property Management', icon: '🔑', description: 'Hands-off property ownership with our full-service management. We handle tenants, maintenance, and financials.', features: ['Tenant Screening', 'Rent Collection', 'Maintenance', 'Financial Reporting'] }
      ]
    },
    'plumber': {
      subtitle: 'Complete plumbing solutions for homes and businesses',
      cta: 'Request Service',
      processTitle: 'Our Service Process',
      ctaHeadline: 'Need a Plumber?',
      ctaSubtext: 'Available 24/7 for emergency and scheduled service',
      process: [
        { title: 'Call Us', desc: 'Describe your plumbing issue' },
        { title: 'Dispatch', desc: 'Technician on the way fast' },
        { title: 'Diagnose', desc: 'Identify and explain the problem' },
        { title: 'Repair', desc: 'Fix it right the first time' }
      ],
      services: [
        { name: 'Emergency Plumbing', icon: '🚨', description: 'Plumbing emergencies do not wait, and neither do we. Our 24/7 emergency service gets a licensed plumber to you fast.', features: ['24/7 Availability', 'Fast Response', 'Burst Pipes', 'Sewage Backup'] },
        { name: 'Drain Cleaning', icon: '🚿', description: 'Slow drains and clogs are no match for our professional drain cleaning equipment and expertise.', features: ['Clogged Drains', 'Sewer Lines', 'Hydro Jetting', 'Camera Inspection'] },
        { name: 'Water Heaters', icon: '🔥', description: 'From repairs to full replacements, we keep your hot water flowing. We work with all types and brands.', features: ['Repairs', 'Installation', 'Tankless Systems', 'Maintenance'] },
        { name: 'Pipe Services', icon: '🔧', description: 'Expert pipe repair, replacement, and repiping services. We fix leaks and upgrade old plumbing.', features: ['Leak Detection', 'Pipe Repair', 'Repiping', 'Gas Lines'] }
      ]
    },
    'cleaning': {
      subtitle: 'Professional cleaning for homes and offices',
      cta: 'Get a Quote',
      processTitle: 'How It Works',
      ctaHeadline: 'Ready for a Sparkling Clean Space?',
      ctaSubtext: 'Get your free quote today - no obligation',
      process: [
        { title: 'Get Quote', desc: 'Tell us about your space' },
        { title: 'Schedule', desc: 'Pick a convenient time' },
        { title: 'We Clean', desc: 'Our team does the work' },
        { title: 'Enjoy', desc: 'Relax in your clean space' }
      ],
      services: [
        { name: 'Regular Cleaning', icon: '✨', description: 'Keep your home consistently clean with our recurring cleaning services. Weekly, bi-weekly, or monthly options available.', features: ['Flexible Scheduling', 'Same Team Each Visit', 'Custom Checklist', 'Eco-Friendly Products'] },
        { name: 'Deep Cleaning', icon: '🧹', description: 'A thorough top-to-bottom clean that reaches every corner. Perfect for spring cleaning or before special events.', features: ['Baseboards & Trim', 'Inside Appliances', 'Light Fixtures', 'Behind Furniture'] },
        { name: 'Move In/Out Cleaning', icon: '📦', description: 'Get your deposit back or start fresh in your new home. We leave no detail unchecked.', features: ['Complete Clean', 'Inside Cabinets', 'Appliance Cleaning', 'Window Cleaning'] },
        { name: 'Office Cleaning', icon: '🏢', description: 'Professional commercial cleaning to keep your workplace spotless and productive.', features: ['After Hours Service', 'Common Areas', 'Restroom Sanitation', 'Floor Care'] }
      ]
    },
    'auto-shop': {
      subtitle: 'Complete auto repair and maintenance services',
      cta: 'Schedule Service',
      processTitle: 'Our Repair Process',
      ctaHeadline: 'Time for Service?',
      ctaSubtext: 'Schedule your appointment today',
      process: [
        { title: 'Book Online', desc: 'Schedule your appointment' },
        { title: 'Diagnose', desc: 'We inspect and identify issues' },
        { title: 'Approve', desc: 'Review estimate, no surprises' },
        { title: 'Repair', desc: 'Quality work, guaranteed' }
      ],
      services: [
        { name: 'Oil Change & Maintenance', icon: '🛢️', description: 'Keep your engine running smoothly with regular oil changes and scheduled maintenance services.', features: ['Conventional & Synthetic', 'Filter Replacement', 'Fluid Top-Off', 'Multi-Point Inspection'] },
        { name: 'Brake Service', icon: '🛑', description: 'Your safety is our priority. We provide complete brake inspection, repair, and replacement services.', features: ['Brake Inspection', 'Pad Replacement', 'Rotor Resurfacing', 'Brake Fluid Flush'] },
        { name: 'Engine & Transmission', icon: '⚙️', description: 'Expert diagnostics and repair for engine and transmission problems. We fix it right the first time.', features: ['Check Engine Light', 'Engine Repair', 'Transmission Service', 'Tune-Ups'] },
        { name: 'AC & Heating', icon: '❄️', description: 'Stay comfortable year-round with our AC and heating system services.', features: ['AC Recharge', 'Compressor Repair', 'Heater Core', 'Climate Control'] }
      ]
    }
  };
  return content[industry] || content['law-firm'];
}

module.exports = { generateServicesPage };
