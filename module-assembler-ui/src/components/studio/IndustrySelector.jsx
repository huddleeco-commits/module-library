/**
 * Industry Selector Component
 * Visual grid of industry options
 */

import React from 'react';
import { INDUSTRY_LABELS } from '../../constants/layout-configs';

const INDUSTRIES = [
  { id: 'fitness', icon: '💪', label: 'Fitness & Gym', desc: 'Gyms, yoga studios, fitness centers' },
  { id: 'restaurant', icon: '🍽️', label: 'Restaurant & Cafe', desc: 'Restaurants, cafes, bars, bakeries' },
  { id: 'salon', icon: '💇', label: 'Salon & Spa', desc: 'Hair salons, spas, barbershops' },
  { id: 'professional', icon: '💼', label: 'Professional Services', desc: 'Law firms, real estate, contractors' },
  { id: 'tech', icon: '💻', label: 'Tech & SaaS', desc: 'Software, apps, online services' },
  { id: 'education', icon: '🎓', label: 'Education', desc: 'Schools, courses, tutoring' },
  { id: 'healthcare', icon: '🏥', label: 'Healthcare', desc: 'Medical practices, clinics, wellness' }
];

export default function IndustrySelector({ selected, onSelect }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {INDUSTRIES.map(industry => (
        <button
          key={industry.id}
          onClick={() => onSelect(industry.id)}
          style={{
            padding: '28px',
            backgroundColor: selected === industry.id ? '#EEF2FF' : 'white',
            border: selected === industry.id ? '2px solid #6366F1' : '2px solid #E2E8F0',
            borderRadius: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            transform: selected === industry.id ? 'scale(1.02)' : 'scale(1)',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>
            {industry.icon}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: selected === industry.id ? '#6366F1' : '#1E293B'
          }}>
            {industry.label}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748B',
            margin: 0
          }}>
            {industry.desc}
          </p>

          {selected === industry.id && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}>
              ✓
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
