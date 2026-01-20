import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { QuickActionCard } from '../components/QuickActionCard';

export function HomeScreen() {
  const { user } = useAuth();

  return (
    <div className="screen">
      <div className="screen-header">
        <h1 className="screen-title">Welcome back!</h1>
        <p className="screen-subtitle">{user?.name || user?.email}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{user?.points || 0}</div>
          <div className="stat-label">Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user?.tier || 'Bronze'}</div>
          <div className="stat-label">Tier</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Quick Actions</h3>
      <div className="quick-actions-grid">
        <QuickActionCard icon="📖" label="View Menu" route="/menu" />
        <QuickActionCard icon="📅" label="Make Reservation" route="/reserve" />
        <QuickActionCard icon="⭐" label="Earn Points" route="/earn" />
        <QuickActionCard icon="🎁" label="View Rewards" route="/rewards" />
      </div>
    </div>
  );
}
