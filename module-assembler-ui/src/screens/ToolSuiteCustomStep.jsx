/**
 * ToolSuiteCustomStep
 * Mix and match - pick individual tools to build your suite
 * Step 1: Select tools from grid
 * Step 2: Configure and build (uses ToolSuiteBuilderScreen logic)
 */

import React, { useState } from 'react';
import { API_BASE } from '../constants';

// All available tools organized by category
const TOOL_CATEGORIES = {
  developer: {
    name: 'Developer',
    icon: '👨‍💻',
    tools: [
      { id: 'uuid-generator', icon: '🔑', name: 'UUID Generator', desc: 'Generate unique identifiers' },
      { id: 'json-formatter', icon: '📋', name: 'JSON Formatter', desc: 'Format & validate JSON' },
      { id: 'base64-encoder', icon: '🔐', name: 'Base64 Encoder', desc: 'Encode & decode Base64' },
      { id: 'hash-generator', icon: '🔒', name: 'Hash Generator', desc: 'MD5, SHA256 & more' },
      { id: 'regex-tester', icon: '🔍', name: 'Regex Tester', desc: 'Test regular expressions' },
    ],
  },
  business: {
    name: 'Business',
    icon: '💼',
    tools: [
      { id: 'invoice-generator', icon: '📄', name: 'Invoice Generator', desc: 'Create professional invoices' },
      { id: 'receipt-generator', icon: '🧾', name: 'Receipt Generator', desc: 'Generate receipts instantly' },
      { id: 'expense-tracker', icon: '💰', name: 'Expense Tracker', desc: 'Track spending & budgets' },
      { id: 'time-tracker', icon: '⏰', name: 'Time Tracker', desc: 'Log hours & projects' },
    ],
  },
  utilities: {
    name: 'Utilities',
    icon: '🔧',
    tools: [
      { id: 'qr-generator', icon: '📱', name: 'QR Code Generator', desc: 'Generate QR codes instantly' },
      { id: 'password-generator', icon: '🔐', name: 'Password Generator', desc: 'Secure random passwords' },
      { id: 'countdown', icon: '⏱️', name: 'Countdown Timer', desc: 'Event countdowns & timers' },
      { id: 'pomodoro', icon: '🍅', name: 'Pomodoro Timer', desc: 'Focus & productivity timer' },
      { id: 'image-resizer', icon: '🖼️', name: 'Image Resizer', desc: 'Resize & compress images' },
      { id: 'word-counter', icon: '📝', name: 'Word Counter', desc: 'Count words & characters' },
    ],
  },
  calculators: {
    name: 'Calculators',
    icon: '🧮',
    tools: [
      { id: 'calculator', icon: '🧮', name: 'Calculator', desc: 'Build custom calculators' },
      { id: 'tip-calculator', icon: '💵', name: 'Tip Calculator', desc: 'Split bills & calculate tips' },
      { id: 'bmi-calculator', icon: '⚖️', name: 'BMI Calculator', desc: 'Health & fitness metrics' },
      { id: 'calorie-calculator', icon: '🍎', name: 'Calorie Calculator', desc: 'Nutrition & diet planning' },
      { id: 'age-calculator', icon: '🎂', name: 'Age Calculator', desc: 'Calculate exact age' },
    ],
  },
  converters: {
    name: 'Converters',
    icon: '🔄',
    tools: [
      { id: 'unit-converter', icon: '🔄', name: 'Unit Converter', desc: 'Convert any measurements' },
      { id: 'json-csv-converter', icon: '📊', name: 'JSON/CSV Converter', desc: 'Convert between formats' },
    ],
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: '✨',
    tools: [
      { id: 'habit-tracker', icon: '✅', name: 'Habit Tracker', desc: 'Build better habits daily' },
      { id: 'recipe-scaler', icon: '🍳', name: 'Recipe Scaler', desc: 'Adjust recipe portions' },
      { id: 'color-picker', icon: '🎨', name: 'Color Picker', desc: 'Find perfect color palettes' },
    ],
  },
};

const styles = {
  container: {
    padding: '40px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: '700',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.6)',
  },
  step: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  stepDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  stepLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  selectionBar: {
    position: 'sticky',
    top: '0',
    background: 'rgba(15, 15, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '16px 24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  selectedCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  countBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
  },
  countText: {
    color: '#fff',
    fontSize: '1rem',
  },
  countHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
  },
  continueBtn: {
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  continueBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  categorySection: {
    marginBottom: '40px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  categoryIcon: {
    fontSize: '1.5rem',
  },
  categoryName: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#fff',
  },
  toolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  toolCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toolCardSelected: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    background: 'rgba(99, 102, 241, 0.08)',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  checkboxSelected: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderColor: 'transparent',
    color: '#fff',
  },
  toolIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  toolDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.4,
  },
  orderBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
  },

  // Step 2: Configure
  configContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '32px',
  },
  configMain: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  configSidebar: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  selectedToolsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  selectedToolItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  toolItemIcon: {
    fontSize: '1.5rem',
  },
  toolItemInfo: {
    flex: 1,
  },
  toolItemName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
  },
  toolItemActions: {
    display: 'flex',
    gap: '6px',
  },
  toolItemBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  removeBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
  },
  colorPicker: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  styleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  styleOptionSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)',
  },

  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
  },
  buildBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  // Building
  building: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '24px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

const COLOR_PRESETS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
const STYLE_PRESETS = [
  { id: 'modern', name: 'Modern', icon: '✨' },
  { id: 'minimal', name: 'Minimal', icon: '○' },
  { id: 'bold', name: 'Bold', icon: '💪' },
  { id: 'elegant', name: 'Elegant', icon: '👑' },
];

export function ToolSuiteCustomStep({ onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTools, setSelectedTools] = useState([]);
  const [businessName, setBusinessName] = useState('My Tool Suite');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [stylePreset, setStylePreset] = useState('modern');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);

  // Get all tools as flat array with category info
  const allTools = Object.entries(TOOL_CATEGORIES).flatMap(([catId, cat]) =>
    cat.tools.map(tool => ({ ...tool, category: catId, categoryName: cat.name }))
  );

  const toggleTool = (toolId) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  const moveToolUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...selectedTools];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSelectedTools(newOrder);
  };

  const moveToolDown = (index) => {
    if (index >= selectedTools.length - 1) return;
    const newOrder = [...selectedTools];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedTools(newOrder);
  };

  const removeTool = (toolId) => {
    setSelectedTools(prev => prev.filter(t => t !== toolId));
  };

  const getToolInfo = (toolId) => allTools.find(t => t.id === toolId);

  const handleBuild = async () => {
    if (selectedTools.length < 2) {
      setError('Please select at least 2 tools');
      return;
    }

    setBuilding(true);
    setError(null);

    try {
      const tools = selectedTools.map(id => getToolInfo(id));

      const response = await fetch(`${API_BASE}/api/orchestrate/build-suite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: tools.map(t => ({
            toolType: t.id,
            name: t.name,
            icon: t.icon,
            description: t.desc,
            category: t.category,
          })),
          branding: {
            businessName,
            colors: { primary: primaryColor, accent: primaryColor },
            style: stylePreset,
          },
          options: {
            customSelection: true,
            organization: 'auto',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onComplete(data);
      } else {
        setError(data.error || 'Build failed');
        setBuilding(false);
      }
    } catch (err) {
      setError(`Build failed: ${err.message}`);
      setBuilding(false);
    }
  };

  // Building state
  if (building) {
    return (
      <div style={styles.container}>
        <div style={styles.building}>
          <div style={styles.spinner} />
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', color: '#fff'}}>Building Your Custom Suite</h2>
          <p style={{color: 'rgba(255,255,255,0.5)'}}>
            Generating {selectedTools.length} tools with unified branding...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {currentStep === 1 ? '🧩 Pick Your Tools' : '⚙️ Configure Your Suite'}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 1
            ? 'Select the tools you want in your custom suite'
            : 'Arrange tools and customize branding'}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={styles.step}>
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 1 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
          color: currentStep >= 1 ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>1</div>
        <div style={{...styles.stepLine, background: currentStep >= 2 ? '#6366f1' : 'rgba(255,255,255,0.1)'}} />
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 2 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
          color: currentStep >= 2 ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>2</div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#ef4444',
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Tool Selection */}
      {currentStep === 1 && (
        <>
          {/* Sticky Selection Bar */}
          <div style={styles.selectionBar}>
            <div style={styles.selectedCount}>
              <div style={styles.countBadge}>{selectedTools.length}</div>
              <div>
                <div style={styles.countText}>tools selected</div>
                <div style={styles.countHint}>Min 2 required for a suite</div>
              </div>
            </div>
            <button
              style={{
                ...styles.continueBtn,
                ...(selectedTools.length < 2 ? styles.continueBtnDisabled : {}),
              }}
              onClick={() => setCurrentStep(2)}
              disabled={selectedTools.length < 2}
            >
              Continue to Configure →
            </button>
          </div>

          {/* Categories */}
          {Object.entries(TOOL_CATEGORIES).map(([catId, category]) => (
            <div key={catId} style={styles.categorySection}>
              <div style={styles.categoryHeader}>
                <span style={styles.categoryIcon}>{category.icon}</span>
                <h3 style={styles.categoryName}>{category.name}</h3>
              </div>
              <div style={styles.toolGrid}>
                {category.tools.map(tool => {
                  const isSelected = selectedTools.includes(tool.id);
                  const orderIndex = selectedTools.indexOf(tool.id);
                  return (
                    <div
                      key={tool.id}
                      style={{
                        ...styles.toolCard,
                        ...(isSelected ? styles.toolCardSelected : {}),
                      }}
                      onClick={() => toggleTool(tool.id)}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {isSelected && <div style={styles.orderBadge}>{orderIndex + 1}</div>}
                      <div style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxSelected : {}),
                      }}>
                        {isSelected && '✓'}
                      </div>
                      <div style={styles.toolIcon}>{tool.icon}</div>
                      <div style={styles.toolInfo}>
                        <div style={styles.toolName}>{tool.name}</div>
                        <div style={styles.toolDesc}>{tool.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={onBack}>
              ← Back
            </button>
          </div>
        </>
      )}

      {/* Step 2: Configure */}
      {currentStep === 2 && (
        <>
          <div style={styles.configContainer}>
            {/* Main - Tool Order */}
            <div style={styles.configMain}>
              <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '600'}}>
                🛠️ Your Tools ({selectedTools.length})
              </h3>
              <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px'}}>
                Drag or use arrows to reorder. This determines the tab/menu order.
              </p>
              <div style={styles.selectedToolsList}>
                {selectedTools.map((toolId, index) => {
                  const tool = getToolInfo(toolId);
                  if (!tool) return null;
                  return (
                    <div key={toolId} style={styles.selectedToolItem}>
                      <span style={{color: 'rgba(255,255,255,0.3)', fontWeight: '600', width: '24px'}}>{index + 1}</span>
                      <span style={styles.toolItemIcon}>{tool.icon}</span>
                      <div style={styles.toolItemInfo}>
                        <div style={styles.toolItemName}>{tool.name}</div>
                      </div>
                      <div style={styles.toolItemActions}>
                        <button
                          style={styles.toolItemBtn}
                          onClick={() => moveToolUp(index)}
                          disabled={index === 0}
                        >↑</button>
                        <button
                          style={styles.toolItemBtn}
                          onClick={() => moveToolDown(index)}
                          disabled={index === selectedTools.length - 1}
                        >↓</button>
                        {selectedTools.length > 2 && (
                          <button
                            style={{...styles.toolItemBtn, ...styles.removeBtn}}
                            onClick={() => removeTool(toolId)}
                          >✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar - Branding */}
            <div style={styles.configSidebar}>
              <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '24px', fontWeight: '600'}}>
                ✨ Branding
              </h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Suite Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="My Tool Suite"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Color</label>
                <div style={styles.colorPicker}>
                  {COLOR_PRESETS.map(color => (
                    <div
                      key={color}
                      style={{
                        ...styles.colorSwatch,
                        background: color,
                        borderColor: primaryColor === color ? '#fff' : 'transparent',
                        transform: primaryColor === color ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Visual Style</label>
                <div style={styles.styleGrid}>
                  {STYLE_PRESETS.map(style => (
                    <div
                      key={style.id}
                      style={{
                        ...styles.styleOption,
                        ...(stylePreset === style.id ? styles.styleOptionSelected : {}),
                      }}
                      onClick={() => setStylePreset(style.id)}
                    >
                      <span>{style.icon}</span>
                      <span style={{fontWeight: '500', color: '#fff'}}>{style.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={() => setCurrentStep(1)}>
              ← Edit Selection
            </button>
            <button style={styles.buildBtn} onClick={handleBuild}>
              🚀 Build My Suite ({selectedTools.length} tools)
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
