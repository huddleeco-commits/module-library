/**
 * Unified Generator Service
 *
 * Combines the best of all generation methods:
 * - Full-stack generation (frontend + backend + admin + database)
 * - Input level auto-population (minimal/moderate/extreme)
 * - Variant support (multiple presets × themes)
 * - SSE progress streaming
 *
 * This is the single source of truth for site generation.
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { InputGenerator } = require('./input-generator.cjs');
const { loadFixture, applyCustomizations } = require('../../test-fixtures/index.cjs');

// Directories
const MODULE_LIBRARY = process.env.MODULE_LIBRARY_PATH || path.join(__dirname, '..', '..');
const PROSPECTS_DIR = path.join(MODULE_LIBRARY, 'output', 'prospects');
const GENERATED_PROJECTS_DIR = path.join(MODULE_LIBRARY, 'output', 'generated-projects');
const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, '..', 'run-assembler.js');

// Industry mapping (from scout.cjs)
const FIXTURE_TO_ASSEMBLER = {
  'salon': 'spa-salon', 'nail salon': 'spa-salon', 'spa': 'spa-salon',
  'gym': 'fitness', 'coffee': 'cafe', 'dentist': 'dental',
  'doctor': 'healthcare', 'lawyer': 'law-firm', 'real estate': 'real-estate',
  'auto repair': 'auto-repair', 'salon-spa': 'spa-salon', 'fitness-gym': 'fitness',
  'coffee-cafe': 'cafe', 'pizza-restaurant': 'pizza', 'pizzeria': 'pizza',
  'pizza': 'pizza', 'restaurant': 'restaurant', 'cafe': 'cafe',
  'bakery': 'bakery', 'bar': 'bar', 'barbershop': 'barbershop',
  'dental': 'dental', 'healthcare': 'healthcare', 'fitness': 'fitness',
  'yoga': 'yoga', 'law-firm': 'law-firm', 'real-estate': 'real-estate',
  'accounting': 'accounting', 'plumber': 'plumber', 'electrician': 'electrician',
  'cleaning': 'cleaning', 'auto-repair': 'auto-repair', 'saas': 'saas',
  'ecommerce': 'retail', 'retail': 'retail'
};

// Portal pages
const PORTAL_PAGES = ['login', 'register', 'dashboard', 'profile', 'account', 'rewards'];

class UnifiedGenerator {
  constructor(deps = {}) {
    this.MasterAgent = deps.MasterAgent || require('../agents/master-agent.cjs');
    this.VideoGenerator = deps.VideoGenerator;
    this.LogoGenerator = deps.LogoGenerator;
    this.writeTestDashboard = deps.writeTestDashboard;
    this.inputGenerator = new InputGenerator({ verbose: true });
    this.verbose = deps.verbose !== false;

    // Try to load optional dependencies
    try {
      if (!this.VideoGenerator) {
        this.VideoGenerator = require('./video-generator.cjs');
      }
    } catch (e) {
      this.log('VideoGenerator not available', 'warn');
    }

    try {
      if (!this.LogoGenerator) {
        this.LogoGenerator = require('./logo-generator.cjs');
      }
    } catch (e) {
      this.log('LogoGenerator not available', 'warn');
    }

    try {
      if (!this.writeTestDashboard) {
        const dashGen = require('../generators/test-dashboard-generator.cjs');
        this.writeTestDashboard = dashGen.writeTestDashboard;
      }
    } catch (e) {
      this.log('TestDashboardGenerator not available', 'warn');
    }
  }

  log(message, type = 'info') {
    if (this.verbose) {
      const prefix = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌', progress: '🔄' }[type] || 'ℹ️';
      console.log(`${prefix} [UnifiedGenerator] ${message}`);
    }
  }

  /**
   * Main generation entry point
   * @param {Object} config - Generation configuration
   * @param {Function} onProgress - Progress callback (step, status, progress)
   * @returns {Object} Generation result
   */
  async generate(config, onProgress = () => {}) {
    const startTime = Date.now();

    try {
      // Step 1: Resolve source (prospect or manual)
      onProgress({ step: 'init', status: 'Loading configuration...', progress: 5 });
      const source = await this.resolveSource(config.source);

      // Step 2: Generate or merge inputs based on level
      onProgress({ step: 'inputs', status: `Auto-generating inputs (${config.inputLevel} level)...`, progress: 10 });
      const inputs = await this.resolveInputs(config, source);

      // Step 3: Determine output location
      const outputPath = this.resolveOutputPath(config, source, inputs);
      this.log(`Output path: ${outputPath}`);

      // Step 4: Check if variants mode
      if (config.variants?.enabled && config.variants.presets?.length > 0) {
        return await this.generateVariants(config, source, inputs, outputPath, onProgress);
      }

      // Single site generation
      return await this.generateSingle(config, source, inputs, outputPath, onProgress, startTime);

    } catch (err) {
      this.log(`Generation failed: ${err.message}`, 'error');
      onProgress({ step: 'error', status: err.message, progress: 0, error: err.message });
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate a single site
   */
  async generateSingle(config, source, inputs, outputPath, onProgress, startTime) {
    const industry = this.resolveIndustry(inputs.industry || source.fixtureId);

    // Step 5: Clear existing output
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
      this.log(`Cleared existing: ${outputPath}`);
    }
    fs.mkdirSync(outputPath, { recursive: true });

    // Step 6: Run assembler (full-stack structure)
    onProgress({ step: 'assembler', status: 'Creating full-stack structure...', progress: 20 });
    await this.runAssembler(outputPath, industry);

    // Step 7: Delete generic frontend and generate styled one
    onProgress({ step: 'frontend', status: 'Generating styled pages...', progress: 35 });
    const frontendDir = path.join(outputPath, 'frontend');
    if (fs.existsSync(frontendDir)) {
      fs.rmSync(frontendDir, { recursive: true, force: true });
    }

    // Build requested pages list
    let pages = inputs.pages || [];
    if (inputs.enablePortal !== false) {
      PORTAL_PAGES.forEach(p => {
        if (!pages.includes(p)) pages.push(p);
      });
    }

    // Generate frontend with MasterAgent
    const master = new this.MasterAgent({ verbose: false });
    const frontendResult = await master.generateProject({
      projectName: inputs.businessName || source.name,
      fixtureId: source.fixtureId || inputs.industry || 'restaurant',
      testMode: true,
      runBuild: false,
      outputPath: outputPath,
      prospectData: source,
      requestedPages: pages.length > 0 ? pages : null,
      requestedFeatures: inputs.features || null,
      tier: inputs.tier || 'premium',
      layout: inputs.layout,
      industryGroup: inputs.industryGroup,
      moodSliders: inputs.moodSliders,
      archetype: inputs.archetype,
      enablePortal: inputs.enablePortal !== false
    });

    if (!frontendResult.success) {
      this.log('Frontend generation had issues', 'warn');
    }

    // Step 8: Generate video (if enabled)
    let videoResult = null;
    if (inputs.generateVideo !== false && this.VideoGenerator) {
      onProgress({ step: 'video', status: 'Generating video assets...', progress: 60 });
      try {
        const videoGen = new this.VideoGenerator(outputPath);
        videoResult = await videoGen.generateVideos();
      } catch (e) {
        this.log(`Video generation failed: ${e.message}`, 'warn');
      }
    }

    // Step 9: Generate logo (if enabled)
    let logoResult = null;
    if (inputs.generateLogo !== false && this.LogoGenerator) {
      onProgress({ step: 'logo', status: 'Generating logo variants...', progress: 75 });
      try {
        const logoGen = new this.LogoGenerator(outputPath);
        logoResult = await logoGen.generateLogos();
      } catch (e) {
        this.log(`Logo generation failed: ${e.message}`, 'warn');
      }
    }

    // Step 10: Generate test dashboard
    onProgress({ step: 'dashboard', status: 'Creating test dashboard...', progress: 85 });
    if (this.writeTestDashboard) {
      try {
        this.writeTestDashboard(outputPath, {
          projectName: inputs.businessName || source.name,
          industry,
          prospect: source,
          generationTimeMs: Date.now() - startTime,
          preset: inputs.preset,
          theme: inputs.theme,
          inputLevel: inputs.inputLevel
        });
      } catch (e) {
        this.log(`Dashboard generation failed: ${e.message}`, 'warn');
      }
    }

    // Step 11: Build frontend
    onProgress({ step: 'build', status: 'Building frontend...', progress: 90 });
    await this.buildFrontend(outputPath);

    // Count metrics
    const metrics = this.countMetrics(outputPath);

    const result = {
      success: true,
      outputPath,
      projectName: inputs.businessName || source.name,
      industry,
      inputLevel: inputs.inputLevel,
      preset: inputs.preset,
      theme: inputs.theme,
      pages: pages.length,
      generationTimeMs: Date.now() - startTime,
      metrics,
      video: videoResult?.success || false,
      logo: logoResult?.success || false
    };

    onProgress({ step: 'complete', status: 'Generation complete!', progress: 100, result });
    return result;
  }

  /**
   * Generate multiple variants
   */
  async generateVariants(config, source, baseInputs, basePath, onProgress) {
    const presets = config.variants.presets || ['luxury'];
    const themes = config.variants.themes || ['light'];
    const combinations = [];

    // Build all combinations
    for (const preset of presets) {
      for (const theme of themes) {
        combinations.push({ preset, theme, key: `${preset}-${theme}` });
      }
    }

    this.log(`Generating ${combinations.length} variants`);
    const results = [];
    let sharedVideoPath = null;
    let sharedLogoPath = null;

    for (let i = 0; i < combinations.length; i++) {
      const combo = combinations[i];
      const variantPath = path.join(basePath, `variant-${combo.key}`);
      const progress = 10 + (80 * (i / combinations.length));

      onProgress({
        step: 'variant',
        status: `Generating variant ${i + 1}/${combinations.length}: ${combo.preset} + ${combo.theme}`,
        progress,
        variant: combo.key
      });

      // Merge variant-specific settings
      const variantInputs = {
        ...baseInputs,
        preset: combo.preset,
        theme: combo.theme,
        // Only generate video/logo on first variant
        generateVideo: i === 0 && baseInputs.generateVideo !== false,
        generateLogo: i === 0 && baseInputs.generateLogo !== false
      };

      // Override mood sliders based on preset
      variantInputs.moodSliders = this.getPresetMoodSliders(combo.preset, combo.theme);

      const variantResult = await this.generateSingle(
        config,
        source,
        variantInputs,
        variantPath,
        () => {}, // Silent progress for sub-generations
        Date.now()
      );

      results.push({
        ...variantResult,
        variantKey: combo.key,
        preset: combo.preset,
        theme: combo.theme
      });

      // Save shared asset paths from first variant
      if (i === 0) {
        sharedVideoPath = path.join(variantPath, 'frontend', 'public', 'videos');
        sharedLogoPath = path.join(variantPath, 'frontend', 'public', 'logos');
      } else {
        // Copy shared assets to other variants
        this.copySharedAssets(sharedVideoPath, sharedLogoPath, variantPath);
      }
    }

    // Save master metrics
    const masterMetrics = {
      generatedAt: new Date().toISOString(),
      totalVariants: results.length,
      totalPages: results.reduce((sum, r) => sum + (r.pages || 0), 0),
      totalLines: results.reduce((sum, r) => sum + (r.metrics?.linesOfCode || 0), 0),
      variants: results.map(r => ({
        key: r.variantKey,
        preset: r.preset,
        theme: r.theme,
        pages: r.pages,
        lines: r.metrics?.linesOfCode
      }))
    };

    fs.writeFileSync(
      path.join(basePath, 'master-metrics.json'),
      JSON.stringify(masterMetrics, null, 2)
    );

    onProgress({
      step: 'complete',
      status: `All ${combinations.length} variants generated!`,
      progress: 100,
      result: { variants: results, metrics: masterMetrics }
    });

    return {
      success: true,
      variants: results,
      metrics: masterMetrics,
      outputPath: basePath
    };
  }

  /**
   * Resolve source (prospect or manual business info)
   */
  async resolveSource(source) {
    if (source.type === 'prospect' && source.prospectFolder) {
      // Load from prospects folder
      const prospectDir = path.join(PROSPECTS_DIR, source.prospectFolder);
      const prospectFile = path.join(prospectDir, 'prospect.json');

      if (!fs.existsSync(prospectFile)) {
        throw new Error(`Prospect not found: ${source.prospectFolder}`);
      }

      return JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    }

    // Manual entry - return as-is
    return {
      name: source.business?.name || 'New Business',
      industry: source.business?.industry || 'restaurant',
      fixtureId: source.business?.industry || 'restaurant',
      address: source.business?.location || '',
      phone: source.business?.phone || '',
      email: source.business?.email || '',
      tagline: source.business?.tagline || '',
      research: {} // No research for manual entry
    };
  }

  /**
   * Resolve inputs based on level and overrides
   */
  async resolveInputs(config, source) {
    const level = config.inputLevel || 'moderate';

    if (level === 'custom') {
      // Custom mode: use provided config directly
      return {
        inputLevel: 'custom',
        businessName: source.name,
        industry: source.fixtureId || source.industry,
        ...config.config
      };
    }

    // Auto-generate inputs based on level
    const autoInputs = this.inputGenerator.generateInputs(source, level);

    // Resolve 'auto' values for minimal level
    if (autoInputs._resolved) {
      Object.assign(autoInputs, autoInputs._resolved);
      delete autoInputs._resolved;
    }

    // Merge with user overrides (user config takes precedence)
    const merged = { ...autoInputs };
    if (config.config) {
      Object.keys(config.config).forEach(key => {
        if (config.config[key] !== undefined && config.config[key] !== null) {
          merged[key] = config.config[key];
        }
      });
    }

    return merged;
  }

  /**
   * Resolve output path
   */
  resolveOutputPath(config, source, inputs) {
    const projectSlug = (inputs.businessName || source.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const suffix = config.variantSuffix || '';
    const baseDir = config.outputLocation === 'prospects'
      ? path.join(PROSPECTS_DIR, source.prospectFolder || projectSlug, 'unified-test' + suffix)
      : path.join(GENERATED_PROJECTS_DIR, projectSlug + suffix);

    return baseDir;
  }

  /**
   * Resolve industry key
   */
  resolveIndustry(fixtureId) {
    return FIXTURE_TO_ASSEMBLER[fixtureId] || fixtureId || 'restaurant';
  }

  /**
   * Run the assembler script
   */
  async runAssembler(outputPath, industry) {
    return new Promise((resolve, reject) => {
      // The assembler creates OUTPUT_PATH/name, so we extract parent and name
      const parentDir = path.dirname(outputPath);
      const projectName = path.basename(outputPath);

      const args = [ASSEMBLE_SCRIPT, '--name', projectName, '--industry', industry];

      this.log(`Running assembler: ${args.join(' ')}`);
      this.log(`OUTPUT_PATH: ${parentDir}`);

      const child = spawn('node', args, {
        cwd: MODULE_LIBRARY,
        env: {
          ...process.env,
          MODULE_LIBRARY_PATH: MODULE_LIBRARY,
          OUTPUT_PATH: parentDir
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => { stdout += data.toString(); });
      child.stderr.on('data', data => { stderr += data.toString(); });

      child.on('close', code => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Assembler failed (code ${code}): ${stderr}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Build frontend
   */
  async buildFrontend(outputPath) {
    const frontendDir = path.join(outputPath, 'frontend');
    if (!fs.existsSync(frontendDir)) {
      this.log('No frontend directory to build', 'warn');
      return;
    }

    try {
      this.log('Installing dependencies...');
      execSync('npm install --legacy-peer-deps', {
        cwd: frontendDir,
        stdio: 'pipe',
        timeout: 120000
      });

      this.log('Building frontend...');
      execSync('npm run build', {
        cwd: frontendDir,
        stdio: 'pipe',
        timeout: 120000
      });

      this.log('Frontend built successfully', 'success');
    } catch (e) {
      this.log(`Build failed: ${e.message}`, 'warn');
    }
  }

  /**
   * Count project metrics
   */
  countMetrics(outputPath) {
    let totalFiles = 0;
    let totalLines = 0;

    const countDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.includes('node_modules') && entry.name !== 'dist') {
          countDir(fullPath);
        } else if (entry.isFile() && /\.(jsx?|tsx?|css|json)$/.test(entry.name)) {
          totalFiles++;
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            totalLines += content.split('\n').length;
          } catch (e) {}
        }
      }
    };

    countDir(path.join(outputPath, 'frontend'));
    countDir(path.join(outputPath, 'backend'));

    return { totalFiles, linesOfCode: totalLines };
  }

  /**
   * Get mood sliders for a preset
   */
  getPresetMoodSliders(preset, theme) {
    const presets = {
      'luxury': { vibe: 30, energy: 35, era: 40, density: 30, price: 90 },
      'friendly': { vibe: 80, energy: 60, era: 50, density: 60, price: 40 },
      'minimal': { vibe: 50, energy: 40, era: 85, density: 20, price: 70 },
      'clean': { vibe: 35, energy: 45, era: 95, density: 40, price: 65 },
      'bold': { vibe: 75, energy: 90, era: 70, density: 70, price: 50 },
      'warm': { vibe: 25, energy: 30, era: 20, density: 45, price: 80 }
    };

    return {
      ...(presets[preset] || presets.clean),
      theme: theme || 'light'
    };
  }

  /**
   * Copy shared assets between variants
   */
  copySharedAssets(videoPath, logoPath, targetPath) {
    const targetFrontend = path.join(targetPath, 'frontend', 'public');

    try {
      if (videoPath && fs.existsSync(videoPath)) {
        const targetVideos = path.join(targetFrontend, 'videos');
        fs.mkdirSync(targetVideos, { recursive: true });
        fs.cpSync(videoPath, targetVideos, { recursive: true });
      }
    } catch (e) {
      this.log(`Failed to copy videos: ${e.message}`, 'warn');
    }

    try {
      if (logoPath && fs.existsSync(logoPath)) {
        const targetLogos = path.join(targetFrontend, 'logos');
        fs.mkdirSync(targetLogos, { recursive: true });
        fs.cpSync(logoPath, targetLogos, { recursive: true });
      }
    } catch (e) {
      this.log(`Failed to copy logos: ${e.message}`, 'warn');
    }
  }
}

module.exports = { UnifiedGenerator };
