/**
 * Email Campaigns Page
 * Manage email marketing and templates
 */
import React, { useState } from 'react';
import { Mail, Plus, Send, Eye, Edit, Trash2, Users, BarChart3, Clock } from 'lucide-react';

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState('campaigns');

  const campaigns = [
    { id: 1, name: 'Welcome Series', subject: 'Welcome to our family!', status: 'active', sent: 1250, opened: 892, clicked: 234 },
    { id: 2, name: 'Weekly Newsletter', subject: 'This Week Updates', status: 'scheduled', sent: 0, opened: 0, clicked: 0 },
    { id: 3, name: 'Abandoned Cart', subject: 'You left something behind', status: 'active', sent: 456, opened: 298, clicked: 87 },
  ];

  const stats = [
    { label: 'Total Sent', value: '12.5K', icon: Send, color: '#6366f1' },
    { label: 'Open Rate', value: '68%', icon: Eye, color: '#10b981' },
    { label: 'Click Rate', value: '24%', icon: BarChart3, color: '#f59e0b' },
    { label: 'Subscribers', value: '3.2K', icon: Users, color: '#ec4899' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Email Campaigns</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage email marketing and newsletters</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> New Campaign
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
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          {['campaigns', 'templates', 'subscribers'].map(tab => (
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

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Campaign</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Subject</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Sent</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Opened</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Clicked</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={18} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: '500', color: '#1a1a2e' }}>{campaign.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.subject}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: campaign.status === 'active' ? '#dcfce7' : '#fef3c7',
                    color: campaign.status === 'active' ? '#16a34a' : '#d97706'
                  }}>
                    {campaign.status === 'scheduled' && <Clock size={12} />}
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.sent.toLocaleString()}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.opened.toLocaleString()}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.clicked.toLocaleString()}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Eye size={16} /></button>
                  <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
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
