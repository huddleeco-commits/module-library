import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, User, ChevronDown, LogOut, LayoutDashboard, UserCircle, Settings, Gift } from 'lucide-react';
import { useAuth } from './AuthContext';

const NAV_LINKS = [
      { path: '/', label: 'Home' },
      { path: '/menu', label: 'Menu' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
      { path: '/gallery', label: 'Gallery' },
      { path: '/order', label: 'Order' }
    ];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isTestMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>Cristy's Cake Shop</Link>

        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '#8B4513' : '#3E2723'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.rightSection}>
          <a href="tel:2145132253" style={styles.phone}><Phone size={16} /> (214) 513-2253</a>

          <div style={styles.userSection} ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.userBtn}>
                  <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
                  <span style={styles.userName}>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={16} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdown}>
                    {isTestMode && <div style={styles.testBadge}>Test Mode</div>}
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownName}>{user?.name}</div>
                      <div style={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <UserCircle size={16} /> Profile
                    </Link>
                    <Link to="/account" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Settings size={16} /> Account Settings
                    </Link>
                    <Link to="/rewards" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Gift size={16} /> Rewards
                    </Link>
                    <div style={styles.dropdownDivider} />
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.authBtns}>
                <Link to="/login" style={styles.signInBtn}>Sign In</Link>
                <Link to="/register" style={styles.signUpBtn}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#8B4513', textDecoration: 'none', whiteSpace: 'nowrap' },
  links: { display: 'flex', gap: '28px', flex: 1, justifyContent: 'center' },
  link: { fontSize: '15px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '#3E2723', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  userSection: { position: 'relative' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#8B4513', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' },
  userName: { fontWeight: '500', color: '#3E2723', fontSize: '14px' },
  dropdown: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: '220px', overflow: 'hidden', zIndex: 1000 },
  testBadge: { background: '#fef3c7', color: '#92400e', padding: '6px 12px', fontSize: '11px', fontWeight: '600', textAlign: 'center' },
  dropdownHeader: { padding: '16px' },
  dropdownName: { fontWeight: '600', color: '#3E2723', marginBottom: '2px' },
  dropdownEmail: { fontSize: '13px', color: '#6b7280' },
  dropdownDivider: { height: '1px', background: '#e5e7eb' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#3E2723', textDecoration: 'none', fontSize: '14px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '14px', textAlign: 'left' },
  authBtns: { display: 'flex', gap: '8px' },
  signInBtn: { padding: '8px 16px', color: '#8B4513', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  signUpBtn: { padding: '8px 16px', background: '#8B4513', color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '14px', borderRadius: '8px' }
};
