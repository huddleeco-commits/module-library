/**
 * Apps API Routes
 * Handles generation of focused applications (Expense Tracker, Habit Tracker, etc.)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { generateApp, APP_GENERATORS } = require('../generators/styled-app-generator.cjs');

// ============================================
// GENERATE APP
// ============================================
router.post('/generate', async (req, res) => {
  try {
    const { templateId, config, branding } = req.body;

    console.log('[apps.cjs] Generate request:', { templateId, config, branding });

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID required'
      });
    }

    // Validate template exists
    if (!APP_GENERATORS[templateId]) {
      return res.status(400).json({
        success: false,
        error: `Unknown app template: ${templateId}`,
        availableTemplates: Object.keys(APP_GENERATORS)
      });
    }

    // Merge branding into config for the generator
    const fullConfig = {
      ...config,
      branding: branding || config?.branding
    };

    console.log('[apps.cjs] Full config for generator:', fullConfig);

    // Generate the app HTML
    const html = generateApp(templateId, fullConfig);

    // Create output directory for apps
    const outputDir = path.join(__dirname, '../../output/apps');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const appName = config?.appName || templateId;
    const sanitizedName = appName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const timestamp = Date.now();
    const filename = `${sanitizedName}-${timestamp}.html`;
    const filepath = path.join(outputDir, filename);

    // Write the HTML file
    fs.writeFileSync(filepath, html);

    // Return success with file info
    res.json({
      success: true,
      project: {
        name: appName,
        path: filepath,
        filename: filename,
        type: 'app',
        template: templateId,
        downloadUrl: `/api/apps/download/${filename}`,
        previewUrl: `/api/apps/preview/${filename}`
      },
      html: html
    });

  } catch (error) {
    console.error('App generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate app'
    });
  }
});

// ============================================
// LIST TEMPLATES
// ============================================
router.get('/templates', (req, res) => {
  const templates = Object.keys(APP_GENERATORS).map(id => ({
    id,
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }));

  res.json({
    success: true,
    templates
  });
});

// ============================================
// DOWNLOAD APP
// ============================================
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(__dirname, '../../output/apps', sanitizedFilename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.download(filepath, sanitizedFilename);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// ============================================
// PREVIEW APP
// ============================================
router.get('/preview/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(__dirname, '../../output/apps', sanitizedFilename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const html = fs.readFileSync(filepath, 'utf8');
    res.type('html').send(html);

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview file'
    });
  }
});

// ============================================
// AI-POWERED APP GENERATION (Phase 2)
// ============================================
router.post('/generate-ai', async (req, res) => {
  const startTime = Date.now();

  try {
    const { description, preferences } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a detailed app description (at least 20 characters)'
      });
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'AI service not configured. Please set ANTHROPIC_API_KEY.'
      });
    }

    // Import and initialize Anthropic client
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const { deviceTarget = 'both', theme = 'dark', primaryColor = '#8b5cf6', style = 'modern' } = preferences || {};

    // Build the prompt - emphasizing visual creativity and design excellence
    const systemPrompt = `You are a SENIOR UI/UX DESIGNER and expert web developer. You create STUNNING, UNIQUE single-file HTML applications that look like premium products, not generic templates.

═══════════════════════════════════════════════════════════════════════════════
CRITICAL: BE A DESIGNER, NOT JUST A CODER
═══════════════════════════════════════════════════════════════════════════════

Each app you create should have its own VISUAL IDENTITY. A pet tracker should FEEL completely different from an expense tracker. Don't follow templates - CREATE unique designs.

TECHNICAL REQUIREMENTS:
1. Output ONLY the complete HTML code - no explanations, no markdown
2. Single HTML file with embedded CSS in <style> and JavaScript in <script>
3. localStorage for data persistence
4. Hash-based routing (window.location.hash) for views
5. Chart.js CDN for visualizations: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
6. Mobile responsive

⚠️ CRITICAL: CHART.JS SIZING (prevents infinite height):
- ALWAYS wrap canvas in a div with EXPLICIT height:
  <div style="position:relative; height:300px; max-height:40vh;">
    <canvas id="myChart"></canvas>
  </div>
- Set Chart.js options: { responsive: true, maintainAspectRatio: false }
- NEVER put charts in flex containers without height constraints
- For multiple charts, use CSS Grid with fixed row heights:
  display: grid; grid-template-rows: 300px 300px; gap: 20px;
- Charts in scrollable areas need overflow:hidden on parent

═══════════════════════════════════════════════════════════════════════════════
DESIGN EXCELLENCE - Make it look PREMIUM
═══════════════════════════════════════════════════════════════════════════════

VISUAL CREATIVITY:
- Create a UNIQUE layout that fits this specific app's purpose
- Use creative asymmetric layouts, not boring centered boxes
- Design custom card styles - don't use generic rectangles
- Add visual hierarchy with varied sizes, weights, and spacing
- Use color strategically - gradients, overlays, accent highlights
- Include decorative elements: subtle patterns, shapes, icons

MODERN UI PATTERNS:
- Dashboard cards with depth: box-shadow, subtle borders, hover lift effects
- Smooth CSS transitions (0.2-0.3s) on ALL interactive elements
- Micro-animations: button press effects, checkmark animations, slide-ins
- Creative data visualizations - not just basic charts
- Interesting navigation: bottom nav bar, floating action buttons, icon tabs
- Beautiful empty states with CSS illustrations or large emoji + helpful text
- Loading spinners, success checkmarks, error shakes
- Glassmorphism effects where appropriate (backdrop-filter: blur)

SPACING & TYPOGRAPHY:
- Generous whitespace - let elements breathe
- Clear visual hierarchy with font sizes (2rem headings, 1rem body, 0.8rem captions)
- Font weights that create contrast (700 for headings, 400 for body, 600 for labels)
- Line heights for readability (1.5-1.6 for body text)

═══════════════════════════════════════════════════════════════════════════════
APP PERSONALITY - Match the design to the purpose
═══════════════════════════════════════════════════════════════════════════════

Give the app a PERSONALITY through design:

🐾 PET/ANIMAL APPS: Playful, warm, friendly
   - Extra rounded corners (20px+), soft shadows
   - Warm colors (oranges, soft greens, cream)
   - Animal emoji as icons, paw print patterns
   - Bouncy hover animations

💰 FINANCE/MONEY APPS: Professional, trustworthy, clean
   - Sharp corners (8px), precise alignment
   - Trust colors (deep blues, greens, slate grays)
   - Clean number formatting, subtle grids
   - Smooth, professional transitions

💪 FITNESS/HEALTH APPS: Energetic, bold, motivating
   - Strong gradients, high contrast
   - Bold typography, large numbers for stats
   - Progress rings, streak flames, achievement badges
   - Energetic colors (oranges, cyans, magentas)

📚 LEARNING/NOTES APPS: Calm, focused, studious
   - Soft colors, cream/warm whites
   - Serif or rounded fonts, book-like feel
   - Card-based layouts, gentle animations
   - Bookmark and highlight accents

🎮 FUN/GAMES APPS: Vibrant, playful, engaging
   - Bright gradients, emoji everywhere
   - Bouncy animations, confetti effects
   - Bold rounded shapes, high energy
   - Game-like feedback (points, levels, sounds)

🏠 LIFESTYLE/HOME APPS: Cozy, organized, warm
   - Soft neutrals, wood/plant accents
   - Rounded corners, subtle textures
   - Icon-based navigation, clean lists
   - Comfortable, homey feeling

═══════════════════════════════════════════════════════════════════════════════
CSS TECHNIQUES TO USE
═══════════════════════════════════════════════════════════════════════════════

GRADIENTS:
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
background: linear-gradient(to right, ${primaryColor}, ${primaryColor}99);

SHADOWS & DEPTH:
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
box-shadow: 0 0 0 3px ${primaryColor}20; /* focus rings */

GLASSMORPHISM:
background: rgba(255,255,255,0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255,255,255,0.2);

HOVER EFFECTS:
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(0,0,0,0.15);
filter: brightness(1.1);

ANIMATIONS:
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
animation: fadeIn 0.3s ease-out;

INTERACTIVE STATES:
.btn:active { transform: scale(0.98); }
.card:hover { transform: translateY(-4px); box-shadow: ...; }
input:focus { border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}20; }

═══════════════════════════════════════════════════════════════════════════════
🌟 PREMIUM FEATURES - Push the Frontier
═══════════════════════════════════════════════════════════════════════════════

INCLUDE THESE PREMIUM TECHNIQUES:

1. GLASSMORPHISM (use sparingly for cards/modals):
   background: rgba(255, 255, 255, 0.1);
   backdrop-filter: blur(12px);
   -webkit-backdrop-filter: blur(12px);
   border: 1px solid rgba(255, 255, 255, 0.18);

2. GRADIENT MESH BACKGROUNDS:
   background:
     radial-gradient(at 40% 20%, ${primaryColor}40 0px, transparent 50%),
     radial-gradient(at 80% 0%, #764ba240 0px, transparent 50%),
     radial-gradient(at 0% 50%, #06b6d440 0px, transparent 50%);

3. 60FPS ANIMATIONS (use will-change for smooth performance):
   .animate { will-change: transform, opacity; }
   @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
   @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

4. MICRO-INTERACTIONS:
   - Button press: transform: scale(0.95); transition: transform 0.1s;
   - Input focus glow: box-shadow: 0 0 0 4px ${primaryColor}30, 0 0 20px ${primaryColor}20;
   - Checkbox check: @keyframes checkmark { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
   - Toggle switch with smooth slide animation
   - Ripple effect on click (CSS only with :active pseudo-element)

5. ANIMATED EMPTY STATES:
   - Floating illustration with @keyframes float
   - Pulsing call-to-action button
   - Subtle particle or star animation in background

6. SKELETON LOADING STATES:
   .skeleton {
     background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
     background-size: 200% 100%;
     animation: shimmer 1.5s infinite;
   }

7. PULL-TO-REFRESH VISUAL (for mobile):
   - Rotating spinner icon at top
   - "Pull to refresh" text that changes to "Release to refresh"
   - Smooth elastic bounce animation

8. CELEBRATION ANIMATIONS:
   @keyframes confetti {
     0% { transform: translateY(0) rotate(0); opacity: 1; }
     100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
   }
   - Trigger on milestones (completing a habit, saving first item, etc.)
   - Use multiple colored particles with staggered delays

9. 3D CARD TRANSFORMS:
   .card-3d {
     transform-style: preserve-3d;
     transition: transform 0.3s;
   }
   .card-3d:hover {
     transform: perspective(1000px) rotateX(5deg) rotateY(-5deg) scale(1.02);
   }

10. SMOOTH DARK/LIGHT MODE TOGGLE:
    :root { transition: background-color 0.3s, color 0.3s; }
    - Add a toggle button with sun/moon icons
    - Store preference in localStorage
    - Animate the toggle icon rotation

11. CUSTOM STYLED SCROLLBARS:
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    ::-webkit-scrollbar-thumb {
      background: ${primaryColor}50;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover { background: ${primaryColor}; }

12. PWA META TAGS (make it installable):
    <meta name="theme-color" content="${primaryColor}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="manifest" href="data:application/json,{...}"> (inline manifest)

13. HAPTIC-STYLE FEEDBACK:
    - Subtle scale bounce on important actions: transform: scale(1.05); then back
    - Quick vibration-like shake for errors: @keyframes shake { 10%, 90% { transform: translateX(-1px); } ... }
    - Success pulse: @keyframes success { 0% { box-shadow: 0 0 0 0 ${primaryColor}40; } 100% { box-shadow: 0 0 0 20px transparent; } }

14. SMOOTH NUMBER ANIMATIONS:
    - CountUp effect for statistics using CSS or minimal JS
    - Progress bars that animate on scroll into view

15. SMART SHADOWS (elevation system):
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);
    --shadow-glow: 0 0 40px ${primaryColor}30;

═══════════════════════════════════════════════════════════════════════════════
THEME & STYLE
═══════════════════════════════════════════════════════════════════════════════

THEME: ${theme}
PRIMARY COLOR: ${primaryColor}
STYLE: ${style}

${theme === 'dark' ? `
DARK THEME - Rich, immersive, modern
--bg: #0f0f14 or creative dark gradients
--card-bg: rgba(255,255,255,0.03) to rgba(255,255,255,0.08)
--border: rgba(255,255,255,0.08) to rgba(255,255,255,0.15)
--text: #fff
--text-muted: rgba(255,255,255,0.6)
Use glowing accents, subtle light effects on dark backgrounds
` : theme === 'light' ? `
LIGHT THEME - Clean, airy, professional
--bg: #f8fafc or soft gradients
--card-bg: #ffffff with subtle shadows
--border: #e2e8f0
--text: #1e293b
--text-muted: #64748b
Use depth through shadows, not just borders
` : `
AUTO THEME: Use @media (prefers-color-scheme) for both themes with smooth variables
`}

STYLE "${style}":
${style === 'modern' ? '- Clean lines, strategic shadows, gradient accents, rounded corners (12-16px), floating elements' : ''}
${style === 'playful' ? '- Bouncy animations, rounded everything (20px+), bright colors, emoji icons, fun hover effects' : ''}
${style === 'minimal' ? '- Maximum whitespace, subtle interactions, focus on typography and content, refined details' : ''}
${style === 'professional' ? '- Precise alignment, sophisticated colors, sharp corners (4-8px), subtle animations, business-appropriate' : ''}

═══════════════════════════════════════════════════════════════════════════════
REQUIRED VIEWS & FUNCTIONALITY
═══════════════════════════════════════════════════════════════════════════════

Every app needs:
- CREATIVE header/branding (not just centered text - try gradients, icons, taglines)
- INTERESTING navigation (tabs, bottom bar, sidebar - pick what fits)
- BEAUTIFUL empty states (not just "No items" - add illustrations, helpful tips)
- POLISHED forms with focus states, validation feedback, submit animations
- DATA VIEWS with cards, lists, or grids - make them visually interesting
- STATS/DASHBOARD with creative visualizations
- SETTINGS with clean organization
- All data in localStorage
- Export to CSV/JSON where appropriate
- Success/error feedback with style

═══════════════════════════════════════════════════════════════════════════════
DEVICE TARGET: ${deviceTarget.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════

${deviceTarget === 'mobile' ? `
📱 MOBILE-FIRST DESIGN - Optimized for phones, works on desktop

NAVIGATION:
- Bottom navigation bar (fixed at bottom, 60-70px height)
- Large touch targets (min 44x44px for buttons and links)
- Hamburger menu for secondary options (slide from left)
- Floating action button (FAB) for primary action (bottom right corner)

LAYOUT:
- Single column layout (max-width: 100vw)
- Full-width cards with minimal padding (16px)
- Stacked form fields (never side-by-side)
- Modal dialogs that slide up from bottom
- Pull-to-refresh visual pattern

INTERACTIONS:
- Swipe gestures where appropriate (delete on swipe)
- Large, thumb-friendly buttons
- No hover effects (use :active instead)
- Touch-friendly inputs (larger font size in inputs: 16px+ to prevent zoom)

MEDIA QUERIES:
@media (min-width: 768px) {
  /* Desktop adjustments - still works but mobile is priority */
  .container { max-width: 600px; margin: 0 auto; }
}
` : deviceTarget === 'desktop' ? `
🖥️ DESKTOP-FIRST DESIGN - Optimized for desktop, responsive to mobile

NAVIGATION:
- Sidebar navigation (left side, 240-280px wide)
- Or horizontal top navigation bar with dropdown menus
- Keyboard shortcuts for power users (display in tooltips)
- Breadcrumbs for deep navigation

LAYOUT:
- Multi-column layouts (use CSS Grid or Flexbox)
- Side-by-side cards and content sections
- Forms with labels beside inputs (horizontal forms)
- Fixed sidebar with scrollable main content
- Wider max-width (1200px container)

INTERACTIONS:
- Hover effects on all interactive elements
- Tooltips for additional info
- Right-click context menus where useful
- Keyboard navigation (Tab order, Enter to submit)
- Drag and drop for reordering

MEDIA QUERIES:
@media (max-width: 768px) {
  /* Mobile fallback - collapse sidebar to hamburger */
  .sidebar { display: none; }
  .main { width: 100%; }
}
` : `
📱🖥️ FULLY RESPONSIVE - Equal priority for mobile and desktop

NAVIGATION:
- Responsive navigation that transforms:
  - Desktop: horizontal top nav or sidebar
  - Tablet: collapsible sidebar
  - Mobile: bottom nav bar or hamburger menu
- Use CSS to show/hide appropriate nav for screen size

LAYOUT:
- CSS Grid with responsive columns:
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
- Cards that stack on mobile, grid on desktop
- Flexible containers that adapt to viewport
- Consider both thumb-friendly and mouse-friendly interactions

BREAKPOINTS:
@media (max-width: 480px) { /* Mobile phones */ }
@media (min-width: 481px) and (max-width: 768px) { /* Tablets */ }
@media (min-width: 769px) and (max-width: 1024px) { /* Small desktops */ }
@media (min-width: 1025px) { /* Large desktops */ }

HYBRID INTERACTIONS:
- Include both hover (desktop) and touch (mobile) states
- @media (hover: hover) { /* hover-capable devices only */ }
- Ensure touch targets are large enough (44px) while keeping desktop compact
`}

═══════════════════════════════════════════════════════════════════════════════
📱 PWA - Make it Installable (REQUIRED)
═══════════════════════════════════════════════════════════════════════════════

INCLUDE THESE PWA FEATURES IN EVERY APP:

1. PWA META TAGS (in <head>):
   <meta name="theme-color" content="${primaryColor}">
   <meta name="mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   <meta name="apple-mobile-web-app-title" content="APP_NAME_HERE">

2. INLINE WEB MANIFEST (as script):
   <script>
   (function() {
     const manifest = {
       name: document.title,
       short_name: document.title,
       start_url: location.href.split('#')[0],
       display: 'standalone',
       background_color: '#0f0f14',
       theme_color: '${primaryColor}'
     };
     const link = document.createElement('link');
     link.rel = 'manifest';
     link.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest));
     document.head.appendChild(link);
   })();
   </script>

3. INSTALL PROMPT (for mobile):
   - Show fixed banner at bottom when on mobile and not installed
   - Check: window.matchMedia('(display-mode: standalone)').matches
   - Allow dismissal, store in localStorage
   - Show platform-specific instructions (iOS: "Tap Share > Add to Home Screen")

═══════════════════════════════════════════════════════════════════════════════
💾 DATA PERSISTENCE - localStorage (REQUIRED)
═══════════════════════════════════════════════════════════════════════════════

1. AUTO-SAVE PATTERN:
   const STORAGE_KEY = 'appname_data';
   let appData = { items: [], settings: {} };

   function saveData() {
     localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
     showSaveIndicator();
   }

   function loadData() {
     const saved = localStorage.getItem(STORAGE_KEY);
     if (saved) { try { appData = JSON.parse(saved); } catch(e) {} }
   }

2. SAVE INDICATOR (show on every save):
   <div id="save-indicator" style="position:fixed;bottom:20px;right:20px;background:#10b981;color:#fff;padding:8px 16px;border-radius:8px;opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:9999;">✓ Saved</div>

   function showSaveIndicator() {
     const el = document.getElementById('save-indicator');
     el.style.opacity = '1';
     setTimeout(() => el.style.opacity = '0', 1500);
   }

3. SETTINGS VIEW MUST INCLUDE:
   - Export Data: Download appData as JSON file
   - Import Data: File input to restore from JSON
   - Storage Usage: Show "Using X KB of 5MB"
   - Clear All: Confirm dialog, then clear and reload

4. EXPORT FUNCTION:
   function exportData() {
     const blob = new Blob([JSON.stringify(appData, null, 2)], {type: 'application/json'});
     const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
     a.download = document.title.replace(/\\s+/g,'-').toLowerCase() + '-backup.json';
     a.click();
   }

5. IMPORT FUNCTION:
   function importData(file) {
     const reader = new FileReader();
     reader.onload = (e) => {
       try { appData = JSON.parse(e.target.result); saveData(); location.reload(); }
       catch(err) { alert('Invalid backup file'); }
     };
     reader.readAsText(file);
   }

═══════════════════════════════════════════════════════════════════════════════
✅ VERIFICATION CHECKLIST (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

Before outputting, ensure:

□ saveData() called after EVERY data change (add, edit, delete)
□ loadData() called in DOMContentLoaded
□ Data persists after page refresh
□ Every button has a working onclick handler
□ Every form has submit handling with preventDefault
□ Navigation uses hash routing with hashchange listener
□ Empty states show helpful message + call-to-action
□ Settings has Export, Import, Storage Usage, Clear All
□ "✓ Saved" indicator appears after saves
□ Install banner shows on mobile (not in standalone mode)
□ ALL CHARTS have container with explicit height (300px or max-height:40vh)
□ Chart.js options include: { responsive: true, maintainAspectRatio: false }
□ No infinite scrolling - page has reasonable fixed height sections`;

    const userPrompt = `Create this app: ${description.trim()}

Remember: Output ONLY the raw HTML code. No markdown formatting, no code blocks, no explanations.
Start with <!DOCTYPE html> and end with </html>.`;

    console.log('[AI App Builder] Generating PREMIUM app...');
    console.log('[AI App Builder] Description:', description.substring(0, 100) + '...');

    // Use Claude Sonnet for premium quality output
    // Cost: ~$0.05-0.15 per generation (worth it for the quality)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
      ]
    });

    let html = response.content[0].text;

    // Clean up any markdown formatting that might have slipped through
    html = html.replace(/^```html?\n?/g, '').replace(/\n?```$/g, '').trim();

    // Validate the HTML
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
      // Try to wrap it if it's just the body content
      if (html.includes('<body>') || html.includes('<div')) {
        html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My App</title>\n</head>\n${html}\n</html>`;
      } else {
        return res.status(500).json({
          success: false,
          error: 'AI generated invalid HTML. Please try again with a more specific description.'
        });
      }
    }

    // Extract app name from title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const appName = titleMatch ? titleMatch[1] : 'Custom App';

    // Calculate usage with actual cost
    // Anthropic Sonnet pricing: $3/1M input, $15/1M output
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const inputCost = (inputTokens / 1_000_000) * 3.00;
    const outputCost = (outputTokens / 1_000_000) * 15.00;
    const totalCost = inputCost + outputCost;

    const usage = {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: totalCost,
      costFormatted: totalCost < 0.01 ? `$${totalCost.toFixed(4)}` : `$${totalCost.toFixed(3)}`,
      durationMs: Date.now() - startTime
    };

    // Save the generated app
    const outputDir = path.join(__dirname, '../../output/apps');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const sanitizedName = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-app';
    const filename = `ai-${sanitizedName}-${Date.now()}.html`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, html);

    console.log('[AI App Builder] Generated:', filename);
    console.log('[AI App Builder] Tokens:', usage.totalTokens, `(${usage.inputTokens} in, ${usage.outputTokens} out)`);
    console.log('[AI App Builder] Cost:', usage.costFormatted);
    console.log('[AI App Builder] Duration:', usage.durationMs + 'ms');

    res.json({
      success: true,
      html,
      appName,
      project: {
        name: appName,
        path: filepath,
        filename,
        type: 'ai-app',
        downloadUrl: `/api/apps/download/${filename}`,
        previewUrl: `/api/apps/preview/${filename}`
      },
      usage
    });

  } catch (error) {
    console.error('[AI App Builder] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate app with AI'
    });
  }
});

// ============================================
// ADVANCED APP GENERATION (Full Stack Projects)
// Uses parallel API calls for faster generation
// ============================================
router.post('/generate-advanced', async (req, res) => {
  const startTime = Date.now();

  // Set up SSE for streaming progress
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (step, status, completed = false) => {
    res.write(`data: ${JSON.stringify({ type: 'progress', step, status, completed })}\n\n`);
  };

  const sendComplete = (data) => {
    res.write(`data: ${JSON.stringify({ type: 'complete', ...data })}\n\n`);
    res.end();
  };

  const sendError = (error) => {
    res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
    res.end();
  };

  try {
    const { templateId, config } = req.body;

    console.log('[Advanced Apps] Starting parallel generation:', { templateId, config });

    if (!templateId) {
      return sendError('Template ID required');
    }

    if (!config?.businessName?.trim()) {
      return sendError('Business name is required');
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return sendError('AI service not configured. Please set ANTHROPIC_API_KEY.');
    }

    // Import dependencies
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const archiver = require('archiver');
    const client = new Anthropic({ apiKey });

    // Create output directory for advanced apps
    const projectName = config.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'loyalty-program';
    const timestamp = Date.now();
    const projectDir = path.join(__dirname, '../../output/advanced', `${projectName}-${timestamp}`);

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // ═══════════════════════════════════════════════════════════════
    // SHARED GENERATION RULES (applied to all prompts)
    // ═══════════════════════════════════════════════════════════════
    const GENERATION_RULES = `OUTPUT FORMAT: Return ONLY this JSON structure (no markdown, no explanation):
{"files":[{"path":"filename.js","content":"file content here"}]}

CRITICAL JSON RULES:
- Escape ALL quotes inside strings: \\"
- Escape ALL newlines: \\n
- Escape ALL backslashes: \\\\
- NO trailing commas
- Keep code CONCISE - minimal comments, no verbose error handling

CODE RULES:
- .jsx: Valid React only. NO <script> tags. Use className.
- .css: Plain CSS only. NO @import, NO @tailwind.
- server.js: CommonJS require(), NOT import.
- DATABASE: Use pg library with process.env.DATABASE_URL. All queries are ASYNC.`;

    // ═══════════════════════════════════════════════════════════════
    // TEMPLATE-SPECIFIC PROMPTS
    // ═══════════════════════════════════════════════════════════════
    let backendPrompt, frontendCorePrompt, components1Prompt, components2aPrompt, components2bPrompt, components2cPrompt;
    // Note: databasePrompt removed - database is now 100% templated (schema.sql + db.js)
    let configTemplates = [];

    if (templateId === 'appointment-booking') {
      // ═══════════════════════════════════════════════════════════════
      // APPOINTMENT BOOKING SYSTEM PROMPTS
      // ═══════════════════════════════════════════════════════════════
      const servicesJson = JSON.stringify(config.services || [], null, 2);
      const staffJson = JSON.stringify(config.staff || [], null, 2);
      const hoursJson = JSON.stringify(config.businessHours || {}, null, 2);
      const settingsJson = JSON.stringify(config.bookingSettings || {}, null, 2);

      // Hash the admin password at generation time (if provided)
      const adminEmail = config.adminEmail || `admin@${projectName}.com`;
      const adminPasswordHash = config.adminPassword
        ? bcrypt.hashSync(config.adminPassword, 10)
        : bcrypt.hashSync('admin123', 10);

      configTemplates = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            version: '1.0.0',
            description: `${config.businessName} - Online Appointment Booking System`,
            scripts: {
              dev: 'concurrently "node server.js" "vite"',
              build: 'vite build',
              start: 'node server.js',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              express: '^4.18.2',
              pg: '^8.11.3',
              bcryptjs: '^2.4.3',
              jsonwebtoken: '^9.0.2',
              cors: '^2.8.5',
              helmet: '^7.1.0',
              dotenv: '^16.4.5',
              uuid: '^9.0.1',
              nodemailer: '^6.9.8'
            },
            devDependencies: {
              vite: '^5.4.0',
              '@vitejs/plugin-react': '^4.2.1',
              concurrently: '^8.2.2'
            }
          }, null, 2)
        },
        {
          path: '.env.example',
          content: `PORT=3000\nDATABASE_URL=postgresql://user:password@localhost:5432/dbname\nJWT_SECRET=change-this-to-a-secure-random-string\nADMIN_EMAIL=admin@${projectName}.com\nSMTP_HOST=smtp.example.com\nSMTP_USER=\nSMTP_PASS=`
        },
        {
          path: 'vite.config.js',
          content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  build: { outDir: 'dist' },\n  server: {\n    proxy: {\n      '/api': 'http://localhost:3000'\n    }\n  }\n});`
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n  <meta name="theme-color" content="${config.primaryColor || '#8b5cf6'}">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <title>${config.businessName} - Book Online</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <link rel="manifest" href="/manifest.json">\n</head>\n<body class="bg-slate-900 min-h-screen">\n  <div id="root"></div>\n  <script type="module" src="/src/index.jsx"></script>\n</body>\n</html>`
        },
        {
          path: 'public/manifest.json',
          content: JSON.stringify({
            name: `${config.businessName} Booking`,
            short_name: config.businessName,
            start_url: '/',
            display: 'standalone',
            background_color: '#1a1a2e',
            theme_color: config.primaryColor || '#8b5cf6',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }, null, 2)
        },
        {
          path: 'Dockerfile',
          content: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]`
        },
        {
          path: 'docker-compose.yml',
          content: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - NODE_ENV=production`
        },
        {
          path: 'README.md',
          content: `# ${config.businessName} - Online Booking\n\nProfessional appointment booking system.\n\n## Quick Start\n\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpm run dev\n\`\`\`\n\nOpen http://localhost:5173\n\n## Features\n- 📅 Online 24/7 booking\n- 👥 Staff scheduling\n- 📱 Mobile-first PWA\n- 📧 Email confirmations\n- 👑 Admin dashboard\n- 📊 Analytics\n\n## Services\n${(config.services || []).map(s => `- ${s.name}: ${s.duration}min - $${s.price}`).join('\\n')}`
        },
        {
          path: 'database/db.js',
          content: `const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
    return true;
  } catch (err) {
    console.error('DB init error:', err.message);
    return false;
  }
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// Service functions
async function getServices() {
  const res = await query('SELECT * FROM services WHERE active = true ORDER BY name');
  return res.rows;
}

async function getStaff() {
  const res = await query('SELECT * FROM staff WHERE active = true ORDER BY name');
  return res.rows;
}

async function getAvailableSlots(serviceId, staffId, date) {
  // Get service duration
  const svc = await query('SELECT duration FROM services WHERE id = $1', [serviceId]);
  const duration = svc.rows[0]?.duration || 30;

  // Get existing bookings for that day
  const bookings = await query(
    'SELECT start_time, end_time FROM bookings WHERE staff_id = $1 AND date = $2 AND status != $3',
    [staffId, date, 'cancelled']
  );

  // Generate available slots (9am-5pm, excluding booked)
  const slots = [];
  const bookedTimes = bookings.rows.map(b => b.start_time);
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += duration) {
      const time = \`\${hour.toString().padStart(2,'0')}:\${min.toString().padStart(2,'0')}\`;
      if (!bookedTimes.includes(time)) slots.push(time);
    }
  }
  return slots;
}

async function createBooking(data) {
  const res = await query(
    \`INSERT INTO bookings (user_id, service_id, staff_id, date, start_time, end_time, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *\`,
    [data.userId, data.serviceId, data.staffId, data.date, data.startTime, data.endTime, 'confirmed', data.notes || '']
  );
  return res.rows[0];
}

async function getBookings(userId) {
  const res = await query(
    \`SELECT b.*, s.name as service_name, st.name as staff_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     WHERE b.user_id = $1 ORDER BY b.date DESC, b.start_time DESC\`,
    [userId]
  );
  return res.rows;
}

async function cancelBooking(bookingId, userId) {
  const res = await query(
    'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    ['cancelled', bookingId, userId]
  );
  return res.rows[0];
}

module.exports = { pool, query, initDB, getServices, getStaff, getAvailableSlots, createBooking, getBookings, cancelBooking };
`
        },
        {
          path: 'database/schema.sql',
          content: `-- Appointment Booking Schema for ${config.businessName}
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(100),
  bio TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_services (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '17:00',
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(day_of_week)
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);

-- Insert default business hours (Mon-Fri 9-5, Sat 10-4, Sun closed)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '09:00', '17:00', true),
  (1, '09:00', '17:00', false),
  (2, '09:00', '17:00', false),
  (3, '09:00', '17:00', false),
  (4, '09:00', '17:00', false),
  (5, '09:00', '17:00', false),
  (6, '10:00', '16:00', false)
ON CONFLICT (day_of_week) DO NOTHING;

-- Insert services
${(config.services || []).map((s, i) => `INSERT INTO services (name, duration, price, description) VALUES ('${s.name.replace(/'/g, "''")}', ${s.duration || 30}, ${s.price || 0}, '${(s.description || '').replace(/'/g, "''")}') ON CONFLICT DO NOTHING;`).join('\n')}

-- Insert staff
${(config.staff || []).map((s, i) => `INSERT INTO staff (name, email, role) VALUES ('${s.name.replace(/'/g, "''")}', '${(s.email || `staff${i+1}@example.com`).replace(/'/g, "''")}', '${(s.role || 'Staff').replace(/'/g, "''")}') ON CONFLICT DO NOTHING;`).join('\n')}

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES ('${adminEmail.replace(/'/g, "''")}', '${adminPasswordHash}', 'Admin', 'admin') ON CONFLICT (email) DO NOTHING;
`
        },
        {
          path: 'src/index.jsx',
          content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
`
        },
        {
          path: 'src/index.css',
          content: `/* iOS Design System - Premium Native Feel */
:root {
  /* iOS Color System */
  --ios-blue: #007AFF;
  --ios-green: #34C759;
  --ios-orange: #FF9500;
  --ios-red: #FF3B30;
  --ios-purple: #AF52DE;
  --ios-pink: #FF2D55;
  --ios-teal: #5AC8FA;
  --ios-yellow: #FFCC00;

  /* iOS Gray Scale */
  --ios-gray1: #8E8E93;
  --ios-gray2: #636366;
  --ios-gray3: #48484A;
  --ios-gray4: #3A3A3C;
  --ios-gray5: #2C2C2E;
  --ios-gray6: #1C1C1E;

  /* iOS Semantic Colors */
  --ios-bg: #000000;
  --ios-bg-elevated: #1C1C1E;
  --ios-bg-grouped: #000000;
  --ios-separator: rgba(84, 84, 88, 0.65);
  --ios-label: #FFFFFF;
  --ios-label-secondary: rgba(235, 235, 245, 0.6);
  --ios-label-tertiary: rgba(235, 235, 245, 0.3);

  /* Primary brand color */
  --brand-color: ${config.primaryColor || '#007AFF'};

  /* iOS Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);

  /* iOS Blur */
  --blur-regular: saturate(180%) blur(20px);
  --blur-prominent: saturate(200%) blur(30px);

  /* iOS Timing */
  --timing-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --timing-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --timing-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  /* Safe Areas */
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);

  /* iOS Layout */
  --nav-height: 44px;
  --tab-bar-height: 83px;
  --large-title-height: 52px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 17px;
  line-height: 1.47059;
  letter-spacing: -0.022em;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--ios-bg);
  color: var(--ios-label);
  padding-top: var(--safe-top);
  padding-bottom: calc(var(--tab-bar-height) + var(--safe-bottom));
  overflow-x: hidden;
  overscroll-behavior-y: contain;
}

/* iOS Navigation Bar */
.ios-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: var(--safe-top);
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: var(--blur-regular);
  -webkit-backdrop-filter: var(--blur-regular);
  border-bottom: 0.5px solid var(--ios-separator);
}

.ios-nav-content {
  height: var(--nav-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.ios-nav-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  flex: 1;
}

.ios-large-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 0.37px;
  padding: 0 16px 8px;
}

/* iOS Tab Bar */
.ios-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: calc(var(--tab-bar-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: rgba(18, 18, 18, 0.88);
  backdrop-filter: var(--blur-prominent);
  -webkit-backdrop-filter: var(--blur-prominent);
  border-top: 0.5px solid var(--ios-separator);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 8px;
}

.ios-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  color: var(--ios-gray1);
  text-decoration: none;
  transition: color var(--timing-fast);
  -webkit-tap-highlight-color: transparent;
  min-width: 64px;
}

.ios-tab-item.active { color: var(--brand-color); }
.ios-tab-icon { font-size: 24px; height: 28px; display: flex; align-items: center; }
.ios-tab-label { font-size: 10px; font-weight: 500; }

/* iOS Cards */
.ios-card {
  background: var(--ios-bg-elevated);
  border-radius: 12px;
  overflow: hidden;
  margin: 8px 16px;
}

.ios-card-grouped {
  background: var(--ios-bg-elevated);
  border-radius: 10px;
  margin: 0 16px;
}

/* iOS List Rows */
.ios-list { background: var(--ios-bg-elevated); border-radius: 10px; margin: 0 16px; overflow: hidden; }
.ios-list-inset { margin: 8px 16px; }

.ios-row {
  display: flex;
  align-items: center;
  padding: 11px 16px;
  min-height: 44px;
  background: var(--ios-bg-elevated);
  transition: background var(--timing-fast);
  -webkit-tap-highlight-color: transparent;
}

.ios-row:active { background: var(--ios-gray5); }
.ios-row + .ios-row { border-top: 0.5px solid var(--ios-separator); margin-left: 16px; padding-left: 0; }

.ios-row-icon { width: 29px; height: 29px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 17px; }
.ios-row-content { flex: 1; min-width: 0; }
.ios-row-title { font-size: 17px; color: var(--ios-label); }
.ios-row-subtitle { font-size: 15px; color: var(--ios-label-secondary); margin-top: 2px; }
.ios-row-value { font-size: 17px; color: var(--ios-label-secondary); margin-right: 4px; }
.ios-row-chevron { color: var(--ios-gray3); font-size: 14px; font-weight: 600; }

/* iOS Buttons */
.ios-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform var(--timing-fast), opacity var(--timing-fast);
  -webkit-tap-highlight-color: transparent;
}

.ios-btn:active { transform: scale(0.97); opacity: 0.8; }
.ios-btn-primary { background: var(--brand-color); color: white; width: 100%; }
.ios-btn-secondary { background: rgba(120, 120, 128, 0.24); color: var(--brand-color); }
.ios-btn-text { background: transparent; color: var(--brand-color); min-height: 44px; padding: 0 8px; }
.ios-btn-destructive { background: var(--ios-red); color: white; }

/* iOS Form Controls */
.ios-input-group { margin: 0 16px 12px; }
.ios-label { font-size: 13px; color: var(--ios-label-secondary); text-transform: uppercase; letter-spacing: -0.08px; padding: 0 16px 6px; }

.ios-input {
  width: 100%;
  padding: 11px 16px;
  font-size: 17px;
  color: var(--ios-label);
  background: var(--ios-bg-elevated);
  border: none;
  border-radius: 10px;
  outline: none;
  -webkit-appearance: none;
}

.ios-input::placeholder { color: var(--ios-label-tertiary); }
.ios-input:focus { box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.3); }

/* iOS Toggle */
.ios-toggle {
  width: 51px;
  height: 31px;
  background: rgba(120, 120, 128, 0.32);
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background var(--timing-fast);
}

.ios-toggle.active { background: var(--ios-green); }
.ios-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  background: white;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  transition: transform var(--timing-fast);
}
.ios-toggle.active::after { transform: translateX(20px); }

/* iOS Segmented Control */
.ios-segmented {
  display: flex;
  background: rgba(118, 118, 128, 0.24);
  border-radius: 9px;
  padding: 2px;
  margin: 0 16px;
}

.ios-segment {
  flex: 1;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  color: var(--ios-label);
  border-radius: 7px;
  transition: all var(--timing-fast);
  cursor: pointer;
}

.ios-segment.active {
  background: rgba(60, 60, 67, 0.56);
  box-shadow: var(--shadow-sm);
}

/* iOS Modal Sheet */
.ios-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  opacity: 0;
  transition: opacity var(--timing-normal);
  pointer-events: none;
}

.ios-sheet-backdrop.active { opacity: 1; pointer-events: auto; }

.ios-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background: var(--ios-bg-elevated);
  border-radius: 12px 12px 0 0;
  max-height: 90vh;
  transform: translateY(100%);
  transition: transform var(--timing-normal);
}

.ios-sheet.active { transform: translateY(0); }
.ios-sheet-handle { width: 36px; height: 5px; background: var(--ios-gray3); border-radius: 2.5px; margin: 6px auto 0; }
.ios-sheet-header { padding: 16px; text-align: center; border-bottom: 0.5px solid var(--ios-separator); }
.ios-sheet-title { font-size: 17px; font-weight: 600; }
.ios-sheet-content { padding: 16px; padding-bottom: calc(16px + var(--safe-bottom)); overflow-y: auto; }

/* iOS Animations */
@keyframes ios-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ios-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ios-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes ios-slide-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

.ios-fade-in { animation: ios-fade-in var(--timing-normal) ease-out; }
.ios-slide-up { animation: ios-slide-up var(--timing-normal) ease-out; }
.ios-scale-in { animation: ios-scale-in var(--timing-fast) ease-out; }
.ios-slide-right { animation: ios-slide-in-right var(--timing-normal) ease-out; }

/* iOS Loading Spinner */
.ios-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--ios-gray4);
  border-top-color: var(--ios-label);
  border-radius: 50%;
  animation: ios-spin 0.8s linear infinite;
}

@keyframes ios-spin { to { transform: rotate(360deg); } }

/* iOS Pull to Refresh */
.ios-pull-indicator {
  display: flex;
  justify-content: center;
  padding: 16px;
  color: var(--ios-label-secondary);
}

/* iOS Badge */
.ios-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--ios-red);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* iOS Section Header */
.ios-section-header {
  font-size: 13px;
  font-weight: 400;
  color: var(--ios-label-secondary);
  text-transform: uppercase;
  letter-spacing: -0.08px;
  padding: 16px 16px 8px;
}

/* Utility Classes */
.container { max-width: 428px; margin: 0 auto; }
.page-content { padding-top: calc(var(--nav-height) + var(--safe-top) + 16px); }
.text-primary { color: var(--brand-color); }
.text-secondary { color: var(--ios-label-secondary); }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.p-4 { padding: 16px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-3 { gap: 12px; }
`
        },
        {
          path: 'src/context/AuthContext.jsx',
          content: `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Server error: ' + res.status };
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid response from server' };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`
        },
        {
          path: 'src/utils/dateUtils.js',
          content: `export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const formatTime = (time) => { const [h, m] = time.split(':'); const hour = parseInt(h); return (hour > 12 ? hour - 12 : hour) + ':' + m + (hour >= 12 ? ' PM' : ' AM'); };
export const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();
export const isFutureDate = (date) => new Date(date) >= new Date(new Date().toDateString());
export const getWeekDays = (startDate = new Date()) => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};
export const formatDateISO = (date) => new Date(date).toISOString().split('T')[0];
`
        },
        {
          path: 'src/components/Login.jsx',
          content: `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error: ' + (err.message || 'Please try again'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
`
        },
        {
          path: 'src/components/Register.jsx',
          content: `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, phone });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              autoComplete="tel"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
`
        }
      ];

      const servicesList = (config.services || []).map((s, i) => `${i+1}. ${s.name} (${s.duration}min, $${s.price})`).join(', ');
      const staffList = (config.staff || []).map(s => s.name).join(', ');

      backendPrompt = `${GENERATION_RULES}

TASK: Generate backend for appointment booking system.
Business: "${config.businessName}"
Services: ${servicesList}
Staff: ${staffList}

DO NOT generate database/db.js or database/schema.sql - they are pre-templated.

FILES TO GENERATE (only these files, nothing else):
{"files":[
  {"path":"server.js","content":"require('dotenv').config(); const db = require('./database/db'); const express = require('express'); const cors = require('cors'); const helmet = require('helmet'); const app = express(); app.use(helmet({ contentSecurityPolicy: false })); app.use(cors()); app.use(express.json()); const path = require('path'); if (process.env.NODE_ENV === 'production') { app.use(express.static('dist')); } else { app.use(express.static('public')); } app.use('/api/auth', require('./routes/auth')); app.use('/api/bookings', require('./routes/bookings')); app.use('/api/services', require('./routes/services')); app.use('/api/staff', require('./routes/staff')); app.use('/api/admin', require('./routes/admin')); app.get('*', (req, res) => { if (!req.path.startsWith('/api')) { res.sendFile(path.join(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'public', 'index.html')); } }); app.use((err, req, res, next) => { console.error('Server error:', err); res.status(500).json({ error: 'Internal server error' }); }); const PORT = process.env.PORT || 3000; db.initDB().then(() => { app.listen(PORT, () => console.log('Server running on port ' + PORT)); }).catch(err => { console.error('Failed to init DB:', err); process.exit(1); });"},
  {"path":"routes/auth.js","content":"const express = require('express'); const router = express.Router(); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken'); const db = require('../database/db'); router.post('/register', async (req, res) => { try { const { email, password, name, phone } = req.body; if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required' }); if (password.length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' }); const hash = await bcrypt.hash(password, 10); const result = await db.query('INSERT INTO users (email, password, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone', [email, hash, name, phone || null]); const user = result.rows[0]; const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret'); res.json({ token, user }); } catch (err) { console.error('Register error:', err.message); if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' }); res.status(500).json({ error: 'Registration failed: ' + err.message }); } }); router.post('/login', async (req, res) => { try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ error: 'Email and password required' }); const result = await db.query('SELECT * FROM users WHERE email = $1', [email]); if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' }); const user = result.rows[0]; const valid = await bcrypt.compare(password, user.password); if (!valid) return res.status(400).json({ error: 'Invalid email or password' }); const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret'); const { password: _, ...safeUser } = user; res.json({ token, user: safeUser }); } catch (err) { console.error('Login error:', err.message); res.status(500).json({ error: 'Login failed: ' + err.message }); } }); router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => { try { const result = await db.query('SELECT id, email, name, phone, role FROM users WHERE id = $1', [req.userId]); if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' }); res.json({ user: result.rows[0] }); } catch (err) { console.error('Get user error:', err.message); res.status(500).json({ error: err.message }); } }); module.exports = router;"},
  {"path":"routes/bookings.js","content":"Import db from ../database/db.js. GET /available-slots, POST /book, GET /my-bookings, POST /cancel/:id - all require auth, use db.query(), console.error on catch"},
  {"path":"routes/services.js","content":"Import db from ../database/db.js. GET /list, GET /:id - use db.query(), console.error on catch"},
  {"path":"routes/staff.js","content":"Import db from ../database/db.js. GET /list, GET /:id/availability - use db.query(), console.error on catch"},
  {"path":"routes/admin.js","content":"Import db from ../database/db.js. GET /bookings, POST /status, GET /calendar, GET /stats - all require admin, use db.query(), console.error on catch"},
  {"path":"middleware/auth.js","content":"const jwt = require('jsonwebtoken'); const verifyToken = (req, res, next) => { const auth = req.headers.authorization; if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' }); try { const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret'); req.userId = decoded.userId; next(); } catch (err) { res.status(401).json({ error: 'Invalid token' }); } }; const requireAdmin = async (req, res, next) => { const db = require('../database/db'); const result = await db.query('SELECT role FROM users WHERE id = $1', [req.userId]); if (result.rows[0]?.role !== 'admin') return res.status(403).json({ error: 'Admin required' }); next(); }; module.exports = { verifyToken, requireAdmin };"}
]}

ALL route handlers must be async/await. Slot duration: ${config.bookingSettings?.slotDuration || 30}min.`;

      frontendCorePrompt = `${GENERATION_RULES}

TASK: Generate App.jsx for booking app (1 file only - other core files are templated)
Business: "${config.businessName}" | Color: "${config.primaryColor || '#8b5cf6'}"

{"files":[{"path":"src/App.jsx","content":"..."}]}

App.jsx requirements:
- Import { useAuth } from './context/AuthContext'
- useState for currentPage: 'services' | 'date' | 'time' | 'confirm' | 'bookings' | 'login' | 'register'
- useState for selectedService, selectedDate, selectedStaff, selectedTime
- iOS-STYLE TAB BAR: Fixed bottom, 83px height, use className="ios-tab-bar", tabs have icon + label
- iOS NAV BAR: At top with large title, use className="ios-nav-bar", className="ios-nav-title-large"
- Safe area: padding-top for nav, padding-bottom: 83px for tab bar content clearance
- Booking flow: SelectService → SelectDate → SelectTime → Confirm
- Show Login/Register if !user, main app if user
- Use Tailwind + iOS classes from index.css (ios-card, ios-button, ios-button-primary)`;

      // databasePrompt removed - schema.sql is now templated in configTemplates

      components1Prompt = `${GENERATION_RULES}

TASK: Generate React components (batch 1) for booking app.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN SYSTEM - Use these classes from index.css:
- ios-tab-bar: Fixed bottom nav, 83px, blur backdrop
- ios-tab-item: Tab with icon + label (44px min touch)
- ios-card: 12px radius card with shadow
- ios-button-primary: Filled button with press scale
- ios-input: 44px height input field
- ios-list-row: Row with chevron icon

DO NOT generate Login.jsx or Register.jsx - they are pre-templated.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/BottomNav.jsx","content":"iOS tab bar: className='ios-tab-bar', 3 tabs (Book, Bookings, Profile), each tab is ios-tab-item with SVG icon + span label, active state"},
  {"path":"src/components/ServiceSelector.jsx","content":"Grid of ios-card items with checkmark for selected, 44px min tap targets"},
  {"path":"src/components/DatePicker.jsx","content":"Calendar in ios-card, month grid, selected date highlighted with primary color"}
]}

Each component: imports, function, JSX return, export default. Use Tailwind + iOS classes. ALL fetch calls MUST use JSON.stringify for body and 'Content-Type': 'application/json' header.`;

      components2aPrompt = `${GENERATION_RULES}

TASK: Generate React components (batch 2a) for booking app.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-card, ios-button-primary, ios-list-row classes. 44px min tap targets.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/TimeSlotPicker.jsx","content":"ios-card with grid of time slot buttons (ios-button), staff selector dropdown"},
  {"path":"src/components/BookingConfirm.jsx","content":"ios-card with booking summary rows, ios-button-primary confirm, ios-modal-sheet for success"}
]}

Keep components focused and concise. Use iOS classes from index.css.`;

      components2bPrompt = `${GENERATION_RULES}

TASK: Generate React component for booking app - customer bookings list.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-card, ios-list-row, ios-badge classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/MyBookings.jsx","content":"ios-card container, ios-list-row for each booking with chevron, ios-badge for status, swipe-to-cancel or cancel button"}
]}

Show: service name, date/time, ios-badge for status, staff. Cancel button for future bookings. Empty state.`;

      components2cPrompt = `${GENERATION_RULES}

TASK: Generate React admin components for booking app.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-card, ios-segmented-control, ios-list-row classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/AdminCalendar.jsx","content":"ios-card with week view grid, 7 columns (days), time slot rows, booking blocks highlighted"},
  {"path":"src/components/AdminPanel.jsx","content":"ios-segmented-control for tabs (Calendar, Bookings, Settings), ios-card sections"}
]}

AdminCalendar: 7 columns (days), time slot rows, booking blocks. AdminPanel: ios-segmented-control tabs, ios-card for content.`;

    } else if (templateId === 'admin-dashboard') {
      // ═══════════════════════════════════════════════════════════════
      // ADMIN DASHBOARD PROMPTS
      // ═══════════════════════════════════════════════════════════════
      const staffJson = JSON.stringify(config.staff || [], null, 2);
      const hoursJson = JSON.stringify(config.businessHours || {}, null, 2);
      const connectedAppsJson = JSON.stringify(config.connectedApps || {}, null, 2);
      const businessType = config.businessType || 'service';

      // Hash the admin password at generation time (if provided)
      const adminEmail = config.adminEmail || `admin@${projectName}.com`;
      const adminPasswordHash = config.adminPassword
        ? bcrypt.hashSync(config.adminPassword, 10)
        : bcrypt.hashSync('admin123', 10);

      configTemplates = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            version: '1.0.0',
            description: `${config.businessName} - Admin Dashboard`,
            scripts: {
              dev: 'concurrently "node server.js" "vite"',
              build: 'vite build',
              start: 'node server.js',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              express: '^4.18.2',
              pg: '^8.11.3',
              bcryptjs: '^2.4.3',
              jsonwebtoken: '^9.0.2',
              cors: '^2.8.5',
              helmet: '^7.1.0',
              dotenv: '^16.4.5',
              uuid: '^9.0.1',
              recharts: '^2.10.3'
            },
            devDependencies: {
              vite: '^5.4.0',
              '@vitejs/plugin-react': '^4.2.1',
              concurrently: '^8.2.2'
            }
          }, null, 2)
        },
        {
          path: '.env.example',
          content: `PORT=3000\nDATABASE_URL=postgresql://user:password@localhost:5432/dbname\nJWT_SECRET=change-this-to-a-secure-random-string\nADMIN_EMAIL=${config.staff?.[0]?.email || 'admin@example.com'}`
        },
        {
          path: 'vite.config.js',
          content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  build: { outDir: 'dist' },\n  server: {\n    proxy: {\n      '/api': 'http://localhost:3000'\n    }\n  }\n});`
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="theme-color" content="${config.primaryColor || '#8b5cf6'}">\n  <title>${config.businessName} - Admin Dashboard</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <link rel="manifest" href="/manifest.json">\n</head>\n<body class="bg-slate-900 text-white">\n  <div id="root"></div>\n  <script type="module" src="/src/index.jsx"></script>\n</body>\n</html>`
        },
        {
          path: 'public/manifest.json',
          content: JSON.stringify({
            name: `${config.businessName} Admin`,
            short_name: 'Admin',
            start_url: '/',
            display: 'standalone',
            background_color: '#0f172a',
            theme_color: config.primaryColor || '#8b5cf6',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }, null, 2)
        },
        {
          path: 'Dockerfile',
          content: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]`
        },
        {
          path: 'docker-compose.yml',
          content: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - NODE_ENV=production`
        },
        {
          path: 'README.md',
          content: `# ${config.businessName} - Admin Dashboard\n\nUniversal business command center.\n\n## Quick Start\n\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpm run dev\n\`\`\`\n\nOpen http://localhost:5173\n\n## Features\n- 🎛️ Command center with quick stats\n- 👥 Customer management & CRM\n- 📊 Analytics & reporting\n- 🔔 Notifications & alerts\n- 🔗 App integrations\n- ⚙️ Staff & settings management\n\n## Connected Apps\n${Object.entries(config.connectedApps || {}).filter(([,v]) => v).map(([k]) => `- ${k}`).join('\\n') || 'None configured'}`
        },
        {
          path: 'database/db.js',
          content: `const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
    return true;
  } catch (err) {
    console.error('DB init error:', err.message);
    return false;
  }
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// Staff functions
async function getStaff() {
  const res = await query('SELECT * FROM staff ORDER BY name');
  return res.rows;
}

async function getStaffById(id) {
  const res = await query('SELECT * FROM staff WHERE id = $1', [id]);
  return res.rows[0];
}

// Customer functions
async function getCustomers(limit = 50, offset = 0) {
  const res = await query('SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return res.rows;
}

async function searchCustomers(searchTerm) {
  const res = await query(
    'SELECT * FROM customers WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY name LIMIT 50',
    [\`%\${searchTerm}%\`]
  );
  return res.rows;
}

async function getCustomerById(id) {
  const res = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return res.rows[0];
}

// Activity functions
async function logActivity(data) {
  const res = await query(
    'INSERT INTO activity_log (staff_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.staffId, data.action, data.entityType, data.entityId, JSON.stringify(data.details || {})]
  );
  return res.rows[0];
}

async function getRecentActivity(limit = 20) {
  const res = await query(
    \`SELECT a.*, s.name as staff_name FROM activity_log a
     LEFT JOIN staff s ON a.staff_id = s.id
     ORDER BY a.created_at DESC LIMIT $1\`,
    [limit]
  );
  return res.rows;
}

// Notification functions
async function getNotifications(staffId) {
  const res = await query(
    'SELECT * FROM notifications WHERE (staff_id = $1 OR staff_id IS NULL) AND dismissed = false ORDER BY created_at DESC',
    [staffId]
  );
  return res.rows;
}

async function dismissNotification(id, staffId) {
  const res = await query(
    'UPDATE notifications SET dismissed = true WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
}

// Settings functions
async function getSettings() {
  const res = await query('SELECT * FROM settings LIMIT 1');
  return res.rows[0] || {};
}

async function updateSettings(settings) {
  const res = await query(
    'UPDATE settings SET business_name = $1, business_hours = $2, updated_at = NOW() WHERE id = 1 RETURNING *',
    [settings.businessName, JSON.stringify(settings.businessHours || {})]
  );
  return res.rows[0];
}

module.exports = { pool, query, initDB, getStaff, getStaffById, getCustomers, searchCustomers, getCustomerById, logActivity, getRecentActivity, getNotifications, dismissNotification, getSettings, updateSettings };
`
        },
        {
          path: 'database/schema.sql',
          content: `-- Admin Dashboard Schema for ${config.businessName}
-- PostgreSQL

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'staff',
  permissions JSONB DEFAULT '{}',
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(20) DEFAULT 'info',
  link VARCHAR(255),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) DEFAULT '${config.businessName.replace(/'/g, "''")}',
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  business_address TEXT,
  business_hours JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  currency VARCHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_staff ON activity_log(staff_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_staff ON notifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Insert default settings
INSERT INTO settings (business_name) VALUES ('${config.businessName.replace(/'/g, "''")}') ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO staff (email, password, name, role) VALUES ('${adminEmail.replace(/'/g, "''")}', '${adminPasswordHash}', 'Admin', 'owner') ON CONFLICT (email) DO NOTHING;

-- Insert staff members
${(config.staff || []).map((s, i) => `INSERT INTO staff (email, password, name, role) VALUES ('${(s.email || `${s.name.toLowerCase().replace(/\\s+/g, '')}@example.com`).replace(/'/g, "''")}', '${bcrypt.hashSync('staff123', 10)}', '${s.name.replace(/'/g, "''")}', '${(s.role || 'staff').toLowerCase().replace(/'/g, "''")}') ON CONFLICT (email) DO NOTHING;`).join('\n')}
`
        },
        {
          path: 'src/index.jsx',
          content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
`
        },
        {
          path: 'src/index.css',
          content: `/* iOS Design System - Admin Dashboard */
:root {
  --ios-blue: #007AFF;
  --ios-green: #34C759;
  --ios-orange: #FF9500;
  --ios-red: #FF3B30;
  --ios-purple: #AF52DE;
  --ios-gray1: #8E8E93;
  --ios-gray2: #636366;
  --ios-gray3: #48484A;
  --ios-gray4: #3A3A3C;
  --ios-gray5: #2C2C2E;
  --ios-gray6: #1C1C1E;
  --ios-bg: #000000;
  --ios-bg-elevated: #1C1C1E;
  --ios-separator: rgba(84, 84, 88, 0.65);
  --ios-label: #FFFFFF;
  --ios-label-secondary: rgba(235, 235, 245, 0.6);
  --ios-label-tertiary: rgba(235, 235, 245, 0.3);
  --brand-color: ${config.primaryColor || '#007AFF'};
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --blur-regular: saturate(180%) blur(20px);
  --timing-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --timing-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --nav-height: 44px;
  --tab-bar-height: 83px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; -webkit-font-smoothing: antialiased; font-size: 17px; line-height: 1.47; }
body { min-height: 100vh; min-height: 100dvh; background: var(--ios-bg); color: var(--ios-label); padding-top: var(--safe-top); padding-bottom: calc(var(--tab-bar-height) + var(--safe-bottom)); overflow-x: hidden; }

.ios-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding-top: var(--safe-top); background: rgba(0,0,0,0.72); backdrop-filter: var(--blur-regular); -webkit-backdrop-filter: var(--blur-regular); border-bottom: 0.5px solid var(--ios-separator); }
.ios-nav-content { height: var(--nav-height); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.ios-nav-title { font-size: 17px; font-weight: 600; text-align: center; flex: 1; }
.ios-large-title { font-size: 34px; font-weight: 700; padding: 0 16px 8px; }

.ios-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: calc(var(--tab-bar-height) + var(--safe-bottom)); padding-bottom: var(--safe-bottom); background: rgba(18,18,18,0.88); backdrop-filter: saturate(200%) blur(30px); -webkit-backdrop-filter: saturate(200%) blur(30px); border-top: 0.5px solid var(--ios-separator); display: flex; justify-content: space-around; align-items: flex-start; padding-top: 8px; }
.ios-tab-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 12px; color: var(--ios-gray1); text-decoration: none; transition: color var(--timing-fast); -webkit-tap-highlight-color: transparent; min-width: 64px; }
.ios-tab-item.active { color: var(--brand-color); }
.ios-tab-icon { font-size: 24px; height: 28px; display: flex; align-items: center; }
.ios-tab-label { font-size: 10px; font-weight: 500; }

.ios-card { background: var(--ios-bg-elevated); border-radius: 12px; overflow: hidden; margin: 8px 16px; }
.ios-list { background: var(--ios-bg-elevated); border-radius: 10px; margin: 0 16px; overflow: hidden; }
.ios-row { display: flex; align-items: center; padding: 11px 16px; min-height: 44px; background: var(--ios-bg-elevated); transition: background var(--timing-fast); -webkit-tap-highlight-color: transparent; }
.ios-row:active { background: var(--ios-gray5); }
.ios-row + .ios-row { border-top: 0.5px solid var(--ios-separator); }
.ios-row-content { flex: 1; min-width: 0; }
.ios-row-title { font-size: 17px; color: var(--ios-label); }
.ios-row-subtitle { font-size: 15px; color: var(--ios-label-secondary); }
.ios-row-chevron { color: var(--ios-gray3); font-size: 14px; font-weight: 600; }

.ios-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 20px; border-radius: 12px; font-size: 17px; font-weight: 600; border: none; cursor: pointer; transition: transform var(--timing-fast), opacity var(--timing-fast); -webkit-tap-highlight-color: transparent; }
.ios-btn:active { transform: scale(0.97); opacity: 0.8; }
.ios-btn-primary { background: var(--brand-color); color: white; width: 100%; }
.ios-btn-secondary { background: rgba(120,120,128,0.24); color: var(--brand-color); }
.ios-btn-text { background: transparent; color: var(--brand-color); min-height: 44px; }
.ios-btn-destructive { background: var(--ios-red); color: white; }

.ios-input { width: 100%; padding: 11px 16px; font-size: 17px; color: var(--ios-label); background: var(--ios-bg-elevated); border: none; border-radius: 10px; outline: none; -webkit-appearance: none; }
.ios-input::placeholder { color: var(--ios-label-tertiary); }
.ios-input:focus { box-shadow: 0 0 0 4px rgba(0,122,255,0.3); }
.ios-label { font-size: 13px; color: var(--ios-label-secondary); text-transform: uppercase; padding: 0 16px 6px; }
.ios-section-header { font-size: 13px; color: var(--ios-label-secondary); text-transform: uppercase; padding: 16px 16px 8px; }

.ios-badge { min-width: 18px; height: 18px; padding: 0 5px; background: var(--ios-red); color: white; font-size: 13px; font-weight: 600; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; }
.ios-spinner { width: 20px; height: 20px; border: 2px solid var(--ios-gray4); border-top-color: var(--ios-label); border-radius: 50%; animation: ios-spin 0.8s linear infinite; }
@keyframes ios-spin { to { transform: rotate(360deg); } }
@keyframes ios-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.ios-slide-up { animation: ios-slide-up var(--timing-normal) ease-out; }

.container { max-width: 428px; margin: 0 auto; }
.page-content { padding-top: calc(var(--nav-height) + var(--safe-top) + 16px); }
.text-primary { color: var(--brand-color); }
.text-secondary { color: var(--ios-label-secondary); }
.mb-4 { margin-bottom: 16px; }
.p-4 { padding: 16px; }
`
        },
        {
          path: 'src/context/AuthContext.jsx',
          content: `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Server error: ' + res.status };
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid response from server' };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`
        },
        {
          path: 'src/utils/formatters.js',
          content: `export const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const formatDateTime = (date) => new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return formatDate(date);
};
export const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);
export const formatPercent = (num) => (num || 0).toFixed(1) + '%';
`
        },
        {
          path: 'src/components/Login.jsx',
          content: `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error: ' + (err.message || 'Please try again'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">${config.businessName}</h1>
        <p className="text-gray-600 mb-6">Admin Dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
`
        }
      ];

      const staffList = (config.staff || []).map(s => `${s.name} (${s.role})`).join(', ');
      const enabledApps = Object.entries(config.connectedApps || {}).filter(([,v]) => v).map(([k]) => k);

      backendPrompt = `${GENERATION_RULES}

TASK: Generate backend for admin dashboard.
Business: "${config.businessName}" | Type: "${businessType}"

DO NOT generate database/db.js or database/schema.sql - they are pre-templated.

FILES TO GENERATE (only these files, nothing else):
{"files":[
  {"path":"server.js","content":"require('dotenv').config(); const db = require('./database/db'); const express = require('express'); const cors = require('cors'); const helmet = require('helmet'); const app = express(); app.use(helmet({ contentSecurityPolicy: false })); app.use(cors()); app.use(express.json()); const path = require('path'); if (process.env.NODE_ENV === 'production') { app.use(express.static('dist')); } else { app.use(express.static('public')); } app.use('/api/auth', require('./routes/auth')); app.use('/api/customers', require('./routes/customers')); app.use('/api/analytics', require('./routes/analytics')); app.use('/api/activity', require('./routes/activity')); app.use('/api/notifications', require('./routes/notifications')); app.use('/api/settings', require('./routes/settings')); app.get('*', (req, res) => { if (!req.path.startsWith('/api')) { res.sendFile(path.join(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'public', 'index.html')); } }); app.use((err, req, res, next) => { console.error('Server error:', err); res.status(500).json({ error: 'Internal server error' }); }); const PORT = process.env.PORT || 3000; db.initDB().then(() => { app.listen(PORT, () => console.log('Server running on port ' + PORT)); }).catch(err => { console.error('Failed to init DB:', err); process.exit(1); });"},
  {"path":"routes/auth.js","content":"const express = require('express'); const router = express.Router(); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken'); const db = require('../database/db'); router.post('/login', async (req, res) => { try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ error: 'Email and password required' }); const result = await db.query('SELECT * FROM staff WHERE email = $1', [email]); if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' }); const user = result.rows[0]; const valid = await bcrypt.compare(password, user.password); if (!valid) return res.status(400).json({ error: 'Invalid email or password' }); const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret'); const { password: _, ...safeUser } = user; res.json({ token, user: safeUser }); } catch (err) { console.error('Login error:', err.message); res.status(500).json({ error: 'Login failed: ' + err.message }); } }); router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => { try { const result = await db.query('SELECT id, email, name, role FROM staff WHERE id = $1', [req.userId]); if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' }); res.json({ user: result.rows[0] }); } catch (err) { console.error('Get user error:', err.message); res.status(500).json({ error: err.message }); } }); module.exports = router;"},
  {"path":"routes/customers.js","content":"Import db from ../database/db.js. CRUD + search + export CSV - use db.query(), console.error on catch"},
  {"path":"routes/analytics.js","content":"Import db from ../database/db.js. GET /overview, /revenue, /top-customers - use db.query(), console.error on catch"},
  {"path":"routes/activity.js","content":"Import db from ../database/db.js. GET /recent, POST /log - use db.query(), console.error on catch"},
  {"path":"routes/notifications.js","content":"Import db from ../database/db.js. GET /list, POST /dismiss, /complete - use db.query(), console.error on catch"},
  {"path":"routes/settings.js","content":"Import db from ../database/db.js. Business profile + staff CRUD + hours - use db.query(), console.error on catch"},
  {"path":"middleware/auth.js","content":"const jwt = require('jsonwebtoken'); const verifyToken = (req, res, next) => { const auth = req.headers.authorization; if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' }); try { const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret'); req.userId = decoded.userId; req.userRole = decoded.role; next(); } catch (err) { res.status(401).json({ error: 'Invalid token' }); } }; const requireRole = (roles) => (req, res, next) => { if (!roles.includes(req.userRole)) return res.status(403).json({ error: 'Insufficient permissions' }); next(); }; module.exports = { verifyToken, requireRole };"}
]}

Staff roles: owner (all), manager (most), staff (limited). ALL route handlers must be async/await.`;

      frontendCorePrompt = `${GENERATION_RULES}

TASK: Generate App.jsx for admin dashboard (1 file only - other core files are templated)
Business: "${config.businessName}" | Color: "${config.primaryColor || '#8b5cf6'}"

{"files":[{"path":"src/App.jsx","content":"..."}]}

App.jsx requirements:
- Import { useAuth } from './context/AuthContext'
- Desktop layout: fixed Sidebar (240px left, ios-card style) + TopBar (ios-nav-bar, 60px) + Main content
- useState for currentPage: 'dashboard' | 'customers' | 'analytics' | 'settings'
- Sidebar: ios-card background, nav items with icons (ios-list-row style), business name at top
- TopBar: ios-nav-bar with ios-input search, notification icon, user avatar
- Show Login form (ios-card) if !user, dashboard if user
- Use Tailwind + iOS classes (ios-card, ios-button, ios-input)`;

      // databasePrompt removed - schema.sql is now templated in configTemplates

      components1Prompt = `${GENERATION_RULES}

TASK: Generate React components (batch 1) for admin dashboard.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN SYSTEM - Use these classes from index.css:
- ios-card: 12px radius card with shadow
- ios-nav-bar: Top bar with blur backdrop
- ios-list-row: Row with chevron icon, 44px min height
- ios-button-primary: Filled button with press scale
- ios-input: 44px height input field

DO NOT generate Login.jsx - it is pre-templated.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/Sidebar.jsx","content":"Fixed 240px sidebar, ios-card background, ios-list-row nav items with icons"},
  {"path":"src/components/TopBar.jsx","content":"Sticky ios-nav-bar with ios-input search, notification bell, avatar"},
  {"path":"src/components/Dashboard.jsx","content":"Main view: grid of StatCards, QuickActions, ActivityFeed"},
  {"path":"src/components/StatCard.jsx","content":"ios-card with icon, value, label - clean minimal style"},
  {"path":"src/components/QuickActions.jsx","content":"Grid of ios-button items with icons"}
]}

Sidebar nav: Dashboard, Customers, Analytics, Settings. Use iOS classes.`;

      components2aPrompt = `${GENERATION_RULES}

TASK: Generate React components (batch 2a) for admin dashboard.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-card, ios-list-row, ios-badge classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/ActivityFeed.jsx","content":"ios-card with ios-list-row items (icon + description + relative time)"},
  {"path":"src/components/AlertsList.jsx","content":"ios-card with alert rows, swipe-dismiss or X button, ios-badge for type"}
]}

ActivityFeed: ios-list-row items. AlertsList: dismissable with ios-button.`;

      components2bPrompt = `${GENERATION_RULES}

TASK: Generate React component for admin dashboard - customer modal.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-modal-sheet for slide-out, ios-card, ios-list-row, ios-button classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/CustomerModal.jsx","content":"ios-modal-sheet slide-out panel with ios-card sections, ios-list-row for details, ios-button actions"}
]}

Show: name, contact, stats in ios-card, notes section, ios-button for Add Points, Edit.`;

      components2cPrompt = `${GENERATION_RULES}

TASK: Generate React page components for admin dashboard.
Color: "${config.primaryColor || '#8b5cf6'}"

iOS DESIGN: Use ios-card, ios-input, ios-segmented-control, ios-list-row classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/CustomersPage.jsx","content":"ios-card with ios-input search, ios-list-row table rows, pagination buttons"},
  {"path":"src/components/AnalyticsPage.jsx","content":"ios-card containers for Recharts (LineChart, BarChart)"},
  {"path":"src/components/SettingsPage.jsx","content":"ios-segmented-control for tabs, ios-card sections, ios-input fields, ios-toggle switches"}
]}

CustomersPage: ios-list-row table. AnalyticsPage: ios-card chart containers. SettingsPage: ios-segmented-control tabs.`;

    } else {
      // ═══════════════════════════════════════════════════════════════
      // LOYALTY PROGRAM PROMPTS (existing)
      // ═══════════════════════════════════════════════════════════════
      const tiersJson = JSON.stringify(config.tiers, null, 2);
      const rewardsJson = JSON.stringify(config.rewards, null, 2);

      // Hash the admin password at generation time (if provided)
      const adminEmail = config.adminEmail || `admin@${projectName}.com`;
      const adminPasswordHash = config.adminPassword
        ? bcrypt.hashSync(config.adminPassword, 10)
        : bcrypt.hashSync('admin123', 10); // Fallback if no password provided

      configTemplates = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            version: '1.0.0',
            description: `${config.businessName} - Premium Loyalty & Rewards Program`,
            scripts: {
              dev: 'concurrently "node server.js" "vite"',
              build: 'vite build',
              start: 'node server.js',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              express: '^4.18.2',
              pg: '^8.11.3',
              bcrypt: '^5.1.1',
              bcryptjs: '^2.4.3',
              jsonwebtoken: '^9.0.2',
              cors: '^2.8.5',
              helmet: '^7.1.0',
              dotenv: '^16.4.5',
              qrcode: '^1.5.3',
              uuid: '^9.0.1'
            },
            devDependencies: {
              vite: '^5.4.0',
              '@vitejs/plugin-react': '^4.2.1',
              concurrently: '^8.2.2'
            }
          }, null, 2)
        },
        {
          path: '.env.example',
          content: `PORT=3000\nDATABASE_URL=postgresql://user:password@localhost:5432/dbname\nJWT_SECRET=change-this-to-a-secure-random-string\nADMIN_EMAIL=admin@${projectName}.com`
        },
        {
          path: 'vite.config.js',
          content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  build: { outDir: 'dist' },\n  server: {\n    proxy: {\n      '/api': 'http://localhost:3000'\n    }\n  }\n});`
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n  <meta name="theme-color" content="#1a1a2e">\n  <meta name="mobile-web-app-capable" content="yes">\n  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n  <title>${config.businessName} Rewards</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n  <link rel="manifest" href="/manifest.json">\n</head>\n<body class="bg-slate-900 min-h-screen">\n  <div id="root"></div>\n  <script type="module" src="/src/index.jsx"></script>\n</body>\n</html>`
        },
        {
          path: 'public/manifest.json',
          content: JSON.stringify({
            name: `${config.businessName} Rewards`,
            short_name: config.businessName,
            start_url: '/',
            display: 'standalone',
            background_color: '#1a1a2e',
            theme_color: '#8b5cf6',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }, null, 2)
        },
        {
          path: 'Dockerfile',
          content: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]`
        },
        {
          path: 'docker-compose.yml',
          content: `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - NODE_ENV=production`
        },
        {
          path: 'README.md',
          content: `# ${config.businessName} Rewards\n\nPremium loyalty program with ${config.currency} rewards system.\n\n## Quick Start\n\n\`\`\`bash\nnpm install\ncp .env.example .env\nnpm run dev\n\`\`\`\n\nOpen http://localhost:5173\n\n## Features\n- 🎯 ${config.currency.charAt(0).toUpperCase() + config.currency.slice(1)} earning & redemption\n- 🏆 Tier system: ${config.tiers.map(t => t.name).join(' → ')}\n- 🎁 Rewards catalog with ${config.rewards.length} rewards\n- 📱 Mobile-first PWA design\n- 🔐 Secure authentication\n- 👑 Admin dashboard\n- 📊 Analytics & reporting\n\n## Tier Benefits\n${config.tiers.map(t => `- **${t.name}**: ${t.multiplier}x ${config.currency} multiplier (${t.minPoints}+ ${config.currency})`).join('\\n')}`
        },
        {
          path: 'database/db.js',
          content: `const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database initialized');
    return true;
  } catch (err) {
    console.error('DB init error:', err.message);
    return false;
  }
}

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

// User functions
async function getUser(id) {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

async function createUser(data) {
  const res = await query(
    'INSERT INTO users (email, password_hash, name, points, tier) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.email, data.passwordHash, data.name, 0, 'Bronze']
  );
  return res.rows[0];
}

async function updateUserPoints(userId, points) {
  const res = await query(
    'UPDATE users SET points = points + $2 WHERE id = $1 RETURNING *',
    [userId, points]
  );
  return res.rows[0];
}

// Points functions
async function addPoints(userId, amount, reason) {
  // Add transaction
  await query(
    'INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, $3, $4)',
    [userId, amount, 'earn', reason]
  );
  // Update user balance
  const user = await updateUserPoints(userId, amount);
  // Check tier upgrade
  await updateTier(userId, user.points);
  return user;
}

async function spendPoints(userId, amount, reason) {
  // Check balance
  const user = await getUser(userId);
  if (user.points < amount) throw new Error('Insufficient points');
  // Add transaction
  await query(
    'INSERT INTO transactions (user_id, amount, type, reason) VALUES ($1, $2, $3, $4)',
    [userId, -amount, 'spend', reason]
  );
  return await updateUserPoints(userId, -amount);
}

async function getPointsHistory(userId, limit = 50) {
  const res = await query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return res.rows;
}

// Tier functions
async function updateTier(userId, points) {
  let tier = 'Bronze';
  if (points >= 5000) tier = 'Gold';
  else if (points >= 1000) tier = 'Silver';
  await query('UPDATE users SET tier = $2 WHERE id = $1', [userId, tier]);
}

// Rewards functions
async function getRewards() {
  const res = await query('SELECT * FROM rewards WHERE active = true ORDER BY cost');
  return res.rows;
}

async function redeemReward(userId, rewardId) {
  const reward = await query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
  if (!reward.rows[0]) throw new Error('Reward not found');

  const cost = reward.rows[0].cost;
  await spendPoints(userId, cost, \`Redeemed: \${reward.rows[0].name}\`);

  await query(
    'INSERT INTO redemptions (user_id, reward_id, cost) VALUES ($1, $2, $3)',
    [userId, rewardId, cost]
  );

  return reward.rows[0];
}

// Stats functions (admin)
async function getStats() {
  const users = await query('SELECT COUNT(*) as count, SUM(points) as total_points FROM users');
  const transactions = await query('SELECT COUNT(*) as count FROM transactions WHERE created_at > NOW() - INTERVAL \\'30 days\\'');
  const redemptions = await query('SELECT COUNT(*) as count FROM redemptions WHERE created_at > NOW() - INTERVAL \\'30 days\\'');
  return {
    totalUsers: parseInt(users.rows[0].count),
    totalPoints: parseInt(users.rows[0].total_points) || 0,
    transactionsThisMonth: parseInt(transactions.rows[0].count),
    redemptionsThisMonth: parseInt(redemptions.rows[0].count)
  };
}

async function getAllUsers(limit = 50, offset = 0) {
  const res = await query('SELECT id, email, name, points, tier, created_at FROM users ORDER BY points DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return res.rows;
}

module.exports = { pool, query, initDB, getUser, getUserByEmail, createUser, addPoints, spendPoints, getPointsHistory, getRewards, redeemReward, getStats, getAllUsers };
`
        },
        {
          path: 'database/schema.sql',
          content: `-- Loyalty Program Schema for ${config.businessName}
-- PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  points_balance INTEGER DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'Bronze',
  referral_code VARCHAR(20) UNIQUE,
  referred_by INTEGER REFERENCES users(id),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('earn', 'spend')),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(50),
  active BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT -1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_id INTEGER REFERENCES rewards(id) ON DELETE SET NULL,
  cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_referral ON users(referral_code);

-- Insert rewards
${(config.rewards || []).map((r, i) => `INSERT INTO rewards (name, description, cost, category) VALUES ('${r.name.replace(/'/g, "''")}', '${(r.description || '').replace(/'/g, "''")}', ${r.cost || r.pointsRequired || 100}, '${(r.category || 'General').replace(/'/g, "''")}') ON CONFLICT DO NOTHING;`).join('\n')}

-- Insert admin user (credentials set during generation)
INSERT INTO users (email, password, name, is_admin, referral_code) VALUES ('${adminEmail.replace(/'/g, "''")}', '${adminPasswordHash}', 'Admin', true, 'ADMIN001') ON CONFLICT (email) DO NOTHING;
`
        },
        {
          path: 'src/index.jsx',
          content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
`
        },
        {
          path: 'src/index.css',
          content: `/* iOS Design System - Loyalty Rewards */
:root {
  --ios-blue: #007AFF;
  --ios-green: #34C759;
  --ios-orange: #FF9500;
  --ios-red: #FF3B30;
  --ios-purple: #AF52DE;
  --ios-pink: #FF2D55;
  --ios-teal: #5AC8FA;
  --ios-yellow: #FFCC00;
  --ios-gray1: #8E8E93;
  --ios-gray2: #636366;
  --ios-gray3: #48484A;
  --ios-gray4: #3A3A3C;
  --ios-gray5: #2C2C2E;
  --ios-gray6: #1C1C1E;
  --ios-bg: #000000;
  --ios-bg-elevated: #1C1C1E;
  --ios-separator: rgba(84, 84, 88, 0.65);
  --ios-label: #FFFFFF;
  --ios-label-secondary: rgba(235, 235, 245, 0.6);
  --ios-label-tertiary: rgba(235, 235, 245, 0.3);
  --brand-color: ${config.primaryColor || '#AF52DE'};
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --blur-regular: saturate(180%) blur(20px);
  --blur-prominent: saturate(200%) blur(30px);
  --timing-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --timing-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --nav-height: 44px;
  --tab-bar-height: 83px;
  /* Tier Colors */
  --tier-bronze: #CD7F32;
  --tier-silver: #C0C0C0;
  --tier-gold: #FFD700;
  --tier-platinum: #E5E4E2;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif; -webkit-font-smoothing: antialiased; font-size: 17px; line-height: 1.47; letter-spacing: -0.022em; }
body { min-height: 100vh; min-height: 100dvh; background: var(--ios-bg); color: var(--ios-label); padding-top: var(--safe-top); padding-bottom: calc(var(--tab-bar-height) + var(--safe-bottom)); overflow-x: hidden; overscroll-behavior-y: contain; }

/* iOS Navigation */
.ios-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding-top: var(--safe-top); background: rgba(0, 0, 0, 0.72); backdrop-filter: var(--blur-regular); -webkit-backdrop-filter: var(--blur-regular); border-bottom: 0.5px solid var(--ios-separator); }
.ios-nav-content { height: var(--nav-height); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.ios-nav-title { font-size: 17px; font-weight: 600; text-align: center; flex: 1; }
.ios-large-title { font-size: 34px; font-weight: 700; letter-spacing: 0.37px; padding: 0 16px 8px; }

/* iOS Tab Bar */
.ios-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; height: calc(var(--tab-bar-height) + var(--safe-bottom)); padding-bottom: var(--safe-bottom); background: rgba(18, 18, 18, 0.88); backdrop-filter: var(--blur-prominent); -webkit-backdrop-filter: var(--blur-prominent); border-top: 0.5px solid var(--ios-separator); display: flex; justify-content: space-around; align-items: flex-start; padding-top: 8px; }
.ios-tab-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px 12px; color: var(--ios-gray1); text-decoration: none; transition: color var(--timing-fast); -webkit-tap-highlight-color: transparent; min-width: 64px; }
.ios-tab-item.active { color: var(--brand-color); }
.ios-tab-icon { font-size: 24px; height: 28px; display: flex; align-items: center; }
.ios-tab-label { font-size: 10px; font-weight: 500; }

/* iOS Components */
.ios-card { background: var(--ios-bg-elevated); border-radius: 12px; overflow: hidden; margin: 8px 16px; }
.ios-list { background: var(--ios-bg-elevated); border-radius: 10px; margin: 0 16px; overflow: hidden; }
.ios-row { display: flex; align-items: center; padding: 11px 16px; min-height: 44px; background: var(--ios-bg-elevated); transition: background var(--timing-fast); -webkit-tap-highlight-color: transparent; }
.ios-row:active { background: var(--ios-gray5); }
.ios-row + .ios-row { border-top: 0.5px solid var(--ios-separator); }
.ios-row-icon { width: 29px; height: 29px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 17px; }
.ios-row-content { flex: 1; min-width: 0; }
.ios-row-title { font-size: 17px; color: var(--ios-label); }
.ios-row-subtitle { font-size: 15px; color: var(--ios-label-secondary); }
.ios-row-value { font-size: 17px; color: var(--ios-label-secondary); margin-right: 4px; }
.ios-row-chevron { color: var(--ios-gray3); font-size: 14px; font-weight: 600; }

/* iOS Buttons */
.ios-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 50px; padding: 0 20px; border-radius: 12px; font-size: 17px; font-weight: 600; border: none; cursor: pointer; transition: transform var(--timing-fast), opacity var(--timing-fast); -webkit-tap-highlight-color: transparent; }
.ios-btn:active { transform: scale(0.97); opacity: 0.8; }
.ios-btn-primary { background: var(--brand-color); color: white; width: 100%; }
.ios-btn-secondary { background: rgba(120, 120, 128, 0.24); color: var(--brand-color); }
.ios-btn-text { background: transparent; color: var(--brand-color); min-height: 44px; padding: 0 8px; }

/* iOS Inputs */
.ios-input { width: 100%; padding: 11px 16px; font-size: 17px; color: var(--ios-label); background: var(--ios-bg-elevated); border: none; border-radius: 10px; outline: none; -webkit-appearance: none; }
.ios-input::placeholder { color: var(--ios-label-tertiary); }
.ios-input:focus { box-shadow: 0 0 0 4px rgba(175, 82, 222, 0.3); }
.ios-label { font-size: 13px; color: var(--ios-label-secondary); text-transform: uppercase; letter-spacing: -0.08px; padding: 0 16px 6px; }
.ios-section-header { font-size: 13px; color: var(--ios-label-secondary); text-transform: uppercase; padding: 16px 16px 8px; }

/* iOS Extras */
.ios-badge { min-width: 18px; height: 18px; padding: 0 5px; background: var(--ios-red); color: white; font-size: 13px; font-weight: 600; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; }
.ios-spinner { width: 20px; height: 20px; border: 2px solid var(--ios-gray4); border-top-color: var(--ios-label); border-radius: 50%; animation: ios-spin 0.8s linear infinite; }
@keyframes ios-spin { to { transform: rotate(360deg); } }
@keyframes ios-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ios-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes ios-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
.ios-slide-up { animation: ios-slide-up var(--timing-normal) ease-out; }
.ios-scale-in { animation: ios-scale-in var(--timing-fast) ease-out; }
.ios-pulse { animation: ios-pulse 2s ease-in-out infinite; }

/* Tier Colors */
.tier-bronze { color: var(--tier-bronze); }
.tier-silver { color: var(--tier-silver); }
.tier-gold { color: var(--tier-gold); }
.tier-platinum { color: var(--tier-platinum); }

/* Utility Classes */
.container { max-width: 428px; margin: 0 auto; }
.page-content { padding-top: calc(var(--nav-height) + var(--safe-top) + 16px); }
.text-primary { color: var(--brand-color); }
.text-secondary { color: var(--ios-label-secondary); }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.p-4 { padding: 16px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-3 { gap: 12px; }
`
        },
        {
          path: 'src/context/AuthContext.jsx',
          content: `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchUser(); }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Server error: ' + res.status };
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid response from server' };
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = () => fetchUser();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`
        },
        {
          path: 'src/utils/confetti.js',
          content: `export function triggerConfetti(duration = 2000) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  const startTime = Date.now();
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;
    const alpha = Math.max(0, 1 - elapsed / duration);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }
  animate();
}
`
        },
        {
          path: 'src/components/Login.jsx',
          content: `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error: ' + (err.message || 'Please try again'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
`
        },
        {
          path: 'src/components/Register.jsx',
          content: `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ name, email, password, referralCode });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
`
        }
      ];

      const currencyName = config.currency || 'points';
      const tierConfig = config.tiers.map(t => `${t.name}:${t.minPoints}:${t.multiplier}x`).join('|');
      const rewardConfig = config.rewards.map(r => `${r.name}:${r.cost}`).join('|');

      backendPrompt = `${GENERATION_RULES}

TASK: Generate backend for loyalty/rewards system.
Business: "${config.businessName}" | Currency: "${currencyName}"

DO NOT generate database/db.js or database/schema.sql - they are pre-templated.

FILES TO GENERATE (only these files, nothing else):
{"files":[
  {"path":"server.js","content":"require('dotenv').config(); const db = require('./database/db'); const express = require('express'); const cors = require('cors'); const helmet = require('helmet'); const app = express(); app.use(helmet({ contentSecurityPolicy: false })); app.use(cors()); app.use(express.json()); const path = require('path'); if (process.env.NODE_ENV === 'production') { app.use(express.static('dist')); } else { app.use(express.static('public')); } app.use('/api/auth', require('./routes/auth')); app.use('/api/points', require('./routes/points')); app.use('/api/rewards', require('./routes/rewards')); app.use('/api/admin', require('./routes/admin')); app.use('/api/qr', require('./routes/qr')); app.get('*', (req, res) => { if (!req.path.startsWith('/api')) { res.sendFile(path.join(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'public', 'index.html')); } }); app.use((err, req, res, next) => { console.error('Server error:', err); res.status(500).json({ error: 'Internal server error' }); }); const PORT = process.env.PORT || 3000; db.initDB().then(() => { app.listen(PORT, () => console.log('Server running on port ' + PORT)); }).catch(err => { console.error('Failed to init DB:', err); process.exit(1); });"},
  {"path":"routes/auth.js","content":"const express = require('express'); const router = express.Router(); const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken'); const db = require('../database/db'); router.post('/register', async (req, res) => { try { const { email, password, name } = req.body; if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name required' }); if (password.length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' }); const hash = await bcrypt.hash(password, 10); const result = await db.query('INSERT INTO users (email, password, name, points_balance, tier) VALUES ($1, $2, $3, 0, $4) RETURNING id, email, name, points_balance, tier', [email, hash, name, 'Bronze']); const user = result.rows[0]; const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret'); res.json({ token, user }); } catch (err) { console.error('Register error:', err.message); if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' }); res.status(500).json({ error: 'Registration failed: ' + err.message }); } }); router.post('/login', async (req, res) => { try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ error: 'Email and password required' }); const result = await db.query('SELECT * FROM users WHERE email = $1', [email]); if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' }); const user = result.rows[0]; const valid = await bcrypt.compare(password, user.password); if (!valid) return res.status(400).json({ error: 'Invalid email or password' }); const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret'); const { password: _, ...safeUser } = user; res.json({ token, user: safeUser }); } catch (err) { console.error('Login error:', err.message); res.status(500).json({ error: 'Login failed: ' + err.message }); } }); router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => { try { const result = await db.query('SELECT id, email, name, points_balance, tier, is_admin FROM users WHERE id = $1', [req.userId]); if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' }); res.json({ user: result.rows[0] }); } catch (err) { console.error('Get user error:', err.message); res.status(500).json({ error: err.message }); } }); module.exports = router;"},
  {"path":"routes/points.js","content":"Import db from ../database/db.js. GET /balance, /history, POST /earn, /spend - all require auth, use db.query(), console.error on catch"},
  {"path":"routes/rewards.js","content":"Import db from ../database/db.js. GET /list (public), POST /redeem/:id (require auth, check balance) - use db.query(), console.error on catch"},
  {"path":"routes/admin.js","content":"Import db from ../database/db.js. GET /customers, /stats, POST /:id/points - all require admin, use db.query(), console.error on catch"},
  {"path":"routes/qr.js","content":"Import db from ../database/db.js. GET /member/:id - return QR code as image using qrcode package, POST /scan - verify member, use db.query(), console.error on catch"},
  {"path":"middleware/auth.js","content":"const jwt = require('jsonwebtoken'); const verifyToken = (req, res, next) => { const auth = req.headers.authorization; if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' }); try { const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET || 'dev-secret'); req.userId = decoded.userId; next(); } catch (err) { res.status(401).json({ error: 'Invalid token' }); } }; const requireAdmin = async (req, res, next) => { const db = require('../database/db'); const result = await db.query('SELECT is_admin FROM users WHERE id = $1', [req.userId]); if (!result.rows[0]?.is_admin) return res.status(403).json({ error: 'Admin required' }); next(); }; module.exports = { verifyToken, requireAdmin };"}
]}

Tiers: ${tierConfig}. ALL route handlers must be async/await. Use qrcode package for QR generation.`;

      frontendCorePrompt = `${GENERATION_RULES}

TASK: Generate App.jsx for loyalty app (1 file only - other core files are templated)
Business: "${config.businessName}" | Currency: "${currencyName}"

{"files":[{"path":"src/App.jsx","content":"..."}]}

App.jsx requirements:
- Import { useAuth } from './context/AuthContext'
- iOS-STYLE TAB BAR: className="ios-tab-bar", 4 tabs (Home, Rewards, Card, Profile), each ios-tab-item with icon + label
- iOS NAV BAR: className="ios-nav-bar" with large title (ios-nav-title-large)
- useState for currentPage: 'home' | 'rewards' | 'card' | 'profile' | 'login' | 'register'
- Home: ios-card for ${currencyName} balance, ios-badge for tier, progress bar to next tier
- Rewards: grid of ios-card reward items
- Card: ios-card digital member card with QR code
- Profile: ios-card with ios-list-row items, ios-button logout
- Show Login/Register (ios-card forms) if !user
- Use Tailwind + iOS classes from index.css`;

      // databasePrompt removed - schema.sql is now templated in configTemplates

      components1Prompt = `${GENERATION_RULES}

TASK: Generate React components (batch 1) for loyalty app.
Currency: "${currencyName}" | Tiers: ${config.tiers.map(t => t.name).join(',')}

iOS DESIGN SYSTEM - Use these classes from index.css:
- ios-tab-bar: Fixed bottom nav, 83px, blur backdrop
- ios-tab-item: Tab with icon + label (44px min touch)
- ios-card: 12px radius card with shadow
- ios-button-primary: Filled button with press scale
- ios-input: 44px height input field
- ios-badge: Small status badge

DO NOT generate Login.jsx or Register.jsx - they are pre-templated.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/BottomNav.jsx","content":"ios-tab-bar with 4 ios-tab-item tabs (Home, Rewards, Card, Profile), SVG icons + labels, active state"},
  {"path":"src/components/Dashboard.jsx","content":"ios-card with large points display, ios-badge for tier (Bronze=#CD7F32, Silver=#C0C0C0, Gold=#FFD700), progress bar to next tier"},
  {"path":"src/components/MemberCard.jsx","content":"ios-card styled as premium member card with QR code, tier badge, member name"}
]}

Use iOS classes. Tier colors: Bronze=#CD7F32, Silver=#C0C0C0, Gold=#FFD700.`;

      components2aPrompt = `${GENERATION_RULES}

TASK: Generate React components (batch 2a) for loyalty app.
Currency: "${currencyName}"

iOS DESIGN: Use ios-card, ios-button-primary, ios-segmented-control, ios-modal-sheet classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/Rewards.jsx","content":"Grid of ios-card reward items with ios-button-primary redeem, ios-modal-sheet for confirmation"},
  {"path":"src/components/History.jsx","content":"ios-segmented-control for tabs (All/Earned/Spent), ios-list-row transaction items"}
]}

Rewards: ios-card grid, ios-modal-sheet for redeem confirmation. History: ios-segmented-control tabs.`;

      components2bPrompt = `${GENERATION_RULES}

TASK: Generate React component for loyalty app - profile page.
Currency: "${currencyName}"

iOS DESIGN: Use ios-card, ios-list-row, ios-badge, ios-button classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/Profile.jsx","content":"ios-card with avatar, ios-badge for tier, ios-list-row items for details, ios-button for share referral"}
]}

Show: name, email, ios-badge tier, lifetime ${currencyName}, referral code with ios-button share.`;

      components2cPrompt = `${GENERATION_RULES}

TASK: Generate React admin panel for loyalty app.
Currency: "${currencyName}"

iOS DESIGN: Use ios-card, ios-segmented-control, ios-input, ios-list-row, ios-button classes.

FILES TO GENERATE:
{"files":[
  {"path":"src/components/AdminPanel.jsx","content":"ios-segmented-control tabs, ios-card sections, ios-input search, ios-list-row customer table, ios-button-primary for actions"}
]}

Tabs: Customers (ios-input search, ios-list-row table), Add ${currencyName} (ios-card form), Stats (ios-card totals). Desktop layout.`;
    }

    // Track usage across all calls
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const allFiles = [];

    // ═══════════════════════════════════════════════════════════════
    // JSON REPAIR FUNCTION - fixes common Claude JSON output issues
    // ═══════════════════════════════════════════════════════════════
    const repairJSON = (str) => {
      let repaired = str;

      // 1. Remove any text before first { and after last }
      const firstBrace = repaired.indexOf('{');
      const lastBrace = repaired.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        repaired = repaired.substring(firstBrace, lastBrace + 1);
      }

      // 2. Fix unescaped newlines inside strings (most common issue)
      // Replace actual newlines inside strings with \n
      repaired = repaired.replace(/"([^"]*?)"/g, (match, content) => {
        const fixed = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${fixed}"`;
      });

      // 3. Fix trailing commas before ] or }
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

      // 4. Fix missing commas between properties (common: }" followed by ")
      repaired = repaired.replace(/}"\s*"/g, '},"');
      repaired = repaired.replace(/]"\s*"/g, '],"');
      repaired = repaired.replace(/"\s*"/g, '","'); // consecutive strings

      // 5. Fix unescaped backslashes (but not already escaped ones)
      repaired = repaired.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

      return repaired;
    };

    // Helper to generate files from a prompt with retry logic
    const generateFiles = async (promptName, prompt, retryCount = 0) => {
      const maxRetries = 1;

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10000, // Reduced from 12000 to encourage conciseness
          messages: [{ role: 'user', content: prompt }]
        });

        totalInputTokens += response.usage.input_tokens;
        totalOutputTokens += response.usage.output_tokens;

        let content = response.content[0].text;
        content = content.replace(/^```json?\n?/g, '').replace(/\n?```$/g, '').trim();

        // Validate JSON before parsing
        if (!content.startsWith('{') || !content.includes('"files"')) {
          throw new Error('Response does not appear to be valid JSON');
        }

        // Try parsing, if it fails try repairing
        let data;
        try {
          data = JSON.parse(content);
        } catch (parseError) {
          console.warn(`[${promptName}] JSON parse failed, attempting repair...`);
          const repairedContent = repairJSON(content);
          try {
            data = JSON.parse(repairedContent);
            console.log(`[${promptName}] JSON repair successful`);
          } catch (repairError) {
            // Log first 500 chars for debugging
            console.error(`[${promptName}] JSON repair failed. Content start:`, content.substring(0, 500));
            throw new Error(`JSON parse failed even after repair: ${parseError.message}`);
          }
        }
        if (!data.files || !Array.isArray(data.files)) {
          throw new Error('Invalid response structure - missing files array');
        }

        // Validate each file has path and content
        for (const file of data.files) {
          if (!file.path || typeof file.content !== 'string') {
            throw new Error(`Invalid file structure in ${promptName}`);
          }
        }

        // ═══════════════════════════════════════════════════════════════
        // POST-GENERATION VALIDATION & AUTO-FIX
        // ═══════════════════════════════════════════════════════════════
        for (const file of data.files) {
          const filePath = file.path;
          let content = file.content;
          let fixed = false;

          // FIX: Remove <script> tags from .jsx files (invalid React)
          if (filePath.endsWith('.jsx') && content.includes('<script')) {
            console.warn(`[Validation] Removing <script> tags from ${filePath}`);
            // Remove entire script blocks
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            // Remove orphan script tags
            content = content.replace(/<\/?script[^>]*>/gi, '');
            fixed = true;
          }

          // FIX: Remove @import/@tailwind from CSS files
          if (filePath.endsWith('.css')) {
            if (content.includes('@import') || content.includes('@tailwind')) {
              console.warn(`[Validation] Removing @import/@tailwind from ${filePath}`);
              content = content.replace(/@import\s+['"][^'"]+['"];\s*/g, '');
              content = content.replace(/@tailwind\s+\w+;\s*/g, '');
              fixed = true;
            }
          }

          // WARN: Check for ES module imports in server.js (should use require)
          if (filePath === 'server.js' && content.match(/^import\s+/m)) {
            console.warn(`[Validation] WARNING: server.js contains ES import statements - should use require()`);
            // Auto-fix common patterns
            content = content.replace(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm, "const $1 = require('$2');");
            content = content.replace(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm, "const { $1 } = require('$2');");
            fixed = true;
          }

          // FIX: Remove HTML document structure from .jsx files
          if (filePath.endsWith('.jsx')) {
            if (content.includes('<!DOCTYPE') || content.includes('<html') || content.includes('<head>') || content.includes('<body>')) {
              console.warn(`[Validation] Removing HTML structure from ${filePath}`);
              // This is a more serious error - the whole file structure is wrong
              // Log it but don't try to fix automatically
              console.error(`[Validation] ERROR: ${filePath} contains HTML document structure - generation may have failed`);
            }
          }

          if (fixed) {
            file.content = content;
            console.log(`[Validation] Auto-fixed issues in ${filePath}`);
          }
        }

        console.log(`[Advanced Apps] ${promptName}: ${data.files.length} files generated`);
        return data.files;

      } catch (e) {
        console.error(`[Advanced Apps] Failed ${promptName} (attempt ${retryCount + 1}):`, e.message);

        if (retryCount < maxRetries) {
          console.log(`[Advanced Apps] Retrying ${promptName} with shorter prompt...`);
          // Retry with a more concise prompt
          const shorterPrompt = prompt.replace(/PREMIUM |Premium |premium /g, '').substring(0, Math.min(prompt.length, 2000));
          return generateFiles(promptName, shorterPrompt + '\n\nOUTPUT VALID JSON ONLY. Be concise.', retryCount + 1);
        }

        throw new Error(`Failed to generate ${promptName} after ${maxRetries + 1} attempts`);
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // ADD CONFIG TEMPLATES TO FILES
    // ═══════════════════════════════════════════════════════════════
    sendProgress('config', 'Creating config files...', false);
    allFiles.push(...configTemplates);
    sendProgress('config', 'Config files created', true);
    console.log('[Advanced Apps] Config templates added:', configTemplates.length, 'files');

    // ═══════════════════════════════════════════════════════════════
    // PARALLEL GENERATION: 6 AI calls run simultaneously
    // Database is 100% templated (schema.sql + db.js) - no AI needed
    // ═══════════════════════════════════════════════════════════════
    sendProgress('backend', 'Generating backend...', false);
    sendProgress('frontend', 'Generating frontend...', false);
    sendProgress('database', 'Database templated', true); // Database is now 100% templated
    console.log('[Advanced Apps] Starting 6 parallel API calls (database is templated)...');

    const [backendFiles, frontendCoreFiles, componentsFiles1, componentsFiles2a, componentsFiles2b, componentsFiles2c] = await Promise.all([
      generateFiles('backend', backendPrompt),
      generateFiles('frontend-core', frontendCorePrompt),
      generateFiles('components-1', components1Prompt),
      generateFiles('components-2a', components2aPrompt),
      generateFiles('components-2b', components2bPrompt),
      generateFiles('components-2c', components2cPrompt)
    ]);

    // Add all generated files (filter out any AI-generated database files - they are templated)
    const filteredBackendFiles = backendFiles.filter(f => !f.path.startsWith('database/'));
    allFiles.push(...filteredBackendFiles);
    sendProgress('backend', 'Backend generated', true);
    console.log('[Advanced Apps] Backend:', filteredBackendFiles.length, 'files (filtered database)');

    allFiles.push(...frontendCoreFiles);
    console.log('[Advanced Apps] Frontend core:', frontendCoreFiles.length, 'files');

    // Database is templated - no AI generation needed
    console.log('[Advanced Apps] Database: templated (schema.sql + db.js in configTemplates)');

    allFiles.push(...componentsFiles1);
    allFiles.push(...componentsFiles2a);
    allFiles.push(...componentsFiles2b);
    allFiles.push(...componentsFiles2c);
    sendProgress('frontend', 'Frontend generated', true);
    const totalComponents = componentsFiles1.length + componentsFiles2a.length + componentsFiles2b.length + componentsFiles2c.length;
    console.log('[Advanced Apps] Components:', totalComponents, 'files (4 batches)');

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Assemble project and create zip
    // ═══════════════════════════════════════════════════════════════
    sendProgress('assembly', 'Assembling project...', false);
    console.log('[Advanced Apps] Step 5: Assembling project...');

    // Write all files to the project directory
    let totalLines = 0;
    for (const file of allFiles) {
      const filePath = path.join(projectDir, file.path);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content);
      totalLines += (file.content.match(/\n/g) || []).length + 1;
    }

    // Create zip file
    const zipFilename = `${projectName}-${timestamp}.zip`;
    const zipPath = path.join(__dirname, '../../output/advanced', zipFilename);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(projectDir, projectName);
      archive.finalize();
    });

    sendProgress('assembly', 'Project assembled', true);

    // Calculate usage and cost
    const inputCost = (totalInputTokens / 1_000_000) * 3.00;
    const outputCost = (totalOutputTokens / 1_000_000) * 15.00;
    const totalCost = inputCost + outputCost;

    const usage = {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      cost: totalCost,
      costFormatted: totalCost.toFixed(2),
      durationMs: Date.now() - startTime
    };

    console.log('[Advanced Apps] Project created:', projectName);
    console.log('[Advanced Apps] Files:', allFiles.length);
    console.log('[Advanced Apps] Lines of code:', totalLines);
    console.log('[Advanced Apps] Cost:', '$' + usage.costFormatted);
    console.log('[Advanced Apps] Duration:', usage.durationMs + 'ms');

    // Determine project display name based on template
    const templateDisplayName = templateId === 'appointment-booking'
      ? 'Appointment Booking'
      : templateId === 'admin-dashboard'
      ? 'Admin Dashboard'
      : 'Loyalty Program';

    sendComplete({
      success: true,
      project: {
        name: `${config.businessName} ${templateDisplayName}`,
        path: projectDir,
        zipPath,
        downloadUrl: `/api/apps/download-advanced/${zipFilename}`,
        files: allFiles.map(f => f.path)
      },
      stats: {
        files: allFiles.length,
        linesOfCode: totalLines
      },
      usage
    });

  } catch (error) {
    console.error('[Advanced Apps] Error:', error);
    sendError(error.message || 'Failed to generate advanced app');
  }
});

// ============================================
// DOWNLOAD ADVANCED APP (ZIP)
// ============================================
router.get('/download-advanced/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(__dirname, '../../output/advanced', sanitizedFilename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.download(filepath, sanitizedFilename);

  } catch (error) {
    console.error('[Advanced Apps] Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

module.exports = router;
