/**
 * StagingEditor
 *
 * Visual site editor with iframe preview.
 * Allows click-to-select elements and edit text directly.
 * Supports save draft and publish functionality.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  Upload,
  RotateCcw,
  RefreshCw,
  Type,
  Image,
  Palette,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  Undo2,
  History
} from 'lucide-react';

export function StagingEditor({ onAction }) {
  const iframeRef = useRef(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [pendingEdits, setPendingEdits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [frontendUrl, setFrontendUrl] = useState(null);

  // Derive the frontend URL from the admin URL or fetch from brain.json
  useEffect(() => {
    const deriveFrontendUrl = async () => {
      // First, try to fetch from brain.json
      try {
        const response = await fetch('/brain.json');
        if (response.ok) {
          const brain = await response.json();
          if (brain.siteUrl || brain.frontendUrl) {
            setFrontendUrl(brain.siteUrl || brain.frontendUrl);
            return;
          }
        }
      } catch (e) {
        // brain.json not available, continue to fallback
      }

      // Fallback: derive from current URL
      // If we're on admin.example.com, the frontend is example.com
      const currentHost = window.location.hostname;
      const protocol = window.location.protocol;

      if (currentHost.startsWith('admin.')) {
        // Remove 'admin.' prefix to get frontend URL
        const frontendHost = currentHost.replace(/^admin\./, '');
        setFrontendUrl(`${protocol}//${frontendHost}`);
      } else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        // Local development: use port 5173 (Vite default) for frontend
        // Admin typically runs on 3000, frontend preview on 5173
        setFrontendUrl(`${protocol}//${currentHost}:5173`);
      } else {
        // Last resort: use current origin (may not be correct)
        setFrontendUrl(window.location.origin);
      }
    };

    deriveFrontendUrl();
  }, []);

  // Load existing drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const response = await fetch('/api/admin/staging/content');
      if (response.ok) {
        const data = await response.json();
        if (data.drafts && data.drafts.length > 0) {
          setPendingEdits(data.drafts.map(d => ({
            selector: d.selector,
            element_type: d.element_type,
            content: d.content,
            styles: d.styles || {}
          })));
        }
      }
    } catch (err) {
      console.warn('Failed to load drafts:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/admin/staging/history?limit=20');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  // Setup iframe communication
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'element-selected') {
        setSelectedElement(event.data.element);
      } else if (event.data.type === 'element-edited') {
        handleElementEdit(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Inject edit mode script into iframe
  const injectEditMode = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const script = `
      (function() {
        const editableSelectors = 'h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, [data-editable]';
        let selectedEl = null;
        let hoverEl = null;

        // Create highlight overlay
        const overlay = document.createElement('div');
        overlay.id = 'edit-overlay';
        overlay.style.cssText = 'position: fixed; pointer-events: none; border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.1); z-index: 99999; display: none; transition: all 0.15s ease;';
        document.body.appendChild(overlay);

        // Create selection overlay
        const selection = document.createElement('div');
        selection.id = 'selection-overlay';
        selection.style.cssText = 'position: fixed; pointer-events: none; border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.1); z-index: 99998; display: none;';
        document.body.appendChild(selection);

        function generateSelector(el) {
          if (el.dataset.editable) return '[data-editable="' + el.dataset.editable + '"]';
          if (el.id) return '#' + el.id;

          const path = [];
          let current = el;
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) { path.unshift('#' + current.id); break; }
            if (current.className && typeof current.className === 'string') {
              const classes = current.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('hover:'));
              if (classes.length) selector += '.' + classes.slice(0, 2).join('.');
            }
            const parent = current.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children).filter(s => s.tagName === current.tagName);
              if (siblings.length > 1) selector += ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')';
            }
            path.unshift(selector);
            current = current.parentElement;
          }
          return path.join(' > ');
        }

        function getElementType(el) {
          const tag = el.tagName.toLowerCase();
          if (tag === 'img') return 'image';
          if (tag === 'a') return 'link';
          if (['h1','h2','h3','h4','h5','h6'].includes(tag)) return 'heading';
          return 'text';
        }

        function positionOverlay(target, overlayEl) {
          const rect = target.getBoundingClientRect();
          overlayEl.style.top = rect.top + 'px';
          overlayEl.style.left = rect.left + 'px';
          overlayEl.style.width = rect.width + 'px';
          overlayEl.style.height = rect.height + 'px';
          overlayEl.style.display = 'block';
        }

        document.addEventListener('mouseover', (e) => {
          if (!window.__editMode) return;
          const target = e.target.closest(editableSelectors);
          if (target && target !== selectedEl) {
            hoverEl = target;
            positionOverlay(target, overlay);
          }
        });

        document.addEventListener('mouseout', (e) => {
          if (!window.__editMode) return;
          if (!e.relatedTarget || !e.relatedTarget.closest) {
            overlay.style.display = 'none';
            hoverEl = null;
          }
        });

        document.addEventListener('click', (e) => {
          if (!window.__editMode) return;
          const target = e.target.closest(editableSelectors);
          if (target) {
            e.preventDefault();
            e.stopPropagation();

            selectedEl = target;
            positionOverlay(target, selection);
            overlay.style.display = 'none';

            window.parent.postMessage({
              type: 'element-selected',
              element: {
                selector: generateSelector(target),
                type: getElementType(target),
                content: target.tagName === 'IMG' ? target.src : target.textContent,
                tagName: target.tagName.toLowerCase()
              }
            }, '*');
          }
        }, true);

        // Make elements editable on double-click
        document.addEventListener('dblclick', (e) => {
          if (!window.__editMode) return;
          const target = e.target.closest(editableSelectors);
          if (target && target.tagName !== 'IMG') {
            e.preventDefault();
            target.contentEditable = 'true';
            target.focus();

            // Select all text
            const range = document.createRange();
            range.selectNodeContents(target);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, true);

        // Handle blur to save edits
        document.addEventListener('blur', (e) => {
          if (!window.__editMode) return;
          if (e.target.contentEditable === 'true') {
            e.target.contentEditable = 'false';

            window.parent.postMessage({
              type: 'element-edited',
              selector: generateSelector(e.target),
              element_type: getElementType(e.target),
              content: e.target.textContent
            }, '*');
          }
        }, true);

        // Handle Enter key to confirm edit
        document.addEventListener('keydown', (e) => {
          if (e.target.contentEditable === 'true') {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.target.blur();
            }
            if (e.key === 'Escape') {
              e.target.contentEditable = 'false';
              // Could restore original content here
            }
          }
        }, true);

        window.__editMode = true;
        console.log('Edit mode enabled');
      })();
    `;

    try {
      iframe.contentWindow.eval(script);
    } catch (err) {
      console.warn('Failed to inject edit mode:', err);
    }
  }, []);

  // Toggle edit mode
  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);

    if (newMode) {
      injectEditMode();
    } else {
      // Disable edit mode in iframe
      try {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.__editMode = false;
        }
      } catch (err) {
        console.warn('Failed to disable edit mode:', err);
      }
      setSelectedElement(null);
    }
  };

  // Handle element edit from iframe
  const handleElementEdit = (data) => {
    const { selector, element_type, content } = data;

    setPendingEdits(prev => {
      const existing = prev.findIndex(e => e.selector === selector);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], content };
        return updated;
      }
      return [...prev, { selector, element_type, content, styles: {} }];
    });
  };

  // Save drafts to server
  const handleSaveDraft = async () => {
    if (pendingEdits.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/staging/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edits: pendingEdits })
      });

      if (!response.ok) {
        throw new Error('Failed to save drafts');
      }

      setLastSaved(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Publish changes to production
  const handlePublish = async () => {
    if (pendingEdits.length === 0) return;

    setPublishing(true);
    setError(null);

    try {
      // First save any pending edits
      await handleSaveDraft();

      // Then publish
      const response = await fetch('/api/admin/staging/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to publish changes');
      }

      const data = await response.json();

      // Clear pending edits
      setPendingEdits([]);
      setLastSaved(null);

      // Refresh iframe to show published changes
      refreshPreview();

      // Notify parent if callback provided
      if (onAction) {
        onAction([{ type: 'publish', count: data.publishedCount }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Discard all draft changes
  const handleDiscard = async () => {
    if (!confirm('Discard all pending changes? This cannot be undone.')) return;

    try {
      await fetch('/api/admin/staging/discard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      setPendingEdits([]);
      setSelectedElement(null);
      refreshPreview();
    } catch (err) {
      setError(err.message);
    }
  };

  // Refresh the preview iframe
  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Get viewport dimensions
  const getViewportStyle = () => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <button
            style={{
              ...styles.toolButton,
              ...(editMode ? styles.toolButtonActive : {})
            }}
            onClick={toggleEditMode}
            title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          >
            <Type size={18} />
            <span>{editMode ? 'Editing' : 'Edit'}</span>
          </button>

          <div style={styles.divider} />

          <div style={styles.viewportButtons}>
            <button
              style={{
                ...styles.iconButton,
                ...(previewMode === 'desktop' ? styles.iconButtonActive : {})
              }}
              onClick={() => setPreviewMode('desktop')}
              title="Desktop View"
            >
              <Monitor size={18} />
            </button>
            <button
              style={{
                ...styles.iconButton,
                ...(previewMode === 'tablet' ? styles.iconButtonActive : {})
              }}
              onClick={() => setPreviewMode('tablet')}
              title="Tablet View"
            >
              <Tablet size={18} />
            </button>
            <button
              style={{
                ...styles.iconButton,
                ...(previewMode === 'mobile' ? styles.iconButtonActive : {})
              }}
              onClick={() => setPreviewMode('mobile')}
              title="Mobile View"
            >
              <Smartphone size={18} />
            </button>
          </div>

          <div style={styles.divider} />

          <button
            style={styles.iconButton}
            onClick={refreshPreview}
            title="Refresh Preview"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div style={styles.toolbarRight}>
          {lastSaved && (
            <span style={styles.savedText}>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {pendingEdits.length > 0 && (
            <>
              <span style={styles.pendingBadge}>
                {pendingEdits.length} change{pendingEdits.length !== 1 ? 's' : ''}
              </span>

              <button
                style={styles.discardButton}
                onClick={handleDiscard}
                title="Discard Changes"
              >
                <Undo2 size={16} />
              </button>
            </>
          )}

          <button
            style={styles.iconButton}
            onClick={() => {
              loadHistory();
              setShowHistory(true);
            }}
            title="View History"
          >
            <History size={18} />
          </button>

          <button
            style={{
              ...styles.saveButton,
              opacity: pendingEdits.length === 0 ? 0.5 : 1
            }}
            onClick={handleSaveDraft}
            disabled={pendingEdits.length === 0 || saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            style={{
              ...styles.publishButton,
              opacity: pendingEdits.length === 0 ? 0.5 : 1
            }}
            onClick={handlePublish}
            disabled={pendingEdits.length === 0 || publishing}
          >
            <Upload size={16} />
            <span>{publishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button style={styles.errorClose} onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.main}>
        {/* Preview Area */}
        <div style={styles.previewContainer}>
          <div
            style={{
              ...styles.previewFrame,
              ...getViewportStyle()
            }}
          >
            {frontendUrl ? (
              <iframe
                ref={iframeRef}
                src={frontendUrl}
                style={styles.iframe}
                title="Site Preview"
                onLoad={() => {
                  if (editMode) {
                    injectEditMode();
                  }
                }}
              />
            ) : (
              <div style={styles.loadingPreview}>
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Loading preview...</span>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel (shown when element selected) */}
        {selectedElement && (
          <div style={styles.propertiesPanel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Element Properties</h3>
              <button
                style={styles.panelClose}
                onClick={() => setSelectedElement(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.panelContent}>
              <div style={styles.propertyGroup}>
                <label style={styles.propertyLabel}>Type</label>
                <span style={styles.propertyValue}>
                  {selectedElement.type}
                </span>
              </div>

              <div style={styles.propertyGroup}>
                <label style={styles.propertyLabel}>Tag</label>
                <code style={styles.propertyCode}>
                  &lt;{selectedElement.tagName}&gt;
                </code>
              </div>

              <div style={styles.propertyGroup}>
                <label style={styles.propertyLabel}>Selector</label>
                <code style={styles.selectorCode}>
                  {selectedElement.selector}
                </code>
              </div>

              <div style={styles.propertyGroup}>
                <label style={styles.propertyLabel}>Content</label>
                <textarea
                  style={styles.contentTextarea}
                  value={selectedElement.content}
                  onChange={(e) => {
                    setSelectedElement({
                      ...selectedElement,
                      content: e.target.value
                    });
                  }}
                  onBlur={() => {
                    handleElementEdit({
                      selector: selectedElement.selector,
                      element_type: selectedElement.type,
                      content: selectedElement.content
                    });
                  }}
                  rows={4}
                />
              </div>

              <p style={styles.helpText}>
                Double-click elements in the preview to edit text directly.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div style={styles.modal} onClick={() => setShowHistory(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Content History</h2>
              <button
                style={styles.modalClose}
                onClick={() => setShowHistory(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.historyList}>
              {history.length === 0 ? (
                <p style={styles.emptyHistory}>No history yet</p>
              ) : (
                history.map(item => (
                  <div key={item.id} style={styles.historyItem}>
                    <div style={styles.historyMeta}>
                      <span style={styles.historyAction}>
                        {item.action}
                      </span>
                      <span style={styles.historyDate}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <code style={styles.historySelector}>
                      {item.selector}
                    </code>
                    <p style={styles.historyContent}>
                      {item.content?.substring(0, 100)}
                      {item.content?.length > 100 && '...'}
                    </p>
                    {item.published_by_name && (
                      <span style={styles.historyUser}>
                        by {item.published_by_name}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#1a1a2e'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)'
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  toolButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    color: 'var(--color-text)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toolButtonActive: {
    backgroundColor: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: '#ffffff'
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--color-border)'
  },
  viewportButtons: {
    display: 'flex',
    gap: '4px'
  },
  iconButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  iconButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: 'var(--color-primary)'
  },
  savedText: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  pendingBadge: {
    padding: '4px 10px',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#eab308'
  },
  discardButton: {
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#ef4444',
    cursor: 'pointer'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    color: 'var(--color-text)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  publishButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    fontSize: '13px'
  },
  errorClose: {
    marginLeft: 'auto',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer'
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  previewContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px',
    overflow: 'auto',
    backgroundColor: '#1a1a2e'
  },
  previewFrame: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  loadingPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '100%',
    color: 'var(--color-text-muted)',
    fontSize: '14px'
  },
  propertiesPanel: {
    width: '320px',
    backgroundColor: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--color-border)'
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0
  },
  panelClose: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer'
  },
  panelContent: {
    padding: '16px',
    flex: 1,
    overflowY: 'auto'
  },
  propertyGroup: {
    marginBottom: '16px'
  },
  propertyLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: '6px'
  },
  propertyValue: {
    fontSize: '14px',
    color: 'var(--color-text)',
    textTransform: 'capitalize'
  },
  propertyCode: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#3b82f6'
  },
  selectorCode: {
    display: 'block',
    padding: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#22c55e',
    wordBreak: 'break-all'
  },
  contentTextarea: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    color: 'var(--color-text)',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  helpText: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
    marginTop: '16px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '600px',
    maxHeight: '80vh',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--color-border)'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0
  },
  modalClose: {
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer'
  },
  historyList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px'
  },
  emptyHistory: {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    padding: '40px'
  },
  historyItem: {
    padding: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  historyAction: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#22c55e'
  },
  historyDate: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  historySelector: {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3b82f6',
    marginBottom: '8px'
  },
  historyContent: {
    fontSize: '13px',
    color: 'var(--color-text)',
    margin: 0
  },
  historyUser: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    marginTop: '8px'
  }
};

export default StagingEditor;
