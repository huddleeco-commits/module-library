/**
 * Content Scheduler Routes
 *
 * API endpoints for the content scheduling system.
 * Handles: schedule CRUD, calendar view, bulk operations, statistics
 */

const express = require('express');

/**
 * Create content scheduler routes
 * @param {Object} deps - Dependencies (db for persistence, etc.)
 */
function createContentSchedulerRoutes(deps = {}) {
  const router = express.Router();
  const { db } = deps;

  // Rate limiter for scheduling endpoints
  const schedulerRateLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: { success: false, error: 'Too many requests. Please wait a moment before trying again.' }
  });

  // Create scheduler instance
  const { ContentScheduler, PLATFORM_CONFIG, RECURRENCE_PATTERNS, SCHEDULE_STATUS } = require('../services/content-scheduler.cjs');
  const scheduler = new ContentScheduler({ db });

  /**
   * GET /api/scheduler/platforms
   * Get available platforms with their configurations
   */
  router.get('/platforms', (req, res) => {
    const platforms = Object.entries(PLATFORM_CONFIG).map(([key, config]) => ({
      key,
      ...config
    }));

    res.json({
      success: true,
      platforms,
      count: platforms.length
    });
  });

  /**
   * GET /api/scheduler/recurrence-patterns
   * Get available recurrence patterns
   */
  router.get('/recurrence-patterns', (req, res) => {
    const patterns = Object.entries(RECURRENCE_PATTERNS).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase()
    }));

    res.json({
      success: true,
      patterns,
      count: patterns.length
    });
  });

  /**
   * GET /api/scheduler/statuses
   * Get available schedule statuses
   */
  router.get('/statuses', (req, res) => {
    const statuses = Object.entries(SCHEDULE_STATUS).map(([key, value]) => ({
      key,
      value,
      label: key.charAt(0) + key.slice(1).toLowerCase()
    }));

    res.json({
      success: true,
      statuses,
      count: statuses.length
    });
  });

  /**
   * GET /api/scheduler/suggested-times/:platform
   * Get optimal posting times for a platform
   */
  router.get('/suggested-times/:platform', (req, res) => {
    const { platform } = req.params;
    const { date } = req.query;

    try {
      const targetDate = date ? new Date(date) : new Date();
      const result = scheduler.getSuggestedTimes(platform, targetDate);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/scheduler/schedule
   * List all scheduled content with optional filters
   *
   * Query params:
   * - platform: Filter by platform
   * - status: Filter by status
   * - startDate: Filter by start date (ISO format)
   * - endDate: Filter by end date (ISO format)
   * - tags: Comma-separated tags to filter by
   * - limit: Max results (default 100)
   * - offset: Pagination offset (default 0)
   */
  router.get('/schedule', async (req, res) => {
    const {
      platform,
      status,
      startDate,
      endDate,
      tags,
      limit = 100,
      offset = 0
    } = req.query;

    console.log('\n' + '─'.repeat(40));
    console.log('📅 LIST SCHEDULED CONTENT');
    console.log('─'.repeat(40));

    try {
      const filters = {
        platform,
        status,
        startDate,
        endDate,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      };

      const result = await scheduler.listSchedule(filters);

      console.log(`   ✅ Found ${result.entries.length} of ${result.total} entries`);

      res.json(result);

    } catch (error) {
      console.error(`   ❌ List failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/scheduler/schedule/:id
   * Get a single scheduled content entry
   */
  router.get('/schedule/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const result = await scheduler.getScheduleEntry(id);
      res.json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/scheduler/schedule
   * Schedule new content
   *
   * Request body:
   * {
   *   title: 'Optional title',
   *   content: 'Content to schedule',
   *   platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'blog' | 'email',
   *   scheduledDate: '2024-03-15',
   *   scheduledTime: '14:00',
   *   timezone: 'UTC',
   *   recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly',
   *   tags: ['tag1', 'tag2'],
   *   metadata: { ... }
   * }
   */
  router.post('/schedule', schedulerRateLimiter, async (req, res) => {
    const {
      title,
      content,
      platform,
      scheduledDate,
      scheduledTime,
      timezone = 'UTC',
      recurrence = 'none',
      tags = [],
      metadata = {}
    } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('📅 SCHEDULE CONTENT');
    console.log('='.repeat(60));
    console.log(`   Platform: ${platform}`);
    console.log(`   Date: ${scheduledDate} ${scheduledTime || ''}`);
    console.log(`   Content: "${(content || '').substring(0, 50)}${(content || '').length > 50 ? '...' : ''}"`);
    console.log('─'.repeat(40));

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'content is required'
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'platform is required'
      });
    }

    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        error: 'scheduledDate is required (YYYY-MM-DD format)'
      });
    }

    try {
      const result = await scheduler.scheduleContent({
        title,
        content,
        platform,
        scheduledDate,
        scheduledTime,
        timezone,
        recurrence,
        tags,
        metadata
      });

      console.log(`   ✅ Scheduled with ID: ${result.entry.id}`);
      console.log('='.repeat(60));

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Scheduling failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/scheduler/schedule/:id
   * Update a scheduled content entry
   *
   * Request body: Same as POST, all fields optional
   */
  router.put('/schedule/:id', schedulerRateLimiter, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    console.log('\n' + '─'.repeat(40));
    console.log(`📝 UPDATE SCHEDULE: ${id}`);
    console.log('─'.repeat(40));

    try {
      const result = await scheduler.updateSchedule(id, updates);

      console.log(`   ✅ Updated successfully`);

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Update failed: ${error.message}`);

      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/scheduler/schedule/:id
   * Delete a scheduled content entry
   */
  router.delete('/schedule/:id', schedulerRateLimiter, async (req, res) => {
    const { id } = req.params;

    console.log('\n' + '─'.repeat(40));
    console.log(`🗑️ DELETE SCHEDULE: ${id}`);
    console.log('─'.repeat(40));

    try {
      const result = await scheduler.deleteSchedule(id);

      console.log(`   ✅ Deleted successfully`);

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Delete failed: ${error.message}`);

      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/scheduler/calendar/:year/:month
   * Get calendar view for a specific month
   */
  router.get('/calendar/:year/:month', async (req, res) => {
    const { year, month } = req.params;

    console.log('\n' + '─'.repeat(40));
    console.log(`📆 CALENDAR VIEW: ${year}-${month}`);
    console.log('─'.repeat(40));

    try {
      const result = await scheduler.getCalendarView(
        parseInt(year, 10),
        parseInt(month, 10)
      );

      console.log(`   ✅ ${result.totalScheduled} items scheduled`);

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Calendar failed: ${error.message}`);

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/scheduler/stats
   * Get scheduling statistics
   */
  router.get('/stats', async (req, res) => {
    console.log('\n' + '─'.repeat(40));
    console.log('📊 SCHEDULER STATS');
    console.log('─'.repeat(40));

    try {
      const result = await scheduler.getStats();

      console.log(`   ✅ Total: ${result.stats.total}, Upcoming: ${result.stats.upcoming}`);

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Stats failed: ${error.message}`);

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/scheduler/bulk-schedule
   * Schedule multiple content items at once
   *
   * Request body:
   * {
   *   items: [
   *     { content, platform, scheduledDate, scheduledTime, ... },
   *     { content, platform, scheduledDate, scheduledTime, ... }
   *   ]
   * }
   */
  router.post('/bulk-schedule', schedulerRateLimiter, async (req, res) => {
    const { items } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('📦 BULK SCHEDULE');
    console.log('='.repeat(60));

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items array is required'
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 items per bulk schedule request'
      });
    }

    console.log(`   Items: ${items.length}`);
    console.log('─'.repeat(40));

    try {
      const result = await scheduler.bulkSchedule(items);

      console.log(`   ✅ Scheduled: ${result.scheduled}`);
      if (result.failed > 0) {
        console.log(`   ⚠️ Failed: ${result.failed}`);
      }
      console.log('='.repeat(60));

      res.json(result);

    } catch (error) {
      console.error(`   ❌ Bulk schedule failed: ${error.message}`);
      console.log('='.repeat(60));

      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/scheduler/schedule/:id/status
   * Update just the status of a scheduled item
   */
  router.patch('/schedule/:id/status', schedulerRateLimiter, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(SCHEDULE_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${Object.values(SCHEDULE_STATUS).join(', ')}`
      });
    }

    try {
      const result = await scheduler.updateSchedule(id, { status });
      res.json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createContentSchedulerRoutes };
