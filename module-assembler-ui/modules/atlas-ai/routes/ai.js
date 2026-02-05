/**
 * ATLAS AI Routes
 * Standalone AI agent chat endpoint for Blink-generated projects
 *
 * Requires:
 *   - @anthropic-ai/sdk in package.json
 *   - ANTHROPIC_API_KEY in .env
 *   - agents.json in admin/ or project root
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Find agents.json - check multiple locations
function loadAgents() {
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'admin', 'agents.json'),
    path.join(__dirname, '..', '..', 'agents.json'),
    path.join(__dirname, '..', 'agents.json'),
    path.join(process.cwd(), 'admin', 'agents.json'),
    path.join(process.cwd(), 'agents.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return require(p);
    }
  }

  throw new Error('agents.json not found');
}

// GET /api/ai/agents - List available agents
router.get('/agents', (req, res) => {
  try {
    const agents = loadAgents();

    // Return agents without full system prompts (security)
    const safeAgents = agents.agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      icon: a.icon,
      color: a.color,
      category: a.category,
      capabilities: a.capabilities
    }));

    res.json({
      business: agents.business,
      agents: safeAgents,
      categories: agents.categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load agents', details: error.message });
  }
});

// POST /api/ai/chat - Chat with an agent
router.post('/chat', async (req, res) => {
  try {
    const { agentId, message, conversationHistory = [] } = req.body;

    // Validate input
    if (!agentId || !message) {
      return res.status(400).json({ error: 'agentId and message are required' });
    }

    // Load agents and find the requested one
    const agents = loadAgents();
    const agent = agents.agents.find(a => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        error: `Agent "${agentId}" not found`,
        available: agents.agents.map(a => a.id)
      });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: 'AI not configured',
        message: 'Add ANTHROPIC_API_KEY to your .env file'
      });
    }

    // Initialize Anthropic client
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Get model from config or use default
    const model = agents.config?.model || 'claude-sonnet-4-20250514';
    const maxTokens = agents.config?.maxTokens || 2048;

    // Call Claude
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: agent.systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;

    // Return response
    res.json({
      agentId: agent.id,
      agentName: agent.name,
      agentIcon: agent.icon,
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model
      }
    });

  } catch (error) {
    console.error('[AI Chat Error]', error.message);
    res.status(500).json({
      error: 'AI request failed',
      details: error.message
    });
  }
});

// GET /api/ai/health - Health check
router.get('/health', (req, res) => {
  let agentCount = 0;
  let businessName = 'Unknown';

  try {
    const agents = loadAgents();
    agentCount = agents.agents?.length || 0;
    businessName = agents.business?.name || 'Unknown';
  } catch (e) {
    // Agents not loaded
  }

  res.json({
    status: 'ok',
    aiConfigured: !!process.env.ANTHROPIC_API_KEY,
    agentCount,
    business: businessName,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
