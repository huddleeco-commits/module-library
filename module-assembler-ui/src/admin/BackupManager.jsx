/**
 * BackupManager - Admin panel for managing project backups
 * Lists all backups, allows restore and delete operations
 */

import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    marginTop: '4px'
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    padding: '16px 24px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  statValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterInput: {
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    width: '300px'
  },
  refreshBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  backupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  backupCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    transition: 'all 0.2s'
  },
  backupInfo: {
    flex: 1
  },
  backupName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px'
  },
  backupMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: '#666'
  },
  backupReason: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '4px',
    fontStyle: 'italic'
  },
  backupActions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },
  restoreBtn: {
    background: '#10b981',
    color: 'white'
  },
  deleteBtn: {
    background: '#fee2e2',
    color: '#dc2626'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '16px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center'
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '16px'
  },
  modalText: {
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: 1001,
    animation: 'slideIn 0.3s ease'
  }
};

export default function BackupManager() {
  const [backups, setBackups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type: 'restore' | 'delete', backup }
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const [backupsRes, statsRes] = await Promise.all([
        fetch('/api/backups'),
        fetch('/api/backups/stats')
      ]);

      const backupsData = await backupsRes.json();
      const statsData = await statsRes.json();

      if (backupsData.success) {
        setBackups(backupsData.backups);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (e) {
      console.error('Failed to load backups:', e);
      showToast('Failed to load backups', 'error');
    }
    setLoading(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRestore = async (backup) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: backup.id,
          createBackupFirst: true
        })
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Restored "${backup.projectName}" successfully!`);
        loadBackups(); // Refresh list (new backup may have been created)
      } else {
        showToast(data.error || 'Restore failed', 'error');
      }
    } catch (e) {
      showToast('Restore failed: ' + e.message, 'error');
    }
    setProcessing(false);
    setActionModal(null);
  };

  const handleDelete = async (backup) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/backups/${backup.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Deleted backup for "${backup.projectName}"`);
        loadBackups();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch (e) {
      showToast('Delete failed: ' + e.message, 'error');
    }
    setProcessing(false);
    setActionModal(null);
  };

  const filteredBackups = backups.filter(b =>
    b.projectName.toLowerCase().includes(filter.toLowerCase()) ||
    b.reason?.toLowerCase().includes(filter.toLowerCase())
  );

  // Group backups by project
  const groupedBackups = filteredBackups.reduce((acc, backup) => {
    const key = backup.sanitizedName;
    if (!acc[key]) {
      acc[key] = {
        name: backup.projectName,
        backups: []
      };
    }
    acc[key].backups.push(backup);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Backups</h1>
          <p style={styles.subtitle}>Restore previous versions of your projects</p>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Backups</span>
            <span style={styles.statValue}>{stats.totalBackups}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Projects</span>
            <span style={styles.statValue}>{Object.keys(stats.projects || {}).length}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Size</span>
            <span style={styles.statValue}>{stats.totalSizeFormatted}</span>
          </div>
          {stats.newestBackup && (
            <div style={styles.stat}>
              <span style={styles.statLabel}>Latest Backup</span>
              <span style={{...styles.statValue, fontSize: '1rem'}}>
                {formatDate(stats.newestBackup.timestamp)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search backups..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.filterInput}
        />
        <button onClick={loadBackups} style={styles.refreshBtn} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Backup List */}
      {loading ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>...</div>
          <p>Loading backups...</p>
        </div>
      ) : filteredBackups.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <p>No backups found</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Backups are created automatically when regenerating existing projects
          </p>
        </div>
      ) : (
        <div style={styles.backupList}>
          {Object.entries(groupedBackups).map(([key, group]) => (
            <div key={key} style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '12px' }}>
                {group.name} ({group.backups.length} backup{group.backups.length !== 1 ? 's' : ''})
              </h3>
              {group.backups.map(backup => (
                <div key={backup.id} style={styles.backupCard}>
                  <div style={styles.backupInfo}>
                    <div style={styles.backupName}>
                      {backup.projectName}
                    </div>
                    <div style={styles.backupMeta}>
                      <span>{formatDate(backup.timestamp)}</span>
                      <span>{backup.sizeFormatted}</span>
                    </div>
                    {backup.reason && (
                      <div style={styles.backupReason}>{backup.reason}</div>
                    )}
                  </div>
                  <div style={styles.backupActions}>
                    <button
                      style={{...styles.actionBtn, ...styles.restoreBtn}}
                      onClick={() => setActionModal({ type: 'restore', backup })}
                    >
                      Restore
                    </button>
                    <button
                      style={{...styles.actionBtn, ...styles.deleteBtn}}
                      onClick={() => setActionModal({ type: 'delete', backup })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div style={styles.modal} onClick={() => !processing && setActionModal(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {actionModal.type === 'restore' ? (
              <>
                <h2 style={styles.modalTitle}>Restore Backup?</h2>
                <p style={styles.modalText}>
                  This will restore <strong>{actionModal.backup.projectName}</strong> to its state from{' '}
                  <strong>{formatDate(actionModal.backup.timestamp)}</strong>.
                  <br /><br />
                  A new backup of the current state will be created automatically before restoring.
                </p>
                <div style={styles.modalActions}>
                  <button
                    style={{...styles.actionBtn, background: '#e2e8f0', color: '#333'}}
                    onClick={() => setActionModal(null)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    style={{...styles.actionBtn, ...styles.restoreBtn}}
                    onClick={() => handleRestore(actionModal.backup)}
                    disabled={processing}
                  >
                    {processing ? 'Restoring...' : 'Restore'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={styles.modalTitle}>Delete Backup?</h2>
                <p style={styles.modalText}>
                  This will permanently delete the backup for <strong>{actionModal.backup.projectName}</strong> from{' '}
                  <strong>{formatDate(actionModal.backup.timestamp)}</strong>.
                  <br /><br />
                  This action cannot be undone.
                </p>
                <div style={styles.modalActions}>
                  <button
                    style={{...styles.actionBtn, background: '#e2e8f0', color: '#333'}}
                    onClick={() => setActionModal(null)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    style={{...styles.actionBtn, ...styles.deleteBtn}}
                    onClick={() => handleDelete(actionModal.backup)}
                    disabled={processing}
                  >
                    {processing ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'error' ? '#dc2626' : '#10b981'
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
