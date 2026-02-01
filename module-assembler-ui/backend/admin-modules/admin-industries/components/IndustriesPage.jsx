/**
 * Industries Page
 * Manage industry templates and configurations
 */
import React, { useState } from 'react';
import { Building2, Plus, Edit, Settings, Eye, BarChart3 } from 'lucide-react';

export default function IndustriesPage() {
  const [industries] = useState([
    { id: 1, name: 'Restaurant', key: 'restaurant', templates: 5, generations: 234, icon: '🍽️', active: true },
    { id: 2, name: 'Fitness', key: 'fitness', templates: 4, generations: 156, icon: '💪', active: true },
    { id: 3, name: 'Healthcare', key: 'healthcare', templates: 3, generations: 89, icon: '🏥', active: true },
    { id: 4, name: 'Law Firm', key: 'law-firm', templates: 3, generations: 67, icon: '⚖️', active: true },
    { id: 5, name: 'Real Estate', key: 'real-estate', templates: 4, generations: 112, icon: '🏠', active: true },
    { id: 6, name: 'Consulting', key: 'consulting', templates: 2, generations: 45, icon: '💼', active: false },
  ]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Industries</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage industry templates and settings</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#6366f1', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
        }}>
          <Plus size={18} /> Add Industry
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {industries.map((industry) => (
          <div key={industry.id} style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
            padding: '20px', opacity: industry.active ? 1 : 0.6
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                }}>
                  {industry.icon}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '16px' }}>{industry.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{industry.key}</div>
                </div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                background: industry.active ? '#dcfce7' : '#f1f5f9',
                color: industry.active ? '#16a34a' : '#64748b'
              }}>
                {industry.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>{industry.templates}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Templates</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>{industry.generations}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Generations</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px',
                cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <Edit size={14} /> Edit
              </button>
              <button style={{
                padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px',
                cursor: 'pointer', color: '#475569'
              }}>
                <Settings size={14} />
              </button>
              <button style={{
                padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px',
                cursor: 'pointer', color: '#475569'
              }}>
                <BarChart3 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
