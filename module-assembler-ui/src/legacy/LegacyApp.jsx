/**
 * Legacy App - Original Module Assembler UI
 *
 * This is the bundled legacy code kept as fallback.
 * Access via ?legacy=true URL parameter.
 */

import React, { useState, useEffect } from 'react';
import { INDUSTRY_LAYOUTS, getLayoutConfig, buildLayoutPromptContext } from '../../config/industry-layouts.js';
import {
  API_BASE,
  BREAKPOINTS,
  TAGLINES,
  LAYOUT_OPTIONS,
  getLayoutsForIndustry,
  INDUSTRY_PAGES,
  PAGE_LABELS,
  COLOR_PRESETS,
  STYLE_OPTIONS,
  ADMIN_LEVELS
} from '../constants';
import { useWindowSize } from '../hooks';
import { getLayoutMode } from '../utils';
import {
  PasswordGate,
  DevPasswordModal,
  Tooltip,
  CollapsibleSection,
  WizardBreadcrumb,
  WhatYouGetCard,
  IndustryBanner,
  LayoutStyleSelector,
  LivePreviewRenderer,
  TestGenerator,
  wizardStyles,
  collapsibleStyles,
  tooltipStyles,
  whatYouGetStyles,
  industryBannerStyles,
  livePreviewStyles
} from '../components';
import { styles, errorStepStyles, initGlobalStyles } from '../styles';
import {
  ChoosePathStep,
  QuickStep,
  OrchestratorStep,
  RebuildStep,
  UploadAssetsStep,
  ReferenceStep,
  CustomizeStep,
  customizeStyles,
  p1Styles,
  layoutStyles,
  ErrorStep,
  DeployErrorStep,
  GeneratingStep,
  DeployingStep,
  DeployCompleteStep,
  CompanionDeployCompleteStep,
  PreviewStep,
  CompleteStep,
  ToolCompleteScreen,
  ChoiceScreen,
  SiteCustomizationScreen,
  ToolCustomizationScreen,
  RecommendedToolsScreen,
  ToolSuiteBuilderScreen,
  SuiteCompleteScreen,
  ToolSuiteGuidedStep,
  ToolSuiteInstantStep,
  ToolSuiteCustomStep,
  AppGuidedStep,
  AppAIBuilderStep,
  AppAdvancedStep,
  CompanionAppStep,
  FullControlFlow,
  DemoBatchStep,
  LandingPage,
  MyDeploymentsPage,
  StylePreviewAdmin,
  StudioMode
} from '../screens';

// Admin Dashboard import
import AdminApp from '../admin/AdminApp';
import { ModeSelector } from '../components';

// ============================================
// LEGACY APP (Fallback)
// ============================================
export default function LegacyApp() {
  // Landing page state (show marketing page first)
  const [showLanding, setShowLanding] = useState(true);

  // Auth state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [pendingDevPath, setPendingDevPath] = useState(null);
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Dev tools state
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminStartPage, setAdminStartPage] = useState('overview'); // Which admin page to start on
  const [showTestGenerator, setShowTestGenerator] = useState(false); // L1-L4 quick test modes

  // Flow state
  const [step, setStep] = useState('choose-path'); // choose-path, rebuild, quick, reference, orchestrator, full-control, upload-assets, customize, generating, preview, complete, deploying, deploy-complete, deploy-error, error, companion

  // Deploy state
  const [deployStatus, setDeployStatus] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);

  // Companion app state
  const [companionParentSite, setCompanionParentSite] = useState(null);
  const [companionProject, setCompanionProject] = useState(null);
  const [companionDeployResult, setCompanionDeployResult] = useState(null);
  const [companionDeployProgress, setCompanionDeployProgress] = useState(null);
  const [shouldAutoGenerateCompanion, setShouldAutoGenerateCompanion] = useState(false);
  const [path, setPath] = useState(null); // 'rebuild', 'quick', 'reference', 'orchestrator'

  // Orchestrator state
  const [orchestratorResult, setOrchestratorResult] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null); // For pre-selected tool type
  const [isToolMode, setIsToolMode] = useState(false); // Tool vs business mode

  // Tool recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationIndustry, setRecommendationIndustry] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Tool suite state
  const [selectedToolsForSuite, setSelectedToolsForSuite] = useState([]);
  const [suiteResult, setSuiteResult] = useState(null);
  const [preselectedBundle, setPreselectedBundle] = useState(null); // For direct bundle selection
  const [preselectedApp, setPreselectedApp] = useState(null); // For direct app template selection

  // Choice screen state (for ambiguous inputs)
  const [choiceData, setChoiceData] = useState(null);
  const [pendingOrchestratorInput, setPendingOrchestratorInput] = useState(null);
  const [pendingIndustryKey, setPendingIndustryKey] = useState(null); // Explicit industry override

  // Shared context state (persists across site/tools flows)
  const [sharedContext, setSharedContext] = useState({
    businessName: '',
    brandColor: '#3b82f6',
    location: '',
    industry: null,
    industryDisplay: null,
    style: 'modern', // modern, minimal, warm, professional
    logo: null,
    tagline: ''
  });

  // Site customization state
  const [siteCustomization, setSiteCustomization] = useState(null);

  // Tool customization state (for single tool flow)
  const [toolCustomization, setToolCustomization] = useState(null);
  const [selectedToolForCustomization, setSelectedToolForCustomization] = useState(null);

  // Data collected from any path
  const [projectData, setProjectData] = useState({
    // From any path
    businessName: '',
    tagline: '',
    industry: null,
    industryKey: null,
    layoutKey: null, // Selected layout within industry
    layoutStyleId: null, // Visual layout style selection (e.g., 'menu-hero', 'trust-authority')
    layoutStylePreview: null, // Preview config for the selected layout style

    // NEW: Business basics
    location: '',

    // NEW: High-impact questions
    teamSize: null, // 'solo', 'small', 'medium', 'large'
    priceRange: null, // 'budget', 'mid', 'premium', 'luxury'
    yearsEstablished: null, // 'new', 'growing', 'established', 'veteran'

    // NEW: Inferred from business name
    inferredDetails: null, // { location, style, industry }

    // NEW: Target audience (multi-select)
    targetAudience: [],

    // NEW: Primary CTA goal
    primaryCTA: 'contact', // 'book', 'call', 'quote', 'buy', 'visit', 'contact'

    // NEW: Tone (0 = professional, 100 = friendly)
    tone: 50,

    // Colors
    colorMode: 'preset', // 'preset', 'custom', 'from-site'
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#f59e0b',
      text: '#1a1a2e',
      background: '#ffffff'
    },
    selectedPreset: null,

    // Style
    effects: [],

    // Pages
    selectedPages: ['home', 'about', 'contact'],

    // Video hero background (auto-enabled for supported industries)
    enableVideoHero: null, // null = auto (based on industry), true/false = user override

    // References (for reference path)
    referenceSites: [],

    // Existing site (for rebuild path)
    existingSite: null,

    // Uploaded assets (logo, photos, menu)
    uploadedAssets: {
      logo: null,
      photos: [],
      menu: null
    },

    // Image/style description
    imageDescription: '',

    // Extra details for AI customization
    extraDetails: '',

    // Admin tier configuration
    adminTier: null, // null = auto-detect, or 'lite', 'standard', 'pro', 'enterprise'
    adminModules: [], // Selected admin modules

    // Companion app toggle (Quick Start flow)
    includeCompanionApp: false
  });

  // NEW: Generation state with real steps
  const [generationSteps, setGenerationSteps] = useState([]);
  const [currentGenerationStep, setCurrentGenerationStep] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState(null);
  const [abortController, setAbortController] = useState(null);

  // Server data
  const [industries, setIndustries] = useState({});
  const [layouts, setLayouts] = useState({});
  const [effects, setEffects] = useState({});

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [finalBlinkCount, setFinalBlinkCount] = useState(0);

  // Check if already unlocked
  useEffect(() => {
    const access = localStorage.getItem('blink_access');
    if (access === 'granted') setIsUnlocked(true);
    const devAccess = localStorage.getItem('blink_dev_access');
    if (devAccess === 'granted') {
      setIsDevUnlocked(true);
      // Ensure dev token exists for admin API access (handles migration from old sessions)
      const adminToken = localStorage.getItem('blink_admin_token');
      if (!adminToken) {
        // Fetch a new dev token - the password was already validated to get dev access
        fetch('/api/auth/validate-dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'abc123' })
        })
          .then(res => res.json())
          .then(data => {
            if (data.devToken) {
              localStorage.setItem('blink_admin_token', data.devToken);
            }
          })
          .catch(err => console.warn('Could not refresh dev token:', err));
      }
    }
  }, []);

  // Rotate taglines in header
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Keyboard shortcut: Ctrl+Shift+T to toggle Test Generator
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        if (isDevUnlocked) {
          setShowTestGenerator(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevUnlocked]);

  // Load configs on mount
  useEffect(() => {
    if (!isUnlocked) return;
    const loadConfigs = async () => {
      try {
        const [indRes, layRes, effRes] = await Promise.all([
          fetch(`${API_BASE}/api/industries`),
          fetch(`${API_BASE}/api/layouts`),
          fetch(`${API_BASE}/api/effects`)
        ]);
        const [indData, layData, effData] = await Promise.all([
          indRes.json(), layRes.json(), effRes.json()
        ]);
        if (indData.success) setIndustries(indData.industries);
        if (layData.success) setLayouts(layData.layouts);
        if (effData.success) setEffects(effData.effects);
      } catch (err) {
        console.error('Failed to load configs:', err);
      }
    };
    loadConfigs();
  }, [isUnlocked]);

  // Auto-generate companion app after deployment if user opted in
  useEffect(() => {
    const wantsCompanion = shouldAutoGenerateCompanion || projectData.includeCompanionApp;

    if (step === 'deploy-complete' && wantsCompanion && deployResult?.success) {
      setShouldAutoGenerateCompanion(false);
      if (projectData.includeCompanionApp) {
        updateProject({ includeCompanionApp: false });
      }

      const subdomain = deployResult?.urls?.frontend?.replace('https://', '').split('.')[0];

      setCompanionParentSite({
        name: projectData?.businessName || subdomain,
        subdomain: subdomain,
        url: deployResult?.urls?.frontend
      });

      setTimeout(() => {
        setStep('companion');
      }, 1500);
    }
  }, [step, shouldAutoGenerateCompanion, projectData.includeCompanionApp, deployResult, projectData?.businessName]);

  // Update project data helper
  const updateProject = (updates) => {
    setProjectData(prev => {
      const newData = { ...prev, ...updates };
      if (updates.colors) {
        newData.colors = {
          primary: '#3b82f6',
          secondary: '#1e40af',
          accent: '#f59e0b',
          text: '#1a1a2e',
          background: '#ffffff',
          ...prev.colors,
          ...updates.colors
        };
      }
      return newData;
    });
  };

  // Handle path selection
  const selectPath = (selectedPath, toolId = null) => {
    if ((selectedPath === 'rebuild' || selectedPath === 'reference') && !isDevUnlocked) {
      setPendingDevPath(selectedPath);
      setShowDevModal(true);
      return;
    }
    setPath(selectedPath);

    if (selectedPath === 'tool' && toolId) {
      setSelectedTool(toolId);
      setIsToolMode(true);
      setStep('orchestrator');
    } else if (selectedPath === 'tool-custom') {
      setSelectedTool(null);
      setIsToolMode(true);
      setStep('orchestrator');
    } else if (selectedPath === 'orchestrator') {
      setSelectedTool(null);
      setIsToolMode(false);
      setStep('orchestrator');
    } else if (selectedPath === 'rebuild') {
      setIsToolMode(false);
      setStep('rebuild');
    } else if (selectedPath === 'quick') {
      setIsToolMode(false);
      setStep('quick');
    } else if (selectedPath === 'reference') {
      setIsToolMode(false);
      setStep('reference');
    } else if (selectedPath === 'full-control') {
      setIsToolMode(false);
      setStep('full-control');
    } else if (selectedPath === 'tool-suite-guided') {
      setPreselectedBundle(null);
      setStep('tool-suite-guided');
    } else if (selectedPath === 'tool-suite-instant') {
      setStep('tool-suite-instant');
    } else if (selectedPath === 'tool-suite-custom') {
      setStep('tool-suite-custom');
    } else if (selectedPath === 'tool-suite-bundle' && toolId) {
      setPreselectedBundle(toolId);
      setStep('tool-suite-guided');
    } else if (selectedPath === 'app-guided') {
      setPreselectedApp(null);
      setStep('app-guided');
    } else if (selectedPath === 'app-ai-builder') {
      setStep('app-ai-builder');
    } else if (selectedPath === 'app-template' && toolId) {
      setPreselectedApp(toolId);
      setStep('app-guided');
    } else if (selectedPath === 'app-advanced') {
      setStep('app-advanced');
    } else if (selectedPath === 'app-advanced-template' && toolId) {
      setPreselectedApp(toolId);
      setStep('app-advanced');
    } else if (selectedPath === 'demo-batch') {
      setStep('demo-batch');
    } else if (selectedPath === 'studio') {
      setStep('studio');
    }
  };

  const handleDevUnlock = () => {
    setIsDevUnlocked(true);
    setShowDevModal(false);
    if (pendingDevPath) {
      const p = pendingDevPath;
      setPendingDevPath(null);
      setPath(p);
      if (p === 'rebuild') setStep('rebuild');
      else if (p === 'reference') setStep('reference');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('blink_access');
    setIsUnlocked(false);
  };

  const goToUploadAssets = () => {
    setStep('upload-assets');
  };

  const goToCustomize = () => {
    setStep('customize');
  };

  // Generate the project with real step tracking
  const handleGenerate = async () => {
    if (!projectData.businessName.trim()) {
      setError({ title: 'Missing Business Name', message: 'Please enter a business name to continue.' });
      return;
    }

    const steps = [
      { id: 'analyzing', label: 'Analyzing your business', icon: '🔍' },
      { id: 'selecting', label: 'Selecting components', icon: '📦' },
      ...projectData.selectedPages.map(page => ({
        id: `page-${page}`,
        label: `Generating ${page.charAt(0).toUpperCase() + page.slice(1)} page`,
        icon: '📄'
      })),
      { id: 'wiring', label: 'Wiring up backend', icon: '⚙️' },
      { id: 'finalizing', label: 'Finalizing project', icon: '✨' }
    ];

    setGenerationSteps(steps);
    setCurrentGenerationStep(0);
    setGenerationStartTime(Date.now());
    setStep('generating');
    setGenerating(true);
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const stepInterval = setInterval(() => {
        setCurrentGenerationStep(prev => {
          const next = Math.min(prev + 1, steps.length - 1);
          setProgress((next / steps.length) * 90);
          return next;
        });
      }, 2000);

      const toneLabel = projectData.tone < 33 ? 'professional and formal' :
                        projectData.tone > 66 ? 'friendly and casual' : 'balanced';

      const videoSupportedIndustries = ['tattoo', 'barbershop', 'barber', 'restaurant', 'pizza', 'pizzeria', 'fitness', 'gym', 'spa', 'salon', 'wellness', 'steakhouse', 'fine-dining', 'chophouse'];
      const industryLower = (projectData.industryKey || '').toLowerCase();
      const industrySupportsVideo = videoSupportedIndustries.some(v => industryLower.includes(v));
      const effectiveEnableVideoHero = projectData.enableVideoHero !== null
        ? projectData.enableVideoHero
        : industrySupportsVideo;

      const payload = {
        name: projectData.businessName.replace(/[^a-zA-Z0-9]/g, '-'),
        industry: projectData.industryKey,
        references: projectData.referenceSites,
        theme: {
          colors: projectData.colors,
          preset: projectData.selectedPreset
        },
        adminTier: projectData.adminTier || 'standard',
        adminModules: projectData.adminModules || [],
        description: {
          text: projectData.tagline || `${projectData.businessName} - ${projectData.industry?.name || 'Professional Business'}`,
          pages: projectData.selectedPages,
          industryKey: projectData.industryKey,
          layoutKey: projectData.layoutKey,
          effects: projectData.effects,
          existingSite: projectData.existingSite,
          extraDetails: projectData.extraDetails,
          uploadedAssets: projectData.uploadedAssets,
          imageDescription: projectData.imageDescription,
          location: projectData.location,
          targetAudience: projectData.targetAudience,
          primaryCTA: projectData.primaryCTA,
          tone: toneLabel,
          teamSize: projectData.teamSize,
          priceRange: projectData.priceRange,
          yearsEstablished: projectData.yearsEstablished,
          inferredDetails: projectData.inferredDetails,
          layoutStyleId: projectData.layoutStyleId,
          layoutStylePreview: projectData.layoutStylePreview,
          enableVideoHero: effectiveEnableVideoHero
        }
      };

      const response = await fetch(`${API_BASE}/api/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setCurrentGenerationStep(steps.length);
        setProgress(100);
        setResult(data.project);
        setStep('complete');
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setStep('customize');
      } else {
        setError({
          title: 'Generation Failed',
          message: err.message,
          hint: 'This could be a network issue or server problem. Try again in a moment.'
        });
        setStep('error');
      }
    } finally {
      setGenerating(false);
      setAbortController(null);
    }
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const [deployAbortController, setDeployAbortController] = useState(null);
  const [deployStartTime, setDeployStartTime] = useState(null);

  const [railwayServices, setRailwayServices] = useState(null);

  const pollRailwayStatus = async (projectId, deployResultData) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/deploy/railway-status/${projectId}`);
        const data = await response.json();

        if (data.success) {
          setRailwayServices(data.services);

          if (data.allDeployed) {
            setDeployResult(deployResultData);
            setStep('deploy-complete');
            return;
          }

          if (data.hasFailure) {
            throw new Error('One or more services failed to deploy. Check Railway dashboard.');
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          console.warn('Railway status polling timed out');
          setDeployResult(deployResultData);
          setStep('deploy-complete');
        }
      } catch (err) {
        console.error('Railway status poll error:', err);
        setDeployResult(deployResultData);
        setStep('deploy-complete');
      }
    };

    poll();
  };

  const handleDeploy = async () => {
    if (!result?.path || !result?.name) {
      setDeployError({ title: 'No Project', message: 'No project to deploy. Please generate a project first.' });
      setStep('deploy-error');
      return;
    }

    setStep('deploying');
    setDeployStatus({ status: 'Starting deployment...', icon: '🚀', progress: 0 });
    setDeployError(null);
    setDeployStartTime(Date.now());
    setRailwayServices(null);

    const controller = new AbortController();
    setDeployAbortController(controller);

    try {
      const response = await fetch(`${API_BASE}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: result.path,
          projectName: result.name || projectData.businessName.replace(/[^a-zA-Z0-9]/g, '-'),
          adminEmail: 'admin@be1st.io',
          stream: true
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'complete') {
                if (data.result?.success && data.result?.railwayProjectId) {
                  setDeployStatus({ status: 'Waiting for services to come online...', icon: '⏳', progress: 95 });
                  setRailwayServices({
                    postgres: { status: 'INITIALIZING', isBuilding: true },
                    backend: { status: 'INITIALIZING', isBuilding: true },
                    frontend: { status: 'INITIALIZING', isBuilding: true },
                    admin: { status: 'INITIALIZING', isBuilding: true }
                  });
                  pollRailwayStatus(data.result.railwayProjectId, data.result);
                } else if (data.result?.success) {
                  setDeployResult(data.result);
                  setStep('deploy-complete');
                } else {
                  throw new Error(data.result?.error || 'Deployment failed');
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              } else {
                setDeployStatus(data);
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('parse')) {
                throw parseErr;
              }
              console.warn('Failed to parse SSE data:', parseErr);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setStep('complete');
      } else {
        setDeployError({
          title: 'Deployment Failed',
          message: err.message,
          hint: 'Your project was generated successfully. You can try deploying again or deploy manually.'
        });
        setStep('deploy-error');
      }
    } finally {
      setDeployAbortController(null);
    }
  };

  const handleCancelDeploy = () => {
    if (deployAbortController) {
      deployAbortController.abort();
    }
  };

  const handleReset = () => {
    setStep('choose-path');
    setPath(null);
    setProjectData({
      businessName: '',
      tagline: '',
      industry: null,
      industryKey: null,
      location: '',
      targetAudience: [],
      primaryCTA: 'contact',
      tone: 50,
      colorMode: 'preset',
      colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b', text: '#1a1a2e', background: '#ffffff' },
      selectedPreset: null,
      layoutKey: null,
      effects: [],
      selectedPages: ['home', 'about', 'contact'],
      enableVideoHero: null,
      referenceSites: [],
      existingSite: null,
      uploadedAssets: { logo: null, photos: [], menu: null },
      imageDescription: '',
      extraDetails: '',
      includeCompanionApp: false
    });
    setResult(null);
    setError(null);
    setProgress(0);
    setGenerationSteps([]);
    setCurrentGenerationStep(0);
    setGenerationStartTime(null);
    setDeployResult(null);
    setDeployError(null);
    setDeployStartTime(null);
    setSuiteResult(null);
    setSelectedToolsForSuite([]);
    setPreselectedBundle(null);
    setPreselectedApp(null);
    setCompanionParentSite(null);
    setCompanionProject(null);
    setCompanionDeployResult(null);
    setCompanionDeployProgress(null);
    setShouldAutoGenerateCompanion(false);
  };

  // ============================================
  // RENDER
  // ============================================

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  if (showAdminDashboard) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowAdminDashboard(false)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          ← Back to App
        </button>
        <AdminApp skipAuth={true} startPage={adminStartPage} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {showDevModal && (
        <DevPasswordModal
          onSuccess={handleDevUnlock}
          onCancel={() => { setShowDevModal(false); setPendingDevPath(null); }}
        />
      )}

      {/* Floating Dev Tools Button */}
      <button
        onClick={() => {
          if (isDevUnlocked) {
            setShowDevPanel(!showDevPanel);
          } else {
            setShowDevModal(true);
          }
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: isDevUnlocked
            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
            : 'rgba(255,255,255,0.1)',
          border: isDevUnlocked ? 'none' : '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDevUnlocked ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
          opacity: isDevUnlocked ? 1 : 0.5,
          transition: 'all 0.2s'
        }}
        title={isDevUnlocked ? "Developer Tools" : "Unlock Dev Tools"}
      >
        🛠️
      </button>

      {/* Dev Tools Panel */}
      {showDevPanel && isDevUnlocked && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 9998,
          background: '#1a1a1f',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>🔧 Dev Toolbox (Legacy)</div>
            <button
              onClick={() => setShowDevPanel(false)}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}
            >×</button>
          </div>

          <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Generation Modes
          </div>

          <button
            onClick={() => { selectPath('quick'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <span>⚡</span>
            <div>
              <div style={{ fontWeight: '600' }}>Quick Start</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Original tested flow</div>
            </div>
          </button>

          <button
            onClick={() => { selectPath('studio'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              textAlign: 'left',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            <span>🎨</span>
            <div>
              <div style={{ fontWeight: '600' }}>Studio Mode</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Full visual control</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>NEW</span>
          </button>

          <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Experimental Modes
          </div>

          <button
            onClick={() => { selectPath('rebuild'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              textAlign: 'left'
            }}
          >
            <span>🔄</span>
            <div>
              <div style={{ fontWeight: '600' }}>Rebuild Mode</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Analyze & update existing site</div>
            </div>
          </button>

          <button
            onClick={() => { selectPath('reference'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              textAlign: 'left'
            }}
          >
            <span>🎨</span>
            <div>
              <div style={{ fontWeight: '600' }}>Inspired Mode</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Build from inspiration URLs</div>
            </div>
          </button>

          <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin & Testing
          </div>

          <button
            onClick={() => { setAdminStartPage('overview'); setShowAdminDashboard(true); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}
          >
            <span>📊</span> Admin Dashboard
          </button>

          <button
            onClick={() => { setAdminStartPage('platform-health'); setShowAdminDashboard(true); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}
          >
            <span>🧪</span> Test Center
          </button>

          <button
            onClick={() => { setShowTestGenerator(true); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}
          >
            <span>⚡</span> Quick Test (L1-L4)
            <span style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.7 }}>Ctrl+Shift+T</span>
          </button>

          <button
            onClick={() => { setStep('style-preview'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}
          >
            <span>🎨</span> Style Preview
            <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>$0</span>
          </button>

          <button
            onClick={() => { window.open('/api/health-check/full', '_blank'); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ccc',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px'
            }}
          >
            <span>💚</span> Health Check API (JSON)
          </button>

          <button
            onClick={() => { setStep('demo-batch'); setShowDevPanel(false); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <span>🚀</span> Investor Demo
            <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>4 sites</span>
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
              Legacy Mode Active
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <img src="/blink-logo.webp" alt="Blink" style={styles.logoImage} onError={(e) => { e.target.style.display = 'none'; }} />
          <span style={styles.logoText}>BLINK</span>
        </div>
        <div style={styles.headerRight}>
          <p style={styles.headerTagline} key={taglineIndex}>{TAGLINES[taglineIndex]}</p>
          <button
            onClick={() => setStep('my-deployments')}
            style={{
              ...styles.logoutBtn,
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#6366f1',
              marginRight: '8px'
            }}
          >
            My Sites
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {step === 'choose-path' && (
          <ChoosePathStep onSelect={selectPath} isDevUnlocked={isDevUnlocked} />
        )}

        {step === 'my-deployments' && (
          <MyDeploymentsPage
            onBack={() => setStep('choose-path')}
            onCreateNew={() => setStep('choose-path')}
          />
        )}

        {step === 'style-preview' && (
          <StylePreviewAdmin onBack={() => setStep('choose-path')} />
        )}

        {step === 'rebuild' && (
          <RebuildStep
            projectData={projectData}
            updateProject={updateProject}
            onContinue={goToUploadAssets}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'quick' && (
          <QuickStep
            industries={industries}
            projectData={projectData}
            updateProject={updateProject}
            onContinue={goToUploadAssets}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'reference' && (
          <ReferenceStep
            projectData={projectData}
            updateProject={updateProject}
            onContinue={goToUploadAssets}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'upload-assets' && (
          <UploadAssetsStep
            projectData={projectData}
            updateProject={updateProject}
            onContinue={goToCustomize}
            onSkip={goToCustomize}
            onBack={() => setStep(path)}
          />
        )}

        {step === 'customize' && (
          <CustomizeStep
            projectData={projectData}
            updateProject={updateProject}
            industries={industries}
            layouts={layouts}
            effects={effects}
            onGenerate={handleGenerate}
            onBack={() => setStep(path)}
          />
        )}

        {step === 'orchestrator' && (
          <OrchestratorStep
            isToolMode={isToolMode}
            preselectedTool={selectedTool}
            pendingInput={pendingOrchestratorInput}
            pendingIndustryKey={pendingIndustryKey}
            onPendingInputUsed={() => {
              setPendingOrchestratorInput(null);
              setPendingIndustryKey(null);
            }}
            onComplete={(result) => {
              setOrchestratorResult(result);
              setResult(result.project);
              updateProject({ businessName: result.orchestrator?.decisions?.businessName || result.tool?.template || result.project?.name });
              if (result.includeCompanionApp) {
                setShouldAutoGenerateCompanion(true);
              }
              if (result.type === 'tool') {
                setStep('complete');
              } else {
                setStep('preview');
              }
            }}
            onBack={() => {
              setSelectedTool(null);
              setIsToolMode(false);
              setStep('choose-path');
            }}
            onAmbiguousInput={(intentData) => {
              setChoiceData(intentData);
              setStep('choice');
            }}
            onToolRecommendations={async (industry) => {
              setRecommendationsLoading(true);
              setStep('recommendations');
              try {
                const response = await fetch(`${API_BASE}/api/orchestrate/recommend`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ industry })
                });
                const data = await response.json();
                if (data.success) {
                  setRecommendations(data.recommendations || []);
                  setRecommendationIndustry(data.industry);
                }
              } catch (err) {
                console.error('Failed to get recommendations:', err);
                setStep('orchestrator');
              } finally {
                setRecommendationsLoading(false);
              }
            }}
            onSuggestTools={async (industryInput) => {
              setRecommendationsLoading(true);
              setStep('recommendations');
              try {
                const response = await fetch(`${API_BASE}/api/orchestrate/recommend`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ input: industryInput })
                });
                const data = await response.json();
                if (data.success) {
                  setRecommendations(data.recommendations || []);
                  setRecommendationIndustry(data.industry);
                }
              } catch (err) {
                console.error('Failed to get recommendations:', err);
                setStep('orchestrator');
              } finally {
                setRecommendationsLoading(false);
              }
            }}
          />
        )}

        {step === 'full-control' && (
          <FullControlFlow
            sharedContext={sharedContext}
            onUpdateContext={setSharedContext}
            onGenerate={async (config) => {
              updateProject({
                businessName: config.businessName,
                tagline: config.tagline,
                location: config.location,
                industry: { name: config.industryDisplay, key: config.industry },
                industryKey: config.industry,
                selectedPages: config.selectedPages,
                adminTier: config.adminTier,
                adminModules: config.adminModules,
                fullControlSettings: config.pageSettings
              });
              const inputDescription = `Build a ${config.industryDisplay} website for ${config.businessName}${config.location ? ` in ${config.location}` : ''}. ${config.tagline ? `Tagline: "${config.tagline}". ` : ''}Pages: ${config.selectedPages.join(', ')}. Mode: Full Control with custom page layouts.`;
              setPendingOrchestratorInput(inputDescription);
              setStep('orchestrator');
            }}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'demo-batch' && (
          <DemoBatchStep
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'studio' && (
          <StudioMode
            onGenerate={async (config) => {
              updateProject({
                businessName: config.businessInfo?.name || 'My Business',
                tagline: config.businessInfo?.tagline || '',
                industry: { name: config.industry, key: config.industry },
                industryKey: config.industry,
                selectedPages: config.pages || ['home', 'about', 'contact'],
                layoutKey: config.layout,
                colors: {
                  primary: config.themeColors?.primary || '#3b82f6',
                  secondary: config.themeColors?.secondary || '#1e40af',
                  accent: config.themeColors?.accent || '#f59e0b',
                  text: config.themeColors?.text || '#1a1a2e',
                  background: config.themeColors?.background || '#ffffff'
                },
                location: config.businessInfo?.address || '',
                extraDetails: config.businessInfo?.description || ''
              });
              const pages = config.pages?.join(', ') || 'home, about, contact';
              const inputDescription = `Build a ${config.industry} website for ${config.businessInfo?.name || 'My Business'}. Layout: ${config.layout}. Theme: ${config.theme}. Pages: ${pages}.`;
              setPendingOrchestratorInput(inputDescription);
              setPendingIndustryKey(config.industry);
              setStep('orchestrator');
            }}
            onTestGenerate={(testResult) => {
              if (testResult.action === 'deploy') {
                setResult({
                  path: testResult.projectPath,
                  name: testResult.projectName
                });
                updateProject({
                  businessName: testResult.projectName
                });
                handleDeploy();
              } else if (testResult.success) {
                setResult({
                  path: testResult.projectPath,
                  name: testResult.projectName
                });
                updateProject({
                  businessName: testResult.projectName
                });
              }
            }}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'choice' && choiceData && (
          <ChoiceScreen
            detectedIndustry={choiceData.detectedIndustry}
            industryDisplay={choiceData.industryDisplay}
            industryIcon={choiceData.industryIcon}
            originalInput={choiceData.originalInput}
            onChooseSite={() => {
              setSharedContext(prev => ({
                ...prev,
                industry: choiceData.detectedIndustry,
                industryDisplay: choiceData.industryDisplay
              }));
              setSiteCustomization({
                industry: choiceData.detectedIndustry,
                industryDisplay: choiceData.industryDisplay,
                industryIcon: choiceData.industryIcon
              });
              setChoiceData(null);
              setStep('site-customize');
            }}
            onChooseTools={async () => {
              setSharedContext(prev => ({
                ...prev,
                industry: choiceData.detectedIndustry,
                industryDisplay: choiceData.industryDisplay
              }));
              setRecommendationsLoading(true);
              setStep('recommendations');
              try {
                const response = await fetch(`${API_BASE}/api/orchestrate/recommend`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ industry: choiceData.detectedIndustry })
                });
                const data = await response.json();
                if (data.success) {
                  setRecommendations(data.recommendations || []);
                  setRecommendationIndustry(data.industry);
                }
              } catch (err) {
                console.error('Failed to get recommendations:', err);
                setStep('orchestrator');
              } finally {
                setRecommendationsLoading(false);
                setChoiceData(null);
              }
            }}
            onBack={() => {
              setChoiceData(null);
              setStep('choose-path');
            }}
          />
        )}

        {step === 'site-customize' && siteCustomization && (
          <SiteCustomizationScreen
            industry={siteCustomization.industry}
            industryDisplay={siteCustomization.industryDisplay}
            industryIcon={siteCustomization.industryIcon}
            sharedContext={sharedContext}
            onUpdateContext={setSharedContext}
            onGenerate={async (config) => {
              setSharedContext(prev => ({
                ...prev,
                businessName: config.businessName,
                brandColor: config.brandColor,
                location: config.location,
                style: config.style,
                logo: config.logo,
                tagline: config.tagline
              }));
              updateProject({
                businessName: config.businessName,
                tagline: config.tagline,
                location: config.location,
                industry: { name: config.industryDisplay, key: config.industry },
                industryKey: config.industry,
                selectedPages: config.selectedPages,
                colors: {
                  ...projectData.colors,
                  primary: config.brandColor
                },
                includeCompanionApp: config.includeCompanionApp || false
              });
              if (config.includeCompanionApp) {
                setShouldAutoGenerateCompanion(true);
              }
              const inputDescription = `Build a ${config.industryDisplay} website for ${config.businessName}${config.location ? ` in ${config.location}` : ''}. ${config.tagline ? `Tagline: "${config.tagline}". ` : ''}Style: ${config.style}. Pages: ${config.selectedPages.join(', ')}. Admin level: ${config.adminLevel}.`;
              setPendingOrchestratorInput(inputDescription);
              setPendingIndustryKey(config.industry);
              setSiteCustomization(null);
              setStep('orchestrator');
            }}
            onBack={() => {
              setSiteCustomization(null);
              setStep('choice');
              setChoiceData({
                detectedIndustry: siteCustomization.industry,
                industryDisplay: siteCustomization.industryDisplay,
                industryIcon: siteCustomization.industryIcon,
                originalInput: ''
              });
            }}
          />
        )}

        {step === 'tool-customize' && selectedToolForCustomization && (
          <ToolCustomizationScreen
            tool={selectedToolForCustomization.toolType}
            toolName={selectedToolForCustomization.name}
            toolIcon={selectedToolForCustomization.icon}
            sharedContext={sharedContext}
            onUpdateContext={setSharedContext}
            onGenerate={async (config) => {
              setSharedContext(prev => ({
                ...prev,
                businessName: config.businessName,
                brandColor: config.brandColor,
                style: config.style,
                logo: config.logo
              }));
              setSelectedTool(selectedToolForCustomization.toolType);
              setIsToolMode(true);
              const inputDescription = `Build a ${selectedToolForCustomization.name}${config.businessName ? ` for ${config.businessName}` : ''}. Style: ${config.style}. Primary color: ${config.brandColor}.`;
              setPendingOrchestratorInput(inputDescription);
              setSelectedToolForCustomization(null);
              setStep('orchestrator');
            }}
            onBack={() => {
              setSelectedToolForCustomization(null);
              setStep('recommendations');
            }}
            onSkip={() => {
              setSelectedTool(selectedToolForCustomization.toolType);
              setIsToolMode(true);
              setSelectedToolForCustomization(null);
              setStep('orchestrator');
            }}
          />
        )}

        {step === 'generating' && (
          <GeneratingStep
            steps={generationSteps}
            currentStep={currentGenerationStep}
            startTime={generationStartTime}
            projectName={projectData.businessName}
            onCancel={handleCancelGeneration}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            projectData={projectData}
            generationResult={orchestratorResult}
            onDeploy={handleDeploy}
            onRegenerate={() => {
              setResult(null);
              setOrchestratorResult(null);
              setStep('orchestrator');
            }}
            onBack={() => {
              setStep('complete');
            }}
          />
        )}

        {step === 'complete' && (
          orchestratorResult?.type === 'tool' ? (
            <ToolCompleteScreen
              toolResult={orchestratorResult}
              onReset={handleReset}
              onBuildAnother={() => {
                setOrchestratorResult(null);
                setSelectedTool(null);
                setIsToolMode(true);
                setStep('orchestrator');
              }}
              industry={sharedContext.industryDisplay || recommendationIndustry}
              onBuildSite={() => {
                setOrchestratorResult(null);
                setSelectedTool(null);
                setIsToolMode(false);
                setSiteCustomization({
                  industry: sharedContext.industry || recommendationIndustry,
                  industryDisplay: sharedContext.industryDisplay || recommendationIndustry,
                  industryIcon: '🌐'
                });
                setStep('site-customize');
              }}
            />
          ) : orchestratorResult?.type === 'app' ? (
            <ToolCompleteScreen
              toolResult={{
                ...orchestratorResult,
                tool: orchestratorResult.app?.project || orchestratorResult.app,
                html: orchestratorResult.app?.html
              }}
              onReset={handleReset}
              onBuildAnother={() => {
                setOrchestratorResult(null);
                setPreselectedApp(null);
                setStep('choose-path');
              }}
              industry={null}
              onBuildSite={() => {
                setOrchestratorResult(null);
                setStep('choose-path');
              }}
            />
          ) : (
            <CompleteStep
              result={result}
              projectData={projectData}
              onReset={handleReset}
              blinkCount={finalBlinkCount}
              onDeploy={handleDeploy}
              deployReady={true}
              industry={sharedContext.industryDisplay || projectData.industry?.name}
              onAddTools={async () => {
                const industryKey = sharedContext.industry || projectData.industryKey;
                if (industryKey) {
                  setRecommendationsLoading(true);
                  setStep('recommendations');
                  try {
                    const response = await fetch(`${API_BASE}/api/orchestrate/recommend`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ industry: industryKey })
                    });
                    const data = await response.json();
                    if (data.success) {
                      setRecommendations(data.recommendations || []);
                      setRecommendationIndustry(data.industry);
                    }
                  } catch (err) {
                    console.error('Failed to get recommendations:', err);
                  } finally {
                    setRecommendationsLoading(false);
                  }
                }
              }}
            />
          )
        )}

        {step === 'recommendations' && (
          <RecommendedToolsScreen
            recommendations={recommendations}
            industry={recommendationIndustry}
            loading={recommendationsLoading}
            sharedContext={sharedContext}
            onSelectTool={(toolType, toolName) => {
              const tool = recommendations.find(r => r.toolType === toolType);
              setSelectedToolForCustomization({
                toolType,
                name: toolName || tool?.name || toolType,
                icon: tool?.icon || '🔧'
              });
              setStep('tool-customize');
            }}
            onSelectMultiple={async (toolTypes) => {
              setSelectedToolsForSuite(toolTypes);
              setStep('suite-builder');
            }}
            onBack={() => {
              setRecommendations([]);
              setRecommendationIndustry(null);
              setStep('choose-path');
            }}
            onBuildSite={() => {
              setSiteCustomization({
                industry: sharedContext.industry || recommendationIndustry,
                industryDisplay: sharedContext.industryDisplay || recommendationIndustry,
                industryIcon: '🌐'
              });
              setStep('site-customize');
            }}
          />
        )}

        {step === 'suite-builder' && (
          <ToolSuiteBuilderScreen
            selectedTools={selectedToolsForSuite}
            recommendations={recommendations}
            industry={recommendationIndustry}
            onBuild={(result) => {
              setSuiteResult(result);
              setStep('suite-complete');
            }}
            onBack={() => {
              setStep('recommendations');
            }}
          />
        )}

        {step === 'suite-complete' && (
          <SuiteCompleteScreen
            suiteResult={suiteResult}
            onReset={() => {
              setSuiteResult(null);
              setSelectedToolsForSuite([]);
              setRecommendations([]);
              setRecommendationIndustry(null);
              setPreselectedBundle(null);
              setStep('choose-path');
            }}
            onBuildAnother={() => {
              setSuiteResult(null);
              setPreselectedBundle(null);
              setStep('choose-path');
            }}
          />
        )}

        {step === 'tool-suite-guided' && (
          <ToolSuiteGuidedStep
            preselectedBundle={preselectedBundle}
            onComplete={(result) => {
              setSuiteResult(result);
              setPreselectedBundle(null);
              setStep('suite-complete');
            }}
            onBack={() => {
              setPreselectedBundle(null);
              setStep('choose-path');
            }}
          />
        )}

        {step === 'tool-suite-instant' && (
          <ToolSuiteInstantStep
            onComplete={(result) => {
              setSuiteResult(result);
              setStep('suite-complete');
            }}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'tool-suite-custom' && (
          <ToolSuiteCustomStep
            onComplete={(result) => {
              setSuiteResult(result);
              setStep('suite-complete');
            }}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'app-guided' && (
          <AppGuidedStep
            preselectedApp={preselectedApp}
            onComplete={(result) => {
              setOrchestratorResult({
                type: 'app',
                app: result
              });
              setResult(result.project);
              setPreselectedApp(null);
              setStep('complete');
            }}
            onBack={() => {
              setPreselectedApp(null);
              setStep('choose-path');
            }}
          />
        )}

        {step === 'app-ai-builder' && (
          <AppAIBuilderStep
            onComplete={(result) => {
              setOrchestratorResult({
                type: 'app',
                app: result
              });
              setResult(result.project);
              setStep('complete');
            }}
            onBack={() => setStep('choose-path')}
          />
        )}

        {step === 'app-advanced' && (
          <AppAdvancedStep
            templateId={preselectedApp || 'loyalty-program'}
            onBack={() => {
              setPreselectedApp(null);
              setStep('choose-path');
            }}
            onGenerate={(result) => {
              setOrchestratorResult({
                type: 'advanced-app',
                app: result
              });
              setResult(result.project);
              setPreselectedApp(null);
            }}
          />
        )}

        {step === 'error' && (
          <ErrorStep error={error} onRetry={handleGenerate} onReset={handleReset} />
        )}

        {step === 'deploying' && (
          <DeployingStep
            status={deployStatus}
            projectName={projectData.businessName}
            startTime={deployStartTime}
            onCancel={handleCancelDeploy}
            railwayServices={railwayServices}
          />
        )}

        {step === 'deploy-complete' && (
          <DeployCompleteStep
            result={deployResult}
            onReset={handleReset}
            onGenerateCompanion={() => {
              const subdomain = deployResult?.urls?.frontend?.replace('https://', '').split('.')[0];
              setCompanionParentSite({
                name: projectData?.businessName || subdomain,
                subdomain: subdomain,
                url: deployResult?.urls?.frontend
              });
              setStep('companion');
            }}
          />
        )}

        {step === 'companion' && companionParentSite && (
          <CompanionAppStep
            parentSite={companionParentSite}
            onGenerate={async (config) => {
              setStep('generating');

              try {
                const generateConfig = {
                  ...config,
                  parentProjectId: deployResult?.projectId || null
                };

                const response = await fetch(`${API_BASE}/api/companion/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(generateConfig)
                });
                const data = await response.json();

                if (data.success) {
                  setCompanionProject(data.project);
                  setStep('companion-deploying');
                  setCompanionDeployProgress({ step: 'starting', status: 'Starting deployment...', progress: 0 });

                  const deployResponse = await fetch(`${API_BASE}/api/companion/deploy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      projectPath: data.project.path,
                      projectName: data.project.name,
                      parentSiteSubdomain: companionParentSite.subdomain,
                      projectId: data.project.id
                    })
                  });

                  const reader = deployResponse.body.getReader();
                  const decoder = new TextDecoder();

                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter(line => line.startsWith('data: '));

                    for (const line of lines) {
                      try {
                        const eventData = JSON.parse(line.slice(6));
                        setCompanionDeployProgress(eventData);

                        if (eventData.step === 'complete' && eventData.result?.success) {
                          setCompanionDeployResult(eventData.result);
                          setStep('companion-deploy-complete');
                        } else if (eventData.step === 'error') {
                          setError(eventData.status || 'Companion deployment failed');
                          setStep('error');
                        }
                      } catch (e) {
                        // Ignore parse errors
                      }
                    }
                  }
                } else {
                  setError(data.error || 'Companion app generation failed');
                  setStep('error');
                }
              } catch (err) {
                setError(err.message);
                setStep('error');
              }
            }}
            onCancel={() => {
              setCompanionParentSite(null);
              setStep('deploy-complete');
            }}
          />
        )}

        {step === 'companion-deploying' && (
          <DeployingStep
            status={companionDeployProgress?.status || 'Deploying companion app...'}
            projectName={companionProject?.name || 'Companion App'}
          />
        )}

        {step === 'companion-deploy-complete' && companionDeployResult && (
          <CompanionDeployCompleteStep
            result={companionDeployResult}
            parentSite={companionParentSite}
            onReset={handleReset}
            onBackToWebsite={() => {
              setCompanionDeployResult(null);
              setCompanionProject(null);
              setStep('deploy-complete');
            }}
          />
        )}

        {step === 'deploy-error' && (
          <DeployErrorStep error={deployError} onRetry={handleDeploy} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>BLINK by BE1st (Legacy Mode)</span>
        <span>•</span>
        <span>{Object.keys(industries).length} Industries</span>
        <span>•</span>
        <span>{Object.keys(layouts).length} Layouts</span>
      </footer>

      {/* Test Generator Modal */}
      <TestGenerator
        isOpen={showTestGenerator}
        onClose={() => setShowTestGenerator(false)}
        onRunTest={(result) => {
          console.log('Test result:', result);
        }}
      />
    </div>
  );
}

// Initialize global styles
initGlobalStyles();
