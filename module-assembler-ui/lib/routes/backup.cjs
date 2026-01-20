/**
 * Backup Routes
 * API endpoints for project backup and restore functionality
 *
 * Endpoints:
 * - GET /api/backups - List all backups (or for specific project)
 * - GET /api/backups/stats - Get backup statistics
 * - GET /api/backups/:id - Get specific backup details
 * - POST /api/backups/create - Create a new backup
 * - POST /api/backups/restore - Restore from a backup
 * - DELETE /api/backups/:id - Delete a backup
 * - DELETE /api/backups/project/:name - Delete all backups for a project
 */

const express = require('express');
const router = express.Router();

const {
  createBackup,
  listBackups,
  getBackup,
  restoreBackup,
  deleteBackup,
  deleteAllBackups,
  getBackupStats,
  findProjectPath
} = require('../services/backup-service.cjs');

/**
 * GET /api/backups
 * List all backups or filter by project name
 * Query params: ?project=ProjectName
 */
router.get('/', (req, res) => {
  try {
    const { project } = req.query;
    const backups = listBackups(project || null);

    res.json({
      success: true,
      count: backups.length,
      backups
    });
  } catch (e) {
    console.error('Error listing backups:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * GET /api/backups/stats
 * Get backup statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getBackupStats();

    res.json({
      success: true,
      stats
    });
  } catch (e) {
    console.error('Error getting backup stats:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * GET /api/backups/:id
 * Get specific backup details
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const backup = getBackup(id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: `Backup "${id}" not found`
      });
    }

    res.json({
      success: true,
      backup
    });
  } catch (e) {
    console.error('Error getting backup:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * POST /api/backups/create
 * Create a new backup
 * Body: { projectName: string, reason?: string }
 */
router.post('/create', async (req, res) => {
  try {
    const { projectName, reason } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    // Check if project exists
    const projectPath = findProjectPath(projectName);
    if (!projectPath) {
      return res.status(404).json({
        success: false,
        error: `Project "${projectName}" not found`
      });
    }

    const result = await createBackup(projectName, reason || 'Manual backup');

    if (result.success) {
      res.json({
        success: true,
        message: `Backup created for "${projectName}"`,
        backup: result.backup
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (e) {
    console.error('Error creating backup:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * POST /api/backups/restore
 * Restore from a backup
 * Body: { backupId: string, createBackupFirst?: boolean }
 */
router.post('/restore', async (req, res) => {
  try {
    const { backupId, createBackupFirst = true } = req.body;

    if (!backupId) {
      return res.status(400).json({
        success: false,
        error: 'Backup ID is required'
      });
    }

    const backup = getBackup(backupId);
    if (!backup) {
      return res.status(404).json({
        success: false,
        error: `Backup "${backupId}" not found`
      });
    }

    const result = await restoreBackup(backupId, createBackupFirst);

    if (result.success) {
      res.json({
        success: true,
        message: `Restored "${backup.projectName}" from backup`,
        restoredFrom: result.restoredFrom,
        restoredTo: result.restoredTo
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (e) {
    console.error('Error restoring backup:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * DELETE /api/backups/:id
 * Delete a specific backup
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = deleteBackup(id);

    if (result.success) {
      res.json({
        success: true,
        message: `Backup "${id}" deleted`,
        deleted: result.deleted
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (e) {
    console.error('Error deleting backup:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

/**
 * DELETE /api/backups/project/:name
 * Delete all backups for a project
 */
router.delete('/project/:name', (req, res) => {
  try {
    const { name } = req.params;

    const result = deleteAllBackups(name);

    if (result.success) {
      res.json({
        success: true,
        message: `All backups for "${name}" deleted`,
        deletedCount: result.deleted
      });
    } else {
      res.json({
        success: false,
        deletedCount: result.deleted,
        errors: result.errors
      });
    }
  } catch (e) {
    console.error('Error deleting backups:', e);
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

module.exports = router;
