/**
 * Queue Service - BullMQ Job Queue Management
 *
 * Handles adding jobs to the assembly queue and checking job status.
 * The actual job processing is done by worker.cjs running as a separate process.
 *
 * Usage:
 *   const queueService = require('./lib/services/queue-service.cjs');
 *   await queueService.initialize();
 *   const jobId = await queueService.addAssemblyJob({ name: 'my-project', ... });
 *   const status = await queueService.getJobStatus(jobId);
 */

const { Queue, QueueEvents } = require('bullmq');

// Redis connection config (same as worker.cjs)
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
};

// Queue name - must match worker.cjs
const QUEUE_NAME = 'assembly-queue';

// Queue instance (lazy initialized)
let assemblyQueue = null;
let queueEvents = null;
let isInitialized = false;
let initializationError = null;

/**
 * Initialize the queue connection
 * Call this once at server startup
 */
async function initialize() {
  if (isInitialized) return true;

  try {
    console.log('   📦 Initializing BullMQ queue service...');

    // Test Redis connection first with a simple socket check
    const net = require('net');
    const canConnect = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(redisConnection.port, redisConnection.host);
    });

    if (!canConnect) {
      console.log('   ⚠️ Redis not available - queue service disabled (sync fallback active)');
      initializationError = new Error('Redis not reachable');
      return false;
    }

    assemblyQueue = new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 2, // Retry failed jobs once
        backoff: {
          type: 'exponential',
          delay: 5000 // 5 second initial delay
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 100 // Keep last 100 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600 // Keep failed jobs for 7 days
        }
      }
    });

    // Queue events for real-time updates (optional, but useful for SSE)
    queueEvents = new QueueEvents(QUEUE_NAME, {
      connection: redisConnection
    });

    // Test connection by getting queue info
    await assemblyQueue.getJobCounts();

    isInitialized = true;
    console.log('   ✅ BullMQ queue service initialized');
    return true;

  } catch (err) {
    initializationError = err;
    console.log('   ⚠️ Queue service unavailable - using sync fallback');
    return false;
  }
}

/**
 * Check if queue service is available
 */
function isAvailable() {
  return isInitialized && assemblyQueue !== null;
}

/**
 * Get initialization error if any
 */
function getInitError() {
  return initializationError;
}

/**
 * Add a project assembly job to the queue
 *
 * @param {Object} jobData - Job data matching what server.cjs currently passes to spawn
 * @param {string} jobData.name - Project name (sanitized)
 * @param {string} jobData.industry - Industry key
 * @param {Object} jobData.description - Description with pages, text, etc.
 * @param {Object} jobData.theme - Theme config
 * @param {boolean} jobData.autoDeploy - Whether to auto-deploy after build
 * @param {string} jobData.adminTier - Admin tier (standard/pro/enterprise)
 * @param {string[]} jobData.adminModules - Selected admin modules
 * @param {boolean} jobData.testMode - Whether to use test mode (no AI calls)
 * @param {number} jobData.generationId - Database generation ID for tracking
 * @returns {Promise<string>} Job ID
 */
async function addAssemblyJob(jobData) {
  if (!isAvailable()) {
    throw new Error('Queue service not available - Redis may be down');
  }

  const { name } = jobData;

  // Add job with a unique ID based on project name and timestamp
  const jobId = `${name}-${Date.now()}`;

  const job = await assemblyQueue.add('assemble-project', jobData, {
    jobId,
    // Priority: lower = higher priority (default is 0)
    priority: jobData.priority || 0
  });

  console.log(`   📋 Job ${job.id} added to queue: ${name}`);

  return job.id;
}

/**
 * Get status of a specific job
 *
 * @param {string} jobId - The job ID returned from addAssemblyJob
 * @returns {Promise<Object>} Job status object
 */
async function getJobStatus(jobId) {
  if (!isAvailable()) {
    return {
      status: 'error',
      error: 'Queue service not available'
    };
  }

  const job = await assemblyQueue.getJob(jobId);

  if (!job) {
    return {
      status: 'not_found',
      jobId
    };
  }

  const state = await job.getState();
  const progress = job.progress || 0;

  const status = {
    jobId: job.id,
    status: state, // 'waiting', 'active', 'completed', 'failed', 'delayed'
    progress: typeof progress === 'number' ? progress : 0,
    data: {
      name: job.data.name,
      industry: job.data.industry,
      testMode: job.data.testMode
    },
    timestamps: {
      created: job.timestamp,
      started: job.processedOn || null,
      finished: job.finishedOn || null
    }
  };

  // Add result or error based on state
  if (state === 'completed') {
    status.result = job.returnvalue;
  } else if (state === 'failed') {
    status.error = job.failedReason;
    status.attemptsMade = job.attemptsMade;
  }

  return status;
}

/**
 * Get all jobs in queue (for admin dashboard)
 *
 * @param {Object} options
 * @param {number} options.start - Start index (default 0)
 * @param {number} options.end - End index (default 50)
 * @returns {Promise<Object>} Queue status with jobs by state
 */
async function getQueueStatus(options = {}) {
  if (!isAvailable()) {
    return {
      available: false,
      error: 'Queue service not available'
    };
  }

  const { start = 0, end = 50 } = options;

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    assemblyQueue.getJobs(['waiting'], start, end),
    assemblyQueue.getJobs(['active'], start, end),
    assemblyQueue.getJobs(['completed'], start, end),
    assemblyQueue.getJobs(['failed'], start, end),
    assemblyQueue.getJobs(['delayed'], start, end)
  ]);

  const counts = await assemblyQueue.getJobCounts();

  return {
    available: true,
    counts,
    jobs: {
      waiting: waiting.map(formatJobSummary),
      active: active.map(formatJobSummary),
      completed: completed.map(formatJobSummary),
      failed: failed.map(formatJobSummary),
      delayed: delayed.map(formatJobSummary)
    }
  };
}

/**
 * Format job for summary display
 */
function formatJobSummary(job) {
  return {
    id: job.id,
    name: job.data?.name || 'Unknown',
    industry: job.data?.industry || 'Unknown',
    progress: job.progress || 0,
    created: job.timestamp,
    started: job.processedOn,
    finished: job.finishedOn,
    attemptsMade: job.attemptsMade
  };
}

/**
 * Listen for job events (for SSE streaming)
 *
 * @param {string} jobId - Job ID to listen to
 * @param {Function} callback - Called with { event, data }
 * @returns {Function} Cleanup function to stop listening
 */
function listenToJob(jobId, callback) {
  if (!queueEvents) {
    callback({ event: 'error', data: { message: 'Queue events not available' } });
    return () => {};
  }

  const onProgress = ({ jobId: id, data }) => {
    if (id === jobId) {
      callback({ event: 'progress', data });
    }
  };

  const onCompleted = ({ jobId: id, returnvalue }) => {
    if (id === jobId) {
      callback({ event: 'completed', data: returnvalue });
    }
  };

  const onFailed = ({ jobId: id, failedReason }) => {
    if (id === jobId) {
      callback({ event: 'failed', data: { error: failedReason } });
    }
  };

  queueEvents.on('progress', onProgress);
  queueEvents.on('completed', onCompleted);
  queueEvents.on('failed', onFailed);

  // Return cleanup function
  return () => {
    queueEvents.off('progress', onProgress);
    queueEvents.off('completed', onCompleted);
    queueEvents.off('failed', onFailed);
  };
}

/**
 * Cancel/remove a job from queue
 *
 * @param {string} jobId - Job ID to cancel
 * @returns {Promise<boolean>} Whether job was successfully removed
 */
async function cancelJob(jobId) {
  if (!isAvailable()) {
    return false;
  }

  const job = await assemblyQueue.getJob(jobId);
  if (!job) {
    return false;
  }

  // Only cancel if not actively running
  const state = await job.getState();
  if (state === 'active') {
    // Can't cancel active jobs safely - they need to complete
    return false;
  }

  await job.remove();
  return true;
}

/**
 * Gracefully close queue connections
 */
async function close() {
  if (queueEvents) {
    await queueEvents.close();
  }
  if (assemblyQueue) {
    await assemblyQueue.close();
  }
  isInitialized = false;
  console.log('   📦 BullMQ queue service closed');
}

module.exports = {
  initialize,
  isAvailable,
  getInitError,
  addAssemblyJob,
  getJobStatus,
  getQueueStatus,
  listenToJob,
  cancelJob,
  close
};
