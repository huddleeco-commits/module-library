/**
 * Test Lab Page - Mirrors Quick Start Flow Exactly
 *
 * Tests the full generation/deployment pipeline without AI API costs.
 * Uses mock fixtures instead of calling Claude API.
 *
 * FLOW (same as Quick Start):
 * 1. Describe your business (free-form text input)
 * 2. Industry auto-detected (same logic as QuickStep)
 * 3. Customize (pages, colors, settings)
 * 4. Generate (using fixtures, no AI)
 * 5. Results + local run instructions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  Settings,
  Check,
  ChevronRight,
  Loader2,
  ExternalLink,
  Code,
  Globe,
  Smartphone,
  CheckCircle,
  Clock,
  Zap,
  ArrowLeft,
  Palette,
  FileText,
  Users,
  DollarSign,
  Building
} from 'lucide-react';

const API_URL = window.location.origin;

// ============================================
// INDUSTRY DETECTION (same as QuickStep.jsx)
// ============================================
const INDUSTRY_KEYWORDS = {
  restaurant: ['restaurant', 'food', 'dining', 'eatery', 'bistro', 'grill', 'kitchen'],
  pizza: ['pizza', 'pizzeria'],
  steakhouse: ['steak', 'steakhouse', 'chophouse'],
  bbq: ['bbq', 'barbecue', 'barbeque', 'smokehouse'],
  cafe: ['cafe', 'coffee', 'roaster', 'espresso', 'bakery'],
  bar: ['bar', 'pub', 'tavern', 'brewery', 'taproom', 'lounge'],
  dental: ['dental', 'dentist', 'orthodont'],
  healthcare: ['doctor', 'clinic', 'medical', 'healthcare', 'physician', 'health'],
  'law-firm': ['law', 'attorney', 'lawyer', 'legal', 'litigation'],
  fitness: ['gym', 'fitness', 'crossfit', 'workout', 'training'],
  yoga: ['yoga', 'pilates', 'meditation', 'wellness'],
  'spa-salon': ['spa', 'salon', 'beauty', 'nail', 'hair', 'massage'],
  barbershop: ['barber', 'barbershop', 'haircut'],
  tattoo: ['tattoo', 'ink', 'piercing', 'body art'],
  'real-estate': ['real estate', 'realtor', 'realty', 'property'],
  construction: ['construction', 'contractor', 'builder', 'roofing'],
  plumber: ['plumb', 'hvac', 'heating', 'cooling'],
  electrician: ['electric', 'electrical', 'wiring'],
  auto: ['auto', 'car', 'mechanic', 'garage', 'tire', 'oil change'],
  collectibles: ['card', 'collect', 'sports card', 'trading card', 'memorabilia'],
  finance: ['investment', 'wealth', 'portfolio', 'hedge fund', 'private equity', 'asset management', 'capital', 'securities', 'brokerage', 'financial advisor'],
  retail: ['shop', 'store', 'boutique', 'retail'],
  photography: ['photo', 'photography', 'photographer', 'studio'],
  wedding: ['wedding', 'bridal', 'event planning'],
  pet: ['pet', 'dog', 'cat', 'grooming', 'veterinary', 'vet'],
  cleaning: ['cleaning', 'maid', 'janitorial', 'housekeeping'],
  landscaping: ['landscaping', 'lawn', 'garden', 'tree service'],
  moving: ['moving', 'movers', 'relocation', 'storage'],
  tutoring: ['tutor', 'tutoring', 'education', 'learning center'],
  daycare: ['daycare', 'childcare', 'preschool', 'nursery'],
  church: ['church', 'ministry', 'worship', 'congregation'],
  nonprofit: ['nonprofit', 'charity', 'foundation', 'ngo']
};

// Map industries to actual fixture files that exist in test-fixtures/
// AVAILABLE FIXTURES (only these exist): pizza-restaurant, steakhouse, salon-spa, fitness-gym, coffee-cafe
const INDUSTRY_INFO = {
  restaurant: { name: 'Restaurant', icon: '🍽️', fixture: 'pizza-restaurant' },
  pizza: { name: 'Pizza Restaurant', icon: '🍕', fixture: 'pizza-restaurant' },
  steakhouse: { name: 'Steakhouse', icon: '🥩', fixture: 'steakhouse' },
  bbq: { name: 'BBQ Restaurant', icon: '🔥', fixture: 'pizza-restaurant' },
  cafe: { name: 'Coffee Shop', icon: '☕', fixture: 'coffee-cafe' },
  bar: { name: 'Bar / Brewery', icon: '🍺', fixture: 'pizza-restaurant' },
  dental: { name: 'Dental Practice', icon: '🦷', fixture: 'salon-spa' },
  healthcare: { name: 'Healthcare', icon: '🏥', fixture: 'salon-spa' },
  'law-firm': { name: 'Law Firm', icon: '⚖️', fixture: 'coffee-cafe' },
  fitness: { name: 'Fitness / Gym', icon: '🏋️', fixture: 'fitness-gym' },
  yoga: { name: 'Yoga Studio', icon: '🧘', fixture: 'fitness-gym' },
  'spa-salon': { name: 'Spa / Salon', icon: '💆', fixture: 'salon-spa' },
  barbershop: { name: 'Barbershop', icon: '💈', fixture: 'salon-spa' },
  tattoo: { name: 'Tattoo Studio', icon: '🎨', fixture: 'salon-spa' },
  'real-estate': { name: 'Real Estate', icon: '🏠', fixture: 'coffee-cafe' },
  construction: { name: 'Construction', icon: '🔨', fixture: 'coffee-cafe' },
  plumber: { name: 'Plumber / HVAC', icon: '🔧', fixture: 'coffee-cafe' },
  electrician: { name: 'Electrician', icon: '⚡', fixture: 'coffee-cafe' },
  auto: { name: 'Auto Repair', icon: '🚗', fixture: 'coffee-cafe' },
  collectibles: { name: 'Collectibles', icon: '🃏', fixture: 'coffee-cafe' },
  finance: { name: 'Finance', icon: '💹', fixture: 'coffee-cafe' },
  retail: { name: 'Retail Store', icon: '🛍️', fixture: 'coffee-cafe' },
  photography: { name: 'Photography', icon: '📷', fixture: 'salon-spa' },
  wedding: { name: 'Wedding Services', icon: '💒', fixture: 'salon-spa' },
  pet: { name: 'Pet Services', icon: '🐕', fixture: 'salon-spa' },
  cleaning: { name: 'Cleaning Service', icon: '🧹', fixture: 'coffee-cafe' },
  landscaping: { name: 'Landscaping', icon: '🌳', fixture: 'coffee-cafe' },
  moving: { name: 'Moving Company', icon: '📦', fixture: 'coffee-cafe' },
  tutoring: { name: 'Tutoring', icon: '📚', fixture: 'coffee-cafe' },
  daycare: { name: 'Daycare', icon: '👶', fixture: 'coffee-cafe' },
  church: { name: 'Church', icon: '⛪', fixture: 'coffee-cafe' },
  nonprofit: { name: 'Nonprofit', icon: '💚', fixture: 'coffee-cafe' },
  saas: { name: 'Business', icon: '💼', fixture: 'coffee-cafe' }
};

function detectIndustry(input) {
  const inputLower = input.toLowerCase();

  // Check each industry's keywords
  for (const [industryKey, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some(keyword => inputLower.includes(keyword))) {
      return { key: industryKey, ...INDUSTRY_INFO[industryKey] };
    }
  }

  // Default fallback
  return { key: 'saas', ...INDUSTRY_INFO.saas };
}

function extractLocation(input) {
  // Try to extract "in [Location]" pattern
  const inMatch = input.match(/\bin\s+([A-Za-z\s,]+?)(?:\s*$|\s+(?:that|with|for))/i);
  if (inMatch) return inMatch[1].trim();

  // Try to extract city, state pattern
  const cityStateMatch = input.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\b/);
  if (cityStateMatch) return `${cityStateMatch[1]}, ${cityStateMatch[2]}`;

  return '';
}

// ============================================
// TERMINAL COMMAND COMPONENT
// ============================================
function TerminalCommand({ label, command }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0d0d14', borderRadius: '6px', padding: '8px 12px', border: '1px solid #2a2a3a' }}>
        <code style={{ flex: 1, fontSize: '11px', color: '#10b981', fontFamily: 'monospace', wordBreak: 'break-all' }}>{command}</code>
        <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', backgroundColor: '#374151', color: '#d1d5db', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {copied ? <Check size={14} color="#10b981" /> : <Code size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN TEST LAB COMPONENT
// ============================================
export default function TestLabPage() {
  // Step state (mirrors Quick Start flow)
  const [currentStep, setCurrentStep] = useState('input'); // input, customize, generating, complete

  // Input state
  const [input, setInput] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(null);

  // Customization state (mirrors CustomizeStep)
  const [customizations, setCustomizations] = useState({
    businessName: '',
    location: '',
    tagline: '',
    teamSize: 'small',
    priceRange: '$$',
    primaryCTA: 'contact'
  });

  // Page selection
  const [websitePages, setWebsitePages] = useState({
    home: true,
    menu: true,
    about: true,
    contact: true,
    gallery: true,
    team: false,
    reviews: false,
    blog: false,
    faq: false
  });

  const [appPages, setAppPages] = useState({
    home: true,
    rewards: true,
    order: true,
    profile: true,
    wallet: false,
    notifications: false
  });

  // Colors
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#f59e0b'
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState([]);
  const [generationResult, setGenerationResult] = useState(null);

  const logsEndRef = useRef(null);

  // Example inputs (same as Quick Start)
  const examples = [
    'Pizza restaurant in Brooklyn',
    'Dental clinic in Austin',
    'Sports card shop',
    'Yoga studio in LA',
    'Law firm in Miami',
    'BBQ restaurant in Dallas'
  ];

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generationLogs]);

  // ============================================
  // STEP 1: DETECT INDUSTRY (same as QuickStep)
  // ============================================
  const handleDetect = () => {
    if (!input.trim()) return;

    setDetecting(true);

    // Simulate detection delay (like Quick Start)
    setTimeout(() => {
      const industry = detectIndustry(input);
      const location = extractLocation(input);

      setDetected(industry);
      setCustomizations(prev => ({
        ...prev,
        businessName: input,
        location: location,
        tagline: `Your trusted ${industry.name.toLowerCase()} partner`
      }));

      // Set industry-appropriate pages
      if (['restaurant', 'pizza', 'steakhouse', 'bbq', 'cafe', 'bar'].includes(industry.key)) {
        setWebsitePages({ home: true, menu: true, about: true, contact: true, gallery: true, team: false, reviews: true, blog: false, faq: false });
        setAppPages({ home: true, rewards: true, order: true, profile: true, wallet: false, notifications: true });
      } else if (['dental', 'healthcare'].includes(industry.key)) {
        setWebsitePages({ home: true, menu: false, about: true, contact: true, gallery: false, team: true, reviews: true, blog: false, faq: true });
        setAppPages({ home: true, rewards: false, order: false, profile: true, wallet: false, notifications: true });
      } else if (['law-firm', 'finance'].includes(industry.key)) {
        setWebsitePages({ home: true, menu: false, about: true, contact: true, gallery: false, team: true, reviews: false, blog: true, faq: true });
        setAppPages({ home: true, rewards: false, order: false, profile: true, wallet: false, notifications: true });
      }

      setDetecting(false);
    }, 800);
  };

  // ============================================
  // STEP 2: CUSTOMIZE (continue to customize step)
  // ============================================
  const handleContinueToCustomize = () => {
    setCurrentStep('customize');
  };

  // ============================================
  // STEP 3: GENERATE (using fixtures, no AI)
  // ============================================
  const handleGenerate = async () => {
    setCurrentStep('generating');
    setGenerating(true);
    setGenerationLogs([]);
    setGenerationResult(null);

    const addLog = (message, type = 'info') => {
      setGenerationLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      }]);
    };

    try {
      addLog('🧪 Test Mode generation starting...');
      addLog(`📁 Loading fixture: ${detected.fixture}`);
      addLog(`🏪 Business: ${customizations.businessName}`);

      const selectedWebsitePages = Object.keys(websitePages).filter(p => websitePages[p]);
      const selectedAppPages = Object.keys(appPages).filter(p => appPages[p]);

      addLog(`📄 Website pages: ${selectedWebsitePages.join(', ')}`);
      addLog(`📱 App pages: ${selectedAppPages.join(', ')}`);
      addLog('⏭️ Skipping AI generation (using mock data)');
      addLog('⏭️ Skipping image generation (using placeholders)');

      const response = await fetch(`${API_URL}/api/test-mode/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId: detected.fixture || 'restaurant',
          customizations: {
            businessName: customizations.businessName,
            location: customizations.location,
            tagline: customizations.tagline,
            teamSize: customizations.teamSize,
            priceRange: customizations.priceRange,
            colors
          },
          websitePages: selectedWebsitePages,
          appPages: selectedAppPages,
          deploy: false
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());

              if (data.message) {
                addLog(data.message, data.type || 'info');
              }

              if (data.step === 'complete' || data.success) {
                setGenerationResult(data);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      addLog('✅ Generation complete!', 'success');
      setCurrentStep('complete');
    } catch (err) {
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // ============================================
  // STEP NAVIGATION
  // ============================================
  const handleBack = () => {
    if (currentStep === 'customize') {
      setCurrentStep('input');
      setDetected(null);
    } else if (currentStep === 'complete') {
      setCurrentStep('input');
      setDetected(null);
      setGenerationResult(null);
      setGenerationLogs([]);
    }
  };

  const handleReset = () => {
    setCurrentStep('input');
    setInput('');
    setDetected(null);
    setGenerationResult(null);
    setGenerationLogs([]);
    setCustomizations({
      businessName: '',
      location: '',
      tagline: '',
      teamSize: 'small',
      priceRange: '$$',
      primaryCTA: 'contact'
    });
  };

  // ============================================
  // RENDER: INPUT STEP (mirrors QuickStep)
  // ============================================
  if (currentStep === 'input') {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <FlaskConical size={28} color="#10b981" />
            <div>
              <h1 style={styles.title}>Test Lab</h1>
              <p style={styles.subtitle}>Test Quick Start flow without AI costs</p>
            </div>
          </div>
          <div style={styles.testModeBadge}>
            <FlaskConical size={16} />
            <span>Test Mode - No API Costs</span>
          </div>
        </div>

        {/* Main Input Area (same as Quick Start) */}
        <div style={styles.inputSection}>
          <h2 style={styles.inputTitle}>⚡ What are you building?</h2>
          <p style={styles.inputSubtitle}>Describe your business in a few words (same as Quick Start)</p>

          <div style={styles.inputRow}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDetect()}
              placeholder="e.g., BBQ restaurant in Dallas"
              style={styles.bigInput}
              autoFocus
            />
            <button
              onClick={handleDetect}
              disabled={detecting || !input.trim()}
              style={{
                ...styles.primaryBtn,
                opacity: detecting || !input.trim() ? 0.5 : 1
              }}
            >
              {detecting ? '🔍 Detecting...' : 'Continue →'}
            </button>
          </div>

          {/* Example chips */}
          <div style={styles.examples}>
            <p style={styles.examplesLabel}>Try these:</p>
            <div style={styles.exampleChips}>
              {examples.map(ex => (
                <button key={ex} style={styles.exampleChip} onClick={() => setInput(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Detection result */}
          {detected && (
            <div style={styles.detectedCard}>
              <div style={styles.detectedIcon}>{detected.icon}</div>
              <div style={styles.detectedContent}>
                <h3 style={styles.detectedTitle}>{detected.name} Detected!</h3>
                <p style={styles.detectedDesc}>Using {detected.fixture} fixture. Ready to customize.</p>
              </div>
              <button style={styles.continueBtn} onClick={handleContinueToCustomize}>
                Customize →
              </button>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div style={styles.howItWorks}>
          <h3 style={styles.howItWorksTitle}>How Test Lab Works</h3>
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <h4>Describe Business</h4>
                <p>Same input as Quick Start</p>
              </div>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <h4>Auto-Detect Industry</h4>
                <p>Same detection logic</p>
              </div>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <h4>Customize</h4>
                <p>Same options as Quick Start</p>
              </div>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepContent}>
                <h4>Generate (Mock)</h4>
                <p>Uses fixtures, no AI cost</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: CUSTOMIZE STEP (mirrors CustomizeStep)
  // ============================================
  if (currentStep === 'customize') {
    return (
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={handleBack} style={styles.backBtn}>
            <ArrowLeft size={18} /> Back
          </button>
          <div style={styles.headerCenter}>
            <span style={styles.detectedBadge}>{detected.icon} {detected.name}</span>
          </div>
          <div style={styles.testModeBadge}>
            <FlaskConical size={16} />
            <span>Test Mode</span>
          </div>
        </div>

        <div style={styles.customizeGrid}>
          {/* Left: Form */}
          <div style={styles.formPanel}>
            <h2 style={styles.sectionTitle}>
              <Settings size={20} />
              Customize Your Site
            </h2>

            {/* Business Details */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>
                <Building size={16} /> Business Details
              </h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Business Name</label>
                <input
                  type="text"
                  value={customizations.businessName}
                  onChange={(e) => setCustomizations({ ...customizations, businessName: e.target.value })}
                  style={styles.input}
                  placeholder="Your Business Name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  value={customizations.location}
                  onChange={(e) => setCustomizations({ ...customizations, location: e.target.value })}
                  style={styles.input}
                  placeholder="City, State"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tagline</label>
                <input
                  type="text"
                  value={customizations.tagline}
                  onChange={(e) => setCustomizations({ ...customizations, tagline: e.target.value })}
                  style={styles.input}
                  placeholder="Your catchy tagline"
                />
              </div>
            </div>

            {/* Business Size */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>
                <Users size={16} /> Team & Pricing
              </h3>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Team Size</label>
                  <select
                    value={customizations.teamSize}
                    onChange={(e) => setCustomizations({ ...customizations, teamSize: e.target.value })}
                    style={styles.select}
                  >
                    <option value="solo">Solo</option>
                    <option value="small">Small (2-10)</option>
                    <option value="medium">Medium (10-50)</option>
                    <option value="large">Large (50+)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price Range</label>
                  <select
                    value={customizations.priceRange}
                    onChange={(e) => setCustomizations({ ...customizations, priceRange: e.target.value })}
                    style={styles.select}
                  >
                    <option value="$">$ Budget</option>
                    <option value="$$">$$ Moderate</option>
                    <option value="$$$">$$$ Upscale</option>
                    <option value="$$$$">$$$$ Luxury</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>
                <Palette size={16} /> Brand Colors
              </h3>
              <div style={styles.colorGrid}>
                <div style={styles.colorItem}>
                  <label style={styles.colorLabel}>Primary</label>
                  <input
                    type="color"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    style={styles.colorInput}
                  />
                </div>
                <div style={styles.colorItem}>
                  <label style={styles.colorLabel}>Secondary</label>
                  <input
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    style={styles.colorInput}
                  />
                </div>
                <div style={styles.colorItem}>
                  <label style={styles.colorLabel}>Accent</label>
                  <input
                    type="color"
                    value={colors.accent}
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    style={styles.colorInput}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Page Selection */}
          <div style={styles.pagesPanel}>
            {/* Website Pages */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>
                <Globe size={16} /> Website Pages
              </h3>
              <div style={styles.checkboxGrid}>
                {Object.keys(websitePages).map(page => (
                  <label key={page} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={websitePages[page]}
                      onChange={(e) => setWebsitePages({ ...websitePages, [page]: e.target.checked })}
                    />
                    <span style={styles.checkboxLabel}>
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* App Pages */}
            <div style={styles.formSection}>
              <h3 style={styles.formSectionTitle}>
                <Smartphone size={16} /> Companion App Pages
              </h3>
              <div style={styles.checkboxGrid}>
                {Object.keys(appPages).map(page => (
                  <label key={page} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={appPages[page]}
                      onChange={(e) => setAppPages({ ...appPages, [page]: e.target.checked })}
                    />
                    <span style={styles.checkboxLabel}>
                      {page.charAt(0).toUpperCase() + page.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              style={styles.generateButton}
            >
              <Play size={20} />
              Generate Test Build
            </button>

            <p style={styles.generateNote}>
              🧪 Using mock fixtures - No AI API costs
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: GENERATING STEP
  // ============================================
  if (currentStep === 'generating') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <FlaskConical size={28} color="#10b981" />
            <div>
              <h1 style={styles.title}>Generating...</h1>
              <p style={styles.subtitle}>{customizations.businessName}</p>
            </div>
          </div>
          <div style={styles.testModeBadge}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Building...</span>
          </div>
        </div>

        <div style={styles.logContainer}>
          {generationLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                ...styles.logEntry,
                ...(log.type === 'error' ? styles.logError : {}),
                ...(log.type === 'success' ? styles.logSuccess : {})
              }}
            >
              <span style={styles.logTime}>{log.timestamp}</span>
              <span style={styles.logMessage}>{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: COMPLETE STEP
  // ============================================
  if (currentStep === 'complete') {
    const projectPath = generationResult?.projectPath || `C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects\\${customizations.businessName.replace(/[^a-zA-Z0-9]/g, '-')}`;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleReset} style={styles.backBtn}>
            <ArrowLeft size={18} /> New Test
          </button>
          <div style={styles.headerCenter}>
            <CheckCircle size={24} color="#10b981" />
            <h1 style={{ ...styles.title, color: '#10b981', marginLeft: '12px' }}>Test Build Complete!</h1>
          </div>
          <div style={styles.testModeBadge}>
            <FlaskConical size={16} />
            <span>Test Mode</span>
          </div>
        </div>

        {/* Result Summary */}
        <div style={styles.resultCard}>
          <div style={styles.resultHeader}>
            <span style={styles.resultIcon}>{detected?.icon}</span>
            <div>
              <h2 style={styles.resultTitle}>{customizations.businessName}</h2>
              <p style={styles.resultSubtitle}>{detected?.name} • {customizations.location || 'No location'}</p>
            </div>
          </div>
          <div style={styles.resultStats}>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>{Object.values(websitePages).filter(Boolean).length}</span>
              <span style={styles.resultStatLabel}>Website Pages</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>{Object.values(appPages).filter(Boolean).length}</span>
              <span style={styles.resultStatLabel}>App Pages</span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatValue}>$0</span>
              <span style={styles.resultStatLabel}>AI Cost</span>
            </div>
          </div>
        </div>

        {/* Quick Start Instructions */}
        <div style={styles.quickStartPanel}>
          <h3 style={styles.sectionTitle}>
            <Zap size={20} />
            Run Your Test Project Locally
          </h3>

          {/* Local URLs */}
          <div style={styles.urlSection}>
            <h4 style={styles.urlSectionTitle}>Local Development URLs</h4>
            <div style={styles.urlGrid}>
              <div style={styles.urlCard}>
                <div style={styles.urlCardHeader}>
                  <Globe size={16} color="#3b82f6" />
                  <span>Website</span>
                </div>
                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" style={styles.urlLink}>
                  localhost:5173 <ExternalLink size={14} />
                </a>
              </div>
              <div style={styles.urlCard}>
                <div style={styles.urlCardHeader}>
                  <Smartphone size={16} color="#8b5cf6" />
                  <span>Companion App</span>
                </div>
                <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer" style={styles.urlLink}>
                  localhost:5174 <ExternalLink size={14} />
                </a>
              </div>
              <div style={styles.urlCard}>
                <div style={styles.urlCardHeader}>
                  <Settings size={16} color="#f59e0b" />
                  <span>Admin</span>
                </div>
                <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" style={styles.urlLink}>
                  localhost:5175 <ExternalLink size={14} />
                </a>
              </div>
              <div style={styles.urlCard}>
                <div style={styles.urlCardHeader}>
                  <Code size={16} color="#10b981" />
                  <span>Backend API</span>
                </div>
                <a href="http://localhost:5000/health" target="_blank" rel="noopener noreferrer" style={styles.urlLink}>
                  localhost:5000 <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Terminal Commands */}
          <div style={styles.terminalSection}>
            <h4 style={styles.urlSectionTitle}>Terminal Commands (run in 4 separate terminals)</h4>
            <TerminalCommand
              label="1. Backend (port 5000)"
              command={`cd "${projectPath}\\backend" && npm install && npm run dev`}
            />
            <TerminalCommand
              label="2. Website (port 5173)"
              command={`cd "${projectPath}\\frontend" && npm install && npm run dev`}
            />
            <TerminalCommand
              label="3. Companion App (port 5174)"
              command={`cd "${projectPath}\\companion-app" && npm install && npm run dev`}
            />
            <TerminalCommand
              label="4. Admin Dashboard (port 5175)"
              command={`cd "${projectPath}\\admin" && npm install && npm run dev`}
            />
          </div>

          {/* Test Checklist */}
          <div style={styles.checklistSection}>
            <h4 style={styles.urlSectionTitle}>Sync Test Checklist</h4>
            <div style={styles.checklist}>
              <label style={styles.checklistItem}><input type="checkbox" /> Backend running at localhost:5000/health</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Website loads at localhost:5173</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Companion app loads at localhost:5174</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Login with demo@demo.com / demo1234</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Menu shows on website and app (synced)</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Place order on app, appears in admin</label>
              <label style={styles.checklistItem}><input type="checkbox" /> Loyalty points show in app after login</label>
            </div>
          </div>
        </div>

        {/* Generation Log (collapsed) */}
        <details style={styles.logDetails}>
          <summary style={styles.logSummary}>View Generation Log ({generationLogs.length} entries)</summary>
          <div style={styles.logContainerSmall}>
            {generationLogs.map((log, idx) => (
              <div key={idx} style={styles.logEntry}>
                <span style={styles.logTime}>{log.timestamp}</span>
                <span style={styles.logMessage}>{log.message}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  return null;
}

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    padding: '24px',
    minHeight: '100%',
    backgroundColor: '#0a0a0f'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  testModeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#10b98120',
    border: '1px solid #10b98140',
    borderRadius: '20px',
    color: '#10b981',
    fontSize: '13px',
    fontWeight: 500
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '14px',
    cursor: 'pointer'
  },
  detectedBadge: {
    padding: '8px 16px',
    backgroundColor: '#1a1a2e',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500
  },

  // Input Step
  inputSection: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '40px 0'
  },
  inputTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '8px'
  },
  inputSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px'
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  bigInput: {
    flex: 1,
    padding: '18px 24px',
    fontSize: '18px',
    backgroundColor: '#12121a',
    border: '2px solid #2a2a3a',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none'
  },
  primaryBtn: {
    padding: '18px 32px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#10b981',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  examples: {
    textAlign: 'left'
  },
  examplesLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '12px'
  },
  exampleChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  exampleChip: {
    padding: '8px 16px',
    fontSize: '13px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '20px',
    color: '#9ca3af',
    cursor: 'pointer'
  },
  detectedCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    marginTop: '24px',
    backgroundColor: '#10b98115',
    border: '1px solid #10b98140',
    borderRadius: '12px'
  },
  detectedIcon: {
    fontSize: '40px'
  },
  detectedContent: {
    flex: 1,
    textAlign: 'left'
  },
  detectedTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#10b981',
    margin: 0
  },
  detectedDesc: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  },
  continueBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    backgroundColor: '#10b981',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  // How It Works
  howItWorks: {
    maxWidth: '800px',
    margin: '40px auto 0',
    padding: '24px',
    backgroundColor: '#12121a',
    borderRadius: '12px',
    border: '1px solid #2a2a3a'
  },
  howItWorksTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '20px',
    textAlign: 'center'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  stepCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px'
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    color: '#000',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  },

  // Customize Step
  customizeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  formPanel: {
    backgroundColor: '#12121a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a2a3a'
  },
  pagesPanel: {
    backgroundColor: '#12121a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a2a3a'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '20px'
  },
  formSection: {
    marginBottom: '24px'
  },
  formSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#9ca3af',
    marginBottom: '12px'
  },
  formGroup: {
    marginBottom: '12px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  colorGrid: {
    display: 'flex',
    gap: '16px'
  },
  colorItem: {
    flex: 1,
    textAlign: 'center'
  },
  colorLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  colorInput: {
    width: '100%',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#1a1a2e',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#d1d5db'
  },
  generateButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    marginTop: '24px',
    backgroundColor: '#10b981',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  generateNote: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '12px'
  },

  // Generating Step
  logContainer: {
    backgroundColor: '#0d0d14',
    borderRadius: '12px',
    padding: '20px',
    minHeight: '400px',
    maxHeight: '500px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  logEntry: {
    display: 'flex',
    gap: '12px',
    padding: '6px 0',
    color: '#d1d5db'
  },
  logError: {
    color: '#ef4444'
  },
  logSuccess: {
    color: '#10b981'
  },
  logTime: {
    color: '#6b7280',
    minWidth: '80px'
  },
  logMessage: {
    flex: 1
  },

  // Complete Step
  resultCard: {
    backgroundColor: '#12121a',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #10b98140'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  resultIcon: {
    fontSize: '48px'
  },
  resultTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    margin: 0
  },
  resultSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  },
  resultStats: {
    display: 'flex',
    gap: '32px'
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column'
  },
  resultStatValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#10b981'
  },
  resultStatLabel: {
    fontSize: '12px',
    color: '#6b7280'
  },

  // Quick Start Panel
  quickStartPanel: {
    backgroundColor: '#12121a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a2a3a'
  },
  urlSection: {
    marginBottom: '24px'
  },
  urlSectionTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#9ca3af',
    marginBottom: '12px'
  },
  urlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  urlCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #2a2a3a'
  },
  urlCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '8px'
  },
  urlLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6366f1',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: 'monospace'
  },
  terminalSection: {
    marginBottom: '24px'
  },
  checklistSection: {
    marginTop: '24px'
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    padding: '16px'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#d1d5db',
    cursor: 'pointer'
  },

  // Log Details
  logDetails: {
    marginTop: '24px'
  },
  logSummary: {
    padding: '12px 16px',
    backgroundColor: '#12121a',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '14px',
    cursor: 'pointer'
  },
  logContainerSmall: {
    backgroundColor: '#0d0d14',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px'
  }
};
