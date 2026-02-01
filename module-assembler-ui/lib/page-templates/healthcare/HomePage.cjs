/**
 * Healthcare Homepage Template
 *
 * Sections (modular - AI can customize each):
 * 1. Hero - Main headline, CTA, background
 * 2. Quick Actions - Book appointment, patient portal, emergency
 * 3. Services Preview - Top services with icons
 * 4. Stats - Years, patients, providers, rating
 * 5. Why Choose Us - Features/benefits
 * 6. Testimonials - Patient reviews
 * 7. Insurance - Accepted plans logos
 * 8. CTA - Final call to action
 */

function generateHomePage(fixture, options = {}) {
  const { business, theme, pages } = fixture;
  const homeData = pages?.home || {};
  const colors = theme.colors;

  const heroSection = generateHeroSection(business, homeData.hero, colors);
  const quickActionsSection = generateQuickActionsSection(colors);
  const servicesSection = generateServicesPreviewSection(homeData.sections, colors);
  const statsSection = generateStatsSection(homeData.sections, colors);
  const featuresSection = generateFeaturesSection(homeData.sections, colors);
  const testimonialsSection = generateTestimonialsSection(homeData.sections, colors);
  const insuranceSection = generateInsuranceSection(homeData.sections, colors);
  const ctaSection = generateCtaSection(business, colors);

  return `/**
 * HomePage - Healthcare Business
 * Business: ${business.name}
 * Generated: ${new Date().toISOString()}
 *
 * MODULAR SECTIONS (AI Visual Freedom can customize each):
 * - HeroSection
 * - QuickActionsSection
 * - ServicesPreviewSection
 * - StatsSection
 * - FeaturesSection
 * - TestimonialsSection
 * - InsuranceSection
 * - CtaSection
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Calendar, User, Clock, Award, Heart, Shield, Users,
  Star, MapPin, ChevronRight, Activity, Stethoscope, FileText,
  CreditCard, AlertCircle
} from 'lucide-react';

// Theme colors from fixture
const COLORS = ${JSON.stringify(colors, null, 2)};

export default function HomePage() {
  return (
    <div className="healthcare-home" style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
      <HeroSection />
      <QuickActionsSection />
      <ServicesPreviewSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <InsuranceSection />
      <CtaSection />
    </div>
  );
}

${heroSection}

${quickActionsSection}

${servicesSection}

${statsSection}

${featuresSection}

${testimonialsSection}

${insuranceSection}

${ctaSection}

// Shared styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '16px',
    color: COLORS.text
  },
  sectionSubtitle: {
    fontSize: '18px',
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: '48px',
    maxWidth: '600px',
    margin: '0 auto 48px'
  }
};
`;
}

function generateHeroSection(business, heroData, colors) {
  const headline = heroData?.headline || business.tagline || 'Comprehensive Care for Your Whole Family';
  const subheadline = heroData?.subheadline || 'Trusted healthcare providers dedicated to your wellbeing.';
  const cta = heroData?.cta || 'Book Appointment';
  const secondaryCta = heroData?.secondaryCta || 'Patient Portal';
  const bgImage = heroData?.backgroundImage || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920';

  return `
function HeroSection() {
  return (
    <section style={{
      minHeight: '85vh',
      background: 'linear-gradient(135deg, rgba(2,132,199,0.95), rgba(3,105,161,0.9)), url(${bgImage})',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{ ...styles.container, width: '100%' }}>
        <div style={{ maxWidth: '700px' }}>
          {/* Trust badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '50px',
            marginBottom: '24px',
            color: 'white'
          }}>
            <Award size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Trusted by 50,000+ Patients</span>
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            lineHeight: 1.1,
            marginBottom: '24px',
            color: 'white'
          }}>
            ${headline}
          </h1>

          <p style={{
            fontSize: '20px',
            lineHeight: 1.6,
            marginBottom: '32px',
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '550px'
          }}>
            ${subheadline}
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/appointments" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'white',
              color: '${colors.primary}',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'transform 0.2s'
            }}>
              <Calendar size={20} />
              ${cta}
            </Link>

            <Link to="/patient-portal" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.5)'
            }}>
              <User size={20} />
              ${secondaryCta}
            </Link>
          </div>

          {/* Contact info */}
          <div style={{
            display: 'flex',
            gap: '32px',
            marginTop: '48px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} />
              <span>${business.phone || '(555) 123-4567'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} />
              <span>Mon-Fri: 8am-6pm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#DC2626',
        color: 'white',
        padding: '12px 0'
      }}>
        <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: '500' }}>For medical emergencies, please call 911 or visit your nearest emergency room</span>
        </div>
      </div>
    </section>
  );
}`;
}

function generateQuickActionsSection(colors) {
  return `
function QuickActionsSection() {
  const actions = [
    { icon: Calendar, label: 'Book Appointment', description: 'Schedule online 24/7', link: '/appointments', color: '${colors.primary}' },
    { icon: User, label: 'Patient Portal', description: 'Access your records', link: '/patient-portal', color: '#059669' },
    { icon: FileText, label: 'Request Records', description: 'Download your files', link: '/patient-portal', color: '#7C3AED' },
    { icon: CreditCard, label: 'Pay Bill Online', description: 'Secure payments', link: '/insurance', color: '#DC2626' }
  ];

  return (
    <section style={{ padding: '0', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
      <div style={styles.container}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {actions.map((action, idx) => (
            <Link key={idx} to={action.link} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: COLORS.text,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: action.color + '15',
                color: action.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <action.icon size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{action.label}</h3>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>{action.description}</p>
              </div>
              <ChevronRight size={20} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}`;
}

function generateServicesPreviewSection(sections, colors) {
  const servicesData = sections?.find(s => s.type === 'services-preview');
  const services = servicesData?.items || [
    { name: 'Primary Care', description: 'Annual exams, preventive care, chronic disease management' },
    { name: 'Pediatrics', description: 'Well-child visits, immunizations, developmental screenings' },
    { name: 'Womens Health', description: 'OB/GYN services, prenatal care, family planning' },
    { name: 'Urgent Care', description: 'Walk-in care for non-emergency illness and injury' }
  ];

  return `
function ServicesPreviewSection() {
  const services = ${JSON.stringify(services, null, 2)};

  const iconMap = {
    'Primary Care': Stethoscope,
    'Pediatrics': Heart,
    'Womens Health': Activity,
    'Urgent Care': AlertCircle
  };

  return (
    <section style={{ padding: '100px 0', backgroundColor: 'white' }}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Our Services</h2>
        <p style={styles.sectionSubtitle}>
          Comprehensive healthcare services for every stage of life
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          {services.map((service, idx) => {
            const IconComponent = iconMap[service.name] || Activity;
            return (
              <div key={idx} style={{
                padding: '32px',
                backgroundColor: COLORS.background,
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '${colors.primary}15',
                  color: '${colors.primary}',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <IconComponent size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>{service.name}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>
                <Link to="/services" style={{
                  color: '${colors.primary}',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  Learn More <ChevronRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/services" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '${colors.primary}',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            View All Services <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}`;
}

function generateStatsSection(sections, colors) {
  const statsData = sections?.find(s => s.type === 'stats');
  const stats = statsData?.items || [
    { value: '50,000+', label: 'Patients Served' },
    { value: '15+', label: 'Physicians' },
    { value: '18', label: 'Years of Service' },
    { value: '4.8★', label: 'Patient Rating' }
  ];

  return `
function StatsSection() {
  const stats = ${JSON.stringify(stats, null, 2)};

  return (
    <section style={{
      padding: '80px 0',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})'
    }}>
      <div style={styles.container}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;
}

function generateFeaturesSection(sections, colors) {
  const featuresData = sections?.find(s => s.type === 'features');
  const features = featuresData?.items || [
    { icon: 'Users', title: 'Family-Centered Care', description: 'Treating patients from newborns to seniors' },
    { icon: 'Clock', title: 'Same-Day Appointments', description: 'Urgent care available when you need it' },
    { icon: 'Laptop', title: 'Telehealth Available', description: 'Video visits from the comfort of home' },
    { icon: 'CreditCard', title: 'Most Insurance Accepted', description: 'We work with all major insurance plans' }
  ];

  return `
function FeaturesSection() {
  const features = ${JSON.stringify(features, null, 2)};

  const iconMap = { Users, Clock, Shield, Award, Heart, Star, Activity, Stethoscope };

  return (
    <section style={{ padding: '100px 0', backgroundColor: COLORS.background }}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <p style={styles.sectionSubtitle}>
          We're committed to providing exceptional care for you and your family
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          {features.map((feature, idx) => {
            const IconComponent = iconMap[feature.icon] || Heart;
            return (
              <div key={idx} style={{
                display: 'flex',
                gap: '20px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '${colors.primary}15',
                  color: '${colors.primary}',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ opacity: 0.7, lineHeight: 1.5 }}>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}`;
}

function generateTestimonialsSection(sections, colors) {
  const testimonialsData = sections?.find(s => s.type === 'testimonials');
  const testimonials = testimonialsData?.items || [
    { name: 'Michelle T.', text: 'Dr. Patel has been our family doctor for 10 years. She knows us, listens to us, and always takes time to explain everything.', rating: 5 },
    { name: 'James R.', text: 'The telehealth option is a lifesaver for busy parents. Quality care without the waiting room.', rating: 5 },
    { name: 'Linda C.', text: 'After a cancer scare, the team here was with me every step of the way. Compassionate, thorough care.', rating: 5 }
  ];

  return `
function TestimonialsSection() {
  const testimonials = ${JSON.stringify(testimonials, null, 2)};

  return (
    <section style={{ padding: '100px 0', backgroundColor: 'white' }}>
      <div style={styles.container}>
        <h2 style={styles.sectionTitle}>Patient Stories</h2>
        <p style={styles.sectionSubtitle}>
          Hear from families who trust us with their healthcare
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {testimonials.map((testimonial, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: COLORS.background,
              borderRadius: '16px',
              position: 'relative'
            }}>
              {/* Quote mark */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                fontSize: '72px',
                color: '${colors.primary}',
                opacity: 0.1,
                fontFamily: 'Georgia, serif',
                lineHeight: 1
              }}>
                "
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>

              <p style={{
                fontSize: '16px',
                lineHeight: 1.7,
                marginBottom: '20px',
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1
              }}>
                "{testimonial.text}"
              </p>

              <div style={{ fontWeight: '600' }}>{testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;
}

function generateInsuranceSection(sections, colors) {
  const insuranceData = sections?.find(s => s.type === 'insurance');
  const plans = insuranceData?.items || [
    'Blue Cross Blue Shield', 'Aetna', 'Cigna', 'United Healthcare',
    'Medicare', 'Medicaid', 'Harvard Pilgrim', 'Tufts Health'
  ];

  return `
function InsuranceSection() {
  const plans = ${JSON.stringify(plans, null, 2)};

  return (
    <section style={{ padding: '80px 0', backgroundColor: COLORS.background }}>
      <div style={styles.container}>
        <h2 style={{ ...styles.sectionTitle, marginBottom: '12px' }}>Insurance Accepted</h2>
        <p style={styles.sectionSubtitle}>
          We work with most major insurance providers
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {plans.map((plan, idx) => (
            <div key={idx} style={{
              padding: '16px 24px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {plan}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', opacity: 0.7 }}>
          Don't see your insurance? <Link to="/insurance" style={{ color: '${colors.primary}', fontWeight: '600' }}>Contact us</Link> - we may still be able to help.
        </p>
      </div>
    </section>
  );
}`;
}

function generateCtaSection(business, colors) {
  return `
function CtaSection() {
  return (
    <section style={{
      padding: '100px 0',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
      textAlign: 'center'
    }}>
      <div style={styles.container}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px'
        }}>
          Ready to Schedule Your Visit?
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          New patients are always welcome. Book your appointment today and experience the difference.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/appointments" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'white',
            color: '${colors.primary}',
            padding: '18px 36px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            <Calendar size={20} />
            Book Appointment
          </Link>

          <a href="tel:${business.phone || '5551234567'}" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            color: 'white',
            padding: '18px 36px',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid rgba(255,255,255,0.5)'
          }}>
            <Phone size={20} />
            Call ${business.phone || '(555) 123-4567'}
          </a>
        </div>
      </div>
    </section>
  );
}`;
}

module.exports = { generateHomePage };
