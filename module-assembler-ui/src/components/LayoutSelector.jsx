/**
 * Layout Selector Component
 *
 * Allows users to:
 * 1. See available layouts for their industry
 * 2. Preview layout structure (zero cost)
 * 3. Select a layout for AI generation
 *
 * Works with both test mode (free) and AI generation (paid)
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

const styles = {
  container: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  categoryBadge: {
    padding: '2px 8px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#a5b4fc',
    fontWeight: '500',
    textTransform: 'none'
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  },
  layoutCard: {
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  layoutCardSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.5)'
  },
  layoutCardHover: {
    background: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.15)'
  },
  layoutName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e4',
    marginBottom: '6px'
  },
  layoutDescription: {
    fontSize: '12px',
    color: '#888',
    lineHeight: '1.4',
    marginBottom: '8px'
  },
  layoutEmphasis: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  emphasisTag: {
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#666'
  },
  sectionPreview: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px'
  },
  sectionPreviewTitle: {
    fontSize: '10px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  sectionItem: {
    padding: '3px 8px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#a5b4fc'
  },
  noLayouts: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    border: '1px dashed rgba(255,255,255,0.1)'
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#888'
  }
};

export function LayoutSelector({
  industryKey,
  selectedLayout,
  onLayoutSelect,
  showSectionPreview = true,
  compact = false
}) {
  const [layouts, setLayouts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredLayout, setHoveredLayout] = useState(null);

  // Fetch layouts when industry changes
  useEffect(() => {
    if (!industryKey) {
      setLayouts([]);
      setCategory(null);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/layouts-for-industry/${industryKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.layouts) {
          setLayouts(data.layouts);
          setCategory(data.category);

          // Auto-select first layout if none selected
          if (!selectedLayout && data.layouts.length > 0) {
            onLayoutSelect(data.layouts[0].key);
          }
        } else {
          setLayouts([]);
          setCategory(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch layouts:', err);
        setLayouts([]);
      })
      .finally(() => setLoading(false));
  }, [industryKey]);

  if (loading) {
    return <div style={styles.loading}>Loading layouts...</div>;
  }

  if (!industryKey) {
    return null;
  }

  if (layouts.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.sectionTitle}>Layout</div>
        <div style={styles.noLayouts}>
          No specific layouts for this industry.
          <br />
          <span style={{ fontSize: '11px', opacity: 0.7 }}>
            AI will use intelligent defaults based on industry type.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>
        Layout
        {category && <span style={styles.categoryBadge}>{category}</span>}
      </div>

      <div style={styles.layoutGrid}>
        {layouts.map(layout => {
          const isSelected = selectedLayout === layout.key;
          const isHovered = hoveredLayout === layout.key;

          return (
            <div
              key={layout.key}
              style={{
                ...styles.layoutCard,
                ...(isSelected ? styles.layoutCardSelected : {}),
                ...(isHovered && !isSelected ? styles.layoutCardHover : {})
              }}
              onClick={() => onLayoutSelect(layout.key)}
              onMouseEnter={() => setHoveredLayout(layout.key)}
              onMouseLeave={() => setHoveredLayout(null)}
            >
              <div style={styles.layoutName}>{layout.name}</div>

              {!compact && (
                <div style={styles.layoutDescription}>
                  {layout.description}
                </div>
              )}

              {layout.emphasis && layout.emphasis.length > 0 && (
                <div style={styles.layoutEmphasis}>
                  {layout.emphasis.slice(0, 3).map((emp, i) => (
                    <span key={i} style={styles.emphasisTag}>{emp}</span>
                  ))}
                </div>
              )}

              {showSectionPreview && isSelected && layout.sectionOrder && (
                <div style={styles.sectionPreview}>
                  <div style={styles.sectionPreviewTitle}>Section Order</div>
                  <div style={styles.sectionList}>
                    {layout.sectionOrder.slice(0, 6).map((section, i) => (
                      <span key={i} style={styles.sectionItem}>
                        {i + 1}. {section}
                      </span>
                    ))}
                    {layout.sectionOrder.length > 6 && (
                      <span style={{ ...styles.sectionItem, opacity: 0.5 }}>
                        +{layout.sectionOrder.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LayoutSelector;
