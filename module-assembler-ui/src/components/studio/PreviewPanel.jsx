/**
 * Preview Panel Component
 * Live preview of the site being built
 */

import React, { useState } from 'react';
import { THEME_PRESETS } from '../../constants/theme-presets';

export default function PreviewPanel({ config }) {
  const [device, setDevice] = useState('desktop');
  const theme = THEME_PRESETS[config.theme] || THEME_PRESETS.professional;

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div style={{
      backgroundColor: '#1E293B',
      borderRadius: '16px',
      overflow: 'hidden',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Browser Chrome */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Window Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
        </div>

        {/* URL Bar */}
        <div style={{
          flex: 1,
          backgroundColor: '#1E293B',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#94A3B8'
        }}>
          https://{config.businessInfo?.name?.toLowerCase().replace(/\s+/g, '') || 'yoursite'}.com
        </div>

        {/* Device Toggles */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['desktop', 'tablet', 'mobile'].map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                padding: '6px 10px',
                backgroundColor: device === d ? '#6366F1' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: device === d ? 'white' : '#64748B',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {d === 'desktop' ? '🖥️' : d === 'tablet' ? '📱' : '📱'}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '20px',
        overflow: 'auto',
        backgroundColor: '#334155'
      }}>
        <div style={{
          width: deviceWidths[device],
          maxWidth: '100%',
          backgroundColor: theme.colors.background,
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          minHeight: '500px'
        }}>
          {/* Mock Header */}
          <div style={{
            padding: '16px 24px',
            backgroundColor: 'white',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontWeight: '700',
              fontSize: device === 'mobile' ? '14px' : '18px',
              color: theme.colors.primary
            }}>
              {config.businessInfo?.name || 'Your Business'}
            </span>
            {device !== 'mobile' && (
              <div style={{ display: 'flex', gap: '20px' }}>
                {config.pages?.slice(1, 4).map(page => (
                  <span key={page} style={{ fontSize: '13px', color: '#64748B' }}>
                    {page}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mock Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            padding: device === 'mobile' ? '40px 20px' : '80px 40px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h1 style={{
              fontSize: device === 'mobile' ? '24px' : '42px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              {config.businessInfo?.tagline || 'Your Amazing Tagline Here'}
            </h1>
            <p style={{
              opacity: 0.9,
              marginBottom: '24px',
              fontSize: device === 'mobile' ? '14px' : '16px'
            }}>
              Subtitle text will go here based on your business
            </p>
            <button style={{
              backgroundColor: 'white',
              color: theme.colors.primary,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </div>

          {/* Mock Content Sections */}
          <div style={{ padding: device === 'mobile' ? '30px 20px' : '60px 40px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: device === 'mobile' ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: `${theme.colors.primary}20`,
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }} />
                  <div style={{
                    height: '16px',
                    width: '80%',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }} />
                  <div style={{
                    height: '12px',
                    width: '100%',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '4px'
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
