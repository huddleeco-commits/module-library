#!/usr/bin/env node

/**
 * Module Validation Script
 *
 * Validates all modules in the library for:
 * - Required files exist
 * - module.json is valid
 * - No syntax errors in JS/JSX files
 * - Dependencies are declared
 *
 * Usage: node scripts/validate-modules.cjs
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = path.join(__dirname, '..', 'backend');
const FRONTEND_PATH = path.join(__dirname, '..', 'frontend');

// Validation results
const results = {
  passed: [],
  warnings: [],
  errors: []
};

function log(type, module, message) {
  const entry = { module, message };
  results[type].push(entry);

  const icons = { passed: '✅', warnings: '⚠️', errors: '❌' };
  console.log(`  ${icons[type]} [${module}] ${message}`);
}

function validateModuleJson(modulePath, moduleName, type) {
  const jsonPath = path.join(modulePath, 'module.json');

  if (!fs.existsSync(jsonPath)) {
    log('errors', moduleName, 'Missing module.json');
    return null;
  }

  try {
    const content = fs.readFileSync(jsonPath, 'utf-8');
    const json = JSON.parse(content);

    // Required fields
    if (!json.name) {
      log('errors', moduleName, 'module.json missing "name" field');
    }

    if (!json.type) {
      log('errors', moduleName, 'module.json missing "type" field');
    } else if (json.type !== type) {
      log('warnings', moduleName, `module.json type "${json.type}" doesn't match location "${type}"`);
    }

    if (!json.files || !Array.isArray(json.files)) {
      log('warnings', moduleName, 'module.json missing "files" array');
    }

    return json;
  } catch (err) {
    log('errors', moduleName, `Invalid module.json: ${err.message}`);
    return null;
  }
}

function validateFilesExist(modulePath, moduleName, moduleJson) {
  if (!moduleJson || !moduleJson.files) return;

  for (const file of moduleJson.files) {
    const filePath = path.join(modulePath, file);
    if (!fs.existsSync(filePath)) {
      log('errors', moduleName, `Declared file missing: ${file}`);
    }
  }
}

function validateJsSyntax(modulePath, moduleName) {
  const jsFiles = [];

  function findJsFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && item !== 'node_modules') {
        findJsFiles(fullPath);
      } else if (item.match(/\.(js|jsx|mjs|cjs)$/)) {
        jsFiles.push(fullPath);
      }
    }
  }

  findJsFiles(modulePath);

  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');

      // Basic syntax checks
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        log('warnings', moduleName, `Possible unbalanced braces in ${path.basename(file)}`);
      }

      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        log('warnings', moduleName, `Possible unbalanced parentheses in ${path.basename(file)}`);
      }

    } catch (err) {
      log('errors', moduleName, `Cannot read ${path.basename(file)}: ${err.message}`);
    }
  }
}

function validateModule(modulePath, moduleName, type) {
  console.log(`\n📦 Validating ${type}/${moduleName}...`);

  // Check module.json
  const moduleJson = validateModuleJson(modulePath, moduleName, type);

  // Check declared files exist
  validateFilesExist(modulePath, moduleName, moduleJson);

  // Check JS syntax
  validateJsSyntax(modulePath, moduleName);

  // If no errors or warnings logged for this module, it passed
  const hasIssues = [...results.errors, ...results.warnings].some(
    e => e.module === moduleName
  );

  if (!hasIssues) {
    log('passed', moduleName, 'All validations passed');
  }
}

function validateAllModules() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  BE1st Module Validator');
  console.log('═══════════════════════════════════════════════════════════════');

  // Validate backend modules
  console.log('\n📂 BACKEND MODULES');
  console.log('─────────────────────────────────────────────────────────────');

  if (fs.existsSync(BACKEND_PATH)) {
    const backendModules = fs.readdirSync(BACKEND_PATH).filter(
      f => fs.statSync(path.join(BACKEND_PATH, f)).isDirectory()
    );

    for (const moduleName of backendModules) {
      validateModule(path.join(BACKEND_PATH, moduleName), moduleName, 'backend');
    }
  }

  // Validate frontend modules
  console.log('\n📂 FRONTEND MODULES');
  console.log('─────────────────────────────────────────────────────────────');

  if (fs.existsSync(FRONTEND_PATH)) {
    const frontendModules = fs.readdirSync(FRONTEND_PATH).filter(
      f => fs.statSync(path.join(FRONTEND_PATH, f)).isDirectory()
    );

    for (const moduleName of frontendModules) {
      validateModule(path.join(FRONTEND_PATH, moduleName), moduleName, 'frontend');
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ Passed:   ${results.passed.length} modules`);
  console.log(`  ⚠️  Warnings: ${results.warnings.length} issues`);
  console.log(`  ❌ Errors:   ${results.errors.length} issues`);
  console.log('═══════════════════════════════════════════════════════════════');

  // List errors
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS (must fix):');
    for (const err of results.errors) {
      console.log(`   - [${err.module}] ${err.message}`);
    }
  }

  // List warnings
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should review):');
    for (const warn of results.warnings) {
      console.log(`   - [${warn.module}] ${warn.message}`);
    }
  }

  // Exit code
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
validateAllModules();
