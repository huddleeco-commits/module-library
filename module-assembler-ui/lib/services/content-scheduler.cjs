/**
 * Content Scheduler Service
 *
 * A scheduling system for content management that allows:
 * - Scheduling content for future publication
 * - Managing scheduled content (create, update, delete)
 * - Calendar view of scheduled content
 * - Recurring content schedules
 * - AI-powered optimal posting time suggestions
 *
 * Uses in-memory storage by default, with optional database persistence.
 */

const crypto = require('crypto');

/**
 * Status constants for scheduled content
 */
const SCHEDULE_STATUS = {
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft'
};

/**
 * Platform configurations with optimal posting times
 */
const PLATFORM_CONFIG = {
  'twitter': {
    name: 'Twitter/X',
    icon: '𝕏',
    optimalTimes: [
      { day: 'weekday', hours: [9, 12, 17] },
      { day: 'weekend', hours: [10, 14] }
    ],
    maxLength: 280
  },
  'linkedin': {
    name: 'LinkedIn',
    icon: '💼',
    optimalTimes: [
      { day: 'weekday', hours: [7, 10, 12, 17] },
      { day: 'weekend', hours: [] }
    ],
    maxLength: 3000
  },
  'instagram': {
    name: 'Instagram',
    icon: '📸',
    optimalTimes: [
      { day: 'weekday', hours: [11, 13, 19] },
      { day: 'weekend', hours: [10, 11, 17] }
    ],
    maxLength: 2200
  },
  'facebook': {
    name: 'Facebook',
    icon: '👍',
    optimalTimes: [
      { day: 'weekday', hours: [9, 13, 16] },
      { day: 'weekend', hours: [12, 13] }
    ],
    maxLength: 5000
  },
  'blog': {
    name: 'Blog Post',
    icon: '📝',
    optimalTimes: [
      { day: 'weekday', hours: [10, 14] },
      { day: 'weekend', hours: [9] }
    ],
    maxLength: null
  },
  'email': {
    name: 'Email',
    icon: '📧',
    optimalTimes: [
      { day: 'weekday', hours: [6, 10, 14, 20] },
      { day: 'weekend', hours: [] }
    ],
    maxLength: null
  }
};

/**
 * Recurrence patterns
 */
const RECURRENCE_PATTERNS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly'
};

/**
 * Content Scheduler class
 */
class ContentScheduler {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.db = options.db || null;
    this.client = null;
    this.model = options.model || 'claude-sonnet-4-20250514';

    // In-memory storage (can be replaced with DB)
    this.scheduledContent = new Map();
    this.publishCallbacks = new Map();
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: '📅', success: '✅', warn: '⚠️', error: '❌', schedule: '⏰' }[type] || '📅';
      console.log(`${prefix} [ContentScheduler] ${message}`);
    }
  }

  /**
   * Generate a unique ID for scheduled content
   */
  generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Schedule content for future publication
   * @param {Object} params - Schedule parameters
   * @returns {Object} Scheduled content entry
   */
  async scheduleContent(params) {
    const {
      title,
      content,
      platform,
      scheduledDate,
      scheduledTime,
      timezone = 'UTC',
      recurrence = RECURRENCE_PATTERNS.NONE,
      tags = [],
      metadata = {},
      status = SCHEDULE_STATUS.SCHEDULED
    } = params;

    // Validation
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    if (!platform || !PLATFORM_CONFIG[platform]) {
      throw new Error(`Invalid platform. Available platforms: ${Object.keys(PLATFORM_CONFIG).join(', ')}`);
    }

    if (!scheduledDate) {
      throw new Error('Scheduled date is required');
    }

    // Check content length for platform
    const platformConfig = PLATFORM_CONFIG[platform];
    if (platformConfig.maxLength && content.length > platformConfig.maxLength) {
      throw new Error(`Content exceeds ${platform} character limit of ${platformConfig.maxLength}`);
    }

    // Parse and validate scheduled datetime
    const scheduledDateTime = this.parseScheduledDateTime(scheduledDate, scheduledTime, timezone);

    if (scheduledDateTime < new Date() && status === SCHEDULE_STATUS.SCHEDULED) {
      throw new Error('Scheduled date must be in the future');
    }

    const id = this.generateId();
    const entry = {
      id,
      title: title || content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      content,
      platform,
      platformName: platformConfig.name,
      platformIcon: platformConfig.icon,
      scheduledDate,
      scheduledTime: scheduledTime || '09:00',
      scheduledDateTime: scheduledDateTime.toISOString(),
      timezone,
      recurrence,
      tags,
      metadata,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in memory (or database if available)
    if (this.db && this.db.saveScheduledContent) {
      await this.db.saveScheduledContent(entry);
    } else {
      this.scheduledContent.set(id, entry);
    }

    this.log(`Scheduled content for ${platform} at ${scheduledDateTime.toISOString()}`, 'schedule');

    return {
      success: true,
      entry
    };
  }

  /**
   * Parse scheduled date and time into a Date object
   */
  parseScheduledDateTime(date, time, timezone) {
    const timeStr = time || '09:00';
    const dateTimeStr = `${date}T${timeStr}:00`;

    // For simplicity, we'll treat timezone as an offset in the metadata
    // In production, use a proper timezone library like moment-timezone
    return new Date(dateTimeStr);
  }

  /**
   * Get all scheduled content
   * @param {Object} filters - Optional filters
   * @returns {Array} List of scheduled content
   */
  async listSchedule(filters = {}) {
    const {
      platform,
      status,
      startDate,
      endDate,
      tags,
      limit = 100,
      offset = 0
    } = filters;

    let entries;

    if (this.db && this.db.getScheduledContent) {
      entries = await this.db.getScheduledContent(filters);
    } else {
      entries = Array.from(this.scheduledContent.values());
    }

    // Apply filters
    if (platform) {
      entries = entries.filter(e => e.platform === platform);
    }

    if (status) {
      entries = entries.filter(e => e.status === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      entries = entries.filter(e => new Date(e.scheduledDateTime) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      entries = entries.filter(e => new Date(e.scheduledDateTime) <= end);
    }

    if (tags && tags.length > 0) {
      entries = entries.filter(e =>
        tags.some(tag => e.tags.includes(tag))
      );
    }

    // Sort by scheduled date
    entries.sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime));

    // Apply pagination
    const total = entries.length;
    entries = entries.slice(offset, offset + limit);

    return {
      success: true,
      entries,
      total,
      limit,
      offset,
      hasMore: (offset + entries.length) < total
    };
  }

  /**
   * Get a single scheduled content entry by ID
   * @param {string} id - Entry ID
   * @returns {Object} Scheduled content entry
   */
  async getScheduleEntry(id) {
    let entry;

    if (this.db && this.db.getScheduledContentById) {
      entry = await this.db.getScheduledContentById(id);
    } else {
      entry = this.scheduledContent.get(id);
    }

    if (!entry) {
      throw new Error(`Scheduled content not found: ${id}`);
    }

    return {
      success: true,
      entry
    };
  }

  /**
   * Update a scheduled content entry
   * @param {string} id - Entry ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated entry
   */
  async updateSchedule(id, updates) {
    let entry;

    if (this.db && this.db.getScheduledContentById) {
      entry = await this.db.getScheduledContentById(id);
    } else {
      entry = this.scheduledContent.get(id);
    }

    if (!entry) {
      throw new Error(`Scheduled content not found: ${id}`);
    }

    // Don't allow updating published or cancelled content
    if ([SCHEDULE_STATUS.PUBLISHED, SCHEDULE_STATUS.CANCELLED].includes(entry.status)) {
      throw new Error(`Cannot update ${entry.status} content`);
    }

    // Apply updates
    const allowedUpdates = ['title', 'content', 'platform', 'scheduledDate', 'scheduledTime',
                           'timezone', 'recurrence', 'tags', 'metadata', 'status'];

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        entry[key] = updates[key];
      }
    }

    // Revalidate platform if changed
    if (updates.platform) {
      if (!PLATFORM_CONFIG[updates.platform]) {
        throw new Error(`Invalid platform: ${updates.platform}`);
      }
      entry.platformName = PLATFORM_CONFIG[updates.platform].name;
      entry.platformIcon = PLATFORM_CONFIG[updates.platform].icon;
    }

    // Recalculate scheduled datetime if date/time changed
    if (updates.scheduledDate || updates.scheduledTime) {
      entry.scheduledDateTime = this.parseScheduledDateTime(
        entry.scheduledDate,
        entry.scheduledTime,
        entry.timezone
      ).toISOString();
    }

    entry.updatedAt = new Date().toISOString();

    // Save updates
    if (this.db && this.db.updateScheduledContent) {
      await this.db.updateScheduledContent(id, entry);
    } else {
      this.scheduledContent.set(id, entry);
    }

    this.log(`Updated scheduled content ${id}`, 'success');

    return {
      success: true,
      entry
    };
  }

  /**
   * Delete a scheduled content entry
   * @param {string} id - Entry ID
   * @returns {Object} Deletion result
   */
  async deleteSchedule(id) {
    let entry;

    if (this.db && this.db.getScheduledContentById) {
      entry = await this.db.getScheduledContentById(id);
    } else {
      entry = this.scheduledContent.get(id);
    }

    if (!entry) {
      throw new Error(`Scheduled content not found: ${id}`);
    }

    // Delete the entry
    if (this.db && this.db.deleteScheduledContent) {
      await this.db.deleteScheduledContent(id);
    } else {
      this.scheduledContent.delete(id);
    }

    this.log(`Deleted scheduled content ${id}`, 'success');

    return {
      success: true,
      deletedId: id
    };
  }

  /**
   * Get calendar view of scheduled content
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Object} Calendar data
   */
  async getCalendarView(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

    const { entries } = await this.listSchedule({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Group by date
    const calendar = {};
    for (const entry of entries) {
      const date = entry.scheduledDate;
      if (!calendar[date]) {
        calendar[date] = [];
      }
      calendar[date].push(entry);
    }

    // Generate all days in the month
    const days = [];
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        dayOfWeek: new Date(year, month - 1, day).getDay(),
        entries: calendar[dateStr] || []
      });
    }

    return {
      success: true,
      year,
      month,
      days,
      totalScheduled: entries.length
    };
  }

  /**
   * Get optimal posting times for a platform
   * @param {string} platform - Platform name
   * @param {Date} targetDate - Target date
   * @returns {Array} Suggested times
   */
  getSuggestedTimes(platform, targetDate = new Date()) {
    const config = PLATFORM_CONFIG[platform];
    if (!config) {
      throw new Error(`Invalid platform: ${platform}`);
    }

    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType = isWeekend ? 'weekend' : 'weekday';

    const optimalConfig = config.optimalTimes.find(t => t.day === dayType);
    const hours = optimalConfig ? optimalConfig.hours : [9];

    return {
      success: true,
      platform,
      platformName: config.name,
      suggestedTimes: hours.map(h => ({
        hour: h,
        time: `${String(h).padStart(2, '0')}:00`,
        label: h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`
      })),
      isWeekend,
      note: isWeekend && hours.length === 0
        ? `${config.name} typically has lower engagement on weekends`
        : null
    };
  }

  /**
   * Get publishing statistics
   * @returns {Object} Statistics
   */
  async getStats() {
    const { entries } = await this.listSchedule({ limit: 10000 });

    const stats = {
      total: entries.length,
      byStatus: {},
      byPlatform: {},
      upcoming: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const entry of entries) {
      // By status
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;

      // By platform
      stats.byPlatform[entry.platform] = (stats.byPlatform[entry.platform] || 0) + 1;

      // Time-based counts
      const scheduledDate = new Date(entry.scheduledDateTime);
      if (entry.status === SCHEDULE_STATUS.SCHEDULED && scheduledDate > now) {
        stats.upcoming++;
        if (scheduledDate <= weekFromNow) {
          stats.thisWeek++;
        }
        if (scheduledDate <= monthFromNow) {
          stats.thisMonth++;
        }
      }
    }

    return {
      success: true,
      stats
    };
  }

  /**
   * Bulk schedule content
   * @param {Array} items - Array of schedule parameters
   * @returns {Object} Results of bulk scheduling
   */
  async bulkSchedule(items) {
    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const result = await this.scheduleContent(item);
        results.push(result.entry);
      } catch (error) {
        errors.push({
          item,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      scheduled: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get available platforms
   */
  static getPlatforms() {
    return PLATFORM_CONFIG;
  }

  /**
   * Get available recurrence patterns
   */
  static getRecurrencePatterns() {
    return RECURRENCE_PATTERNS;
  }

  /**
   * Get available statuses
   */
  static getStatuses() {
    return SCHEDULE_STATUS;
  }
}

module.exports = {
  ContentScheduler,
  PLATFORM_CONFIG,
  RECURRENCE_PATTERNS,
  SCHEDULE_STATUS
};
