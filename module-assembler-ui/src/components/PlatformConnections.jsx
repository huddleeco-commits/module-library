import React, { useState, useEffect } from 'react';
import {
  Link2, Unlink, RefreshCw, Check, X, AlertCircle,
  Twitter, Linkedin, Instagram, Facebook, FileText, Mail,
  Settings, Eye, EyeOff, ExternalLink, Loader2, Send
} from 'lucide-react';

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  platformCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s'
  },
  platformCardConnected: {
    borderColor: '#22c55e',
    background: '#f0fdf4'
  },
  platformHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  platformIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  platformInfo: {
    flex: 1
  },
  platformName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  platformStatus: {
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px'
  },
  statusConnected: {
    color: '#16a34a'
  },
  statusDisconnected: {
    color: '#64748b'
  },
  platformActions: {
    display: 'flex',
    gap: '8px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    background: '#6366f1',
    color: '#fff'
  },
  buttonSecondary: {
    background: '#f1f5f9',
    color: '#64748b'
  },
  buttonDanger: {
    background: '#fee2e2',
    color: '#dc2626'
  },
  buttonSuccess: {
    background: '#dcfce7',
    color: '#16a34a'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  closeButton: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#64748b'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  inputWithIcon: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#64748b'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    cursor: 'pointer'
  },
  error: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  success: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  divider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '20px 0'
  },
  connectedInfo: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '8px'
  },
  testSection: {
    marginTop: '16px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  testTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: '8px'
  }
};

const PLATFORM_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  blog: FileText,
  email: Mail
};

const PLATFORM_COLORS = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  blog: '#6366f1',
  email: '#8b5cf6'
};

const SOCIAL_PLATFORMS = ['twitter', 'linkedin', 'facebook', 'instagram'];

export default function PlatformConnections({
  apiBaseUrl = '',
  onConnectionChange = null
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connections, setConnections] = useState(null);
  const [showModal, setShowModal] = useState(null); // 'twitter' | 'email' | 'blog' | null
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [oauthForm, setOauthForm] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/oauth/callback'
  });

  const [emailForm, setEmailForm] = useState({
    provider: 'sendgrid',
    apiKey: '',
    fromEmail: '',
    fromName: ''
  });

  const [blogForm, setBlogForm] = useState({
    provider: 'wordpress',
    siteUrl: '',
    apiKey: '',
    webhookUrl: ''
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connections`);
      const data = await res.json();
      if (data.success) {
        setConnections(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const startOAuthFlow = async (platform) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connect/${platform}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oauthForm)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Store state for callback verification
      localStorage.setItem('oauth_state', data.state);
      localStorage.setItem('oauth_platform', platform);

      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connect/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSuccess('Email provider connected successfully!');
      setShowModal(null);
      fetchConnections();

      if (onConnectionChange) {
        onConnectionChange('email', true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectBlog = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connect/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogForm)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSuccess('Blog provider connected successfully!');
      setShowModal(null);
      fetchConnections();

      if (onConnectionChange) {
        onConnectionChange('blog', true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connect/${platform}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSuccess(`${platform} disconnected successfully!`);
      fetchConnections();

      if (onConnectionChange) {
        onConnectionChange(platform, false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (platform) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connect/${platform}/test`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setSuccess(`${platform} connection is working!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSocialPlatformCard = (platform, status) => {
    const Icon = PLATFORM_ICONS[platform];
    const color = PLATFORM_COLORS[platform];
    const isConnected = status?.connected;

    return (
      <div
        key={platform}
        style={{
          ...styles.platformCard,
          ...(isConnected ? styles.platformCardConnected : {})
        }}
      >
        <div style={styles.platformHeader}>
          <div style={{ ...styles.platformIcon, background: `${color}20` }}>
            <Icon size={24} color={color} />
          </div>
          <div style={styles.platformInfo}>
            <div style={styles.platformName}>{status?.name || platform}</div>
            <div
              style={{
                ...styles.platformStatus,
                ...(isConnected ? styles.statusConnected : styles.statusDisconnected)
              }}
            >
              {isConnected ? (
                <>
                  <Check size={14} />
                  Connected
                </>
              ) : (
                <>
                  <Unlink size={14} />
                  Not connected
                </>
              )}
            </div>
          </div>
        </div>

        {isConnected && status.connectedAt && (
          <div style={styles.connectedInfo}>
            Connected since {new Date(status.connectedAt).toLocaleDateString()}
          </div>
        )}

        <div style={styles.platformActions}>
          {isConnected ? (
            <>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => testConnection(platform)}
                disabled={loading}
              >
                <RefreshCw size={14} />
                Test
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonDanger }}
                onClick={() => disconnectPlatform(platform)}
                disabled={loading}
              >
                <Unlink size={14} />
                Disconnect
              </button>
            </>
          ) : (
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={() => setShowModal(platform)}
              disabled={loading}
            >
              <Link2 size={14} />
              Connect
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderOAuthModal = () => {
    const platform = showModal;
    const Icon = PLATFORM_ICONS[platform];
    const color = PLATFORM_COLORS[platform];

    return (
      <div style={styles.modal} onClick={() => setShowModal(null)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>
              <Icon size={24} color={color} />
              Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </h3>
            <button style={styles.closeButton} onClick={() => setShowModal(null)}>
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Enter your OAuth credentials to connect your {platform} account.
            You can get these from the {platform} Developer Portal.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); startOAuthFlow(platform); }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Client ID *</label>
              <input
                type="text"
                style={styles.input}
                value={oauthForm.clientId}
                onChange={(e) => setOauthForm(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="Enter your OAuth Client ID"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Client Secret</label>
              <div style={styles.inputWithIcon}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={styles.input}
                  value={oauthForm.clientSecret}
                  onChange={(e) => setOauthForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="Enter your OAuth Client Secret"
                />
                <span
                  style={styles.inputIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
              <div style={styles.hint}>Some platforms require a client secret</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Redirect URI</label>
              <input
                type="text"
                style={styles.input}
                value={oauthForm.redirectUri}
                onChange={(e) => setOauthForm(prev => ({ ...prev, redirectUri: e.target.value }))}
              />
              <div style={styles.hint}>Add this URL to your OAuth app's allowed redirect URIs</div>
            </div>

            <button
              type="submit"
              style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <ExternalLink size={16} />
                  Continue to {platform}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderEmailModal = () => (
    <div style={styles.modal} onClick={() => setShowModal(null)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            <Mail size={24} color={PLATFORM_COLORS.email} />
            Connect Email Provider
          </h3>
          <button style={styles.closeButton} onClick={() => setShowModal(null)}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={connectEmail}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Provider *</label>
            <select
              style={styles.select}
              value={emailForm.provider}
              onChange={(e) => setEmailForm(prev => ({ ...prev, provider: e.target.value }))}
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="ses">Amazon SES</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>API Key *</label>
            <div style={styles.inputWithIcon}>
              <input
                type={showPassword ? 'text' : 'password'}
                style={styles.input}
                value={emailForm.apiKey}
                onChange={(e) => setEmailForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                required
              />
              <span
                style={styles.inputIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>From Email *</label>
            <input
              type="email"
              style={styles.input}
              value={emailForm.fromEmail}
              onChange={(e) => setEmailForm(prev => ({ ...prev, fromEmail: e.target.value }))}
              placeholder="noreply@yourcompany.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>From Name</label>
            <input
              type="text"
              style={styles.input}
              value={emailForm.fromName}
              onChange={(e) => setEmailForm(prev => ({ ...prev, fromName: e.target.value }))}
              placeholder="Your Company Name"
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Connect Email Provider
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  const renderBlogModal = () => (
    <div style={styles.modal} onClick={() => setShowModal(null)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            <FileText size={24} color={PLATFORM_COLORS.blog} />
            Connect Blog Platform
          </h3>
          <button style={styles.closeButton} onClick={() => setShowModal(null)}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={connectBlog}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Blog Provider *</label>
            <select
              style={styles.select}
              value={blogForm.provider}
              onChange={(e) => setBlogForm(prev => ({ ...prev, provider: e.target.value }))}
            >
              <option value="wordpress">WordPress</option>
              <option value="ghost">Ghost</option>
              <option value="webflow">Webflow</option>
              <option value="custom">Custom Webhook</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Site URL *</label>
            <input
              type="url"
              style={styles.input}
              value={blogForm.siteUrl}
              onChange={(e) => setBlogForm(prev => ({ ...prev, siteUrl: e.target.value }))}
              placeholder="https://yourblog.com"
              required
            />
          </div>

          {blogForm.provider === 'custom' ? (
            <div style={styles.formGroup}>
              <label style={styles.label}>Webhook URL *</label>
              <input
                type="url"
                style={styles.input}
                value={blogForm.webhookUrl}
                onChange={(e) => setBlogForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://yourblog.com/api/publish"
                required
              />
            </div>
          ) : (
            <div style={styles.formGroup}>
              <label style={styles.label}>API Key / Token *</label>
              <div style={styles.inputWithIcon}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={styles.input}
                  value={blogForm.apiKey}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key or token"
                  required
                />
                <span
                  style={styles.inputIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            style={{ ...styles.button, ...styles.buttonPrimary, width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Connect Blog
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>
          <Settings size={32} color="#6366f1" />
          Platform Connections
        </h1>
        <p style={styles.subtitle}>
          Connect your social media accounts and publishing platforms
        </p>
      </div>

      {success && (
        <div style={styles.success}>
          <Check size={16} />
          {success}
        </div>
      )}

      {error && !showModal && (
        <div style={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Social Media Platforms */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Send size={20} />
          Social Media
        </h2>
        <div style={styles.platformGrid}>
          {SOCIAL_PLATFORMS.map(platform =>
            renderSocialPlatformCard(platform, connections?.social?.[platform])
          )}
        </div>
      </div>

      {/* Email */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Mail size={20} />
          Email Marketing
        </h2>
        <div style={styles.platformGrid}>
          <div
            style={{
              ...styles.platformCard,
              ...(connections?.email?.connected ? styles.platformCardConnected : {})
            }}
          >
            <div style={styles.platformHeader}>
              <div style={{ ...styles.platformIcon, background: `${PLATFORM_COLORS.email}20` }}>
                <Mail size={24} color={PLATFORM_COLORS.email} />
              </div>
              <div style={styles.platformInfo}>
                <div style={styles.platformName}>
                  {connections?.email?.providerName || 'Email Provider'}
                </div>
                <div
                  style={{
                    ...styles.platformStatus,
                    ...(connections?.email?.connected ? styles.statusConnected : styles.statusDisconnected)
                  }}
                >
                  {connections?.email?.connected ? (
                    <>
                      <Check size={14} />
                      Connected via {connections?.email?.providerName}
                    </>
                  ) : (
                    <>
                      <Unlink size={14} />
                      Not connected
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.platformActions}>
              {connections?.email?.connected ? (
                <>
                  <button
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                    onClick={() => testConnection('email')}
                    disabled={loading}
                  >
                    <RefreshCw size={14} />
                    Test
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.buttonDanger }}
                    onClick={() => disconnectPlatform('email')}
                    disabled={loading}
                  >
                    <Unlink size={14} />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setShowModal('email')}
                  disabled={loading}
                >
                  <Link2 size={14} />
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <FileText size={20} />
          Blog Publishing
        </h2>
        <div style={styles.platformGrid}>
          <div
            style={{
              ...styles.platformCard,
              ...(connections?.blog?.connected ? styles.platformCardConnected : {})
            }}
          >
            <div style={styles.platformHeader}>
              <div style={{ ...styles.platformIcon, background: `${PLATFORM_COLORS.blog}20` }}>
                <FileText size={24} color={PLATFORM_COLORS.blog} />
              </div>
              <div style={styles.platformInfo}>
                <div style={styles.platformName}>
                  {connections?.blog?.providerName || 'Blog Platform'}
                </div>
                <div
                  style={{
                    ...styles.platformStatus,
                    ...(connections?.blog?.connected ? styles.statusConnected : styles.statusDisconnected)
                  }}
                >
                  {connections?.blog?.connected ? (
                    <>
                      <Check size={14} />
                      Connected via {connections?.blog?.providerName}
                    </>
                  ) : (
                    <>
                      <Unlink size={14} />
                      Not connected
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.platformActions}>
              {connections?.blog?.connected ? (
                <>
                  <button
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                    onClick={() => testConnection('blog')}
                    disabled={loading}
                  >
                    <RefreshCw size={14} />
                    Test
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.buttonDanger }}
                    onClick={() => disconnectPlatform('blog')}
                    disabled={loading}
                  >
                    <Unlink size={14} />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={() => setShowModal('blog')}
                  disabled={loading}
                >
                  <Link2 size={14} />
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && SOCIAL_PLATFORMS.includes(showModal) && renderOAuthModal()}
      {showModal === 'email' && renderEmailModal()}
      {showModal === 'blog' && renderBlogModal()}
    </div>
  );
}
