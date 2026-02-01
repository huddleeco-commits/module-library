/**
 * Layout-Aware Page Generator
 *
 * Generates complete pages using:
 * 1. Fixture Data (business info, services, team, etc.)
 * 2. Layout Config (patient-focused, medical-professional, clinical-dashboard)
 * 3. Section Variants (different visual styles for same content)
 *
 * This enables:
 * - SAME data → DIFFERENT visual experiences
 * - Zero AI cost for any layout/industry combination
 * - AI Visual Freedom can customize individual sections
 */

const { getLayout, getAvailableLayouts, getLayoutCSS } = require('./layouts/index.cjs');
const { heroCentered, heroSplit, heroMinimal, getHeroVariant } = require('./sections/hero.cjs');

/**
 * Generate a complete site with a specific layout
 */
function generateSiteWithLayout(fixture, layoutId, options = {}) {
  const layout = getLayout(layoutId);
  const { business, theme, pages } = fixture;
  const colors = theme.colors;

  console.log(`\n📐 Generating with layout: ${layout.name}`);
  console.log(`   Style: ${layout.style.heroStyle} hero, ${layout.style.cardStyle} cards`);
  console.log(`   Emphasis: ${layout.emphasis.join(', ')}\n`);

  // Generate pages based on layout
  const generatedPages = {};

  // Home Page
  generatedPages.HomePage = generateHomePageWithLayout(fixture, layout);

  // Services Page
  generatedPages.ServicesPage = generateServicesPageWithLayout(fixture, layout);

  // About Page
  generatedPages.AboutPage = generateAboutPageWithLayout(fixture, layout);

  // Contact Page
  generatedPages.ContactPage = generateContactPageWithLayout(fixture, layout);

  // Additional pages based on industry
  if (['healthcare', 'medical', 'dental', 'clinic'].includes(business.industry?.toLowerCase())) {
    generatedPages.ProvidersPage = generateProvidersPageWithLayout(fixture, layout);
    generatedPages.PatientPortalPage = generatePatientPortalPageWithLayout(fixture, layout);
    generatedPages.AppointmentsPage = generateAppointmentsPageWithLayout(fixture, layout);
    generatedPages.InsurancePage = generateInsurancePageWithLayout(fixture, layout);
  }

  return {
    layout: layout,
    pages: generatedPages,
    css: getLayoutCSS(layout)
  };
}

/**
 * Generate HomePage with layout awareness
 */
function generateHomePageWithLayout(fixture, layout) {
  const { business, theme, pages } = fixture;
  const colors = theme.colors;
  const homeData = pages?.home || {};
  const heroData = homeData.hero || {};

  // Get the right hero variant for this layout
  const heroGenerator = getHeroVariant(layout.style.heroStyle);
  const heroSection = heroGenerator(heroData, colors, business);

  // Section order based on layout
  const sectionOrder = layout.sectionOrder?.home || ['hero', 'services-preview', 'stats', 'testimonials', 'cta'];

  return `/**
 * HomePage - ${layout.name} Layout
 * Business: ${business.name}
 * Layout Style: ${layout.style.heroStyle} hero, ${layout.style.cardStyle} cards
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Calendar, User, Clock, Award, Heart, Shield, Users,
  Star, MapPin, ChevronRight, Activity, Stethoscope, FileText,
  CreditCard, AlertCircle, CheckCircle
} from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const LAYOUT = ${JSON.stringify(layout.style, null, 2)};

export default function HomePage() {
  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.text }}>
      <HeroSection />
      <ServicesPreviewSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}

${heroSection}

function ServicesPreviewSection() {
  const services = ${JSON.stringify(homeData.sections?.find(s => s.type === 'services-preview')?.items || [
    { name: 'Primary Care', description: 'Comprehensive healthcare' },
    { name: 'Specialty Care', description: 'Expert specialists' },
    { name: 'Urgent Care', description: 'Same-day appointments' },
    { name: 'Telehealth', description: 'Virtual visits' }
  ], null, 2)};

  return (
    <section style={{ padding: '100px 20px', backgroundColor: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '48px'
        }}>Our Services</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '${layout.style.spacing === 'comfortable' ? '32px' : layout.style.spacing === 'structured' ? '24px' : '16px'}'
        }}>
          {services.map((service, idx) => (
            <div key={idx} style={{
              padding: '${layout.style.spacing === 'comfortable' ? '32px' : '24px'}',
              backgroundColor: COLORS.background,
              borderRadius: '${layout.style.cardStyle === 'rounded' ? '16px' : layout.style.cardStyle === 'bordered' ? '8px' : '4px'}',
              border: '${layout.style.cardStyle === 'bordered' ? '1px solid rgba(0,0,0,0.08)' : 'none'}',
              boxShadow: '${layout.style.shadows === 'soft' ? '0 4px 20px rgba(0,0,0,0.06)' : layout.style.shadows === 'minimal' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'}'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{service.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = ${JSON.stringify(homeData.sections?.find(s => s.type === 'stats')?.items || [
    { value: '50,000+', label: 'Patients' },
    { value: '15+', label: 'Providers' },
    { value: '20', label: 'Years' },
    { value: '4.8', label: 'Rating' }
  ], null, 2)};

  return (
    <section style={{
      padding: '80px 20px',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '40px',
        textAlign: 'center'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '48px', fontWeight: '700', color: 'white' }}>{stat.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = ${JSON.stringify(homeData.sections?.find(s => s.type === 'testimonials')?.items || [
    { name: 'Patient A', text: 'Excellent care and friendly staff.', rating: 5 },
    { name: 'Patient B', text: 'Always feel welcomed and cared for.', rating: 5 }
  ], null, 2)};

  return (
    <section style={{ padding: '100px 20px', backgroundColor: COLORS.background }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
          Patient Stories
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px'
        }}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: LAYOUT.borderRadius,
              boxShadow: '${layout.style.shadows === 'soft' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.04)'}'
            }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
              <p style={{ fontWeight: '600' }}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section style={{
      padding: '100px 20px',
      background: 'linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
          Ready to Get Started?
        </h2>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
          Book your appointment today
        </p>
        <Link to="/appointments" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: '${colors.primary}',
          padding: '18px 36px',
          borderRadius: LAYOUT.borderRadius,
          fontSize: '18px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          <Calendar size={22} />
          Book Appointment
        </Link>
      </div>
    </section>
  );
}
`;
}

// Placeholder generators for other pages - would be fully implemented like HomePage
function generateServicesPageWithLayout(fixture, layout) {
  return `// ServicesPage with ${layout.name} layout - implementation similar to HomePage`;
}

function generateAboutPageWithLayout(fixture, layout) {
  return `// AboutPage with ${layout.name} layout`;
}

function generateContactPageWithLayout(fixture, layout) {
  return `// ContactPage with ${layout.name} layout`;
}

function generateProvidersPageWithLayout(fixture, layout) {
  return `// ProvidersPage with ${layout.name} layout`;
}

function generatePatientPortalPageWithLayout(fixture, layout) {
  return `// PatientPortalPage with ${layout.name} layout`;
}

function generateAppointmentsPageWithLayout(fixture, layout) {
  return `// AppointmentsPage with ${layout.name} layout`;
}

function generateInsurancePageWithLayout(fixture, layout) {
  return `// InsurancePage with ${layout.name} layout`;
}

/**
 * Generate all layout variants for a fixture (for previewing)
 */
function generateAllLayoutVariants(fixture) {
  const layouts = getAvailableLayouts();
  const variants = {};

  for (const layout of layouts) {
    variants[layout.id] = generateSiteWithLayout(fixture, layout.id);
  }

  return variants;
}

module.exports = {
  generateSiteWithLayout,
  generateHomePageWithLayout,
  generateAllLayoutVariants,
  getAvailableLayouts
};
