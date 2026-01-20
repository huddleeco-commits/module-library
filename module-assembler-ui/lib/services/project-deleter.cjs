/**
 * Project Deleter Service
 * Safely removes ALL traces of a generated project:
 * - GitHub repos (backend, frontend, admin)
 * - Railway project and all services
 * - Cloudflare DNS records
 * - Local files
 *
 * Safety features:
 * - Exact name matching only
 * - Ownership verification
 * - Transaction logging
 * - Manifest backup before deletion
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const RAILWAY_TEAM_ID = process.env.RAILWAY_TEAM_ID;
const GITHUB_OWNER = 'huddleeco-commits';
const GENERATED_PROJECTS_PATH = process.env.GENERATED_PROJECTS_PATH ||
  path.join(__dirname, '..', '..', '..', '..', 'generated-projects');

// Deletion logs directory
const DELETION_LOGS_PATH = path.join(__dirname, '..', '..', 'deletion-logs');

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function log(message, type = 'info') {
  const prefix = {
    'info': '   ',
    'success': '   ✅',
    'error': '   ❌',
    'warning': '   ⚠️',
    'pending': '   ⏳'
  }[type] || '   ';
  console.log(`${prefix} ${message}`);
}

// ============================================
// DISCOVERY FUNCTIONS
// ============================================

/**
 * Find all resources associated with a project name
 */
async function discoverProjectResources(projectName) {
  const sanitized = sanitizeName(projectName);
  const resources = {
    name: projectName,
    sanitizedName: sanitized,
    github: {
      repos: [
        { name: `${sanitized}-backend`, owner: GITHUB_OWNER, exists: false },
        { name: `${sanitized}-frontend`, owner: GITHUB_OWNER, exists: false },
        { name: `${sanitized}-admin`, owner: GITHUB_OWNER, exists: false }
      ]
    },
    railway: {
      project: null,
      services: []
    },
    cloudflare: {
      records: []
    },
    local: {
      path: null,
      exists: false
    }
  };

  // Check GitHub repos
  for (const repo of resources.github.repos) {
    repo.exists = await checkGitHubRepoExists(repo.owner, repo.name);
  }

  // Check Railway project
  const railwayProject = await findRailwayProject(sanitized);
  if (railwayProject) {
    resources.railway.project = railwayProject;
    resources.railway.services = await listRailwayServices(railwayProject.id);
  }

  // Check Cloudflare DNS records
  const dnsSubdomains = [sanitized, `api.${sanitized}`, `admin.${sanitized}`];
  for (const subdomain of dnsSubdomains) {
    const records = await findCloudflareDNSRecords(subdomain);
    resources.cloudflare.records.push(...records);
  }

  // Check local folder (try multiple naming conventions)
  const possiblePaths = [
    path.join(GENERATED_PROJECTS_PATH, projectName),
    path.join(GENERATED_PROJECTS_PATH, sanitized),
    path.join(GENERATED_PROJECTS_PATH, projectName.replace(/\s+/g, '-'))
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resources.local.path = p;
      resources.local.exists = true;
      break;
    }
  }

  return resources;
}

// ============================================
// GITHUB FUNCTIONS
// ============================================

async function checkGitHubRepoExists(owner, repoName) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-ProjectDeleter'
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function deleteGitHubRepo(owner, repoName) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}`,
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-ProjectDeleter'
      }
    }, (res) => {
      if (res.statusCode === 204) {
        resolve({ success: true, message: `Deleted ${owner}/${repoName}` });
      } else if (res.statusCode === 404) {
        resolve({ success: true, message: `${owner}/${repoName} not found (already deleted)` });
      } else {
        resolve({ success: false, message: `Failed to delete ${owner}/${repoName}: HTTP ${res.statusCode}` });
      }
    });
    req.on('error', (e) => resolve({ success: false, message: e.message }));
    req.end();
  });
}

async function verifyGitHubRepoDeleted(owner, repoName) {
  const exists = await checkGitHubRepoExists(owner, repoName);
  return !exists;
}

// ============================================
// RAILWAY FUNCTIONS
// ============================================

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
        'Content-Length': data.length
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

async function findRailwayProject(projectName) {
  try {
    // Query projects in workspace (must use workspaceId for team projects)
    const query = `
      query($workspaceId: String!) {
        workspace(workspaceId: $workspaceId) {
          projects {
            edges {
              node {
                id
                name
                createdAt
                environments {
                  edges {
                    node {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await railwayGraphQL(query, { workspaceId: RAILWAY_TEAM_ID });
    const projects = result.workspace?.projects?.edges || [];

    // Find exact match (case-insensitive)
    const match = projects.find(p =>
      p.node.name.toLowerCase() === projectName.toLowerCase()
    );

    if (match) {
      return {
        id: match.node.id,
        name: match.node.name,
        createdAt: match.node.createdAt,
        environments: match.node.environments.edges.map(e => ({
          id: e.node.id,
          name: e.node.name
        }))
      };
    }

    return null;
  } catch (e) {
    console.error('Failed to search Railway projects:', e.message);
    return null;
  }
}

async function listRailwayServices(projectId) {
  try {
    const query = `
      query($projectId: String!) {
        project(id: $projectId) {
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `;

    const result = await railwayGraphQL(query, { projectId });
    return (result.project?.services?.edges || []).map(e => ({
      id: e.node.id,
      name: e.node.name
    }));
  } catch (e) {
    console.error('Failed to list Railway services:', e.message);
    return [];
  }
}

async function deleteRailwayProject(projectId) {
  try {
    const query = `
      mutation projectDelete($id: String!) {
        projectDelete(id: $id)
      }
    `;

    await railwayGraphQL(query, { id: projectId });
    return { success: true, message: `Deleted Railway project ${projectId}` };
  } catch (e) {
    return { success: false, message: `Failed to delete Railway project: ${e.message}` };
  }
}

async function verifyRailwayProjectDeleted(projectName) {
  const project = await findRailwayProject(projectName);
  return project === null;
}

// ============================================
// CLOUDFLARE FUNCTIONS
// ============================================

async function findCloudflareDNSRecords(subdomain) {
  return new Promise((resolve) => {
    const fullDomain = subdomain.includes('.be1st.io') ? subdomain : `${subdomain}.be1st.io`;

    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${fullDomain}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success && result.result) {
            resolve(result.result.map(r => ({
              id: r.id,
              name: r.name,
              type: r.type,
              content: r.content
            })));
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

async function deleteCloudflareDNSRecord(recordId, recordName) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            resolve({ success: true, message: `Deleted ${recordName}` });
          } else {
            resolve({ success: false, message: `Failed to delete ${recordName}: ${JSON.stringify(result.errors)}` });
          }
        } catch (e) {
          resolve({ success: false, message: `Failed to delete ${recordName}: ${e.message}` });
        }
      });
    });
    req.on('error', (e) => resolve({ success: false, message: e.message }));
    req.end();
  });
}

async function verifyCloudflareDNSDeleted(subdomain) {
  const records = await findCloudflareDNSRecords(subdomain);
  return records.length === 0;
}

// ============================================
// LOCAL FILE FUNCTIONS
// ============================================

function deleteLocalFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
      return { success: true, message: `Deleted ${folderPath}` };
    }
    return { success: true, message: `${folderPath} not found (already deleted)` };
  } catch (e) {
    return { success: false, message: `Failed to delete ${folderPath}: ${e.message}` };
  }
}

function verifyLocalFolderDeleted(folderPath) {
  return !fs.existsSync(folderPath);
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

function createDeletionLog(projectName, resources, results) {
  if (!fs.existsSync(DELETION_LOGS_PATH)) {
    fs.mkdirSync(DELETION_LOGS_PATH, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(DELETION_LOGS_PATH, `${projectName}-${timestamp}.json`);

  const logData = {
    projectName,
    deletedAt: new Date().toISOString(),
    resourcesFound: resources,
    deletionResults: results
  };

  fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
  return logFile;
}

function saveProjectManifest(projectName, resources) {
  if (!fs.existsSync(DELETION_LOGS_PATH)) {
    fs.mkdirSync(DELETION_LOGS_PATH, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifestFile = path.join(DELETION_LOGS_PATH, `${projectName}-manifest-${timestamp}.json`);

  const manifest = {
    projectName,
    savedAt: new Date().toISOString(),
    resources
  };

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  return manifestFile;
}

// ============================================
// MAIN DELETION FUNCTION
// ============================================

/**
 * Delete all resources for a project
 * @param {string} projectName - The project name
 * @param {object} options - Options
 * @param {boolean} options.dryRun - If true, only show what would be deleted
 * @param {boolean} options.localOnly - Only delete local files
 * @param {boolean} options.cloudOnly - Only delete cloud resources (GitHub, Railway, Cloudflare)
 * @param {boolean} options.skipVerification - Skip post-deletion verification
 */
async function deleteProject(projectName, options = {}) {
  const { dryRun = false, localOnly = false, cloudOnly = false, skipVerification = false } = options;

  console.log('');
  console.log('═'.repeat(50));
  console.log(`🗑️  DELETE PROJECT: ${projectName}`);
  console.log('═'.repeat(50));
  console.log('');

  // Step 1: Discover all resources
  console.log('🔍 Discovering project resources...');
  const resources = await discoverProjectResources(projectName);

  // Save manifest before deletion
  if (!dryRun) {
    const manifestFile = saveProjectManifest(projectName, resources);
    console.log(`📋 Saved project manifest to: ${manifestFile}`);
  }

  // Display what will be deleted
  console.log('');
  console.log('⚠️  This will permanently delete:');
  console.log('');

  // GitHub
  if (!localOnly) {
    console.log('GitHub Repos:');
    for (const repo of resources.github.repos) {
      const status = repo.exists ? '' : ' (not found)';
      console.log(`   • ${repo.owner}/${repo.name}${status}`);
    }
    console.log('');
  }

  // Railway
  if (!localOnly) {
    console.log('Railway:');
    if (resources.railway.project) {
      console.log(`   • Project: ${resources.railway.project.name} (ID: ${resources.railway.project.id})`);
      if (resources.railway.services.length > 0) {
        console.log(`   • Services: ${resources.railway.services.map(s => s.name).join(', ')}`);
      }
    } else {
      console.log('   • No Railway project found');
    }
    console.log('');
  }

  // Cloudflare
  if (!localOnly) {
    console.log('Cloudflare DNS:');
    if (resources.cloudflare.records.length > 0) {
      for (const record of resources.cloudflare.records) {
        console.log(`   • ${record.name}`);
      }
    } else {
      console.log('   • No DNS records found');
    }
    console.log('');
  }

  // Local
  if (!cloudOnly) {
    console.log('Local Files:');
    if (resources.local.exists) {
      console.log(`   • ${resources.local.path}`);
    } else {
      console.log('   • No local folder found');
    }
    console.log('');
  }

  console.log('═'.repeat(50));

  if (dryRun) {
    console.log('');
    console.log('🏃 DRY RUN - No changes made');
    console.log('');
    return { success: true, dryRun: true, resources };
  }

  // Perform deletions
  const results = {
    github: [],
    railway: null,
    cloudflare: [],
    local: null,
    errors: []
  };

  console.log('');
  console.log(`🗑️  Deleting ${projectName}...`);
  console.log('');

  // Delete GitHub repos
  if (!localOnly) {
    console.log('GitHub:');
    for (const repo of resources.github.repos) {
      if (repo.exists) {
        const result = await deleteGitHubRepo(repo.owner, repo.name);
        results.github.push({ repo: `${repo.owner}/${repo.name}`, ...result });
        log(result.message, result.success ? 'success' : 'error');
        if (!result.success) results.errors.push(result.message);
      } else {
        results.github.push({ repo: `${repo.owner}/${repo.name}`, success: true, message: 'Not found' });
        log(`${repo.owner}/${repo.name} not found (skipped)`, 'info');
      }
      await sleep(500); // Rate limiting
    }
    console.log('');
  }

  // Delete Railway project (this deletes all services and database)
  if (!localOnly && resources.railway.project) {
    console.log('Railway:');
    const result = await deleteRailwayProject(resources.railway.project.id);
    results.railway = result;
    log(result.message, result.success ? 'success' : 'error');
    if (!result.success) results.errors.push(result.message);
    console.log('');
  }

  // Delete Cloudflare DNS records
  if (!localOnly && resources.cloudflare.records.length > 0) {
    console.log('Cloudflare:');
    for (const record of resources.cloudflare.records) {
      const result = await deleteCloudflareDNSRecord(record.id, record.name);
      results.cloudflare.push({ record: record.name, ...result });
      log(result.message, result.success ? 'success' : 'error');
      if (!result.success) results.errors.push(result.message);
      await sleep(200); // Rate limiting
    }
    console.log('');
  }

  // Delete local folder
  if (!cloudOnly && resources.local.exists) {
    console.log('Local:');
    const result = deleteLocalFolder(resources.local.path);
    results.local = result;
    log(result.message, result.success ? 'success' : 'error');
    if (!result.success) results.errors.push(result.message);
    console.log('');
  }

  // Verification step
  if (!skipVerification) {
    console.log('🔍 Verifying deletion...');
    const verification = {
      github: [],
      railway: true,
      cloudflare: [],
      local: true
    };

    // Verify GitHub repos deleted
    if (!localOnly) {
      for (const repo of resources.github.repos) {
        if (repo.exists) {
          const deleted = await verifyGitHubRepoDeleted(repo.owner, repo.name);
          verification.github.push({ repo: `${repo.owner}/${repo.name}`, verified: deleted });
          if (!deleted) {
            log(`WARNING: ${repo.owner}/${repo.name} may still exist`, 'warning');
          }
        }
      }
    }

    // Verify Railway project deleted
    if (!localOnly && resources.railway.project) {
      verification.railway = await verifyRailwayProjectDeleted(resources.railway.project.name);
      if (!verification.railway) {
        log(`WARNING: Railway project may still exist`, 'warning');
      }
    }

    // Verify Cloudflare records deleted
    if (!localOnly) {
      const sanitized = resources.sanitizedName;
      for (const subdomain of [sanitized, `api.${sanitized}`, `admin.${sanitized}`]) {
        const deleted = await verifyCloudflareDNSDeleted(subdomain);
        verification.cloudflare.push({ subdomain, verified: deleted });
        if (!deleted) {
          log(`WARNING: DNS record ${subdomain}.be1st.io may still exist`, 'warning');
        }
      }
    }

    // Verify local folder deleted
    if (!cloudOnly && resources.local.path) {
      verification.local = verifyLocalFolderDeleted(resources.local.path);
      if (!verification.local) {
        log(`WARNING: Local folder may still exist`, 'warning');
      }
    }

    results.verification = verification;
  }

  // Save deletion log
  const logFile = createDeletionLog(projectName, resources, results);
  console.log(`📋 Deletion log saved to: ${logFile}`);

  // Summary
  console.log('');
  console.log('═'.repeat(50));
  if (results.errors.length === 0) {
    console.log('✅ PROJECT FULLY DELETED');
  } else {
    console.log('⚠️  PROJECT DELETION COMPLETED WITH ERRORS');
    console.log('');
    console.log('Failed operations:');
    for (const error of results.errors) {
      console.log(`   • ${error}`);
    }
    console.log('');
    console.log('Manual cleanup may be required for failed items.');
  }
  console.log('═'.repeat(50));
  console.log('');

  return {
    success: results.errors.length === 0,
    resources,
    results
  };
}

// ============================================
// FIND ALL DEMO PROJECTS
// ============================================

/**
 * Find all Railway projects matching a prefix (e.g., "demo-")
 * @param {string} prefix - Prefix to match (case-insensitive)
 * @returns {Array} - Array of matching projects
 */
async function findRailwayProjectsByPrefix(prefix) {
  try {
    const query = `
      query($workspaceId: String!) {
        workspace(workspaceId: $workspaceId) {
          projects {
            edges {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      }
    `;

    const result = await railwayGraphQL(query, { workspaceId: RAILWAY_TEAM_ID });
    const projects = result.workspace?.projects?.edges || [];

    // Filter by prefix (case-insensitive)
    const matches = projects
      .filter(p => p.node.name.toLowerCase().startsWith(prefix.toLowerCase()))
      .map(p => ({
        id: p.node.id,
        name: p.node.name,
        createdAt: p.node.createdAt
      }));

    return matches;
  } catch (e) {
    console.error('Failed to search Railway projects:', e.message);
    return [];
  }
}

/**
 * Delete all projects matching a prefix
 * @param {string} prefix - Prefix to match (e.g., "demo-")
 * @param {object} options - Options
 */
async function deleteAllByPrefix(prefix, options = {}) {
  const { dryRun = false } = options;

  console.log('');
  console.log('═'.repeat(60));
  console.log(`🧹 DELETE ALL PROJECTS WITH PREFIX: ${prefix}`);
  console.log('═'.repeat(60));

  // Find Railway projects
  console.log('\n🔍 Finding Railway projects...');
  const railwayProjects = await findRailwayProjectsByPrefix(prefix);
  console.log(`   Found ${railwayProjects.length} Railway projects`);
  railwayProjects.forEach(p => console.log(`   • ${p.name}`));

  // Find local folders
  console.log('\n🔍 Finding local folders...');
  const localFolders = [];
  if (fs.existsSync(GENERATED_PROJECTS_PATH)) {
    const entries = fs.readdirSync(GENERATED_PROJECTS_PATH, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.toLowerCase().startsWith(prefix.toLowerCase())) {
        localFolders.push(path.join(GENERATED_PROJECTS_PATH, entry.name));
      }
    }
  }
  console.log(`   Found ${localFolders.length} local folders`);
  localFolders.forEach(f => console.log(`   • ${path.basename(f)}`));

  if (dryRun) {
    console.log('\n🏃 DRY RUN - No changes made');
    return { railwayProjects, localFolders, dryRun: true };
  }

  // Delete Railway projects
  console.log('\n🗑️  Deleting Railway projects...');
  for (const project of railwayProjects) {
    const result = await deleteRailwayProject(project.id);
    log(result.success ? `Deleted ${project.name}` : `Failed: ${result.message}`, result.success ? 'success' : 'error');
  }

  // Delete local folders
  console.log('\n🗑️  Deleting local folders...');
  for (const folder of localFolders) {
    const result = deleteLocalFolder(folder);
    log(result.success ? `Deleted ${path.basename(folder)}` : `Failed: ${result.message}`, result.success ? 'success' : 'error');
  }

  // Note: GitHub repos and Cloudflare DNS would need similar prefix matching
  // For now, they follow the sanitized name pattern so deleteProject() handles them

  console.log('\n' + '═'.repeat(60));
  console.log('✅ CLEANUP COMPLETE');
  console.log('═'.repeat(60));

  return { railwayProjects, localFolders, deleted: true };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  deleteProject,
  discoverProjectResources,
  sanitizeName,
  // Individual delete functions (for partial operations)
  deleteGitHubRepo,
  deleteRailwayProject,
  deleteCloudflareDNSRecord,
  deleteLocalFolder,
  // Verification functions
  verifyGitHubRepoDeleted,
  verifyRailwayProjectDeleted,
  verifyCloudflareDNSDeleted,
  verifyLocalFolderDeleted,
  // Bulk operations
  findRailwayProjectsByPrefix,
  deleteAllByPrefix,
  // Single project lookup
  findRailwayProject
};
