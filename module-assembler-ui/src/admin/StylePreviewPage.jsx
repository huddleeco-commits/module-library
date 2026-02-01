/**
 * Style Preview Page
 *
 * Generate multiple archetype variants for comparison:
 * - Select which archetypes to generate (Local, Luxury, E-Commerce)
 * - Preview all variants side-by-side or in tabs
 * - Deploy any/all variants
 * - One-click cleanup
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants/api';

const ARCHETYPES = [
  {
    id: 'local',
    name: 'Local / Community',
    description: 'Warm, welcoming, neighborhood feel',
    examples: "Porto's, neighborhood bakeries",
    color: '#22c55e'
  },
  {
    id: 'luxury',
    name: 'Brand Story / Luxury',
    description: 'Elegant, editorial, premium positioning',
    examples: 'Lady M, Tartine',
    color: '#8b5cf6'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Focus',
    description: 'Modern, conversion-focused, product-forward',
    examples: 'Sprinkles, Levain, Milk Bar',
    color: '#3b82f6'
  }
];

const FIXTURES = [
  { id: 'bakery', name: 'Bakery', icon: '🥐' },
  { id: 'coffee-cafe', name: 'Coffee Cafe', icon: '☕' },
  { id: 'pizza-restaurant', name: 'Pizza Restaurant', icon: '🍕' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'ice-cream', name: 'Ice Cream Shop', icon: '🍦' }
];

export default function StylePreviewPage() {
  const [selectedFixture, setSelectedFixture] = useState('bakery');
  const [selectedArchetypes, setSelectedArchetypes] = useState(['local', 'luxury', 'ecommerce']);
  const [businessName, setBusinessName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Load existing sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/style-preview/sessions`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }
  };

  const toggleArchetype = (id) => {
    setSelectedArchetypes(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const generatePreviews = async () => {
    if (selectedArchetypes.length === 0) {
      alert('Please select at least one archetype');
      return;
    }

    setGenerating(true);
    setProgress([]);

    try {
      const response = await fetch(`${API_BASE}/style-preview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureId: selectedFixture,
          businessName: businessName || undefined,
          archetypes: selectedArchetypes
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              setProgress(prev => [...prev, data]);

              if (data.sessionId) {
                setActiveSession(data.sessionId);
                fetchSessions();
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.error('Generation failed:', e);
      setProgress(prev => [...prev, { message: `Error: ${e.message}` }]);
    }

    setGenerating(false);
  };

  const openGallery = (sessionId) => {
    window.open(`${API_BASE}/style-preview/gallery/${sessionId}`, '_blank');
  };

  const deployVariant = async (sessionId, archetype) => {
    if (!confirm(`Deploy ${archetype} variant?`)) return;

    try {
      const res = await fetch(`${API_BASE}/style-preview/deploy/${sessionId}/${archetype}`, {
        method: 'POST'
      });
      const data = await res.json();

      if (data.success) {
        alert(`Deployed!\n\nFrontend: ${data.urls?.frontend}\nAdmin: ${data.urls?.admin}`);
        fetchSessions();
      } else {
        alert(`Deploy failed: ${data.error}`);
      }
    } catch (e) {
      alert(`Deploy error: ${e.message}`);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Delete this session? This will remove all local files, git repos, and deployments.')) return;

    try {
      const res = await fetch(
        `${API_BASE}/style-preview/sessions/${sessionId}?deleteDeployments=true&deleteGitRepos=true`,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (data.success) {
        fetchSessions();
        if (activeSession === sessionId) {
          setActiveSession(null);
        }
      }
    } catch (e) {
      alert(`Delete error: ${e.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Style Preview Generator</h1>
        <p style={styles.subtitle}>
          Generate multiple layout archetypes, compare side-by-side, and deploy your favorite
        </p>
      </div>

      {/* Configuration */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>1. Configure Generation</h2>

        {/* Fixture Selection */}
        <div style={styles.section}>
          <label style={styles.label}>Business Type</label>
          <div style={styles.fixtureGrid}>
            {FIXTURES.map(fix => (
              <button
                key={fix.id}
                onClick={() => setSelectedFixture(fix.id)}
                style={{
                  ...styles.fixtureBtn,
                  ...(selectedFixture === fix.id ? styles.fixtureBtnActive : {})
                }}
              >
                <span style={styles.fixtureIcon}>{fix.icon}</span>
                <span>{fix.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Business Name Override */}
        <div style={styles.section}>
          <label style={styles.label}>Business Name (optional override)</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Leave blank to use fixture default"
            style={styles.input}
          />
        </div>

        {/* Archetype Selection */}
        <div style={styles.section}>
          <label style={styles.label}>Select Archetypes to Generate</label>
          <div style={styles.archetypeGrid}>
            {ARCHETYPES.map(arch => (
              <div
                key={arch.id}
                onClick={() => toggleArchetype(arch.id)}
                style={{
                  ...styles.archetypeCard,
                  borderColor: selectedArchetypes.includes(arch.id) ? arch.color : '#334155',
                  background: selectedArchetypes.includes(arch.id) ? `${arch.color}15` : 'transparent'
                }}
              >
                <div style={styles.archetypeHeader}>
                  <input
                    type="checkbox"
                    checked={selectedArchetypes.includes(arch.id)}
                    onChange={() => toggleArchetype(arch.id)}
                    style={styles.checkbox}
                  />
                  <h3 style={{ ...styles.archetypeName, color: arch.color }}>{arch.name}</h3>
                </div>
                <p style={styles.archetypeDesc}>{arch.description}</p>
                <p style={styles.archetypeExamples}>Examples: {arch.examples}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePreviews}
          disabled={generating || selectedArchetypes.length === 0}
          style={{
            ...styles.generateBtn,
            opacity: generating || selectedArchetypes.length === 0 ? 0.5 : 1
          }}
        >
          {generating ? 'Generating...' : `Generate ${selectedArchetypes.length} Variant${selectedArchetypes.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Progress */}
      {progress.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Generation Progress</h2>
          <div style={styles.progressLog}>
            {progress.map((p, i) => (
              <div key={i} style={styles.progressItem}>
                {p.message || p.step || JSON.stringify(p)}
              </div>
            ))}
          </div>
          {activeSession && (
            <button
              onClick={() => openGallery(activeSession)}
              style={styles.galleryBtn}
            >
              Open Preview Gallery
            </button>
          )}
        </div>
      )}

      {/* Sessions */}
      {sessions.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Preview Sessions</h2>
          <div style={styles.sessionsList}>
            {sessions.map(session => (
              <div key={session.id} style={styles.sessionCard}>
                <div style={styles.sessionHeader}>
                  <div>
                    <h3 style={styles.sessionName}>{session.businessName}</h3>
                    <p style={styles.sessionMeta}>
                      {session.variants.length} variants | Created: {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={styles.sessionActions}>
                    <button onClick={() => openGallery(session.id)} style={styles.btnSecondary}>
                      Preview Gallery
                    </button>
                    <button onClick={() => deleteSession(session.id)} style={styles.btnDanger}>
                      Delete All
                    </button>
                  </div>
                </div>
                <div style={styles.variantsList}>
                  {session.variants.map(v => (
                    <div key={v.archetype} style={styles.variantItem}>
                      <span style={styles.variantName}>
                        {v.archetypeName || v.archetype.toUpperCase()}
                      </span>
                      <span style={styles.variantProject}>{v.projectName}</span>
                      {v.deployed ? (
                        <a
                          href={v.urls?.frontend}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.deployedBadge}
                        >
                          ✓ Live
                        </a>
                      ) : (
                        <button
                          onClick={() => deployVariant(session.id, v.archetype)}
                          style={styles.btnDeploy}
                        >
                          Deploy
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    margin: 0
  },
  card: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #334155'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 20px 0'
  },
  section: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px'
  },
  fixtureGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  fixtureBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  fixtureBtnActive: {
    borderColor: '#3b82f6',
    background: '#3b82f620',
    color: '#f8fafc'
  },
  fixtureIcon: {
    fontSize: '18px'
  },
  archetypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  archetypeCard: {
    padding: '16px',
    border: '2px solid #334155',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  archetypeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  archetypeName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  archetypeDesc: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 8px 0'
  },
  archetypeExamples: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    fontStyle: 'italic'
  },
  generateBtn: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  progressLog: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    maxHeight: '200px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: '13px',
    marginBottom: '16px'
  },
  progressItem: {
    color: '#94a3b8',
    marginBottom: '4px'
  },
  galleryBtn: {
    padding: '12px 24px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sessionCard: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #334155'
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  sessionName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 4px 0'
  },
  sessionMeta: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  sessionActions: {
    display: 'flex',
    gap: '8px'
  },
  variantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  variantItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: '#1e293b',
    borderRadius: '6px'
  },
  variantName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#f8fafc',
    minWidth: '150px'
  },
  variantProject: {
    fontSize: '13px',
    color: '#64748b',
    flex: 1
  },
  btnSecondary: {
    padding: '8px 12px',
    background: '#334155',
    border: 'none',
    borderRadius: '6px',
    color: '#f8fafc',
    fontSize: '13px',
    cursor: 'pointer'
  },
  btnDanger: {
    padding: '8px 12px',
    background: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '13px',
    cursor: 'pointer'
  },
  btnDeploy: {
    padding: '6px 12px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  deployedBadge: {
    padding: '6px 12px',
    background: '#166534',
    borderRadius: '6px',
    color: '#dcfce7',
    fontSize: '12px',
    fontWeight: '500',
    textDecoration: 'none'
  }
};
