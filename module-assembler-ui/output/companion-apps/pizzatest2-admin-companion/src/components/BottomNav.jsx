import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gift, User } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
        <span className="nav-label">Home</span>
      </NavLink>
      <NavLink to="/loyalty" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Gift size={24} />
        <span className="nav-label">Rewards</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  );
}
