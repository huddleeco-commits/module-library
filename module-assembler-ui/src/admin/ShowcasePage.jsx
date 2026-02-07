/**
 * ShowcasePage — Guided demo flow for the Launchpad engine
 *
 * Step 1: Pick industry (19 industries, 5 categories)
 * Step 2: Name your business
 * Step 3: Choose style (mood presets + sliders)
 * Step 4: Generate & compare 3 variants live
 */

import React, { useState, useEffect } from 'react';
import { MoodSliders, PRESETS } from '../components/MoodSliders';

// ---------------------------------------------------------------------------
// Constants duplicated from LaunchpadDashboard (cannot modify that file)
// ---------------------------------------------------------------------------

const VARIANTS = {
  A: { name: 'Layout A', icon: '🎯', color: '#3B82F6', description: 'Primary layout - action focused' },
  B: { name: 'Layout B', icon: '📖', color: '#F59E0B', description: 'Narrative layout - story focused' },
  C: { name: 'Layout C', icon: '📸', color: '#EC4899', description: 'Visual layout - imagery focused' }
};

const INDUSTRY_LAYOUT_NAMES = {
  'pizza-restaurant': {
    A: { name: 'Video-First', icon: '🎬', description: 'Dynamic video hero with kitchen action' },
    B: { name: 'Storytelling', icon: '📖', description: 'Origin story with timeline and merchandise' },
    C: { name: 'Photography', icon: '📸', description: 'Gallery-focused with lifestyle imagery' }
  },
  'coffee-cafe': {
    A: { name: 'Warm & Cozy', icon: '☕', description: 'Soothing palette with excellent food photography' },
    B: { name: 'Modern Minimal', icon: '✨', description: 'Minimalist design with coffee origin stories' },
    C: { name: 'Urban Industrial', icon: '🏙️', description: 'Bold imagery with direct trade emphasis' }
  },
  'steakhouse': {
    A: { name: 'Dark Luxury', icon: '🥩', description: 'Dramatic dark tones, premium positioning' },
    B: { name: 'Heritage', icon: '📜', description: 'Classic elegance with tradition emphasis' },
    C: { name: 'Modern Upscale', icon: '✨', description: 'Contemporary refinement' }
  },
  'restaurant': {
    A: { name: 'Appetizing Visual', icon: '🍽️', description: 'Food photography forward' },
    B: { name: 'Story-Driven', icon: '📖', description: 'Chef narrative and origin focus' },
    C: { name: 'Lifestyle', icon: '📸', description: 'Ambiance and experience emphasis' }
  },
  'bakery': {
    A: { name: 'Fresh & Bright', icon: '🥐', description: 'Light, inviting with pastry displays' },
    B: { name: 'Artisan', icon: '🎨', description: 'Craft-focused with process storytelling' },
    C: { name: 'Community', icon: '🏠', description: 'Neighborhood feel, cozy atmosphere' }
  }
};

function getVariantInfo(industryId, variantKey) {
  const industryVariants = INDUSTRY_LAYOUT_NAMES[industryId];
  const industryInfo = industryVariants?.[variantKey];
  const defaultInfo = VARIANTS[variantKey];
  if (industryInfo) return { ...defaultInfo, ...industryInfo };
  return defaultInfo;
}

// ---------------------------------------------------------------------------
// Showcase-specific constants
// ---------------------------------------------------------------------------

const INDUSTRY_CATEGORIES = {
  'Food & Drink': ['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'],
  'Personal Services': ['salon-spa', 'barbershop', 'dental', 'yoga', 'fitness-gym'],
  'Professional': ['law-firm', 'healthcare', 'real-estate'],
  'Trade & Home': ['plumber', 'cleaning', 'auto-shop'],
  'Business & Tech': ['saas', 'ecommerce', 'school']
};

const INDUSTRY_EMOJIS = {
  'pizza-restaurant': '🍕', 'steakhouse': '🥩', 'coffee-cafe': '☕',
  'restaurant': '🍽️', 'bakery': '🥐', 'salon-spa': '💅',
  'barbershop': '💈', 'dental': '🦷', 'yoga': '🧘', 'fitness-gym': '💪',
  'law-firm': '⚖️', 'healthcare': '🏥', 'real-estate': '🏠',
  'plumber': '🔧', 'cleaning': '🧹', 'auto-shop': '🔩',
  'saas': '💻', 'ecommerce': '🛍️', 'school': '🎓'
};

const BUSINESS_PRESETS = {
  'pizza-restaurant': ["Mario's Pizza", "Slice of Heaven", "Brooklyn Pie Co"],
  'steakhouse': ["The Prime Cut", "Heritage Steakhouse", "Oak & Ember"],
  'coffee-cafe': ["Bean & Brew", "Morning Ritual", "The Grind House"],
  'restaurant': ["The Garden Table", "Bistro 42", "Coastal Kitchen"],
  'bakery': ["Golden Crust", "Sweet Flour", "The Rolling Pin"],
  'salon-spa': ["Glow Studio", "Serene Beauty", "The Style Bar"],
  'barbershop': ["Sharp Edge", "The Gentleman's Cut", "Classic Fades"],
  'dental': ["Bright Smile Dental", "Family Dental Care", "Pearl Dentistry"],
  'yoga': ["Zen Flow Studio", "Inner Light Yoga", "Balance & Breathe"],
  'fitness-gym': ["Iron Republic", "Peak Performance", "Core Strength"],
  'law-firm': ["Sterling & Associates", "Justice Partners", "Hartwell Law"],
  'healthcare': ["Wellness Medical", "CareFirst Clinic", "Vitality Health"],
  'real-estate': ["Keystone Realty", "Dream Home Properties", "Pinnacle Real Estate"],
  'plumber': ["FlowRight Plumbing", "PipeMaster Pro", "AquaFix Services"],
  'cleaning': ["Sparkle Clean Co", "PureShine Services", "FreshSpace Cleaning"],
  'auto-shop': ["Precision Auto", "Gear Head Garage", "TrustMech Auto"],
  'saas': ["CloudSync", "DataPulse", "FlowStack"],
  'ecommerce': ["Urban Goods", "The Marketplace", "ShopVibe"],
  'school': ["Bright Minds Academy", "Summit Learning", "NextGen School"]
};

const PRESET_DESCRIPTIONS = {
  luxury: 'Understated elegance, premium feel',
  friendly: 'Warm, approachable neighborhood vibe',
  'modern-minimal': 'Clean lines, lots of whitespace',
  'sharp-corporate': 'Polished, precise, professional',
  'bold-energetic': 'Eye-catching colors, high energy',
  'classic-elegant': 'Timeless design, refined taste',
  'dark-sleek': 'Bold dark theme, modern edge'
};

const PAGE_LABELS = {
  home: { path: '/', emoji: '🏠', label: 'Home' },
  menu: { path: '/menu', emoji: '📋', label: 'Menu' },
  services: { path: '/services', emoji: '🛎️', label: 'Services' },
  about: { path: '/about', emoji: 'ℹ️', label: 'About' },
  gallery: { path: '/gallery', emoji: '🖼️', label: 'Gallery' },
  order: { path: '/order', emoji: '🛒', label: 'Order' },
  contact: { path: '/contact', emoji: '📞', label: 'Contact' },
  booking: { path: '/booking', emoji: '📅', label: 'Book' },
  listings: { path: '/listings', emoji: '📄', label: 'Listings' },
  catalog: { path: '/catalog', emoji: '📦', label: 'Catalog' },
  pricing: { path: '/pricing', emoji: '💰', label: 'Pricing' },
  courses: { path: '/courses', emoji: '📚', label: 'Courses' },
  products: { path: '/products', emoji: '🏷️', label: 'Products' }
};

const LOADING_MESSAGES = [
  'Analyzing industry patterns...',
  'Crafting color palettes...',
  'Building page layouts...',
  'Generating responsive components...',
  'Wiring up navigation...',
  'Adding finishing touches...'
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShowcasePage() {
  // Step state
  const [step, setStep] = useState(1);

  // Data
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [businessName, setBusinessName] = useState('');

  // Style
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [moodSliders, setMoodSliders] = useState({ vibe: 50, energy: 50, era: 50, density: 50, price: 50, theme: 'light' });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Preview
  const [startingPreviews, setStartingPreviews] = useState(false);
  const [previewUrls, setPreviewUrls] = useState(null);
  const [comparisonPage, setComparisonPage] = useState('/');
  const [expandedVariant, setExpandedVariant] = useState(null);

  // Fetch industries on mount
  useEffect(() => {
    fetch('/api/launchpad/industries')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.industries) {
          // Normalize: the API may return id as an object { id, name, styleNote }
          const normalized = data.industries.map(ind => {
            const rawId = ind.id;
            if (typeof rawId === 'object' && rawId !== null) {
              return {
                id: rawId.id,
                name: rawId.name || ind.name || rawId.id,
                styleNote: rawId.styleNote || ind.styleNote || '',
                pages: ind.pages || [],
                variants: ind.variants
              };
            }
            return ind;
          });
          setIndustries(normalized);
        }
      })
      .catch(() => {});
  }, []);

  // Rotate loading messages
  useEffect(() => {
    if (!generating) return;
    const timer = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [generating]);

  // ---- Handlers ----

  const handleSelectIndustry = (ind) => {
    setSelectedIndustry(ind);
    setBusinessName('');
    setStep(2);
  };

  const handleContinueName = () => {
    if (!businessName.trim()) return;
    setStep(3);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setMoodSliders({ ...preset.values, theme: preset.theme || 'light' });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setLoadingMsgIdx(0);
    setGenerationResult(null);
    setPreviewUrls(null);
    setExpandedVariant(null);
    setStep(4);

    try {
      const res = await fetch('/api/launchpad/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: businessName,
          mode: 'test',
          moodSliders
        })
      });
      const data = await res.json();
      if (data.success) {
        setGenerationResult(data);
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
        setStep(3);
      }
    } catch (err) {
      alert('Generation error: ' + err.message);
      setStep(3);
    }
    setGenerating(false);
  };

  const handleCompareLive = async () => {
    if (!generationResult?.variants) return;
    setStartingPreviews(true);

    try {
      const res = await fetch('/api/launchpad/preview-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: Object.entries(generationResult.variants).map(([variant, data]) => ({
            style: variant,
            projectDir: data.projectDir
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewUrls(data.urls);
        setComparisonPage('/');
      } else {
        alert('Preview failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Preview error: ' + err.message);
    }
    setStartingPreviews(false);
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedIndustry(null);
    setBusinessName('');
    setSelectedPreset(null);
    setMoodSliders({ vibe: 50, energy: 50, era: 50, density: 50, price: 50, theme: 'light' });
    setShowAdvanced(false);
    setGenerating(false);
    setGenerationResult(null);
    setPreviewUrls(null);
    setExpandedVariant(null);
  };

  const handleBack = () => {
    if (step === 4 && !generating) {
      setGenerationResult(null);
      setPreviewUrls(null);
      setExpandedVariant(null);
      setStep(3);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  // Get available pages for current industry from API response
  const getIndustryPages = () => {
    if (!selectedIndustry) return ['home'];
    const ind = industries.find(i => i.id === selectedIndustry.id);
    if (!ind?.pages) return ['home'];
    return ind.pages;
  };

  // ---- Styles ----

  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 30%, #fff 100%)',
      color: '#1a1a2e',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '32px 40px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b'
    },
    stepBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      marginBottom: '40px'
    },
    stepDot: (active, done) => ({
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '700',
      background: done ? '#3B82F6' : active ? '#3B82F6' : '#cbd5e1',
      color: (done || active) ? '#fff' : '#64748b',
      transition: 'all 0.3s ease',
      flexShrink: 0
    }),
    stepLine: (done) => ({
      width: '60px',
      height: '3px',
      background: done ? '#3B82F6' : '#cbd5e1',
      transition: 'background 0.3s ease'
    }),
    stepLabel: (active) => ({
      fontSize: '11px',
      color: active ? '#3B82F6' : '#94a3b8',
      marginTop: '4px',
      fontWeight: active ? '600' : '400',
      textAlign: 'center'
    }),
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: 'transparent',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      color: '#64748b',
      fontSize: '13px',
      cursor: 'pointer',
      marginBottom: '20px'
    },
    card: (selected) => ({
      padding: '16px 20px',
      background: selected ? '#EFF6FF' : '#fff',
      border: selected ? '2px solid #3B82F6' : '1px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: selected ? '0 4px 12px rgba(59,130,246,0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
    }),
    categoryTitle: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px',
      marginTop: '24px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px'
    },
    industryEmoji: {
      fontSize: '28px',
      marginBottom: '6px'
    },
    industryName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    industryStyle: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '4px',
      lineHeight: '1.3'
    },
    input: {
      width: '100%',
      maxWidth: '500px',
      padding: '14px 18px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      color: '#1e293b',
      background: '#fff',
      transition: 'border-color 0.2s'
    },
    presetBtn: (active) => ({
      padding: '6px 14px',
      background: active ? '#3B82F6' : '#f1f5f9',
      color: active ? '#fff' : '#64748b',
      border: 'none',
      borderRadius: '20px',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    primaryBtn: (disabled) => ({
      padding: '12px 32px',
      background: disabled ? '#94a3b8' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 4px 14px rgba(59,130,246,0.35)',
      transition: 'all 0.2s'
    }),
    secondaryBtn: {
      padding: '10px 24px',
      background: '#fff',
      color: '#3B82F6',
      border: '2px solid #3B82F6',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      borderRadius: '20px',
      fontSize: '13px',
      color: '#2563EB',
      fontWeight: '500',
      marginBottom: '16px'
    },
    styleCard: (selected) => ({
      padding: '16px',
      background: selected ? '#EFF6FF' : '#fff',
      border: selected ? '2px solid #3B82F6' : '1px solid #e2e8f0',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
      minWidth: '120px'
    }),
    variantCard: (color) => ({
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: `2px solid ${color}20`
    }),
    variantHeader: (color) => ({
      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      color: '#fff',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer'
    }),
    iframe: {
      width: '100%',
      height: '600px',
      border: 'none',
      borderRadius: '0 0 14px 14px'
    },
    iframeExpanded: {
      width: '100%',
      height: 'calc(100vh - 200px)',
      border: 'none'
    },
    pageNav: {
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    pageNavBtn: (active) => ({
      padding: '6px 12px',
      background: active ? '#3B82F6' : '#f1f5f9',
      color: active ? '#fff' : '#64748b',
      border: 'none',
      borderRadius: '8px',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }),
    sliderWrapper: {
      background: '#1a1a2e',
      borderRadius: '16px',
      padding: '4px',
      marginTop: '16px'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '80px 20px'
    },
    pulse: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      margin: '0 auto 24px',
      animation: 'showcase-pulse 1.5s ease-in-out infinite'
    }
  };

  // ---- Step indicator ----

  const stepLabels = ['Industry', 'Name', 'Style', 'Compare'];
  const renderStepBar = () => (
    <div style={S.stepBar}>
      {stepLabels.map((label, idx) => {
        const num = idx + 1;
        const active = num === step;
        const done = num < step;
        return (
          <React.Fragment key={num}>
            {idx > 0 && <div style={S.stepLine(done)} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={S.stepDot(active, done)}>
                {done ? '✓' : num}
              </div>
              <div style={S.stepLabel(active)}>{label}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  // ---- Step 1: Industry Grid ----

  const renderStep1 = () => {
    const industryMap = {};
    industries.forEach(ind => { industryMap[ind.id] = ind; });

    // Show loading state while industries are being fetched
    if (industries.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>Loading industries...</div>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Fetching from /api/launchpad/industries
          </p>
        </div>
      );
    }

    return (
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
          Choose an Industry
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Pick any of the {industries.length} supported industries to generate a full website
        </p>

        {Object.entries(INDUSTRY_CATEGORIES).map(([category, ids]) => {
          const categoryIndustries = ids.filter(id => industryMap[id]);
          if (categoryIndustries.length === 0) return null;
          return (
            <div key={category}>
              <div style={S.categoryTitle}>{category}</div>
              <div style={S.grid}>
                {categoryIndustries.map(id => {
                  const ind = industryMap[id];
                  return (
                    <div
                      key={id}
                      style={S.card(selectedIndustry?.id === id)}
                      onClick={() => handleSelectIndustry(ind)}
                      onMouseEnter={e => {
                        if (selectedIndustry?.id !== id) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        if (selectedIndustry?.id !== id) {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                        }
                      }}
                    >
                      <div style={S.industryEmoji}>{INDUSTRY_EMOJIS[id] || '🏢'}</div>
                      <div style={S.industryName}>{ind.name}</div>
                      {ind.styleNote && <div style={S.industryStyle}>{ind.styleNote}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ---- Step 2: Name your business ----

  const renderStep2 = () => {
    const presets = BUSINESS_PRESETS[selectedIndustry?.id] || [];
    const placeholder = presets[0] ? `e.g. ${presets[0]}` : 'e.g. My Awesome Business';

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button style={S.backBtn} onClick={handleBack}>
          ← Back
        </button>

        <div style={S.badge}>
          {INDUSTRY_EMOJIS[selectedIndustry?.id] || '🏢'} {selectedIndustry?.name}
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
          Name Your Business
        </h2>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
          Enter a business name or pick one of the examples below
        </p>

        <input
          style={S.input}
          placeholder={placeholder}
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleContinueName(); }}
          autoFocus
        />

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {presets.map(name => (
            <button
              key={name}
              style={S.presetBtn(businessName === name)}
              onClick={() => setBusinessName(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '32px' }}>
          <button
            style={S.primaryBtn(!businessName.trim())}
            disabled={!businessName.trim()}
            onClick={handleContinueName}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  };

  // ---- Step 3: Choose style ----

  const renderStep3 = () => (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <button style={S.backBtn} onClick={handleBack}>
        ← Back
      </button>

      <div style={S.badge}>
        {INDUSTRY_EMOJIS[selectedIndustry?.id] || '🏢'} {selectedIndustry?.name} — {businessName}
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
        Choose Your Style
      </h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
        Select a preset style or fine-tune with sliders
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {PRESETS.map(preset => (
          <div
            key={preset.id}
            style={S.styleCard(selectedPreset === preset.id)}
            onClick={() => handleSelectPreset(preset)}
            onMouseEnter={e => {
              if (selectedPreset !== preset.id) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (selectedPreset !== preset.id) {
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{preset.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{preset.name}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {PRESET_DESCRIPTIONS[preset.id] || ''}
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▲ Hide fine-tune sliders' : '▼ Fine-tune with sliders'}
      </button>

      {showAdvanced && (
        <div style={S.sliderWrapper}>
          <MoodSliders values={moodSliders} onChange={setMoodSliders} />
        </div>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button
          style={S.primaryBtn(false)}
          onClick={handleGenerate}
        >
          Generate All Layouts →
        </button>
      </div>
    </div>
  );

  // ---- Step 4: Generate & Compare ----

  const renderStep4 = () => {
    if (generating) {
      return (
        <div style={S.loadingContainer}>
          <style>{`@keyframes showcase-pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }`}</style>
          <div style={S.pulse} />
          <h3 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '8px' }}>
            Generating 3 Variants...
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <div style={S.badge}>
            {INDUSTRY_EMOJIS[selectedIndustry?.id]} {businessName}
          </div>
        </div>
      );
    }

    if (!generationResult) return null;

    const industryId = selectedIndustry?.id;
    const pages = getIndustryPages();

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
              3 Variants Generated
            </h2>
            <div style={S.badge}>
              {INDUSTRY_EMOJIS[industryId]} {businessName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!previewUrls && (
              <button
                style={S.primaryBtn(startingPreviews)}
                disabled={startingPreviews}
                onClick={handleCompareLive}
              >
                {startingPreviews ? 'Starting previews...' : 'Compare Live →'}
              </button>
            )}
            <button style={S.secondaryBtn} onClick={handleStartOver}>
              Start Over
            </button>
          </div>
        </div>

        {/* Variant summary cards */}
        {!previewUrls && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {['A', 'B', 'C'].map(v => {
              const info = getVariantInfo(industryId, v);
              const data = generationResult.variants?.[v];
              return (
                <div key={v} style={S.variantCard(info.color)}>
                  <div style={S.variantHeader(info.color)}>
                    <span style={{ fontSize: '20px' }}>{info.icon}</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{info.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.85 }}>{info.description}</div>
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {data?.pages?.length || '—'} pages generated
                    </div>
                    {data?.duration && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {(data.duration / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live comparison iframes */}
        {previewUrls && (
          <div>
            {/* Page navigation */}
            <div style={S.pageNav}>
              {pages.map(page => {
                const info = PAGE_LABELS[page] || { path: `/${page}`, emoji: '📄', label: page };
                return (
                  <button
                    key={page}
                    style={S.pageNavBtn(comparisonPage === info.path)}
                    onClick={() => setComparisonPage(info.path)}
                  >
                    <span>{info.emoji}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Iframes - 3 col or expanded single */}
            {expandedVariant ? (
              <div>
                {(() => {
                  const v = expandedVariant;
                  const info = getVariantInfo(industryId, v);
                  const url = previewUrls[v];
                  if (!url) return null;
                  return (
                    <div style={{ ...S.variantCard(info.color), marginBottom: '16px' }}>
                      <div
                        style={S.variantHeader(info.color)}
                        onClick={() => setExpandedVariant(null)}
                        title="Click to collapse"
                      >
                        <span style={{ fontSize: '20px' }}>{info.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>{info.name} — Variant {v}</div>
                          <div style={{ fontSize: '12px', opacity: 0.85 }}>{info.description}</div>
                        </div>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>Click to collapse</span>
                      </div>
                      <iframe
                        src={url + comparisonPage}
                        style={S.iframeExpanded}
                        title={`Variant ${v}`}
                      />
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {['A', 'B', 'C'].map(v => {
                  const info = getVariantInfo(industryId, v);
                  const url = previewUrls[v];
                  if (!url) return null;
                  return (
                    <div key={v} style={S.variantCard(info.color)}>
                      <div
                        style={S.variantHeader(info.color)}
                        onClick={() => setExpandedVariant(v)}
                        title="Click to expand"
                      >
                        <span style={{ fontSize: '20px' }}>{info.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>{info.name}</div>
                          <div style={{ fontSize: '11px', opacity: 0.85 }}>{info.description}</div>
                        </div>
                      </div>
                      <iframe
                        src={url + comparisonPage}
                        style={S.iframe}
                        title={`Variant ${v}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ---- Main render ----

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Showcase</h1>
        <p style={S.subtitle}>
          See the engine generate full websites across 19 industries in seconds
        </p>
      </div>

      {renderStepBar()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
