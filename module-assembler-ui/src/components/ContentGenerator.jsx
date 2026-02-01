/**
 * ContentGenerator Component
 *
 * A React component for generating various types of content using AI.
 * Supports blog posts, social media, emails, product descriptions, and more.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  ShoppingBag,
  Sparkles,
  Search,
  Megaphone,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  RefreshCw,
  Package,
  Wand2
} from 'lucide-react';

// Content type icons mapping
const CONTENT_ICONS = {
  'blog-post': FileText,
  'social-twitter': Twitter,
  'social-linkedin': Linkedin,
  'social-instagram': Instagram,
  'social-facebook': Facebook,
  'email-newsletter': Mail,
  'email-promotional': Mail,
  'email-welcome': Mail,
  'product-description': ShoppingBag,
  'marketing-headline': Sparkles,
  'seo-meta': Search,
  'ad-copy': Megaphone
};

// Styles
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
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '12px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px'
  },
  typeButton: (selected) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 12px',
    borderRadius: '8px',
    border: selected ? '2px solid #6366f1' : '1px solid #e2e8f0',
    background: selected ? '#f5f3ff' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '8px'
  }),
  typeIcon: (selected) => ({
    color: selected ? '#6366f1' : '#64748b'
  }),
  typeName: (selected) => ({
    fontSize: '12px',
    fontWeight: selected ? '600' : '500',
    color: selected ? '#6366f1' : '#374151',
    textAlign: 'center'
  }),
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  generateButton: (loading) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease'
  }),
  resultCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    background: '#fff'
  },
  resultTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  resultActions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '12px',
    cursor: 'pointer'
  },
  resultContent: {
    padding: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#374151',
    whiteSpace: 'pre-wrap'
  },
  usageInfo: {
    display: 'flex',
    gap: '16px',
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: '12px',
    color: '#64748b'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    background: '#e0e7ff',
    color: '#4f46e5',
    fontSize: '11px',
    fontWeight: '500'
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px'
  },
  tab: (active) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }),
  error: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '16px'
  }
};

export default function ContentGenerator({
  apiBaseUrl = '',
  businessInfo = {},
  industryKey = 'general',
  onContentGenerated = null
}) {
  const [contentTypes, setContentTypes] = useState([]);
  const [tones, setTones] = useState([]);
  const [selectedType, setSelectedType] = useState('blog-post');
  const [mode, setMode] = useState('single'); // 'single' or 'package'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'professional',
    targetAudience: 'general',
    keywords: '',
    length: 'medium',
    customInstructions: '',
    variants: 1,
    packageTypes: ['blog-post', 'social-twitter', 'social-linkedin', 'seo-meta']
  });

  // Fetch content types and tones on mount
  useEffect(() => {
    fetchContentTypes();
    fetchTones();
  }, []);

  const fetchContentTypes = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/content/types`);
      const data = await res.json();
      if (data.success) {
        setContentTypes(data.types);
      }
    } catch (err) {
      console.error('Failed to fetch content types:', err);
      // Use fallback types
      setContentTypes([
        { key: 'blog-post', name: 'Blog Post', icon: '📝' },
        { key: 'social-twitter', name: 'Twitter/X', icon: '𝕏' },
        { key: 'social-linkedin', name: 'LinkedIn', icon: '💼' },
        { key: 'social-instagram', name: 'Instagram', icon: '📸' },
        { key: 'email-newsletter', name: 'Newsletter', icon: '📧' },
        { key: 'product-description', name: 'Product Description', icon: '🏷️' },
        { key: 'marketing-headline', name: 'Headlines', icon: '✨' },
        { key: 'seo-meta', name: 'SEO Meta', icon: '🔍' }
      ]);
    }
  };

  const fetchTones = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/content/tones`);
      const data = await res.json();
      if (data.success) {
        setTones(data.tones);
      }
    } catch (err) {
      console.error('Failed to fetch tones:', err);
      // Use fallback tones
      setTones([
        { key: 'professional', name: 'Professional' },
        { key: 'casual', name: 'Casual' },
        { key: 'witty', name: 'Witty' },
        { key: 'inspirational', name: 'Inspirational' },
        { key: 'educational', name: 'Educational' }
      ]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const endpoint = mode === 'package'
      ? `${apiBaseUrl}/api/content/generate-package`
      : `${apiBaseUrl}/api/content/generate`;

    const payload = mode === 'package'
      ? {
          topic: formData.topic,
          businessInfo,
          industryKey,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          contentTypes: formData.packageTypes
        }
      : {
          contentType: selectedType,
          topic: formData.topic,
          businessInfo,
          industryKey,
          tone: formData.tone,
          targetAudience: formData.targetAudience,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          length: formData.length,
          customInstructions: formData.customInstructions,
          variants: formData.variants
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);

      if (onContentGenerated) {
        onContentGenerated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContent = (content) => {
    if (typeof content === 'string') return content;
    return JSON.stringify(content, null, 2);
  };

  const ContentIcon = CONTENT_ICONS[selectedType] || FileText;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Wand2 size={24} color="#6366f1" />
          Content Generator
        </h1>
        <p style={styles.subtitle}>
          Generate blog posts, social media content, emails, and more with AI
        </p>
      </div>

      {/* Mode Tabs */}
      <div style={styles.tabs}>
        <button
          style={styles.tab(mode === 'single')}
          onClick={() => setMode('single')}
        >
          Single Content
        </button>
        <button
          style={styles.tab(mode === 'package')}
          onClick={() => setMode('package')}
        >
          <Package size={14} style={{ marginRight: '4px' }} />
          Content Package
        </button>
      </div>

      {/* Content Type Selection (Single Mode) */}
      {mode === 'single' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Content Type</div>
          <div style={styles.grid}>
            {contentTypes.map(type => {
              const Icon = CONTENT_ICONS[type.key] || FileText;
              return (
                <button
                  key={type.key}
                  style={styles.typeButton(selectedType === type.key)}
                  onClick={() => setSelectedType(type.key)}
                >
                  <Icon size={20} style={styles.typeIcon(selectedType === type.key)} />
                  <span style={styles.typeName(selectedType === type.key)}>
                    {type.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Package Type Selection (Package Mode) */}
      {mode === 'package' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Select Content Types for Package</div>
          <div style={styles.grid}>
            {contentTypes.map(type => {
              const Icon = CONTENT_ICONS[type.key] || FileText;
              const isSelected = formData.packageTypes.includes(type.key);
              return (
                <button
                  key={type.key}
                  style={styles.typeButton(isSelected)}
                  onClick={() => {
                    if (isSelected) {
                      handleInputChange('packageTypes', formData.packageTypes.filter(t => t !== type.key));
                    } else {
                      handleInputChange('packageTypes', [...formData.packageTypes, type.key]);
                    }
                  }}
                >
                  <Icon size={20} style={styles.typeIcon(isSelected)} />
                  <span style={styles.typeName(isSelected)}>
                    {type.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Topic Input */}
      <div style={styles.card}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Topic / Subject *</label>
          <textarea
            style={styles.textarea}
            placeholder="What do you want to write about? E.g., '10 tips for productivity' or 'Launch announcement for our new product'"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tone</label>
            <select
              style={styles.select}
              value={formData.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
            >
              {tones.map(tone => (
                <option key={tone.key} value={tone.key}>{tone.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Target Audience</label>
            <input
              style={styles.input}
              placeholder="E.g., small business owners"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Keywords (comma-separated)</label>
            <input
              style={styles.input}
              placeholder="E.g., productivity, efficiency, time management"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
            />
          </div>

          {mode === 'single' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Length</label>
              <select
                style={styles.select}
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          )}
        </div>

        {mode === 'single' && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Instructions (optional)</label>
            <textarea
              style={{ ...styles.textarea, minHeight: '60px' }}
              placeholder="Any specific requirements or guidelines..."
              value={formData.customInstructions}
              onChange={(e) => handleInputChange('customInstructions', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {/* Generate Button */}
      <button
        style={styles.generateButton(loading)}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            {mode === 'package' ? 'Generate Content Package' : 'Generate Content'}
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '24px' }}>
          {mode === 'package' ? (
            // Package results
            Object.entries(result.results || {}).map(([type, data]) => (
              <div key={type} style={{ ...styles.resultCard, marginBottom: '16px' }}>
                <div style={styles.resultHeader}>
                  <span style={styles.resultTitle}>
                    {contentTypes.find(t => t.key === type)?.name || type}
                  </span>
                  <div style={styles.resultActions}>
                    <button
                      style={styles.actionButton}
                      onClick={() => handleCopy(data.content)}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      Copy
                    </button>
                  </div>
                </div>
                <div style={styles.resultContent}>
                  {formatContent(data.content)}
                </div>
              </div>
            ))
          ) : (
            // Single result
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultTitle}>
                  {contentTypes.find(t => t.key === selectedType)?.name || 'Generated Content'}
                </span>
                <div style={styles.resultActions}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleCopy(result.content)}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    Copy
                  </button>
                  <button
                    style={styles.actionButton}
                    onClick={handleGenerate}
                  >
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                </div>
              </div>
              <div style={styles.resultContent}>
                {formatContent(result.content)}
              </div>
              <div style={styles.usageInfo}>
                <span>
                  <strong>Tokens:</strong> {result.usage?.inputTokens || 0} in / {result.usage?.outputTokens || 0} out
                </span>
                <span>
                  <strong>Cost:</strong> ${(result.usage?.estimatedCost || 0).toFixed(4)}
                </span>
                <span>
                  <strong>Duration:</strong> {result.duration}ms
                </span>
              </div>
            </div>
          )}

          {/* Total usage for packages */}
          {mode === 'package' && result.totalUsage && (
            <div style={styles.usageInfo}>
              <span>
                <strong>Total Tokens:</strong> {result.totalUsage.totalTokens}
              </span>
              <span>
                <strong>Total Cost:</strong> ${result.totalUsage.estimatedCost?.toFixed(4)}
              </span>
              <span>
                <strong>Duration:</strong> {result.duration}ms
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
