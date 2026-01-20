/**
 * BE1st Auto-Deploy Service - FIXED VERSION v3
 * Handles GitHub repo creation, Railway deployment, and Cloudflare DNS
 * 
 * FIXES INCORPORATED:
 * 1. Creates frontend/.env.production with correct API URL
 * 2. Adds FRONTEND_URL to backend environment variables
 * 3. Adds ?sslmode=disable to DATABASE_URL
 * 4. Cleans up .git folder before deployment (prevents retry failures)
 * 5. Seeds admin user credentials
 * 6. Creates .gitignore and removes node_modules before git push
 * 7. Uses separate GitHub repos for backend/frontend (avoids Railway root directory API limitation)
 * 8. **NEW v3** Skips Railway custom domain API (unreliable) - DNS only approach
 * 9. **NEW v3** Deletes old DNS records before creating new ones (for retries)
 * 10. **NEW v3** Better error handling - DNS failures don't block deployment
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;           // be1st.io zone
const CLOUDFLARE_ZONE_ID_APP = process.env.CLOUDFLARE_ZONE_ID_APP;   // be1st.app zone
const RAILWAY_TEAM_ID = process.env.RAILWAY_TEAM_ID;

// Domain configuration
const DOMAINS = {
  website: 'be1st.io',        // Websites deploy to .io
  'companion-app': 'be1st.app', // Companion apps deploy to .app (frontend only)
  'advanced-app': 'be1st.app'   // Standalone apps deploy to .app (full stack)
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Detect if a project is an Advanced App (flat structure with server.js in root)
 * vs a Website (backend/frontend/admin subfolders)
 */
function detectAdvancedApp(projectPath) {
  const hasServerJs = fs.existsSync(path.join(projectPath, 'server.js'));
  const hasBackendFolder = fs.existsSync(path.join(projectPath, 'backend'));
  const hasSrcFolder = fs.existsSync(path.join(projectPath, 'src'));

  // Advanced App: has server.js in root, no backend folder, has src folder
  return hasServerJs && !hasBackendFolder && hasSrcFolder;
}

// ============================================
// PRE-DEPLOYMENT SETUP
// ============================================

/**
 * Regenerate package-lock.json for a folder
 * Deletes existing lock file and runs npm install to create fresh one
 * This prevents "npm ci" errors on Railway when package.json was modified
 */
function regeneratePackageLock(folderPath, folderName) {
  const packageJsonPath = path.join(folderPath, 'package.json');
  const packageLockPath = path.join(folderPath, 'package-lock.json');

  // Only process if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  console.log(`   📦 Regenerating package-lock.json for ${folderName}...`);

  try {
    // Delete existing package-lock.json if it exists
    if (fs.existsSync(packageLockPath)) {
      fs.unlinkSync(packageLockPath);
      console.log(`      🗑️ Deleted old package-lock.json`);
    }

    // Run npm install to generate fresh package-lock.json
    // Use --package-lock-only to just update the lock file without installing node_modules
    // This is faster and we remove node_modules anyway before push
    execSync('npm install --package-lock-only --legacy-peer-deps', {
      cwd: folderPath,
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
      windowsHide: true
    });

    if (fs.existsSync(packageLockPath)) {
      console.log(`      ✅ Generated fresh package-lock.json`);
      return true;
    } else {
      console.log(`      ⚠️ package-lock.json not created (npm may have failed silently)`);
      return false;
    }
  } catch (error) {
    console.log(`      ⚠️ Failed to regenerate package-lock.json: ${error.message}`);
    // Try fallback: full npm install
    try {
      console.log(`      🔄 Trying full npm install as fallback...`);
      execSync('npm install --legacy-peer-deps', {
        cwd: folderPath,
        stdio: 'pipe',
        timeout: 180000, // 3 minute timeout
        windowsHide: true
      });
      if (fs.existsSync(packageLockPath)) {
        console.log(`      ✅ Generated package-lock.json via full install`);
        return true;
      }
    } catch (fallbackError) {
      console.log(`      ❌ Fallback also failed: ${fallbackError.message}`);
    }
    return false;
  }
}

function prepareProjectForDeployment(projectPath, subdomain) {
  console.log(`📋 Preparing project for deployment...`);

  // FIX #1: Create frontend/.env.production with correct API URL
  // Use Railway URL directly for reliability (custom domains may have DNS/SSL delays)
  const railwayBackendUrl = `https://${subdomain}-backend.up.railway.app`;
  const frontendEnvPath = path.join(projectPath, 'frontend', '.env.production');
  const frontendEnvContent = `VITE_API_URL=${railwayBackendUrl}\n`;

  if (fs.existsSync(path.join(projectPath, 'frontend'))) {
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log(`   ✅ Created frontend/.env.production`);
  }
  
  // FIX #4: Clean up any existing .git folders (prevents retry failures)
  const gitDirs = [
    path.join(projectPath, '.git'),
    path.join(projectPath, 'backend', '.git'),
    path.join(projectPath, 'frontend', '.git'),
    path.join(projectPath, 'admin', '.git')
  ];
  for (const gitDir of gitDirs) {
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
      console.log(`   ✅ Cleaned up ${gitDir}`);
    }
  }
  
  // CONFIG-AS-CODE: Create railway.json files so Railway knows how to build each service
  
  // Backend railway.json
  const backendRailwayConfig = {
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node setup-db.js && node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};
  
  if (fs.existsSync(path.join(projectPath, 'backend'))) {
    fs.writeFileSync(
      path.join(projectPath, 'backend', 'railway.json'),
      JSON.stringify(backendRailwayConfig, null, 2)
    );
    console.log(`   ✅ Created backend/railway.json`);
  }
  
  // Frontend railway.json
  const frontendRailwayConfig = {
    "$schema": "https://railway.com/railway.schema.json",
    "build": {
      "builder": "NIXPACKS"
    },
    "deploy": {
      "startCommand": "npm run preview -- --host --port $PORT",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };

  if (fs.existsSync(path.join(projectPath, 'frontend'))) {
    fs.writeFileSync(
      path.join(projectPath, 'frontend', 'railway.json'),
      JSON.stringify(frontendRailwayConfig, null, 2)
    );
    console.log(`   ✅ Created frontend/railway.json`);
  }

  // Admin railway.json (same config as frontend - it's also a Vite app)
  if (fs.existsSync(path.join(projectPath, 'admin'))) {
    fs.writeFileSync(
      path.join(projectPath, 'admin', 'railway.json'),
      JSON.stringify(frontendRailwayConfig, null, 2)
    );
    console.log(`   ✅ Created admin/railway.json`);
    
    // Create admin/.env.production with API URL (use Railway URL for reliability)
    const adminEnvPath = path.join(projectPath, 'admin', '.env.production');
    const adminEnvContent = `VITE_API_URL=${railwayBackendUrl}\n`;
    fs.writeFileSync(adminEnvPath, adminEnvContent);
    console.log(`   ✅ Created admin/.env.production`);
  }
  
  // FIX #4b: Only update start script if setup-db.js exists
  const setupDbPath = path.join(projectPath, 'backend', 'setup-db.js');
  const backendPackageJson = path.join(projectPath, 'backend', 'package.json');
  if (fs.existsSync(setupDbPath) && fs.existsSync(backendPackageJson)) {
    let packageContent = fs.readFileSync(backendPackageJson, 'utf8');
    if (!packageContent.includes('setup-db.js')) {
      packageContent = packageContent.replace(
        '"start": "node server.js"',
        '"start": "node setup-db.js && node server.js"'
      );
      fs.writeFileSync(backendPackageJson, packageContent);
      console.log(`   ✅ Updated backend start script to run setup-db.js`);
    }
  }

  // Create .gitignore in each subfolder
  const gitignoreContent = `node_modules/
.env
.env.local
dist/
.DS_Store
*.log
`;

  for (const folder of ['backend', 'frontend', 'admin']) {
    const folderPath = path.join(projectPath, folder);
    const gitignorePath = path.join(folderPath, '.gitignore');
    if (fs.existsSync(folderPath) && !fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log(`   ✅ Created ${folder}/.gitignore`);
    }
  }

  // Remove node_modules folders (Railway will install fresh)
  const foldersToClean = ['frontend', 'backend', 'admin'];
  for (const folder of foldersToClean) {
    const nodeModulesPath = path.join(projectPath, folder, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log(`   ✅ Removed ${folder}/node_modules`);
    }
  }

  // FIX #11: Regenerate package-lock.json files to prevent "npm ci" errors on Railway
  // This must happen AFTER all package.json modifications but BEFORE git push
  console.log(`\n📦 Regenerating package-lock.json files...`);
  for (const folder of ['backend', 'frontend', 'admin']) {
    const folderPath = path.join(projectPath, folder);
    if (fs.existsSync(folderPath)) {
      regeneratePackageLock(folderPath, folder);
    }
  }

  console.log(`   ✅ Project prepared for deployment`);
}

/**
 * Prepare Advanced App for deployment (single service)
 * - Creates railway.json for single full-stack service
 * - Updates server.js to serve /dist in production
 * - Creates .gitignore
 * - Regenerates package-lock.json
 */
function prepareAdvancedAppForDeployment(projectPath, subdomain) {
  console.log(`📋 Preparing Advanced App for deployment...`);

  // Clean up any existing .git folder
  const gitDir = path.join(projectPath, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
    console.log(`   ✅ Cleaned up .git folder`);
  }

  // Create railway.json for single full-stack service
  const railwayConfig = {
    "$schema": "https://railway.com/railway.schema.json",
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "npm install && npm run build"
    },
    "deploy": {
      "startCommand": "node server.js",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };

  fs.writeFileSync(
    path.join(projectPath, 'railway.json'),
    JSON.stringify(railwayConfig, null, 2)
  );
  console.log(`   ✅ Created railway.json`);

  // Update server.js to serve /dist in production
  const serverJsPath = path.join(projectPath, 'server.js');
  if (fs.existsSync(serverJsPath)) {
    let serverContent = fs.readFileSync(serverJsPath, 'utf8');

    // Check if already updated
    if (!serverContent.includes("express.static('dist')") && !serverContent.includes('express.static("dist")')) {
      // Add production static serving after existing static line or after express.json()
      if (serverContent.includes("express.static('public')")) {
        serverContent = serverContent.replace(
          "app.use(express.static('public'));",
          `// Serve static files - in production serve built frontend from /dist
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
} else {
  app.use(express.static('public'));
}

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'dist', 'index.html')
    : path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});`
        );

        // Add path and fs requires if not present
        if (!serverContent.includes("require('path')") && !serverContent.includes('require("path")')) {
          serverContent = serverContent.replace(
            "const express = require('express');",
            "const express = require('express');\nconst path = require('path');"
          );
        }
        if (!serverContent.includes("require('fs')") && !serverContent.includes('require("fs")')) {
          serverContent = serverContent.replace(
            "const express = require('express');",
            "const express = require('express');\nconst fs = require('fs');"
          );
        }

        fs.writeFileSync(serverJsPath, serverContent);
        console.log(`   ✅ Updated server.js to serve /dist in production`);
      }
    }
  }

  // Create .gitignore
  const gitignoreContent = `node_modules/
.env
.env.local
dist/
.DS_Store
*.log
`;
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log(`   ✅ Created .gitignore`);
  }

  // Remove node_modules if exists
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log(`   ✅ Removed node_modules`);
  }

  // Remove dist if exists (Railway will build fresh)
  const distPath = path.join(projectPath, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log(`   ✅ Removed dist folder`);
  }

  // Regenerate package-lock.json
  console.log(`\n📦 Regenerating package-lock.json...`);
  regeneratePackageLock(projectPath, 'root');

  console.log(`   ✅ Advanced App prepared for deployment`);
}

/**
 * Push entire project folder to GitHub (for Advanced Apps)
 */
async function pushProjectToGitHub(projectPath, repoName, githubUsername) {
  console.log(`📤 Pushing project to GitHub repo: ${repoName}...`);

  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project not found: ${projectPath}`);
  }

  try {
    const gitUrl = `https://${GITHUB_TOKEN}@github.com/${githubUsername}/${repoName}.git`;

    const options = {
      cwd: projectPath,
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true
    };

    console.log(`   Initializing git...`);
    execSync('git init', options);

    console.log(`   Adding files...`);
    execSync('git add .', options);

    console.log(`   Creating commit...`);
    execSync('git commit -m "Initial commit from Blink Advanced Apps"', options);

    console.log(`   Setting branch...`);
    execSync('git branch -M main', options);

    console.log(`   Adding remote...`);
    execSync(`git remote add origin ${gitUrl}`, options);

    console.log(`   Pushing to GitHub...`);
    execSync('git push -u origin main --force', options);

    console.log(`   ✅ Project pushed to ${repoName}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Git push error: ${error.message}`);
    throw error;
  }
}

// ============================================
// GITHUB API
// ============================================

async function createGitHubRepo(name, isPrivate = false) {
  console.log(`📦 Creating GitHub repo: ${name}`);
  
  const data = JSON.stringify({
    name: name,
    private: isPrivate,
    auto_init: false,
    description: `Generated by BE1st Platform`
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-Deploy',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const repo = JSON.parse(body);
          console.log(`   ✅ Repo created: ${repo.html_url}`);
          resolve(repo);
        } else if (res.statusCode === 422) {
          const result = JSON.parse(body);
          if (result.errors?.[0]?.message?.includes('already exists')) {
            console.log(`   ⚠️ Repo already exists, will use existing`);
            resolve({ name: name, owner: { login: null }, html_url: null, existing: true });
          } else {
            console.error(`   ❌ GitHub error: ${res.statusCode} - ${body}`);
            reject(new Error(`GitHub API error: ${res.statusCode}`));
          }
        } else {
          console.error(`   ❌ GitHub error: ${res.statusCode} - ${body}`);
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getGitHubUsername() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-Deploy'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(body);
          resolve(user.login);
        } else {
          reject(new Error(`Could not get GitHub username: ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function deleteGitHubRepo(owner, repoName) {
  console.log(`   🗑️ Deleting existing repo: ${owner}/${repoName}`);
  
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repoName}`,
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BE1st-Deploy'
      }
    }, (res) => {
      if (res.statusCode === 204) {
        console.log(`   ✅ Deleted ${owner}/${repoName}`);
      } else {
        console.log(`   ⚠️ Could not delete (may not exist): ${res.statusCode}`);
      }
      resolve();
    });
    req.on('error', () => resolve());
    req.end();
  });
}

async function pushFolderToGitHub(projectPath, folderName, repoName, githubUsername) {
  console.log(`📤 Pushing ${folderName}/ to GitHub repo: ${repoName}...`);
  
  const folderPath = path.join(projectPath, folderName);
  
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }
  
  try {
    const gitUrl = `https://${GITHUB_TOKEN}@github.com/${githubUsername}/${repoName}.git`;
    
    const options = { 
      cwd: folderPath, 
      stdio: 'pipe',
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true
    };

    console.log(`   Initializing git in ${folderName}/...`);
    execSync('git init', options);
    
    console.log(`   Adding files...`);
    execSync('git add .', options);
    
    console.log(`   Creating commit...`);
    execSync('git commit -m "Initial commit from BE1st"', options);
    
    console.log(`   Setting branch...`);
    execSync('git branch -M main', options);
    
    console.log(`   Adding remote...`);
    execSync(`git remote add origin ${gitUrl}`, options);
    
    console.log(`   Pushing to GitHub...`);
    execSync('git push -u origin main --force', options);
    
    console.log(`   ✅ ${folderName}/ pushed to ${repoName}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Git push error for ${folderName}: ${error.message}`);
    throw error;
  }
}

// ============================================
// RAILWAY API (GraphQL)
// ============================================

async function railwayGraphQLSingle(query, variables = {}) {
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

async function railwayGraphQL(query, variables = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await railwayGraphQLSingle(query, variables);
    } catch (error) {
      console.log(`   ⚠️ Railway API attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry: 2s, 4s, 6s
      await sleep(attempt * 2000);
      console.log(`   🔄 Retrying...`);
    }
  }
}

async function createRailwayProject(name) {
  // Railway project names: alphanumeric + hyphens, max 39 characters
  let sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Truncate to 39 characters max, ensuring we don't cut mid-hyphen
  if (sanitizedName.length > 39) {
    sanitizedName = sanitizedName.substring(0, 39).replace(/-$/, '');
  }

  console.log(`🚂 Creating Railway project: ${sanitizedName}${name !== sanitizedName ? ` (from: ${name})` : ''}`);

  const query = `
    mutation projectCreate($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        id
        name
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
  `;

  const input = { name: sanitizedName };
  if (RAILWAY_TEAM_ID) {
    input.workspaceId = RAILWAY_TEAM_ID;
  }
  
  const result = await railwayGraphQL(query, { input });
  
  const project = result.projectCreate;
  const prodEnv = project.environments.edges.find(e => e.node.name === 'production') || project.environments.edges[0];
  
  console.log(`   ✅ Railway project created: ${project.id}`);
  console.log(`   📍 Environment: ${prodEnv?.node?.name} (${prodEnv?.node?.id})`);
  
  return {
    ...project,
    environmentId: prodEnv?.node?.id
  };
}

async function createRailwayService(projectId, environmentId, serviceName, githubRepo) {
  console.log(`   🔧 Creating service: ${serviceName} (from ${githubRepo})`);
  
  // Use the enhanced mutation that includes branch and triggers deployment
  const query = `
    mutation serviceCreate($input: ServiceCreateInput!) {
      serviceCreate(input: $input) {
        id
        name
      }
    }
  `;
  
  const result = await railwayGraphQL(query, {
    input: {
      projectId: projectId,
      name: serviceName,
      source: { repo: githubRepo },
      branch: 'main'  // <-- ADD THIS - explicitly set the branch
    }
  });
  
  console.log(`   ✅ Service created: ${result.serviceCreate.id}`);
  return result.serviceCreate;
}

async function createRailwayPostgres(projectId, environmentId) {
  console.log(`   🗄️ Creating PostgreSQL database...`);
  
  const dbPassword = require('crypto').randomBytes(16).toString('hex');
  
  const serviceQuery = `
    mutation serviceCreate($input: ServiceCreateInput!) {
      serviceCreate(input: $input) {
        id
        name
      }
    }
  `;
  
  const serviceResult = await railwayGraphQL(serviceQuery, {
    input: {
      projectId: projectId,
      name: 'postgres',
      source: { image: 'postgres:15' }
    }
  });
  
  const postgresServiceId = serviceResult.serviceCreate.id;
  console.log(`   ✅ PostgreSQL service created: ${postgresServiceId}`);

  console.log(`   ⚙️ Injecting database credentials...`);
  const varsQuery = `
    mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }
  `;
  
  await railwayGraphQL(varsQuery, {
    input: {
      projectId: projectId,
      environmentId: environmentId,
      serviceId: postgresServiceId,
      variables: {
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: dbPassword,
        POSTGRES_DB: 'app',
        PGPASSWORD: dbPassword 
      }
    }
  });

  console.log(`   ✅ PostgreSQL environment configured`);
  
  console.log(`   🔄 Redeploying PostgreSQL with credentials...`);
  const redeployQuery = `
    mutation serviceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
      serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
    }
  `;
  
  await railwayGraphQL(redeployQuery, { 
    environmentId: environmentId,
    serviceId: postgresServiceId 
  });
  console.log(`   ✅ PostgreSQL redeploy triggered`);

  return { 
    id: postgresServiceId, 
    password: dbPassword,
    connectionString: `postgresql://postgres:${dbPassword}@postgres.railway.internal:5432/app?sslmode=disable`
  };
}

async function setRailwayVariables(projectId, environmentId, serviceId, variables) {
  console.log(`   ⚙️ Setting environment variables...`);
  
  const query = `
    mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }
  `;
  
  await railwayGraphQL(query, {
    input: {
      projectId: projectId,
      environmentId: environmentId,
      serviceId: serviceId,
      variables: variables
    }
  });
  
  console.log(`   ✅ Environment variables set`);
}

async function deployRailwayService(environmentId, serviceId) {
  console.log(`   🚀 Triggering deployment...`);
  
  const query = `
    mutation serviceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
      serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
    }
  `;
  
  await railwayGraphQL(query, { environmentId, serviceId });
  console.log(`   ✅ Deployment triggered`);
}

async function generateRailwayServiceDomain(projectId, environmentId, serviceId) {
  console.log(`   🌐 Generating Railway domain...`);
  
  const generateQuery = `
    mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) {
        id
        domain
      }
    }
  `;
  
  try {
    const result = await railwayGraphQL(generateQuery, {
      input: {
        environmentId: environmentId,
        serviceId: serviceId
      }
    });
    console.log(`   ✅ Domain generated: ${result.serviceDomainCreate.domain}`);
    return result.serviceDomainCreate.domain;
  } catch (error) {
    console.log(`   ⚠️ Could not generate domain: ${error.message}`);
    return null;
  }
}

async function addRailwayCustomDomain(projectId, environmentId, serviceId, customDomain) {
  console.log(`   🔗 Adding custom domain to Railway: ${customDomain}`);
  
  const mutation = `
    mutation customDomainCreate($input: CustomDomainCreateInput!) {
      customDomainCreate(input: $input) {
        id
        domain
        status {
          dnsRecords {
            hostlabel
            requiredValue
          }
        }
      }
    }
  `;
  
  try {
    const result = await railwayGraphQL(mutation, {
      input: {
        projectId: projectId,
        environmentId: environmentId,
        serviceId: serviceId,
        domain: customDomain
      }
    });
    
    const dnsRecords = result.customDomainCreate.status?.dnsRecords || [];
    const targetRecord = dnsRecords.find(r => r.requiredValue);
    const target = targetRecord?.requiredValue || null;
    
    console.log(`   ✅ Custom domain added, target: ${target}`);
    return { success: true, target: target };
  } catch (error) {
    console.log(`   ⚠️ Custom domain error: ${error.message}`);
    return { success: false, target: null };
  }
}

// ============================================
// CLOUDFLARE API
// ============================================

async function deleteCloudflareDNS(subdomain, domain = 'be1st.io') {
  const zoneId = domain === 'be1st.app' ? CLOUDFLARE_ZONE_ID_APP : CLOUDFLARE_ZONE_ID;

  // First, find any existing records
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
            console.log(`   🗑️ Deleting ${result.result.length} existing DNS record(s) for ${subdomain}`);
            for (const record of result.result) {
              await deleteCloudflareRecord(record.id);
            }
          }
        } catch (e) {
          // Ignore errors
        }
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.end();
  });
}

async function deleteCloudflareRecord(recordId) {
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
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.end();
  });
}

async function addCloudflareDNS(subdomain, target, type = 'CNAME', proxied = true, domain = 'be1st.io') {
  const zoneId = domain === 'be1st.app' ? CLOUDFLARE_ZONE_ID_APP : CLOUDFLARE_ZONE_ID;
  console.log(`🌐 Adding DNS record: ${subdomain}.${domain} → ${target} (proxied: ${proxied})`);

  // First delete any existing record
  await deleteCloudflareDNS(subdomain, domain);

  const data = JSON.stringify({
    type: type,
    name: subdomain,
    content: target,
    ttl: 1,
    proxied: proxied  // Frontend: proxied (orange), Backend API: DNS only (gray)
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/dns_records`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            console.log(`   ✅ DNS record added (proxied: true)`);
            resolve(result.result);
          } else {
            console.log(`   ⚠️ Cloudflare warning:`, result.errors?.[0]?.message || 'Unknown');
            resolve(null);
          }
        } catch (e) {
          console.log(`   ⚠️ Could not parse Cloudflare response`);
          resolve(null);
        }
      });
    });
    req.on('error', (err) => {
      console.log(`   ⚠️ Cloudflare request error:`, err.message);
      resolve(null);
    });
    req.write(data);
    req.end();
  });
}

// ============================================
// ADVANCED APP DEPLOYMENT (Single Service)
// ============================================

/**
 * Deploy an Advanced App as a single Railway service
 * - ONE GitHub repo (not 3)
 * - ONE Railway service + Postgres
 * - Express serves built Vite frontend from /dist
 */
async function deployAdvancedApp(projectPath, projectName, options = {}) {
  const onProgress = options.onProgress || (() => {});

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🚀 DEPLOYING ADVANCED APP: ${projectName}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  onProgress({ step: 'starting', status: 'Starting Advanced App deployment...', icon: '🚀', progress: 0 });

  const subdomain = projectName
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const results = {
    success: false,
    urls: {},
    credentials: {},
    errors: []
  };

  try {
    onProgress({ step: 'github-auth', status: 'Authenticating with GitHub...', icon: '🔑', progress: 5 });
    const githubUsername = await getGitHubUsername();
    console.log(`👤 GitHub user: ${githubUsername}`);

    onProgress({ step: 'prepare', status: 'Preparing Advanced App...', icon: '📋', progress: 10 });
    prepareAdvancedAppForDeployment(projectPath, subdomain);

    const repoName = `${subdomain}-app`;

    onProgress({ step: 'github-cleanup', status: 'Cleaning up old repository...', icon: '🧹', progress: 15 });
    await deleteGitHubRepo(githubUsername, repoName);
    await sleep(1000);

    onProgress({ step: 'github-create', status: 'Creating GitHub repository...', icon: '📦', progress: 20 });
    await createGitHubRepo(repoName);

    onProgress({ step: 'github-push', status: 'Pushing code to GitHub...', icon: '📤', progress: 30 });
    await pushProjectToGitHub(projectPath, repoName, githubUsername);

    onProgress({ step: 'railway-project', status: 'Creating Railway project...', icon: '🚂', progress: 40 });
    const railwayProject = await createRailwayProject(subdomain);
    const environmentId = railwayProject.environmentId;

    onProgress({ step: 'railway-database', status: 'Provisioning PostgreSQL database...', icon: '🗄️', progress: 50 });
    const postgresInfo = await createRailwayPostgres(railwayProject.id, environmentId);

    onProgress({ step: 'railway-service', status: 'Creating app service...', icon: '⚙️', progress: 60 });
    const appService = await createRailwayService(
      railwayProject.id,
      environmentId,
      'app',
      `${githubUsername}/${repoName}`
    );

    onProgress({ step: 'railway-env', status: 'Configuring environment variables...', icon: '🔐', progress: 70 });
    const jwtSecret = require('crypto').randomBytes(32).toString('hex');

    await setRailwayVariables(railwayProject.id, environmentId, appService.id, {
      NODE_ENV: 'production',
      JWT_SECRET: jwtSecret,
      PORT: '3000',
      DATABASE_URL: postgresInfo.connectionString
    });

    // Wait for Railway webhooks
    onProgress({ step: 'railway-wait', status: 'Waiting for Railway webhooks...', icon: '⏳', progress: 75 });
    console.log('   ⏳ Waiting 15s for Railway to establish GitHub webhooks...');
    await sleep(15000);

    onProgress({ step: 'deploy', status: 'Triggering deployment...', icon: '🚀', progress: 80 });
    try {
      await deployRailwayService(environmentId, appService.id);
    } catch (e) {
      console.log('   ⚠️ Deploy trigger failed, Railway will auto-deploy from GitHub');
    }

    onProgress({ step: 'domains', status: 'Generating service domain...', icon: '🔗', progress: 85 });
    const appRailwayDomain = await generateRailwayServiceDomain(railwayProject.id, environmentId, appService.id);

    // Advanced apps use be1st.app domain
    const appDomain = 'be1st.app';

    onProgress({ step: 'custom-domains', status: 'Configuring custom domain...', icon: '🌍', progress: 88 });
    const appCustom = await addRailwayCustomDomain(railwayProject.id, environmentId, appService.id, `${subdomain}.${appDomain}`);

    onProgress({ step: 'dns', status: 'Setting up DNS records...', icon: '📡', progress: 92 });
    const appTarget = appCustom.target || appRailwayDomain;
    if (appTarget) {
      await addCloudflareDNS(subdomain, appTarget, 'CNAME', true, appDomain);
    }

    onProgress({ step: 'finalizing', status: 'Finalizing deployment...', icon: '✨', progress: 98 });

    results.success = true;
    results.railwayProjectId = railwayProject.id;
    results.railwayEnvironmentId = environmentId;
    results.urls = {
      frontend: `https://${subdomain}.${appDomain}`,
      github: `https://github.com/${githubUsername}/${repoName}`,
      railway: `https://railway.app/project/${railwayProject.id}`,
      railwayDirect: appRailwayDomain ? `https://${appRailwayDomain}` : null
    };
    results.credentials = {
      note: 'Use the admin credentials you set during app generation'
    };

    onProgress({ step: 'complete', status: 'Deployment complete!', icon: '✅', progress: 100, urls: results.urls });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ ADVANCED APP DEPLOYMENT COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📱 Domain: be1st.app (standalone app)');
    console.log('');
    console.log('🔗 URLs:');
    console.log(`   Live App: ${results.urls.frontend}`);
    console.log(`   GitHub:   ${results.urls.github}`);
    console.log(`   Railway:  ${results.urls.railway}`);
    if (results.urls.railwayDirect) {
      console.log(`   Railway Direct: ${results.urls.railwayDirect}`);
    }
    console.log('');
    console.log('🔑 Login with the credentials you set during app generation');
    console.log('');
    console.log('⏱️  Note: Build takes 2-3 minutes. Check Railway dashboard for status.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ADVANCED APP DEPLOYMENT FAILED:', error.message);
    results.errors.push(error.message);
    onProgress({ step: 'error', status: `Deployment failed: ${error.message}`, icon: '❌', progress: 0 });
  }

  return results;
}

// ============================================
// COMPANION APP DEPLOYMENT (Frontend-only to .app)
// ============================================

/**
 * Deploy a Companion App - frontend-only PWA that connects to existing website backend
 * - ONE GitHub repo (frontend only)
 * - ONE Railway service (static/Vite)
 * - Calls existing [parentSite].be1st.io/api for backend
 * - Deploys to [sitename].be1st.app
 */
async function deployCompanionApp(projectPath, projectName, options = {}) {
  const onProgress = options.onProgress || (() => {});
  const parentSiteSubdomain = options.parentSiteSubdomain; // The .io site this connects to

  if (!parentSiteSubdomain) {
    throw new Error('parentSiteSubdomain is required for companion app deployment');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📱 DEPLOYING COMPANION APP: ${projectName}`);
  console.log(`   Parent Site: ${parentSiteSubdomain}.be1st.io`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  onProgress({ step: 'starting', status: 'Starting Companion App deployment...', icon: '📱', progress: 0 });

  // For companion apps, use the parent site's subdomain for the domain
  // This means website gilani-s.be1st.io has companion app at gilani-s.be1st.app
  const subdomain = parentSiteSubdomain
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const appDomain = 'be1st.app';
  const apiUrl = `https://api.${subdomain}.be1st.io`;

  const results = {
    success: false,
    urls: {},
    errors: []
  };

  try {
    onProgress({ step: 'github-auth', status: 'Authenticating with GitHub...', icon: '🔑', progress: 5 });
    const githubUsername = await getGitHubUsername();
    console.log(`👤 GitHub user: ${githubUsername}`);

    // Prepare companion app for deployment
    onProgress({ step: 'prepare', status: 'Preparing Companion App...', icon: '📋', progress: 10 });
    prepareCompanionAppForDeployment(projectPath, subdomain, apiUrl);

    // Use subdomain-app for repo name (companion app uses same subdomain as website, just .app domain)
    const repoName = `${subdomain}-app`;

    onProgress({ step: 'github-cleanup', status: 'Cleaning up old repository...', icon: '🧹', progress: 15 });
    await deleteGitHubRepo(githubUsername, repoName);
    await sleep(1000);

    onProgress({ step: 'github-create', status: 'Creating GitHub repository...', icon: '📦', progress: 20 });
    await createGitHubRepo(repoName);

    onProgress({ step: 'github-push', status: 'Pushing code to GitHub...', icon: '📤', progress: 35 });
    await pushProjectToGitHub(projectPath, repoName, githubUsername);

    onProgress({ step: 'railway-project', status: 'Creating Railway project...', icon: '🚂', progress: 50 });
    // Use subdomain-app for Railway project name
    const railwayProject = await createRailwayProject(`${subdomain}-app`);
    const environmentId = railwayProject.environmentId;

    // No database needed - companion apps call parent site's API
    onProgress({ step: 'railway-service', status: 'Creating app service...', icon: '⚙️', progress: 60 });
    const appService = await createRailwayService(
      railwayProject.id,
      environmentId,
      'companion',
      `${githubUsername}/${repoName}`
    );

    onProgress({ step: 'railway-env', status: 'Configuring environment variables...', icon: '🔐', progress: 70 });
    await setRailwayVariables(railwayProject.id, environmentId, appService.id, {
      NODE_ENV: 'production',
      VITE_API_URL: apiUrl,
      VITE_PARENT_SITE: `https://${parentSiteSubdomain}.be1st.io`
    });

    // Wait for Railway webhooks
    onProgress({ step: 'railway-wait', status: 'Waiting for Railway webhooks...', icon: '⏳', progress: 75 });
    console.log('   ⏳ Waiting 10s for Railway to establish GitHub webhooks...');
    await sleep(10000);

    onProgress({ step: 'deploy', status: 'Triggering deployment...', icon: '🚀', progress: 80 });
    try {
      await deployRailwayService(environmentId, appService.id);
    } catch (e) {
      console.log('   ⚠️ Deploy trigger failed, Railway will auto-deploy from GitHub');
    }

    onProgress({ step: 'domains', status: 'Generating service domain...', icon: '🔗', progress: 85 });
    const appRailwayDomain = await generateRailwayServiceDomain(railwayProject.id, environmentId, appService.id);

    onProgress({ step: 'custom-domains', status: 'Configuring custom domain...', icon: '🌍', progress: 90 });
    const appCustom = await addRailwayCustomDomain(railwayProject.id, environmentId, appService.id, `${subdomain}.${appDomain}`);

    onProgress({ step: 'dns', status: 'Setting up DNS records...', icon: '📡', progress: 95 });
    const appTarget = appCustom.target || appRailwayDomain;
    if (appTarget) {
      await addCloudflareDNS(subdomain, appTarget, 'CNAME', true, appDomain);
    }

    onProgress({ step: 'finalizing', status: 'Finalizing deployment...', icon: '✨', progress: 98 });

    results.success = true;
    results.railwayProjectId = railwayProject.id;
    results.railwayEnvironmentId = environmentId;
    results.urls = {
      companion: `https://${subdomain}.${appDomain}`,
      parentSite: `https://${parentSiteSubdomain}.be1st.io`,
      parentApi: apiUrl,
      github: `https://github.com/${githubUsername}/${repoName}`,
      railway: `https://railway.app/project/${railwayProject.id}`,
      railwayDirect: appRailwayDomain ? `https://${appRailwayDomain}` : null
    };

    onProgress({ step: 'complete', status: 'Companion App deployed!', icon: '✅', progress: 100, urls: results.urls });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ COMPANION APP DEPLOYMENT COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📱 Domain: be1st.app (companion app - frontend only)');
    console.log(`🔗 Connected to: ${parentSiteSubdomain}.be1st.io`);
    console.log('');
    console.log('🔗 URLs:');
    console.log(`   Companion App: ${results.urls.companion}`);
    console.log(`   Parent Site:   ${results.urls.parentSite}`);
    console.log(`   API Endpoint:  ${results.urls.parentApi}`);
    console.log(`   GitHub:        ${results.urls.github}`);
    console.log(`   Railway:       ${results.urls.railway}`);
    if (results.urls.railwayDirect) {
      console.log(`   Railway Direct: ${results.urls.railwayDirect}`);
    }
    console.log('');
    console.log('📝 Note: Users log in with the same credentials as the parent site.');
    console.log('⏱️  Build takes 1-2 minutes. Check Railway dashboard for status.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ COMPANION APP DEPLOYMENT FAILED:', error.message);
    results.errors.push(error.message);
    onProgress({ step: 'error', status: `Deployment failed: ${error.message}`, icon: '❌', progress: 0 });
  }

  return results;
}

/**
 * Prepare Companion App for deployment (frontend-only Vite PWA)
 */
function prepareCompanionAppForDeployment(projectPath, subdomain, apiUrl) {
  console.log(`📋 Preparing Companion App for deployment...`);

  // Clean up any existing .git folder
  const gitDir = path.join(projectPath, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
    console.log(`   ✅ Cleaned up .git folder`);
  }

  // Create .env.production with API URL pointing to parent site
  const envContent = `VITE_API_URL=${apiUrl}\nVITE_APP_TYPE=companion\n`;
  fs.writeFileSync(path.join(projectPath, '.env.production'), envContent);
  console.log(`   ✅ Created .env.production (API: ${apiUrl})`);

  // Create railway.json for Vite static hosting
  const railwayConfig = {
    "$schema": "https://railway.com/railway.schema.json",
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "npm install && npm run build"
    },
    "deploy": {
      "startCommand": "npm run preview -- --host --port $PORT",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    }
  };

  fs.writeFileSync(
    path.join(projectPath, 'railway.json'),
    JSON.stringify(railwayConfig, null, 2)
  );
  console.log(`   ✅ Created railway.json`);

  // Create .gitignore
  const gitignoreContent = `node_modules/
.env
.env.local
dist/
.DS_Store
*.log
`;
  const gitignorePath = path.join(projectPath, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log(`   ✅ Created .gitignore`);
  }

  // Remove node_modules if exists
  const nodeModulesPath = path.join(projectPath, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log(`   ✅ Removed node_modules`);
  }

  // Remove dist if exists
  const distPath = path.join(projectPath, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log(`   ✅ Removed dist folder`);
  }

  // Regenerate package-lock.json
  console.log(`\n📦 Regenerating package-lock.json...`);
  regeneratePackageLock(projectPath, 'companion');

  console.log(`   ✅ Companion App prepared for deployment`);
}

// ============================================
// MAIN DEPLOY FUNCTION (Websites)
// ============================================

async function deployProject(projectPath, projectName, options = {}) {
  // Check if this is an Advanced App
  if (options.appType === 'advanced-app' || detectAdvancedApp(projectPath)) {
    console.log('🔍 Detected Advanced App - using single-service deployment to be1st.app');
    return deployAdvancedApp(projectPath, projectName, options);
  }

  // Check if this is a Companion App
  if (options.appType === 'companion-app') {
    console.log('🔍 Detected Companion App - using frontend-only deployment to be1st.app');
    return deployCompanionApp(projectPath, projectName, options);
  }
  // Progress callback for real-time updates
  const onProgress = options.onProgress || (() => {});

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🚀 DEPLOYING: ${projectName}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  onProgress({ step: 'starting', status: 'Starting deployment...', icon: '🚀', progress: 0 });

  const subdomain = projectName
  .toLowerCase()
  .replace(/&/g, '-and-')
  .replace(/[^a-z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
  const results = {
    success: false,
    urls: {},
    credentials: {},
    errors: []
  };

  try {
    onProgress({ step: 'github-auth', status: 'Authenticating with GitHub...', icon: '🔑', progress: 5 });
    const githubUsername = await getGitHubUsername();
    console.log(`👤 GitHub user: ${githubUsername}`);

    onProgress({ step: 'prepare', status: 'Preparing project files...', icon: '📋', progress: 8 });
    prepareProjectForDeployment(projectPath, subdomain);

    const backendRepoName = `${subdomain}-backend`;
    const frontendRepoName = `${subdomain}-frontend`;
    const adminRepoName = `${subdomain}-admin`;

    onProgress({ step: 'github-cleanup', status: 'Cleaning up old repositories...', icon: '🧹', progress: 10 });
    await deleteGitHubRepo(githubUsername, backendRepoName);
    await deleteGitHubRepo(githubUsername, frontendRepoName);
    await deleteGitHubRepo(githubUsername, adminRepoName);

    await sleep(1000);

    onProgress({ step: 'github-create', status: 'Creating GitHub repositories...', icon: '📦', progress: 15 });
    await createGitHubRepo(backendRepoName);
    await createGitHubRepo(frontendRepoName);
    await createGitHubRepo(adminRepoName);

    onProgress({ step: 'github-push-backend', status: 'Pushing backend code to GitHub...', icon: '📤', progress: 20 });
    await pushFolderToGitHub(projectPath, 'backend', backendRepoName, githubUsername);

    onProgress({ step: 'github-push-frontend', status: 'Pushing frontend code to GitHub...', icon: '📤', progress: 28 });
    await pushFolderToGitHub(projectPath, 'frontend', frontendRepoName, githubUsername);

    // Only push admin if it exists
    const adminPath = path.join(projectPath, 'admin');
    if (fs.existsSync(adminPath)) {
      onProgress({ step: 'github-push-admin', status: 'Pushing admin code to GitHub...', icon: '📤', progress: 35 });
      await pushFolderToGitHub(projectPath, 'admin', adminRepoName, githubUsername);
    }

    onProgress({ step: 'railway-project', status: 'Creating Railway project...', icon: '🚂', progress: 40 });
    const railwayProject = await createRailwayProject(subdomain);
    const environmentId = railwayProject.environmentId;

    onProgress({ step: 'railway-database', status: 'Provisioning PostgreSQL database...', icon: '🗄️', progress: 45 });
    const postgresInfo = await createRailwayPostgres(railwayProject.id, environmentId);

    onProgress({ step: 'railway-backend', status: 'Creating backend service...', icon: '⚙️', progress: 50 });
    const backendService = await createRailwayService(
      railwayProject.id,
      environmentId,
      'backend',
      `${githubUsername}/${backendRepoName}`
    );

    onProgress({ step: 'railway-frontend', status: 'Creating frontend service...', icon: '🌐', progress: 55 });
    const frontendService = await createRailwayService(
      railwayProject.id,
      environmentId,
      'frontend',
      `${githubUsername}/${frontendRepoName}`
    );

    // Create admin service if admin folder exists
    let adminService = null;
    if (fs.existsSync(path.join(projectPath, 'admin'))) {
      onProgress({ step: 'railway-admin', status: 'Creating admin service...', icon: '🔧', progress: 58 });
      adminService = await createRailwayService(
        railwayProject.id,
        environmentId,
        'admin',
        `${githubUsername}/${adminRepoName}`
      );
    }

    onProgress({ step: 'railway-env', status: 'Configuring environment variables...', icon: '🔐', progress: 62 });
    const jwtSecret = require('crypto').randomBytes(32).toString('hex');
    const adminPassword = require('crypto').randomBytes(8).toString('hex');

    await setRailwayVariables(railwayProject.id, environmentId, backendService.id, {
      NODE_ENV: 'production',
      JWT_SECRET: jwtSecret,
      ADMIN_EMAIL: options.adminEmail || 'admin@be1st.io',
      ADMIN_PASSWORD: adminPassword,
      PORT: '5000',
      DATABASE_URL: postgresInfo.connectionString,
      FRONTEND_URL: `https://${subdomain}.be1st.io`
    });

    // Use Railway URL directly for API (more reliable than custom domain which may have DNS/SSL delays)
    const railwayBackendUrl = `https://${subdomain}-backend.up.railway.app`;

    await setRailwayVariables(railwayProject.id, environmentId, frontendService.id, {
      NODE_ENV: 'production',
      VITE_API_URL: railwayBackendUrl
    });

    // Set admin environment variables if admin service exists
    if (adminService) {
      await setRailwayVariables(railwayProject.id, environmentId, adminService.id, {
        NODE_ENV: 'production',
        VITE_API_URL: railwayBackendUrl
      });
    }

    // Wait for Railway to fully establish GitHub webhook connection
    onProgress({ step: 'railway-wait', status: 'Waiting for Railway webhooks...', icon: '⏳', progress: 65 });
    console.log('   ⏳ Waiting 20s for Railway to establish GitHub webhooks...');
    await sleep(20000);

    // Trigger initial deployments with longer delays
    onProgress({ step: 'deploy-backend', status: 'Deploying backend service...', icon: '🚀', progress: 70 });
    console.log('   🚀 Triggering backend deployment...');
    try {
      await deployRailwayService(environmentId, backendService.id);
    } catch (e) {
      console.log('   ⚠️ Backend deploy trigger failed, Railway will auto-deploy from GitHub');
    }
    await sleep(3000);

    onProgress({ step: 'deploy-frontend', status: 'Deploying frontend service...', icon: '🚀', progress: 75 });
    console.log('   🚀 Triggering frontend deployment...');
    try {
      await deployRailwayService(environmentId, frontendService.id);
    } catch (e) {
      console.log('   ⚠️ Frontend deploy trigger failed, Railway will auto-deploy from GitHub');
    }

    // Trigger admin deployment if service exists
    if (adminService) {
      await sleep(3000);
      onProgress({ step: 'deploy-admin', status: 'Deploying admin dashboard...', icon: '🚀', progress: 78 });
      console.log('   🚀 Triggering admin deployment...');
      try {
        await deployRailwayService(environmentId, adminService.id);
      } catch (e) {
        console.log('   ⚠️ Admin deploy trigger failed, Railway will auto-deploy from GitHub');
      }
    }

    onProgress({ step: 'domains', status: 'Generating service domains...', icon: '🔗', progress: 82 });
    const backendRailwayDomain = await generateRailwayServiceDomain(railwayProject.id, environmentId, backendService.id);
    const frontendRailwayDomain = await generateRailwayServiceDomain(railwayProject.id, environmentId, frontendService.id);
    const adminRailwayDomain = adminService ? await generateRailwayServiceDomain(railwayProject.id, environmentId, adminService.id) : null;

    onProgress({ step: 'custom-domains', status: 'Configuring custom domains...', icon: '🌍', progress: 86 });
    console.log(`\n📌 Configuring custom domains...`);
    
    // Add custom domains to Railway and get the target domains
    const frontendCustom = await addRailwayCustomDomain(railwayProject.id, environmentId, frontendService.id, `${subdomain}.be1st.io`);
    const backendCustom = await addRailwayCustomDomain(railwayProject.id, environmentId, backendService.id, `api.${subdomain}.be1st.io`);
    const adminCustom = adminService ? await addRailwayCustomDomain(railwayProject.id, environmentId, adminService.id, `admin.${subdomain}.be1st.io`) : null;
    
    onProgress({ step: 'dns', status: 'Setting up DNS records...', icon: '📡', progress: 90 });
    console.log(`\n📌 Configuring DNS (Cloudflare → Railway)...`);

    // Use Railway's custom domain target if available, otherwise fall back to service domain
    const frontendTarget = frontendCustom.target || frontendRailwayDomain;
    const backendTarget = backendCustom.target || backendRailwayDomain;
    const adminTarget = adminCustom?.target || adminRailwayDomain;

    if (frontendTarget) {
      await addCloudflareDNS(subdomain, frontendTarget, 'CNAME', true);
    }

    if (backendTarget) {
      await addCloudflareDNS(`api.${subdomain}`, backendTarget, 'CNAME', false);
    }

    if (adminTarget) {
      await addCloudflareDNS(`admin.${subdomain}`, adminTarget, 'CNAME', false);  // DNS only, no proxy
    }

    onProgress({ step: 'finalizing', status: 'Finalizing deployment...', icon: '✨', progress: 95 });

    results.success = true;
    results.railwayProjectId = railwayProject.id;
    results.railwayEnvironmentId = environmentId;
    results.urls = {
      frontend: `https://${subdomain}.be1st.io`,
      backend: `https://api.${subdomain}.be1st.io`,
      admin: adminService ? `https://admin.${subdomain}.be1st.io` : null,
      githubBackend: `https://github.com/${githubUsername}/${backendRepoName}`,
      githubFrontend: `https://github.com/${githubUsername}/${frontendRepoName}`,
      githubAdmin: adminService ? `https://github.com/${githubUsername}/${adminRepoName}` : null,
      railway: `https://railway.app/project/${railwayProject.id}`,
      railwayFrontend: frontendRailwayDomain ? `https://${frontendRailwayDomain}` : null,
      railwayBackend: backendRailwayDomain ? `https://${backendRailwayDomain}` : null,
      railwayAdmin: adminRailwayDomain ? `https://${adminRailwayDomain}` : null
    };
    results.credentials = {
      adminEmail: options.adminEmail || 'admin@be1st.io',
      adminPassword: adminPassword
    };

    onProgress({ step: 'complete', status: 'Deployment complete!', icon: '✅', progress: 100, urls: results.urls });

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ DEPLOYMENT COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🔗 URLs:');
    console.log(`   Frontend: ${results.urls.frontend}`);
    console.log(`   Backend:  ${results.urls.backend}`);
    if (results.urls.admin) {
      console.log(`   Admin:    ${results.urls.admin}`);
    }
    console.log(`   GitHub (backend):  ${results.urls.githubBackend}`);
    console.log(`   GitHub (frontend): ${results.urls.githubFrontend}`);
    if (results.urls.githubAdmin) {
      console.log(`   GitHub (admin):    ${results.urls.githubAdmin}`);
    }
    console.log(`   Railway:  ${results.urls.railway}`);
    if (results.urls.railwayFrontend) {
      console.log(`   Railway Frontend (direct): ${results.urls.railwayFrontend}`);
    }
    if (results.urls.railwayBackend) {
      console.log(`   Railway Backend (direct):  ${results.urls.railwayBackend}`);
    }
    if (results.urls.railwayAdmin) {
      console.log(`   Railway Admin (direct):    ${results.urls.railwayAdmin}`);
    }
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log(`   Email:    ${results.credentials.adminEmail}`);
    console.log(`   Password: ${results.credentials.adminPassword}`);
    console.log('');
    console.log('⏱️  Note: Build takes 2-3 minutes. Check Railway dashboard for status.');
    console.log('   Custom domains are fully configured and should work within 1-2 minutes.');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ DEPLOYMENT FAILED:', error.message);
    results.errors.push(error.message);
  }

  return results;
}

// ============================================
// CREDENTIAL CHECK
// ============================================

function checkCredentials(appType = 'website') {
  const missing = [];
  if (!RAILWAY_TOKEN) missing.push('RAILWAY_TOKEN');
  if (!GITHUB_TOKEN) missing.push('GITHUB_TOKEN');
  if (!CLOUDFLARE_TOKEN) missing.push('CLOUDFLARE_TOKEN');
  if (!CLOUDFLARE_ZONE_ID) missing.push('CLOUDFLARE_ZONE_ID');

  // Apps (.app domain) need the app zone ID
  if ((appType === 'advanced-app' || appType === 'companion-app') && !CLOUDFLARE_ZONE_ID_APP) {
    missing.push('CLOUDFLARE_ZONE_ID_APP');
  }

  if (missing.length > 0) {
    console.error('❌ Missing credentials in .env:', missing.join(', '));
    return false;
  }
  return true;
}

module.exports = {
  deployProject,
  deployAdvancedApp,
  deployCompanionApp,
  checkCredentials,
  createGitHubRepo,
  pushFolderToGitHub,
  pushProjectToGitHub,
  createRailwayProject,
  createRailwayPostgres,
  addCloudflareDNS,
  prepareProjectForDeployment,
  prepareAdvancedAppForDeployment,
  prepareCompanionAppForDeployment,
  detectAdvancedApp,
  getGitHubUsername,
  deleteGitHubRepo,
  // Domain configuration
  DOMAINS
};
