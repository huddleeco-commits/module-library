/**
 * Studio Mode - Full control site builder
 * Separate from Quick Start to preserve existing functionality
 */

import React, { useState } from 'react';
import IndustrySelector from '../components/studio/IndustrySelector';
import PackageSelector from '../components/studio/PackageSelector';
import LayoutSelector from '../components/studio/LayoutSelector';
import ThemeSelector from '../components/studio/ThemeSelector';
import PageEditor from '../components/studio/PageEditor';
import PreviewPanel from '../components/studio/PreviewPanel';
import { LAYOUT_CONFIGS, INDUSTRY_LABELS } from '../constants/layout-configs';
import { PAGE_PACKAGES } from '../constants/page-packages';
import { THEME_PRESETS, getThemesForIndustry } from '../constants/theme-presets';

const STEPS = [
  { id: 'industry', label: 'Industry', icon: '🏢' },
  { id: 'package', label: 'Pages', icon: '📄' },
  { id: 'layout', label: 'Layout', icon: '🎨' },
  { id: 'theme', label: 'Theme', icon: '🎭' },
  { id: 'customize', label: 'Customize', icon: '✏️' },
  { id: 'generate', label: 'Generate', icon: '🚀' }
];

export default function StudioMode({ onGenerate, onTestGenerate, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    industry: null,
    package: null,
    layout: null,
    theme: null,
    pages: [],
    businessInfo: {
      name: '',
      tagline: '',
      phone: '',
      email: '',
      address: ''
    }
  });

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'industry': return config.industry !== null;
      case 'package': return config.package !== null;
      case 'layout': return config.layout !== null;
      case 'theme': return config.theme !== null;
      case 'customize': return config.businessInfo.name.trim() !== '';
      default: return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      // Auto-select pages when package is selected
      if (STEPS[currentStep].id === 'package' && config.industry && config.package) {
        const packageData = PAGE_PACKAGES[config.industry]?.[config.package];
        if (packageData) {
          updateConfig('pages', packageData.pages);
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case 'industry':
        return (
          <IndustrySelector
            selected={config.industry}
            onSelect={(industry) => updateConfig('industry', industry)}
          />
        );

      case 'package':
        return (
          <PackageSelector
            industry={config.industry}
            selected={config.package}
            onSelect={(pkg) => updateConfig('package', pkg)}
          />
        );

      case 'layout':
        return (
          <LayoutSelector
            industry={config.industry}
            selected={config.layout}
            onSelect={(layout) => updateConfig('layout', layout)}
          />
        );

      case 'theme':
        return (
          <ThemeSelector
            industry={config.industry}
            selected={config.theme}
            onSelect={(theme) => updateConfig('theme', theme)}
          />
        );

      case 'customize':
        return (
          <PageEditor
            config={config}
            onUpdateBusinessInfo={(info) => updateConfig('businessInfo', info)}
            onUpdatePages={(pages) => updateConfig('pages', pages)}
          />
        );

      case 'generate':
        return (
          <GenerateStep config={config} onGenerate={onGenerate} onTestGenerate={onTestGenerate} />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Studio Mode</h1>
          </div>

          {/* Progress Steps */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => idx < currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: idx === currentStep ? '#6366F1' : idx < currentStep ? '#E0E7FF' : '#F1F5F9',
                  color: idx === currentStep ? 'white' : idx < currentStep ? '#6366F1' : '#94A3B8',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: idx <= currentStep ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <span>{step.icon}</span>
                <span style={{ display: idx === currentStep ? 'inline' : 'none' }}>{step.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              color: '#64748B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Step Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            {STEPS[currentStep].icon} {getStepTitle(STEPS[currentStep].id)}
          </h2>
          <p style={{ color: '#64748B', fontSize: '16px' }}>
            {getStepDescription(STEPS[currentStep].id)}
          </p>
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: '40px' }}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '24px',
          borderTop: '1px solid #E2E8F0'
        }}>
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              style={{
                padding: '14px 32px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: 'white',
                color: '#64748B',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ← Previous
            </button>
          )}

          {currentStep < STEPS.length - 1 && (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              style={{
                padding: '14px 32px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: canProceed() ? '#6366F1' : '#CBD5E1',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Continue →
            </button>
          )}
        </div>
      </main>

      {/* Config Preview (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1E293B',
          color: '#94A3B8',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '300px',
          overflow: 'auto'
        }}>
          <strong style={{ color: 'white' }}>Config:</strong>
          <pre style={{ margin: '8px 0 0', fontSize: '10px' }}>
            {JSON.stringify({
              industry: config.industry,
              package: config.package,
              layout: config.layout,
              theme: config.theme,
              pages: config.pages.length + ' pages'
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function getStepTitle(stepId) {
  const titles = {
    industry: 'Select Your Industry',
    package: 'Choose Your Page Package',
    layout: 'Pick a Layout Style',
    theme: 'Select a Color Theme',
    customize: 'Customize Your Site',
    generate: 'Generate & Deploy'
  };
  return titles[stepId] || stepId;
}

function getStepDescription(stepId) {
  const descriptions = {
    industry: 'We\'ll tailor everything to your business type',
    package: 'Select how many pages you need',
    layout: 'Choose a visual style that fits your brand',
    theme: 'Pick colors that represent your business',
    customize: 'Add your business details and fine-tune pages',
    generate: 'Review and generate your website'
  };
  return descriptions[stepId] || '';
}

function GenerateStep({ config, onGenerate, onTestGenerate }) {
  const [generating, setGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState('test'); // 'test' or 'ai'
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Map Studio industry to fixture ID (must match files in test-fixtures/)
  const getFixtureId = (industry) => {
    const fixtureMap = {
      'fitness': 'fitness-gym',
      'restaurant': 'pizza-restaurant',
      'salon': 'salon-spa',
      'professional': 'law-firm',
      'tech': 'saas',
      'education': 'school',
      'healthcare': 'healthcare'
    };
    return fixtureMap[industry] || 'pizza-restaurant';
  };

  const handleTestModeGenerate = async () => {
    setGenerating(true);
    setProgress([]);
    setError(null);

    try {
      const fixtureId = getFixtureId(config.industry);
      const themeColors = THEME_PRESETS[config.theme]?.colors || {};

      const response = await fetch('/api/test-mode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId,
          customizations: {
            businessName: config.businessInfo.name,
            tagline: config.businessInfo.tagline,
            phone: config.businessInfo.phone,
            email: config.businessInfo.email,
            address: config.businessInfo.address,
            // Theme colors
            primaryColor: themeColors.primary,
            secondaryColor: themeColors.secondary,
            accentColor: themeColors.accent,
            backgroundColor: themeColors.background,
            textColor: themeColors.text
          },
          websitePages: config.pages,
          deploy: false
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
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Skip "data: "
              const data = JSON.parse(jsonStr);

              if (data.message) {
                setProgress(prev => [...prev, data.message]);
              }

              if (data.success !== undefined) {
                // Complete event
                setResult(data);
                setGenerating(false);
                if (onTestGenerate) {
                  onTestGenerate(data);
                }
                return; // Exit early on complete
              }
            } catch (e) {
              console.warn('SSE parse error:', e, line);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAIModeGenerate = () => {
    setGenerating(true);
    const themeColors = THEME_PRESETS[config.theme]?.colors || {};

    if (onGenerate) {
      onGenerate({
        ...config,
        themeColors,
        generationMode: 'ai'
      });
    }
  };

  const handleGenerate = () => {
    if (generationMode === 'test') {
      handleTestModeGenerate();
    } else {
      handleAIModeGenerate();
    }
  };

  // Show result screen if generation complete
  if (result?.success) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#DCFCE7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px'
        }}>
          ✓
        </div>
        <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
          Site Generated Successfully!
        </h3>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>
          Your {config.businessInfo.name || 'new'} website is ready
        </p>

        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
            <strong>Project:</strong> {result.projectName}
          </div>
          <div style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
            <strong>Pages:</strong> {result.pagesGenerated} generated
          </div>
          <div style={{ fontSize: '14px', color: '#166534' }}>
            <strong>Mode:</strong> 🧪 Test Mode (No AI costs)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              if (onTestGenerate) {
                onTestGenerate({ ...result, action: 'deploy' });
              }
            }}
            style={{
              padding: '14px 28px',
              backgroundColor: '#6366F1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🚀 Deploy to Railway
          </button>
          <button
            onClick={() => window.open(`/api/download/${result.projectName}`, '_blank')}
            style={{
              padding: '14px 28px',
              backgroundColor: 'white',
              color: '#6366F1',
              border: '2px solid #6366F1',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Download Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Mode Toggle */}
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#94A3B8',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Generation Mode
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setGenerationMode('test')}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: generationMode === 'test' ? '#065F46' : 'rgba(255,255,255,0.05)',
              border: generationMode === 'test' ? '2px solid #10B981' : '2px solid transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>🧪</span>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Test Mode</span>
              <span style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                $0
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
              Uses pre-built templates. No AI costs. Perfect for testing the full flow.
            </p>
          </button>

          <button
            onClick={() => setGenerationMode('ai')}
            style={{
              flex: 1,
              padding: '20px',
              backgroundColor: generationMode === 'ai' ? '#4C1D95' : 'rgba(255,255,255,0.05)',
              border: generationMode === 'ai' ? '2px solid #8B5CF6' : '2px solid transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>✨</span>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>AI Visual Freedom</span>
              <span style={{
                backgroundColor: '#8B5CF6',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                API Costs
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
              AI generates custom content tailored to your business. Uses Claude API.
            </p>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Review Your Configuration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Industry</label>
            <p style={{ fontWeight: '600', marginTop: '4px' }}>{INDUSTRY_LABELS[config.industry] || config.industry}</p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Package</label>
            <p style={{ fontWeight: '600', marginTop: '4px' }}>{config.package} ({config.pages.length} pages)</p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Layout</label>
            <p style={{ fontWeight: '600', marginTop: '4px' }}>{LAYOUT_CONFIGS[config.industry]?.[config.layout]?.name || config.layout}</p>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Theme</label>
            <p style={{ fontWeight: '600', marginTop: '4px' }}>{THEME_PRESETS[config.theme]?.name || config.theme}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Business Name</label>
            <p style={{ fontWeight: '600', marginTop: '4px' }}>{config.businessInfo.name || '(Not set)'}</p>
          </div>
        </div>
      </div>

      {/* Progress Log (during generation) */}
      {generating && progress.length > 0 && (
        <div style={{
          backgroundColor: '#0F172A',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {progress.map((msg, idx) => (
            <div key={idx} style={{
              color: '#94A3B8',
              fontSize: '13px',
              fontFamily: 'monospace',
              marginBottom: '4px'
            }}>
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#DC2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Generate Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '18px 48px',
            backgroundColor: generating ? '#94A3B8' : generationMode === 'test' ? '#10B981' : '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '18px',
            cursor: generating ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
        >
          {generating ? (
            <>
              <span>⏳</span>
              Generating...
            </>
          ) : generationMode === 'test' ? (
            <>
              🧪 Generate (Test Mode)
            </>
          ) : (
            <>
              ✨ Generate with AI
            </>
          )}
        </button>
        <p style={{ marginTop: '16px', color: '#64748B', fontSize: '14px' }}>
          {generationMode === 'test'
            ? 'Uses pre-built templates - no API costs'
            : 'AI will customize content based on your selections'}
        </p>
      </div>
    </div>
  );
}
