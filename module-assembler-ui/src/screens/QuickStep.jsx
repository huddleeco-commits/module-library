/**
 * QuickStep Screen
 * Quick business description and industry detection
 * Now includes MoodSliders for quick creative customization
 * WITH LIVE STRUCTURE PREVIEW - SIDE BY SIDE LAYOUT
 */

import React, { useState, useEffect, useRef } from 'react';
import { styles } from '../styles';
import { MoodSliders, THEME_MODES } from '../components/MoodSliders';
import { LayoutSelector } from '../components/LayoutSelector';
import { PagePackageSelector } from '../components/PagePackageSelector';
import { API_BASE } from '../constants';
import { getIndustryPages } from '../constants/industry-config';

// Side-by-side layout styles
const quickStepStyles = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 120px)',
    gap: '24px',
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto'
  },
  leftPanel: {
    flex: '0 0 420px',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  rightPanel: {
    flex: 1,
    minWidth: '500px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  previewHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e4e4e4',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  themeTabs: {
    display: 'flex',
    gap: '6px',
    background: 'rgba(255,255,255,0.05)',
    padding: '4px',
    borderRadius: '8px'
  },
  themeTab: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  themeTabActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc'
  },
  structureBanner: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  previewContent: {
    flex: 1,
    position: 'relative',
    background: '#fff',
    minHeight: '500px'
  },
  previewIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    position: 'absolute',
    top: 0,
    left: 0
  },
  emptyPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
    color: '#666'
  },
  statusBar: {
    padding: '12px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#888'
  },
  costBadge: {
    padding: '4px 10px',
    background: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '12px',
    color: '#22c55e',
    fontWeight: '600',
    fontSize: '11px'
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.8)',
    padding: '16px 28px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 10
  },
  // Mobile responsive
  mobileContainer: {
    flexDirection: 'column',
    padding: '16px'
  },
  mobileLeftPanel: {
    flex: 'none',
    maxWidth: '100%',
    width: '100%'
  },
  mobileRightPanel: {
    minWidth: 'auto',
    minHeight: '400px'
  }
};

export function QuickStep({ industries, projectData, updateProject, onContinue, onBack }) {
  const [input, setInput] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(null);
  const [nameAvailability, setNameAvailability] = useState(null);
  const [moodSliders, setMoodSliders] = useState(projectData.moodSliders || null);

  // Live preview state
  const [previewHtml, setPreviewHtml] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('medium'); // light, medium, dark
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedPages, setSelectedPages] = useState([]);
  const debounceRef = useRef(null);

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const examples = [
    'Pizza restaurant in Brooklyn',
    'Dental clinic',
    'Sports card shop',
    'Yoga studio in Austin',
    'Law firm',
    'Coffee roastery'
  ];

  const handleDetect = async () => {
    if (!input.trim()) return;

    setDetecting(true);

    // Simple industry detection from input
    const inputLower = input.toLowerCase();
    let matchedIndustry = null;
    let matchedKey = null;

    // Match against industries
    for (const [key, ind] of Object.entries(industries)) {
      const name = ind.name?.toLowerCase() || '';
      const keywords = [name, ...(ind.keywords || [])].map(k => k.toLowerCase());

      if (keywords.some(k => inputLower.includes(k)) || inputLower.includes(key)) {
        matchedIndustry = ind;
        matchedKey = key;
        break;
      }
    }

    // Fallback detection - order matters (specific first)
    if (!matchedIndustry) {
      // Finance/Investment (BEFORE SaaS)
      if (inputLower.includes('investment') || inputLower.includes('wealth') || inputLower.includes('portfolio') || inputLower.includes('hedge fund') || inputLower.includes('private equity') || inputLower.includes('asset management') || inputLower.includes('capital') || inputLower.includes('securities') || inputLower.includes('brokerage') || inputLower.includes('financial advisor')) {
        matchedKey = 'finance';
        matchedIndustry = industries['finance'] || { name: 'Finance / Investment Firm', icon: '💹' };
      } else if (inputLower.includes('restaurant') || inputLower.includes('food') || inputLower.includes('pizza') || inputLower.includes('bbq') || inputLower.includes('cafe') || inputLower.includes('dining') || inputLower.includes('grill')) {
        matchedKey = 'restaurant';
        matchedIndustry = industries['restaurant'] || { name: 'Restaurant', icon: '🍽️' };
      } else if (inputLower.includes('dental') || inputLower.includes('dentist')) {
        matchedKey = 'dental';
        matchedIndustry = industries['dental'] || { name: 'Dental Practice', icon: '🦷' };
      } else if (inputLower.includes('doctor') || inputLower.includes('clinic') || inputLower.includes('medical') || inputLower.includes('healthcare') || inputLower.includes('physician')) {
        matchedKey = 'healthcare';
        matchedIndustry = industries['healthcare'] || { name: 'Healthcare', icon: '🏥' };
      } else if (inputLower.includes('card') || inputLower.includes('collect')) {
        matchedKey = 'collectibles';
        matchedIndustry = industries['collectibles'] || { name: 'Collectibles', icon: '🃏' };
      } else if (inputLower.includes('law') || inputLower.includes('attorney') || inputLower.includes('lawyer') || inputLower.includes('legal')) {
        matchedKey = 'law-firm';
        matchedIndustry = industries['law-firm'] || { name: 'Law Firm', icon: '⚖️' };
      } else if (inputLower.includes('yoga') || inputLower.includes('pilates') || inputLower.includes('meditation')) {
        matchedKey = 'yoga';
        matchedIndustry = industries['yoga'] || { name: 'Yoga Studio', icon: '🧘' };
      } else if (inputLower.includes('gym') || inputLower.includes('fitness') || inputLower.includes('crossfit')) {
        matchedKey = 'fitness';
        matchedIndustry = industries['fitness'] || { name: 'Fitness', icon: '🏋️' };
      } else if (inputLower.includes('spa') || inputLower.includes('salon') || inputLower.includes('beauty')) {
        matchedKey = 'spa-salon';
        matchedIndustry = industries['spa-salon'] || { name: 'Spa / Salon', icon: '💆' };
      } else if (inputLower.includes('coffee') || inputLower.includes('roaster')) {
        matchedKey = 'cafe';
        matchedIndustry = industries['cafe'] || { name: 'Coffee Shop', icon: '☕' };
      } else if (inputLower.includes('real estate') || inputLower.includes('realtor') || inputLower.includes('realty')) {
        matchedKey = 'real-estate';
        matchedIndustry = industries['real-estate'] || { name: 'Real Estate', icon: '🏠' };
      } else if (inputLower.includes('construction') || inputLower.includes('contractor') || inputLower.includes('builder')) {
        matchedKey = 'construction';
        matchedIndustry = industries['construction'] || { name: 'Construction', icon: '🔨' };
      } else if (inputLower.includes('plumb') || inputLower.includes('hvac')) {
        matchedKey = 'plumber';
        matchedIndustry = industries['plumber'] || { name: 'Plumber / HVAC', icon: '🔧' };
      } else if (inputLower.includes('electric')) {
        matchedKey = 'electrician';
        matchedIndustry = industries['electrician'] || { name: 'Electrician', icon: '⚡' };
      } else {
        matchedKey = 'saas';
        matchedIndustry = industries['saas'] || { name: 'Business', icon: '💼' };
      }
    }

    setTimeout(async () => {
      setDetected({ industry: matchedIndustry, key: matchedKey });

      // Get recommended pages for this industry
      const recommendedPages = getIndustryPages(matchedKey, 'recommended');
      setSelectedPages(recommendedPages);

      updateProject({
        businessName: input,
        industry: matchedIndustry,
        industryKey: matchedKey,
        layoutKey: matchedIndustry?.defaultLayout || null,
        effects: matchedIndustry?.effects || [],
        selectedPages: recommendedPages
      });
      setDetecting(false);

      // Check name availability
      try {
        const res = await fetch(`/api/check-name?name=${encodeURIComponent(input)}`);
        const data = await res.json();
        if (data.success) {
          setNameAvailability(data);
        }
      } catch (err) {
        console.error('Name check failed:', err);
      }
    }, 800);
  };

  // Handle mood slider changes
  const handleMoodChange = (values) => {
    setMoodSliders(values);
    updateProject({ moodSliders: values });
  };

  // Live preview generation with debounce
  useEffect(() => {
    if (!detected?.key) return;

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setPreviewLoading(true);

    // Debounce preview generation (400ms for snappier feel)
    debounceRef.current = setTimeout(async () => {
      try {
        // Merge theme into mood sliders
        const slidersWithTheme = {
          ...(moodSliders || {}),
          theme: previewTheme
        };

        const response = await fetch(`${API_BASE}/api/preview-style`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: detected.key,
            businessName: input || 'Demo Business',
            pages: ['home'],
            moodSliders: slidersWithTheme,
            layoutKey: selectedLayout,
            sandboxMode: true // Use real images from fixtures
          })
        });

        const data = await response.json();
        if (data.success && data.pages?.home) {
          setPreviewHtml(data.pages.home);
        }
      } catch (err) {
        console.error('Preview generation failed:', err);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [moodSliders, detected?.key, previewTheme, selectedLayout, input]);

  // Theme options for preview
  const themeOptions = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'medium', label: 'Medium', icon: '🌤️' },
    { id: 'dark', label: 'Dark', icon: '🌙' }
  ];

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        ...quickStepStyles.container,
        ...(isMobile ? quickStepStyles.mobileContainer : {})
      }}>
        {/* Left Panel - Form Controls */}
        <div style={{
          ...quickStepStyles.leftPanel,
          ...(isMobile ? quickStepStyles.mobileLeftPanel : {})
        }}>
          <button style={styles.backBtn} onClick={onBack}>← Back</button>

          <div>
            <h1 style={{ ...styles.stepTitle, marginBottom: '8px' }}>⚡ What are you building?</h1>
            <p style={{ ...styles.stepSubtitle, marginBottom: '16px' }}>Describe your business in a few words</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDetect()}
              placeholder="e.g., BBQ restaurant in Dallas"
              style={{ ...styles.bigInput, flex: 1 }}
              autoFocus
            />
            <button
              onClick={handleDetect}
              disabled={detecting || !input.trim()}
              style={{
                ...styles.primaryBtn,
                padding: '14px 20px',
                whiteSpace: 'nowrap',
                opacity: detecting || !input.trim() ? 0.5 : 1
              }}
            >
              {detecting ? '🔍...' : 'Go →'}
            </button>
          </div>

          {/* Example chips */}
          <div style={{ marginTop: '8px' }}>
            <p style={{ ...styles.examplesLabel, marginBottom: '8px', fontSize: '11px' }}>Try these:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {examples.map(ex => (
                <button key={ex} style={{ ...styles.exampleChip, fontSize: '11px', padding: '5px 10px' }} onClick={() => setInput(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Detection result */}
          {detected && (
            <>
              <div style={{ ...styles.detectedCard, marginTop: '16px', padding: '14px' }}>
                <div style={styles.detectedIcon}>{detected.industry?.icon || '✨'}</div>
                <div style={styles.detectedContent}>
                  <h3 style={{ ...styles.detectedTitle, fontSize: '15px', marginBottom: '2px' }}>{detected.industry?.name || 'Business'} Detected!</h3>
                  {nameAvailability && (
                    <p style={{
                      fontSize: '11px',
                      color: nameAvailability.available ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      margin: 0
                    }}>
                      {nameAvailability.available ? '✓' : '✗'}
                      {nameAvailability.available
                        ? `"${nameAvailability.sanitizedName}" available`
                        : `Name taken`
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Layout Selector - Pick different layouts */}
              <LayoutSelector
                industryKey={detected.key}
                selectedLayout={selectedLayout}
                onLayoutSelect={(layoutKey) => {
                  setSelectedLayout(layoutKey);
                  updateProject({ layoutKey });
                }}
                showSectionPreview={false}
                compact={true}
              />

              {/* Page Package Selector */}
              <PagePackageSelector
                industryKey={detected.key}
                selectedPages={selectedPages}
                onPagesChange={(pages) => {
                  setSelectedPages(pages);
                  updateProject({ selectedPages: pages });
                }}
                compact={true}
              />

              {/* Mood Sliders - Compact version */}
              <MoodSliders
                values={moodSliders}
                onChange={handleMoodChange}
                compact={true}
              />

              {/* Continue button */}
              <button
                style={{
                  ...styles.continueBtn,
                  width: '100%',
                  padding: '16px',
                  marginTop: '12px',
                  opacity: nameAvailability && !nameAvailability.available ? 0.5 : 1,
                  cursor: nameAvailability && !nameAvailability.available ? 'not-allowed' : 'pointer'
                }}
                onClick={onContinue}
                disabled={nameAvailability && !nameAvailability.available}
              >
                {nameAvailability && !nameAvailability.available ? 'Name Taken' : 'Continue with this Style →'}
              </button>
            </>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div style={{
          ...quickStepStyles.rightPanel,
          ...(isMobile ? quickStepStyles.mobileRightPanel : {})
        }}>
          {/* Preview Header */}
          <div style={quickStepStyles.previewHeader}>
            <div style={quickStepStyles.previewTitle}>
              <span>🏗️</span>
              <span>Structure Preview</span>
              {previewLoading && (
                <span style={{ fontSize: '12px', color: '#888', fontWeight: '400' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '4px' }}>⟳</span>
                  updating...
                </span>
              )}
            </div>

            {/* Theme Tabs */}
            <div style={quickStepStyles.themeTabs}>
              {themeOptions.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setPreviewTheme(theme.id)}
                  style={{
                    ...quickStepStyles.themeTab,
                    ...(previewTheme === theme.id ? quickStepStyles.themeTabActive : {})
                  }}
                >
                  <span>{theme.icon}</span>
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Structure Banner */}
          <div style={quickStepStyles.structureBanner}>
            <span style={{ fontSize: '18px' }}>👁️</span>
            <span style={{ fontSize: '12px', color: '#a5b4fc', lineHeight: '1.4' }}>
              <strong>Live Preview</strong> with sample images. Pick a layout, adjust sliders, switch themes - see changes instantly!
              Your final site will have AI-generated content tailored to your business.
            </span>
          </div>

          {/* Preview Content */}
          <div style={quickStepStyles.previewContent}>
            {detected && previewHtml ? (
              <>
                <iframe
                  srcDoc={previewHtml}
                  title="Structure Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{
                    ...quickStepStyles.previewIframe,
                    opacity: previewLoading ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                  }}
                />
                {previewLoading && (
                  <div style={quickStepStyles.loadingOverlay}>
                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                    <span>Updating preview...</span>
                  </div>
                )}
              </>
            ) : (
              <div style={quickStepStyles.emptyPreview}>
                <span style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</span>
                <span style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                  {previewLoading ? 'Generating preview...' : 'Enter your business above'}
                </span>
                <span style={{ fontSize: '13px', color: '#999' }}>
                  {!detected ? 'Preview will appear here' : 'Adjust sliders to see changes'}
                </span>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div style={quickStepStyles.statusBar}>
            <span>
              {detected
                ? `${detected.industry?.name || 'Business'} • ${selectedPages.length} pages • ${previewTheme.charAt(0).toUpperCase() + previewTheme.slice(1)}`
                : 'Enter your business to see preview'}
            </span>
            <span style={quickStepStyles.costBadge}>$0 API Cost</span>
          </div>
        </div>
      </div>
    </>
  );
}
