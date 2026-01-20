import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Book, Gift, Phone, LayoutDashboard, Star } from 'lucide-react';
import { BUSINESS_NAME } from '../data/menu';

export function HomeScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { icon: <LayoutDashboard size={28} />, label: 'Dashboard', route: '/dashboard', color: '#8b5cf6' },
    { icon: <Gift size={28} />, label: 'Rewards', route: '/rewards', color: '#10b981' },
    { icon: <Star size={28} />, label: 'Profile', route: '/profile', color: '#8b5cf6' },
    { icon: <Star size={28} />, label: 'Notifications', route: '/notifications', color: '#10b981' }
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Welcome to {BUSINESS_NAME}</h1>
        <p className="screen-subtitle">{user?.name || 'Guest'}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{user?.points?.toLocaleString() || 0}</div>
          <div className="stat-label">Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user?.tier || 'Bronze'}</div>
          <div className="stat-label">Tier</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user?.visits || 0}</div>
          <div className="stat-label">Visits</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Quick Actions</h3>
      <div className="quick-actions-grid">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="card"
            onClick={() => navigate(action.route)}
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
            <div style={{ color: action.color, marginBottom: '8px' }}>{action.icon}</div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
