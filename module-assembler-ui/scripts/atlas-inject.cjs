/**
 * ATLAS Injection Layer
 *
 * Surgically adds ATLAS AI agent capabilities to Blink-generated output.
 * Does NOT modify existing files - only adds new ones.
 *
 * Usage: node scripts/atlas-inject.cjs <variant-path>
 * Example: node scripts/atlas-inject.cjs output/prospects/121-auto-care/full-test-luxury-appetizing-visual
 */

const fs = require('fs');
const path = require('path');

// ==================== AGENT TEMPLATES ====================

const BUSINESS_AGENT_PRESETS = {
  // Auto/Service businesses
  car_repair: ['support', 'content', 'ads', 'monitor'],
  auto_repair: ['support', 'content', 'ads', 'monitor'],

  // Restaurants/Food
  restaurant: ['support', 'content', 'ads', 'monitor'],
  cafe: ['support', 'content', 'ads', 'monitor'],
  bakery: ['support', 'content', 'ads', 'monitor'],

  // Retail
  store: ['support', 'content', 'ads', 'monitor', 'scout'],
  retail: ['support', 'content', 'ads', 'monitor', 'scout'],

  // Services
  salon: ['support', 'content', 'ads', 'monitor'],
  spa: ['support', 'content', 'ads', 'monitor'],
  gym: ['support', 'content', 'ads', 'monitor'],

  // Default
  default: ['support', 'content', 'ads', 'monitor']
};

// Base agent definitions (extracted from ATLAS)
const AGENT_DEFINITIONS = {
  support: {
    id: 'support',
    name: 'Support',
    role: 'Customer Support',
    icon: '🎧',
    color: '#10B981',
    category: 'operations',
    agentType: 'worker',
    systemPrompt: null // Generated from brain.json
  },
  content: {
    id: 'content',
    name: 'Content',
    role: 'Content Creation',
    icon: '✍️',
    color: '#8B5CF6',
    category: 'operations',
    agentType: 'worker',
    systemPrompt: null
  },
  ads: {
    id: 'ads',
    name: 'Ads',
    role: 'Advertising',
    icon: '📢',
    color: '#F59E0B',
    category: 'revenue',
    agentType: 'worker',
    systemPrompt: null
  },
  monitor: {
    id: 'monitor',
    name: 'Monitor',
    role: 'System Monitoring',
    icon: '📊',
    color: '#EF4444',
    category: 'operations',
    agentType: 'worker',
    systemPrompt: null
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    role: 'Market Research',
    icon: '🔍',
    color: '#06B6D4',
    category: 'revenue',
    agentType: 'worker',
    systemPrompt: null
  }
};

// ==================== PROMPT GENERATORS ====================

function generateSupportPrompt(brain) {
  const hours = formatHours(brain.prospect?.research?.hours || []);
  return `You are the customer support agent for ${brain.businessName}.

BUSINESS INFO:
- Name: ${brain.businessName}
- Address: ${brain.address}
- Phone: ${brain.phone}
- Categories: ${(brain.prospect?.research?.categories || []).join(', ') || 'General Business'}
- Rating: ${brain.prospect?.rating || 'N/A'}★ (${brain.prospect?.reviewCount || 0} reviews)

HOURS:
${hours || 'Contact us for hours'}

YOUR ROLE:
- Answer customer questions about services, hours, and location
- Help schedule appointments or reservations
- Handle complaints with empathy and solutions
- Escalate complex issues appropriately

TONE: Professional, friendly, helpful. Match the business's brand voice.

CAPABILITIES:
- Check business hours
- Provide directions and contact info
- Answer FAQs about services
- Take messages for follow-up

When you need to create a support ticket, output:
[TICKET]
priority: low|medium|high
subject: Brief description
details: Full details
[/TICKET]`;
}

function generateContentPrompt(brain) {
  return `You are the content creation specialist for ${brain.businessName}.

BUSINESS INFO:
- Name: ${brain.businessName}
- Industry: ${brain.industry || 'General'}
- Categories: ${(brain.prospect?.research?.categories || []).join(', ')}
- Location: ${brain.address}

BRAND VOICE:
- Rating: ${brain.prospect?.rating || 'N/A'}★ demonstrates quality
- ${brain.prospect?.reviewCount || 0} happy customers

YOUR ROLE:
- Create social media posts (Facebook, Instagram, Twitter)
- Write blog post outlines and content
- Craft email marketing copy
- Generate promotional content
- Write Google Business descriptions

TONE: Match the business's established brand. Professional but approachable.

When creating content, always include:
1. A headline/hook
2. Main content
3. Call to action
4. Suggested hashtags (for social)

Output format:
[CONTENT type="social|blog|email"]
platform: facebook|instagram|twitter|blog|email
headline: ...
body: ...
cta: ...
hashtags: ...
[/CONTENT]`;
}

function generateAdsPrompt(brain) {
  return `You are the advertising specialist for ${brain.businessName}.

BUSINESS INFO:
- Name: ${brain.businessName}
- Industry: ${brain.industry || 'General'}
- Location: ${brain.address}
- Phone: ${brain.phone}

COMPETITIVE ADVANTAGES:
- Rating: ${brain.prospect?.rating || 'N/A'}★ (${brain.prospect?.reviewCount || 0} reviews)
- Categories: ${(brain.prospect?.research?.categories || []).join(', ')}

YOUR ROLE:
- Create ad copy for Facebook, Google, Instagram
- Suggest targeting audiences
- Recommend ad budgets
- Write compelling headlines and descriptions
- A/B test variations

AD GUIDELINES:
- Keep headlines under 30 characters when possible
- Descriptions under 90 characters for Google
- Always include a clear CTA
- Leverage the rating and reviews as social proof

Output format:
[AD platform="facebook|google|instagram"]
headline: ...
description: ...
cta: ...
audience: ...
suggested_budget: ...
[/AD]`;
}

function generateMonitorPrompt(brain) {
  return `You are the monitoring and analytics agent for ${brain.businessName}.

BUSINESS INFO:
- Name: ${brain.businessName}
- Industry: ${brain.industry || 'General'}

YOUR ROLE:
- Track website traffic and conversions
- Monitor social media engagement
- Watch review platforms for new reviews
- Alert on significant changes
- Provide daily/weekly summaries

KEY METRICS TO TRACK:
- Website visits and bounce rate
- Contact form submissions
- Phone calls (if tracked)
- Social media followers and engagement
- Review count and average rating
- Ad performance (if running)

ALERT THRESHOLDS:
- New negative review: Immediate alert
- Traffic drop >20%: Alert
- No leads in 48 hours: Alert

Output format:
[ALERT level="info|warning|critical"]
metric: ...
current: ...
threshold: ...
recommendation: ...
[/ALERT]

[REPORT type="daily|weekly"]
period: ...
highlights: ...
concerns: ...
recommendations: ...
[/REPORT]`;
}

function generateScoutPrompt(brain) {
  return `You are the market research agent for ${brain.businessName}.

BUSINESS INFO:
- Name: ${brain.businessName}
- Industry: ${brain.industry || 'General'}
- Location: ${brain.address}
- Categories: ${(brain.prospect?.research?.categories || []).join(', ')}

YOUR ROLE:
- Research local competitors
- Track competitor pricing and offerings
- Identify market trends
- Find partnership opportunities
- Monitor industry news

RESEARCH AREAS:
- Competitor analysis (within 10 mile radius)
- Pricing benchmarks
- Service/product gaps in the market
- Customer sentiment trends
- Seasonal patterns

Output format:
[RESEARCH type="competitor|market|trend"]
subject: ...
findings: ...
opportunities: ...
recommendations: ...
[/RESEARCH]`;
}

const PROMPT_GENERATORS = {
  support: generateSupportPrompt,
  content: generateContentPrompt,
  ads: generateAdsPrompt,
  monitor: generateMonitorPrompt,
  scout: generateScoutPrompt
};

// ==================== HELPERS ====================

function formatHours(hoursArray) {
  if (!hoursArray || !hoursArray.length) return null;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return hoursArray.map(h => {
    const day = days[h.day] || `Day ${h.day}`;
    const start = formatTime(h.start);
    const end = formatTime(h.end);
    return `${day}: ${start} - ${end}`;
  }).join('\n');
}

function formatTime(time) {
  if (!time || time.length !== 4) return time;
  const hour = parseInt(time.substring(0, 2));
  const min = time.substring(2);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${period}`;
}

function detectBusinessType(brain) {
  // Check prospect categories first
  const categories = brain.prospect?.research?.categories || [];
  const rawTypes = brain.prospect?.raw?.types || [];

  const allTypes = [...categories, ...rawTypes].map(t => t.toLowerCase());

  for (const type of allTypes) {
    if (type.includes('auto') || type.includes('car') || type.includes('repair')) {
      return 'car_repair';
    }
    if (type.includes('restaurant') || type.includes('food') || type.includes('dining')) {
      return 'restaurant';
    }
    if (type.includes('salon') || type.includes('hair') || type.includes('beauty')) {
      return 'salon';
    }
    if (type.includes('retail') || type.includes('store') || type.includes('shop')) {
      return 'retail';
    }
  }

  // Fall back to fixtureId
  if (brain.prospect?.fixtureId) {
    return brain.prospect.fixtureId;
  }

  return 'default';
}

// ==================== INJECTION FUNCTIONS ====================

function createAgentsJson(brain, outputPath) {
  const businessType = detectBusinessType(brain);
  const agentIds = BUSINESS_AGENT_PRESETS[businessType] || BUSINESS_AGENT_PRESETS.default;

  console.log(`  Business type: ${businessType}`);
  console.log(`  Agents: ${agentIds.join(', ')}`);

  const agents = agentIds.map(id => {
    const agent = { ...AGENT_DEFINITIONS[id] };
    const promptGenerator = PROMPT_GENERATORS[id];
    if (promptGenerator) {
      agent.systemPrompt = promptGenerator(brain);
    }
    return agent;
  });

  // Add categories for UI grouping
  const categories = [
    { id: 'operations', name: 'Operations', agents: agents.filter(a => a.category === 'operations').map(a => a.id) },
    { id: 'revenue', name: 'Revenue', agents: agents.filter(a => a.category === 'revenue').map(a => a.id) }
  ].filter(c => c.agents.length > 0);

  const agentsConfig = {
    business: {
      name: brain.businessName,
      type: businessType,
      generatedAt: new Date().toISOString()
    },
    agents,
    categories
  };

  const agentsPath = path.join(outputPath, 'admin', 'agents.json');
  fs.writeFileSync(agentsPath, JSON.stringify(agentsConfig, null, 2));
  console.log(`  ✅ Created: admin/agents.json`);

  return agentsConfig;
}

function createAIRoutes(brain, outputPath) {
  const routesDir = path.join(outputPath, 'backend', 'routes');

  // Check if routes dir exists
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }

  const aiRoutesContent = `/**
 * ATLAS AI Routes
 * Auto-generated for ${brain.businessName}
 * Generated: ${new Date().toISOString()}
 */

const express = require('express');
const router = express.Router();

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { agentId, message, conversationHistory = [] } = req.body;

    if (!agentId || !message) {
      return res.status(400).json({ error: 'agentId and message required' });
    }

    // Load agents config
    const agentsPath = require('path').join(__dirname, '..', '..', 'admin', 'agents.json');
    const agents = require(agentsPath);

    const agent = agents.agents.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: 'AI not configured',
        message: 'Add ANTHROPIC_API_KEY to enable AI features'
      });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: agent.systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;

    res.json({
      agentId,
      agentName: agent.name,
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI request failed', details: error.message });
  }
});

// Get available agents
router.get('/agents', (req, res) => {
  try {
    const agentsPath = require('path').join(__dirname, '..', '..', 'admin', 'agents.json');
    const agents = require(agentsPath);

    // Return agents without full prompts (for security)
    const safeAgents = agents.agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      icon: a.icon,
      color: a.color,
      category: a.category
    }));

    res.json({
      business: agents.business,
      agents: safeAgents,
      categories: agents.categories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load agents' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
`;

  const aiRoutesPath = path.join(routesDir, 'ai.js');
  fs.writeFileSync(aiRoutesPath, aiRoutesContent);
  console.log(`  ✅ Created: backend/routes/ai.js`);
}

function updateBackendServer(outputPath) {
  const serverPath = path.join(outputPath, 'backend', 'server.js');

  if (!fs.existsSync(serverPath)) {
    console.log(`  ⚠️  No server.js found, skipping route injection`);
    return;
  }

  let serverContent = fs.readFileSync(serverPath, 'utf-8');

  // Check if already injected
  if (serverContent.includes('atlas-ai-routes')) {
    console.log(`  ⏭️  AI routes already injected`);
    return;
  }

  // Find the line before app.listen or the last app.use
  const listenMatch = serverContent.match(/app\.listen\s*\(/);

  if (listenMatch) {
    const insertPoint = serverContent.lastIndexOf('\n', listenMatch.index);

    const injection = `
// ==================== ATLAS AI ROUTES (auto-injected) ====================
// atlas-ai-routes
try {
  const aiRoutes = require('./routes/ai.js');
  app.use('/api/ai', aiRoutes);
  console.log('[ATLAS] AI routes loaded');
} catch (e) {
  console.log('[ATLAS] AI routes not available:', e.message);
}
// ==================== END ATLAS AI ROUTES ====================

`;

    serverContent = serverContent.slice(0, insertPoint) + injection + serverContent.slice(insertPoint);
    fs.writeFileSync(serverPath, serverContent);
    console.log(`  ✅ Injected AI routes into server.js`);
  } else {
    console.log(`  ⚠️  Could not find injection point in server.js`);
  }
}

function createAdminChatComponent(brain, outputPath) {
  const componentsDir = path.join(outputPath, 'admin', 'components');

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  const chatComponentContent = `/**
 * ATLAS AI Chat Component
 * Auto-generated for ${brain.businessName}
 */

import React, { useState, useRef, useEffect } from 'react';

export default function AtlasChat({ apiUrl = '' }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAgents = async () => {
    try {
      const res = await fetch(\`\${apiUrl}/api/ai/agents\`);
      const data = await res.json();
      setAgents(data.agents || []);
      if (data.agents?.length > 0) {
        setSelectedAgent(data.agents[0]);
      }
    } catch (e) {
      setError('Failed to load agents');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(\`\${apiUrl}/api/ai/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: input,
          conversationHistory: messages
        })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message || data.error);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (e) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atlas-chat" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
      {/* Agent Selector */}
      <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
        <select
          value={selectedAgent?.id || ''}
          onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value))}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        >
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.icon} {agent.name} - {agent.role}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '32px' }}>
            <p>👋 Hi! I'm {selectedAgent?.name || 'your assistant'}.</p>
            <p style={{ fontSize: '14px' }}>{selectedAgent?.role}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: '12px',
            textAlign: msg.role === 'user' ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: '12px',
              background: msg.role === 'user' ? '#3b82f6' : '#f3f4f6',
              color: msg.role === 'user' ? 'white' : '#1f2937'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: 'left', color: '#6b7280' }}>
            <em>Thinking...</em>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
`;

  const chatPath = path.join(componentsDir, 'AtlasChat.jsx');
  fs.writeFileSync(chatPath, chatComponentContent);
  console.log(`  ✅ Created: admin/components/AtlasChat.jsx`);
}

function updateBackendPackageJson(outputPath) {
  const pkgPath = path.join(outputPath, 'backend', 'package.json');

  if (!fs.existsSync(pkgPath)) {
    console.log(`  ⚠️  No package.json found in backend`);
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // Add Anthropic SDK if not present
  if (!pkg.dependencies) pkg.dependencies = {};

  if (!pkg.dependencies['@anthropic-ai/sdk']) {
    pkg.dependencies['@anthropic-ai/sdk'] = '^0.30.0';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log(`  ✅ Added @anthropic-ai/sdk to backend/package.json`);
  } else {
    console.log(`  ⏭️  @anthropic-ai/sdk already in dependencies`);
  }
}

function createAtlasManifest(brain, outputPath, agentsConfig) {
  const manifest = {
    atlasVersion: '1.0.0',
    injectedAt: new Date().toISOString(),
    business: {
      name: brain.businessName,
      type: detectBusinessType(brain)
    },
    agents: agentsConfig.agents.map(a => a.id),
    files: [
      'admin/agents.json',
      'admin/components/AtlasChat.jsx',
      'backend/routes/ai.js'
    ],
    endpoints: {
      chat: '/api/ai/chat',
      agents: '/api/ai/agents',
      health: '/api/ai/health'
    },
    requirements: {
      env: ['ANTHROPIC_API_KEY']
    }
  };

  const manifestPath = path.join(outputPath, 'atlas-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  ✅ Created: atlas-manifest.json`);
}

// ==================== MAIN ====================

function injectAtlas(variantPath) {
  console.log('\n🚀 ATLAS Injection Layer');
  console.log('========================\n');

  // Resolve path
  const fullPath = path.resolve(variantPath);

  // Check if path exists
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Path not found: ${fullPath}`);
    process.exit(1);
  }

  // Check for brain.json
  const brainPath = path.join(fullPath, 'brain.json');
  if (!fs.existsSync(brainPath)) {
    console.error(`❌ brain.json not found in: ${fullPath}`);
    process.exit(1);
  }

  // Load brain.json
  const brain = JSON.parse(fs.readFileSync(brainPath, 'utf-8'));
  console.log(`📦 Business: ${brain.businessName}`);
  console.log(`📍 Path: ${fullPath}\n`);

  // Check if already injected
  const manifestPath = path.join(fullPath, 'atlas-manifest.json');
  if (fs.existsSync(manifestPath)) {
    console.log('⚠️  ATLAS already injected. To re-inject, delete atlas-manifest.json first.');
    process.exit(0);
  }

  console.log('📝 Injecting ATLAS components...\n');

  // 1. Create agents.json
  const agentsConfig = createAgentsJson(brain, fullPath);

  // 2. Create AI routes
  createAIRoutes(brain, fullPath);

  // 3. Update server.js to include AI routes
  updateBackendServer(fullPath);

  // 4. Create chat component for admin
  createAdminChatComponent(brain, fullPath);

  // 5. Update backend package.json
  updateBackendPackageJson(fullPath);

  // 6. Create manifest
  createAtlasManifest(brain, fullPath, agentsConfig);

  console.log('\n✅ ATLAS injection complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Add ANTHROPIC_API_KEY to backend/.env');
  console.log('   2. Run: cd backend && npm install');
  console.log('   3. Import AtlasChat component in admin');
  console.log('\n🎉 Your business now has AI agents!\n');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/atlas-inject.cjs <variant-path>');
    console.log('Example: node scripts/atlas-inject.cjs output/prospects/121-auto-care/full-test-luxury-appetizing-visual');
    process.exit(1);
  }

  injectAtlas(args[0]);
}

module.exports = { injectAtlas };
