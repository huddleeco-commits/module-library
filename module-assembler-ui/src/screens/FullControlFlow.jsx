/**
 * FullControlFlow Screen
 * Multi-step wizard for full control page-by-page customization
 */

import React, { useState, useEffect } from 'react';
import {
  API_BASE,
  INDUSTRY_PAGES,
  PAGE_LABELS,
  COLOR_PRESETS,
  STYLE_OPTIONS,
  PAGE_SECTIONS,
  PAGE_LAYOUTS,
  VISUAL_STYLES,
  PAGE_ICONS
} from '../constants';
import PageCustomizer from '../components/PageCustomizer.jsx';
import AdminTierSelector from '../components/AdminTierSelector';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '80vh',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  stepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#888',
    transition: 'all 0.3s ease'
  },
  stepDotActive: {
    background: '#6366f1',
    color: '#fff'
  },
  stepDotComplete: {
    background: '#10b981',
    color: '#fff'
  },
  stepLine: {
    flex: 1,
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    maxWidth: '60px'
  },
  stepLineComplete: {
    background: '#10b981'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#888'
  },
  content: {
    flex: 1
  },
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#aaa',
    marginBottom: '8px',
    display: 'block'
  },
  required: {
    color: '#ef4444'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  inputHint: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  // Category tabs at top
  categoryTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
    padding: '4px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px'
  },
  categoryTab: {
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  categoryTabActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc'
  },
  categoryTabAll: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
    color: '#c4b5fd'
  },
  // Responsive industry grid - 4 cols desktop, 3 tablet, 2 mobile
  industryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  // Premium card styling matching mode selection cards
  industryOption: {
    position: 'relative',
    padding: '24px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px'
  },
  industryOptionHover: {
    borderColor: 'rgba(99, 102, 241, 0.4)',
    background: 'rgba(99, 102, 241, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
  },
  industryOptionSelected: {
    borderColor: '#6366f1',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
    boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3), 0 8px 24px rgba(99, 102, 241, 0.2)'
  },
  industryIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  },
  industryName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    lineHeight: 1.3
  },
  industryCheckmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
  },
  // Category header in grid view
  categoryHeader: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 0 8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: '8px'
  },
  categoryHeaderIcon: {
    fontSize: '1.5rem'
  },
  categoryHeaderText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#a5b4fc'
  },
  // Search input for filtering
  industrySearch: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: '0.95rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    marginBottom: '16px',
    transition: 'all 0.2s ease'
  },
  industrySearchWrapper: {
    position: 'relative',
    marginBottom: '16px'
  },
  industrySearchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.1rem',
    color: '#666'
  },
  pagesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  pageCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.9rem',
    color: '#fff'
  },
  pageCheckboxSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  backBtn: {
    padding: '12px 24px',
    fontSize: '0.95rem',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#888',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  nextBtn: {
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  nextBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  generateBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
  },
  reviewSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  reviewTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  reviewLabel: {
    fontSize: '0.9rem',
    color: '#888'
  },
  reviewValue: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: '500'
  },
  pageReviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '12px'
  },
  pageReviewCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '14px'
  },
  pageReviewName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  pageReviewDetail: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '4px'
  },
  aiSuggestionBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  aiIcon: {
    fontSize: '1.5rem'
  },
  aiText: {
    flex: 1
  },
  aiTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#a5b4fc',
    marginBottom: '4px'
  },
  aiDescription: {
    fontSize: '0.85rem',
    color: '#888'
  },
  aiBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

// Comprehensive industry list organized by category
const INDUSTRY_CATEGORIES = {
  'Food & Beverage': {
    icon: '🍽️',
    industries: [
      { key: 'restaurant', name: 'Restaurant', icon: '🍽️' },
      { key: 'pizza', name: 'Pizzeria', icon: '🍕' },
      { key: 'cafe', name: 'Cafe', icon: '☕' },
      { key: 'bakery', name: 'Bakery', icon: '🥐' },
      { key: 'bar', name: 'Bar & Lounge', icon: '🍸' },
      { key: 'food-truck', name: 'Food Truck', icon: '🚚' },
      { key: 'catering', name: 'Catering', icon: '🍱' },
      { key: 'food-delivery', name: 'Food Delivery', icon: '🛵' }
    ]
  },
  'Beauty & Wellness': {
    icon: '💆',
    industries: [
      { key: 'spa-salon', name: 'Spa & Salon', icon: '💆' },
      { key: 'barbershop', name: 'Barbershop', icon: '💈' },
      { key: 'nail-salon', name: 'Nail Salon', icon: '💅' },
      { key: 'fitness', name: 'Fitness Center', icon: '🏋️' },
      { key: 'yoga', name: 'Yoga Studio', icon: '🧘' },
      { key: 'massage', name: 'Massage Therapy', icon: '🙌' },
      { key: 'medspa', name: 'Med Spa', icon: '✨' }
    ]
  },
  'Healthcare': {
    icon: '🏥',
    industries: [
      { key: 'healthcare', name: 'Healthcare', icon: '🏥' },
      { key: 'dental', name: 'Dental Practice', icon: '🦷' },
      { key: 'chiropractic', name: 'Chiropractic', icon: '🦴' },
      { key: 'veterinary', name: 'Veterinary', icon: '🐾' },
      { key: 'mental-health', name: 'Mental Health', icon: '🧠' },
      { key: 'pharmacy', name: 'Pharmacy', icon: '💊' }
    ]
  },
  'Professional Services': {
    icon: '⚖️',
    industries: [
      { key: 'law-firm', name: 'Law Firm', icon: '⚖️' },
      { key: 'accounting', name: 'Accounting', icon: '📊' },
      { key: 'consulting', name: 'Consulting', icon: '💼' },
      { key: 'insurance', name: 'Insurance', icon: '🛡️' },
      { key: 'real-estate', name: 'Real Estate', icon: '🏠' },
      { key: 'financial', name: 'Financial Services', icon: '💰' }
    ]
  },
  'Home Services': {
    icon: '🔧',
    industries: [
      { key: 'plumbing', name: 'Plumbing', icon: '🔧' },
      { key: 'electrician', name: 'Electrician', icon: '⚡' },
      { key: 'hvac', name: 'HVAC', icon: '❄️' },
      { key: 'construction', name: 'Construction', icon: '🏗️' },
      { key: 'landscaping', name: 'Landscaping', icon: '🌳' },
      { key: 'cleaning', name: 'Cleaning Service', icon: '🧹' },
      { key: 'roofing', name: 'Roofing', icon: '🏠' },
      { key: 'pest-control', name: 'Pest Control', icon: '🐜' }
    ]
  },
  'Automotive': {
    icon: '🚗',
    industries: [
      { key: 'auto-repair', name: 'Auto Repair', icon: '🔩' },
      { key: 'car-dealership', name: 'Car Dealership', icon: '🚗' },
      { key: 'car-wash', name: 'Car Wash', icon: '🧽' },
      { key: 'towing', name: 'Towing Service', icon: '🚛' },
      { key: 'tire-shop', name: 'Tire Shop', icon: '🛞' }
    ]
  },
  'Retail & Commerce': {
    icon: '🛍️',
    industries: [
      { key: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
      { key: 'retail', name: 'Retail Store', icon: '🏪' },
      { key: 'boutique', name: 'Boutique', icon: '👗' },
      { key: 'jewelry', name: 'Jewelry Store', icon: '💎' },
      { key: 'florist', name: 'Florist', icon: '💐' }
    ]
  },
  'Creative & Media': {
    icon: '📷',
    industries: [
      { key: 'photography', name: 'Photography', icon: '📷' },
      { key: 'videography', name: 'Videography', icon: '🎬' },
      { key: 'agency', name: 'Creative Agency', icon: '🎨' },
      { key: 'portfolio', name: 'Portfolio', icon: '💼' },
      { key: 'wedding', name: 'Wedding Services', icon: '💒' },
      { key: 'music-school', name: 'Music School', icon: '🎵' },
      { key: 'art-studio', name: 'Art Studio', icon: '🖼️' }
    ]
  },
  'Tech & SaaS': {
    icon: '🚀',
    industries: [
      { key: 'saas', name: 'SaaS Platform', icon: '☁️' },
      { key: 'startup', name: 'Tech Startup', icon: '🚀' },
      { key: 'tech-agency', name: 'Tech Agency', icon: '💻' },
      { key: 'app', name: 'Mobile App', icon: '📱' }
    ]
  },
  'Education & Community': {
    icon: '🎓',
    industries: [
      { key: 'school', name: 'School', icon: '🎓' },
      { key: 'tutoring', name: 'Tutoring', icon: '📚' },
      { key: 'daycare', name: 'Daycare', icon: '👶' },
      { key: 'non-profit', name: 'Non-Profit', icon: '🤝' },
      { key: 'church', name: 'Church', icon: '⛪' }
    ]
  },
  'Hospitality & Events': {
    icon: '🏨',
    industries: [
      { key: 'hotel', name: 'Hotel', icon: '🏨' },
      { key: 'event-venue', name: 'Event Venue', icon: '🎪' },
      { key: 'travel', name: 'Travel Agency', icon: '✈️' },
      { key: 'pet-grooming', name: 'Pet Grooming', icon: '🐕' }
    ]
  }
};

// Flatten industries for backward compatibility
const INDUSTRIES = Object.values(INDUSTRY_CATEGORIES).flatMap(cat => cat.industries);

const STEPS = [
  { id: 'basics', name: 'Basics', icon: '📝' },
  { id: 'pages', name: 'Pages', icon: '📑' },
  { id: 'admin', name: 'Admin', icon: '⚙️' },
  { id: 'review', name: 'Review', icon: '✅' }
];

export function FullControlFlow({
  sharedContext,
  onUpdateContext,
  onGenerate,
  onBack
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Basics
  const [businessName, setBusinessName] = useState(sharedContext?.businessName || '');
  const [industry, setIndustry] = useState(sharedContext?.industry || null);
  const [location, setLocation] = useState(sharedContext?.location || '');
  const [tagline, setTagline] = useState(sharedContext?.tagline || '');

  // Step 2: Pages
  const [selectedPages, setSelectedPages] = useState(['home', 'about', 'services', 'contact']);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageSettings, setPageSettings] = useState({});

  // Step 3: Admin
  const [adminTier, setAdminTier] = useState(null);
  const [adminModules, setAdminModules] = useState([]);

  // AI suggestions
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Industry selection UI state
  const [activeCategory, setActiveCategory] = useState('all');
  const [industrySearch, setIndustrySearch] = useState('');
  const [hoveredIndustry, setHoveredIndustry] = useState(null);

  // Get industry info
  const industryInfo = INDUSTRIES.find(i => i.key === industry);
  const industryDisplay = industryInfo?.name || 'Business';
  const industryIcon = industryInfo?.icon || '🌐';

  // Get available pages for industry
  const getAvailablePages = () => {
    const commonPages = ['home', 'about', 'services', 'contact', 'gallery', 'blog', 'team', 'pricing', 'faq', 'testimonials'];
    const industrySpecific = {
      restaurant: ['menu', 'reservations'],
      pizza: ['menu', 'order-online'],
      cafe: ['menu'],
      bakery: ['menu', 'order-online'],
      'spa-salon': ['services', 'booking'],
      fitness: ['classes', 'schedule', 'membership'],
      yoga: ['classes', 'schedule'],
      dental: ['services', 'booking'],
      healthcare: ['services', 'booking'],
      'real-estate': ['listings', 'properties'],
      photography: ['portfolio', 'packages'],
      portfolio: ['work', 'projects'],
      ecommerce: ['products', 'shop']
    };
    return [...commonPages, ...(industrySpecific[industry] || [])];
  };

  const togglePage = (pageId) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(p => p !== pageId)
        : [...prev, pageId]
    );
  };

  const handlePageSettingsChange = (pageName, settings) => {
    setPageSettings(prev => ({
      ...prev,
      [pageName]: settings
    }));
  };

  const handleApplyToAll = (styleSettings) => {
    const updatedSettings = { ...pageSettings };
    selectedPages.forEach(page => {
      updatedSettings[page] = {
        ...updatedSettings[page],
        ...styleSettings
      };
    });
    setPageSettings(updatedSettings);
  };

  const handleAIFillRemaining = async () => {
    setAiSuggesting(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/suggest-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry,
          location,
          tagline,
          pages: selectedPages,
          existingSettings: pageSettings
        })
      });
      const data = await response.json();
      if (data.success && data.suggestions) {
        setPageSettings(prev => ({
          ...prev,
          ...data.suggestions
        }));
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
    } finally {
      setAiSuggesting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return businessName.trim() && industry;
      case 1: // Pages
        return selectedPages.length > 0;
      case 2: // Admin
        return true; // Optional
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const handleGenerate = () => {
    // Update shared context
    if (onUpdateContext) {
      onUpdateContext({
        businessName,
        industry,
        industryDisplay,
        location,
        tagline,
        adminTier,
        adminModules
      });
    }

    // Build generation config
    const config = {
      businessName,
      industry,
      industryDisplay,
      industryIcon,
      location,
      tagline,
      selectedPages,
      pageSettings,
      adminTier: adminTier || 'standard',
      adminModules,
      mode: 'full-control'
    };

    onGenerate(config);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicsStep();
      case 1:
        return renderPagesStep();
      case 2:
        return renderAdminStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Filter industries based on category and search
  const getFilteredIndustries = () => {
    let industries = [];

    if (activeCategory === 'all') {
      // Show all industries grouped by category
      return { grouped: true, categories: INDUSTRY_CATEGORIES };
    } else {
      // Show only the selected category
      industries = INDUSTRY_CATEGORIES[activeCategory]?.industries || [];
    }

    // Apply search filter
    if (industrySearch.trim()) {
      const search = industrySearch.toLowerCase();
      industries = industries.filter(ind =>
        ind.name.toLowerCase().includes(search) ||
        ind.key.toLowerCase().includes(search)
      );
    }

    return { grouped: false, industries };
  };

  // Get responsive grid columns based on window width
  const getGridStyle = () => {
    // Using CSS media queries in inline styles isn't ideal, but works for now
    // For a production app, consider using styled-components or CSS modules
    return {
      ...styles.industryGrid,
      // This will be overridden by the @media query approach below
    };
  };

  const renderBasicsStep = () => {
    const filteredData = getFilteredIndustries();

    return (
      <div>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Business Details</div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Business Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Sunrise Bakery"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              placeholder="e.g., Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tagline</label>
            <input
              type="text"
              placeholder="e.g., Baked fresh daily"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              style={styles.input}
            />
            <div style={styles.inputHint}>Skip and we'll generate one</div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Industry <span style={styles.required}>*</span>
          </div>

          {/* Search Bar */}
          <div style={styles.industrySearchWrapper}>
            <span style={styles.industrySearchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search industries..."
              value={industrySearch}
              onChange={(e) => setIndustrySearch(e.target.value)}
              style={styles.industrySearch}
            />
          </div>

          {/* Category Tabs */}
          <div style={styles.categoryTabs}>
            <button
              style={{
                ...styles.categoryTab,
                ...(activeCategory === 'all' ? styles.categoryTabAll : {})
              }}
              onClick={() => setActiveCategory('all')}
            >
              <span>🌐</span> All
            </button>
            {Object.entries(INDUSTRY_CATEGORIES).map(([catName, catData]) => (
              <button
                key={catName}
                style={{
                  ...styles.categoryTab,
                  ...(activeCategory === catName ? styles.categoryTabActive : {})
                }}
                onClick={() => setActiveCategory(catName)}
              >
                <span>{catData.icon}</span>
                <span style={{ display: 'none' }}>{catName}</span>
              </button>
            ))}
          </div>

          {/* Industry Grid */}
          {filteredData.grouped ? (
            // Show all categories with headers
            <div>
              {Object.entries(filteredData.categories).map(([catName, catData]) => {
                // Filter by search if needed
                let industries = catData.industries;
                if (industrySearch.trim()) {
                  const search = industrySearch.toLowerCase();
                  industries = industries.filter(ind =>
                    ind.name.toLowerCase().includes(search) ||
                    ind.key.toLowerCase().includes(search)
                  );
                }
                if (industries.length === 0) return null;

                return (
                  <div key={catName} style={{ marginBottom: '24px' }}>
                    <div style={styles.categoryHeader}>
                      <span style={styles.categoryHeaderIcon}>{catData.icon}</span>
                      <span style={styles.categoryHeaderText}>{catName}</span>
                    </div>
                    <div className="industry-grid" style={styles.industryGrid}>
                      {industries.map(ind => (
                        <div
                          key={ind.key}
                          style={{
                            ...styles.industryOption,
                            ...(hoveredIndustry === ind.key ? styles.industryOptionHover : {}),
                            ...(industry === ind.key ? styles.industryOptionSelected : {})
                          }}
                          onClick={() => setIndustry(ind.key)}
                          onMouseEnter={() => setHoveredIndustry(ind.key)}
                          onMouseLeave={() => setHoveredIndustry(null)}
                        >
                          {industry === ind.key && (
                            <div style={styles.industryCheckmark}>✓</div>
                          )}
                          <span style={styles.industryIcon}>{ind.icon}</span>
                          <span style={styles.industryName}>{ind.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Show filtered industries
            <div className="industry-grid" style={styles.industryGrid}>
              {filteredData.industries.map(ind => (
                <div
                  key={ind.key}
                  style={{
                    ...styles.industryOption,
                    ...(hoveredIndustry === ind.key ? styles.industryOptionHover : {}),
                    ...(industry === ind.key ? styles.industryOptionSelected : {})
                  }}
                  onClick={() => setIndustry(ind.key)}
                  onMouseEnter={() => setHoveredIndustry(ind.key)}
                  onMouseLeave={() => setHoveredIndustry(null)}
                >
                  {industry === ind.key && (
                    <div style={styles.industryCheckmark}>✓</div>
                  )}
                  <span style={styles.industryIcon}>{ind.icon}</span>
                  <span style={styles.industryName}>{ind.name}</span>
                </div>
              ))}
              {filteredData.industries.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                  No industries found matching "{industrySearch}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Responsive CSS */}
        <style>{`
          .industry-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          @media (max-width: 1024px) {
            .industry-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          @media (max-width: 768px) {
            .industry-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 480px) {
            .industry-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  };

  const renderPagesStep = () => (
    <div>
      {/* AI Suggestion Banner */}
      {Object.keys(pageSettings).length < selectedPages.length && (
        <div style={styles.aiSuggestionBanner}>
          <span style={styles.aiIcon}>🤖</span>
          <div style={styles.aiText}>
            <div style={styles.aiTitle}>AI Auto-Fill</div>
            <div style={styles.aiDescription}>
              Let AI suggest layouts and settings for uncustomized pages
            </div>
          </div>
          <button
            style={styles.aiBtn}
            onClick={handleAIFillRemaining}
            disabled={aiSuggesting}
          >
            {aiSuggesting ? 'Thinking...' : 'Auto-Fill'}
          </button>
        </div>
      )}

      {/* Page Selection */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Select Pages to Include</div>
        <div style={styles.pagesGrid}>
          {getAvailablePages().map(pageId => (
            <div
              key={pageId}
              style={{
                ...styles.pageCheckbox,
                ...(selectedPages.includes(pageId) ? styles.pageCheckboxSelected : {})
              }}
              onClick={() => togglePage(pageId)}
            >
              <span>{selectedPages.includes(pageId) ? '✅' : '☐'}</span>
              <span>{PAGE_ICONS[pageId] || '📄'}</span>
              {PAGE_LABELS[pageId] || pageId.charAt(0).toUpperCase() + pageId.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Page Customizer */}
      {selectedPages.length > 0 && (
        <PageCustomizer
          pages={selectedPages}
          currentPageIndex={currentPageIndex}
          pageSettings={pageSettings}
          businessContext={{
            businessName,
            industry,
            industryDisplay,
            location,
            tagline
          }}
          onPageSettingsChange={handlePageSettingsChange}
          onPreviousPage={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
          onNextPage={() => setCurrentPageIndex(prev => Math.min(selectedPages.length - 1, prev + 1))}
          onApplyToAll={handleApplyToAll}
        />
      )}
    </div>
  );

  const renderAdminStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Admin Dashboard Configuration</div>
        <AdminTierSelector
          industry={industry}
          businessDescription={`${businessName} ${tagline} ${location}`}
          selectedTier={adminTier}
          selectedModules={adminModules}
          onTierChange={setAdminTier}
          onModulesChange={setAdminModules}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div>
      {/* Business Info */}
      <div style={styles.reviewSection}>
        <div style={styles.reviewTitle}>Business Information</div>
        <div style={styles.reviewItem}>
          <span style={styles.reviewLabel}>Business Name</span>
          <span style={styles.reviewValue}>{businessName}</span>
        </div>
        <div style={styles.reviewItem}>
          <span style={styles.reviewLabel}>Industry</span>
          <span style={styles.reviewValue}>{industryIcon} {industryDisplay}</span>
        </div>
        {location && (
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Location</span>
            <span style={styles.reviewValue}>{location}</span>
          </div>
        )}
        {tagline && (
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Tagline</span>
            <span style={styles.reviewValue}>{tagline}</span>
          </div>
        )}
      </div>

      {/* Pages Summary */}
      <div style={styles.reviewSection}>
        <div style={styles.reviewTitle}>Pages ({selectedPages.length})</div>
        <div style={styles.pageReviewGrid}>
          {selectedPages.map(page => {
            const settings = pageSettings[page] || {};
            const pageIcon = PAGE_ICONS[page] || '📄';
            const pageName = PAGE_LABELS[page] || page.charAt(0).toUpperCase() + page.slice(1);
            const style = VISUAL_STYLES.find(s => s.id === settings.style);

            return (
              <div key={page} style={styles.pageReviewCard}>
                <div style={styles.pageReviewName}>
                  <span>{pageIcon}</span>
                  {pageName}
                </div>
                <div style={styles.pageReviewDetail}>
                  Layout: {settings.layout || 'Default'}
                </div>
                <div style={styles.pageReviewDetail}>
                  Style: {style?.name || 'Modern'}
                </div>
                <div style={styles.pageReviewDetail}>
                  Sections: {settings.sections?.length || 'Default'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Summary */}
      <div style={styles.reviewSection}>
        <div style={styles.reviewTitle}>Admin Dashboard</div>
        <div style={styles.reviewItem}>
          <span style={styles.reviewLabel}>Tier</span>
          <span style={styles.reviewValue}>
            {(adminTier || 'Standard').charAt(0).toUpperCase() + (adminTier || 'standard').slice(1)}
          </span>
        </div>
        <div style={styles.reviewItem}>
          <span style={styles.reviewLabel}>Modules</span>
          <span style={styles.reviewValue}>
            {adminModules.length > 0 ? adminModules.join(', ') : 'Default for tier'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                style={{
                  ...styles.stepDot,
                  ...(idx === currentStep ? styles.stepDotActive : {}),
                  ...(idx < currentStep ? styles.stepDotComplete : {})
                }}
              >
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    ...styles.stepLine,
                    ...(idx < currentStep ? styles.stepLineComplete : {})
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <h1 style={styles.title}>
          {STEPS[currentStep].icon} {STEPS[currentStep].name}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 0 && 'Tell us about your business'}
          {currentStep === 1 && 'Customize each page with your preferences'}
          {currentStep === 2 && 'Configure your admin dashboard'}
          {currentStep === 3 && 'Review and generate your website'}
        </p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {renderStepContent()}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.backBtn} onClick={handleBack}>
          {currentStep === 0 ? '← Exit' : '← Back'}
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            style={{
              ...styles.nextBtn,
              ...(!canProceed() ? styles.nextBtnDisabled : {})
            }}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next Step →
          </button>
        ) : (
          <button
            style={styles.generateBtn}
            onClick={handleGenerate}
          >
            ⚡ Generate Website
          </button>
        )}
      </div>
    </div>
  );
}
