/**
 * Healthcare Page Templates
 *
 * Complete business pages for healthcare/medical practices.
 * Modular structure allows AI visual freedom customization.
 *
 * Pages included:
 * - Homepage (hero, services preview, stats, testimonials, insurance)
 * - Services (medical specialties, detailed service cards)
 * - Providers (doctor profiles, credentials, specialties)
 * - Patient Portal (login, dashboard, records access)
 * - Appointments (scheduling, availability, booking)
 * - Insurance (accepted plans, billing info)
 * - About (mission, story, certifications)
 * - Contact (locations, hours, contact form)
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateServicesPage } = require('./ServicesPage.cjs');
const { generateProvidersPage } = require('./ProvidersPage.cjs');
const { generatePatientPortalPage } = require('./PatientPortalPage.cjs');
const { generateAppointmentsPage } = require('./AppointmentsPage.cjs');
const { generateInsurancePage } = require('./InsurancePage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');

// Healthcare-specific page catalog
const HEALTHCARE_PAGES = {
  home: {
    name: 'Homepage',
    generator: generateHomePage,
    sections: ['hero', 'services-preview', 'stats', 'testimonials', 'insurance-logos', 'cta']
  },
  services: {
    name: 'Services',
    generator: generateServicesPage,
    sections: ['hero', 'service-categories', 'service-cards', 'cta']
  },
  providers: {
    name: 'Our Providers',
    generator: generateProvidersPage,
    sections: ['hero', 'provider-grid', 'credentials', 'cta']
  },
  'patient-portal': {
    name: 'Patient Portal',
    generator: generatePatientPortalPage,
    sections: ['hero', 'portal-features', 'login-form', 'faq']
  },
  appointments: {
    name: 'Appointments',
    generator: generateAppointmentsPage,
    sections: ['hero', 'booking-widget', 'availability', 'preparation']
  },
  insurance: {
    name: 'Insurance & Billing',
    generator: generateInsurancePage,
    sections: ['hero', 'accepted-plans', 'billing-info', 'faq']
  },
  about: {
    name: 'About Us',
    generator: generateAboutPage,
    sections: ['hero', 'mission', 'story', 'certifications', 'stats']
  },
  contact: {
    name: 'Contact',
    generator: generateContactPage,
    sections: ['hero', 'locations', 'hours', 'contact-form', 'map']
  }
};

/**
 * Generate all healthcare pages from fixture data
 */
function generateHealthcarePages(fixture, options = {}) {
  const pages = {};
  const { includedPages = Object.keys(HEALTHCARE_PAGES) } = options;

  for (const pageKey of includedPages) {
    const pageConfig = HEALTHCARE_PAGES[pageKey];
    if (pageConfig) {
      pages[pageKey] = pageConfig.generator(fixture, options);
    }
  }

  return pages;
}

/**
 * Get list of available healthcare pages
 */
function getHealthcarePageCatalog() {
  return Object.entries(HEALTHCARE_PAGES).map(([key, config]) => ({
    id: key,
    name: config.name,
    sections: config.sections
  }));
}

module.exports = {
  HEALTHCARE_PAGES,
  generateHealthcarePages,
  getHealthcarePageCatalog,
  // Individual generators for AI customization
  generateHomePage,
  generateServicesPage,
  generateProvidersPage,
  generatePatientPortalPage,
  generateAppointmentsPage,
  generateInsurancePage,
  generateAboutPage,
  generateContactPage
};
