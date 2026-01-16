/**
 * Orchestrator Mode - Fourth Generation Mode for Blink
 *
 * Takes a SINGLE sentence from the user and autonomously generates
 * either a complete website OR a micro-tool/utility.
 *
 * Supports two modes:
 * - "business" — full multi-page website (default)
 * - "tool" — single-page utility/micro-tool
 *
 * @example
 * orchestrate("Create a website for Mario's Pizza in Brooklyn")
 * // Returns business website payload
 *
 * @example
 * orchestrate("Make me a tip calculator")
 * // Returns tool payload with single page
 */

// Note: @anthropic-ai/sdk is an ES module, loaded via dynamic import in async functions
const fs = require('fs');
const path = require('path');

// Load industries config
const INDUSTRIES = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../prompts/industries.json'), 'utf8')
);

// Get list of valid industry keys
const VALID_INDUSTRIES = Object.keys(INDUSTRIES);

// ============================================
// TOOL DETECTION
// ============================================

// Tool keyword patterns for detection
const TOOL_KEYWORDS = {
  // Direct tool nouns
  calculator: 'calculator',
  converter: 'converter',
  generator: 'generator',
  tracker: 'tracker',
  timer: 'timer',
  counter: 'counter',
  stopwatch: 'timer',
  clock: 'timer',

  // Specific tools
  invoice: 'invoice-generator',
  receipt: 'receipt-generator',
  'qr code': 'qr-generator',
  qr: 'qr-generator',
  password: 'password-generator',
  countdown: 'countdown',
  pomodoro: 'pomodoro',
  habit: 'habit-tracker',
  expense: 'expense-tracker',
  'time tracking': 'time-tracker',
  timesheet: 'time-tracker',
  bmi: 'bmi-calculator',
  calorie: 'calorie-calculator',
  'tip splitter': 'tip-calculator',
  'tip calculator': 'tip-calculator',
  'split bill': 'tip-calculator',
  mortgage: 'mortgage-calculator',
  loan: 'loan-calculator',
  compound: 'compound-calculator',
  interest: 'interest-calculator',
  'unit converter': 'unit-converter',
  temperature: 'temperature-converter',
  currency: 'currency-converter',
  'color picker': 'color-picker',
  'color palette': 'color-generator',
  'todo list': 'todo-tracker',
  'to-do': 'todo-tracker',
  checklist: 'todo-tracker',
  'word counter': 'word-counter',
  'character counter': 'word-counter',
  'grade calculator': 'grade-calculator',
  gpa: 'gpa-calculator',
  'age calculator': 'age-calculator',
  'date calculator': 'date-calculator',
  'percentage': 'percentage-calculator',
  'discount': 'discount-calculator',
  'savings': 'savings-calculator',
  'budget': 'budget-tracker',
  'water intake': 'water-tracker',
  'sleep': 'sleep-tracker',
  'workout': 'workout-tracker',
  'reading': 'reading-tracker',
  'mood': 'mood-tracker'
};

// Patterns that indicate tool intent
const TOOL_PATTERNS = [
  /^(make|build|create|generate)\s+(me\s+)?a\s+/i,
  /\b(calculator|converter|generator|tracker|timer|counter)\b/i,
  /\b(invoice|receipt|qr\s*code|password|countdown|pomodoro)\b/i,
  /\b(habit|expense|time\s*track|bmi|calorie|tip\s*(splitter|calculator))\b/i,
  /\b(split\s*bill|mortgage|loan|compound|interest)\b/i,
  /\b(todo|to-do|checklist|word\s*count|grade|gpa)\b/i,
  /\b(simple|quick|basic)\s+(tool|utility|app|page)\b/i
];

// Tool categories
const TOOL_CATEGORIES = {
  calculator: ['tip-calculator', 'bmi-calculator', 'calorie-calculator', 'mortgage-calculator',
               'loan-calculator', 'compound-calculator', 'interest-calculator', 'percentage-calculator',
               'discount-calculator', 'savings-calculator', 'grade-calculator', 'gpa-calculator',
               'age-calculator', 'date-calculator'],
  generator: ['invoice-generator', 'receipt-generator', 'qr-generator', 'password-generator', 'color-generator'],
  converter: ['unit-converter', 'temperature-converter', 'currency-converter'],
  tracker: ['habit-tracker', 'expense-tracker', 'time-tracker', 'todo-tracker', 'budget-tracker',
            'water-tracker', 'sleep-tracker', 'workout-tracker', 'reading-tracker', 'mood-tracker'],
  timer: ['countdown', 'pomodoro', 'timer', 'stopwatch'],
  utility: ['color-picker', 'word-counter']
};

// Tool templates with features and fields
const TOOL_TEMPLATES = {
  'invoice-generator': {
    name: 'Invoice Generator',
    icon: '📄',
    category: 'generator',
    description: 'Create professional invoices',
    features: ['client-info', 'line-items', 'tax-calculation', 'total', 'pdf-export', 'print'],
    fields: [
      { name: 'businessName', type: 'text', label: 'Your Business Name' },
      { name: 'clientName', type: 'text', label: 'Client Name' },
      { name: 'clientEmail', type: 'email', label: 'Client Email' },
      { name: 'invoiceNumber', type: 'text', label: 'Invoice #', auto: true },
      { name: 'invoiceDate', type: 'date', label: 'Invoice Date' },
      { name: 'dueDate', type: 'date', label: 'Due Date' },
      { name: 'items', type: 'line-items', label: 'Items' },
      { name: 'taxRate', type: 'number', label: 'Tax Rate (%)', default: 0 },
      { name: 'notes', type: 'textarea', label: 'Notes' }
    ],
    colors: { primary: '#2563eb', accent: '#3b82f6', background: '#f8fafc' }
  },

  'receipt-generator': {
    name: 'Receipt Generator',
    icon: '🧾',
    category: 'generator',
    description: 'Generate simple receipts',
    features: ['business-info', 'items', 'total', 'print'],
    fields: [
      { name: 'businessName', type: 'text', label: 'Business Name' },
      { name: 'receiptNumber', type: 'text', label: 'Receipt #', auto: true },
      { name: 'date', type: 'date', label: 'Date' },
      { name: 'items', type: 'line-items', label: 'Items' },
      { name: 'paymentMethod', type: 'select', label: 'Payment Method', options: ['Cash', 'Card', 'Check'] }
    ],
    colors: { primary: '#059669', accent: '#10b981', background: '#f0fdf4' }
  },

  'qr-generator': {
    name: 'QR Code Generator',
    icon: '📱',
    category: 'generator',
    description: 'Generate QR codes for URLs, text, or contact info',
    features: ['text-input', 'qr-display', 'download-png', 'download-svg', 'size-options'],
    fields: [
      { name: 'content', type: 'textarea', label: 'Content (URL, text, or contact info)' },
      { name: 'size', type: 'select', label: 'Size', options: ['128x128', '256x256', '512x512'], default: '256x256' },
      { name: 'foreground', type: 'color', label: 'Foreground Color', default: '#000000' },
      { name: 'background', type: 'color', label: 'Background Color', default: '#ffffff' }
    ],
    colors: { primary: '#7c3aed', accent: '#8b5cf6', background: '#faf5ff' }
  },

  'password-generator': {
    name: 'Password Generator',
    icon: '🔐',
    category: 'generator',
    description: 'Generate secure passwords',
    features: ['length-slider', 'character-options', 'strength-meter', 'copy-button', 'history'],
    fields: [
      { name: 'length', type: 'range', label: 'Length', min: 8, max: 64, default: 16 },
      { name: 'uppercase', type: 'checkbox', label: 'Uppercase (A-Z)', default: true },
      { name: 'lowercase', type: 'checkbox', label: 'Lowercase (a-z)', default: true },
      { name: 'numbers', type: 'checkbox', label: 'Numbers (0-9)', default: true },
      { name: 'symbols', type: 'checkbox', label: 'Symbols (!@#$)', default: true },
      { name: 'excludeSimilar', type: 'checkbox', label: 'Exclude similar (l, 1, I, O, 0)', default: false }
    ],
    colors: { primary: '#dc2626', accent: '#ef4444', background: '#fef2f2' }
  },

  'tip-calculator': {
    name: 'Tip Calculator',
    icon: '💰',
    category: 'calculator',
    description: 'Calculate tips and split bills',
    features: ['bill-input', 'tip-percentage', 'split-count', 'per-person', 'quick-tips'],
    fields: [
      { name: 'billAmount', type: 'number', label: 'Bill Amount ($)', step: 0.01 },
      { name: 'tipPercent', type: 'range', label: 'Tip %', min: 0, max: 30, default: 18 },
      { name: 'splitCount', type: 'number', label: 'Split Between', min: 1, default: 1 }
    ],
    quickTips: [15, 18, 20, 25],
    colors: { primary: '#059669', accent: '#10b981', background: '#f0fdf4' }
  },

  'bmi-calculator': {
    name: 'BMI Calculator',
    icon: '⚖️',
    category: 'calculator',
    description: 'Calculate Body Mass Index',
    features: ['unit-toggle', 'height-input', 'weight-input', 'bmi-result', 'category-display', 'chart'],
    fields: [
      { name: 'unit', type: 'toggle', label: 'Units', options: ['Imperial', 'Metric'], default: 'Imperial' },
      { name: 'height', type: 'height', label: 'Height' },
      { name: 'weight', type: 'number', label: 'Weight' }
    ],
    colors: { primary: '#0891b2', accent: '#06b6d4', background: '#ecfeff' }
  },

  'calorie-calculator': {
    name: 'Calorie Calculator',
    icon: '🔥',
    category: 'calculator',
    description: 'Calculate daily calorie needs',
    features: ['personal-info', 'activity-level', 'goal-selection', 'macros-breakdown'],
    fields: [
      { name: 'age', type: 'number', label: 'Age', min: 15, max: 100 },
      { name: 'gender', type: 'select', label: 'Gender', options: ['Male', 'Female'] },
      { name: 'height', type: 'height', label: 'Height' },
      { name: 'weight', type: 'number', label: 'Weight' },
      { name: 'activity', type: 'select', label: 'Activity Level',
        options: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'] },
      { name: 'goal', type: 'select', label: 'Goal', options: ['Lose Weight', 'Maintain', 'Gain Weight'] }
    ],
    colors: { primary: '#ea580c', accent: '#f97316', background: '#fff7ed' }
  },

  'countdown': {
    name: 'Countdown Timer',
    icon: '⏰',
    category: 'timer',
    description: 'Countdown to a specific date/time',
    features: ['date-picker', 'live-countdown', 'days-hours-mins-secs', 'event-name', 'share'],
    fields: [
      { name: 'eventName', type: 'text', label: 'Event Name' },
      { name: 'targetDate', type: 'datetime-local', label: 'Target Date & Time' },
      { name: 'showSeconds', type: 'checkbox', label: 'Show Seconds', default: true }
    ],
    colors: { primary: '#7c3aed', accent: '#8b5cf6', background: '#faf5ff' }
  },

  'pomodoro': {
    name: 'Pomodoro Timer',
    icon: '🍅',
    category: 'timer',
    description: 'Productivity timer with work/break cycles',
    features: ['work-timer', 'break-timer', 'session-counter', 'sound-alerts', 'settings'],
    fields: [
      { name: 'workDuration', type: 'number', label: 'Work Duration (min)', default: 25 },
      { name: 'shortBreak', type: 'number', label: 'Short Break (min)', default: 5 },
      { name: 'longBreak', type: 'number', label: 'Long Break (min)', default: 15 },
      { name: 'sessionsUntilLong', type: 'number', label: 'Sessions Until Long Break', default: 4 },
      { name: 'autoStart', type: 'checkbox', label: 'Auto-start Breaks', default: false },
      { name: 'soundEnabled', type: 'checkbox', label: 'Sound Alerts', default: true }
    ],
    colors: { primary: '#dc2626', accent: '#ef4444', background: '#fef2f2' }
  },

  'habit-tracker': {
    name: 'Habit Tracker',
    icon: '✅',
    category: 'tracker',
    description: 'Track daily habits and streaks',
    features: ['habit-list', 'daily-check', 'streak-display', 'calendar-view', 'stats'],
    fields: [
      { name: 'habits', type: 'habit-list', label: 'Your Habits' }
    ],
    colors: { primary: '#059669', accent: '#10b981', background: '#f0fdf4' }
  },

  'expense-tracker': {
    name: 'Expense Tracker',
    icon: '💳',
    category: 'tracker',
    description: 'Track income and expenses',
    features: ['transaction-list', 'categories', 'balance', 'charts', 'export'],
    fields: [
      { name: 'description', type: 'text', label: 'Description' },
      { name: 'amount', type: 'number', label: 'Amount', step: 0.01 },
      { name: 'type', type: 'select', label: 'Type', options: ['Income', 'Expense'] },
      { name: 'category', type: 'select', label: 'Category',
        options: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'] },
      { name: 'date', type: 'date', label: 'Date' }
    ],
    colors: { primary: '#2563eb', accent: '#3b82f6', background: '#eff6ff' }
  },

  'time-tracker': {
    name: 'Time Tracker',
    icon: '⏱️',
    category: 'tracker',
    description: 'Track time spent on tasks',
    features: ['task-input', 'timer', 'history', 'daily-total', 'export'],
    fields: [
      { name: 'taskName', type: 'text', label: 'Task Name' },
      { name: 'project', type: 'text', label: 'Project (optional)' }
    ],
    colors: { primary: '#0891b2', accent: '#06b6d4', background: '#ecfeff' }
  },

  'todo-tracker': {
    name: 'Todo List',
    icon: '📝',
    category: 'tracker',
    description: 'Simple todo list with priorities',
    features: ['add-task', 'complete-toggle', 'priority', 'due-date', 'filter', 'clear-completed'],
    fields: [
      { name: 'task', type: 'text', label: 'Task' },
      { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High'] },
      { name: 'dueDate', type: 'date', label: 'Due Date (optional)' }
    ],
    colors: { primary: '#7c3aed', accent: '#8b5cf6', background: '#faf5ff' }
  },

  'mortgage-calculator': {
    name: 'Mortgage Calculator',
    icon: '🏠',
    category: 'calculator',
    description: 'Calculate monthly mortgage payments',
    features: ['loan-amount', 'interest-rate', 'term', 'payment-breakdown', 'amortization'],
    fields: [
      { name: 'loanAmount', type: 'number', label: 'Loan Amount ($)' },
      { name: 'interestRate', type: 'number', label: 'Interest Rate (%)', step: 0.1 },
      { name: 'loanTerm', type: 'select', label: 'Loan Term', options: ['15 years', '20 years', '30 years'] },
      { name: 'downPayment', type: 'number', label: 'Down Payment ($)', default: 0 },
      { name: 'propertyTax', type: 'number', label: 'Annual Property Tax ($)', default: 0 },
      { name: 'insurance', type: 'number', label: 'Annual Insurance ($)', default: 0 }
    ],
    colors: { primary: '#0d9488', accent: '#14b8a6', background: '#f0fdfa' }
  },

  'unit-converter': {
    name: 'Unit Converter',
    icon: '🔄',
    category: 'converter',
    description: 'Convert between different units',
    features: ['category-select', 'from-unit', 'to-unit', 'swap', 'common-conversions'],
    fields: [
      { name: 'category', type: 'select', label: 'Category',
        options: ['Length', 'Weight', 'Temperature', 'Volume', 'Area', 'Speed', 'Time'] },
      { name: 'value', type: 'number', label: 'Value' },
      { name: 'fromUnit', type: 'select', label: 'From' },
      { name: 'toUnit', type: 'select', label: 'To' }
    ],
    colors: { primary: '#6366f1', accent: '#818cf8', background: '#eef2ff' }
  },

  'currency-converter': {
    name: 'Currency Converter',
    icon: '💱',
    category: 'converter',
    description: 'Convert between currencies',
    features: ['amount-input', 'currency-select', 'live-rates', 'swap', 'popular-pairs'],
    fields: [
      { name: 'amount', type: 'number', label: 'Amount' },
      { name: 'fromCurrency', type: 'select', label: 'From' },
      { name: 'toCurrency', type: 'select', label: 'To' }
    ],
    colors: { primary: '#059669', accent: '#10b981', background: '#f0fdf4' }
  },

  'word-counter': {
    name: 'Word Counter',
    icon: '📊',
    category: 'utility',
    description: 'Count words, characters, and more',
    features: ['text-input', 'word-count', 'character-count', 'sentence-count', 'reading-time'],
    fields: [
      { name: 'text', type: 'textarea', label: 'Enter your text' }
    ],
    colors: { primary: '#2563eb', accent: '#3b82f6', background: '#eff6ff' }
  },

  'color-picker': {
    name: 'Color Picker',
    icon: '🎨',
    category: 'utility',
    description: 'Pick colors and get codes',
    features: ['color-wheel', 'hex-code', 'rgb-code', 'hsl-code', 'copy-button', 'palette'],
    fields: [
      { name: 'color', type: 'color', label: 'Pick a Color' }
    ],
    colors: { primary: '#ec4899', accent: '#f472b6', background: '#fdf2f8' }
  },

  'percentage-calculator': {
    name: 'Percentage Calculator',
    icon: '%',
    category: 'calculator',
    description: 'Calculate percentages easily',
    features: ['what-is-x-of-y', 'x-is-what-percent-of-y', 'percent-change'],
    fields: [
      { name: 'calculationType', type: 'select', label: 'Calculate',
        options: ['What is X% of Y?', 'X is what % of Y?', '% change from X to Y'] },
      { name: 'value1', type: 'number', label: 'Value 1' },
      { name: 'value2', type: 'number', label: 'Value 2' }
    ],
    colors: { primary: '#7c3aed', accent: '#8b5cf6', background: '#faf5ff' }
  },

  'budget-tracker': {
    name: 'Budget Tracker',
    icon: '📈',
    category: 'tracker',
    description: 'Track your monthly budget',
    features: ['income', 'expense-categories', 'progress-bars', 'remaining', 'alerts'],
    fields: [
      { name: 'monthlyIncome', type: 'number', label: 'Monthly Income ($)' },
      { name: 'categories', type: 'budget-categories', label: 'Budget Categories' }
    ],
    colors: { primary: '#059669', accent: '#10b981', background: '#f0fdf4' }
  }
};

// Default/generic tool template
const DEFAULT_TOOL_TEMPLATE = {
  name: 'Custom Tool',
  icon: '🛠️',
  category: 'utility',
  description: 'A simple utility tool',
  features: ['main-input', 'calculate', 'result-display'],
  fields: [
    { name: 'input', type: 'text', label: 'Input' }
  ],
  colors: { primary: '#6366f1', accent: '#818cf8', background: '#eef2ff' }
};

// ============================================
// BUSINESS WEBSITE CONFIGURATION
// ============================================

// Load available backend modules
function getAvailableModules() {
  const modulesDir = path.join(__dirname, '../../backend');
  const modules = [];

  try {
    const dirs = fs.readdirSync(modulesDir, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const moduleJsonPath = path.join(modulesDir, dir.name, 'module.json');
        if (fs.existsSync(moduleJsonPath)) {
          try {
            const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
            modules.push({
              name: moduleData.name || dir.name,
              description: moduleData.description || '',
              features: moduleData.features || [],
              endpoints: moduleData.endpoints || []
            });
          } catch (err) {
            // Skip malformed module.json files
          }
        }
      }
    }
  } catch (err) {
    console.error('[orchestrator] Error loading modules:', err.message);
  }

  return modules;
}

// Industry keyword mapping for faster inference
const INDUSTRY_KEYWORDS = {
  // Food & Beverage
  'pizza': 'pizza',
  'pizzeria': 'pizza',
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'coffee': 'cafe',
  'bar': 'bar',
  'lounge': 'bar',
  'nightclub': 'bar',
  'bakery': 'bakery',
  'pastry': 'bakery',

  // Professional Services
  'law': 'law-firm',
  'attorney': 'law-firm',
  'lawyer': 'law-firm',
  'legal': 'law-firm',
  'accounting': 'accounting',
  'cpa': 'accounting',
  'tax': 'accounting',
  'consulting': 'consulting',
  'consultant': 'consulting',
  'real estate': 'real-estate',
  'realtor': 'real-estate',
  'insurance': 'insurance',

  // Healthcare
  'healthcare': 'healthcare',
  'medical': 'healthcare',
  'doctor': 'healthcare',
  'clinic': 'healthcare',
  'dental': 'dental',
  'dentist': 'dental',
  'chiropractic': 'chiropractic',
  'chiropractor': 'chiropractic',
  'spa': 'spa-salon',
  'salon': 'spa-salon',
  'massage': 'spa-salon',

  // Fitness & Wellness
  'gym': 'fitness',
  'fitness': 'fitness',
  'crossfit': 'fitness',
  'yoga': 'yoga',
  'pilates': 'yoga',

  // Technology
  'saas': 'saas',
  'software': 'saas',
  'app': 'saas',
  'startup': 'startup',
  'tech': 'startup',
  'agency': 'agency',
  'marketing': 'agency',
  'digital': 'agency',

  // Retail
  'ecommerce': 'ecommerce',
  'store': 'ecommerce',
  'shop': 'ecommerce',
  'subscription': 'subscription-box',

  // Creative
  'photography': 'photography',
  'photographer': 'photography',
  'wedding': 'wedding',
  'event planner': 'wedding',
  'portfolio': 'portfolio',
  'designer': 'portfolio',

  // Organizations
  'nonprofit': 'nonprofit',
  'charity': 'nonprofit',
  'church': 'church',
  'school': 'school',
  'education': 'school',
  'course': 'online-course',

  // Trade Services
  'construction': 'construction',
  'contractor': 'construction',
  'plumber': 'plumber',
  'plumbing': 'plumber',
  'hvac': 'plumber',
  'electrician': 'electrician',
  'electrical': 'electrician',
  'landscaping': 'landscaping',
  'lawn': 'landscaping',
  'cleaning': 'cleaning',
  'maid': 'cleaning',
  'auto': 'auto-repair',
  'mechanic': 'auto-repair',
  'car repair': 'auto-repair',

  // Other
  'pet': 'pet-services',
  'grooming': 'pet-services',
  'vet': 'pet-services',
  'moving': 'moving',
  'movers': 'moving',
  'event venue': 'event-venue',
  'banquet': 'event-venue',
  'hotel': 'hotel',
  'hospitality': 'hotel',
  'travel': 'travel',
  'tour': 'travel',
  'musician': 'musician',
  'band': 'musician',
  'podcast': 'podcast',
  'gaming': 'gaming',
  'esports': 'gaming',
  'finance': 'finance',
  'investment': 'finance'
};

// Page recommendations by industry category
const PAGE_RECOMMENDATIONS = {
  'food-beverage': ['home', 'menu', 'about', 'gallery', 'contact', 'order', 'reservations'],
  'professional-services': ['home', 'services', 'about', 'team', 'testimonials', 'contact', 'faq'],
  'healthcare': ['home', 'services', 'providers', 'patient-info', 'appointments', 'contact', 'testimonials'],
  'fitness': ['home', 'classes', 'membership', 'trainers', 'schedule', 'contact', 'gallery'],
  'technology': ['home', 'features', 'pricing', 'about', 'blog', 'contact', 'demo'],
  'retail': ['home', 'products', 'categories', 'about', 'contact', 'faq', 'shipping'],
  'creative': ['home', 'portfolio', 'services', 'about', 'pricing', 'contact'],
  'trade-services': ['home', 'services', 'projects', 'about', 'testimonials', 'contact', 'quote'],
  'default': ['home', 'about', 'services', 'contact', 'testimonials', 'faq']
};

// Module recommendations by industry
const MODULE_RECOMMENDATIONS = {
  'restaurant': ['auth', 'booking', 'payments', 'notifications'],
  'pizza': ['auth', 'booking', 'payments', 'notifications'],
  'cafe': ['auth', 'payments', 'notifications'],
  'bar': ['auth', 'booking', 'payments', 'notifications'],
  'healthcare': ['auth', 'booking', 'notifications', 'documents'],
  'dental': ['auth', 'booking', 'notifications', 'documents'],
  'fitness': ['auth', 'booking', 'payments', 'notifications', 'calendar'],
  'yoga': ['auth', 'booking', 'payments', 'calendar'],
  'spa-salon': ['auth', 'booking', 'payments', 'notifications'],
  'law-firm': ['auth', 'booking', 'documents', 'notifications'],
  'consulting': ['auth', 'booking', 'documents', 'notifications'],
  'real-estate': ['auth', 'booking', 'documents', 'notifications'],
  'ecommerce': ['auth', 'payments', 'inventory', 'notifications', 'stripe-payments'],
  'saas': ['auth', 'payments', 'stripe-payments', 'analytics', 'notifications'],
  'startup': ['auth', 'analytics', 'notifications'],
  'photography': ['auth', 'booking', 'payments', 'file-upload'],
  'wedding': ['auth', 'booking', 'documents', 'payments'],
  'construction': ['auth', 'booking', 'documents', 'file-upload'],
  'default': ['auth', 'notifications']
};

// ============================================
// DETECTION FUNCTIONS
// ============================================

/**
 * Detect if the input is requesting a tool vs a business website
 * @param {string} input - User input
 * @returns {{ type: 'tool' | 'business', toolKey: string | null, confidence: string }}
 */
function detectIntentType(input) {
  const lowerInput = input.toLowerCase();

  // Check for explicit tool patterns first
  for (const pattern of TOOL_PATTERNS) {
    if (pattern.test(lowerInput)) {
      // Found a tool pattern, now identify which tool
      for (const [keyword, toolKey] of Object.entries(TOOL_KEYWORDS)) {
        if (lowerInput.includes(keyword)) {
          console.log(`[orchestrator] Tool detected: "${toolKey}" (keyword: "${keyword}")`);
          return { type: 'tool', toolKey, confidence: 'high' };
        }
      }
      // Pattern matched but no specific tool - infer from context
      return { type: 'tool', toolKey: null, confidence: 'medium' };
    }
  }

  // Check for direct tool keywords without patterns
  for (const [keyword, toolKey] of Object.entries(TOOL_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      // Make sure it's not a business context
      const businessIndicators = ['website', 'business', 'company', 'store', 'shop', 'restaurant', 'firm', 'practice'];
      const hasBusinessIndicator = businessIndicators.some(ind => lowerInput.includes(ind));

      if (!hasBusinessIndicator) {
        console.log(`[orchestrator] Tool detected: "${toolKey}" (keyword match)`);
        return { type: 'tool', toolKey, confidence: 'medium' };
      }
    }
  }

  // Default to business website
  return { type: 'business', toolKey: null, confidence: 'high' };
}

/**
 * Get tool category from tool key
 */
function getToolCategory(toolKey) {
  for (const [category, tools] of Object.entries(TOOL_CATEGORIES)) {
    if (tools.includes(toolKey)) {
      return category;
    }
  }
  return 'utility';
}

/**
 * Extract business name from input
 */
function extractBusinessName(input) {
  const quotedMatch = input.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    return quotedMatch[1].trim();
  }

  const forMatch = input.match(/for\s+([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)*)/);
  if (forMatch) {
    return forMatch[1].trim();
  }

  const calledMatch = input.match(/called\s+([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)*)/);
  if (calledMatch) {
    return calledMatch[1].trim();
  }

  return null;
}

/**
 * Extract tool name from input
 */
function extractToolName(input) {
  // Try to extract a custom name
  const quotedMatch = input.match(/["']([^"']+)["']/);
  if (quotedMatch) {
    return quotedMatch[1].trim();
  }

  const calledMatch = input.match(/called\s+([A-Za-z\s]+?)(?:\s+that|\s+with|\s+for|$)/i);
  if (calledMatch) {
    return calledMatch[1].trim();
  }

  return null;
}

/**
 * Quick industry detection from keywords
 */
function detectIndustryFromKeywords(input) {
  const lowerInput = input.toLowerCase();

  for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lowerInput.includes(keyword)) {
      return industry;
    }
  }

  return null;
}

/**
 * Get industry category for page/module recommendations
 */
function getIndustryCategory(industry) {
  const categories = {
    'food-beverage': ['pizza', 'restaurant', 'cafe', 'bar', 'bakery'],
    'professional-services': ['law-firm', 'accounting', 'consulting', 'real-estate', 'insurance'],
    'healthcare': ['healthcare', 'dental', 'chiropractic', 'spa-salon'],
    'fitness': ['fitness', 'yoga'],
    'technology': ['saas', 'startup', 'agency'],
    'retail': ['ecommerce', 'subscription-box'],
    'creative': ['photography', 'wedding', 'portfolio', 'musician', 'podcast'],
    'trade-services': ['construction', 'plumber', 'electrician', 'landscaping', 'cleaning', 'auto-repair', 'moving']
  };

  for (const [category, industries] of Object.entries(categories)) {
    if (industries.includes(industry)) {
      return category;
    }
  }

  return 'default';
}

// ============================================
// ORCHESTRATION FUNCTIONS
// ============================================

/**
 * Orchestrate a tool creation
 */
async function orchestrateTool(input, toolKey) {
  console.log(`[orchestrator] Building tool: ${toolKey || 'custom'}`);

  const template = TOOL_TEMPLATES[toolKey] || DEFAULT_TOOL_TEMPLATE;
  const customName = extractToolName(input);
  const toolCategory = getToolCategory(toolKey || 'utility');

  // If we have Claude API, use it to enhance the tool config
  let aiEnhanced = null;
  if (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY) {
    try {
      // Dynamic import for ES module compatibility
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
      });

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are a micro-tool designer. Given a user request for a simple tool, enhance the configuration.
Return ONLY valid JSON with these fields:
{
  "name": "Tool display name",
  "tagline": "Short catchy description",
  "features": ["list of key features"],
  "customFields": [optional extra fields if needed],
  "colorScheme": "warm|cool|neutral|vibrant"
}`,
        messages: [{
          role: 'user',
          content: `User request: "${input}"\nBase tool type: ${toolKey || 'custom tool'}\nEnhance this tool configuration.`
        }]
      });

      const responseText = response.content[0]?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiEnhanced = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.log('[orchestrator] AI enhancement skipped:', err.message);
    }
  }

  // Build the tool payload
  const toolPayload = {
    type: 'tool',
    name: customName || aiEnhanced?.name || template.name,
    toolKey: toolKey || 'custom',
    toolCategory: toolCategory,

    // Tool-specific config
    toolConfig: {
      icon: template.icon,
      description: aiEnhanced?.tagline || template.description,
      features: aiEnhanced?.features || template.features,
      fields: template.fields,
      colors: template.colors
    },

    // Single page layout
    pages: ['tool'],
    layout: 'single-page-tool',
    modules: [], // Tools typically don't need backend modules

    // Theme based on tool
    theme: {
      colors: template.colors,
      typography: {
        heading: 'Inter',
        body: 'Inter'
      },
      borderRadius: '12px'
    },

    // Metadata
    metadata: {
      orchestratorVersion: '2.0',
      generatedAt: new Date().toISOString(),
      type: 'tool',
      originalInput: input,
      aiEnhanced: !!aiEnhanced
    }
  };

  return {
    success: true,
    type: 'tool',
    payload: toolPayload,
    summary: {
      type: 'tool',
      name: toolPayload.name,
      toolKey: toolKey,
      toolCategory: toolCategory,
      features: toolPayload.toolConfig.features.length,
      fields: toolPayload.toolConfig.fields.length,
      confidence: toolKey ? 'high' : 'medium'
    }
  };
}

/**
 * Orchestrate a business website creation
 */
async function orchestrateBusiness(input) {
  // Quick local inference first
  const quickBusinessName = extractBusinessName(input);
  const quickIndustry = detectIndustryFromKeywords(input);

  // Build context for Claude
  const availableModules = getAvailableModules();
  const moduleList = availableModules.map(m => `- ${m.name}: ${m.description}`).join('\n');

  // Initialize Anthropic client (dynamic import for ES module compatibility)
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
  });

  const systemPrompt = `You are a website configuration expert for Blink, an AI website builder. Your job is to take a simple user request and infer ALL details needed to create a professional website.

CRITICAL RULES:
1. Make CONFIDENT decisions - never ask for clarification
2. Use common sense and industry knowledge to fill in realistic details
3. Return ONLY valid JSON - no explanations, no apologies
4. Every field must have a value - no nulls unless truly unknown

AVAILABLE INDUSTRIES (use exact key):
${VALID_INDUSTRIES.join(', ')}

AVAILABLE MODULES:
${moduleList}

INDUSTRY CONFIGS contain: colors, typography, layouts, effects, sections, and visual prompts.

When inferring:
- Business names in quotes or after "for" should be extracted exactly
- Industry should match one of the available keys
- Location can be inferred from city/state/country mentions
- Target audience should match the industry type
- Tone should match industry norms (e.g., law firms = professional, pizzerias = warm/friendly)
- Pages should be 5-8, appropriate for the industry
- Modules should include auth + industry-relevant features
- Colors can use the industry default or be customized based on vibe words`;

  const userPrompt = `Analyze this request and return a complete website configuration:

"${input}"

${quickBusinessName ? `Detected business name: "${quickBusinessName}"` : ''}
${quickIndustry ? `Likely industry: "${quickIndustry}"` : ''}

Return ONLY this JSON structure (no other text):
{
  "businessName": "The business name (infer professional name if not specified)",
  "industry": "exact industry key from available list",
  "location": {
    "city": "city or null",
    "state": "state/province or null",
    "country": "country (default USA)"
  },
  "targetAudience": "primary audience (e.g., 'families', 'young professionals', 'businesses')",
  "tone": "brand voice (e.g., 'professional', 'friendly', 'luxurious', 'energetic')",
  "pages": ["array of 5-8 page names"],
  "modules": ["array of module names from available list"],
  "colorOverride": {
    "useDefault": true,
    "primary": "#hex or null",
    "accent": "#hex or null"
  },
  "layoutPreference": "preferred layout style or null",
  "effects": ["suggested effects from industry config"],
  "specialFeatures": {
    "hasBooking": true/false,
    "hasEcommerce": true/false,
    "hasPortfolio": true/false,
    "hasBlog": true/false
  },
  "inferredDetails": {
    "tagline": "a catchy tagline for the business",
    "heroHeadline": "compelling headline for homepage",
    "callToAction": "primary CTA text",
    "uniqueSellingPoints": ["3-4 key differentiators"]
  },
  "confidence": "high/medium/low"
}`;

  try {
    const startTime = Date.now();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    const durationMs = Date.now() - startTime;
    console.log(`[orchestrator] Claude response in ${durationMs}ms`);

    // Extract JSON from response
    const responseText = response.content[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const aiConfig = JSON.parse(jsonMatch[0]);
    console.log(`[orchestrator] Inferred: ${aiConfig.businessName} (${aiConfig.industry})`);

    // Validate and fill in any missing pieces
    const industry = VALID_INDUSTRIES.includes(aiConfig.industry)
      ? aiConfig.industry
      : (quickIndustry || 'consulting');

    const industryConfig = INDUSTRIES[industry] || INDUSTRIES['consulting'];
    const category = getIndustryCategory(industry);

    // Build the final payload for /api/assemble
    const assemblePayload = {
      type: 'business',
      name: aiConfig.businessName || quickBusinessName || 'New Business',
      industry: industry,

      // Theme configuration
      theme: {
        colors: aiConfig.colorOverride?.useDefault !== false
          ? industryConfig.colors
          : {
              ...industryConfig.colors,
              primary: aiConfig.colorOverride?.primary || industryConfig.colors.primary,
              accent: aiConfig.colorOverride?.accent || industryConfig.colors.accent
            },
        typography: industryConfig.typography,
        layout: aiConfig.layoutPreference || industryConfig.defaultLayout,
        effects: aiConfig.effects?.length > 0 ? aiConfig.effects : industryConfig.effects
      },

      // Content configuration
      description: aiConfig.inferredDetails?.tagline || industryConfig.vibe,

      // Location
      location: aiConfig.location?.city ? aiConfig.location : null,

      // Pages and modules
      pages: aiConfig.pages?.length > 0
        ? aiConfig.pages
        : PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default,

      modules: aiConfig.modules?.length > 0
        ? aiConfig.modules
        : MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default,

      // Additional metadata
      metadata: {
        orchestratorVersion: '2.0',
        generatedAt: new Date().toISOString(),
        type: 'business',
        confidence: aiConfig.confidence || 'medium',
        targetAudience: aiConfig.targetAudience,
        tone: aiConfig.tone,
        specialFeatures: aiConfig.specialFeatures,
        inferredDetails: aiConfig.inferredDetails,
        originalInput: input,
        processingTimeMs: durationMs,
        tokenUsage: response.usage
      },

      // Auto-deploy setting (can be overridden by caller)
      autoDeploy: false,

      // Reference the industry config for the generator
      industryConfig: {
        name: industryConfig.name,
        icon: industryConfig.icon,
        category: industryConfig.category,
        vibe: industryConfig.vibe,
        visualPrompt: industryConfig.visualPrompt,
        imagery: industryConfig.imagery
      }
    };

    return {
      success: true,
      type: 'business',
      payload: assemblePayload,
      summary: {
        type: 'business',
        businessName: assemblePayload.name,
        industry: industry,
        industryName: industryConfig.name,
        pages: assemblePayload.pages.length,
        modules: assemblePayload.modules.length,
        location: aiConfig.location?.city
          ? `${aiConfig.location.city}${aiConfig.location.state ? ', ' + aiConfig.location.state : ''}`
          : 'Not specified',
        confidence: aiConfig.confidence
      }
    };

  } catch (error) {
    console.error('[orchestrator] Error:', error.message);

    // Fallback to local inference if Claude fails
    if (quickIndustry || quickBusinessName) {
      console.log('[orchestrator] Using fallback local inference');

      const industry = quickIndustry || 'consulting';
      const industryConfig = INDUSTRIES[industry] || INDUSTRIES['consulting'];
      const category = getIndustryCategory(industry);

      return {
        success: true,
        type: 'business',
        payload: {
          type: 'business',
          name: quickBusinessName || 'New Business',
          industry: industry,
          theme: {
            colors: industryConfig.colors,
            typography: industryConfig.typography,
            layout: industryConfig.defaultLayout,
            effects: industryConfig.effects
          },
          description: industryConfig.vibe,
          pages: PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default,
          modules: MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default,
          autoDeploy: false,
          metadata: {
            orchestratorVersion: '2.0',
            generatedAt: new Date().toISOString(),
            type: 'business',
            confidence: 'low',
            fallbackUsed: true,
            originalInput: input,
            error: error.message
          },
          industryConfig: {
            name: industryConfig.name,
            icon: industryConfig.icon,
            category: industryConfig.category,
            vibe: industryConfig.vibe,
            visualPrompt: industryConfig.visualPrompt,
            imagery: industryConfig.imagery
          }
        },
        summary: {
          type: 'business',
          businessName: quickBusinessName || 'New Business',
          industry: industry,
          industryName: industryConfig.name,
          pages: (PAGE_RECOMMENDATIONS[category] || PAGE_RECOMMENDATIONS.default).length,
          modules: (MODULE_RECOMMENDATIONS[industry] || MODULE_RECOMMENDATIONS.default).length,
          location: 'Not specified',
          confidence: 'low',
          fallbackUsed: true
        }
      };
    }

    throw new Error(`Orchestration failed: ${error.message}`);
  }
}

/**
 * Main orchestration function
 * Takes a single sentence and returns a complete payload
 *
 * @param {string} userInput - Single sentence describing what to create
 * @returns {Promise<Object>} Complete payload for /api/assemble or /api/tool
 */
async function orchestrate(userInput) {
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length < 3) {
    throw new Error('Please provide a description of what you want to create');
  }

  const input = userInput.trim();
  console.log(`[orchestrator] Processing: "${input}"`);

  // Detect intent type (tool vs business)
  const intent = detectIntentType(input);
  console.log(`[orchestrator] Detected type: ${intent.type} (confidence: ${intent.confidence})`);

  if (intent.type === 'tool') {
    return orchestrateTool(input, intent.toolKey);
  } else {
    return orchestrateBusiness(input);
  }
}

/**
 * Validate an orchestrator result before sending to assemble
 */
function validatePayload(payload) {
  const errors = [];

  if (payload.type === 'tool') {
    if (!payload.name || payload.name.length < 2) {
      errors.push('Tool name is required (min 2 characters)');
    }
    if (!payload.toolConfig || !payload.toolConfig.fields) {
      errors.push('Tool configuration is required');
    }
  } else {
    if (!payload.name || payload.name.length < 2) {
      errors.push('Business name is required (min 2 characters)');
    }
    if (!payload.industry || !VALID_INDUSTRIES.includes(payload.industry)) {
      errors.push(`Invalid industry. Must be one of: ${VALID_INDUSTRIES.slice(0, 10).join(', ')}...`);
    }
    if (!payload.pages || !Array.isArray(payload.pages) || payload.pages.length < 1) {
      errors.push('At least one page is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get a preview of what the orchestrator would generate
 */
async function preview(userInput) {
  const result = await orchestrate(userInput);

  if (result.type === 'tool') {
    return {
      type: 'tool',
      name: result.summary.name,
      toolCategory: result.summary.toolCategory,
      features: result.payload.toolConfig.features,
      fields: result.payload.toolConfig.fields.length,
      colors: result.payload.theme.colors,
      confidence: result.summary.confidence
    };
  }

  return {
    type: 'business',
    businessName: result.summary.businessName,
    industry: result.summary.industryName,
    pages: result.payload.pages,
    modules: result.payload.modules,
    colors: result.payload.theme.colors,
    tagline: result.payload.metadata?.inferredDetails?.tagline,
    confidence: result.summary.confidence
  };
}

module.exports = {
  orchestrate,
  validatePayload,
  preview,
  detectIntentType,
  VALID_INDUSTRIES,
  INDUSTRY_KEYWORDS,
  TOOL_KEYWORDS,
  TOOL_TEMPLATES,
  TOOL_CATEGORIES
};
