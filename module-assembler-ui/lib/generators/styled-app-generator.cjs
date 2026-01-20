/**
 * Styled App Generator
 * Generates complete single-file apps with:
 * - Multiple views/screens with hash-based navigation
 * - State management with localStorage persistence
 * - Charts and visualizations
 * - Export functionality
 *
 * Phase 1 Customization Options:
 * - Font (Google Fonts)
 * - Layout (default, compact, spacious, minimal)
 * - Theme (dark, light, auto)
 * - Colors (primary, secondary, accent)
 * - Icon Style (emoji, minimal, circles, squares)
 */

// ============================================
// LAYOUT CONFIGS
// ============================================
const LAYOUT_CONFIGS = {
  default: {
    containerPadding: '24px',
    containerMax: '900px',
    cardPadding: '24px',
    cardRadius: '16px',
    gap: '16px',
    headerMargin: '32px',
    inputPadding: '12px 16px',
    buttonPadding: '12px 24px',
    fontSize: '1rem',
  },
  compact: {
    containerPadding: '16px',
    containerMax: '800px',
    cardPadding: '16px',
    cardRadius: '12px',
    gap: '12px',
    headerMargin: '20px',
    inputPadding: '10px 12px',
    buttonPadding: '10px 18px',
    fontSize: '0.9rem',
  },
  spacious: {
    containerPadding: '32px',
    containerMax: '1000px',
    cardPadding: '32px',
    cardRadius: '20px',
    gap: '24px',
    headerMargin: '48px',
    inputPadding: '16px 20px',
    buttonPadding: '16px 32px',
    fontSize: '1.05rem',
  },
  minimal: {
    containerPadding: '24px',
    containerMax: '700px',
    cardPadding: '20px',
    cardRadius: '8px',
    gap: '16px',
    headerMargin: '24px',
    inputPadding: '12px 14px',
    buttonPadding: '12px 24px',
    fontSize: '0.95rem',
  },
};

// ============================================
// THEME CONFIGS
// ============================================
const THEME_CONFIGS = {
  dark: {
    bg: '#0f0f14',
    cardBg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    text: '#fff',
    textMuted: 'rgba(255,255,255,0.6)',
    inputBg: 'rgba(255,255,255,0.05)',
  },
  light: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
    inputBg: '#f1f5f9',
  },
};

// ============================================
// GOOGLE FONTS IMPORT MAP
// ============================================
const FONT_IMPORTS = {
  'system': '',
  'inter': '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");',
  'poppins': '@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");',
  'roboto': '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");',
  'opensans': '@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap");',
  'lato': '@import url("https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap");',
  'montserrat': '@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap");',
  'nunito': '@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap");',
  'raleway': '@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap");',
  'ubuntu': '@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap");',
  'playfair': '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap");',
  'merriweather': '@import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap");',
  'space-mono': '@import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap");',
  'jetbrains': '@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap");',
};

// ============================================
// GENERATE CSS FUNCTION
// ============================================
function generateAppCSS(config) {
  const {
    color = '#8b5cf6',
    secondaryColor = '#06b6d4',
    accentColor = '#f59e0b',
    font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontId = 'system',
    layout = 'default',
    theme = 'dark',
  } = config;

  const layoutConfig = LAYOUT_CONFIGS[layout] || LAYOUT_CONFIGS.default;
  const themeConfig = THEME_CONFIGS[theme === 'auto' ? 'dark' : theme] || THEME_CONFIGS.dark;
  const fontImport = FONT_IMPORTS[fontId] || '';

  // Auto theme uses media query
  const autoThemeCSS = theme === 'auto' ? `
    @media (prefers-color-scheme: light) {
      :root {
        --bg: ${THEME_CONFIGS.light.bg};
        --card-bg: ${THEME_CONFIGS.light.cardBg};
        --border: ${THEME_CONFIGS.light.border};
        --text: ${THEME_CONFIGS.light.text};
        --text-muted: ${THEME_CONFIGS.light.textMuted};
        --input-bg: ${THEME_CONFIGS.light.inputBg};
      }
      .modal { background: #fff; }
    }
  ` : '';

  // Light theme specific overrides
  const lightThemeCSS = theme === 'light' ? `
    .modal { background: #fff; }
    .nav-tab:hover:not(.active) { background: rgba(0,0,0,0.05); }
    .list-item { background: rgba(0,0,0,0.02); }
    .list-item:hover { background: rgba(0,0,0,0.04); }
    .btn-secondary { background: rgba(0,0,0,0.1); }
    .btn-secondary:hover { background: rgba(0,0,0,0.15); }
  ` : '';

  return `
    ${fontImport}
    :root {
      --primary: ${color};
      --primary-light: ${color}20;
      --primary-dark: ${color}dd;
      --secondary: ${secondaryColor};
      --accent: ${accentColor};
      --bg: ${themeConfig.bg};
      --card-bg: ${themeConfig.cardBg};
      --border: ${themeConfig.border};
      --text: ${themeConfig.text};
      --text-muted: ${themeConfig.textMuted};
      --input-bg: ${themeConfig.inputBg};
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    ${autoThemeCSS}
    body {
      font-family: ${font};
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      margin: 0;
      font-size: ${layoutConfig.fontSize};
    }
    .app-container {
      max-width: ${layoutConfig.containerMax};
      margin: 0 auto;
      padding: ${layoutConfig.containerPadding};
      min-height: 100vh;
    }
    .app-header {
      text-align: center;
      margin-bottom: ${layoutConfig.headerMargin};
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    .app-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, var(--primary), ${color}99);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .app-subtitle {
      color: var(--text-muted);
      margin: 0;
    }
    .nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: ${layoutConfig.gap};
      padding: 8px;
      background: var(--card-bg);
      border-radius: ${layoutConfig.cardRadius};
      border: 1px solid var(--border);
    }
    .nav-tab {
      flex: 1;
      padding: ${layoutConfig.inputPadding};
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .nav-tab.active {
      background: var(--primary);
      color: #fff;
    }
    .nav-tab:hover:not(.active) {
      background: rgba(255,255,255,0.05);
      color: var(--text);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: ${layoutConfig.cardRadius};
      padding: ${layoutConfig.cardPadding};
      margin-bottom: ${layoutConfig.gap};
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--text);
    }
    .form-group {
      margin-bottom: ${layoutConfig.gap};
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .form-input, .form-select {
      width: 100%;
      padding: ${layoutConfig.inputPadding};
      font-size: 1rem;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus, .form-select:focus {
      border-color: var(--primary);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: ${layoutConfig.gap};
    }
    .btn {
      padding: ${layoutConfig.buttonPadding};
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.1);
      color: var(--text);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.15);
    }
    .btn-danger {
      background: var(--danger);
      color: #fff;
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 0.85rem;
    }
    .btn-block {
      width: 100%;
    }
    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${layoutConfig.cardPadding};
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 8px;
      transition: all 0.2s;
    }
    .list-item:hover {
      background: rgba(255,255,255,0.04);
      border-color: var(--primary);
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: ${layoutConfig.gap};
      margin-bottom: ${layoutConfig.gap};
    }
    .stat-card {
      text-align: center;
      padding: ${layoutConfig.cardPadding};
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: ${layoutConfig.cardRadius};
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }
    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .amount {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .amount.positive { color: var(--success); }
    .amount.negative { color: var(--danger); }
    .brand-footer {
      text-align: center;
      padding: 24px;
      color: var(--text-muted);
      font-size: 0.8rem;
      margin-top: ${layoutConfig.headerMargin};
      border-top: 1px solid var(--border);
    }
    .view { display: none; }
    .view.active { display: block; }
    .chart-container {
      height: 300px;
      margin: 20px 0;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: ${theme === 'light' ? '#fff' : '#1a1a24'};
      border: 1px solid var(--border);
      border-radius: ${layoutConfig.cardRadius};
      padding: ${layoutConfig.cardPadding};
      width: 90%;
      max-width: 500px;
    }
    .modal-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 20px 0;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    ${lightThemeCSS}
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;
}

// ============================================
// APP GENERATORS
// ============================================

const APP_GENERATORS = {
  'expense-tracker': (config) => generateExpenseTracker(config),
  'habit-tracker': (config) => generateHabitTracker(config),
  'project-timer': (config) => generateProjectTimer(config),
  'bookmark-manager': (config) => generateBookmarkManager(config),
};

// ============================================
// EXPENSE TRACKER
// ============================================

function generateExpenseTracker(config) {
  const { name, color, categories, branding } = config;
  const appName = branding?.appName || name || 'Expense Tracker';

  // Use the new generateAppCSS with full config support
  const css = generateAppCSS({
    color: color || '#10b981',
    secondaryColor: config.secondaryColor || '#06b6d4',
    accentColor: config.accentColor || '#f59e0b',
    font: config.font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontId: config.fontId || 'system',
    layout: config.layout || 'default',
    theme: config.theme || 'dark',
  });

  const categoriesJSON = JSON.stringify(categories || ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health']);
  const primaryColor = color || '#10b981';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    ${css}

    .expense-amount {
      font-family: monospace;
      font-size: 1.1rem;
    }
    .expense-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .expense-note {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .expense-info {
      flex: 1;
    }
    .delete-btn {
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--danger);
      color: var(--danger);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .delete-btn:hover {
      background: var(--danger);
      color: #fff;
    }
    .budget-bar {
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .budget-fill {
      height: 100%;
      transition: width 0.3s;
    }
    .budget-text {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .filter-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .filter-btn {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .filter-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">${appName}</h1>
      <p class="app-subtitle">Track your spending and stay on budget</p>
    </header>

    <nav class="nav-tabs">
      <button class="nav-tab active" data-view="dashboard" onclick="showView('dashboard')">Dashboard</button>
      <button class="nav-tab" data-view="add" onclick="showView('add')">Add Expense</button>
      <button class="nav-tab" data-view="history" onclick="showView('history')">History</button>
      <button class="nav-tab" data-view="settings" onclick="showView('settings')">Settings</button>
    </nav>

    <!-- Dashboard View -->
    <div id="dashboard" class="view active">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value" id="stat-today">$0</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-week">$0</div>
          <div class="stat-label">This Week</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-month">$0</div>
          <div class="stat-label">This Month</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-count">0</div>
          <div class="stat-label">Total Expenses</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Monthly Spending</h3>
        <div class="chart-container">
          <canvas id="monthlyChart"></canvas>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Spending by Category</h3>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Budget Status</h3>
        <div id="budget-status">
          <p style="color: var(--text-muted)">Set a monthly budget in Settings</p>
        </div>
      </div>
    </div>

    <!-- Add Expense View -->
    <div id="add" class="view">
      <div class="card">
        <h3 class="card-title">Add New Expense</h3>
        <form id="expense-form" onsubmit="addExpense(event)">
          <div class="form-group">
            <label class="form-label">Amount</label>
            <input type="number" class="form-input" id="expense-amount" step="0.01" min="0" placeholder="0.00" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="expense-category" required></select>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-input" id="expense-date" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Note (optional)</label>
            <input type="text" class="form-input" id="expense-note" placeholder="What was this for?">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Add Expense</button>
        </form>
      </div>

      <div class="card">
        <h3 class="card-title">Quick Add</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <button class="btn btn-secondary btn-sm" onclick="quickAdd(5, 'Food')">$5 Food</button>
          <button class="btn btn-secondary btn-sm" onclick="quickAdd(10, 'Transport')">$10 Transport</button>
          <button class="btn btn-secondary btn-sm" onclick="quickAdd(20, 'Shopping')">$20 Shopping</button>
          <button class="btn btn-secondary btn-sm" onclick="quickAdd(50, 'Bills')">$50 Bills</button>
        </div>
      </div>
    </div>

    <!-- History View -->
    <div id="history" class="view">
      <div class="filter-row" id="category-filters"></div>
      <div id="expense-list"></div>
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="btn btn-secondary" onclick="exportCSV()">Export CSV</button>
        <button class="btn btn-danger" onclick="clearAllData()">Clear All Data</button>
      </div>
    </div>

    <!-- Settings View -->
    <div id="settings" class="view">
      <div class="card">
        <h3 class="card-title">Monthly Budget</h3>
        <div class="form-group">
          <label class="form-label">Budget Amount</label>
          <input type="number" class="form-input" id="budget-amount" step="1" min="0" placeholder="1000">
        </div>
        <button class="btn btn-primary" onclick="saveBudget()">Save Budget</button>
      </div>

      <div class="card">
        <h3 class="card-title">Categories</h3>
        <div id="category-list" style="margin-bottom: 16px;"></div>
        <div style="display: flex; gap: 8px;">
          <input type="text" class="form-input" id="new-category" placeholder="New category name" style="flex: 1;">
          <button class="btn btn-primary" onclick="addCategory()">Add</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Data Management</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Your data is stored locally on this device.</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="exportData()">Export Data</button>
          <button class="btn btn-secondary" onclick="document.getElementById('import-file').click()">Import Data</button>
          <input type="file" id="import-file" accept=".json" onchange="importData(event)" style="display: none;">
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${appName} | Powered by Blink
    </footer>
  </div>

  <script>
    // State
    let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    let categories = JSON.parse(localStorage.getItem('categories') || '${categoriesJSON.replace(/'/g, "\\'")}');
    let budget = parseFloat(localStorage.getItem('budget') || '0');
    let currentFilter = 'all';
    let monthlyChart = null;
    let categoryChart = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('expense-date').valueAsDate = new Date();
      renderCategories();
      renderExpenses();
      updateStats();
      renderCharts();
      renderBudget();

      // Handle hash navigation
      window.addEventListener('hashchange', handleHash);
      handleHash();
    });

    function handleHash() {
      const hash = window.location.hash.slice(1) || 'dashboard';
      showView(hash);
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      document.querySelector('[data-view="' + viewId + '"]').classList.add('active');
      window.location.hash = viewId;

      if (viewId === 'dashboard') {
        renderCharts();
      }
    }

    function renderCategories() {
      const select = document.getElementById('expense-category');
      select.innerHTML = categories.map(c => '<option value="' + c + '">' + c + '</option>').join('');

      const list = document.getElementById('category-list');
      list.innerHTML = categories.map(c =>
        '<div class="list-item"><span>' + c + '</span><button class="delete-btn" onclick="removeCategory(\\'' + c + '\\')">Remove</button></div>'
      ).join('');

      const filters = document.getElementById('category-filters');
      filters.innerHTML = '<button class="filter-btn ' + (currentFilter === 'all' ? 'active' : '') + '" onclick="filterExpenses(\\'all\\')">All</button>' +
        categories.map(c => '<button class="filter-btn ' + (currentFilter === c ? 'active' : '') + '" onclick="filterExpenses(\\'' + c + '\\')">' + c + '</button>').join('');
    }

    function addCategory() {
      const input = document.getElementById('new-category');
      const name = input.value.trim();
      if (name && !categories.includes(name)) {
        categories.push(name);
        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
        input.value = '';
      }
    }

    function removeCategory(name) {
      if (categories.length <= 1) {
        alert('You need at least one category');
        return;
      }
      categories = categories.filter(c => c !== name);
      localStorage.setItem('categories', JSON.stringify(categories));
      renderCategories();
    }

    function addExpense(e) {
      e.preventDefault();
      const expense = {
        id: Date.now(),
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value,
        note: document.getElementById('expense-note').value,
      };
      expenses.unshift(expense);
      saveExpenses();
      e.target.reset();
      document.getElementById('expense-date').valueAsDate = new Date();
      showView('dashboard');
    }

    function quickAdd(amount, category) {
      const expense = {
        id: Date.now(),
        amount: amount,
        category: category,
        date: new Date().toISOString().split('T')[0],
        note: 'Quick add',
      };
      expenses.unshift(expense);
      saveExpenses();
      updateStats();
    }

    function saveExpenses() {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      renderExpenses();
      updateStats();
      renderCharts();
      renderBudget();
    }

    function deleteExpense(id) {
      expenses = expenses.filter(e => e.id !== id);
      saveExpenses();
    }

    function filterExpenses(category) {
      currentFilter = category;
      renderCategories();
      renderExpenses();
    }

    function renderExpenses() {
      const list = document.getElementById('expense-list');
      let filtered = expenses;
      if (currentFilter !== 'all') {
        filtered = expenses.filter(e => e.category === currentFilter);
      }

      if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No expenses yet. Start tracking!</p></div>';
        return;
      }

      list.innerHTML = filtered.map(e =>
        '<div class="list-item">' +
          '<div class="expense-info">' +
            '<div><span class="category-badge">' + e.category + '</span></div>' +
            '<div class="expense-note">' + (e.note || 'No note') + '</div>' +
            '<div class="expense-date">' + formatDate(e.date) + '</div>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 16px;">' +
            '<span class="expense-amount amount negative">-$' + e.amount.toFixed(2) + '</span>' +
            '<button class="delete-btn" onclick="deleteExpense(' + e.id + ')">Delete</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    function updateStats() {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      const todayTotal = expenses.filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0);
      const weekTotal = expenses.filter(e => e.date >= weekAgo).reduce((sum, e) => sum + e.amount, 0);
      const monthTotal = expenses.filter(e => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0);

      document.getElementById('stat-today').textContent = '$' + todayTotal.toFixed(2);
      document.getElementById('stat-week').textContent = '$' + weekTotal.toFixed(2);
      document.getElementById('stat-month').textContent = '$' + monthTotal.toFixed(2);
      document.getElementById('stat-count').textContent = expenses.length;
    }

    function renderCharts() {
      // Monthly chart
      const months = [];
      const monthlyTotals = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = d.toISOString().slice(0, 7);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        const total = expenses
          .filter(e => e.date.startsWith(monthKey))
          .reduce((sum, e) => sum + e.amount, 0);
        monthlyTotals.push(total);
      }

      const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
      if (monthlyChart) monthlyChart.destroy();
      monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: 'Spending',
            data: monthlyTotals,
            backgroundColor: '${primaryColor}80',
            borderColor: '${primaryColor}',
            borderWidth: 2,
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)' } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)' } }
          }
        }
      });

      // Category chart
      const catTotals = {};
      expenses.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
      });
      const catLabels = Object.keys(catTotals);
      const catData = Object.values(catTotals);

      const catColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

      const catCtx = document.getElementById('categoryChart').getContext('2d');
      if (categoryChart) categoryChart.destroy();
      categoryChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: catLabels,
          datasets: [{
            data: catData,
            backgroundColor: catColors.slice(0, catLabels.length),
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: 'rgba(255,255,255,0.7)', padding: 16 }
            }
          }
        }
      });
    }

    function renderBudget() {
      const container = document.getElementById('budget-status');
      document.getElementById('budget-amount').value = budget || '';

      if (!budget) {
        container.innerHTML = '<p style="color: var(--text-muted)">Set a monthly budget in Settings</p>';
        return;
      }

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const monthTotal = expenses.filter(e => e.date >= monthStart).reduce((sum, e) => sum + e.amount, 0);
      const percent = Math.min(100, (monthTotal / budget) * 100);
      const remaining = budget - monthTotal;
      const color = percent > 90 ? 'var(--danger)' : percent > 70 ? 'var(--warning)' : 'var(--success)';

      container.innerHTML =
        '<div class="budget-bar"><div class="budget-fill" style="width: ' + percent + '%; background: ' + color + ';"></div></div>' +
        '<div class="budget-text"><span>$' + monthTotal.toFixed(2) + ' spent</span><span>$' + remaining.toFixed(2) + ' remaining</span></div>';
    }

    function saveBudget() {
      budget = parseFloat(document.getElementById('budget-amount').value) || 0;
      localStorage.setItem('budget', budget.toString());
      renderBudget();
      alert('Budget saved!');
    }

    function exportCSV() {
      const headers = ['Date', 'Category', 'Amount', 'Note'];
      const rows = expenses.map(e => [e.date, e.category, e.amount.toFixed(2), e.note || '']);
      const csv = [headers, ...rows].map(r => r.map(c => '"' + c + '"').join(',')).join('\\n');
      downloadFile(csv, 'expenses.csv', 'text/csv');
    }

    function exportData() {
      const data = JSON.stringify({ expenses, categories, budget }, null, 2);
      downloadFile(data, 'expense-tracker-backup.json', 'application/json');
    }

    function importData(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          if (data.expenses) expenses = data.expenses;
          if (data.categories) categories = data.categories;
          if (data.budget) budget = data.budget;
          localStorage.setItem('expenses', JSON.stringify(expenses));
          localStorage.setItem('categories', JSON.stringify(categories));
          localStorage.setItem('budget', budget.toString());
          renderCategories();
          renderExpenses();
          updateStats();
          renderCharts();
          renderBudget();
          alert('Data imported successfully!');
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }

    function clearAllData() {
      if (confirm('Are you sure? This will delete all expenses.')) {
        expenses = [];
        saveExpenses();
      }
    }

    function downloadFile(content, filename, type) {
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }

    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  </script>
</body>
</html>`;
}

// ============================================
// HABIT TRACKER
// ============================================

function generateHabitTracker(config) {
  const { name, color, categories, branding } = config;
  const appName = branding?.appName || name || 'Habit Tracker';

  // Use the new generateAppCSS with full config support
  const css = generateAppCSS({
    color: color || '#8b5cf6',
    secondaryColor: config.secondaryColor || '#06b6d4',
    accentColor: config.accentColor || '#f59e0b',
    font: config.font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontId: config.fontId || 'system',
    layout: config.layout || 'default',
    theme: config.theme || 'dark',
  });

  const defaultHabits = categories || ['Exercise', 'Reading', 'Meditation', 'Water', 'Sleep 8h', 'No Social Media'];
  const primaryColor = color || '#8b5cf6';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    ${css}

    .habit-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .habit-item.completed {
      background: ${primaryColor}15;
      border-color: ${primaryColor}40;
    }
    .habit-checkbox {
      width: 28px;
      height: 28px;
      border: 2px solid var(--border);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 1rem;
    }
    .habit-item.completed .habit-checkbox {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .habit-name {
      flex: 1;
      font-weight: 500;
    }
    .habit-item.completed .habit-name {
      text-decoration: line-through;
      opacity: 0.7;
    }
    .streak-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: var(--warning);
      color: #000;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-top: 16px;
    }
    .calendar-header {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 0.85rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
    }
    .calendar-day.empty {
      background: transparent;
      border: none;
    }
    .calendar-day.today {
      border-color: var(--primary);
      font-weight: 700;
    }
    .calendar-day.completed {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    .calendar-day.partial {
      background: ${primaryColor}40;
      border-color: ${primaryColor}60;
    }
    .progress-ring {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
    }
    .progress-ring circle {
      fill: none;
      stroke-width: 8;
    }
    .progress-ring .bg {
      stroke: rgba(255,255,255,0.1);
    }
    .progress-ring .progress {
      stroke: var(--primary);
      stroke-linecap: round;
      transform: rotate(-90deg);
      transform-origin: center;
      transition: stroke-dashoffset 0.5s;
    }
    .progress-text {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-top: -80px;
      margin-bottom: 40px;
    }
    .month-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .month-nav button {
      padding: 8px 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 8px;
      cursor: pointer;
    }
    .month-name {
      font-weight: 600;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">${appName}</h1>
      <p class="app-subtitle">Build better habits, one day at a time</p>
    </header>

    <nav class="nav-tabs">
      <button class="nav-tab active" data-view="today" onclick="showView('today')">Today</button>
      <button class="nav-tab" data-view="calendar" onclick="showView('calendar')">Calendar</button>
      <button class="nav-tab" data-view="stats" onclick="showView('stats')">Stats</button>
      <button class="nav-tab" data-view="settings" onclick="showView('settings')">Settings</button>
    </nav>

    <!-- Today View -->
    <div id="today" class="view active">
      <div class="card" style="text-align: center; margin-bottom: 24px;">
        <svg class="progress-ring" viewBox="0 0 120 120">
          <circle class="bg" cx="60" cy="60" r="52"/>
          <circle class="progress" id="progress-circle" cx="60" cy="60" r="52"/>
        </svg>
        <div class="progress-text" id="progress-text">0%</div>
        <p style="color: var(--text-muted);" id="completion-text">Complete your habits!</p>
      </div>

      <div id="habit-list"></div>
    </div>

    <!-- Calendar View -->
    <div id="calendar" class="view">
      <div class="card">
        <div class="month-nav">
          <button onclick="changeMonth(-1)">&larr; Prev</button>
          <span class="month-name" id="month-name"></span>
          <button onclick="changeMonth(1)">Next &rarr;</button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-header">Sun</div>
          <div class="calendar-header">Mon</div>
          <div class="calendar-header">Tue</div>
          <div class="calendar-header">Wed</div>
          <div class="calendar-header">Thu</div>
          <div class="calendar-header">Fri</div>
          <div class="calendar-header">Sat</div>
        </div>
        <div class="calendar-grid" id="calendar-days"></div>
      </div>

      <div class="card" style="margin-top: 16px;">
        <p style="color: var(--text-muted); font-size: 0.85rem;">
          <span style="display: inline-block; width: 12px; height: 12px; background: var(--primary); border-radius: 3px; margin-right: 4px;"></span> All habits completed
          <span style="display: inline-block; width: 12px; height: 12px; background: ${primaryColor}40; border-radius: 3px; margin-left: 12px; margin-right: 4px;"></span> Some habits completed
        </p>
      </div>
    </div>

    <!-- Stats View -->
    <div id="stats" class="view">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value" id="stat-streak">0</div>
          <div class="stat-label">Current Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-best">0</div>
          <div class="stat-label">Best Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-total">0</div>
          <div class="stat-label">Total Completions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-rate">0%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Habit Performance</h3>
        <div id="habit-stats"></div>
      </div>
    </div>

    <!-- Settings View -->
    <div id="settings" class="view">
      <div class="card">
        <h3 class="card-title">Your Habits</h3>
        <div id="settings-habit-list"></div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <input type="text" class="form-input" id="new-habit" placeholder="Add a new habit..." style="flex: 1;">
          <button class="btn btn-primary" onclick="addHabit()">Add</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Data</h3>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="exportData()">Export</button>
          <button class="btn btn-danger" onclick="resetData()">Reset All</button>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${appName} | Powered by Blink
    </footer>
  </div>

  <script>
    // State
    let habits = JSON.parse(localStorage.getItem('habits') || '${JSON.stringify(defaultHabits.map((h, i) => ({ id: i + 1, name: h })))}');
    let completions = JSON.parse(localStorage.getItem('completions') || '{}');
    let viewingMonth = new Date();

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      render();
      window.addEventListener('hashchange', handleHash);
      handleHash();
    });

    function handleHash() {
      const hash = window.location.hash.slice(1) || 'today';
      showView(hash);
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      document.querySelector('[data-view="' + viewId + '"]').classList.add('active');
      window.location.hash = viewId;
      render();
    }

    function getToday() {
      return new Date().toISOString().split('T')[0];
    }

    function getTodayCompletions() {
      return completions[getToday()] || [];
    }

    function toggleHabit(habitId) {
      const today = getToday();
      if (!completions[today]) completions[today] = [];

      const index = completions[today].indexOf(habitId);
      if (index === -1) {
        completions[today].push(habitId);
      } else {
        completions[today].splice(index, 1);
      }

      localStorage.setItem('completions', JSON.stringify(completions));
      render();
    }

    function render() {
      renderTodayView();
      renderCalendar();
      renderStats();
      renderSettings();
    }

    function renderTodayView() {
      const todayComps = getTodayCompletions();
      const completed = todayComps.length;
      const total = habits.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Progress ring
      const circle = document.getElementById('progress-circle');
      const circumference = 2 * Math.PI * 52;
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;

      document.getElementById('progress-text').textContent = percent + '%';
      document.getElementById('completion-text').textContent =
        completed === total ? 'All habits completed! Great job!' :
        completed + ' of ' + total + ' habits completed';

      // Habit list
      const list = document.getElementById('habit-list');
      list.innerHTML = habits.map(h => {
        const isCompleted = todayComps.includes(h.id);
        const streak = calculateStreak(h.id);
        return '<div class="habit-item ' + (isCompleted ? 'completed' : '') + '" onclick="toggleHabit(' + h.id + ')">' +
          '<div class="habit-checkbox">' + (isCompleted ? '✓' : '') + '</div>' +
          '<span class="habit-name">' + h.name + '</span>' +
          (streak > 1 ? '<span class="streak-badge">🔥 ' + streak + '</span>' : '') +
        '</div>';
      }).join('');
    }

    function calculateStreak(habitId) {
      let streak = 0;
      let date = new Date();

      while (true) {
        const dateStr = date.toISOString().split('T')[0];
        const dayComps = completions[dateStr] || [];

        if (dayComps.includes(habitId)) {
          streak++;
          date.setDate(date.getDate() - 1);
        } else if (dateStr === getToday()) {
          date.setDate(date.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    }

    function renderCalendar() {
      const year = viewingMonth.getFullYear();
      const month = viewingMonth.getMonth();

      document.getElementById('month-name').textContent =
        viewingMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = getToday();

      let html = '';

      // Empty cells for days before start
      for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const dayComps = completions[dateStr] || [];
        const isToday = dateStr === today;
        const isComplete = dayComps.length === habits.length && habits.length > 0;
        const isPartial = dayComps.length > 0 && dayComps.length < habits.length;

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isComplete) classes += ' completed';
        else if (isPartial) classes += ' partial';

        html += '<div class="' + classes + '">' + day + '</div>';
      }

      document.getElementById('calendar-days').innerHTML = html;
    }

    function changeMonth(delta) {
      viewingMonth.setMonth(viewingMonth.getMonth() + delta);
      renderCalendar();
    }

    function renderStats() {
      // Calculate stats
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;
      let totalCompletions = 0;
      let totalDays = 0;

      const sortedDates = Object.keys(completions).sort().reverse();

      sortedDates.forEach((date, i) => {
        const dayComps = completions[date];
        totalCompletions += dayComps.length;
        if (dayComps.length === habits.length && habits.length > 0) {
          totalDays++;
          tempStreak++;
          if (tempStreak > bestStreak) bestStreak = tempStreak;
          if (i === 0 || (i === 1 && date === getToday())) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      });

      const possibleCompletions = sortedDates.length * habits.length;
      const rate = possibleCompletions > 0 ? Math.round((totalCompletions / possibleCompletions) * 100) : 0;

      document.getElementById('stat-streak').textContent = currentStreak;
      document.getElementById('stat-best').textContent = bestStreak;
      document.getElementById('stat-total').textContent = totalCompletions;
      document.getElementById('stat-rate').textContent = rate + '%';

      // Per-habit stats
      const habitStats = document.getElementById('habit-stats');
      habitStats.innerHTML = habits.map(h => {
        const completionCount = Object.values(completions).filter(c => c.includes(h.id)).length;
        const totalDays = Object.keys(completions).length || 1;
        const habitRate = Math.round((completionCount / totalDays) * 100);

        return '<div class="list-item">' +
          '<span>' + h.name + '</span>' +
          '<div style="display: flex; align-items: center; gap: 12px;">' +
            '<div style="width: 100px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">' +
              '<div style="width: ' + habitRate + '%; height: 100%; background: var(--primary);"></div>' +
            '</div>' +
            '<span style="font-weight: 600; min-width: 40px;">' + habitRate + '%</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderSettings() {
      const list = document.getElementById('settings-habit-list');
      list.innerHTML = habits.map(h =>
        '<div class="list-item">' +
          '<span>' + h.name + '</span>' +
          '<button class="delete-btn" onclick="removeHabit(' + h.id + ')">Remove</button>' +
        '</div>'
      ).join('');
    }

    function addHabit() {
      const input = document.getElementById('new-habit');
      const name = input.value.trim();
      if (name) {
        const id = Date.now();
        habits.push({ id, name });
        localStorage.setItem('habits', JSON.stringify(habits));
        input.value = '';
        render();
      }
    }

    function removeHabit(id) {
      habits = habits.filter(h => h.id !== id);
      localStorage.setItem('habits', JSON.stringify(habits));
      render();
    }

    function exportData() {
      const data = JSON.stringify({ habits, completions }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'habit-tracker-backup.json';
      link.click();
    }

    function resetData() {
      if (confirm('Are you sure? This will delete all your data.')) {
        habits = ${JSON.stringify(defaultHabits.map((h, i) => ({ id: i + 1, name: h })))};
        completions = {};
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        render();
      }
    }
  </script>
</body>
</html>`;
}

// ============================================
// PROJECT TIMER
// ============================================

function generateProjectTimer(config) {
  const { name, color, categories, branding } = config;
  const appName = branding?.appName || name || 'Project Timer';

  // Use the new generateAppCSS with full config support
  const css = generateAppCSS({
    color: color || '#3b82f6',
    secondaryColor: config.secondaryColor || '#06b6d4',
    accentColor: config.accentColor || '#f59e0b',
    font: config.font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontId: config.fontId || 'system',
    layout: config.layout || 'default',
    theme: config.theme || 'dark',
  });

  const defaultProjects = categories || ['Client Work', 'Personal', 'Learning', 'Admin', 'Meetings'];
  const primaryColor = color || '#3b82f6';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    ${css}

    .timer-display {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10);
      border-radius: 20px;
      margin-bottom: 24px;
    }
    .timer-time {
      font-size: 4rem;
      font-family: monospace;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }
    .timer-project {
      font-size: 1.2rem;
      color: var(--primary);
      margin-bottom: 24px;
    }
    .timer-controls {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .timer-btn {
      padding: 14px 32px;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .timer-btn.start {
      background: var(--success);
      color: #fff;
    }
    .timer-btn.stop {
      background: var(--danger);
      color: #fff;
    }
    .timer-btn.reset {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text);
    }
    .project-selector {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .project-btn {
      padding: 16px;
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .project-btn.active {
      border-color: var(--primary);
      background: ${primaryColor}15;
    }
    .project-btn:hover:not(.active) {
      border-color: ${primaryColor}60;
    }
    .log-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      margin-bottom: 8px;
    }
    .log-project {
      font-weight: 600;
    }
    .log-duration {
      font-family: monospace;
      font-size: 1.1rem;
      color: var(--primary);
    }
    .log-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .week-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 150px;
      padding: 20px 0;
      gap: 8px;
    }
    .week-bar {
      flex: 1;
      background: ${primaryColor}30;
      border-radius: 6px 6px 0 0;
      transition: height 0.3s;
      position: relative;
    }
    .week-bar-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--primary);
      border-radius: 6px 6px 0 0;
    }
    .week-label {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 8px;
    }
    .running-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: var(--success);
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">${appName}</h1>
      <p class="app-subtitle">Track time spent on your projects</p>
    </header>

    <nav class="nav-tabs">
      <button class="nav-tab active" data-view="timer" onclick="showView('timer')">Timer</button>
      <button class="nav-tab" data-view="logs" onclick="showView('logs')">Logs</button>
      <button class="nav-tab" data-view="reports" onclick="showView('reports')">Reports</button>
      <button class="nav-tab" data-view="settings" onclick="showView('settings')">Settings</button>
    </nav>

    <!-- Timer View -->
    <div id="timer" class="view active">
      <div class="timer-display">
        <div class="timer-time" id="timer-display">00:00:00</div>
        <div class="timer-project" id="timer-project">Select a project</div>
        <div class="timer-controls">
          <button class="timer-btn start" id="start-btn" onclick="startTimer()">Start</button>
          <button class="timer-btn stop" id="stop-btn" onclick="stopTimer()" style="display: none;">Stop</button>
          <button class="timer-btn reset" onclick="resetTimer()">Reset</button>
        </div>
      </div>

      <h3 class="card-title">Select Project</h3>
      <div class="project-selector" id="project-selector"></div>

      <div class="card" id="current-session" style="display: none;">
        <h3 class="card-title"><span class="running-indicator"></span>Current Session</h3>
        <p id="session-info"></p>
      </div>
    </div>

    <!-- Logs View -->
    <div id="logs" class="view">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value" id="stat-today-time">0h 0m</div>
          <div class="stat-label">Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-week-time">0h 0m</div>
          <div class="stat-label">This Week</div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Recent Sessions</h3>
        <div id="log-list"></div>
      </div>

      <button class="btn btn-secondary" onclick="exportLogs()" style="margin-top: 16px;">Export CSV</button>
    </div>

    <!-- Reports View -->
    <div id="reports" class="view">
      <div class="card">
        <h3 class="card-title">This Week</h3>
        <div class="week-chart" id="week-chart"></div>
        <div style="display: flex; justify-content: space-between; padding: 0 8px;">
          <span class="week-label">Mon</span>
          <span class="week-label">Tue</span>
          <span class="week-label">Wed</span>
          <span class="week-label">Thu</span>
          <span class="week-label">Fri</span>
          <span class="week-label">Sat</span>
          <span class="week-label">Sun</span>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">By Project</h3>
        <div id="project-breakdown"></div>
      </div>
    </div>

    <!-- Settings View -->
    <div id="settings" class="view">
      <div class="card">
        <h3 class="card-title">Projects</h3>
        <div id="project-list"></div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <input type="text" class="form-input" id="new-project" placeholder="Add project..." style="flex: 1;">
          <button class="btn btn-primary" onclick="addProject()">Add</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Data</h3>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="exportData()">Export All</button>
          <button class="btn btn-danger" onclick="clearData()">Clear All</button>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${appName} | Powered by Blink
    </footer>
  </div>

  <script>
    // State
    let projects = JSON.parse(localStorage.getItem('projects') || '${JSON.stringify(defaultProjects)}');
    let logs = JSON.parse(localStorage.getItem('timerLogs') || '[]');
    let currentProject = null;
    let timerInterval = null;
    let startTime = null;
    let elapsedTime = 0;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      render();
      window.addEventListener('hashchange', handleHash);
      handleHash();

      // Check for running timer
      const savedTimer = JSON.parse(localStorage.getItem('runningTimer') || 'null');
      if (savedTimer) {
        currentProject = savedTimer.project;
        startTime = new Date(savedTimer.startTime);
        startTimerInterval();
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('stop-btn').style.display = 'inline-block';
        document.getElementById('current-session').style.display = 'block';
      }
    });

    function handleHash() {
      const hash = window.location.hash.slice(1) || 'timer';
      showView(hash);
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      document.querySelector('[data-view="' + viewId + '"]').classList.add('active');
      window.location.hash = viewId;
      render();
    }

    function render() {
      renderProjects();
      renderLogs();
      renderReports();
      renderSettings();
    }

    function renderProjects() {
      const selector = document.getElementById('project-selector');
      selector.innerHTML = projects.map(p =>
        '<button class="project-btn ' + (currentProject === p ? 'active' : '') + '" onclick="selectProject(\\'' + p + '\\')">' + p + '</button>'
      ).join('');
    }

    function selectProject(project) {
      currentProject = project;
      document.getElementById('timer-project').textContent = project;
      renderProjects();
    }

    function startTimer() {
      if (!currentProject) {
        alert('Please select a project first');
        return;
      }

      startTime = new Date();
      localStorage.setItem('runningTimer', JSON.stringify({ project: currentProject, startTime: startTime.toISOString() }));

      startTimerInterval();

      document.getElementById('start-btn').style.display = 'none';
      document.getElementById('stop-btn').style.display = 'inline-block';
      document.getElementById('current-session').style.display = 'block';
      document.getElementById('session-info').textContent = 'Started at ' + startTime.toLocaleTimeString() + ' on ' + currentProject;
    }

    function startTimerInterval() {
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
    }

    function updateTimer() {
      const now = new Date();
      elapsedTime = Math.floor((now - startTime) / 1000);
      document.getElementById('timer-display').textContent = formatTime(elapsedTime);
    }

    function stopTimer() {
      clearInterval(timerInterval);

      const log = {
        id: Date.now(),
        project: currentProject,
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: elapsedTime
      };

      logs.unshift(log);
      localStorage.setItem('timerLogs', JSON.stringify(logs));
      localStorage.removeItem('runningTimer');

      resetTimer();
      render();
    }

    function resetTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
      startTime = null;
      elapsedTime = 0;
      document.getElementById('timer-display').textContent = '00:00:00';
      document.getElementById('start-btn').style.display = 'inline-block';
      document.getElementById('stop-btn').style.display = 'none';
      document.getElementById('current-session').style.display = 'none';
      localStorage.removeItem('runningTimer');
    }

    function formatTime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    }

    function formatDuration(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return h + 'h ' + m + 'm';
      return m + 'm';
    }

    function renderLogs() {
      // Stats
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const todayTime = logs.filter(l => l.startTime.startsWith(today)).reduce((sum, l) => sum + l.duration, 0);
      const weekTime = logs.filter(l => l.startTime >= weekAgo).reduce((sum, l) => sum + l.duration, 0);

      document.getElementById('stat-today-time').textContent = formatDuration(todayTime);
      document.getElementById('stat-week-time').textContent = formatDuration(weekTime);

      // Log list
      const list = document.getElementById('log-list');
      if (logs.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏱️</div><p>No sessions recorded yet</p></div>';
        return;
      }

      list.innerHTML = logs.slice(0, 20).map(l =>
        '<div class="log-item">' +
          '<div>' +
            '<div class="log-project">' + l.project + '</div>' +
            '<div class="log-date">' + new Date(l.startTime).toLocaleString() + '</div>' +
          '</div>' +
          '<div style="text-align: right;">' +
            '<div class="log-duration">' + formatDuration(l.duration) + '</div>' +
            '<button class="delete-btn" onclick="deleteLog(' + l.id + ')" style="margin-top: 4px;">Delete</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    function deleteLog(id) {
      logs = logs.filter(l => l.id !== id);
      localStorage.setItem('timerLogs', JSON.stringify(logs));
      render();
    }

    function renderReports() {
      // Week chart
      const chart = document.getElementById('week-chart');
      const weekData = [];
      const maxTime = 8 * 60 * 60; // 8 hours max for chart

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayTime = logs.filter(l => l.startTime.startsWith(dateStr)).reduce((sum, l) => sum + l.duration, 0);
        weekData.push(dayTime);
      }

      const maxData = Math.max(...weekData, maxTime / 4);
      chart.innerHTML = weekData.map((time, i) => {
        const height = Math.max(5, (time / maxData) * 100);
        return '<div class="week-bar"><div class="week-bar-fill" style="height: ' + height + '%;"></div></div>';
      }).join('');

      // Project breakdown
      const breakdown = document.getElementById('project-breakdown');
      const projectTimes = {};
      logs.forEach(l => {
        projectTimes[l.project] = (projectTimes[l.project] || 0) + l.duration;
      });

      const totalTime = Object.values(projectTimes).reduce((a, b) => a + b, 0) || 1;

      breakdown.innerHTML = Object.entries(projectTimes)
        .sort((a, b) => b[1] - a[1])
        .map(([project, time]) => {
          const percent = Math.round((time / totalTime) * 100);
          return '<div class="list-item">' +
            '<span>' + project + '</span>' +
            '<div style="display: flex; align-items: center; gap: 12px;">' +
              '<div style="width: 100px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">' +
                '<div style="width: ' + percent + '%; height: 100%; background: var(--primary);"></div>' +
              '</div>' +
              '<span style="font-weight: 600; min-width: 60px;">' + formatDuration(time) + '</span>' +
            '</div>' +
          '</div>';
        }).join('') || '<div class="empty-state"><p>No data yet</p></div>';
    }

    function renderSettings() {
      const list = document.getElementById('project-list');
      list.innerHTML = projects.map(p =>
        '<div class="list-item"><span>' + p + '</span><button class="delete-btn" onclick="removeProject(\\'' + p + '\\')">Remove</button></div>'
      ).join('');
    }

    function addProject() {
      const input = document.getElementById('new-project');
      const name = input.value.trim();
      if (name && !projects.includes(name)) {
        projects.push(name);
        localStorage.setItem('projects', JSON.stringify(projects));
        input.value = '';
        render();
      }
    }

    function removeProject(name) {
      if (projects.length <= 1) {
        alert('You need at least one project');
        return;
      }
      projects = projects.filter(p => p !== name);
      localStorage.setItem('projects', JSON.stringify(projects));
      if (currentProject === name) currentProject = null;
      render();
    }

    function exportLogs() {
      const headers = ['Project', 'Start Time', 'End Time', 'Duration (seconds)', 'Duration'];
      const rows = logs.map(l => [l.project, l.startTime, l.endTime, l.duration, formatDuration(l.duration)]);
      const csv = [headers, ...rows].map(r => r.map(c => '"' + c + '"').join(',')).join('\\n');
      downloadFile(csv, 'time-logs.csv', 'text/csv');
    }

    function exportData() {
      const data = JSON.stringify({ projects, logs }, null, 2);
      downloadFile(data, 'project-timer-backup.json', 'application/json');
    }

    function clearData() {
      if (confirm('Are you sure? This will delete all logs.')) {
        logs = [];
        localStorage.setItem('timerLogs', JSON.stringify(logs));
        render();
      }
    }

    function downloadFile(content, filename, type) {
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  </script>
</body>
</html>`;
}

// ============================================
// BOOKMARK MANAGER
// ============================================

function generateBookmarkManager(config) {
  const { name, color, categories, branding } = config;
  const appName = branding?.appName || name || 'Bookmark Manager';

  // Use the new generateAppCSS with full config support
  const css = generateAppCSS({
    color: color || '#f59e0b',
    secondaryColor: config.secondaryColor || '#06b6d4',
    accentColor: config.accentColor || '#8b5cf6',
    font: config.font || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontId: config.fontId || 'system',
    layout: config.layout || 'default',
    theme: config.theme || 'dark',
  });

  const defaultFolders = categories || ['Work', 'Personal', 'Reading', 'Tools', 'Inspiration'];
  const primaryColor = color || '#f59e0b';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    ${css}

    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .search-input {
      flex: 1;
      padding: 14px 20px;
      font-size: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text);
      outline: none;
    }
    .search-input:focus {
      border-color: var(--primary);
    }
    .folder-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .folder-tab {
      padding: 10px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text-muted);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .folder-tab.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .bookmark-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .bookmark-item:hover {
      border-color: var(--primary);
      background: rgba(255,255,255,0.04);
    }
    .bookmark-favicon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .bookmark-favicon img {
      width: 20px;
      height: 20px;
    }
    .bookmark-info {
      flex: 1;
      min-width: 0;
    }
    .bookmark-title {
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bookmark-url {
      font-size: 0.8rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bookmark-actions {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text);
    }
    .action-btn.delete:hover {
      border-color: var(--danger);
      color: var(--danger);
    }
    .tag {
      display: inline-block;
      padding: 3px 8px;
      background: ${primaryColor}20;
      color: var(--primary);
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-right: 4px;
    }
    .add-form {
      display: grid;
      gap: 16px;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: #1a1a24;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      width: 90%;
      max-width: 500px;
    }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">${appName}</h1>
      <p class="app-subtitle">Organize and access your bookmarks</p>
    </header>

    <nav class="nav-tabs">
      <button class="nav-tab active" data-view="bookmarks" onclick="showView('bookmarks')">Bookmarks</button>
      <button class="nav-tab" data-view="add" onclick="showView('add')">Add New</button>
      <button class="nav-tab" data-view="settings" onclick="showView('settings')">Settings</button>
    </nav>

    <!-- Bookmarks View -->
    <div id="bookmarks" class="view active">
      <div class="search-bar">
        <input type="text" class="search-input" id="search" placeholder="Search bookmarks..." oninput="filterBookmarks()">
      </div>

      <div class="folder-tabs" id="folder-tabs"></div>

      <div id="bookmark-list"></div>
    </div>

    <!-- Add View -->
    <div id="add" class="view">
      <div class="card">
        <h3 class="card-title">Add New Bookmark</h3>
        <form class="add-form" onsubmit="addBookmark(event)">
          <div class="form-group">
            <label class="form-label">URL</label>
            <input type="url" class="form-input" id="add-url" placeholder="https://..." required>
          </div>
          <div class="form-group">
            <label class="form-label">Title (optional)</label>
            <input type="text" class="form-input" id="add-title" placeholder="Page title">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Folder</label>
              <select class="form-select" id="add-folder"></select>
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input type="text" class="form-input" id="add-tags" placeholder="work, important">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Save Bookmark</button>
        </form>
      </div>
    </div>

    <!-- Settings View -->
    <div id="settings" class="view">
      <div class="card">
        <h3 class="card-title">Folders</h3>
        <div id="folder-list"></div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <input type="text" class="form-input" id="new-folder" placeholder="New folder name" style="flex: 1;">
          <button class="btn btn-primary" onclick="addFolder()">Add</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Import / Export</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary" onclick="exportBookmarks()">Export JSON</button>
          <button class="btn btn-secondary" onclick="document.getElementById('import-file').click()">Import JSON</button>
          <input type="file" id="import-file" accept=".json" onchange="importBookmarks(event)" style="display: none;">
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Danger Zone</h3>
        <button class="btn btn-danger" onclick="clearAll()">Delete All Bookmarks</button>
      </div>
    </div>

    <footer class="brand-footer">
      ${appName} | Powered by Blink
    </footer>
  </div>

  <!-- Edit Modal -->
  <div class="modal-overlay hidden" id="edit-modal">
    <div class="modal">
      <h3 class="card-title">Edit Bookmark</h3>
      <form onsubmit="saveEdit(event)">
        <input type="hidden" id="edit-id">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input type="text" class="form-input" id="edit-title">
        </div>
        <div class="form-group">
          <label class="form-label">URL</label>
          <input type="url" class="form-input" id="edit-url">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Folder</label>
            <select class="form-select" id="edit-folder"></select>
          </div>
          <div class="form-group">
            <label class="form-label">Tags</label>
            <input type="text" class="form-input" id="edit-tags">
          </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">Save</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    // State
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    let folders = JSON.parse(localStorage.getItem('folders') || '${JSON.stringify(defaultFolders)}');
    let currentFolder = 'all';
    let searchQuery = '';

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
      render();
      window.addEventListener('hashchange', handleHash);
      handleHash();
    });

    function handleHash() {
      const hash = window.location.hash.slice(1) || 'bookmarks';
      showView(hash);
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      document.querySelector('[data-view="' + viewId + '"]').classList.add('active');
      window.location.hash = viewId;
      render();
    }

    function render() {
      renderFolderTabs();
      renderBookmarks();
      renderFolderSelects();
      renderSettings();
    }

    function renderFolderTabs() {
      const tabs = document.getElementById('folder-tabs');
      tabs.innerHTML = '<button class="folder-tab ' + (currentFolder === 'all' ? 'active' : '') + '" onclick="selectFolder(\\'all\\')">All</button>' +
        folders.map(f => '<button class="folder-tab ' + (currentFolder === f ? 'active' : '') + '" onclick="selectFolder(\\'' + f + '\\')">' + f + '</button>').join('');
    }

    function selectFolder(folder) {
      currentFolder = folder;
      render();
    }

    function filterBookmarks() {
      searchQuery = document.getElementById('search').value.toLowerCase();
      renderBookmarks();
    }

    function renderBookmarks() {
      const list = document.getElementById('bookmark-list');

      let filtered = bookmarks;

      if (currentFolder !== 'all') {
        filtered = filtered.filter(b => b.folder === currentFolder);
      }

      if (searchQuery) {
        filtered = filtered.filter(b =>
          b.title.toLowerCase().includes(searchQuery) ||
          b.url.toLowerCase().includes(searchQuery) ||
          (b.tags || []).some(t => t.toLowerCase().includes(searchQuery))
        );
      }

      if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔖</div><p>' +
          (searchQuery ? 'No matching bookmarks' : 'No bookmarks yet. Add some!') + '</p></div>';
        return;
      }

      list.innerHTML = filtered.map(b =>
        '<div class="bookmark-item">' +
          '<div class="bookmark-favicon">' + getFavicon(b.url) + '</div>' +
          '<div class="bookmark-info">' +
            '<div class="bookmark-title">' + escapeHtml(b.title) + '</div>' +
            '<div class="bookmark-url">' + escapeHtml(b.url) + '</div>' +
            (b.tags && b.tags.length ? '<div style="margin-top: 6px;">' + b.tags.map(t => '<span class="tag">' + t + '</span>').join('') + '</div>' : '') +
          '</div>' +
          '<div class="bookmark-actions">' +
            '<a href="' + b.url + '" target="_blank" class="action-btn">Open</a>' +
            '<button class="action-btn" onclick="editBookmark(' + b.id + ')">Edit</button>' +
            '<button class="action-btn delete" onclick="deleteBookmark(' + b.id + ')">Delete</button>' +
          '</div>' +
        '</div>'
      ).join('');
    }

    function getFavicon(url) {
      try {
        const domain = new URL(url).hostname;
        return '<img src="https://www.google.com/s2/favicons?domain=' + domain + '&sz=32" onerror="this.style.display=\\'none\\'">';
      } catch {
        return '🔗';
      }
    }

    function renderFolderSelects() {
      const addSelect = document.getElementById('add-folder');
      const editSelect = document.getElementById('edit-folder');
      const options = folders.map(f => '<option value="' + f + '">' + f + '</option>').join('');
      if (addSelect) addSelect.innerHTML = options;
      if (editSelect) editSelect.innerHTML = options;
    }

    function addBookmark(e) {
      e.preventDefault();

      const url = document.getElementById('add-url').value;
      const title = document.getElementById('add-title').value || extractTitle(url);
      const folder = document.getElementById('add-folder').value;
      const tags = document.getElementById('add-tags').value.split(',').map(t => t.trim()).filter(Boolean);

      const bookmark = {
        id: Date.now(),
        url,
        title,
        folder,
        tags,
        createdAt: new Date().toISOString()
      };

      bookmarks.unshift(bookmark);
      save();

      e.target.reset();
      showView('bookmarks');
    }

    function extractTitle(url) {
      try {
        return new URL(url).hostname;
      } catch {
        return url;
      }
    }

    function editBookmark(id) {
      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) return;

      document.getElementById('edit-id').value = id;
      document.getElementById('edit-title').value = bookmark.title;
      document.getElementById('edit-url').value = bookmark.url;
      document.getElementById('edit-folder').value = bookmark.folder;
      document.getElementById('edit-tags').value = (bookmark.tags || []).join(', ');

      document.getElementById('edit-modal').classList.remove('hidden');
    }

    function saveEdit(e) {
      e.preventDefault();

      const id = parseInt(document.getElementById('edit-id').value);
      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) return;

      bookmark.title = document.getElementById('edit-title').value;
      bookmark.url = document.getElementById('edit-url').value;
      bookmark.folder = document.getElementById('edit-folder').value;
      bookmark.tags = document.getElementById('edit-tags').value.split(',').map(t => t.trim()).filter(Boolean);

      save();
      closeModal();
    }

    function closeModal() {
      document.getElementById('edit-modal').classList.add('hidden');
    }

    function deleteBookmark(id) {
      if (confirm('Delete this bookmark?')) {
        bookmarks = bookmarks.filter(b => b.id !== id);
        save();
      }
    }

    function renderSettings() {
      const list = document.getElementById('folder-list');
      list.innerHTML = folders.map(f =>
        '<div class="list-item"><span>' + f + '</span><button class="delete-btn" onclick="removeFolder(\\'' + f + '\\')">Remove</button></div>'
      ).join('');
    }

    function addFolder() {
      const input = document.getElementById('new-folder');
      const name = input.value.trim();
      if (name && !folders.includes(name)) {
        folders.push(name);
        localStorage.setItem('folders', JSON.stringify(folders));
        input.value = '';
        render();
      }
    }

    function removeFolder(name) {
      if (folders.length <= 1) {
        alert('You need at least one folder');
        return;
      }
      folders = folders.filter(f => f !== name);
      bookmarks.forEach(b => { if (b.folder === name) b.folder = folders[0]; });
      localStorage.setItem('folders', JSON.stringify(folders));
      if (currentFolder === name) currentFolder = 'all';
      save();
    }

    function save() {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      render();
    }

    function exportBookmarks() {
      const data = JSON.stringify({ bookmarks, folders }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'bookmarks-backup.json';
      link.click();
    }

    function importBookmarks(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          if (data.bookmarks) bookmarks = [...data.bookmarks, ...bookmarks];
          if (data.folders) folders = [...new Set([...folders, ...data.folders])];
          localStorage.setItem('folders', JSON.stringify(folders));
          save();
          alert('Imported successfully!');
        } catch (err) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }

    function clearAll() {
      if (confirm('Are you sure? This will delete ALL bookmarks.')) {
        bookmarks = [];
        save();
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}

// ============================================
// MAIN EXPORT
// ============================================

function generateApp(templateId, config) {
  if (APP_GENERATORS[templateId]) {
    return APP_GENERATORS[templateId](config);
  }
  throw new Error(`Unknown app template: ${templateId}`);
}

module.exports = {
  generateApp,
  generateAppCSS,
  APP_GENERATORS,
  LAYOUT_CONFIGS,
  THEME_CONFIGS,
  FONT_IMPORTS
};
