/**
 * Theme Selector Component
 * Color theme selection with visual previews
 */

import React from 'react';
import { THEME_PRESETS, getThemesForIndustry } from '../../constants/theme-presets';

export default function ThemeSelector({ industry, selected, onSelect }) {
  // Get recommended themes for this industry first, then others
  const recommendedThemes = getThemesForIndustry(industry);
  const otherThemes = Object.values(THEME_PRESETS).filter(
    theme => !theme.industries.includes(industry)
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Recommended Themes */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          fontSize: '14px',
          color: '#64748B',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontWeight: '600'
        }}>
          ✨ Recommended for your industry
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {recommendedThemes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={selected === theme.id}
              onSelect={() => onSelect(theme.id)}
              recommended
            />
          ))}
        </div>
      </div>

      {/* Other Themes */}
      {otherThemes.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '14px',
            color: '#94A3B8',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            Other themes
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {otherThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                selected={selected === theme.id}
                onSelect={() => onSelect(theme.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme, selected, onSelect, recommended }) {
  const { colors } = theme;

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: selected ? '#EEF2FF' : 'white',
        border: selected ? '2px solid #6366F1' : '2px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.03)' : 'scale(1)'
      }}
    >
      {/* Color Preview */}
      <div style={{
        height: '80px',
        display: 'flex',
        position: 'relative'
      }}>
        {/* Primary color - main area */}
        <div style={{
          flex: 3,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Simulated UI elements */}
          <div style={{
            width: '60%',
            height: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            padding: '6px',
            gap: '4px'
          }}>
            <div style={{ height: '4px', width: '70%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '50%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Accent strip */}
        <div style={{
          width: '8px',
          backgroundColor: colors.accent
        }} />

        {/* Selected indicator */}
        {selected && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '20px',
            height: '20px',
            backgroundColor: '#6366F1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px'
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Theme Info */}
      <div style={{
        padding: '12px',
        backgroundColor: colors.background
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: 0,
            color: colors.text
          }}>
            {theme.name}
          </h4>
          {recommended && (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: '4px'
            }}>
              ✓
            </span>
          )}
        </div>
        <p style={{
          fontSize: '12px',
          color: '#64748B',
          margin: 0,
          lineHeight: 1.4
        }}>
          {theme.description}
        </p>
      </div>

      {/* Color Swatches */}
      <div style={{
        display: 'flex',
        height: '24px',
        borderTop: `1px solid ${colors.background}`
      }}>
        <div style={{ flex: 1, backgroundColor: colors.primary }} title="Primary" />
        <div style={{ flex: 1, backgroundColor: colors.secondary }} title="Secondary" />
        <div style={{ flex: 1, backgroundColor: colors.accent }} title="Accent" />
        <div style={{ flex: 1, backgroundColor: colors.background, border: '1px solid #E2E8F0' }} title="Background" />
        <div style={{ flex: 1, backgroundColor: colors.text }} title="Text" />
      </div>
    </div>
  );
}
