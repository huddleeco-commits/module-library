import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings, HelpCircle, CreditCard, Bell, Shield, ChevronRight, Trophy, Calendar, MapPin, Star } from 'lucide-react';
import { BUSINESS_NAME } from '../data/menu';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Accent color from CSS variables
  const accentColor = 'var(--primary)';
  const accentGradient = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';

  return (
    <div className="screen">
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(var(--primary-rgb, 139, 92, 246), 0.15) 0%, transparent 100%)',
        margin: '-20px -20px 0',
        padding: '30px 20px 40px',
        textAlign: 'center'
      }}>
        {/* Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: accentGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '3px solid rgba(var(--primary-rgb, 139, 92, 246), 0.3)',
          fontSize: '36px',
          fontWeight: '700',
          color: 'white',
          textTransform: 'uppercase'
        }}>
          {user?.name?.charAt(0) || 'G'}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{user?.name || 'Guest'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>{user?.email}</p>

        {/* Member Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(var(--primary-rgb, 139, 92, 246), 0.2)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(var(--primary-rgb, 139, 92, 246), 0.3)'
        }}>
          <Trophy size={14} color={accentColor} />
          <span style={{ color: accentColor, fontSize: '13px', fontWeight: '600' }}>{user?.tier || 'Gold'} Member</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '20px 0' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>{user?.points?.toLocaleString() || '2,500'}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>POINTS</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>{user?.visits || 12}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>VISITS</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: accentColor }}>$1,240</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>SAVED</div>
        </div>
      </div>

      {/* Member Info */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.5px' }}>MEMBER DETAILS</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Calendar size={18} color="rgba(255,255,255,0.4)" />
            <div>
              <div style={{ fontSize: '14px' }}>Member Since</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>January 2024</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={18} color="rgba(255,255,255,0.4)" />
            <div>
              <div style={{ fontSize: '14px' }}>Favorite Location</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{BUSINESS_NAME}</div>
            </div>
          </div>
        </div>

        {/* Favorite Item */}
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={18} color={accentColor} fill={accentColor} />
            <div>
              <div style={{ fontSize: '14px' }}>Favorite Order</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>House Special</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <MenuItem icon={<CreditCard size={20} />} label="Payment Methods" chevron />
        <MenuItem icon={<Bell size={20} />} label="Notifications" chevron />
        <MenuItem icon={<Shield size={20} />} label="Privacy & Security" chevron />
      </div>

      {/* Support */}
      <div className="card" style={{ padding: '0', marginBottom: '16px' }}>
        <MenuItem icon={<Settings size={20} />} label="App Settings" chevron />
        <MenuItem icon={<HelpCircle size={20} />} label="Help & Support" chevron />
      </div>

      {/* Sign Out */}
      <div className="card" style={{ padding: '0', marginBottom: '24px' }}>
        <MenuItem
          icon={<LogOut size={20} />}
          label="Sign Out"
          onClick={handleLogout}
          danger
        />
      </div>

      {/* App Version */}
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
        {BUSINESS_NAME} App v1.0.0
      </p>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger, chevron }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        color: danger ? '#ef4444' : 'rgba(255,255,255,0.8)',
        fontSize: '15px',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ color: danger ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {chevron && <ChevronRight size={18} color="rgba(255,255,255,0.3)" />}
    </button>
  );
}
