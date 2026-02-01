/**
 * Package Selector Component
 * Pricing-style page package selection
 */

import React from 'react';
import { PAGE_PACKAGES, PAGE_NAMES } from '../../constants/page-packages';

export default function PackageSelector({ industry, selected, onSelect }) {
  const packages = PAGE_PACKAGES[industry] || {};

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {Object.entries(packages).map(([key, pkg]) => (
        <div
          key={key}
          onClick={() => onSelect(key)}
          style={{
            padding: '32px',
            backgroundColor: selected === key ? '#EEF2FF' : 'white',
            border: pkg.recommended
              ? '2px solid #6366F1'
              : selected === key
                ? '2px solid #6366F1'
                : '2px solid #E2E8F0',
            borderRadius: '20px',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.2s',
            transform: selected === key ? 'scale(1.02)' : 'scale(1)'
          }}
        >
          {/* Recommended Badge */}
          {pkg.recommended && (
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#6366F1',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Most Popular
            </div>
          )}

          {/* Package Name */}
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#1E293B'
          }}>
            {pkg.name}
          </h3>

          {/* Price */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#6366F1'
            }}>
              {pkg.price}
            </span>
          </div>

          {/* Description */}
          <p style={{
            color: '#64748B',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {pkg.description}
          </p>

          {/* Page List */}
          <div style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '20px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#94A3B8',
              textTransform: 'uppercase',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              {pkg.pages.length} Pages Included
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {pkg.pages.map(page => (
                <li
                  key={page}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#475569'
                  }}
                >
                  <span style={{ color: '#10B981' }}>✓</span>
                  {PAGE_NAMES[page] || page}
                </li>
              ))}
            </ul>
          </div>

          {/* Select Indicator */}
          {selected === key && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#6366F1',
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              ✓ Selected
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
