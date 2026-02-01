/**
 * StudioPage - Unified Generation Interface
 *
 * Three tabs:
 * 1. GENERATE - Create new sites (Single, Batch, AI Picks modes)
 * 2. MY SITES - View/manage all generated sites with metrics
 * 3. SETTINGS - Presets, defaults, preferences
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

// Tab components (will be built out)
import GenerateTab from '../components/studio/GenerateTab';
import MySitesTab from '../components/studio/MySitesTab';
import SettingsTab from '../components/studio/SettingsTab';

const TAB_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)'
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)'
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tabActive: {
    background: 'rgba(139, 92, 246, 0.2)',
    color: '#fff'
  },
  tabIcon: {
    fontSize: '16px'
  },
  tabBadge: {
    fontSize: '10px',
    background: 'rgba(139, 92, 246, 0.3)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#a78bfa'
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px'
  }
};

const TABS = [
  { id: 'generate', label: 'Generate', icon: '🚀' },
  { id: 'my-sites', label: 'My Sites', icon: '📁' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [siteCount, setSiteCount] = useState(0);

  // Load site count for badge
  useEffect(() => {
    const loadSiteCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/studio/sites`);
        const data = await response.json();
        if (data.success && data.sites) {
          setSiteCount(data.sites.length);
        }
      } catch (err) {
        console.warn('Could not load site count:', err);
      }
    };
    loadSiteCount();
  }, [activeTab]); // Refresh when tab changes

  const renderTab = () => {
    switch (activeTab) {
      case 'generate':
        return <GenerateTab onSiteGenerated={() => setSiteCount(prev => prev + 1)} />;
      case 'my-sites':
        return <MySitesTab onSiteDeleted={() => setSiteCount(prev => Math.max(0, prev - 1))} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <GenerateTab />;
    }
  };

  return (
    <div style={TAB_STYLES.container}>
      {/* Tab Bar */}
      <div style={TAB_STYLES.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...TAB_STYLES.tab,
              ...(activeTab === tab.id ? TAB_STYLES.tabActive : {})
            }}
          >
            <span style={TAB_STYLES.tabIcon}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.id === 'my-sites' && siteCount > 0 && (
              <span style={TAB_STYLES.tabBadge}>{siteCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={TAB_STYLES.content}>
        {renderTab()}
      </div>
    </div>
  );
}
