/**
 * API Management Page
 * Manage API keys and webhooks
 */
import React, { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Webhook, RefreshCw } from 'lucide-react';

export default function ApiPage() {
  const [showKey, setShowKey] = useState({});
  const [activeTab, setActiveTab] = useState('keys');

  const apiKeys = [
    { id: 1, name: 'Production Key', key: 'sk_live_abc123...xyz789', created: '2026-01-15', lastUsed: '2 min ago', status: 'active' },
    { id: 2, name: 'Development Key', key: 'sk_test_def456...uvw012', created: '2026-01-10', lastUsed: '1 day ago', status: 'active' },
  ];

  const webhooks = [
    { id: 1, url: 'https://example.com/webhooks/orders', events: ['order.created', 'order.updated'], status: 'active' },
    { id: 2, url: 'https://example.com/webhooks/customers', events: ['customer.created'], status: 'active' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>API</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage API keys and webhooks</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> {activeTab === 'keys' ? 'Create Key' : 'Add Webhook'}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          {['keys', 'webhooks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: '500', fontSize: '14px',
                color: activeTab === tab ? '#6366f1' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              {tab === 'keys' ? 'API Keys' : 'Webhooks'}
            </button>
          ))}
        </div>

        {activeTab === 'keys' ? (
          <div style={{ padding: '20px' }}>
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>{apiKey.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Created: {apiKey.created} • Last used: {apiKey.lastUsed}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: '#dcfce7', color: '#16a34a'
                  }}>
                    Active
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    flex: 1, padding: '10px 14px', background: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', color: '#475569'
                  }}>
                    {showKey[apiKey.id] ? apiKey.key.replace('...', 'defghijklmnopqrst') : apiKey.key}
                  </div>
                  <button
                    onClick={() => setShowKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                    style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {showKey[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button style={{ padding: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                    <Copy size={16} />
                  </button>
                  <button style={{ padding: '10px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {webhooks.map((webhook) => (
              <div key={webhook.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Webhook size={20} style={{ color: '#6366f1' }} />
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569' }}>{webhook.url}</div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: '#dcfce7', color: '#16a34a'
                  }}>
                    Active
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {webhook.events.map((event) => (
                    <span key={event} style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '4px', fontSize: '12px' }}>
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
