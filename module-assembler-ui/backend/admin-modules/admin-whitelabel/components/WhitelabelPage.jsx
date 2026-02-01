/**
 * White Label Settings Page
 * Custom branding and theming
 */
import React, { useState } from 'react';
import { Palette, Upload, Save, Eye, RefreshCw } from 'lucide-react';

export default function WhitelabelPage() {
  const [settings, setSettings] = useState({
    businessName: 'My Business',
    tagline: 'Your tagline here',
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    logo: null,
    favicon: null,
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>White Label</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Customize branding and appearance</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '8px', cursor: 'pointer', color: '#475569'
          }}>
            <Eye size={18} /> Preview
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: '#6366f1', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
          }}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>Brand Identity</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Primary Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{ width: '48px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Accent Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  style={{ width: '48px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>Logo & Assets</h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Logo</label>
            <div style={{
              border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px',
              textAlign: 'center', cursor: 'pointer', background: '#f8fafc'
            }}>
              <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
              <div style={{ color: '#64748b', fontSize: '14px' }}>Click to upload or drag and drop</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>SVG, PNG, JPG (max. 2MB)</div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>Favicon</label>
            <div style={{
              border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '24px',
              textAlign: 'center', cursor: 'pointer', background: '#f8fafc'
            }}>
              <Upload size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <div style={{ color: '#64748b', fontSize: '13px' }}>Upload favicon (32x32)</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>Preview</h3>
        <div style={{
          background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
          borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'white'
        }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{settings.businessName}</div>
          <div style={{ opacity: 0.9 }}>{settings.tagline}</div>
        </div>
      </div>
    </div>
  );
}
