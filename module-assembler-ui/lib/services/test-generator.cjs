/**
 * Test Generator Service
 *
 * Handles running automated generation tests with pre-configured presets.
 * Tracks results, timing, and cost for each test run.
 */

const path = require('path');
const fs = require('fs');
const axios = require('axios');

const { testPresets, generateTestName } = require('../configs/test-presets.cjs');

// Server port - matches server.cjs
const SERVER_PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

// Track test results in memory (could be persisted to DB)
const testResults = [];

/**
 * Run a test generation with a preset
 *
 * @param {string} presetId - The preset ID to run
 * @param {Object} options - Test options
 * @param {boolean} options.deploy - Whether to deploy after generation
 * @param {boolean} options.cleanup - Whether to delete after test
 * @param {Object} deps - Dependencies (assembleProject, orchestrateProject, etc.)
 */
async function runTestGeneration(presetId, options = {}, deps = {}) {
  const preset = testPresets[presetId];

  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`);
  }

  const startTime = Date.now();
  const testRun = {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    presetId,
    presetName: preset.name,
    mode: preset.mode,
    tier: preset.tier,
    industry: preset.industry,
    startTime: new Date().toISOString(),
    options
  };

  console.log('');
  console.log('═'.repeat(60));
  console.log(`🧪 TEST GENERATION: ${preset.name}`);
  console.log('═'.repeat(60));
  console.log(`   Preset: ${presetId}`);
  console.log(`   Mode: ${preset.mode}`);
  console.log(`   Level: ${preset.level}`);
  console.log(`   Industry: ${preset.industry}`);
  console.log('');

  try {
    // Generate unique test name to avoid conflicts
    const testBusinessName = generateTestName(preset.data.businessName);
    const testData = {
      ...preset.data,
      businessName: testBusinessName,
      _isTest: true,
      _testId: testRun.id,
      _presetId: presetId
    };

    let result;

    // DETERMINISTIC ROUTING:
    // If preset has explicit pages array → use /api/assemble directly (no AI detection needed)
    // Only use /api/orchestrate if we specifically want AI to infer things

    const hasExplicitPages = testData.pages && Array.isArray(testData.pages) && testData.pages.length > 0;
    const hasExplicitTier = preset.tier && ['L1', 'L2', 'L3', 'L4'].includes(preset.tier);

    // Test presets with explicit pages should ALWAYS use assemble (deterministic)
    if (hasExplicitPages && hasExplicitTier) {
      console.log(`   📋 Using DETERMINISTIC path (assemble) - preset has explicit pages: [${testData.pages.join(', ')}]`);
      result = await runQuickStartTest(testData, deps);
    }
    // Only use orchestrate if we're testing AI detection specifically
    else if (preset.mode === 'orchestrate-test') {
      console.log(`   🤖 Using AI DETECTION path (orchestrate) - testing AI inference`);
      result = await runInstantTest(testData, deps);
    }
    // Fallback based on mode for backwards compatibility
    else {
      switch (preset.mode) {
        case 'quickstart':
          result = await runQuickStartTest(testData, deps);
          break;

        case 'instant':
        case 'orchestrator':
          // If no explicit pages, let AI decide
          result = await runInstantTest(testData, deps);
          break;

        case 'custom':
        case 'full-control':
          result = await runCustomTest(testData, deps);
          break;

        case 'inspired':
        case 'reference':
          result = await runInspiredTest(testData, deps);
          break;

        case 'rebuild':
          result = await runRebuildTest(testData, deps);
          break;

        default:
          result = await runQuickStartTest(testData, deps);
      }
    }

    const duration = (Date.now() - startTime) / 1000;

    testRun.success = true;
    testRun.duration = duration;
    testRun.endTime = new Date().toISOString();
    testRun.result = {
      projectPath: result.projectPath,
      pages: result.pages || [],
      pageCount: result.pages?.length || 0,
      moduleCount: result.modules?.length || 0,
      cost: result.cost || 0,
      tokens: result.tokens || { input: 0, output: 0 }
    };

    console.log('');
    console.log('✅ TEST PASSED');
    console.log(`   Duration: ${duration.toFixed(1)}s`);
    console.log(`   Pages: ${testRun.result.pageCount}`);
    console.log(`   Modules: ${testRun.result.moduleCount}`);
    console.log(`   Cost: $${testRun.result.cost.toFixed(4)}`);
    console.log('═'.repeat(60));

    // Deploy if requested
    if (options.deploy && deps.deployProject) {
      console.log('');
      console.log('📤 Deploying test project...');
      try {
        const deployResult = await deps.deployProject(testBusinessName);
        testRun.deployed = true;
        testRun.deployResult = deployResult;
        console.log('   ✅ Deploy complete');
      } catch (deployErr) {
        console.log(`   ❌ Deploy failed: ${deployErr.message}`);
        testRun.deployError = deployErr.message;
      }
    }

    // Cleanup if requested
    if (options.cleanup && deps.deleteProject) {
      console.log('');
      console.log('🗑️  Cleaning up test project...');
      try {
        await deps.deleteProject(testBusinessName, { localOnly: !options.deploy });
        testRun.cleanedUp = true;
        console.log('   ✅ Cleanup complete');
      } catch (cleanupErr) {
        console.log(`   ⚠️  Cleanup failed: ${cleanupErr.message}`);
        testRun.cleanupError = cleanupErr.message;
      }
    }

    testResults.push(testRun);
    return testRun;

  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;

    testRun.success = false;
    testRun.duration = duration;
    testRun.endTime = new Date().toISOString();
    testRun.error = error.message;
    testRun.errorStack = error.stack;

    console.log('');
    console.log('❌ TEST FAILED');
    console.log(`   Error: ${error.message}`);
    console.log(`   Duration: ${duration.toFixed(1)}s`);
    console.log('═'.repeat(60));

    testResults.push(testRun);
    return testRun;
  }
}

/**
 * Run Quick Start (assemble) test
 */
async function runQuickStartTest(testData, deps) {
  console.log('   Running Quick Start flow...');

  // /api/assemble expects:
  // {
  //   name: string,
  //   industry: string,
  //   description: {
  //     pages: string[],           // CRITICAL: must be inside description object
  //     visualStyle: string,
  //     aiInstructions: string,
  //     tagline: string,
  //     location: string,
  //     ...
  //   },
  //   adminTier: string,
  //   adminModules: string[]
  // }

  // Build the description object from preset fields
  const descriptionObj = {
    pages: testData.pages || [],
    visualStyle: testData.visualStyle || '',
    aiInstructions: testData.aiInstructions || '',
    tagline: testData.tagline || '',
    location: testData.location || '',
    communicationStyle: testData.communicationStyle,
    layout: testData.layout,
    cta: testData.cta,
    teamSize: testData.teamSize,
    priceRange: testData.priceRange,
    customers: testData.customers,
    videoHero: testData.videoHero,
    // Include text description if provided
    text: testData.description || ''
  };

  const assemblePayload = {
    name: testData.businessName || testData.name,
    industry: testData.industry,
    description: descriptionObj,  // Pass as object, not string
    theme: testData.theme,
    references: testData.references,
    autoDeploy: testData.autoDeploy || false,
    adminTier: testData.adminTier,
    adminModules: testData.adminModules,
    // TEST MODE: Skip AI API calls, use deterministic fallback pages
    // This runs the EXACT same pipeline as production, just without AI costs
    testMode: true
  };

  console.log(`   Payload: name="${assemblePayload.name}", industry="${assemblePayload.industry}"`);
  console.log(`   Pages: [${descriptionObj.pages.join(', ')}] (${descriptionObj.pages.length} pages)`);
  console.log(`   🧪 TEST MODE: Using same pipeline as production (no AI costs)`);
  if (descriptionObj.visualStyle) {
    console.log(`   Visual style: "${descriptionObj.visualStyle.substring(0, 50)}..."`);
  }

  // Call the assemble function directly if available
  if (deps.assembleProject) {
    return await deps.assembleProject(assemblePayload);
  }

  // Otherwise make HTTP request
  try {
    const response = await axios.post(`${BASE_URL}/api/assemble`, assemblePayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000 // 5 minute timeout for generation
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Request failed');
  }
}

/**
 * Run INSTANT (orchestrate) test
 */
async function runInstantTest(testData, deps) {
  console.log('   Running INSTANT flow...');

  // Build a natural language prompt from the data
  // /api/orchestrate expects: { input: "Create a website for...", autoDeploy: false }
  const prompt = buildPromptFromData(testData);
  const orchestratePayload = {
    input: prompt,
    autoDeploy: testData.autoDeploy || false
  };

  console.log(`   Payload input: "${prompt.substring(0, 80)}..."`);

  if (deps.orchestrateProject) {
    return await deps.orchestrateProject(orchestratePayload);
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/orchestrate`, orchestratePayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Request failed');
  }
}

/**
 * Run CUSTOM (full control) test
 */
async function runCustomTest(testData, deps) {
  console.log('   Running CUSTOM flow...');

  // Build a detailed prompt with all the extra context
  // /api/orchestrate expects: { input: "...", autoDeploy: false }
  const detailedPrompt = buildDetailedPrompt(testData);
  const orchestratePayload = {
    input: detailedPrompt,
    autoDeploy: testData.autoDeploy || false
  };

  console.log(`   Payload input: "${detailedPrompt.substring(0, 80)}..."`);

  if (deps.orchestrateProject) {
    return await deps.orchestrateProject(orchestratePayload);
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/orchestrate`, orchestratePayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Request failed');
  }
}

/**
 * Run INSPIRED (reference) test
 */
async function runInspiredTest(testData, deps) {
  console.log('   Running INSPIRED flow...');

  // Build prompt that includes the reference URL for inspiration
  const prompt = `Create a ${testData.industry || 'business'} website for ${testData.businessName}${testData.location ? ` in ${testData.location}` : ''}, inspired by the design of ${testData.referenceUrl || 'modern premium websites'}`;

  const orchestratePayload = {
    input: prompt,
    autoDeploy: testData.autoDeploy || false
  };

  console.log(`   Payload input: "${prompt.substring(0, 80)}..."`);

  if (deps.orchestrateProject) {
    return await deps.orchestrateProject(orchestratePayload);
  }

  try {
    const response = await axios.post(`${BASE_URL}/api/orchestrate`, orchestratePayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000
    });
    return response.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || 'Request failed');
  }
}

/**
 * Run Rebuild test
 */
async function runRebuildTest(testData, deps) {
  console.log('   Running REBUILD flow...');

  // Rebuild needs existing site URL
  const rebuildData = {
    existingUrl: testData.existingUrl,
    businessName: testData.businessName,
    ...testData
  };

  // Use the analyze-existing-site + orchestrate flow
  if (deps.rebuildProject) {
    return await deps.rebuildProject(rebuildData);
  }

  // Fall back to orchestrate
  return await runInstantTest(testData, deps);
}

/**
 * Build a simple prompt from test data
 */
function buildPromptFromData(data) {
  let prompt = `Create a website for ${data.businessName}`;

  if (data.industry) {
    prompt += `, a ${data.industry} business`;
  }

  if (data.location) {
    prompt += ` in ${data.location}`;
  }

  if (data.tagline) {
    prompt += `. ${data.tagline}`;
  }

  return prompt;
}

/**
 * Build a detailed prompt from full test data
 */
function buildDetailedPrompt(data) {
  let prompt = buildPromptFromData(data);

  if (data.description) {
    prompt += `\n\n${data.description}`;
  }

  if (data.visualStyle) {
    prompt += `\n\nVisual style: ${data.visualStyle}`;
  }

  if (data.aiInstructions) {
    prompt += `\n\nAdditional instructions: ${data.aiInstructions}`;
  }

  return prompt;
}

/**
 * Get all test results
 */
function getTestResults() {
  return testResults;
}

/**
 * Get test results summary
 */
function getTestSummary() {
  const total = testResults.length;
  const passed = testResults.filter(r => r.success).length;
  const failed = total - passed;
  const totalDuration = testResults.reduce((sum, r) => sum + (r.duration || 0), 0);
  const totalCost = testResults.reduce((sum, r) => sum + (r.result?.cost || 0), 0);

  return {
    total,
    passed,
    failed,
    passRate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%',
    totalDuration: totalDuration.toFixed(1) + 's',
    averageDuration: total > 0 ? (totalDuration / total).toFixed(1) + 's' : '0s',
    totalCost: '$' + totalCost.toFixed(4)
  };
}

/**
 * Clear test results
 */
function clearTestResults() {
  testResults.length = 0;
}

/**
 * Get available presets
 */
function getAvailablePresets() {
  return Object.entries(testPresets).map(([id, preset]) => ({
    id,
    name: preset.name,
    mode: preset.mode,
    tier: preset.tier,
    industry: preset.industry,
    description: preset.description
  }));
}

module.exports = {
  runTestGeneration,
  getTestResults,
  getTestSummary,
  clearTestResults,
  getAvailablePresets,
  testPresets
};
