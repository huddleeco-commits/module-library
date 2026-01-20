import React from 'react';
import { useNavigate } from 'react-router-dom';

export function QuickActionCard({ icon, label, route, color }) {
  const navigate = useNavigate();

  return (
    <button
      className="card"
      onClick={() => navigate(route)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        cursor: 'pointer',
        border: 'none',
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
    </button>
  );
}
