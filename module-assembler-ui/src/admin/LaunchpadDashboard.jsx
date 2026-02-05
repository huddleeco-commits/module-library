/**
 * Launchpad Dashboard
 *
 * "Business name to live website in 60 seconds"
 *
 * The unified generation interface that combines:
 * - QuickStart simplicity (single input)
 * - Scout power (test mode, AI levels, deployment)
 * - Research Lab intelligence (structural variants)
 */

import React, { useState, useEffect, useRef } from 'react';
import { MoodSliders } from '../components/MoodSliders';

// Generation mode cards
const MODES = {
  test: {
    id: 'test',
    name: 'Instant',
    icon: '⚡',
    cost: '$0',
    description: 'Beautiful baseline, no AI',
    features: ['6 pages', 'Real data', 'Industry images', 'Responsive'],
    color: '#10B981'
  },
  enhanced: {
    id: 'enhanced',
    name: 'Enhanced',
    icon: '🎯',
    cost: '$0.05',
    description: 'AI picks optimal layout',
    features: ['Everything in Instant', 'AI layout selection', 'Optimized sections'],
    color: '#3B82F6'
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    icon: '🎨',
    cost: '$0.25',
    description: 'AI visual freedom',
    features: ['Everything in Enhanced', 'Custom copy', 'Unique colors', 'Brand personality'],
    color: '#8B5CF6'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    icon: '💎',
    cost: '$0.50',
    description: 'Full AI + competitor analysis',
    features: ['Everything in Creative', 'Competitor research', 'SEO optimization', 'Conversion focus'],
    color: '#F59E0B'
  }
};

// Default variant display info (fallback when industry-specific not available)
const VARIANTS = {
  A: { name: 'Layout A', icon: '🎯', color: '#3B82F6', description: 'Primary layout - action focused' },
  B: { name: 'Layout B', icon: '📖', color: '#F59E0B', description: 'Narrative layout - story focused' },
  C: { name: 'Layout C', icon: '📸', color: '#EC4899', description: 'Visual layout - imagery focused' }
};

// Industry-specific layout names from design research
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

// Get variant info with industry-specific names if available
function getVariantInfo(industryId, variantKey) {
  const industryVariants = INDUSTRY_LAYOUT_NAMES[industryId];
  const industryInfo = industryVariants?.[variantKey];
  const defaultInfo = VARIANTS[variantKey];

  if (industryInfo) {
    return {
      ...defaultInfo,
      ...industryInfo
    };
  }
  return defaultInfo;
}

// Menu Style options
const MENU_STYLES = {
  'photo-grid': {
    name: 'Photo Grid',
    icon: '📸',
    color: '#3B82F6',
    description: '3-column grid with large photos',
    bestFor: 'Pizza, bakery, coffee, QSR'
  },
  'elegant-list': {
    name: 'Elegant List',
    icon: '✨',
    color: '#8B5CF6',
    description: 'Single-column with dotted leaders',
    bestFor: 'Steakhouse, fine dining'
  },
  'compact-table': {
    name: 'Compact Table',
    icon: '📋',
    color: '#10B981',
    description: 'Dense table with accordions',
    bestFor: 'Delis, diners, large menus'
  },
  'storytelling-cards': {
    name: 'Storytelling',
    icon: '📖',
    color: '#F59E0B',
    description: 'Large cards with origin stories',
    bestFor: 'Farm-to-table, artisan'
  }
};

// Industry to default menu style mapping
const INDUSTRY_MENU_DEFAULTS = {
  'pizza-restaurant': 'photo-grid',
  'coffee-cafe': 'photo-grid',
  'restaurant': 'elegant-list',
  'steakhouse': 'elegant-list',
  'bakery': 'photo-grid',
  'salon-spa': 'photo-grid',
  'fitness-gym': 'compact-table',
  'dental': 'compact-table',
  'healthcare': 'compact-table',
  'yoga': 'storytelling-cards',
  'barbershop': 'photo-grid',
  'law-firm': 'elegant-list',
  'plumber': 'compact-table',
  'cleaning': 'compact-table',
  'auto-shop': 'compact-table'
};

// Trend card colors
const TREND_COLORS = {
  colors: '#EC4899',
  features: '#3B82F6',
  trust: '#F59E0B',
  hero: '#8B5CF6'
};

// TrendCard Component
function TrendCard({ icon, title, items, color }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      ...trendStyles.trendCard,
      borderTopColor: color
    }}>
      <div style={trendStyles.trendCardHeader}>
        <span style={trendStyles.trendCardIcon}>{icon}</span>
        <span style={trendStyles.trendCardTitle}>{title}</span>
      </div>
      <ul style={trendStyles.trendCardList}>
        {items.slice(0, 4).map((item, i) => (
          <li key={i} style={trendStyles.trendCardItem}>
            <span style={{ color, marginRight: '8px' }}>✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// TrendResearchPanel Component
function TrendResearchPanel({ trends, loading, applied, onApply, onSkip }) {
  // Loading state
  if (loading) {
    return (
      <div style={trendStyles.trendPanel}>
        <div style={trendStyles.trendHeader}>
          <span style={trendStyles.searchIcon}>🔍</span>
          <span style={trendStyles.trendTitle}>Researching current trends...</span>
        </div>
        <div style={trendStyles.trendLoader}>
          <div style={trendStyles.progressBar}>
            <div style={trendStyles.progressFillAnimated} />
          </div>
          <p style={trendStyles.loadingText}>Analyzing design patterns for your industry</p>
        </div>
      </div>
    );
  }

  // No trends available
  if (!trends) return null;

  // Applied state
  if (applied) {
    return (
      <div style={trendStyles.trendPanelApplied}>
        <div style={trendStyles.trendHeader}>
          <span style={trendStyles.checkIcon}>✅</span>
          <span style={trendStyles.trendTitle}>Trends Applied</span>
          <button
            onClick={onSkip}
            style={trendStyles.undoBtn}
          >
            Undo
          </button>
        </div>
        <p style={trendStyles.appliedText}>
          Your generation will include trending colors, features, and trust signals.
        </p>
      </div>
    );
  }

  // Full panel view
  return (
    <div style={trendStyles.trendPanel}>
      <div style={trendStyles.trendHeader}>
        <span style={trendStyles.trendIcon}>📈</span>
        <span style={trendStyles.trendTitle}>2026 Industry Trends</span>
        <span style={trendStyles.trendBadge}>
          {trends.isLiveResearch ? 'Live Research' : 'Best Practices'}
        </span>
      </div>

      <div style={trendStyles.trendGrid}>
        <TrendCard
          icon="🎨"
          title="Color Trends"
          items={trends.colors}
          color={TREND_COLORS.colors}
        />
        <TrendCard
          icon="⚡"
          title="Must-Have Features"
          items={trends.features}
          color={TREND_COLORS.features}
        />
        <TrendCard
          icon="⭐"
          title="Trust Builders"
          items={trends.trust}
          color={TREND_COLORS.trust}
        />
        <TrendCard
          icon="🖼️"
          title="Hero Section"
          items={trends.hero}
          color={TREND_COLORS.hero}
        />
      </div>

      {/* Key Stats */}
      {trends.stats && trends.stats.length > 0 && (
        <div style={trendStyles.trendStats}>
          {trends.stats.map((stat, i) => (
            <div key={i} style={trendStyles.statItem}>
              <span style={trendStyles.statValue}>{stat.value}</span>
              <span style={trendStyles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={trendStyles.trendActions}>
        <button onClick={() => onApply(trends)} style={trendStyles.applyBtn}>
          Apply Trends to Generation
        </button>
        <button onClick={onSkip} style={trendStyles.skipBtn}>
          Use Default Config
        </button>
      </div>

      {/* Sources */}
      {trends.sources && trends.sources.length > 0 && (
        <div style={trendStyles.trendSources}>
          Sources: {trends.sources.slice(0, 3).map(s => s.title).join(', ')}
        </div>
      )}
    </div>
  );
}

// Trend panel styles
const trendStyles = {
  trendPanel: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    border: '2px solid #10B981',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px'
  },
  trendPanelApplied: {
    background: '#ECFDF5',
    border: '2px solid #10B981',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '24px'
  },
  trendHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  searchIcon: {
    fontSize: '1.25rem'
  },
  trendIcon: {
    fontSize: '1.25rem',
    color: '#10B981'
  },
  checkIcon: {
    fontSize: '1.25rem'
  },
  trendTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  trendBadge: {
    background: '#10B981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500',
    marginLeft: 'auto'
  },
  trendLoader: {
    paddingTop: '8px'
  },
  progressBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressFillAnimated: {
    height: '100%',
    width: '60%',
    background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #10B981 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px'
  },
  loadingText: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0
  },
  appliedText: {
    fontSize: '0.95rem',
    color: '#059669',
    margin: 0
  },
  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  trendCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    borderTop: '4px solid',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  trendCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  trendCardIcon: {
    fontSize: '1.25rem'
  },
  trendCardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  trendCardList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },
  trendCardItem: {
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '0.8rem',
    color: '#4b5563',
    marginBottom: '8px',
    lineHeight: '1.4'
  },
  trendStats: {
    display: 'flex',
    gap: '24px',
    padding: '16px 20px',
    background: 'white',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10B981'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  trendActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  applyBtn: {
    background: '#10B981',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  skipBtn: {
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  undoBtn: {
    background: 'transparent',
    color: '#059669',
    border: '1px solid #10B981',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginLeft: 'auto'
  },
  trendSources: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textAlign: 'center'
  }
};

export default function LaunchpadDashboard() {
  // Input state
  const [input, setInput] = useState('');
  const [detection, setDetection] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Options state
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [selectedMode, setSelectedMode] = useState('test');
  const [selectedMenuStyle, setSelectedMenuStyle] = useState(null); // null = auto-select based on industry

  // Custom menu state
  const [customMenuExpanded, setCustomMenuExpanded] = useState(false);
  const [customMenuText, setCustomMenuText] = useState('');
  const [customMenuParsed, setCustomMenuParsed] = useState(null);
  const [customMenuError, setCustomMenuError] = useState(null);
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // Deployment state
  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState([]);
  const [deployResult, setDeployResult] = useState(null);

  // Service status
  const [status, setStatus] = useState(null);

  // Recent projects
  const [recentProjects, setRecentProjects] = useState([]);

  // Preview state
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // All styles comparison state
  const [allStylesResult, setAllStylesResult] = useState(null);
  const [activeStyleTab, setActiveStyleTab] = useState('photo-grid');
  const [generatingAllStyles, setGeneratingAllStyles] = useState(false);

  // Side-by-side comparison view (for menu styles)
  const [comparisonView, setComparisonView] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const [startingPreviews, setStartingPreviews] = useState(false);
  const [comparisonPage, setComparisonPage] = useState('/'); // Current page to view across all styles
  const [syncNavigation, setSyncNavigation] = useState(true); // Sync page navigation across iframes
  const [expandedStyle, setExpandedStyle] = useState(null); // Which style is expanded (null = grid view)

  // Layout variants comparison view (for A, B, C)
  const [variantsComparisonView, setVariantsComparisonView] = useState(false);
  const [variantPreviewUrls, setVariantPreviewUrls] = useState({});
  const [expandedVariant, setExpandedVariant] = useState(null); // Which variant is expanded

  // Trend research state
  const [trends, setTrends] = useState(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsApplied, setTrendsApplied] = useState(false);
  const [selectedTrends, setSelectedTrends] = useState(null);

  // Mood sliders for design customization
  const [moodSliders, setMoodSliders] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');

  // Debounce ref for detection
  const detectTimeoutRef = useRef(null);

  // Check service status on mount
  useEffect(() => {
    fetch('/api/launchpad/status')
      .then(r => r.json())
      .then(data => setStatus(data))
      .catch(err => console.error('Status check failed:', err));
  }, []);

  // Auto-detect as user types
  useEffect(() => {
    if (detectTimeoutRef.current) {
      clearTimeout(detectTimeoutRef.current);
    }

    if (input.length < 3) {
      setDetection(null);
      return;
    }

    detectTimeoutRef.current = setTimeout(async () => {
      setDetecting(true);
      try {
        const res = await fetch('/api/launchpad/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });
        const data = await res.json();
        if (data.success) {
          setDetection(data.detection);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
      setDetecting(false);
    }, 500);

    return () => {
      if (detectTimeoutRef.current) {
        clearTimeout(detectTimeoutRef.current);
      }
    };
  }, [input]);

  // Auto-fetch trends when industry is detected
  useEffect(() => {
    if (detection?.industry) {
      fetchTrends(detection.industry, detection.location);
    } else {
      setTrends(null);
      setTrendsApplied(false);
      setSelectedTrends(null);
    }
  }, [detection?.industry]);

  // Fetch trends for an industry
  const fetchTrends = async (industry, location) => {
    setTrendsLoading(true);
    setTrends(null);

    try {
      const url = location
        ? `/api/launchpad/trends/${industry}?location=${encodeURIComponent(location)}`
        : `/api/launchpad/trends/${industry}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setTrends(data.trends);
      }
    } catch (err) {
      console.log('Trend research unavailable:', err);
    }

    setTrendsLoading(false);
  };

  // Apply trends to generation options
  const handleApplyTrends = (trendsToApply) => {
    setSelectedTrends(trendsToApply);
    setTrendsApplied(true);
  };

  // Skip trends
  const handleSkipTrends = () => {
    setSelectedTrends(null);
    setTrendsApplied(false);
  };

  // Parse menu text (supports JSON, CSV-like, or simple format)
  const parseMenuText = (text) => {
    if (!text.trim()) {
      setCustomMenuParsed(null);
      setCustomMenuError(null);
      return;
    }

    try {
      // Try JSON first
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        // Array of categories or items
        const categories = json.map((cat, idx) => ({
          name: cat.name || cat.category || `Category ${idx + 1}`,
          description: cat.description || '',
          items: (cat.items || []).map(item => ({
            name: item.name,
            price: parseFloat(item.price) || 0,
            description: item.description || ''
          }))
        }));
        setCustomMenuParsed(categories);
        setCustomMenuError(null);
        return;
      }
    } catch (e) {
      // Not JSON, try simple format
    }

    // Try simple text format:
    // Category Name
    // - Item Name $12.99 - Description
    // - Another Item $8.50
    try {
      const lines = text.split('\n').filter(l => l.trim());
      const categories = [];
      let currentCategory = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if it's an item (starts with - or has a price)
        const priceMatch = trimmed.match(/\$?(\d+\.?\d*)/);
        const isItem = trimmed.startsWith('-') || trimmed.startsWith('•') || priceMatch;

        if (!isItem && !trimmed.startsWith('#')) {
          // New category
          if (currentCategory) categories.push(currentCategory);
          currentCategory = { name: trimmed.replace(/^#+\s*/, ''), description: '', items: [] };
        } else if (currentCategory && isItem) {
          // Parse item
          let itemText = trimmed.replace(/^[-•]\s*/, '');
          const itemPriceMatch = itemText.match(/\$?(\d+\.?\d*)/);
          const price = itemPriceMatch ? parseFloat(itemPriceMatch[1]) : 0;

          // Split by price or dash for description
          let name = itemText;
          let description = '';

          if (itemPriceMatch) {
            const parts = itemText.split(/\$?\d+\.?\d*/);
            name = parts[0].trim().replace(/[-–—]\s*$/, '').trim();
            description = parts[1] ? parts[1].replace(/^[-–—]\s*/, '').trim() : '';
          }

          currentCategory.items.push({ name, price, description });
        }
      }

      if (currentCategory) categories.push(currentCategory);

      if (categories.length > 0 && categories.some(c => c.items.length > 0)) {
        setCustomMenuParsed(categories);
        setCustomMenuError(null);
      } else {
        setCustomMenuError('Could not parse menu. Try JSON format or: Category name on one line, then items starting with -');
        setCustomMenuParsed(null);
      }
    } catch (e) {
      setCustomMenuError('Failed to parse menu: ' + e.message);
      setCustomMenuParsed(null);
    }
  };

  // Handle menu text change
  const handleMenuTextChange = (e) => {
    const text = e.target.value;
    setCustomMenuText(text);
    parseMenuText(text);
  };

  // Handle file drop
  const handleMenuDrop = async (e) => {
    e.preventDefault();
    setIsDraggingMenu(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCustomMenuText(text);
      parseMenuText(text);
    } catch (err) {
      setCustomMenuError('Failed to read file: ' + err.message);
    }
  };

  // Generate site
  const handleGenerate = async () => {
    if (!input) return;

    setGenerating(true);
    setGenerationResult(null);

    try {
      const res = await fetch('/api/launchpad/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          variant: selectedVariant,
          mode: selectedMode,
          menuStyle: selectedMenuStyle,
          moodSliders: moodSliders || {},
          trendOverrides: trendsApplied ? selectedTrends : null,
          customMenu: customMenuParsed,
          businessData: logoUrl ? { logo: logoUrl } : undefined
        })
      });

      const data = await res.json();
      setGenerationResult(data);

      if (data.success) {
        setRecentProjects(prev => [data, ...prev].slice(0, 5));
      }
    } catch (err) {
      setGenerationResult({ success: false, error: err.message });
    }

    setGenerating(false);
  };

  // Generate all 3 variants
  const handleGenerateAll = async () => {
    if (!input) return;

    setGenerating(true);
    setGenerationResult(null);

    try {
      const res = await fetch('/api/launchpad/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode: selectedMode, menuStyle: selectedMenuStyle, moodSliders: moodSliders || {}, businessData: logoUrl ? { logo: logoUrl } : undefined })
      });

      const data = await res.json();
      setGenerationResult(data);
    } catch (err) {
      setGenerationResult({ success: false, error: err.message });
    }

    setGenerating(false);
  };

  // Generate all 4 menu styles for comparison
  const handleGenerateAllStyles = async () => {
    if (!input) return;

    setGeneratingAllStyles(true);
    setAllStylesResult(null);
    setGenerationResult(null);

    try {
      const res = await fetch('/api/launchpad/generate-all-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          variant: selectedVariant,
          mode: selectedMode,
          moodSliders: moodSliders || {},
          trendOverrides: trendsApplied ? selectedTrends : null,
          businessData: logoUrl ? { logo: logoUrl } : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setAllStylesResult(data);
        setActiveStyleTab(Object.keys(data.styles)[0] || 'photo-grid');
      } else {
        setAllStylesResult({ success: false, error: data.error });
      }
    } catch (err) {
      setAllStylesResult({ success: false, error: err.message });
    }

    setGeneratingAllStyles(false);
  };

  // Start all preview servers for side-by-side comparison
  const handleStartAllPreviews = async () => {
    if (!allStylesResult?.styles) return;

    setStartingPreviews(true);
    const urls = {};

    try {
      const res = await fetch('/api/launchpad/preview-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: Object.entries(allStylesResult.styles).map(([style, data]) => ({
            style,
            projectDir: data.projectDir
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setPreviewUrls(data.urls);
        setComparisonView(true);
      } else {
        alert('Failed to start previews: ' + data.error);
      }
    } catch (err) {
      alert('Error starting previews: ' + err.message);
    }

    setStartingPreviews(false);
  };

  // Start all variant previews for side-by-side comparison
  const handleStartAllVariantPreviews = async () => {
    if (!generationResult?.variants) return;

    setStartingPreviews(true);

    try {
      const res = await fetch('/api/launchpad/preview-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: Object.entries(generationResult.variants).map(([variant, data]) => ({
            style: variant, // Using 'style' key but it's actually variant
            projectDir: data.projectDir
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setVariantPreviewUrls(data.urls);
        setVariantsComparisonView(true);
      } else {
        alert('Failed to start previews: ' + data.error);
      }
    } catch (err) {
      alert('Error starting previews: ' + err.message);
    }

    setStartingPreviews(false);
  };

  // Open all variants in separate browser tabs
  const handleOpenAllVariantsInTabs = async () => {
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
        Object.values(data.urls).forEach((url, idx) => {
          setTimeout(() => window.open(url, '_blank'), idx * 300);
        });
      } else {
        alert('Failed to start previews: ' + data.error);
      }
    } catch (err) {
      alert('Error starting previews: ' + err.message);
    }

    setStartingPreviews(false);
  };

  // Open all styles in separate browser tabs
  const handleOpenAllInTabs = async () => {
    if (!allStylesResult?.styles) return;

    setStartingPreviews(true);

    try {
      const res = await fetch('/api/launchpad/preview-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: Object.entries(allStylesResult.styles).map(([style, data]) => ({
            style,
            projectDir: data.projectDir
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        // Open each URL in a new tab
        Object.values(data.urls).forEach((url, idx) => {
          setTimeout(() => window.open(url, '_blank'), idx * 300);
        });
      } else {
        alert('Failed to start previews: ' + data.error);
      }
    } catch (err) {
      alert('Error starting previews: ' + err.message);
    }

    setStartingPreviews(false);
  };

  // Deploy with SSE streaming
  const handleDeploy = async () => {
    if (!input) return;

    setDeploying(true);
    setDeployProgress([]);
    setDeployResult(null);

    try {
      const res = await fetch('/api/launchpad/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          variant: selectedVariant,
          mode: selectedMode,
          moodSliders: moodSliders || {}
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setDeployProgress(prev => [...prev, data]);
              } else if (data.type === 'complete') {
                setDeployResult(data.result);
              } else if (data.type === 'error') {
                setDeployResult({ success: false, error: data.error });
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (err) {
      setDeployResult({ success: false, error: err.message });
    }

    setDeploying(false);
  };

  // Reset state for new generation
  const handleReset = () => {
    setInput('');
    setDetection(null);
    setGenerationResult(null);
    setDeployResult(null);
    setDeployProgress([]);
    setPreviewUrl(null);
    setTrends(null);
    setTrendsApplied(false);
    setSelectedTrends(null);
  };

  // Preview the generated site
  const handlePreview = async (projectDir) => {
    if (!projectDir) return;

    setPreviewing(true);
    setPreviewUrl(null);

    try {
      const res = await fetch('/api/launchpad/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir })
      });

      const data = await res.json();
      if (data.success) {
        setPreviewUrl(data.previewUrl);
        // Auto-open in new tab
        window.open(data.previewUrl, '_blank');
      } else {
        alert('Preview failed: ' + data.error);
      }
    } catch (err) {
      alert('Preview error: ' + err.message);
    }

    setPreviewing(false);
  };

  // Open folder in file explorer
  const handleOpenFolder = async (projectDir) => {
    if (!projectDir) return;

    try {
      await fetch('/api/launchpad/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir })
      });
    } catch (err) {
      console.error('Open folder error:', err);
    }
  };

  // Open in VS Code
  const handleOpenVSCode = async (projectDir) => {
    if (!projectDir) return;

    try {
      await fetch('/api/launchpad/open-vscode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir })
      });
    } catch (err) {
      console.error('Open VS Code error:', err);
    }
  };

  // Run full project (frontend + backend + admin)
  const [running, setRunning] = useState(false);
  const [runUrls, setRunUrls] = useState(null);

  const handleRun = async (projectDir) => {
    if (!projectDir) return;

    setRunning(true);
    setRunUrls(null);

    try {
      const res = await fetch('/api/launchpad/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectDir })
      });

      const data = await res.json();
      if (data.success) {
        setRunUrls(data.urls);
        // Open all URLs in new tabs
        if (data.urls.frontend) window.open(data.urls.frontend, '_blank');
        setTimeout(() => {
          if (data.urls.admin) window.open(data.urls.admin, '_blank');
        }, 500);
      } else {
        alert('Run failed: ' + data.error);
      }
    } catch (err) {
      alert('Run error: ' + err.message);
    }

    setRunning(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <span style={styles.rocket}>🚀</span> Launchpad
          </h1>
          <p style={styles.subtitle}>Business name to live website in 60 seconds</p>
        </div>
        {status && (
          <div style={styles.statusBadge}>
            <span style={{
              ...styles.statusDot,
              background: status.deploy?.ready ? '#10B981' : '#F59E0B'
            }} />
            {status.deploy?.ready ? 'Ready to Deploy' : 'Generation Only'}
          </div>
        )}
      </div>

      {/* Main Input Section */}
      <div style={styles.inputSection}>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mario's Pizza in Brooklyn"
            style={styles.mainInput}
            disabled={generating || deploying}
          />
          {detecting && (
            <div style={styles.detectingBadge}>Detecting...</div>
          )}
        </div>

        {/* Quick Presets */}
        <div style={styles.presetsRow}>
          <span style={styles.presetsLabel}>Quick:</span>
          {[
            { label: '☕ Coffee House', value: 'Coffee House Cafe in Dallas Texas' },
            { label: '🍕 Pizza', value: "Mario's Pizza in Brooklyn NY" },
            { label: '🥩 Steakhouse', value: 'Prime Steakhouse in Chicago' },
            { label: '💇 Salon', value: 'Luxe Beauty Salon in Miami' },
            { label: '🏋️ Gym', value: 'FitLife Gym in Austin TX' }
          ].map(preset => (
            <button
              key={preset.value}
              onClick={() => setInput(preset.value)}
              style={styles.presetBtn}
              disabled={generating || deploying}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Detection Results */}
        {detection && (
          <div style={styles.detectionCard}>
            <div style={styles.detectionHeader}>
              <span style={styles.industryBadge}>{detection.industryName}</span>
              <span style={styles.confidenceBadge}>
                {detection.confidence === 'high' ? '✓ High confidence' : '~ Medium confidence'}
              </span>
            </div>
            <div style={styles.detectionDetails}>
              <div style={styles.detectionItem}>
                <span style={styles.detectionLabel}>Business</span>
                <span style={styles.detectionValue}>{detection.businessName}</span>
              </div>
              <div style={styles.detectionItem}>
                <span style={styles.detectionLabel}>Location</span>
                <span style={styles.detectionValue}>{detection.location}</span>
              </div>
            </div>
            {detection.styleNote && (
              <p style={styles.styleNote}>{detection.styleNote}</p>
            )}
          </div>
        )}
      </div>

      {/* Trend Research Panel */}
      {detection && (
        <TrendResearchPanel
          trends={trends}
          loading={trendsLoading}
          applied={trendsApplied}
          onApply={handleApplyTrends}
          onSkip={handleSkipTrends}
        />
      )}

      {/* Options Section */}
      {detection && (
        <div style={styles.optionsSection}>
          {/* Variant Selection */}
          <div style={styles.optionGroup}>
            <h3 style={styles.optionTitle}>Layout Variant</h3>
            <div style={styles.variantGrid}>
              {Object.entries(VARIANTS).map(([key, variant]) => (
                <button
                  key={key}
                  onClick={() => setSelectedVariant(key)}
                  style={{
                    ...styles.variantCard,
                    borderColor: selectedVariant === key ? variant.color : '#e5e7eb',
                    background: selectedVariant === key ? `${variant.color}10` : '#fff'
                  }}
                  disabled={generating || deploying}
                >
                  <div style={styles.variantIcon}>{variant.icon}</div>
                  <div style={styles.variantName}>Layout {key}</div>
                  <div style={styles.variantLabel}>{variant.name}</div>
                  <div style={styles.variantDesc}>{variant.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Style Selection */}
          <div style={styles.optionGroup}>
            <h3 style={styles.optionTitle}>
              Menu Page Style
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6B7280', marginLeft: '8px' }}>
                {selectedMenuStyle ? '' : '(auto-selected for industry)'}
              </span>
            </h3>
            <div style={styles.menuStyleGrid}>
              {Object.entries(MENU_STYLES).map(([key, style]) => {
                const industryDefault = detection?.industry ? INDUSTRY_MENU_DEFAULTS[detection.industry] : 'photo-grid';
                const isActive = selectedMenuStyle === key || (!selectedMenuStyle && industryDefault === key);
                const isDefault = industryDefault === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMenuStyle(selectedMenuStyle === key ? null : key)}
                    style={{
                      ...styles.menuStyleCard,
                      borderColor: isActive ? style.color : '#e5e7eb',
                      background: isActive ? `${style.color}10` : '#fff'
                    }}
                    disabled={generating || deploying}
                  >
                    <div style={styles.menuStyleHeader}>
                      <span style={{ fontSize: '1.25rem' }}>{style.icon}</span>
                      {isDefault && !selectedMenuStyle && (
                        <span style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          background: style.color,
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}>
                          AUTO
                        </span>
                      )}
                    </div>
                    <div style={styles.menuStyleName}>{style.name}</div>
                    <div style={styles.menuStyleDesc}>{style.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Menu Input */}
          <div style={styles.optionGroup}>
            <button
              onClick={() => setCustomMenuExpanded(!customMenuExpanded)}
              style={styles.customMenuToggle}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
                <span>Custom Menu Data</span>
                {customMenuParsed && (
                  <span style={styles.customMenuBadge}>
                    ✓ {customMenuParsed.length} categories, {customMenuParsed.reduce((sum, c) => sum + c.items.length, 0)} items
                  </span>
                )}
              </span>
              <span style={{ transform: customMenuExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>

            {customMenuExpanded && (
              <div style={styles.customMenuContent}>
                <p style={styles.customMenuHelp}>
                  Paste your menu or drag a file (JSON, TXT, CSV). Leave empty to use industry defaults.
                </p>

                <div
                  style={{
                    ...styles.customMenuDropzone,
                    borderColor: isDraggingMenu ? '#3B82F6' : '#e5e7eb',
                    background: isDraggingMenu ? '#EFF6FF' : '#fff'
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingMenu(true); }}
                  onDragLeave={() => setIsDraggingMenu(false)}
                  onDrop={handleMenuDrop}
                >
                  <textarea
                    value={customMenuText}
                    onChange={handleMenuTextChange}
                    placeholder={`Paste menu here or drag a file...

Example format:
Appetizers
- Bruschetta $8.99 - Fresh tomatoes, basil, garlic
- Calamari $12.99 - Lightly fried with marinara

Main Courses
- Grilled Salmon $24.99 - Atlantic salmon with lemon butter
- Filet Mignon $38.99 - 8oz prime cut

Or use JSON:
[{"name": "Appetizers", "items": [{"name": "Bruschetta", "price": 8.99}]}]`}
                    style={styles.customMenuTextarea}
                    disabled={generating || deploying}
                  />
                </div>

                {customMenuError && (
                  <div style={styles.customMenuError}>
                    ⚠️ {customMenuError}
                  </div>
                )}

                {customMenuParsed && (
                  <div style={styles.customMenuPreview}>
                    <div style={styles.customMenuPreviewHeader}>
                      <span style={{ fontWeight: '600' }}>✓ Menu Parsed Successfully</span>
                      <button
                        onClick={() => { setCustomMenuText(''); setCustomMenuParsed(null); }}
                        style={styles.customMenuClearBtn}
                      >
                        Clear
                      </button>
                    </div>
                    <div style={styles.customMenuCategories}>
                      {customMenuParsed.map((cat, idx) => (
                        <div key={idx} style={styles.customMenuCategory}>
                          <div style={styles.customMenuCategoryName}>{cat.name}</div>
                          <div style={styles.customMenuItemCount}>{cat.items.length} items</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div style={styles.optionGroup}>
            <h3 style={styles.optionTitle}>Generation Mode</h3>
            <div style={styles.modeGrid}>
              {Object.entries(MODES).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMode(key)}
                  style={{
                    ...styles.modeCard,
                    borderColor: selectedMode === key ? mode.color : '#e5e7eb',
                    background: selectedMode === key ? `${mode.color}10` : '#fff'
                  }}
                  disabled={generating || deploying}
                >
                  <div style={styles.modeHeader}>
                    <span style={styles.modeIcon}>{mode.icon}</span>
                    <span style={styles.modeCost}>{mode.cost}</span>
                  </div>
                  <div style={styles.modeName}>{mode.name}</div>
                  <div style={styles.modeDesc}>{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Sliders */}
          <div style={styles.optionGroup}>
            <h3 style={styles.optionTitle}>
              Design Mood
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6B7280', marginLeft: '8px' }}>
                (controls fonts, spacing, shadows, colors)
              </span>
            </h3>
            <MoodSliders
              values={moodSliders}
              onChange={(values) => setMoodSliders(values)}
              compact={true}
            />
          </div>

          <div style={styles.optionGroup}>
            <h3 style={styles.optionTitle}>
              Logo
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6B7280', marginLeft: '8px' }}>
                (optional URL - leave blank for text logo)
              </span>
            </h3>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            {logoUrl && (
              <div style={{ marginTop: '8px', padding: '12px', background: '#F9FAFB', borderRadius: '8px', textAlign: 'center' }}>
                <img src={logoUrl} alt="Logo preview" style={{ maxHeight: '40px', width: 'auto' }} onError={e => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {detection && (
        <div style={styles.actionSection}>
          <button
            onClick={handleGenerate}
            disabled={generating || deploying}
            style={{
              ...styles.actionBtn,
              ...styles.generateBtn,
              opacity: generating || deploying ? 0.7 : 1
            }}
          >
            {generating ? (
              <>
                <span style={styles.spinner} />
                Generating...
              </>
            ) : (
              <>
                <span style={styles.btnIcon}>⚡</span>
                Generate Site
              </>
            )}
          </button>

          <button
            onClick={handleGenerateAll}
            disabled={generating || deploying || generatingAllStyles}
            style={{
              ...styles.actionBtn,
              ...styles.compareBtn,
              opacity: generating || deploying || generatingAllStyles ? 0.7 : 1
            }}
          >
            <span style={styles.btnIcon}>🔄</span>
            Compare Layouts
          </button>

          <button
            onClick={handleGenerateAllStyles}
            disabled={generating || deploying || generatingAllStyles}
            style={{
              ...styles.actionBtn,
              ...styles.allStylesBtn,
              opacity: generating || deploying || generatingAllStyles ? 0.7 : 1
            }}
          >
            {generatingAllStyles ? (
              <>
                <span style={styles.spinner} />
                Generating All Styles...
              </>
            ) : (
              <>
                <span style={styles.btnIcon}>🎨</span>
                Compare All Menu Styles
              </>
            )}
          </button>

          {status?.deploy?.ready && (
            <button
              onClick={handleDeploy}
              disabled={generating || deploying}
              style={{
                ...styles.actionBtn,
                ...styles.deployBtn,
                opacity: generating || deploying ? 0.7 : 1
              }}
            >
              {deploying ? (
                <>
                  <span style={styles.spinner} />
                  Deploying...
                </>
              ) : (
                <>
                  <span style={styles.btnIcon}>🚀</span>
                  Generate & Deploy
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Deploy Progress */}
      {deployProgress.length > 0 && (
        <div style={styles.progressSection}>
          <h3 style={styles.progressTitle}>Deployment Progress</h3>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${deployProgress[deployProgress.length - 1]?.percent || 0}%`
              }}
            />
          </div>
          <div style={styles.progressSteps}>
            {deployProgress.slice(-5).map((step, idx) => (
              <div key={idx} style={styles.progressStep}>
                <span style={styles.progressIcon}>
                  {step.phase === 'complete' ? '✓' : '○'}
                </span>
                <span>{step.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Styles Comparison Result */}
      {allStylesResult && allStylesResult.success && (
        <div style={styles.allStylesContainer}>
          <div style={styles.allStylesHeader}>
            <div>
              <h3 style={styles.allStylesTitle}>
                <span style={styles.resultIcon}>🎨</span>
                All Menu Styles Generated
              </h3>
              <p style={styles.allStylesSubtitle}>
                Compare {Object.keys(allStylesResult.styles).length} different menu styles for {allStylesResult.businessData?.name}
              </p>
            </div>
            <div style={styles.allStylesActions}>
              <button
                onClick={handleStartAllPreviews}
                disabled={startingPreviews}
                style={styles.viewAllBtn}
              >
                {startingPreviews ? '⏳ Starting...' : '🖥️ View All Side-by-Side'}
              </button>
              <button
                onClick={handleOpenAllInTabs}
                disabled={startingPreviews}
                style={styles.openAllTabsBtn}
              >
                {startingPreviews ? '⏳' : '📑'} Open All in Tabs
              </button>
              <button
                onClick={() => {
                  setAllStylesResult(null);
                  setComparisonView(false);
                  setPreviewUrls({});
                }}
                style={styles.closeAllStylesBtn}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Style Tabs */}
          <div style={styles.styleTabs}>
            {Object.entries(allStylesResult.styles).map(([styleKey, styleData]) => (
              <button
                key={styleKey}
                onClick={() => setActiveStyleTab(styleKey)}
                style={{
                  ...styles.styleTab,
                  background: activeStyleTab === styleKey ? MENU_STYLES[styleKey]?.color : '#fff',
                  color: activeStyleTab === styleKey ? '#fff' : '#4b5563',
                  borderColor: activeStyleTab === styleKey ? MENU_STYLES[styleKey]?.color : '#e5e7eb'
                }}
              >
                <span style={styles.styleTabIcon}>{MENU_STYLES[styleKey]?.icon}</span>
                <span>{MENU_STYLES[styleKey]?.name}</span>
              </button>
            ))}
          </div>

          {/* Active Style Preview */}
          {allStylesResult.styles[activeStyleTab] && (
            <div style={styles.stylePreviewCard}>
              <div style={{
                ...styles.stylePreviewHeader,
                background: `${MENU_STYLES[activeStyleTab]?.color}15`
              }}>
                <div style={styles.stylePreviewInfo}>
                  <span style={styles.stylePreviewIcon}>{MENU_STYLES[activeStyleTab]?.icon}</span>
                  <div>
                    <div style={styles.stylePreviewName}>{MENU_STYLES[activeStyleTab]?.name}</div>
                    <div style={styles.stylePreviewDesc}>{MENU_STYLES[activeStyleTab]?.description}</div>
                  </div>
                </div>
                <div style={styles.stylePreviewMeta}>
                  <span style={styles.styleMetaItem}>
                    📄 {Object.keys(allStylesResult.styles[activeStyleTab].pages).length} pages
                  </span>
                  <span style={styles.styleMetaItem}>
                    ⏱️ {allStylesResult.styles[activeStyleTab].duration}s
                  </span>
                </div>
              </div>

              <div style={styles.stylePreviewBody}>
                <div style={styles.stylePreviewPath}>
                  <code>{allStylesResult.styles[activeStyleTab].projectDir}</code>
                </div>

                <div style={styles.stylePreviewActions}>
                  <button
                    onClick={() => handlePreview(allStylesResult.styles[activeStyleTab].projectDir)}
                    style={{
                      ...styles.styleActionBtn,
                      background: MENU_STYLES[activeStyleTab]?.color,
                      color: '#fff'
                    }}
                    disabled={previewing}
                  >
                    {previewing ? '⏳' : '👁️'} Preview This Style
                  </button>
                  <button
                    onClick={() => handleOpenFolder(allStylesResult.styles[activeStyleTab].projectDir)}
                    style={styles.styleActionBtnSecondary}
                  >
                    📁 Open Folder
                  </button>
                  <button
                    onClick={() => handleOpenVSCode(allStylesResult.styles[activeStyleTab].projectDir)}
                    style={styles.styleActionBtnSecondary}
                  >
                    💻 VS Code
                  </button>
                </div>

                <div style={styles.bestForBadge}>
                  <span style={styles.bestForLabel}>Best for:</span>
                  <span>{MENU_STYLES[activeStyleTab]?.bestFor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison View */}
          {comparisonView && Object.keys(previewUrls).length > 0 && (
            <div style={styles.comparisonViewSection}>
              <div style={styles.comparisonViewHeader}>
                <h4 style={styles.comparisonViewTitle}>🖥️ Side-by-Side Comparison</h4>
                <div style={styles.comparisonControls}>
                  <button
                    onClick={() => setComparisonView(false)}
                    style={styles.minimizeBtn}
                  >
                    Minimize
                  </button>
                </div>
              </div>

              {/* Page Navigation */}
              <div style={styles.pageNavigation}>
                <span style={styles.pageNavLabel}>Compare Page:</span>
                <div style={styles.pageNavButtons}>
                  {[
                    { path: '/', label: '🏠 Home', icon: '🏠' },
                    { path: '/menu', label: '📋 Menu', icon: '📋' },
                    { path: '/about', label: '👤 About', icon: '👤' },
                    { path: '/contact', label: '📞 Contact', icon: '📞' }
                  ].map(page => (
                    <button
                      key={page.path}
                      onClick={() => setComparisonPage(page.path)}
                      style={{
                        ...styles.pageNavBtn,
                        background: comparisonPage === page.path ? '#8B5CF6' : '#374151',
                        color: '#fff'
                      }}
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
                <div style={styles.syncToggle}>
                  <label style={styles.syncLabel}>
                    <input
                      type="checkbox"
                      checked={syncNavigation}
                      onChange={(e) => setSyncNavigation(e.target.checked)}
                      style={styles.syncCheckbox}
                    />
                    Sync navigation
                  </label>
                </div>
              </div>

              <div style={expandedStyle ? styles.iframeGridExpanded : styles.iframeGrid}>
                {Object.entries(previewUrls).map(([styleKey, baseUrl]) => {
                  // If a style is expanded and this isn't it, hide it
                  if (expandedStyle && expandedStyle !== styleKey) return null;

                  const isExpanded = expandedStyle === styleKey;

                  return (
                    <div
                      key={styleKey}
                      style={isExpanded ? styles.iframeWrapperExpanded : styles.iframeWrapper}
                    >
                      <div style={{
                        ...styles.iframeHeader,
                        background: MENU_STYLES[styleKey]?.color || '#3B82F6'
                      }}>
                        <span style={styles.iframeLabel}>
                          {MENU_STYLES[styleKey]?.icon} {MENU_STYLES[styleKey]?.name}
                        </span>
                        <div style={styles.iframeActions}>
                          <button
                            onClick={() => setExpandedStyle(isExpanded ? null : styleKey)}
                            style={styles.expandBtn}
                          >
                            {isExpanded ? '⊟ Grid' : '⊞ Expand'}
                          </button>
                          <a
                            href={`${baseUrl}${comparisonPage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.iframeOpenBtn}
                          >
                            ↗ Tab
                          </a>
                        </div>
                      </div>
                      <iframe
                        src={syncNavigation ? `${baseUrl}${comparisonPage}` : baseUrl}
                        style={isExpanded ? styles.previewIframeExpanded : styles.previewIframe}
                        title={`${styleKey} preview`}
                        key={syncNavigation ? `${styleKey}-${comparisonPage}` : styleKey}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Quick page jump hint */}
              <div style={styles.comparisonHint}>
                💡 <strong>Tip:</strong> Use the page buttons above to compare the same page across all styles,
                or uncheck "Sync navigation" to browse each site independently.
              </div>
            </div>
          )}

          {/* Quick Compare Grid */}
          {!comparisonView && (
            <div style={styles.quickCompareSection}>
              <h4 style={styles.quickCompareTitle}>Quick Compare - All Styles</h4>
              <div style={styles.quickCompareGrid}>
                {Object.entries(allStylesResult.styles).map(([styleKey, styleData]) => (
                  <div
                    key={styleKey}
                    onClick={() => setActiveStyleTab(styleKey)}
                    style={{
                      ...styles.quickCompareCard,
                      borderColor: activeStyleTab === styleKey ? MENU_STYLES[styleKey]?.color : '#e5e7eb',
                      background: activeStyleTab === styleKey ? `${MENU_STYLES[styleKey]?.color}08` : '#fff'
                    }}
                  >
                    <div style={styles.quickCompareHeader}>
                      <span style={styles.quickCompareIcon}>{MENU_STYLES[styleKey]?.icon}</span>
                      <span style={styles.quickCompareName}>{MENU_STYLES[styleKey]?.name}</span>
                    </div>
                    <div style={styles.quickCompareDesc}>{MENU_STYLES[styleKey]?.description}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(styleData.projectDir);
                      }}
                      style={{
                        ...styles.quickPreviewBtn,
                        background: MENU_STYLES[styleKey]?.color
                      }}
                      disabled={previewing}
                    >
                      👁️ Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Styles Error */}
      {allStylesResult && !allStylesResult.success && (
        <div style={{ ...styles.resultCard, borderColor: '#EF4444' }}>
          <div style={styles.errorResult}>
            <span style={styles.errorIcon}>❌</span>
            <span>{allStylesResult.error}</span>
          </div>
        </div>
      )}

      {/* Generation Result */}
      {generationResult && (
        <div style={{
          ...styles.resultCard,
          borderColor: generationResult.success ? '#10B981' : '#EF4444'
        }}>
          {generationResult.success ? (
            <>
              <div style={styles.resultHeader}>
                <span style={styles.resultIcon}>✅</span>
                <span style={styles.resultTitle}>
                  {generationResult.variants ? 'All Variants Generated!' : 'Site Generated!'}
                </span>
              </div>
              {generationResult.variants ? (
                <>
                  {/* Side-by-side view buttons */}
                  <div style={styles.variantsViewButtons}>
                    <button
                      onClick={handleStartAllVariantPreviews}
                      disabled={startingPreviews}
                      style={styles.viewAllVariantsBtn}
                    >
                      {startingPreviews ? '⏳ Starting...' : '🖥️ View All Side-by-Side'}
                    </button>
                    <button
                      onClick={handleOpenAllVariantsInTabs}
                      disabled={startingPreviews}
                      style={styles.openAllVariantsTabsBtn}
                    >
                      {startingPreviews ? '⏳' : '📑'} Open All in Tabs
                    </button>
                  </div>

                  {/* Side-by-side iframe view for variants */}
                  {variantsComparisonView && Object.keys(variantPreviewUrls).length > 0 && (
                    <div style={styles.variantsIframeSection}>
                      <div style={styles.variantsIframeHeader}>
                        <span style={styles.variantsIframeTitle}>🖥️ Layout Variants Comparison</span>
                        <div style={styles.pageNavButtons}>
                          {[
                            { path: '/', label: '🏠 Home' },
                            { path: '/menu', label: '📋 Menu' },
                            { path: '/about', label: '👤 About' },
                            { path: '/contact', label: '📞 Contact' }
                          ].map(page => (
                            <button
                              key={page.path}
                              onClick={() => setComparisonPage(page.path)}
                              style={{
                                ...styles.pageNavBtn,
                                background: comparisonPage === page.path ? '#3B82F6' : '#e5e7eb',
                                color: comparisonPage === page.path ? '#fff' : '#4b5563'
                              }}
                            >
                              {page.label}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setVariantsComparisonView(false)}
                          style={styles.closeVariantsViewBtn}
                        >
                          ✕ Close
                        </button>
                      </div>
                      <div style={expandedVariant ? styles.variantsIframeGridExpanded : styles.variantsIframeGrid}>
                        {Object.entries(variantPreviewUrls).map(([variantKey, url]) => {
                          // If a variant is expanded and this isn't it, hide it
                          if (expandedVariant && expandedVariant !== variantKey) return null;

                          const isExpanded = expandedVariant === variantKey;

                          return (
                            <div
                              key={variantKey}
                              style={isExpanded ? styles.variantIframeWrapperExpanded : styles.variantIframeWrapper}
                            >
                              <div style={{
                                ...styles.variantIframeHeader,
                                background: getVariantInfo(detection?.industry, variantKey)?.color || '#3B82F6'
                              }}>
                                <span>
                                  {getVariantInfo(detection?.industry, variantKey)?.icon} Layout {variantKey}: {getVariantInfo(detection?.industry, variantKey)?.name}
                                </span>
                                <div style={styles.iframeActions}>
                                  <button
                                    onClick={() => setExpandedVariant(isExpanded ? null : variantKey)}
                                    style={styles.expandBtn}
                                  >
                                    {isExpanded ? '⊟ Grid' : '⊞ Expand'}
                                  </button>
                                  <a
                                    href={`${url}${comparisonPage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.iframeOpenBtn}
                                  >
                                    ↗ Tab
                                  </a>
                                </div>
                              </div>
                              <iframe
                                src={`${url}${comparisonPage}`}
                                style={isExpanded ? styles.variantPreviewIframeExpanded : styles.variantPreviewIframe}
                                title={`Layout ${variantKey} preview`}
                                key={`${variantKey}-${comparisonPage}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Individual variant cards */}
                  {!variantsComparisonView && (
                    <div style={styles.comparisonGrid}>
                      {Object.entries(generationResult.variants).map(([key, result]) => {
                        const variantInfo = getVariantInfo(detection?.industry, key);
                        return (
                        <div key={key} style={{
                          ...styles.comparisonCard,
                          borderColor: variantInfo?.color || '#e5e7eb'
                        }}>
                          <div style={{
                            ...styles.comparisonHeader,
                            background: `${variantInfo?.color || '#3B82F6'}15`
                          }}>
                            <span style={styles.comparisonIcon}>{variantInfo?.icon}</span>
                            <div>
                              <div style={styles.comparisonTitle}>Layout {key}</div>
                              <div style={styles.comparisonSubtitle}>{variantInfo?.name}</div>
                            </div>
                          </div>

                          <div style={styles.comparisonDesc}>
                            {variantInfo?.description}
                          </div>

                          <div style={styles.comparisonMeta}>
                            <span>{Object.keys(result.pages).length} pages</span>
                            <span>Generated in {result.duration}s</span>
                          </div>

                          <div style={styles.comparisonActions}>
                            <button
                              onClick={() => handlePreview(result.projectDir)}
                              style={{
                                ...styles.comparisonBtn,
                                background: variantInfo?.color || '#3B82F6',
                                color: '#fff'
                              }}
                              disabled={previewing}
                            >
                              {previewing ? '⏳' : '👁️'} Preview
                            </button>
                            <button
                              onClick={() => handleOpenFolder(result.projectDir)}
                              style={styles.comparisonBtnSecondary}
                            >
                              📁
                            </button>
                            <button
                              onClick={() => handleOpenVSCode(result.projectDir)}
                              style={styles.comparisonBtnSecondary}
                            >
                              💻
                            </button>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.resultDetails}>
                  <div style={styles.resultItem}>
                    <span>Business:</span>
                    <strong>{generationResult.businessData?.name}</strong>
                  </div>
                  <div style={styles.resultItem}>
                    <span>Industry:</span>
                    <strong>{generationResult.detection?.industryName}</strong>
                  </div>
                  <div style={styles.resultItem}>
                    <span>Pages:</span>
                    <strong>{Object.keys(generationResult.pages || {}).join(', ')}</strong>
                  </div>
                  <div style={styles.resultItem}>
                    <span>Duration:</span>
                    <strong>{generationResult.duration}s</strong>
                  </div>
                </div>
              )}
              {/* Single variant path and actions */}
              {!generationResult.variants && (
                <>
                  <div style={styles.resultPath}>
                    <code>{generationResult.projectDir}</code>
                  </div>

                  {/* Primary Action */}
                  <div style={styles.primaryAction}>
                    <button
                      onClick={() => handleRun(generationResult.projectDir)}
                      style={styles.runBtn}
                      disabled={running}
                    >
                      {running ? '⏳ Starting Services...' : '🚀 Launch Project'}
                    </button>
                    <span style={styles.runHint}>Starts frontend, backend & admin dashboard</span>
                  </div>

                  {/* Running Services - Prominent Cards */}
                  {runUrls && (
                    <div style={styles.servicesSection}>
                      <div style={styles.servicesSectionHeader}>
                        <span style={styles.servicesLiveIndicator}></span>
                        <span style={styles.servicesSectionTitle}>Services Running</span>
                      </div>
                      <div style={styles.servicesGrid}>
                        {runUrls.frontend && (
                          <a href={runUrls.frontend} target="_blank" rel="noopener noreferrer" style={styles.serviceCard}>
                            <div style={styles.serviceIcon}>🌐</div>
                            <div style={styles.serviceInfo}>
                              <div style={styles.serviceName}>Public Website</div>
                              <div style={styles.serviceUrl}>{runUrls.frontend}</div>
                            </div>
                            <div style={styles.serviceArrow}>→</div>
                          </a>
                        )}
                        {runUrls.admin && (
                          <a href={runUrls.admin} target="_blank" rel="noopener noreferrer" style={{...styles.serviceCard, ...styles.serviceCardAdmin}}>
                            <div style={styles.serviceIcon}>🎛️</div>
                            <div style={styles.serviceInfo}>
                              <div style={styles.serviceName}>Admin Dashboard</div>
                              <div style={styles.serviceUrl}>{runUrls.admin}</div>
                            </div>
                            <div style={styles.serviceArrow}>→</div>
                          </a>
                        )}
                        {runUrls.backend && (
                          <a href={`${runUrls.backend}/health`} target="_blank" rel="noopener noreferrer" style={styles.serviceCardSmall}>
                            <span style={styles.serviceIconSmall}>⚙️</span>
                            <span style={styles.serviceNameSmall}>API: {runUrls.backend}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Secondary Actions */}
                  <div style={styles.secondaryActions}>
                    <button
                      onClick={() => handlePreview(generationResult.projectDir)}
                      style={styles.secondaryBtn}
                      disabled={previewing}
                    >
                      👁️ {previewing ? 'Starting...' : 'Preview Only'}
                    </button>
                    <button
                      onClick={() => handleOpenFolder(generationResult.projectDir)}
                      style={styles.secondaryBtn}
                    >
                      📁 Open Folder
                    </button>
                    <button
                      onClick={() => handleOpenVSCode(generationResult.projectDir)}
                      style={styles.secondaryBtn}
                    >
                      💻 VS Code
                    </button>
                  </div>
                </>
              )}

              {previewUrl && !generationResult.variants && (
                <div style={styles.previewUrlBox}>
                  <span>Preview running at: </span>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={styles.previewLink}>
                    {previewUrl}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div style={styles.errorResult}>
              <span style={styles.errorIcon}>❌</span>
              <span>{generationResult.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Deploy Result */}
      {deployResult && (
        <div style={{
          ...styles.resultCard,
          borderColor: deployResult.success ? '#10B981' : '#EF4444'
        }}>
          {deployResult.success ? (
            <>
              <div style={styles.resultHeader}>
                <span style={styles.resultIcon}>🎉</span>
                <span style={styles.resultTitle}>Deployed Successfully!</span>
              </div>
              <div style={styles.urlSection}>
                <a
                  href={deployResult.urls?.frontend}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.liveUrl}
                >
                  {deployResult.urls?.frontend}
                </a>
              </div>
              <div style={styles.resultDetails}>
                <div style={styles.resultItem}>
                  <span>Business:</span>
                  <strong>{deployResult.businessName}</strong>
                </div>
                <div style={styles.resultItem}>
                  <span>Layout:</span>
                  <strong>Variant {deployResult.variant}</strong>
                </div>
                <div style={styles.resultItem}>
                  <span>Pages:</span>
                  <strong>{deployResult.pages?.join(', ')}</strong>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.errorResult}>
              <span style={styles.errorIcon}>❌</span>
              <span>{deployResult.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {(generationResult || deployResult) && (
        <button onClick={handleReset} style={styles.resetBtn}>
          Start New Project
        </button>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && !generating && !deploying && (
        <div style={styles.recentSection}>
          <h3 style={styles.recentTitle}>Recent Generations</h3>
          <div style={styles.recentList}>
            {recentProjects.map((project, idx) => (
              <div key={idx} style={styles.recentItem}>
                <span style={styles.recentName}>{project.businessData?.name}</span>
                <span style={styles.recentIndustry}>{project.detection?.industryName}</span>
                <span style={styles.recentVariant}>Layout {project.variant}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  headerContent: {},
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  rocket: {
    fontSize: '2.5rem'
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '4px'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f9fafb',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: '#4b5563'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  inputSection: {
    marginBottom: '24px'
  },
  inputWrapper: {
    position: 'relative'
  },
  mainInput: {
    width: '100%',
    padding: '20px 24px',
    fontSize: '1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  detectingBadge: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '4px 12px',
    background: '#f3f4f6',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  presetsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  presetsLabel: {
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  presetBtn: {
    padding: '6px 12px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#374151'
  },
  detectionCard: {
    marginTop: '16px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  detectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  industryBadge: {
    padding: '6px 14px',
    background: '#3B82F6',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  confidenceBadge: {
    fontSize: '0.85rem',
    color: '#10B981'
  },
  detectionDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  detectionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detectionLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  detectionValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  styleNote: {
    marginTop: '16px',
    padding: '12px',
    background: '#fff',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#4b5563',
    fontStyle: 'italic'
  },
  optionsSection: {
    marginBottom: '24px'
  },
  optionGroup: {
    marginBottom: '24px'
  },
  optionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '12px'
  },
  variantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  variantCard: {
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  variantIcon: {
    fontSize: '2rem',
    marginBottom: '8px'
  },
  variantName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  variantLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '4px'
  },
  variantDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af'
  },
  menuStyleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  menuStyleCard: {
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  menuStyleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  menuStyleName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  menuStyleDesc: {
    fontSize: '0.75rem',
    color: '#6b7280',
    lineHeight: 1.3
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  modeCard: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  modeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  modeIcon: {
    fontSize: '1.5rem'
  },
  modeCost: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#10B981'
  },
  modeName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  modeDesc: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  actionSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 28px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  generateBtn: {
    background: '#10B981',
    color: '#fff'
  },
  compareBtn: {
    background: '#f3f4f6',
    color: '#4b5563'
  },
  allStylesBtn: {
    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    color: '#fff'
  },
  deployBtn: {
    background: '#3B82F6',
    color: '#fff'
  },
  btnIcon: {
    fontSize: '1.2rem'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  progressSection: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px'
  },
  progressTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  progressBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  progressFill: {
    height: '100%',
    background: '#3B82F6',
    transition: 'width 0.3s'
  },
  progressSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#4b5563'
  },
  progressIcon: {
    color: '#10B981'
  },
  resultCard: {
    padding: '24px',
    border: '2px solid',
    borderRadius: '16px',
    marginBottom: '24px'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  resultIcon: {
    fontSize: '1.5rem'
  },
  resultTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  resultDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  resultItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.95rem',
    color: '#4b5563'
  },
  resultPath: {
    padding: '12px',
    background: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '0.85rem',
    overflow: 'auto'
  },
  resultActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  previewBtn: {
    padding: '12px 20px',
    background: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  folderBtn: {
    padding: '12px 20px',
    background: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  vscodeBtn: {
    padding: '12px 20px',
    background: '#007ACC',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  runBtn: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  primaryAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '20px'
  },
  runHint: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  servicesSection: {
    background: '#fff',
    border: '2px solid #10B981',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px'
  },
  servicesSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px'
  },
  servicesLiveIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)'
  },
  servicesSectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#065F46'
  },
  servicesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  serviceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#166534',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #bbf7d0'
  },
  serviceCardAdmin: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #fcd34d',
    color: '#92400e'
  },
  serviceIcon: {
    fontSize: '1.5rem'
  },
  serviceInfo: {
    flex: 1
  },
  serviceName: {
    fontSize: '1rem',
    fontWeight: '700'
  },
  serviceUrl: {
    fontSize: '0.85rem',
    opacity: 0.8,
    marginTop: '2px'
  },
  serviceArrow: {
    fontSize: '1.2rem',
    fontWeight: '700',
    opacity: 0.5
  },
  serviceCardSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#f3f4f6',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '0.85rem'
  },
  serviceIconSmall: {
    fontSize: '1rem'
  },
  serviceNameSmall: {
    fontWeight: '500'
  },
  secondaryActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  secondaryBtn: {
    padding: '10px 16px',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  previewUrlBox: {
    marginTop: '16px',
    padding: '12px 16px',
    background: '#ECFDF5',
    border: '1px solid #10B981',
    borderRadius: '8px',
    fontSize: '0.95rem'
  },
  previewLink: {
    color: '#059669',
    fontWeight: '600',
    textDecoration: 'none'
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '16px'
  },
  comparisonCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#fff'
  },
  comparisonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px'
  },
  comparisonIcon: {
    fontSize: '2rem'
  },
  comparisonTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  comparisonSubtitle: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  comparisonDesc: {
    padding: '0 16px 12px',
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  comparisonMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#f9fafb',
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  comparisonActions: {
    display: 'flex',
    gap: '8px',
    padding: '16px'
  },
  comparisonBtn: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  comparisonBtnSecondary: {
    padding: '10px 14px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  urlSection: {
    marginBottom: '16px'
  },
  liveUrl: {
    display: 'inline-block',
    padding: '12px 20px',
    background: '#10B981',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem'
  },
  errorResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#EF4444'
  },
  errorIcon: {
    fontSize: '1.5rem'
  },
  resetBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
    marginBottom: '24px'
  },
  recentSection: {
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px'
  },
  recentTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '12px'
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#fff',
    borderRadius: '8px'
  },
  recentName: {
    fontWeight: '600',
    color: '#1f2937',
    flex: 1
  },
  recentIndustry: {
    fontSize: '0.85rem',
    color: '#6b7280'
  },
  recentVariant: {
    fontSize: '0.85rem',
    padding: '4px 10px',
    background: '#e5e7eb',
    borderRadius: '12px',
    color: '#4b5563'
  },

  // All Styles Comparison
  allStylesContainer: {
    border: '2px solid #8B5CF6',
    borderRadius: '20px',
    overflow: 'hidden',
    marginBottom: '24px',
    background: '#fff'
  },
  allStylesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    background: 'linear-gradient(135deg, #8B5CF615 0%, #EC489915 100%)',
    borderBottom: '1px solid #e5e7eb'
  },
  allStylesTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: 0
  },
  allStylesSubtitle: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginTop: '6px',
    margin: 0
  },
  allStylesActions: {
    display: 'flex',
    gap: '8px'
  },
  closeAllStylesBtn: {
    padding: '8px 16px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  viewAllBtn: {
    padding: '10px 20px',
    background: '#8B5CF6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  openAllTabsBtn: {
    padding: '10px 20px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  styleTabs: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    background: '#f9fafb',
    overflowX: 'auto'
  },
  styleTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s'
  },
  styleTabIcon: {
    fontSize: '1.1rem'
  },
  stylePreviewCard: {
    margin: '24px',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  stylePreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px'
  },
  stylePreviewInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  stylePreviewIcon: {
    fontSize: '2.5rem'
  },
  stylePreviewName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  stylePreviewDesc: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginTop: '4px'
  },
  stylePreviewMeta: {
    display: 'flex',
    gap: '16px'
  },
  styleMetaItem: {
    fontSize: '0.9rem',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  stylePreviewBody: {
    padding: '20px 24px',
    background: '#fff'
  },
  stylePreviewPath: {
    padding: '12px 16px',
    background: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    overflow: 'auto'
  },
  stylePreviewActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  styleActionBtn: {
    padding: '14px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  styleActionBtnSecondary: {
    padding: '14px 20px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#4b5563'
  },
  bestForBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#FEF3C7',
    borderRadius: '8px',
    fontSize: '0.9rem'
  },
  bestForLabel: {
    fontWeight: '600',
    color: '#92400E'
  },
  quickCompareSection: {
    padding: '24px',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb'
  },
  quickCompareTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '16px'
  },
  quickCompareGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  quickCompareCard: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  quickCompareHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  quickCompareIcon: {
    fontSize: '1.5rem'
  },
  quickCompareName: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  quickCompareDesc: {
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '12px',
    lineHeight: 1.4
  },
  quickPreviewBtn: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer'
  },

  // Side-by-side comparison view
  comparisonViewSection: {
    padding: '24px',
    background: '#1f2937',
    borderTop: '1px solid #374151'
  },
  comparisonViewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  comparisonViewTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0
  },
  comparisonControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  minimizeBtn: {
    padding: '8px 16px',
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  pageNavigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    background: '#374151',
    borderRadius: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  pageNavLabel: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  pageNavButtons: {
    display: 'flex',
    gap: '8px'
  },
  pageNavBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  syncToggle: {
    marginLeft: 'auto'
  },
  syncLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9ca3af',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  syncCheckbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  iframeActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  comparisonHint: {
    padding: '12px 16px',
    background: '#374151',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '0.85rem',
    color: '#9ca3af'
  },
  iframeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  iframeGridExpanded: {
    display: 'block'
  },
  iframeWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },
  iframeWrapperExpanded: {
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
  },
  iframeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    color: '#fff'
  },
  iframeLabel: {
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  iframeOpenBtn: {
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  expandBtn: {
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  previewIframe: {
    width: '100%',
    height: '500px',
    border: 'none'
  },
  previewIframeExpanded: {
    width: '100%',
    height: '75vh',
    border: 'none'
  },

  // Variant comparison styles
  variantsViewButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  viewAllVariantsBtn: {
    padding: '12px 20px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  openAllVariantsTabsBtn: {
    padding: '12px 20px',
    background: '#6B7280',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  variantsIframeSection: {
    background: '#1f2937',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  variantsIframeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  variantsIframeTitle: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600'
  },
  closeVariantsViewBtn: {
    padding: '8px 16px',
    background: '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  variantsIframeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  variantsIframeGridExpanded: {
    display: 'block'
  },
  variantIframeWrapper: {
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },
  variantIframeWrapperExpanded: {
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
  },
  variantIframeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  variantPreviewIframe: {
    width: '100%',
    height: '450px',
    border: 'none'
  },
  variantPreviewIframeExpanded: {
    width: '100%',
    height: '75vh',
    border: 'none'
  },
  // Custom Menu Styles
  customMenuToggle: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  customMenuBadge: {
    padding: '4px 10px',
    background: '#10B981',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  customMenuContent: {
    marginTop: '12px',
    padding: '16px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px'
  },
  customMenuHelp: {
    margin: '0 0 12px 0',
    fontSize: '0.9rem',
    color: '#6B7280'
  },
  customMenuDropzone: {
    border: '2px dashed #e5e7eb',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  customMenuTextarea: {
    width: '100%',
    minHeight: '200px',
    padding: '16px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'transparent'
  },
  customMenuError: {
    marginTop: '12px',
    padding: '12px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    color: '#DC2626',
    fontSize: '0.9rem'
  },
  customMenuPreview: {
    marginTop: '12px',
    padding: '12px',
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '8px'
  },
  customMenuPreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    color: '#15803D',
    fontSize: '0.9rem'
  },
  customMenuClearBtn: {
    padding: '4px 10px',
    background: '#fff',
    border: '1px solid #BBF7D0',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#15803D'
  },
  customMenuCategories: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  customMenuCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#fff',
    border: '1px solid #BBF7D0',
    borderRadius: '6px',
    fontSize: '0.85rem'
  },
  customMenuCategoryName: {
    fontWeight: '500',
    color: '#166534'
  },
  customMenuItemCount: {
    color: '#6B7280',
    fontSize: '0.8rem'
  }
};

// Add keyframe animations for spinner and shimmer
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @media (max-width: 900px) {
    .trend-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 600px) {
    .trend-grid { grid-template-columns: 1fr !important; }
  }
`;
document.head.appendChild(styleSheet);
