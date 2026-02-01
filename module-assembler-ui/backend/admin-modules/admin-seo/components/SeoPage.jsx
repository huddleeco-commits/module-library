/**
 * SEO Management Page
 * Search engine optimization tools and settings
 */
import React, { useState } from 'react';
import { Search, Globe, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, FileText, Image } from 'lucide-react';

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const pages = [
    { path: '/', title: 'Home', score: 92, issues: 0, status: 'good' },
    { path: '/about', title: 'About Us', score: 78, issues: 2, status: 'warning' },
    { path: '/services', title: 'Our Services', score: 85, issues: 1, status: 'good' },
    { path: '/contact', title: 'Contact', score: 65, issues: 4, status: 'poor' },
  ];

  const stats = [
    { label: 'Overall Score', value: '82', suffix: '/100', icon: TrendingUp, color: '#10b981' },
    { label: 'Indexed Pages', value: '12', icon: Globe, color: '#6366f1' },
    { label: 'Issues Found', value: '7', icon: AlertTriangle, color: '#f59e0b' },
    { label: 'Keywords Ranked', value: '34', icon: Search, color: '#ec4899' },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>SEO</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Search engine optimization and site health</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: `${stat.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {stat.value}<span style={{ fontSize: '16px', color: '#64748b' }}>{stat.suffix || ''}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          {['overview', 'pages', 'keywords', 'sitemap'].map(tab => (
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px' }}>Page Analysis</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Page</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>SEO Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Issues</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, i) => (
                <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{page.title}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{page.path}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${page.score}%`, height: '100%', background: getScoreColor(page.score), borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: '600', color: getScoreColor(page.score) }}>{page.score}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: page.issues > 0 ? '#f59e0b' : '#10b981' }}>
                    {page.issues > 0 ? `${page.issues} issues` : 'No issues'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                      background: page.status === 'good' ? '#dcfce7' : page.status === 'warning' ? '#fef3c7' : '#fee2e2',
                      color: page.status === 'good' ? '#16a34a' : page.status === 'warning' ? '#d97706' : '#dc2626'
                    }}>
                      {page.status === 'good' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                      {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
