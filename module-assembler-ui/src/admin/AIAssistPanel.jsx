/**
 * AI Assist Panel
 * Slide-out panel for AI-powered debugging assistance
 * Analyzes failing modules and suggests fixes
 */

import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Undo2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Shield
} from 'lucide-react';

const API_URL = window.location.origin;

export default function AIAssistPanel({ module, onClose, onFixApplied }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [fixApplied, setFixApplied] = useState(false);
  const [backupId, setBackupId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const analyzeModule = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      // Prefer absolute path, then relativePath, then name
      const filePath = module.path || module.relativePath || module.name;
      console.log('AI Assist analyzing:', { filePath, module });

      const response = await fetch(`${API_URL}/api/admin/ai-assist/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          errorMessage: module.error || 'Module failed to load',
          stackTrace: module.stackTrace || module.stack || null,
          exports: module.expectedExports || module.exports || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data);
        setBackupId(data.backupId);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const applyFix = async () => {
    if (!analysis?.suggestedFix) return;

    const confirmed = window.confirm(
      'Apply the suggested fix?\n\nA backup will be created so you can rollback if needed.'
    );

    if (!confirmed) return;

    setApplying(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/ai-assist/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: analysis.relativePath || module.relativePath,
          suggestedFix: analysis.suggestedFix,
          backupId: backupId
        })
      });

      const data = await response.json();

      if (data.success) {
        setFixApplied(true);
        setBackupId(data.backupId);
        if (onFixApplied) {
          onFixApplied();
        }
      } else {
        setError(data.error || 'Failed to apply fix');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setApplying(false);
    }
  };

  const rollback = async () => {
    if (!backupId) return;

    const confirmed = window.confirm('Restore the original file content?');
    if (!confirmed) return;

    setRollingBack(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/ai-assist/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: backupId,
          filePath: analysis?.filePath
        })
      });

      const data = await response.json();

      if (data.success) {
        setFixApplied(false);
        setAnalysis(null);
        setBackupId(null);
      } else {
        setError(data.error || 'Rollback failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setRollingBack(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Bot size={20} color="#6366f1" />
            <span>AI Debug Assistant</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Module Info */}
        <div style={styles.moduleInfo}>
          <div style={styles.moduleLabel}>Failing Module</div>
          <div style={styles.moduleName}>{module.name}</div>
          {(module.path || module.relativePath) && (
            <div style={styles.modulePath}>
              <FileCode size={12} />
              {module.path || module.relativePath}
            </div>
          )}
          {module.error && (
            <div style={styles.errorBox}>
              <AlertTriangle size={14} color="#ef4444" />
              <span>{module.error}</span>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {!analysis && !analyzing && (
          <button
            onClick={analyzeModule}
            style={styles.analyzeBtn}
            disabled={analyzing}
          >
            <Sparkles size={18} />
            Analyze with AI
          </button>
        )}

        {/* Loading State */}
        {analyzing && (
          <div style={styles.loadingSection}>
            <RefreshCw size={32} color="#6366f1" className="spin" />
            <p style={styles.loadingText}>Analyzing error with Claude...</p>
            <p style={styles.loadingSubtext}>This may take a few seconds</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={styles.errorDisplay}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div style={styles.analysisSection}>
            {/* Success/Applied Banner */}
            {fixApplied && (
              <div style={styles.successBanner}>
                <CheckCircle2 size={16} />
                Fix applied successfully!
              </div>
            )}

            {/* Analysis */}
            <div style={styles.resultBlock}>
              <div style={styles.resultLabel}>
                <Zap size={14} />
                Analysis
              </div>
              <div style={styles.resultContent}>{analysis.analysis}</div>
            </div>

            {/* Root Cause */}
            {analysis.rootCause && (
              <div style={styles.resultBlock}>
                <div style={styles.resultLabel}>
                  <AlertTriangle size={14} />
                  Root Cause
                </div>
                <div style={styles.resultContent}>{analysis.rootCause}</div>
              </div>
            )}

            {/* Explanation */}
            {analysis.explanation && (
              <div style={styles.resultBlock}>
                <div style={styles.resultLabel}>Changes Made</div>
                <div style={styles.explanationContent}>
                  {analysis.explanation.split('\n').map((line, i) => (
                    <div key={i} style={styles.explanationLine}>{line}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Fix */}
            {analysis.suggestedFix && (
              <div style={styles.codeSection}>
                <div style={styles.codeSectionHeader}>
                  <span style={styles.resultLabel}>Suggested Fix</span>
                  <div style={styles.codeActions}>
                    <button
                      onClick={() => copyToClipboard(analysis.suggestedFix)}
                      style={styles.codeActionBtn}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      style={styles.codeActionBtn}
                    >
                      {showOriginal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showOriginal ? 'Hide Original' : 'Show Original'}
                    </button>
                  </div>
                </div>
                <pre style={styles.codeBlock}>
                  {analysis.suggestedFix}
                </pre>
              </div>
            )}

            {/* Original Content (collapsible) */}
            {showOriginal && analysis.originalContent && (
              <div style={styles.codeSection}>
                <div style={styles.resultLabel}>Original Content</div>
                <pre style={{ ...styles.codeBlock, opacity: 0.7 }}>
                  {analysis.originalContent}
                </pre>
              </div>
            )}

            {/* Confidence & Notes */}
            <div style={styles.metaInfo}>
              {analysis.confidence && (
                <span style={{
                  ...styles.confidenceBadge,
                  backgroundColor: analysis.confidence === 'high' ? '#10b98120' :
                    analysis.confidence === 'medium' ? '#f59e0b20' : '#ef444420',
                  color: analysis.confidence === 'high' ? '#10b981' :
                    analysis.confidence === 'medium' ? '#f59e0b' : '#ef4444'
                }}>
                  <Shield size={12} />
                  {analysis.confidence} confidence
                </span>
              )}
              {analysis.usage && (
                <span style={styles.usageBadge}>
                  <Clock size={12} />
                  {analysis.usage.durationMs}ms • {analysis.usage.inputTokens + analysis.usage.outputTokens} tokens
                </span>
              )}
            </div>

            {analysis.additionalNotes && (
              <div style={styles.notesBox}>
                <strong>Note:</strong> {analysis.additionalNotes}
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              {!fixApplied ? (
                <button
                  onClick={applyFix}
                  disabled={applying || !analysis.suggestedFix}
                  style={styles.applyBtn}
                >
                  {applying ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Apply Fix
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={rollback}
                  disabled={rollingBack || !backupId}
                  style={styles.rollbackBtn}
                >
                  {rollingBack ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      Rolling back...
                    </>
                  ) : (
                    <>
                      <Undo2 size={16} />
                      Rollback
                    </>
                  )}
                </button>
              )}
              <button
                onClick={analyzeModule}
                disabled={analyzing}
                style={styles.reanalyzeBtn}
              >
                <RefreshCw size={16} />
                Re-analyze
              </button>
            </div>
          </div>
        )}

        {/* CSS for spin animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '520px',
    height: '100vh',
    backgroundColor: '#0d0d12',
    borderLeft: '1px solid #2a2a3a',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a3a',
    backgroundColor: '#12121a'
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  moduleInfo: {
    padding: '20px',
    borderBottom: '1px solid #2a2a3a'
  },
  moduleLabel: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  moduleName: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px'
  },
  modulePath: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#ef444415',
    border: '1px solid #ef444430',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#f87171'
  },
  analyzeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '20px',
    padding: '14px 24px',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  loadingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: '14px',
    marginTop: '16px',
    marginBottom: '4px'
  },
  loadingSubtext: {
    color: '#666',
    fontSize: '12px'
  },
  errorDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '20px',
    padding: '14px',
    backgroundColor: '#ef444420',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px'
  },
  analysisSection: {
    flex: 1,
    overflow: 'auto',
    padding: '20px'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#10b98120',
    border: '1px solid #10b981',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px'
  },
  resultBlock: {
    marginBottom: '16px'
  },
  resultLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
    fontWeight: 500
  },
  resultContent: {
    fontSize: '14px',
    color: '#ccc',
    lineHeight: 1.6
  },
  explanationContent: {
    fontSize: '13px',
    color: '#ccc',
    lineHeight: 1.6
  },
  explanationLine: {
    marginBottom: '4px'
  },
  codeSection: {
    marginBottom: '16px'
  },
  codeSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  codeActions: {
    display: 'flex',
    gap: '8px'
  },
  codeActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '4px',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer'
  },
  codeBlock: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1a2e',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '12px',
    color: '#10b981',
    fontFamily: 'Monaco, Consolas, monospace',
    overflow: 'auto',
    maxHeight: '300px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  metaInfo: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  confidenceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'capitalize'
  },
  usageBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#888'
  },
  notesBox: {
    padding: '12px',
    backgroundColor: '#f59e0b15',
    border: '1px solid #f59e0b30',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#fbbf24',
    marginBottom: '16px'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #2a2a3a'
  },
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  rollbackBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  reanalyzeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#888',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer'
  }
};
