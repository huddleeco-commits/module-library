/**
 * Blink Assembly Worker
 *
 * This is a dedicated process that listens for jobs on the 'assembly-queue'
 * and executes the heavy lifting of project generation. This keeps the main
 * API server free and responsive.
 *
 * To run: node worker.cjs
 * Or with PM2: pm2 start worker.cjs --name blink-worker
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Worker } = require('bullmq');
const { spawn } = require('child_process');
const fs = require('fs');

// ===========================================
// REDIS CONNECTION
// ===========================================
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
};

// ===========================================
// PATHS
// ===========================================
const MODULE_LIBRARY = process.env.MODULE_LIBRARY_PATH || path.resolve(__dirname, '..');
const GENERATED_PROJECTS = process.env.OUTPUT_PATH || path.resolve(__dirname, '..', '..', 'generated-projects');
const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs');

// ===========================================
// SERVICES (lazy loaded to avoid startup delays)
// ===========================================
let db = null;
let postAssemblyService = null;

function getDb() {
  if (!db && process.env.DATABASE_URL) {
    try {
      db = require('./database/db.cjs');
    } catch (err) {
      console.warn('Worker: Database not available:', err.message);
    }
  }
  return db;
}

function getPostAssemblyService() {
  if (!postAssemblyService) {
    postAssemblyService = require('./lib/services/post-assembly.cjs');
  }
  return postAssemblyService;
}

// ===========================================
// WORKER PROCESS
// ===========================================
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║   ⚡ BLINK Assembly Worker                               ║');
console.log('║                                                          ║');
console.log(`║   Redis:    ${redisConnection.host}:${redisConnection.port}                            ║`);
console.log(`║   Output:   ${GENERATED_PROJECTS.substring(0, 40)}...  ║`);
console.log('║                                                          ║');
console.log('║   Listening for jobs on \'assembly-queue\'...             ║');
console.log('╚══════════════════════════════════════════════════════════╝');

// Create the worker
const worker = new Worker('assembly-queue', async (job) => {
  const {
    name,
    industry,
    description,
    theme,
    autoDeploy,
    adminTier,
    adminModules,
    testMode,
    generationId,
    bundles,
    modules
  } = job.data;

  console.log(`\n╭─────────────────────────────────────────────────────────╮`);
  console.log(`│ 📋 JOB ${job.id}`);
  console.log(`│ 🏷️  Project: ${name}`);
  console.log(`│ 🏭 Industry: ${industry || 'custom'}`);
  console.log(`│ 🧪 Test Mode: ${testMode ? 'YES' : 'no'}`);
  console.log(`╰─────────────────────────────────────────────────────────╯`);

  const startTime = Date.now();
  await job.updateProgress(5);

  // ===========================================
  // PHASE 1: Run Assembly Script
  // ===========================================
  console.log('\n📦 Phase 1: Running assembly script...');

  const sanitizedName = name;
  const args = ['--name', sanitizedName];

  if (industry) {
    args.push('--industry', industry);
  } else if (bundles && bundles.length > 0) {
    args.push('--bundles', bundles.join(','));
  } else if (modules && modules.length > 0) {
    args.push('--modules', modules.join(','));
  }

  if (testMode) {
    args.push('--testMode', 'true');
  }

  console.log(`   Command: node ${ASSEMBLE_SCRIPT} ${args.join(' ')}`);

  // Run the assembly script
  const assemblyResult = await new Promise((resolve, reject) => {
    const childProcess = spawn(process.execPath, [ASSEMBLE_SCRIPT, ...args], {
      cwd: path.dirname(ASSEMBLE_SCRIPT),
      shell: false,
      env: {
        ...process.env,
        MODULE_LIBRARY_PATH: MODULE_LIBRARY,
        OUTPUT_PATH: GENERATED_PROJECTS
      }
    });

    let output = '';
    let errorOutput = '';

    childProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // Log progress lines
      text.split('\n').filter(l => l.trim()).forEach(line => {
        console.log(`   ${line}`);
      });
    });

    childProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`   ⚠️ ${data.toString().trim()}`);
    });

    childProcess.on('error', (err) => {
      reject(new Error(`Spawn error: ${err.message}`));
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Assembly script failed with exit code ${code}. Error: ${errorOutput}`));
      } else {
        resolve({ output, errorOutput });
      }
    });
  });

  await job.updateProgress(30);
  console.log('   ✅ Assembly script completed');

  // ===========================================
  // PHASE 2: Post-Assembly Processing
  // ===========================================
  console.log('\n🔧 Phase 2: Post-assembly processing...');

  const projectPath = path.join(GENERATED_PROJECTS, sanitizedName);

  // Verify project was created
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project directory not found: ${projectPath}`);
  }

  // Run post-assembly tasks
  const postAssembly = getPostAssemblyService();
  const database = getDb();

  const postResult = await postAssembly.runPostAssembly({
    projectPath,
    projectName: name,
    industry,
    description,
    theme,
    adminTier,
    adminModules,
    testMode,
    autoDeploy,
    generationId,
    db: database,
    moduleLibraryPath: MODULE_LIBRARY,
    onProgress: (progress) => {
      // Map 0-100 to 30-100 (since assembly was 0-30)
      const mappedProgress = 30 + Math.floor(progress * 0.7);
      job.updateProgress(mappedProgress);
    }
  });

  // ===========================================
  // PHASE 3: Build Final Result
  // ===========================================
  const totalDuration = Date.now() - startTime;

  console.log('\n╭─────────────────────────────────────────────────────────╮');
  console.log(`│ ✅ JOB ${job.id} COMPLETED`);
  console.log(`│ ⏱️  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`│ 📄 Pages: ${postResult.pagesGenerated}`);
  console.log(`│ 🏗️  Build: ${postResult.auditResult?.success ? 'PASSED' : 'FAILED'}`);
  if (postResult.deployResult) {
    console.log(`│ 🚀 Deploy: ${postResult.deployResult.success ? 'SUCCESS' : 'FAILED'}`);
  }
  if (postResult.totalCost > 0) {
    console.log(`│ 💰 Cost: $${postResult.totalCost.toFixed(4)}`);
  }
  console.log('╰─────────────────────────────────────────────────────────╯');

  return {
    success: postResult.success,
    projectPath,
    projectName: name,
    industry,
    pagesGenerated: postResult.pagesGenerated,
    auditResult: postResult.auditResult,
    deployResult: postResult.deployResult,
    durationMs: totalDuration,
    totalCost: postResult.totalCost,
    errors: postResult.errors
  };

}, {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 2, // Process 2 jobs at a time
  limiter: {
    max: 5,          // Max 5 jobs
    duration: 60000  // Per minute
  }
});

// ===========================================
// EVENT HANDLERS
// ===========================================
worker.on('completed', (job, result) => {
  console.log(`\n✅ Job ${job.id} completed successfully (${result.success ? 'build passed' : 'build failed'})`);
});

worker.on('failed', (job, err) => {
  console.error(`\n❌ Job ${job?.id} failed: ${err.message}`);

  // Track failure in database
  const database = getDb();
  if (database && database.trackGenerationFailed && job?.data?.generationId) {
    database.trackGenerationFailed(job.data.generationId, {
      message: err.message,
      stack: err.stack
    }).catch(dbErr => {
      console.error('Failed to track job failure:', dbErr.message);
    });
  }
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

worker.on('stalled', (jobId) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
async function shutdown() {
  console.log('\n👋 Shutting down worker...');

  await worker.close();

  console.log('Worker closed.');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
