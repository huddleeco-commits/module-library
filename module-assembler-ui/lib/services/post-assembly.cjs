/**
 * Post-Assembly Service
 *
 * Handles all post-assembly tasks after the base project structure is created:
 * - Generate brain.json
 * - Copy admin modules
 * - Generate AI pages (or fallback pages)
 * - Generate App.jsx with routes
 * - Run module validation (icon imports)
 * - Run build validation (AUDIT 1)
 * - Auto-deploy if requested
 *
 * This module is shared between server.cjs (sync) and worker.cjs (async).
 */

const path = require('path');
const fs = require('fs');

// Import required services and utilities
let generatorsModule = null;
let promptBuildersModule = null;
let utilsModule = null;
let configsModule = null;
let adminModuleLoader = null;
let auditService = null;
let moduleValidator = null;
let deployService = null;

// Lazy load modules to avoid circular dependencies
function loadModules() {
  if (!generatorsModule) {
    generatorsModule = require('../generators/index.cjs');
    promptBuildersModule = require('../prompt-builders/index.cjs');
    utilsModule = require('../utils/index.cjs');
    configsModule = require('../configs/index.cjs');
    adminModuleLoader = require('./admin-module-loader.cjs');
    auditService = require('./audit-service.cjs');
    moduleValidator = require('./module-validator.cjs');

    // Deploy service is optional (may not be configured)
    try {
      deployService = require('../../services/deploy-service.cjs');
    } catch (err) {
      console.warn('Deploy service not available:', err.message);
    }
  }
}

/**
 * Run all post-assembly tasks for a generated project
 *
 * @param {Object} options
 * @param {string} options.projectPath - Path to the generated project
 * @param {string} options.projectName - Project name
 * @param {string} options.industry - Industry key
 * @param {Object} options.description - Description with pages, text, etc.
 * @param {Object} options.theme - Theme config
 * @param {string} options.adminTier - Admin tier (standard/pro/enterprise)
 * @param {string[]} options.adminModules - Selected admin modules
 * @param {boolean} options.testMode - Skip AI calls, use fallback pages
 * @param {boolean} options.autoDeploy - Auto-deploy after build
 * @param {number} options.generationId - Database generation ID
 * @param {Object} options.db - Database instance for tracking
 * @param {string} options.moduleLibraryPath - Path to module library root
 * @param {Function} options.onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Result with success status, audit result, deploy result
 */
async function runPostAssembly(options) {
  loadModules();

  const {
    projectPath,
    projectName,
    industry,
    description,
    theme,
    adminTier = 'standard',
    adminModules = [],
    testMode = false,
    autoDeploy = false,
    generationId = null,
    db = null,
    moduleLibraryPath,
    onProgress = () => {}
  } = options;

  const startTime = Date.now();
  const result = {
    success: false,
    projectPath,
    projectName,
    pagesGenerated: 0,
    auditResult: null,
    deployResult: null,
    errors: [],
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0
  };

  try {
    // Load industry configs
    const PROMPTS_DIR = path.join(moduleLibraryPath, 'module-assembler-ui', 'prompts');
    const INDUSTRIES = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'industries.json'), 'utf-8'));

    onProgress(10);

    // ==========================================
    // 1. Generate brain.json
    // ==========================================
    console.log('   🧠 Generating brain.json...');
    const industryConfig = INDUSTRIES[industry] || null;

    // Pass user-provided data to brain.json generator
    const brainConfig = {
      adminTier,
      adminModules,
      // User business data from description
      businessLocation: description?.location || description?.businessLocation || '',
      businessHours: description?.hours || null,
      businessPhone: description?.phone || '',
      businessEmail: description?.email || '',
      tagline: description?.tagline || '',
      menuText: description?.menuText || '',
      features: description?.features || []
    };

    const brainJsonContent = generatorsModule.generateBrainJson(projectName, industry, industryConfig, brainConfig);
    fs.writeFileSync(path.join(projectPath, 'brain.json'), brainJsonContent);

    onProgress(15);

    // ==========================================
    // 2. Generate backend routes
    // ==========================================
    console.log('   🔌 Generating backend routes...');
    const backendRoutesDir = path.join(projectPath, 'backend', 'routes');
    if (!fs.existsSync(backendRoutesDir)) {
      fs.mkdirSync(backendRoutesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backendRoutesDir, 'brain.js'), generatorsModule.generateBrainRoutes());
    fs.writeFileSync(path.join(backendRoutesDir, 'health.js'), generatorsModule.generateHealthRoutes());

    onProgress(20);

    // ==========================================
    // 3. Copy admin modules
    // ==========================================
    console.log('   🎛️ Setting up admin modules...');
    const businessAdminDest = path.join(projectPath, 'admin');

    let resolvedAdminModules = adminModules;
    if (!resolvedAdminModules || resolvedAdminModules.length === 0) {
      const suggestion = adminModuleLoader.suggestAdminTier(industry, description?.text || '');
      resolvedAdminModules = suggestion.modules;
    }

    try {
      const moduleData = adminModuleLoader.loadModulesForAssembly(resolvedAdminModules);

      // Copy base business-admin
      const businessAdminSrc = path.join(moduleLibraryPath, 'frontend', 'business-admin');
      if (fs.existsSync(businessAdminSrc)) {
        utilsModule.copyDirectorySync(businessAdminSrc, businessAdminDest);
      }

      // Copy selected modules
      const modulesDir = path.join(businessAdminDest, 'src', 'modules');
      if (!fs.existsSync(modulesDir)) {
        fs.mkdirSync(modulesDir, { recursive: true });
      }

      const adminModulesPath = path.join(moduleLibraryPath, 'module-assembler-ui', 'backend', 'admin-modules');
      for (const mod of moduleData.modules) {
        const modSrc = path.join(adminModulesPath, mod.name);
        const modDest = path.join(modulesDir, mod.name);
        if (fs.existsSync(modSrc)) {
          utilsModule.copyDirectorySync(modSrc, modDest);
        }
      }

      // Copy shared module
      const sharedModuleSrc = path.join(adminModulesPath, '_shared');
      if (fs.existsSync(sharedModuleSrc)) {
        utilsModule.copyDirectorySync(sharedModuleSrc, path.join(modulesDir, '_shared'));
      }

      // Generate admin App.jsx
      const adminAppJsx = adminModuleLoader.generateAdminAppJsx(resolvedAdminModules, { businessName: projectName });
      fs.writeFileSync(path.join(businessAdminDest, 'src', 'App.jsx'), adminAppJsx);

      // Save admin config
      fs.writeFileSync(path.join(businessAdminDest, 'admin-config.json'), JSON.stringify({
        tier: adminTier,
        modules: resolvedAdminModules,
        generatedAt: new Date().toISOString(),
        sidebar: moduleData.sidebar,
        routes: moduleData.routes
      }, null, 2));

      // Copy brain.json to admin config
      const adminConfigDir = path.join(businessAdminDest, 'src', 'config');
      if (!fs.existsSync(adminConfigDir)) {
        fs.mkdirSync(adminConfigDir, { recursive: true });
      }
      fs.copyFileSync(path.join(projectPath, 'brain.json'), path.join(adminConfigDir, 'brain.json'));

      console.log(`   ✅ Admin modules set up (${resolvedAdminModules.length} modules)`);
    } catch (adminErr) {
      console.warn('   ⚠️ Admin setup failed:', adminErr.message);
      result.errors.push({ type: 'admin', message: adminErr.message });
    }

    onProgress(30);

    // ==========================================
    // 4. Generate pages (AI or fallback)
    // ==========================================
    const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
    const pagesDir = path.join(frontendSrcPath, 'pages');

    if (description && description.pages && description.pages.length > 0) {
      console.log(`   🤖 Generating ${description.pages.length} pages...`);

      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }

      // Build prompt config
      const promptConfig = promptBuildersModule.buildPrompt(
        industry,
        description?.layoutStyleId || description?.layoutKey || null,
        description?.effects || null
      );

      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (apiKey && !testMode) {
        // AI page generation
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic({ apiKey });
        const MODEL_NAME = 'claude-sonnet-4-20250514';

        const pagePromises = description.pages.map(async (pageId) => {
          const componentName = utilsModule.toComponentName(pageId);

          try {
            const otherPages = description.pages.filter(p => p !== pageId).map(p => `/${p}`).join(', ');
            const pagePrompt = await promptBuildersModule.buildFreshModePrompt(
              pageId, componentName, otherPages, description, promptConfig
            );

            const pageResponse = await client.messages.create({
              model: MODEL_NAME,
              max_tokens: 16000,
              messages: [{ role: 'user', content: pagePrompt }]
            });

            // Track tokens
            if (pageResponse.usage) {
              result.totalInputTokens += pageResponse.usage.input_tokens || 0;
              result.totalOutputTokens += pageResponse.usage.output_tokens || 0;
              const pageCost = (pageResponse.usage.input_tokens / 1000000) * 3.0 +
                              (pageResponse.usage.output_tokens / 1000000) * 15.0;
              result.totalCost += pageCost;
            }

            let pageCode = pageResponse.content[0].text;
            pageCode = pageCode.replace(/^```jsx?\n?/g, '').replace(/\n?```$/g, '').trim();

            // Validate and fix
            const validation = generatorsModule.validateGeneratedCode(pageCode, componentName);
            pageCode = validation.fixedCode;

            if (!pageCode.includes('export default')) {
              pageCode = promptBuildersModule.buildFallbackPage(componentName, pageId, promptConfig, industry);
            }

            fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), pageCode);
            return { pageId, componentName, success: true };

          } catch (err) {
            console.warn(`   ⚠️ ${pageId} failed: ${err.message}`);
            const fallbackCode = promptBuildersModule.buildFallbackPage(componentName, pageId, promptConfig, industry);
            fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
            return { pageId, componentName, success: false, fallback: true };
          }
        });

        const pageResults = await Promise.all(pagePromises);
        result.pagesGenerated = pageResults.filter(r => r.success).length;

      } else {
        // Fallback pages (test mode or no API key)
        console.log(`   📦 Using fallback pages (${testMode ? 'test mode' : 'no API key'})`);

        for (const pageId of description.pages) {
          const componentName = utilsModule.toComponentName(pageId);
          const fallbackCode = promptBuildersModule.buildFallbackPage(componentName, pageId, promptConfig, industry);
          fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
        }
        result.pagesGenerated = description.pages.length;
      }

      // Generate App.jsx
      const appJsx = generatorsModule.buildAppJsx(projectName, description.pages, promptConfig, industry);
      fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);

      // Ensure theme.css exists
      const themeCssPath = path.join(frontendSrcPath, 'theme.css');
      if (!fs.existsSync(themeCssPath)) {
        const fallbackTheme = promptBuildersModule.buildFallbackThemeCss(promptConfig);
        fs.writeFileSync(themeCssPath, fallbackTheme);
      }

      // Copy effects library
      const effectsSrc = path.join(moduleLibraryPath, 'frontend', 'effects');
      const effectsDest = path.join(frontendSrcPath, 'effects');
      if (fs.existsSync(effectsSrc)) {
        utilsModule.copyDirectorySync(effectsSrc, effectsDest);
      }
    }

    onProgress(60);

    // ==========================================
    // 5. Module validation (icon imports)
    // ==========================================
    console.log('   🔍 Running module validation...');
    try {
      const validationResults = await moduleValidator.validateProject(projectPath);
      if (validationResults.summary.totalFixes > 0) {
        console.log(`   ✅ Auto-fixed ${validationResults.summary.totalFixes} issue(s)`);
      }
    } catch (err) {
      console.warn('   ⚠️ Validation error:', err.message);
      result.errors.push({ type: 'validation', message: err.message });
    }

    onProgress(70);

    // ==========================================
    // 6. Build validation (AUDIT 1)
    // ==========================================
    console.log('   🔍 Running build validation...');
    try {
      const auditResult = await auditService.audit1PostGeneration(projectPath, {
        maxRetries: 2,
        timeout: 120000
      });

      result.auditResult = {
        success: auditResult.success,
        durationMs: auditResult.durationMs,
        errorCount: auditResult.errors?.length || 0,
        warningCount: auditResult.warnings?.length || 0,
        errors: (auditResult.errors || []).slice(0, 5),
        warnings: (auditResult.warnings || []).slice(0, 3)
      };

      // Track in database
      if (generationId && db && db.trackBuildResult) {
        await db.trackBuildResult(generationId, auditResult);
      }

      if (auditResult.success) {
        console.log('   ✅ Build validation passed');
      } else {
        console.log(`   ❌ Build validation failed (${auditResult.errors?.length || 0} errors)`);
      }
    } catch (err) {
      console.warn('   ⚠️ Audit error:', err.message);
      result.errors.push({ type: 'audit', message: err.message });
    }

    onProgress(85);

    // ==========================================
    // 7. Auto-deploy (if requested and audit passed)
    // ==========================================
    if (autoDeploy && deployService && result.auditResult?.success) {
      console.log('   🚀 Starting auto-deployment...');

      if (deployService.checkCredentials()) {
        try {
          const deployResult = await deployService.deployProject(projectPath, projectName, {
            adminEmail: 'admin@be1st.io'
          });

          result.deployResult = deployResult;

          // Track deployment URLs
          if (generationId && deployResult.success && deployResult.urls && db && db.updateProjectDeploymentUrls) {
            await db.updateProjectDeploymentUrls(generationId, {
              domain: deployResult.urls.frontend?.replace('https://', '').replace('http://', '') || null,
              frontend: deployResult.urls.frontend || null,
              admin: deployResult.urls.admin || null,
              backend: deployResult.urls.backend || null,
              githubFrontend: deployResult.urls.githubFrontend || deployResult.urls.github || null
            });
          }

          console.log(deployResult.success ? '   ✅ Deployed successfully' : '   ❌ Deployment failed');

        } catch (err) {
          console.warn('   ⚠️ Deploy error:', err.message);
          result.deployResult = { success: false, error: err.message };
          result.errors.push({ type: 'deploy', message: err.message });
        }
      } else {
        console.log('   ⚠️ Deploy credentials not configured');
        result.deployResult = { success: false, error: 'Deploy credentials not configured' };
      }
    } else if (autoDeploy && !result.auditResult?.success) {
      console.log('   ⏭️ Skipping deploy - build validation failed');
      result.deployResult = { success: false, error: 'Build validation failed' };
    }

    onProgress(95);

    // ==========================================
    // 8. Track completion
    // ==========================================
    if (generationId && db && db.trackGenerationComplete) {
      try {
        await db.trackGenerationComplete(generationId, {
          pagesGenerated: result.pagesGenerated,
          totalCost: result.totalCost,
          totalTokens: result.totalInputTokens + result.totalOutputTokens,
          inputTokens: result.totalInputTokens,
          outputTokens: result.totalOutputTokens,
          generationTimeMs: Date.now() - startTime
        });
      } catch (err) {
        console.warn('   ⚠️ Tracking error:', err.message);
      }
    }

    onProgress(100);

    result.success = result.auditResult?.success || false;
    result.durationMs = Date.now() - startTime;

    return result;

  } catch (err) {
    console.error('Post-assembly error:', err);
    result.errors.push({ type: 'fatal', message: err.message });

    // Track failure
    if (generationId && db && db.trackGenerationFailed) {
      await db.trackGenerationFailed(generationId, { message: err.message });
    }

    return result;
  }
}

module.exports = {
  runPostAssembly
};
