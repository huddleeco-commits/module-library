#!/usr/bin/env node

/**
 * Module Assembler Test Runner
 * 
 * Simulates UI selections and generates test projects
 * Uses minimal pages (just home) to reduce AI costs while proving the system works
 * 
 * Usage:
 *   node test-runner.cjs                    # Run all test scenarios
 *   node test-runner.cjs --scenario=1       # Run specific scenario
 *   node test-runner.cjs --list             # List all scenarios
 *   node test-runner.cjs --dry-run          # Show what would be generated without calling API
 * 
 * Save to: C:\Users\huddl\OneDrive\Desktop\module-library\scripts\test-runner.cjs
 */

const http = require('http');

// ============================================
// TEST SCENARIOS - Simulates user selections
// ============================================

const TEST_SCENARIOS = [
  {
    id: 1,
    name: 'Italian Restaurant',
    industry: 'restaurant',
    layout: 'hero-full-image',
    effects: ['fade-up', 'image-zoom', 'warm-overlay', 'hover-lift'],
    description: 'Upscale Italian restaurant in downtown Dallas. Wood-fired pizzas, handmade pasta, extensive wine list. Romantic ambiance with exposed brick and candlelit tables.',
    pages: ['home'],
    projectName: 'test-restaurant'
  },
  {
    id: 2,
    name: 'Law Firm',
    industry: 'law-firm',
    layout: 'hero-minimal',
    effects: ['fade-up', 'hover-lift'],
    description: 'Premier corporate law firm in Manhattan. 50 years of excellence in mergers, acquisitions, and litigation. Trusted by Fortune 500 companies.',
    pages: ['home'],
    projectName: 'test-lawfirm'
  },
  {
    id: 3,
    name: 'SaaS Platform',
    industry: 'saas',
    layout: 'hero-split',
    effects: ['fade-up', 'gradient-text', 'hover-scale'],
    description: 'AI-powered analytics platform for enterprise. Real-time dashboards, predictive insights, seamless integrations with your existing tools.',
    pages: ['home'],
    projectName: 'test-saas'
  },
  {
    id: 4,
    name: 'Dental Practice',
    industry: 'dental',
    layout: 'hero-cards-overlay',
    effects: ['fade-up', 'hover-lift', 'number-counter'],
    description: 'Family dental practice in Austin. Cosmetic dentistry, Invisalign, emergency care. Modern facility with spa-like atmosphere.',
    pages: ['home'],
    projectName: 'test-dental'
  },
  {
    id: 5,
    name: 'Real Estate Agency',
    industry: 'real-estate',
    layout: 'hero-full-image',
    effects: ['fade-up', 'parallax', 'image-zoom', 'hover-lift'],
    description: 'Luxury real estate in Miami. Waterfront properties, penthouses, exclusive listings. White-glove service for discerning clients.',
    pages: ['home'],
    projectName: 'test-realestate'
  },
  {
    id: 6,
    name: 'Fitness Gym',
    industry: 'fitness',
    layout: 'hero-video-background',
    effects: ['fade-up', 'scale-in', 'dark-overlay'],
    description: 'High-performance fitness center in LA. Personal training, group classes, recovery spa. Transform your body and mind.',
    pages: ['home'],
    projectName: 'test-fitness'
  }
];

// ============================================
// API CALLER - Simulates frontend API calls
// ============================================

function callApi(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(120000); // 2 min timeout for AI generation
    req.write(postData);
    req.end();
  });
}

function callApiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// ============================================
// TEST RUNNER
// ============================================

async function runScenario(scenario, dryRun = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST SCENARIO ${scenario.id}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log(`\n📋 Configuration:`);
  console.log(`   Industry:    ${scenario.industry}`);
  console.log(`   Layout:      ${scenario.layout}`);
  console.log(`   Effects:     ${scenario.effects.join(', ')}`);
  console.log(`   Pages:       ${scenario.pages.join(', ')}`);
  console.log(`   Project:     ${scenario.projectName}`);
  console.log(`   Description: ${scenario.description.substring(0, 60)}...`);
  
  if (dryRun) {
    console.log(`\n⏭️  DRY RUN - Skipping actual generation`);
    return { success: true, dryRun: true };
  }
  
  // Build payload exactly like the UI does
  const payload = {
    name: scenario.projectName,
    industry: scenario.industry,
    bundles: null, // Using industry preset
    references: [], // Skip reference sites for testing
    theme: null, // Let server build from industry config
    description: {
      text: scenario.description,
      pages: scenario.pages,
      industryKey: scenario.industry,
      layoutKey: scenario.layout,
      effects: scenario.effects,
      enhanceMode: false,
      existingSite: null
    }
  };
  
  console.log(`\n🚀 Calling /api/assemble...`);
  const startTime = Date.now();
  
  try {
    const result = await callApi('/api/assemble', payload);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (result.success) {
      console.log(`\n✅ SUCCESS in ${elapsed}s`);
      console.log(`   📁 ${result.project?.path || 'Project created'}`);
      return { success: true, elapsed, path: result.project?.path };
    } else {
      console.log(`\n❌ FAILED: ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.log(`\n❌ ERROR: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function checkServer() {
  try {
    const health = await callApiGet('/api/health');
    return health.status === 'ok';
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse args
  const listMode = args.includes('--list');
  const dryRun = args.includes('--dry-run');
  const scenarioArg = args.find(a => a.startsWith('--scenario='));
  const specificScenario = scenarioArg ? parseInt(scenarioArg.split('=')[1]) : null;
  
  // List mode
  if (listMode) {
    console.log('\n📋 Available Test Scenarios:\n');
    for (const s of TEST_SCENARIOS) {
      console.log(`  ${s.id}. ${s.name.padEnd(20)} - ${s.industry} (${s.layout})`);
    }
    console.log(`\nUsage:`);
    console.log(`  node test-runner.cjs                  # Run all scenarios`);
    console.log(`  node test-runner.cjs --scenario=1     # Run specific scenario`);
    console.log(`  node test-runner.cjs --dry-run        # Show config without generating`);
    return;
  }
  
  // Check server
  console.log('🔍 Checking server...');
  const serverUp = await checkServer();
  if (!serverUp) {
    console.log('❌ Server not running! Start it with:');
    console.log('   cd module-assembler-ui && node server.cjs');
    process.exit(1);
  }
  console.log('✅ Server is running\n');
  
  // Get scenarios to run
  const scenarios = specificScenario 
    ? TEST_SCENARIOS.filter(s => s.id === specificScenario)
    : TEST_SCENARIOS;
  
  if (scenarios.length === 0) {
    console.log(`❌ Scenario ${specificScenario} not found`);
    process.exit(1);
  }
  
  // Run scenarios
  console.log(`\n🧪 Running ${scenarios.length} test scenario(s)...`);
  if (dryRun) {
    console.log('   (DRY RUN - no actual generation)');
  }
  
  const results = [];
  
  for (const scenario of scenarios) {
    const result = await runScenario(scenario, dryRun);
    results.push({ scenario: scenario.name, ...result });
    
    // Small delay between scenarios to not overwhelm API
    if (!dryRun && scenarios.length > 1) {
      console.log('\n⏳ Waiting 2s before next scenario...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    const time = r.elapsed ? ` (${r.elapsed}s)` : '';
    console.log(`  ${icon} ${r.scenario}${time}`);
  }
  
  console.log(`\n  Total: ${passed} passed, ${failed} failed`);
  
  if (passed > 0 && !dryRun) {
    console.log(`\n📁 Generated projects in:`);
    console.log(`   C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects\\`);
    console.log(`\n🚀 To view a project:`);
    console.log(`   cd generated-projects\\test-restaurant\\frontend`);
    console.log(`   npm install && npm run dev`);
  }
}

main().catch(console.error);
