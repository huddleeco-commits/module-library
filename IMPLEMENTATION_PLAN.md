# BLINK Implementation Plan
## 6-Week Sprint: Testing, Refactoring, Demos & Marketing

**Total Estimated Hours:** 160-200 hours
**Timeline:** 6 weeks (assuming 30-35 hrs/week)
**Start Date:** Week of January 20, 2026

---

## Executive Summary

| Week | Focus | Key Deliverables | Hours |
|------|-------|------------------|-------|
| 1 | Foundation | Sentry, Jest setup, basic tests | 30-35 |
| 2 | Auth Testing | Complete auth test coverage | 25-30 |
| 3 | App.jsx Refactor (Part 1) | Extract 8 components | 30-35 |
| 4 | App.jsx Refactor (Part 2) | Extract remaining + tests | 25-30 |
| 5 | Demo Sites | 3 production demos | 30-35 |
| 6 | Marketing | Landing page + polish | 25-30 |

---

## WEEK 1: Foundation & Quick Wins
### Theme: "Set Up Infrastructure for Success"

#### Day 1-2: Sentry Error Tracking (6-8 hours)

**Task 1.1: Install Sentry packages**
```bash
cd module-assembler-ui
npm install @sentry/node @sentry/react
```
- Estimated: 0.5 hours

**Task 1.2: Create Sentry configuration**
- File: `module-assembler-ui/src/lib/sentry.js`
- Initialize Sentry with DSN
- Configure environment detection
- Set up source maps
- Estimated: 2 hours

**Task 1.3: Integrate Sentry in backend**
- File: `module-assembler-ui/server.cjs`
- Add Sentry.init() at top
- Add error handler middleware
- Wrap async routes with Sentry
- Estimated: 2 hours

**Task 1.4: Integrate Sentry in frontend**
- File: `module-assembler-ui/src/main.jsx`
- Add Sentry.init() with React integration
- Add ErrorBoundary component
- Configure performance monitoring
- Estimated: 1.5 hours

**Task 1.5: Test Sentry integration**
- Trigger test error in dev
- Verify appears in Sentry dashboard
- Test source map resolution
- Estimated: 1 hour

**Deliverable:** Sentry capturing all frontend and backend errors with source maps

---

#### Day 2-3: Jest & Testing Infrastructure (8-10 hours)

**Task 1.6: Install testing packages**
```bash
cd module-assembler-ui
npm install --save-dev jest @types/jest supertest @testing-library/react @testing-library/jest-dom jsdom
```
- Estimated: 0.5 hours

**Task 1.7: Configure Jest for backend**
- File: `module-assembler-ui/jest.config.cjs`
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['server.cjs', 'routes/**/*.cjs', 'services/**/*.cjs'],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 }
  }
};
```
- Estimated: 1 hour

**Task 1.8: Configure Jest for frontend**
- File: `module-assembler-ui/jest.config.frontend.cjs`
- Configure jsdom environment
- Set up React Testing Library
- Configure module aliases
- Estimated: 1.5 hours

**Task 1.9: Create test utilities**
- File: `module-assembler-ui/__tests__/utils/testDb.js` - Database test helpers
- File: `module-assembler-ui/__tests__/utils/testApp.js` - Express app wrapper
- File: `module-assembler-ui/__tests__/utils/mockData.js` - Test fixtures
- Estimated: 2 hours

**Task 1.10: Create first backend test**
- File: `module-assembler-ui/__tests__/health.test.js`
- Test GET /api/health endpoint
- Verify response structure
- Estimated: 1 hour

**Task 1.11: Create first frontend test**
- File: `module-assembler-ui/src/__tests__/App.test.jsx`
- Test App renders without crashing
- Test PasswordGate appears
- Estimated: 1 hour

**Task 1.12: Add npm scripts**
```json
{
  "test": "jest --config jest.config.cjs",
  "test:frontend": "jest --config jest.config.frontend.cjs",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```
- Estimated: 0.5 hours

**Deliverable:** Jest configured, 2 passing tests, coverage reporting working

---

#### Day 4-5: Core API Tests (10-12 hours)

**Task 1.13: Brain API tests**
- File: `module-assembler-ui/__tests__/api/brain.test.js`
- Test GET /api/brain returns valid structure
- Test POST /api/brain updates correctly
- Test PATCH /api/brain/:section works
- Test validation errors return 400
- Estimated: 3 hours

**Task 1.14: Industries/Layouts API tests**
- File: `module-assembler-ui/__tests__/api/industries.test.js`
- Test GET /api/industries returns all industries
- Test GET /api/layouts returns layout options
- Test industry detection function
- Estimated: 2 hours

**Task 1.15: Assembly API tests**
- File: `module-assembler-ui/__tests__/api/assemble.test.js`
- Test POST /api/assemble with minimal config
- Test validation of required fields
- Test error handling for invalid industry
- Mock AI generation (don't call Claude in tests)
- Estimated: 4 hours

**Task 1.16: File operation tests**
- File: `module-assembler-ui/__tests__/api/files.test.js`
- Test POST /api/open-folder
- Test POST /api/open-vscode
- Test file upload handling
- Estimated: 2 hours

**Deliverable:** 15-20 API tests passing, >60% backend coverage

---

### Week 1 Checklist

- [ ] Sentry account created and project configured
- [ ] @sentry/node and @sentry/react installed
- [ ] Backend error tracking working
- [ ] Frontend error boundary working
- [ ] Jest installed and configured
- [ ] Test utilities created
- [ ] 15+ API tests written and passing
- [ ] Coverage report generating
- [ ] CI script added to package.json

**Week 1 Total: 30-35 hours**

---

## WEEK 2: Authentication Test Coverage
### Theme: "Secure the Foundation"

#### Day 1-2: Auth Route Tests (10-12 hours)

**Task 2.1: Registration tests**
- File: `module-assembler-ui/__tests__/auth/register.test.js`
```javascript
describe('POST /api/auth/register', () => {
  test('creates user with valid data')
  test('returns JWT token')
  test('hashes password with bcrypt')
  test('rejects duplicate email')
  test('validates email format')
  test('validates password strength')
  test('handles referral codes')
  test('rate limits requests')
});
```
- Estimated: 4 hours

**Task 2.2: Login tests**
- File: `module-assembler-ui/__tests__/auth/login.test.js`
```javascript
describe('POST /api/auth/login', () => {
  test('returns token for valid credentials')
  test('rejects invalid password')
  test('rejects non-existent user')
  test('rate limits failed attempts')
  test('token contains correct claims')
  test('token expires correctly')
});
```
- Estimated: 3 hours

**Task 2.3: Password reset tests**
- File: `module-assembler-ui/__tests__/auth/password-reset.test.js`
```javascript
describe('Password Reset Flow', () => {
  test('POST /api/auth/forgot-password sends email')
  test('validates reset token')
  test('allows password change with valid token')
  test('rejects expired tokens')
  test('invalidates token after use')
});
```
- Estimated: 3 hours

**Task 2.4: Token validation tests**
- File: `module-assembler-ui/__tests__/auth/token.test.js`
- Test JWT verification
- Test token refresh flow
- Test expired token handling
- Estimated: 2 hours

---

#### Day 3-4: Auth Middleware Tests (8-10 hours)

**Task 2.5: Authentication middleware tests**
- File: `module-assembler-ui/__tests__/middleware/auth.test.js`
```javascript
describe('authenticateToken middleware', () => {
  test('passes with valid token')
  test('rejects missing token')
  test('rejects invalid token')
  test('rejects expired token')
  test('sets req.user correctly')
});
```
- Estimated: 3 hours

**Task 2.6: Rate limiter tests**
- File: `module-assembler-ui/__tests__/middleware/rateLimiter.test.js`
- Test login rate limiting
- Test registration rate limiting
- Test password reset rate limiting
- Test rate limit headers
- Estimated: 3 hours

**Task 2.7: Input validation tests**
- File: `module-assembler-ui/__tests__/middleware/validation.test.js`
- Test email validation
- Test password requirements
- Test sanitization
- Estimated: 2 hours

---

#### Day 5: Integration Tests (6-8 hours)

**Task 2.8: Full auth flow integration test**
- File: `module-assembler-ui/__tests__/integration/authFlow.test.js`
```javascript
describe('Complete Auth Flow', () => {
  test('register → login → access protected route → logout')
  test('register → forgot password → reset → login with new password')
  test('register with referral → verify referral credited')
});
```
- Estimated: 4 hours

**Task 2.9: Admin auth tests**
- File: `module-assembler-ui/__tests__/auth/admin.test.js`
- Test admin login (routes/admin-routes.cjs)
- Test admin role verification
- Test admin-only endpoints
- Estimated: 2 hours

**Task 2.10: Security edge cases**
- Test SQL injection attempts
- Test XSS in user inputs
- Test CSRF protection
- Estimated: 2 hours

---

### Week 2 Checklist

- [ ] Registration tests (8+ tests)
- [ ] Login tests (6+ tests)
- [ ] Password reset tests (5+ tests)
- [ ] Token validation tests (4+ tests)
- [ ] Middleware tests (10+ tests)
- [ ] Integration tests (3+ flows)
- [ ] Admin auth tests (4+ tests)
- [ ] Security edge case tests
- [ ] Auth coverage >80%

**Week 2 Total: 25-30 hours**

---

## WEEK 3: App.jsx Refactor (Part 1)
### Theme: "Divide and Conquer"

### Current State Analysis

App.jsx contains **6,491 lines** with **17 components**:

| Component | Lines | Priority | Complexity |
|-----------|-------|----------|------------|
| App (main) | ~600 | Keep | High |
| PasswordGate | ~90 | Extract | Low |
| DevPasswordModal | ~70 | Extract | Low |
| ChoosePathStep | ~55 | Extract | Low |
| RebuildStep | ~820 | Extract | High |
| QuickStep | ~160 | Extract | Medium |
| UploadAssetsStep | ~340 | Extract | Medium |
| ReferenceStep | ~1040 | Extract | High |
| CustomizeStep | ~690 | Extract | High |
| GeneratingStep | ~95 | Extract | Low |
| CompleteStep | ~130 | Extract | Medium |
| DeployingStep | ~110 | Extract | Low |
| DeployCompleteStep | ~340 | Extract | Medium |
| DeployErrorStep | ~25 | Extract | Low |
| ErrorStep | ~25 | Extract | Low |
| styles object | ~1400 | Extract | Medium |
| genStepStyles | ~100 | Extract | Low |

---

#### Day 1: Setup & Simple Components (8-10 hours)

**Task 3.1: Create component directory structure**
```
module-assembler-ui/src/
├── components/
│   ├── auth/
│   │   ├── PasswordGate.jsx
│   │   └── DevPasswordModal.jsx
│   ├── steps/
│   │   ├── ChoosePathStep.jsx
│   │   ├── QuickStep.jsx
│   │   ├── RebuildStep.jsx
│   │   ├── UploadAssetsStep.jsx
│   │   ├── ReferenceStep.jsx
│   │   ├── CustomizeStep.jsx
│   │   ├── GeneratingStep.jsx
│   │   ├── CompleteStep.jsx
│   │   ├── DeployingStep.jsx
│   │   ├── DeployCompleteStep.jsx
│   │   ├── DeployErrorStep.jsx
│   │   └── ErrorStep.jsx
│   └── ui/
│       └── index.js
├── styles/
│   ├── appStyles.js
│   └── stepStyles.js
├── constants/
│   └── taglines.js
└── App.jsx
```
- Estimated: 1 hour

**Task 3.2: Extract styles to separate files**
- File: `src/styles/appStyles.js` - Main styles object (~1400 lines)
- File: `src/styles/stepStyles.js` - genStepStyles object (~100 lines)
- Update imports in App.jsx
- Estimated: 2 hours

**Task 3.3: Extract constants**
- File: `src/constants/taglines.js` - TAGLINES array
- File: `src/constants/config.js` - API_BASE, other constants
- Estimated: 1 hour

**Task 3.4: Extract PasswordGate component**
- File: `src/components/auth/PasswordGate.jsx`
- Move component + related styles
- Add prop types
- Test in isolation
- Estimated: 1.5 hours

**Task 3.5: Extract DevPasswordModal component**
- File: `src/components/auth/DevPasswordModal.jsx`
- Move component + related styles
- Add prop types
- Test in isolation
- Estimated: 1.5 hours

**Task 3.6: Extract simple step components**
- `ChoosePathStep.jsx` (~55 lines)
- `GeneratingStep.jsx` (~95 lines)
- `DeployErrorStep.jsx` (~25 lines)
- `ErrorStep.jsx` (~25 lines)
- Estimated: 3 hours

---

#### Day 2-3: Medium Complexity Components (10-12 hours)

**Task 3.7: Extract QuickStep component**
- File: `src/components/steps/QuickStep.jsx`
- Move industry selection logic
- Move page selection grid
- Move color/typography pickers
- Prop types: industries, projectData, updateProject, onContinue, onBack
- Estimated: 2.5 hours

**Task 3.8: Extract CompleteStep component**
- File: `src/components/steps/CompleteStep.jsx`
- Move success display
- Move blink counter
- Move action buttons
- Estimated: 2 hours

**Task 3.9: Extract DeployingStep component**
- File: `src/components/steps/DeployingStep.jsx`
- Move deployment progress UI
- Move status indicators
- Estimated: 1.5 hours

**Task 3.10: Extract DeployCompleteStep component**
- File: `src/components/steps/DeployCompleteStep.jsx`
- Move Railway status polling
- Move service status grid
- Move success celebration
- Estimated: 3 hours

**Task 3.11: Extract UploadAssetsStep component**
- File: `src/components/steps/UploadAssetsStep.jsx`
- Move file upload logic
- Move image preview
- Move drag-and-drop handling
- Estimated: 3 hours

---

#### Day 4-5: Complex Components (10-12 hours)

**Task 3.12: Extract RebuildStep component**
- File: `src/components/steps/RebuildStep.jsx`
- ~820 lines - largest component
- Move URL input and scraping
- Move site analysis display
- Move dislike selection
- Move notes input
- Estimated: 4 hours

**Task 3.13: Extract ReferenceStep component**
- File: `src/components/steps/ReferenceStep.jsx`
- ~1040 lines - most complex
- Move reference site input
- Move site fetching logic
- Move design element extraction
- Move preview display
- Estimated: 5 hours

**Task 3.14: Update App.jsx imports**
- Import all extracted components
- Remove extracted code
- Verify all props passed correctly
- Estimated: 2 hours

---

### Week 3 Checklist

- [ ] Directory structure created
- [ ] Styles extracted to separate files
- [ ] Constants extracted
- [ ] 8 components extracted and working
- [ ] All imports updated
- [ ] App.jsx reduced by ~3000 lines
- [ ] No regressions (manual testing)

**Week 3 Total: 30-35 hours**

---

## WEEK 4: App.jsx Refactor (Part 2) + Component Tests
### Theme: "Finish and Verify"

#### Day 1-2: Final Component Extraction (8-10 hours)

**Task 4.1: Extract CustomizeStep component**
- File: `src/components/steps/CustomizeStep.jsx`
- ~690 lines
- Move layout selection
- Move effect toggles
- Move extra details input
- Move preview panel
- Estimated: 4 hours

**Task 4.2: Create shared UI components**
- File: `src/components/ui/Button.jsx`
- File: `src/components/ui/Input.jsx`
- File: `src/components/ui/Card.jsx`
- File: `src/components/ui/Modal.jsx`
- Extract common patterns
- Estimated: 3 hours

**Task 4.3: Create index exports**
- File: `src/components/steps/index.js`
- File: `src/components/auth/index.js`
- File: `src/components/ui/index.js`
- Clean barrel exports
- Estimated: 1 hour

**Task 4.4: Final App.jsx cleanup**
- Remove dead code
- Optimize imports
- Add comments for clarity
- Final line count target: <800 lines
- Estimated: 2 hours

---

#### Day 3-4: Component Tests (10-12 hours)

**Task 4.5: Test PasswordGate component**
- File: `src/components/auth/__tests__/PasswordGate.test.jsx`
- Test renders correctly
- Test password validation
- Test unlock callback
- Test error states
- Estimated: 1.5 hours

**Task 4.6: Test step components**
- File: `src/components/steps/__tests__/ChoosePathStep.test.jsx`
- File: `src/components/steps/__tests__/QuickStep.test.jsx`
- File: `src/components/steps/__tests__/GeneratingStep.test.jsx`
- File: `src/components/steps/__tests__/CompleteStep.test.jsx`
- Test rendering
- Test user interactions
- Test callback props
- Estimated: 5 hours

**Task 4.7: Test complex step components**
- File: `src/components/steps/__tests__/CustomizeStep.test.jsx`
- Test layout selection
- Test form updates
- Test navigation
- Estimated: 3 hours

**Task 4.8: Integration tests for step flow**
- File: `src/__tests__/stepFlow.test.jsx`
- Test complete wizard flow
- Test back/forward navigation
- Test data persistence between steps
- Estimated: 3 hours

---

#### Day 5: Polish & Documentation (5-7 hours)

**Task 4.9: Add PropTypes to all components**
- Define prop shapes
- Add default props
- Add JSDoc comments
- Estimated: 2 hours

**Task 4.10: Update component documentation**
- File: `src/components/README.md`
- Document each component
- Show usage examples
- Document props
- Estimated: 2 hours

**Task 4.11: Performance optimization**
- Add React.memo to pure components
- Add useMemo for expensive calculations
- Add useCallback for stable references
- Estimated: 2 hours

---

### Week 4 Checklist

- [ ] CustomizeStep extracted
- [ ] Shared UI components created
- [ ] App.jsx < 800 lines
- [ ] All 14 components have tests
- [ ] PropTypes added to all components
- [ ] Component documentation complete
- [ ] No regressions (full manual test)
- [ ] Frontend test coverage >60%

**Week 4 Total: 25-30 hours**

---

## WEEK 5: Production Demo Sites
### Theme: "Show, Don't Tell"

#### Day 1: Demo Infrastructure (6-8 hours)

**Task 5.1: Create demo configuration**
- File: `demos/config.js`
```javascript
const demos = {
  restaurant: {
    name: "Tony's BBQ",
    subdomain: 'tonys-bbq',
    industry: 'Restaurant / Food Service',
    description: 'Award-winning BBQ restaurant in Dallas...',
    pages: ['home', 'menu', 'about', 'contact', 'reservations']
  },
  salon: {
    name: "Luxe Hair Studio",
    subdomain: 'luxe-hair',
    industry: 'Salon / Spa',
    description: 'Premium hair salon in Manhattan...',
    pages: ['home', 'services', 'stylists', 'booking', 'gallery']
  },
  fitness: {
    name: "Peak Performance Gym",
    subdomain: 'peak-gym',
    industry: 'Fitness / Gym',
    description: 'High-energy fitness center...',
    pages: ['home', 'classes', 'trainers', 'membership', 'contact']
  }
};
```
- Estimated: 2 hours

**Task 5.2: Create demo generation script**
- File: `scripts/generate-demos.cjs`
- Automate demo site generation
- Configure deployment settings
- Set up demo subdomains
- Estimated: 3 hours

**Task 5.3: Set up demo DNS**
- Configure Cloudflare for demo subdomains
- tonys-bbq.be1st.io
- luxe-hair.be1st.io
- peak-gym.be1st.io
- Estimated: 1 hour

---

#### Day 2-3: Restaurant Demo (8-10 hours)

**Task 5.4: Generate Tony's BBQ site**
- Run generation with restaurant config
- Use industry: 'Restaurant / Food Service'
- Pages: home, menu, about, contact, reservations
- Estimated: 1 hour (generation)

**Task 5.5: Customize restaurant content**
- Add real-looking menu items (15-20 items)
- Add professional food photography (Unsplash)
- Write compelling copy for each section
- Add realistic pricing
- Estimated: 3 hours

**Task 5.6: Configure restaurant features**
- Set up reservation system
- Configure hours of operation
- Add location/map
- Set up contact form
- Estimated: 2 hours

**Task 5.7: Polish restaurant site**
- Fix any layout issues
- Optimize images
- Test all interactions
- Mobile responsiveness check
- Estimated: 2 hours

**Task 5.8: Deploy restaurant demo**
- Deploy to Railway
- Configure DNS
- SSL verification
- Final testing
- Estimated: 1 hour

---

#### Day 3-4: Salon Demo (8-10 hours)

**Task 5.9: Generate Luxe Hair Studio site**
- Run generation with salon config
- Use industry: 'Salon / Spa'
- Pages: home, services, stylists, booking, gallery
- Estimated: 1 hour

**Task 5.10: Customize salon content**
- Add service menu with prices
- Add stylist profiles (4-5 stylists)
- Add portfolio gallery (20+ images)
- Write elegant, luxury copy
- Estimated: 3 hours

**Task 5.11: Configure salon features**
- Set up booking calendar
- Configure service durations
- Add stylist availability
- Set up consultation form
- Estimated: 2 hours

**Task 5.12: Polish salon site**
- Ensure luxury aesthetic
- Check image quality
- Test booking flow
- Mobile responsiveness
- Estimated: 2 hours

**Task 5.13: Deploy salon demo**
- Deploy to Railway
- Configure DNS
- Final testing
- Estimated: 1 hour

---

#### Day 4-5: Fitness Demo (8-10 hours)

**Task 5.14: Generate Peak Performance Gym site**
- Run generation with fitness config
- Use industry: 'Fitness / Gym'
- Pages: home, classes, trainers, membership, contact
- Estimated: 1 hour

**Task 5.15: Customize fitness content**
- Add class schedule (10+ classes)
- Add trainer profiles (5-6 trainers)
- Add membership tiers (3 tiers)
- Write motivational copy
- Estimated: 3 hours

**Task 5.16: Configure fitness features**
- Set up class booking
- Configure membership comparison
- Add trainer bios
- Set up trial signup form
- Estimated: 2 hours

**Task 5.17: Polish fitness site**
- Ensure energetic aesthetic
- Check image quality
- Test all CTAs
- Mobile responsiveness
- Estimated: 2 hours

**Task 5.18: Deploy fitness demo**
- Deploy to Railway
- Configure DNS
- Final testing
- Estimated: 1 hour

---

### Week 5 Checklist

- [ ] Demo infrastructure created
- [ ] Restaurant demo live at tonys-bbq.be1st.io
- [ ] Salon demo live at luxe-hair.be1st.io
- [ ] Fitness demo live at peak-gym.be1st.io
- [ ] All demos have realistic content
- [ ] All demos mobile responsive
- [ ] All demos have working features
- [ ] Screenshots captured for marketing

**Week 5 Total: 30-35 hours**

---

## WEEK 6: Marketing Landing Page
### Theme: "Make the First Impression Count"

#### Day 1-2: Landing Page Structure (10-12 hours)

**Task 6.1: Create landing page project**
```bash
cd module-assembler-ui
mkdir -p src/pages/marketing
```
- File: `src/pages/marketing/LandingPage.jsx`
- Estimated: 0.5 hours

**Task 6.2: Build Hero section**
- Headline: "Build Your Business Website in Minutes, Not Months"
- Subheadline: "AI-powered full-stack generation for any industry"
- CTA: "Try Free Demo" + "Watch Video"
- Background: Animated gradient or demo video
- Estimated: 3 hours

**Task 6.3: Build Social Proof section**
- "Trusted by X businesses"
- Logo cloud (placeholder or real if available)
- Key metrics: "77 modules", "30+ industries", "< 2 min generation"
- Estimated: 2 hours

**Task 6.4: Build Demo Showcase section**
- 3-column grid showing demo sites
- Restaurant | Salon | Fitness
- Screenshots with hover effects
- "View Live Demo" buttons
- Estimated: 2.5 hours

**Task 6.5: Build Features section**
- 6 feature cards with icons
- Full-stack generation
- Admin dashboard included
- AI-powered customization
- One-click deployment
- Industry-specific templates
- No coding required
- Estimated: 2 hours

---

#### Day 3: Value Proposition & How It Works (6-8 hours)

**Task 6.6: Build How It Works section**
- 3-step visual process
- Step 1: Describe your business
- Step 2: AI generates your site
- Step 3: Deploy with one click
- Animated icons/illustrations
- Estimated: 2.5 hours

**Task 6.7: Build Comparison section**
- Table: Blink vs Squarespace vs Custom Dev
- Highlight advantages
- Price comparison
- Time comparison
- Estimated: 2 hours

**Task 6.8: Build Testimonials section**
- 3 testimonial cards (placeholder quotes)
- Profile photos
- Business names
- Star ratings
- Estimated: 1.5 hours

**Task 6.9: Build Pricing section**
- 3 tiers: Free, Pro ($49/mo), Enterprise ($199/mo)
- Feature comparison
- CTA for each tier
- "Most Popular" badge on Pro
- Estimated: 2 hours

---

#### Day 4: Final Sections & Polish (6-8 hours)

**Task 6.10: Build FAQ section**
- 8-10 common questions
- Accordion style
- Questions about pricing, features, support
- Estimated: 1.5 hours

**Task 6.11: Build CTA section**
- Final call-to-action
- "Ready to build your website?"
- Email capture form
- "Get Started Free" button
- Estimated: 1.5 hours

**Task 6.12: Build Footer**
- Logo + tagline
- Navigation links
- Social icons
- Legal links (Privacy, Terms)
- Copyright
- Estimated: 1.5 hours

**Task 6.13: Add animations**
- Scroll reveal animations
- Hover effects
- Smooth scrolling
- Loading states
- Estimated: 2 hours

**Task 6.14: Mobile optimization**
- Responsive breakpoints
- Touch-friendly interactions
- Mobile navigation
- Performance optimization
- Estimated: 2 hours

---

#### Day 5: Launch Prep (5-7 hours)

**Task 6.15: SEO optimization**
- Meta tags (title, description)
- Open Graph tags
- Twitter cards
- Structured data (JSON-LD)
- Estimated: 1.5 hours

**Task 6.16: Performance optimization**
- Image optimization
- Lazy loading
- Bundle size check
- Lighthouse audit (target 90+)
- Estimated: 2 hours

**Task 6.17: Analytics setup**
- Google Analytics 4
- Meta Pixel (optional)
- Conversion tracking
- Event tracking
- Estimated: 1 hour

**Task 6.18: Deploy landing page**
- Deploy to blink.be1st.io
- SSL verification
- Final cross-browser testing
- Final mobile testing
- Estimated: 1 hour

**Task 6.19: Create launch assets**
- Screenshots for social
- Demo video (optional)
- Press kit basics
- Estimated: 1.5 hours

---

### Week 6 Checklist

- [ ] Landing page hero complete
- [ ] All sections implemented
- [ ] Mobile responsive
- [ ] Animations working
- [ ] SEO optimized
- [ ] Performance score >90
- [ ] Analytics tracking
- [ ] Live at blink.be1st.io
- [ ] Launch assets created

**Week 6 Total: 25-30 hours**

---

## POST-SPRINT: Ongoing Maintenance

### Weekly Tasks (2-3 hours/week)
- Monitor Sentry for errors
- Review test coverage reports
- Update demo site content
- Respond to user feedback
- Minor bug fixes

### Monthly Tasks (8-10 hours/month)
- Security updates
- Dependency updates
- Performance review
- Analytics review
- Feature prioritization

---

## SUCCESS METRICS

### Week 1-2 (Testing)
- [ ] 50+ tests passing
- [ ] >60% code coverage
- [ ] Sentry capturing errors
- [ ] Zero critical bugs

### Week 3-4 (Refactoring)
- [ ] App.jsx < 800 lines
- [ ] 14 components extracted
- [ ] All component tests passing
- [ ] No regressions

### Week 5 (Demos)
- [ ] 3 demo sites live
- [ ] All demos mobile responsive
- [ ] All demos have realistic content
- [ ] < 3 second load time

### Week 6 (Marketing)
- [ ] Landing page live
- [ ] Lighthouse score > 90
- [ ] Analytics tracking working
- [ ] Ready for soft launch

---

## RISK MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests break existing functionality | High | Run full test suite before merging |
| Refactoring introduces bugs | High | Manual QA after each extraction |
| Demo sites look unprofessional | Medium | Use professional stock photos |
| Landing page doesn't convert | Medium | A/B test headlines |
| Timeline slips | Medium | Prioritize must-haves over nice-to-haves |

---

## DEPENDENCIES

### External Services Needed
- [ ] Sentry account (free tier)
- [ ] Unsplash for stock photos (free)
- [ ] Google Analytics account (free)
- [ ] Railway account (existing)
- [ ] Cloudflare account (existing)

### Team Requirements
- 1 developer (full-stack)
- ~30-35 hours/week
- 6 weeks duration

---

## APPENDIX: File Inventory

### New Files Created (Week 1-2)
```
module-assembler-ui/
├── jest.config.cjs
├── jest.config.frontend.cjs
├── src/lib/sentry.js
└── __tests__/
    ├── utils/
    │   ├── testDb.js
    │   ├── testApp.js
    │   └── mockData.js
    ├── api/
    │   ├── brain.test.js
    │   ├── industries.test.js
    │   ├── assemble.test.js
    │   └── files.test.js
    ├── auth/
    │   ├── register.test.js
    │   ├── login.test.js
    │   ├── password-reset.test.js
    │   ├── token.test.js
    │   └── admin.test.js
    ├── middleware/
    │   ├── auth.test.js
    │   ├── rateLimiter.test.js
    │   └── validation.test.js
    └── integration/
        └── authFlow.test.js
```

### New Files Created (Week 3-4)
```
module-assembler-ui/src/
├── components/
│   ├── auth/
│   │   ├── PasswordGate.jsx
│   │   ├── DevPasswordModal.jsx
│   │   ├── index.js
│   │   └── __tests__/
│   ├── steps/
│   │   ├── ChoosePathStep.jsx
│   │   ├── QuickStep.jsx
│   │   ├── RebuildStep.jsx
│   │   ├── UploadAssetsStep.jsx
│   │   ├── ReferenceStep.jsx
│   │   ├── CustomizeStep.jsx
│   │   ├── GeneratingStep.jsx
│   │   ├── CompleteStep.jsx
│   │   ├── DeployingStep.jsx
│   │   ├── DeployCompleteStep.jsx
│   │   ├── DeployErrorStep.jsx
│   │   ├── ErrorStep.jsx
│   │   ├── index.js
│   │   └── __tests__/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── index.js
│   └── README.md
├── styles/
│   ├── appStyles.js
│   └── stepStyles.js
└── constants/
    ├── taglines.js
    └── config.js
```

### New Files Created (Week 5-6)
```
demos/
├── config.js
└── assets/
    ├── restaurant/
    ├── salon/
    └── fitness/

scripts/
└── generate-demos.cjs

module-assembler-ui/src/pages/
└── marketing/
    └── LandingPage.jsx
```

---

**Document Version:** 1.0
**Last Updated:** January 15, 2026
**Author:** Implementation Planning Agent
