/**
 * Research Test Lab
 *
 * Visual interface for testing STRUCTURAL layout differences based on
 * the industry design research document.
 *
 * Features:
 * - Industry selector (19 industries)
 * - Layout variant toggle (A / B / C)
 * - Side-by-side preview showing structural differences
 * - Mood sliders (affects styling, not structure)
 * - Batch generation for multiple industries
 */

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Layers,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
  ChevronDown,
  Check,
  Play,
  Palette,
  Type,
  Sun,
  Moon,
  Grid3X3,
  LayoutGrid,
  Building2,
  Sparkles,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// API base URL
const API_URL = window.location.origin;

export default function ResearchTestLab() {
  // State
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [industryData, setIndustryData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mood sliders state
  const [moodSliders, setMoodSliders] = useState({
    isDark: false,
    primaryColor: '#3B82F6',
    borderRadius: '12px',
    fontHeading: "'Inter', system-ui, sans-serif",
    fontBody: "system-ui, sans-serif"
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [allVariantsCode, setAllVariantsCode] = useState(null);
  const [copied, setCopied] = useState(false);

  // Batch generation state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedForBatch, setSelectedForBatch] = useState(new Set());
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  // 3-way comparison state
  const [comparingAll, setComparingAll] = useState(false);
  const [comparisonUrl, setComparisonUrl] = useState(null);

  // Preview panel state
  const [expandedVariant, setExpandedVariant] = useState(null);

  // Success state for better feedback
  const [showSuccess, setShowSuccess] = useState(false);

  // Load industries on mount
  useEffect(() => {
    loadIndustries();
  }, []);

  // Load industry data when selection changes
  useEffect(() => {
    if (selectedIndustry) {
      loadIndustryData(selectedIndustry);
      loadComparison(selectedIndustry);
    }
  }, [selectedIndustry]);

  // API calls
  const loadIndustries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/research-lab/industries`);
      const data = await res.json();
      if (data.success) {
        setIndustries(data.data);
        if (data.data.length > 0 && !selectedIndustry) {
          setSelectedIndustry(data.data[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load industries');
    }
  };

  const loadIndustryData = async (industryId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/research-lab/industry/${industryId}`);
      const data = await res.json();
      if (data.success) {
        setIndustryData(data.data);
      }
    } catch (err) {
      setError('Failed to load industry data');
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (industryId) => {
    try {
      const res = await fetch(`${API_URL}/api/research-lab/compare/${industryId}`);
      const data = await res.json();
      if (data.success) {
        setComparison(data.data);
      }
    } catch (err) {
      console.error('Failed to load comparison');
    }
  };

  const generateSingleVariant = async () => {
    setGenerating(true);
    setGeneratedCode(null);
    try {
      const res = await fetch(`${API_URL}/api/research-lab/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: selectedIndustry,
          variant: selectedVariant,
          moodSliders,
          businessData: {
            name: industryData?.name || 'Test Business',
            tagline: `Your local ${industryData?.name || 'business'}`
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // Open preview in new tab
  const openPreview = () => {
    if (!generatedCode?.code) return;

    // Strip import statements from the generated code
    let cleanCode = generatedCode.code
      .replace(/import\s+React.*?from\s+['"]react['"];?\n?/g, '')
      .replace(/import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"];?\n?/g, '')
      .replace(/import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"];?\n?/g, '')
      .replace(/export\s+default\s+/g, 'const HomePage = ');

    // Create a full HTML page with the component
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${industryData?.name || 'Layout'} - Layout ${selectedVariant}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    // Mock react-router-dom Link
    const Link = ({ to, children, style, ...props }) =>
      React.createElement('a', { href: to || '#', style, ...props }, children);

    // Mock Lucide icons
    const ChevronLeft = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2039');
    const ChevronRight = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u203A');
    const Star = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2605');
    const MapPin = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\uD83D\\uDCCD');
    const Phone = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\uD83D\\uDCDE');
    const Clock = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\uD83D\\uDD50');
    const ArrowRight = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2192');
    const Check = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2713');
    const Play = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u25B6');
    const Calendar = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\uD83D\\uDCC5');
    const Menu = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2630');
    const X = ({ size = 24 }) => React.createElement('span', { style: { fontSize: size } }, '\\u2715');

    ${cleanCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(HomePage));
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const generateAllVariants = async () => {
    setGenerating(true);
    setAllVariantsCode(null);
    try {
      const res = await fetch(`${API_URL}/api/research-lab/generate-all-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: selectedIndustry,
          moodSliders,
          businessData: {
            name: industryData?.name || 'Test Business',
            tagline: `Your local ${industryData?.name || 'business'}`
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setAllVariantsCode(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const runBatchGeneration = async () => {
    if (selectedForBatch.size === 0) return;

    setBatchGenerating(true);
    setBatchResults(null);
    try {
      const res = await fetch(`${API_URL}/api/research-lab/batch-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryIds: Array.from(selectedForBatch),
          variants: ['A', 'B', 'C'],
          moodSliders,
          businessData: {}
        })
      });
      const data = await res.json();
      setBatchResults(data.data);
    } catch (err) {
      setError('Batch generation failed');
    } finally {
      setBatchGenerating(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate 3-way comparison with side-by-side preview
  const generateComparison = async () => {
    if (!selectedIndustry) return;

    setComparingAll(true);
    setComparisonUrl(null);
    try {
      const res = await fetch(`${API_URL}/api/research-lab/generate-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industryId: selectedIndustry,
          useFixture: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setComparisonUrl(data.data.comparisonUrl);
        // Open in new tab
        window.open(data.data.comparisonUrl, '_blank');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Comparison generation failed');
    } finally {
      setComparingAll(false);
    }
  };

  const toggleBatchSelection = (industryId) => {
    const newSet = new Set(selectedForBatch);
    if (newSet.has(industryId)) {
      newSet.delete(industryId);
    } else {
      newSet.add(industryId);
    }
    setSelectedForBatch(newSet);
  };

  const selectAllForBatch = () => {
    setSelectedForBatch(new Set(industries.map(i => i.id)));
  };

  const clearBatchSelection = () => {
    setSelectedForBatch(new Set());
  };

  // Get variant data helper
  const getVariantData = (variant) => {
    if (!comparison?.variants) return null;
    return comparison.variants[variant];
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FlaskConical size={24} style={{ color: '#8B5CF6' }} />
          <div>
            <h1 style={styles.title}>Research Test Lab</h1>
            <p style={styles.subtitle}>
              Test STRUCTURAL layout differences based on design research (19 industries × 3 variants = 57 unique structures)
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => setBatchMode(!batchMode)}
            style={{
              ...styles.modeBtn,
              background: batchMode ? '#8B5CF620' : 'transparent',
              color: batchMode ? '#8B5CF6' : '#6B7280'
            }}
          >
            <Grid3X3 size={16} />
            Batch Mode
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Industry Selector */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <Building2 size={16} />
            <span>Industries ({industries.length})</span>
            {batchMode && (
              <div style={styles.batchControls}>
                <button onClick={selectAllForBatch} style={styles.smallBtn}>All</button>
                <button onClick={clearBatchSelection} style={styles.smallBtn}>Clear</button>
              </div>
            )}
          </div>

          <div style={styles.industryList}>
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => batchMode ? toggleBatchSelection(industry.id) : setSelectedIndustry(industry.id)}
                style={{
                  ...styles.industryItem,
                  background: selectedIndustry === industry.id ? '#3B82F620' : 'transparent',
                  borderLeft: selectedIndustry === industry.id ? '3px solid #3B82F6' : '3px solid transparent'
                }}
              >
                {batchMode && (
                  <div style={{
                    ...styles.checkbox,
                    background: selectedForBatch.has(industry.id) ? '#8B5CF6' : 'transparent',
                    borderColor: selectedForBatch.has(industry.id) ? '#8B5CF6' : '#D1D5DB'
                  }}>
                    {selectedForBatch.has(industry.id) && <Check size={12} color="#fff" />}
                  </div>
                )}
                <span style={styles.industryName}>{industry.name}</span>
              </button>
            ))}
          </div>

          {batchMode && selectedForBatch.size > 0 && (
            <div style={styles.batchSummary}>
              <p>{selectedForBatch.size} industries selected</p>
              <button
                onClick={runBatchGeneration}
                disabled={batchGenerating}
                style={styles.batchBtn}
              >
                {batchGenerating ? (
                  <><RefreshCw size={14} className="spin" /> Generating...</>
                ) : (
                  <><Play size={14} /> Generate {selectedForBatch.size * 3} Variants</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Center Panel - Variant Comparison */}
        <div style={styles.centerPanel}>
          {industryData && (
            <>
              {/* Industry Header */}
              <div style={styles.industryHeader}>
                <h2 style={styles.industryTitle}>{industryData.name}</h2>
                <span style={styles.styleNote}>{industryData.styleNote}</span>
              </div>

              {/* Variant Tabs */}
              <div style={styles.variantTabs}>
                {['A', 'B', 'C'].map((v) => {
                  const variantData = getVariantData(v);
                  return (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        ...styles.variantTab,
                        background: selectedVariant === v ? '#3B82F6' : '#F3F4F6',
                        color: selectedVariant === v ? '#fff' : '#374151'
                      }}
                    >
                      <span style={styles.variantLetter}>Layout {v}</span>
                      {variantData && (
                        <span style={styles.variantName}>{variantData.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Structural Comparison Grid */}
              {comparison && (
                <div style={styles.comparisonGrid}>
                  {['A', 'B', 'C'].map((v) => {
                    const variant = comparison.variants[v];
                    const isSelected = selectedVariant === v;
                    return (
                      <div
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          ...styles.variantCard,
                          border: isSelected ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                          background: isSelected ? '#F8FAFC' : '#fff'
                        }}
                      >
                        <div style={styles.variantCardHeader}>
                          <span style={styles.variantLabel}>Layout {v}</span>
                          <span style={{
                            ...styles.heroTypeBadge,
                            background: getHeroTypeColor(variant.heroType)
                          }}>
                            {variant.heroType}
                          </span>
                        </div>

                        <h3 style={styles.variantCardTitle}>{variant.name}</h3>
                        <p style={styles.variantReference}>{variant.reference}</p>
                        <p style={styles.variantMood}>Mood: {variant.mood}</p>

                        {/* Sections Preview */}
                        <div style={styles.sectionsPreview}>
                          <span style={styles.sectionsLabel}>Sections:</span>
                          <div style={styles.sectionsList}>
                            {variant.sections.slice(0, 5).map((section, i) => (
                              <span key={i} style={styles.sectionBadge}>{formatSectionName(section)}</span>
                            ))}
                            {variant.sections.length > 5 && (
                              <span style={styles.moreBadge}>+{variant.sections.length - 5}</span>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div style={styles.featuresPreview}>
                          {variant.features.slice(0, 3).map((feature, i) => (
                            <span key={i} style={styles.featureBadge}>
                              <Check size={10} /> {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Structural Differences Summary */}
              {comparison?.structuralDifferences && (
                <div style={styles.diffSummary}>
                  <h4 style={styles.diffTitle}>Structural Differences</h4>
                  <div style={styles.diffGrid}>
                    <div style={styles.diffItem}>
                      <span style={styles.diffLabel}>Hero Types:</span>
                      <div style={styles.diffValues}>
                        <span>A: {comparison.structuralDifferences.heroTypes.A}</span>
                        <span>B: {comparison.structuralDifferences.heroTypes.B}</span>
                        <span>C: {comparison.structuralDifferences.heroTypes.C}</span>
                      </div>
                    </div>
                    {comparison.structuralDifferences.uniqueSections.A.length > 0 && (
                      <div style={styles.diffItem}>
                        <span style={styles.diffLabel}>Unique to A:</span>
                        <span>{comparison.structuralDifferences.uniqueSections.A.join(', ')}</span>
                      </div>
                    )}
                    {comparison.structuralDifferences.uniqueSections.B.length > 0 && (
                      <div style={styles.diffItem}>
                        <span style={styles.diffLabel}>Unique to B:</span>
                        <span>{comparison.structuralDifferences.uniqueSections.B.join(', ')}</span>
                      </div>
                    )}
                    {comparison.structuralDifferences.uniqueSections.C.length > 0 && (
                      <div style={styles.diffItem}>
                        <span style={styles.diffLabel}>Unique to C:</span>
                        <span>{comparison.structuralDifferences.uniqueSections.C.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Panel - Mood Sliders & Generation */}
        <div style={styles.rightPanel}>
          {/* Mood Sliders */}
          <div style={styles.moodSection}>
            <div style={styles.panelHeader}>
              <Palette size={16} />
              <span>Mood Sliders</span>
              <span style={styles.moodNote}>(styling only, not structure)</span>
            </div>

            <div style={styles.sliderGroup}>
              <label style={styles.sliderLabel}>
                {moodSliders.isDark ? <Moon size={14} /> : <Sun size={14} />}
                Theme
              </label>
              <div style={styles.toggleRow}>
                <button
                  onClick={() => setMoodSliders(s => ({ ...s, isDark: false }))}
                  style={{
                    ...styles.toggleBtn,
                    background: !moodSliders.isDark ? '#3B82F6' : '#F3F4F6',
                    color: !moodSliders.isDark ? '#fff' : '#374151'
                  }}
                >
                  Light
                </button>
                <button
                  onClick={() => setMoodSliders(s => ({ ...s, isDark: true }))}
                  style={{
                    ...styles.toggleBtn,
                    background: moodSliders.isDark ? '#3B82F6' : '#F3F4F6',
                    color: moodSliders.isDark ? '#fff' : '#374151'
                  }}
                >
                  Dark
                </button>
              </div>
            </div>

            <div style={styles.sliderGroup}>
              <label style={styles.sliderLabel}>
                <Palette size={14} />
                Primary Color
              </label>
              <div style={styles.colorRow}>
                <input
                  type="color"
                  value={moodSliders.primaryColor}
                  onChange={(e) => setMoodSliders(s => ({ ...s, primaryColor: e.target.value }))}
                  style={styles.colorInput}
                />
                <span style={styles.colorValue}>{moodSliders.primaryColor}</span>
              </div>
            </div>

            <div style={styles.sliderGroup}>
              <label style={styles.sliderLabel}>
                <Type size={14} />
                Border Radius
              </label>
              <select
                value={moodSliders.borderRadius}
                onChange={(e) => setMoodSliders(s => ({ ...s, borderRadius: e.target.value }))}
                style={styles.select}
              >
                <option value="0px">Sharp (0px)</option>
                <option value="4px">Subtle (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="20px">Pill (20px)</option>
              </select>
            </div>
          </div>

          {/* Generation Actions */}
          <div style={styles.generateSection}>
            <div style={styles.panelHeader}>
              <Sparkles size={16} />
              <span>Generate</span>
            </div>

            <button
              onClick={generateSingleVariant}
              disabled={generating || !selectedIndustry}
              style={styles.generateBtn}
            >
              {generating ? (
                <><RefreshCw size={16} className="spin" /> Generating...</>
              ) : (
                <><Play size={16} /> Generate Layout {selectedVariant}</>
              )}
            </button>

            <button
              onClick={generateAllVariants}
              disabled={generating || !selectedIndustry}
              style={styles.generateAllBtn}
            >
              <LayoutGrid size={16} />
              Generate All 3 Variants
            </button>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <button
                onClick={generateComparison}
                disabled={comparingAll || !selectedIndustry}
                style={styles.compareAllBtn}
              >
                {comparingAll ? (
                  <><RefreshCw size={16} className="spin" /> Building Comparison...</>
                ) : (
                  <><Eye size={16} /> 👁️ Compare All 3 Side-by-Side</>
                )}
              </button>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', textAlign: 'center' }}>
                Opens 3-panel comparison with industry data & images
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {showSuccess && (
            <div style={styles.successBanner}>
              <CheckCircle2 size={20} />
              <div>
                <strong>Generation Complete!</strong>
                <span style={{ marginLeft: '8px' }}>
                  {industryData?.name} Layout {selectedVariant} - {generatedCode?.config?.name}
                </span>
              </div>
            </div>
          )}

          {/* Generated Code Preview */}
          {generatedCode && (
            <div style={styles.codePreview}>
              <div style={styles.codeHeader}>
                <span style={{ fontWeight: '600' }}>Generated: {generatedCode.config.name}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={openPreview}
                    style={styles.previewBtn}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedCode.code)}
                    style={styles.copyBtn}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
              <div style={styles.codeStats}>
                <span><strong>Hero:</strong> {generatedCode.config.heroType}</span>
                <span><strong>Sections:</strong> {generatedCode.config.sectionCount}</span>
                <span><strong>Mood:</strong> {generatedCode.config.mood}</span>
              </div>
              <pre style={styles.codeBlock}>
                {generatedCode.code.slice(0, 800)}...
              </pre>
              <div style={styles.codeFooter}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  {generatedCode.code.length.toLocaleString()} characters generated
                </span>
              </div>
            </div>
          )}

          {/* Winning Elements */}
          {industryData?.winningElements && (
            <div style={styles.winningElements}>
              <div style={styles.panelHeader}>
                <Check size={16} />
                <span>Winning Elements</span>
              </div>
              <div style={styles.elementsList}>
                {industryData.winningElements.map((element, i) => (
                  <span key={i} style={styles.elementBadge}>
                    <Check size={10} /> {element}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Batch Results Modal */}
      {batchResults && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Batch Generation Results</h3>
            <div style={styles.batchSummaryResults}>
              <span style={styles.successCount}>
                <CheckCircle2 size={16} /> {batchResults.summary.successful} successful
              </span>
              {batchResults.summary.failed > 0 && (
                <span style={styles.failedCount}>
                  <AlertCircle size={16} /> {batchResults.summary.failed} failed
                </span>
              )}
            </div>
            <div style={styles.batchResultsList}>
              {batchResults.results.map((result, i) => (
                <div key={i} style={styles.batchResultItem}>
                  <span style={styles.batchResultIndustry}>{result.industryId}</span>
                  <div style={styles.batchResultVariants}>
                    {['A', 'B', 'C'].map(v => (
                      <span
                        key={v}
                        style={{
                          ...styles.batchResultVariant,
                          background: result.variants[v]?.success ? '#10B98120' : '#EF444420',
                          color: result.variants[v]?.success ? '#10B981' : '#EF4444'
                        }}
                      >
                        {v}: {result.variants[v]?.success ? 'OK' : 'Failed'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setBatchResults(null)} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={styles.errorToast}>
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} style={styles.toastClose}>×</button>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getHeroTypeColor(heroType) {
  const colors = {
    'video': '#8B5CF620',
    'story-split': '#F59E0B20',
    'gallery-fullbleed': '#EC489920',
    'minimal-text': '#6B728020',
    'dark-luxury': '#1F293720',
    'split-animated': '#3B82F620',
    'image-overlay': '#10B98120',
    'centered-cta': '#06B6D420'
  };
  return colors[heroType] || '#F3F4F6';
}

function formatSectionName(section) {
  return section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Styles
const styles = {
  container: { minHeight: '100vh', background: '#F9FAFB', padding: '24px' },

  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', padding: '20px', background: '#fff',
    borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  headerLeft: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  headerActions: { display: 'flex', gap: '12px' },
  modeBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB',
    cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    transition: 'all 0.2s'
  },

  mainContent: { display: 'grid', gridTemplateColumns: '240px 1fr 320px', gap: '24px' },

  // Left Panel
  leftPanel: {
    background: '#fff', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content',
    maxHeight: 'calc(100vh - 160px)', overflow: 'auto'
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: '600', color: '#374151',
    marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB'
  },
  batchControls: { display: 'flex', gap: '8px', marginLeft: 'auto' },
  smallBtn: {
    padding: '2px 8px', fontSize: '11px', background: '#F3F4F6',
    border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#6B7280'
  },
  industryList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  industryItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 12px', border: 'none', cursor: 'pointer',
    textAlign: 'left', fontSize: '13px', transition: 'all 0.2s',
    borderRadius: '6px'
  },
  checkbox: {
    width: '16px', height: '16px', borderRadius: '4px',
    border: '2px solid', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0
  },
  industryName: { color: '#374151', fontWeight: '500' },
  batchSummary: {
    marginTop: '16px', padding: '12px', background: '#8B5CF610',
    borderRadius: '8px', textAlign: 'center'
  },
  batchBtn: {
    marginTop: '8px', padding: '10px 16px', background: '#8B5CF6',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '600', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
  },

  // Center Panel
  centerPanel: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  industryHeader: { marginBottom: '20px' },
  industryTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },
  styleNote: {
    display: 'inline-block', marginTop: '4px', fontSize: '13px',
    color: '#6B7280', fontStyle: 'italic'
  },

  variantTabs: { display: 'flex', gap: '8px', marginBottom: '20px' },
  variantTab: {
    flex: 1, padding: '12px 16px', border: 'none', borderRadius: '8px',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
  },
  variantLetter: { display: 'block', fontSize: '14px', fontWeight: '600' },
  variantName: { display: 'block', fontSize: '11px', marginTop: '2px', opacity: 0.8 },

  comparisonGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' },
  variantCard: {
    padding: '16px', borderRadius: '10px', cursor: 'pointer',
    transition: 'all 0.2s'
  },
  variantCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '8px'
  },
  variantLabel: { fontSize: '11px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  heroTypeBadge: {
    fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
    fontWeight: '500', color: '#374151'
  },
  variantCardTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px' },
  variantReference: { fontSize: '12px', color: '#6B7280', fontStyle: 'italic', margin: '0 0 8px' },
  variantMood: { fontSize: '11px', color: '#9CA3AF', margin: '0 0 12px' },

  sectionsPreview: { marginBottom: '12px' },
  sectionsLabel: { fontSize: '11px', fontWeight: '600', color: '#6B7280', display: 'block', marginBottom: '6px' },
  sectionsList: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  sectionBadge: {
    fontSize: '10px', padding: '2px 6px', background: '#F3F4F6',
    borderRadius: '4px', color: '#374151'
  },
  moreBadge: {
    fontSize: '10px', padding: '2px 6px', background: '#E5E7EB',
    borderRadius: '4px', color: '#6B7280'
  },

  featuresPreview: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  featureBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '10px', padding: '2px 6px', background: '#10B98110',
    borderRadius: '4px', color: '#059669'
  },

  diffSummary: {
    padding: '16px', background: '#F8FAFC', borderRadius: '8px',
    marginTop: '16px'
  },
  diffTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px' },
  diffGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  diffItem: { display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' },
  diffLabel: { fontWeight: '600', color: '#6B7280', minWidth: '100px' },
  diffValues: { display: 'flex', gap: '12px', flexWrap: 'wrap' },

  // Right Panel
  rightPanel: {
    display: 'flex', flexDirection: 'column', gap: '16px'
  },

  moodSection: {
    background: '#fff', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  moodNote: { fontSize: '10px', color: '#9CA3AF', marginLeft: 'auto' },
  sliderGroup: { marginBottom: '16px' },
  sliderLabel: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px'
  },
  toggleRow: { display: 'flex', gap: '4px' },
  toggleBtn: {
    flex: 1, padding: '8px 12px', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
  },
  colorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  colorInput: { width: '40px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '6px' },
  colorValue: { fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' },
  select: {
    width: '100%', padding: '8px 12px', borderRadius: '6px',
    border: '1px solid #E5E7EB', fontSize: '13px'
  },

  generateSection: {
    background: '#fff', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  generateBtn: {
    width: '100%', padding: '12px', background: '#3B82F6', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px', marginBottom: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
  },
  generateAllBtn: {
    width: '100%', padding: '12px', background: '#F3F4F6', color: '#374151',
    border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '500', fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
  },
  compareAllBtn: {
    width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  },

  successBanner: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px', background: '#10B98120', borderRadius: '12px',
    color: '#059669', marginBottom: '16px', border: '1px solid #10B98140'
  },
  codePreview: {
    background: '#fff', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #3B82F640'
  },
  codeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px'
  },
  previewBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', background: '#3B82F6', color: '#fff', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
  },
  copyBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', background: '#F3F4F6', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
  },
  codeStats: {
    display: 'flex', gap: '16px', fontSize: '12px', color: '#374151',
    marginBottom: '12px', padding: '8px 12px', background: '#F9FAFB',
    borderRadius: '6px'
  },
  codeBlock: {
    background: '#1F2937', color: '#E5E7EB', padding: '12px',
    borderRadius: '8px', fontSize: '11px', overflow: 'auto',
    maxHeight: '250px', fontFamily: 'monospace'
  },
  codeFooter: {
    marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E5E7EB',
    textAlign: 'right'
  },

  winningElements: {
    background: '#fff', borderRadius: '12px', padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  elementsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  elementBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', padding: '4px 8px', background: '#10B98110',
    borderRadius: '4px', color: '#059669'
  },

  // Modal
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modalContent: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto'
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '16px' },
  batchSummaryResults: { display: 'flex', gap: '16px', marginBottom: '16px' },
  successCount: { display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' },
  failedCount: { display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444' },
  batchResultsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  batchResultItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', background: '#F9FAFB', borderRadius: '6px'
  },
  batchResultIndustry: { fontSize: '13px', fontWeight: '500' },
  batchResultVariants: { display: 'flex', gap: '4px' },
  batchResultVariant: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px' },
  closeBtn: {
    padding: '10px 20px', background: '#F3F4F6', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
  },

  // Error Toast
  errorToast: {
    position: 'fixed', bottom: '24px', right: '24px',
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 16px', background: '#FEE2E2', color: '#DC2626',
    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  toastClose: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontSize: '18px', color: '#DC2626', marginLeft: '8px'
  }
};

// Add spin animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(styleSheet);
