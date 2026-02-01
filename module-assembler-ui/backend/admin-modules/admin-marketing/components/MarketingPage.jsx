/**
 * Marketing Page
 * Manage campaigns, promotions, and marketing tools
 */
import React, { useState } from 'react';
import { Megaphone, Plus, TrendingUp, Users, Mail, Gift, Calendar, BarChart3 } from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('campaigns');

  const campaigns = [
    { id: 1, name: 'Summer Sale 2026', type: 'Discount', status: 'active', reach: 1250, conversions: 89, startDate: '2026-01-15', endDate: '2026-02-15' },
    { id: 2, name: 'New Customer Welcome', type: 'Email', status: 'active', reach: 450, conversions: 34, startDate: '2026-01-01', endDate: '2026-12-31' },
    { id: 3, name: 'Flash Sale', type: 'Promotion', status: 'scheduled', reach: 0, conversions: 0, startDate: '2026-02-01', endDate: '2026-02-03' },
  ];

  const stats = [
    { label: 'Active Campaigns', value: '3', icon: Megaphone, color: '#6366f1' },
    { label: 'Total Reach', value: '1.7K', icon: Users, color: '#10b981' },
    { label: 'Conversions', value: '123', icon: TrendingUp, color: '#f59e0b' },
    { label: 'Email Opens', value: '68%', icon: Mail, color: '#ec4899' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Marketing</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage campaigns and promotions</p>
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

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          {['campaigns', 'promotions', 'email'].map(tab => (
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
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Reach</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Conversions</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1a1a2e' }}>{campaign.name}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.type}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                    background: campaign.status === 'active' ? '#dcfce7' : '#fef3c7',
                    color: campaign.status === 'active' ? '#16a34a' : '#d97706'
                  }}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.reach.toLocaleString()}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{campaign.conversions}</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{campaign.startDate} - {campaign.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
