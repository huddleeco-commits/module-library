/**
 * Generations Page
 * Track AI-generated content and sites
 */
import React, { useState } from 'react';
import { Sparkles, Globe, Clock, DollarSign, Eye, Trash2, RefreshCw } from 'lucide-react';

export default function GenerationsPage() {
  const [generations] = useState([
    { id: 1, name: 'Pizza Palace', industry: 'Restaurant', pages: 5, cost: '$0.15', status: 'completed', time: '32s', date: '2026-01-22' },
    { id: 2, name: 'Fitness Pro', industry: 'Fitness', pages: 7, cost: '$0.22', status: 'completed', time: '45s', date: '2026-01-21' },
    { id: 3, name: 'Law Office', industry: 'Law Firm', pages: 6, cost: '$0.18', status: 'completed', time: '38s', date: '2026-01-20' },
  ]);

  const stats = [
    { label: 'Total Generations', value: '156', icon: Sparkles, color: '#6366f1' },
    { label: 'Total Pages', value: '842', icon: Globe, color: '#10b981' },
    { label: 'Avg Time', value: '38s', icon: Clock, color: '#f59e0b' },
    { label: 'Total Cost', value: '$24.50', icon: DollarSign, color: '#ec4899' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Generations</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>AI-generated sites and content</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '8px', cursor: 'pointer', color: '#475569'
        }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: `${stat.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Site Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Industry</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Pages</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Time</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Cost</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {generations.map((gen) => (
              <tr key={gen.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{gen.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{gen.date}</div>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{gen.industry}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{gen.pages} pages</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{gen.time}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{gen.cost}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: '#dcfce7', color: '#16a34a'
                  }}>
                    Completed
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Eye size={16} /></button>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
