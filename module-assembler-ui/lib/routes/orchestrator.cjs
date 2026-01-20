/**
 * Orchestrator Routes
 * Extracted from server.cjs
 *
 * Handles: orchestrate, orchestrate/detect-intent, orchestrate/recommend, 
 * orchestrate/build-tool, orchestrate/build-suite, orchestrate/download-suite
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Module validator for auto-fixing icon imports
const { validateProject, validateFrontendPages } = require('../services/module-validator.cjs');

/**
 * Create orchestrator routes
 * @param {Object} deps - Dependencies
 */
function createOrchestratorRoutes(deps) {
  const router = express.Router();
  const {
    INDUSTRIES,
    LAYOUTS,
    EFFECTS,
    SECTIONS,
    buildPrompt,
    buildOrchestratorPagePrompt,
    getIndustryImageUrls,
    getIndustryDesignGuidance,
    buildFallbackPage,
    buildFallbackThemeCss,
    generateBrainJson,
    generateToolHtml,
    generateBrainRoutes,
    generateHealthRoutes,
    buildAppJsx,
    validateGeneratedCode,
    toComponentName,
    toPageFileName,
    toRoutePath,
    toNavLabel,
    copyDirectorySync,
    GENERATED_PROJECTS,
    MODULE_LIBRARY,
    ASSEMBLE_SCRIPT,
    autoDeployProject,
    db,
    INDUSTRY_LAYOUTS,
    buildLayoutContext,
    getLayoutConfig
  } = deps;

  // Rate limiter for orchestrate endpoints
  const orchestrateRateLimiter = require('express-rate-limit')({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: { success: false, error: 'Too many requests. Please wait a moment before trying again.' }
  });

/**
 * POST /api/orchestrate
 * Takes a single sentence and autonomously creates a complete website
 *
 * Request: { input: "Create a website for Mario's Pizza in Brooklyn" }
 * Response: Same as /api/assemble (project URL, deployment status, etc.)
 */
router.post('/orchestrate', orchestrateRateLimiter, async (req, res) => {
  const { input, deviceTarget = 'both', autoDeploy = false, includeCompanionApp = false, industryKey = null } = req.body;
  const startTime = Date.now();

  // Validate input
  if (!input || typeof input !== 'string' || input.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a description of the website you want to create (minimum 3 characters)'
    });
  }

  const userInput = input.trim();
  console.log('\n' + '='.repeat(60));
  console.log('⚡ ORCHESTRATOR MODE');
  console.log('='.repeat(60));
  console.log(`📝 Input: "${userInput}"`);
  console.log(`📱 Device Target: ${deviceTarget}`);
  console.log(`📱 Include Companion App: ${includeCompanionApp}`);
  console.log(`🏭 Industry Key Override: ${industryKey || 'none (AI will detect)'}`);
  console.log('');

  try {
    // Load orchestrator service
    const { orchestrate, validatePayload } = require('../../services/orchestrator.cjs');

    // Run orchestration - AI infers all details (unless industry is explicitly overridden)
    console.log('🤖 AI Analysis in progress...');
    const orchestratorResult = await orchestrate(userInput, { deviceTarget, industryKey });

    if (!orchestratorResult.success) {
      return res.status(400).json({
        success: false,
        error: orchestratorResult.error || 'Orchestration failed'
      });
    }

    const { payload, summary } = orchestratorResult;

    // Helper for safe array joining
    const safeJoin = (arr, separator = ', ') => {
      if (!arr || !Array.isArray(arr)) return 'none';
      return arr.length > 0 ? arr.join(separator) : 'none';
    };

    // ========================================
    // HANDLE TOOL TYPE - Single page generation
    // ========================================
    if (orchestratorResult.type === 'tool') {
      // Import specialized HTML generators and tool tester
      const { generateSpecializedToolHTML } = require('../../services/orchestrator.cjs');
      const { testTool, logTestResults } = require('../../services/tool-tester.cjs');

      const toolKey = payload.toolKey || summary.toolKey;
      const toolConfig = payload.toolConfig || {};

      // Log TOOL-specific AI decisions
      console.log('');
      console.log('📊 AI DECISIONS (TOOL):');
      console.log('─'.repeat(40));
      console.log(`   🛠️ Tool Type: ${toolKey}`);
      console.log(`   📦 Tool Category: ${payload.toolCategory || summary.toolCategory || 'general'}`);
      console.log(`   📝 Tool Name: ${payload.name || summary.toolName || 'Unnamed Tool'}`);
      console.log(`   ✨ Features: ${safeJoin(toolConfig.features)}`);
      console.log(`   📋 Fields: ${safeJoin(toolConfig.fields?.map(f => f.label || f.name))}`);
      console.log(`   🎨 Colors: Primary ${toolConfig.colors?.primary || payload.theme?.colors?.primary || 'default'}`);
      console.log(`   📦 Modules needed: none (pure frontend)`);
      console.log(`   🎯 Confidence: ${summary.confidence || 'high'}`);
      console.log('─'.repeat(40));
      console.log('');

      // Track tool generation start
      let toolGenerationId = null;
      if (db && db.trackGenerationStart) {
        try {
          toolGenerationId = await db.trackGenerationStart({
            siteName: payload.name || summary.toolName,
            industry: `tool-${toolKey}`,
            templateUsed: 'blink-tool-generator',
            modulesSelected: [],
            pagesGenerated: 1
          });
          console.log(`   📊 Tool generation tracked: ID ${toolGenerationId}`);
        } catch (trackErr) {
          console.warn('   ⚠️ Tool generation tracking failed:', trackErr.message);
        }
      }

      const duration = Date.now() - startTime;

      // Create tool project directory
      const toolName = payload.name
        .replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 50);

      const projectPath = path.join(GENERATED_PROJECTS, toolName);

      // Create project directory if it doesn't exist
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      // Generate specialized HTML using orchestrator's generators
      const toolHtml = generateSpecializedToolHTML(toolKey, {
        name: payload.name,
        icon: toolConfig.icon,
        description: toolConfig.description,
        features: toolConfig.features,
        fields: toolConfig.fields,
        colors: toolConfig.colors || payload.theme?.colors
      });

      // ========================================
      // RUN AUTOMATED TOOL TESTS
      // ========================================
      console.log('');
      console.log('🧪 RUNNING TOOL VALIDATION TESTS');
      console.log('─'.repeat(40));

      const testResults = testTool(toolHtml, toolKey);
      logTestResults(testResults);

      console.log('─'.repeat(40));
      console.log('');

      // Save the HTML file
      fs.writeFileSync(path.join(projectPath, 'index.html'), toolHtml);

      // Generate tool-specific metadata
      const toolMeta = {
        generatedAt: new Date().toISOString(),
        originalInput: userInput,
        type: 'tool',
        toolKey: toolKey,
        toolCategory: payload.toolCategory || summary.toolCategory,
        toolConfig: toolConfig,
        theme: payload.theme,
        processingTimeMs: duration
      };

      // Save tool metadata
      fs.writeFileSync(
        path.join(projectPath, 'tool-meta.json'),
        JSON.stringify(toolMeta, null, 2)
      );

      console.log('');
      console.log('✅ TOOL GENERATION COMPLETE');
      console.log(`   ⏱️ Total time: ${(duration / 1000).toFixed(1)}s`);
      console.log(`   📁 Path: ${projectPath}`);
      console.log('='.repeat(60));

      // Track tool generation complete
      if (toolGenerationId && db && db.trackGenerationComplete) {
        try {
          await db.trackGenerationComplete(toolGenerationId, {
            pagesGenerated: 1,
            generationTimeMs: duration
          });
          console.log(`   📊 Tool generation ${toolGenerationId} marked complete`);
        } catch (trackErr) {
          console.warn('   ⚠️ Tool generation complete tracking failed:', trackErr.message);
        }
      }

      return res.json({
        success: true,
        type: 'tool',
        project: {
          name: toolName,
          path: projectPath
        },
        tool: {
          originalInput: userInput,
          toolKey: toolKey,
          name: payload.name,
          category: payload.toolCategory || summary.toolCategory,
          icon: toolConfig.icon,
          description: toolConfig.description,
          features: toolConfig.features,
          fields: toolConfig.fields,
          colors: toolConfig.colors || payload.theme?.colors
        },
        // Include the HTML for preview/download/copy
        html: toolHtml,
        // Include test results for UI display
        testResults: {
          passed: testResults.passed,
          failed: testResults.failed,
          warnings: testResults.warnings,
          allPassed: testResults.allPassed,
          details: testResults.details
        },
        duration: duration,
        generationId: toolGenerationId
      });
    }

    // ========================================
    // HANDLE BUSINESS TYPE - Multi-page assembly
    // ========================================

    // Log BUSINESS-specific AI decisions
    console.log('');
    console.log('📊 AI DECISIONS (BUSINESS):');
    console.log('─'.repeat(40));
    console.log(`   🏢 Business Name: ${summary.businessName || payload.name || 'Unknown'}`);
    console.log(`   🏭 Industry: ${summary.industryName || 'Unknown'} (${payload.industry || 'unknown'})`);
    console.log(`   📍 Location: ${summary.location || 'Not specified'}`);
    console.log(`   📄 Pages (${summary.pages || 0}): ${safeJoin(payload.pages)}`);
    console.log(`   🔧 Modules (${summary.modules || 0}): ${safeJoin(payload.modules)}`);
    console.log(`   🎨 Colors: Primary ${payload.theme?.colors?.primary || 'default'}, Accent ${payload.theme?.colors?.accent || 'default'}`);
    console.log(`   🎛️ Admin Tier: ${payload.adminTier || 'standard'} (${payload.adminModules?.length || 0} modules)`);
    console.log(`   🎯 Confidence: ${summary.confidence || 'unknown'}`);
    if (payload.metadata?.inferredDetails) {
      console.log(`   💬 Tagline: "${payload.metadata.inferredDetails.tagline || 'N/A'}"`);
      console.log(`   📢 CTA: "${payload.metadata.inferredDetails.callToAction || 'N/A'}"`);
    }
    console.log('─'.repeat(40));
    console.log('');

    // Validate the payload for business sites
    const validation = validatePayload(payload);
    if (!validation.valid) {
      console.log('❌ Validation failed:', safeJoin(validation.errors));
      return res.status(400).json({
        success: false,
        error: `Invalid configuration: ${safeJoin(validation.errors)}`
      });
    }

    console.log('🏢 BUSINESS MODE - Starting multi-page assembly');

    // ========================================
    // TRACK GENERATION START
    // ========================================
    let generationId = null;
    if (db && db.trackGenerationStart) {
      try {
        generationId = await db.trackGenerationStart({
          siteName: summary.businessName || payload.name,
          industry: payload.industry,
          templateUsed: 'blink-orchestrator',
          modulesSelected: payload.modules || [],
          pagesGenerated: payload.pages?.length || 0
        });
        console.log(`   📊 Generation tracked: ID ${generationId}`);
      } catch (trackErr) {
        console.warn('   ⚠️ Generation tracking failed:', trackErr.message);
      }
    }

    // Now execute the assembly by calling the same logic as /api/assemble
    // We'll forward the orchestrated payload to the internal assembly logic
    console.log('🚀 Starting assembly with orchestrated configuration...');

    // Sanitize project name - same as /api/assemble
    const sanitizedName = payload.name
      .replace(/&/g, ' and ')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Generated project name is invalid'
      });
    }

    // Build command arguments
    const args = ['--name', sanitizedName];

    // Add industry
    const sanitizedIndustry = payload.industry
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    args.push('--industry', sanitizedIndustry);

    console.log(`   📦 Project: ${sanitizedName}`);
    console.log(`   🏭 Industry: ${sanitizedIndustry}`);

    const ASSEMBLY_TIMEOUT = 5 * 60 * 1000; // 5 minute timeout
    let responded = false;

    // Execute the assembly script
    const childProcess = spawn(process.execPath, [ASSEMBLE_SCRIPT, ...args], {
      cwd: path.dirname(ASSEMBLE_SCRIPT),
      shell: false,
      env: { ...process.env, MODULE_LIBRARY_PATH: MODULE_LIBRARY, OUTPUT_PATH: GENERATED_PROJECTS }
    });

    // Timeout handler
    const timeoutId = setTimeout(() => {
      if (!responded) {
        responded = true;
        childProcess.kill('SIGTERM');
        console.error('❌ Assembly timeout');
        res.status(504).json({
          success: false,
          error: 'Assembly timeout - process took too long',
          orchestratorSummary: summary
        });
      }
    }, ASSEMBLY_TIMEOUT);

    let output = '';
    let errorOutput = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(data.toString());
    });

    childProcess.on('error', (err) => {
      clearTimeout(timeoutId);
      if (!responded) {
        responded = true;
        console.error(`❌ Spawn error: ${err.message}`);
        res.status(500).json({
          success: false,
          error: `Failed to start assembly: ${err.message}`,
          orchestratorSummary: summary
        });
      }
    });

    childProcess.on('close', async (code) => {
      clearTimeout(timeoutId);
      if (responded) return;
      responded = true;

      const duration = Date.now() - startTime;

      if (code === 0) {
        const projectPath = path.join(GENERATED_PROJECTS, sanitizedName);

        // Generate brain.json with orchestrator metadata
        const industryConfig = INDUSTRIES[sanitizedIndustry] || INDUSTRIES['consulting'] || {};
        const brainJsonContent = generateBrainJson(sanitizedName, sanitizedIndustry, industryConfig, {
          adminTier: payload.adminTier,
          adminModules: payload.adminModules,
          adminReason: payload.adminReason
        });
        fs.writeFileSync(path.join(projectPath, 'brain.json'), brainJsonContent);
        console.log('   🧠 brain.json generated (admin tier: ' + (payload.adminTier || 'standard') + ')');

        // Save orchestrator metadata
        const orchestratorMeta = {
          generatedAt: new Date().toISOString(),
          originalInput: userInput,
          aiDecisions: summary,
          payload: payload,
          processingTimeMs: duration
        };
        fs.writeFileSync(
          path.join(projectPath, 'orchestrator-meta.json'),
          JSON.stringify(orchestratorMeta, null, 2)
        );
        console.log('   📋 orchestrator-meta.json saved');

        // Copy admin modules based on tier
        const adminTier = payload.adminTier || 'standard';
        const adminModules = payload.adminModules || [];
        const adminDest = path.join(projectPath, 'admin');

        try {
          const { loadModulesForAssembly, generateAdminAppJsx } = require('../services/admin-module-loader.cjs');

          // Load selected admin modules
          const moduleData = loadModulesForAssembly(adminModules);

          // STEP 1: Copy base business-admin for build infrastructure
          // (includes index.html, package.json, vite.config.js, main.jsx, etc.)
          const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
          if (fs.existsSync(businessAdminSrc)) {
            copyDirectorySync(businessAdminSrc, adminDest);
            console.log('   📦 Admin base infrastructure copied');
          }

          // STEP 2: Create modules directory and copy modules
          const modulesDir = path.join(adminDest, 'src', 'modules');
          if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir, { recursive: true });
          }

          // STEP 3: Copy shared admin components to src/modules/_shared
          // (imports from components are '../../_shared' which resolves to src/modules/_shared)
          const sharedSrc = path.join(__dirname, '../../backend/admin-modules/_shared');
          if (fs.existsSync(sharedSrc)) {
            copyDirectorySync(sharedSrc, path.join(modulesDir, '_shared'));
          }

          // STEP 4: Copy each selected module to src/modules/ (Vite requires imports from within src/)
          for (const mod of moduleData.modules) {
            const modSrc = path.join(__dirname, '../../backend/admin-modules', mod.name);
            const modDest = path.join(modulesDir, mod.name);
            if (fs.existsSync(modSrc)) {
              copyDirectorySync(modSrc, modDest);
            }
          }

          // STEP 5: Generate custom admin App.jsx (overwrites base)
          const adminAppJsx = generateAdminAppJsx(adminModules, {
            businessName: summary.businessName
          });
          fs.writeFileSync(path.join(adminDest, 'src', 'App.jsx'), adminAppJsx);

          // STEP 6: Save admin config
          fs.writeFileSync(path.join(adminDest, 'admin-config.json'), JSON.stringify({
            tier: adminTier,
            modules: adminModules,
            generatedAt: new Date().toISOString(),
            sidebar: moduleData.sidebar,
            routes: moduleData.routes
          }, null, 2));

          console.log(`   🎛️ Admin modules copied (${adminTier} tier, ${adminModules.length} modules)`);
        } catch (adminErr) {
          console.warn('   ⚠️ Admin module setup failed, using fallback:', adminErr.message);
          // Fallback to old business-admin
          const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
          if (fs.existsSync(businessAdminSrc)) {
            copyDirectorySync(businessAdminSrc, adminDest);
            console.log('   🎛️ Fallback: business-admin module copied');
          }
        }

        // ========================================
        // GENERATE FRONTEND PAGES (like Quick Start)
        // ========================================
        console.log('');
        console.log('   🔍 AI Page Generation Check (Orchestrator):');
        console.log(`      - payload.pages exists: ${!!payload.pages}`);
        console.log(`      - pages count: ${payload.pages?.length || 0}`);
        console.log(`      - pages: ${JSON.stringify(payload.pages || [])}`);
        console.log(`      - API key present: ${!!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY)}`);

        if (payload.pages && payload.pages.length > 0) {
          console.log('');
          console.log('🎨 GENERATING FRONTEND PAGES');
          console.log('─'.repeat(40));

          const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
          const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
          const pagesDir = path.join(frontendSrcPath, 'pages');

          // Create pages directory
          if (!fs.existsSync(pagesDir)) {
            fs.mkdirSync(pagesDir, { recursive: true });
          }

          // Build prompt config from orchestrator data
          // Priority: industry colors > user theme > hardcoded defaults
          const industryColors = industryConfig?.colors || {};
          const userColors = payload.theme?.colors || {};
          const defaultColors = { primary: '#6366f1', accent: '#06b6d4', background: '#ffffff', text: '#1a1a2e' };

          const promptConfig = {
            businessName: summary.businessName,
            industry: industryConfig,
            colors: {
              primary: industryColors.primary || userColors.primary || defaultColors.primary,
              accent: industryColors.accent || userColors.accent || defaultColors.accent,
              secondary: industryColors.secondary || userColors.secondary || defaultColors.primary,
              background: industryColors.background || userColors.background || defaultColors.background,
              text: industryColors.text || userColors.text || defaultColors.text,
              textMuted: industryColors.textMuted || userColors.textMuted || '#64748b'
            },
            typography: industryConfig?.typography || payload.theme?.typography || { heading: "'Inter', sans-serif", body: "system-ui, sans-serif" }
          };

          // Build description object for page generation
          const description = {
            text: `${summary.businessName} - ${payload.metadata?.inferredDetails?.tagline || ''} ${payload.metadata?.inferredDetails?.description || ''}`,
            pages: payload.pages,
            businessName: summary.businessName,
            tagline: payload.metadata?.inferredDetails?.tagline,
            callToAction: payload.metadata?.inferredDetails?.callToAction,
            industryKey: sanitizedIndustry,
            location: summary.location
          };

          if (apiKey) {
            try {
              const { default: Anthropic } = await import('@anthropic-ai/sdk');
              const client = new Anthropic({ apiKey });
              const MODEL_NAME = 'claude-sonnet-4-20250514';

              console.log(`   ⚡ Generating ${payload.pages.length} pages in parallel...`);

              // Generate pages in parallel
              const pagePromises = payload.pages.map(async (pageId) => {
                const componentName = toComponentName(pageId);
                try {
                  console.log(`   🎨 Generating ${pageId} → ${componentName}Page.jsx...`);

                  const otherPages = payload.pages.filter(p => p !== pageId).map(p => `/${p}`).join(', ');

                  // Build orchestrator-specific page prompt
                  const pagePrompt = buildOrchestratorPagePrompt(pageId, componentName, otherPages, description, promptConfig);

                  const pageResponse = await client.messages.create({
                    model: MODEL_NAME,
                    max_tokens: 16000,
                    messages: [{ role: 'user', content: pagePrompt }]
                  });

                  let pageCode = pageResponse.content[0].text;
                  pageCode = pageCode.replace(/^```jsx?\n?/g, '').replace(/\n?```$/g, '').trim();

                  // Validate generated code
                  const validation = validateGeneratedCode(pageCode, componentName);
                  if (!validation.isValid) {
                    console.log(`   ❌ ${pageId} ERRORS: ${validation.errors.join(', ')}`);
                  }
                  // Always use fixedCode - it contains auto-fixes for apostrophes, quotes, fonts, etc.
                  pageCode = validation.fixedCode;
                  if (validation.warnings && validation.warnings.length > 0) {
                    console.log(`   ⚠️ ${pageId} WARNINGS: ${validation.warnings.join(', ')}`);
                  }
                  if (validation.stats) {
                    console.log(`   📊 ${pageId}: ${validation.stats.lines} lines, content: ${validation.stats.hasRealContent ? 'yes' : 'NO'}`);
                  }

                  if (!pageCode.includes('export default')) {
                    console.log(`   ⚠️ ${pageId} incomplete, using fallback`);
                    pageCode = buildFallbackPage(componentName, pageId, promptConfig);
                  }

                  const pagePath = path.join(pagesDir, `${componentName}Page.jsx`);
                  fs.writeFileSync(pagePath, pageCode);
                  console.log(`   ✅ ${componentName}Page.jsx`);
                  return { pageId, componentName, success: true };

                } catch (pageErr) {
                  console.error(`   ⚠️ ${pageId} failed: ${pageErr.message}`);
                  const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig);
                  fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
                  return { pageId, componentName, success: false, fallback: true };
                }
              });

              const results = await Promise.all(pagePromises);
              const successCount = results.filter(r => r.success).length;
              console.log(`   ✅ ${successCount}/${payload.pages.length} pages generated`);

              // Generate App.jsx with routes
              const appJsx = buildAppJsx(sanitizedName, payload.pages, promptConfig, sanitizedIndustry);
              fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);
              console.log('   ✅ App.jsx updated with routes');

              // Ensure theme.css exists
              const themeCssPath = path.join(frontendSrcPath, 'theme.css');
              if (!fs.existsSync(themeCssPath)) {
                const fallbackTheme = buildFallbackThemeCss(promptConfig);
                fs.writeFileSync(themeCssPath, fallbackTheme);
                console.log('   🎨 Created theme.css');
              }

            } catch (pageGenErr) {
              console.error('   ⚠️ Page generation error:', pageGenErr.message);
              // Continue with assembly even if page generation fails
            }
          } else {
            console.log('   ⚠️ No API key - skipping AI page generation');
            // Generate basic fallback pages
            for (const pageId of payload.pages) {
              const componentName = toComponentName(pageId);
              const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig);
              fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
            }
            const appJsx = buildAppJsx(sanitizedName, payload.pages, promptConfig, sanitizedIndustry);
            fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);
            console.log('   ✅ Fallback pages and App.jsx created');
          }

          // Copy CartContext if needed (for ecommerce/restaurant industries)
          const cartRequiredIndustries = ['restaurant', 'ecommerce', 'retail', 'pizzeria', 'pizza', 'cafe', 'bakery', 'food-truck', 'barbershop', 'spa-salon'];
          const needsCart = cartRequiredIndustries.includes(sanitizedIndustry) ||
                           payload.pages.some(p => ['menu', 'cart', 'checkout', 'order', 'products', 'services', 'booking'].includes(p.toLowerCase()));
          if (needsCart) {
            const contextDir = path.join(frontendSrcPath, 'context');
            if (!fs.existsSync(contextDir)) {
              fs.mkdirSync(contextDir, { recursive: true });
            }
            const cartContextSrc = path.join(__dirname, '../saas-templates/pizza-ordering/frontend/context/CartContext.jsx');
            if (fs.existsSync(cartContextSrc)) {
              fs.copyFileSync(cartContextSrc, path.join(contextDir, 'CartContext.jsx'));
              console.log('   🛒 CartContext copied for cart functionality');
            }
          }

          console.log('─'.repeat(40));

          // ========================================
          // MODULE VALIDATION (auto-fix icon imports)
          // ========================================
          console.log('');
          console.log('   🔍 Running module validation...');
          try {
            const validationResults = await validateProject(projectPath);
            if (validationResults.summary.totalFixes > 0) {
              console.log(`   ✅ Auto-fixed ${validationResults.summary.totalFixes} issue(s)`);
            }
            if (validationResults.summary.totalIssues === 0) {
              console.log('   ✅ All module validations passed');
            }
          } catch (validationErr) {
            console.warn('   ⚠️ Module validation error:', validationErr.message);
          }
        }

        console.log('');
        console.log('✅ ORCHESTRATION COMPLETE');
        console.log(`   ⏱️ Total time: ${(duration / 1000).toFixed(1)}s`);
        console.log('='.repeat(60));

        // ========================================
        // TRACK GENERATION COMPLETE
        // ========================================
        if (generationId && db && db.trackGenerationComplete) {
          try {
            await db.trackGenerationComplete(generationId, {
              pagesGenerated: payload.pages?.length || 0,
              generationTimeMs: duration
            });
            console.log(`   📊 Generation ${generationId} marked complete`);
          } catch (trackErr) {
            console.warn('   ⚠️ Generation complete tracking failed:', trackErr.message);
          }
        }

        res.json({
          success: true,
          project: {
            name: sanitizedName,
            path: projectPath
          },
          orchestrator: {
            originalInput: userInput,
            summary: summary,
            decisions: {
              businessName: summary.businessName,
              industry: summary.industry,
              industryName: summary.industryName,
              location: summary.location,
              pages: payload.pages,
              modules: payload.modules,
              colors: payload.theme?.colors,
              tagline: payload.metadata?.inferredDetails?.tagline,
              callToAction: payload.metadata?.inferredDetails?.callToAction,
              confidence: summary.confidence
            }
          },
          duration: duration,
          generationId: generationId,
          includeCompanionApp: includeCompanionApp
        });
      } else {
        console.error(`❌ Assembly failed with code ${code}`);

        // Track generation failure
        if (generationId && db && db.trackGenerationFailed) {
          try {
            await db.trackGenerationFailed(generationId, { message: `Assembly failed with exit code ${code}`, output: errorOutput });
          } catch (trackErr) {
            console.warn('   ⚠️ Generation failure tracking failed:', trackErr.message);
          }
        }

        res.status(500).json({
          success: false,
          error: 'Assembly failed',
          details: errorOutput || output,
          orchestratorSummary: summary
        });
      }
    });

  } catch (error) {
    console.error('❌ Orchestrator error:', error.message);
    captureException(error, { tags: { component: 'orchestrator' } });

    // Track generation failure (generationId might not exist if error happened early)
    if (typeof generationId !== 'undefined' && generationId && db && db.trackGenerationFailed) {
      try {
        await db.trackGenerationFailed(generationId, error);
      } catch (trackErr) {
        console.warn('   ⚠️ Generation failure tracking failed:', trackErr.message);
      }
    }

    res.status(500).json({
      success: false,
      error: `Orchestration failed: ${error.message}`
    });
  }
});

// ============================================
// INTENT DETECTION ENDPOINT
// ============================================

/**
 * POST /api/orchestrate/detect-intent
 * Detect intent type from user input without starting full orchestration
 * Used to determine if we should show choice screen
 *
 * Request: { input: "I'm starting a bakery" }
 * Response: { type: 'ambiguous' | 'tool' | 'business' | 'recommendations', detectedIndustry, ... }
 */
router.post('/orchestrate/detect-intent', async (req, res) => {
  const { input } = req.body;

  if (!input || input.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Input is required'
    });
  }

  try {
    const { detectIntentType, VALID_INDUSTRIES, INDUSTRY_KEYWORDS } = require('../../services/orchestrator.cjs');

    const intent = detectIntentType(input);

    // Get a display-friendly industry name
    let industryDisplay = intent.detectedIndustry;
    if (industryDisplay) {
      // Convert kebab-case to Title Case
      industryDisplay = industryDisplay
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Get industry icon
    const industryIcons = {
      'bakery': '🥐',
      'restaurant': '🍽️',
      'pizza': '🍕',
      'cafe': '☕',
      'bar': '🍺',
      'fitness': '💪',
      'yoga': '🧘',
      'spa-salon': '💆',
      'dental': '🦷',
      'healthcare': '🏥',
      'law-firm': '⚖️',
      'accounting': '📊',
      'real-estate': '🏠',
      'consulting': '💼',
      'photography': '📸',
      'freelance': '💻',
      'agency': '🎨',
      'startup': '🚀',
      'saas': '☁️',
      'ecommerce': '🛒',
      'plumbing': '🔧',
      'hvac': '❄️',
      'electrical': '⚡',
      'landscaping': '🌳',
      'cleaning': '🧹',
      'auto': '🚗',
      'pet': '🐾',
      'education': '📚',
      'nonprofit': '❤️',
      'church': '⛪',
      'wedding': '💒'
    };

    const icon = industryIcons[intent.detectedIndustry] || '🏢';

    console.log(`[detect-intent] "${input}" → ${intent.type} (industry: ${intent.detectedIndustry || 'none'})`);

    return res.json({
      success: true,
      type: intent.type,
      toolKey: intent.toolKey,
      confidence: intent.confidence,
      detectedIndustry: intent.detectedIndustry,
      industryDisplay,
      industryIcon: icon,
      originalInput: input
    });

  } catch (error) {
    console.error('❌ Intent detection error:', error);
    return res.status(500).json({
      success: false,
      error: `Detection failed: ${error.message}`
    });
  }
});

// ============================================
// TOOL RECOMMENDATIONS ENDPOINT
// ============================================

/**
 * POST /api/orchestrate/recommend
 * Get tool recommendations for an industry/profession
 *
 * Request: { input: "I'm a plumber" } or { industry: "plumbing" }
 * Response: { recommendations: [...], industry: "plumbing" }
 */
router.post('/orchestrate/recommend', orchestrateRateLimiter, async (req, res) => {
  const { input, industry } = req.body;
  const startTime = Date.now();

  // Validate input
  const userInput = input?.trim() || industry?.trim();
  if (!userInput || userInput.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an industry or description (minimum 2 characters)'
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('💡 TOOL RECOMMENDATIONS');
  console.log('='.repeat(60));
  console.log(`📝 Input: "${userInput}"`);

  try {
    const { recommendTools, detectRecommendationIntent } = require('../../services/orchestrator.cjs');

    // Detect intent if full input provided
    let industryToUse = industry;
    if (input && !industry) {
      const intent = detectRecommendationIntent(input);
      if (intent.industry) {
        industryToUse = intent.industry;
        console.log(`🎯 Detected industry: ${industryToUse}`);
      } else {
        industryToUse = input; // Use raw input for AI inference
      }
    }

    // Get recommendations
    const result = await recommendTools(industryToUse || userInput);
    const duration = Date.now() - startTime;

    console.log(`✅ Got ${result.recommendations.length} recommendations in ${duration}ms`);
    console.log(`   Source: ${result.source}`);
    console.log('='.repeat(60));

    return res.json({
      success: true,
      ...result,
      duration
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to get recommendations: ${error.message}`
    });
  }
});

/**
 * POST /api/orchestrate/analyze-for-tools
 * AI-powered tool suite recommendation
 * Takes a business description and returns personalized tool recommendations with reasons
 *
 * Request: { description: "I'm a personal trainer who tracks client workouts..." }
 * Response: { success, industry, industryIcon, suggestedName, tools: [{toolType, name, icon, description, reason}] }
 */
router.post('/orchestrate/analyze-for-tools', orchestrateRateLimiter, async (req, res) => {
  const { description } = req.body;
  const startTime = Date.now();

  if (!description || description.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a description (minimum 10 characters)'
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🤖 AI TOOL SUITE ANALYSIS');
  console.log('='.repeat(60));
  console.log(`📝 Description: "${description.substring(0, 100)}..."`);

  try {
    // All available tools for recommendation
    const AVAILABLE_TOOLS = [
      { id: 'invoice-generator', icon: '📄', name: 'Invoice Generator', desc: 'Create professional invoices', category: 'business' },
      { id: 'receipt-generator', icon: '🧾', name: 'Receipt Generator', desc: 'Generate receipts instantly', category: 'business' },
      { id: 'expense-tracker', icon: '💰', name: 'Expense Tracker', desc: 'Track spending & budgets', category: 'business' },
      { id: 'time-tracker', icon: '⏰', name: 'Time Tracker', desc: 'Log hours & projects', category: 'business' },
      { id: 'qr-generator', icon: '📱', name: 'QR Code Generator', desc: 'Generate QR codes instantly', category: 'utilities' },
      { id: 'password-generator', icon: '🔐', name: 'Password Generator', desc: 'Secure random passwords', category: 'utilities' },
      { id: 'countdown', icon: '⏱️', name: 'Countdown Timer', desc: 'Event countdowns & timers', category: 'utilities' },
      { id: 'pomodoro', icon: '🍅', name: 'Pomodoro Timer', desc: 'Focus & productivity timer', category: 'utilities' },
      { id: 'calculator', icon: '🧮', name: 'Calculator', desc: 'Custom calculations', category: 'calculators' },
      { id: 'tip-calculator', icon: '💵', name: 'Tip Calculator', desc: 'Split bills & calculate tips', category: 'calculators' },
      { id: 'bmi-calculator', icon: '⚖️', name: 'BMI Calculator', desc: 'Health & fitness metrics', category: 'calculators' },
      { id: 'calorie-calculator', icon: '🍎', name: 'Calorie Calculator', desc: 'Nutrition & diet planning', category: 'calculators' },
      { id: 'habit-tracker', icon: '✅', name: 'Habit Tracker', desc: 'Build better habits daily', category: 'lifestyle' },
      { id: 'recipe-scaler', icon: '🍳', name: 'Recipe Scaler', desc: 'Adjust recipe portions', category: 'lifestyle' },
      { id: 'unit-converter', icon: '🔄', name: 'Unit Converter', desc: 'Convert any measurements', category: 'lifestyle' },
      { id: 'color-picker', icon: '🎨', name: 'Color Picker', desc: 'Find perfect color palettes', category: 'lifestyle' },
    ];

    // Industry detection patterns
    const INDUSTRY_PATTERNS = {
      fitness: { keywords: ['trainer', 'gym', 'fitness', 'workout', 'exercise', 'health'], icon: '💪' },
      restaurant: { keywords: ['restaurant', 'cafe', 'food', 'chef', 'kitchen', 'menu', 'cook'], icon: '🍽️' },
      freelance: { keywords: ['freelance', 'freelancer', 'client', 'invoice', 'contractor'], icon: '💼' },
      design: { keywords: ['design', 'designer', 'creative', 'artist', 'graphic'], icon: '🎨' },
      retail: { keywords: ['store', 'shop', 'retail', 'sell', 'inventory', 'product'], icon: '🛒' },
      realestate: { keywords: ['real estate', 'property', 'agent', 'house', 'mortgage'], icon: '🏠' },
      content: { keywords: ['youtube', 'content', 'creator', 'video', 'podcast', 'blog'], icon: '📹' },
      coaching: { keywords: ['coach', 'coaching', 'mentor', 'teaching', 'training'], icon: '🎯' },
    };

    // Detect industry from description
    const descLower = description.toLowerCase();
    let detectedIndustry = null;
    let industryIcon = '🎯';

    for (const [industry, data] of Object.entries(INDUSTRY_PATTERNS)) {
      if (data.keywords.some(kw => descLower.includes(kw))) {
        detectedIndustry = industry;
        industryIcon = data.icon;
        break;
      }
    }

    // Tool matching patterns (what tools are relevant for what keywords)
    const TOOL_RELEVANCE = {
      'invoice-generator': ['invoice', 'billing', 'client', 'freelance', 'payment', 'money'],
      'receipt-generator': ['receipt', 'sale', 'purchase', 'retail', 'store', 'transaction'],
      'expense-tracker': ['expense', 'budget', 'spending', 'money', 'cost', 'finance'],
      'time-tracker': ['time', 'hours', 'project', 'client', 'track', 'log', 'work'],
      'qr-generator': ['qr', 'menu', 'link', 'scan', 'restaurant', 'retail'],
      'password-generator': ['password', 'security', 'account', 'login', 'safe'],
      'countdown': ['timer', 'countdown', 'event', 'deadline', 'launch'],
      'pomodoro': ['focus', 'productivity', 'work', 'concentrate', 'timer'],
      'calculator': ['calculate', 'math', 'number', 'price', 'cost'],
      'tip-calculator': ['tip', 'restaurant', 'cafe', 'bill', 'split'],
      'bmi-calculator': ['bmi', 'weight', 'health', 'fitness', 'body', 'trainer'],
      'calorie-calculator': ['calorie', 'diet', 'nutrition', 'food', 'meal', 'fitness', 'weight'],
      'habit-tracker': ['habit', 'track', 'daily', 'routine', 'goal', 'progress'],
      'recipe-scaler': ['recipe', 'cook', 'food', 'ingredient', 'portion', 'kitchen'],
      'unit-converter': ['convert', 'unit', 'measurement', 'metric', 'size'],
      'color-picker': ['color', 'design', 'palette', 'brand', 'creative'],
    };

    // Score each tool based on relevance
    const scoredTools = AVAILABLE_TOOLS.map(tool => {
      const relevanceKeywords = TOOL_RELEVANCE[tool.id] || [];
      const matches = relevanceKeywords.filter(kw => descLower.includes(kw));
      const score = matches.length;
      const reason = matches.length > 0
        ? `Relevant for: ${matches.slice(0, 2).join(', ')}`
        : null;
      return { ...tool, score, reason, matches };
    });

    // Get top scoring tools (at least 3, up to 6)
    const recommendedTools = scoredTools
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // If not enough tools, add some based on industry defaults
    if (recommendedTools.length < 3) {
      const industryDefaults = {
        fitness: ['bmi-calculator', 'calorie-calculator', 'habit-tracker', 'pomodoro'],
        restaurant: ['tip-calculator', 'recipe-scaler', 'countdown', 'qr-generator'],
        freelance: ['invoice-generator', 'time-tracker', 'expense-tracker', 'pomodoro'],
        design: ['color-picker', 'pomodoro', 'password-generator', 'habit-tracker'],
        retail: ['receipt-generator', 'calculator', 'qr-generator', 'expense-tracker'],
        default: ['calculator', 'habit-tracker', 'pomodoro', 'password-generator'],
      };

      const defaults = industryDefaults[detectedIndustry] || industryDefaults.default;
      for (const toolId of defaults) {
        if (recommendedTools.length >= 4) break;
        if (!recommendedTools.find(t => t.id === toolId)) {
          const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
          if (tool) {
            recommendedTools.push({
              ...tool,
              reason: `Common for ${detectedIndustry || 'your'} work`,
            });
          }
        }
      }
    }

    // Generate suggested name
    const suggestedName = detectedIndustry
      ? `${detectedIndustry.charAt(0).toUpperCase() + detectedIndustry.slice(1)} Tools`
      : 'My Business Tools';

    const duration = Date.now() - startTime;
    console.log(`✅ Recommended ${recommendedTools.length} tools in ${duration}ms`);
    console.log(`   Detected industry: ${detectedIndustry || 'general'}`);
    console.log('='.repeat(60));

    return res.json({
      success: true,
      industry: detectedIndustry,
      industryIcon,
      suggestedName,
      tools: recommendedTools.map(t => ({
        toolType: t.id,
        name: t.name,
        icon: t.icon,
        description: t.desc,
        category: t.category,
        reason: t.reason,
      })),
      duration,
    });
  } catch (error) {
    console.error('❌ Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: `Analysis failed: ${error.message}`
    });
  }
});

/**
 * POST /api/orchestrate/build-tool
 * Build a specific tool by toolType (used from recommendations)
 *
 * Request: { toolType: "tip-calculator", name: "My Tip Calculator" }
 * Response: Same as /api/orchestrate for tool type
 */
router.post('/orchestrate/build-tool', orchestrateRateLimiter, async (req, res) => {
  const { toolType, name, customization } = req.body;
  const startTime = Date.now();

  if (!toolType) {
    return res.status(400).json({
      success: false,
      error: 'Tool type is required'
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔧 BUILD SPECIFIC TOOL');
  console.log('='.repeat(60));
  console.log(`📝 Tool Type: ${toolType}`);
  console.log(`📛 Name: ${name || 'default'}`);

  try {
    const { TOOL_TEMPLATES, generateSpecializedToolHTML } = require('../../services/orchestrator.cjs');

    // Get tool template
    const template = TOOL_TEMPLATES[toolType];
    if (!template) {
      // Fall back to generic prompt-based generation
      console.log('   Using AI generation for unknown tool type');
      const { orchestrate } = require('../../services/orchestrator.cjs');
      const result = await orchestrate(`Create a ${toolType.replace(/-/g, ' ')}`);

      if (!result.success || result.type !== 'tool') {
        return res.status(400).json({
          success: false,
          error: `Could not generate tool: ${toolType}`
        });
      }

      // Generate HTML
      const toolHtml = generateSpecializedToolHTML(result.payload.toolKey, {
        name: name || result.payload.name,
        ...result.payload.toolConfig
      });

      const duration = Date.now() - startTime;

      return res.json({
        success: true,
        type: 'tool',
        tool: {
          toolKey: result.payload.toolKey,
          name: name || result.payload.name,
          ...result.payload.toolConfig
        },
        html: toolHtml,
        duration
      });
    }

    // Generate from known template
    const toolConfig = {
      name: name || template.name,
      icon: template.icon,
      description: template.description,
      features: template.features,
      fields: template.fields,
      colors: customization?.colors || template.colors
    };

    const toolHtml = generateSpecializedToolHTML(toolType, toolConfig);
    const duration = Date.now() - startTime;

    // Create project directory
    const toolName = (name || template.name)
      .replace(/&/g, ' and ')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50);

    const projectPath = path.join(GENERATED_PROJECTS, toolName);
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    fs.writeFileSync(path.join(projectPath, 'index.html'), toolHtml);

    console.log('✅ Tool built successfully');
    console.log(`   ⏱️ Time: ${duration}ms`);
    console.log('='.repeat(60));

    return res.json({
      success: true,
      type: 'tool',
      project: {
        name: toolName,
        path: projectPath
      },
      tool: {
        toolKey: toolType,
        ...toolConfig
      },
      html: toolHtml,
      duration
    });
  } catch (error) {
    console.error('❌ Build tool error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to build tool: ${error.message}`
    });
  }
});

/**
 * POST /api/orchestrate/build-suite
 * Build a Tool Suite with multiple tools
 *
 * Request: {
 *   tools: [{ toolType: "calculator", name: "Calculator" }, ...],
 *   branding: { businessName: "My Business", colors: {...}, style: "modern" },
 *   options: { organization: "grid", toolOrder: [...], categoryGroups: {...} }
 * }
 * Response: { success, files, zipPath, suiteConfig }
 */
router.post('/orchestrate/build-suite', orchestrateRateLimiter, async (req, res) => {
  const { tools, branding, options } = req.body;
  const startTime = Date.now();

  console.log('');
  console.log('='.repeat(60));
  console.log('🧰 TOOL SUITE BUILDER');
  console.log('='.repeat(60));

  try {
    // Validate input
    if (!tools || !Array.isArray(tools) || tools.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 tools are required for a suite'
      });
    }

    if (tools.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 20 tools per suite'
      });
    }

    const { generateToolSuite, getSuiteOrganization, TOOL_TEMPLATES } = require('../../services/orchestrator.cjs');

    // Process tools - get full config for each
    const processedTools = tools.map(tool => {
      const template = TOOL_TEMPLATES[tool.toolType] || TOOL_TEMPLATES['generic'] || {
        name: tool.name || 'Tool',
        icon: '🔧',
        description: 'A useful tool'
      };

      return {
        key: tool.toolType,
        toolKey: tool.toolType,
        name: tool.name || template.name,
        icon: tool.icon || template.icon,
        description: tool.description || template.description,
        category: tool.category || template.category || 'General',
        features: tool.features || template.features || [],
        fields: tool.fields || template.fields || []
      };
    });

    // Determine organization if not specified
    const organization = options?.organization
      ? { type: options.organization, description: `${options.organization} layout` }
      : getSuiteOrganization(processedTools.length);

    console.log(`   🏢 Business: ${branding?.businessName || 'Tool Suite'}`);
    console.log(`   🛠️ Tools: ${processedTools.length}`);
    console.log(`   📊 Organization: ${organization.type}`);
    console.log(`   🎨 Style: ${branding?.style || 'modern'}`);
    console.log('─'.repeat(40));

    // Log each tool
    processedTools.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.icon} ${tool.name} (${tool.key})`);
    });
    console.log('─'.repeat(40));

    // Generate the suite
    const suiteResult = generateToolSuite(processedTools, branding, {
      organization,
      toolOrder: options?.toolOrder,
      categoryGroups: options?.categoryGroups
    });

    // Create suite directory
    const suiteName = (branding?.businessName || 'tool-suite')
      .replace(/&/g, ' and ')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50);

    const suiteDir = path.join(GENERATED_PROJECTS, `${suiteName}-suite`);

    // Clean and create directory
    if (fs.existsSync(suiteDir)) {
      fs.rmSync(suiteDir, { recursive: true, force: true });
    }
    fs.mkdirSync(suiteDir, { recursive: true });

    // Create tools subdirectory if needed
    if (organization.type !== 'tabbed') {
      fs.mkdirSync(path.join(suiteDir, 'tools'), { recursive: true });
    }

    // Write all files
    const fileList = [];
    for (const [filename, content] of Object.entries(suiteResult.files)) {
      const filePath = path.join(suiteDir, filename);
      // Ensure parent directory exists
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      fileList.push(filename);
      console.log(`   ✅ Created: ${filename}`);
    }

    // Generate ZIP file
    let zipPath = null;
    try {
      const archiver = require('archiver');
      zipPath = path.join(suiteDir, `${suiteName}-suite.zip`);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);

        // Add all files except the zip itself
        for (const [filename, content] of Object.entries(suiteResult.files)) {
          archive.append(content, { name: filename });
        }

        archive.finalize();
      });

      console.log(`   📦 ZIP created: ${path.basename(zipPath)}`);
    } catch (zipError) {
      console.log('   ⚠️ ZIP creation skipped (archiver not available)');
    }

    const duration = Date.now() - startTime;

    console.log('');
    console.log('✅ TOOL SUITE COMPLETE');
    console.log(`   ⏱️ Time: ${duration}ms`);
    console.log(`   📁 Path: ${suiteDir}`);
    console.log(`   📄 Files: ${fileList.length}`);
    console.log('='.repeat(60));

    // Read index.html for preview
    const indexHtml = suiteResult.files['index.html'];

    return res.json({
      success: true,
      type: 'suite',
      project: {
        name: `${suiteName}-suite`,
        path: suiteDir
      },
      suite: {
        businessName: branding?.businessName || 'Tool Suite',
        organization: organization.type,
        toolCount: processedTools.length,
        tools: processedTools.map(t => ({
          key: t.key,
          name: t.name,
          icon: t.icon,
          category: t.category
        }))
      },
      files: fileList,
      html: indexHtml,
      zipPath: zipPath,
      zipFilename: zipPath ? `${suiteName}-suite.zip` : null,
      duration
    });

  } catch (error) {
    console.error('❌ Build suite error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to build suite: ${error.message}`
    });
  }
});

/**
 * GET /api/orchestrate/download-suite/:projectName
 * Download the suite ZIP file
 */
router.get('/orchestrate/download-suite/:projectName', (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    return res.status(400).json({ success: false, error: 'Project name required' });
  }

  // Security: sanitize project name
  const safeName = projectName.replace(/[^a-zA-Z0-9-]/g, '');
  const suiteDir = path.join(GENERATED_PROJECTS, safeName);
  const zipPath = path.join(suiteDir, `${safeName}.zip`);

  if (!fs.existsSync(zipPath)) {
    // Try to find any zip in the directory
    const files = fs.readdirSync(suiteDir);
    const zipFile = files.find(f => f.endsWith('.zip'));
    if (zipFile) {
      return res.download(path.join(suiteDir, zipFile), zipFile);
    }
    return res.status(404).json({ success: false, error: 'ZIP file not found' });
  }

  res.download(zipPath, `${safeName}.zip`);
});

  return router;
}

module.exports = { createOrchestratorRoutes };
