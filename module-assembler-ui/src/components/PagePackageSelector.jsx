/**
 * PagePackageSelector Component
 *
 * Allows users to select page packages (Essential, Recommended, Premium, Complete)
 * with the ability to customize individual pages.
 */

import React, { useState, useEffect } from 'react';
import {
  INDUSTRY_PAGE_PACKAGES,
  PAGE_PACKAGES,
  PAGE_LABELS,
  getIndustryPages,
  getAllIndustryPages,
  getPageLabel
} from '../constants/industry-config';

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
  pageCount: {
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
  packagePages: {
    fontSize: '10px',
    color: '#888'
  },
  packageBadge: {
    fontSize: '8px',
    padding: '2px 6px',
    borderRadius: '8px',
    fontWeight: '600',
    marginTop: '4px',
    display: 'inline-block'
  },
  customizePanel: {
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)'
  },
  customizeTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#e4e4e4',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
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
    fontSize: '11px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  pageChipSelected: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    color: '#a5b4fc'
  },
  pageChipRequired: {
    background: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
    cursor: 'default'
  },
  addPageBtn: {
    padding: '5px 10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#666',
    cursor: 'pointer'
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '10px',
    marginBottom: '6px'
  }
};

export function PagePackageSelector({
  industryKey,
  selectedPages,
  onPagesChange,
  compact = false
}) {
  const [selectedPackage, setSelectedPackage] = useState('recommended');
  const [showCustomize, setShowCustomize] = useState(false);
  const [customPages, setCustomPages] = useState(null);

  // Get packages for this industry
  const industryConfig = INDUSTRY_PAGE_PACKAGES[industryKey] || INDUSTRY_PAGE_PACKAGES['default'];
  const allAvailablePages = industryConfig.all || [];

  // Initialize pages when industry changes
  useEffect(() => {
    if (!selectedPages || selectedPages.length === 0) {
      const defaultPages = getIndustryPages(industryKey, 'recommended');
      onPagesChange(defaultPages);
    }
  }, [industryKey]);

  // Determine which package matches current selection
  useEffect(() => {
    if (selectedPages && selectedPages.length > 0) {
      // Check if selection matches any package exactly
      for (const [pkgKey, pkgPages] of Object.entries(industryConfig)) {
        if (
          selectedPages.length === pkgPages.length &&
          selectedPages.every(p => pkgPages.includes(p))
        ) {
          setSelectedPackage(pkgKey);
          setCustomPages(null);
          return;
        }
      }
      // Custom selection
      setCustomPages(selectedPages);
    }
  }, [selectedPages, industryConfig]);

  const handlePackageSelect = (pkgKey) => {
    setSelectedPackage(pkgKey);
    setCustomPages(null);
    const pages = industryConfig[pkgKey] || industryConfig.recommended;
    onPagesChange(pages);
  };

  const handlePageToggle = (page) => {
    // Don't allow removing home or contact
    if (page === 'home' || page === 'contact') return;

    const currentPages = customPages || selectedPages || [];
    let newPages;

    if (currentPages.includes(page)) {
      newPages = currentPages.filter(p => p !== page);
    } else {
      newPages = [...currentPages, page];
    }

    setCustomPages(newPages);
    onPagesChange(newPages);
  };

  const packages = ['essential', 'recommended', 'premium', 'all'];
  const currentPages = customPages || selectedPages || industryConfig.recommended;
  const isCustom = customPages !== null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span>📄</span>
          <span>Pages</span>
          <span style={styles.pageCount}>
            ({currentPages.length} selected)
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
          const pkg = PAGE_PACKAGES[pkgKey];
          const pages = industryConfig[pkgKey] || [];
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
              <div style={styles.packagePages}>{pages.length} pages</div>
              {pkgKey === 'recommended' && (
                <div style={{
                  ...styles.packageBadge,
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc'
                }}>
                  Popular
                </div>
              )}
            </div>
          );
        })}
      </div>

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
          <span>Custom selection ({currentPages.length} pages)</span>
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
        <div style={styles.customizePanel}>
          <div style={styles.customizeTitle}>
            <span>Included Pages</span>
            <span style={{ fontWeight: '400', color: '#666' }}>
              Click to toggle
            </span>
          </div>

          {/* Required pages */}
          <div style={styles.sectionLabel}>Required</div>
          <div style={styles.pagesGrid}>
            {['home', 'contact'].map(page => (
              <div
                key={page}
                style={{
                  ...styles.pageChip,
                  ...styles.pageChipRequired
                }}
              >
                <span>✓</span>
                <span>{getPageLabel(page)}</span>
              </div>
            ))}
          </div>

          {/* Selected pages */}
          <div style={styles.sectionLabel}>Selected</div>
          <div style={styles.pagesGrid}>
            {currentPages
              .filter(p => p !== 'home' && p !== 'contact')
              .map(page => (
                <div
                  key={page}
                  style={{
                    ...styles.pageChip,
                    ...styles.pageChipSelected
                  }}
                  onClick={() => handlePageToggle(page)}
                >
                  <span>✓</span>
                  <span>{getPageLabel(page)}</span>
                </div>
              ))}
          </div>

          {/* Available pages to add */}
          {allAvailablePages.filter(p => !currentPages.includes(p)).length > 0 && (
            <>
              <div style={styles.sectionLabel}>Add More</div>
              <div style={styles.pagesGrid}>
                {allAvailablePages
                  .filter(p => !currentPages.includes(p))
                  .map(page => (
                    <div
                      key={page}
                      style={styles.pageChip}
                      onClick={() => handlePageToggle(page)}
                    >
                      <span>+</span>
                      <span>{getPageLabel(page)}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PagePackageSelector;
