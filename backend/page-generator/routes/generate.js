const express = require('express');
const router = express.Router();
const UniversalBusinessGenerator = require('../../src/core/UniversalBusinessGenerator');
const ClaudeService = require('../services/claude-service');
const path = require('path');
const fs = require('fs').promises;

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
            
            const prompt = `Extract business information from: "${message}"

Return ONLY valid JSON:
{
  "industry": "restaurant|healthcare|ecommerce|real-estate|fitness|education|automotive|legal|professional-services|home-services|crypto-vault",
  "businessName": "name or null",
  "variant": "specific type or null",
  "specialization": "focus area or null",
  "tier": "essential or premium",
  "location": {
    "city": "city or null",
    "state": "state or null",
    "country": "USA",
    "raw": "raw location string"
  }
}`;

            try {
                const aiResponse = await claudeService.callClaudeAPI(prompt);
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return res.json({
                        success: true,
                        data: parsed,
                        source: 'claude_ai'
                    });
                }
            } catch (error) {
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
    try {
        const { industry, businessName, variant, tier, theme, location, generateAll } = req.body;
        
        if (!industry) {
            return res.status(400).json({
                success: false,
                error: 'Industry is required'
            });
        }

        console.log(`[Generate] Starting generation for ${industry}`);
        
        const startTime = Date.now();
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
        
        const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log(`[Generate] Completed in ${generationTime}s - ${savedPages.length} pages`);
        
        res.json({
            success: true,
            businessId: businessId,
            businessFolder: businessFolder,
            pages: savedPages,
            generationTime: generationTime,
            message: `Successfully generated ${savedPages.length} pages`
        });

    } catch (error) {
        console.error('[Generate] Error:', error);
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