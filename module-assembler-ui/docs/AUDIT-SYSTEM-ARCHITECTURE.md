# Blink Audit System Architecture

## Overview

The Blink Audit System provides pre-deployment validation to ensure generated websites work before deploying to production. This document describes the current implementation and planned future enhancements.

## Current Implementation (Phases 1A + 1B)

### Status: COMPLETE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CURRENT FLOW (v1.0)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

User Input → AI Generation → AUDIT 1 → Deploy (if passed) → Track Result
                                │
                                ├─ PASS → Continue to Railway
                                └─ FAIL → Block deploy, return errors
```

### Files Implemented

| File | Purpose |
|------|---------|
| `lib/services/audit-service.cjs` | Core audit functions |
| `database/db.cjs` | `trackBuildResult()`, fixed metadata merge |
| `server.cjs` | Integration at line ~1363 |
| `src/admin/AdminApp.jsx` | Status badges for build states |

### Database Status Flow

```
building → completed → build_passed → deployed
              │            │
              │            └─→ deploy_failed
              │
              └─→ build_failed (blocks deployment)
              │
              └─→ failed (code gen failed)
```

### Environment Variables

```bash
ENABLE_PRE_DEPLOY_AUDIT=true   # Default: enabled
```

---

## Future Architecture (Phases 3-6)

### Phase 3: Preview Environment

**Goal:** Let users see their site before deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PREVIEW ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         BLINK UI (Browser)          │
                    │  ┌───────────────────────────────┐  │
                    │  │      Preview Iframe           │  │
                    │  │  src="http://localhost:5180"  │  │
                    │  │                               │  │
                    │  │   [Generated Site Preview]   │  │
                    │  │                               │  │
                    │  └───────────────────────────────┘  │
                    │                                     │
                    │  [Edit Colors] [Edit Text] [Deploy] │
                    └─────────────────────────────────────┘
                                     │
                                     │ postMessage API
                                     ▼
                    ┌─────────────────────────────────────┐
                    │    Vite Dev Server (spawned)        │
                    │    Port: 5180-5199 (dynamic)        │
                    │    CWD: {projectPath}/frontend      │
                    │    HMR enabled for live updates     │
                    └─────────────────────────────────────┘
```

**New Files:**
```
lib/services/preview-service.cjs
├── startPreview(projectPath) → { port, pid }
├── stopPreview(pid)
├── getPreviewStatus(projectPath)
└── cleanupStalePreview()

lib/routes/preview.cjs (API endpoints)
├── POST /api/preview/start
├── POST /api/preview/stop
└── GET /api/preview/status/:generationId

src/components/PreviewFrame.jsx
├── Iframe wrapper with loading states
├── postMessage communication
└── Error boundary
```

**Database Additions:**
```sql
-- In generated_projects table (via metadata JSONB)
{
  "preview": {
    "port": 5180,
    "pid": 12345,
    "startedAt": "2024-01-18T12:00:00Z",
    "url": "http://localhost:5180"
  }
}
```

---

### Phase 4: Customization UI

**Goal:** Let users modify their site without coding

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CUSTOMIZATION LAYERS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 1: Theme Config (instant, no rebuild)                                  │
│ ─────────────────────────────────────────────                                │
│ Changes: Colors, fonts, spacing, border-radius                               │
│ Storage: theme.json → injected into theme.css                                │
│ Method: Update CSS variables, HMR instant refresh                            │
│ Audit: SKIP (CSS-only changes)                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Content Config (fast, minimal rebuild)                              │
│ ─────────────────────────────────────────────────                            │
│ Changes: Text, images, logo, business info                                   │
│ Storage: content.json → referenced by components                             │
│ Method: JSON update + Vite HMR (components read from config)                 │
│ Audit: AUDIT 2 (incremental, ~5-10s)                                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ LAYER 3: Structural Changes (slower, AI-assisted)                            │
│ ─────────────────────────────────────────────────                            │
│ Changes: Add sections, reorder pages, new components                         │
│ Storage: Direct JSX modification                                             │
│ Method: AI regenerates specific section                                      │
│ Audit: AUDIT 1 (full build, ~30-60s)                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Customization Data Structure:**
```javascript
// {projectPath}/customization.json
{
  "version": 1,
  "theme": {
    "colors": {
      "primary": "#8B4513",
      "secondary": "#D2691E",
      "accent": "#FFD700"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    },
    "borderRadius": "8px"
  },
  "content": {
    "businessName": "Aurelius Steakhouse",
    "tagline": "Fine Dining Excellence",
    "logo": "/uploads/logo.png",
    "heroImage": "/uploads/hero.jpg",
    "sections": {
      "hero": {
        "headline": "Welcome to Aurelius",
        "subheadline": "Experience culinary perfection"
      }
    }
  },
  "structure": {
    "pages": ["home", "menu", "about", "contact"],
    "components": {
      "home": ["hero", "features", "testimonials", "cta"]
    }
  }
}
```

**New Files:**
```
lib/services/customization-service.cjs
├── loadCustomization(projectPath)
├── saveCustomization(projectPath, changes)
├── applyThemeChanges(projectPath, theme)
├── applyContentChanges(projectPath, content)
└── regenerateSection(projectPath, sectionId, prompt)

lib/routes/customize.cjs (API endpoints)
├── GET /api/customize/:generationId
├── PATCH /api/customize/:generationId/theme
├── PATCH /api/customize/:generationId/content
├── POST /api/customize/:generationId/regenerate-section

src/components/CustomizationPanel.jsx
├── ColorPicker for theme colors
├── FontSelector for typography
├── ImageUploader for media
├── TextEditor for content
└── AIChat for structural changes
```

---

### Phase 5: AUDIT 2 Integration

**Goal:** Re-validate after customizations without full rebuild

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUDIT 2: POST-CUSTOMIZATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

                 ┌─────────────────────────────────────┐
                 │      User Makes Customization       │
                 └─────────────────────────────────────┘
                                   │
                                   ▼
                 ┌─────────────────────────────────────┐
                 │    Detect Change Type               │
                 │    ├─ Theme only? → Skip build     │
                 │    ├─ Content only? → Quick build  │
                 │    └─ Structure? → Full build      │
                 └─────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────┐  ┌───────────┐  ┌───────────┐
            │ Skip Audit│  │ AUDIT 2   │  │ AUDIT 1   │
            │ (instant) │  │ (5-10s)   │  │ (30-60s)  │
            └───────────┘  └───────────┘  └───────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                 ┌─────────────────────────────────────┐
                 │    Update Preview (HMR)             │
                 └─────────────────────────────────────┘
```

**Change Detection Logic:**
```javascript
// lib/services/audit-service.cjs (already implemented)

async function audit2PostCustomization(projectPath, options = {}) {
  // 1. Calculate current file hash
  const currentHash = calculateProjectHash(frontendPath);

  // 2. Compare with cached hash from AUDIT 1
  const cached = buildCache.get(projectPath);
  if (currentHash === cached?.hash) {
    return { success: true, skipped: true, reason: 'no_changes' };
  }

  // 3. Check if only CSS changed
  const cssOnlyChanged = await checkCssOnlyChanges(frontendPath, cached);
  if (cssOnlyChanged) {
    return { success: true, skipped: true, reason: 'css_only' };
  }

  // 4. Run incremental build (Vite cache makes it fast)
  return await runViteBuild(frontendPath, { timeout: 60000 });
}
```

---

### Phase 6: AUDIT 3 - Post-Deployment Validation

**Goal:** Verify deployed site actually works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUDIT 3: POST-DEPLOYMENT                                 │
└─────────────────────────────────────────────────────────────────────────────┘

           Railway Deploy Complete
                    │
                    ▼
    ┌───────────────────────────────────┐
    │  Wait for DNS propagation (30s)   │
    └───────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────────────────────────┐
    │                    AUDIT 3 CHECKS                                     │
    │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
    │  │ Frontend Check  │ │  Admin Check    │ │ Backend Check   │         │
    │  │ GET /           │ │ GET /           │ │ GET /api/health │         │
    │  │ Expect: 200     │ │ Expect: 200     │ │ Expect: 200     │         │
    │  │ SSL: ✓          │ │ SSL: ✓          │ │ SSL: ✓          │         │
    │  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
    │                                                                       │
    │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
    │  │ Response Time   │ │ Content Check   │ │ API Smoke Test  │         │
    │  │ < 5s            │ │ Has <title>     │ │ /api/brain: 200 │         │
    │  └─────────────────┘ └─────────────────┘ └─────────────────┘         │
    └───────────────────────────────────────────────────────────────────────┘
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ All Pass│ │ Partial │ │All Fail │
    │ ✅      │ │ ⚠️      │ │ ❌      │
    └─────────┘ └─────────┘ └─────────┘
         │          │          │
         ▼          ▼          ▼
    deployed    deployed    deploy_failed
    (healthy)   (warning)   (unhealthy)
```

**Implementation (already in audit-service.cjs):**
```javascript
async function audit3PostDeployment(urls, options = {}) {
  const checks = [
    { name: 'Frontend', url: urls.frontend, expectedStatus: 200 },
    { name: 'Admin', url: urls.admin, expectedStatus: 200 },
    { name: 'Backend Health', url: `${urls.backend}/api/health`, expectedStatus: 200 }
  ];

  // Run checks with retries (Railway can take time to stabilize)
  for (const check of checks) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(check.url);
      if (response.status === check.expectedStatus) break;
      await sleep(5000); // Wait 5s before retry
    }
  }

  return { success: allChecksPassed, checks };
}
```

---

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE BLINK USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: GENERATE
────────────────
User: "Create a luxury steakhouse website for Aurelius in Manhattan"
                    │
                    ▼
            ┌───────────────┐
            │ AI Generation │ ──────────────────────────────────────────────┐
            └───────────────┘                                               │
                    │                                                       │
                    ▼                                                       │
            ┌───────────────┐                                               │
            │   AUDIT 1     │ ← Full build validation                       │
            │   (30-60s)    │   Auto-fix known patterns                     │
            └───────────────┘   Block if unfixable                          │
                    │                                                       │
         ┌──────────┴──────────┐                                            │
         ▼                     ▼                                            │
    ✅ PASSED              ❌ FAILED                                        │
    Continue               Show errors                                      │
                           Allow retry                                      │
                                                                            │
STEP 2: PREVIEW & CUSTOMIZE (Phase 3-5)                                     │
───────────────────────────────────                                         │
                    │                                                       │
                    ▼                                                       │
    ┌───────────────────────────────────────────────────────────────────┐  │
    │                    PREVIEW ENVIRONMENT                            │  │
    │  ┌─────────────────────────────────────────────────────────────┐  │  │
    │  │  [Iframe: Live Site Preview at localhost:5180]              │  │  │
    │  │                                                              │  │  │
    │  │     AURELIUS STEAKHOUSE                                     │  │  │
    │  │     Fine Dining Excellence                                  │  │  │
    │  │                                                              │  │  │
    │  └─────────────────────────────────────────────────────────────┘  │  │
    │                                                                    │  │
    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │  │
    │  │ Theme Editor │ │Content Editor│ │  AI Chat     │              │  │
    │  │ Colors/Fonts │ │ Text/Images  │ │ "Add section"│              │  │
    │  └──────────────┘ └──────────────┘ └──────────────┘              │  │
    └───────────────────────────────────────────────────────────────────┘  │
                    │                                                       │
                    ▼                                                       │
            ┌───────────────┐                                               │
            │   AUDIT 2     │ ← Incremental validation                      │
            │   (5-10s)     │   Skip if CSS-only                            │
            └───────────────┘   Fast if JSX changed                         │
                    │                                                       │
                                                                            │
STEP 3: DEPLOY (Phase 6)                                                    │
───────────────────────                                                     │
                    │                                                       │
                    ▼                                                       │
    ┌───────────────────────────────────────────────────────────────────┐  │
    │                    FINAL REVIEW                                   │  │
    │                                                                    │  │
    │  Your site is ready to deploy:                                    │  │
    │  • aurelius.be1st.io (Frontend)                                   │  │
    │  • admin.aurelius.be1st.io (Admin Dashboard)                      │  │
    │                                                                    │  │
    │  [Cancel]                              [Deploy to Production →]  │  │
    └───────────────────────────────────────────────────────────────────┘  │
                    │                                                       │
                    ▼                                                       │
            ┌───────────────┐                                               │
            │ Railway Deploy│ ── GitHub Push                                │
            │    (60-120s)  │    Railway Services                           │
            └───────────────┘    Cloudflare DNS                             │
                    │                                                       │
                    ▼                                                       │
            ┌───────────────┐                                               │
            │   AUDIT 3     │ ← Post-deployment checks                      │
            │   (30s)       │   HTTP 200 on all endpoints                   │
            └───────────────┘   SSL verification                            │
                    │                                                       │
                    ▼                                                       │
            ┌───────────────────────────────────────────────────────────┐  │
            │                    SUCCESS!                               │  │
            │                                                            │  │
            │  🎉 Your site is LIVE at:                                 │  │
            │                                                            │  │
            │  Frontend: https://aurelius.be1st.io                      │  │
            │  Admin: https://admin.aurelius.be1st.io                   │  │
            │                                                            │  │
            │  [View Site]  [Open Admin]  [Generate Another]            │  │
            └───────────────────────────────────────────────────────────┘  │
```

---

## API Reference

### Audit Service Functions

```javascript
const auditService = require('./lib/services/audit-service.cjs');

// AUDIT 1: Post-generation full build
const result1 = await auditService.audit1PostGeneration(projectPath, {
  maxRetries: 2,
  timeout: 120000
});
// Returns: { success, errors, warnings, autoFixesApplied, durationMs }

// AUDIT 2: Post-customization incremental
const result2 = await auditService.audit2PostCustomization(projectPath, {
  timeout: 60000
});
// Returns: { success, skipped, reason, errors, durationMs }

// AUDIT 3: Post-deployment live checks
const result3 = await auditService.audit3PostDeployment({
  frontend: 'https://site.be1st.io',
  admin: 'https://admin.site.be1st.io',
  backend: 'https://api.site.be1st.io'
}, {
  retries: 3,
  retryDelay: 5000
});
// Returns: { success, checks[], durationMs }
```

### Database Functions

```javascript
const db = require('./database/db.cjs');

// Track build result (pass or fail)
await db.trackBuildResult(generationId, {
  success: true,
  auditType: 'audit1',
  durationMs: 45000,
  errors: [],
  warnings: [],
  autoFixesApplied: ['ICON_FIX']
});

// Update metadata (generic merge)
await db.updateProjectMetadata(projectId, {
  customKey: 'customValue'
});
```

---

## Error Patterns Reference

| Pattern | Example | Auto-Fixable | Category |
|---------|---------|--------------|----------|
| `IMPORT_NOT_FOUND` | `Could not resolve './Missing'` | Partial | import |
| `IMPORT_PATH_MISMATCH` | `from '../modules/'` | Yes | import |
| `UNTERMINATED_STRING` | `const x = "hello` | No | syntax |
| `UNEXPECTED_TOKEN` | `const = 5` | No | syntax |
| `JSX_UNCLOSED` | `<div>` without `</div>` | No | jsx |
| `MISSING_PROVIDER` | `useCart outside CartProvider` | Yes | react |
| `INVALID_ICON` | `Rifle from lucide-react` | Yes | icon |

---

## Configuration

### Environment Variables

```bash
# Enable/disable pre-deployment audit (default: true)
ENABLE_PRE_DEPLOY_AUDIT=true

# Build timeout in ms (default: 120000 = 2 min)
AUDIT_BUILD_TIMEOUT=120000

# Max auto-fix retries (default: 2)
AUDIT_MAX_RETRIES=2
```

### Feature Flags (Future)

```bash
# Phase 3: Preview environment
ENABLE_PREVIEW_MODE=true

# Phase 4: Customization UI
ENABLE_CUSTOMIZATION=true

# Phase 6: Post-deploy validation
ENABLE_AUDIT_3=true
```

---

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1A | ✅ Complete | Fix metadata merge bug |
| 1B | ✅ Complete | Build validator core |
| 2 | 🔲 Planned | Error pattern matching + display |
| 3 | 🔲 Planned | Preview environment |
| 4 | 🔲 Planned | Customization UI |
| 5 | 🔲 Planned | AUDIT 2 integration |
| 6 | 🔲 Planned | AUDIT 3 post-deploy checks |
