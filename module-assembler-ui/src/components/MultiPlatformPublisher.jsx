import React, { useState, useEffect } from 'react';
import {
  Send, Check, X, AlertCircle, Loader2,
  Twitter, Linkedin, Instagram, Facebook, FileText, Mail,
  Clock, CheckCircle2, XCircle, RefreshCw, Eye, History
} from 'lucide-react';

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
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
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5'
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
  platformSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  platformChip: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  platformChipSelected: {
    borderColor: '#6366f1',
    background: '#f0f0ff',
    color: '#6366f1'
  },
  platformChipDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  platformChipConnected: {
    position: 'relative'
  },
  connectedDot: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#22c55e',
    border: '2px solid #fff'
  },
  overridesSection: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  overridesTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  overrideItem: {
    marginBottom: '12px'
  },
  overrideLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  overrideTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '60px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  charCount: {
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'right',
    marginTop: '4px'
  },
  charCountWarning: {
    color: '#f59e0b'
  },
  charCountError: {
    color: '#dc2626'
  },
  button: {
    padding: '14px 24px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    width: '100%'
  },
  buttonPrimary: {
    background: '#6366f1',
    color: '#fff'
  },
  buttonSecondary: {
    background: '#f1f5f9',
    color: '#64748b'
  },
  error: {
    padding: '12px 16px',
    borderRadius: '10px',
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
    borderRadius: '10px',
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  resultsCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '8px',
    background: '#f8fafc'
  },
  resultIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resultInfo: {
    flex: 1
  },
  resultPlatform: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  resultStatus: {
    fontSize: '12px',
    marginTop: '2px'
  },
  resultSuccess: {
    color: '#16a34a'
  },
  resultFailed: {
    color: '#dc2626'
  },
  resultLink: {
    fontSize: '12px',
    color: '#6366f1',
    textDecoration: 'none'
  },
  historySection: {
    marginTop: '32px'
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  historyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#fff',
    borderRadius: '12px',
    marginBottom: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b'
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

const PLATFORM_LIMITS = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206,
  blog: null,
  email: null
};

export default function MultiPlatformPublisher({
  apiBaseUrl = '',
  initialContent = '',
  onPublished = null
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState({});
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [content, setContent] = useState(initialContent);
  const [platformOverrides, setPlatformOverrides] = useState({});
  const [showOverrides, setShowOverrides] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [publishHistory, setPublishHistory] = useState([]);

  // Email-specific options
  const [emailOptions, setEmailOptions] = useState({
    subject: '',
    recipients: ''
  });

  useEffect(() => {
    fetchConnections();
    fetchPublishHistory();
  }, []);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const fetchConnections = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/connections`);
      const data = await res.json();
      if (data.success) {
        const connected = {};
        // Social platforms
        Object.entries(data.status.social || {}).forEach(([platform, status]) => {
          connected[platform] = status.connected;
        });
        // Email & Blog
        connected.email = data.status.email?.connected || false;
        connected.blog = data.status.blog?.connected || false;
        setConnections(connected);
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  const fetchPublishHistory = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/publisher/history?limit=10`);
      const data = await res.json();
      if (data.success) {
        setPublishHistory(data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const togglePlatform = (platform) => {
    if (!connections[platform]) return;

    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleOverrideChange = (platform, value) => {
    setPlatformOverrides(prev => ({
      ...prev,
      [platform]: { text: value }
    }));
  };

  const getCharCount = (platform) => {
    const text = platformOverrides[platform]?.text || content;
    return text.length;
  };

  const getCharCountStyle = (platform) => {
    const limit = PLATFORM_LIMITS[platform];
    if (!limit) return {};
    const count = getCharCount(platform);
    if (count > limit) return styles.charCountError;
    if (count > limit * 0.9) return styles.charCountWarning;
    return {};
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content to publish');
      return;
    }

    setError(null);
    setLoading(true);
    setPublishResult(null);

    try {
      const payload = {
        platforms: selectedPlatforms,
        content: {
          text: content,
          platformOverrides: Object.keys(platformOverrides).length > 0 ? platformOverrides : undefined
        },
        options: {}
      };

      // Add email options if email is selected
      if (selectedPlatforms.includes('email')) {
        if (!emailOptions.recipients.trim()) {
          throw new Error('Please enter email recipients');
        }
        payload.options.recipients = emailOptions.recipients.split(',').map(e => e.trim());
        payload.options.subject = emailOptions.subject || 'New Update';
      }

      const res = await fetch(`${apiBaseUrl}/api/publisher/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setPublishResult(data);

      if (data.successful?.length > 0) {
        fetchPublishHistory();
        if (onPublished) {
          onPublished(data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPlatformChip = (platform, name) => {
    const Icon = PLATFORM_ICONS[platform];
    const color = PLATFORM_COLORS[platform];
    const isConnected = connections[platform];
    const isSelected = selectedPlatforms.includes(platform);

    return (
      <button
        key={platform}
        style={{
          ...styles.platformChip,
          ...(isSelected ? styles.platformChipSelected : {}),
          ...(!isConnected ? styles.platformChipDisabled : {}),
          ...(isConnected ? styles.platformChipConnected : {})
        }}
        onClick={() => togglePlatform(platform)}
        disabled={!isConnected}
        title={isConnected ? `Publish to ${name}` : `${name} is not connected`}
      >
        <Icon size={18} color={isSelected ? '#6366f1' : color} />
        {name}
        {isConnected && <span style={styles.connectedDot} />}
      </button>
    );
  };

  const renderPublishResults = () => {
    if (!publishResult) return null;

    return (
      <div style={styles.resultsCard}>
        <h3 style={styles.cardTitle}>
          {publishResult.status === 'published' ? (
            <>
              <CheckCircle2 size={20} color="#16a34a" />
              Published Successfully
            </>
          ) : publishResult.status === 'partial' ? (
            <>
              <AlertCircle size={20} color="#f59e0b" />
              Partially Published
            </>
          ) : (
            <>
              <XCircle size={20} color="#dc2626" />
              Publishing Failed
            </>
          )}
        </h3>

        {Object.entries(publishResult.platforms || {}).map(([platform, result]) => {
          const Icon = PLATFORM_ICONS[platform];
          const color = PLATFORM_COLORS[platform];

          return (
            <div key={platform} style={styles.resultItem}>
              <div style={{ ...styles.resultIcon, background: `${color}20` }}>
                <Icon size={20} color={color} />
              </div>
              <div style={styles.resultInfo}>
                <div style={styles.resultPlatform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </div>
                <div
                  style={{
                    ...styles.resultStatus,
                    ...(result.success ? styles.resultSuccess : styles.resultFailed)
                  }}
                >
                  {result.success ? (
                    <>
                      <Check size={12} /> Published
                      {result.postUrl && (
                        <a
                          href={result.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.resultLink}
                        >
                          {' '}View post →
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <X size={12} /> {result.error}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
          <Send size={32} color="#6366f1" />
          Multi-Platform Publisher
        </h1>
        <p style={styles.subtitle}>
          Publish content to multiple platforms at once
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          <FileText size={20} />
          Content
        </h3>

        <div style={styles.formGroup}>
          <label style={styles.label}>Your Message</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Select Platforms</label>
          <div style={styles.platformSelector}>
            {renderPlatformChip('twitter', 'Twitter/X')}
            {renderPlatformChip('linkedin', 'LinkedIn')}
            {renderPlatformChip('facebook', 'Facebook')}
            {renderPlatformChip('instagram', 'Instagram')}
            {renderPlatformChip('blog', 'Blog')}
            {renderPlatformChip('email', 'Email')}
          </div>
        </div>

        {/* Email options */}
        {selectedPlatforms.includes('email') && (
          <div style={styles.overridesSection}>
            <div style={styles.overridesTitle}>
              <Mail size={16} />
              Email Options
            </div>
            <div style={styles.overrideItem}>
              <label style={styles.overrideLabel}>Subject Line</label>
              <input
                type="text"
                style={styles.input}
                value={emailOptions.subject}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </div>
            <div style={styles.overrideItem}>
              <label style={styles.overrideLabel}>Recipients (comma-separated)</label>
              <input
                type="text"
                style={styles.input}
                value={emailOptions.recipients}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
          </div>
        )}

        {/* Platform-specific overrides */}
        {selectedPlatforms.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary, width: 'auto', padding: '8px 16px' }}
              onClick={() => setShowOverrides(!showOverrides)}
            >
              <Eye size={14} />
              {showOverrides ? 'Hide' : 'Show'} Platform Customizations
            </button>

            {showOverrides && (
              <div style={styles.overridesSection}>
                <div style={styles.overridesTitle}>
                  Customize per Platform
                </div>
                {selectedPlatforms.filter(p => p !== 'email').map(platform => {
                  const Icon = PLATFORM_ICONS[platform];
                  const color = PLATFORM_COLORS[platform];
                  const limit = PLATFORM_LIMITS[platform];

                  return (
                    <div key={platform} style={styles.overrideItem}>
                      <label style={styles.overrideLabel}>
                        <Icon size={14} color={color} />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        {limit && ` (${limit} chars)`}
                      </label>
                      <textarea
                        style={styles.overrideTextarea}
                        value={platformOverrides[platform]?.text || ''}
                        onChange={(e) => handleOverrideChange(platform, e.target.value)}
                        placeholder={`Leave empty to use main content...`}
                      />
                      {limit && (
                        <div style={{ ...styles.charCount, ...getCharCountStyle(platform) }}>
                          {getCharCount(platform)} / {limit}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button
          style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '20px' }}
          onClick={handlePublish}
          disabled={loading || selectedPlatforms.length === 0}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send size={18} />
              Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>

      {renderPublishResults()}

      {/* Recent History */}
      <div style={styles.historySection}>
        <div style={styles.historyHeader}>
          <h3 style={styles.historyTitle}>
            <History size={20} />
            Recent Publishing
          </h3>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary, width: 'auto', padding: '8px 16px' }}
            onClick={fetchPublishHistory}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {publishHistory.length === 0 ? (
          <div style={styles.emptyState}>
            <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p>No publishing history yet</p>
          </div>
        ) : (
          publishHistory.map((entry, idx) => {
            const Icon = PLATFORM_ICONS[entry.platform] || FileText;
            const color = PLATFORM_COLORS[entry.platform] || '#64748b';

            return (
              <div key={idx} style={styles.historyItem}>
                <div style={{ ...styles.resultIcon, background: `${color}20` }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={styles.resultInfo}>
                  <div style={styles.resultPlatform}>
                    {entry.platform?.charAt(0).toUpperCase() + entry.platform?.slice(1)}
                  </div>
                  <div
                    style={{
                      ...styles.resultStatus,
                      ...(entry.status === 'published' ? styles.resultSuccess : styles.resultFailed)
                    }}
                  >
                    {entry.status === 'published' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}{' '}
                    {entry.status} • {new Date(entry.publishedAt || entry.attemptedAt).toLocaleString()}
                  </div>
                </div>
                {entry.postUrl && (
                  <a
                    href={entry.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.resultLink}
                  >
                    View →
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
