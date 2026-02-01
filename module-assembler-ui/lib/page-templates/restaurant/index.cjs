/**
 * Restaurant Industry Templates
 *
 * Complete page generators for restaurant businesses including:
 * - Pizza / Pizzeria
 * - Steakhouse / Fine Dining
 * - Coffee Shop / Cafe
 * - Farm-to-Table Restaurant
 * - Bakery
 *
 * Each page is modular - AI Visual Freedom can customize sections.
 */

const { generateHomePage } = require('./HomePage.cjs');
const { generateMenuPage } = require('./MenuPage.cjs');
const { generateAboutPage } = require('./AboutPage.cjs');
const { generateContactPage } = require('./ContactPage.cjs');
const { generateReservationsPage } = require('./ReservationsPage.cjs');
const { generateCateringPage } = require('./CateringPage.cjs');
const { generateGalleryPage } = require('./GalleryPage.cjs');

// Page configurations for restaurant industry
const RESTAURANT_PAGES = {
  home: {
    name: 'Homepage',
    generator: generateHomePage,
    sections: ['hero', 'specials', 'menu-preview', 'story-teaser', 'reviews', 'hours-location', 'cta']
  },
  menu: {
    name: 'Menu',
    generator: generateMenuPage,
    sections: ['hero', 'category-tabs', 'menu-items', 'dietary-info', 'cta']
  },
  about: {
    name: 'About / Our Story',
    generator: generateAboutPage,
    sections: ['hero', 'story', 'chef', 'team', 'values', 'sourcing', 'cta']
  },
  contact: {
    name: 'Contact & Location',
    generator: generateContactPage,
    sections: ['hero', 'location-map', 'hours', 'contact-form', 'parking']
  },
  reservations: {
    name: 'Reservations',
    generator: generateReservationsPage,
    sections: ['hero', 'booking-widget', 'private-dining', 'policies', 'cta']
  },
  catering: {
    name: 'Catering',
    generator: generateCateringPage,
    sections: ['hero', 'packages', 'menu-options', 'inquiry-form', 'testimonials']
  },
  gallery: {
    name: 'Gallery',
    generator: generateGalleryPage,
    sections: ['hero', 'food-gallery', 'ambiance-gallery', 'events']
  }
};

/**
 * Generate all pages for a restaurant
 */
function generateRestaurantSite(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = theme?.colors || getDefaultColors(business.industry);
  const layout = options.layout || 'warm-inviting';

  console.log(`\n🍽️ Generating Restaurant Site: ${business.name}`);
  console.log(`   Type: ${business.industry}`);
  console.log(`   Layout: ${layout}`);

  const pages = {};
  const pagesToGenerate = options.pages || Object.keys(RESTAURANT_PAGES);

  for (const pageId of pagesToGenerate) {
    const pageConfig = RESTAURANT_PAGES[pageId];
    if (pageConfig) {
      console.log(`   📄 Generating ${pageConfig.name}...`);
      pages[`${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] = pageConfig.generator(fixture, { layout, colors });
    }
  }

  // Generate App.jsx
  pages['App'] = generateAppJsx(fixture, Object.keys(pages), colors);

  return {
    pages,
    colors,
    layout,
    routes: generateRoutes(pagesToGenerate)
  };
}

/**
 * Get default colors based on restaurant type
 */
function getDefaultColors(industry) {
  const colorSchemes = {
    'pizza-restaurant': { primary: '#DC2626', secondary: '#F97316', accent: '#FBBF24', background: '#FFFBEB', text: '#1F2937' },
    'steakhouse': { primary: '#7C2D12', secondary: '#991B1B', accent: '#B91C1C', background: '#1C1917', text: '#FAFAF9' },
    'coffee-cafe': { primary: '#78350F', secondary: '#92400E', accent: '#F59E0B', background: '#FFFBEB', text: '#1F2937' },
    'restaurant': { primary: '#166534', secondary: '#15803D', accent: '#22C55E', background: '#F0FDF4', text: '#1F2937' },
    'bakery': { primary: '#92400E', secondary: '#B45309', accent: '#FBBF24', background: '#FFFBEB', text: '#1F2937' }
  };
  return colorSchemes[industry] || colorSchemes['restaurant'];
}

/**
 * Generate App.jsx with routing
 */
function generateAppJsx(fixture, pageNames, colors) {
  const { business } = fixture;
  const imports = pageNames
    .filter(p => p !== 'App')
    .map(p => `import ${p} from './pages/${p}';`)
    .join('\n');

  const routes = pageNames
    .filter(p => p !== 'App')
    .map(p => {
      const path = p === 'HomePage' ? '/' : `/${p.replace('Page', '').toLowerCase()}`;
      return `          <Route path="${path}" element={<${p} />} />`;
    })
    .join('\n');

  return `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
${imports}

const COLORS = ${JSON.stringify(colors, null, 2)};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
        {/* Navigation */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Link to="/" style={{
              fontWeight: '700',
              fontSize: '24px',
              color: COLORS.primary,
              textDecoration: 'none'
            }}>
              ${business.name}
            </Link>

            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link to="/menu" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Menu</Link>
              <Link to="/about" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>About</Link>
              <Link to="/gallery" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Gallery</Link>
              <Link to="/contact" style={{ color: COLORS.text, textDecoration: 'none', fontWeight: '500' }}>Contact</Link>
              <Link to="/reservations" style={{
                backgroundColor: COLORS.primary,
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                Reserve Table
              </Link>
            </nav>
          </div>
        </header>

        <Routes>
${routes}
        </Routes>

        {/* Footer */}
        <footer style={{
          backgroundColor: COLORS.text,
          color: 'white',
          padding: '60px 20px 40px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px'
          }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>${business.name}</h3>
              <p style={{ opacity: 0.7, lineHeight: 1.6 }}>${business.tagline || 'Delicious food, memorable experiences'}</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Hours</h4>
              <p style={{ opacity: 0.7 }}>Mon-Thu: 11am - 10pm</p>
              <p style={{ opacity: 0.7 }}>Fri-Sat: 11am - 11pm</p>
              <p style={{ opacity: 0.7 }}>Sun: 10am - 9pm</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Contact</h4>
              <p style={{ opacity: 0.7 }}>${business.address || '123 Main Street'}</p>
              <p style={{ opacity: 0.7 }}>${business.phone || '(555) 123-4567'}</p>
              <p style={{ opacity: 0.7 }}>${business.email || 'hello@restaurant.com'}</p>
            </div>
          </div>
          <div style={{ maxWidth: '1200px', margin: '40px auto 0', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p style={{ opacity: 0.5, fontSize: '14px' }}>© ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
`;
}

/**
 * Generate routes config
 */
function generateRoutes(pageIds) {
  return pageIds.map(id => ({
    path: id === 'home' ? '/' : `/${id}`,
    component: `${id.charAt(0).toUpperCase() + id.slice(1)}Page`
  }));
}

module.exports = {
  RESTAURANT_PAGES,
  generateRestaurantSite,
  generateHomePage,
  generateMenuPage,
  generateAboutPage,
  generateContactPage,
  generateReservationsPage,
  generateCateringPage,
  generateGalleryPage,
  getDefaultColors
};
