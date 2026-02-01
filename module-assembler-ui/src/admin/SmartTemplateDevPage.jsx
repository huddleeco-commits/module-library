/**
 * Smart Template DevTools Page
 *
 * Test and experiment with the hybrid template + AI content generation approach
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  FileText,
  Palette,
  Sliders,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from 'lucide-react';

const API_URL = window.location.origin;

// Industry options
const INDUSTRIES = [
  { value: 'cafe', label: 'Coffee Shop / Cafe' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pizza', label: 'Pizzeria' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Hair Salon' },
  { value: 'spa', label: 'Spa & Wellness' },
  { value: 'fitness', label: 'Fitness / Gym' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'law', label: 'Law Firm' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'photography', label: 'Photography' },
  { value: 'construction', label: 'Construction' },
  { value: 'auto', label: 'Auto Services' }
];

// Page options
const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Services' },
  { value: 'menu', label: 'Menu' },
  { value: 'contact', label: 'Contact' },
  { value: 'team', label: 'Team' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'faq', label: 'FAQ' },
  { value: 'reservations', label: 'Reservations' },
  { value: 'booking', label: 'Booking' },
  { value: 'events', label: 'Events' },
  { value: 'schedule', label: 'Schedule' }
];

// Page tiers
const PAGE_TIERS = [
  { value: 'essential', label: 'Essential (3-4 pages)', description: 'Minimum viable site' },
  { value: 'recommended', label: 'Recommended (5-6 pages)', description: 'What most businesses need' },
  { value: 'premium', label: 'Premium (7-9 pages)', description: 'Full-featured site' },
  { value: 'custom', label: 'Custom', description: 'Pick your own pages' }
];

// Portal options
const PORTAL_OPTIONS = [
  { value: 'none', label: 'No Portal', description: 'Public site only' },
  { value: 'standard', label: 'Standard Portal', description: 'Dashboard + Profile' },
  { value: 'loyalty', label: 'Loyalty Program', description: 'Rewards, Earn, Profile' },
  { value: 'full', label: 'Full Portal', description: 'All portal features' }
];

export default function SmartTemplateDevPage() {
  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'cafe',
    location: '',
    tagline: '',
    phone: '',
    email: '',
    yearsInBusiness: '',
    teamMembers: '',
    menuText: '',
    pageTier: 'recommended',
    pages: [],  // Empty = use industry defaults
    includePortal: false,
    portalTier: 'none',
    colors: {
      primary: '#6366f1',
      accent: '#06b6d4',
      text: '#1a1a2e',
      background: '#ffffff'
    },
    moodSliders: {
      vibe: 50,
      energy: 50,
      era: 50,
      density: 50,
      price: 50
    }
  });

  // Industry config state (fetched from API)
  const [industryConfig, setIndustryConfig] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    content: false,
    styling: false,
    pages: true  // Expanded by default to show page tiers and portal options
  });
  const [skipAI, setSkipAI] = useState(true); // Default to skip for testing

  // Fetch industry configuration when industry changes
  useEffect(() => {
    const fetchIndustryConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/api/smart-template/industry/${formData.industry}?tier=${formData.pageTier}`);
        const data = await response.json();
        setIndustryConfig(data);
      } catch (err) {
        console.error('Failed to fetch industry config:', err);
      }
    };
    fetchIndustryConfig();
  }, [formData.industry, formData.pageTier]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateColor = (colorKey, value) => {
    setFormData(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
  };

  const updateSlider = (sliderKey, value) => {
    setFormData(prev => ({
      ...prev,
      moodSliders: { ...prev.moodSliders, [sliderKey]: parseInt(value) }
    }));
  };

  const togglePage = (page) => {
    setFormData(prev => ({
      ...prev,
      pages: prev.pages.includes(page)
        ? prev.pages.filter(p => p !== page)
        : [...prev.pages, page]
    }));
  };

  // Parse team members from text
  const parseTeamMembers = (text) => {
    if (!text.trim()) return [];
    return text.split('\n').filter(l => l.trim()).map(line => {
      const parts = line.split('-').map(p => p.trim());
      return {
        name: parts[0] || line,
        role: parts[1] || ''
      };
    });
  };

  // Preview handler
  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    setPreviewData(null);
    setLogs([{ type: 'info', message: 'Starting preview...' }]);

    try {
      const response = await fetch(`${API_URL}/api/smart-template/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamMembers: parseTeamMembers(formData.teamMembers),
          skipAI
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.preview);
        setLogs(prev => [...prev, { type: 'success', message: 'Preview generated!' }]);
      } else {
        setError(data.error);
        setLogs(prev => [...prev, { type: 'error', message: data.error }]);
      }
    } catch (err) {
      setError(err.message);
      setLogs(prev => [...prev, { type: 'error', message: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  // Full generation handler with SSE
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerationResult(null);
    setLogs([{ type: 'info', message: 'Starting generation...' }]);

    try {
      const response = await fetch(`${API_URL}/api/smart-template/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamMembers: parseTeamMembers(formData.teamMembers),
          skipAI
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
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            continue;
          }
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.message) {
                setLogs(prev => [...prev, {
                  type: data.error ? 'error' : 'info',
                  message: data.message
                }]);
              }

              if (data.success !== undefined) {
                setGenerationResult(data);
                if (data.success) {
                  setLogs(prev => [...prev, { type: 'success', message: 'Generation complete!' }]);
                }
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setLogs(prev => [...prev, { type: 'error', message: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill with example data
  const fillExample = () => {
    setFormData({
      businessName: 'Coffee House Cafe',
      industry: 'cafe',
      location: 'Dallas, Texas',
      tagline: 'Where Dallas Comes Together',
      phone: '(214) 555-1234',
      email: 'hello@coffeehousecafe.com',
      yearsInBusiness: '5',
      teamMembers: 'Sarah Johnson - Owner & Head Barista\nMike Chen - Lead Roaster\nEmily Davis - Pastry Chef',
      menuText: `ESPRESSO DRINKS
Latte - $5.50
Cappuccino - $5.00
Americano - $4.00
Mocha - $6.00

BREWED COFFEE
House Blend - $3.50
Single Origin - $4.50
Cold Brew - $5.00

PASTRIES
Croissant - $4.00
Blueberry Muffin - $3.50
Chocolate Chip Cookie - $2.50`,
      pageTier: 'recommended',
      pages: [],  // Use industry defaults
      includePortal: false,
      portalTier: 'none',
      colors: {
        primary: '#8B4513',
        accent: '#D2691E',
        text: '#2C1810',
        background: '#FFF8F0'
      },
      moodSliders: {
        vibe: 70,
        energy: 45,
        era: 55,
        density: 40,
        price: 50
      }
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Sparkles size={28} color="#6366f1" />
          <div>
            <h1 style={styles.title}>Smart Template DevTools</h1>
            <p style={styles.subtitle}>Hybrid template + AI content generation</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={fillExample} style={styles.exampleButton}>
            Fill Example
          </button>
          <label style={styles.skipToggle}>
            <input
              type="checkbox"
              checked={skipAI}
              onChange={(e) => setSkipAI(e.target.checked)}
            />
            <span>Skip AI (Free)</span>
          </label>
        </div>
      </div>

      <div style={styles.content}>
        {/* Left Panel - Form */}
        <div style={styles.formPanel}>
          {/* Basic Info Section */}
          <div style={styles.section}>
            <button
              onClick={() => toggleSection('basic')}
              style={styles.sectionHeader}
            >
              <span>Basic Information</span>
              {expandedSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.basic && (
              <div style={styles.sectionContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Business Name *</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    placeholder="Coffee House Cafe"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateForm('industry', e.target.value)}
                    style={styles.select}
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <MapPin size={14} /> Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    placeholder="Dallas, Texas"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Phone size={14} /> Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      <Mail size={14} /> Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="hello@example.com"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tagline (optional)</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => updateForm('tagline', e.target.value)}
                    placeholder="Let AI generate one, or enter your own"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Years in Business</label>
                  <input
                    type="text"
                    value={formData.yearsInBusiness}
                    onChange={(e) => updateForm('yearsInBusiness', e.target.value)}
                    placeholder="5"
                    style={styles.input}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div style={styles.section}>
            <button
              onClick={() => toggleSection('content')}
              style={styles.sectionHeader}
            >
              <span><Users size={16} /> Team & Menu Content</span>
              {expandedSections.content ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.content && (
              <div style={styles.sectionContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Team Members (one per line: Name - Role)</label>
                  <textarea
                    value={formData.teamMembers}
                    onChange={(e) => updateForm('teamMembers', e.target.value)}
                    placeholder="Sarah Johnson - Owner&#10;Mike Chen - Manager"
                    style={styles.textarea}
                    rows={4}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FileText size={14} /> Menu / Services (paste text)
                  </label>
                  <textarea
                    value={formData.menuText}
                    onChange={(e) => updateForm('menuText', e.target.value)}
                    placeholder="CATEGORY&#10;Item Name - $10.00&#10;Another Item - $12.50"
                    style={styles.textarea}
                    rows={6}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Styling Section */}
          <div style={styles.section}>
            <button
              onClick={() => toggleSection('styling')}
              style={styles.sectionHeader}
            >
              <span><Palette size={16} /> Colors & Mood</span>
              {expandedSections.styling ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.styling && (
              <div style={styles.sectionContent}>
                <div style={styles.colorGrid}>
                  {Object.entries(formData.colors).map(([key, value]) => (
                    <div key={key} style={styles.colorItem}>
                      <label style={styles.colorLabel}>{key}</label>
                      <div style={styles.colorInputWrapper}>
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateColor(key, e.target.value)}
                          style={styles.colorInput}
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateColor(key, e.target.value)}
                          style={styles.colorText}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.slidersSection}>
                  <h4 style={styles.slidersTitle}>Mood Sliders</h4>
                  {Object.entries(formData.moodSliders).map(([key, value]) => (
                    <div key={key} style={styles.sliderItem}>
                      <div style={styles.sliderHeader}>
                        <span style={styles.sliderLabel}>{key}</span>
                        <span style={styles.sliderValue}>{value}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => updateSlider(key, e.target.value)}
                        style={styles.slider}
                      />
                      <div style={styles.sliderLabels}>
                        <span>{getSliderLeftLabel(key)}</span>
                        <span>{getSliderRightLabel(key)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pages Section */}
          <div style={styles.section}>
            <button
              onClick={() => toggleSection('pages')}
              style={styles.sectionHeader}
            >
              <span>Pages & Portal</span>
              {expandedSections.pages ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expandedSections.pages && (
              <div style={styles.sectionContent}>
                {/* Page Tier Selection */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Page Package</label>
                  <div style={styles.tierOptions}>
                    {PAGE_TIERS.map(tier => (
                      <div
                        key={tier.value}
                        onClick={() => updateForm('pageTier', tier.value)}
                        style={{
                          ...styles.tierOption,
                          ...(formData.pageTier === tier.value ? styles.tierOptionActive : {})
                        }}
                      >
                        <strong>{tier.label}</strong>
                        <span style={styles.tierDesc}>{tier.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Industry-recommended pages preview */}
                {industryConfig && formData.pageTier !== 'custom' && (
                  <div style={styles.industryPreview}>
                    <span style={styles.industryPreviewLabel}>
                      Pages for {formData.industry} ({formData.pageTier}):
                    </span>
                    <div style={styles.pagePreviewTags}>
                      {industryConfig.pages?.map(page => (
                        <span key={page} style={styles.pageTag}>{page}</span>
                      ))}
                    </div>
                    {industryConfig.terminology && (
                      <div style={styles.terminologyNote}>
                        Terminology: "{industryConfig.terminology.services}" / "{industryConfig.terminology.team}"
                      </div>
                    )}
                  </div>
                )}

                {/* Custom page selection (only if custom tier) */}
                {formData.pageTier === 'custom' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Pages</label>
                    <div style={styles.pagesGrid}>
                      {PAGE_OPTIONS.map(page => (
                        <label key={page.value} style={styles.pageCheckbox}>
                          <input
                            type="checkbox"
                            checked={formData.pages.includes(page.value)}
                            onChange={() => togglePage(page.value)}
                          />
                          <span>{page.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portal Options */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Portal / Member Area</label>
                  <div style={styles.portalOptions}>
                    {PORTAL_OPTIONS.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            portalTier: opt.value,
                            includePortal: opt.value !== 'none'
                          }));
                        }}
                        style={{
                          ...styles.portalOption,
                          ...(formData.portalTier === opt.value ? styles.portalOptionActive : {})
                        }}
                      >
                        <strong>{opt.label}</strong>
                        <span style={styles.portalDesc}>{opt.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button
              onClick={handlePreview}
              disabled={loading || !formData.businessName || !formData.location}
              style={{
                ...styles.previewButton,
                opacity: loading || !formData.businessName || !formData.location ? 0.5 : 1
              }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Eye size={18} />}
              <span>Preview Content</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !formData.businessName || !formData.location}
              style={{
                ...styles.generateButton,
                opacity: loading || !formData.businessName || !formData.location ? 0.5 : 1
              }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
              <span>Generate Project</span>
            </button>
          </div>

          {/* Cost Estimate */}
          <div style={styles.costEstimate}>
            <DollarSign size={16} />
            <span>
              Estimated cost: {skipAI ? '$0.00 (using placeholders)' : '~$0.12 (AI content)'}
            </span>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div style={styles.resultsPanel}>
          {/* Logs */}
          <div style={styles.logsSection}>
            <h3 style={styles.logsSectionTitle}>Activity Log</h3>
            <div style={styles.logsContainer}>
              {logs.length === 0 ? (
                <p style={styles.logsEmpty}>No activity yet. Click Preview or Generate to start.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{
                    ...styles.logItem,
                    color: log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#10b981' : '#94a3b8'
                  }}>
                    {log.type === 'success' && <CheckCircle size={14} />}
                    {log.type === 'error' && <AlertCircle size={14} />}
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Data */}
          {previewData && (
            <div style={styles.previewSection}>
              <h3 style={styles.previewTitle}>
                <CheckCircle size={18} color="#10b981" />
                Preview Generated
              </h3>

              <div style={styles.previewCard}>
                <h4>Hero Content</h4>
                <p><strong>Tagline:</strong> {previewData.content?.hero?.tagline}</p>
                <p><strong>Subtext:</strong> {previewData.content?.hero?.subtext}</p>
              </div>

              {previewData.content?.about?.story && (
                <div style={styles.previewCard}>
                  <h4>About Story</h4>
                  <p>{previewData.content.about.story}</p>
                </div>
              )}

              {previewData.content?.testimonials?.length > 0 && (
                <div style={styles.previewCard}>
                  <h4>Testimonials</h4>
                  {previewData.content.testimonials.map((t, i) => (
                    <p key={i}>"{t.quote}" - {t.name}</p>
                  ))}
                </div>
              )}

              <div style={styles.previewCard}>
                <h4>Raw JSON</h4>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(previewData, null, 2))}
                  style={styles.copyButton}
                >
                  <Copy size={14} /> Copy JSON
                </button>
                <pre style={styles.jsonPre}>
                  {JSON.stringify(previewData, null, 2).substring(0, 1000)}...
                </pre>
              </div>
            </div>
          )}

          {/* Generation Result */}
          {generationResult?.success && (
            <div style={styles.successSection}>
              <h3 style={styles.successTitle}>
                <CheckCircle size={20} color="#10b981" />
                Project Generated!
              </h3>
              <div style={styles.successCard}>
                <p><strong>Project:</strong> {generationResult.projectName}</p>
                <p><strong>Pages:</strong> {generationResult.pagesGenerated}</p>
                <p><strong>AI Calls:</strong> {generationResult.aiCalls}</p>
                <p><strong>Cost:</strong> {generationResult.estimatedCost}</p>
                <p style={styles.pathText}><strong>Path:</strong> {generationResult.projectPath}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions for slider labels
function getSliderLeftLabel(key) {
  const labels = {
    vibe: 'Professional',
    energy: 'Calm',
    era: 'Classic',
    density: 'Minimal',
    price: 'Budget'
  };
  return labels[key] || '';
}

function getSliderRightLabel(key) {
  const labels = {
    vibe: 'Friendly',
    energy: 'Bold',
    era: 'Modern',
    density: 'Rich',
    price: 'Premium'
  };
  return labels[key] || '';
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  exampleButton: {
    padding: '8px 16px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#475569'
  },
  skipToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    cursor: 'pointer'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  formPanel: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto'
  },
  section: {
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8fafc',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  sectionContent: {
    padding: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    background: '#ffffff',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  colorItem: {
    marginBottom: '8px'
  },
  colorLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'capitalize',
    display: 'block',
    marginBottom: '4px'
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '8px'
  },
  colorInput: {
    width: '40px',
    height: '32px',
    padding: 0,
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  colorText: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  slidersSection: {
    marginTop: '16px'
  },
  slidersTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '12px'
  },
  sliderItem: {
    marginBottom: '16px'
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  sliderLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'capitalize'
  },
  sliderValue: {
    fontSize: '12px',
    color: '#6366f1',
    fontWeight: '600'
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: '#e2e8f0',
    cursor: 'pointer'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  pagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  pageCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
    cursor: 'pointer'
  },
  tierOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  tierOption: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tierOptionActive: {
    borderColor: '#6366f1',
    background: '#f0f0ff'
  },
  tierDesc: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px'
  },
  industryPreview: {
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px'
  },
  industryPreviewLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    display: 'block',
    marginBottom: '8px'
  },
  pagePreviewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  pageTag: {
    padding: '4px 10px',
    background: '#6366f1',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500'
  },
  terminologyNote: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  portalOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  portalOption: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  portalOptionActive: {
    borderColor: '#10b981',
    background: '#f0fdf4'
  },
  portalDesc: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  previewButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#475569'
  },
  generateButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#ffffff'
  },
  costEstimate: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '12px',
    padding: '8px',
    background: '#fefce8',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#854d0e'
  },
  resultsPanel: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '20px',
    color: '#e2e8f0',
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto'
  },
  logsSection: {
    marginBottom: '20px'
  },
  logsSectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '12px'
  },
  logsContainer: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    maxHeight: '200px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '12px'
  },
  logsEmpty: {
    color: '#64748b',
    fontStyle: 'italic'
  },
  logItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '16px'
  },
  previewSection: {
    marginBottom: '20px'
  },
  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  previewCard: {
    background: '#334155',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    background: '#475569',
    border: 'none',
    borderRadius: '4px',
    color: '#e2e8f0',
    fontSize: '12px',
    cursor: 'pointer',
    marginBottom: '8px'
  },
  jsonPre: {
    background: '#0f172a',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '11px',
    overflow: 'auto',
    maxHeight: '200px'
  },
  successSection: {
    background: '#065f46',
    borderRadius: '8px',
    padding: '16px'
  },
  successTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#ffffff'
  },
  successCard: {
    background: '#047857',
    borderRadius: '6px',
    padding: '12px'
  },
  pathText: {
    fontSize: '12px',
    wordBreak: 'break-all',
    opacity: 0.9
  }
};
