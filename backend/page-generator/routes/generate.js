const express = require('express');
const router = express.Router();
const UniversalBusinessGenerator = require('../../src/core/UniversalBusinessGenerator');
const ClaudeService = require('../services/claude-service');
const path = require('path');
const fs = require('fs').promises;
const costTracker = require('../../blink-admin/services/costTracker');

// AI business info extraction endpoint
router.post('/api/ai/extract-business-info', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Try AI extraction if enabled
        if (process.env.CLAUDE_API_ENABLED === 'true' && process.env.CLAUDE_API_KEY) {
            const claudeService = new ClaudeService(process.env.CLAUDE_API_KEY);
            
            const prompt = `You are a business analyst expert. Analyze this input and INFER as much context as possible: "${message}"

CRITICAL: Use common sense and industry knowledge to fill in realistic details, even from minimal input.

Examples of inference:
- "Pizza" → Italian pizzeria restaurant, casual dining, menu with pizzas/pastas/salads, typical prices ($12-25 entrees)
- "Mario's Pizza Brooklyn" → Family-owned pizzeria in Brooklyn NY, New York-style pizza, likely established business
- "Dr. Smith" → Medical practice or dental office, healthcare professional
- "Joe's Auto" → Auto repair shop or car dealership
- "Sunrise Yoga" → Yoga studio, wellness/fitness focus

Return ONLY valid JSON with ALL fields filled using smart inference:
{
  "industry": "restaurant|healthcare|ecommerce|real-estate|fitness|education|automotive|legal|professional-services|home-services|spa-salon|construction|plumber|dental|consulting|agency|cleaning|moving|pet-services|photography|bar",
  "businessName": "inferred professional business name",
  "variant": "specific business subtype (e.g., 'pizzeria', 'family-dental', 'crossfit-gym')",
  "specialization": "what they specialize in (e.g., 'New York style pizza', 'cosmetic dentistry')",
  "tier": "premium",
  "location": {
    "city": "inferred city or null",
    "state": "inferred state or null",
    "country": "USA",
    "raw": "any location mentioned"
  },
  "inferredDetails": {
    "yearsInBusiness": "realistic estimate (e.g., '15+ years')",
    "priceRange": "typical price range for this business type",
    "targetAudience": "who they serve (e.g., 'families', 'young professionals')",
    "uniqueSellingPoints": ["key differentiators based on business type"],
    "typicalServices": ["list of 4-6 services/products this business would offer"],
    "businessHours": "typical hours for this industry",
    "atmosphere": "the vibe/feel (e.g., 'family-friendly', 'upscale', 'casual')"
  },
  "suggestedContent": {
    "heroHeadline": "compelling headline for their homepage",
    "tagline": "short memorable tagline",
    "callToAction": "primary CTA text (e.g., 'Order Now', 'Book Appointment')",
    "keyStats": ["3-4 impressive but realistic stats to display"]
  }
}`;

            try {
                const startTime = Date.now();
                const aiResponse = await claudeService.callClaudeAPI(prompt);
                const durationMs = Date.now() - startTime;

                // Track the API call for cost analytics
                const userId = req.user?.id || null;
                await costTracker.trackApiCall({
                    userId,
                    apiName: 'claude',
                    operationType: 'business_info_extraction',
                    inputTokens: aiResponse.inputTokens || Math.ceil(prompt.length / 4),
                    outputTokens: aiResponse.outputTokens || Math.ceil((aiResponse.content || aiResponse).length / 4),
                    model: 'claude-sonnet-4-20250514',
                    durationMs,
                    success: true,
                    metadata: { endpoint: '/api/ai/extract-business-info' }
                });

                const responseText = aiResponse.content || aiResponse;
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return res.json({
                        success: true,
                        data: parsed,
                        source: 'claude_ai'
                    });
                }
            } catch (error) {
                // Track failed API call
                await costTracker.trackApiCall({
                    userId: req.user?.id || null,
                    apiName: 'claude',
                    operationType: 'business_info_extraction',
                    success: false,
                    errorMessage: error.message,
                    metadata: { endpoint: '/api/ai/extract-business-info' }
                });
                console.warn('AI extraction failed, using fallback:', error.message);
            }
        }

        // Fallback regex extraction
        const fallbackData = extractBusinessInfoFallback(message);
        
        res.json({
            success: true,
            data: fallbackData,
            source: 'fallback'
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Business generation endpoint
router.post('/api/generate/business', async (req, res) => {
    const startTime = Date.now();
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || null;
    let generationId = null;

    try {
        const { industry, businessName, variant, tier, theme, location, generateAll, modules = [] } = req.body;

        if (!industry) {
            return res.status(400).json({
                success: false,
                error: 'Industry is required'
            });
        }

        console.log(`[Generate] Starting generation for ${industry}`);

        // Start generation tracking
        const genStart = await costTracker.startGeneration({
            userId,
            userEmail,
            siteName: businessName || `${industry} Business`,
            industry,
            template: tier || 'premium',
            modules
        });

        if (genStart.success) {
            generationId = genStart.generationId;
        }

        const businessId = `${industry}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Initialize generator
        const generator = new UniversalBusinessGenerator(industry, {
            tier: tier || 'premium',
            variant: variant,
            businessId: businessId
        });

        await generator.initialize();

        // Generate business
        const result = await generator.generateBusiness({
            name: businessName || `${industry} Business`,
            variant: variant,
            tier: tier,
            theme: theme,
            location: location
        });

        // Create output directory
        const outputDir = path.join(__dirname, '../../output');
        await fs.mkdir(outputDir, { recursive: true });

        const businessSlug = (businessName || industry).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const businessFolder = `${businessSlug}-${Date.now()}`;
        const businessPath = path.join(outputDir, businessFolder);
        const pagesPath = path.join(businessPath, 'pages');

        await fs.mkdir(pagesPath, { recursive: true });

        // Save all pages
        const savedPages = [];
        for (const [filename, content] of Object.entries(result.pages)) {
            const filePath = path.join(pagesPath, filename);
            await fs.writeFile(filePath, content);
            savedPages.push({
                filename: filename,
                name: filename.replace('.html', ''),
                category: categorizePageId(filename.replace('.html', ''))
            });
        }

        const generationTimeMs = Date.now() - startTime;
        const generationTime = (generationTimeMs / 1000).toFixed(1);

        // Complete generation tracking
        if (generationId) {
            await costTracker.completeGeneration(generationId, {
                success: true,
                pagesGenerated: savedPages.length,
                generationTimeMs,
                downloadUrl: `/output/${businessFolder}`
            });
        }

        console.log(`[Generate] Completed in ${generationTime}s - ${savedPages.length} pages`);

        res.json({
            success: true,
            businessId: businessId,
            businessFolder: businessFolder,
            generationId: generationId,
            pages: savedPages,
            generationTime: generationTime,
            message: `Successfully generated ${savedPages.length} pages`
        });

    } catch (error) {
        console.error('[Generate] Error:', error);

        // Track failed generation
        if (generationId) {
            await costTracker.completeGeneration(generationId, {
                success: false,
                generationTimeMs: Date.now() - startTime,
                errorMessage: error.message,
                errorLog: [{ error: error.message, stack: error.stack, timestamp: new Date().toISOString() }]
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper: Fallback extraction
function extractBusinessInfoFallback(message) {
    const lowerMessage = message.toLowerCase();
    
    const industryPatterns = {
        'restaurant': /restaurant|food|dining|cafe|pizzeria|steakhouse/i,
        'healthcare': /health|medical|clinic|hospital|dental|doctor/i,
        'ecommerce': /e-?commerce|online\s*store|shop/i,
        'real-estate': /real\s*estate|realty|property/i,
        'fitness': /fitness|gym|workout/i,
        'education': /education|school|academy/i,
        'automotive': /auto|car|vehicle/i,
        'legal': /legal|law|attorney/i,
        'professional-services': /consulting|professional/i,
        'home-services': /home\s*service|plumber/i,
        'crypto-vault': /crypto|blockchain/i
    };
    
    let industry = null;
    for (const [ind, pattern] of Object.entries(industryPatterns)) {
        if (pattern.test(message)) {
            industry = ind;
            break;
        }
    }
    
    const nameMatch = message.match(/["']([^"']+)["']/);
    const businessName = nameMatch ? nameMatch[1] : null;
    
    return {
        industry: industry,
        businessName: businessName,
        variant: null,
        specialization: lowerMessage.includes('luxury') ? 'luxury' : null,
        tier: lowerMessage.includes('premium') ? 'premium' : 'essential',
        location: { city: null, state: null, country: 'USA', raw: null }
    };
}

// Helper: Categorize page
function categorizePageId(pageId) {
    if (pageId.includes('admin') || pageId.includes('crypto')) return 'shared';
    const premiumPages = ['appointment', 'booking', 'cart', 'checkout', 'portal'];
    return premiumPages.some(p => pageId.includes(p)) ? 'premium' : 'essential';
}

module.exports = router;