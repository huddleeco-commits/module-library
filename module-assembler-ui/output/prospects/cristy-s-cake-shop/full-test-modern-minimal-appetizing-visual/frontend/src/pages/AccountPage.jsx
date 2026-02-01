import React from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function AccountPage() {
  const { user } = useAuth();
  const menuItems = [
    { icon: User, label: 'Edit Profile', path: '/profile', desc: 'Update your personal information' },
    { icon: CreditCard, label: 'Payment Methods', path: '#', desc: 'Manage your payment options' },
    { icon: Bell, label: 'Notifications', path: '#', desc: 'Configure your alerts' },
    { icon: Shield, label: 'Privacy & Security', path: '#', desc: 'Manage your data and security' },
    { icon: HelpCircle, label: 'Help & Support', path: '/contact', desc: 'Get help with your account' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          <h1 style={styles.name}>{user?.name || 'Guest'}</h1>
          <p style={styles.email}>{user?.email || ''}</p>
        </div>
        <div style={styles.menuList}>
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.path} style={styles.menuItem}>
              <item.icon size={22} color="#8B4513" />
              <div style={styles.menuInfo}><span style={styles.menuLabel}>{item.label}</span><span style={styles.menuDesc}>{item.desc}</span></div>
              <ChevronRight size={20} color="#9ca3af" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '#FFF8F0' },
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: '#8B4513', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', margin: '0 auto 16px' },
  name: { fontSize: '24px', fontWeight: '700', color: '#3E2723', marginBottom: '4px' },
  email: { fontSize: '14px', color: '#3E2723', opacity: 0.7 },
  menuList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  menuInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  menuLabel: { fontWeight: '600', color: '#3E2723', marginBottom: '2px' },
  menuDesc: { fontSize: '13px', color: '#3E2723', opacity: 0.6 }
};
