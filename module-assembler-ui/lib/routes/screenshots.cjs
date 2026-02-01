/**
 * Screenshot Gallery Routes
 *
 * API endpoints for capturing and viewing screenshot galleries
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { screenshotService } = require('../services/screenshot-service.cjs');

// Base paths
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'output');
const GALLERY_PATH = path.join(OUTPUT_PATH, 'screenshot-gallery');

/**
 * POST /api/screenshots/capture/:projectId
 * Capture screenshots for a project
 */
router.post('/capture/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { quick = false, viewports, pages } = req.body;

  // Find project path
  const projectPath = findProjectPath(projectId);
  if (!projectPath) {
    return res.status(404).json({
      success: false,
      error: `Project not found: ${projectId}`
    });
  }

  console.log(`[Screenshots] Capturing project: ${projectId}`);

  try {
    let results;
    if (quick) {
      results = await screenshotService.quickCapture(projectPath);
    } else {
      results = await screenshotService.captureProject(projectPath, { viewports, pages });
    }

    res.json({
      success: true,
      projectId,
      ...results
    });
  } catch (err) {
    console.error('[Screenshots] Capture failed:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/screenshots/gallery
 * List all screenshot galleries
 */
router.get('/gallery', (req, res) => {
  try {
    if (!fs.existsSync(GALLERY_PATH)) {
      return res.json({ success: true, galleries: [] });
    }

    const galleries = fs.readdirSync(GALLERY_PATH)
      .filter(dir => {
        const stat = fs.statSync(path.join(GALLERY_PATH, dir));
        return stat.isDirectory();
      })
      .map(dir => {
        const manifestPath = path.join(GALLERY_PATH, dir, 'manifest.json');
        let manifest = null;
        if (fs.existsSync(manifestPath)) {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        }

        // Extract project name and timestamp from folder name
        const parts = dir.split('-');
        const timestamp = parts.slice(-6).join('-'); // Last 6 parts are timestamp
        const projectName = parts.slice(0, -6).join('-');

        return {
          id: dir,
          projectName,
          timestamp,
          path: `/api/screenshots/gallery/${dir}`,
          manifest
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Most recent first

    res.json({ success: true, galleries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/screenshots/gallery/:galleryId
 * Get a specific gallery's screenshots
 */
router.get('/gallery/:galleryId', (req, res) => {
  const { galleryId } = req.params;
  const galleryPath = path.join(GALLERY_PATH, galleryId);

  if (!fs.existsSync(galleryPath)) {
    return res.status(404).json({ success: false, error: 'Gallery not found' });
  }

  try {
    const manifestPath = path.join(galleryPath, 'manifest.json');
    let manifest = { screenshots: [] };
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }

    // Add URLs for each screenshot
    const screenshots = manifest.screenshots.map(s => ({
      ...s,
      url: `/api/screenshots/image/${galleryId}/${s.filename}`
    }));

    res.json({
      success: true,
      galleryId,
      ...manifest,
      screenshots
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/screenshots/image/:galleryId/:filename
 * Serve a screenshot image
 */
router.get('/image/:galleryId/:filename', (req, res) => {
  const { galleryId, filename } = req.params;
  const imagePath = path.join(GALLERY_PATH, galleryId, filename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Image not found');
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  fs.createReadStream(imagePath).pipe(res);
});

/**
 * GET /api/screenshots/project/:projectId
 * Get screenshots for a specific project (latest gallery)
 */
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;

  try {
    if (!fs.existsSync(GALLERY_PATH)) {
      return res.json({ success: true, galleries: [] });
    }

    // Find all galleries for this project
    const galleries = fs.readdirSync(GALLERY_PATH)
      .filter(dir => dir.startsWith(projectId + '-'))
      .map(dir => {
        const manifestPath = path.join(GALLERY_PATH, dir, 'manifest.json');
        let manifest = null;
        if (fs.existsSync(manifestPath)) {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        }
        return { id: dir, manifest };
      })
      .sort((a, b) => b.id.localeCompare(a.id));

    if (galleries.length === 0) {
      return res.json({ success: true, galleries: [], latest: null });
    }

    const latest = galleries[0];
    const screenshots = latest.manifest?.screenshots?.map(s => ({
      ...s,
      url: `/api/screenshots/image/${latest.id}/${s.filename}`
    })) || [];

    res.json({
      success: true,
      projectId,
      galleries: galleries.map(g => g.id),
      latest: {
        galleryId: latest.id,
        ...latest.manifest,
        screenshots
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/screenshots/compare
 * Compare two projects/layouts
 */
router.post('/compare', async (req, res) => {
  const { projectId1, projectId2 } = req.body;

  const path1 = findProjectPath(projectId1);
  const path2 = findProjectPath(projectId2);

  if (!path1 || !path2) {
    return res.status(404).json({
      success: false,
      error: 'One or both projects not found'
    });
  }

  try {
    const comparison = await screenshotService.compareLayouts(path1, path2);
    res.json({ success: true, comparison });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/screenshots/gallery/:galleryId
 * Delete a gallery
 */
router.delete('/gallery/:galleryId', (req, res) => {
  const { galleryId } = req.params;
  const galleryPath = path.join(GALLERY_PATH, galleryId);

  if (!fs.existsSync(galleryPath)) {
    return res.status(404).json({ success: false, error: 'Gallery not found' });
  }

  try {
    fs.rmSync(galleryPath, { recursive: true });
    res.json({ success: true, message: 'Gallery deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Helper: Find project path by ID
 */
function findProjectPath(projectId) {
  // Check prospects folder
  const prospectsPath = path.join(OUTPUT_PATH, 'prospects', projectId, 'full-test');
  if (fs.existsSync(prospectsPath)) {
    return prospectsPath;
  }

  // Check generated-projects folder
  const generatedPath = path.join(OUTPUT_PATH, 'generated-projects', projectId);
  if (fs.existsSync(generatedPath)) {
    return generatedPath;
  }

  // Check direct path
  if (fs.existsSync(projectId)) {
    return projectId;
  }

  return null;
}

module.exports = router;
