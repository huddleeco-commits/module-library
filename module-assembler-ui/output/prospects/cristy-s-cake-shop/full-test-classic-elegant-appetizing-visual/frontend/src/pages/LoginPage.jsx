import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <LogIn size={32} color="#b8860b" />
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your Cristy's Cake Shop account</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={18} style={styles.inputIcon} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={styles.input} required />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={18} style={styles.inputIcon} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footerText}>Don't have an account? <Link to="/register" style={styles.link}>Create one</Link></p>
        <p style={styles.demoText}>Demo: demo@demo.com / demo1234</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#0a0a0f' },
  card: { width: '100%', maxWidth: '420px', background: '#0f172a', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginTop: '16px', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#f1f5f9', opacity: 0.7 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#f1f5f9' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9ca3af' },
  input: { width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e5e7eb', borderRadius: '16px', fontSize: '16px', outline: 'none' },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  submitBtn: { padding: '14px', background: '#b8860b', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#f1f5f9', opacity: 0.7 },
  link: { color: '#b8860b', fontWeight: '500' },
  demoText: { textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#9ca3af' }
};
