import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ExternalLink } from 'lucide-react';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="screen-header">
        <h1 className="screen-title">PlanoPizza</h1>
        <p className="screen-subtitle">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ef4444',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo Account Quick Login */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '12px'
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Demo Login
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { setEmail('demo@demo.com'); setPassword('demo1234'); }}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            👤 Customer
          </button>
          <button
            type="button"
            onClick={() => { setEmail('admin@demo.com'); setPassword('admin1234'); }}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '8px',
              color: '#eab308',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            👑 Admin
          </button>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '12px' }}>
          Don't have an account?
        </p>
        <a
          href="https://planopizza.be1st.io/register"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Create Account on Website <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
