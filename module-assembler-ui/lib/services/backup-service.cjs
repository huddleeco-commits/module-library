/**
 * Backup Service
 * Creates and restores project snapshots for rollback functionality
 *
 * Features:
 * - Timestamped backups before regeneration
 * - Quick restore to previous working state
 * - Backup metadata tracking
 * - Auto-cleanup of old backups (configurable retention)
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const GENERATED_PROJECTS_PATH = process.env.GENERATED_PROJECTS_PATH ||
  path.join(__dirname, '..', '..', '..', '..', 'generated-projects');

const BACKUPS_PATH = process.env.BACKUPS_PATH ||
  path.join(__dirname, '..', '..', '..', '..', 'project-backups');

// How many backups to keep per project (0 = unlimited)
const MAX_BACKUPS_PER_PROJECT = parseInt(process.env.MAX_BACKUPS_PER_PROJECT || '5', 10);

// Metadata file for tracking backups
const METADATA_FILE = path.join(BACKUPS_PATH, 'backup-metadata.json');

/**
 * Initialize backup system (create directories, load metadata)
 */
function initBackupSystem() {
  if (!fs.existsSync(BACKUPS_PATH)) {
    fs.mkdirSync(BACKUPS_PATH, { recursive: true });
    console.log(`Created backups directory: ${BACKUPS_PATH}`);
  }

  // Initialize metadata file if it doesn't exist
  if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({ backups: [] }, null, 2));
  }

  return true;
}

/**
 * Load backup metadata
 */
function loadMetadata() {
  initBackupSystem();
  try {
    const data = fs.readFileSync(METADATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { backups: [] };
  }
}

/**
 * Save backup metadata
 */
function saveMetadata(metadata) {
  initBackupSystem();
  fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

/**
 * Sanitize project name for file system
 */
function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate unique backup ID
 */
function generateBackupId() {
  return `backup-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Copy directory recursively
 */
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules and .git to save space and speed
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Get directory size in bytes
 */
function getDirectorySize(dirPath) {
  let size = 0;

  if (!fs.existsSync(dirPath)) return 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip node_modules and .git
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      try {
        const stats = fs.statSync(fullPath);
        size += stats.size;
      } catch (e) {
        // Skip files we can't stat
      }
    }
  }

  return size;
}

/**
 * Format bytes to human readable
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Find project path (handles different naming conventions)
 */
function findProjectPath(projectName) {
  const sanitized = sanitizeName(projectName);
  const possiblePaths = [
    path.join(GENERATED_PROJECTS_PATH, projectName),
    path.join(GENERATED_PROJECTS_PATH, sanitized),
    path.join(GENERATED_PROJECTS_PATH, projectName.replace(/\s+/g, '-')),
    path.join(GENERATED_PROJECTS_PATH, projectName.replace(/'/g, '').replace(/\s+/g, '-'))
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Create a backup of a project
 * @param {string} projectName - Name of the project to backup
 * @param {string} reason - Reason for backup (e.g., "Before regeneration", "Manual backup")
 * @returns {object} Backup result with id, path, and metadata
 */
async function createBackup(projectName, reason = 'Manual backup') {
  initBackupSystem();

  const projectPath = findProjectPath(projectName);

  if (!projectPath) {
    return {
      success: false,
      error: `Project "${projectName}" not found`
    };
  }

  const sanitized = sanitizeName(projectName);
  const backupId = generateBackupId();
  const timestamp = new Date().toISOString();
  const backupFolder = `${sanitized}-${timestamp.replace(/[:.]/g, '-')}`;
  const backupPath = path.join(BACKUPS_PATH, sanitized, backupFolder);

  try {
    // Create backup directory
    fs.mkdirSync(path.join(BACKUPS_PATH, sanitized), { recursive: true });

    // Copy project to backup location
    console.log(`Creating backup: ${projectPath} -> ${backupPath}`);
    copyDirectoryRecursive(projectPath, backupPath);

    // Get backup size
    const size = getDirectorySize(backupPath);

    // Update metadata
    const metadata = loadMetadata();
    const backupRecord = {
      id: backupId,
      projectName,
      sanitizedName: sanitized,
      timestamp,
      reason,
      path: backupPath,
      sourcePath: projectPath,
      size,
      sizeFormatted: formatSize(size)
    };

    metadata.backups.push(backupRecord);
    saveMetadata(metadata);

    // Cleanup old backups if needed
    await cleanupOldBackups(sanitized);

    return {
      success: true,
      backup: backupRecord
    };
  } catch (e) {
    console.error(`Backup failed for ${projectName}:`, e);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * List all backups for a project
 * @param {string} projectName - Name of the project (or null for all)
 * @returns {array} List of backup records
 */
function listBackups(projectName = null) {
  const metadata = loadMetadata();

  if (!projectName) {
    return metadata.backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  const sanitized = sanitizeName(projectName);
  return metadata.backups
    .filter(b => b.sanitizedName === sanitized)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get a specific backup by ID
 * @param {string} backupId - Backup ID
 * @returns {object|null} Backup record or null
 */
function getBackup(backupId) {
  const metadata = loadMetadata();
  return metadata.backups.find(b => b.id === backupId) || null;
}

/**
 * Restore a project from backup
 * @param {string} backupId - Backup ID to restore
 * @param {boolean} createBackupFirst - Create backup of current state before restoring
 * @returns {object} Restore result
 */
async function restoreBackup(backupId, createBackupFirst = true) {
  const backup = getBackup(backupId);

  if (!backup) {
    return {
      success: false,
      error: `Backup "${backupId}" not found`
    };
  }

  if (!fs.existsSync(backup.path)) {
    return {
      success: false,
      error: `Backup files not found at ${backup.path}`
    };
  }

  const projectPath = backup.sourcePath || findProjectPath(backup.projectName);

  try {
    // Create backup of current state before restoring (if project exists)
    if (createBackupFirst && projectPath && fs.existsSync(projectPath)) {
      console.log('Creating safety backup of current state...');
      const safetyBackup = await createBackup(backup.projectName, 'Before restore');
      if (safetyBackup.success) {
        console.log(`Safety backup created: ${safetyBackup.backup.id}`);
      }
    }

    // Delete current project (if exists)
    if (projectPath && fs.existsSync(projectPath)) {
      console.log(`Removing current project: ${projectPath}`);
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // Copy backup to project location
    const restorePath = projectPath || path.join(GENERATED_PROJECTS_PATH, backup.sanitizedName);
    console.log(`Restoring from backup: ${backup.path} -> ${restorePath}`);
    copyDirectoryRecursive(backup.path, restorePath);

    return {
      success: true,
      restoredFrom: backup,
      restoredTo: restorePath
    };
  } catch (e) {
    console.error(`Restore failed for ${backup.projectName}:`, e);
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Delete a specific backup
 * @param {string} backupId - Backup ID to delete
 * @returns {object} Delete result
 */
function deleteBackup(backupId) {
  const backup = getBackup(backupId);

  if (!backup) {
    return {
      success: false,
      error: `Backup "${backupId}" not found`
    };
  }

  try {
    // Delete backup files
    if (fs.existsSync(backup.path)) {
      fs.rmSync(backup.path, { recursive: true, force: true });
    }

    // Remove from metadata
    const metadata = loadMetadata();
    metadata.backups = metadata.backups.filter(b => b.id !== backupId);
    saveMetadata(metadata);

    return {
      success: true,
      deleted: backup
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}

/**
 * Delete all backups for a project
 * @param {string} projectName - Project name
 * @returns {object} Delete result
 */
function deleteAllBackups(projectName) {
  const sanitized = sanitizeName(projectName);
  const backups = listBackups(projectName);

  let deleted = 0;
  let errors = [];

  for (const backup of backups) {
    const result = deleteBackup(backup.id);
    if (result.success) {
      deleted++;
    } else {
      errors.push(result.error);
    }
  }

  // Try to remove the project's backup folder
  const projectBackupDir = path.join(BACKUPS_PATH, sanitized);
  if (fs.existsSync(projectBackupDir)) {
    try {
      fs.rmdirSync(projectBackupDir);
    } catch (e) {
      // Directory might not be empty or not exist
    }
  }

  return {
    success: errors.length === 0,
    deleted,
    errors
  };
}

/**
 * Clean up old backups to stay within retention limit
 * @param {string} sanitizedName - Sanitized project name
 */
async function cleanupOldBackups(sanitizedName) {
  if (MAX_BACKUPS_PER_PROJECT <= 0) return;

  const backups = listBackups(sanitizedName);

  if (backups.length <= MAX_BACKUPS_PER_PROJECT) return;

  // Sort by timestamp (oldest first) and delete excess
  const sorted = [...backups].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const toDelete = sorted.slice(0, backups.length - MAX_BACKUPS_PER_PROJECT);

  for (const backup of toDelete) {
    console.log(`Auto-removing old backup: ${backup.id} (${backup.timestamp})`);
    deleteBackup(backup.id);
  }
}

/**
 * Get backup statistics
 */
function getBackupStats() {
  const metadata = loadMetadata();
  const stats = {
    totalBackups: metadata.backups.length,
    totalSize: 0,
    projects: {},
    oldestBackup: null,
    newestBackup: null
  };

  for (const backup of metadata.backups) {
    stats.totalSize += backup.size || 0;

    if (!stats.projects[backup.sanitizedName]) {
      stats.projects[backup.sanitizedName] = {
        name: backup.projectName,
        count: 0,
        totalSize: 0
      };
    }

    stats.projects[backup.sanitizedName].count++;
    stats.projects[backup.sanitizedName].totalSize += backup.size || 0;

    if (!stats.oldestBackup || new Date(backup.timestamp) < new Date(stats.oldestBackup.timestamp)) {
      stats.oldestBackup = backup;
    }

    if (!stats.newestBackup || new Date(backup.timestamp) > new Date(stats.newestBackup.timestamp)) {
      stats.newestBackup = backup;
    }
  }

  stats.totalSizeFormatted = formatSize(stats.totalSize);

  return stats;
}

module.exports = {
  initBackupSystem,
  createBackup,
  listBackups,
  getBackup,
  restoreBackup,
  deleteBackup,
  deleteAllBackups,
  getBackupStats,
  findProjectPath,
  sanitizeName,
  BACKUPS_PATH,
  GENERATED_PROJECTS_PATH
};
