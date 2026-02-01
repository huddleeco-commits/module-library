/**
 * BusinessCreator - Unified Business Creation Flow
 *
 * This is THE component for creating businesses - used in both:
 * - Test mode (for development/validation)
 * - Production mode (real AI-powered generation)
 *
 * The UI is identical in both modes. Only the backend behavior differs.
 */
import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Palette, Layers, Sparkles,
  ChevronRight, ChevronLeft, Check, Loader2,
  Coffee, Utensils, Heart, Dumbbell, Scissors, Briefcase,
  Store, Home, Car, GraduationCap, Calendar, PawPrint
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Industry icons mapping
const INDUSTRY_ICONS = {
  cafe: Coffee,
  restaurant: Utensils,
  healthcare: Heart,
  fitness: Dumbbell,
  salon: Scissors,
  professional: Briefcase,
  retail: Store,
  'home-services': Home,
  automotive: Car,
  education: GraduationCap,
  'event-services': Calendar,
  'pet-services': PawPrint
};

// Step definitions
const STEPS = [
  { id: 'business', label: 'Your Business', icon: Building2 },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'features', label: 'Features', icon: Layers },
  { id: 'generate', label: 'Generate', icon: Sparkles }
];

export default function BusinessCreator({ testMode = false, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [industries, setIndustries] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Business
    name: '',
    industry: 'cafe',
    variant: '',
    tagline: '',

    // Step 2: Location
    city: '',
    state: '',
    neighborhood: '',

    // Step 3: Style
    colors: {
      primary: '#6366f1',
      accent: '#06b6d4',
      text: '#1a1a2e',
      background: '#ffffff'
    },
    vibe: 50,      // Professional ← → Playful
    energy: 50,    // Calm ← → Energetic

    // Step 4: Features
    tier: 'recommended',
    includePortal: false,
    portalTier: 'basic',
    includeCompanion: false
  });

  // Load industries on mount
  useEffect(() => {
    loadIndustries();
  }, []);

  async function loadIndustries() {
    try {
      const res = await fetch(`${API_URL}/api/business/industries`);
      const data = await res.json();
      if (data.success) {
        setIndustries(data.industries);
      }
    } catch (err) {
      console.error('Failed to load industries:', err);
    }
  }

  function updateForm(updates) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function canProceed() {
    switch (currentStep) {
      case 0: return formData.name.trim().length > 0;
      case 1: return true; // Location is optional
      case 2: return true; // Style has defaults
      case 3: return true; // Features have defaults
      default: return true;
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const payload = {
        industry: formData.industry,
        variant: formData.variant || undefined,
        tier: formData.tier,
        business: {
          name: formData.name,
          tagline: formData.tagline || undefined
        },
        theme: {
          colors: formData.colors,
          moodSliders: {
            vibe: formData.vibe,
            energy: formData.energy,
            era: 50,
            density: 50,
            price: 50
          }
        },
        location: formData.city ? {
          city: formData.city,
          state: formData.state,
          neighborhood: formData.neighborhood
        } : undefined,
        includePortal: formData.includePortal,
        portalTier: formData.portalTier,
        includeCompanion: formData.includeCompanion,
        testMode: testMode
      };

      const res = await fetch(`${API_URL}/api/business/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        if (onComplete) onComplete(data);
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  // Get current industry config
  const currentIndustry = industries.find(i => i.key === formData.industry);

  return (
    <div style={styles.container}>
      {/* Test Mode Banner */}
      {testMode && (
        <div style={styles.testBanner}>
          Test Mode - No AI API calls will be made
        </div>
      )}

      {/* Progress Steps */}
      <div style={styles.progress}>
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={step.id}
              style={{
                ...styles.progressStep,
                ...(isActive ? styles.progressStepActive : {}),
                ...(isComplete ? styles.progressStepComplete : {})
              }}
              onClick={() => index < currentStep && setCurrentStep(index)}
            >
              <div style={{
                ...styles.progressIcon,
                ...(isActive ? styles.progressIconActive : {}),
                ...(isComplete ? styles.progressIconComplete : {})
              }}>
                {isComplete ? <Check size={18} /> : <StepIcon size={18} />}
              </div>
              <span style={styles.progressLabel}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={styles.content}>

        {/* Step 1: Business Info */}
        {currentStep === 0 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What's your business?</h2>
            <p style={styles.stepDesc}>Tell us about your business so we can create the perfect presence for you.</p>

            <div style={styles.field}>
              <label style={styles.label}>Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateForm({ name: e.target.value })}
                placeholder="e.g., Sunrise Cafe"
                style={styles.input}
                autoFocus
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>What type of business?</label>
              <div style={styles.industryGrid}>
                {industries.map(ind => {
                  const Icon = INDUSTRY_ICONS[ind.key] || Building2;
                  const isSelected = formData.industry === ind.key;
                  return (
                    <button
                      key={ind.key}
                      onClick={() => updateForm({ industry: ind.key, variant: '' })}
                      style={{
                        ...styles.industryCard,
                        ...(isSelected ? styles.industryCardSelected : {})
                      }}
                    >
                      <Icon size={24} />
                      <span>{ind.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {currentIndustry?.variants?.length > 0 && (
              <div style={styles.field}>
                <label style={styles.label}>Specialize further (optional)</label>
                <div style={styles.variantGrid}>
                  <button
                    onClick={() => updateForm({ variant: '' })}
                    style={{
                      ...styles.variantChip,
                      ...(formData.variant === '' ? styles.variantChipSelected : {})
                    }}
                  >
                    General {currentIndustry.name}
                  </button>
                  {currentIndustry.variants.map(v => (
                    <button
                      key={v}
                      onClick={() => updateForm({ variant: v })}
                      style={{
                        ...styles.variantChip,
                        ...(formData.variant === v ? styles.variantChipSelected : {})
                      }}
                    >
                      {v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Tagline (optional)</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => updateForm({ tagline: e.target.value })}
                placeholder="e.g., Start Your Day Right"
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Where are you located?</h2>
            <p style={styles.stepDesc}>This helps us create content that resonates with your local community.</p>

            <div style={styles.locationGrid}>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => updateForm({ city: e.target.value })}
                  placeholder="e.g., Austin"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => updateForm({ state: e.target.value })}
                  placeholder="e.g., TX"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Neighborhood (optional)</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={e => updateForm({ neighborhood: e.target.value })}
                placeholder="e.g., South Congress, Downtown"
                style={styles.input}
              />
            </div>

            <p style={styles.hint}>
              Skip this step if you serve customers online or nationwide.
            </p>
          </div>
        )}

        {/* Step 3: Style */}
        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What's your style?</h2>
            <p style={styles.stepDesc}>Choose colors and vibe that match your brand personality.</p>

            <div style={styles.field}>
              <label style={styles.label}>Brand Colors</label>
              <div style={styles.colorPickers}>
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={formData.colors.primary}
                    onChange={e => updateForm({ colors: { ...formData.colors, primary: e.target.value }})}
                    style={styles.colorInput}
                  />
                  <span>Primary</span>
                </div>
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={formData.colors.accent}
                    onChange={e => updateForm({ colors: { ...formData.colors, accent: e.target.value }})}
                    style={styles.colorInput}
                  />
                  <span>Accent</span>
                </div>
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={formData.colors.text}
                    onChange={e => updateForm({ colors: { ...formData.colors, text: e.target.value }})}
                    style={styles.colorInput}
                  />
                  <span>Text</span>
                </div>
                <div style={styles.colorPicker}>
                  <input
                    type="color"
                    value={formData.colors.background}
                    onChange={e => updateForm({ colors: { ...formData.colors, background: e.target.value }})}
                    style={styles.colorInput}
                  />
                  <span>Background</span>
                </div>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Vibe</label>
              <div style={styles.sliderContainer}>
                <span style={styles.sliderLabel}>Professional</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.vibe}
                  onChange={e => updateForm({ vibe: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span style={styles.sliderLabel}>Playful</span>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Energy</label>
              <div style={styles.sliderContainer}>
                <span style={styles.sliderLabel}>Calm</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.energy}
                  onChange={e => updateForm({ energy: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span style={styles.sliderLabel}>Energetic</span>
              </div>
            </div>

            {/* Live Preview Box */}
            <div style={{
              ...styles.preview,
              background: formData.colors.background,
              borderColor: formData.colors.primary
            }}>
              <h3 style={{
                color: formData.colors.text,
                marginBottom: '8px',
                fontWeight: formData.vibe > 50 ? '500' : '600'
              }}>
                {formData.name || 'Your Business'}
              </h3>
              <p style={{ color: formData.colors.text, opacity: 0.7, fontSize: '14px' }}>
                {formData.tagline || 'Your tagline here'}
              </p>
              <button style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: formData.colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: formData.vibe > 60 ? '20px' : formData.vibe > 40 ? '8px' : '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Features */}
        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>What do you need?</h2>
            <p style={styles.stepDesc}>Choose the features that fit your business.</p>

            <div style={styles.field}>
              <label style={styles.label}>Website Pages</label>
              <div style={styles.tierCards}>
                {[
                  { value: 'essential', name: 'Essential', desc: '4 core pages', pages: 'Home, About, Services, Contact' },
                  { value: 'recommended', name: 'Recommended', desc: '5-6 pages', pages: '+ Gallery, Testimonials' },
                  { value: 'premium', name: 'Premium', desc: '7-8 pages', pages: '+ Events, Team, Booking' }
                ].map(tier => (
                  <button
                    key={tier.value}
                    onClick={() => updateForm({ tier: tier.value })}
                    style={{
                      ...styles.tierCard,
                      ...(formData.tier === tier.value ? styles.tierCardSelected : {})
                    }}
                  >
                    <strong>{tier.name}</strong>
                    <span style={styles.tierDesc}>{tier.desc}</span>
                    <span style={styles.tierPages}>{tier.pages}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Member Portal</label>
              <p style={styles.fieldHint}>Let customers log in, track rewards, and manage their account.</p>
              <div style={styles.toggleCards}>
                <button
                  onClick={() => updateForm({ includePortal: false })}
                  style={{
                    ...styles.toggleCard,
                    ...(formData.includePortal === false ? styles.toggleCardSelected : {})
                  }}
                >
                  <strong>No Portal</strong>
                  <span>Public website only</span>
                </button>
                <button
                  onClick={() => updateForm({ includePortal: true, portalTier: 'basic' })}
                  style={{
                    ...styles.toggleCard,
                    ...(formData.includePortal && formData.portalTier === 'basic' ? styles.toggleCardSelected : {})
                  }}
                >
                  <strong>Basic Portal</strong>
                  <span>Dashboard + Profile</span>
                </button>
                <button
                  onClick={() => updateForm({ includePortal: true, portalTier: 'full' })}
                  style={{
                    ...styles.toggleCard,
                    ...(formData.includePortal && formData.portalTier === 'full' ? styles.toggleCardSelected : {})
                  }}
                >
                  <strong>Full Portal</strong>
                  <span>Rewards, Wallet, Leaderboard</span>
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.includeCompanion}
                  onChange={e => updateForm({ includeCompanion: e.target.checked })}
                  style={styles.checkbox}
                />
                <span>Generate Companion Mobile App</span>
              </label>
              <p style={styles.fieldHint}>A mobile app for your customers to access your services on the go.</p>
            </div>
          </div>
        )}

        {/* Step 5: Generate */}
        {currentStep === 4 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Ready to create your business?</h2>
            <p style={styles.stepDesc}>Review your choices and generate your complete business presence.</p>

            {/* Summary */}
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>Business</span>
                <strong>{formData.name}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Industry</span>
                <strong>{currentIndustry?.name || formData.industry}{formData.variant ? ` (${formData.variant})` : ''}</strong>
              </div>
              {formData.city && (
                <div style={styles.summaryRow}>
                  <span>Location</span>
                  <strong>{formData.city}, {formData.state}</strong>
                </div>
              )}
              <div style={styles.summaryRow}>
                <span>Website</span>
                <strong>{formData.tier.charAt(0).toUpperCase() + formData.tier.slice(1)} tier</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Portal</span>
                <strong>{formData.includePortal ? (formData.portalTier === 'full' ? 'Full Portal' : 'Basic Portal') : 'None'}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Companion App</span>
                <strong>{formData.includeCompanion ? 'Yes' : 'No'}</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Colors</span>
                <div style={styles.colorPreview}>
                  <span style={{ ...styles.colorDot, background: formData.colors.primary }}></span>
                  <span style={{ ...styles.colorDot, background: formData.colors.accent }}></span>
                  <span style={{ ...styles.colorDot, background: formData.colors.text }}></span>
                </div>
              </div>
            </div>

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {result && (
              <div style={styles.success}>
                <Check size={24} />
                <div>
                  <strong>Business Created!</strong>
                  <p>{result.pageCount} pages generated{result.portalPageCount > 0 ? ` + ${result.portalPageCount} portal pages` : ''}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={styles.nav}>
        {currentStep > 0 && (
          <button onClick={prevStep} style={styles.backBtn}>
            <ChevronLeft size={20} />
            Back
          </button>
        )}

        <div style={{ flex: 1 }} />

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            style={{
              ...styles.nextBtn,
              ...(!canProceed() ? styles.btnDisabled : {})
            }}
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={generating || result}
            style={{
              ...styles.generateBtn,
              ...((generating || result) ? styles.btnDisabled : {})
            }}
          >
            {generating ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </>
            ) : result ? (
              <>
                <Check size={20} />
                Done!
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Business
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  testBanner: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '12px 16px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '24px',
    fontWeight: '500'
  },
  progress: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    position: 'relative'
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 0.2s'
  },
  progressStepActive: {
    opacity: 1
  },
  progressStepComplete: {
    opacity: 1,
    cursor: 'pointer'
  },
  progressIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af'
  },
  progressIconActive: {
    background: '#6366f1',
    color: '#fff'
  },
  progressIconComplete: {
    background: '#10b981',
    color: '#fff'
  },
  progressLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151'
  },
  content: {
    minHeight: '400px'
  },
  stepContent: {
    animation: 'fadeIn 0.3s ease'
  },
  stepTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px'
  },
  stepDesc: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '32px'
  },
  field: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  industryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '12px'
  },
  industryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151'
  },
  industryCardSelected: {
    borderColor: '#6366f1',
    background: '#eef2ff',
    color: '#4f46e5'
  },
  variantGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  variantChip: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  variantChipSelected: {
    borderColor: '#6366f1',
    background: '#6366f1',
    color: '#fff'
  },
  hint: {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: '16px'
  },
  locationGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px'
  },
  colorPickers: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  colorPicker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6b7280'
  },
  colorInput: {
    width: '60px',
    height: '60px',
    border: '3px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    padding: 0
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  slider: {
    flex: 1,
    height: '8px',
    cursor: 'pointer',
    accentColor: '#6366f1'
  },
  sliderLabel: {
    fontSize: '13px',
    color: '#6b7280',
    minWidth: '80px'
  },
  preview: {
    marginTop: '32px',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid',
    textAlign: 'center'
  },
  tierCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  tierCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '20px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  tierCardSelected: {
    borderColor: '#6366f1',
    background: '#eef2ff'
  },
  tierDesc: {
    fontSize: '14px',
    color: '#6b7280'
  },
  tierPages: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px'
  },
  toggleCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  toggleCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    fontSize: '14px'
  },
  toggleCardSelected: {
    borderColor: '#6366f1',
    background: '#eef2ff'
  },
  fieldHint: {
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '4px',
    marginBottom: '12px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#6366f1'
  },
  summary: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '15px'
  },
  colorPreview: {
    display: 'flex',
    gap: '8px'
  },
  colorDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  success: {
    background: '#f0fdf4',
    color: '#15803d',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};
