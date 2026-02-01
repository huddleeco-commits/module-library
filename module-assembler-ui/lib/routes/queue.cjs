/**
 * Queue Routes - Job Status and Queue Management API
 *
 * Endpoints:
 *   GET  /api/queue/job/:jobId         - Get status of a specific job
 *   GET  /api/queue/job/:jobId/stream  - SSE stream for real-time job updates
 *   GET  /api/queue/status             - Get overall queue status (admin)
 *   DELETE /api/queue/job/:jobId       - Cancel a pending job
 */

const express = require('express');
const queueService = require('../services/queue-service.cjs');

function createQueueRoutes() {
  const router = express.Router();

  /**
   * GET /api/queue/job/:jobId
   * Get the current status of a specific job
   */
  router.get('/job/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const status = await queueService.getJobStatus(jobId);
      res.json({ success: true, ...status });
    } catch (err) {
      console.error('Job status error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get job status',
        details: err.message
      });
    }
  });

  /**
   * GET /api/queue/job/:jobId/stream
   * SSE endpoint for real-time job progress updates
   *
   * Usage in frontend:
   *   const eventSource = new EventSource('/api/queue/job/123/stream');
   *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
   */
  router.get('/job/:jobId/stream', async (req, res) => {
    const { jobId } = req.params;

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    });

    // Send initial status
    const initialStatus = await queueService.getJobStatus(jobId);
    res.write(`data: ${JSON.stringify({ event: 'status', data: initialStatus })}\n\n`);

    // If job is already done, close immediately
    if (initialStatus.status === 'completed' || initialStatus.status === 'failed') {
      res.write(`data: ${JSON.stringify({ event: 'end', data: initialStatus })}\n\n`);
      res.end();
      return;
    }

    // Listen for job events
    const cleanup = queueService.listenToJob(jobId, ({ event, data }) => {
      try {
        res.write(`data: ${JSON.stringify({ event, data })}\n\n`);

        // Close connection when job completes or fails
        if (event === 'completed' || event === 'failed') {
          res.write(`data: ${JSON.stringify({ event: 'end', data: {} })}\n\n`);
          setTimeout(() => res.end(), 100);
        }
      } catch (err) {
        // Connection closed by client
        cleanup();
      }
    });

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch (err) {
        clearInterval(heartbeat);
        cleanup();
      }
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      cleanup();
    });
  });

  /**
   * GET /api/queue/status
   * Get overall queue status (for admin dashboard)
   */
  router.get('/status', async (req, res) => {
    try {
      const status = await queueService.getQueueStatus({
        start: parseInt(req.query.start) || 0,
        end: parseInt(req.query.end) || 50
      });

      res.json({ success: true, ...status });
    } catch (err) {
      console.error('Queue status error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get queue status',
        details: err.message
      });
    }
  });

  /**
   * DELETE /api/queue/job/:jobId
   * Cancel a pending job (cannot cancel active jobs)
   */
  router.delete('/job/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const canceled = await queueService.cancelJob(jobId);

      if (canceled) {
        res.json({ success: true, message: 'Job canceled' });
      } else {
        res.status(400).json({
          success: false,
          error: 'Cannot cancel job - may be active or not found'
        });
      }
    } catch (err) {
      console.error('Cancel job error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel job',
        details: err.message
      });
    }
  });

  /**
   * GET /api/queue/health
   * Check if queue service is available
   */
  router.get('/health', (req, res) => {
    const available = queueService.isAvailable();
    const error = queueService.getInitError();

    res.json({
      success: available,
      available,
      error: error ? error.message : null,
      message: available
        ? 'Queue service is running'
        : 'Queue service unavailable - Redis may be down'
    });
  });

  return router;
}

module.exports = { createQueueRoutes };
