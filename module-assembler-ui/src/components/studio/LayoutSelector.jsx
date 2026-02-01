/**
 * Layout Selector Component
 * Visual layout previews with selection
 */

import React from 'react';
import { LAYOUT_CONFIGS } from '../../constants/layout-configs';

// Visual preview representations for each layout style
const LAYOUT_VISUALS = {
  // Hero styles
  fullscreen: (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 2, backgroundColor: 'currentColor', opacity: 0.8 }} />
      <div style={{ flex: 1, padding: '8px', display: 'flex', gap: '4px' }}>
        <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
      </div>
    </div>
  ),
  split: (
    <div style={{ height: '100%', display: 'flex', gap: '4px', padding: '4px' }}>
      <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.3, borderRadius: '4px' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.6, borderRadius: '4px' }} />
        <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '4px' }} />
      </div>
    </div>
  ),
  centered: (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px', gap: '8px' }}>
      <div style={{ height: '40%', backgroundColor: 'currentColor', opacity: 0.7, borderRadius: '4px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', flex: 1 }}>
        <div style={{ backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
      </div>
    </div>
  ),
  bold: (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 2, backgroundColor: 'currentColor', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '60%', height: '30%', backgroundColor: 'white', opacity: 0.3, borderRadius: '4px' }} />
      </div>
      <div style={{ flex: 1, padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div style={{ backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
      </div>
    </div>
  ),
  elegant: (
    <div style={{ height: '100%', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ height: '8px', width: '40%', backgroundColor: 'currentColor', opacity: 0.3, margin: '0 auto' }} />
      <div style={{ flex: 1, backgroundColor: 'currentColor', opacity: 0.15, borderRadius: '4px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, height: '30px', backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
        <div style={{ flex: 1, height: '30px', backgroundColor: 'currentColor', opacity: 0.2, borderRadius: '2px' }} />
      </div>
    </div>
  ),
  modern: (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ flex: 2, background: `linear-gradient(135deg, currentColor 0%, transparent 100%)`, opacity: 0.7 }} />
      <div style={{ flex: 1, padding: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px' }}>
        <div style={{ backgroundColor: 'currentColor', opacity: 0.15, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.15, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.15, borderRadius: '2px' }} />
        <div style={{ backgroundColor: 'currentColor', opacity: 0.15, borderRadius: '2px' }} />
      </div>
    </div>
  )
};

// Map layout preview styles to visual components
function getLayoutVisual(layoutId, preview) {
  if (preview?.heroStyle === 'fullscreen' || preview?.heroStyle === 'fullscreen-image') return LAYOUT_VISUALS.fullscreen;
  if (preview?.heroStyle === 'split') return LAYOUT_VISUALS.split;
  if (preview?.heroStyle === 'bold' || preview?.heroStyle === 'bold-gradient' || preview?.heroStyle === 'action') return LAYOUT_VISUALS.bold;
  if (preview?.heroStyle === 'ambient' || preview?.heroStyle === 'professional' || preview?.heroStyle === 'majestic') return LAYOUT_VISUALS.elegant;
  if (preview?.heroStyle === 'product' || preview?.heroStyle === 'modern' || preview?.heroStyle === 'engaging') return LAYOUT_VISUALS.modern;
  return LAYOUT_VISUALS.centered;
}

export default function LayoutSelector({ industry, selected, onSelect }) {
  const layouts = LAYOUT_CONFIGS[industry] || {};

  if (Object.keys(layouts).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
        No layouts available for this industry yet.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {Object.entries(layouts).map(([key, layout]) => (
        <div
          key={key}
          onClick={() => onSelect(key)}
          style={{
            backgroundColor: selected === key ? '#EEF2FF' : 'white',
            border: selected === key ? '2px solid #6366F1' : '2px solid #E2E8F0',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: selected === key ? 'scale(1.02)' : 'scale(1)'
          }}
        >
          {/* Visual Preview */}
          <div style={{
            height: '180px',
            backgroundColor: '#F8FAFC',
            color: '#6366F1',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {getLayoutVisual(key, layout.preview)}

            {/* Selected Overlay */}
            {selected === key && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                backgroundColor: '#6366F1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px'
              }}>
                ✓
              </div>
            )}
          </div>

          {/* Layout Info */}
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '8px',
              color: selected === key ? '#6366F1' : '#1E293B'
            }}>
              {layout.name}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.5
            }}>
              {layout.description}
            </p>

            {/* Preview Tags */}
            {layout.preview && (
              <div style={{
                display: 'flex',
                gap: '6px',
                marginTop: '12px',
                flexWrap: 'wrap'
              }}>
                {layout.preview.typography && (
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#64748B'
                  }}>
                    {layout.preview.typography}
                  </span>
                )}
                {layout.preview.spacing && (
                  <span style={{
                    padding: '4px 8px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#64748B'
                  }}>
                    {layout.preview.spacing}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
