/**
 * Scout Dashboard
 *
 * Visual interface for finding businesses without websites.
 * Shows results on an interactive map with color-coded pins by industry.
 */

import React, { useState, useEffect, useRef } from 'react';
import ProspectManager from './ProspectManager';

// Industry colors for map pins
const INDUSTRY_COLORS = {
  'barbershop': '#3B82F6',
  'salon-spa': '#EC4899',
  'coffee-cafe': '#78350F',
  'pizza-restaurant': '#DC2626',
  'restaurant': '#F59E0B',
  'bakery': '#D97706',
  'fitness-gym': '#EF4444',
  'yoga': '#10B981',
  'dental': '#06B6D4',
  'healthcare': '#0EA5E9',
  'law-firm': '#1E3A8A',
  'real-estate': '#059669',
  'auto-shop': '#4B5563',
  'plumber': '#2563EB',
  'cleaning': '#14B8A6',
  'default': '#6B7280'
};

// CRM Status colors
const CRM_STATUS_COLORS = {
  'discovered': '#6B7280',
  'researched': '#3B82F6',
  'queued': '#8B5CF6',
  'contacted': '#F59E0B',
  'responded': '#10B981',
  'meeting': '#06B6D4',
  'proposal': '#EC4899',
  'won': '#22C55E',
  'lost': '#EF4444',
  'not_interested': '#9CA3AF',
  'bad_fit': '#78716C'
};

export default function ScoutDashboard() {
  const [activeTab, setActiveTab] = useState('scout'); // 'scout', 'pipeline', 'leaderboard', 'industry-tests', or 'design-research'
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [location, setLocation] = useState('Lewisville, TX');
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [showAll, setShowAll] = useState(true);  // Show all businesses for manual verification
  const [markedAsHasWebsite, setMarkedAsHasWebsite] = useState(new Set());  // User-verified as having website
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // New state for research/CRM features
  const [enrichWithYelp, setEnrichWithYelp] = useState(false);
  const [hasYelpKey, setHasYelpKey] = useState(false);
  const [crmStatuses, setCrmStatuses] = useState([]);
  const [pipeline, setPipeline] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [emailDraft, setEmailDraft] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Leaderboard sorting/filtering
  const [sortBy, setSortBy] = useState('score');
  const [sortDir, setSortDir] = useState('desc');
  const [filterCity, setFilterCity] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterGenerated, setFilterGenerated] = useState(''); // '', 'true', 'false'
  const [filterDeployed, setFilterDeployed] = useState(''); // '', 'true', 'false'
  const [availableCities, setAvailableCities] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [expandedBreakdown, setExpandedBreakdown] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [leaderboardStats, setLeaderboardStats] = useState(null); // Pipeline stats

  // Input level generation
  const [showGenerateModal, setShowGenerateModal] = useState(null); // prospect id
  const [generatingLevel, setGeneratingLevel] = useState(null); // 'minimal' | 'moderate' | 'extreme' | 'all'
  const [previewInputs, setPreviewInputs] = useState(null); // Auto-generated inputs preview

  // Unified generation mode
  const [generateMode, setGenerateMode] = useState('unified'); // 'level' or 'unified'
  const [unifiedConfig, setUnifiedConfig] = useState({
    inputLevel: 'moderate',
    tier: 'premium',
    enableVariants: false,
    selectedPresets: ['luxury', 'friendly'],
    selectedLayouts: [], // Will be populated based on industry
    generateVideo: true,
    generateLogo: true,
    enablePortal: true
  });

  // Industry Test Suite state
  const [industryTestRunning, setIndustryTestRunning] = useState(false);
  const [industryTestProgress, setIndustryTestProgress] = useState(null);
  const [industryTestResults, setIndustryTestResults] = useState(null);
  const [industryTestStatus, setIndustryTestStatus] = useState([]); // Status of all industries

  // Design Research state
  const [designResearchData, setDesignResearchData] = useState([]);
  const [selectedResearchIndustry, setSelectedResearchIndustry] = useState(null);
  const [selectedLayoutVariant, setSelectedLayoutVariant] = useState('A');
  const [generatingFromResearch, setGeneratingFromResearch] = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, status: '', results: [] });
  const [selectedIndustriesForBatch, setSelectedIndustriesForBatch] = useState(new Set());

  // Industry-specific layouts for unified generation
  const INDUSTRY_LAYOUTS = {
    'restaurants-food': [
      { id: 'appetizing-visual', name: 'Visual First', icon: '📸', description: 'Food photography center stage' },
      { id: 'menu-focused', name: 'Menu Focus', icon: '📋', description: 'Menu prominently displayed' },
      { id: 'story-driven', name: 'Story Driven', icon: '📖', description: 'Tell your restaurant story' }
    ],
    'dental': [
      { id: 'smile-showcase', name: 'Smile Gallery', icon: '😁', description: 'Visual results & transformations' },
      { id: 'family-dental', name: 'Family Focus', icon: '👨‍👩‍👧', description: 'Warm, all-ages appeal' },
      { id: 'booking-optimized', name: 'Book Now', icon: '📅', description: 'Appointment-focused' }
    ],
    'healthcare-medical': [
      { id: 'clinical-dashboard', name: 'Clinical', icon: '🏥', description: 'Professional medical practice' },
      { id: 'patient-focused', name: 'Patient Care', icon: '💚', description: 'Warm, welcoming design' },
      { id: 'booking-optimized', name: 'Book Now', icon: '📅', description: 'Appointment-focused' }
    ],
    'professional-services': [
      { id: 'trust-builder', name: 'Trust Builder', icon: '🏆', description: 'Credentials & testimonials' },
      { id: 'lead-generator', name: 'Lead Gen', icon: '📥', description: 'Form-focused conversion' },
      { id: 'corporate-clean', name: 'Corporate', icon: '🏢', description: 'Minimal, professional' }
    ],
    'grooming': [
      { id: 'portfolio-showcase', name: 'Portfolio', icon: '✂️', description: 'Showcase your work' },
      { id: 'booking-focused', name: 'Book Now', icon: '📅', description: 'Easy appointment booking' },
      { id: 'team-highlight', name: 'Meet Team', icon: '👥', description: 'Feature your stylists' }
    ],
    'default': [
      { id: 'visual-first', name: 'Visual First', icon: '📸', description: 'Image-focused layout' },
      { id: 'conversion-focused', name: 'Conversion', icon: '📥', description: 'CTA-optimized layout' },
      { id: 'story-driven', name: 'Story Driven', icon: '📖', description: 'Narrative-focused layout' }
    ]
  };

  // Map fixtureId to industry category
  const getIndustryCategory = (fixtureId) => {
    if (!fixtureId) return 'default';
    const id = fixtureId.toLowerCase();
    if (['restaurant', 'pizza', 'cafe', 'coffee', 'bakery', 'food'].some(x => id.includes(x))) return 'restaurants-food';
    if (id.includes('dental')) return 'dental';
    if (['healthcare', 'medical', 'clinic', 'doctor'].some(x => id.includes(x))) return 'healthcare-medical';
    if (['law', 'legal', 'accountant', 'consulting', 'real-estate'].some(x => id.includes(x))) return 'professional-services';
    if (['barber', 'salon', 'spa', 'hair', 'beauty'].some(x => id.includes(x))) return 'grooming';
    return 'default';
  };

  // Get layouts for a prospect based on industry
  const getUnifiedLayouts = (prospectId) => {
    const prospect = leaderboard.find(p => p.id === prospectId);
    if (!prospect) return INDUSTRY_LAYOUTS['default'];
    const category = getIndustryCategory(prospect.fixtureId);
    return INDUSTRY_LAYOUTS[category] || INDUSTRY_LAYOUTS['default'];
  };
  const [unifiedProgress, setUnifiedProgress] = useState(null); // { step, status, progress }
  const [unifiedGenerating, setUnifiedGenerating] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null); // For showing input preview on hover

  // ============================================
  // INPUT LEVEL PREVIEW DATA
  // These are GUIDELINES for test mode, not constraints
  // Real AI mode uses these as starting points with creative freedom
  // ============================================

  const INDUSTRY_PRESETS = {
    'barbershop': { default: 'bold', luxury: 'luxury', budget: 'friendly' },
    'salon-spa': { default: 'luxury', luxury: 'luxury', budget: 'clean' },
    'restaurant': { default: 'bold', luxury: 'luxury', budget: 'friendly' },
    'pizza-restaurant': { default: 'vibrant', luxury: 'bold', budget: 'friendly' },
    'coffee-cafe': { default: 'clean', luxury: 'luxury', budget: 'friendly' },
    'bakery': { default: 'friendly', luxury: 'luxury', budget: 'friendly' },
    'dental': { default: 'clean', luxury: 'luxury', budget: 'clean' },
    'healthcare': { default: 'clean', luxury: 'luxury', budget: 'clean' },
    'fitness-gym': { default: 'bold', luxury: 'luxury', budget: 'vibrant' },
    'yoga': { default: 'minimal', luxury: 'luxury', budget: 'clean' },
    'law-firm': { default: 'luxury', luxury: 'luxury', budget: 'clean' },
    'real-estate': { default: 'luxury', luxury: 'luxury', budget: 'bold' },
    'plumber': { default: 'bold', luxury: 'clean', budget: 'friendly' },
    'cleaning': { default: 'clean', luxury: 'clean', budget: 'friendly' },
    'auto-shop': { default: 'bold', luxury: 'bold', budget: 'friendly' },
    'default': { default: 'clean', luxury: 'luxury', budget: 'friendly' }
  };

  const INDUSTRY_THEMES = {
    'barbershop': 'dark', 'salon-spa': 'light', 'restaurant': 'medium',
    'pizza-restaurant': 'medium', 'coffee-cafe': 'light', 'bakery': 'light',
    'dental': 'light', 'healthcare': 'light', 'fitness-gym': 'dark',
    'yoga': 'light', 'law-firm': 'dark', 'real-estate': 'light',
    'plumber': 'light', 'cleaning': 'light', 'auto-shop': 'dark', 'default': 'light'
  };

  const INDUSTRY_ARCHETYPES = {
    'barbershop': 'vintage-classic', 'salon-spa': 'modern-sleek',
    'restaurant': 'local', 'pizza-restaurant': 'local', 'coffee-cafe': 'local',
    'bakery': 'local', 'dental': 'trust-authority', 'healthcare': 'trust-authority',
    'fitness-gym': 'high-energy', 'yoga': 'calm-wellness', 'law-firm': 'trust-authority',
    'real-estate': 'trust-authority', 'plumber': 'reliable-local',
    'cleaning': 'reliable-local', 'auto-shop': 'reliable-local', 'default': 'local'
  };

  const INDUSTRY_PAGES = {
    'barbershop': ['home', 'services', 'contact', 'about', 'gallery', 'book'],
    'salon-spa': ['home', 'services', 'contact', 'about', 'gallery', 'book', 'team'],
    'restaurant': ['home', 'menu', 'contact', 'about', 'gallery', 'reservations'],
    'dental': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
    'healthcare': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
    'default': ['home', 'services', 'contact', 'about', 'gallery', 'testimonials']
  };

  const ARCHETYPE_MOODS = {
    'vintage-classic': { vibe: 'Classic', energy: 'Calm', era: 'Traditional' },
    'modern-sleek': { vibe: 'Contemporary', energy: 'Balanced', era: 'Modern' },
    'local': { vibe: 'Friendly', energy: 'Welcoming', era: 'Timeless' },
    'luxury': { vibe: 'Elegant', energy: 'Refined', era: 'Sophisticated' },
    'trust-authority': { vibe: 'Professional', energy: 'Confident', era: 'Established' },
    'high-energy': { vibe: 'Dynamic', energy: 'Intense', era: 'Bold' },
    'calm-wellness': { vibe: 'Serene', energy: 'Peaceful', era: 'Natural' },
    'reliable-local': { vibe: 'Trustworthy', energy: 'Dependable', era: 'Honest' }
  };

  // Generate preview of what InputGenerator will fill for a prospect at a given level
  const getInputPreview = (prospectId, level) => {
    const prospect = leaderboard.find(p => p.id === prospectId);
    if (!prospect) return null;

    const industry = prospect.fixtureId || 'default';
    const priceLevel = prospect.research?.priceLevel || '$$';
    const score = prospect.opportunityScore || 50;

    // Derive preset based on price
    const presets = INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.default;
    let preset = presets.default;
    if (priceLevel === '$$$$' || priceLevel === '$$$') preset = presets.luxury;
    else if (priceLevel === '$') preset = presets.budget;

    const theme = INDUSTRY_THEMES[industry] || 'light';
    const archetype = INDUSTRY_ARCHETYPES[industry] || 'local';
    const tier = score >= 75 ? 'premium' : score >= 50 ? 'standard' : 'basic';
    const moods = ARCHETYPE_MOODS[archetype] || ARCHETYPE_MOODS.local;
    const pages = INDUSTRY_PAGES[industry] || INDUSTRY_PAGES.default;

    if (level === 'minimal') {
      return {
        title: 'MINIMAL - AI Decides Everything',
        description: 'System auto-picks all options. You just click generate.',
        isTestMode: 'In TEST mode: Uses these defaults directly',
        isRealMode: 'In REAL mode: AI uses as starting point, may adjust creatively',
        fields: [
          { label: 'Preset', value: `auto → ${preset}`, note: `Based on ${industry} + ${priceLevel}` },
          { label: 'Theme', value: `auto → ${theme}`, note: `Industry default` },
          { label: 'Layout', value: 'auto', note: 'System picks best for industry' },
          { label: 'Pages', value: '5-7 standard', note: 'Core pages only' },
          { label: 'Archetype', value: `auto → ${archetype}`, note: 'Derived from industry' }
        ]
      };
    }

    if (level === 'moderate') {
      return {
        title: 'MODERATE - Smart Defaults',
        description: 'Preset, theme, tier derived from research. You can override.',
        isTestMode: 'In TEST mode: Uses derived values with your overrides',
        isRealMode: 'In REAL mode: AI interprets these + adds creative flourishes',
        fields: [
          { label: 'Preset', value: preset, note: `From ${priceLevel} pricing` },
          { label: 'Theme', value: theme, note: 'Industry standard' },
          { label: 'Tier', value: tier, note: `Score: ${score} → ${tier}` },
          { label: 'Archetype', value: archetype, note: 'Brand personality' },
          { label: 'Pages', value: `${tier === 'premium' ? '8-12' : '5-7'} pages`, note: `${tier} package` },
          { label: 'Tagline', value: '✨ AI Generated', note: 'Based on name + industry' }
        ]
      };
    }

    if (level === 'extreme') {
      return {
        title: 'EXTREME - Full Control',
        description: 'All options populated with intelligent defaults. Mood sliders, colors, typography.',
        isTestMode: 'In TEST mode: All fields pre-filled, fully customizable',
        isRealMode: 'In REAL mode: AI has detailed blueprint but creative latitude',
        fields: [
          { label: 'Preset', value: preset, note: 'Editable' },
          { label: 'Theme', value: theme, note: 'Editable' },
          { label: 'Mood', value: `${moods.vibe}, ${moods.energy}`, note: 'Slider-adjustable' },
          { label: 'Pages', value: pages.join(', '), note: 'Full industry set' },
          { label: 'Colors', value: '🎨 Auto-derived', note: 'From archetype' },
          { label: 'Typography', value: '📝 Auto-matched', note: 'To preset' },
          { label: 'Hero Style', value: '🖼️ Auto-selected', note: 'From archetype' },
          { label: 'Content', value: '✍️ AI Headlines + About', note: 'Generated copy' }
        ]
      };
    }

    return null;
  };

  // Check API key status and load CRM data on load
  useEffect(() => {
    fetch('/api/scout/status')
      .then(r => r.json())
      .then(data => {
        setApiKeyConfigured(data.hasGoogleKey || data.hasApiKey);
        setHasYelpKey(data.hasYelpKey || false);
        console.log('Scout status:', data);
      })
      .catch(() => {});

    fetch('/api/scout/industries')
      .then(r => r.json())
      .then(data => setIndustries(data.industries || []))
      .catch(() => {});

    // Load CRM statuses
    fetch('/api/scout/crm/statuses')
      .then(r => r.json())
      .then(data => setCrmStatuses(data.statuses || []))
      .catch(() => {});

    // Load follow-ups
    loadFollowUps();
  }, []);

  // Load pipeline data when switching to pipeline tab
  useEffect(() => {
    if (activeTab === 'pipeline') {
      loadPipeline();
    } else if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const loadPipeline = async () => {
    try {
      const res = await fetch('/api/scout/crm/pipeline');
      const data = await res.json();
      setPipeline(data.pipeline || {});
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    }
  };

  const loadLeaderboard = async (options = {}) => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        sortBy: options.sortBy || sortBy,
        sortDir: options.sortDir || sortDir,
      });
      if (options.filterCity || filterCity) params.set('filterCity', options.filterCity || filterCity);
      if (options.filterIndustry || filterIndustry) params.set('filterIndustry', options.filterIndustry || filterIndustry);
      if (options.filterStatus || filterStatus) params.set('filterStatus', options.filterStatus || filterStatus);
      if (options.filterGenerated || filterGenerated) params.set('filterGenerated', options.filterGenerated || filterGenerated);
      if (options.filterDeployed || filterDeployed) params.set('filterDeployed', options.filterDeployed || filterDeployed);

      const res = await fetch(`/api/scout/leaderboard?${params}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setAvailableCities(data.filters?.cities || []);
      setAvailableIndustries(data.filters?.industries || []);
      setLeaderboardStats(data.stats || null);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  // Reload leaderboard when filters change
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [sortBy, sortDir, filterCity, filterIndustry, filterStatus, filterGenerated, filterDeployed]);

  const loadFollowUps = async () => {
    try {
      const res = await fetch('/api/scout/crm/follow-ups');
      const data = await res.json();
      setFollowUps(data.followUps || []);
    } catch (err) {
      console.error('Failed to load follow-ups:', err);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!window.L || !mapRef.current || mapInstanceRef.current) return;

    // Default to DFW area
    const map = window.L.map(mapRef.current).setView([33.0198, -96.6989], 11);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
  };

  // Update map markers when prospects or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = getFilteredProspects();
    if (filtered.length === 0) return;

    const bounds = [];

    filtered.forEach(p => {
      if (!p.coordinates) return;

      const { latitude, longitude } = p.coordinates;
      bounds.push([latitude, longitude]);

      const color = INDUSTRY_COLORS[p.fixtureId] || INDUSTRY_COLORS.default;

      // Create custom icon
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
        ">${getIndustryIcon(p.fixtureId)}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = window.L.marker([latitude, longitude], { icon })
        .addTo(mapInstanceRef.current)
        .on('click', () => setSelectedProspect(p));

      marker.bindTooltip(p.name, { direction: 'top', offset: [0, -16] });
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [prospects, markedAsHasWebsite]);

  const getIndustryIcon = (fixtureId) => {
    const icons = {
      'barbershop': '💈',
      'salon-spa': '💇',
      'coffee-cafe': '☕',
      'pizza-restaurant': '🍕',
      'restaurant': '🍽️',
      'bakery': '🥐',
      'fitness-gym': '💪',
      'yoga': '🧘',
      'dental': '🦷',
      'healthcare': '🏥',
      'law-firm': '⚖️',
      'real-estate': '🏠',
      'auto-shop': '🚗',
      'plumber': '🔧',
      'cleaning': '🧹'
    };
    return icons[fixtureId] || '📍';
  };

  const setApiKey = async () => {
    if (!apiKeyInput.trim()) return;

    try {
      const res = await fetch('/api/scout/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim(), provider: 'google' })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeyConfigured(true);
        setApiKeyInput('');
      }
    } catch (err) {
      setError('Failed to set API key');
    }
  };

  const search = async () => {
    if (!location.trim()) return;

    setLoading(true);
    setError('');
    setSelectedProspect(null);
    setMarkedAsHasWebsite(new Set());

    try {
      const res = await fetch('/api/scout/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          industry: selectedIndustry || undefined,
          limit: 50,
          includeWithWebsite: false,
          enrichWithYelp: enrichWithYelp && hasYelpKey  // NEW: Research enrichment
        })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        if (data.needsApiKey) setApiKeyConfigured(false);
      } else {
        setProspects(data.prospects || []);
        setStats({
          total: data.total,
          withWebsite: data.withWebsite,
          withoutWebsite: data.withoutWebsite,
          enriched: data.enrichedWithYelp || false
        });
      }
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update prospect CRM status
  const updateProspectStatus = async (prospectId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/scout/crm/${prospectId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setProspects(prev => prev.map(p =>
          p.id === prospectId ? { ...p, crm: { ...p.crm, status: newStatus } } : p
        ));
        if (selectedProspect?.id === prospectId) {
          setSelectedProspect(prev => ({ ...prev, crm: { ...prev.crm, status: newStatus } }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Generate email draft for prospect
  const generateEmailDraft = async (prospectId) => {
    try {
      const res = await fetch(`/api/scout/outreach/${prospectId}/draft`);
      const data = await res.json();
      if (data.success) {
        setEmailDraft(data.draft);
        setShowEmailModal(true);
      }
    } catch (err) {
      console.error('Failed to generate email draft:', err);
    }
  };

  // Research prospects (batch)
  const researchProspects = async (force = false) => {
    if (!hasYelpKey) {
      setError('Yelp API key required for research');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scout/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })  // force=true to re-research all
      });
      const data = await res.json();
      if (data.success) {
        // Reload prospects or pipeline
        if (activeTab === 'pipeline') {
          loadPipeline();
        }
        loadLeaderboard();
      }
    } catch (err) {
      setError('Research failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INPUT LEVEL GENERATION (Admin Testing)
  // ============================================

  // Preview auto-generated inputs for a prospect
  const previewInputsForLevel = async (prospectId, level) => {
    try {
      const res = await fetch(`/api/scout/prospects/${prospectId}/inputs/${level}`);
      const data = await res.json();
      setPreviewInputs(data);
    } catch (err) {
      console.error('Failed to preview inputs:', err);
    }
  };

  // Generate site with specific input level
  const generateWithLevel = async (prospectId, level) => {
    setGeneratingLevel(level);
    try {
      const res = await fetch(`/api/scout/prospects/${prospectId}/generate-with-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(null);
        setGeneratingLevel(null);
        setPreviewInputs(null);
        loadLeaderboard(); // Refresh to show new generation status
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Generation failed: ' + err.message);
    } finally {
      setGeneratingLevel(null);
    }
  };

  // Generate ALL THREE levels for comparison
  const generateAllLevels = async (prospectId) => {
    setGeneratingLevel('all');
    try {
      const res = await fetch(`/api/scout/prospects/${prospectId}/generate-all-levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(null);
        setGeneratingLevel(null);
        setPreviewInputs(null);
        loadLeaderboard();
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Generation failed: ' + err.message);
    } finally {
      setGeneratingLevel(null);
    }
  };

  // Open generate modal for a prospect
  const openGenerateModal = (prospectId) => {
    // Get layouts for this prospect's industry
    const layouts = getUnifiedLayouts(prospectId);
    setUnifiedConfig(c => ({
      ...c,
      selectedLayouts: layouts.slice(0, 2).map(l => l.id) // Default to first 2 layouts
    }));
    setShowGenerateModal(prospectId);
    setPreviewInputs(null);
    setUnifiedProgress(null);
    setGenerateMode('unified'); // Default to unified mode
    previewInputsForLevel(prospectId, 'all'); // Load preview of all levels
  };

  // Unified generation with SSE progress
  const generateUnified = async (prospectId) => {
    setUnifiedGenerating(true);
    setUnifiedProgress({ step: 'init', status: 'Starting...', progress: 0 });

    try {
      const response = await fetch(`/api/scout/prospects/${prospectId}/unified-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputLevel: unifiedConfig.inputLevel,
          overrides: {
            tier: unifiedConfig.tier
          },
          variants: unifiedConfig.enableVariants ? {
            enabled: true,
            presets: unifiedConfig.selectedPresets,
            layouts: unifiedConfig.selectedLayouts
          } : { enabled: false },
          generateVideo: unifiedConfig.generateVideo,
          generateLogo: unifiedConfig.generateLogo,
          enablePortal: unifiedConfig.enablePortal
        })
      });

      const reader = response.body.getReader();
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
              setUnifiedProgress(data);

              if (data.step === 'complete') {
                setShowGenerateModal(null);
                setUnifiedGenerating(false);
                setUnifiedProgress(null);
                loadLeaderboard();
                return;
              }

              if (data.step === 'error') {
                setError(data.error || 'Generation failed');
                setUnifiedGenerating(false);
                return;
              }
            } catch (e) {
              console.warn('SSE parse error:', e);
            }
          }
        }
      }
    } catch (err) {
      setError('Unified generation failed: ' + err.message);
    } finally {
      setUnifiedGenerating(false);
    }
  };

  // Search ALL industries in parallel
  const searchAllIndustries = async () => {
    if (!location.trim()) return;

    setLoading(true);
    setError('');
    setSelectedProspect(null);
    setMarkedAsHasWebsite(new Set());

    try {
      const res = await fetch('/api/scout/search-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim()
        })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        if (data.needsApiKey) setApiKeyConfigured(false);
      } else {
        setProspects(data.prospects || []);
        setStats({
          total: data.totalScanned,
          withWebsite: data.totalWithWebsite,
          withoutWebsite: data.totalWithoutWebsite,
          byIndustry: data.byIndustry
        });
      }
    } catch (err) {
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark a business as having a website (removes from prospects)
  const markAsHasWebsite = (id) => {
    setMarkedAsHasWebsite(prev => new Set([...prev, id]));
    if (selectedProspect?.id === id) {
      setSelectedProspect(null);
    }
  };

  // Get filtered prospects (excluding user-marked ones)
  const getFilteredProspects = () => {
    return prospects.filter(p => !markedAsHasWebsite.has(p.id));
  };

  const saveProspects = async () => {
    const toSave = getFilteredProspects();
    if (toSave.length === 0) return;

    try {
      const res = await fetch('/api/scout/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospects: toSave })
      });

      const data = await res.json();
      if (data.success) {
        const msg = data.duplicates > 0
          ? `${data.saved} new, ${data.duplicates} duplicates skipped`
          : `${data.saved}`;
        setSavedCount(msg);
        setTimeout(() => setSavedCount(0), 4000);
      }
    } catch (err) {
      setError('Failed to save prospects');
    }
  };

  // If pipeline tab is active, show ProspectManager
  // Render tabs helper
  const renderTabs = () => (
    <div style={styles.tabs}>
      <button
        onClick={() => setActiveTab('scout')}
        style={{ ...styles.tab, ...(activeTab === 'scout' ? styles.tabActive : {}) }}
      >
        🗺️ Scout Map
      </button>
      <button
        onClick={() => setActiveTab('pipeline')}
        style={{ ...styles.tab, ...(activeTab === 'pipeline' ? styles.tabActive : {}) }}
      >
        📋 Pipeline
      </button>
      <button
        onClick={() => setActiveTab('leaderboard')}
        style={{ ...styles.tab, ...(activeTab === 'leaderboard' ? styles.tabActive : {}) }}
      >
        🏆 Leaderboard
      </button>
      <button
        onClick={() => setActiveTab('industry-tests')}
        style={{ ...styles.tab, ...(activeTab === 'industry-tests' ? styles.tabActive : {}) }}
      >
        🧪 Industry Tests
      </button>
      <button
        onClick={() => setActiveTab('design-research')}
        style={{ ...styles.tab, ...(activeTab === 'design-research' ? styles.tabActive : {}) }}
      >
        🎨 Design Research
      </button>
      {followUps.length > 0 && (
        <span style={styles.followUpBadge}>
          {followUps.length} follow-ups due
        </span>
      )}
    </div>
  );

  // Leaderboard Tab
  if (activeTab === 'leaderboard') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🏆 Opportunity Leaderboard</h1>
            <p style={styles.subtitle}>Prospects ranked by opportunity score ({leaderboard.length} shown)</p>
          </div>
          {renderTabs()}
        </div>

        {/* Stats Bar */}
        {leaderboardStats && (
          <div style={styles.statsBar}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{leaderboardStats.total}</div>
              <div style={styles.statLabel}>Total</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#3B82F6' }}>{leaderboardStats.researched}</div>
              <div style={styles.statLabel}>Researched</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#8B5CF6' }}>{leaderboardStats.generated}</div>
              <div style={styles.statLabel}>Generated</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#22C55E' }}>{leaderboardStats.deployed}</div>
              <div style={styles.statLabel}>Deployed</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ ...styles.statValue, color: '#F59E0B' }}>{leaderboardStats.totalVariants}</div>
              <div style={styles.statLabel}>Variants</div>
            </div>
          </div>
        )}

        {/* Controls Row */}
        <div style={styles.leaderboardControls}>
          {/* Research Buttons */}
          {hasYelpKey && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => researchProspects(false)} disabled={loading} style={styles.primaryBtn}>
                {loading ? '🔬 Researching...' : '🔬 Research New'}
              </button>
              <button onClick={() => researchProspects(true)} disabled={loading} style={{ ...styles.primaryBtn, background: '#8B5CF6' }}>
                {loading ? '🔬 Researching...' : '🔄 Re-Research All'}
              </button>
            </div>
          )}

          {/* Sort Controls */}
          <div style={styles.sortGroup}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
              <option value="score">Score</option>
              <option value="name">Name</option>
              <option value="city">City</option>
              <option value="industry">Industry</option>
              <option value="rating">Rating</option>
              <option value="generatedAt">Generated Date</option>
              <option value="deployedAt">Deployed Date</option>
              <option value="variants">Variant Count</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              style={styles.sortDirBtn}
            >
              {sortDir === 'desc' ? '↓ High to Low' : '↑ Low to High'}
            </button>
          </div>

          {/* Filters */}
          <div style={styles.filterGroup}>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Industries</option>
              {availableIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All CRM Statuses</option>
              {crmStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filterGenerated}
              onChange={(e) => setFilterGenerated(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Generation: All</option>
              <option value="true">✅ Generated</option>
              <option value="false">⏳ Not Generated</option>
            </select>

            <select
              value={filterDeployed}
              onChange={(e) => setFilterDeployed(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Deployment: All</option>
              <option value="true">🚀 Deployed</option>
              <option value="false">📦 Not Deployed</option>
            </select>

            {(filterCity || filterIndustry || filterStatus || filterGenerated || filterDeployed) && (
              <button
                onClick={() => { setFilterCity(''); setFilterIndustry(''); setFilterStatus(''); setFilterGenerated(''); setFilterDeployed(''); }}
                style={styles.clearBtn}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('list')}
              style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
            >
              ☰ List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
            >
              ▦ Grid
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div style={styles.leaderboardContainer}>
            {leaderboard.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>
                No prospects found. Run a search with "Enrich with Yelp" enabled or click "Research Unscored".
              </p>
            ) : (
              leaderboard.map((p, index) => (
                <div key={p.id} style={styles.leaderboardCard}>
                  <div style={styles.leaderboardRank}>#{index + 1}</div>
                  <div style={styles.leaderboardInfo}>
                    <div style={styles.leaderboardName}>{p.name}</div>
                    <div style={styles.leaderboardMeta}>
                      <span style={{ ...styles.crmBadge, background: CRM_STATUS_COLORS[p.status] || '#6B7280' }}>
                        {p.status}
                      </span>
                      <span style={styles.industryBadge}>{p.industry}</span>
                      {p.city && <span style={styles.cityBadge}>📍 {p.city}</span>}
                      {p.rating && <span>⭐ {p.rating}</span>}
                      {p.reviewCount > 0 && <span>({p.reviewCount} reviews)</span>}
                      {p.priceLevel && <span>{p.priceLevel}</span>}
                    </div>
                    {/* Generation/Deployment Status Row */}
                    <div style={styles.statusRow}>
                      {p.generated ? (
                        <span style={styles.generatedBadge}>
                          ✅ Generated {p.generatedAt && `(${new Date(p.generatedAt).toLocaleDateString()})`}
                        </span>
                      ) : (
                        <span style={styles.notGeneratedBadge}>⏳ Not Generated</span>
                      )}
                      {p.deployed ? (
                        <span style={styles.deployedBadge}>
                          🚀 Deployed
                        </span>
                      ) : p.generated ? (
                        <span style={styles.notDeployedBadge}>📦 Not Deployed</span>
                      ) : null}
                      {p.variantCount > 0 && (
                        <span style={styles.variantBadge}>
                          📁 {p.variantCount} variant{p.variantCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {/* Deployed URLs */}
                    {p.deployed && p.deployedUrl && (
                      <div style={styles.urlRow}>
                        <a href={p.deployedUrl} target="_blank" rel="noopener noreferrer" style={styles.deployedLink}>
                          🌐 {p.deployedUrl}
                        </a>
                        {p.adminUrl && (
                          <a href={p.adminUrl} target="_blank" rel="noopener noreferrer" style={styles.adminLink}>
                            ⚙️ Admin
                          </a>
                        )}
                        {p.backendUrl && (
                          <a href={`${p.backendUrl}/health`} target="_blank" rel="noopener noreferrer" style={styles.apiLink}>
                            📡 API
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={styles.leaderboardScore}>
                    <div
                      style={{ ...styles.scoreNumber, cursor: 'pointer' }}
                      onClick={() => setExpandedBreakdown(expandedBreakdown === p.id ? null : p.id)}
                      title="Click to see breakdown"
                    >
                      {p.score || 0}
                    </div>
                    <div style={styles.scoreLabel}>Score</div>
                    <div style={styles.scoreBar}>
                      <div style={{
                        ...styles.scoreBarFill,
                        width: `${p.score || 0}%`,
                        background: p.score >= 70 ? '#22C55E' : p.score >= 50 ? '#F59E0B' : '#EF4444'
                      }}></div>
                    </div>
                  </div>
                  <div style={styles.leaderboardActions}>
                    <button
                      onClick={() => setExpandedBreakdown(expandedBreakdown === p.id ? null : p.id)}
                      style={styles.smallBtn}
                      title="Show score breakdown"
                    >
                      📊
                    </button>
                    <button onClick={() => generateEmailDraft(p.id)} style={styles.smallBtn}>
                      ✉️
                    </button>
                    {/* Generate Test Button */}
                    <button
                      onClick={() => openGenerateModal(p.id)}
                      style={{ ...styles.smallBtn, background: '#8B5CF6', color: '#fff' }}
                      title="Generate test site"
                    >
                      🧪
                    </button>
                    {p.generated && !p.deployed && (
                      <button
                        onClick={() => window.open(`/api/scout/prospects/${p.id}/deploy`, '_blank')}
                        style={{ ...styles.smallBtn, background: '#22C55E', color: '#fff' }}
                        title="Deploy this site"
                      >
                        🚀
                      </button>
                    )}
                  </div>

                  {/* Score Breakdown (expandable) */}
                  {expandedBreakdown === p.id && p.scoreBreakdown && (
                    <div style={styles.breakdownPanel}>
                      <div style={styles.breakdownTitle}>Score Breakdown for {p.name}</div>
                      <div style={styles.breakdownList}>
                        {p.scoreBreakdown.map((item, i) => (
                          <div key={i} style={styles.breakdownItem}>
                            <span style={styles.breakdownSource}>{item.source}</span>
                            <span style={styles.breakdownFactor}>{item.factor}</span>
                            <span style={{
                              ...styles.breakdownPoints,
                              color: item.points >= 0 ? '#22C55E' : '#EF4444'
                            }}>
                              {item.points >= 0 ? '+' : ''}{item.points}
                            </span>
                          </div>
                        ))}
                        <div style={styles.breakdownTotal}>
                          <span>Total Score</span>
                          <span style={{ fontWeight: '700' }}>{p.score}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div style={styles.gridContainer}>
            {leaderboard.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px', gridColumn: '1 / -1' }}>
                No prospects found. Run a search with "Enrich with Yelp" enabled or click "Research Unscored".
              </p>
            ) : (
              leaderboard.map((p, index) => (
                <div key={p.id} style={styles.gridCard}>
                  {/* Score Badge */}
                  <div style={{
                    ...styles.gridScoreBadge,
                    background: p.score >= 70 ? '#22C55E' : p.score >= 50 ? '#F59E0B' : '#EF4444'
                  }}>
                    {p.score || 0}
                  </div>

                  {/* Deployment Badge (top right) */}
                  {p.deployed && (
                    <div style={styles.gridDeployedBadge}>🚀</div>
                  )}
                  {p.generated && !p.deployed && (
                    <div style={styles.gridGeneratedBadge}>✅</div>
                  )}

                  {/* Rank */}
                  <div style={styles.gridRank}>#{index + 1}</div>

                  {/* Name */}
                  <h3 style={styles.gridName}>{p.name}</h3>

                  {/* Industry & City */}
                  <div style={styles.gridLocation}>
                    <span style={styles.industryBadge}>{p.industry}</span>
                    {p.city && <span style={styles.cityBadge}>📍 {p.city}</span>}
                  </div>

                  {/* Rating & Reviews */}
                  <div style={styles.gridRating}>
                    {p.rating ? (
                      <>
                        <span style={styles.gridStars}>{'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}</span>
                        <span style={styles.gridRatingNum}>{p.rating}</span>
                        {p.reviewCount > 0 && <span style={styles.gridReviews}>({p.reviewCount})</span>}
                      </>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>No rating</span>
                    )}
                  </div>

                  {/* Price Level */}
                  {p.priceLevel && (
                    <div style={styles.gridPrice}>{p.priceLevel}</div>
                  )}

                  {/* Status */}
                  <div style={{
                    ...styles.gridStatus,
                    background: CRM_STATUS_COLORS[p.status] || '#6B7280'
                  }}>
                    {p.status}
                  </div>

                  {/* Generation/Deployment Info */}
                  <div style={styles.gridGenStatus}>
                    {p.deployed ? (
                      <a href={p.deployedUrl} target="_blank" rel="noopener noreferrer" style={styles.gridDeployedLink}>
                        🌐 Live Site
                      </a>
                    ) : p.generated ? (
                      <span style={styles.gridGenLabel}>✅ Ready to deploy</span>
                    ) : (
                      <span style={styles.gridNotGenLabel}>⏳ Not generated</span>
                    )}
                    {p.variantCount > 0 && (
                      <span style={styles.gridVariantLabel}>📁 {p.variantCount}</span>
                    )}
                  </div>

                  {/* Score Breakdown (mini) */}
                  {p.scoreBreakdown && (
                    <div style={styles.gridBreakdown}>
                      {p.scoreBreakdown.slice(0, 4).map((item, i) => (
                        <div key={i} style={styles.gridBreakdownItem}>
                          <span style={{
                            color: item.points >= 0 ? '#22C55E' : '#EF4444',
                            fontWeight: '600'
                          }}>
                            {item.points >= 0 ? '+' : ''}{item.points}
                          </span>
                          <span style={{ fontSize: '10px', color: '#6B7280' }}>{item.factor.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.gridActions}>
                    <button onClick={() => generateEmailDraft(p.id)} style={styles.gridBtn}>
                      ✉️ Email
                    </button>
                    <button
                      onClick={() => setExpandedBreakdown(expandedBreakdown === p.id ? null : p.id)}
                      style={styles.gridBtn}
                    >
                      📊 Details
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {expandedBreakdown === p.id && p.scoreBreakdown && (
                    <div style={styles.gridBreakdownFull}>
                      {p.scoreBreakdown.map((item, i) => (
                        <div key={i} style={styles.gridBreakdownRow}>
                          <span style={styles.breakdownSource}>{item.source}</span>
                          <span style={{ flex: 1, fontSize: '11px' }}>{item.factor}</span>
                          <span style={{ color: item.points >= 0 ? '#22C55E' : '#EF4444', fontWeight: '600' }}>
                            {item.points >= 0 ? '+' : ''}{item.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Generate Test Modal */}
        {showGenerateModal && (
          <div style={styles.modalOverlay} onClick={() => { setShowGenerateModal(null); setPreviewInputs(null); setUnifiedProgress(null); }}>
            <div style={{ ...styles.generateModal, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>🧪 Generate Test Site</h3>
              <p style={styles.modalSubtitle}>
                {leaderboard.find(p => p.id === showGenerateModal)?.name || 'Prospect'}
              </p>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
                <button
                  onClick={() => setGenerateMode('unified')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: generateMode === 'unified' ? 'none' : '1px solid #E5E7EB',
                    background: generateMode === 'unified' ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : '#F9FAFB',
                    color: generateMode === 'unified' ? '#fff' : '#6B7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🚀 Unified (Recommended)
                </button>
                <button
                  onClick={() => setGenerateMode('level')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: generateMode === 'level' ? 'none' : '1px solid #E5E7EB',
                    background: generateMode === 'level' ? '#374151' : '#F9FAFB',
                    color: generateMode === 'level' ? '#fff' : '#6B7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  📊 Level Comparison
                </button>
              </div>

              {/* UNIFIED MODE */}
              {generateMode === 'unified' && (
                <div>
                  {/* Progress Display */}
                  {unifiedProgress && (
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#5B21B6', fontWeight: '600' }}>{unifiedProgress.status}</span>
                        <span style={{ color: '#7C3AED', fontWeight: '700' }}>{unifiedProgress.progress}%</span>
                      </div>
                      <div style={{ background: '#E5E7EB', borderRadius: '6px', height: '10px' }}>
                        <div style={{
                          background: 'linear-gradient(90deg, #8B5CF6, #6366F1)',
                          borderRadius: '6px',
                          height: '100%',
                          width: `${unifiedProgress.progress}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Input Level Selection */}
                  <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <label style={{ color: '#111827', fontSize: '14px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                      🎯 Input Level <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '400' }}>(hover to preview)</span>
                    </label>
                    <p style={{ color: '#6B7280', fontSize: '12px', margin: '0 0 12px 0' }}>
                      How much does AI auto-configure based on research data?
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: 'minimal', icon: '🟢', name: 'Minimal', desc: 'AI picks everything automatically' },
                        { id: 'moderate', icon: '🟡', name: 'Moderate', desc: 'Smart defaults, you choose tier' },
                        { id: 'extreme', icon: '🔴', name: 'Extreme', desc: 'All options with mood sliders' }
                      ].map(level => (
                        <button
                          key={level.id}
                          onClick={() => setUnifiedConfig(c => ({ ...c, inputLevel: level.id }))}
                          onMouseEnter={() => setHoveredLevel(level.id)}
                          onMouseLeave={() => setHoveredLevel(null)}
                          style={{
                            flex: 1,
                            padding: '14px 10px',
                            borderRadius: '10px',
                            border: unifiedConfig.inputLevel === level.id ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                            background: unifiedConfig.inputLevel === level.id ? 'rgba(139, 92, 246, 0.1)' : '#F9FAFB',
                            color: '#111827',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{level.icon}</div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>{level.name}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>{level.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Hover Preview Tooltip */}
                    {hoveredLevel && showGenerateModal && (() => {
                      const preview = getInputPreview(showGenerateModal, hoveredLevel);
                      if (!preview) return null;
                      return (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '8px',
                          background: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                          zIndex: 100
                        }}>
                          <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px', marginBottom: '8px' }}>
                            {preview.title}
                          </div>
                          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '12px' }}>
                            {preview.description}
                          </div>

                          {/* Mode Indicators */}
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ flex: 1, padding: '8px', background: '#F0FDF4', borderRadius: '6px', fontSize: '10px', color: '#166534' }}>
                              <strong>🧪 TEST:</strong> {preview.isTestMode}
                            </div>
                            <div style={{ flex: 1, padding: '8px', background: '#FEF3C7', borderRadius: '6px', fontSize: '10px', color: '#92400E' }}>
                              <strong>🤖 REAL:</strong> {preview.isRealMode}
                            </div>
                          </div>

                          {/* Fields Preview */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {preview.fields.map((field, i) => (
                              <div key={i} style={{
                                padding: '8px 10px',
                                background: '#F9FAFB',
                                borderRadius: '6px',
                                fontSize: '11px'
                              }}>
                                <div style={{ color: '#6B7280', fontWeight: '600', marginBottom: '2px' }}>{field.label}</div>
                                <div style={{ color: '#111827', fontWeight: '500' }}>{field.value}</div>
                                {field.note && <div style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '2px' }}>{field.note}</div>}
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '10px', padding: '8px', background: '#EEF2FF', borderRadius: '6px', fontSize: '10px', color: '#4338CA' }}>
                            💡 <strong>Note:</strong> These are guidelines, not constraints. In real AI mode, the system has creative freedom to adjust based on context.
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tier Selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: '#111827', fontSize: '14px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
                      📦 Page Tier
                    </label>
                    <p style={{ color: '#6B7280', fontSize: '12px', margin: '0 0 12px 0' }}>
                      How many pages to generate?
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: 'standard', name: 'Standard', desc: '5-7 essential pages' },
                        { id: 'premium', name: '⭐ Premium', desc: '10-15 pages with extras' }
                      ].map(tier => (
                        <button
                          key={tier.id}
                          onClick={() => setUnifiedConfig(c => ({ ...c, tier: tier.id }))}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '10px',
                            border: unifiedConfig.tier === tier.id ? '2px solid #10B981' : '1px solid #E5E7EB',
                            background: unifiedConfig.tier === tier.id ? 'rgba(16, 185, 129, 0.1)' : '#F9FAFB',
                            color: '#111827',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{tier.name}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>{tier.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Variants Toggle */}
                  <div style={{
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={unifiedConfig.enableVariants}
                        onChange={(e) => setUnifiedConfig(c => ({ ...c, enableVariants: e.target.checked }))}
                        style={{ width: '20px', height: '20px', marginTop: '2px' }}
                      />
                      <div>
                        <span style={{ color: '#111827', fontWeight: '600', fontSize: '14px' }}>
                          🎨 Generate Multiple Style Variants
                        </span>
                        <p style={{ color: '#6B7280', fontSize: '11px', margin: '4px 0 0 0' }}>
                          Create different versions for A/B testing (presets × layouts)
                        </p>
                      </div>
                    </label>

                    {unifiedConfig.enableVariants && (
                      <div style={{ marginTop: '16px', paddingLeft: '32px' }}>
                        {/* Presets */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ color: '#111827', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Style Presets</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[
                              { id: 'luxury', label: '✨ Luxury' },
                              { id: 'friendly', label: '😊 Friendly' },
                              { id: 'bold', label: '💪 Bold' },
                              { id: 'minimal', label: '🎯 Minimal' },
                              { id: 'warm', label: '🌅 Warm' },
                              { id: 'corporate', label: '🏢 Corporate' }
                            ].map(preset => (
                              <button
                                key={preset.id}
                                onClick={() => {
                                  setUnifiedConfig(c => ({
                                    ...c,
                                    selectedPresets: c.selectedPresets.includes(preset.id)
                                      ? c.selectedPresets.filter(p => p !== preset.id)
                                      : [...c.selectedPresets, preset.id]
                                  }));
                                }}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '8px',
                                  border: unifiedConfig.selectedPresets.includes(preset.id) ? '2px solid #8B5CF6' : '1px solid #D1D5DB',
                                  background: unifiedConfig.selectedPresets.includes(preset.id) ? '#8B5CF6' : '#fff',
                                  color: unifiedConfig.selectedPresets.includes(preset.id) ? '#fff' : '#374151',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Industry Layouts */}
                        <div>
                          <div style={{ color: '#111827', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Page Layouts (Industry-Specific)</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {getUnifiedLayouts(showGenerateModal).map(layout => (
                              <button
                                key={layout.id}
                                onClick={() => {
                                  setUnifiedConfig(c => ({
                                    ...c,
                                    selectedLayouts: c.selectedLayouts.includes(layout.id)
                                      ? c.selectedLayouts.filter(l => l !== layout.id)
                                      : [...c.selectedLayouts, layout.id]
                                  }));
                                }}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: unifiedConfig.selectedLayouts.includes(layout.id) ? '2px solid #10B981' : '1px solid #D1D5DB',
                                  background: unifiedConfig.selectedLayouts.includes(layout.id) ? 'rgba(16, 185, 129, 0.1)' : '#fff',
                                  color: '#111827',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px'
                                }}
                              >
                                <span style={{ fontSize: '18px' }}>{layout.icon}</span>
                                <div>
                                  <div style={{ fontWeight: '600' }}>{layout.name}</div>
                                  <div style={{ color: '#6B7280', fontSize: '11px' }}>{layout.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Variant Count */}
                        <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', color: '#5B21B6', fontSize: '13px', fontWeight: '600' }}>
                          📊 {unifiedConfig.selectedPresets.length} presets × {unifiedConfig.selectedLayouts.length} layouts = <strong>{unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length} variants</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extras */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: '#111827', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                      ⚡ Extra Features
                    </label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer', fontSize: '13px', color: '#374151'
                      }}>
                        <input
                          type="checkbox"
                          checked={unifiedConfig.generateVideo}
                          onChange={(e) => setUnifiedConfig(c => ({ ...c, generateVideo: e.target.checked }))}
                        />
                        🎬 Video
                        <span style={{ color: '#9CA3AF', fontSize: '10px' }}>Promo assets</span>
                      </label>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer', fontSize: '13px', color: '#374151'
                      }}>
                        <input
                          type="checkbox"
                          checked={unifiedConfig.generateLogo}
                          onChange={(e) => setUnifiedConfig(c => ({ ...c, generateLogo: e.target.checked }))}
                        />
                        🎨 Logo
                        <span style={{ color: '#9CA3AF', fontSize: '10px' }}>SVG variants</span>
                      </label>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer', fontSize: '13px', color: '#374151'
                      }}>
                        <input
                          type="checkbox"
                          checked={unifiedConfig.enablePortal}
                          onChange={(e) => setUnifiedConfig(c => ({ ...c, enablePortal: e.target.checked }))}
                        />
                        🔐 Portal
                        <span style={{ color: '#9CA3AF', fontSize: '10px' }}>Login/Dashboard</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => generateUnified(showGenerateModal)}
                    disabled={unifiedGenerating}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: unifiedGenerating ? 'rgba(139, 92, 246, 0.5)' : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: unifiedGenerating ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    {unifiedGenerating ? (
                      <>⏳ Generating...</>
                    ) : (
                      <>🚀 Generate {unifiedConfig.enableVariants ? `${unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length} Variants` : 'Full-Stack Site'}</>
                    )}
                  </button>
                </div>
              )}

              {/* LEVEL COMPARISON MODE (Original) */}
              {generateMode === 'level' && (
                <div>
                  {/* Input Level Selection */}
                  <div style={styles.levelGrid}>
                    {/* Minimal */}
                    <div
                      style={styles.levelCard}
                      onClick={() => !generatingLevel && generateWithLevel(showGenerateModal, 'minimal')}
                    >
                      <div style={styles.levelIcon}>🟢</div>
                      <div style={styles.levelName}>Minimal</div>
                      <div style={styles.levelDesc}>Auto everything. System picks all options.</div>
                      {generatingLevel === 'minimal' && <div style={styles.levelLoading}>Generating...</div>}
                    </div>

                    {/* Moderate */}
                    <div
                      style={styles.levelCard}
                      onClick={() => !generatingLevel && generateWithLevel(showGenerateModal, 'moderate')}
                    >
                      <div style={styles.levelIcon}>🟡</div>
                      <div style={styles.levelName}>Moderate</div>
                      <div style={styles.levelDesc}>Preset + theme + tier based on research.</div>
                      {generatingLevel === 'moderate' && <div style={styles.levelLoading}>Generating...</div>}
                    </div>

                    {/* Extreme */}
                    <div
                      style={styles.levelCard}
                      onClick={() => !generatingLevel && generateWithLevel(showGenerateModal, 'extreme')}
                    >
                      <div style={styles.levelIcon}>🔴</div>
                      <div style={styles.levelName}>Extreme</div>
                      <div style={styles.levelDesc}>Full customization. Mood sliders, colors, all pages.</div>
                      {generatingLevel === 'extreme' && <div style={styles.levelLoading}>Generating...</div>}
                    </div>
                  </div>

                  {/* Generate All Button */}
                  <button
                    onClick={() => !generatingLevel && generateAllLevels(showGenerateModal)}
                    disabled={generatingLevel}
                    style={styles.generateAllBtn}
                  >
                    {generatingLevel === 'all' ? '⏳ Generating All 3...' : '🎯 Generate ALL 3 for Comparison'}
                  </button>

                  {/* Preview Section */}
                  {previewInputs && previewInputs.inputs && (
                    <div style={styles.previewSection}>
                      <h4>Auto-Generated Config Preview</h4>
                      <div style={styles.previewGrid}>
                        {['minimal', 'moderate', 'extreme'].map(level => (
                          <div key={level} style={styles.previewCard}>
                            <div style={styles.previewLevel}>{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                            <div style={styles.previewItem}>
                              <span>Preset:</span> {previewInputs.inputs[level]?.preset || previewInputs.inputs[level]?._resolved?.preset || 'auto'}
                            </div>
                            <div style={styles.previewItem}>
                              <span>Theme:</span> {previewInputs.inputs[level]?.theme || previewInputs.inputs[level]?._resolved?.theme || 'auto'}
                            </div>
                            <div style={styles.previewItem}>
                              <span>Pages:</span> {(previewInputs.inputs[level]?.pages || previewInputs.inputs[level]?._resolved?.pages || []).length}
                            </div>
                            {previewInputs.inputs[level]?.archetype && (
                              <div style={styles.previewItem}>
                                <span>Archetype:</span> {previewInputs.inputs[level]?.archetype}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => { setShowGenerateModal(null); setPreviewInputs(null); setUnifiedProgress(null); }}
                style={styles.closeBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Email Draft Modal */}
        {showEmailModal && emailDraft && (
          <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <h3>📧 Email Draft</h3>
              <div style={styles.emailField}>
                <label>Subject:</label>
                <input value={emailDraft.subject} readOnly style={styles.emailInput} />
              </div>
              <div style={styles.emailField}>
                <label>Body:</label>
                <textarea value={emailDraft.body} readOnly style={styles.emailTextarea} />
              </div>
              <div style={styles.modalActions}>
                <button onClick={() => navigator.clipboard.writeText(emailDraft.body)} style={styles.primaryBtn}>
                  📋 Copy to Clipboard
                </button>
                <button onClick={() => setShowEmailModal(false)} style={styles.secondaryBtn}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Industry Test Suite Tab
  if (activeTab === 'industry-tests') {
    // Function to run industry test suite
    const runIndustryTestSuite = async () => {
      setIndustryTestRunning(true);
      setIndustryTestProgress({ step: 'init', status: 'Starting...', progress: 0 });
      setIndustryTestResults(null);

      try {
        const response = await fetch('/api/scout/industry-test-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skipBuild: false,
            preset: null, // Use smart pairing
            layoutIndex: 0
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.step === 'complete') {
              setIndustryTestResults(data);
              setIndustryTestRunning(false);
            } else if (data.step === 'error') {
              setError(data.error);
              setIndustryTestRunning(false);
            } else {
              setIndustryTestProgress(data);
            }
          }
        }
      } catch (err) {
        setError(err.message);
        setIndustryTestRunning(false);
      }
    };

    // Function to fetch test status
    const fetchTestStatus = async () => {
      try {
        const res = await fetch('/api/scout/industry-test-suite/status');
        const data = await res.json();
        setIndustryTestStatus(data.status || []);
      } catch (err) {
        console.error('Error fetching test status:', err);
      }
    };

    // Fetch status on tab load
    if (industryTestStatus.length === 0 && !industryTestRunning) {
      fetchTestStatus();
    }

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🧪 Industry Test Suite</h1>
            <p style={styles.subtitle}>Generate one variant for each industry to compare quality</p>
          </div>
          {renderTabs()}
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <button
            onClick={runIndustryTestSuite}
            disabled={industryTestRunning}
            style={{
              ...styles.primaryBtn,
              opacity: industryTestRunning ? 0.6 : 1,
              cursor: industryTestRunning ? 'not-allowed' : 'pointer'
            }}
          >
            {industryTestRunning ? '🔄 Running...' : '🚀 Run Full Test Suite'}
          </button>
          <button onClick={fetchTestStatus} style={styles.secondaryBtn}>
            🔄 Refresh Status
          </button>
          <button
            onClick={() => window.open('/api/scout/industry-test-suite/viewer', '_blank')}
            style={{ ...styles.primaryBtn, background: '#8B5CF6' }}
          >
            🖼️ Open Viewer
          </button>
          <button
            onClick={async () => {
              if (!confirm('Rebuild all existing industry tests? This will fix preview support.')) return;
              setIndustryTestRunning(true);
              setIndustryTestProgress({ step: 'init', status: 'Starting rebuild...', progress: 0 });
              try {
                const response = await fetch('/api/scout/industry-test-suite/rebuild', { method: 'POST' });
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  const text = decoder.decode(value);
                  const lines = text.split('\n').filter(line => line.startsWith('data: '));
                  for (const line of lines) {
                    const data = JSON.parse(line.replace('data: ', ''));
                    if (data.step === 'complete') {
                      setIndustryTestRunning(false);
                      alert(`Rebuild complete! ${data.rebuilt} rebuilt, ${data.failed} failed.`);
                      window.open(data.viewerUrl, '_blank');
                    } else if (data.step === 'error') {
                      setIndustryTestRunning(false);
                      alert('Error: ' + data.error);
                    } else {
                      setIndustryTestProgress(data);
                    }
                  }
                }
              } catch (err) {
                setIndustryTestRunning(false);
                alert('Error: ' + err.message);
              }
            }}
            disabled={industryTestRunning}
            style={{ ...styles.secondaryBtn, opacity: industryTestRunning ? 0.6 : 1 }}
          >
            🔧 Rebuild All
          </button>
          {industryTestResults && (
            <span style={{ color: '#22C55E' }}>
              ✅ {industryTestResults.summary?.successCount || 0} / {industryTestResults.summary?.totalIndustries || 0} industries generated
            </span>
          )}
        </div>

        {/* Progress */}
        {industryTestRunning && industryTestProgress && (
          <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>{industryTestProgress.status}</span>
              <span>{industryTestProgress.current || 0} / {industryTestProgress.total || 0}</span>
            </div>
            <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${industryTestProgress.progress || 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Results Summary */}
        {industryTestResults && (
          <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📊 Test Results</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22C55E' }}>
                  {industryTestResults.summary?.successCount || 0}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Successful</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>
                  {industryTestResults.summary?.failedCount || 0}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Failed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>
                  {industryTestResults.metrics?.totalPages || 0}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Total Pages</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B5CF6' }}>
                  {(industryTestResults.metrics?.totalLinesOfCode || 0).toLocaleString()}
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Lines of Code</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>
                  {((industryTestResults.metrics?.totalTime || 0) / 1000).toFixed(1)}s
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Total Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Status Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {(industryTestResults?.results?.success || industryTestStatus || []).map((item, i) => (
            <div
              key={item.industry || i}
              style={{
                background: '#1E293B',
                padding: '16px',
                borderRadius: '12px',
                border: item.generated !== false ? '1px solid #22C55E' : '1px solid #334155'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.industry}</div>
                </div>
                {item.generated !== false && (
                  <span style={{ marginLeft: 'auto', color: '#22C55E' }}>✓</span>
                )}
              </div>
              {item.metrics && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Pages: </span>
                    <span>{item.metrics.pageCount}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>LOC: </span>
                    <span>{item.metrics.linesOfCode?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Time: </span>
                    <span>{(item.metrics.generationTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Preset: </span>
                    <span>{item.preset}</span>
                  </div>
                </div>
              )}
              {item.preset && !item.metrics && (
                <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  Preset: {item.preset} | Layout: {item.layout}
                </div>
              )}
              {item.path && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`/output/prospects/${item.folder || `industry-test-${item.industry}`}/${item.variant || 'full-test-' + item.preset + '-' + item.layout}/frontend/dist/index.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3B82F6', fontSize: '0.875rem' }}
                  >
                    📂 Open Preview
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Failed Industries */}
        {industryTestResults?.results?.failed?.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#EF4444' }}>❌ Failed Industries</h3>
            {industryTestResults.results.failed.map((item, i) => (
              <div key={i} style={{ background: '#1E293B', padding: '12px', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #EF4444' }}>
                <div style={{ fontWeight: '600' }}>{item.icon} {item.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#EF4444', marginTop: '4px' }}>
                  {item.errors?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Design Research Tab
  if (activeTab === 'design-research') {
    // Function to fetch design research data from fixtures
    const fetchDesignResearch = async () => {
      try {
        const res = await fetch('/api/scout/design-research');
        const data = await res.json();
        setDesignResearchData(data.industries || []);
      } catch (err) {
        console.error('Error fetching design research:', err);
        // Fallback: show the industries we know about with placeholder data
        setDesignResearchData([
          { id: 'coffee-cafe', name: 'Coffee Shop / Cafe', icon: '☕' },
          { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
          { id: 'bakery', name: 'Bakery', icon: '🥐' },
          { id: 'pizza-restaurant', name: 'Pizza Restaurant', icon: '🍕' },
          { id: 'salon-spa', name: 'Salon / Spa', icon: '💇' },
          { id: 'barbershop', name: 'Barbershop', icon: '💈' },
          { id: 'fitness-gym', name: 'Fitness / Gym', icon: '🏋️' },
          { id: 'yoga', name: 'Yoga Studio', icon: '🧘' },
          { id: 'dental', name: 'Dental Practice', icon: '🦷' },
          { id: 'healthcare', name: 'Healthcare / Medical', icon: '🏥' },
          { id: 'plumber', name: 'Plumber', icon: '🔧' },
          { id: 'cleaning', name: 'Cleaning Service', icon: '🧹' },
          { id: 'auto-shop', name: 'Auto Shop', icon: '🚗' },
          { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
          { id: 'law-firm', name: 'Law Firm', icon: '⚖️' },
          { id: 'ecommerce', name: 'E-commerce / Retail', icon: '🛍️' },
          { id: 'saas', name: 'SaaS / Software', icon: '💻' },
          { id: 'school', name: 'School / Academy', icon: '🏫' },
          { id: 'steakhouse', name: 'Steakhouse', icon: '🥩' }
        ]);
      }
    };

    // Fetch design research on tab load
    if (designResearchData.length === 0) {
      fetchDesignResearch();
    }

    // Function to generate site with selected layout variant using industry test suite
    const generateWithResearch = async (industry, layoutVariant) => {
      setGeneratingFromResearch(true);
      setBatchProgress({ current: 0, total: 1, status: `Generating ${industry.name} Layout ${layoutVariant}...`, results: [] });

      try {
        const response = await fetch('/api/scout/industry-test-suite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industries: [industry.id],
            layoutVariant: layoutVariant,
            namePrefix: 'research-'
          })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.step === 'complete') {
              result = data;
            } else if (data.step === 'generating') {
              setBatchProgress(prev => ({ ...prev, status: data.status }));
            }
          }
        }

        if (result?.success?.length > 0) {
          const generated = result.success[0];
          const previewUrl = `/output/prospects/${generated.folder}/${generated.variant}/frontend/dist/index.html`;
          setBatchProgress({ current: 1, total: 1, status: 'Complete!', results: [{ ...generated, previewUrl, success: true }] });
          window.open(previewUrl, '_blank');
        } else {
          alert('Generation failed');
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setGeneratingFromResearch(false);
      }
    };

    // Generate all layouts (A, B, C) for a single industry
    const generateAllLayoutsForIndustry = async (industry) => {
      setBatchGenerating(true);
      const layouts = ['A', 'B', 'C'];
      const allResults = [];
      setBatchProgress({ current: 0, total: layouts.length, status: `Generating ${industry.name}...`, results: [] });

      for (let i = 0; i < layouts.length; i++) {
        const layout = layouts[i];
        setBatchProgress(prev => ({ ...prev, current: i + 1, status: `Generating ${industry.name} - Layout ${layout}...` }));

        try {
          const response = await fetch('/api/scout/industry-test-suite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industries: [industry.id],
              layoutVariant: layout,
              namePrefix: 'research-'
            })
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let result = null;

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const text = decoder.decode(value);
            const lines = text.split('\n').filter(line => line.startsWith('data: '));
            for (const line of lines) {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.step === 'complete') result = data;
            }
          }

          if (result?.success?.length > 0) {
            const generated = result.success[0];
            allResults.push({
              industry: industry.id,
              name: industry.name,
              layout,
              success: true,
              previewUrl: `/output/prospects/${generated.folder}/${generated.variant}/frontend/dist/index.html`
            });
          } else {
            allResults.push({ industry: industry.id, layout, success: false });
          }
        } catch (err) {
          allResults.push({ industry: industry.id, layout, success: false, error: err.message });
        }
      }

      setBatchProgress(prev => ({ ...prev, status: 'Complete!', results: allResults }));
      setBatchGenerating(false);
    };

    // Helper to run industry test suite with streaming
    const runLayoutBatch = async (industryIds, layoutVariant, onProgress) => {
      const response = await fetch('/api/scout/industry-test-suite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industries: industryIds,
          layoutVariant: layoutVariant
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(line => line.startsWith('data: '));
        for (const line of lines) {
          const data = JSON.parse(line.replace('data: ', ''));
          if (data.step === 'complete') result = data;
          else if (onProgress) onProgress(data);
        }
      }
      return result;
    };

    // Generate for selected industries (all layouts)
    const generateForSelectedIndustries = async () => {
      if (selectedIndustriesForBatch.size === 0) {
        alert('Please select at least one industry');
        return;
      }
      setBatchGenerating(true);
      const industryIds = Array.from(selectedIndustriesForBatch);
      const layouts = ['A', 'B', 'C'];
      const total = industryIds.length * layouts.length;
      const allResults = [];
      setBatchProgress({ current: 0, total, status: 'Starting batch...', results: [] });

      for (const layout of layouts) {
        setBatchProgress(prev => ({ ...prev, status: `Layout ${layout}...` }));
        const result = await runLayoutBatch(industryIds, layout, (d) => {
          setBatchProgress(prev => ({ ...prev, status: d.status || `Layout ${layout}...` }));
        });
        if (result?.success) {
          for (const item of result.success) {
            allResults.push({
              industry: item.industry, name: item.name, layout, success: true,
              previewUrl: `/output/prospects/${item.folder}/${item.variant}/frontend/dist/index.html`
            });
          }
        }
        setBatchProgress(prev => ({ ...prev, current: allResults.length, results: allResults }));
      }
      setBatchProgress(prev => ({ ...prev, status: 'Complete!', results: allResults }));
      setBatchGenerating(false);
    };

    // Generate ALL industries with ALL layouts
    const generateAllIndustries = async () => {
      if (!confirm(`Generate ${designResearchData.length * 3} sites?`)) return;
      setBatchGenerating(true);
      const industryIds = designResearchData.map(i => i.id);
      const layouts = ['A', 'B', 'C'];
      const total = industryIds.length * layouts.length;
      const allResults = [];
      setBatchProgress({ current: 0, total, status: 'Starting...', results: [] });

      for (const layout of layouts) {
        setBatchProgress(prev => ({ ...prev, status: `Layout ${layout}...` }));
        const result = await runLayoutBatch(industryIds, layout, (d) => {
          setBatchProgress(prev => ({ ...prev, status: d.status || `Layout ${layout}...` }));
        });
        if (result?.success) {
          for (const item of result.success) {
            allResults.push({
              industry: item.industry, name: item.name, layout, success: true,
              previewUrl: `/output/prospects/${item.folder}/${item.variant}/frontend/dist/index.html`
            });
          }
        }
        setBatchProgress(prev => ({ ...prev, current: allResults.length, results: allResults }));
      }
      setBatchProgress(prev => ({ ...prev, status: 'Complete!', results: allResults }));
      setBatchGenerating(false);
    };

    // Toggle industry selection for batch
    const toggleIndustrySelection = (industryId) => {
      setSelectedIndustriesForBatch(prev => {
        const newSet = new Set(prev);
        if (newSet.has(industryId)) {
          newSet.delete(industryId);
        } else {
          newSet.add(industryId);
        }
        return newSet;
      });
    };

    // Select/deselect all industries
    const toggleSelectAll = () => {
      if (selectedIndustriesForBatch.size === designResearchData.length) {
        setSelectedIndustriesForBatch(new Set());
      } else {
        setSelectedIndustriesForBatch(new Set(designResearchData.map(i => i.id)));
      }
    };

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎨 Design Research</h1>
            <p style={styles.subtitle}>Industry-specific design patterns, winning elements, and layout variations</p>
          </div>
          {renderTabs()}
        </div>

        {/* Batch Generation Controls */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Batch Generation</h3>
            <button
              onClick={toggleSelectAll}
              style={{ ...styles.secondaryBtn, padding: '8px 16px' }}
              disabled={batchGenerating}
            >
              {selectedIndustriesForBatch.size === designResearchData.length ? '☐ Deselect All' : '☑ Select All'}
            </button>
            <button
              onClick={generateForSelectedIndustries}
              disabled={batchGenerating || selectedIndustriesForBatch.size === 0}
              style={{
                ...styles.primaryBtn,
                padding: '8px 16px',
                opacity: (batchGenerating || selectedIndustriesForBatch.size === 0) ? 0.6 : 1
              }}
            >
              🚀 Generate Selected ({selectedIndustriesForBatch.size} × 3 layouts)
            </button>
            <button
              onClick={generateAllIndustries}
              disabled={batchGenerating}
              style={{
                ...styles.primaryBtn,
                padding: '8px 16px',
                background: '#8B5CF6',
                opacity: batchGenerating ? 0.6 : 1
              }}
            >
              🌐 Generate ALL ({designResearchData.length} × 3 = {designResearchData.length * 3} sites)
            </button>
            {selectedResearchIndustry && (
              <button
                onClick={() => generateAllLayoutsForIndustry(selectedResearchIndustry)}
                disabled={batchGenerating}
                style={{
                  ...styles.primaryBtn,
                  padding: '8px 16px',
                  background: '#10B981',
                  opacity: batchGenerating ? 0.6 : 1
                }}
              >
                📦 All Layouts for {selectedResearchIndustry.name}
              </button>
            )}
          </div>
        </div>

        {/* Batch Progress */}
        {batchGenerating && (
          <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '24px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: '600' }}>{batchProgress.status}</span>
              <span>{batchProgress.current} / {batchProgress.total}</span>
            </div>
            <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Batch Results */}
        {!batchGenerating && batchProgress.results.length > 0 && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Batch Results</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#22C55E' }}>
                  ✅ {batchProgress.results.filter(r => r.success).length} successful
                </span>
                <span style={{ color: '#EF4444' }}>
                  ❌ {batchProgress.results.filter(r => !r.success).length} failed
                </span>
                <button
                  onClick={() => window.open('/api/scout/industry-test-suite/viewer', '_blank')}
                  style={{ ...styles.primaryBtn, padding: '8px 16px' }}
                >
                  🖼️ Open Viewer
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {batchProgress.results.map((result, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    background: result.success ? '#D1FAE5' : '#FEE2E2',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{result.name || result.industry}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Layout {result.layout}</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setBatchProgress({ current: 0, total: 0, status: '', results: [] })}
              style={{ ...styles.secondaryBtn, marginTop: '12px' }}
            >
              Clear Results
            </button>
          </div>
        )}

        {/* Info Banner */}
        <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', padding: '20px', borderRadius: '12px', marginBottom: '24px', color: '#fff' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Research-Driven Site Generation</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Each industry has 3 layout variants (A, B, C) based on competitor research. Select an industry to view reference websites, winning elements, and generate with specific layouts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedResearchIndustry ? '1fr 2fr' : '1fr', gap: '24px' }}>
          {/* Industry List */}
          <div>
            <h3 style={{ marginBottom: '16px' }}>Select Industry ({selectedIndustriesForBatch.size} selected for batch)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {designResearchData.map((industry) => (
                <div
                  key={industry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndustriesForBatch.has(industry.id)}
                    onChange={() => toggleIndustrySelection(industry.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <button
                    onClick={() => setSelectedResearchIndustry(industry)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                    background: selectedResearchIndustry?.id === industry.id ? '#3B82F6' : '#fff',
                    color: selectedResearchIndustry?.id === industry.id ? '#fff' : '#374151',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{industry.icon}</span>
                  <span style={{ fontWeight: '500' }}>{industry.name}</span>
                  {industry.designResearch && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>
                      {Object.keys(industry.designResearch.layoutVariations || {}).length} layouts
                    </span>
                  )}
                </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Industry Details */}
          {selectedResearchIndustry && (
            <div>
              {/* Industry Header */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '3rem' }}>{selectedResearchIndustry.icon}</span>
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedResearchIndustry.name}</h2>
                    <p style={{ margin: '4px 0 0', color: '#6B7280' }}>Industry ID: {selectedResearchIndustry.id}</p>
                  </div>
                </div>

                {/* Layout Variant Selector */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Layout Variations</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['A', 'B', 'C'].map((variant) => {
                      const layoutInfo = selectedResearchIndustry.designResearch?.layoutVariations?.[variant];
                      return (
                        <button
                          key={variant}
                          onClick={() => setSelectedLayoutVariant(variant)}
                          style={{
                            flex: 1,
                            padding: '16px',
                            background: selectedLayoutVariant === variant ? '#EEF2FF' : '#F9FAFB',
                            border: selectedLayoutVariant === variant ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Layout {variant}</div>
                          <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                            {layoutInfo?.name || `Variant ${variant}`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
                            {layoutInfo?.description || 'Standard layout pattern'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Menu Style Preview */}
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🍽️ Menu Page Style
                    <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#6B7280' }}>
                      (auto-selected based on industry + layout)
                    </span>
                  </h4>
                  {(() => {
                    // Map industry to menu style based on selected layout variant
                    const INDUSTRY_MENU_STYLES = {
                      'pizza-restaurant': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
                      'coffee-cafe': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
                      'restaurant': { A: 'elegant-list', B: 'storytelling-cards', C: 'elegant-list' },
                      'steakhouse': { A: 'elegant-list', B: 'elegant-list', C: 'compact-table' },
                      'bakery': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
                      'salon-spa': { A: 'photo-grid', B: 'compact-table', C: 'elegant-list' },
                      'fitness-gym': { A: 'photo-grid', B: 'compact-table', C: 'photo-grid' },
                      'dental': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
                      'healthcare': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
                      'yoga': { A: 'storytelling-cards', B: 'photo-grid', C: 'compact-table' },
                      'barbershop': { A: 'photo-grid', B: 'elegant-list', C: 'compact-table' },
                      'law-firm': { A: 'elegant-list', B: 'compact-table', C: 'elegant-list' },
                      'real-estate': { A: 'photo-grid', B: 'storytelling-cards', C: 'compact-table' },
                      'plumber': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
                      'cleaning': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
                      'auto-shop': { A: 'compact-table', B: 'photo-grid', C: 'compact-table' },
                      'saas': { A: 'photo-grid', B: 'compact-table', C: 'storytelling-cards' },
                      'ecommerce': { A: 'photo-grid', B: 'storytelling-cards', C: 'photo-grid' },
                      'school': { A: 'compact-table', B: 'photo-grid', C: 'storytelling-cards' }
                    };

                    const MENU_STYLE_INFO = {
                      'photo-grid': {
                        name: 'Photo Grid',
                        icon: '📸',
                        description: '3-column grid with large photos, floating cart',
                        bestFor: 'Pizza, bakery, coffee, QSR',
                        preview: [
                          ['🍕', '🥐', '☕'],
                          ['[img]', '[img]', '[img]'],
                          ['Name 9.99', 'Name 12.99', 'Name 8.99']
                        ]
                      },
                      'elegant-list': {
                        name: 'Elegant List',
                        icon: '✨',
                        description: 'Single-column with dotted leader lines',
                        bestFor: 'Steakhouse, fine dining, upscale',
                        preview: [
                          ['───── APPETIZERS ─────'],
                          ['Filet Mignon .......... 59'],
                          ['Lobster Thermidor ..... 72']
                        ]
                      },
                      'compact-table': {
                        name: 'Compact Table',
                        icon: '📋',
                        description: 'Dense table with accordion categories',
                        bestFor: 'Delis, diners, large menus 50+',
                        preview: [
                          ['| Item | Desc | Diet | Price |'],
                          ['| Caesar | Roma... | V GF | 12.99 |'],
                          ['| Cobb | Mixed... | GF | 15.99 |']
                        ]
                      },
                      'storytelling-cards': {
                        name: 'Storytelling Cards',
                        icon: '📖',
                        description: 'Large feature cards with origin stories',
                        bestFor: 'Farm-to-table, craft, artisan',
                        preview: [
                          ['┌────────────────────┐'],
                          ['│   [HERO IMAGE]     │'],
                          ['│ ★ Chef\'s Pick      │'],
                          ['│ Story + 17.99      │'],
                          ['└────────────────────┘']
                        ]
                      }
                    };

                    const industryId = selectedResearchIndustry.id;
                    const industryStyles = INDUSTRY_MENU_STYLES[industryId] || { A: 'photo-grid', B: 'photo-grid', C: 'photo-grid' };
                    const currentStyleId = industryStyles[selectedLayoutVariant] || 'photo-grid';
                    const currentStyle = MENU_STYLE_INFO[currentStyleId];

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {Object.entries(MENU_STYLE_INFO).map(([styleId, style]) => {
                          const isActive = styleId === currentStyleId;
                          const usedInVariants = Object.entries(industryStyles)
                            .filter(([_, v]) => v === styleId)
                            .map(([k]) => k)
                            .join(', ');

                          return (
                            <div
                              key={styleId}
                              style={{
                                padding: '16px',
                                background: isActive ? '#EEF2FF' : '#F9FAFB',
                                border: isActive ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                                borderRadius: '12px',
                                opacity: isActive ? 1 : 0.6
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{style.name}</span>
                                {isActive && (
                                  <span style={{
                                    marginLeft: 'auto',
                                    padding: '2px 8px',
                                    background: '#3B82F6',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: '600'
                                  }}>
                                    Active
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                                {style.description}
                              </p>
                              <div style={{
                                fontFamily: 'monospace',
                                fontSize: '9px',
                                background: '#fff',
                                padding: '8px',
                                borderRadius: '6px',
                                lineHeight: 1.3,
                                color: '#4B5563',
                                whiteSpace: 'pre',
                                overflow: 'hidden'
                              }}>
                                {style.preview.map((line, i) => (
                                  <div key={i}>{Array.isArray(line) ? line.join(' ') : line}</div>
                                ))}
                              </div>
                              {usedInVariants && (
                                <div style={{ marginTop: '8px', fontSize: '10px', color: '#9CA3AF' }}>
                                  Layout {usedInVariants}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => generateWithResearch(selectedResearchIndustry, selectedLayoutVariant)}
                  disabled={generatingFromResearch}
                  style={{
                    ...styles.primaryBtn,
                    width: '100%',
                    marginTop: '16px',
                    padding: '16px',
                    fontSize: '1rem',
                    opacity: generatingFromResearch ? 0.6 : 1
                  }}
                >
                  {generatingFromResearch ? '🔄 Generating...' : `🚀 Generate with Layout ${selectedLayoutVariant}`}
                </button>
              </div>

              {/* Reference Websites */}
              {selectedResearchIndustry.designResearch?.referenceWebsites?.length > 0 && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px' }}>🔗 Reference Websites</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedResearchIndustry.designResearch.referenceWebsites.map((ref, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>{ref.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{ref.notes}</div>
                        </div>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem' }}
                        >
                          Visit →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Winning Elements */}
              {selectedResearchIndustry.designResearch?.winningElements?.length > 0 && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px' }}>✨ Winning Elements</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedResearchIndustry.designResearch.winningElements.map((element, i) => (
                      <span key={i} style={{ padding: '6px 12px', background: '#EEF2FF', color: '#3B82F6', borderRadius: '6px', fontSize: '0.875rem' }}>
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Benchmarks */}
              {selectedResearchIndustry.designResearch?.industryBenchmarks && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px' }}>📊 Industry Benchmarks</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Avg Page Count</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{selectedResearchIndustry.designResearch.industryBenchmarks.avgPageCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Must-Have Pages</div>
                      <div style={{ fontSize: '0.875rem' }}>{selectedResearchIndustry.designResearch.industryBenchmarks.mustHavePages?.join(', ')}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Recommended Sections</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedResearchIndustry.designResearch.industryBenchmarks.recommendedSections?.map((section, i) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#F3F4F6', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Conversion Goals</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedResearchIndustry.designResearch.industryBenchmarks.conversionGoals?.map((goal, i) => (
                          <span key={i} style={{ padding: '4px 8px', background: '#D1FAE5', color: '#047857', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'pipeline') {
    return (
      <div style={styles.container}>
        {/* Header with Tabs */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🔍 Scout Dashboard</h1>
            <p style={styles.subtitle}>Find local businesses without websites</p>
          </div>
          {renderTabs()}
        </div>
        <ProspectManager />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Tabs */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🔍 Scout Dashboard</h1>
          <p style={styles.subtitle}>Find local businesses without websites</p>
        </div>
        {renderTabs()}
      </div>

      {/* Email Draft Modal */}
      {showEmailModal && emailDraft && (
        <div style={styles.modalOverlay} onClick={() => setShowEmailModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>📧 Email Draft</h3>
            <div style={styles.emailField}>
              <label>Subject:</label>
              <input value={emailDraft.subject} readOnly style={styles.emailInput} />
            </div>
            <div style={styles.emailField}>
              <label>Body:</label>
              <textarea value={emailDraft.body} readOnly style={styles.emailTextarea} />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => navigator.clipboard.writeText(emailDraft.body)} style={styles.primaryBtn}>
                📋 Copy to Clipboard
              </button>
              <button onClick={() => setShowEmailModal(false)} style={styles.secondaryBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Setup */}
      {!apiKeyConfigured && (
        <div style={styles.apiKeyCard}>
          <h3>🔑 Google Places API Key Required</h3>
          <p>Enter your Google Places API key for accurate website detection.</p>
          <div style={styles.apiKeyForm}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste your Google API key (AIza...)..."
              style={styles.input}
            />
            <button onClick={setApiKey} style={styles.primaryBtn}>
              Save Key
            </button>
          </div>
          <p style={styles.hint}>
            Get a key at <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer">Google Cloud Console</a> (Enable Places API, $300 free credit)
          </p>
        </div>
      )}

      {/* Search Controls */}
      {apiKeyConfigured && (
        <div style={styles.controls}>
          <div style={styles.searchRow}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP..."
              style={{ ...styles.input, flex: 2 }}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind.id} value={ind.id}>
                  {ind.icon} {ind.name}
                </option>
              ))}
            </select>
            <button
              onClick={search}
              disabled={loading}
              style={styles.primaryBtn}
            >
              {loading ? '🔍 Searching...' : '🔍 Scout'}
            </button>
            <button
              onClick={searchAllIndustries}
              disabled={loading}
              style={{ ...styles.primaryBtn, background: '#10B981' }}
            >
              {loading ? '⏳ Scanning...' : '🚀 Scout All Industries'}
            </button>
          </div>

          {/* Research Options */}
          <div style={styles.researchOptions}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={enrichWithYelp}
                onChange={(e) => setEnrichWithYelp(e.target.checked)}
                disabled={!hasYelpKey}
              />
              <span style={{ marginLeft: '8px' }}>
                🔬 Enrich with Yelp Research
                {!hasYelpKey && <span style={{ color: '#9CA3AF', marginLeft: '4px' }}>(No API key)</span>}
              </span>
            </label>
            {enrichWithYelp && (
              <span style={styles.enrichBadge}>
                +Ratings +Reviews +Price Level +Score
              </span>
            )}
          </div>

          {/* Quick Location Buttons */}
          <div style={styles.quickLocations}>
            {['Lewisville, TX', 'Plano, TX', 'Frisco, TX', 'Allen, TX', 'Dallas, TX'].map(loc => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                style={{
                  ...styles.quickBtn,
                  background: location === loc ? '#3B82F6' : '#f3f4f6',
                  color: location === loc ? '#fff' : '#374151'
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Bar */}
      {stats && (
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{stats.total}</span>
            <span style={styles.statLabel}>Scanned</span>
          </div>
          <div style={styles.stat}>
            <span style={{ ...styles.statNumber, color: '#EF4444' }}>{stats.withWebsite || 0}</span>
            <span style={styles.statLabel}>Have Website</span>
          </div>
          <div style={styles.stat}>
            <span style={{ ...styles.statNumber, color: '#10B981' }}>{getFilteredProspects().length}</span>
            <span style={styles.statLabel}>No Website</span>
          </div>
          <div style={styles.stat}>
            <span style={{ ...styles.statNumber, color: '#3B82F6' }}>${(getFilteredProspects().length * 2000).toLocaleString()}</span>
            <span style={styles.statLabel}>Potential Revenue</span>
          </div>
          {getFilteredProspects().length > 0 && (
            <button onClick={saveProspects} style={styles.saveBtn}>
              {savedCount ? `✅ Saved ${savedCount}!` : `💾 Save ${getFilteredProspects().length} Prospects`}
            </button>
          )}
        </div>
      )}

      {/* Industry Breakdown (when scout all) */}
      {stats?.byIndustry && (
        <div style={styles.industryBreakdown}>
          <strong>By Industry:</strong>
          {Object.entries(stats.byIndustry).map(([industry, data]) => (
            data.prospects > 0 && (
              <span key={industry} style={styles.industryChip}>
                {industry}: {data.prospects}
              </span>
            )
          ))}
        </div>
      )}

      {/* Results Note */}
      {prospects.length > 0 && (
        <div style={{ ...styles.verifyNote, background: '#D1FAE5', color: '#065F46' }}>
          <strong>Google Places API:</strong> These businesses have NO website listed on Google.
          They are verified prospects ready for outreach!
        </div>
      )}

      {/* Main Content: Map + List */}
      <div style={styles.mainContent}>
        {/* Map */}
        <div style={styles.mapContainer}>
          <div ref={mapRef} style={styles.map}></div>

          {/* Legend */}
          {getFilteredProspects().length > 0 && (
            <div style={styles.legend}>
              <strong>Legend:</strong>
              {[...new Set(getFilteredProspects().map(p => p.fixtureId))].map(fid => (
                <span key={fid} style={styles.legendItem}>
                  <span style={{
                    ...styles.legendDot,
                    background: INDUSTRY_COLORS[fid] || INDUSTRY_COLORS.default
                  }}></span>
                  {fid}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Prospect Details Panel */}
        <div style={styles.sidePanel}>
          {selectedProspect ? (
            <div style={styles.prospectCard}>
              {selectedProspect.photo && (
                <img src={selectedProspect.photo} alt="" style={styles.prospectPhoto} />
              )}
              <h2 style={styles.prospectName}>{selectedProspect.name}</h2>

              {/* Opportunity Score */}
              {selectedProspect.opportunityScore !== null && selectedProspect.opportunityScore !== undefined && (
                <div style={styles.scoreSection}>
                  <div style={styles.scoreBig}>{selectedProspect.opportunityScore}</div>
                  <div style={styles.scoreDetails}>
                    <div>Opportunity Score</div>
                    <div style={styles.scoreBarLarge}>
                      <div style={{
                        ...styles.scoreBarFillLarge,
                        width: `${selectedProspect.opportunityScore}%`,
                        background: selectedProspect.opportunityScore >= 70 ? '#22C55E' :
                                   selectedProspect.opportunityScore >= 50 ? '#F59E0B' : '#EF4444'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}

              <p style={styles.prospectAddress}>📍 {selectedProspect.address}</p>
              {selectedProspect.phone && (
                <p style={styles.prospectPhone}>
                  📞 <a href={`tel:${selectedProspect.phone}`}>{selectedProspect.phone}</a>
                </p>
              )}
              <div style={styles.prospectMeta}>
                {(selectedProspect.rating || selectedProspect.research?.rating) && (
                  <span>⭐ {selectedProspect.rating || selectedProspect.research?.rating} ({selectedProspect.reviewCount || selectedProspect.research?.reviewCount || 0} reviews)</span>
                )}
                {(selectedProspect.priceLevel || selectedProspect.research?.priceLevel) && (
                  <span style={styles.priceLevel}>{selectedProspect.priceLevel || selectedProspect.research?.priceLevel}</span>
                )}
              </div>

              {/* CRM Status */}
              {crmStatuses.length > 0 && (
                <div style={styles.crmSection}>
                  <label style={styles.crmLabel}>Status:</label>
                  <select
                    value={selectedProspect.crm?.status || 'discovered'}
                    onChange={(e) => updateProspectStatus(selectedProspect.id, e.target.value)}
                    disabled={updatingStatus}
                    style={{
                      ...styles.crmSelect,
                      background: CRM_STATUS_COLORS[selectedProspect.crm?.status] || '#6B7280',
                      color: '#fff'
                    }}
                  >
                    {crmStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.prospectTags}>
                <span style={{
                  ...styles.tag,
                  background: INDUSTRY_COLORS[selectedProspect.fixtureId] || '#6B7280'
                }}>
                  {getIndustryIcon(selectedProspect.fixtureId)} {selectedProspect.fixtureId}
                </span>
                {selectedProspect.detectedWebsite && (
                  <span style={{ ...styles.tag, background: '#F59E0B' }}>
                    ⚠️ Maybe: {selectedProspect.detectedWebsite}
                  </span>
                )}
                {selectedProspect.research?.matched && (
                  <span style={{ ...styles.tag, background: '#8B5CF6' }}>
                    ✓ Yelp Verified
                  </span>
                )}
              </div>

              {/* Research Categories */}
              {selectedProspect.research?.categories?.length > 0 && (
                <div style={styles.categoriesSection}>
                  <small style={{ color: '#6B7280' }}>Categories:</small>
                  <div style={styles.categoryTags}>
                    {selectedProspect.research.categories.slice(0, 3).map(cat => (
                      <span key={cat} style={styles.categoryTag}>{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.prospectActions}>
                {selectedProspect.googleMapsUrl && (
                  <a
                    href={selectedProspect.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.secondaryBtn}
                  >
                    View on Google ↗
                  </a>
                )}
                {(selectedProspect.yelpUrl || selectedProspect.research?.yelpUrl) && (
                  <a
                    href={selectedProspect.yelpUrl || selectedProspect.research?.yelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.secondaryBtn}
                  >
                    View on Yelp ↗
                  </a>
                )}
                <button
                  onClick={() => markAsHasWebsite(selectedProspect.id)}
                  style={styles.hasWebsiteBtn}
                >
                  ❌ Has Website
                </button>
              </div>

              {/* Email Draft Button */}
              <button
                onClick={() => generateEmailDraft(selectedProspect.id)}
                style={{ ...styles.primaryBtn, width: '100%', marginTop: '12px' }}
              >
                ✉️ Generate Email Draft
              </button>

              {selectedProspect.hasWebsite && selectedProspect.detectedWebsite && (
                <p style={styles.websiteFound}>
                  Website found: <a href={selectedProspect.detectedWebsite} target="_blank" rel="noreferrer">{selectedProspect.detectedWebsite}</a>
                </p>
              )}
              {!selectedProspect.hasWebsite && (
                <p style={styles.noWebsite}>
                  ✓ No website detected - good prospect!
                </p>
              )}
            </div>
          ) : (
            <div style={styles.placeholder}>
              <p>👆 Click a pin on the map to verify each business</p>
              {getFilteredProspects().length > 0 && (
                <div style={styles.prospectList}>
                  <h3>Prospects to Verify ({getFilteredProspects().length})</h3>
                  {getFilteredProspects().map(p => (
                    <div
                      key={p.id}
                      style={styles.prospectListItem}
                      onClick={() => setSelectedProspect(p)}
                    >
                      <span style={{
                        ...styles.listDot,
                        background: INDUSTRY_COLORS[p.fixtureId] || '#6B7280'
                      }}></span>
                      <div style={{ flex: 1 }}>
                        <strong>{p.name}</strong>
                        <small style={{ display: 'block', opacity: 0.7 }}>{p.address}</small>
                        {p.crm?.status && p.crm.status !== 'discovered' && (
                          <span style={{
                            ...styles.crmBadge,
                            background: CRM_STATUS_COLORS[p.crm.status],
                            fontSize: '10px',
                            marginTop: '4px',
                            display: 'inline-block'
                          }}>
                            {p.crm.status}
                          </span>
                        )}
                      </div>
                      {p.opportunityScore !== null && p.opportunityScore !== undefined && (
                        <span style={{
                          padding: '4px 8px',
                          background: p.opportunityScore >= 70 ? '#D1FAE5' :
                                     p.opportunityScore >= 50 ? '#FEF3C7' : '#FEE2E2',
                          color: p.opportunityScore >= 70 ? '#065F46' :
                                 p.opportunityScore >= 50 ? '#92400E' : '#991B1B',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '700',
                          marginRight: '8px'
                        }}>
                          {p.opportunityScore}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsHasWebsite(p.id); }}
                        style={styles.miniRemoveBtn}
                        title="Mark as has website"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  tabs: {
    display: 'flex',
    gap: '8px'
  },
  tab: {
    padding: '10px 20px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    color: '#6B7280',
    transition: 'all 0.2s'
  },
  tabActive: {
    background: '#3B82F6',
    border: '1px solid #3B82F6',
    color: '#fff'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0'
  },
  subtitle: {
    color: '#6B7280',
    margin: 0
  },
  apiKeyCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  apiKeyForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  hint: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '12px'
  },
  controls: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none'
  },
  primaryBtn: {
    padding: '12px 24px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  secondaryBtn: {
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center'
  },
  quickLocations: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  quickBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  error: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    background: '#fff',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6B7280'
  },
  saveBtn: {
    marginLeft: 'auto',
    padding: '10px 20px',
    background: '#10B981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    height: 'calc(100vh - 320px)',
    minHeight: '500px'
  },
  mapContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  map: {
    width: '100%',
    height: '100%',
    minHeight: '500px'
  },
  legend: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    background: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    fontSize: '13px',
    zIndex: 1000
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  sidePanel: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'auto'
  },
  prospectCard: {
    padding: '20px'
  },
  prospectPhoto: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  prospectName: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 8px 0'
  },
  prospectAddress: {
    color: '#6B7280',
    margin: '0 0 4px 0'
  },
  prospectPhone: {
    margin: '0 0 12px 0'
  },
  prospectMeta: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '16px'
  },
  prospectTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  tag: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff'
  },
  prospectActions: {
    display: 'flex',
    gap: '12px'
  },
  placeholder: {
    padding: '24px',
    color: '#6B7280',
    textAlign: 'center'
  },
  prospectList: {
    marginTop: '24px',
    textAlign: 'left'
  },
  prospectListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  },
  listDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0
  },
  verifyNote: {
    background: '#FEF3C7',
    color: '#92400E',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px'
  },
  hasWebsiteBtn: {
    padding: '10px 16px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  verifyHint: {
    marginTop: '16px',
    fontSize: '13px',
    color: '#6B7280',
    fontStyle: 'italic'
  },
  miniRemoveBtn: {
    width: '24px',
    height: '24px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flexShrink: 0
  },
  websiteFound: {
    marginTop: '12px',
    padding: '8px 12px',
    background: '#FEE2E2',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#DC2626'
  },
  noWebsite: {
    marginTop: '12px',
    padding: '8px 12px',
    background: '#D1FAE5',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#065F46',
    fontWeight: '500'
  },
  industryBreakdown: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fff',
    borderRadius: '8px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  industryChip: {
    padding: '4px 10px',
    background: '#E0E7FF',
    color: '#3730A3',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },

  // Research Options
  researchOptions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E7EB'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px'
  },
  enrichBadge: {
    padding: '4px 10px',
    background: '#DBEAFE',
    color: '#1E40AF',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  followUpBadge: {
    padding: '6px 12px',
    background: '#FEF3C7',
    color: '#92400E',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '8px'
  },

  // Opportunity Score Section
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#F0FDF4',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  scoreBig: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#166534',
    minWidth: '50px',
    textAlign: 'center'
  },
  scoreDetails: {
    flex: 1
  },
  scoreBarLarge: {
    height: '8px',
    background: '#E5E7EB',
    borderRadius: '4px',
    marginTop: '4px',
    overflow: 'hidden'
  },
  scoreBarFillLarge: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  priceLevel: {
    padding: '2px 8px',
    background: '#DBEAFE',
    color: '#1E40AF',
    borderRadius: '4px',
    fontWeight: '600',
    marginLeft: '8px'
  },

  // CRM Section
  crmSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  crmLabel: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500'
  },
  crmSelect: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  crmBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase'
  },

  // Categories Section
  categoriesSection: {
    marginBottom: '12px'
  },
  categoryTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '4px'
  },
  categoryTag: {
    padding: '2px 8px',
    background: '#F3F4F6',
    color: '#374151',
    borderRadius: '4px',
    fontSize: '11px'
  },

  // Leaderboard
  leaderboardContainer: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  leaderboardCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    borderBottom: '1px solid #E5E7EB'
  },
  leaderboardRank: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#9CA3AF',
    minWidth: '40px'
  },
  leaderboardInfo: {
    flex: 1
  },
  leaderboardName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  leaderboardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6B7280'
  },
  leaderboardScore: {
    textAlign: 'center',
    minWidth: '80px'
  },
  scoreNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#22C55E'
  },
  scoreLabel: {
    fontSize: '11px',
    color: '#6B7280',
    textTransform: 'uppercase'
  },
  scoreBar: {
    width: '80px',
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    marginTop: '4px',
    overflow: 'hidden'
  },
  scoreBarFill: {
    height: '100%',
    background: '#22C55E',
    borderRadius: '3px',
    transition: 'width 0.3s'
  },
  leaderboardActions: {
    display: 'flex',
    gap: '8px'
  },
  smallBtn: {
    padding: '6px 12px',
    background: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  // Stats Bar
  statsBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    padding: '16px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statBox: {
    flex: 1,
    textAlign: 'center',
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '8px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginTop: '4px'
  },

  // Generation/Deployment Status
  statusRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
    flexWrap: 'wrap'
  },
  generatedBadge: {
    padding: '3px 8px',
    background: '#DCFCE7',
    color: '#166534',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  notGeneratedBadge: {
    padding: '3px 8px',
    background: '#F3F4F6',
    color: '#6B7280',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  deployedBadge: {
    padding: '3px 8px',
    background: '#DBEAFE',
    color: '#1D4ED8',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  notDeployedBadge: {
    padding: '3px 8px',
    background: '#FEF3C7',
    color: '#92400E',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  variantBadge: {
    padding: '3px 8px',
    background: '#F3E8FF',
    color: '#7C3AED',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },

  // URL Links
  urlRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  deployedLink: {
    color: '#2563EB',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500'
  },
  adminLink: {
    color: '#7C3AED',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500'
  },
  apiLink: {
    color: '#059669',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '500'
  },

  // Email Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  emailField: {
    marginBottom: '16px'
  },
  emailInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '4px'
  },
  emailTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '4px',
    minHeight: '300px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },

  // Leaderboard Controls
  leaderboardControls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '16px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    fontSize: '13px',
    background: '#fff',
    cursor: 'pointer'
  },
  sortDirBtn: {
    padding: '8px 12px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  clearBtn: {
    padding: '8px 12px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  industryBadge: {
    padding: '2px 8px',
    background: '#E0E7FF',
    color: '#3730A3',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  cityBadge: {
    fontSize: '12px',
    color: '#6B7280'
  },

  // Score Breakdown Panel
  breakdownPanel: {
    width: '100%',
    marginTop: '12px',
    padding: '12px 16px',
    background: '#F9FAFB',
    borderRadius: '8px',
    borderTop: '1px solid #E5E7EB'
  },
  breakdownTitle: {
    fontWeight: '600',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '8px'
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px'
  },
  breakdownSource: {
    padding: '2px 6px',
    background: '#DBEAFE',
    color: '#1E40AF',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    minWidth: '50px',
    textAlign: 'center'
  },
  breakdownFactor: {
    flex: 1,
    color: '#4B5563'
  },
  breakdownPoints: {
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'right'
  },
  breakdownTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '8px',
    marginTop: '8px',
    borderTop: '1px dashed #D1D5DB',
    fontWeight: '600',
    fontSize: '14px'
  },

  // View Toggle
  viewToggle: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto'
  },
  viewBtn: {
    padding: '8px 16px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#6B7280'
  },
  viewBtnActive: {
    background: '#3B82F6',
    color: '#fff'
  },

  // Grid View
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  gridCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  gridScoreBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  gridRank: {
    fontSize: '12px',
    color: '#9CA3AF',
    fontWeight: '600'
  },
  gridName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    paddingRight: '50px'
  },
  gridLocation: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  gridRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  gridStars: {
    color: '#F59E0B',
    fontSize: '14px',
    letterSpacing: '-1px'
  },
  gridRatingNum: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  gridReviews: {
    fontSize: '12px',
    color: '#6B7280'
  },
  gridPrice: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669'
  },
  gridStatus: {
    alignSelf: 'flex-start',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase'
  },
  gridBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    padding: '8px',
    background: '#F9FAFB',
    borderRadius: '8px'
  },
  gridBreakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  gridActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto'
  },
  gridBtn: {
    flex: 1,
    padding: '8px 12px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#374151'
  },
  gridBreakdownFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '8px',
    marginTop: '8px'
  },
  gridBreakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  // Grid deployment/generation status
  gridDeployedBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#DBEAFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  gridGeneratedBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#DCFCE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  gridGenStatus: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 'auto'
  },
  gridDeployedLink: {
    color: '#2563EB',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    background: '#EFF6FF',
    borderRadius: '4px'
  },
  gridGenLabel: {
    fontSize: '11px',
    color: '#166534',
    fontWeight: '500'
  },
  gridNotGenLabel: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500'
  },
  gridVariantLabel: {
    fontSize: '11px',
    color: '#7C3AED',
    fontWeight: '500',
    padding: '2px 6px',
    background: '#F3E8FF',
    borderRadius: '4px'
  },

  // Generate Test Modal
  generateModal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 24px 0'
  },
  levelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  levelCard: {
    padding: '20px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#8B5CF6',
      transform: 'translateY(-2px)'
    }
  },
  levelIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  levelName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px'
  },
  levelDesc: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: 1.4
  },
  levelLoading: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#8B5CF6',
    fontWeight: '600'
  },
  generateAllBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '24px'
  },
  previewSection: {
    background: '#F9FAFB',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '12px'
  },
  previewCard: {
    background: '#fff',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px'
  },
  previewLevel: {
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontSize: '11px'
  },
  previewItem: {
    color: '#6B7280',
    marginBottom: '4px'
  },
  closeBtn: {
    width: '100%',
    padding: '12px',
    background: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
