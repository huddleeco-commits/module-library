/**
 * Test Manifest Generator
 *
 * Creates a standardized test plan from brain.json that can be executed
 * by either ClawdBot (Telegram) or Claude --chrome (CLI)
 *
 * The manifest is browser-agnostic - same format works for both tools.
 */

const fs = require('fs');
const path = require('path');

class TestManifestGenerator {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.brain = this.loadBrain();
  }

  loadBrain() {
    // Try multiple locations for brain.json
    const locations = [
      path.join(this.projectPath, 'brain.json'),
      path.join(this.projectPath, 'frontend', 'brain.json'),
      path.join(this.projectPath, 'full-test', 'brain.json')
    ];

    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        return JSON.parse(fs.readFileSync(loc, 'utf-8'));
      }
    }

    // Return minimal default if not found
    return {
      business: { name: 'Unknown Business' },
      industry: { type: 'general' }
    };
  }

  generate(deployedUrl) {
    const manifest = {
      // Meta
      generatedAt: new Date().toISOString(),
      projectName: this.brain.business?.name || 'Unknown',
      industry: this.brain.industry?.type || 'general',

      // Target
      baseUrl: deployedUrl,

      // What to test
      tests: {
        navigation: this.generateNavigationTests(),
        forms: this.generateFormTests(),
        auth: this.generateAuthTests(),
        responsive: this.generateResponsiveTests(),
        api: this.generateApiTests(deployedUrl)
      },

      // Human-readable instructions (for ClawdBot/Claude)
      instructions: this.generateInstructions(deployedUrl)
    };

    // Ensure output directory exists
    const outputDir = this.projectPath;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save manifest
    const outputPath = path.join(outputDir, 'test-manifest.json');
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

    // Also save human-readable version
    const instructionsPath = path.join(outputDir, 'test-instructions.md');
    fs.writeFileSync(instructionsPath, manifest.instructions);

    return { manifest, outputPath, instructionsPath };
  }

  generateNavigationTests() {
    // Extract pages from frontend/src/pages
    const pagesDir = path.join(this.projectPath, 'frontend', 'src', 'pages');
    const pages = [];

    if (fs.existsSync(pagesDir)) {
      fs.readdirSync(pagesDir).forEach(file => {
        if ((file.endsWith('.jsx') || file.endsWith('.tsx')) && !file.includes('TestDashboard')) {
          const name = file.replace(/\.(jsx|tsx)$/, '').replace(/Page$/, '');
          const route = name.toLowerCase() === 'home' ? '/home' : `/${name.toLowerCase()}`;
          pages.push({ name, route, file });
        }
      });
    }

    // Fallback to common pages if none found
    if (pages.length === 0) {
      pages.push(
        { name: 'Home', route: '/home', file: 'HomePage.jsx' },
        { name: 'About', route: '/about', file: 'AboutPage.jsx' },
        { name: 'Contact', route: '/contact', file: 'ContactPage.jsx' }
      );
    }

    return {
      pages,
      checks: [
        'All navigation links work (no 404s)',
        'Each page loads without console errors',
        'Page titles are correct',
        'Back/forward navigation works',
        'All images load properly'
      ]
    };
  }

  generateFormTests() {
    const forms = [];
    const features = this.brain.business?.features || {};
    const industry = this.brain.industry?.type || 'general';

    // Contact form (almost every site has one)
    forms.push({
      name: 'Contact Form',
      location: '/contact',
      fields: [
        { name: 'name', type: 'text', testValue: 'Test User' },
        { name: 'email', type: 'email', testValue: 'test@example.com' },
        { name: 'phone', type: 'tel', testValue: '555-123-4567' },
        { name: 'message', type: 'textarea', testValue: 'This is a test message from Blink automated testing.' }
      ],
      submitButton: 'Send|Submit|Contact Us|Get in Touch',
      expectedResult: 'success message or thank you confirmation'
    });

    // Booking form (if enabled or service industry)
    const bookingIndustries = ['spa-salon', 'barbershop', 'dental', 'healthcare', 'fitness', 'yoga', 'photography'];
    if (features.booking || features.reservations || bookingIndustries.includes(industry)) {
      forms.push({
        name: 'Booking/Appointment Form',
        location: '/book OR /booking OR /appointments OR /schedule',
        fields: [
          { name: 'name', type: 'text', testValue: 'Test Booking' },
          { name: 'email', type: 'email', testValue: 'booking@test.com' },
          { name: 'phone', type: 'tel', testValue: '555-987-6543' },
          { name: 'date', type: 'date', testValue: 'tomorrow or next available' },
          { name: 'time', type: 'time', testValue: '2:00 PM or 14:00' },
          { name: 'service', type: 'select', testValue: 'first available option' }
        ],
        submitButton: 'Book|Reserve|Schedule|Confirm',
        expectedResult: 'booking confirmation message'
      });
    }

    // Order/Cart flow (restaurant/retail)
    const orderIndustries = ['restaurant', 'pizza', 'cafe', 'bakery', 'retail', 'ecommerce'];
    if (features.onlineOrdering || features.cart || orderIndustries.includes(industry)) {
      forms.push({
        name: 'Order/Cart Flow',
        location: '/menu OR /products OR /shop',
        steps: [
          'Find an item/product on the page',
          'Click "Add to Cart" or similar button',
          'Verify cart shows item added (cart icon updates or modal appears)',
          'Navigate to cart page',
          'Verify item appears in cart with correct price',
          'Click checkout/proceed button',
          'Fill checkout form with test data',
          'Submit order (or stop before payment if real payment)'
        ],
        expectedResult: 'cart updates correctly, checkout flow works'
      });
    }

    // Newsletter signup (common)
    forms.push({
      name: 'Newsletter/Email Signup',
      location: 'footer or popup on any page',
      fields: [
        { name: 'email', type: 'email', testValue: 'newsletter@test.com' }
      ],
      submitButton: 'Subscribe|Sign Up|Join|Submit',
      expectedResult: 'success message or thank you',
      optional: true
    });

    return forms;
  }

  generateAuthTests() {
    const features = this.brain.business?.features || {};

    if (!features.auth && !features.accounts && !features.login) {
      return { enabled: false, reason: 'No auth features detected' };
    }

    return {
      enabled: true,
      tests: [
        {
          name: 'Registration Flow',
          location: '/register OR /signup OR /create-account',
          fields: [
            { name: 'email', testValue: 'newuser@blinktest.com' },
            { name: 'password', testValue: 'TestPass123!' },
            { name: 'confirm password', testValue: 'TestPass123!' }
          ],
          expectedResult: 'account created, redirect to dashboard or confirmation'
        },
        {
          name: 'Login with Valid Credentials',
          location: '/login OR /signin',
          credentials: { email: 'test@test.com', password: 'testpass123' },
          expectedResult: 'redirect to dashboard or account page'
        },
        {
          name: 'Login with Invalid Credentials',
          location: '/login OR /signin',
          credentials: { email: 'wrong@test.com', password: 'wrongpass' },
          expectedResult: 'error message displayed, no redirect'
        },
        {
          name: 'Logout',
          action: 'Find and click logout button/link',
          expectedResult: 'redirect to home or login page, session cleared'
        }
      ]
    };
  }

  generateResponsiveTests() {
    return {
      breakpoints: [
        { name: 'Mobile', width: 375, height: 812, device: 'iPhone 12/13' },
        { name: 'Tablet', width: 768, height: 1024, device: 'iPad' },
        { name: 'Desktop', width: 1440, height: 900, device: 'Laptop' }
      ],
      checks: [
        'Navigation is accessible (hamburger menu on mobile)',
        'Text is readable at all sizes (not too small on mobile)',
        'Buttons are tappable (minimum 44px touch target)',
        'No horizontal scroll on any page',
        'Images scale properly and don\'t overflow',
        'Forms are usable on mobile (inputs not too small)',
        'Modals/popups fit on screen'
      ],
      screenshotPages: ['/home', '/about', '/contact']
    };
  }

  generateApiTests(baseUrl) {
    // Determine API URL
    let apiBase;
    if (baseUrl.includes('.be1st.io')) {
      // Production: API is on subdomain
      apiBase = baseUrl.replace('https://', 'https://api.').replace('http://', 'http://api.');
    } else if (baseUrl.includes('localhost')) {
      // Local: API is on different port
      apiBase = 'http://localhost:3001/api';
    } else {
      // Default: API is at /api path
      apiBase = `${baseUrl.replace(/\/$/, '')}/api`;
    }

    const endpoints = [
      { method: 'GET', path: '/health', expectedStatus: 200, description: 'Health check' },
      { method: 'GET', path: '/brain', expectedStatus: 200, description: 'Site configuration' }
    ];

    // Add industry-specific endpoints
    const industry = this.brain.industry?.type;
    if (['restaurant', 'pizza', 'cafe', 'bakery'].includes(industry)) {
      endpoints.push({ method: 'GET', path: '/menu', expectedStatus: 200, description: 'Menu items' });
    }
    if (['spa-salon', 'dental', 'healthcare', 'fitness'].includes(industry)) {
      endpoints.push({ method: 'GET', path: '/services', expectedStatus: 200, description: 'Services list' });
    }

    return { baseUrl: apiBase, endpoints };
  }

  generateInstructions(deployedUrl) {
    const projectName = this.brain.business?.name || 'Unknown';
    const industry = this.brain.industry?.type || 'general';
    const pages = this.generateNavigationTests().pages;
    const forms = this.generateFormTests();
    const auth = this.generateAuthTests();
    const responsive = this.generateResponsiveTests();
    const api = this.generateApiTests(deployedUrl);

    return `# Blink Automated Test Instructions

## Project: ${projectName}
## URL: ${deployedUrl}
## Industry: ${industry}
## Generated: ${new Date().toISOString()}

---

## STEP 1: Navigation Testing

Open ${deployedUrl} in your browser.

### Pages to Test:
${pages.map((p, i) => `${i + 1}. Navigate to **${p.name}** (${deployedUrl}${p.route === '/' ? '' : p.route})
   - Verify page loads without errors
   - Check for console errors (open DevTools > Console)
   - Verify all images load
   - Check page title is appropriate`).join('\n\n')}

### Navigation Checklist:
- [ ] All nav links work (no 404 errors)
- [ ] Logo links back to home
- [ ] Footer links work
- [ ] No broken images (no placeholder icons)
- [ ] No JavaScript console errors

---

## STEP 2: Form Testing

${forms.map((form, i) => `
### ${i + 1}. ${form.name}${form.optional ? ' (Optional - may not exist)' : ''}
**Location:** ${form.location}

${form.fields ? `**Fill in these fields:**
${form.fields.map(f => `- ${f.name}: \`${f.testValue}\``).join('\n')}` : ''}

${form.steps ? `**Steps:**
${form.steps.map((s, j) => `${j + 1}. ${s}`).join('\n')}` : ''}

**Submit Button:** Look for button with text: ${form.submitButton}
**Expected Result:** ${form.expectedResult}
`).join('\n---\n')}

---

## STEP 3: Responsive Testing

Test the site at these screen sizes:

${responsive.breakpoints.map(bp => `### ${bp.name} (${bp.width}x${bp.height})
- Resize browser OR use DevTools device mode
- Device: ${bp.device}

**Check:**
${responsive.checks.map(c => `- [ ] ${c}`).join('\n')}

**Take screenshot of:** ${responsive.screenshotPages.join(', ')}
`).join('\n')}

---

${auth.enabled ? `## STEP 4: Authentication Testing

${auth.tests.map((test, i) => `### ${i + 1}. ${test.name}
**Location:** ${test.location || 'N/A'}
${test.fields ? `**Fields:** ${test.fields.map(f => `${f.name}=${f.testValue}`).join(', ')}` : ''}
${test.credentials ? `**Credentials:** ${test.credentials.email} / ${test.credentials.password}` : ''}
${test.action ? `**Action:** ${test.action}` : ''}
**Expected:** ${test.expectedResult}
`).join('\n')}

---

` : ''}
## STEP 5: API Health Check (Optional)

Test these endpoints:

${api.endpoints.map(ep => `- ${ep.method} ${api.baseUrl}${ep.path}
  Expected: ${ep.expectedStatus} OK
  Purpose: ${ep.description}`).join('\n\n')}

---

## STEP 6: Report Results

After testing, create a results report in this JSON format:

\`\`\`json
{
  "testedAt": "${new Date().toISOString()}",
  "testedBy": "ClawdBot OR Claude --chrome",
  "url": "${deployedUrl}",
  "results": {
    "navigation": {
      "passed": 0,
      "failed": 0,
      "issues": []
    },
    "forms": {
      "passed": 0,
      "failed": 0,
      "issues": []
    },
    "responsive": {
      "passed": 0,
      "failed": 0,
      "issues": []
    },
    "auth": {
      "passed": 0,
      "failed": 0,
      "issues": []
    },
    "api": {
      "passed": 0,
      "failed": 0,
      "issues": []
    }
  },
  "screenshots": [
    "description of each screenshot taken"
  ],
  "consoleErrors": [
    "any JavaScript errors found in console"
  ],
  "recommendations": [
    "suggested fixes for any issues found"
  ],
  "overallStatus": "PASS or FAIL"
}
\`\`\`

---

## END OF TEST INSTRUCTIONS

**Quick Summary:**
1. Test all ${pages.length} pages load correctly
2. Test ${forms.length} form(s)
3. Test 3 responsive breakpoints
${auth.enabled ? '4. Test auth flows\n' : ''}5. Report results as JSON
`;
  }
}

module.exports = { TestManifestGenerator };
