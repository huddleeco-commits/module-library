/**
 * Generators
 * Extracted from server.cjs
 *
 * Handles: Brain.json, Tool HTML, Brain Routes, Health Routes, App.jsx, Code Validation
 */

const { VALID_LUCIDE_ICONS, ICON_REPLACEMENTS } = require('../configs/index.cjs');
const { toComponentName, toRoutePath, toNavLabel } = require('../utils/index.cjs');
const { getIndustryHeaderConfig } = require('../prompt-builders/index.cjs');

// ============================================
// BRAIN.JSON GENERATOR
// ============================================

function generateBrainJson(projectName, industryKey, industryConfig, additionalConfig = {}) {
  const cfg = industryConfig || {};
  const { adminTier, adminModules, adminReason } = additionalConfig;

  const terminologyMap = {
    'restaurant': { product: 'Menu Item', products: 'Menu Items', customer: 'Guest', customers: 'Guests' },
    'healthcare': { product: 'Service', products: 'Services', customer: 'Patient', customers: 'Patients' },
    'dental': { product: 'Service', products: 'Services', customer: 'Patient', customers: 'Patients' },
    'ecommerce': { product: 'Product', products: 'Products', customer: 'Customer', customers: 'Customers' },
    'collectibles': { product: 'Item', products: 'Items', customer: 'Collector', customers: 'Collectors' },
    'saas': { product: 'Plan', products: 'Plans', customer: 'User', customers: 'Users' },
    'law-firm': { product: 'Service', products: 'Services', customer: 'Client', customers: 'Clients' },
    'fitness': { product: 'Class', products: 'Classes', customer: 'Member', customers: 'Members' },
    'spa-salon': { product: 'Treatment', products: 'Treatments', customer: 'Client', customers: 'Clients' },
    'real-estate': { product: 'Listing', products: 'Listings', customer: 'Client', customers: 'Clients' },
    'default': { product: 'Product', products: 'Products', customer: 'Customer', customers: 'Customers' }
  };

  const terminology = terminologyMap[industryKey] || terminologyMap['default'];
  const colors = cfg.colors || { primary: '#3b82f6', accent: '#8b5cf6' };

  return JSON.stringify({
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    industry: {
      type: industryKey || 'business',
      terminology: {
        product: terminology.product,
        products: terminology.products,
        order: 'Order',
        orders: 'Orders',
        customer: terminology.customer,
        customers: terminology.customers,
        inventory: 'Inventory',
        category: 'Category',
        categories: 'Categories'
      }
    },
    business: {
      name: projectName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      tagline: '',
      logo: null,
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
      locale: 'en-US',
      address: { street: '', city: '', state: '', zip: '', country: 'USA' },
      contact: { phone: '', email: '', website: '' },
      hours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '14:00' },
        sunday: { open: 'closed', close: 'closed' }
      },
      features: {
        onlineOrdering: true,
        reservations: industryKey === 'restaurant' || industryKey === 'spa-salon',
        loyaltyProgram: false,
        giftCards: false
      }
    },
    modules: {
      dashboard: { enabled: true },
      orders: { enabled: true },
      products: { enabled: true },
      customers: { enabled: true },
      inventory: { enabled: true },
      analytics: { enabled: true },
      marketing: { enabled: true },
      ai: { enabled: true },
      settings: { enabled: true }
    },
    infrastructure: {
      frontend: { provider: 'vercel', url: null },
      backend: { provider: 'railway', url: null },
      database: { provider: 'railway', type: 'postgresql' },
      storage: { provider: 'cloudinary' },
      payments: { provider: 'stripe', connected: false }
    },
    ai: {
      enabled: true,
      provider: 'anthropic',
      features: { insights: true, chat: true, automation: true, forecasting: true }
    },
    admin: {
      tier: adminTier || 'standard',
      modules: adminModules || [],
      reason: adminReason || 'Default tier',
      enabled: true
    },
    theme: {
      mode: 'dark',
      primaryColor: colors.primary || '#3b82f6',
      accentColor: colors.accent || '#8b5cf6',
      backgroundColor: '#1A1A1A',
      textColor: '#F5F0E6',
      fonts: {
        heading: 'system-ui, sans-serif',
        body: 'system-ui, sans-serif'
      }
    },
    // Menu structure for restaurants/food businesses
    menu: generateMenuStructure(industryKey),
    // Loyalty program structure
    loyalty: generateLoyaltyStructure(industryKey)
  }, null, 2);
}

/**
 * Generate menu structure based on industry
 */
function generateMenuStructure(industry) {
  const foodIndustries = ['restaurant', 'steakhouse', 'pizza', 'pizzeria', 'cafe', 'bakery', 'bar', 'food-truck'];
  if (!foodIndustries.includes(industry)) return null;

  return {
    categories: [
      {
        id: 'main',
        name: 'Main Dishes',
        description: 'Our signature offerings',
        items: [
          { id: 1, name: 'House Special', description: 'Chef\'s signature dish', price: 24, popular: true },
          { id: 2, name: 'Daily Feature', description: 'Ask about today\'s selection', price: 22 }
        ]
      },
      {
        id: 'starters',
        name: 'Starters',
        description: 'Begin your meal',
        items: [
          { id: 3, name: 'Soup of the Day', description: 'Made fresh daily', price: 8 },
          { id: 4, name: 'House Salad', description: 'Mixed greens, house dressing', price: 10 }
        ]
      },
      {
        id: 'desserts',
        name: 'Desserts',
        description: 'Sweet endings',
        items: [
          { id: 5, name: 'Dessert of the Day', description: 'Chef\'s selection', price: 10, popular: true }
        ]
      }
    ]
  };
}

/**
 * Generate loyalty program structure
 */
function generateLoyaltyStructure(industry) {
  return {
    enabled: true,
    pointsPerDollar: 1,
    tiers: [
      { name: 'Bronze', minPoints: 0, multiplier: 1, perks: ['Earn 1pt per $1', 'Birthday reward'] },
      { name: 'Silver', minPoints: 1000, multiplier: 1.25, perks: ['Earn 1.25pt per $1', 'Priority service'] },
      { name: 'Gold', minPoints: 2500, multiplier: 1.5, perks: ['Earn 1.5pt per $1', 'Exclusive perks'] },
      { name: 'Platinum', minPoints: 5000, multiplier: 2, perks: ['Earn 2pt per $1', 'VIP access', 'Personal concierge'] }
    ],
    rewards: [
      { id: 1, name: 'Free Appetizer', points: 500, description: 'Any starter from our menu' },
      { id: 2, name: 'Free Dessert', points: 750, description: 'Chef\'s selection dessert' },
      { id: 3, name: '$25 Off', points: 1500, description: 'On orders $75+' },
      { id: 4, name: 'Free Entree', points: 3000, description: 'Up to $50 value' }
    ]
  };
}

// ============================================
// TOOL HTML GENERATOR
// ============================================

function generateToolHtml(payload) {
  const { name, toolTemplate, toolCategory, toolFeatures = [], toolFields = [], theme = {} } = payload;
  const colors = theme.colors || { primary: '#3b82f6', accent: '#8b5cf6', background: '#f8fafc' };

  // Generate form fields HTML
  const fieldsHtml = toolFields.map(field => {
    const fieldId = field.name.toLowerCase().replace(/\s+/g, '-');

    if (field.type === 'text') {
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input type="text" id="${fieldId}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
        </div>`;
    }

    if (field.type === 'number') {
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input type="number" id="${fieldId}" name="${field.name}" placeholder="${field.placeholder || '0'}" step="${field.step || '1'}" ${field.required ? 'required' : ''}>
        </div>`;
    }

    if (field.type === 'textarea') {
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <textarea id="${fieldId}" name="${field.name}" rows="4" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>
        </div>`;
    }

    if (field.type === 'select' && field.options) {
      const optionsHtml = field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <select id="${fieldId}" name="${field.name}" ${field.required ? 'required' : ''}>
            <option value="">Select...</option>
            ${optionsHtml}
          </select>
        </div>`;
    }

    if (field.type === 'date') {
      return `
        <div class="form-group">
          <label for="${fieldId}">${field.label}</label>
          <input type="date" id="${fieldId}" name="${field.name}" ${field.required ? 'required' : ''}>
        </div>`;
    }

    if (field.type === 'line-items') {
      return `
        <div class="form-group line-items">
          <label>${field.label}</label>
          <div id="${fieldId}-container" class="line-items-container">
            <div class="line-item">
              <input type="text" placeholder="Description" class="item-desc">
              <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
              <input type="number" placeholder="Price" class="item-price" step="0.01">
              <button type="button" class="remove-item" onclick="removeLineItem(this)">×</button>
            </div>
          </div>
          <button type="button" class="add-item-btn" onclick="addLineItem('${fieldId}-container')">+ Add Item</button>
        </div>`;
    }

    // Default to text input
    return `
      <div class="form-group">
        <label for="${fieldId}">${field.label}</label>
        <input type="text" id="${fieldId}" name="${field.name}" ${field.required ? 'required' : ''}>
      </div>`;
  }).join('\n');

  // Feature badges
  const featureBadges = toolFeatures.map(f =>
    `<span class="feature-badge">${f.replace(/-/g, ' ')}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    :root {
      --primary: ${colors.primary};
      --accent: ${colors.accent};
      --background: ${colors.background};
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--background);
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: var(--primary);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .tool-category {
      color: #64748b;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .features {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .feature-badge {
      background: var(--accent);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      text-transform: capitalize;
    }

    .tool-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .line-items-container {
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 0.5rem;
    }

    .line-item {
      display: grid;
      grid-template-columns: 2fr 80px 100px 40px;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .line-item input {
      padding: 0.5rem;
    }

    .remove-item {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1.25rem;
    }

    .add-item-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: opacity 0.2s;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .result-section {
      display: none;
      background: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .result-section.visible {
      display: block;
    }

    .result-section h3 {
      color: #16a34a;
      margin-bottom: 1rem;
    }

    #result-content {
      background: white;
      padding: 1rem;
      border-radius: 0.25rem;
      font-family: monospace;
      white-space: pre-wrap;
    }

    footer {
      text-align: center;
      color: #9ca3af;
      font-size: 0.75rem;
      margin-top: 2rem;
    }

    @media (max-width: 640px) {
      .line-item {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 1.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <p class="tool-category">${toolCategory}</p>
      <h1>${name}</h1>
      <div class="features">
        ${featureBadges}
      </div>
    </header>

    <div class="tool-card">
      <form id="tool-form">
        ${fieldsHtml}

        <button type="submit" class="btn-primary">Generate</button>
      </form>

      <div id="result" class="result-section">
        <h3>Result</h3>
        <div id="result-content"></div>
      </div>
    </div>

    <footer>
      <p>Generated by Blink | Powered by AI</p>
    </footer>
  </div>

  <script>
    // Line item management
    function addLineItem(containerId) {
      const container = document.getElementById(containerId);
      const item = document.createElement('div');
      item.className = 'line-item';
      item.innerHTML = \`
        <input type="text" placeholder="Description" class="item-desc">
        <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
        <input type="number" placeholder="Price" class="item-price" step="0.01">
        <button type="button" class="remove-item" onclick="removeLineItem(this)">×</button>
      \`;
      container.appendChild(item);
    }

    function removeLineItem(btn) {
      const container = btn.closest('.line-items-container');
      if (container.querySelectorAll('.line-item').length > 1) {
        btn.closest('.line-item').remove();
      }
    }

    // Form submission
    document.getElementById('tool-form').addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = {};

      // Collect form data
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Collect line items if present
      const lineItems = [];
      document.querySelectorAll('.line-item').forEach(item => {
        const desc = item.querySelector('.item-desc')?.value;
        const qty = item.querySelector('.item-qty')?.value;
        const price = item.querySelector('.item-price')?.value;
        if (desc && qty && price) {
          lineItems.push({ description: desc, quantity: parseInt(qty), price: parseFloat(price) });
        }
      });

      if (lineItems.length > 0) {
        data.lineItems = lineItems;
        data.subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        data.total = data.subtotal;
      }

      // Display result
      const resultSection = document.getElementById('result');
      const resultContent = document.getElementById('result-content');
      resultContent.textContent = JSON.stringify(data, null, 2);
      resultSection.classList.add('visible');
    });
  </script>
</body>
</html>`;
}

function generateBrainRoutes() {
  return `/**
 * Brain API Routes - Single source of truth
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');

function readBrain() {
  try {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading brain.json:', e.message);
  }
  return null;
}

function writeBrain(data) {
  try {
    fs.writeFileSync(BRAIN_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing brain.json:', e.message);
    return false;
  }
}

router.get('/', (req, res) => {
  const brain = readBrain();
  if (!brain) return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  res.json({ success: true, brain });
});

router.get('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  const section = brain[req.params.section];
  if (!section) return res.status(404).json({ success: false, error: 'Section not found' });
  res.json({ success: true, [req.params.section]: section });
});

router.put('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  brain[req.params.section] = { ...brain[req.params.section], ...req.body };
  brain.lastUpdated = new Date().toISOString();
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', [req.params.section]: brain[req.params.section] });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

router.patch('/', (req, res) => {
  const brain = readBrain();
  if (!brain) return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };
  deepMerge(brain, req.body);
  brain.lastUpdated = new Date().toISOString();
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', brain });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

module.exports = router;
`;
}

function generateHealthRoutes() {
  return `/**
 * Health Check Routes
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', async (req, res) => {
  const checks = { timestamp: new Date().toISOString(), status: 'healthy', services: {} };
  const brainPath = path.join(__dirname, '..', '..', 'brain.json');
  checks.services.brain = { status: fs.existsSync(brainPath) ? 'healthy' : 'missing' };
  try {
    const db = require('../database/db');
    await db.query('SELECT 1');
    checks.services.database = { status: 'healthy' };
  } catch (e) {
    checks.services.database = { status: 'unhealthy', error: e.message };
  }
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingEnv = requiredEnvVars.filter(v => !process.env[v]);
  checks.services.environment = { status: missingEnv.length === 0 ? 'healthy' : 'warning', missing: missingEnv };
  checks.services.stripe = { status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured' };
  checks.services.ai = { status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured' };
  const hasUnhealthy = Object.values(checks.services).some(s => s.status === 'unhealthy');
  checks.status = hasUnhealthy ? 'unhealthy' : 'healthy';
  res.json(checks);
});

router.get('/quick', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
`;
}

/**
 * Generate Menu API Routes
 * Serves menu data from brain.json
 */
function generateMenuRoutes() {
  return `/**
 * Menu API Routes
 * Serves menu data from brain.json - single source of truth
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');

function readBrain() {
  try {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading brain.json:', e.message);
  }
  return null;
}

// GET /api/menu - Get full menu
router.get('/', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.menu) {
    return res.status(500).json({ success: false, error: 'Menu not available' });
  }
  res.json({
    success: true,
    business: { name: brain.business?.name || 'Restaurant', currency: brain.business?.currencySymbol || '$' },
    menu: brain.menu
  });
});

// GET /api/menu/categories - Get category list
router.get('/categories', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.menu) return res.status(500).json({ success: false, error: 'Menu not available' });
  const categories = brain.menu.categories.map(cat => ({ id: cat.id, name: cat.name, description: cat.description, itemCount: cat.items?.length || 0 }));
  res.json({ success: true, categories });
});

// GET /api/menu/popular - Get popular items
router.get('/popular', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.menu) return res.status(500).json({ success: false, error: 'Menu not available' });
  const popularItems = [];
  for (const cat of brain.menu.categories) {
    for (const item of cat.items) {
      if (item.popular) popularItems.push({ ...item, category: cat.name });
    }
  }
  res.json({ success: true, items: popularItems });
});

module.exports = router;
`;
}

/**
 * Generate Loyalty API Routes
 */
function generateLoyaltyRoutes() {
  return `/**
 * Loyalty API Routes
 */
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');
const userPoints = new Map();

function readBrain() {
  try {
    if (fs.existsSync(BRAIN_PATH)) return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf-8'));
  } catch (e) { console.error('Error reading brain.json:', e.message); }
  return null;
}

function getUserTier(points, tiers) {
  let currentTier = tiers[0];
  for (const tier of tiers) { if (points >= tier.minPoints) currentTier = tier; }
  return currentTier;
}

router.get('/config', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.loyalty) return res.status(500).json({ success: false, error: 'Loyalty program not configured' });
  res.json({ success: true, loyalty: brain.loyalty });
});

router.get('/tiers', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.loyalty) return res.status(500).json({ success: false, error: 'Loyalty program not configured' });
  res.json({ success: true, tiers: brain.loyalty.tiers });
});

router.get('/rewards', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.loyalty) return res.status(500).json({ success: false, error: 'Loyalty program not configured' });
  res.json({ success: true, rewards: brain.loyalty.rewards });
});

router.get('/user/:userId', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.loyalty) return res.status(500).json({ success: false, error: 'Loyalty program not configured' });
  const userId = req.params.userId;
  const points = userPoints.get(userId) || 0;
  const currentTier = getUserTier(points, brain.loyalty.tiers);
  const nextTier = brain.loyalty.tiers.find(t => t.minPoints > points);
  res.json({ success: true, userId, points, tier: currentTier, nextTier: nextTier || null, pointsToNextTier: nextTier ? nextTier.minPoints - points : 0, availableRewards: brain.loyalty.rewards.filter(r => r.points <= points) });
});

router.post('/user/:userId/add', (req, res) => {
  const brain = readBrain();
  if (!brain || !brain.loyalty) return res.status(500).json({ success: false, error: 'Loyalty program not configured' });
  const { points, reason } = req.body;
  if (!points || points <= 0) return res.status(400).json({ success: false, error: 'Points must be positive' });
  const userId = req.params.userId;
  const currentPoints = userPoints.get(userId) || 0;
  const newPoints = currentPoints + points;
  userPoints.set(userId, newPoints);
  res.json({ success: true, userId, pointsAdded: points, totalPoints: newPoints, tier: getUserTier(newPoints, brain.loyalty.tiers), reason: reason || 'Points added' });
});

module.exports = router;
`;
}

/**
 * Generate Orders API Routes
 */
function generateOrdersRoutes() {
  return `/**
 * Orders API Routes
 */
const express = require('express');
const router = express.Router();

let orders = [];
let orderIdCounter = 1000;

router.post('/', (req, res) => {
  try {
    const { items, customerId, customerName, customerEmail, total, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, error: 'Order must have items' });
    const order = {
      id: ++orderIdCounter, items, customerId: customerId || null, customerName: customerName || 'Guest',
      customerEmail: customerEmail || null, total: total || items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      notes: notes || null, status: 'pending', pointsEarned: Math.floor(total || 0),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json({ success: true, order, message: 'Order placed successfully' });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/', (req, res) => {
  res.json({ success: true, orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), count: orders.length });
});

router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, order });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (orderIndex === -1) return res.status(404).json({ success: false, error: 'Order not found' });
  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  res.json({ success: true, order: orders[orderIndex] });
});

module.exports = router;
`;
}

function buildAppJsx(name, pages, promptConfig, industry) {
  const colors = promptConfig?.colors || { primary: '#0a1628', text: '#1a1a2e', textMuted: '#4a5568', accent: '#22c55e' };
  const typography = promptConfig?.typography || { heading: "Georgia, 'Times New Roman', serif" };

  // Get accent color from theme (for CTA buttons)
  const accentColor = colors.accent || colors.primary || '#22c55e';

  // Get industry-specific header configuration
  const headerConfig = getIndustryHeaderConfig(industry);

  // Industries that require authentication (expanded to all industries with companion apps)
  // Auth is needed for: user accounts, loyalty programs, order history, bookings, etc.
  const authRequiredIndustries = [
    // All food & beverage
    'restaurant', 'pizza', 'pizzeria', 'steakhouse', 'cafe', 'bar', 'bakery', 'brewery', 'winery', 'coffee-shop',
    // Healthcare & wellness
    'healthcare', 'dental', 'chiropractic', 'veterinary', 'spa-salon', 'barbershop', 'fitness', 'yoga', 'yoga-studio', 'martial-arts',
    // Professional services
    'law-firm', 'accounting', 'consulting', 'real-estate', 'insurance', 'finance', 'financial-advisor',
    // Tech & retail
    'saas', 'startup', 'agency', 'ecommerce', 'subscription-box', 'collectibles',
    // Creative & entertainment
    'photography', 'wedding', 'portfolio', 'musician', 'podcast', 'gaming',
    // Organizations & education
    'nonprofit', 'church', 'school', 'online-course',
    // Trade services
    'construction', 'plumber', 'electrician', 'hvac', 'landscaping', 'roofing', 'cleaning', 'auto-repair', 'moving',
    // Other
    'pet-services', 'event-venue', 'hotel', 'travel', 'daycare', 'tutoring', 'music-school', 'florist',
    // Legacy
    'survey-rewards', 'family'
  ];
  const needsAuth = authRequiredIndustries.includes(industry);

  // Industries that require cart functionality (product ordering, NOT service booking)
  // Service businesses (spa-salon, barbershop) use booking systems, not carts
  const cartRequiredIndustries = ['restaurant', 'ecommerce', 'retail', 'pizzeria', 'pizza', 'cafe', 'bakery', 'food-truck'];
  const needsCart = cartRequiredIndustries.includes(industry) ||
                   pages.some(p => ['menu', 'cart', 'checkout', 'order', 'products', 'services', 'booking'].includes(p.toLowerCase()));

  // Pages that require authentication (protected routes)
  const protectedPages = ['dashboard', 'earn', 'rewards', 'wallet', 'profile', 'settings', 'account'];
  
  const routeImports = pages.map(p => {
    const componentName = toComponentName(p) + 'Page';
    return `import ${componentName} from './pages/${componentName}';`;
  }).join('\n');
  
  const routeElements = pages.map(p => {
    const componentName = toComponentName(p) + 'Page';
    const routePath = toRoutePath(p);
    const isProtected = needsAuth && protectedPages.includes(p.toLowerCase().replace(/\s+/g, '-'));

    if (isProtected) {
      return `              <Route path="${routePath}" element={<ProtectedRoute><${componentName} /></ProtectedRoute>} />`;
    }
    return `              <Route path="${routePath}" element={<${componentName} />} />`;
  }).join('\n');

  // Filter out login/register from nav links
  const navPages = pages.filter(p => !['login', 'register'].includes(p.toLowerCase()));
  const navLinks = navPages.map(p => {
    const label = toNavLabel(p);
    const navPath = toRoutePath(p);
    return `            <Link to="${navPath}" style={styles.navLink}>${label}</Link>`;
  }).join('\n');
  
  // Auth imports and components
  const authImports = needsAuth ? `
// Auth components
import { AuthProvider } from './modules/auth-pages/components/AuthProvider';
import { ProtectedRoute } from './modules/auth-pages/components/ProtectedRoute';
import { LoginPage } from './modules/auth-pages/components/LoginPage';
import { RegisterPage } from './modules/auth-pages/components/RegisterPage';
import { useAuth } from './modules/auth-pages/components/AuthProvider';` : '';

  // Cart imports
  const cartImports = needsCart ? `
// Cart context
import { CartProvider } from './context/CartContext';` : '';

  const authRoutes = needsAuth ? `
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />` : '';

  const authNavButtons = needsAuth ? `
            <AuthButtons />` : '';

  const authButtonsComponent = needsAuth ? `
// Auth navigation buttons
function AuthButtons() {
  const { user, logout } = useAuth();
  
  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '${colors.textMuted}', fontSize: '14px' }}>
          {user.fullName || user.email}
        </span>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Link to="/login" style={styles.loginButton}>Login</Link>
      <Link to="/register" style={styles.registerButton}>Sign Up</Link>
    </div>
  );
}
` : '';

  const authStyles = needsAuth ? `
  loginButton: {
    color: '${colors.textMuted}',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  registerButton: {
    background: '${accentColor}',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  logoutButton: {
    background: 'transparent',
    color: '${colors.textMuted}',
    border: '1px solid #333',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },` : '';

  // Build app wrapper based on required providers
  // Order: AuthProvider (outer) > CartProvider (inner) > App content
  let appWrapperOpen = '';
  let appWrapperClose = '';
  if (needsAuth) {
    appWrapperOpen += '<AuthProvider>';
    appWrapperClose = '</AuthProvider>' + appWrapperClose;
  }
  if (needsCart) {
    appWrapperOpen += '<CartProvider>';
    appWrapperClose = '</CartProvider>' + appWrapperClose;
  }
  const appWrapper = [appWrapperOpen, appWrapperClose];

  // Build industry-specific header icons
  // Include common icons that AI pages might reference (MapPin, Phone, Mail, Star, Check, ArrowRight, etc.)
  const headerIcons = [
    'Menu', 'X',
    // Common page icons - always included to prevent "not defined" errors from AI-generated pages
    'MapPin', 'Phone', 'Mail', 'Star', 'Check', 'ArrowRight', 'ChevronRight', 'ChevronDown',
    'Calendar', 'Users', 'Award', 'Heart', 'Target', 'Sparkles', 'Quote', 'ExternalLink'
  ];
  if (headerConfig.primaryCta?.icon) headerIcons.push(headerConfig.primaryCta.icon);
  if (headerConfig.secondaryCta?.icon) headerIcons.push(headerConfig.secondaryCta.icon);
  if (headerConfig.showPhoneProminent) headerIcons.push('Phone');
  if (headerConfig.showSearch) headerIcons.push('Search');
  if (headerConfig.showCart) headerIcons.push('ShoppingCart');
  if (headerConfig.showSocialIcons) headerIcons.push('Facebook', 'Instagram');
  if (headerConfig.showHours) headerIcons.push('Clock');
  if (headerConfig.showLocation) headerIcons.push('MapPin');
  if (headerConfig.showCredentials) headerIcons.push('Shield');
  const uniqueIcons = [...new Set(headerIcons)].join(', ');

  // Build emergency banner if needed
  const emergencyBanner = headerConfig.showEmergencyBanner ? `
      {/* Emergency Banner */}
      <div style={styles.emergencyBanner}>
        <span style={styles.emergencyBadge}>${headerConfig.badgeText || '24/7'}</span>
        <span style={styles.emergencyText}>${headerConfig.emergencyText || '24/7 Emergency Service'}</span>
        <a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.emergencyPhone}>
          <Phone size={16} />
          ${headerConfig.phoneNumber || '(555) 123-4567'}
        </a>
      </div>` : '';

  // Build promo banner for retail
  const promoBanner = headerConfig.showPromoBanner ? `
      {/* Promo Banner */}
      <div style={styles.promoBanner}>
        ${headerConfig.promoText || 'Free Shipping on Orders $50+'}
      </div>` : '';

  // Build primary CTA button
  const primaryCtaCode = headerConfig.primaryCta ? `
            ${headerConfig.primaryCta.action === 'tel'
              ? `<a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.primaryCta}>
              <${headerConfig.primaryCta.icon} size={16} />
              ${headerConfig.primaryCta.text}
            </a>`
              : `<Link to="${headerConfig.primaryCta.href || '/contact'}" style={styles.primaryCta}>
              <${headerConfig.primaryCta.icon} size={16} />
              ${headerConfig.primaryCta.text}
            </Link>`
            }` : '';

  // Build secondary CTA button
  const secondaryCtaCode = headerConfig.secondaryCta ? `
            <Link to="${headerConfig.secondaryCta.href || '/contact'}" style={styles.secondaryCta}>
              <${headerConfig.secondaryCta.icon} size={16} />
              ${headerConfig.secondaryCta.text}
            </Link>` : '';

  // Build phone button for mobile
  const mobilePhoneBtn = headerConfig.mobilePhoneVisible && headerConfig.phoneNumber ? `
          <a href="tel:${(headerConfig.phoneNumber || '').replace(/[^0-9]/g, '')}" style={styles.mobilePhoneBtn}>
            <Phone size={20} />
          </a>` : '';

  // Build search for retail
  const searchBox = headerConfig.showSearch ? `
            <div style={styles.searchBox}>
              <Search size={18} style={styles.searchIcon} />
              <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>` : '';

  // Build cart for retail
  const cartIcon = headerConfig.showCart ? `
            <Link to="/cart" style={styles.cartLink}>
              <ShoppingCart size={20} />
              <span style={styles.cartBadge}>0</span>
            </Link>` : '';

  // Build hours for restaurant
  const hoursDisplay = headerConfig.showHours ? `
            <span style={styles.hoursDisplay}>
              <Clock size={14} />
              ${headerConfig.hoursText || 'Open today: 11am - 10pm'}
            </span>` : '';

  // Build credentials badge
  const credentialsBadge = headerConfig.showCredentials ? `
            <span style={styles.credentialsBadge}>
              <Shield size={14} />
              ${headerConfig.credentialsText || 'Certified'}
            </span>` : '';

  // Build social icons for entertainment
  const socialIcons = headerConfig.showSocialIcons ? `
            <div style={styles.socialIcons}>
              <a href="#" style={styles.socialLink}><Facebook size={18} /></a>
              <a href="#" style={styles.socialLink}><Instagram size={18} /></a>
            </div>` : '';

  return `/**
 * ${name} - Frontend App
 * Auto-generated by Module Library Assembler with AI
 * Header Type: ${headerConfig.type}
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ${uniqueIcons} } from 'lucide-react';
import './theme.css';
// Page imports
${routeImports}
${authImports}
${cartImports}
${authButtonsComponent}
// Mobile menu wrapper component with industry-specific header
function NavWrapper({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>${emergencyBanner}${promoBanner}
      <nav style={styles.nav}>
        <Link to="/" style={styles.navBrand}>
          <span style={styles.brandText}>${name.replace(/-/g, ' ').replace(/\s+/g, ' ').trim()}</span>
        </Link>

        {isMobile ? (
          <div style={styles.mobileActions}>${mobilePhoneBtn}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.hamburger}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        ) : (
          <>
            ${headerConfig.type === 'retail' ? searchBox : ''}
            <div style={styles.navLinks}>
${navLinks}
            </div>
            <div style={styles.navActions}>
              ${hoursDisplay}
              ${credentialsBadge}
              ${socialIcons}
              ${cartIcon}
              ${primaryCtaCode}
              ${secondaryCtaCode}
${authNavButtons}
            </div>
          </>
        )}
      </nav>

      {isMobile && menuOpen && (
        <div style={styles.mobileMenuOverlay} onClick={() => setMenuOpen(false)}>
          <div style={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
${navLinks.split('\n').map(link => link.replace('styles.navLink', 'styles.mobileNavLink')).join('\n')}
            <div style={styles.mobileCtas}>
              ${headerConfig.primaryCta ? `<Link to="${headerConfig.primaryCta.href || '/contact'}" style={styles.mobilePrimaryCta}>${headerConfig.primaryCta.text}</Link>` : ''}
              ${headerConfig.secondaryCta ? `<Link to="${headerConfig.secondaryCta.href || '/contact'}" style={styles.mobileSecondaryCta}>${headerConfig.secondaryCta.text}</Link>` : ''}
            </div>
            <div style={styles.mobileAuthButtons}>
${authNavButtons}
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

function App() {
  return (
    ${appWrapper[0]}
    <BrowserRouter>
      <div style={styles.app}>
        <NavWrapper>
          {/* Main Content */}
          <main style={styles.main}>
            <Routes>
${routeElements}${authRoutes}
            </Routes>
          </main>
          {/* Footer */}
          <footer style={styles.footer}>
            <p>© ${new Date().getFullYear()} ${name}. All rights reserved.</p>
          </footer>
        </NavWrapper>
      </div>
    </BrowserRouter>
    ${appWrapper[1]}
  );
}
// Calculate top offset based on banners
const topOffset = ${headerConfig.showEmergencyBanner ? '100' : headerConfig.showPromoBanner ? '92' : '60'};

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    color: '${colors.text}',
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  // Emergency banner (for service businesses)
  emergencyBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    padding: '8px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    zIndex: 1001,
    fontSize: '14px',
    fontWeight: '500',
  },
  emergencyBadge: {
    background: '#ffffff',
    color: '#dc2626',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
  },
  emergencyText: {
    display: 'none',
    '@media (min-width: 640px)': { display: 'inline' },
  },
  emergencyPhone: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '4px',
  },
  // Promo banner (for retail)
  promoBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: '${colors.primary}',
    color: '#ffffff',
    padding: '8px 24px',
    textAlign: 'center',
    zIndex: 1001,
    fontSize: '13px',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? (headerConfig.headerStyle === 'edgy' ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)' : headerConfig.headerStyle === 'bold' ? '#1a1a2e' : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)') : '#ffffff'}',
    borderBottom: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'none' : '1px solid rgba(10, 22, 40, 0.1)'}',
    position: 'fixed',
    top: '${headerConfig.showEmergencyBanner ? "40px" : headerConfig.showPromoBanner ? "32px" : "0"}',
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1000,
    boxSizing: 'border-box',
    ${headerConfig.glowEffect ? "boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)'," : headerConfig.headerStyle === 'edgy' ? "boxShadow: '0 2px 20px rgba(220, 38, 38, 0.2)'," : ''}
  },
  navBrand: {
    textDecoration: 'none',
  },
  brandText: {
    fontSize: '20px',
    fontWeight: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '700' : '400'}',
    fontFamily: "${typography.heading}",
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : colors.primary}',
    letterSpacing: '${headerConfig.headerStyle === 'edgy' ? '2px' : '1px'}',
    textTransform: '${headerConfig.headerStyle === 'edgy' ? 'uppercase' : 'none'}',
    ${headerConfig.glowEffect ? "textShadow: '0 0 10px rgba(147, 51, 234, 0.5)'," : headerConfig.headerStyle === 'edgy' ? "textShadow: '0 0 10px rgba(220, 38, 38, 0.3)'," : ''}
  },
  navLinks: {
    display: 'flex',
    gap: '32px',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navAuth: {
    display: 'flex',
    alignItems: 'center',
  },
  navLink: {
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.8)' : colors.textMuted}',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '${headerConfig.headerStyle === 'edgy' ? '600' : '500'}',
    letterSpacing: '${headerConfig.headerStyle === 'edgy' ? '2px' : '1px'}',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  // Primary CTA button - uses theme accent color
  primaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : headerConfig.type === 'entertainment' ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' : headerConfig.type === 'creative' ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : headerConfig.type === 'barbershop' ? '#1a1a2e' : accentColor}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '${headerConfig.headerStyle === 'edgy' ? '4px' : '8px'}',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s',
    ${headerConfig.glowEffect ? "boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)'," : headerConfig.type === 'creative' ? "boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)'," : ''}
  },
  // Secondary CTA button
  secondaryCta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : colors.primary}',
    border: '1px solid ${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}',
    textDecoration: 'none',
    borderRadius: '${headerConfig.headerStyle === 'edgy' ? '4px' : '8px'}',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  // Hours display (restaurant)
  hoursDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '${colors.textMuted}',
    fontSize: '13px',
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
  },
  // Credentials badge (professional)
  credentialsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    background: 'rgba(5, 150, 105, 0.1)',
    borderRadius: '4px',
  },
  // Social icons (entertainment)
  socialIcons: {
    display: 'flex',
    gap: '8px',
  },
  socialLink: {
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? 'rgba(255,255,255,0.7)' : colors.textMuted}',
    transition: 'color 0.2s',
  },
  // Search box (retail)
  searchBox: {
    position: 'relative',
    marginRight: '24px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  searchInput: {
    padding: '10px 12px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    width: '240px',
    fontSize: '14px',
    outline: 'none',
  },
  // Cart link (retail)
  cartLink: {
    position: 'relative',
    color: '${colors.text}',
    padding: '8px',
  },
  cartBadge: {
    position: 'absolute',
    top: '0',
    right: '0',
    background: '#dc2626',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '600',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Mobile actions container
  mobileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  // Mobile phone button (service businesses)
  mobilePhoneBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : accentColor}',
    color: '#ffffff',
    borderRadius: '50%',
    textDecoration: 'none',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '${['playful', 'edgy', 'bold'].includes(headerConfig.headerStyle) ? '#ffffff' : '#1a1a1a'}',
    cursor: 'pointer',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
    minHeight: '48px',
    marginRight: '-12px',
  },
  mobileMenuOverlay: {
    position: 'fixed',
    top: topOffset + 'px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  mobileMenu: {
    position: 'fixed',
    top: topOffset + 'px',
    left: 0,
    right: 0,
    background: '#ffffff',
    borderBottom: '1px solid rgba(10, 22, 40, 0.1)',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxHeight: 'calc(100vh - ' + topOffset + 'px)',
    overflowY: 'auto',
  },
  mobileNavLink: {
    color: '#1a1a1a',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '16px 0',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    display: 'block',
    minHeight: '48px',
    lineHeight: '16px',
  },
  mobileCtas: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '16px',
  },
  mobilePrimaryCta: {
    display: 'block',
    padding: '16px',
    background: '${headerConfig.type === 'emergency' ? '#dc2626' : headerConfig.type === 'entertainment' ? 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)' : accentColor}',
    color: '#ffffff',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
  },
  mobileSecondaryCta: {
    display: 'block',
    padding: '16px',
    background: 'transparent',
    border: '1px solid #e5e7eb',
    color: '${colors.text}',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '16px',
  },
  mobileAuthButtons: {
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
  },${authStyles}
  main: {
    flex: 1,
    paddingTop: topOffset + 'px',
  },
  footer: {
    padding: '40px 48px',
    background: '${colors.primary}',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    letterSpacing: '1px',
  },
};
export default App;
`;
}

// ============================================
// SYNTAX VALIDATION - Check AI-generated code
// ============================================
function validateGeneratedCode(code, componentName) {
  const errors = [];
  const warnings = [];
  let fixedCode = code;

  // Check for invalid Lucide icons and fix them
  const iconImportMatch = fixedCode.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (iconImportMatch) {
    const importedIcons = iconImportMatch[1].split(',').map(i => i.trim()).filter(Boolean);

    for (const icon of importedIcons) {
      if (!VALID_LUCIDE_ICONS.includes(icon)) {
        const replacement = ICON_REPLACEMENTS[icon] || 'Circle';
        // Replace in entire code
        const importRegex = new RegExp(`\\b${icon}\\b`, 'g');
        fixedCode = fixedCode.replace(importRegex, replacement);
        errors.push(`Invalid icon "${icon}" replaced with "${replacement}"`);
      }
    }

    // Deduplicate icons in import statement
    const newImportMatch = fixedCode.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
    if (newImportMatch) {
      const icons = newImportMatch[1].split(',').map(i => i.trim()).filter(Boolean);
      const uniqueIcons = [...new Set(icons)];
      if (icons.length !== uniqueIcons.length) {
        const oldImport = newImportMatch[0];
        const newImport = `import { ${uniqueIcons.join(', ')} } from 'lucide-react'`;
        fixedCode = fixedCode.replace(oldImport, newImport);
        errors.push(`Deduplicated icon imports`);
      }
    }
  }

  // ============================================
  // UNTERMINATED STRING DETECTION
  // Catches: opacity: 0.9' (trailing quote without opening)
  // ============================================
  const unterminatedStringPatterns = [
    // Number followed by trailing quote: 0.9' or 16'
    { pattern: /:\s*(\d+\.?\d*)'(?!\s*,|\s*\})/g, desc: 'number with trailing quote' },
    // Property value with mismatched quotes: 'value" or "value'
    { pattern: /:\s*'[^']*"(?=\s*[,}])/g, desc: 'mismatched quotes (single then double)' },
    { pattern: /:\s*"[^"]*'(?=\s*[,}])/g, desc: 'mismatched quotes (double then single)' },
    // Trailing quote after number in style object: opacity: 0.7'
    { pattern: /(\w+):\s*(\d+\.?\d*)'(?=\s*[,}\n])/g, desc: 'style value with orphan quote' }
  ];

  for (const { pattern, desc } of unterminatedStringPatterns) {
    const matches = fixedCode.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Skip font-family declarations - they legitimately have inner quotes like "'Inter', sans-serif"
        const isFontDeclaration = /fontFamily|font-family/i.test(match) ||
          /sans-serif|serif|monospace|Inter|Georgia|Arial|Helvetica|Roboto|Segoe/i.test(match);
        if (isFontDeclaration) continue;

        errors.push(`Unterminated string (${desc}): "${match.trim()}"`);
        // Auto-fix: remove the orphan trailing quote after numbers
        fixedCode = fixedCode.replace(/(\w+:\s*)(\d+\.?\d*)'(\s*[,}\n])/g, '$1$2$3');
      }
    }
  }

  // ============================================
  // FONT FAMILY NESTED QUOTES FIX
  // AI generates: fontFamily: "'Playfair Display'"
  // Should be:    fontFamily: "Playfair Display"
  // Note: Don't use .test() before .replace() with global regex - it advances state
  // ============================================
  const beforeFontFix = fixedCode;

  // Fix fontFamily: "'Font Name'" -> fontFamily: "Font Name"
  fixedCode = fixedCode.replace(/fontFamily:\s*["']'([^']+)'["']/g, 'fontFamily: "$1"');

  // Fix fontFamily: "'Font Name', sans-serif" -> fontFamily: "Font Name, sans-serif"
  fixedCode = fixedCode.replace(/fontFamily:\s*["']'([^']+)'([^"']*)["']/g, 'fontFamily: "$1$2"');

  // Fix in THEME objects: heading: "'Font Name', fallback" -> heading: "Font Name, fallback"
  fixedCode = fixedCode.replace(/(heading|body|primary|secondary|display|text|font):\s*["']'([^']+)'([^"']*)["']/g, '$1: "$2$3"');

  // Generic fix: Any property with nested font quotes "'Font Name', fallback"
  fixedCode = fixedCode.replace(/:\s*["']'([A-Z][a-zA-Z\s]+)'(,\s*[^"']+)?["']/g, ': "$1$2"');

  // Fix backtick template literals with nested quotes: fontFamily: `'Font Name'`
  fixedCode = fixedCode.replace(/fontFamily:\s*`'([^']+)'`/g, 'fontFamily: "$1"');

  // Fix single quotes around font names in any fontFamily/font context
  // Pattern: fontFamily: '\'Font Name\', fallback' -> fontFamily: "Font Name, fallback"
  fixedCode = fixedCode.replace(/fontFamily:\s*'\\?'([^']+)\\?'([^']*)'/g, 'fontFamily: "$1$2"');

  if (beforeFontFix !== fixedCode) {
    errors.push('Fixed nested quotes in font declarations');
  }

  // ============================================
  // JSX APOSTROPHE FIX
  // AI generates: <h2>Let's go</h2>
  // JSX parser sees the apostrophe as a quote delimiter
  // Fix by wrapping text with apostrophes in curly braces
  // ============================================
  const beforeApostropheFix = fixedCode;

  // Pattern 1: Text content with apostrophes between JSX tags
  // Match: >text with apostrophe's< but NOT inside {} or quotes
  // Replace apostrophes in JSX text with HTML entity &#39;
  fixedCode = fixedCode.replace(/>([^<{]*)'([^<{]*)</g, (match, before, after) => {
    // Skip if it looks like it's already escaped or in a code context
    if (before.includes('&#') || after.includes('&#')) return match;
    return `>${before}&#39;${after}<`;
  });

  // Pattern 2: Fix malformed quote props like suffix='""  or suffix='""
  // AI sometimes generates: suffix='"" which is broken
  // Should be: suffix={'"'}
  fixedCode = fixedCode.replace(/(\w+)='""(\s)/g, '$1={\'"\'}$2');
  fixedCode = fixedCode.replace(/(\w+)=""'(\s)/g, '$1={\'"\'}$2');
  // Also handle: suffix='" (missing closing quote entirely)
  fixedCode = fixedCode.replace(/(\w+)='"(\s+\w+=|\s*\/>|\s*>)/g, '$1={\'"\'}$2');

  // Pattern 3: Fix props with just a quote mark that breaks parsing
  // suffix="" " -> suffix={'"'}
  fixedCode = fixedCode.replace(/(\w+)=""\s*"(\s)/g, '$1={\'"\'}$2');

  if (beforeApostropheFix !== fixedCode) {
    errors.push('Fixed apostrophes/quotes in JSX content');
  }

  // ============================================
  // NUMBER LITERALS WITH COMMA SEPARATORS FIX
  // AI generates: loyaltyPoints: 2,847,
  // Should be:    loyaltyPoints: 2847,
  // ============================================
  // Match number literals with commas (not inside strings)
  // Pattern: word: number,number (like 2,847 or 10,000)
  const beforeNumberFix = fixedCode;
  // Fix numbers like 2,847 (property value context)
  fixedCode = fixedCode.replace(/:\s*(\d{1,3}),(\d{3})([,\s\n}])/g, ': $1$2$3');
  // Fix numbers like 10,000,000 (multiple commas)
  fixedCode = fixedCode.replace(/:\s*(\d{1,3}),(\d{3}),(\d{3})([,\s\n}])/g, ': $1$2$3$4');
  // Fix numbers in array context [1,000, 2,000]
  fixedCode = fixedCode.replace(/\[\s*(\d{1,3}),(\d{3})/g, '[$1$2');
  fixedCode = fixedCode.replace(/,\s*(\d{1,3}),(\d{3})([,\]])/g, ', $1$2$3');

  if (beforeNumberFix !== fixedCode) {
    errors.push('Fixed number literals with comma separators');
  }

  // Check for common AI mistakes
  if (fixedCode.includes('console log(')) {
    errors.push('Found "console log(" - should be "console.log("');
  }

  // Check for required structure
  if (!code.includes('import React')) {
    errors.push('Missing React import');
  }

  if (!code.includes('export default')) {
    errors.push('Missing export default');
  }

  // Check for balanced braces (simple check)
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }

  // Check for common syntax issues
  if (code.includes('style={{') && !code.includes('}}')) {
    errors.push('Potentially unclosed style object');
  }

  // ============================================
  // MINIMUM CONTENT CHECK
  // Ensure pages have actual content, not just shells
  // ============================================
  const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
  const MIN_LINES = 30; // Minimum for a real page
  if (lines < MIN_LINES) {
    warnings.push(`Page may be incomplete: only ${lines} lines of content (minimum: ${MIN_LINES})`);
  }

  // Check for actual JSX content (not just boilerplate)
  const hasRealContent = code.includes('<section') ||
                         code.includes('<div style') ||
                         code.includes('<h1') ||
                         code.includes('<main');
  if (!hasRealContent && lines < 50) {
    warnings.push(`Page appears to be a shell with no real content`);
  }

  // Auto-fix common issues
  fixedCode = fixedCode.replace(/console log\(/g, 'console.log(');

  // ============================================
  // HTML ENTITIES IN JAVASCRIPT EXPRESSIONS FIX
  // AI sometimes generates HTML entities inside JS code
  // e.g., handleInputChange('firstName&#39;, e.target.value)
  // These need to be converted back to actual characters
  // ============================================
  const beforeEntityFix = fixedCode;

  // AGGRESSIVE FIX: Replace ALL &#39; with ' globally
  // The JSX apostrophe fix (above) will re-add entities to JSX text content
  // But we run this BEFORE that fix re-adds them, so order matters
  // Actually, we run this AFTER the apostrophe fix, so we need to preserve
  // entities in JSX text content. Use a smarter approach:

  // Step 1: Replace &#39; everywhere EXCEPT between > and <
  // We do this by processing line by line
  const codeLines = fixedCode.split('\n');
  const fixedLines = codeLines.map(line => {
    // If line contains &#39;, check if it's in JSX text context
    if (line.includes('&#39;')) {
      // Pattern: &#39; in JS context (inside quotes, parens, braces)
      // Replace &#39; that appears inside JavaScript (not between > and <)

      // Simple approach: if &#39; appears after ( or { or ' and before ) or } or '
      // it's likely in JS context
      let result = line;

      // Fix: setActiveTab('value&#39;) -> setActiveTab('value')
      result = result.replace(/\('([^']+)&#39;\)/g, "('$1')");

      // Fix: handleInputChange('name&#39;, value) -> handleInputChange('name', value)
      result = result.replace(/\('([^']+)&#39;,/g, "('$1',");

      // Fix: ==='value&#39; or === 'value&#39;
      result = result.replace(/===\s*'([^']+)&#39;/g, "=== '$1'");

      // Fix: 'string&#39; in any context (JS string with entity at end)
      result = result.replace(/'([^'>]+)&#39;/g, (match, content) => {
        // Only fix if not followed by < (which would indicate JSX text)
        return `'${content}'`;
      });

      // Fix: &#39; followed by ) or } or , (clearly JS context)
      result = result.replace(/&#39;([\)\},])/g, "'$1");

      return result;
    }
    return line;
  });
  fixedCode = fixedLines.join('\n');

  // Fix &#34; (double quote) - less common but handle it
  fixedCode = fixedCode.replace(/&#34;/g, '"');

  if (beforeEntityFix !== fixedCode) {
    errors.push('Fixed HTML entities in JavaScript expressions');
  }

  // ============================================
  // BABEL SYNTAX CHECK (if available)
  // ============================================
  let parseError = null;
  try {
    const babel = require('@babel/core');
    babel.parseSync(fixedCode, {
      presets: ['@babel/preset-react'],
      filename: `${componentName}.jsx`,
      sourceType: 'module'
    });
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      // Babel not available in production, skip
    } else if (e.message) {
      parseError = e.message;
      // Extract line number if available
      const lineMatch = e.message.match(/\((\d+):(\d+)\)/);
      if (lineMatch) {
        errors.push(`Syntax error at line ${lineMatch[1]}, column ${lineMatch[2]}: ${e.message.split('\n')[0]}`);
      } else {
        errors.push(`Syntax error: ${e.message.split('\n')[0]}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedCode,
    parseError,
    stats: {
      lines,
      hasRealContent
    }
  };
}

// Companion app generator
const { generateCompanionApp, QUICK_ACTION_CONFIG } = require('./companion-generator.cjs');

module.exports = {
  generateBrainJson,
  generateToolHtml,
  generateBrainRoutes,
  generateHealthRoutes,
  // API route generators for menu, loyalty, orders
  generateMenuRoutes,
  generateLoyaltyRoutes,
  generateOrdersRoutes,
  // App builder
  buildAppJsx,
  validateGeneratedCode,
  // Companion apps
  generateCompanionApp,
  QUICK_ACTION_CONFIG
};
