/**
 * Module Validator Service
 * Validates module completeness after assembly and before deployment
 * Prevents issues like missing imports, wrong SQL syntax, and missing files
 */

const fs = require('fs');
const path = require('path');

// List of valid Lucide icons (commonly used ones)
const VALID_LUCIDE_ICONS = new Set([
  'Activity', 'AlertCircle', 'AlertTriangle', 'Archive', 'ArrowDown', 'ArrowLeft',
  'ArrowRight', 'ArrowUp', 'Award', 'BarChart', 'BarChart2', 'BarChart3', 'Bell',
  'Book', 'Bookmark', 'Box', 'Building', 'Building2', 'Calendar', 'Camera',
  'Check', 'CheckCircle', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp',
  'Circle', 'Clock', 'Copy', 'CreditCard', 'Crown', 'DollarSign', 'Download',
  'Edit', 'ExternalLink', 'Eye', 'EyeOff', 'Facebook', 'File', 'FileText', 'Filter',
  'Flame', 'Folder', 'Gift', 'Globe', 'Grid', 'Heart', 'HelpCircle', 'Home',
  'Image', 'Info', 'Instagram', 'Key', 'Layers', 'LayoutDashboard', 'Link',
  'Linkedin', 'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Mail', 'Map', 'MapPin',
  'Medal', 'Megaphone', 'Menu', 'MessageCircle', 'MessageSquare', 'Minus', 'Moon',
  'MoreHorizontal', 'MoreVertical', 'Package', 'Palette', 'Paperclip', 'Pause',
  'Phone', 'Play', 'Plus', 'PlusCircle', 'RefreshCw', 'Save', 'Scissors', 'Search',
  'Send', 'Settings', 'Share', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Smartphone',
  'Sparkles', 'Star', 'Sun', 'Tag', 'Target', 'ThumbsUp', 'Trash', 'TrendingDown',
  'TrendingUp', 'Trophy', 'Twitter', 'Upload', 'User', 'UserCheck', 'UserCog',
  'UserPlus', 'Users', 'Video', 'Wallet', 'X', 'Zap'
]);

/**
 * Extract all named imports from any package (to avoid conflicts)
 */
function extractAllImports(code) {
  const allImports = new Set();

  // Match import { X, Y, Z } from 'any-package'
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const imports = match[1].split(',').map(s => s.trim().split(' ')[0]); // Handle "X as Y"
    imports.forEach(imp => allImports.add(imp));
  }

  return allImports;
}

/**
 * Extract lucide-react icons used in a JSX file
 */
function extractUsedIcons(code) {
  const usedIcons = new Set();

  // Get all existing imports to avoid conflicts (e.g., Link from react-router-dom)
  const existingImports = extractAllImports(code);

  // Match icon component usage like <Check />, <Star size={16} />, etc.
  const iconUsageRegex = /<([A-Z][a-zA-Z0-9]+)[\s/>]/g;
  let match;
  while ((match = iconUsageRegex.exec(code)) !== null) {
    const componentName = match[1];
    // Only count as icon if it's in our valid list AND not already imported from another package
    if (VALID_LUCIDE_ICONS.has(componentName) && !existingImports.has(componentName)) {
      usedIcons.add(componentName);
    }
  }

  return Array.from(usedIcons);
}

/**
 * Extract imported icons from lucide-react import statement
 */
function extractImportedIcons(code) {
  const importedIcons = new Set();

  // Match import { Icon1, Icon2 } from 'lucide-react'
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const icons = match[1].split(',').map(s => s.trim());
    icons.forEach(icon => importedIcons.add(icon));
  }

  return Array.from(importedIcons);
}

/**
 * Validate and fix icon imports in a JSX file
 * Returns { fixed: boolean, missingIcons: string[], fixedCode: string }
 */
function validateAndFixIconImports(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    const usedIcons = extractUsedIcons(code);
    const importedIcons = extractImportedIcons(code);

    const missingIcons = usedIcons.filter(icon => !importedIcons.includes(icon));

    if (missingIcons.length === 0) {
      return { fixed: false, missingIcons: [], fixedCode: code };
    }

    console.log(`   ⚠️ ${path.basename(filePath)}: Missing icon imports: ${missingIcons.join(', ')}`);

    // Fix the import statement
    let fixedCode = code;
    const importMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);

    if (importMatch) {
      const currentImports = importMatch[1].split(',').map(s => s.trim());
      const allImports = [...new Set([...currentImports, ...missingIcons])].sort();
      const newImportLine = `import { ${allImports.join(', ')} } from 'lucide-react'`;
      fixedCode = code.replace(/import\s*\{[^}]+\}\s*from\s*['"]lucide-react['"]/, newImportLine);
    } else {
      // No lucide import exists, add one
      const newImportLine = `import { ${missingIcons.sort().join(', ')} } from 'lucide-react';\n`;
      // Add after first import or at start
      const firstImportMatch = code.match(/^import\s+/m);
      if (firstImportMatch) {
        fixedCode = code.replace(/^(import\s+[^\n]+\n)/, `$1${newImportLine}`);
      } else {
        fixedCode = newImportLine + code;
      }
    }

    return { fixed: true, missingIcons, fixedCode };
  } catch (error) {
    console.error(`   ❌ Error validating ${filePath}:`, error.message);
    return { fixed: false, missingIcons: [], fixedCode: null, error: error.message };
  }
}

/**
 * Validate all pages in a frontend/src/pages directory
 */
async function validateFrontendPages(pagesDir) {
  const issues = [];
  const fixes = [];

  if (!fs.existsSync(pagesDir)) {
    return { issues: [{ type: 'missing_dir', path: pagesDir }], fixes: [] };
  }

  const pageFiles = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));

  for (const pageFile of pageFiles) {
    const pagePath = path.join(pagesDir, pageFile);
    const result = validateAndFixIconImports(pagePath);

    if (result.error) {
      issues.push({ type: 'read_error', file: pageFile, error: result.error });
    } else if (result.missingIcons.length > 0) {
      issues.push({ type: 'missing_icons', file: pageFile, icons: result.missingIcons });

      // Auto-fix the file
      if (result.fixedCode) {
        fs.writeFileSync(pagePath, result.fixedCode);
        fixes.push({ file: pageFile, fixedIcons: result.missingIcons });
        console.log(`   ✅ Auto-fixed ${pageFile}: Added ${result.missingIcons.join(', ')}`);
      }
    }
  }

  return { issues, fixes };
}

/**
 * Check for missing service imports in backend routes
 */
async function validateBackendModules(modulesDir) {
  const issues = [];

  if (!fs.existsSync(modulesDir)) {
    return { issues: [{ type: 'missing_dir', path: modulesDir }] };
  }

  const modules = fs.readdirSync(modulesDir)
    .filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());

  for (const moduleName of modules) {
    const moduleDir = path.join(modulesDir, moduleName);
    const routesDir = path.join(moduleDir, 'routes');
    const servicesDir = path.join(moduleDir, 'services');
    const modelsDir = path.join(moduleDir, 'models');

    if (!fs.existsSync(routesDir)) continue;

    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

    for (const routeFile of routeFiles) {
      const routePath = path.join(routesDir, routeFile);
      const code = fs.readFileSync(routePath, 'utf-8');

      // Check for service imports
      const serviceImports = code.match(/require\(['"]\.\.\/services\/([^'"]+)['"]\)/g) || [];
      for (const imp of serviceImports) {
        const serviceName = imp.match(/services\/([^'"]+)/)[1];
        const serviceFile = serviceName.endsWith('.js') ? serviceName : `${serviceName}.js`;
        const servicePath = path.join(servicesDir, serviceFile);

        if (!fs.existsSync(servicePath)) {
          issues.push({
            type: 'missing_service',
            module: moduleName,
            route: routeFile,
            missingService: serviceFile
          });
        }
      }

      // Check for model imports
      const modelImports = code.match(/require\(['"]\.\.\/models\/([^'"]+)['"]\)/g) || [];
      for (const imp of modelImports) {
        const modelName = imp.match(/models\/([^'"]+)/)[1];
        const modelFile = modelName.endsWith('.js') ? modelName : `${modelName}.js`;
        const modelPath = path.join(modelsDir, modelFile);

        if (!fs.existsSync(modelPath)) {
          issues.push({
            type: 'missing_model',
            module: moduleName,
            route: routeFile,
            missingModel: modelFile
          });
        }
      }

      // Check for MySQL vs PostgreSQL syntax
      if (code.includes(' = ?') || code.includes('VALUES (?, ')) {
        issues.push({
          type: 'sql_syntax',
          module: moduleName,
          route: routeFile,
          message: 'MySQL placeholder syntax (?) detected, should use PostgreSQL ($1, $2)'
        });
      }

      // Check for MongoDB/Mongoose usage with PostgreSQL db
      if (code.includes('mongoose') && code.includes("require('../database/db')")) {
        issues.push({
          type: 'db_mismatch',
          module: moduleName,
          route: routeFile,
          message: 'Mongoose imported with PostgreSQL database - potential ORM mismatch'
        });
      }
    }
  }

  return { issues };
}

/**
 * Check for duplicate route prefixes in server.js
 */
function validateServerRoutes(serverPath) {
  const issues = [];

  if (!fs.existsSync(serverPath)) {
    return { issues: [{ type: 'missing_file', path: serverPath }] };
  }

  const code = fs.readFileSync(serverPath, 'utf-8');
  const routePrefixes = {};

  // Match app.use('/api/something', routes)
  const routeMatches = code.matchAll(/app\.use\(['"]([^'"]+)['"]/g);

  for (const match of routeMatches) {
    const prefix = match[1];
    if (routePrefixes[prefix]) {
      issues.push({
        type: 'duplicate_route',
        prefix,
        message: `Route prefix '${prefix}' is registered multiple times`
      });
    } else {
      routePrefixes[prefix] = true;
    }
  }

  return { issues };
}

/**
 * Run all validations on a generated project
 */
async function validateProject(projectPath) {
  console.log('🔍 Running module validation...');

  const results = {
    frontend: { issues: [], fixes: [] },
    backend: { issues: [] },
    server: { issues: [] },
    summary: { totalIssues: 0, totalFixes: 0 }
  };

  // Validate frontend pages
  const pagesDir = path.join(projectPath, 'frontend', 'src', 'pages');
  if (fs.existsSync(pagesDir)) {
    console.log('   📄 Validating frontend pages...');
    results.frontend = await validateFrontendPages(pagesDir);
  }

  // Validate backend modules
  const modulesDir = path.join(projectPath, 'backend', 'modules');
  if (fs.existsSync(modulesDir)) {
    console.log('   🔧 Validating backend modules...');
    results.backend = await validateBackendModules(modulesDir);
  }

  // Validate server routes
  const serverPath = path.join(projectPath, 'backend', 'server.js');
  if (fs.existsSync(serverPath)) {
    console.log('   🌐 Validating server routes...');
    results.server = validateServerRoutes(serverPath);
  }

  // Calculate summary
  results.summary.totalIssues =
    results.frontend.issues.length +
    results.backend.issues.length +
    results.server.issues.length;
  results.summary.totalFixes = results.frontend.fixes.length;

  if (results.summary.totalIssues > 0) {
    console.log(`   ⚠️ Found ${results.summary.totalIssues} issues, auto-fixed ${results.summary.totalFixes}`);
  } else {
    console.log('   ✅ All validations passed');
  }

  return results;
}

module.exports = {
  validateProject,
  validateFrontendPages,
  validateBackendModules,
  validateServerRoutes,
  validateAndFixIconImports,
  extractUsedIcons,
  extractImportedIcons,
  VALID_LUCIDE_ICONS
};
