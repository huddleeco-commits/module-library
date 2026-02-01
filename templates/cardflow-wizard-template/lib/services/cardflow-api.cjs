/**
 * CardFlow AI Assistant API Service
 * Handles AI-powered chat functionality for the setup wizard
 *
 * Required: @anthropic-ai/sdk npm package and ANTHROPIC_API_KEY env variable
 */

const Anthropic = require('@anthropic-ai/sdk');

/**
 * Register CardFlow API routes on an Express app
 * @param {Express} app - Express application instance
 */
function registerCardFlowRoutes(app) {

  // CardFlow AI Chat Endpoint
  app.post('/api/ai/cardflow-chat', async (req, res) => {
    const { message, currentStep, wizardContext, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'AI service not configured' });
    }

    try {
      const client = new Anthropic({ apiKey });

      // Build context-aware system prompt
      const context = wizardContext || {};
      const systemPrompt = `You are Blink Assistant, a friendly and helpful AI guide for the Blink website builder setup wizard. You're helping a user get started with creating their website or web application.

## Current Step: ${currentStep || 'welcome'}

## User's Current Setup:
- Project Type: ${context.projectType || 'Not selected yet'}
- Business Name: ${context.businessName || 'Not provided'}
- Industry: ${context.industry || 'Not specified'}
- Location: ${context.location || 'Not specified'}
- Workflow Mode: ${context.workflowMode || 'Not selected'}
- Tutorials Enabled: ${context.enableTutorials !== false ? 'Yes' : 'No'}
- Auto-Save: ${context.autoSave !== false ? 'Yes' : 'No'}

## Your Role:
1. Answer questions about the Blink platform and setup process
2. Help users understand their options at each step
3. Provide friendly, concise guidance (2-3 sentences when possible)
4. When relevant, suggest specific choices based on their situation

## Step-Specific Knowledge:

### Welcome Step
- Blink uses AI to generate professional websites in minutes
- No coding experience required
- Three main workflow modes: Guided, Instant, and Custom

### Project Type Step
- Business Website: Multi-page site with full functionality (best for most businesses)
- Web Application: Interactive app with state management (for tools and dashboards)
- Tool Suite: Collection of business utilities
- Landing Page: Single-page focused on conversions (marketing campaigns)

### Business Step
- Business name is used for branding and content generation
- Industry helps AI choose appropriate design styles and sections
- Location is optional but helps with local SEO and regional styling

### Preferences Step
- Guided Mode: Step-by-step wizard with recommendations (recommended for beginners)
- Instant Mode: Describe in natural language, AI builds it (fastest)
- Custom Mode: Full control over every detail (for power users)
- Tutorials show helpful tips while building
- Auto-save prevents losing work

### Review Step
- Users can always change settings later
- After launch, they'll enter the main builder interface
- Deployment to Railway is one-click

## Response Style:
- Be warm and encouraging
- Keep answers concise (2-4 sentences)
- Use simple language, avoid jargon
- If you can make a specific recommendation based on their context, include it

## When Making Recommendations:
If you have a specific suggestion for the user (like which project type or workflow mode to choose), include it at the end of your response in this format:
\`\`\`suggestions
{
  "projectType": "website",
  "workflowMode": "guided"
}
\`\`\`
Only include fields you're specifically recommending. Omit the block entirely if you're just answering a general question.`;

      // Build messages array with conversation history
      const messages = [];
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }
      messages.push({ role: 'user', content: message });

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages
      });

      const responseText = response.content[0].text;

      // Extract suggestions if present
      let suggestions = null;
      const suggestionsMatch = responseText.match(/```suggestions\n([\s\S]*?)\n```/);
      if (suggestionsMatch) {
        try {
          suggestions = JSON.parse(suggestionsMatch[1]);
        } catch (e) {
          console.warn('Failed to parse CardFlow suggestions JSON:', e.message);
        }
      }

      // Remove suggestions block from response text for display
      const cleanResponse = responseText.replace(/```suggestions\n[\s\S]*?\n```/g, '').trim();

      res.json({
        success: true,
        response: cleanResponse,
        suggestions: suggestions
      });

    } catch (error) {
      console.error('CardFlow AI chat error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get AI response'
      });
    }
  });
}

module.exports = { registerCardFlowRoutes };
