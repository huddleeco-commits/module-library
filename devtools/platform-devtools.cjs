#!/usr/bin/env node
/**
 * BE1ST Platform DevTools
 * 
 * Comprehensive platform analyzer with:
 * - Full module inventory
 * - Change tracking between runs
 * - Timestamped version history
 * - AI context generator
 * - Dependency mapping
 * 
 * Save to: C:\Users\huddl\OneDrive\Desktop\module-library\devtools\platform-devtools.cjs
 * Run: node devtools/platform-devtools.cjs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  historyFile: '.platform-history.json',
  outputDir: './devtools-output',
  maxHistoryEntries: 50
};

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner(text) {
  const line = '═'.repeat(70);
  log(`\n${line}`, 'cyan');
  log(`  ${text}`, 'bright');
  log(`${line}\n`, 'cyan');
}

// ============================================
// PLATFORM SCANNER
// ============================================

class PlatformScanner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.timestamp = new Date().toISOString();
    this.snapshot = {
      timestamp: this.timestamp,
      backendModules: {},
      frontendModules: {},
      templates: {},
      configs: {},
      scripts: {},
      industries: {},
      stats: {}
    };
  }

  // Get file hash for change detection
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    } catch (e) {
      return null;
    }
  }

  // Get file metadata
  getFileMeta(filePath) {
    try {
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        size: stat.size,
        modified: stat.mtime.toISOString(),
        hash: this.getFileHash(filePath),
        lines: content.split('\n').length
      };
    } catch (e) {
      return null;
    }
  }

  // Scan backend modules
  scanBackendModules() {
    const modulesDir = path.join(this.projectRoot, 'backend');
    if (!fs.existsSync(modulesDir)) return;

    // In this structure, modules are directly in /backend (no category subdirs)
    const modules = fs.readdirSync(modulesDir).filter(f => 
      fs.statSync(path.join(modulesDir, f)).isDirectory()
    );

    modules.forEach(moduleName => {
      const modulePath = path.join(modulesDir, moduleName);
      const category = this.inferCategory(moduleName); // Infer category from name
        const configPath = path.join(modulePath, 'config.json');
        
        let config = {};
        if (fs.existsSync(configPath)) {
          try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          } catch (e) {}
        }

        // Scan module files
        const files = this.getFilesRecursive(modulePath);
        const fileDetails = {};
        files.forEach(file => {
          const relPath = path.relative(modulePath, file);
          fileDetails[relPath] = this.getFileMeta(file);
        });

      this.snapshot.backendModules[moduleName] = {
        category,
        name: moduleName,
        path: modulePath,
        config,
        files: fileDetails,
        fileCount: files.length,
        totalLines: Object.values(fileDetails).reduce((sum, f) => sum + (f?.lines || 0), 0),
        dependencies: config.dependencies || [],
        exports: this.extractExports(modulePath)
      };
    });
  }

  // Infer category from module name
  inferCategory(moduleName) {
    const categoryMap = {
      'auth': 'core',
      'admin-dashboard': 'core',
      'analytics': 'core',
      'notifications': 'core',
      'file-upload': 'core',
      'payments': 'payments',
      'stripe-payments': 'payments',
      'kids-banking': 'payments',
      'calendar': 'productivity',
      'tasks': 'productivity',
      'documents': 'productivity',
      'chat': 'social',
      'social-feed': 'social',
      'posts': 'social',
      'family-groups': 'family',
      'meals': 'family',
      'schools': 'family',
      'betting': 'sports',
      'fantasy': 'sports',
      'pools': 'sports',
      'leaderboard': 'sports',
      'ai-scanner': 'collectibles',
      'collections': 'collectibles',
      'marketplace': 'collectibles',
      'ebay-integration': 'collectibles',
      'nfc-tags': 'collectibles',
      'showcase': 'collectibles',
      'transfers': 'collectibles',
      'vendor-system': 'collectibles',
      'inventory': 'business',
      'booking': 'business',
      'portfolio': 'business',
      'page-generator': 'ai',
      'achievements': 'gamification'
    };
    return categoryMap[moduleName] || 'other';
  }

  // Scan frontend modules
  scanFrontendModules() {
    const modulesDir = path.join(this.projectRoot, 'frontend');
    if (!fs.existsSync(modulesDir)) return;

    // In this structure, modules are directly in /frontend (no category subdirs)
    const modules = fs.readdirSync(modulesDir).filter(f =>
      fs.statSync(path.join(modulesDir, f)).isDirectory()
    );

    modules.forEach(moduleName => {
      const modulePath = path.join(modulesDir, moduleName);
      const category = this.inferCategory(moduleName);
      const configPath = path.join(modulePath, 'config.json');

        let config = {};
        if (fs.existsSync(configPath)) {
          try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          } catch (e) {}
        }

        // Scan module files
        const files = this.getFilesRecursive(modulePath);
        const fileDetails = {};
        files.forEach(file => {
          const relPath = path.relative(modulePath, file);
          fileDetails[relPath] = this.getFileMeta(file);
        });

        // Extract component info
        const components = this.extractComponents(modulePath);

        this.snapshot.frontendModules[moduleName] = {
          category,
          name: moduleName,
          path: modulePath,
          config,
          files: fileDetails,
          fileCount: files.length,
          totalLines: Object.values(fileDetails).reduce((sum, f) => sum + (f?.lines || 0), 0),
          components,
          dependencies: config.dependencies || []
        };
    });
  }

  // Scan templates
  scanTemplates() {
    const templatesDir = path.join(this.projectRoot, 'templates');
    if (!fs.existsSync(templatesDir)) return;

    const files = this.getFilesRecursive(templatesDir);
    files.forEach(file => {
      const relPath = path.relative(templatesDir, file);
      const meta = this.getFileMeta(file);
      
      // Extract template info
      let templateInfo = {};
      if (file.endsWith('.cjs') || file.endsWith('.js')) {
        templateInfo = this.extractTemplateInfo(file);
      }

      this.snapshot.templates[relPath] = {
        ...meta,
        ...templateInfo
      };
    });
  }

  // Scan industry configs
  scanIndustries() {
    const industriesDir = path.join(this.projectRoot, 'industries');
    if (!fs.existsSync(industriesDir)) return;

    const files = fs.readdirSync(industriesDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(industriesDir, file);
      try {
        const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const industryKey = file.replace('.json', '');
        this.snapshot.industries[industryKey] = {
          ...this.getFileMeta(filePath),
          config,
          moduleCount: (config.requiredBackendModules?.length || 0) + 
                       (config.requiredFrontendModules?.length || 0)
        };
      } catch (e) {}
    });
  }

  // Scan scripts
  scanScripts() {
    const scriptsDir = path.join(this.projectRoot, 'scripts');
    if (!fs.existsSync(scriptsDir)) return;

    const files = this.getFilesRecursive(scriptsDir);
    files.forEach(file => {
      const relPath = path.relative(scriptsDir, file);
      this.snapshot.scripts[relPath] = this.getFileMeta(file);
    });
  }

  // Extract exports from backend module
  extractExports(modulePath) {
    const exports = { routes: [], middleware: [], services: [] };
    
    const routesDir = path.join(modulePath, 'routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') || f.endsWith('.cjs'));
      routeFiles.forEach(file => {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
        const endpoints = this.extractEndpoints(content);
        exports.routes.push({ file, endpoints });
      });
    }

    return exports;
  }

  // Extract endpoints from route file
  extractEndpoints(content) {
    const endpoints = [];
    const patterns = [
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        endpoints.push({
          method: match[1].toUpperCase(),
          path: match[2]
        });
      }
    });

    return endpoints;
  }

  // Extract component info from frontend module
  extractComponents(modulePath) {
    const components = [];
    const files = this.getFilesRecursive(modulePath).filter(f => 
      f.endsWith('.jsx') || f.endsWith('.tsx')
    );

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const componentName = path.basename(file, path.extname(file));
      
      // Extract props
      const propsMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
      const props = propsMatch ? propsMatch[1].trim() : null;

      // Extract hooks used
      const hooksUsed = [];
      const hookPatterns = [
        /useState/g, /useEffect/g, /useContext/g, /useReducer/g,
        /useCallback/g, /useMemo/g, /useRef/g
      ];
      hookPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          hooksUsed.push(pattern.source);
        }
      });

      components.push({
        name: componentName,
        file: path.relative(modulePath, file),
        props,
        hooksUsed,
        hasStyles: content.includes('style=') || content.includes('className=')
      });
    });

    return components;
  }

  // Extract template info
  extractTemplateInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Look for template definitions
      const templateNames = [];
      const templateMatch = content.match(/['"]([^'"]+)['"]\s*:\s*{[\s\S]*?name:\s*['"]([^'"]+)['"]/g);
      if (templateMatch) {
        templateMatch.forEach(m => {
          const nameMatch = m.match(/name:\s*['"]([^'"]+)['"]/);
          if (nameMatch) templateNames.push(nameMatch[1]);
        });
      }

      // Look for industries mapping
      const industries = [];
      const industryMatch = content.match(/industries:\s*\[([^\]]+)\]/g);
      if (industryMatch) {
        industryMatch.forEach(m => {
          const matches = m.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            industries.push(...matches.map(s => s.replace(/['"]/g, '')));
          }
        });
      }

      return {
        templateNames,
        industries: [...new Set(industries)]
      };
    } catch (e) {
      return {};
    }
  }

  // Get files recursively
  getFilesRecursive(dir, extension = null) {
    if (!fs.existsSync(dir)) return [];
    
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      if (item.startsWith('.') || item === 'node_modules') return;
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath, extension));
      } else if (!extension || item.endsWith(extension)) {
        files.push(fullPath);
      }
    });

    return files;
  }

  // Calculate stats
  calculateStats() {
    const backendModules = Object.values(this.snapshot.backendModules);
    const frontendModules = Object.values(this.snapshot.frontendModules);

    this.snapshot.stats = {
      totalBackendModules: backendModules.length,
      totalFrontendModules: frontendModules.length,
      totalModules: backendModules.length + frontendModules.length,
      totalTemplates: Object.keys(this.snapshot.templates).length,
      totalIndustries: Object.keys(this.snapshot.industries).length,
      totalScripts: Object.keys(this.snapshot.scripts).length,
      backendLines: backendModules.reduce((sum, m) => sum + m.totalLines, 0),
      frontendLines: frontendModules.reduce((sum, m) => sum + m.totalLines, 0),
      backendFiles: backendModules.reduce((sum, m) => sum + m.fileCount, 0),
      frontendFiles: frontendModules.reduce((sum, m) => sum + m.fileCount, 0),
      totalEndpoints: backendModules.reduce((sum, m) => {
        return sum + m.exports.routes.reduce((s, r) => s + r.endpoints.length, 0);
      }, 0),
      totalComponents: frontendModules.reduce((sum, m) => sum + m.components.length, 0),
      backendCategories: [...new Set(backendModules.map(m => m.category))],
      frontendCategories: [...new Set(frontendModules.map(m => m.category))]
    };
  }

  // Run full scan
  scan() {
    log('🔍 Scanning platform...', 'yellow');
    
    this.scanBackendModules();
    log(`   ✓ Backend modules: ${Object.keys(this.snapshot.backendModules).length}`, 'green');
    
    this.scanFrontendModules();
    log(`   ✓ Frontend modules: ${Object.keys(this.snapshot.frontendModules).length}`, 'green');
    
    this.scanTemplates();
    log(`   ✓ Templates: ${Object.keys(this.snapshot.templates).length}`, 'green');
    
    this.scanIndustries();
    log(`   ✓ Industries: ${Object.keys(this.snapshot.industries).length}`, 'green');
    
    this.scanScripts();
    log(`   ✓ Scripts: ${Object.keys(this.snapshot.scripts).length}`, 'green');
    
    this.calculateStats();
    
    return this.snapshot;
  }
}

// ============================================
// CHANGE TRACKER
// ============================================

class ChangeTracker {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.historyPath = path.join(projectRoot, CONFIG.historyFile);
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyPath)) {
        return JSON.parse(fs.readFileSync(this.historyPath, 'utf-8'));
      }
    } catch (e) {}
    return { snapshots: [], changes: [] };
  }

  saveHistory() {
    // Keep only last N snapshots
    if (this.history.snapshots.length > CONFIG.maxHistoryEntries) {
      this.history.snapshots = this.history.snapshots.slice(-CONFIG.maxHistoryEntries);
    }
    if (this.history.changes.length > CONFIG.maxHistoryEntries * 10) {
      this.history.changes = this.history.changes.slice(-CONFIG.maxHistoryEntries * 10);
    }

    fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  // Compare two snapshots
  compareSnapshots(oldSnapshot, newSnapshot) {
    const changes = {
      timestamp: newSnapshot.timestamp,
      added: { backend: [], frontend: [], templates: [], industries: [] },
      removed: { backend: [], frontend: [], templates: [], industries: [] },
      modified: { backend: [], frontend: [], templates: [], industries: [] }
    };

    // Compare backend modules
    this.compareCategory(
      oldSnapshot?.backendModules || {},
      newSnapshot.backendModules,
      changes.added.backend,
      changes.removed.backend,
      changes.modified.backend
    );

    // Compare frontend modules
    this.compareCategory(
      oldSnapshot?.frontendModules || {},
      newSnapshot.frontendModules,
      changes.added.frontend,
      changes.removed.frontend,
      changes.modified.frontend
    );

    // Compare templates
    this.compareFiles(
      oldSnapshot?.templates || {},
      newSnapshot.templates,
      changes.added.templates,
      changes.removed.templates,
      changes.modified.templates
    );

    // Compare industries
    this.compareFiles(
      oldSnapshot?.industries || {},
      newSnapshot.industries,
      changes.added.industries,
      changes.removed.industries,
      changes.modified.industries
    );

    return changes;
  }

  compareCategory(oldItems, newItems, added, removed, modified) {
    const oldKeys = new Set(Object.keys(oldItems));
    const newKeys = new Set(Object.keys(newItems));

    // Find added
    newKeys.forEach(key => {
      if (!oldKeys.has(key)) {
        added.push({ key, item: newItems[key] });
      }
    });

    // Find removed
    oldKeys.forEach(key => {
      if (!newKeys.has(key)) {
        removed.push({ key, item: oldItems[key] });
      }
    });

    // Find modified
    newKeys.forEach(key => {
      if (oldKeys.has(key)) {
        const oldItem = oldItems[key];
        const newItem = newItems[key];
        
        // Check if any file hashes changed
        const oldHashes = this.getFileHashes(oldItem.files || {});
        const newHashes = this.getFileHashes(newItem.files || {});
        
        if (JSON.stringify(oldHashes) !== JSON.stringify(newHashes)) {
          modified.push({
            key,
            oldItem,
            newItem,
            changedFiles: this.getChangedFiles(oldItem.files || {}, newItem.files || {})
          });
        }
      }
    });
  }

  compareFiles(oldItems, newItems, added, removed, modified) {
    const oldKeys = new Set(Object.keys(oldItems));
    const newKeys = new Set(Object.keys(newItems));

    newKeys.forEach(key => {
      if (!oldKeys.has(key)) {
        added.push(key);
      } else if (oldItems[key]?.hash !== newItems[key]?.hash) {
        modified.push({ key, old: oldItems[key], new: newItems[key] });
      }
    });

    oldKeys.forEach(key => {
      if (!newKeys.has(key)) {
        removed.push(key);
      }
    });
  }

  getFileHashes(files) {
    const hashes = {};
    Object.entries(files).forEach(([name, meta]) => {
      hashes[name] = meta?.hash;
    });
    return hashes;
  }

  getChangedFiles(oldFiles, newFiles) {
    const changed = [];
    Object.keys(newFiles).forEach(name => {
      if (!oldFiles[name]) {
        changed.push({ file: name, type: 'added' });
      } else if (oldFiles[name]?.hash !== newFiles[name]?.hash) {
        changed.push({ file: name, type: 'modified' });
      }
    });
    Object.keys(oldFiles).forEach(name => {
      if (!newFiles[name]) {
        changed.push({ file: name, type: 'removed' });
      }
    });
    return changed;
  }

  // Record new snapshot
  recordSnapshot(snapshot) {
    const lastSnapshot = this.history.snapshots[this.history.snapshots.length - 1];
    const changes = this.compareSnapshots(lastSnapshot, snapshot);

    // Only record if there are changes or it's first run
    const hasChanges = 
      changes.added.backend.length > 0 ||
      changes.added.frontend.length > 0 ||
      changes.removed.backend.length > 0 ||
      changes.removed.frontend.length > 0 ||
      changes.modified.backend.length > 0 ||
      changes.modified.frontend.length > 0 ||
      changes.added.templates.length > 0 ||
      changes.modified.templates.length > 0 ||
      !lastSnapshot;

    if (hasChanges) {
      this.history.snapshots.push({
        timestamp: snapshot.timestamp,
        stats: snapshot.stats
      });
      
      if (lastSnapshot) {
        this.history.changes.push(changes);
      }

      this.saveHistory();
    }

    return { changes, hasChanges, isFirstRun: !lastSnapshot };
  }

  getRecentChanges(count = 10) {
    return this.history.changes.slice(-count).reverse();
  }
}

// ============================================
// HTML GENERATOR
// ============================================

function generateHTML(snapshot, changes, history) {
  const { stats } = snapshot;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BE1ST Platform DevTools</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg: #0a0a1a;
      --surface: #12122a;
      --surface-2: #1a1a3a;
      --border: #2a2a4a;
      --text: #e4e4e4;
      --text-muted: #888;
      --accent: #00d4ff;
      --accent-2: #9b59b6;
      --success: #2ecc71;
      --warning: #f39c12;
      --danger: #e74c3c;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    
    .header {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }
    
    .header h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, var(--accent), var(--accent-2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    
    .header .timestamp {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      padding: 24px 40px;
      background: var(--surface);
    }
    
    .stat-card {
      background: var(--surface-2);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid var(--border);
    }
    
    .stat-card .value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
    }
    
    .stat-card .label {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 4px;
    }
    
    .nav {
      display: flex;
      gap: 8px;
      padding: 16px 40px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    
    .nav-btn {
      padding: 10px 20px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .nav-btn:hover, .nav-btn.active {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }
    
    .content {
      padding: 24px 40px;
    }
    
    .section {
      display: none;
    }
    
    .section.active {
      display: block;
    }
    
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: var(--accent);
    }
    
    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }
    
    .module-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .module-card-header {
      padding: 16px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .module-card-header:hover {
      background: var(--border);
    }
    
    .module-name {
      font-weight: 600;
      color: var(--text);
    }
    
    .module-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .module-card-body {
      padding: 16px;
      display: none;
    }
    
    .module-card.open .module-card-body {
      display: block;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge-success { background: rgba(46, 204, 113, 0.2); color: var(--success); }
    .badge-warning { background: rgba(243, 156, 18, 0.2); color: var(--warning); }
    .badge-danger { background: rgba(231, 76, 60, 0.2); color: var(--danger); }
    .badge-info { background: rgba(0, 212, 255, 0.2); color: var(--accent); }
    
    .file-list {
      margin-top: 12px;
    }
    
    .file-item {
      padding: 8px 12px;
      background: var(--bg);
      border-radius: 6px;
      margin-bottom: 6px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.8rem;
      display: flex;
      justify-content: space-between;
    }
    
    .endpoint {
      padding: 6px 12px;
      background: var(--bg);
      border-radius: 6px;
      margin-bottom: 4px;
      font-family: monospace;
      font-size: 0.8rem;
    }
    
    .endpoint .method {
      display: inline-block;
      width: 60px;
      font-weight: 600;
    }
    
    .endpoint .method.GET { color: var(--success); }
    .endpoint .method.POST { color: var(--accent); }
    .endpoint .method.PUT { color: var(--warning); }
    .endpoint .method.DELETE { color: var(--danger); }
    
    .changes-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .change-entry {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .change-entry .timestamp {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 12px;
    }
    
    .change-group {
      margin-top: 8px;
    }
    
    .change-group h4 {
      color: var(--accent);
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    
    .change-item {
      padding: 6px 12px;
      background: var(--bg);
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 0.85rem;
    }
    
    .change-item.added { border-left: 3px solid var(--success); }
    .change-item.removed { border-left: 3px solid var(--danger); }
    .change-item.modified { border-left: 3px solid var(--warning); }
    
    .ai-context {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    
    .ai-context pre {
      background: var(--bg);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    
    .copy-btn {
      padding: 8px 16px;
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .copy-btn:hover {
      opacity: 0.9;
    }
    
    .search-box {
      width: 100%;
      padding: 12px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 1rem;
      margin-bottom: 20px;
    }
    
    .search-box:focus {
      outline: none;
      border-color: var(--accent);
    }
    
    .category-header {
      background: var(--surface-2);
      padding: 12px 16px;
      border-radius: 8px;
      margin: 20px 0 12px;
      font-weight: 600;
      color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 BE1ST Platform DevTools</h1>
    <div class="timestamp">Last scanned: ${new Date(snapshot.timestamp).toLocaleString()}</div>
  </div>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="value">${stats.totalBackendModules}</div>
      <div class="label">Backend Modules</div>
    </div>
    <div class="stat-card">
      <div class="value">${stats.totalFrontendModules}</div>
      <div class="label">Frontend Modules</div>
    </div>
    <div class="stat-card">
      <div class="value">${stats.totalEndpoints}</div>
      <div class="label">API Endpoints</div>
    </div>
    <div class="stat-card">
      <div class="value">${stats.totalComponents}</div>
      <div class="label">Components</div>
    </div>
    <div class="stat-card">
      <div class="value">${stats.totalIndustries}</div>
      <div class="label">Industries</div>
    </div>
    <div class="stat-card">
      <div class="value">${(stats.backendLines + stats.frontendLines).toLocaleString()}</div>
      <div class="label">Total Lines</div>
    </div>
  </div>
  
  <div class="nav">
    <button class="nav-btn active" onclick="showSection('backend')">Backend Modules</button>
    <button class="nav-btn" onclick="showSection('frontend')">Frontend Modules</button>
    <button class="nav-btn" onclick="showSection('industries')">Industries</button>
    <button class="nav-btn" onclick="showSection('templates')">Templates</button>
    <button class="nav-btn" onclick="showSection('changes')">Change History</button>
    <button class="nav-btn" onclick="showSection('ai-context')">AI Context</button>
  </div>
  
  <div class="content">
    <!-- BACKEND MODULES -->
    <div id="backend" class="section active">
      <h2 class="section-title">Backend Modules (${stats.totalBackendModules})</h2>
      <input type="text" class="search-box" placeholder="Search backend modules..." onkeyup="searchModules(this, 'backend')">
      
      ${generateBackendModulesHTML(snapshot.backendModules)}
    </div>
    
    <!-- FRONTEND MODULES -->
    <div id="frontend" class="section">
      <h2 class="section-title">Frontend Modules (${stats.totalFrontendModules})</h2>
      <input type="text" class="search-box" placeholder="Search frontend modules..." onkeyup="searchModules(this, 'frontend')">
      
      ${generateFrontendModulesHTML(snapshot.frontendModules)}
    </div>
    
    <!-- INDUSTRIES -->
    <div id="industries" class="section">
      <h2 class="section-title">Industry Configurations (${stats.totalIndustries})</h2>
      
      ${generateIndustriesHTML(snapshot.industries)}
    </div>
    
    <!-- TEMPLATES -->
    <div id="templates" class="section">
      <h2 class="section-title">Templates (${stats.totalTemplates})</h2>
      
      ${generateTemplatesHTML(snapshot.templates)}
    </div>
    
    <!-- CHANGE HISTORY -->
    <div id="changes" class="section">
      <h2 class="section-title">Change History</h2>
      
      ${generateChangesHTML(history.changes)}
    </div>
    
    <!-- AI CONTEXT -->
    <div id="ai-context" class="section">
      <h2 class="section-title">AI Context Generator</h2>
      <p style="color: var(--text-muted); margin-bottom: 16px;">Copy this to give AI complete platform context</p>
      
      <div class="ai-context">
        <button class="copy-btn" onclick="copyAIContext()">📋 Copy to Clipboard</button>
        <pre id="ai-context-text">${generateAIContext(snapshot)}</pre>
      </div>
    </div>
  </div>
  
  <script>
    function showSection(id) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      event.target.classList.add('active');
    }
    
    function toggleModule(el) {
      el.closest('.module-card').classList.toggle('open');
    }
    
    function searchModules(input, section) {
      const query = input.value.toLowerCase();
      document.querySelectorAll('#' + section + ' .module-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    }
    
    function copyAIContext() {
      const text = document.getElementById('ai-context-text').textContent;
      navigator.clipboard.writeText(text).then(() => {
        event.target.textContent = '✅ Copied!';
        setTimeout(() => event.target.textContent = '📋 Copy to Clipboard', 2000);
      });
    }
  </script>
</body>
</html>`;
}

function generateBackendModulesHTML(modules) {
  const byCategory = {};
  Object.entries(modules).forEach(([key, mod]) => {
    if (!byCategory[mod.category]) byCategory[mod.category] = [];
    byCategory[mod.category].push({ key, ...mod });
  });

  return Object.entries(byCategory).map(([category, mods]) => `
    <div class="category-header">${category.toUpperCase()} (${mods.length})</div>
    <div class="module-grid">
      ${mods.map(mod => `
        <div class="module-card" data-name="${mod.name}">
          <div class="module-card-header" onclick="toggleModule(this)">
            <div>
              <div class="module-name">${mod.name}</div>
              <div class="module-meta">${mod.fileCount} files · ${mod.totalLines.toLocaleString()} lines</div>
            </div>
            <span class="badge badge-info">${mod.category}</span>
          </div>
          <div class="module-card-body">
            ${mod.exports.routes.length > 0 ? `
              <h4 style="color: var(--accent); margin-bottom: 8px;">Endpoints</h4>
              ${mod.exports.routes.map(r => r.endpoints.map(ep => `
                <div class="endpoint">
                  <span class="method ${ep.method}">${ep.method}</span>
                  ${ep.path}
                </div>
              `).join('')).join('')}
            ` : ''}
            
            <h4 style="color: var(--accent); margin: 12px 0 8px;">Files</h4>
            <div class="file-list">
              ${Object.entries(mod.files).map(([name, meta]) => `
                <div class="file-item">
                  <span>${name}</span>
                  <span style="color: var(--text-muted)">${meta?.lines || 0} lines</span>
                </div>
              `).join('')}
            </div>
            
            ${mod.dependencies.length > 0 ? `
              <h4 style="color: var(--accent); margin: 12px 0 8px;">Dependencies</h4>
              ${mod.dependencies.map(d => `<span class="badge badge-warning" style="margin-right: 4px;">${d}</span>`).join('')}
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function generateFrontendModulesHTML(modules) {
  const byCategory = {};
  Object.entries(modules).forEach(([key, mod]) => {
    if (!byCategory[mod.category]) byCategory[mod.category] = [];
    byCategory[mod.category].push({ key, ...mod });
  });

  return Object.entries(byCategory).map(([category, mods]) => `
    <div class="category-header">${category.toUpperCase()} (${mods.length})</div>
    <div class="module-grid">
      ${mods.map(mod => `
        <div class="module-card" data-name="${mod.name}">
          <div class="module-card-header" onclick="toggleModule(this)">
            <div>
              <div class="module-name">${mod.name}</div>
              <div class="module-meta">${mod.components.length} components · ${mod.totalLines.toLocaleString()} lines</div>
            </div>
            <span class="badge badge-info">${mod.category}</span>
          </div>
          <div class="module-card-body">
            ${mod.components.length > 0 ? `
              <h4 style="color: var(--accent); margin-bottom: 8px;">Components</h4>
              ${mod.components.map(c => `
                <div class="file-item">
                  <span>${c.name}</span>
                  <span style="color: var(--text-muted)">${c.hooksUsed.length} hooks</span>
                </div>
              `).join('')}
            ` : ''}
            
            <h4 style="color: var(--accent); margin: 12px 0 8px;">Files</h4>
            <div class="file-list">
              ${Object.entries(mod.files).map(([name, meta]) => `
                <div class="file-item">
                  <span>${name}</span>
                  <span style="color: var(--text-muted)">${meta?.lines || 0} lines</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function generateIndustriesHTML(industries) {
  return `
    <div class="module-grid">
      ${Object.entries(industries).map(([key, ind]) => `
        <div class="module-card">
          <div class="module-card-header" onclick="toggleModule(this)">
            <div>
              <div class="module-name">${ind.config?.name || key}</div>
              <div class="module-meta">${ind.moduleCount} modules configured</div>
            </div>
          </div>
          <div class="module-card-body">
            ${ind.config?.requiredBackendModules ? `
              <h4 style="color: var(--accent); margin-bottom: 8px;">Backend Modules</h4>
              ${ind.config.requiredBackendModules.map(m => `
                <span class="badge badge-info" style="margin: 2px;">${m}</span>
              `).join('')}
            ` : ''}
            
            ${ind.config?.requiredFrontendModules ? `
              <h4 style="color: var(--accent); margin: 12px 0 8px;">Frontend Modules</h4>
              ${ind.config.requiredFrontendModules.map(m => `
                <span class="badge badge-success" style="margin: 2px;">${m}</span>
              `).join('')}
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateTemplatesHTML(templates) {
  return `
    <div class="module-grid">
      ${Object.entries(templates).map(([name, tmpl]) => `
        <div class="module-card">
          <div class="module-card-header">
            <div>
              <div class="module-name">${name}</div>
              <div class="module-meta">${tmpl.lines || 0} lines</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function generateChangesHTML(changes) {
  if (!changes || changes.length === 0) {
    return '<p style="color: var(--text-muted);">No changes recorded yet. Run the tool again after making changes to track them.</p>';
  }

  return `
    <div class="changes-list">
      ${changes.slice().reverse().map(change => `
        <div class="change-entry">
          <div class="timestamp">📅 ${new Date(change.timestamp).toLocaleString()}</div>
          
          ${change.added.backend.length > 0 ? `
            <div class="change-group">
              <h4>➕ Added Backend Modules</h4>
              ${change.added.backend.map(c => `
                <div class="change-item added">${c.key}</div>
              `).join('')}
            </div>
          ` : ''}
          
          ${change.added.frontend.length > 0 ? `
            <div class="change-group">
              <h4>➕ Added Frontend Modules</h4>
              ${change.added.frontend.map(c => `
                <div class="change-item added">${c.key}</div>
              `).join('')}
            </div>
          ` : ''}
          
          ${change.modified.backend.length > 0 ? `
            <div class="change-group">
              <h4>✏️ Modified Backend Modules</h4>
              ${change.modified.backend.map(c => `
                <div class="change-item modified">
                  ${c.key}
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                    ${c.changedFiles.map(f => f.file + ' (' + f.type + ')').join(', ')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${change.modified.frontend.length > 0 ? `
            <div class="change-group">
              <h4>✏️ Modified Frontend Modules</h4>
              ${change.modified.frontend.map(c => `
                <div class="change-item modified">
                  ${c.key}
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                    ${c.changedFiles.map(f => f.file + ' (' + f.type + ')').join(', ')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${change.removed.backend.length > 0 ? `
            <div class="change-group">
              <h4>➖ Removed Backend Modules</h4>
              ${change.removed.backend.map(c => `
                <div class="change-item removed">${c.key}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function generateAIContext(snapshot) {
  const context = {
    platform: 'BE1ST Module Assembler',
    scanned: snapshot.timestamp,
    stats: snapshot.stats,
    backendModules: Object.entries(snapshot.backendModules).map(([key, m]) => ({
      module: key,
      category: m.category,
      endpoints: m.exports.routes.flatMap(r => r.endpoints.map(e => `${e.method} ${e.path}`)),
      dependencies: m.dependencies
    })),
    frontendModules: Object.entries(snapshot.frontendModules).map(([key, m]) => ({
      module: key,
      category: m.category,
      components: m.components.map(c => c.name),
      dependencies: m.dependencies
    })),
    industries: Object.keys(snapshot.industries),
    templates: Object.keys(snapshot.templates)
  };

  return JSON.stringify(context, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  banner('🚀 BE1ST PLATFORM DEVTOOLS');

  // Determine project root
  let projectRoot = process.cwd();
  const rootArg = args.indexOf('--root');
  if (rootArg !== -1 && args[rootArg + 1]) {
    projectRoot = path.resolve(args[rootArg + 1]);
  }

  log(`📂 Project root: ${projectRoot}`, 'blue');

  // Run scanner
  const scanner = new PlatformScanner(projectRoot);
  const snapshot = scanner.scan();

  // Track changes
  log('\n📊 Tracking changes...', 'yellow');
  const tracker = new ChangeTracker(projectRoot);
  const { changes, hasChanges, isFirstRun } = tracker.recordSnapshot(snapshot);

  if (isFirstRun) {
    log('   ✓ First run - baseline snapshot created', 'green');
  } else if (hasChanges) {
    log('   ✓ Changes detected and recorded', 'green');
    
    const totalChanges = 
      changes.added.backend.length + changes.added.frontend.length +
      changes.removed.backend.length + changes.removed.frontend.length +
      changes.modified.backend.length + changes.modified.frontend.length;
    
    log(`   📝 ${totalChanges} changes since last run`, 'cyan');
  } else {
    log('   ✓ No changes detected', 'green');
  }

  // Generate output
  const outputDir = path.join(projectRoot, CONFIG.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate HTML
  log('\n💾 Generating output...', 'yellow');
  const html = generateHTML(snapshot, changes, tracker.history);
  const htmlPath = path.join(outputDir, 'platform-devtools.html');
  fs.writeFileSync(htmlPath, html);
  log(`   ✓ ${htmlPath}`, 'green');

  // Save JSON snapshot
  const jsonPath = path.join(outputDir, 'platform-snapshot.json');
  fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2));
  log(`   ✓ ${jsonPath}`, 'green');

  // Summary
  banner('✅ DEVTOOLS COMPLETE');
  
  log(`\n📊 Platform Summary:`, 'cyan');
  log(`   Backend Modules:  ${snapshot.stats.totalBackendModules}`, 'white');
  log(`   Frontend Modules: ${snapshot.stats.totalFrontendModules}`, 'white');
  log(`   API Endpoints:    ${snapshot.stats.totalEndpoints}`, 'white');
  log(`   Components:       ${snapshot.stats.totalComponents}`, 'white');
  log(`   Industries:       ${snapshot.stats.totalIndustries}`, 'white');
  log(`   Total Lines:      ${(snapshot.stats.backendLines + snapshot.stats.frontendLines).toLocaleString()}`, 'white');

  log(`\n🌐 Open the HTML to view:`, 'cyan');
  log(`   ${htmlPath}`, 'bright');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
