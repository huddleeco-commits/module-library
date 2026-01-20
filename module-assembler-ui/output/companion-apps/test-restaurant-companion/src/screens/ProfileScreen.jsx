import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Settings, HelpCircle } from 'lucide-react';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <User size={40} color="white" />
        </div>
        <h1 className="screen-title">{user?.name || 'User'}</h1>
        <p className="screen-subtitle">{user?.email}</p>
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
        <div className="stat-card">
          <div className="stat-value">{user?.visits || 0}</div>
          <div className="stat-label">Visits</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="card" style={{ marginTop: '24px' }}>
        <MenuItem icon={<Settings size={20} />} label="Settings" />
        <MenuItem icon={<HelpCircle size={20} />} label="Help & Support" />
        <MenuItem
          icon={<LogOut size={20} />}
          label="Sign Out"
          onClick={handleLogout}
          danger
        />
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px 0',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: danger ? '#ef4444' : 'rgba(255,255,255,0.8)',
        fontSize: '16px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
