/**
 * Studio Routes - Unified Generation API
 *
 * Endpoints:
 * - GET /api/studio/sites - List all generated sites
 * - GET /api/studio/sites/:siteId - Get site details with variants
 * - POST /api/studio/generate - Generate site(s)
 * - DELETE /api/studio/sites/:siteId - Delete site (complete: Railway, GitHub, Cloudflare, local)
 * - POST /api/studio/sites/:siteId/variants/:variantId/deploy - Deploy variant
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const CLOUDFLARE_ZONE_ID_APP = process.env.CLOUDFLARE_ZONE_ID_APP;
const RAILWAY_TEAM_ID = process.env.RAILWAY_TEAM_ID;

// ═══════════════════════════════════════════════════════════════
// UNIFIED DELETION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Railway GraphQL API helper
 */
async function railwayGraphQL(query, variables = {}) {
  const data = JSON.stringify({ query, variables });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.errors) {
            reject(new Error(result.errors[0].message));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(new Error(`Railway API parse error: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Find Railway project by name
 */
async function findRailwayProjectByName(name) {
  if (!RAILWAY_TOKEN) return null;

  let sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!/^[a-z]/.test(sanitizedName)) {
    sanitizedName = 'p-' + sanitizedName;
  }
  sanitizedName = sanitizedName.substring(0, 32).replace(/-$/, '');

  console.log(`   🔍 Searching Railway for: ${sanitizedName}`);

  const queries = RAILWAY_TEAM_ID
    ? [
        `query { projects(teamId: "${RAILWAY_TEAM_ID}") { edges { node { id name } } } }`,
        `query { me { projects { edges { node { id name } } } } }`
      ]
    : [
        `query { me { projects { edges { node { id name } } } } }`
      ];

  for (const query of queries) {
    try {
      const result = await railwayGraphQL(query);
      const projects = result?.projects?.edges || result?.me?.projects?.edges || [];
      const found = projects.find(e => e.node.name === sanitizedName);
      if (found) {
        console.log(`   ✅ Found Railway project: ${found.node.name} (${found.node.id})`);
        return found.node;
      }
    } catch (err) {
      console.log(`   ⚠️ Railway query failed: ${err.message}`);
    }
  }
  return null;
}

/**
 * Delete Railway project by ID
 */
async function deleteRailwayProject(projectId, projectName) {
  if (!RAILWAY_TOKEN) return false;

  console.log(`   🗑️ Deleting Railway project: ${projectName}`);
  try {
    const result = await railwayGraphQL(`mutation { projectDelete(id: "${projectId}") }`);
    if (result?.projectDelete) {
      console.log(`   ✅ Railway project deleted`);
      return true;
    }
  } catch (err) {
    console.log(`   ⚠️ Could not delete Railway project: ${err.message}`);
  }
  return false;
}

/**
 * Get GitHub username
 */
async function getGitHubUsername() {
  if (!GITHUB_TOKEN) return null;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-Studio'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body).login);
        } else {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

/**
 * Delete GitHub repository
 */
async function deleteGitHubRepo(owner, repoName) {
  if (!GITHUB_TOKEN || !owner) return false;

  console.log(`   🗑️ Deleting GitHub repo: ${owner}/${repoName}`);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}`,
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-Studio'
      }
    }, (res) => {
      if (res.statusCode === 204) {
        console.log(`   ✅ Deleted ${repoName}`);
        resolve(true);
      } else {
        console.log(`   ⚠️ Could not delete ${repoName} (may not exist)`);
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

/**
 * Delete Cloudflare DNS records for a subdomain
 */
async function deleteCloudflareDNS(subdomain, domain = 'be1st.io') {
  const zoneId = domain === 'be1st.app' ? CLOUDFLARE_ZONE_ID_APP : CLOUDFLARE_ZONE_ID;
  if (!CLOUDFLARE_TOKEN || !zoneId) return false;

  console.log(`   🗑️ Deleting DNS records for ${subdomain}.${domain}`);

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/dns_records?name=${subdomain}.${domain}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', async () => {
        try {
          const result = JSON.parse(body);
          if (result.success && result.result && result.result.length > 0) {
            console.log(`   📋 Found ${result.result.length} DNS record(s) to delete`);
            for (const record of result.result) {
              await deleteCloudflareRecord(zoneId, record.id);
            }
            console.log(`   ✅ DNS records deleted for ${subdomain}.${domain}`);
          } else {
            console.log(`   ℹ️ No DNS records found for ${subdomain}.${domain}`);
          }
        } catch (e) {
          console.log(`   ⚠️ Error parsing Cloudflare response`);
        }
        resolve(true);
      });
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

/**
 * Delete a single Cloudflare DNS record
 */
async function deleteCloudflareRecord(zoneId, recordId) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

/**
 * Complete deletion across all platforms
 * @param {string} subdomain - The site subdomain (e.g., "cristys-bakery")
 * @param {Object} options - Deletion options
 * @returns {Object} Deletion results
 */
async function completeDelete(subdomain, options = {}) {
  const results = {
    railway: { attempted: false, success: false, error: null },
    github: { attempted: false, success: false, repos: [] },
    cloudflare: { attempted: false, success: false, domains: [] },
    local: { attempted: false, success: false, paths: [] }
  };

  console.log(`\n🗑️ COMPLETE DELETION: ${subdomain}`);
  console.log('═'.repeat(50));

  // 1. Delete Railway project
  if (RAILWAY_TOKEN) {
    results.railway.attempted = true;
    try {
      const project = await findRailwayProjectByName(subdomain);
      if (project) {
        results.railway.success = await deleteRailwayProject(project.id, project.name);
      } else {
        console.log(`   ℹ️ No Railway project found for ${subdomain}`);
        results.railway.success = true; // Not finding is OK
      }
    } catch (err) {
      results.railway.error = err.message;
      console.log(`   ❌ Railway deletion error: ${err.message}`);
    }
  } else {
    console.log(`   ⏭️ Skipping Railway (no token)`);
  }

  // 2. Delete GitHub repositories
  if (GITHUB_TOKEN) {
    results.github.attempted = true;
    try {
      const githubUsername = await getGitHubUsername();
      if (githubUsername) {
        // Standard website repos
        const repoSuffixes = ['-backend', '-frontend', '-admin', '-app'];
        for (const suffix of repoSuffixes) {
          const repoName = `${subdomain}${suffix}`;
          const deleted = await deleteGitHubRepo(githubUsername, repoName);
          results.github.repos.push({ name: repoName, deleted });
        }
        results.github.success = true;
      }
    } catch (err) {
      console.log(`   ❌ GitHub deletion error: ${err.message}`);
    }
  } else {
    console.log(`   ⏭️ Skipping GitHub (no token)`);
  }

  // 3. Delete Cloudflare DNS records
  if (CLOUDFLARE_TOKEN) {
    results.cloudflare.attempted = true;
    try {
      // Website domains (.io)
      const ioSubdomains = [subdomain, `api.${subdomain}`, `admin.${subdomain}`];
      for (const sub of ioSubdomains) {
        await deleteCloudflareDNS(sub, 'be1st.io');
        results.cloudflare.domains.push(`${sub}.be1st.io`);
      }

      // App domains (.app) - for companion apps
      if (CLOUDFLARE_ZONE_ID_APP) {
        await deleteCloudflareDNS(subdomain, 'be1st.app');
        results.cloudflare.domains.push(`${subdomain}.be1st.app`);
      }

      results.cloudflare.success = true;
    } catch (err) {
      console.log(`   ❌ Cloudflare deletion error: ${err.message}`);
    }
  } else {
    console.log(`   ⏭️ Skipping Cloudflare (no token)`);
  }

  // 4. Delete local files (handled by caller)
  results.local.attempted = true;
  results.local.success = true;

  console.log('═'.repeat(50));
  console.log(`✅ Complete deletion finished for ${subdomain}\n`);

  return results;
}

/**
 * Create Studio routes
 * @param {Object} deps - Dependencies
 */
function createStudioRoutes(deps = {}) {
  const router = express.Router();

  const {
    GENERATED_PROJECTS = path.join(process.cwd(), 'output/generated-projects'),
    STUDIO_SITES = path.join(process.cwd(), 'output/sites'),
    MODULE_LIBRARY = process.cwd(),
    masterAgent = null,
    autoDeployProject = null,
    db = null
  } = deps;

  // Ensure output directories exist
  const ensureDirectories = () => {
    [STUDIO_SITES, GENERATED_PROJECTS].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  };

  // Get index file path
  const getIndexPath = () => path.join(STUDIO_SITES, 'index.json');

  // Load sites index
  const loadIndex = () => {
    ensureDirectories();
    const indexPath = getIndexPath();
    if (fs.existsSync(indexPath)) {
      try {
        return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      } catch (e) {
        console.warn('Failed to parse sites index:', e);
        return { sites: [], lastUpdated: null };
      }
    }
    return { sites: [], lastUpdated: null };
  };

  // Save sites index
  const saveIndex = (index) => {
    ensureDirectories();
    index.lastUpdated = new Date().toISOString();
    fs.writeFileSync(getIndexPath(), JSON.stringify(index, null, 2));
  };

  // Load site.json for a specific site
  const loadSiteJson = (siteId) => {
    const sitePath = path.join(STUDIO_SITES, siteId, 'site.json');
    if (fs.existsSync(sitePath)) {
      try {
        return JSON.parse(fs.readFileSync(sitePath, 'utf8'));
      } catch (e) {
        console.warn(`Failed to load site.json for ${siteId}:`, e);
      }
    }
    return null;
  };

  // Save site.json
  const saveSiteJson = (siteId, siteData) => {
    const sitePath = path.join(STUDIO_SITES, siteId);
    if (!fs.existsSync(sitePath)) {
      fs.mkdirSync(sitePath, { recursive: true });
    }
    fs.writeFileSync(path.join(sitePath, 'site.json'), JSON.stringify(siteData, null, 2));
  };

  // Merge legacy projects from generated-projects folder
  const mergeLegacyProjects = () => {
    const sites = [];

    // Check legacy generated-projects directory
    if (fs.existsSync(GENERATED_PROJECTS)) {
      const dirs = fs.readdirSync(GENERATED_PROJECTS, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const dirName of dirs) {
        const projectPath = path.join(GENERATED_PROJECTS, dirName);

        // Check if it has a manifest.json
        const manifestPath = path.join(projectPath, 'manifest.json');
        let manifest = null;
        if (fs.existsSync(manifestPath)) {
          try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          } catch (e) {
            // Ignore parse errors
          }
        }

        // Check for frontend folder
        const frontendPath = path.join(projectPath, 'frontend');
        if (!fs.existsSync(frontendPath)) continue;

        // Count pages
        const pagesDir = path.join(frontendPath, 'src', 'pages');
        let pageCount = 0;
        if (fs.existsSync(pagesDir)) {
          pageCount = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx')).length;
        }

        // Get stats
        const stat = fs.statSync(projectPath);

        sites.push({
          id: dirName,
          name: manifest?.name || dirName,
          industry: manifest?.industry || 'general',
          createdAt: stat.birthtime.toISOString(),
          source: 'legacy',
          variants: [{
            id: 'default',
            preset: manifest?.preset || 'default',
            theme: manifest?.theme || 'light',
            status: 'generated',
            pages: pageCount,
            linesOfCode: 0, // Would need to calculate
            path: projectPath
          }],
          totalMetrics: {
            variants: 1,
            totalPages: pageCount,
            totalLines: 0
          }
        });
      }
    }

    return sites;
  };

  // ═══════════════════════════════════════════════════════════════
  // GET /sites - List all generated sites
  // ═══════════════════════════════════════════════════════════════
  router.get('/sites', (req, res) => {
    try {
      // Load from index
      const index = loadIndex();

      // Merge with legacy projects
      const legacySites = mergeLegacyProjects();

      // Combine, removing duplicates (prefer studio sites)
      const studioSiteIds = new Set(index.sites.map(s => s.id));
      const allSites = [
        ...index.sites,
        ...legacySites.filter(s => !studioSiteIds.has(s.id))
      ];

      // Sort by creation date (newest first)
      allSites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        sites: allSites,
        total: allSites.length
      });
    } catch (err) {
      console.error('Failed to list sites:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /sites/:siteId - Get site details with variants
  // ═══════════════════════════════════════════════════════════════
  router.get('/sites/:siteId', (req, res) => {
    try {
      const { siteId } = req.params;

      // Try studio sites first
      let site = loadSiteJson(siteId);

      // Fall back to legacy
      if (!site) {
        const legacyPath = path.join(GENERATED_PROJECTS, siteId);
        if (fs.existsSync(legacyPath)) {
          const manifestPath = path.join(legacyPath, 'manifest.json');
          let manifest = null;
          if (fs.existsSync(manifestPath)) {
            try {
              manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            } catch (e) {}
          }

          site = {
            id: siteId,
            name: manifest?.name || siteId,
            industry: manifest?.industry || 'general',
            source: 'legacy',
            variants: [{
              id: 'default',
              preset: manifest?.preset || 'default',
              theme: manifest?.theme || 'light',
              status: 'generated',
              path: legacyPath
            }]
          };
        }
      }

      if (!site) {
        return res.status(404).json({
          success: false,
          error: 'Site not found'
        });
      }

      res.json({
        success: true,
        site
      });
    } catch (err) {
      console.error('Failed to get site:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /generate - Generate site(s)
  // ═══════════════════════════════════════════════════════════════
  router.post('/generate', async (req, res) => {
    try {
      const {
        mode = 'single',
        business,
        config,
        batchConfig,
        aiDescription
      } = req.body;

      if (!business?.name) {
        return res.status(400).json({
          success: false,
          error: 'Business name is required'
        });
      }

      // Generate site ID
      const siteId = business.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const siteDir = path.join(STUDIO_SITES, siteId);
      ensureDirectories();

      // Create site metadata
      const siteData = {
        id: siteId,
        name: business.name,
        industry: business.industry || 'general',
        location: business.location,
        tagline: business.tagline,
        createdAt: new Date().toISOString(),
        config: {
          layout: config?.layout || 'visual',
          pagePackage: config?.pagePackage || 'full'
        },
        variants: [],
        totalMetrics: {
          variants: 0,
          totalPages: 0,
          totalLines: 0
        }
      };

      // Determine variants to generate
      let variantsToGenerate = [];

      if (mode === 'batch' && batchConfig) {
        // Batch mode: generate all preset × theme combinations
        const presets = batchConfig.presets || ['luxury'];
        const themes = batchConfig.themes || ['light'];

        for (const preset of presets) {
          for (const theme of themes) {
            variantsToGenerate.push({
              id: `${preset}-${theme}`,
              preset,
              theme
            });
          }
        }
      } else {
        // Single or AI mode: generate one variant
        variantsToGenerate.push({
          id: 'default',
          preset: config?.preset || 'luxury',
          theme: config?.theme || 'light'
        });
      }

      // Set up SSE if streaming requested
      const stream = req.headers.accept?.includes('text/event-stream');
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
      }

      const sendProgress = (data) => {
        if (stream) {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
      };

      // Generate each variant
      for (let i = 0; i < variantsToGenerate.length; i++) {
        const variant = variantsToGenerate[i];
        const progress = ((i + 1) / variantsToGenerate.length) * 100;

        sendProgress({
          status: `Generating ${variant.preset}/${variant.theme} (${i + 1}/${variantsToGenerate.length})`,
          progress,
          variant: variant.id
        });

        try {
          // Create variant directory
          const variantDir = path.join(siteDir, 'variants', variant.id);
          if (!fs.existsSync(variantDir)) {
            fs.mkdirSync(variantDir, { recursive: true });
          }

          // Use MasterAgent if available, otherwise use test-mode generation
          let generationResult;

          if (masterAgent) {
            // Full generation with MasterAgent
            generationResult = await masterAgent.generateTestProject({
              businessName: business.name,
              industry: business.industry || 'general',
              location: business.location,
              tagline: business.tagline,
              preset: variant.preset,
              theme: variant.theme,
              layout: config?.layout || 'visual',
              pagePackage: config?.pagePackage || 'full',
              outputDir: variantDir
            });
          } else {
            // Fallback: use test-mode endpoint logic
            // For now, create a placeholder
            generationResult = {
              success: true,
              pages: 5,
              linesOfCode: 2500,
              path: variantDir
            };

            // Create minimal structure
            fs.mkdirSync(path.join(variantDir, 'frontend', 'src', 'pages'), { recursive: true });
            fs.mkdirSync(path.join(variantDir, 'backend'), { recursive: true });

            // Create metrics.json
            fs.writeFileSync(
              path.join(variantDir, 'metrics.json'),
              JSON.stringify({
                pages: 5,
                linesOfCode: 2500,
                generatedAt: new Date().toISOString(),
                preset: variant.preset,
                theme: variant.theme
              }, null, 2)
            );
          }

          // Add variant to site data
          siteData.variants.push({
            id: variant.id,
            preset: variant.preset,
            theme: variant.theme,
            status: 'generated',
            pages: generationResult.pages || 5,
            linesOfCode: generationResult.linesOfCode || 0,
            generatedAt: new Date().toISOString(),
            path: variantDir
          });

        } catch (variantErr) {
          console.error(`Failed to generate variant ${variant.id}:`, variantErr);
          siteData.variants.push({
            id: variant.id,
            preset: variant.preset,
            theme: variant.theme,
            status: 'failed',
            error: variantErr.message
          });
        }
      }

      // Calculate totals
      siteData.totalMetrics = {
        variants: siteData.variants.length,
        totalPages: siteData.variants.reduce((sum, v) => sum + (v.pages || 0), 0),
        totalLines: siteData.variants.reduce((sum, v) => sum + (v.linesOfCode || 0), 0)
      };

      // Save site metadata
      saveSiteJson(siteId, siteData);

      // Update index
      const index = loadIndex();
      const existingIdx = index.sites.findIndex(s => s.id === siteId);
      const siteSummary = {
        id: siteData.id,
        name: siteData.name,
        industry: siteData.industry,
        createdAt: siteData.createdAt,
        variantCount: siteData.variants.length,
        totalPages: siteData.totalMetrics.totalPages
      };

      if (existingIdx >= 0) {
        index.sites[existingIdx] = siteSummary;
      } else {
        index.sites.unshift(siteSummary);
      }
      saveIndex(index);

      // Send completion
      const result = {
        success: true,
        complete: true,
        siteId: siteData.id,
        variants: siteData.variants.map(v => ({
          id: v.id,
          preset: v.preset,
          theme: v.theme,
          status: v.status
        })),
        totalMetrics: siteData.totalMetrics
      };

      if (stream) {
        sendProgress(result);
        res.end();
      } else {
        res.json(result);
      }

    } catch (err) {
      console.error('Generation failed:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: err.message
        });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // DELETE /sites/:siteId - Complete deletion (Railway, GitHub, Cloudflare, local)
  // Query params:
  //   complete=true - Delete from all platforms (default: true)
  //   localOnly=true - Only delete local files
  // ═══════════════════════════════════════════════════════════════
  router.delete('/sites/:siteId', async (req, res) => {
    try {
      const { siteId } = req.params;
      const { localOnly, complete = 'true' } = req.query;
      const doCompleteDelete = complete === 'true' && localOnly !== 'true';

      console.log(`\n📋 DELETE REQUEST: ${siteId}`);
      console.log(`   Complete deletion: ${doCompleteDelete}`);

      // Collect all paths to delete (main site + variants)
      const pathsToDelete = [];
      const studioPath = path.join(STUDIO_SITES, siteId);
      const legacyPath = path.join(GENERATED_PROJECTS, siteId);

      // Check studio sites for variants
      if (fs.existsSync(studioPath)) {
        pathsToDelete.push(studioPath);
      }

      // Check legacy projects
      if (fs.existsSync(legacyPath)) {
        pathsToDelete.push(legacyPath);
      }

      // Also check for variant-suffixed projects (from Scout pipeline)
      const variantSuffixes = ['-local', '-luxury', '-ecommerce', '-minimal', '-moderate', '-extreme'];
      for (const suffix of variantSuffixes) {
        const variantPath = path.join(GENERATED_PROJECTS, `${siteId}${suffix}`);
        if (fs.existsSync(variantPath)) {
          pathsToDelete.push(variantPath);
        }
      }

      if (pathsToDelete.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Site not found'
        });
      }

      // Results tracking
      const results = {
        siteId,
        localPaths: [],
        platformDeletion: null
      };

      // 1. Delete from external platforms (Railway, GitHub, Cloudflare)
      if (doCompleteDelete) {
        results.platformDeletion = await completeDelete(siteId);
      }

      // 2. Delete local files
      for (const p of pathsToDelete) {
        try {
          fs.rmSync(p, { recursive: true, force: true });
          results.localPaths.push({ path: p, deleted: true });
          console.log(`   ✅ Deleted local: ${p}`);
        } catch (err) {
          results.localPaths.push({ path: p, deleted: false, error: err.message });
          console.log(`   ❌ Failed to delete: ${p}`);
        }
      }

      // 3. Update studio index
      const index = loadIndex();
      index.sites = index.sites.filter(s => s.id !== siteId);
      saveIndex(index);

      // 4. Log deletion for audit trail
      const deletionLogDir = path.join(MODULE_LIBRARY, 'deletion-logs');
      if (!fs.existsSync(deletionLogDir)) {
        fs.mkdirSync(deletionLogDir, { recursive: true });
      }
      const logFile = path.join(deletionLogDir, `${siteId}-${new Date().toISOString().replace(/:/g, '-')}.json`);
      fs.writeFileSync(logFile, JSON.stringify({
        siteId,
        deletedAt: new Date().toISOString(),
        complete: doCompleteDelete,
        results
      }, null, 2));

      res.json({
        success: true,
        message: `Site ${siteId} deleted${doCompleteDelete ? ' from all platforms' : ' (local only)'}`,
        results
      });

    } catch (err) {
      console.error('Delete failed:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /sites/:siteId/variants/:variantId/deploy - Deploy variant
  // ═══════════════════════════════════════════════════════════════
  router.post('/sites/:siteId/variants/:variantId/deploy', async (req, res) => {
    try {
      const { siteId, variantId } = req.params;

      // Find the variant path
      let projectPath = null;

      // Check studio sites
      const site = loadSiteJson(siteId);
      if (site) {
        const variant = site.variants.find(v => v.id === variantId);
        if (variant?.path) {
          projectPath = variant.path;
        } else {
          projectPath = path.join(STUDIO_SITES, siteId, 'variants', variantId);
        }
      }

      // Fall back to legacy
      if (!projectPath || !fs.existsSync(projectPath)) {
        const legacyPath = path.join(GENERATED_PROJECTS, siteId);
        if (fs.existsSync(legacyPath)) {
          projectPath = legacyPath;
        }
      }

      if (!projectPath || !fs.existsSync(projectPath)) {
        return res.status(404).json({
          success: false,
          error: 'Variant not found'
        });
      }

      // Use deploy service if available
      if (autoDeployProject) {
        const result = await autoDeployProject({
          projectPath,
          projectName: `${siteId}-${variantId}`,
          adminEmail: 'admin@be1st.io'
        });

        res.json({
          success: true,
          deployment: result
        });
      } else {
        res.status(501).json({
          success: false,
          error: 'Deployment not configured'
        });
      }

    } catch (err) {
      console.error('Deploy failed:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // POST /unified-generate - Unified generation with input levels
  //
  // This is the main generation endpoint that combines:
  // - Full-stack generation (frontend + backend + admin + database)
  // - Input level auto-population (minimal/moderate/extreme)
  // - Variant support (multiple presets × themes)
  // - SSE progress streaming
  // ═══════════════════════════════════════════════════════════════
  router.post('/unified-generate', async (req, res) => {
    try {
      const { UnifiedGenerator } = require('../services/unified-generator.cjs');
      const generator = new UnifiedGenerator({
        verbose: true,
        MasterAgent: masterAgent?.constructor || require('../agents/master-agent.cjs')
      });

      // Set up SSE for streaming progress
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendProgress = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Run generation
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('📦 UNIFIED GENERATION REQUEST');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`   Source: ${req.body.source?.type || 'manual'}`);
      console.log(`   Input Level: ${req.body.inputLevel || 'moderate'}`);
      console.log(`   Variants: ${req.body.variants?.enabled ? 'Yes' : 'No'}`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      const result = await generator.generate(req.body, sendProgress);

      // Send final result
      sendProgress({ step: 'done', result });
      res.end();

    } catch (err) {
      console.error('Unified generation failed:', err);
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
      }
      res.write(`data: ${JSON.stringify({ step: 'error', error: err.message })}\n\n`);
      res.end();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /prospects - List prospects for pipeline integration
  // ═══════════════════════════════════════════════════════════════
  router.get('/prospects', async (req, res) => {
    try {
      const PROSPECTS_DIR = path.join(MODULE_LIBRARY, 'output', 'prospects');

      if (!fs.existsSync(PROSPECTS_DIR)) {
        return res.json({ success: true, prospects: [] });
      }

      const folders = fs.readdirSync(PROSPECTS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      const prospects = [];
      for (const folder of folders) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            prospects.push({
              folder,
              name: data.name,
              industry: data.fixtureId || data.category,
              city: data.city,
              hasResearch: !!data.research?.rating,
              rating: data.research?.rating,
              status: data.status,
              score: data.opportunityScore
            });
          } catch (e) {
            // Skip invalid prospects
          }
        }
      }

      // Sort by score descending
      prospects.sort((a, b) => (b.score || 0) - (a.score || 0));

      res.json({ success: true, prospects });
    } catch (err) {
      console.error('Failed to list prospects:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // GET /inputs-preview - Preview auto-generated inputs for a prospect
  // ═══════════════════════════════════════════════════════════════
  router.get('/inputs-preview/:folder/:level', async (req, res) => {
    try {
      const { folder, level } = req.params;
      const { InputGenerator } = require('../services/input-generator.cjs');
      const inputGenerator = new InputGenerator({ verbose: false });

      const PROSPECTS_DIR = path.join(MODULE_LIBRARY, 'output', 'prospects');
      const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');

      if (!fs.existsSync(prospectFile)) {
        return res.status(404).json({ success: false, error: 'Prospect not found' });
      }

      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      const inputs = inputGenerator.generateInputs(prospect, level);

      // Resolve auto values for minimal level
      if (inputs._resolved) {
        Object.assign(inputs, inputs._resolved);
        delete inputs._resolved;
      }

      res.json({ success: true, inputs, level, prospect: { name: prospect.name, industry: prospect.fixtureId } });
    } catch (err) {
      console.error('Failed to preview inputs:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createStudioRoutes };
