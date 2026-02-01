import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) { navigate('/dashboard'); }
      else { setError(result.error || 'Registration failed'); }
    } catch (err) { setError('Registration failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <UserPlus size={32} color="#8B4513" />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Cristy's Cake Shop today</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}><User size={18} style={styles.inputIcon} /><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={styles.input} required /></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}><Mail size={18} style={styles.inputIcon} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={styles.input} required /></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}><Lock size={18} style={styles.inputIcon} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required /><button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}><Lock size={18} style={styles.inputIcon} /><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={styles.input} required /></div>
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating Account...' : 'Create Account'}</button>
        </form>
        <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '#f0f0f0' },
  card: { width: '100%', maxWidth: '420px', background: '#e5e5e5', borderRadius: '8px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1f2937', marginTop: '16px', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#1f2937', opacity: 0.7 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#1f2937' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9ca3af' },
  input: { width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', outline: 'none' },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  submitBtn: { padding: '14px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#1f2937', opacity: 0.7 },
  link: { color: '#8B4513', fontWeight: '500' }
};
