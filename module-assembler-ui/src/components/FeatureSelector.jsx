/**
 * FeatureSelector Component
 *
 * Allows users to select feature packages (Essential, Recommended, Premium, Complete)
 * Shows what's included: Auth, Loyalty, Portal, Admin Pages, Companion Screens
 */

import React, { useState, useEffect } from 'react';
import {
  FEATURES,
  INDUSTRY_FEATURES,
  FEATURE_PACKAGES,
  getIndustryFeatures,
  getPortalConfig,
  getAdminPages,
  getCompanionScreens,
  checkFeatureDependencies,
  getFeature
} from '../constants/industry-features';

const styles = {
  container: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e4',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  featureCount: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '400'
  },
  customizeBtn: {
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer'
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    padding: '12px'
  },
  packageCard: {
    padding: '10px 8px',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  packageCardSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  packageIcon: {
    fontSize: '20px',
    marginBottom: '4px'
  },
  packageName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#e4e4e4',
    marginBottom: '2px'
  },
  packageFeatures: {
    fontSize: '10px',
    color: '#888'
  },
  customPanel: {
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    marginTop: '12px'
  },
  sectionTitleFirst: {
    marginTop: 0
  },
  featuresGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  featureChip: {
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  featureChipSelected: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    color: '#a5b4fc'
  },
  featureChipDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  portalPreview: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(99, 102, 241, 0.2)'
  },
  portalTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a5b4fc',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  portalSections: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  portalSection: {
    padding: '3px 8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#c7d2fe'
  },
  syncInfo: {
    marginTop: '12px',
    padding: '10px 12px',
    background: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    fontSize: '11px',
    color: '#4ade80'
  },
  syncRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  syncLabel: {
    color: '#888',
    minWidth: '80px'
  },
  syncValue: {
    color: '#4ade80'
  }
};

export function FeatureSelector({
  industryKey,
  selectedFeatures,
  onFeaturesChange,
  compact = false
}) {
  const [selectedPackage, setSelectedPackage] = useState('recommended');
  const [showCustomize, setShowCustomize] = useState(false);
  const [customFeatures, setCustomFeatures] = useState(null);

  // Get feature config for this industry
  const industryConfig = INDUSTRY_FEATURES[industryKey] || INDUSTRY_FEATURES.default;
  const allAvailableFeatures = industryConfig.all || [];

  // Initialize features when industry changes
  useEffect(() => {
    if (!selectedFeatures || selectedFeatures.length === 0) {
      const defaultFeatures = getIndustryFeatures(industryKey, 'recommended');
      onFeaturesChange(defaultFeatures);
    }
  }, [industryKey]);

  // Determine which package matches current selection
  useEffect(() => {
    if (selectedFeatures && selectedFeatures.length > 0) {
      for (const [pkgKey, pkgFeatures] of Object.entries(industryConfig)) {
        if (
          Array.isArray(pkgFeatures) &&
          selectedFeatures.length === pkgFeatures.length &&
          selectedFeatures.every(f => pkgFeatures.includes(f))
        ) {
          setSelectedPackage(pkgKey);
          setCustomFeatures(null);
          return;
        }
      }
      setCustomFeatures(selectedFeatures);
    }
  }, [selectedFeatures, industryConfig]);

  const handlePackageSelect = (pkgKey) => {
    setSelectedPackage(pkgKey);
    setCustomFeatures(null);
    const features = industryConfig[pkgKey] || industryConfig.recommended;
    onFeaturesChange(features);
  };

  const handleFeatureToggle = (featureId) => {
    const currentFeatures = customFeatures || selectedFeatures || [];
    let newFeatures;

    if (currentFeatures.includes(featureId)) {
      // Removing - check if other features depend on this
      newFeatures = currentFeatures.filter(f => f !== featureId);
    } else {
      // Adding - check dependencies
      const deps = checkFeatureDependencies(featureId, currentFeatures);
      if (!deps.met) {
        // Auto-add required dependencies
        newFeatures = [...new Set([...currentFeatures, ...deps.missing, featureId])];
      } else {
        newFeatures = [...currentFeatures, featureId];
      }
    }

    setCustomFeatures(newFeatures);
    onFeaturesChange(newFeatures);
  };

  const packages = ['essential', 'recommended', 'premium', 'all'];
  const currentFeatures = customFeatures || selectedFeatures || industryConfig.recommended;
  const isCustom = customFeatures !== null;

  // Get what will be generated
  const portalConfig = getPortalConfig(industryKey);
  const adminPages = getAdminPages(currentFeatures);
  const companionScreens = getCompanionScreens(currentFeatures);

  // Group features by category for display
  const featuresByCategory = {};
  Object.values(FEATURES).forEach(feature => {
    const cat = feature.category || 'other';
    if (!featuresByCategory[cat]) featuresByCategory[cat] = [];
    featuresByCategory[cat].push(feature);
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span>🔌</span>
          <span>Features</span>
          <span style={styles.featureCount}>
            ({currentFeatures.length} selected)
          </span>
        </div>
        <button
          style={styles.customizeBtn}
          onClick={() => setShowCustomize(!showCustomize)}
        >
          {showCustomize ? 'Hide' : 'Customize'}
        </button>
      </div>

      {/* Package Cards */}
      <div style={styles.packagesGrid}>
        {packages.map(pkgKey => {
          const pkg = FEATURE_PACKAGES[pkgKey];
          const features = industryConfig[pkgKey] || [];
          const isSelected = selectedPackage === pkgKey && !isCustom;

          return (
            <div
              key={pkgKey}
              style={{
                ...styles.packageCard,
                ...(isSelected ? styles.packageCardSelected : {})
              }}
              onClick={() => handlePackageSelect(pkgKey)}
            >
              <div style={styles.packageIcon}>{pkg.icon}</div>
              <div style={styles.packageName}>{pkg.name}</div>
              <div style={styles.packageFeatures}>{features.length} features</div>
            </div>
          );
        })}
      </div>

      {/* Selected Features Summary */}
      {!showCustomize && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={styles.featuresGrid}>
            {currentFeatures.map(featureId => {
              const feature = getFeature(featureId);
              if (!feature) return null;
              return (
                <div
                  key={featureId}
                  style={{
                    ...styles.featureChip,
                    ...styles.featureChipSelected,
                    cursor: 'default'
                  }}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom indicator */}
      {isCustom && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(245, 158, 11, 0.1)',
          borderTop: '1px solid rgba(245, 158, 11, 0.2)',
          fontSize: '11px',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Custom selection ({currentFeatures.length} features)</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#fbbf24',
              fontSize: '11px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => handlePackageSelect('recommended')}
          >
            Reset
          </button>
        </div>
      )}

      {/* Customize Panel */}
      {showCustomize && (
        <div style={styles.customPanel}>
          {/* Core Features */}
          <div style={{ ...styles.sectionTitle, ...styles.sectionTitleFirst }}>
            Available Features
          </div>
          <div style={styles.featuresGrid}>
            {allAvailableFeatures.map(featureId => {
              const feature = getFeature(featureId);
              if (!feature) return null;
              const isSelected = currentFeatures.includes(featureId);
              const deps = checkFeatureDependencies(featureId, currentFeatures);

              return (
                <div
                  key={featureId}
                  style={{
                    ...styles.featureChip,
                    ...(isSelected ? styles.featureChipSelected : {})
                  }}
                  onClick={() => handleFeatureToggle(featureId)}
                  title={!deps.met ? `Requires: ${deps.missing.join(', ')}` : feature.description}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.name}</span>
                  {isSelected && <span>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Portal Preview */}
          {currentFeatures.includes('portal') && (
            <div style={styles.portalPreview}>
              <div style={styles.portalTitle}>
                <span>🚪</span>
                <span>{portalConfig.title} ({portalConfig.type})</span>
              </div>
              <div style={styles.portalSections}>
                {portalConfig.sections?.map(section => (
                  <span key={section} style={styles.portalSection}>
                    {section.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sync Info - What gets generated */}
          <div style={styles.syncInfo}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>
              ✓ Everything Syncs Automatically
            </div>
            <div style={styles.syncRow}>
              <span style={styles.syncLabel}>Website:</span>
              <span style={styles.syncValue}>{currentFeatures.length} feature modules</span>
            </div>
            <div style={styles.syncRow}>
              <span style={styles.syncLabel}>Companion:</span>
              <span style={styles.syncValue}>{companionScreens.length} screens</span>
            </div>
            <div style={styles.syncRow}>
              <span style={styles.syncLabel}>Admin:</span>
              <span style={styles.syncValue}>{adminPages.length} pages</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeatureSelector;
