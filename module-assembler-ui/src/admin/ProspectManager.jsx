/**
 * Prospect Manager
 *
 * List view for managing scouted prospects through the pipeline:
 * Scouted → Test Generated → Verified → AI Generated → Deployed
 */

import React, { useState, useEffect } from 'react';
import { MoodSliders } from '../components/MoodSliders';
import { INDUSTRY_PAGE_PACKAGES, PAGE_LABELS, getPageLabel } from '../constants/industry-config';

// Convert industry-config pages to the package format with features
const buildPackageFromConfig = (industryKey) => {
  const config = INDUSTRY_PAGE_PACKAGES[industryKey] || INDUSTRY_PAGE_PACKAGES['default'];

  // Feature detection based on pages
  const getFeatures = (pages) => {
    const features = [];
    // Food & Beverage
    if (pages.includes('menu')) features.push('Online Menu');
    if (pages.includes('order-online')) features.push('Online Ordering');
    if (pages.includes('reservations')) features.push('Reservations');
    if (pages.includes('catering')) features.push('Catering');
    // Services & Booking
    if (pages.includes('services')) features.push('Services');
    if (pages.includes('booking') || pages.includes('appointments')) features.push('Online Booking');
    if (pages.includes('quote')) features.push('Quote Request');
    // People & Team
    if (pages.includes('team') || pages.includes('providers') || pages.includes('attorneys') || pages.includes('agents') || pages.includes('artists') || pages.includes('instructors') || pages.includes('trainers') || pages.includes('hosts')) features.push('Team Profiles');
    // Media & Content
    if (pages.includes('gallery') || pages.includes('portfolio')) features.push('Gallery');
    if (pages.includes('testimonials')) features.push('Reviews');
    if (pages.includes('blog')) features.push('Blog');
    if (pages.includes('episodes')) features.push('Episodes');
    if (pages.includes('music') || pages.includes('videos')) features.push('Media');
    // Commerce & Membership
    if (pages.includes('products') || pages.includes('inventory')) features.push('Products');
    if (pages.includes('pricing')) features.push('Pricing');
    if (pages.includes('membership')) features.push('Membership');
    if (pages.includes('gift-cards') || pages.includes('merch')) features.push('Gift Cards');
    if (pages.includes('loyalty')) features.push('Loyalty Program');
    // Special Features
    if (pages.includes('patient-portal') || pages.includes('client-portal') || pages.includes('pet-portal')) features.push('Auth Portal');
    if (pages.includes('classes')) features.push('Classes');
    if (pages.includes('listings')) features.push('Listings');
    if (pages.includes('rooms')) features.push('Rooms');
    if (pages.includes('destinations') || pages.includes('tours')) features.push('Tours');
    if (pages.includes('emergency')) features.push('Emergency Service');
    if (pages.includes('donate')) features.push('Donations');
    if (pages.includes('features') || pages.includes('integrations')) features.push('Features');
    return features.length > 0 ? features : ['Basic Info'];
  };

  return {
    essential: {
      pages: config.essential.map(p => getPageLabel(p)),
      features: getFeatures(config.essential),
      cost: 0
    },
    recommended: {
      pages: config.recommended.map(p => getPageLabel(p)),
      features: getFeatures(config.recommended),
      cost: 0
    },
    premium: {
      pages: config.premium.map(p => getPageLabel(p)),
      features: getFeatures(config.premium),
      cost: 0
    }
  };
};

const getIndustryPackage = (industry) => {
  return buildPackageFromConfig(industry);
};

const STATUS_CONFIG = {
  'scouted': { label: 'Scouted', color: '#6B7280', bg: '#F3F4F6' },
  'test-generated': { label: 'Test Generated', color: '#3B82F6', bg: '#DBEAFE' },
  'verified': { label: 'Verified', color: '#8B5CF6', bg: '#EDE9FE' },
  'ai-generated': { label: 'AI Generated', color: '#F59E0B', bg: '#FEF3C7' },
  'deployed': { label: 'Deployed', color: '#10B981', bg: '#D1FAE5' }
};

const INDUSTRY_ICONS = {
  // Food & Beverage
  'pizza': '🍕',
  'pizza-restaurant': '🍕',
  'pizzeria': '🍕',
  'restaurant': '🍽️',
  'cafe': '☕',
  'coffee': '☕',
  'coffee-cafe': '☕',
  'bakery': '🥐',
  'bar': '🍸',

  // Healthcare & Beauty
  'barbershop': '💈',
  'salon': '💇',
  'spa-salon': '💆',
  'salon-spa': '💆',
  'spa': '💆',
  'dental': '🦷',
  'dentist': '🦷',
  'healthcare': '🏥',
  'doctor': '🏥',
  'chiropractic': '🦴',
  'medical-spa': '💉',
  'veterinary': '🐾',
  'tattoo': '🎨',

  // Fitness & Wellness
  'fitness': '💪',
  'fitness-gym': '💪',
  'gym': '💪',
  'yoga': '🧘',

  // Professional Services
  'law-firm': '⚖️',
  'lawyer': '⚖️',
  'real-estate': '🏠',
  'accounting': '📊',
  'consulting': '💼',
  'insurance': '🛡️',
  'finance': '💹',

  // Trades & Home Services
  'plumber': '🔧',
  'electrician': '⚡',
  'hvac': '❄️',
  'construction': '🔨',
  'landscaping': '🌿',
  'cleaning': '🧹',
  'roofing': '🏠',
  'auto-repair': '🚗',
  'auto-shop': '🚗',
  'moving': '🚚',

  // Technology & Creative
  'saas': '💻',
  'startup': '🚀',
  'agency': '📱',
  'photography': '📷',
  'wedding': '💒',
  'portfolio': '🎨',

  // Retail
  'retail': '🛒',
  'ecommerce': '🛒',
  'collectibles': '🃏',

  // Education & Organizations
  'education': '🎓',
  'school': '🏫',
  'nonprofit': '💚',
  'church': '⛪',

  // Hospitality & Events
  'hotel': '🏨',
  'travel': '✈️',
  'event-venue': '🎪',

  // Entertainment
  'musician': '🎸',
  'podcast': '🎙️',
  'gaming': '🎮',

  // Pet Services
  'pet-services': '🐾'
};

// Extract city from address
const extractCity = (address) => {
  if (!address) return 'Unknown';
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Usually "City, State ZIP" format
    return parts[parts.length - 2]?.trim() || parts[0]?.trim() || 'Unknown';
  }
  return parts[0]?.trim() || 'Unknown';
};

// Industry groups for filtering
const INDUSTRY_GROUPS = {
  'Food & Beverage': ['restaurant', 'pizza', 'pizzeria', 'pizza-restaurant', 'cafe', 'coffee', 'coffee-cafe', 'bakery', 'bar', 'steakhouse'],
  'Grooming & Beauty': ['barbershop', 'salon', 'spa-salon', 'salon-spa', 'spa', 'hair', 'nail', 'nail salon', 'beauty', 'tattoo', 'medical-spa'],
  'Healthcare': ['healthcare', 'dental', 'dentist', 'doctor', 'medical', 'clinic', 'chiropractic', 'veterinary'],
  'Fitness & Wellness': ['fitness', 'fitness-gym', 'gym', 'yoga', 'pilates', 'crossfit', 'martial-arts'],
  'Professional Services': ['law-firm', 'lawyer', 'accounting', 'consulting', 'finance', 'insurance', 'real-estate'],
  'Home & Trade Services': ['plumber', 'electrician', 'hvac', 'roofing', 'cleaning', 'landscaping', 'construction', 'auto-repair', 'auto-shop', 'moving'],
  'Technology': ['saas', 'startup', 'agency', 'photography', 'wedding', 'portfolio'],
  'Retail & E-commerce': ['retail', 'ecommerce', 'collectibles', 'boutique', 'jewelry', 'clothing', 'fashion'],
  'Education & Nonprofit': ['education', 'school', 'nonprofit', 'church'],
  'Hospitality & Events': ['hotel', 'travel', 'event-venue'],
  'Entertainment': ['musician', 'podcast', 'gaming'],
  'Pet Services': ['pet-services']
};

// Get industry group for an industry
const getIndustryGroup = (fixtureId) => {
  for (const [group, industries] of Object.entries(INDUSTRY_GROUPS)) {
    if (industries.includes(fixtureId)) return group;
  }
  return 'Other';
};

export default function ProspectManager() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [groupByIndustry, setGroupByIndustry] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, rating, industry, city, status
  const [sortOrder, setSortOrder] = useState('asc');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  // AI Generation Modal state
  const [aiModal, setAiModal] = useState({ open: false, prospect: null });
  const [selectedTier, setSelectedTier] = useState('recommended');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Test Package Modal state (for Full Stack with package selection)
  const [testModal, setTestModal] = useState({ open: false, prospect: null });
  const [selectedTestTier, setSelectedTestTier] = useState('premium');
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [testGenerating, setTestGenerating] = useState(false);
  // Portal/Auth toggle - adds login, register, dashboard, profile pages
  const [enablePortal, setEnablePortal] = useState(true);
  // Mood sliders for styling (vibe, energy, era, density, price, theme)
  const [moodSliders, setMoodSliders] = useState({ vibe: 50, energy: 50, era: 50, density: 50, price: 50, theme: 'light' });

  // Archetype selection for artisan food industries
  const [selectedArchetypes, setSelectedArchetypes] = useState(['local']); // Default to local
  const [generateMultipleArchetypes, setGenerateMultipleArchetypes] = useState(false);
  const [generatedVariants, setGeneratedVariants] = useState([]); // Track generated archetype variants
  const [variantPreviewModal, setVariantPreviewModal] = useState({ open: false, prospect: null, variants: [] });
  const [deployingVariants, setDeployingVariants] = useState({}); // Track which variants are being deployed

  // 18-variant generation state (6 presets × 3 themes)
  const [show18VariantModal, setShow18VariantModal] = useState({ open: false, prospect: null });
  const [selected18Variants, setSelected18Variants] = useState(new Set());
  const [generating18Variants, setGenerating18Variants] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, currentVariant: '' });
  const [masterMetrics, setMasterMetrics] = useState(null);
  const [skipBuild, setSkipBuild] = useState(false); // Default false - always build for preview

  // Unified generation state (combines full-stack + levels + variants)
  const [showUnifiedModal, setShowUnifiedModal] = useState({ open: false, prospect: null });
  const [unifiedConfig, setUnifiedConfig] = useState({
    inputLevel: 'moderate',
    tier: 'premium',
    enableVariants: false,
    selectedPresets: ['luxury', 'friendly', 'bold-energetic', 'modern-minimal', 'classic-elegant', 'sharp-corporate'], // All 6 presets - must match backend VARIANT_PRESETS
    selectedLayouts: [], // Will be populated based on industry when modal opens
    generateVideo: true,
    generateLogo: true,
    enablePortal: true,
    // AI Pipeline: Test first (free), then optionally upgrade to AI
    generationMode: 'test', // 'test' (free) or 'ai' (paid)
    aiLevel: 0 // 0=test, 1=composer, 2=content, 3=both, 4=full freedom
  });

  // AI Level definitions for the pipeline
  const AI_LEVELS = [
    { id: 0, name: 'Test Mode', icon: '🧪', cost: 0, description: 'Free - Fixture data, find winning layouts' },
    { id: 1, name: 'AI Composer', icon: '🎨', cost: 0.15, description: 'AI picks sections & layout order' },
    { id: 2, name: 'AI Content', icon: '✍️', cost: 0.40, description: 'AI writes real copy & descriptions' },
    { id: 3, name: 'Composer + Content', icon: '🎯', cost: 0.55, description: 'Unique structure AND content' },
    { id: 4, name: 'Full Freedom', icon: '✨', cost: 1.00, description: 'Maximum AI creativity & uniqueness' }
  ];
  const [unifiedProgress, setUnifiedProgress] = useState(null);
  const [unifiedGenerating, setUnifiedGenerating] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState(null); // For input level preview on hover

  // ============================================
  // INPUT LEVEL PREVIEW DATA
  // These are GUIDELINES for test mode, not constraints
  // Real AI mode uses these as starting points with creative freedom
  // ============================================

  const INDUSTRY_PRESETS_MAP = {
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

  const INDUSTRY_THEMES_MAP = {
    'barbershop': 'dark', 'salon-spa': 'light', 'restaurant': 'medium',
    'pizza-restaurant': 'medium', 'coffee-cafe': 'light', 'bakery': 'light',
    'dental': 'light', 'healthcare': 'light', 'fitness-gym': 'dark',
    'yoga': 'light', 'law-firm': 'dark', 'real-estate': 'light',
    'plumber': 'light', 'cleaning': 'light', 'auto-shop': 'dark', 'default': 'light'
  };

  const INDUSTRY_ARCHETYPES_MAP = {
    'barbershop': 'vintage-classic', 'salon-spa': 'modern-sleek',
    'restaurant': 'local', 'pizza-restaurant': 'local', 'coffee-cafe': 'local',
    'bakery': 'local', 'dental': 'trust-authority', 'healthcare': 'trust-authority',
    'fitness-gym': 'high-energy', 'yoga': 'calm-wellness', 'law-firm': 'trust-authority',
    'real-estate': 'trust-authority', 'plumber': 'reliable-local',
    'cleaning': 'reliable-local', 'auto-shop': 'reliable-local', 'default': 'local'
  };

  const INDUSTRY_PAGES_MAP = {
    'barbershop': ['home', 'services', 'contact', 'about', 'gallery', 'book'],
    'salon-spa': ['home', 'services', 'contact', 'about', 'gallery', 'book', 'team'],
    'restaurant': ['home', 'menu', 'contact', 'about', 'gallery', 'reservations'],
    'dental': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
    'healthcare': ['home', 'services', 'contact', 'about', 'team', 'faq', 'book'],
    'default': ['home', 'services', 'contact', 'about', 'gallery', 'testimonials']
  };

  const ARCHETYPE_MOODS_MAP = {
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
  const getInputPreview = (prospect, level) => {
    if (!prospect) return null;

    const industry = prospect.fixtureId || 'default';
    const priceLevel = prospect.research?.priceLevel || '$$';
    const score = prospect.opportunityScore || 50;

    // Derive preset based on price
    const presets = INDUSTRY_PRESETS_MAP[industry] || INDUSTRY_PRESETS_MAP.default;
    let preset = presets.default;
    if (priceLevel === '$$$$' || priceLevel === '$$$') preset = presets.luxury;
    else if (priceLevel === '$') preset = presets.budget;

    const theme = INDUSTRY_THEMES_MAP[industry] || 'light';
    const archetype = INDUSTRY_ARCHETYPES_MAP[industry] || 'local';
    const tier = score >= 75 ? 'premium' : score >= 50 ? 'standard' : 'basic';
    const moods = ARCHETYPE_MOODS_MAP[archetype] || ARCHETYPE_MOODS_MAP.local;
    const pages = INDUSTRY_PAGES_MAP[industry] || INDUSTRY_PAGES_MAP.default;

    if (level === 'minimal') {
      return {
        title: 'MINIMAL - AI Decides Everything',
        description: 'System auto-picks all options. You just click generate.',
        isTestMode: 'Uses these defaults directly',
        isRealMode: 'AI uses as starting point, may adjust',
        fields: [
          { label: 'Preset', value: `auto → ${preset}`, note: `${industry} + ${priceLevel}` },
          { label: 'Theme', value: `auto → ${theme}`, note: `Industry default` },
          { label: 'Layout', value: 'auto', note: 'Best for industry' },
          { label: 'Pages', value: '5-7 standard', note: 'Core pages' },
          { label: 'Archetype', value: `auto → ${archetype}`, note: 'From industry' }
        ]
      };
    }

    if (level === 'moderate') {
      return {
        title: 'MODERATE - Smart Defaults',
        description: 'Derived from research. You can override.',
        isTestMode: 'Uses derived values + overrides',
        isRealMode: 'AI interprets + adds creativity',
        fields: [
          { label: 'Preset', value: preset, note: `From ${priceLevel}` },
          { label: 'Theme', value: theme, note: 'Industry std' },
          { label: 'Tier', value: tier, note: `Score ${score}` },
          { label: 'Archetype', value: archetype, note: 'Brand vibe' },
          { label: 'Pages', value: `${tier === 'premium' ? '8-12' : '5-7'}`, note: tier },
          { label: 'Tagline', value: '✨ Generated', note: 'AI copy' }
        ]
      };
    }

    if (level === 'extreme') {
      return {
        title: 'EXTREME - Full Control',
        description: 'All options filled. Mood sliders, colors, typography.',
        isTestMode: 'All fields pre-filled, customizable',
        isRealMode: 'Detailed blueprint + creative latitude',
        fields: [
          { label: 'Preset', value: preset, note: 'Editable' },
          { label: 'Mood', value: `${moods.vibe}, ${moods.energy}`, note: 'Sliders' },
          { label: 'Pages', value: pages.slice(0, 4).join(', ') + '...', note: 'Full set' },
          { label: 'Colors', value: '🎨 Auto', note: 'Archetype' },
          { label: 'Fonts', value: '📝 Auto', note: 'Preset' },
          { label: 'Content', value: '✍️ AI Copy', note: 'Generated' }
        ]
      };
    }

    return null;
  };

  // Get layouts for unified modal based on prospect industry
  const getUnifiedLayouts = (prospect) => {
    if (!prospect) return INDUSTRY_LAYOUTS['default'];
    const category = getIndustryCategory(prospect.fixtureId);
    return INDUSTRY_LAYOUTS[category] || INDUSTRY_LAYOUTS['default'];
  };

  // Artisan food industries that support archetypes
  const ARTISAN_FOOD_INDUSTRIES = [
    'bakery', 'cake-shop', 'patisserie', 'coffee-cafe', 'cafe', 'coffee-shop',
    'ice-cream', 'gelato', 'chocolatier', 'confectionery', 'specialty-food',
    'deli', 'sandwich-shop', 'pizza-restaurant', 'pizzeria', 'juice-bar', 'smoothie-shop'
  ];

  const ARCHETYPES = [
    {
      id: 'local',
      name: 'Local / Community',
      description: 'Warm, welcoming, neighborhood feel',
      examples: "Porto's, neighborhood bakeries",
      color: '#22c55e',
      icon: '🏘️'
    },
    {
      id: 'luxury',
      name: 'Brand Story / Luxury',
      description: 'Elegant, editorial, premium positioning',
      examples: 'Lady M, Tartine',
      color: '#8b5cf6',
      icon: '✨'
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce Focus',
      description: 'Modern, conversion-focused, product-forward',
      examples: 'Sprinkles, Levain, Milk Bar',
      color: '#3b82f6',
      icon: '🛒'
    }
  ];

  // Helper to get variant identifier - handles both new (key) and legacy (archetype) formats
  const getVariantKey = (variant) => variant.key || variant.archetype || 'default';

  // Helper to get variant display info - handles both formats
  const getVariantInfo = (variant) => {
    // If it has direct properties (new unified generation format)
    if (variant.name && variant.color && variant.icon) {
      return {
        key: getVariantKey(variant),
        name: variant.name || variant.presetName || getVariantKey(variant),
        color: variant.color || variant.presetColor || '#6B7280',
        icon: variant.icon || variant.presetIcon || '🎨',
        description: variant.description || '',
        examples: variant.examples || ''
      };
    }
    // Try to find in legacy ARCHETYPES
    const archetype = ARCHETYPES.find(a => a.id === variant.archetype);
    if (archetype) {
      return {
        key: variant.archetype,
        name: archetype.name,
        color: archetype.color,
        icon: archetype.icon,
        description: archetype.description,
        examples: archetype.examples
      };
    }
    // Fallback
    return {
      key: getVariantKey(variant),
      name: getVariantKey(variant),
      color: '#6B7280',
      icon: '🎨',
      description: '',
      examples: ''
    };
  };

  // 18-Variant System: 6 presets × 3 industry-specific layouts
  const VARIANT_PRESETS = [
    { id: 'luxury', name: 'Luxury', icon: '💎', color: '#8B5CF6' },
    { id: 'friendly', name: 'Friendly Local', icon: '🏠', color: '#22C55E' },
    { id: 'modern-minimal', name: 'Modern Minimal', icon: '◼️', color: '#64748B' },
    { id: 'sharp-corporate', name: 'Sharp & Clean', icon: '📐', color: '#3B82F6' },
    { id: 'bold-energetic', name: 'Bold & Fun', icon: '🎉', color: '#F59E0B' },
    { id: 'classic-elegant', name: 'Classic Elegant', icon: '🏛️', color: '#78350F' }
  ];

  // Industry-specific layouts (3 per industry category)
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

  // Map fixture IDs to industry categories
  const getIndustryCategory = (fixtureId) => {
    const mapping = {
      'bakery': 'restaurants-food', 'restaurant': 'restaurants-food', 'coffee-cafe': 'restaurants-food',
      'pizza-restaurant': 'restaurants-food', 'steakhouse': 'restaurants-food',
      'dental': 'dental',
      'healthcare': 'healthcare-medical',
      'salon-spa': 'grooming', 'barbershop': 'grooming',
      'law-firm': 'professional-services', 'real-estate': 'professional-services'
    };
    return mapping[fixtureId] || 'default';
  };

  // Get layouts for current prospect
  const getLayoutsForProspect = (prospect) => {
    if (!prospect) return INDUSTRY_LAYOUTS['default'];
    const category = getIndustryCategory(prospect.fixtureId);
    return INDUSTRY_LAYOUTS[category] || INDUSTRY_LAYOUTS['default'];
  };

  const getAllVariantKeys = (prospect) => {
    const layouts = getLayoutsForProspect(prospect);
    const keys = [];
    for (const preset of VARIANT_PRESETS) {
      for (const layout of layouts) {
        keys.push(`${preset.id}-${layout.id}`);
      }
    }
    return keys;
  };

  const toggle18Variant = (variantKey) => {
    setSelected18Variants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variantKey)) {
        newSet.delete(variantKey);
      } else {
        newSet.add(variantKey);
      }
      return newSet;
    });
  };

  const selectAllVariants = () => setSelected18Variants(new Set(getAllVariantKeys(show18VariantModal.prospect)));
  const clearAllVariants = () => setSelected18Variants(new Set());

  const selectAllOfLayout = (layoutId) => {
    const keys = VARIANT_PRESETS.map(p => `${p.id}-${layoutId}`);
    setSelected18Variants(prev => {
      const newSet = new Set(prev);
      keys.forEach(k => newSet.add(k));
      return newSet;
    });
  };

  const selectAllOfPreset = (presetId) => {
    const layouts = getLayoutsForProspect(show18VariantModal.prospect);
    const keys = layouts.map(l => `${presetId}-${l.id}`);
    setSelected18Variants(prev => {
      const newSet = new Set(prev);
      keys.forEach(k => newSet.add(k));
      return newSet;
    });
  };

  const generate18VariantsHandler = async () => {
    if (selected18Variants.size === 0 || !show18VariantModal.prospect) return;

    setGenerating18Variants(true);
    setGenerationProgress({ current: 0, total: selected18Variants.size, currentVariant: '' });

    try {
      const response = await fetch(`/api/scout/prospects/${show18VariantModal.prospect.folder}/generate-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedVariants: Array.from(selected18Variants),
          tier: selectedTestTier,
          layout: selectedLayout,
          industryGroup: getIndustryGroup(show18VariantModal.prospect.fixtureId),
          skipBuild: skipBuild
        })
      });

      const data = await response.json();

      if (data.success) {
        setMasterMetrics(data.masterMetrics);
        setShow18VariantModal({ open: false, prospect: null });
        setMessage({ type: 'success', text: `Generated ${data.masterMetrics.successCount} variants successfully!` });
        loadProspects(); // Refresh list
      } else {
        setMessage({ type: 'error', text: data.error || 'Generation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setGenerating18Variants(false);
    }
  };

  // Unified generation with SSE progress
  const generateUnified = async (prospect) => {
    if (!prospect) return;

    setUnifiedGenerating(true);
    setUnifiedProgress({ step: 'init', status: 'Starting...', progress: 0 });

    try {
      const response = await fetch(`/api/scout/prospects/${prospect.folder}/unified-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputLevel: unifiedConfig.inputLevel,
          overrides: {
            tier: unifiedConfig.tier
          },
          variants: unifiedConfig.enableVariants ? {
            enabled: true,
            smartPairing: false,  // Generate all preset×layout combinations
            presets: unifiedConfig.selectedPresets,
            layouts: unifiedConfig.selectedLayouts
          } : { enabled: false },
          generateVideo: unifiedConfig.generateVideo,
          generateLogo: unifiedConfig.generateLogo,
          enablePortal: unifiedConfig.enablePortal,
          // AI Pipeline settings
          generationMode: unifiedConfig.generationMode, // 'test' or 'ai'
          aiLevel: unifiedConfig.aiLevel // 0-4
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
                setShowUnifiedModal({ open: false, prospect: null });
                setUnifiedGenerating(false);
                setUnifiedProgress(null);
                setMessage({ type: 'success', text: `Generated ${data.totalVariants || 1} variant(s) successfully!` });
                loadProspects();
                return;
              }

              if (data.step === 'error') {
                setMessage({ type: 'error', text: data.error || 'Generation failed' });
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
      setMessage({ type: 'error', text: 'Unified generation failed: ' + err.message });
    } finally {
      setUnifiedGenerating(false);
    }
  };

  const loadMasterMetrics = async (folder) => {
    try {
      const response = await fetch(`/api/scout/prospects/${folder}/master-metrics`);
      const data = await response.json();
      if (data.success) {
        setMasterMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const deleteAllVariants = async (folder) => {
    if (!confirm('Are you sure you want to delete ALL variants? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/scout/prospects/${folder}/bulk-delete-variants?all=true`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setMasterMetrics(null);
        setMessage({ type: 'success', text: `Deleted ${data.deleted.length} variants` });
        loadProspects();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const deploySelectedVariants = async (folder, variants, force = false) => {
    // Track deploying state for each variant
    const deployingState = {};
    variants.forEach(v => { deployingState[v] = true; });
    setDeployingVariants(prev => ({ ...prev, ...deployingState }));

    try {
      setMessage({ type: 'info', text: `🚀 Deploying ${variants.length} variant(s)... This may take a few minutes.` });

      const response = await fetch(`/api/scout/prospects/${folder}/deploy-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants, environment: 'test', force })
      });
      const data = await response.json();

      // Check if confirmation is required (another variant already deployed)
      if (data.requiresConfirmation) {
        // Clear deploying state while waiting for confirmation
        const clearedState = {};
        variants.forEach(v => { clearedState[v] = false; });
        setDeployingVariants(prev => ({ ...prev, ...clearedState }));

        const confirmed = window.confirm(
          `⚠️ Existing Deployment Found\n\n` +
          `"${data.existingDeployment.variant}" is already deployed to:\n${data.existingDeployment.url}\n\n` +
          `Deploying "${variants.join(', ')}" will REPLACE the existing deployment.\n\n` +
          `Continue and replace?`
        );

        if (confirmed) {
          // Retry with force=true
          return deploySelectedVariants(folder, variants, true);
        } else {
          setMessage({ type: 'info', text: 'Deployment cancelled.' });
          return;
        }
      }

      if (data.success) {
        // Build success message with URLs
        const successUrls = data.results
          .filter(r => r.success)
          .map(r => `${r.variant}: ${r.url}`)
          .join('\n');

        setMessage({
          type: 'success',
          text: `✅ Deployed ${data.deployed} variant(s)!\n${successUrls}`
        });

        // Refresh metrics to show deployed status
        loadProspects();
        if (masterMetrics?.folder === folder) {
          loadMasterMetrics(folder);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Deployment failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      // Clear deploying state
      const clearedState = {};
      variants.forEach(v => { clearedState[v] = false; });
      setDeployingVariants(prev => ({ ...prev, ...clearedState }));
    }
  };

  // Track which variants are being built
  const [buildingVariants, setBuildingVariants] = useState({});

  const buildSingleVariant = async (folder, variantKey) => {
    setBuildingVariants(prev => ({ ...prev, [variantKey]: true }));
    try {
      const response = await fetch(`/api/scout/prospects/${folder}/build-variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantKey })
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Built ${variantKey} - Preview ready!` });
        // Reload metrics to update UI
        loadMasterMetrics(folder);
      } else {
        setMessage({ type: 'error', text: `Build failed: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBuildingVariants(prev => ({ ...prev, [variantKey]: false }));
    }
  };

  const isArtisanFoodIndustry = (industry) => {
    return ARTISAN_FOOD_INDUSTRIES.some(ind =>
      industry?.toLowerCase().includes(ind) || ind.includes(industry?.toLowerCase())
    );
  };

  const toggleArchetype = (id) => {
    if (generateMultipleArchetypes) {
      setSelectedArchetypes(prev =>
        prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
      );
    } else {
      setSelectedArchetypes([id]);
    }
  };

  // Get layout options for an industry
  const getLayoutOptions = (fixtureId) => {
    const group = getIndustryGroup(fixtureId);
    const layouts = {
      'Grooming': [
        { id: 'bold-classic', name: 'Bold Classic', description: 'Dark theme with gold accents, vintage feel', preview: '🎩' },
        { id: 'modern-edge', name: 'Modern Edge', description: 'Clean lines, sharp corners, contemporary', preview: '✨' },
        { id: 'urban-vibe', name: 'Urban Vibe', description: 'Street style, bold typography, edgy', preview: '🔥' }
      ],
      'Food & Beverage': [
        { id: 'appetizing', name: 'Appetizing Visual', description: 'Food photography prominent, warm colors', preview: '📸' },
        { id: 'menu-focused', name: 'Menu Focused', description: 'Menu front and center, easy ordering', preview: '📋' },
        { id: 'story-driven', name: 'Story Driven', description: 'Tell your restaurant story', preview: '📖' }
      ],
      'Healthcare': [
        { id: 'clinical', name: 'Clinical Professional', description: 'Clean, trustworthy, calm colors', preview: '🏥' },
        { id: 'patient-first', name: 'Patient First', description: 'Warm, welcoming, accessible', preview: '💙' },
        { id: 'booking-focused', name: 'Booking Focused', description: 'Appointment scheduling prominent', preview: '📅' }
      ],
      'Fitness': [
        { id: 'motivation', name: 'Motivation Driven', description: 'Inspiring, energetic, action shots', preview: '💪' },
        { id: 'class-schedule', name: 'Class Scheduler', description: 'Schedule and booking centered', preview: '🗓️' },
        { id: 'results', name: 'Results Focused', description: 'Transformations, testimonials', preview: '🏆' }
      ],
      'Professional': [
        { id: 'trust-builder', name: 'Trust Builder', description: 'Credentials, testimonials prominent', preview: '🤝' },
        { id: 'lead-gen', name: 'Lead Generator', description: 'Form-focused, multiple CTAs', preview: '📊' },
        { id: 'corporate', name: 'Corporate Clean', description: 'Minimal, lots of whitespace', preview: '🏢' }
      ],
      'Home Services': [
        { id: 'trust-call', name: 'Trust & Call', description: 'Build trust fast, easy contact', preview: '📞' },
        { id: 'quote-gen', name: 'Quote Generator', description: 'Easy quote requests', preview: '💰' },
        { id: 'portfolio', name: 'Portfolio Showcase', description: 'Show off completed work', preview: '🖼️' }
      ],
      'Retail': [
        { id: 'product-showcase', name: 'Product Showcase', description: 'Visual grid, product focused', preview: '🛍️' },
        { id: 'brand-story', name: 'Brand Story', description: 'Tell your brand story', preview: '✨' },
        { id: 'collection', name: 'Collection View', description: 'Curated collections display', preview: '👗' }
      ],
      'Real Estate': [
        { id: 'property-search', name: 'Property Search', description: 'Search and listings prominent', preview: '🔍' },
        { id: 'agent-focused', name: 'Agent Focused', description: 'Agent credibility centered', preview: '👤' },
        { id: 'market-stats', name: 'Market Stats', description: 'Data and market info', preview: '📈' }
      ],
      'Other': [
        { id: 'modern-clean', name: 'Modern Clean', description: 'Clean, professional, versatile', preview: '✨' },
        { id: 'visual-first', name: 'Visual First', description: 'Image-heavy, gallery style', preview: '📷' },
        { id: 'content-focused', name: 'Content Focused', description: 'Text and information centered', preview: '📄' }
      ]
    };
    return layouts[group] || layouts['Other'];
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    try {
      const res = await fetch('/api/scout/prospects');
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (err) {
      console.error('Failed to load prospects:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (folder) => {
    const newSelected = new Set(selected);
    if (newSelected.has(folder)) {
      newSelected.delete(folder);
    } else {
      newSelected.add(folder);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === sortedProspects.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sortedProspects.map(p => p.folder)));
    }
  };

  const generateTest = async (folder, fullStack = false) => {
    setProcessing(true);
    const endpoint = fullStack
      ? `/api/scout/prospects/${folder}/generate-full-test`
      : `/api/scout/prospects/${folder}/generate-test`;
    const label = fullStack ? 'Full stack test' : 'Test';

    setMessage({ type: 'info', text: `Generating ${label} for ${folder}...` });

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `${label} generated for ${folder}` });
        loadProspects();
      } else {
        setMessage({ type: 'error', text: data.error || data.errors?.join(', ') || 'Generation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const deployProspect = async (folder) => {
    setProcessing(true);
    setMessage({ type: 'info', text: `Deploying ${folder}...` });
    try {
      const res = await fetch(`/api/scout/prospects/${folder}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: 'test' })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Deployed! ${data.url}` });
        loadProspects();
        // Open in new tab
        if (data.url) window.open(data.url, '_blank');
      } else {
        setMessage({ type: 'error', text: data.error || 'Deploy failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 8000);
    }
  };

  const batchGenerateTest = async () => {
    if (selected.size === 0) return;

    setProcessing(true);
    setMessage({ type: 'info', text: `Generating ${selected.size} test sites...` });

    try {
      const res = await fetch('/api/scout/prospects/batch-generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: Array.from(selected) })
      });
      const data = await res.json();

      setMessage({
        type: data.success ? 'success' : 'warning',
        text: `Generated: ${data.generated}, Failed: ${data.failed}`
      });

      setSelected(new Set());
      loadProspects();

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const verifyProspect = async (folder) => {
    try {
      await fetch(`/api/scout/prospects/${folder}/verify`, { method: 'POST' });
      loadProspects();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProspect = async (folder) => {
    if (!confirm(`Delete ${folder}?`)) return;

    try {
      await fetch(`/api/scout/prospects/${folder}`, { method: 'DELETE' });
      loadProspects();
    } catch (err) {
      console.error(err);
    }
  };

  // Copy test instructions to clipboard for Claude browser extension
  const copyTestInstructions = async (folder, deployedUrl) => {
    try {
      // First try to fetch existing instructions
      let instructions;
      try {
        const res = await fetch(`/api/browser-test/instructions/${folder}`);
        if (res.ok) {
          const data = await res.json();
          instructions = data.content;
        }
      } catch (e) {
        // Instructions don't exist, generate them
      }

      // If no instructions exist, generate them first
      if (!instructions) {
        setMessage({ type: 'info', text: `Generating test instructions for ${folder}...` });
        const genRes = await fetch('/api/browser-test/generate-manifest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder, deployedUrl, source: 'prospects' })
        });
        const genData = await genRes.json();
        if (genData.success) {
          instructions = genData.manifest.instructions;
        } else {
          throw new Error(genData.error || 'Failed to generate test manifest');
        }
      }

      // Format for Claude browser extension
      const clipboardText = `🧪 TEST THIS BLINK WEBSITE

I need you to test this deployed website and report any issues.

${instructions}

After testing, give me a summary of:
- Pages that work/don't work
- Forms that work/don't work
- Any console errors
- Mobile responsiveness issues
- Overall pass/fail status`;

      await navigator.clipboard.writeText(clipboardText);
      setMessage({ type: 'success', text: `📋 Test instructions copied! Paste into Claude browser extension sidebar.` });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to copy: ${err.message}` });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const resetProspect = async (folder) => {
    if (!confirm(`Reset ${folder} to scouted status? This will delete all generated files.`)) return;

    setProcessing(true);
    setMessage({ type: 'info', text: `Resetting ${folder}...` });

    try {
      const res = await fetch(`/api/scout/prospects/${folder}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `${folder} reset to scouted` });
        loadProspects();
      } else {
        setMessage({ type: 'error', text: data.error || 'Reset failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Open Test Package modal (Full Stack with tier selection)
  const openTestModal = (prospect) => {
    setTestModal({ open: true, prospect });
    setSelectedTestTier('premium'); // Default to premium for full testing
    // Set default layout based on industry
    const layouts = getLayoutOptions(prospect.fixtureId);
    setSelectedLayout(layouts[0]?.id || null);
  };

  const closeTestModal = () => {
    setTestModal({ open: false, prospect: null });
    setSelectedLayout(null);
  };

  // Execute Full Stack Test with selected package and layout
  const executeTestGeneration = async () => {
    if (!testModal.prospect) return;

    const { folder, fixtureId, name } = testModal.prospect;
    const industryPackage = getIndustryPackage(fixtureId);
    const tierPackage = industryPackage[selectedTestTier];
    const industryGroup = getIndustryGroup(fixtureId);
    const isArtisan = isArtisanFoodIndustry(fixtureId);

    setTestGenerating(true);

    // Handle multiple archetype generation
    if (isArtisan && generateMultipleArchetypes && selectedArchetypes.length > 1) {
      setMessage({ type: 'info', text: `🏗️ Generating ${selectedArchetypes.length} style variants for ${name}...` });

      const variants = [];
      for (let i = 0; i < selectedArchetypes.length; i++) {
        const archetypeId = selectedArchetypes[i];
        const archetype = ARCHETYPES.find(a => a.id === archetypeId);
        const isFirstVariant = i === 0;
        setMessage({ type: 'info', text: `🏗️ Generating ${archetype?.name || archetypeId} variant (${i + 1}/${selectedArchetypes.length})...` });

        try {
          const res = await fetch(`/api/scout/prospects/${folder}/generate-full-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier: selectedTestTier,
              pages: tierPackage.pages,
              features: tierPackage.features,
              layout: selectedLayout,
              industryGroup: industryGroup,
              moodSliders: moodSliders,
              archetype: archetypeId,
              enablePortal: enablePortal,
              variantSuffix: `-${archetypeId}`, // Append archetype to project name
              // Only generate video/logo for first variant (same content for all)
              skipVideo: !isFirstVariant,
              skipLogo: !isFirstVariant
            })
          });

          const data = await res.json();
          variants.push({
            archetype: archetypeId,
            archetypeName: archetype?.name,
            success: data.success,
            projectPath: data.projectPath,
            error: data.error
          });
        } catch (err) {
          variants.push({ archetype: archetypeId, success: false, error: err.message });
        }
      }

      setGeneratedVariants(variants);
      const successCount = variants.filter(v => v.success).length;

      if (successCount > 0) {
        // Close test modal and show variant preview modal
        closeTestModal();
        setVariantPreviewModal({
          open: true,
          prospect: testModal.prospect,
          variants: variants.filter(v => v.success)
        });
      }

      setMessage({
        type: successCount > 0 ? 'success' : 'error',
        text: successCount > 0
          ? `✅ Generated ${successCount} style variants! Click the preview buttons to compare.`
          : `❌ Failed to generate variants.`
      });
      loadProspects();

    } else {
      // Single archetype generation
      const archetype = isArtisan ? selectedArchetypes[0] : null;
      setMessage({ type: 'info', text: `🏗️ Generating ${selectedTestTier} full-stack test for ${name}... (Zero AI cost)` });

      try {
        const res = await fetch(`/api/scout/prospects/${folder}/generate-full-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: selectedTestTier,
            pages: tierPackage.pages,
            features: tierPackage.features,
            layout: selectedLayout,
            industryGroup: industryGroup,
            moodSliders: moodSliders,
            archetype: archetype,
            enablePortal: enablePortal
          })
        });

        const data = await res.json();

        if (data.success) {
          const archetypeName = archetype ? ARCHETYPES.find(a => a.id === archetype)?.name : '';
          setMessage({
            type: 'success',
            text: `🎉 Full-stack ${selectedTestTier} test generated for ${name}${archetypeName ? ` with ${archetypeName} style` : ''}!`
          });
          closeTestModal();
          loadProspects();
        } else {
          setMessage({ type: 'error', text: data.error || data.errors?.join(', ') || 'Generation failed' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    }

    setTestGenerating(false);
    setTimeout(() => setMessage(null), 8000);
  };

  // Open AI Generation modal
  const openAiModal = (prospect) => {
    setAiModal({ open: true, prospect });
    setSelectedTier('recommended');
  };

  // Close AI Modal
  const closeAiModal = () => {
    setAiModal({ open: false, prospect: null });
  };

  // Execute AI generation
  const executeAiGeneration = async () => {
    if (!aiModal.prospect) return;

    const { folder, fixtureId, name } = aiModal.prospect;
    const industryPackage = getIndustryPackage(fixtureId);
    const tierPackage = industryPackage[selectedTier];

    setAiGenerating(true);
    setMessage({ type: 'info', text: `🤖 AI generating ${name} (${selectedTier} tier)... This uses Claude API (~$${tierPackage.cost.toFixed(2)})` });

    try {
      const res = await fetch(`/api/scout/prospects/${folder}/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          pages: tierPackage.pages,
          features: tierPackage.features
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `🎉 AI generated ${name} with ${tierPackage.pages.length} pages!` });
        closeAiModal();
        loadProspects();
      } else {
        setMessage({ type: 'error', text: data.error || 'AI generation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setAiGenerating(false);
      setTimeout(() => setMessage(null), 8000);
    }
  };

  // Load existing variants for a prospect and open the compare modal
  const loadExistingVariants = async (prospect) => {
    try {
      const res = await fetch(`/api/scout/prospects/${prospect.folder}/variants`);
      const data = await res.json();

      if (data.success && data.variants.length > 0) {
        setVariantPreviewModal({
          open: true,
          prospect: {
            name: prospect.name,
            folder: prospect.folder,
            fixtureId: prospect.fixtureId
          },
          variants: data.variants,
          stats: data.stats,
          viewMode: 'cards'
        });
      } else {
        // No variants found, open full screen compare which will show the message
        window.open(`/prospect-compare/${prospect.folder}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to load variants:', err);
      // Fallback to opening the compare page directly
      window.open(`/prospect-compare/${prospect.folder}`, '_blank');
    }
  };

  // Get unique industries and cities for filter dropdowns
  const uniqueIndustries = [...new Set(prospects.map(p => p.fixtureId).filter(Boolean))].sort();
  const uniqueCities = [...new Set(prospects.map(p => extractCity(p.address)).filter(c => c !== 'Unknown'))].sort();
  const uniqueIndustryGroups = [...new Set(prospects.map(p => getIndustryGroup(p.fixtureId)))].sort();

  // Multi-layer filtering
  const filteredProspects = prospects.filter(p => {
    // Status filter
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    // Industry filter (can be specific industry or group)
    if (industryFilter !== 'all') {
      if (INDUSTRY_GROUPS[industryFilter]) {
        // It's a group filter
        if (!INDUSTRY_GROUPS[industryFilter].includes(p.fixtureId)) return false;
      } else {
        // It's a specific industry filter
        if (p.fixtureId !== industryFilter) return false;
      }
    }
    // City filter
    if (cityFilter !== 'all' && extractCity(p.address) !== cityFilter) return false;
    return true;
  });

  // Sorting
  const sortedProspects = [...filteredProspects].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'rating':
        comparison = (b.rating || 0) - (a.rating || 0);
        break;
      case 'industry':
        comparison = (a.fixtureId || '').localeCompare(b.fixtureId || '');
        break;
      case 'city':
        comparison = extractCity(a.address).localeCompare(extractCity(b.address));
        break;
      case 'status':
        const statusOrder = ['scouted', 'test-generated', 'verified', 'ai-generated', 'deployed'];
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Group by industry if enabled
  const groupedProspects = groupByIndustry
    ? sortedProspects.reduce((acc, p) => {
        const group = getIndustryGroup(p.fixtureId);
        if (!acc[group]) acc[group] = [];
        acc[group].push(p);
        return acc;
      }, {})
    : null;

  // Stats
  const stats = {
    total: prospects.length,
    scouted: prospects.filter(p => p.status === 'scouted').length,
    testGenerated: prospects.filter(p => p.status === 'test-generated').length,
    verified: prospects.filter(p => p.status === 'verified').length,
    aiGenerated: prospects.filter(p => p.status === 'ai-generated').length,
    deployed: prospects.filter(p => p.status === 'deployed').length
  };

  if (loading) {
    return <div style={styles.loading}>Loading prospects...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Prospect Pipeline</h2>
          <p style={styles.subtitle}>{prospects.length} prospects in pipeline</p>
        </div>
        <button onClick={loadProspects} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{
          ...styles.message,
          background: message.type === 'success' ? '#D1FAE5' :
                     message.type === 'error' ? '#FEE2E2' :
                     message.type === 'warning' ? '#FEF3C7' : '#DBEAFE',
          color: message.type === 'success' ? '#065F46' :
                 message.type === 'error' ? '#DC2626' :
                 message.type === 'warning' ? '#92400E' : '#1E40AF'
        }}>
          {message.text}
        </div>
      )}

      {/* AI Generation Modal */}
      {aiModal.open && aiModal.prospect && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>🤖 AI Generate Website</h3>
              <button onClick={closeAiModal} style={styles.closeBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.prospectInfo}>
                <strong>{aiModal.prospect.name}</strong>
                <span style={styles.industryTag}>
                  {INDUSTRY_ICONS[aiModal.prospect.fixtureId] || '📍'} {aiModal.prospect.fixtureId}
                </span>
              </div>

              <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                This will use Claude AI to generate a unique, custom-designed website.
                Select a tier based on the features you need:
              </p>

              {/* Tier Selection */}
              <div style={styles.tierGrid}>
                {['essential', 'recommended', 'premium'].map(tier => {
                  const pkg = getIndustryPackage(aiModal.prospect.fixtureId)[tier];
                  const isSelected = selectedTier === tier;
                  return (
                    <div
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        ...styles.tierCard,
                        borderColor: isSelected ? (tier === 'essential' ? '#22C55E' : tier === 'recommended' ? '#6366F1' : '#8B5CF6') : '#E5E7EB',
                        background: isSelected ? (tier === 'essential' ? '#F0FDF4' : tier === 'recommended' ? '#EEF2FF' : '#FAF5FF') : '#fff'
                      }}
                    >
                      <div style={styles.tierHeader}>
                        <span style={{ fontSize: '24px' }}>
                          {tier === 'essential' ? '⚡' : tier === 'recommended' ? '⭐' : '💎'}
                        </span>
                        <span style={{
                          ...styles.tierName,
                          color: tier === 'essential' ? '#22C55E' : tier === 'recommended' ? '#6366F1' : '#8B5CF6'
                        }}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </span>
                        {tier === 'recommended' && (
                          <span style={styles.recommendedBadge}>Best Value</span>
                        )}
                      </div>

                      <div style={styles.tierCost}>
                        ~${pkg.cost.toFixed(2)}
                        <span style={{ fontSize: '12px', color: '#6B7280' }}> API cost</span>
                      </div>

                      <div style={styles.tierPages}>
                        <strong>{pkg.pages.length} Pages:</strong>
                        <div style={styles.pageList}>
                          {pkg.pages.map((page, i) => (
                            <span key={i} style={styles.pageTag}>{page}</span>
                          ))}
                        </div>
                      </div>

                      <div style={styles.tierFeatures}>
                        <strong>Features:</strong>
                        <ul style={styles.featureList}>
                          {pkg.features.map((feature, i) => (
                            <li key={i}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeAiModal} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={executeAiGeneration}
                disabled={aiGenerating}
                style={{
                  ...styles.generateBtn,
                  opacity: aiGenerating ? 0.7 : 1
                }}
              >
                {aiGenerating ? '⏳ Generating...' : `🤖 Generate ${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Site`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Package Modal - Full Stack with tier selection */}
      {testModal.open && testModal.prospect && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>🏗️ Full Stack Test Generation</h3>
              <button onClick={closeTestModal} style={styles.closeBtn}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.prospectInfo}>
                <strong>{testModal.prospect.name}</strong>
                <span style={styles.industryTag}>
                  {INDUSTRY_ICONS[testModal.prospect.fixtureId] || '📍'} {testModal.prospect.fixtureId}
                </span>
                <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                  ⚡ ZERO AI COST
                </span>
              </div>

              <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                Generate a complete full-stack test site with the features for your selected package.
                <strong> This uses fixture data - no AI cost!</strong> Test login, admin, ordering, everything.
              </p>

              {/* Tier Selection */}
              <div style={styles.tierGrid}>
                {['essential', 'recommended', 'premium'].map(tier => {
                  const pkg = getIndustryPackage(testModal.prospect.fixtureId)[tier];
                  const isSelected = selectedTestTier === tier;
                  return (
                    <div
                      key={tier}
                      onClick={() => setSelectedTestTier(tier)}
                      style={{
                        ...styles.tierCard,
                        borderColor: isSelected ? (tier === 'essential' ? '#22C55E' : tier === 'recommended' ? '#6366F1' : '#8B5CF6') : '#E5E7EB',
                        background: isSelected ? (tier === 'essential' ? '#F0FDF4' : tier === 'recommended' ? '#EEF2FF' : '#FAF5FF') : '#fff'
                      }}
                    >
                      <div style={styles.tierHeader}>
                        <span style={{ fontSize: '24px' }}>
                          {tier === 'essential' ? '⚡' : tier === 'recommended' ? '⭐' : '💎'}
                        </span>
                        <span style={{
                          ...styles.tierName,
                          color: tier === 'essential' ? '#22C55E' : tier === 'recommended' ? '#6366F1' : '#8B5CF6'
                        }}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </span>
                        {tier === 'premium' && (
                          <span style={{ ...styles.recommendedBadge, background: '#8B5CF6' }}>Full Test</span>
                        )}
                      </div>

                      <div style={{ ...styles.tierCost, color: '#10B981' }}>
                        $0.00
                        <span style={{ fontSize: '12px', color: '#6B7280' }}> test mode</span>
                      </div>

                      <div style={styles.tierPages}>
                        <strong>{pkg.pages.length} Pages:</strong>
                        <div style={styles.pageList}>
                          {pkg.pages.map((page, i) => (
                            <span key={i} style={styles.pageTag}>{page}</span>
                          ))}
                        </div>
                      </div>

                      <div style={styles.tierFeatures}>
                        <strong>Features to Test:</strong>
                        <ul style={styles.featureList}>
                          {pkg.features.map((feature, i) => (
                            <li key={i}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Layout Selection */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  🎨 Choose Layout Style
                  <span style={{ marginLeft: '8px', fontWeight: '400', color: '#6B7280' }}>
                    ({getIndustryGroup(testModal.prospect.fixtureId)} layouts)
                  </span>
                </h4>
                <div style={styles.layoutGrid}>
                  {getLayoutOptions(testModal.prospect.fixtureId).map(layout => (
                    <div
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      style={{
                        ...styles.layoutCard,
                        borderColor: selectedLayout === layout.id ? '#7C3AED' : '#E5E7EB',
                        background: selectedLayout === layout.id ? '#FAF5FF' : '#fff'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{layout.preview}</span>
                      <div style={styles.layoutInfo}>
                        <strong style={{ color: selectedLayout === layout.id ? '#7C3AED' : '#374151' }}>
                          {layout.name}
                        </strong>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{layout.description}</span>
                      </div>
                      {selectedLayout === layout.id && (
                        <span style={{ color: '#7C3AED', fontSize: '18px' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetype Selection for Artisan Food Industries */}
              {isArtisanFoodIndustry(testModal.prospect.fixtureId) && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      🎨 Choose Layout Archetype
                      <span style={{ marginLeft: '8px', fontWeight: '400', color: '#6B7280' }}>
                        (based on top bakery sites)
                      </span>
                    </h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={generateMultipleArchetypes}
                        onChange={(e) => {
                          setGenerateMultipleArchetypes(e.target.checked);
                          if (!e.target.checked && selectedArchetypes.length > 1) {
                            setSelectedArchetypes([selectedArchetypes[0]]);
                          }
                        }}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ color: '#6B7280' }}>Generate multiple for comparison</span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {ARCHETYPES.map(arch => {
                      const isSelected = selectedArchetypes.includes(arch.id);
                      return (
                        <div
                          key={arch.id}
                          onClick={() => toggleArchetype(arch.id)}
                          style={{
                            padding: '16px',
                            border: `2px solid ${isSelected ? arch.color : '#E5E7EB'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: isSelected ? `${arch.color}15` : '#fff',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            {generateMultipleArchetypes && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleArchetype(arch.id)}
                                style={{ width: '16px', height: '16px' }}
                              />
                            )}
                            <span style={{ fontSize: '20px' }}>{arch.icon}</span>
                            <strong style={{ color: isSelected ? arch.color : '#374151', fontSize: '14px' }}>
                              {arch.name}
                            </strong>
                          </div>
                          <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 4px 0' }}>
                            {arch.description}
                          </p>
                          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, fontStyle: 'italic' }}>
                            Examples: {arch.examples}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {generateMultipleArchetypes && selectedArchetypes.length > 1 && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px 16px',
                      background: '#EFF6FF',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#1E40AF'
                    }}>
                      <strong>Multi-variant mode:</strong> Will generate {selectedArchetypes.length} separate projects
                      ({selectedArchetypes.map(a => ARCHETYPES.find(ar => ar.id === a)?.name).join(', ')})
                      for side-by-side comparison before deployment.
                    </div>
                  )}

                  {/* 18-Variant Generator Option */}
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>🎨 Advanced: 18-Variant Generator</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                          Generate 6 style presets × 3 themes for comprehensive comparison
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShow18VariantModal({ open: true, prospect: testModal.prospect });
                          setSelected18Variants(new Set(getAllVariantKeys(testModal.prospect)));
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        Open 18-Variant Selector →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mood Sliders for styling */}
              <MoodSliders
                values={moodSliders}
                onChange={setMoodSliders}
                compact={true}
              />

              {/* 18-Variant Generator - Available for ALL industries */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                borderRadius: '12px',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '14px' }}>🎨 18-Variant Generator</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>
                      Generate 6 style presets × 3 themes for comprehensive A/B testing
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShow18VariantModal({ open: true, prospect: testModal.prospect });
                      setSelected18Variants(new Set(getAllVariantKeys(testModal.prospect)));
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Open Selector →
                  </button>
                </div>
              </div>

              {/* Portal/Auth Toggle */}
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '18px' }}>🔐</span>
                      <strong style={{ fontSize: '15px' }}>Login Portal & User Accounts</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                      Adds login, register, dashboard, profile pages + auth system
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', opacity: 0.9 }}>{enablePortal ? 'Enabled' : 'Disabled'}</span>
                    <div
                      onClick={() => setEnablePortal(!enablePortal)}
                      style={{
                        width: '50px',
                        height: '28px',
                        borderRadius: '14px',
                        backgroundColor: enablePortal ? '#10B981' : 'rgba(255,255,255,0.3)',
                        position: 'relative',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: enablePortal ? '24px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </label>
                </div>
                {enablePortal && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {['Login', 'Register', 'Dashboard', 'Profile', 'Orders', 'Rewards'].map(page => (
                      <span key={page} style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {page}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', padding: '16px', background: '#FEF3C7', borderRadius: '8px', fontSize: '14px' }}>
                <strong>💡 Tip:</strong> Select <strong>Premium</strong> to test ALL features including booking,
                ordering, and more. {isArtisanFoodIndustry(testModal.prospect.fixtureId) &&
                  'For bakeries, try different archetypes to see which style fits best!'
                }
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={closeTestModal} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={executeTestGeneration}
                disabled={testGenerating}
                style={{
                  ...styles.generateBtn,
                  background: '#7C3AED',
                  opacity: testGenerating ? 0.7 : 1
                }}
              >
                {testGenerating ? '⏳ Generating...' : `🏗️ Generate ${selectedTestTier.charAt(0).toUpperCase() + selectedTestTier.slice(1)} Test`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Preview Modal - for comparing multiple archetype variants */}
      {variantPreviewModal.open && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '1100px' }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                🎨 Compare Style Variants - {variantPreviewModal.prospect?.name}
              </h2>
              <button
                onClick={() => setVariantPreviewModal({ open: false, prospect: null, variants: [] })}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#F3F4F6',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setVariantPreviewModal(prev => ({ ...prev, viewMode: 'cards' }))}
                    style={{
                      padding: '8px 16px',
                      background: (variantPreviewModal.viewMode || 'cards') === 'cards' ? '#3B82F6' : '#fff',
                      color: (variantPreviewModal.viewMode || 'cards') === 'cards' ? '#fff' : '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    🎴 Variant Cards
                  </button>
                  <button
                    onClick={() => setVariantPreviewModal(prev => ({ ...prev, viewMode: 'pages' }))}
                    style={{
                      padding: '8px 16px',
                      background: variantPreviewModal.viewMode === 'pages' ? '#3B82F6' : '#fff',
                      color: variantPreviewModal.viewMode === 'pages' ? '#fff' : '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    📑 All Pages Index
                  </button>
                  <button
                    onClick={() => setVariantPreviewModal(prev => ({ ...prev, viewMode: 'metrics' }))}
                    style={{
                      padding: '8px 16px',
                      background: variantPreviewModal.viewMode === 'metrics' ? '#3B82F6' : '#fff',
                      color: variantPreviewModal.viewMode === 'metrics' ? '#fff' : '#374151',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px'
                    }}
                  >
                    📊 Metrics
                  </button>
                </div>
                <button
                  onClick={() => window.open(`/prospect-compare/${variantPreviewModal.prospect?.folder}`, '_blank')}
                  style={{
                    padding: '8px 16px',
                    background: '#1e293b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px'
                  }}
                >
                  🖥️ Full Screen Compare
                </button>
              </div>

              {/* Pages Index View */}
              {variantPreviewModal.viewMode === 'pages' && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '16px', color: '#6B7280', fontSize: '14px' }}>
                    Quick access to all pages across all style variants. Click any page to preview.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${variantPreviewModal.variants.length}, 1fr)`,
                    gap: '16px'
                  }}>
                    {variantPreviewModal.variants.map((variant) => {
                      const variantKey = getVariantKey(variant);
                      const variantInfo = getVariantInfo(variant);
                      const baseUrl = `/prospect-preview/${variantPreviewModal.prospect?.folder}/full-test-${variantKey}/frontend`;
                      const pages = [
                        { name: 'Home', path: '/', icon: '🏠' },
                        { name: 'Menu', path: '/menu', icon: '📋' },
                        { name: 'About', path: '/about', icon: 'ℹ️' },
                        { name: 'Gallery', path: '/gallery', icon: '🖼️' },
                        { name: 'Contact', path: '/contact', icon: '📞' },
                        { name: 'Order Online', path: '/order-online', icon: '🛒' },
                        { name: 'Catering', path: '/catering', icon: '🍽️' },
                        { name: 'Dashboard', path: '/dashboard', icon: '📊' }
                      ];

                      return (
                        <div key={variantKey} style={{
                          border: `2px solid ${variantInfo.color}`,
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            padding: '12px 16px',
                            background: variantInfo.color,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '20px' }}>{variantInfo.icon}</span>
                            <strong>{variantInfo.name}</strong>
                          </div>
                          <div style={{ padding: '8px' }}>
                            {pages.map(page => (
                              <button
                                key={page.path}
                                onClick={() => window.open(`${baseUrl}#${page.path}`, '_blank')}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '10px 12px',
                                  background: '#fff',
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '6px',
                                  marginBottom: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  textAlign: 'left',
                                  transition: 'all 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#F3F4F6'}
                                onMouseOut={e => e.currentTarget.style.background = '#fff'}
                              >
                                <span>{page.icon}</span>
                                <span style={{ flex: 1 }}>{page.name}</span>
                                <span style={{ color: '#9CA3AF', fontSize: '11px' }}>→</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Metrics View */}
              {variantPreviewModal.viewMode === 'metrics' && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '16px', color: '#6B7280', fontSize: '14px' }}>
                    Generation metrics and statistics for all variants.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#3B82F6' }}>
                        {variantPreviewModal.stats?.variantCount || variantPreviewModal.variants.length}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Variants Generated</div>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#22C55E' }}>
                        {variantPreviewModal.stats?.totalPages || variantPreviewModal.variants.length * 7}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Pages</div>
                    </div>
                    <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#F59E0B' }}>
                        {variantPreviewModal.stats?.videoCount || 1}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Video Generated</div>
                    </div>
                    <div style={{ background: '#FDF2F8', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#EC4899' }}>
                        {variantPreviewModal.stats?.logoCount || 7}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>Logo Variants</div>
                    </div>
                  </div>

                  <div style={{
                    background: '#F9FAFB',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#374151' }}>Per-Variant Breakdown</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                          <th style={{ textAlign: 'left', padding: '8px', color: '#6B7280' }}>Variant</th>
                          <th style={{ textAlign: 'center', padding: '8px', color: '#6B7280' }}>Style</th>
                          <th style={{ textAlign: 'center', padding: '8px', color: '#6B7280' }}>Pages</th>
                          <th style={{ textAlign: 'center', padding: '8px', color: '#6B7280' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '8px', color: '#6B7280' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variantPreviewModal.variants.map((variant) => {
                          const variantKey = getVariantKey(variant);
                          const variantInfo = getVariantInfo(variant);
                          return (
                            <tr key={variantKey} style={{ borderBottom: '1px solid #E5E7EB' }}>
                              <td style={{ padding: '10px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{variantInfo.icon}</span>
                                  <strong>{variantInfo.name}</strong>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: '8px' }}>
                                <span style={{
                                  background: variantInfo.color,
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px'
                                }}>
                                  {variantKey}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '8px' }}>7</td>
                              <td style={{ textAlign: 'center', padding: '8px' }}>
                                <span style={{ color: '#22C55E' }}>✓ Ready</span>
                              </td>
                              <td style={{ textAlign: 'right', padding: '8px' }}>
                                <button
                                  onClick={() => window.open(`/prospect-preview/${variantPreviewModal.prospect?.folder}/full-test-${variantKey}/frontend/`, '_blank')}
                                  style={{
                                    padding: '4px 10px',
                                    background: variantInfo.color,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    marginRight: '6px'
                                  }}
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => window.open(`/prospect-preview/${variantPreviewModal.prospect?.folder}/full-test-${variantKey}/frontend/_index`, '_blank')}
                                  style={{
                                    padding: '4px 10px',
                                    background: '#6B7280',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Stats
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Default Cards View */}
              {(variantPreviewModal.viewMode || 'cards') === 'cards' && (
                <>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {variantPreviewModal.variants.map((variant) => {
                  const variantKey = getVariantKey(variant);
                  const variantInfo = getVariantInfo(variant);
                  const isDeploying = deployingVariants[variantKey];
                  const variantFolder = `${variantPreviewModal.prospect?.folder}-${variantKey}`;

                  return (
                    <div
                      key={variantKey}
                      style={{
                        border: `2px solid ${variantInfo.color}`,
                        borderRadius: '12px',
                        padding: '20px',
                        background: `linear-gradient(135deg, ${variantInfo.color}10, #fff)`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{variantInfo.icon}</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                            {variantInfo.name}
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                            {variantInfo.description}
                          </p>
                        </div>
                      </div>

                      <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '16px' }}>
                        {variantInfo.examples ? `Examples: ${variantInfo.examples}` : `Key: ${variantKey}`}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => window.open(`/prospect-preview/${variantPreviewModal.prospect?.folder}/full-test-${variantKey}/frontend/`, '_blank')}
                          style={{
                            padding: '10px 16px',
                            background: variantInfo.color,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '14px'
                          }}
                        >
                          👁️ Preview Site
                        </button>

                        <button
                          onClick={async () => {
                            setDeployingVariants(prev => ({ ...prev, [variantKey]: true }));
                            try {
                              const res = await fetch(`/api/scout/prospects/${variantPreviewModal.prospect?.folder}/deploy`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  variantSuffix: `-${variantKey}`,
                                  projectName: `${variantPreviewModal.prospect?.folder}-${variantKey}`
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setMessage({ type: 'success', text: `🚀 ${variantInfo.name} variant deployed!` });
                              } else {
                                setMessage({ type: 'error', text: data.error || 'Deploy failed' });
                              }
                            } catch (err) {
                              setMessage({ type: 'error', text: err.message });
                            }
                            setDeployingVariants(prev => ({ ...prev, [variantKey]: false }));
                          }}
                          disabled={isDeploying}
                          style={{
                            padding: '10px 16px',
                            background: '#10B981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isDeploying ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                            fontSize: '14px',
                            opacity: isDeploying ? 0.7 : 1
                          }}
                        >
                          {isDeploying ? '⏳ Deploying...' : '🚀 Deploy This Variant'}
                        </button>

                        <button
                          onClick={async () => {
                            if (!confirm(`Delete ${variantInfo.name} variant? This removes local files.`)) return;
                            try {
                              const testDir = `full-test-${variantKey}`;
                              // Delete the variant's test directory
                              await fetch(`/api/scout/prospects/${variantPreviewModal.prospect?.folder}/delete-variant`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ variantSuffix: `-${variantKey}` })
                              });
                              // Remove from variants list
                              setVariantPreviewModal(prev => ({
                                ...prev,
                                variants: prev.variants.filter(v => getVariantKey(v) !== variantKey)
                              }));
                              setMessage({ type: 'success', text: `🗑️ ${variantInfo.name} variant deleted` });
                            } catch (err) {
                              setMessage({ type: 'error', text: err.message });
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: '#EF4444',
                            border: '1px solid #EF4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {variantPreviewModal.variants.length > 1 && (
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: '#F3F4F6',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={async () => {
                      if (!confirm('Deploy ALL variants? This will create multiple deployments.')) return;
                      for (const variant of variantPreviewModal.variants) {
                        const vKey = getVariantKey(variant);
                        setDeployingVariants(prev => ({ ...prev, [vKey]: true }));
                        try {
                          await fetch(`/api/scout/prospects/${variantPreviewModal.prospect?.folder}/deploy`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              variantSuffix: `-${vKey}`,
                              projectName: `${variantPreviewModal.prospect?.folder}-${vKey}`
                            })
                          });
                        } catch (err) {
                          console.error(err);
                        }
                        setDeployingVariants(prev => ({ ...prev, [vKey]: false }));
                      }
                      setMessage({ type: 'success', text: `🚀 All ${variantPreviewModal.variants.length} variants deployed!` });
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#10B981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🚀 Deploy All Variants
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm('Delete ALL variants? This removes all local files.')) return;
                      for (const variant of variantPreviewModal.variants) {
                        const vKey = getVariantKey(variant);
                        try {
                          await fetch(`/api/scout/prospects/${variantPreviewModal.prospect?.folder}/delete-variant`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ variantSuffix: `-${vKey}` })
                          });
                        } catch (err) {
                          console.error(err);
                        }
                      }
                      setVariantPreviewModal({ open: false, prospect: null, variants: [] });
                      setMessage({ type: 'success', text: '🗑️ All variants deleted' });
                      loadProspects();
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#EF4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🗑️ Delete All
                  </button>
                </div>
              )}
              </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setVariantPreviewModal({ open: false, prospect: null, variants: [] })}
                style={styles.cancelBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 18-Variant Selector Modal */}
      {show18VariantModal.open && show18VariantModal.prospect && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '1100px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>
                🎨 Generate 18 Style Variants - {show18VariantModal.prospect.name}
              </h3>
              <button
                onClick={() => setShow18VariantModal({ open: false, prospect: null })}
                style={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Quick Select Buttons */}
              {(() => {
                const layouts = getLayoutsForProspect(show18VariantModal.prospect);
                return (
                  <>
                    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={selectAllVariants} style={styles.quickSelectBtn}>
                        Select All (18)
                      </button>
                      <button onClick={clearAllVariants} style={styles.quickSelectBtn}>
                        Clear All
                      </button>
                      <span style={{ borderLeft: '1px solid #E5E7EB', margin: '0 8px' }} />
                      {layouts.map(layout => (
                        <button
                          key={layout.id}
                          onClick={() => selectAllOfLayout(layout.id)}
                          style={{ ...styles.quickSelectBtn, background: '#E0E7FF', color: '#3730A3' }}
                          title={layout.description}
                        >
                          {layout.icon} All {layout.name} (6)
                        </button>
                      ))}
                      <span style={{ borderLeft: '1px solid #E5E7EB', margin: '0 8px' }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={skipBuild}
                          onChange={(e) => setSkipBuild(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        ⚡ Skip Build (faster testing)
                      </label>
                    </div>

                    {/* Matrix Grid: Presets (rows) × Layouts (columns) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(160px, 200px) repeat(3, 1fr)',
                      gap: '8px'
                    }}>
                      {/* Header Row - Layouts */}
                      <div></div>
                      {layouts.map(layout => (
                        <div
                          key={layout.id}
                          style={{
                            textAlign: 'center',
                            padding: '12px',
                            background: '#E0E7FF',
                            color: '#3730A3',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                          title={layout.description}
                        >
                          {layout.icon} {layout.name}
                        </div>
                      ))}

                      {/* Rows - Presets */}
                      {VARIANT_PRESETS.map(preset => (
                        <React.Fragment key={preset.id}>
                          {/* Preset Label */}
                          <div
                            onClick={() => selectAllOfPreset(preset.id)}
                            style={{
                              padding: '12px 16px',
                              background: `${preset.color}15`,
                              borderRadius: '8px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              border: `1px solid ${preset.color}30`,
                              fontSize: '13px'
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>{preset.icon}</span>
                            <span style={{ color: preset.color }}>{preset.name}</span>
                          </div>

                          {/* Variant Cells */}
                          {layouts.map(layout => {
                            const variantKey = `${preset.id}-${layout.id}`;
                            const isSelected = selected18Variants.has(variantKey);

                            return (
                              <div
                                key={variantKey}
                                onClick={() => toggle18Variant(variantKey)}
                                style={{
                                  padding: '16px',
                                  background: isSelected ? `${preset.color}25` : '#fff',
                                  border: `2px solid ${isSelected ? preset.color : '#E5E7EB'}`,
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  position: 'relative'
                                }}
                        >
                          {isSelected && (
                            <span style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: preset.color,
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}>
                              ✓
                            </span>
                          )}
                          <div style={{
                            fontSize: '11px',
                            color: isSelected ? preset.color : '#6B7280',
                            fontWeight: isSelected ? '600' : '400'
                          }}>
                            {preset.id}-{layout.id}
                          </div>
                        </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </>
                  );
                })()}

              {/* Selected Count */}
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '15px',
                color: selected18Variants.size > 0 ? '#4F46E5' : '#6B7280',
                fontWeight: '600'
              }}>
                {selected18Variants.size} variant{selected18Variants.size !== 1 ? 's' : ''} selected
              </div>

              {/* Resource Sharing Info */}
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 100%)',
                borderRadius: '12px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🎬</span>
                  <div>
                    <strong>Smart Resource Sharing</strong>
                    <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#4B5563' }}>
                      <li>Video generated <strong>once</strong> and shared across all variants</li>
                      <li>Logo set generated <strong>once</strong> and shared</li>
                      <li>Each variant gets unique styling but shares core assets</li>
                      <li>~80% faster than generating each separately</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Generation Progress */}
              {generating18Variants && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#F3F4F6',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Generating variants...</span>
                    <span>{generationProgress.current}/{generationProgress.total}</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#E5E7EB',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(generationProgress.current / generationProgress.total) * 100}%`,
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {generationProgress.currentVariant && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
                      Current: {generationProgress.currentVariant}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShow18VariantModal({ open: false, prospect: null })}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={generate18VariantsHandler}
                disabled={selected18Variants.size === 0 || generating18Variants}
                style={{
                  ...styles.generateBtn,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  opacity: selected18Variants.size === 0 || generating18Variants ? 0.5 : 1
                }}
              >
                {generating18Variants
                  ? `⏳ Generating ${generationProgress.current}/${generationProgress.total}...`
                  : `🎨 Generate ${selected18Variants.size} Variant${selected18Variants.size !== 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Generation Modal */}
      {showUnifiedModal.open && showUnifiedModal.prospect && (
        <div style={styles.modalOverlay} onClick={() => !unifiedGenerating && setShowUnifiedModal({ open: false, prospect: null })}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '650px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', padding: '8px', borderRadius: '10px' }}>🚀</span>
                Unified Generation
              </h3>
              <p style={{ color: '#64748B', margin: '8px 0 0 0', fontSize: '14px' }}>
                <strong>{showUnifiedModal.prospect.name}</strong> — Full-Stack site with frontend, backend, admin panel & database
              </p>
            </div>

            {/* Generation Mode Toggle - Test (Free) vs AI (Paid) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                🔬 Generation Mode
                <span style={{ color: '#9CA3AF', fontWeight: '400', marginLeft: '8px', fontSize: '11px' }}>
                  (Test first for free, upgrade winners to AI later)
                </span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setUnifiedConfig(c => ({ ...c, generationMode: 'test', aiLevel: 0 }))}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: unifiedConfig.generationMode === 'test' ? '2px solid #10B981' : '2px solid #E5E7EB',
                    background: unifiedConfig.generationMode === 'test' ? '#ECFDF5' : '#FAFAFA',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🧪</div>
                  <div style={{ fontWeight: '700', color: '#065F46', fontSize: '14px' }}>Test Mode</div>
                  <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>FREE</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Find winning layouts first</div>
                </button>
                <button
                  onClick={() => setUnifiedConfig(c => ({ ...c, generationMode: 'ai', aiLevel: 3 }))}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '12px',
                    border: unifiedConfig.generationMode === 'ai' ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                    background: unifiedConfig.generationMode === 'ai' ? '#F5F3FF' : '#FAFAFA',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🤖</div>
                  <div style={{ fontWeight: '700', color: '#5B21B6', fontSize: '14px' }}>AI Mode</div>
                  <div style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: '700' }}>~${(AI_LEVELS[3].cost).toFixed(2)}/variant</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Upgrade after testing</div>
                </button>
              </div>

              {/* AI Level Selector - Only show when AI mode selected */}
              {unifiedConfig.generationMode === 'ai' && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#F5F3FF', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#5B21B6', marginBottom: '8px' }}>AI Level:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {AI_LEVELS.filter(l => l.id > 0).map(level => (
                      <button
                        key={level.id}
                        onClick={() => setUnifiedConfig(c => ({ ...c, aiLevel: level.id }))}
                        title={level.description}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: unifiedConfig.aiLevel === level.id ? '2px solid #8B5CF6' : '1px solid #DDD6FE',
                          background: unifiedConfig.aiLevel === level.id ? '#8B5CF6' : '#fff',
                          color: unifiedConfig.aiLevel === level.id ? '#fff' : '#5B21B6',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {level.icon} {level.name} (${level.cost.toFixed(2)})
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '8px' }}>
                    {AI_LEVELS.find(l => l.id === unifiedConfig.aiLevel)?.description}
                  </div>
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: '#FEF3C7',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    💡 <strong>Tip:</strong> Run Test Mode first (free) to find winning layouts, then upgrade only the best ones to AI.
                  </div>
                </div>
              )}
            </div>

            {/* Progress Display */}
            {unifiedProgress && (
              <div style={{
                background: 'linear-gradient(135deg, #EDE9FE, #E0E7FF)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid #C4B5FD'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#5B21B6', fontWeight: '600' }}>{unifiedProgress.status}</span>
                  <span style={{ color: '#7C3AED', fontWeight: '700' }}>{unifiedProgress.progress}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '6px', height: '10px' }}>
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
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                🎯 Input Level
                <span style={{ color: '#9CA3AF', fontWeight: '400', marginLeft: '8px', fontSize: '11px' }}>
                  (hover to preview what gets auto-filled)
                </span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { id: 'minimal', icon: '🟢', name: 'Minimal', desc: 'AI picks everything — just click generate.' },
                  { id: 'moderate', icon: '🟡', name: 'Moderate', desc: 'Smart defaults from research. Override tier.' },
                  { id: 'extreme', icon: '🔴', name: 'Extreme', desc: 'All options: mood sliders, colors, fonts.' }
                ].map(level => (
                  <button
                    key={level.id}
                    onClick={() => setUnifiedConfig(c => ({ ...c, inputLevel: level.id }))}
                    onMouseEnter={() => setHoveredLevel(level.id)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    style={{
                      flex: 1,
                      padding: '14px 12px',
                      borderRadius: '12px',
                      border: unifiedConfig.inputLevel === level.id ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                      background: unifiedConfig.inputLevel === level.id ? '#F5F3FF' : '#FAFAFA',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{level.icon}</div>
                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px' }}>{level.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: '1.3' }}>{level.desc}</div>
                  </button>
                ))}
              </div>

              {/* Hover Preview Tooltip */}
              {hoveredLevel && showUnifiedModal.prospect && (() => {
                const preview = getInputPreview(showUnifiedModal.prospect, hoveredLevel);
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
                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px', marginBottom: '8px' }}>
                      {preview.title}
                    </div>
                    <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '12px' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      {preview.fields.map((field, i) => (
                        <div key={i} style={{
                          padding: '8px 10px',
                          background: '#F8FAFC',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          <div style={{ color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>{field.label}</div>
                          <div style={{ color: '#1E293B', fontWeight: '500' }}>{field.value}</div>
                          {field.note && <div style={{ color: '#94A3B8', fontSize: '10px', marginTop: '2px' }}>{field.note}</div>}
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
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                📦 Page Tier
                <span style={{ color: '#6B7280', fontWeight: '400', marginLeft: '8px', fontSize: '12px' }}>
                  (How many pages to generate?)
                </span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { id: 'standard', name: 'Standard', desc: '5-7 essential pages (Home, About, Services, Contact, etc.)' },
                  { id: 'premium', name: '⭐ Premium', desc: '10-15 pages with Gallery, Team, FAQ, Blog, Reviews, Portal' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setUnifiedConfig(c => ({ ...c, tier: tier.id }))}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: unifiedConfig.tier === tier.id ? '2px solid #10B981' : '2px solid #E5E7EB',
                      background: unifiedConfig.tier === tier.id ? '#ECFDF5' : '#FAFAFA',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '15px' }}>{tier.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Variants Toggle */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid #E2E8F0'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={unifiedConfig.enableVariants}
                  onChange={(e) => setUnifiedConfig(c => ({ ...c, enableVariants: e.target.checked }))}
                  style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#8B5CF6' }}
                />
                <div>
                  <span style={{ color: '#1E293B', fontWeight: '600', fontSize: '14px' }}>
                    🎨 Generate Multiple Style Variants
                  </span>
                  <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0 0' }}>
                    Create multiple versions with different presets (luxury, friendly, bold) and themes (light/dark) for A/B testing
                  </p>
                </div>
              </label>

              {unifiedConfig.enableVariants && (
                <div style={{ marginTop: '16px', paddingLeft: '32px' }}>
                  {/* Presets */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Style Presets</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        { id: 'luxury', label: '✨ Luxury', desc: 'Elegant, premium feel' },
                        { id: 'friendly', label: '😊 Friendly', desc: 'Warm, approachable' },
                        { id: 'bold-energetic', label: '💪 Bold', desc: 'Strong, confident' },
                        { id: 'modern-minimal', label: '🎯 Minimal', desc: 'Clean, simple' },
                        { id: 'classic-elegant', label: '🏛️ Classic', desc: 'Timeless, refined' },
                        { id: 'sharp-corporate', label: '🏢 Corporate', desc: 'Professional, trustworthy' }
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
                          title={preset.desc}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: unifiedConfig.selectedPresets.includes(preset.id) ? '2px solid #8B5CF6' : '2px solid #E5E7EB',
                            background: unifiedConfig.selectedPresets.includes(preset.id) ? '#8B5CF6' : '#fff',
                            color: unifiedConfig.selectedPresets.includes(preset.id) ? '#fff' : '#374151',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Industry-Specific Layouts */}
                  <div>
                    <div style={{ color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                      Page Layouts
                      <span style={{ fontWeight: '400', color: '#6B7280', marginLeft: '8px', fontSize: '11px' }}>
                        (for {showUnifiedModal.prospect?.fixtureId || 'this industry'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {getUnifiedLayouts(showUnifiedModal.prospect).map(layout => (
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
                          title={layout.description}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: unifiedConfig.selectedLayouts.includes(layout.id) ? '2px solid #10B981' : '2px solid #E5E7EB',
                            background: unifiedConfig.selectedLayouts.includes(layout.id) ? '#ECFDF5' : '#fff',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px' }}>{layout.icon}</span>
                            <span style={{ fontWeight: '600' }}>{layout.name}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>{layout.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Variant Count & Cost */}
                  {(() => {
                    const variantCount = unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length;
                    const costPerVariant = unifiedConfig.generationMode === 'test' ? 0 : AI_LEVELS[unifiedConfig.aiLevel]?.cost || 0;
                    const totalCost = variantCount * costPerVariant;
                    const isTestMode = unifiedConfig.generationMode === 'test';
                    return (
                      <div style={{
                        marginTop: '14px',
                        padding: '12px',
                        background: isTestMode ? '#ECFDF5' : '#EDE9FE',
                        borderRadius: '8px',
                        border: isTestMode ? '1px solid #A7F3D0' : '1px solid #DDD6FE'
                      }}>
                        <div style={{ color: isTestMode ? '#065F46' : '#5B21B6', fontSize: '13px', fontWeight: '600' }}>
                          📊 {unifiedConfig.selectedPresets.length} presets × {unifiedConfig.selectedLayouts.length} layouts = <strong>{variantCount} variants</strong>
                        </div>
                        <div style={{ color: isTestMode ? '#10B981' : '#7C3AED', fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
                          {isTestMode ? (
                            <>💚 FREE — Test mode with fixture data</>
                          ) : (
                            <>💰 Estimated cost: ${totalCost.toFixed(2)} ({variantCount} × ${costPerVariant.toFixed(2)})</>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Extras */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                ⚡ Extra Features
              </label>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0',
                  cursor: 'pointer', fontSize: '13px', color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={unifiedConfig.generateVideo}
                    onChange={(e) => setUnifiedConfig(c => ({ ...c, generateVideo: e.target.checked }))}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>🎬 <strong>Video</strong></span>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>Promo video assets</span>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0',
                  cursor: 'pointer', fontSize: '13px', color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={unifiedConfig.generateLogo}
                    onChange={(e) => setUnifiedConfig(c => ({ ...c, generateLogo: e.target.checked }))}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>🎨 <strong>Logo</strong></span>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>SVG logo variants</span>
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0',
                  cursor: 'pointer', fontSize: '13px', color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={unifiedConfig.enablePortal}
                    onChange={(e) => setUnifiedConfig(c => ({ ...c, enablePortal: e.target.checked }))}
                    style={{ accentColor: '#8B5CF6' }}
                  />
                  <span>🔐 <strong>Portal</strong></span>
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>Login, Register, Dashboard</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
              <button
                onClick={() => setShowUnifiedModal({ open: false, prospect: null })}
                disabled={unifiedGenerating}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => generateUnified(showUnifiedModal.prospect)}
                disabled={unifiedGenerating}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: unifiedGenerating
                    ? '#A5B4FC'
                    : unifiedConfig.generationMode === 'test'
                      ? 'linear-gradient(135deg, #10B981, #059669)'
                      : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: unifiedGenerating ? 'wait' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: unifiedConfig.generationMode === 'test'
                    ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                    : '0 4px 12px rgba(139, 92, 246, 0.4)'
                }}
              >
                {unifiedGenerating ? (
                  <>⏳ Generating...</>
                ) : unifiedConfig.generationMode === 'test' ? (
                  <>🧪 Generate {unifiedConfig.enableVariants ? `${unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length} Test Variants` : 'Test Site'} (Free)</>
                ) : (
                  <>🤖 Generate {unifiedConfig.enableVariants ? `${unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length} AI Variants` : 'AI Site'} (~${((unifiedConfig.enableVariants ? unifiedConfig.selectedPresets.length * unifiedConfig.selectedLayouts.length : 1) * AI_LEVELS[unifiedConfig.aiLevel]?.cost).toFixed(2)})</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Metrics Dashboard */}
      {masterMetrics && masterMetrics.variants && masterMetrics.variants.length > 0 && (
        <div style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              📊 Generation Metrics - {masterMetrics.prospectName || masterMetrics.folder}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  // Open comparison page with all variants
                  const successVariants = masterMetrics.variants.filter(v => v.success);
                  const folder = masterMetrics.folder;
                  const variantKeys = successVariants.map(v => v.key).join(',');
                  window.open(`/prospect-compare/${folder}?variants=${variantKeys}`, '_blank');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '6px',
                  color: '#93C5FD',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🔲 Compare All ({masterMetrics.variants.filter(v => v.success).length})
              </button>
              <button
                onClick={async () => {
                  const successVariants = masterMetrics.variants.filter(v => v.success && !v.deployed);
                  if (successVariants.length === 0) {
                    setMessage({ type: 'info', text: 'All variants are already deployed!' });
                    return;
                  }
                  if (!confirm(`Deploy ${successVariants.length} variant(s)? This will create multiple deployments on Railway.`)) {
                    return;
                  }
                  const variantKeys = successVariants.map(v => v.key);
                  await deploySelectedVariants(masterMetrics.folder, variantKeys);
                }}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(34, 197, 94, 0.3)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  borderRadius: '6px',
                  color: '#86EFAC',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🚀 Deploy All ({masterMetrics.variants.filter(v => v.success && !v.deployed).length})
              </button>
              <button
                onClick={() => deleteAllVariants(masterMetrics.folder)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  color: '#FCA5A5',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️ Delete All
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: masterMetrics.aiEnhanced ? 'repeat(8, 1fr)' : 'repeat(7, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { icon: '🎨', label: 'Variants', value: masterMetrics.successCount || masterMetrics.variants.length },
              { icon: '📄', label: 'Total Pages', value: masterMetrics.totalPages },
              { icon: '💻', label: 'Lines of Code', value: (masterMetrics.totalLinesOfCode || 0).toLocaleString() },
              { icon: '⏱️', label: 'Total Time', value: `${((masterMetrics.totalGenerationTimeMs || 0) / 1000).toFixed(1)}s` },
              { icon: '📊', label: 'Time/Page', value: `${masterMetrics.timePerPage || 0}ms` },
              { icon: '🎬', label: 'Video Time', value: `${((masterMetrics.videoGenerationTime || 0) / 1000).toFixed(1)}s` },
              { icon: '🌐', label: 'Deployed', value: masterMetrics.variants.filter(v => v.deployed).length, color: '#86EFAC' },
              // Show AI cost if AI mode was used
              ...(masterMetrics.aiEnhanced ? [{ icon: '🤖', label: masterMetrics.aiLevelName || 'AI Mode', value: `$${(masterMetrics.aiCost || 0).toFixed(4)}`, color: '#A78BFA' }] : [])
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{card.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: card.color || 'inherit' }}>{card.value}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Visual Variant Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', opacity: 0.8 }}>🎨 Variant Grid (6 presets × 3 layouts)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {masterMetrics.variants.filter(v => v.success).map((v, i) => (
                <a
                  key={v.key || i}
                  href={v.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    position: 'relative',
                    padding: '12px 8px',
                    background: `${v.presetColor || '#6B7280'}25`,
                    border: `2px solid ${v.deployed ? '#10B981' : (v.presetColor || '#6B7280')}50`,
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#fff',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  title={`${v.presetName} - ${v.layoutName || v.layout}\nClick to preview`}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = `${v.presetColor || '#6B7280'}40`;
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = `${v.presetColor || '#6B7280'}25`;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {v.deployed && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '10px',
                      background: '#10B981',
                      padding: '2px 5px',
                      borderRadius: '4px'
                    }}>🌐</div>
                  )}
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{v.presetIcon}</div>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: v.presetColor }}>{v.presetName || v.preset}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{v.layoutName || v.layout}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Per-Variant Table */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Variant</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Preset</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Layout</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Pages</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Lines</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {masterMetrics.variants.map((v, i) => (
                  <tr key={v.key || i} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '10px 12px' }}>{v.key}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        background: `${v.presetColor || '#6B7280'}30`,
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {v.presetIcon} {v.presetName || v.preset}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{v.layoutName || v.layout || v.theme}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{v.pages || '-'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{(v.linesOfCode || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{((v.generationTimeMs || 0) / 1000).toFixed(1)}s</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {v.success ? '✅' : '❌'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {v.success && (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <a
                            href={v.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '4px 10px',
                              background: 'rgba(59, 130, 246, 0.3)',
                              borderRadius: '4px',
                              color: '#93C5FD',
                              textDecoration: 'none',
                              fontSize: '11px'
                            }}
                          >
                            👁️ View
                          </a>
                          <button
                            onClick={() => buildSingleVariant(masterMetrics.folder, v.key)}
                            disabled={buildingVariants[v.key]}
                            style={{
                              padding: '4px 10px',
                              background: 'rgba(251, 191, 36, 0.3)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#FCD34D',
                              cursor: buildingVariants[v.key] ? 'wait' : 'pointer',
                              fontSize: '11px',
                              opacity: buildingVariants[v.key] ? 0.7 : 1
                            }}
                          >
                            {buildingVariants[v.key] ? '⏳' : '🔨'} Build
                          </button>
                          {v.deployed && v.deployedUrl ? (
                            <a
                              href={v.deployedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '4px 10px',
                                background: 'rgba(34, 197, 94, 0.4)',
                                borderRadius: '4px',
                                color: '#86EFAC',
                                textDecoration: 'none',
                                fontSize: '11px'
                              }}
                              title={v.deployedUrl}
                            >
                              🌐 Live
                            </a>
                          ) : (
                            <button
                              onClick={() => deploySelectedVariants(masterMetrics.folder, [v.key])}
                              disabled={deployingVariants[v.key]}
                              style={{
                                padding: '4px 10px',
                                background: deployingVariants[v.key]
                                  ? 'rgba(251, 191, 36, 0.3)'
                                  : 'rgba(34, 197, 94, 0.3)',
                                border: 'none',
                                borderRadius: '4px',
                                color: deployingVariants[v.key] ? '#FCD34D' : '#86EFAC',
                                cursor: deployingVariants[v.key] ? 'wait' : 'pointer',
                                fontSize: '11px',
                                opacity: deployingVariants[v.key] ? 0.8 : 1
                              }}
                            >
                              {deployingVariants[v.key] ? '⏳ Deploying...' : '🚀 Deploy'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reuse Metrics */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              🎬 1 video shared across {masterMetrics.variants.length} variants
            </div>
            <div style={{
              padding: '10px 16px',
              background: 'rgba(236, 72, 153, 0.2)',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              🎨 7 logo variants shared across {masterMetrics.variants.length} variants
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Stats */}
      <div style={styles.pipeline}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            style={{
              ...styles.pipelineStage,
              borderColor: statusFilter === key ? config.color : '#E5E7EB',
              background: statusFilter === key ? config.bg : '#fff'
            }}
          >
            <span style={{ ...styles.stageCount, color: config.color }}>
              {stats[key === 'test-generated' ? 'testGenerated' : key === 'ai-generated' ? 'aiGenerated' : key] || 0}
            </span>
            <span style={styles.stageLabel}>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Industry:</label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Industries</option>
            <optgroup label="Industry Groups">
              {Object.keys(INDUSTRY_GROUPS).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </optgroup>
            <optgroup label="Specific Industries">
              {uniqueIndustries.map(ind => (
                <option key={ind} value={ind}>{INDUSTRY_ICONS[ind] || '📍'} {ind}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>City:</label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="industry">Industry</option>
            <option value="city">City</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={styles.sortToggle}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={groupByIndustry}
              onChange={(e) => setGroupByIndustry(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Group by Industry
          </label>
        </div>

        {(industryFilter !== 'all' || cityFilter !== 'all' || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setIndustryFilter('all');
              setCityFilter('all');
              setStatusFilter('all');
            }}
            style={styles.clearFiltersBtn}
          >
            ✕ Clear Filters
          </button>
        )}

        <div style={styles.filterCount}>
          Showing {sortedProspects.length} of {prospects.length}
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div style={styles.bulkActions}>
          <span style={styles.selectedCount}>{selected.size} selected</span>
          <button
            onClick={batchGenerateTest}
            disabled={processing}
            style={styles.actionBtn}
          >
            {processing ? '⏳ Generating...' : '🧪 Test Generate Selected'}
          </button>
          <button onClick={() => setSelected(new Set())} style={styles.clearBtn}>
            ✕ Clear Selection
          </button>
        </div>
      )}

      {/* Prospects Table */}
      <div style={styles.tableContainer}>
        {groupByIndustry ? (
          // Grouped view
          Object.entries(groupedProspects || {}).sort().map(([group, groupProspects]) => (
            <div key={group} style={styles.industryGroup}>
              <div style={styles.groupHeader}>
                <h3 style={styles.groupTitle}>{group}</h3>
                <span style={styles.groupCount}>{groupProspects.length} businesses</span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      <input type="checkbox" disabled />
                    </th>
                    <th style={styles.th}>Business</th>
                    <th style={styles.th}>Industry</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupProspects.map(prospect => (
                    <ProspectRow
                      key={prospect.folder}
                      prospect={prospect}
                      selected={selected}
                      toggleSelect={toggleSelect}
                      processing={processing}
                      testGenerating={testGenerating}
                      generateTest={generateTest}
                      openTestModal={openTestModal}
                      openAiModal={openAiModal}
                      deployProspect={deployProspect}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          // Flat view
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={selected.size === sortedProspects.length && sortedProspects.length > 0}
                    onChange={selectAll}
                  />
                </th>
                <th style={styles.th}>Business</th>
                <th style={styles.th}>Industry</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProspects.map(prospect => (
              <tr key={prospect.folder} style={styles.tr}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selected.has(prospect.folder)}
                    onChange={() => toggleSelect(prospect.folder)}
                  />
                </td>
                <td style={styles.td}>
                  <div style={styles.businessCell}>
                    {prospect.photo ? (
                      <img
                        src={prospect.photo}
                        alt=""
                        style={styles.thumbnail}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={styles.thumbnailPlaceholder}>
                        {INDUSTRY_ICONS[prospect.fixtureId] || '🏢'}
                      </div>
                    )}
                    <div>
                      <strong>{prospect.name}</strong>
                      {prospect.rating && (
                        <span style={styles.rating}>
                          ⭐ {prospect.rating} ({prospect.reviewCount})
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.industryBadge}>
                    {INDUSTRY_ICONS[prospect.fixtureId] || '📍'} {prospect.fixtureId}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.address}>{prospect.address}</div>
                  {prospect.phone && (
                    <a href={`tel:${prospect.phone}`} style={styles.phone}>{prospect.phone}</a>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: STATUS_CONFIG[prospect.status]?.bg,
                    color: STATUS_CONFIG[prospect.status]?.color
                  }}>
                    {STATUS_CONFIG[prospect.status]?.label}
                  </span>
                  {prospect.testUrl && (
                    <div style={styles.urlPreview}>🔗 {prospect.testUrl}</div>
                  )}
                  {prospect.fullStackTest && (
                    <span style={{ fontSize: '10px', background: '#7C3AED', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>
                      🏗️ Full Stack
                    </span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {prospect.status === 'scouted' && (
                      <>
                        <button
                          onClick={() => generateTest(prospect.folder, false)}
                          disabled={processing}
                          style={styles.smallBtn}
                        >
                          🧪 Quick Test
                        </button>
                        <button
                          onClick={() => {
                            const layouts = getUnifiedLayouts(prospect);
                            setUnifiedConfig(c => ({
                              ...c,
                              selectedLayouts: layouts.map(l => l.id) // Default to ALL layouts for full variant coverage
                            }));
                            setShowUnifiedModal({ open: true, prospect });
                            setUnifiedProgress(null);
                          }}
                          disabled={processing || unifiedGenerating}
                          style={{ ...styles.smallBtn, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
                          title="Unified Generation - Full Stack with Input Levels & Variants"
                        >
                          🚀 Unified
                        </button>
                        <button
                          onClick={() => openTestModal(prospect)}
                          disabled={processing || testGenerating}
                          style={{ ...styles.smallBtn, background: '#7C3AED' }}
                          title="Full Stack with Package Selection"
                        >
                          🏗️ Full Stack
                        </button>
                        <button
                          onClick={() => {
                            setShow18VariantModal({ open: true, prospect });
                            setSelected18Variants(new Set(getAllVariantKeys(prospect)));
                          }}
                          disabled={processing || generating18Variants}
                          style={{ ...styles.smallBtn, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                          title="Generate 6 presets × 3 themes for A/B testing"
                        >
                          🎨 18 Variants
                        </button>
                      </>
                    )}
                    {prospect.status === 'test-generated' && (
                      <>
                        <button
                          onClick={() => generateTest(prospect.folder, prospect.fullStackTest)}
                          disabled={processing}
                          style={{ ...styles.smallBtn, background: '#6B7280' }}
                          title={prospect.fullStackTest ? 'Regenerate full stack' : 'Regenerate frontend'}
                        >
                          🔄 Regen
                        </button>
                        {!prospect.fullStackTest && (
                          <button
                            onClick={() => generateTest(prospect.folder, true)}
                            disabled={processing}
                            style={{ ...styles.smallBtn, background: '#7C3AED' }}
                            title="Upgrade to Full Stack: Frontend + Backend + Admin + Database"
                          >
                            🏗️ Upgrade
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/prospect-preview/${prospect.folder}/`, '_blank')}
                          style={{ ...styles.smallBtn, background: '#EC4899' }}
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => loadExistingVariants(prospect)}
                          style={{ ...styles.smallBtn, background: '#8B5CF6', position: 'relative' }}
                          title="View all style variants with metrics and page index"
                        >
                          🎨 Variants
                          {prospect.variantCount > 0 && (
                            <span style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              background: '#F59E0B',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              fontSize: '10px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {prospect.variantCount}
                            </span>
                          )}
                        </button>
                        {prospect.variantCount > 0 && (
                          <button
                            onClick={() => loadMasterMetrics(prospect.folder)}
                            style={{ ...styles.smallBtn, background: '#1E3A5F' }}
                            title="View master metrics dashboard for all variants"
                          >
                            📊 Metrics
                          </button>
                        )}
                        <button
                          onClick={() => copyTestInstructions(prospect.folder, prospect.testUrl || `http://localhost:5173`)}
                          style={{ ...styles.smallBtn, background: '#8B5CF6' }}
                          title="Copy test instructions for Claude browser extension"
                        >
                          🧪 Copy Tests
                        </button>
                        <button
                          onClick={() => deployProspect(prospect.folder)}
                          disabled={processing}
                          style={{ ...styles.smallBtn, background: '#10B981' }}
                        >
                          🚀 Deploy
                        </button>
                        <button
                          onClick={() => openAiModal(prospect)}
                          disabled={processing || aiGenerating}
                          style={{ ...styles.smallBtn, background: '#F59E0B' }}
                          title="Generate with AI (uses Claude API, costs money)"
                        >
                          🤖 AI Generate
                        </button>
                      </>
                    )}
                    {prospect.status === 'verified' && (
                      <>
                        <button
                          onClick={() => generateTest(prospect.folder, prospect.fullStackTest)}
                          disabled={processing}
                          style={{ ...styles.smallBtn, background: '#6B7280' }}
                          title={prospect.fullStackTest ? 'Regenerate full stack' : 'Regenerate frontend'}
                        >
                          🔄 Regen
                        </button>
                        <button
                          onClick={() => openAiModal(prospect)}
                          disabled={processing || aiGenerating}
                          style={{ ...styles.smallBtn, background: '#F59E0B' }}
                        >
                          🤖 AI Generate
                        </button>
                      </>
                    )}
                    {prospect.status === 'ai-generated' && (
                      <button
                        onClick={() => deployProspect(prospect.folder)}
                        disabled={processing}
                        style={{ ...styles.smallBtn, background: '#10B981' }}
                      >
                        🚀 Deploy
                      </button>
                    )}
                    {prospect.status === 'deployed' && (
                      <>
                        <a
                          href={prospect.deployedUrl || `https://test-${prospect.folder}.be1st.io`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ ...styles.smallBtn, background: '#10B981', textDecoration: 'none' }}
                        >
                          🌐 Live Site
                        </a>
                        <button
                          onClick={() => copyTestInstructions(prospect.folder, prospect.deployedUrl || `https://test-${prospect.folder}.be1st.io`)}
                          style={{ ...styles.smallBtn, background: '#8B5CF6' }}
                          title="Copy test instructions for Claude browser extension"
                        >
                          🧪 Copy Tests
                        </button>
                        <button
                          onClick={() => deployProspect(prospect.folder)}
                          disabled={processing}
                          style={{ ...styles.smallBtn, background: '#F59E0B' }}
                        >
                          🚀 Redeploy
                        </button>
                        <button
                          onClick={() => generateTest(prospect.folder, prospect.fullStackTest)}
                          disabled={processing}
                          style={{ ...styles.smallBtn, background: '#6B7280' }}
                          title={prospect.fullStackTest ? 'Regenerate full stack' : 'Regenerate frontend'}
                        >
                          🔄 Regen
                        </button>
                        {!prospect.fullStackTest && (
                          <button
                            onClick={() => generateTest(prospect.folder, true)}
                            disabled={processing}
                            style={{ ...styles.smallBtn, background: '#7C3AED' }}
                            title="Upgrade to Full Stack: Frontend + Backend + Admin + Database"
                          >
                            🏗️ Upgrade
                          </button>
                        )}
                        <button
                          onClick={() => openAiModal(prospect)}
                          disabled={processing || aiGenerating}
                          style={{ ...styles.smallBtn, background: '#F59E0B' }}
                          title="Generate with AI (uses Claude API, costs money)"
                        >
                          🤖 AI Generate
                        </button>
                      </>
                    )}
                    {prospect.status !== 'scouted' && (
                      <button
                        onClick={() => resetProspect(prospect.folder)}
                        disabled={processing}
                        style={{ ...styles.smallBtn, background: '#EF4444', color: 'white' }}
                        title="Reset to scouted status - clears all generated files"
                      >
                        ↩️ Reset
                      </button>
                    )}
                    {prospect.googleMapsUrl && (
                      <a href={prospect.googleMapsUrl} target="_blank" rel="noreferrer" style={{ ...styles.linkBtn, background: '#E8F5E9', color: '#2E7D32' }}>
                        Google ↗
                      </a>
                    )}
                    {!prospect.googleMapsUrl && prospect.name && (
                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(prospect.name + ' ' + prospect.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ ...styles.linkBtn, background: '#E8F5E9', color: '#2E7D32' }}
                      >
                        Google ↗
                      </a>
                    )}
                    {prospect.yelpUrl && (
                      <a href={prospect.yelpUrl} target="_blank" rel="noreferrer" style={styles.linkBtn}>
                        Yelp ↗
                      </a>
                    )}
                    <button
                      onClick={() => deleteProspect(prospect.folder)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}

        {sortedProspects.length === 0 && (
          <div style={styles.empty}>
            {statusFilter === 'all' && industryFilter === 'all' && cityFilter === 'all'
              ? 'No prospects yet. Go to Scout Dashboard to find businesses.'
              : 'No prospects match your current filters'}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    color: '#6B7280',
    margin: '4px 0 0 0'
  },
  refreshBtn: {
    padding: '8px 16px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  quickSelectBtn: {
    padding: '8px 14px',
    background: '#F3F4F6',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    color: '#374151',
    transition: 'all 0.15s ease'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontWeight: '500'
  },
  pipeline: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  pipelineStage: {
    flex: 1,
    padding: '16px',
    border: '2px solid',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  stageCount: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700'
  },
  stageLabel: {
    fontSize: '13px',
    color: '#6B7280'
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    padding: '16px',
    background: '#F9FAFB',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    background: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    minWidth: '140px'
  },
  sortToggle: {
    padding: '8px 12px',
    background: '#fff',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer'
  },
  clearFiltersBtn: {
    padding: '8px 12px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  filterCount: {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: '500'
  },
  industryGroup: {
    marginBottom: '24px'
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)',
    borderRadius: '8px 8px 0 0'
  },
  groupTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff'
  },
  groupCount: {
    fontSize: '13px',
    color: '#fff',
    opacity: 0.8
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  layoutCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '2px solid',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  layoutInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#EFF6FF',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  selectedCount: {
    fontWeight: '600',
    color: '#1E40AF'
  },
  actionBtn: {
    padding: '8px 16px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  clearBtn: {
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer'
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    fontWeight: '600',
    fontSize: '13px',
    color: '#6B7280'
  },
  tr: {
    borderBottom: '1px solid #F3F4F6'
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'top'
  },
  businessCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  thumbnailPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    background: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  rating: {
    display: 'block',
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '2px'
  },
  industryBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#F3F4F6',
    borderRadius: '4px',
    fontSize: '13px'
  },
  address: {
    fontSize: '14px',
    color: '#374151'
  },
  phone: {
    fontSize: '13px',
    color: '#3B82F6'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  urlPreview: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '4px'
  },
  actions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  smallBtn: {
    padding: '6px 10px',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  linkBtn: {
    padding: '6px 10px',
    background: '#F3F4F6',
    color: '#374151',
    borderRadius: '4px',
    fontSize: '12px',
    textDecoration: 'none'
  },
  deleteBtn: {
    padding: '6px 8px',
    background: '#FEE2E2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#6B7280'
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#6B7280'
  },
  // AI Modal styles
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
    borderRadius: '16px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6B7280',
    padding: '0 8px'
  },
  modalBody: {
    padding: '24px'
  },
  prospectInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  industryTag: {
    padding: '4px 10px',
    background: '#F3F4F6',
    borderRadius: '6px',
    fontSize: '13px'
  },
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  tierCard: {
    padding: '20px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tierHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  tierName: {
    fontWeight: '700',
    fontSize: '16px'
  },
  recommendedBadge: {
    background: '#6366F1',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600'
  },
  tierCost: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  tierPages: {
    marginBottom: '12px',
    fontSize: '14px'
  },
  pageList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '6px'
  },
  pageTag: {
    background: '#F3F4F6',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  tierFeatures: {
    fontSize: '14px'
  },
  featureList: {
    margin: '6px 0 0',
    paddingLeft: '16px',
    fontSize: '13px',
    color: '#374151'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #E5E7EB',
    background: '#F9FAFB'
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  generateBtn: {
    padding: '10px 24px',
    background: '#F59E0B',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
