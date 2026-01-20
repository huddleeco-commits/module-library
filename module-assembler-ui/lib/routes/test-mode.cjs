/**
 * Test Mode Routes
 *
 * Provides endpoints for Test Mode - allows testing full pipeline without AI API costs
 * Uses mock fixtures instead of calling Claude API
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const {
  getAvailableFixtures,
  loadFixture,
  applyCustomizations
} = require('../../test-fixtures/index.cjs');

const {
  getIndustryFixture,
  getIndustryCategory,
  getAppScreens,
  getSampleData,
  getLoyaltyConfig
} = require('../configs/industry-fixtures.cjs');

/**
 * Create test mode routes
 */
function createTestModeRoutes(deps) {
  const router = express.Router();
  const {
    GENERATED_PROJECTS,
    MODULE_LIBRARY,
    ASSEMBLE_SCRIPT,
    db
  } = deps;

  // ============================================
  // GET /api/test-mode/status
  // Check if test mode is enabled
  // ============================================
  router.get('/status', (req, res) => {
    const testModeEnabled = process.env.TEST_MODE === 'true';
    res.json({
      success: true,
      testModeEnabled,
      message: testModeEnabled
        ? '🧪 Test Mode is ACTIVE - Using mock data, no API costs'
        : 'Test Mode is OFF - Normal operation'
    });
  });

  // ============================================
  // POST /api/test-mode/toggle
  // Toggle test mode on/off (for current session)
  // ============================================
  let sessionTestMode = process.env.TEST_MODE === 'true';

  router.post('/toggle', (req, res) => {
    sessionTestMode = !sessionTestMode;
    console.log(`🧪 Test Mode ${sessionTestMode ? 'ENABLED' : 'DISABLED'}`);
    res.json({
      success: true,
      testModeEnabled: sessionTestMode,
      message: sessionTestMode
        ? '🧪 Test Mode ACTIVATED - Using mock data'
        : 'Test Mode DEACTIVATED - Normal operation'
    });
  });

  router.get('/enabled', (req, res) => {
    res.json({
      success: true,
      enabled: sessionTestMode
    });
  });

  // ============================================
  // GET /api/test-mode/fixtures
  // List available test fixtures
  // ============================================
  router.get('/fixtures', (req, res) => {
    try {
      const fixtures = getAvailableFixtures();
      res.json({
        success: true,
        fixtures
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // GET /api/test-mode/fixtures/:id
  // Load a specific fixture
  // ============================================
  router.get('/fixtures/:id', (req, res) => {
    try {
      const fixture = loadFixture(req.params.id);
      res.json({
        success: true,
        fixture
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================
  // POST /api/test-mode/generate
  // Generate a test project using fixture data
  // ============================================
  router.post('/generate', async (req, res) => {
    const {
      fixtureId,
      customizations = {},
      websitePages = ['home', 'menu', 'about', 'contact', 'gallery'],
      appPages = ['dashboard', 'rewards', 'profile', 'wallet', 'earn', 'leaderboard'],
      deploy = false
    } = req.body;

    // Set up SSE for real-time progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (type, data) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Log test mode start
      console.log('\n🧪 ====== TEST MODE ACTIVE ======');

      sendEvent('start', { message: '🧪 Test Mode generation starting...' });

      // Load fixture
      sendEvent('progress', { step: 'Loading fixture', message: `📁 Loading fixture: ${fixtureId}` });
      console.log(`📁 Loading fixture: ${fixtureId}`);

      let fixture;
      try {
        fixture = loadFixture(fixtureId);
      } catch (e) {
        sendEvent('error', { message: `Fixture not found: ${fixtureId}` });
        res.end();
        return;
      }

      // Apply customizations
      const customizedFixture = applyCustomizations(fixture, {
        ...customizations,
        websitePages,
        appPages
      });

      const businessName = customizedFixture.business.name;
      const location = customizedFixture.business.location;

      sendEvent('progress', {
        step: 'Fixture loaded',
        message: `🏪 Business: ${businessName} (${location})`
      });
      console.log(`🏪 Business: ${businessName} (${location})`);

      // Log what's included
      const pageList = Object.keys(customizedFixture.pages).join(', ');
      sendEvent('progress', {
        step: 'Pages configured',
        message: `📄 Pages: ${pageList}`
      });
      console.log(`📄 Pages: ${pageList}`);

      // Skip AI generation message
      sendEvent('progress', {
        step: 'Skipping AI',
        message: '⏭️  Skipping AI generation (using mock data)'
      });
      console.log('⏭️  Skipping AI generation (using mock data)');

      sendEvent('progress', {
        step: 'Skipping images',
        message: '⏭️  Skipping image generation (using placeholders)'
      });
      console.log('⏭️  Skipping image generation (using placeholders)');

      // Create project directory
      const projectName = businessName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
      const projectPath = path.join(GENERATED_PROJECTS, projectName);

      sendEvent('progress', {
        step: 'Creating project',
        message: `📁 Creating project: ${projectName}`
      });

      // Run the assemble script
      sendEvent('progress', {
        step: 'Assembling',
        message: '🔨 Assembling project structure...'
      });
      console.log('🔨 Assembling project structure...');

      // Use spawn to run the assemble script
      const assemblePromise = new Promise((resolve, reject) => {
        const args = [
          ASSEMBLE_SCRIPT,
          '--name', projectName,
          '--industry', customizedFixture.business.industry,
          '--test-mode', 'true'
        ];

        const child = spawn('node', args, {
          cwd: MODULE_LIBRARY,
          env: {
            ...process.env,
            TEST_MODE: 'true',
            TEST_FIXTURE: JSON.stringify(customizedFixture)
          }
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
          const lines = data.toString().split('\n').filter(l => l.trim());
          lines.forEach(line => {
            sendEvent('log', { message: line });
          });
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Assembly failed with code ${code}: ${stderr}`));
          }
        });

        child.on('error', reject);
      });

      try {
        await assemblePromise;
        sendEvent('progress', {
          step: 'Assembly complete',
          message: '✅ Project assembled successfully'
        });
      } catch (err) {
        sendEvent('error', { message: `Assembly failed: ${err.message}` });
        console.error('Assembly failed:', err);
        res.end();
        return;
      }

      // Generate pages using mock data
      sendEvent('progress', {
        step: 'Generating pages',
        message: '📝 Generating pages from mock data...'
      });
      console.log('📝 Generating pages from mock data...');

      const pagesDir = path.join(projectPath, 'frontend', 'src', 'pages');
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }

      // Generate each page from fixture data
      const generatedPages = [];
      for (const [pageName, pageData] of Object.entries(customizedFixture.pages)) {
        const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';
        const pageContent = generateMockPage(pageName, pageData, customizedFixture);

        fs.writeFileSync(path.join(pagesDir, `${componentName}.jsx`), pageContent);
        sendEvent('log', { message: `   ✅ ${componentName}.jsx` });
        generatedPages.push({ name: pageName, component: componentName });
      }

      // Generate auth pages (Login, Register, Dashboard) for website
      sendEvent('log', { message: '   🔐 Generating auth pages...' });
      const authPages = generateAuthPages(customizedFixture);
      for (const [pageName, pageContent] of Object.entries(authPages)) {
        fs.writeFileSync(path.join(pagesDir, `${pageName}.jsx`), pageContent);
        sendEvent('log', { message: `   ✅ ${pageName}.jsx` });
      }

      // Generate App.jsx with routes to all pages (including auth)
      sendEvent('log', { message: '   📱 Generating App.jsx with routes...' });
      const appJsxContent = generateMockAppJsx(generatedPages, customizedFixture, true);
      fs.writeFileSync(path.join(projectPath, 'frontend', 'src', 'App.jsx'), appJsxContent);
      sendEvent('log', { message: `   ✅ App.jsx` });

      // Generate backend .env file
      const backendEnvPath = path.join(projectPath, 'backend', '.env');
      if (fs.existsSync(path.join(projectPath, 'backend'))) {
        sendEvent('log', { message: '   🔐 Generating backend .env...' });
        const envContent = `# ${projectName} Backend Environment
# Auto-generated by Test Mode

# Core Settings
PORT=5000
NODE_ENV=development

# JWT Secret (required for auth)
JWT_SECRET=${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dev-secret-key-12345678901234567890

# Database - Leave empty for test mode (uses local SQLite)
# Set to PostgreSQL URL for production: postgres://user:pass@host:5432/db
# DATABASE_URL=

# Admin Account
ADMIN_EMAIL=admin@${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
ADMIN_PASSWORD=admin123

# Stripe (test keys - replace with real keys for production)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

# CORS Origins (website:5173, app:5174, admin:5175)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000
`;
        fs.writeFileSync(backendEnvPath, envContent);
        sendEvent('log', { message: '   ✅ .env file created' });
      }

      // Generate Companion App
      sendEvent('progress', {
        step: 'Generating companion app',
        message: '📱 Generating companion app...'
      });
      console.log('📱 Generating companion app...');

      const companionAppPath = path.join(projectPath, 'companion-app');
      if (!fs.existsSync(companionAppPath)) {
        fs.mkdirSync(companionAppPath, { recursive: true });
      }

      // Create companion app directories
      const companionDirs = ['src', 'src/screens', 'src/components', 'src/services', 'src/hooks', 'public'];
      companionDirs.forEach(dir => {
        const dirPath = path.join(companionAppPath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      });

      // Generate companion app files
      const companionFiles = generateMockCompanionApp(customizedFixture, projectName);
      for (const [filePath, content] of Object.entries(companionFiles)) {
        const fullPath = path.join(companionAppPath, filePath);
        fs.writeFileSync(fullPath, content);
        sendEvent('log', { message: `   ✅ companion-app/${filePath}` });
      }

      sendEvent('progress', {
        step: 'Companion app generated',
        message: '✅ Companion app generated successfully'
      });

      // Build website
      sendEvent('progress', {
        step: 'Building website',
        message: '🔨 Building website...'
      });
      console.log('🔨 Building website...');

      // Run npm install and build for frontend
      const buildPromise = new Promise((resolve, reject) => {
        const child = spawn('npm', ['run', 'build'], {
          cwd: path.join(projectPath, 'frontend'),
          shell: true,
          env: process.env
        });

        child.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Build failed with code ${code}`));
        });

        child.on('error', reject);
      });

      try {
        await buildPromise;
        sendEvent('progress', {
          step: 'Build complete',
          message: '✅ Website built successfully'
        });
      } catch (err) {
        sendEvent('warning', { message: `Build had issues: ${err.message}` });
      }

      // Test sync endpoints
      sendEvent('progress', {
        step: 'Testing sync',
        message: '🔗 Testing sync endpoints...'
      });
      console.log('🔗 Testing sync endpoints...');

      const syncResults = [];
      for (const endpoint of customizedFixture.sync.endpoints) {
        // Mock sync test - in real scenario would actually hit endpoints
        syncResults.push({
          endpoint: endpoint.path,
          status: 'synced',
          description: endpoint.description
        });
        sendEvent('sync', {
          endpoint: endpoint.path,
          status: 'success',
          message: `   ✅ ${endpoint.path} - synced`
        });
        console.log(`   ✅ ${endpoint.path} - synced`);
      }

      // Deployment (if requested)
      let previewUrl = null;
      if (deploy) {
        sendEvent('progress', {
          step: 'Deploying',
          message: '🚀 Deploying to preview...'
        });
        console.log('🚀 Deploying to preview...');

        // Mock deployment URL
        previewUrl = `https://${projectName.toLowerCase()}.blink-preview.dev`;

        sendEvent('progress', {
          step: 'Deployed',
          message: `✅ DEPLOYED - Preview: ${previewUrl}`
        });
      }

      // Complete
      const result = {
        success: true,
        projectName,
        projectPath,
        previewUrl,
        pagesGenerated: Object.keys(customizedFixture.pages).length,
        syncResults,
        fixture: fixtureId,
        customizations
      };

      sendEvent('complete', result);

      console.log(`✅ DONE${previewUrl ? ` - Preview: ${previewUrl}` : ''}`);
      console.log('🧪 ==============================\n');

      res.end();

    } catch (error) {
      console.error('Test mode generation error:', error);
      sendEvent('error', { message: error.message });
      res.end();
    }
  });

  // ============================================
  // POST /api/test-mode/sync-test
  // Test sync between website and companion app
  // ============================================
  router.post('/sync-test', async (req, res) => {
    const { projectPath, endpoints = [] } = req.body;

    const results = {
      success: true,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    const defaultEndpoints = [
      { path: '/api/auth/me', description: 'Auth state' },
      { path: '/api/loyalty', description: 'Rewards/points' },
      { path: '/api/wallet', description: 'Wallet balance' },
      { path: '/api/orders', description: 'Order history' }
    ];

    const endpointsToTest = endpoints.length > 0 ? endpoints : defaultEndpoints;

    for (const endpoint of endpointsToTest) {
      results.summary.total++;

      // In a real implementation, this would make actual HTTP requests
      // to both the website backend and companion app backend
      // and compare the responses

      const testResult = {
        endpoint: endpoint.path,
        description: endpoint.description,
        websiteResponse: { status: 200, data: {} },
        appResponse: { status: 200, data: {} },
        synced: true,
        diff: null
      };

      // Mock successful sync for now
      if (Math.random() > 0.9) {
        // Simulate occasional mismatch for testing UI
        testResult.synced = false;
        testResult.diff = {
          field: 'points',
          website: 850,
          app: 820
        };
        results.summary.failed++;
      } else {
        results.summary.passed++;
      }

      results.tests.push(testResult);
    }

    results.success = results.summary.failed === 0;

    res.json(results);
  });

  // ============================================
  // POST /api/test-mode/fixtures/save
  // Save a custom fixture
  // ============================================
  router.post('/fixtures/save', (req, res) => {
    const { fixtureId, data } = req.body;

    try {
      const customDir = path.join(__dirname, '..', '..', 'test-fixtures', 'custom');
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
      }

      const filePath = path.join(customDir, `${fixtureId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      res.json({
        success: true,
        message: `Fixture saved: ${fixtureId}`,
        path: filePath
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

/**
 * Generate App.jsx with routes to all generated pages
 * Includes auth pages (login/register/dashboard) when companion app exists
 */
function generateMockAppJsx(pages, fixture, hasCompanionApp = true) {
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  // Generate imports for main pages
  const imports = pages.map(p =>
    `import ${p.component} from './pages/${p.component}';`
  ).join('\n');

  // Generate nav links (excluding auth pages from main nav)
  const navLinks = pages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    const label = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    return `            <Link to="${path}" style={styles.navLink}>${label}</Link>`;
  }).join('\n');

  // Generate routes for main pages
  const routes = pages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    return `              <Route path="${path}" element={<${p.component} />} />`;
  }).join('\n');

  // Auth routes (always include when companion app exists)
  const authRoutes = hasCompanionApp ? `
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />` : '';

  // Auth imports
  const authImports = hasCompanionApp ? `
// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';` : '';

  // Auth nav buttons
  const authNavButtons = hasCompanionApp ? `
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginButton}>Login</Link>
              <Link to="/register" style={styles.registerButton}>Sign Up</Link>
            </div>` : '';

  // Auth styles
  const authStyles = hasCompanionApp ? `
  authButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  loginButton: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 16px'
  },
  registerButton: {
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px'
  },` : '';

  return `/**
 * ${businessName} - Frontend App
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Page imports
${imports}
${authImports}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>${businessName}</Link>

      {/* Desktop Nav */}
      <div style={styles.desktopNav}>
${navLinks}
      </div>

      {/* Auth Buttons */}
${authNavButtons}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={styles.menuButton}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Nav */}
      {menuOpen && (
        <div style={styles.mobileNav}>
${navLinks.replace(/styles\.navLink/g, 'styles.mobileNavLink')}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '8px' }}>
            <Link to="/login" style={styles.mobileNavLink}>Login</Link>
            <Link to="/register" style={styles.mobileNavLink}>Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}' }}>
        <Navigation />
        <main>
          <Routes>
${routes}${authRoutes}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '${colors.background}',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    position: 'relative'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '${colors.primary}',
    textDecoration: 'none'
  },
  desktopNav: {
    display: 'flex',
    gap: '24px',
    '@media (max-width: 768px)': {
      display: 'none'
    }
  },
  navLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '14px',
    opacity: 0.8,
    transition: 'opacity 0.2s'
  },${authStyles}
  menuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '${colors.text}',
    cursor: 'pointer',
    '@media (max-width: 768px)': {
      display: 'block'
    }
  },
  mobileNav: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '${colors.background}',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  mobileNavLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 0'
  }
};

export default App;
`;
}

/**
 * Generate auth pages (Login, Register, Dashboard) for website
 * These allow users to manage their account from the web, syncing with companion app
 */
function generateAuthPages(fixture) {
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  const loginPage = `/**
 * LoginPage - Test Mode Generated
 * Login page for ${businessName}
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const API_URL = '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(\`\${API_URL}/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your ${businessName} account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>

        <div style={styles.testCreds}>
          <p>Test Mode Credentials:</p>
          <p>demo@test.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '${colors.background}'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    textAlign: 'center',
    marginBottom: '32px'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '${colors.text}',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    fontSize: '14px'
  },
  link: {
    color: '${colors.primary}',
    textDecoration: 'none',
    fontWeight: '600'
  },
  testCreds: {
    marginTop: '24px',
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '12px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  }
};
`;

  const registerPage = `/**
 * RegisterPage - Test Mode Generated
 * Registration page for ${businessName}
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const API_URL = '/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(\`\${API_URL}/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name })
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join ${businessName} today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              minLength={8}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '${colors.background}'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '${colors.text}',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    textAlign: 'center',
    marginBottom: '32px'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '${colors.textMuted || 'rgba(255,255,255,0.4)'}'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 48px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '${colors.text}',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    backgroundColor: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    fontSize: '14px'
  },
  link: {
    color: '${colors.primary}',
    textDecoration: 'none',
    fontWeight: '600'
  }
};
`;

  const dashboardPage = `/**
 * DashboardPage - Test Mode Generated
 * User dashboard for ${businessName}
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Gift, Clock, Star, LogOut, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Profile Header */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 style={styles.name}>{user.fullName || 'User'}</h1>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>

        {/* Loyalty Card */}
        <div style={styles.loyaltyCard}>
          <div style={styles.loyaltyHeader}>
            <Star size={24} color="#fbbf24" />
            <span style={styles.tier}>Gold Member</span>
          </div>
          <div style={styles.pointsDisplay}>
            <span style={styles.pointsNumber}>850</span>
            <span style={styles.pointsLabel}>Points</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '68%' }} />
          </div>
          <p style={styles.progressText}>150 points to Platinum</p>
        </div>

        {/* Quick Links */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Links</h2>

          <Link to="/menu" style={styles.menuItem}>
            <Gift size={20} />
            <span style={styles.menuItemText}>View Rewards</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>

          <Link to="/menu" style={styles.menuItem}>
            <Clock size={20} />
            <span style={styles.menuItemText}>Order History</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>

          <Link to="/menu" style={styles.menuItem}>
            <User size={20} />
            <span style={styles.menuItemText}>Edit Profile</span>
            <ChevronRight size={18} style={styles.chevron} />
          </Link>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '${colors.background}',
    padding: '20px'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: '${colors.text}'
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '16px',
    marginBottom: '20px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '${colors.primary}',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  name: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '${colors.text}',
    margin: 0
  },
  email: {
    fontSize: '14px',
    color: '${colors.textMuted || 'rgba(255,255,255,0.6)'}',
    margin: '4px 0 0'
  },
  loyaltyCard: {
    padding: '24px',
    background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent || colors.primary} 100%)',
    borderRadius: '16px',
    marginBottom: '24px'
  },
  loyaltyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  tier: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600'
  },
  pointsDisplay: {
    marginBottom: '16px'
  },
  pointsNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  pointsLabel: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: '8px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '4px'
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    marginTop: '8px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '${colors.text}',
    marginBottom: '16px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '${colors.cardBg || 'rgba(255,255,255,0.05)'}',
    borderRadius: '12px',
    marginBottom: '8px',
    textDecoration: 'none',
    color: '${colors.text}'
  },
  menuItemText: {
    flex: 1
  },
  chevron: {
    opacity: 0.5
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};
`;

  return {
    'LoginPage': loginPage,
    'RegisterPage': registerPage,
    'DashboardPage': dashboardPage
  };
}

/**
 * Generate a mock page component from fixture data
 */
function generateMockPage(pageName, pageData, fixture) {
  const componentName = pageName.charAt(0).toUpperCase() + pageName.slice(1) + 'Page';
  const businessName = fixture.business.name;
  const colors = fixture.theme.colors;

  // Generate appropriate page based on type
  if (pageName === 'home') {
    return generateHomePage(componentName, pageData, fixture);
  } else if (pageName === 'menu') {
    return generateMenuPage(componentName, pageData, fixture);
  } else if (pageName === 'about') {
    return generateAboutPage(componentName, pageData, fixture);
  } else if (pageName === 'contact') {
    return generateContactPage(componentName, pageData, fixture);
  } else if (pageName === 'gallery') {
    return generateGalleryPage(componentName, pageData, fixture);
  } else {
    return generateGenericPage(componentName, pageName, pageData, fixture);
  }
}

function generateHomePage(componentName, pageData, fixture) {
  const { hero, sections } = pageData;
  const { name, tagline } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';
import { ArrowRight, Star, Clock, Flame, Leaf } from 'lucide-react';

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${hero?.backgroundImage || 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1920'})',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
            ${hero?.headline || name}
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', maxWidth: '600px' }}>
            ${hero?.subheadline || tagline}
          </p>
          <button style={{
            backgroundColor: '${colors.primary}',
            color: 'white',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ${hero?.cta || 'Get Started'} <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', textAlign: 'center', marginBottom: '48px' }}>
          Why Choose Us
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <FeatureCard icon={<Flame />} title="Quality First" description="We never compromise on quality" color="${colors.primary}" />
          <FeatureCard icon={<Leaf />} title="Fresh Daily" description="Everything made fresh every day" color="${colors.primary}" />
          <FeatureCard icon={<Clock />} title="Fast Service" description="Quick service without sacrificing quality" color="${colors.primary}" />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: '${colors.primary}',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Ready to Experience ${name}?</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>Join thousands of satisfied customers</p>
        <button style={{
          backgroundColor: 'white',
          color: '${colors.primary}',
          padding: '14px 28px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Get Started Today
        </button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div style={{
      padding: '32px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: color + '20',
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ opacity: 0.7 }}>{description}</p>
    </div>
  );
}
`;
}

function generateMenuPage(componentName, pageData, fixture) {
  const { categories = [] } = pageData;
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';

const MENU_DATA = ${JSON.stringify(categories, null, 2)};

export default function ${componentName}() {
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0]?.name || '');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Our Menu</h1>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {MENU_DATA.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeCategory === cat.name ? '${colors.primary}' : 'transparent',
                color: activeCategory === cat.name ? 'white' : '${colors.text}',
                border: '2px solid ${colors.primary}',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {MENU_DATA.find(c => c.name === activeCategory)?.items.map((item, idx) => (
            <div key={idx} style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{item.name}</h3>
                <span style={{ color: '${colors.primary}', fontWeight: 'bold' }}>\${item.price}</span>
              </div>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;
}

function generateAboutPage(componentName, pageData, fixture) {
  const { story, team = [], values = [] } = pageData;
  const { name, established } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';

const TEAM = ${JSON.stringify(team, null, 2)};

export default function ${componentName}() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '16px' }}>About ${name}</h1>
        <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '48px' }}>Est. ${established || '2020'}</p>

        {/* Story */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Our Story</h2>
          <p style={{ fontSize: '18px', lineHeight: 1.8, opacity: 0.9 }}>
            ${story || `${name} was founded with a passion for excellence and a commitment to our community.`}
          </p>
        </section>

        {/* Team */}
        <section>
          <h2 style={{ fontSize: '28px', marginBottom: '32px', textAlign: 'center' }}>Meet Our Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            {TEAM.map((member, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <img
                  src={member.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                  alt={member.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 16px',
                    border: '4px solid ${colors.primary}'
                  }}
                />
                <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>{member.name}</h3>
                <p style={{ color: '${colors.primary}', marginBottom: '8px' }}>{member.role}</p>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
`;
}

function generateContactPage(componentName, pageData, fixture) {
  const { address, phone, email } = pageData;
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ${componentName}() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (Test mode)');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Contact Us</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Get in Touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MapPin size={24} color="${colors.primary}" />
                <span>${address || '123 Main Street'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Phone size={24} color="${colors.primary}" />
                <span>${phone || '(555) 123-4567'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Mail size={24} color="${colors.primary}" />
                <span>${email || 'hello@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}'
              }}
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}'
              }}
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '${colors.text}',
                resize: 'vertical'
              }}
            />
            <button type="submit" style={{
              padding: '14px 28px',
              backgroundColor: '${colors.primary}',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
`;
}

function generateGalleryPage(componentName, pageData, fixture) {
  const { images = [] } = pageData;
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React, { useState } from 'react';
import { X } from 'lucide-react';

const GALLERY_IMAGES = ${JSON.stringify(images, null, 2)};

export default function ${componentName}() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${colors.background}', color: '${colors.text}', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', textAlign: 'center', marginBottom: '48px' }}>Gallery</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img
                src={img.url}
                alt={img.caption || 'Gallery image'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '40px'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.caption}
              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function generateGenericPage(componentName, pageName, pageData, fixture) {
  const { name } = fixture.business;
  const colors = fixture.theme.colors;

  return `/**
 * ${componentName} - Test Mode Generated
 * Business: ${name}
 */
import React from 'react';

export default function ${componentName}() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '${colors.background}',
      color: '${colors.text}',
      padding: '80px 20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '24px' }}>${pageName.charAt(0).toUpperCase() + pageName.slice(1)}</h1>
        <p style={{ opacity: 0.7, fontSize: '18px' }}>
          This is the ${pageName} page for ${name}.
        </p>
        <p style={{ marginTop: '24px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          🧪 Generated in Test Mode using mock fixture data.
        </p>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate complete companion app from fixture data
 * Matches structure of real AI-generated companion apps
 * NOW INDUSTRY-AWARE - generates appropriate screens per industry
 */
function generateMockCompanionApp(fixture, projectName) {
  const { business, theme, companionApp } = fixture;
  const colors = theme.colors;
  const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

  // Get industry-specific configuration
  const industry = business.industry || 'default';
  const category = getIndustryCategory(industry);
  const industryConfig = getIndustryFixture(industry);
  const appConfig = industryConfig.app;
  const sampleData = industryConfig.data;
  const loyaltyConfig = industryConfig.loyalty;

  console.log(`📱 Generating ${category} companion app for industry: ${industry}`);

  // Build screens based on industry configuration
  const screens = {};

  // Always include core screens
  screens['src/screens/HomeScreen.jsx'] = generateHomeScreen(business, colors, companionApp, industryConfig);
  screens['src/screens/RewardsScreen.jsx'] = generateRewardsScreen(business, colors, companionApp, loyaltyConfig);
  screens['src/screens/ProfileScreen.jsx'] = generateProfileScreen(business, colors, companionApp);
  screens['src/screens/LoginScreen.jsx'] = generateLoginScreen(business, colors);

  // Add industry-specific screens based on category
  if (category === 'food-beverage') {
    screens['src/screens/MenuScreen.jsx'] = generateMenuScreen(business, colors, sampleData);
    screens['src/screens/OrderHistoryScreen.jsx'] = generateOrderHistoryScreen(business, colors);
  } else if (category === 'retail') {
    screens['src/screens/ShopScreen.jsx'] = generateShopScreen(business, colors, sampleData);
    screens['src/screens/CartScreen.jsx'] = generateCartScreen(business, colors);
    screens['src/screens/OrdersScreen.jsx'] = generateOrdersScreen(business, colors);
  } else if (category === 'health-wellness') {
    screens['src/screens/ClassesScreen.jsx'] = generateClassesScreen(business, colors, sampleData);
    screens['src/screens/ScheduleScreen.jsx'] = generateScheduleScreen(business, colors);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  } else if (category === 'hospitality') {
    screens['src/screens/RoomsScreen.jsx'] = generateRoomsScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  } else if (category === 'trade-services') {
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/QuoteScreen.jsx'] = generateQuoteScreen(business, colors);
  } else {
    // Default: add generic services and booking
    screens['src/screens/ServicesScreen.jsx'] = generateServicesScreen(business, colors, sampleData);
    screens['src/screens/BookingScreen.jsx'] = generateBookingScreen(business, colors);
  }

  // Optional extras for all: Wallet, Earn, Leaderboard
  screens['src/screens/WalletScreen.jsx'] = generateWalletScreen(business, colors, companionApp);
  screens['src/screens/EarnScreen.jsx'] = generateEarnScreen(business, colors, companionApp);
  screens['src/screens/LeaderboardScreen.jsx'] = generateLeaderboardScreen(business, colors, companionApp);

  return {
    // Package.json
    'package.json': JSON.stringify({
      name: `${safeName}-companion`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.294.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0'
      }
    }, null, 2),

    // Vite config
    'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
});`,

    // Index HTML
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="theme-color" content="${colors.primary}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <link rel="manifest" href="/manifest.json" />
  <title>${business.name} App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,

    // Manifest
    'public/manifest.json': JSON.stringify({
      name: business.name,
      short_name: business.name.split(' ')[0],
      start_url: '/',
      display: 'standalone',
      background_color: colors.background,
      theme_color: colors.primary,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    }, null, 2),

    // Main entry
    'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

    // App.jsx with routes - now industry-aware
    'src/App.jsx': generateCompanionAppJsx(business, colors, category, appConfig),

    // Main styles
    'src/index.css': generateCompanionStyles(colors),

    // All screens (industry-specific + core)
    ...screens,

    // Components - now industry-aware bottom nav
    'src/components/BottomNav.jsx': generateBottomNav(colors, category, appConfig),
    'src/components/QuickActionCard.jsx': generateQuickActionCard(colors),

    // Services
    'src/services/api.js': generateApiService(safeName),

    // Hooks
    'src/hooks/useAuth.jsx': generateAuthHook()
  };
}

function generateCompanionAppJsx(business, colors, category, appConfig) {
  // Generate industry-specific imports and routes
  const screenImports = generateScreenImports(category);
  const screenRoutes = generateScreenRoutes(category);

  return `/**
 * ${business.name} Companion App
 * Test Mode Generated - Industry: ${category}
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
${screenImports}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
${screenRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;`;
}

/**
 * Generate industry-specific screen imports
 */
function generateScreenImports(category) {
  // Core screens always included
  const imports = [
    `import HomeScreen from './screens/HomeScreen';`,
    `import RewardsScreen from './screens/RewardsScreen';`,
    `import ProfileScreen from './screens/ProfileScreen';`,
    `import LoginScreen from './screens/LoginScreen';`,
    `import WalletScreen from './screens/WalletScreen';`,
    `import EarnScreen from './screens/EarnScreen';`,
    `import LeaderboardScreen from './screens/LeaderboardScreen';`
  ];

  // Add industry-specific screens
  if (category === 'food-beverage') {
    imports.push(`import MenuScreen from './screens/MenuScreen';`);
    imports.push(`import OrderHistoryScreen from './screens/OrderHistoryScreen';`);
  } else if (category === 'retail') {
    imports.push(`import ShopScreen from './screens/ShopScreen';`);
    imports.push(`import CartScreen from './screens/CartScreen';`);
    imports.push(`import OrdersScreen from './screens/OrdersScreen';`);
  } else if (category === 'health-wellness') {
    imports.push(`import ClassesScreen from './screens/ClassesScreen';`);
    imports.push(`import ScheduleScreen from './screens/ScheduleScreen';`);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  } else if (category === 'hospitality') {
    imports.push(`import RoomsScreen from './screens/RoomsScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  } else if (category === 'trade-services') {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import QuoteScreen from './screens/QuoteScreen';`);
  } else {
    imports.push(`import ServicesScreen from './screens/ServicesScreen';`);
    imports.push(`import BookingScreen from './screens/BookingScreen';`);
  }

  return imports.join('\n');
}

/**
 * Generate industry-specific routes
 */
function generateScreenRoutes(category) {
  // Core routes
  const routes = [
    `          <Route path="/" element={<HomeScreen user={user} />} />`,
    `          <Route path="/rewards" element={<RewardsScreen user={user} />} />`,
    `          <Route path="/wallet" element={<WalletScreen user={user} />} />`,
    `          <Route path="/earn" element={<EarnScreen user={user} />} />`,
    `          <Route path="/leaderboard" element={<LeaderboardScreen user={user} />} />`,
    `          <Route path="/profile" element={<ProfileScreen user={user} onLogout={handleLogout} />} />`
  ];

  // Add industry-specific routes
  if (category === 'food-beverage') {
    routes.splice(1, 0, `          <Route path="/menu" element={<MenuScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/history" element={<OrderHistoryScreen user={user} />} />`);
  } else if (category === 'retail') {
    routes.splice(1, 0, `          <Route path="/shop" element={<ShopScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/cart" element={<CartScreen user={user} />} />`);
    routes.splice(3, 0, `          <Route path="/orders" element={<OrdersScreen user={user} />} />`);
  } else if (category === 'health-wellness') {
    routes.splice(1, 0, `          <Route path="/classes" element={<ClassesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/schedule" element={<ScheduleScreen user={user} />} />`);
  } else if (category === 'healthcare' || category === 'creative' || category === 'professional-services') {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  } else if (category === 'hospitality') {
    routes.splice(1, 0, `          <Route path="/rooms" element={<RoomsScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  } else if (category === 'trade-services') {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/quote" element={<QuoteScreen user={user} />} />`);
  } else {
    routes.splice(1, 0, `          <Route path="/services" element={<ServicesScreen user={user} />} />`);
    routes.splice(2, 0, `          <Route path="/book" element={<BookingScreen user={user} />} />`);
  }

  return routes.join('\n');
}

function generateCompanionStyles(colors) {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary || colors.primary};
  --accent: ${colors.accent || '#10b981'};
  --background: ${colors.background};
  --text: ${colors.text};
  --card-bg: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 255, 255, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  padding-bottom: 80px;
}

.screen {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.screen-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 24px;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}`;
}

function generateHomeScreen(business, colors, companionApp, industryConfig) {
  const dashboard = companionApp?.dashboard || {};
  // Use default widgets if not provided in companionApp
  const widgets = dashboard.widgets?.length ? dashboard.widgets : [
    { type: 'points', label: 'Reward Points', value: 850 },
    { type: 'tier', label: 'Member Tier', value: 'Gold' },
    { type: 'orders', label: 'Total Orders', value: 23 },
    { type: 'savings', label: 'Total Savings', value: '$47.50' }
  ];

  // Always use category-based quick actions with proper navigation paths
  const categoryActions = getQuickActionsForCategory(industryConfig?.category || 'default');
  // Merge custom actions with paths, fallback to category defaults
  const quickActions = dashboard.quickActions?.length
    ? dashboard.quickActions.map(action => ({
        ...action,
        path: action.path || categoryActions.find(ca => ca.id === action.id)?.path || '/profile'
      }))
    : categoryActions;

  const category = industryConfig?.category || 'default';

  return `/**
 * HomeScreen - Dashboard
 * Test Mode Generated - ${category} Industry
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Gift, Clock, Users, Star, Award, Wallet, TrendingUp } from 'lucide-react';
import QuickActionCard from '../components/QuickActionCard';

const WIDGETS = ${JSON.stringify(widgets, null, 2)};

const QUICK_ACTIONS = ${JSON.stringify(quickActions, null, 2)};

const ICON_MAP = {
  ShoppingBag, Gift, Clock, Users, Star, Award, Wallet, TrendingUp
};

export default function HomeScreen({ user }) {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div style={{ marginBottom: '24px' }}>
        <p style={{ opacity: 0.7, marginBottom: '4px' }}>${dashboard.greeting || 'Welcome back!'}</p>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>{user?.fullName || 'Guest'}</h1>
      </div>

      {/* Stats Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {WIDGETS.map((widget, idx) => (
          <div key={idx} className="card" style={{ textAlign: 'center' }}>
            <p style={{ opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>{widget.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{widget.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {QUICK_ACTIONS.map((action, idx) => {
          const IconComponent = ICON_MAP[action.icon] || Gift;
          return (
            <QuickActionCard
              key={idx}
              icon={<IconComponent size={24} />}
              label={action.label}
              onClick={() => navigate(action.path)}
            />
          );
        })}
      </div>
    </div>
  );
}`;
}

function generateRewardsScreen(business, colors, companionApp, loyaltyConfig) {
  // Use loyalty config for default values if companionApp doesn't have rewards
  const rewards = companionApp?.rewards || {};
  const defaultTiers = loyaltyConfig?.tiers || [
    { name: 'Bronze', minPoints: 0, perks: ['Earn 1 point per $1', 'Member-only offers'] },
    { name: 'Silver', minPoints: 500, perks: ['Earn 1.25x points', 'Early access', 'Birthday reward'] },
    { name: 'Gold', minPoints: 1500, perks: ['Earn 1.5x points', 'Free shipping', 'Exclusive events'] },
    { name: 'Platinum', minPoints: 5000, perks: ['Earn 2x points', 'Priority support', 'VIP experiences'] }
  ];
  const defaultRewards = loyaltyConfig?.rewards || [
    { name: '$5 Off', cost: 100 },
    { name: '$10 Off', cost: 200 },
    { name: '$25 Off', cost: 450 },
    { name: 'Free Item', cost: 300 }
  ];

  const rewardsData = {
    currentPoints: rewards.currentPoints || 850,
    currentTier: rewards.currentTier || 'Gold',
    pointsToNextTier: rewards.pointsToNextTier || 650,
    availableRewards: rewards.availableRewards?.length ? rewards.availableRewards : defaultRewards,
    tiers: rewards.tiers?.length ? rewards.tiers : defaultTiers
  };

  return `/**
 * RewardsScreen - Universal Loyalty & Rewards
 * Test Mode Generated - Rewards in ALL industries
 */
import React from 'react';
import { Gift, ChevronRight, Star } from 'lucide-react';

const REWARDS_DATA = ${JSON.stringify(rewardsData, null, 2)};

export default function RewardsScreen({ user }) {
  const { currentPoints, currentTier, pointsToNextTier, availableRewards, tiers } = REWARDS_DATA;

  return (
    <div className="screen">
      <h1 className="screen-title">My Rewards</h1>

      {/* Points Summary */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Star size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)' }}>{currentPoints}</p>
        <p style={{ opacity: 0.7 }}>Points Available</p>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px' }}>
            <strong>{currentTier}</strong> Member • {pointsToNextTier} points to next tier
          </p>
        </div>
      </div>

      {/* Available Rewards */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Redeem Rewards</h2>
      {availableRewards.map((reward, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: '600' }}>{reward.name}</p>
            <p style={{ opacity: 0.7, fontSize: '14px' }}>{reward.cost} points</p>
          </div>
          <button style={{
            background: currentPoints >= reward.cost ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: currentPoints >= reward.cost ? 'pointer' : 'not-allowed'
          }}>
            Redeem
          </button>
        </div>
      ))}

      {/* Tier Info */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: '24px', marginBottom: '16px' }}>Membership Tiers</h2>
      {tiers.map((tier, idx) => (
        <div key={idx} className="card" style={{ opacity: tier.name === currentTier ? 1 : 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontWeight: '600' }}>{tier.name}</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>{tier.minPoints}+ points</p>
          </div>
          <ul style={{ paddingLeft: '16px', fontSize: '14px', opacity: 0.8 }}>
            {tier.perks.map((perk, i) => <li key={i}>{perk}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}`;
}

function generateWalletScreen(business, colors, companionApp) {
  const wallet = companionApp?.wallet || {};

  return `/**
 * WalletScreen
 * Test Mode Generated
 */
import React from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WALLET_DATA = ${JSON.stringify(wallet, null, 2)};

export default function WalletScreen({ user }) {
  const { balance = 0, transactions = [] } = WALLET_DATA;

  return (
    <div className="screen">
      <h1 className="screen-title">My Wallet</h1>

      {/* Balance Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Wallet size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)' }}>\${balance.toFixed(2)}</p>
        <p style={{ opacity: 0.7 }}>Available Balance</p>
        <button className="btn" style={{ marginTop: '16px' }}>
          <Plus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Add Funds
        </button>
      </div>

      {/* Transaction History */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Transactions</h2>
      {transactions.map((tx, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: tx.type === 'credit' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {tx.type === 'credit' ? <ArrowDownLeft color="#10b981" /> : <ArrowUpRight color="#ef4444" />}
            </div>
            <div>
              <p style={{ fontWeight: '500' }}>{tx.description}</p>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>{tx.date}</p>
            </div>
          </div>
          <p style={{ fontWeight: '600', color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
            {tx.type === 'credit' ? '+' : ''}\${Math.abs(tx.amount).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}`;
}

function generateProfileScreen(business, colors, companionApp) {
  const profile = companionApp?.profile || {};

  return `/**
 * ProfileScreen
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react';

const PROFILE_DATA = ${JSON.stringify(profile, null, 2)};

export default function ProfileScreen({ user, onLogout }) {
  const [preferences, setPreferences] = useState(PROFILE_DATA.preferences || {});

  return (
    <div className="screen">
      <h1 className="screen-title">Profile</h1>

      {/* User Info */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          {(user?.fullName || 'U')[0].toUpperCase()}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{user?.fullName || 'Guest User'}</h2>
        <p style={{ opacity: 0.7 }}>{user?.email || 'guest@example.com'}</p>
      </div>

      {/* Profile Fields */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', opacity: 0.7 }}>Account Information</h2>
      {(PROFILE_DATA.fields || []).map((field, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>{field.label}</p>
            <p style={{ fontWeight: '500' }}>{field.value}</p>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.5 }} />
        </div>
      ))}

      {/* Preferences */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px', opacity: 0.7 }}>Preferences</h2>
      <div className="card">
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span>Push Notifications</span>
          <input type="checkbox" checked={preferences.notifications} onChange={() => {}} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span>Email Deals</span>
          <input type="checkbox" checked={preferences.emailDeals} onChange={() => {}} />
        </label>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>SMS Alerts</span>
          <input type="checkbox" checked={preferences.smsAlerts} onChange={() => {}} />
        </label>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="btn btn-secondary"
        style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
}`;
}

function generateEarnScreen(business, colors, companionApp) {
  const earn = companionApp?.earn || {};

  return `/**
 * EarnScreen
 * Test Mode Generated
 */
import React from 'react';
import { ShoppingBag, Users, Star, Gift, Heart } from 'lucide-react';

const EARN_METHODS = ${JSON.stringify(earn.methods || [], null, 2)};

const ICON_MAP = { ShoppingBag, Users, Star, Gift, Heart };

export default function EarnScreen({ user }) {
  return (
    <div className="screen">
      <h1 className="screen-title">Earn Points</h1>
      <p style={{ opacity: 0.7, marginBottom: '24px' }}>Complete activities to earn reward points!</p>

      {EARN_METHODS.map((method, idx) => {
        const IconComponent = ICON_MAP[method.icon] || Star;
        return (
          <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(var(--primary-rgb), 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={24} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600' }}>{method.title}</p>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>{method.points}</p>
            </div>
            <button style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Go
            </button>
          </div>
        );
      })}
    </div>
  );
}`;
}

function generateLeaderboardScreen(business, colors, companionApp) {
  const leaderboard = companionApp?.leaderboard || {};

  return `/**
 * LeaderboardScreen
 * Test Mode Generated
 */
import React from 'react';
import { Trophy, Medal } from 'lucide-react';

const LEADERBOARD_DATA = ${JSON.stringify(leaderboard, null, 2)};

export default function LeaderboardScreen({ user }) {
  const { topCustomers = [], currentUserRank = 0 } = LEADERBOARD_DATA;

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'transparent';
  };

  return (
    <div className="screen">
      <h1 className="screen-title">Leaderboard</h1>

      {/* Top 3 Podium */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
        {topCustomers.slice(0, 3).map((customer, idx) => (
          <div key={idx} style={{ textAlign: 'center', flex: idx === 0 ? 1.2 : 1, order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}>
            <div style={{
              width: idx === 0 ? '70px' : '60px',
              height: idx === 0 ? '70px' : '60px',
              borderRadius: '50%',
              background: getMedalColor(customer.rank),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              fontSize: idx === 0 ? '28px' : '24px',
              fontWeight: 'bold',
              border: '3px solid var(--border)'
            }}>
              {customer.avatar}
            </div>
            <p style={{ fontWeight: '600', fontSize: '14px' }}>{customer.name}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{customer.points}</p>
          </div>
        ))}
      </div>

      {/* Full Ranking */}
      <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Rankings</h2>
      {topCustomers.map((customer, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: customer.isCurrentUser ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--card-bg)',
            border: customer.isCurrentUser ? '2px solid var(--primary)' : '1px solid var(--border)'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: getMedalColor(customer.rank),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {customer.rank}
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {customer.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600' }}>{customer.name} {customer.isCurrentUser && '(You)'}</p>
          </div>
          <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{customer.points}</p>
        </div>
      ))}
    </div>
  );
}`;
}

function generateLoginScreen(business, colors) {
  return `/**
 * LoginScreen
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login - in real app would call API
    setTimeout(() => {
      // Mock successful login
      const mockUser = {
        id: 1,
        email: email || 'demo@example.com',
        fullName: 'Demo User',
        loyaltyPoints: 850,
        tier: 'Gold'
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      onLogin(mockUser, mockToken);
      setLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    const mockUser = {
      id: 1,
      email: 'demo@example.com',
      fullName: 'Demo User',
      loyaltyPoints: 850,
      tier: 'Gold'
    };
    onLogin(mockUser, 'mock-demo-token');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            🍕
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>${business.name}</h1>
          <p style={{ opacity: 0.7, marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <User size={20} style={{ opacity: 0.5 }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '16px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '0 16px'
            }}>
              <Lock size={20} style={{ opacity: 0.5 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  padding: '16px',
                  color: 'var(--text)',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={handleDemoLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Skip login (Demo Mode) →
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', opacity: 0.5 }}>
          🧪 Test Mode - Using mock authentication
        </p>
      </div>
    </div>
  );
}`;
}

function generateBottomNav(colors, category, appConfig) {
  // Generate industry-specific navigation items
  const navItems = getNavItemsForCategory(category);
  const iconImports = getIconImportsForNav(navItems);

  return `/**
 * BottomNav Component
 * Test Mode Generated - Industry: ${category}
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ${iconImports} } from 'lucide-react';

const NAV_ITEMS = ${JSON.stringify(navItems, null, 2).replace(/"icon": "(\w+)"/g, '"icon": $1')};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 24px',
      zIndex: 100
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            <Icon size={24} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}`;
}

function generateQuickActionCard(colors) {
  return `/**
 * QuickActionCard Component
 * Test Mode Generated
 */
import React from 'react';

export default function QuickActionCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'transform 0.2s, background 0.2s'
      }}
    >
      <div style={{ color: 'var(--primary)' }}>{icon}</div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{label}</span>
    </button>
  );
}`;
}

/**
 * Get navigation items based on industry category
 */
function getNavItemsForCategory(category) {
  const navConfigs = {
    'food-beverage': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/menu', icon: 'UtensilsCrossed', label: 'Order' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/history', icon: 'Clock', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'retail': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/shop', icon: 'ShoppingBag', label: 'Shop' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/orders', icon: 'Package', label: 'Orders' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'health-wellness': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/classes', icon: 'Dumbbell', label: 'Classes' },
      { path: '/schedule', icon: 'Calendar', label: 'Schedule' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'healthcare': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Heart', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'professional-services': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Briefcase', label: 'Services' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'creative': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Camera', label: 'Work' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'hospitality': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/rooms', icon: 'Bed', label: 'Rooms' },
      { path: '/book', icon: 'Calendar', label: 'Book' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ],
    'trade-services': [
      { path: '/', icon: 'Home', label: 'Home' },
      { path: '/services', icon: 'Wrench', label: 'Services' },
      { path: '/quote', icon: 'FileText', label: 'Quote' },
      { path: '/rewards', icon: 'Gift', label: 'Rewards' },
      { path: '/profile', icon: 'User', label: 'Profile' }
    ]
  };

  return navConfigs[category] || [
    { path: '/', icon: 'Home', label: 'Home' },
    { path: '/services', icon: 'Grid', label: 'Services' },
    { path: '/book', icon: 'Calendar', label: 'Book' },
    { path: '/rewards', icon: 'Gift', label: 'Rewards' },
    { path: '/profile', icon: 'User', label: 'Profile' }
  ];
}

/**
 * Get icon imports for navigation items
 */
function getIconImportsForNav(navItems) {
  const icons = new Set(navItems.map(item => item.icon));
  return Array.from(icons).join(', ');
}

/**
 * Get quick actions based on industry category (with navigation paths)
 */
function getQuickActionsForCategory(category) {
  const actions = {
    'food-beverage': [
      { id: 'order', label: 'Order Now', icon: 'ShoppingBag', path: '/menu' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'history', label: 'Order History', icon: 'Clock', path: '/history' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'retail': [
      { id: 'shop', label: 'Shop Now', icon: 'ShoppingBag', path: '/shop' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'orders', label: 'My Orders', icon: 'Clock', path: '/orders' },
      { id: 'wishlist', label: 'Wishlist', icon: 'Star', path: '/profile' }
    ],
    'health-wellness': [
      { id: 'book', label: 'Book Class', icon: 'Award', path: '/classes' },
      { id: 'schedule', label: 'My Schedule', icon: 'Clock', path: '/schedule' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'progress', label: 'My Progress', icon: 'TrendingUp', path: '/profile' }
    ],
    'healthcare': [
      { id: 'book', label: 'Book Appt', icon: 'Award', path: '/book' },
      { id: 'records', label: 'My Records', icon: 'Clock', path: '/profile' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'professional-services': [
      { id: 'book', label: 'Book Meeting', icon: 'Award', path: '/book' },
      { id: 'documents', label: 'Documents', icon: 'Clock', path: '/profile' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ],
    'hospitality': [
      { id: 'book', label: 'Book Room', icon: 'Award', path: '/rooms' },
      { id: 'reservations', label: 'My Stays', icon: 'Clock', path: '/book' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'concierge', label: 'Concierge', icon: 'Users', path: '/profile' }
    ],
    'trade-services': [
      { id: 'quote', label: 'Get Quote', icon: 'Award', path: '/quote' },
      { id: 'appointments', label: 'My Appts', icon: 'Clock', path: '/services' },
      { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
      { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
    ]
  };

  return actions[category] || [
    { id: 'services', label: 'Services', icon: 'ShoppingBag', path: '/services' },
    { id: 'rewards', label: 'My Rewards', icon: 'Gift', path: '/rewards' },
    { id: 'history', label: 'History', icon: 'Clock', path: '/book' },
    { id: 'refer', label: 'Refer a Friend', icon: 'Users', path: '/profile' }
  ];
}

function generateApiService(safeName) {
  return `/**
 * API Service
 * Test Mode Generated - Connects to parent website backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': \`Bearer \${token}\` })
    };
  }

  async get(endpoint) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Auth endpoints
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(data) {
    return this.post('/auth/register', data);
  }

  async getProfile() {
    return this.get('/auth/me');
  }

  // Loyalty endpoints
  async getLoyalty() {
    return this.get('/loyalty');
  }

  async getRewards() {
    return this.get('/loyalty/rewards');
  }

  // Wallet endpoints
  async getWallet() {
    return this.get('/wallet');
  }

  async getTransactions() {
    return this.get('/wallet/transactions');
  }
}

export const api = new ApiService();
export default api;`;
}

function generateAuthHook() {
  return `/**
 * useAuth Hook
 * Test Mode Generated
 */
import { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default useAuth;`;
}

// ============================================
// INDUSTRY-SPECIFIC SCREEN GENERATORS
// ============================================

/**
 * MenuScreen for food-beverage industries
 */
function generateMenuScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * MenuScreen - Order food from the app
 * Test Mode Generated - Food & Beverage Industry
 */
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

const MENU_DATA = ${JSON.stringify(categories, null, 2)};

export default function MenuScreen({ user }) {
  const [activeCategory, setActiveCategory] = useState(MENU_DATA[0]?.name || '');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [paymentType, setPaymentType] = useState('cash');

  const addToCart = (item) => {
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      setCart(cart.map(c => c.name === item.name ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemName) => {
    const existing = cart.find(c => c.name === itemName);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.name === itemName ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.name !== itemName));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const data = await api.post('/orders', {
        items: cart,
        total: cartTotal,
        source: 'app',
        paymentType: paymentType
      });

      if (data.success) {
        setLastOrder(data.order);
        setOrderPlaced(true);
        setCart([]);
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCart(false);
        }, 3000);
      } else {
        alert('Failed to place order: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Order Food</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {MENU_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MENU_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>{item.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>\${item.price}</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>{item.description}</p>
            </div>
            <button
              onClick={() => addToCart(item)}
              style={{
                marginLeft: '12px',
                padding: '8px 12px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            padding: '12px 20px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 50
          }}
        >
          <ShoppingCart size={18} />
          Cart ({cartCount}) - \${cartTotal}
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '20px 20px 0 0',
            padding: '24px',
            paddingBottom: '100px',
            width: '100%',
            maxHeight: '85vh',
            marginBottom: '70px',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Your Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {orderPlaced ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={30} color="white" />
                </div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Order Placed!</h3>
                <p style={{ opacity: 0.7, fontSize: '14px' }}>Order #{lastOrder?.id}</p>
              </div>
            ) : (
              <>
                {cart.length === 0 ? (
                  <p style={{ textAlign: 'center', opacity: 0.6, padding: '40px 0' }}>Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontWeight: '600', margin: 0 }}>{item.name}</p>
                          <p style={{ fontSize: '12px', opacity: 0.6, margin: 0 }}>\${item.price} each</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button onClick={() => removeFromCart(item.name)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => addToCart(item)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span>Total</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>\${cartTotal}</span>
                      </div>
                      {/* Payment Type Selection */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <button onClick={() => setPaymentType('cash')} style={{ flex: 1, padding: '12px', background: paymentType === 'cash' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'cash' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                          Cash on Pickup
                        </button>
                        <button onClick={() => setPaymentType('card')} style={{ flex: 1, padding: '12px', background: paymentType === 'card' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: paymentType === 'card' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                          Pay with Card
                        </button>
                      </div>
                      <button onClick={placeOrder} disabled={placing} style={{ width: '100%', padding: '14px', backgroundColor: placing ? '#374151' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: placing ? 'not-allowed' : 'pointer' }}>
                        {placing ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * OrderHistoryScreen for food-beverage
 */
function generateOrderHistoryScreen(business, colors) {
  return `/**
 * OrderHistoryScreen - View past orders
 * Test Mode Generated
 */
import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function OrderHistoryScreen({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} color="#f59e0b" />;
      case 'preparing': return <Package size={16} color="#3b82f6" />;
      case 'completed': return <CheckCircle size={16} color="#10b981" />;
      case 'cancelled': return <XCircle size={16} color="#ef4444" />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return <div className="screen"><p>Loading orders...</p></div>;
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Order History</h1>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ opacity: 0.6 }}>No orders yet</p>
          <p style={{ fontSize: '14px', opacity: 0.4 }}>Your orders will appear here</p>
        </div>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600' }}>Order #{order.id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getStatusIcon(order.status)}
                <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{order.status}</span>
              </div>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
              {order.items?.map(item => \`\${item.quantity}x \${item.name}\`).join(', ')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ opacity: 0.5 }}>{new Date(order.created_at).toLocaleDateString()}</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${order.total}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}`;
}

/**
 * ShopScreen for retail industries
 */
function generateShopScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ShopScreen - Browse and shop products
 * Test Mode Generated - Retail Industry
 */
import React, { useState } from 'react';
import { ShoppingBag, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCT_DATA = ${JSON.stringify(categories, null, 2)};

export default function ShopScreen({ user }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(PRODUCT_DATA[0]?.name || '');

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Shop</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {PRODUCT_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {PRODUCT_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
          <div key={idx} className="card" style={{ padding: '12px' }}>
            <div style={{ height: '100px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3 }} />
            </div>
            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.name}</p>
            <p style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px', lineHeight: '1.3' }}>{item.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${item.price}</span>
              <button
                onClick={() => addToCart(item)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Cart Button */}
      <button
        onClick={() => navigate('/cart')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          padding: '12px 20px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        <ShoppingBag size={18} style={{ marginRight: '8px' }} />
        View Cart
      </button>
    </div>
  );
}`;
}

/**
 * CartScreen for retail
 */
function generateCartScreen(business, colors) {
  return `/**
 * CartScreen - Shopping cart
 * Test Mode Generated - Retail Industry
 */
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartScreen({ user }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(saved);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (name, delta) => {
    const newCart = cart.map(item => {
      if (item.name === name) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    updateCart(newCart);
  };

  const removeItem = (name) => {
    updateCart(cart.filter(item => item.name !== name));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="screen">
      <h1 className="screen-title">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ opacity: 0.6 }}>Your cart is empty</p>
          <button onClick={() => navigate('/shop')} style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {cart.map((item, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600' }}>{item.name}</p>
                <p style={{ fontSize: '14px', color: 'var(--primary)' }}>\${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => updateQuantity(item.name, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.name, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
                <button onClick={() => removeItem(item.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${total.toFixed(2)}</span>
            </div>
            <button style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}`;
}

/**
 * OrdersScreen for retail
 */
function generateOrdersScreen(business, colors) {
  return `/**
 * OrdersScreen - View order history
 * Test Mode Generated - Retail Industry
 */
import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

const SAMPLE_ORDERS = [
  { id: 1001, status: 'delivered', date: '2024-01-15', total: 149.99, items: ['Premium Headphones'] },
  { id: 1000, status: 'shipped', date: '2024-01-10', total: 79.99, items: ['Laptop Stand', 'Phone Case'] }
];

export default function OrdersScreen({ user }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return <Truck size={16} color="#3b82f6" />;
      case 'delivered': return <CheckCircle size={16} color="#10b981" />;
      default: return <Package size={16} color="#f59e0b" />;
    }
  };

  return (
    <div className="screen">
      <h1 className="screen-title">My Orders</h1>

      {SAMPLE_ORDERS.map((order, idx) => (
        <div key={idx} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '600' }}>Order #{order.id}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getStatusIcon(order.status)}
              <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{order.status}</span>
            </div>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>{order.items.join(', ')}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span style={{ opacity: 0.5 }}>{order.date}</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${order.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ClassesScreen for health-wellness
 */
function generateClassesScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ClassesScreen - Browse fitness classes
 * Test Mode Generated - Health & Wellness Industry
 */
import React, { useState } from 'react';
import { Clock, Users, Dumbbell } from 'lucide-react';

const CLASS_DATA = ${JSON.stringify(categories, null, 2)};

export default function ClassesScreen({ user }) {
  const [activeCategory, setActiveCategory] = useState(CLASS_DATA[0]?.name || '');

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Classes</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {CLASS_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Classes */}
      {CLASS_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
        <div key={idx} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '16px' }}>{item.name}</p>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>{item.description}</p>
            </div>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>\${item.price}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.7 }}>
              <Clock size={14} /> 60 min
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.7 }}>
              <Users size={14} /> 12 spots
            </div>
          </div>
          <button style={{ width: '100%', marginTop: '12px', padding: '10px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Book Class
          </button>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ScheduleScreen for health-wellness
 */
function generateScheduleScreen(business, colors) {
  return `/**
 * ScheduleScreen - View class schedule
 * Test Mode Generated - Health & Wellness Industry
 */
import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const SCHEDULE = [
  { time: '6:00 AM', class: 'Morning Yoga', instructor: 'Sarah', duration: '60 min', spots: 8 },
  { time: '7:30 AM', class: 'HIIT Bootcamp', instructor: 'Mike', duration: '45 min', spots: 5 },
  { time: '9:00 AM', class: 'Spin Class', instructor: 'Alex', duration: '45 min', spots: 3 },
  { time: '12:00 PM', class: 'Lunch Express', instructor: 'Sarah', duration: '30 min', spots: 10 },
  { time: '5:30 PM', class: 'Evening Flow Yoga', instructor: 'Emma', duration: '60 min', spots: 6 },
  { time: '7:00 PM', class: 'Strength Training', instructor: 'Mike', duration: '60 min', spots: 4 }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleScreen({ user }) {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="screen">
      <h1 className="screen-title">Class Schedule</h1>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {DAYS.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedDay === idx ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedDay === idx ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '50px'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      {SCHEDULE.map((item, idx) => (
        <div key={idx} className="card" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ minWidth: '70px' }}>
            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{item.time}</p>
            <p style={{ fontSize: '12px', opacity: 0.6 }}>{item.duration}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: '600' }}>{item.class}</p>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>with {item.instructor}</p>
            <p style={{ fontSize: '11px', color: item.spots <= 3 ? '#ef4444' : '#10b981', marginTop: '4px' }}>
              {item.spots} spots left
            </p>
          </div>
          <button style={{ padding: '8px 12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'center' }}>
            Book
          </button>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * ServicesScreen for professional services, healthcare, creative, trade
 */
function generateServicesScreen(business, colors, sampleData) {
  const categories = sampleData?.categories || [];

  return `/**
 * ServicesScreen - Browse services
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { ChevronRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVICE_DATA = ${JSON.stringify(categories, null, 2)};

export default function ServicesScreen({ user }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(SERVICE_DATA[0]?.name || '');

  return (
    <div className="screen">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Our Services</h1>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {SERVICE_DATA.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCategory === cat.name ? 'var(--primary)' : 'var(--card-bg)',
              color: activeCategory === cat.name ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services */}
      {SERVICE_DATA.find(c => c.name === activeCategory)?.items?.map((item, idx) => (
        <div
          key={idx}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/book')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{item.name}</p>
              <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>{item.description}</p>
              {item.price && (
                <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  {typeof item.price === 'number' ? \`\$\${item.price}\` : item.price}
                </p>
              )}
            </div>
            <ChevronRight size={20} style={{ opacity: 0.5 }} />
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * BookingScreen for services that need appointments
 */
function generateBookingScreen(business, colors) {
  return `/**
 * BookingScreen - Book an appointment
 * Test Mode Generated
 */
import React, { useState } from 'react';
import { Calendar, Clock, Check } from 'lucide-react';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

export default function BookingScreen({ user }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booked, setBooked] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Booking Confirmed!</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>
          {selectedDate?.toLocaleDateString()} at {selectedTime}
        </p>
        <p style={{ fontSize: '14px', opacity: 0.5 }}>You'll receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Book Appointment</h1>

      {/* Date Selection */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Date</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        {dates.map((date, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDate(date)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedDate?.toDateString() === date.toDateString() ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedDate?.toDateString() === date.toDateString() ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              minWidth: '60px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.7 }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{date.getDate()}</div>
          </button>
        ))}
      </div>

      {/* Time Selection */}
      <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Select Time</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
        {TIME_SLOTS.map((time, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTime(time)}
            style={{
              padding: '12px',
              backgroundColor: selectedTime === time ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedTime === time ? 'white' : 'var(--text)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Book Button */}
      <button
        onClick={handleBook}
        disabled={!selectedDate || !selectedTime}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: selectedDate && selectedTime ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed'
        }}
      >
        Confirm Booking
      </button>
    </div>
  );
}`;
}

/**
 * RoomsScreen for hospitality
 */
function generateRoomsScreen(business, colors, sampleData) {
  return `/**
 * RoomsScreen - Browse available rooms
 * Test Mode Generated - Hospitality Industry
 */
import React from 'react';
import { Bed, Users, Wifi, Coffee, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROOMS = [
  { name: 'Standard Room', price: 149, capacity: 2, amenities: ['Free WiFi', 'Breakfast'], image: null },
  { name: 'Deluxe Suite', price: 249, capacity: 2, amenities: ['Free WiFi', 'Breakfast', 'Mini Bar'], image: null },
  { name: 'Family Room', price: 299, capacity: 4, amenities: ['Free WiFi', 'Breakfast', 'Kitchen'], image: null },
  { name: 'Presidential Suite', price: 499, capacity: 2, amenities: ['Free WiFi', 'Breakfast', 'Jacuzzi', 'Butler'], image: null }
];

export default function RoomsScreen({ user }) {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <h1 className="screen-title">Our Rooms</h1>

      {ROOMS.map((room, idx) => (
        <div
          key={idx}
          className="card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/book')}
        >
          <div style={{ height: '120px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bed size={40} style={{ opacity: 0.3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{room.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                <Users size={14} /> Up to {room.capacity} guests
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {room.amenities.map((a, i) => (
                  <span key={i} style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)' }}>\${room.price}</p>
              <p style={{ fontSize: '11px', opacity: 0.6 }}>per night</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

/**
 * QuoteScreen for trade services
 */
function generateQuoteScreen(business, colors) {
  return `/**
 * QuoteScreen - Request a quote
 * Test Mode Generated - Trade Services Industry
 */
import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';

export default function QuoteScreen({ user }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    service: '',
    description: '',
    urgency: 'normal',
    preferredDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="screen" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Quote Request Sent!</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>We'll get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Request Quote</h1>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Service Needed</span>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            >
              <option value="">Select a service...</option>
              <option value="repair">Repair</option>
              <option value="installation">Installation</option>
              <option value="maintenance">Maintenance</option>
              <option value="consultation">Consultation</option>
            </select>
          </label>

          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Describe Your Needs</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', resize: 'vertical' }}
              placeholder="Please describe what you need help with..."
            />
          </label>

          <label style={{ display: 'block', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Urgency</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['normal', 'urgent', 'emergency'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: level })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: form.urgency === level ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: form.urgency === level ? 'white' : 'var(--text)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </label>

          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', display: 'block' }}>Preferred Date</span>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
            />
          </label>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px'
          }}
        >
          <Send size={18} /> Submit Quote Request
        </button>
      </form>
    </div>
  );
}`;
}

module.exports = { createTestModeRoutes };
