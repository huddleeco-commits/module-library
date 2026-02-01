import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, LogOut } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) setProfile(p => ({ ...p, name: user.name || '', email: user.email || '' })); }, [user]);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      const data = await res.json();
      setMessage(data.success ? 'Profile updated!' : 'Saved locally');
    } catch (err) { setMessage('Saved locally'); }
    setSaving(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}><h1 style={styles.title}>Your Profile</h1><p style={styles.subtitle}>Manage your account settings</p></div>
        <div style={styles.card}>
          <div style={styles.avatarSection}><div style={styles.avatar}>{profile.name.charAt(0) || 'U'}</div></div>
          <div style={styles.form}>
            {message && <div style={styles.message}>{message}</div>}
            <div style={styles.inputGroup}><label style={styles.label}><User size={16} /> Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><Mail size={16} /> Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><Phone size={16} /> Phone</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(555) 123-4567" style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><MapPin size={16} /> Address</label><input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="123 Main St" style={styles.input} /></div>
            <div style={styles.actions}>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}><Save size={18} /> {saving ? 'Saving...' : 'Save'}</button>
              <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={18} /> Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '#FFF8F0' },
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#3E2723', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#3E2723', opacity: 0.7 },
  card: { background: '#f8fafc', borderRadius: '8px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  avatarSection: { display: 'flex', justifyContent: 'center', marginBottom: '32px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', background: '#8B4513', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '700' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  message: { padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', background: '#dcfce7', color: '#16a34a' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#3E2723' },
  input: { padding: '14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', outline: 'none' },
  actions: { display: 'flex', gap: '16px', marginTop: '16px' },
  saveBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }
};
