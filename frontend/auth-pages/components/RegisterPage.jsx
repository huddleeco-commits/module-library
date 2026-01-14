/**
 * RegisterPage - Generic registration page with inline styles
 * Works with any BE1st generated backend
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = {
    length: password.length >= 8,
    match: password === confirmPassword && password.length > 0
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(email, password, fullName);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <UserPlus size={32} color="#22c55e" />
          </div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Start your journey with us</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.checksContainer}>
            <div style={{
              ...styles.checkItem,
              color: passwordChecks.length ? '#22c55e' : '#6b7280'
            }}>
              <Check size={14} />
              <span>At least 8 characters</span>
            </div>
            <div style={{
              ...styles.checkItem,
              color: passwordChecks.match ? '#22c55e' : '#6b7280'
            }}>
              <Check size={14} />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passwordChecks.length || !passwordChecks.match}
            style={{
              ...styles.submitButton,
              opacity: (loading || !passwordChecks.length || !passwordChecks.match) ? 0.7 : 1,
              cursor: (loading || !passwordChecks.length || !passwordChecks.match) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#111111',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid #222'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    background: 'rgba(34, 197, 94, 0.15)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#9ca3af',
    margin: 0
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e5e5e5'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#6b7280',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  eyeButton: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    background: '#22c55e',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center'
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  },
  link: {
    color: '#22c55e',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default RegisterPage;
