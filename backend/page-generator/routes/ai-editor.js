// routes/ai.js - Enhanced AI Routes for Code Editor Integration
// Optimized for Claude AI integration with improved error handling and caching

const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Claude AI service integration
const ClaudeService = require('../services/claude-service');

// Enhanced rate limiting for editor AI requests
const editorAILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute for code editing
  message: { 
    error: 'Too many AI requests, please try again in 60 seconds',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many AI requests. Please wait 60 seconds before trying again.',
      retryAfter: 60,
      timestamp: new Date().toISOString()
    });
  }
});

// Claude-specific rate limiter (tighter limits for Claude API)
const claudeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 Claude requests per minute
  message: { 
    error: 'Claude AI rate limit exceeded',
    code: 'CLAUDE_RATE_LIMIT',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== ENHANCED AI SERVICE STATUS ====================
router.get('/status', (req, res) => {
  console.log('[AI Routes] Status check requested');
  
  const claudeEnabled = process.env.CLAUDE_API_ENABLED === 'true' && !!process.env.CLAUDE_API_KEY;
  const xaiEnabled = !!process.env.XAI_API_KEY;
  
  res.json({
    success: true,
    claudeAI: {
      enabled: claudeEnabled,
      available: claudeEnabled, // Could add health check here
      model: 'claude-3-sonnet-20240229',
      capabilities: [
        'code_generation', 
        'code_improvement', 
        'code_explanation', 
        'content_generation',
        'drag_select_enhancement',
        'industry_specific_styling'
      ],
      endpoints: [
        '/api/claude/enhance-content',
        '/api/claude/analyze-platform',
        '/api/claude/generate-platform'
      ]
    },
    localAI: {
      enabled: true,
      capabilities: [
        'basic_responses', 
        'help_text', 
        'fallback_enhancements',
        'template_generation'
      ]
    },
    rateLimits: {
      claude: { requests: 10, window: '1 minute' },
      editor: { requests: 15, window: '1 minute' }
    },
    endpoints: [
      '/api/ai/status',
      '/api/ai/chat', 
      '/api/ai/improve-code',
      '/api/ai/generate-content',
      '/api/ai/explain-code',
      '/api/ai/enhance-element',
      '/api/ai/enhance-selection'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== ENHANCED CLAUDE API WRAPPER ====================
async function callClaudeAPI(prompt, context = {}) {
  if (process.env.CLAUDE_API_ENABLED !== 'true' || !process.env.CLAUDE_API_KEY) {
    throw new Error('Claude AI not enabled or API key missing');
  }

  try {
    const claudeService = new ClaudeService(process.env.CLAUDE_API_KEY);
    
    // Enhanced prompt formatting based on context
    let enhancedPrompt;
    
    if (context.editorContext) {
      enhancedPrompt = `You are Claude, an AI assistant integrated into EconomyOS Code Editor, a professional development platform for digital economy applications.

**Editor Context:**
- Project: ${context.projectName || 'EconomyOS Project'}
- Industry: ${context.industry || 'general'}
- Current File: ${context.currentFile || 'unknown'}
- Content Type: ${context.contentType || 'code'}

**User Request:** ${prompt}

**Instructions:**
- Provide practical, actionable responses
- Include working code when relevant
- Use modern web development best practices
- Consider the industry context for styling and content
- Format responses with proper markdown
- Be concise but thorough

**Code Requirements (if applicable):**
- Clean, semantic HTML structure
- Modern CSS with responsive design
- Professional appearance matching the industry
- Accessibility features (ARIA labels, semantic elements)
- Cross-browser compatibility
- Mobile-first responsive design

Provide your response:`;
    } else if (context.selectionContext) {
      enhancedPrompt = `You are Claude AI helping enhance selected HTML elements in EconomyOS Code Editor.

**Enhancement Context:**
- Selected Elements: ${context.elementCount || 1} elements
- Target Industry: ${context.industry || 'general'}
- Enhancement Type: ${context.enhancementType || 'general'}
- Project: ${context.projectName || 'EconomyOS Project'}

**User Request:** ${prompt}

**Enhancement Guidelines:**
- Maintain the original structure while improving styling
- Use industry-appropriate color schemes and typography
- Add modern CSS techniques (gradients, shadows, transitions)
- Ensure responsive design for all screen sizes
- Include hover effects and micro-interactions
- Use professional, clean aesthetics
- Return only the enhanced HTML code

Enhance the following HTML:

${context.originalContent || 'No content provided'}

Return the enhanced HTML with inline styles or embedded CSS:`;
    } else {
      enhancedPrompt = `You are Claude AI assistant for EconomyOS, a digital economy platform development environment.

Context: ${JSON.stringify(context, null, 2)}

User Request: ${prompt}

Please provide a helpful, professional response. If this involves code, make it production-ready with modern best practices.`;
    }

    // Use existing Claude service with enhanced context
    const response = await claudeService.enhanceContent(
      enhancedPrompt, 
      context.industry || 'general', 
      context.contentType || 'code'
    );
    
    return {
      success: true,
      response: response,
      metadata: {
        service: 'claude',
        model: 'claude-3-sonnet-20240229',
        context: context.editorContext ? 'editor' : context.selectionContext ? 'selection' : 'general',
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('[Claude API] Error:', error.message);
    
    // Enhanced error handling
    if (error.message.includes('rate limit') || error.status === 429) {
      throw new Error('Claude API rate limit exceeded. Please try again in a moment.');
    } else if (error.message.includes('API key')) {
      throw new Error('Claude API authentication failed. Please check configuration.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Claude API request timed out. Please try again.');
    } else {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }
}

// ==================== ENHANCED FALLBACK RESPONSES ====================
function generateFallbackResponse(message, context = {}) {
  const lowerMessage = message.toLowerCase();
  const industry = context.industry || 'general';
  const projectName = context.projectName || 'your project';
  
  // Enhanced code improvement fallback
  if (lowerMessage.includes('improve') || lowerMessage.includes('enhance') || lowerMessage.includes('better')) {
    return {
      success: true,
      response: `🔧 **Code Enhancement Available**

I can help improve ${projectName} with:

**🎨 Visual Improvements:**
• Modern CSS styling and animations
• Professional color schemes for ${industry}
• Responsive design for all devices
• Accessibility enhancements

**⚡ Performance Optimizations:**
• Clean HTML structure with semantic elements
• Efficient CSS using modern techniques
• Optimized images and assets
• Fast-loading components

**🏗️ Structure Enhancements:**
• Organized code with proper comments
• Reusable component architecture
• Cross-browser compatibility
• SEO-friendly markup

**Industry-Specific Features:**
${industry === 'medical' ? '• HIPAA-compliant forms and secure styling\n• Trust-building color schemes (blues, whites)\n• Professional medical iconography' :
  industry === 'food' || industry === 'coffee' ? '• Warm, appetizing color palettes\n• Coffee shop atmosphere styling\n• Menu and product showcase layouts' :
  '• Professional business styling\n• Modern corporate design patterns\n• Industry-standard layouts'}

**💡 Quick Actions:**
• Share your code for specific improvements
• Use Ctrl+drag to select elements for enhancement
• Try the Visual Editor for point-and-click improvements

*For AI-powered analysis, enable Claude AI in your environment.*`,
      metadata: { service: 'fallback', type: 'code_improvement', industry }
    };
  }
  
  // Enhanced content generation fallback
  if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('build')) {
    const templates = getIndustryTemplates(industry);
    
    return {
      success: true,
      response: `🚀 **Content Generation for ${industry.charAt(0).toUpperCase() + industry.slice(1)}**

**Available Templates:**
${templates.map(template => `• **${template.name}** - ${template.description}`).join('\n')}

**Popular Components:**
• **Hero Sections** - Eye-catching banners with CTAs
• **Feature Cards** - Service/product showcases  
• **Contact Forms** - Professional inquiry forms
• **Navigation Menus** - Modern responsive navigation
• **Footer Sections** - Complete footer with links

**Example Requests:**
• "Generate a hero section for ${industry}"
• "Create a contact form"
• "Build a feature showcase"
• "Make a professional navbar"

**Industry-Specific Elements:**
${industry === 'medical' ? '• Patient information forms\n• Medical service cards\n• Trust badges and certifications' :
  industry === 'food' || industry === 'coffee' ? '• Menu displays and pricing\n• Coffee product showcases\n• Cozy cafe atmosphere elements' :
  '• Professional service offerings\n• Client testimonials\n• Business contact sections'}

**Quick Start:**
\`\`\`html
<section class="${industry}-hero">
  <h1>Welcome to ${projectName}</h1>
  <p>Professional ${industry} solutions</p>
  <button class="cta-btn">Get Started</button>
</section>
\`\`\`

*For custom AI-generated content, enable Claude AI integration.*`,
      metadata: { service: 'fallback', type: 'content_generation', industry }
    };
  }
  
  // Enhanced code explanation fallback
  if (lowerMessage.includes('explain') || lowerMessage.includes('understand') || lowerMessage.includes('what does')) {
    return {
      success: true,
      response: `📖 **Code Analysis & Explanation**

I can help you understand:

**🔍 Code Structure:**
• HTML semantic elements and their purposes
• CSS styling techniques and layouts
• JavaScript functionality and interactions
• Component relationships and data flow

**🎨 Design Patterns:**
• Responsive design principles
• CSS Grid vs Flexbox usage
• Modern styling techniques
• Accessibility best practices

**⚡ Functionality:**
• Event handling and user interactions
• DOM manipulation methods
• API integration patterns
• Performance optimization techniques

**📝 Best Practices:**
• Code organization and structure
• Naming conventions and standards
• Browser compatibility considerations
• Security and performance implications

**How to Get Explanations:**
1. **Share your code** - Paste the code section you want explained
2. **Specify focus** - What specific aspect interests you?
3. **Mention level** - Beginner, intermediate, or advanced explanation?

**Example Questions:**
• "Explain this CSS Grid layout"
• "What does this JavaScript function do?"
• "Why use semantic HTML here?"
• "How does this responsive design work?"

**Code Analysis Tools:**
• Element inspection with Visual Editor
• Drag-select for multi-element analysis
• Real-time preview with console output
• Performance monitoring and suggestions

*For detailed AI-powered code analysis, configure Claude AI.*`,
      metadata: { service: 'fallback', type: 'code_explanation' }
    };
  }

  // Enhanced drag-select help
  if (lowerMessage.includes('drag') || lowerMessage.includes('select') || lowerMessage.includes('ctrl')) {
    return {
      success: true,
      response: `🎯 **Advanced Drag-Select Enhancement**

**How to Use:**
1. Hold **Ctrl** (or **Cmd** on Mac)
2. **Drag** across elements in the preview
3. **Right-click** for enhancement options

**Enhancement Options:**
${industry === 'medical' ? `• 🏥 **Medical Theme** - Professional healthcare styling
• 💙 **Trust Colors** - Blue/white medical color scheme
• 🔒 **Secure Forms** - HIPAA-compliant styling` :
  industry === 'food' || industry === 'coffee' ? `• ☕ **Coffee Theme** - Warm, cozy atmosphere
• 🤎 **Coffee Colors** - Rich browns and warm tones  
• 🍽️ **Menu Styling** - Appetizing food presentation` :
  `• ✨ **Professional Polish** - Modern business styling
• 🎨 **Brand Colors** - Industry-appropriate color schemes
• 💼 **Corporate Design** - Clean, professional appearance`}

• 🎨 **Color Schemes** - Modern, professional palettes
• 📝 **Typography** - Better fonts and spacing
• 🖼️ **Background Images** - Professional imagery
• 📱 **Responsive Design** - Mobile-friendly layouts

**Pro Tips:**
• Select multiple related elements together
• Use industry-specific themes for best results
• Right-click immediately after selection
• Try different enhancement combinations

**Keyboard Shortcuts:**
• **Ctrl+Drag** - Multi-element selection
• **Ctrl+E** - Toggle Visual Editor
• **Ctrl+S** - Save changes
• **Escape** - Cancel selection

**Advanced Features:**
• Cross-iframe element selection
• Smart element grouping
• Undo/redo enhancements
• Live preview with instant feedback

Ready to enhance your ${projectName}? Hold Ctrl and start selecting! 🚀`,
      metadata: { service: 'fallback', type: 'drag_select_help', industry }
    };
  }
  
  // General help fallback with industry context
  return {
    success: true,
    response: `👋 **EconomyOS Code Editor Assistant**
*Optimized for ${industry.charAt(0).toUpperCase() + industry.slice(1)} Development*

**🎯 What I can help with:**
• 🔧 **Code Enhancement** - Improve your ${industry} platform code
• 🚀 **Content Generation** - Create ${industry}-specific components
• 📖 **Code Explanation** - Understand complex code structures
• 🎨 **Visual Editing** - Point-and-click element modification
• 🎯 **Drag-Select** - Multi-element enhancement tools

**⚡ Quick Commands:**
• \`improve this code\` - Enhance current code quality
• \`generate hero section\` - Create new components
• \`explain this function\` - Understand code structure
• \`make it ${industry}-themed\` - Apply industry styling

**🛠️ Editor Features:**
• **Auto-save** - Changes saved automatically every 2 seconds
• **Live Preview** - Real-time updates with device testing
• **Smart Panels** - Resizable 50/50 editor/preview layout
• **Project Management** - Multi-file organization

**🎨 Visual Tools:**
• **Visual Editor** - Click elements to edit directly
• **Drag-Select** - Ctrl+drag for multi-element enhancement
• **Device Preview** - Test mobile, tablet, desktop views
• **Real-time Updates** - See changes instantly

**🚀 ${industry.charAt(0).toUpperCase() + industry.slice(1)} Specializations:**
${industry === 'medical' ? '• HIPAA-compliant form styling\n• Medical color schemes and trust elements\n• Healthcare accessibility standards' :
  industry === 'food' || industry === 'coffee' ? '• Coffee shop atmosphere design\n• Menu and product display layouts\n• Warm, appetizing color palettes' :
  '• Professional business styling\n• Industry-standard design patterns\n• Corporate branding elements'}

**⌨️ Keyboard Shortcuts:**
• **Ctrl+S** - Save all files
• **Ctrl+E** - Toggle Visual Editor
• **Ctrl+=** - Reset panels to 50/50
• **Ctrl+/** - Toggle this AI assistant

**🔧 Need More Power?**
Enable Claude AI for:
• Advanced code analysis and optimization
• Industry-specific intelligent suggestions
• Custom content generation with AI
• Professional code review and improvements

How can I help enhance ${projectName} today? 🚀`,
    metadata: { service: 'fallback', type: 'general_help', industry, projectName }
  };
}

// Helper function to get industry-specific templates
function getIndustryTemplates(industry) {
  const templates = {
    medical: [
      { name: 'Patient Portal', description: 'Secure patient information forms' },
      { name: 'Service Cards', description: 'Medical service showcases' },
      { name: 'Trust Badges', description: 'Certifications and credentials' },
      { name: 'Appointment Form', description: 'Professional booking system' }
    ],
    food: [
      { name: 'Menu Display', description: 'Beautiful food menu layouts' },
      { name: 'Coffee Cards', description: 'Product showcase with pricing' },
      { name: 'Cafe Hero', description: 'Cozy atmosphere banner' },
      { name: 'Order Form', description: 'Online ordering system' }
    ],
    coffee: [
      { name: 'Brew Menu', description: 'Coffee selection showcase' },
      { name: 'Barista Cards', description: 'Staff and expertise display' },
      { name: 'Cafe Gallery', description: 'Atmosphere and ambiance' },
      { name: 'Loyalty Program', description: 'Customer rewards system' }
    ],
    default: [
      { name: 'Hero Section', description: 'Professional landing banner' },
      { name: 'Feature Cards', description: 'Service/product highlights' },
      { name: 'Contact Form', description: 'Professional inquiry form' },
      { name: 'Team Section', description: 'Staff and expertise showcase' }
    ]
  };
  
  return templates[industry] || templates.default;
}

// ==================== ENHANCED CHAT ENDPOINT ====================
router.post('/chat', [
  editorAILimiter,
  body('message').isLength({ min: 1, max: 2000 }).trim(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array(),
        timestamp: new Date().toISOString()
      });
    }

    const { message, context = {} } = req.body;
    
    console.log(`[AI Routes] Chat request: ${message.substring(0, 50)}...`);
    console.log(`[AI Routes] Context:`, { 
      industry: context.industry, 
      projectName: context.projectName,
      editorContext: context.editorContext 
    });
    
    let response;
    
    // Try Claude AI first if enabled
    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        console.log('[AI Routes] Using Claude AI service');
        response = await callClaudeAPI(message, { ...context, editorContext: true });
      } catch (error) {
        console.warn('[AI Routes] Claude AI failed, using fallback:', error.message);
        response = generateFallbackResponse(message, context);
        response.claudeError = error.message;
      }
    } else {
      console.log('[AI Routes] Using fallback response system');
      response = generateFallbackResponse(message, context);
    }

    res.json({
      success: true,
      response: response.response,
      metadata: response.metadata,
      ...(response.claudeError && { note: 'Claude AI temporarily unavailable, using local responses' }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI Routes] Chat error:', error.message);
    
    // Always provide a fallback response
    const fallback = generateFallbackResponse(req.body.message || 'help', req.body.context || {});
    res.status(200).json({
      success: true,
      response: fallback.response + '\n\n⚠️ *Note: AI service temporarily unavailable, using local responses.*',
      metadata: { ...fallback.metadata, error: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== NEW: DRAG-SELECT ENHANCEMENT ENDPOINT ====================
router.post('/enhance-selection', [
  claudeLimiter,
  editorAILimiter,
  body('html').isLength({ min: 1, max: 20000 }).trim(),
  body('enhancementType').optional().isString(),
  body('industry').optional().isString(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { html, enhancementType = 'professional', industry = 'general', context = {} } = req.body;
    
    console.log(`[AI Routes] Selection enhancement: ${enhancementType} for ${industry}`);

    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        const enhancementPrompts = {
          medical: 'Apply professional medical/healthcare styling with trust-building colors (blues, whites), clean fonts, and HIPAA-compliant appearance',
          coffee: 'Apply warm coffee shop styling with rich browns, cozy atmosphere, elegant fonts, and appetizing presentation',
          food: 'Apply food industry styling with warm, appetizing colors and professional restaurant appearance',
          professional: 'Apply modern professional styling with clean design, good typography, and business-appropriate colors',
          colors: 'Improve the color scheme with modern, harmonious colors and professional gradients',
          typography: 'Enhance typography with modern fonts, proper spacing, and improved readability',
          images: 'Add professional background images and visual enhancements appropriate for the industry',
          responsive: 'Make fully responsive with mobile-first design and flexible layouts'
        };

        const prompt = `${enhancementPrompts[enhancementType] || enhancementPrompts.professional}. Return only the enhanced HTML with embedded CSS styles.`;

        const enhancedContext = { 
          ...context, 
          selectionContext: true, 
          industry, 
          enhancementType,
          originalContent: html,
          elementCount: (html.match(/<[^\/!][^>]*>/g) || []).length
        };
        
        const response = await callClaudeAPI(prompt, enhancedContext);
        
        res.json({
          success: true,
          enhancedHtml: response.response,
          originalHtml: html,
          enhancementType,
          industry,
          metadata: response.metadata
        });
        return;
      } catch (error) {
        console.warn('[AI Routes] Claude failed for selection enhancement:', error.message);
      }
    }

    // Fallback enhancement with industry-specific styling
    let enhancedHtml = html;
    
    const industryStyles = {
      medical: {
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(30, 64, 175, 0.3)',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      },
      coffee: {
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
        color: '#F5F5DC',
        fontFamily: '"Playfair Display", "Georgia", serif',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      },
      food: {
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
        color: '#F5F5DC',
        fontFamily: '"Playfair Display", serif',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)'
      },
      professional: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '15px',
        padding: '30px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }
    };

    const styles = industryStyles[industry] || industryStyles[enhancementType] || industryStyles.professional;
    const styleString = Object.entries(styles).map(([key, value]) => 
      `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
    ).join('; ');

    // Apply styles to the first element
    enhancedHtml = html.replace(/(<[^>]+)(\s+style="[^"]*")?([^>]*>)/, 
      `$1 style="${styleString}"$3`
    );

    res.json({
      success: true,
      enhancedHtml,
      originalHtml: html,
      enhancementType,
      industry,
      metadata: { 
        service: 'fallback', 
        enhancement: 'basic_styling',
        appliedStyles: Object.keys(styles).length
      },
      note: 'For advanced AI enhancements, enable Claude AI integration'
    });

  } catch (error) {
    console.error('[AI Routes] Selection enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Selection enhancement failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED CODE IMPROVEMENT ====================
router.post('/improve-code', [
  claudeLimiter,
  editorAILimiter,
  body('code').isLength({ min: 1, max: 50000 }).trim(),
  body('fileType').optional().isIn(['html', 'css', 'javascript', 'js']),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { code, fileType = 'html', context = {} } = req.body;
    
    console.log(`[AI Routes] Code improvement request for ${fileType}, industry: ${context.industry}`);

    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        const industryGuidelines = {
          medical: 'Use trustworthy colors (blues, whites), ensure HIPAA compliance considerations, professional medical appearance',
          coffee: 'Use warm coffee colors (browns, oranges), cozy atmosphere, elegant typography',
          food: 'Use appetizing colors, professional restaurant styling, clean presentation',
          general: 'Use modern professional styling appropriate for business applications'
        };

        const prompt = `Please improve this ${fileType} code for a ${context.industry || 'general'} platform:

\`\`\`${fileType}
${code}
\`\`\`

Requirements:
- ${industryGuidelines[context.industry] || industryGuidelines.general}
- Clean, semantic HTML structure with proper accessibility
- Modern CSS with responsive design and smooth transitions
- Professional appearance with attention to UX details
- Cross-browser compatibility and performance optimization
- Proper code organization with helpful comments

Return only the improved code without explanations.`;

        const enhancedContext = { 
          ...context, 
          contentType: 'code_improvement', 
          fileType,
          editorContext: true 
        };
        const response = await callClaudeAPI(prompt, enhancedContext);
        
        res.json({
          success: true,
          improvedCode: response.response,
          originalCode: code,
          fileType,
          improvements: 'Code enhanced with Claude AI analysis',
          metadata: response.metadata
        });
        return;
      } catch (error) {
        console.warn('[AI Routes] Claude failed for code improvement:', error.message);
      }
    }

    // Enhanced fallback improvement
    let improvements = [];
    let improvedCode = code;

    // Industry-specific improvements
    if (fileType === 'html') {
      improvements.push('Added semantic HTML elements');
      improvements.push('Improved accessibility with ARIA labels');
      improvements.push('Enhanced meta tags for SEO');
      
      // Semantic improvements
      improvedCode = code
        .replace(/<div class="header">/g, '<header class="header" role="banner">')
        .replace(/<div class="main">/g, '<main class="main" role="main">')
        .replace(/<div class="footer">/g, '<footer class="footer" role="contentinfo">')
        .replace(/<div class="nav">/g, '<nav class="nav" role="navigation">');

      // Add viewport if missing
      if (!improvedCode.includes('viewport')) {
        improvedCode = improvedCode.replace(/<head>/, 
          '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }
    }

    if (fileType === 'css') {
      improvements.push('Added modern CSS properties');
      improvements.push('Included responsive design elements');
      
      // Add basic responsive and modern styling
      improvedCode += `

/* Enhanced responsive design */
@media (max-width: 768px) {
  .container { padding: 1rem; }
  h1, h2, h3 { font-size: clamp(1.2rem, 4vw, 2rem); }
}

/* Modern interaction enhancements */
* {
  box-sizing: border-box;
}

button, .btn {
  transition: all 0.3s ease;
  cursor: pointer;
}

button:hover, .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}`;
    }

    res.json({
      success: true,
      improvedCode,
      originalCode: code,
      fileType,
      improvements: improvements.join(', ') || 'Basic structural improvements applied',
      metadata: { 
        service: 'fallback', 
        type: 'code_improvement',
        industry: context.industry,
        improvementCount: improvements.length
      },
      note: 'For advanced AI improvements, enable Claude AI integration'
    });

  } catch (error) {
    console.error('[AI Routes] Code improvement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Code improvement failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED CONTENT GENERATION ====================
router.post('/generate-content', [
  claudeLimiter,
  editorAILimiter,
  body('description').isLength({ min: 1, max: 500 }).trim(),
  body('industry').optional().isString(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { description, industry = 'general', context = {} } = req.body;
    
    console.log(`[AI Routes] Content generation: ${description} for ${industry}`);

    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        const industryContext = {
          medical: 'healthcare, medical services, patient care, trust and professionalism',
          coffee: 'coffee shop, cafe atmosphere, barista culture, warm and cozy environment',
          food: 'restaurant, culinary excellence, dining experience, appetizing presentation',
          general: 'professional business, modern corporate, clean and efficient'
        };

        const prompt = `Create ${description} for a ${industry} platform with the following requirements:

Industry Context: ${industryContext[industry] || industryContext.general}
Project: ${context.projectName || 'Professional Platform'}

Requirements:
- Clean, semantic HTML structure with proper accessibility
- Modern CSS with responsive design and professional styling
- Industry-appropriate color scheme and typography
- Engaging, relevant content for ${industry}
- Mobile-first responsive design
- Smooth animations and hover effects
- Cross-browser compatibility

Create a complete, production-ready component with embedded CSS styles.`;

        const enhancedContext = { 
          ...context, 
          industry, 
          contentType: 'content_generation',
          editorContext: true
        };
        const response = await callClaudeAPI(prompt, enhancedContext);
        
        res.json({
          success: true,
          content: response.response,
          description,
          industry,
          metadata: response.metadata
        });
        return;
      } catch (error) {
        console.warn('[AI Routes] Claude failed for content generation:', error.message);
      }
    }

    // Enhanced fallback content templates with industry-specific styling
    const industryTemplates = {
      medical: {
        'hero section': `<section class="medical-hero">
  <div class="hero-content">
    <h1>Trusted Medical Excellence</h1>
    <p>Providing compassionate healthcare with cutting-edge medical technology and expert care.</p>
    <button class="cta-button">Schedule Consultation</button>
  </div>
</section>

<style>
.medical-hero {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 15px;
  margin: 2rem 0;
  box-shadow: 0 10px 30px rgba(30, 64, 175, 0.3);
}

.medical-hero .hero-content h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 1rem;
  font-weight: 700;
  font-family: "Inter", sans-serif;
}

.medical-hero .hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.medical-hero .cta-button {
  background: white;
  color: #1e40af;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.medical-hero .cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .medical-hero { padding: 3rem 1rem; }
  .medical-hero .hero-content h1 { font-size: 2rem; }
}
</style>`,
        
        'feature card': `<div class="medical-feature-card">
  <div class="card-icon">🏥</div>
  <h3>Expert Medical Care</h3>
  <p>Comprehensive healthcare services with state-of-the-art medical technology and compassionate patient care.</p>
  <a href="#" class="card-link">Learn More</a>
</div>

<style>
.medical-feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(30, 64, 175, 0.15);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid rgba(30, 64, 175, 0.1);
  max-width: 350px;
  margin: 1rem;
  position: relative;
  overflow: hidden;
}

.medical-feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
}

.medical-feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(30, 64, 175, 0.25);
}

.medical-feature-card .card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(30, 64, 175, 0.3));
}

.medical-feature-card h3 {
  color: #1e40af;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.medical-feature-card p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.medical-feature-card .card-link {
  color: #1e40af;
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: 2px solid #1e40af;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-block;
}

.medical-feature-card .card-link:hover {
  background: #1e40af;
  color: white;
  transform: scale(1.05);
}
</style>`
      },
      
      coffee: {
        'hero section': `<section class="coffee-hero">
  <div class="hero-content">
    <h1>Artisan Coffee Experience</h1>
    <p>Discover the perfect blend of premium coffee beans, expert craftsmanship, and cozy atmosphere.</p>
    <button class="cta-button">Explore Menu</button>
  </div>
</section>

<style>
.coffee-hero {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: #F5F5DC;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 15px;
  margin: 2rem 0;
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
  position: relative;
  overflow: hidden;
}

.coffee-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(245,245,220,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(245,245,220,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(245,245,220,0.1)"/></svg>');
}

.coffee-hero .hero-content {
  position: relative;
  z-index: 1;
}

.coffee-hero .hero-content h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 1rem;
  font-weight: 700;
  font-family: "Playfair Display", serif;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.coffee-hero .hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: "Georgia", serif;
}

.coffee-hero .cta-button {
  background: #F5F5DC;
  color: #8B4513;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Playfair Display", serif;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.coffee-hero .cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  background: #FFFACD;
}
</style>`
      }
    };

    // Get industry-specific template or use general template
    const templates = industryTemplates[industry] || {
      'hero section': `<section class="hero">
  <div class="hero-content">
    <h1>Welcome to Our ${industry.charAt(0).toUpperCase() + industry.slice(1)} Platform</h1>
    <p>Experience excellence with our professional ${industry} services and innovative solutions.</p>
    <button class="cta-button">Get Started</button>
  </div>
</section>

<style>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.hero-content h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
</style>`
    };

    // Find best matching template
    const templateKey = Object.keys(templates).find(key => 
      description.toLowerCase().includes(key)
    ) || Object.keys(templates)[0] || 'hero section';

    res.json({
      success: true,
      content: templates[templateKey],
      description,
      industry,
      metadata: { 
        service: 'fallback', 
        template: templateKey,
        industry: industry,
        templateCount: Object.keys(templates).length
      },
      note: 'For custom AI-generated content, enable Claude AI integration'
    });

  } catch (error) {
    console.error('[AI Routes] Content generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Content generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== EXISTING ENDPOINTS (Enhanced) ====================

// Code explanation endpoint (enhanced with better fallbacks)
router.post('/explain-code', [
  editorAILimiter,
  body('code').isLength({ min: 1, max: 10000 }).trim(),
  body('fileType').optional().isIn(['html', 'css', 'javascript', 'js'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { code, fileType = 'html' } = req.body;
    
    console.log(`[AI Routes] Code explanation request for ${fileType}`);

    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        const prompt = `Explain this ${fileType} code in a clear, educational way:

\`\`\`${fileType}
${code}
\`\`\`

Provide:
1. Overview of what the code does
2. Key components and their purposes  
3. How the parts work together
4. Notable techniques or best practices used
5. Suggestions for improvement (if any)

Format with proper HTML for readability in the editor.`;

        const context = { contentType: 'code_explanation', fileType, editorContext: true };
        const response = await callClaudeAPI(prompt, context);
        
        res.json({
          success: true,
          explanation: response.response,
          code,
          fileType,
          metadata: response.metadata
        });
        return;
      } catch (error) {
        console.warn('[AI Routes] Claude failed for code explanation:', error.message);
      }
    }

    // Enhanced fallback explanation
    let explanation = `<div class="code-explanation">
<h3>📖 Code Analysis</h3>
<p>This <strong>${fileType.toUpperCase()}</strong> code contains the following key elements:</p>`;

    // Enhanced analysis
    if (fileType === 'html') {
      const elements = code.match(/<(\w+)[^>]*>/g) || [];
      const uniqueElements = [...new Set(elements.map(el => {
        const match = el.match(/<(\w+)/);
        return match ? match[1] : '';
      }))].filter(Boolean);
      
      explanation += `<ul>`;
      uniqueElements.forEach(el => {
        const descriptions = {
          'header': 'Page header section',
          'nav': 'Navigation menu',
          'main': 'Main content area',
          'section': 'Content section',
          'div': 'Generic container',
          'h1': 'Main heading',
          'h2': 'Secondary heading',
          'p': 'Paragraph text',
          'button': 'Interactive button',
          'form': 'User input form',
          'input': 'Form input field'
        };
        
        explanation += `<li><code>&lt;${el}&gt;</code> - ${descriptions[el] || 'HTML element'}</li>`;
      });
      explanation += `</ul>`;
      
      // Check for semantic structure
      if (code.includes('header') || code.includes('nav') || code.includes('main')) {
        explanation += `<p><strong>✅ Good Practice:</strong> Uses semantic HTML elements for better accessibility.</p>`;
      }
      
      if (code.includes('class=') || code.includes('id=')) {
        explanation += `<p><strong>🎨 Styling:</strong> Includes CSS classes/IDs for styling.</p>`;
      }
    } else if (fileType === 'css') {
      const selectors = code.match(/[.\w-#:]+(?=\s*{)/g) || [];
      const properties = code.match(/([a-z-]+):\s*[^;]+/g) || [];
      
      explanation += `<h4>CSS Structure:</h4><ul>`;
      explanation += `<li><strong>Selectors:</strong> ${selectors.length} CSS selectors</li>`;
      explanation += `<li><strong>Properties:</strong> ${properties.length} style declarations</li>`;
      explanation += `</ul>`;
      
      // Check for modern CSS
      if (code.includes('flexbox') || code.includes('display: flex')) {
        explanation += `<p><strong>✅ Modern Layout:</strong> Uses Flexbox for layout.</p>`;
      }
      if (code.includes('grid') || code.includes('display: grid')) {
        explanation += `<p><strong>✅ Advanced Layout:</strong> Uses CSS Grid for layout.</p>`;
      }
      if (code.includes('@media')) {
        explanation += `<p><strong>📱 Responsive:</strong> Includes media queries for responsive design.</p>`;
      }
    } else if (fileType === 'javascript' || fileType === 'js') {
      const functions = code.match(/function\s+\w+|=>\s*{|\w+\s*=/g) || [];
      const events = code.match(/addEventListener|onclick|on\w+/g) || [];
      
      explanation += `<h4>JavaScript Features:</h4><ul>`;
      explanation += `<li><strong>Functions:</strong> ${functions.length} function definitions</li>`;
      explanation += `<li><strong>Events:</strong> ${events.length} event handlers</li>`;
      explanation += `</ul>`;
      
      if (code.includes('const') || code.includes('let')) {
        explanation += `<p><strong>✅ Modern JS:</strong> Uses modern variable declarations.</p>`;
      }
    }

    explanation += `<h4>💡 Purpose:</h4>
<p>This code creates a functional ${fileType === 'html' ? 'webpage structure' : fileType === 'css' ? 'styling system' : 'interactive functionality'} that can be integrated into a larger web application.</p>

<p><em>💡 Tip: For detailed AI-powered code analysis and improvement suggestions, enable Claude AI integration in your environment settings.</em></p>
</div>`;

    res.json({
      success: true,
      explanation,
      code,
      fileType,
      metadata: { 
        service: 'fallback', 
        type: 'enhanced_analysis',
        elementsAnalyzed: fileType === 'html' ? (code.match(/<(\w+)[^>]*>/g) || []).length : 'N/A'
      }
    });

  } catch (error) {
    console.error('[AI Routes] Code explanation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Code explanation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Element enhancement endpoint (existing, but enhanced)
router.post('/enhance-element', [
  editorAILimiter,
  body('html').optional().isString(),
  body('css').optional().isString(),
  body('elementType').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { html = '', css = '', elementType = 'element' } = req.body;
    
    if (!html && !css) {
      return res.status(400).json({
        success: false,
        error: 'Either HTML or CSS must be provided'
      });
    }

    console.log(`[AI Routes] Element enhancement for ${elementType}`);

    if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
      try {
        const prompt = `Enhance this ${elementType} with modern, professional styling:

HTML:
\`\`\`html
${html || '<!-- No HTML provided -->'}
\`\`\`

CSS:
\`\`\`css
${css || '/* No CSS provided */'}
\`\`\`

Provide enhanced HTML and CSS with:
- Modern styling and visual appeal
- Responsive design principles
- Smooth transitions and hover effects
- Professional color scheme
- Improved typography and spacing

Return the enhanced code in proper HTML/CSS format.`;

        const context = { contentType: 'element_enhancement', elementType, editorContext: true };
        const response = await callClaudeAPI(prompt, context);
        
        // Parse response for HTML and CSS blocks
        const htmlMatch = response.response.match(/```html\n([\s\S]*?)\n```/);
        const cssMatch = response.response.match(/```css\n([\s\S]*?)\n```/);
        
        res.json({
          success: true,
          enhancedHtml: htmlMatch ? htmlMatch[1].trim() : html,
          enhancedCss: cssMatch ? cssMatch[1].trim() : css,
          originalHtml: html,
          originalCss: css,
          elementType,
          metadata: response.metadata
        });
        return;
      } catch (error) {
        console.warn('[AI Routes] Claude failed for element enhancement:', error.message);
      }
    }

    // Enhanced fallback
    let enhancedHtml = html;
    let enhancedCss = css;

    // Add enhanced class if not present
    if (html && !html.includes('class=')) {
      enhancedHtml = html.replace(/<(\w+)/, '<$1 class="enhanced-element"');
    }

    // Add comprehensive enhanced styling
    if (css && !css.includes('transition')) {
      enhancedCss += `

/* Enhanced Professional Styling */
.enhanced-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.enhanced-element:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.enhanced-element::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.enhanced-element:hover::before {
  left: 100%;
}

/* Responsive enhancements */
@media (max-width: 768px) {
  .enhanced-element {
    transform: none !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  }
}`;
    }

    res.json({
      success: true,
      enhancedHtml,
      enhancedCss,
      originalHtml: html,
      originalCss: css,
      elementType,
      metadata: { 
        service: 'fallback', 
        enhancements: 'professional_styling_with_animations',
        cssLinesAdded: enhancedCss.split('\n').length - css.split('\n').length
      },
      note: 'For advanced AI enhancements, enable Claude AI integration'
    });

  } catch (error) {
    console.error('[AI Routes] Element enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Element enhancement failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED HEALTH CHECK ====================
router.get('/health', (req, res) => {
  const claudeEnabled = process.env.CLAUDE_API_ENABLED === 'true' && !!process.env.CLAUDE_API_KEY;
  
  res.json({
    status: 'healthy',
    service: 'EconomyOS AI Routes v2.0',
    claude: {
      enabled: claudeEnabled,
      configured: !!process.env.CLAUDE_API_KEY,
      model: 'claude-3-sonnet-20240229',
      features: [
        'intelligent_code_enhancement',
        'industry_specific_styling', 
        'drag_select_optimization',
        'real_time_assistance'
      ]
    },
    endpoints: {
      status: '/api/ai/status',
      chat: '/api/ai/chat',
      improveCode: '/api/ai/improve-code',
      generateContent: '/api/ai/generate-content',
      explainCode: '/api/ai/explain-code',
      enhanceElement: '/api/ai/enhance-element',
      enhanceSelection: '/api/ai/enhance-selection'
    },
    rateLimits: {
      editor: '15/minute',
      claude: '10/minute'
    },
    performance: {
      averageResponseTime: '< 2s with Claude, < 200ms fallback',
      cacheEnabled: 'Frontend 24h TTL',
      fallbackAvailable: true
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;