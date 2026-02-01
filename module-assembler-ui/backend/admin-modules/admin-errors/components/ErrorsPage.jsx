/**
 * Errors Page
 * Error tracking and debugging
 */
import React, { useState } from 'react';
import { AlertCircle, Bug, Clock, RefreshCw, ExternalLink, ChevronDown } from 'lucide-react';

export default function ErrorsPage() {
  const [errors] = useState([
    { id: 1, type: 'TypeError', message: 'Cannot read property of undefined', file: 'src/App.jsx:42', count: 23, lastSeen: '2 min ago', status: 'unresolved' },
    { id: 2, type: 'NetworkError', message: 'Failed to fetch /api/products', file: 'src/services/api.js:18', count: 8, lastSeen: '15 min ago', status: 'unresolved' },
    { id: 3, type: 'SyntaxError', message: 'Unexpected token in JSON', file: 'src/utils/parser.js:55', count: 3, lastSeen: '1 hour ago', status: 'resolved' },
  ]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Errors</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Track and debug application errors</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '8px', cursor: 'pointer', color: '#475569'
        }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{errors.filter(e => e.status === 'unresolved').length}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Unresolved</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{errors.reduce((acc, e) => acc + e.count, 0)}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Total Occurrences</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{errors.filter(e => e.status === 'resolved').length}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Resolved</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {errors.map((error) => (
          <div key={error.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                    background: '#fee2e2', color: '#dc2626', fontFamily: 'monospace'
                  }}>
                    {error.type}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{error.lastSeen}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '500',
                    background: error.status === 'unresolved' ? '#fef3c7' : '#dcfce7',
                    color: error.status === 'unresolved' ? '#d97706' : '#16a34a'
                  }}>
                    {error.status}
                  </span>
                </div>
                <div style={{ fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>{error.message}</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{error.file}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{error.count}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>occurrences</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
