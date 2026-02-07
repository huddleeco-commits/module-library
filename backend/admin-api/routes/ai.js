/**
 * AI Agent Chat Routes
 * Provides AI agent chat functionality for the admin dashboard
 * Includes action parsing and execution for operational agents
 *
 * Endpoints:
 *   GET  /api/admin/ai/agents  - List available agents
 *   POST /api/admin/ai/chat    - Chat with an agent (with action execution)
 *   GET  /api/admin/ai/health  - Health check
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import agent executor for action parsing
const { createExecutor } = require('../services/agent-executor');

// ── In-memory usage tracker ──────────────────────────────────────────
const usageStore = {
  calls: [],        // recent calls (capped at 200)
  totals: { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0, toolCalls: 0 },
  byAgent: {},      // agentId → { calls, inputTokens, outputTokens, cost, toolCalls }
  byDay: {}         // 'YYYY-MM-DD' → { calls, inputTokens, outputTokens, cost, toolCalls }
};

const PRICING = {
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
};

function recordUsage({ agentId, agentName, model, inputTokens, outputTokens, toolCalls = 0, durationMs = 0 }) {
  const pricing = PRICING[model] || { input: 3.00, output: 15.00 };
  const cost = (inputTokens / 1e6) * pricing.input + (outputTokens / 1e6) * pricing.output;
  const now = new Date();
  const day = now.toISOString().split('T')[0];

  // Totals
  usageStore.totals.calls++;
  usageStore.totals.inputTokens += inputTokens;
  usageStore.totals.outputTokens += outputTokens;
  usageStore.totals.cost += cost;
  usageStore.totals.toolCalls += toolCalls;

  // By agent
  if (!usageStore.byAgent[agentId]) {
    usageStore.byAgent[agentId] = { agentId, agentName, calls: 0, inputTokens: 0, outputTokens: 0, cost: 0, toolCalls: 0 };
  }
  const a = usageStore.byAgent[agentId];
  a.calls++; a.inputTokens += inputTokens; a.outputTokens += outputTokens; a.cost += cost; a.toolCalls += toolCalls;

  // By day
  if (!usageStore.byDay[day]) {
    usageStore.byDay[day] = { date: day, calls: 0, inputTokens: 0, outputTokens: 0, cost: 0, toolCalls: 0 };
  }
  const d = usageStore.byDay[day];
  d.calls++; d.inputTokens += inputTokens; d.outputTokens += outputTokens; d.cost += cost; d.toolCalls += toolCalls;

  // Recent calls (cap at 200)
  usageStore.calls.unshift({ agentId, agentName, model, inputTokens, outputTokens, toolCalls, cost, durationMs, timestamp: now.toISOString() });
  if (usageStore.calls.length > 200) usageStore.calls.length = 200;
}

// Find agents.json - check multiple locations
function loadAgents(req) {
  // First try to get from brain.json if available
  const brain = req.app.locals.brain;
  if (brain?.agents) {
    return brain.agents;
  }

  const possiblePaths = [
    path.join(__dirname, '..', 'config', 'agents.json'),
    path.join(__dirname, '..', '..', 'agents.json'),
    path.join(__dirname, '..', '..', 'admin', 'agents.json'),
    path.join(process.cwd(), 'agents.json'),
    path.join(process.cwd(), 'admin', 'agents.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf8');
        return JSON.parse(content);
      } catch (e) {
        console.error(`[AI] Failed to parse agents.json at ${p}:`, e.message);
      }
    }
  }

  // Return default agents if none found
  return getDefaultAgents(req);
}

// Default agents when no agents.json exists
function getDefaultAgents(req) {
  const brain = req.app.locals.brain || {};
  const businessName = brain.business?.name || 'Your Business';
  const businessType = brain.industry?.type || 'business';

  return {
    business: {
      name: businessName,
      type: businessType,
      generatedAt: new Date().toISOString()
    },
    agents: [
      {
        id: 'support',
        name: 'Support',
        role: 'Customer Support',
        icon: 'Headphones',
        color: '#10B981',
        category: 'operations',
        systemPrompt: `You are the customer support agent for ${businessName}.\n\nYOUR ROLE:\n- Answer customer questions about services, hours, and location\n- Help with order issues and complaints\n- Handle inquiries with empathy and solutions\n- Escalate complex issues appropriately\n\nTONE: Professional, friendly, helpful.`,
        capabilities: ['answer-questions', 'handle-complaints', 'provide-info']
      },
      {
        id: 'marketing',
        name: 'Marketing',
        role: 'Content Creation',
        icon: 'PenTool',
        color: '#8B5CF6',
        category: 'revenue',
        systemPrompt: `You are the marketing agent for ${businessName}.\n\nYOUR ROLE:\n- Create social media posts (Facebook, Instagram, Twitter)\n- Write promotional content and email campaigns\n- Suggest marketing strategies\n- Generate engaging copy\n\nOUTPUT FORMAT:\n[CONTENT type="social|email|promotion"]\nplatform: ...\nheadline: ...\nbody: ...\ncta: ...\n[/CONTENT]`,
        capabilities: ['social-media', 'email-campaigns', 'promotions']
      },
      {
        id: 'analytics',
        name: 'Analytics',
        role: 'Business Intelligence',
        icon: 'BarChart3',
        color: '#EF4444',
        category: 'operations',
        systemPrompt: `You are the analytics agent for ${businessName}.\n\nYOUR ROLE:\n- Track key performance indicators\n- Generate daily/weekly reports\n- Alert on significant changes\n- Provide data-driven recommendations\n\nOUTPUT FORMAT:\n[REPORT type="daily|weekly"]\nperiod: ...\nhighlights: ...\nconcerns: ...\nrecommendations: ...\n[/REPORT]`,
        capabilities: ['reports', 'kpi-tracking', 'recommendations']
      }
    ],
    categories: [
      { id: 'operations', name: 'Operations', agents: ['support', 'analytics'] },
      { id: 'revenue', name: 'Revenue', agents: ['marketing'] }
    ],
    config: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 2048,
      costTracking: true
    }
  };
}

// GET /api/admin/ai/agents - List available agents
router.get('/agents', (req, res) => {
  try {
    const agentsConfig = loadAgents(req);

    // Return agents without full system prompts (security)
    const safeAgents = (agentsConfig.agents || []).map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      icon: a.icon,
      color: a.color,
      category: a.category,
      capabilities: a.capabilities
    }));

    res.json({
      success: true,
      business: agentsConfig.business,
      agents: safeAgents,
      categories: agentsConfig.categories || []
    });
  } catch (error) {
    console.error('[AI] Failed to load agents:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load agents',
      details: error.message
    });
  }
});

// Build context for agents that need current data
function buildAgentContext(req, agentId) {
  const context = {};

  // Menu context for menu-manager agent
  if (agentId === 'menu-manager') {
    const menuRoutes = req.app.locals.menuRoutes;
    if (menuRoutes?.getStore) {
      const store = menuRoutes.getStore();
      const categories = store.categories.filter(c => c.active);
      const menuItems = categories.map(cat => {
        const items = store.items.filter(i => i.category_id === cat.id);
        return `${cat.name}: ${items.map(i => `${i.name} ($${i.price})${!i.available ? ' [UNAVAILABLE]' : ''}`).join(', ')}`;
      }).join('\n');
      context.MENU_CONTEXT = menuItems || 'No menu items yet';
    }
  }

  // Reservations context for reservations agent
  if (agentId === 'reservations') {
    const reservationRoutes = req.app.locals.reservationRoutes;
    if (reservationRoutes?.getStore) {
      const store = reservationRoutes.getStore();
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = store.reservations
        .filter(r => r.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));

      const reservationsList = todayReservations.map(r =>
        `- ${r.reference_code}: ${r.customer_name}, ${r.party_size} guests at ${r.time} [${r.status.toUpperCase()}]`
      ).join('\n');
      context.RESERVATIONS_CONTEXT = reservationsList || 'No reservations today';
    }
  }

  // Content context for website-editor agent
  if (agentId === 'website-editor') {
    const content = req.app.locals.websiteContent || {};
    const contentList = Object.entries(content).map(([key, val]) =>
      `- ${key}: "${val.content?.substring(0, 50)}..."${val.isDraft ? ' [DRAFT]' : ''}`
    ).join('\n');
    context.CONTENT_CONTEXT = contentList || 'No custom content set';
  }

  return context;
}

// Replace template variables in system prompt
function processSystemPrompt(prompt, variables) {
  let processed = prompt;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return processed;
}

// POST /api/admin/ai/chat - Chat with an agent
router.post('/chat', async (req, res) => {
  try {
    const { agentId, message, conversationHistory = [], executeActions = true } = req.body;

    // Validate input
    if (!agentId || !message) {
      return res.status(400).json({
        success: false,
        error: 'agentId and message are required'
      });
    }

    // Load agents and find the requested one
    const agentsConfig = loadAgents(req);
    const agent = (agentsConfig.agents || []).find(a => a.id === agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent "${agentId}" not found`,
        available: (agentsConfig.agents || []).map(a => a.id)
      });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI not configured',
        message: 'Add ANTHROPIC_API_KEY to your .env file'
      });
    }

    // Initialize Anthropic client
    let Anthropic;
    try {
      Anthropic = require('@anthropic-ai/sdk');
    } catch (e) {
      return res.status(503).json({
        success: false,
        error: 'Anthropic SDK not installed',
        message: 'Run: npm install @anthropic-ai/sdk'
      });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build context variables
    const brain = req.app.locals.brain || {};
    const contextVariables = {
      BUSINESS_NAME: agentsConfig.business?.name || brain.business?.name || 'Your Business',
      BUSINESS_TYPE: agentsConfig.business?.type || brain.industry?.type || 'business',
      BUSINESS_ADDRESS: brain.business?.address || '123 Main St',
      BUSINESS_PHONE: brain.business?.phone || '(555) 123-4567',
      ...buildAgentContext(req, agentId)
    };

    // Process system prompt with context
    const systemPrompt = processSystemPrompt(agent.systemPrompt, contextVariables);

    // Build messages array
    const messages = [
      ...conversationHistory.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Get model from config or use default
    const model = agentsConfig.config?.model || 'claude-sonnet-4-20250514';
    const maxTokens = agentsConfig.config?.maxTokens || 2048;

    // Call Claude
    const chatStartTime = Date.now();
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages
    });
    const chatDurationMs = Date.now() - chatStartTime;

    const assistantMessage = response.content[0].text;
    if (agentsConfig.config?.costTracking) {
      console.log(`[AI] Agent: ${agent.id}, Input: ${response.usage.input_tokens}, Output: ${response.usage.output_tokens}`);
    }

    // Execute actions if enabled and agent supports it
    let actionResults = null;
    const shouldExecuteActions = executeActions &&
      (agentsConfig.config?.executeActions !== false) &&
      ['menu-manager', 'reservations', 'website-editor'].includes(agentId);

    if (shouldExecuteActions) {
      const executor = createExecutor(req.app);
      if (executor.hasActions(assistantMessage)) {
        console.log(`[AI] Executing actions for agent: ${agentId}`);
        actionResults = await executor.execute(assistantMessage);
        console.log(`[AI] Actions executed: ${actionResults.executed} succeeded, ${actionResults.failed} failed`);
      }
    }

    // Track usage in memory
    const toolCallCount = actionResults ? (actionResults.executed || 0) + (actionResults.failed || 0) : 0;
    recordUsage({
      agentId: agent.id,
      agentName: agent.name,
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      toolCalls: toolCallCount,
      durationMs: chatDurationMs
    });

    // Return response
    res.json({
      success: true,
      agentId: agent.id,
      agentName: agent.name,
      agentIcon: agent.icon,
      message: assistantMessage,
      actions: actionResults,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        model
      }
    });

  } catch (error) {
    console.error('[AI Chat Error]', error.message);
    res.status(500).json({
      success: false,
      error: 'AI request failed',
      details: error.message
    });
  }
});

// GET /api/admin/ai/usage - Cost & usage analytics
router.get('/usage', (req, res) => {
  res.json({
    success: true,
    totals: usageStore.totals,
    byAgent: Object.values(usageStore.byAgent).sort((a, b) => b.cost - a.cost),
    byDay: Object.values(usageStore.byDay).sort((a, b) => b.date.localeCompare(a.date)),
    recentCalls: usageStore.calls
  });
});

// GET /api/admin/ai/health - Health check
router.get('/health', (req, res) => {
  let agentCount = 0;
  let businessName = 'Unknown';

  try {
    const agentsConfig = loadAgents(req);
    agentCount = agentsConfig.agents?.length || 0;
    businessName = agentsConfig.business?.name || 'Unknown';
  } catch (e) {
    // Agents not loaded
  }

  res.json({
    success: true,
    status: 'ok',
    aiConfigured: !!process.env.ANTHROPIC_API_KEY,
    agentCount,
    business: businessName,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
