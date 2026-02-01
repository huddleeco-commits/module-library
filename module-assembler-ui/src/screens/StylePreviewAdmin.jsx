/**
 * Style Preview Admin Panel
 *
 * Test different industry + slider combinations WITHOUT API costs.
 * Uses fallback page generation (testMode) to show visual previews.
 *
 * Purpose:
 * - Iterate on industry styles visually
 * - Test slider combinations
 * - QA new industries before going live
 * - Show users style possibilities (zero cost)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../constants';
import { MoodSliders, PRESETS } from '../components/MoodSliders';
import { LayoutSelector } from '../components/LayoutSelector';
import { PagePackageSelector } from '../components/PagePackageSelector';
import { FeatureSelector } from '../components/FeatureSelector';
import { getIndustryPages } from '../constants/industry-config';
import { INDUSTRY_FEATURES, getIndustryFeatures, getAdminPages, getCompanionScreens } from '../constants/industry-features';

const styles = {
  container: {
    // Break out of centered wrapper to use full viewport width
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#0a0a0f',
    color: '#fff',
    padding: '16px',
    boxSizing: 'border-box',
    overflow: 'auto',
    zIndex: 100
  },
  header: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    color: '#888',
    fontSize: '13px',
    margin: 0
  },
  badge: {
    padding: '4px 10px',
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#22c55e'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '340px 1fr',
    gap: '16px',
    height: 'calc(100vh - 90px)'
  },
  mainGridMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: 'auto'
  },
  controlPanel: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '20px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 90px)'
  },
  controlPanelMobile: {
    maxHeight: 'none',
    overflowY: 'visible'
  },
  section: {
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none'
  },
  pagesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  pageChip: {
    padding: '5px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  pageChipActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    color: '#a5b4fc'
  },
  presetRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px'
  },
  presetBtn: {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  presetBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    color: '#a5b4fc'
  },
  generateBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px'
  },
  generateBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  previewPanel: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '500px'
  },
  previewPanelMobile: {
    minHeight: '70vh'
  },
  previewHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px'
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e4'
  },
  previewTabs: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  previewTab: {
    padding: '5px 10px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer'
  },
  previewTabActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    color: '#a5b4fc'
  },
  previewContent: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#fff',
    position: 'absolute',
    top: 0,
    left: 0
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  statusBar: {
    padding: '10px 16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#888',
    flexWrap: 'wrap',
    gap: '8px'
  },
  statusSuccess: {
    color: '#22c55e'
  },
  statusError: {
    color: '#ef4444'
  },
  costBadge: {
    padding: '3px 8px',
    background: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '10px',
    color: '#22c55e',
    fontWeight: '600',
    fontSize: '11px'
  },
  modeToggle: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '4px',
    gap: '4px'
  },
  modeBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  modeBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc'
  },
  phoneFrame: {
    width: '375px',
    height: '100%',
    maxHeight: '812px',
    margin: '0 auto',
    background: '#1a1a2e',
    borderRadius: '40px',
    padding: '12px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  phoneNotch: {
    width: '150px',
    height: '30px',
    background: '#0a0a0f',
    borderRadius: '0 0 20px 20px',
    margin: '0 auto 8px',
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10
  },
  phoneScreen: {
    flex: 1,
    borderRadius: '28px',
    overflow: 'hidden',
    background: '#fff'
  },
  companionScreens: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },
  sandboxToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    marginBottom: '16px',
    cursor: 'pointer'
  },
  sandboxToggleActive: {
    background: 'rgba(245, 158, 11, 0.2)',
    border: '1px solid rgba(245, 158, 11, 0.5)'
  },
  sandboxLabel: {
    flex: 1
  },
  sandboxTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f59e0b'
  },
  sandboxDesc: {
    fontSize: '11px',
    color: '#888',
    marginTop: '2px'
  },
  sandboxCheckbox: {
    width: '20px',
    height: '20px',
    accentColor: '#f59e0b'
  },
  splitPreview: {
    display: 'grid',
    gridTemplateColumns: '1fr 375px',
    gap: '16px',
    height: '100%'
  },
  splitPreviewMobile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  structureBanner: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px'
  },
  structureBannerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a5b4fc',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  structureBannerText: {
    fontSize: '11px',
    color: '#888',
    lineHeight: '1.5'
  },
  liveToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  liveToggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#e4e4e4'
  },
  liveToggleDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s infinite'
  },
  liveToggleSwitch: {
    width: '44px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '2px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  liveToggleSwitchActive: {
    background: 'rgba(34, 197, 94, 0.4)'
  },
  liveToggleKnob: {
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.2s'
  },
  liveToggleKnobActive: {
    transform: 'translateX(20px)'
  },
  updatingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.7)',
    padding: '16px 24px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#fff',
    fontSize: '14px',
    zIndex: 100
  }
};

export function StylePreviewAdmin({ onBack }) {
  const [industries, setIndustries] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [layoutInfo, setLayoutInfo] = useState(null);
  const [businessName, setBusinessName] = useState('Demo Business');
  const [selectedPages, setSelectedPages] = useState(['home', 'about', 'services', 'contact']);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [moodSliders, setMoodSliders] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [activePageTab, setActivePageTab] = useState('home');
  const [generatedPages, setGeneratedPages] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: 'Select an industry and click Preview' });
  const [lastGenerationTime, setLastGenerationTime] = useState(null);

  // Preview mode: 'website' or 'companion'
  const [previewMode, setPreviewMode] = useState('website');
  const [companionPreviewHtml, setCompanionPreviewHtml] = useState(null);
  const [companionScreen, setCompanionScreen] = useState('home');
  const [companionScreens, setCompanionScreens] = useState({});

  // Sandbox mode: enables real data, images, and interactive mock API
  const [sandboxMode, setSandboxMode] = useState(false);

  // Live preview: auto-update on changes
  const [livePreview, setLivePreview] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Responsive detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load industries on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/industries`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIndustries(data.industries);
          // Auto-select first industry
          const firstKey = Object.keys(data.industries)[0];
          if (firstKey) {
            setSelectedIndustry(firstKey);
            // Set industry-appropriate pages
            const ind = data.industries[firstKey];
            setSelectedPages(ind.defaultPages || ['home', 'about', 'services', 'contact']);
          }
        }
      })
      .catch(err => console.error('Failed to load industries:', err));
  }, []);

  // Update pages, features, and reset layout when industry changes
  useEffect(() => {
    if (selectedIndustry && industries[selectedIndustry]) {
      const ind = industries[selectedIndustry];
      // Use industry-aware page packages
      const recommendedPages = getIndustryPages(selectedIndustry, 'recommended');
      setSelectedPages(recommendedPages);
      // Use industry-aware feature packages
      const recommendedFeatures = getIndustryFeatures(selectedIndustry, 'recommended');
      setSelectedFeatures(recommendedFeatures);
      setBusinessName(`${ind.name || selectedIndustry} Demo`);
      setSelectedLayout(null); // Reset layout when industry changes
      setLayoutInfo(null);
    }
  }, [selectedIndustry, industries]);

  // Debounce ref for live preview
  const debounceRef = useRef(null);
  const isInitialMount = useRef(true);

  // Live preview auto-update with debouncing
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-update if live preview is enabled and we have required data
    if (!livePreview || !selectedIndustry || generating) return;

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set updating indicator
    setIsUpdating(true);

    // Debounce the preview generation (500ms delay)
    debounceRef.current = setTimeout(async () => {
      const startTime = Date.now();

      if (previewMode === 'website') {
        if (selectedPages.length === 0) {
          setIsUpdating(false);
          return;
        }

        try {
          const response = await fetch(`${API_BASE}/api/preview-style`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industry: selectedIndustry,
              businessName: businessName,
              pages: selectedPages,
              moodSliders: moodSliders,
              preset: activePreset,
              layoutKey: selectedLayout,
              sandboxMode: sandboxMode,
              features: selectedFeatures
            })
          });

          const data = await response.json();
          const duration = Date.now() - startTime;
          setLastGenerationTime(duration);

          if (data.success) {
            setGeneratedPages(data.pages || {});
            setLayoutInfo(data.layout || null);

            // Update current page preview
            const currentPage = selectedPages.includes(activePageTab) ? activePageTab : selectedPages[0];
            if (data.pages && data.pages[currentPage]) {
              setPreviewHtml(data.pages[currentPage]);
              setActivePageTab(currentPage);
            }

            const layoutMsg = data.layout ? ` (${data.layout.layoutName})` : '';
            setStatus({
              type: 'success',
              message: `Live update: ${Object.keys(data.pages || {}).length} pages${layoutMsg}`
            });
          }
        } catch (err) {
          console.error('Live preview error:', err);
        }
      } else {
        // Companion App live update
        try {
          const response = await fetch(`${API_BASE}/api/preview-companion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industry: selectedIndustry,
              businessName: businessName,
              moodSliders: moodSliders,
              preset: activePreset,
              sandboxMode: sandboxMode
            })
          });

          const data = await response.json();
          if (data.success) {
            setCompanionScreens(data.screens || {});
            const currentScreen = data.screens?.[companionScreen] ? companionScreen : 'home';
            setCompanionPreviewHtml(data.screens?.[currentScreen] || null);
            setStatus({ type: 'success', message: 'Live update: companion app' });
          }
        } catch (err) {
          console.error('Live companion preview error:', err);
        }
      }

      setIsUpdating(false);
    }, 500);

    // Cleanup
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [moodSliders, selectedLayout, sandboxMode, previewMode, livePreview]);

  const applyPreset = (preset) => {
    setMoodSliders(preset.values);
    setActivePreset(preset.id);
  };

  const handleGenerate = async () => {
    if (!selectedIndustry) return;

    setGenerating(true);
    const startTime = Date.now();

    if (previewMode === 'website') {
      if (selectedPages.length === 0) return;
      setStatus({ type: 'generating', message: 'Generating website preview...' });

      try {
        const response = await fetch(`${API_BASE}/api/preview-style`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: selectedIndustry,
            businessName: businessName,
            pages: selectedPages,
            moodSliders: moodSliders,
            preset: activePreset,
            layoutKey: selectedLayout,
            sandboxMode: sandboxMode,
            features: selectedFeatures
          })
        });

        const data = await response.json();
        const duration = Date.now() - startTime;
        setLastGenerationTime(duration);

        if (data.success) {
          setGeneratedPages(data.pages || {});
          setActivePageTab(selectedPages[0] || 'home');
          setLayoutInfo(data.layout || null);

          const layoutMsg = data.layout ? ` (${data.layout.layoutName})` : '';
          setStatus({
            type: 'success',
            message: `Generated ${Object.keys(data.pages || {}).length} pages${layoutMsg} in ${(duration/1000).toFixed(1)}s`
          });

          if (data.pages && data.pages[selectedPages[0]]) {
            setPreviewHtml(data.pages[selectedPages[0]]);
          }
        } else {
          setStatus({ type: 'error', message: data.error || 'Preview generation failed' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: err.message });
      }
    } else {
      // Companion App Preview
      setStatus({ type: 'generating', message: 'Generating companion app preview...' });

      try {
        const response = await fetch(`${API_BASE}/api/preview-companion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry: selectedIndustry,
            businessName: businessName,
            moodSliders: moodSliders,
            preset: activePreset,
            sandboxMode: sandboxMode
          })
        });

        const data = await response.json();
        const duration = Date.now() - startTime;
        setLastGenerationTime(duration);

        if (data.success) {
          setCompanionScreens(data.screens || {});
          setCompanionScreen('home');
          setCompanionPreviewHtml(data.screens?.home || null);
          setStatus({
            type: 'success',
            message: `Generated companion app preview in ${(duration/1000).toFixed(1)}s`
          });
        } else {
          setStatus({ type: 'error', message: data.error || 'Companion preview failed' });
        }
      } catch (err) {
        setStatus({ type: 'error', message: err.message });
      }
    }

    setGenerating(false);
  };

  const handleMoodChange = (values) => {
    setMoodSliders(values);
    setActivePreset(null);
  };

  return (
    <div style={styles.container}>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back
            </button>
          )}
          <div>
            <h1 style={styles.title}>
              🎨 Style Preview Admin
              <span style={styles.badge}>$0 API Cost</span>
            </h1>
            {!isMobile && (
              <p style={styles.subtitle}>
                Test industry + slider combinations instantly. Uses fallback generation - no AI API calls.
              </p>
            )}
          </div>
        </div>
        {/* Preview Mode Toggle */}
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeBtn,
              ...(previewMode === 'website' ? styles.modeBtnActive : {})
            }}
            onClick={() => setPreviewMode('website')}
          >
            🌐 Website
          </button>
          <button
            style={{
              ...styles.modeBtn,
              ...(previewMode === 'companion' ? styles.modeBtnActive : {})
            }}
            onClick={() => setPreviewMode('companion')}
          >
            📱 Companion
          </button>
          <button
            style={{
              ...styles.modeBtn,
              ...(previewMode === 'admin' ? styles.modeBtnActive : {})
            }}
            onClick={() => setPreviewMode('admin')}
          >
            ⚙️ Admin
          </button>
        </div>
      </div>

      <div style={isMobile ? styles.mainGridMobile : styles.mainGrid}>
        {/* Control Panel */}
        <div style={{
          ...styles.controlPanel,
          ...(isMobile ? styles.controlPanelMobile : {})
        }}>
          {/* Structure Preview Banner */}
          <div style={styles.structureBanner}>
            <div style={styles.structureBannerTitle}>
              <span>🏗️</span>
              <span>Structure Preview Mode</span>
            </div>
            <div style={styles.structureBannerText}>
              This shows the <strong>layout skeleton</strong> - colors, typography, spacing, and component structure.
              When AI-generated, your site will have custom content, unique imagery, and refined details tailored to your business.
            </div>
          </div>

          {/* Live Preview Toggle */}
          <div style={styles.liveToggle}>
            <div style={styles.liveToggleLabel}>
              {livePreview && <div style={styles.liveToggleDot}></div>}
              <span>{livePreview ? 'Live Preview On' : 'Live Preview Off'}</span>
              {isUpdating && <span style={{ fontSize: '11px', color: '#888' }}>updating...</span>}
            </div>
            <div
              style={{
                ...styles.liveToggleSwitch,
                ...(livePreview ? styles.liveToggleSwitchActive : {})
              }}
              onClick={() => setLivePreview(!livePreview)}
            >
              <div style={{
                ...styles.liveToggleKnob,
                ...(livePreview ? styles.liveToggleKnobActive : {})
              }}></div>
            </div>
          </div>

          {/* Sandbox Mode Toggle */}
          <div
            style={{
              ...styles.sandboxToggle,
              ...(sandboxMode ? styles.sandboxToggleActive : {})
            }}
            onClick={() => setSandboxMode(!sandboxMode)}
          >
            <input
              type="checkbox"
              checked={sandboxMode}
              onChange={(e) => setSandboxMode(e.target.checked)}
              style={styles.sandboxCheckbox}
            />
            <div style={styles.sandboxLabel}>
              <div style={styles.sandboxTitle}>🧪 Sandbox Mode</div>
              <div style={styles.sandboxDesc}>
                {sandboxMode
                  ? 'Active: Real images, menu items, working cart & orders'
                  : 'Enable for interactive demo with real data'}
              </div>
            </div>
          </div>

          {/* Industry Selection */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Industry</div>
            <select
              style={styles.select}
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">Select industry...</option>
              {Object.entries(industries).map(([key, ind]) => (
                <option key={key} value={key}>
                  {ind.icon} {ind.name || key}
                </option>
              ))}
            </select>
          </div>

          {/* Layout Selection (Phase 3) */}
          {selectedIndustry && (
            <LayoutSelector
              industryKey={selectedIndustry}
              selectedLayout={selectedLayout}
              onLayoutSelect={setSelectedLayout}
              showSectionPreview={true}
              compact={false}
            />
          )}

          {/* Business Name */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Business Name</div>
            <input
              style={styles.input}
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name..."
            />
          </div>

          {/* Page Package Selector */}
          <div style={styles.section}>
            <PagePackageSelector
              industryKey={selectedIndustry}
              selectedPages={selectedPages}
              onPagesChange={setSelectedPages}
              compact={false}
            />
          </div>

          {/* Feature Selector */}
          <div style={styles.section}>
            <FeatureSelector
              industryKey={selectedIndustry}
              selectedFeatures={selectedFeatures}
              onFeaturesChange={setSelectedFeatures}
              compact={false}
            />
          </div>

          {/* Quick Presets */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Quick Presets</div>
            <div style={styles.presetRow}>
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  style={{
                    ...styles.presetBtn,
                    ...(activePreset === preset.id ? styles.presetBtnActive : {})
                  }}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.icon} {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Sliders */}
          <div style={styles.section}>
            <MoodSliders
              values={moodSliders}
              onChange={handleMoodChange}
              compact={false}
            />
          </div>

          {/* Generate Button */}
          <button
            style={{
              ...styles.generateBtn,
              ...(generating || !selectedIndustry ? styles.generateBtnDisabled : {})
            }}
            onClick={handleGenerate}
            disabled={generating || !selectedIndustry}
          >
            {generating ? (
              <>⏳ Generating...</>
            ) : (
              <>🎨 Generate Preview</>
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div style={{
          ...styles.previewPanel,
          ...(isMobile ? styles.previewPanelMobile : {})
        }}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>
              {selectedIndustry
                ? `${industries[selectedIndustry]?.name || selectedIndustry} ${previewMode === 'companion' ? 'App' : previewMode === 'admin' ? 'Admin' : 'Website'}`
                : 'Preview'}
            </span>
            {previewMode === 'admin' && selectedFeatures.length > 0 && (
              <div style={styles.previewTabs}>
                {getAdminPages(selectedFeatures).slice(0, 6).map(page => (
                  <button
                    key={page}
                    style={{
                      ...styles.previewTab,
                      ...(activePageTab === page ? styles.previewTabActive : {})
                    }}
                    onClick={() => setActivePageTab(page)}
                  >
                    {page.replace(/-/g, ' ')}
                  </button>
                ))}
                {getAdminPages(selectedFeatures).length > 6 && (
                  <span style={{ fontSize: '11px', color: '#888', padding: '4px 8px' }}>
                    +{getAdminPages(selectedFeatures).length - 6} more
                  </span>
                )}
              </div>
            )}
            {previewMode === 'website' && Object.keys(generatedPages).length > 0 && (
              <div style={styles.previewTabs}>
                {selectedPages.map(page => (
                  <button
                    key={page}
                    style={{
                      ...styles.previewTab,
                      ...(activePageTab === page ? styles.previewTabActive : {})
                    }}
                    onClick={() => {
                      setActivePageTab(page);
                      setPreviewHtml(generatedPages[page] || null);
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
            {previewMode === 'companion' && Object.keys(companionScreens).length > 0 && (
              <div style={styles.companionScreens}>
                {Object.keys(companionScreens).map(screen => (
                  <button
                    key={screen}
                    style={{
                      ...styles.previewTab,
                      ...(companionScreen === screen ? styles.previewTabActive : {})
                    }}
                    onClick={() => {
                      setCompanionScreen(screen);
                      setCompanionPreviewHtml(companionScreens[screen] || null);
                    }}
                  >
                    {screen}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={styles.previewContent}>
            {/* Updating Indicator Overlay */}
            {isUpdating && (previewHtml || companionPreviewHtml) && (
              <div style={styles.updatingIndicator}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
                <span>Updating preview...</span>
              </div>
            )}

            {previewMode === 'website' && (
              previewHtml ? (
                <iframe
                  style={{...styles.iframe, opacity: isUpdating ? 0.5 : 1, transition: 'opacity 0.2s'}}
                  srcDoc={previewHtml}
                  title="Style Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎨</div>
                  <p>Select an industry and click "Generate Preview"</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    No API costs - uses fallback page generation
                  </p>
                </div>
              )
            )}

            {previewMode === 'companion' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '20px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%)'
              }}>
                {companionPreviewHtml ? (
                  <div style={{...styles.phoneFrame, opacity: isUpdating ? 0.7 : 1, transition: 'opacity 0.2s'}}>
                    <div style={styles.phoneNotch}></div>
                    <div style={styles.phoneScreen}>
                      <iframe
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        srcDoc={companionPreviewHtml}
                        title="Companion App Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📱</div>
                    <p>Select an industry and click "Generate Preview"</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Preview companion app with theme toggle
                    </p>
                  </div>
                )}
              </div>
            )}

            {previewMode === 'admin' && (
              <div style={{
                height: '100%',
                background: '#1e1e2e',
                overflow: 'auto',
                padding: '20px'
              }}>
                {/* Admin Dashboard Preview */}
                <div style={{
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {/* Admin Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>⚙️</span>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                          {businessName} Admin
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {industries[selectedIndustry]?.name || 'Business'} Dashboard
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '6px', color: '#22c55e', fontSize: '12px' }}>
                        {selectedFeatures.length} Features Active
                      </span>
                    </div>
                  </div>

                  {/* Admin Modules Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {getAdminPages(selectedFeatures).map(page => {
                      const pageConfig = {
                        dashboard: { icon: '📊', color: '#6366f1' },
                        orders: { icon: '📦', color: '#22c55e' },
                        appointments: { icon: '📅', color: '#f59e0b' },
                        reservations: { icon: '🍽️', color: '#ec4899' },
                        users: { icon: '👤', color: '#8b5cf6' },
                        clients: { icon: '👥', color: '#06b6d4' },
                        products: { icon: '🏷️', color: '#84cc16' },
                        posts: { icon: '📝', color: '#f97316' },
                        gallery: { icon: '🖼️', color: '#14b8a6' },
                        'loyalty-settings': { icon: '⭐', color: '#eab308' },
                        'rewards-catalog': { icon: '🎁', color: '#a855f7' },
                        settings: { icon: '⚙️', color: '#64748b' },
                        messages: { icon: '💬', color: '#3b82f6' },
                        analytics: { icon: '📈', color: '#10b981' },
                        documents: { icon: '📄', color: '#6366f1' },
                        forms: { icon: '📋', color: '#f43f5e' },
                        cases: { icon: '📁', color: '#8b5cf6' },
                        listings: { icon: '🏠', color: '#22c55e' },
                        insurance: { icon: '🏥', color: '#06b6d4' },
                        billing: { icon: '💳', color: '#f59e0b' },
                        calendar: { icon: '📆', color: '#ec4899' },
                        team: { icon: '👥', color: '#8b5cf6' },
                        notifications: { icon: '🔔', color: '#f97316' },
                        classes: { icon: '🎓', color: '#14b8a6' }
                      }[page] || { icon: '📄', color: '#6366f1' };

                      return (
                        <div
                          key={page}
                          style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: `${pageConfig.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}>
                              {pageConfig.icon}
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', textTransform: 'capitalize' }}>
                              {page.replace(/-/g, ' ')}
                            </div>
                          </div>
                          <div style={{
                            height: '60px',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#555',
                            fontSize: '12px'
                          }}>
                            Preview placeholder
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Portal Preview */}
                  {selectedFeatures.includes('portal') && (
                    <div style={{
                      marginTop: '24px',
                      padding: '20px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#a5b4fc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🚪</span>
                        <span>Client Portal Sections</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(() => {
                          const config = INDUSTRY_FEATURES[selectedIndustry] || INDUSTRY_FEATURES.default;
                          return config.portalContent?.sections?.map(section => (
                            <span
                              key={section}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                color: '#c7d2fe',
                                fontSize: '12px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {section.replace(/-/g, ' ')}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.statusBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={status.type === 'success' ? styles.statusSuccess : status.type === 'error' ? styles.statusError : {}}>
                {status.message}
              </span>
              {previewMode === 'website' && layoutInfo && (
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#a5b4fc'
                }}>
                  🎯 {layoutInfo.categoryName} → {layoutInfo.layoutName}
                </span>
              )}
              {previewMode === 'companion' && (
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#c4b5fd'
                }}>
                  📱 PWA Preview • Theme toggle included
                </span>
              )}
              {previewMode === 'admin' && (
                <span style={{
                  padding: '2px 8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#fbbf24'
                }}>
                  ⚙️ {getAdminPages(selectedFeatures).length} Admin Pages • {selectedFeatures.includes('portal') ? 'Portal Enabled' : 'No Portal'}
                </span>
              )}
            </div>
            <span style={styles.costBadge}>API Cost: $0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StylePreviewAdmin;
