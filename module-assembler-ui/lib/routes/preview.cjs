/**
 * Preview Routes
 * Handles preview generation and serving
 *
 * Phase 1: Static HTML preview generation
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { generatePreviewHtml } = require('../generators/preview-generator.cjs');

// Store previews in memory with expiration
const previewCache = new Map();
const PREVIEW_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Clean up expired previews periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, preview] of previewCache.entries()) {
    if (now - preview.createdAt > PREVIEW_EXPIRY_MS) {
      previewCache.delete(id);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Create preview routes
 */
function createPreviewRoutes() {
  const router = express.Router();

  /**
   * POST /api/preview/generate
   * Generate a new preview and return its URL
   */
  router.post('/generate', (req, res) => {
    try {
      const config = req.body;

      // Validate required fields
      if (!config.businessName) {
        config.businessName = 'My Business';
      }

      // Generate preview HTML
      const html = generatePreviewHtml(config);

      // Create unique ID for this preview
      const previewId = crypto.randomBytes(8).toString('hex');

      // Store in cache
      previewCache.set(previewId, {
        html,
        config,
        createdAt: Date.now()
      });

      console.log(`[Preview] Generated preview ${previewId} for "${config.businessName}"`);

      res.json({
        success: true,
        previewId,
        previewUrl: `/api/preview/view/${previewId}`
      });
    } catch (error) {
      console.error('[Preview] Generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/preview/view/:id
   * Serve a generated preview by ID
   */
  router.get('/view/:id', (req, res) => {
    const { id } = req.params;

    const preview = previewCache.get(id);
    if (!preview) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview Not Found</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #1a1a2e;
              color: #fff;
              font-family: system-ui, sans-serif;
            }
            .message {
              text-align: center;
            }
            h1 { font-size: 48px; margin: 0 0 16px; }
            p { color: #888; }
          </style>
        </head>
        <body>
          <div class="message">
            <h1>Preview Expired</h1>
            <p>This preview is no longer available. Please regenerate.</p>
          </div>
        </body>
        </html>
      `);
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(preview.html);
  });

  /**
   * GET /api/preview/status/:id
   * Check if a preview exists
   */
  router.get('/status/:id', (req, res) => {
    const { id } = req.params;
    const preview = previewCache.get(id);

    if (preview) {
      res.json({
        exists: true,
        createdAt: preview.createdAt,
        expiresAt: preview.createdAt + PREVIEW_EXPIRY_MS,
        businessName: preview.config.businessName
      });
    } else {
      res.json({ exists: false });
    }
  });

  /**
   * DELETE /api/preview/:id
   * Delete a preview from cache
   */
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const deleted = previewCache.delete(id);
    res.json({ success: deleted });
  });

  return router;
}

module.exports = { createPreviewRoutes };
