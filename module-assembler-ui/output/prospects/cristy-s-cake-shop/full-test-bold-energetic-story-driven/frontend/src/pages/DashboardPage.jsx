import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Clock, Star, ShoppingBag, Award, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ visits: 3, orders: 2, points: 150 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/dashboard`);
        const data = await res.json();
        if (data.success && data.stats) setStats(data.stats);
      } catch (err) { console.log('Using default stats'); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (<div style={styles.loadingPage}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color="#8B4513" /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.welcomeCard}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          <div><h1 style={styles.welcomeTitle}>Welcome back, {user?.name || 'Guest'}!</h1><p style={styles.welcomeText}>Here's what's happening with your account</p></div>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><Calendar size={24} color="#8B4513" /><div style={styles.statValue}>{stats.visits}</div><div style={styles.statLabel}>Total Visits</div></div>
          <div style={styles.statCard}><ShoppingBag size={24} color="#8B4513" /><div style={styles.statValue}>{stats.orders}</div><div style={styles.statLabel}>Orders</div></div>
          <div style={styles.statCard}><Award size={24} color="#8B4513" /><div style={styles.statValue}>{stats.points}</div><div style={styles.statLabel}>Reward Points</div></div>
        </div>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/booking" style={styles.actionCard}><Calendar size={24} color="#8B4513" /><span>Book Appointment</span><ChevronRight size={18} color="#9ca3af" /></Link>
          <Link to="/profile" style={styles.actionCard}><User size={24} color="#8B4513" /><span>Edit Profile</span><ChevronRight size={18} color="#9ca3af" /></Link>
          <Link to="/rewards" style={styles.actionCard}><Star size={24} color="#8B4513" /><span>View Rewards</span><ChevronRight size={18} color="#9ca3af" /></Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '#f0f0f0' },
  container: { maxWidth: '900px', margin: '0 auto' },
  loadingPage: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  welcomeCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', background: '#e5e5e5', borderRadius: '8px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: '#8B4513', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' },
  welcomeTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' },
  welcomeText: { fontSize: '14px', color: '#1f2937', opacity: 0.7 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' },
  statCard: { padding: '24px', background: '#e5e5e5', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: '12px 0 4px' },
  statLabel: { fontSize: '14px', color: '#1f2937', opacity: 0.7 },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  actionCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#e5e5e5', borderRadius: '8px', textDecoration: 'none', color: '#1f2937', fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
};
