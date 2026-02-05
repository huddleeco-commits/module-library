# ATLAS AI Module

AI-powered business agents for Blink-generated projects.

## Files

```
atlas-ai/
├── module.json              # Module configuration
├── agents.json.template     # Agent config template
├── routes/
│   └── ai.js               # Express API endpoint
├── components/
│   └── AgentChat.jsx       # React chat component
└── README.md
```

## Quick Integration

### 1. Backend Setup

Add to your `server.js`:

```javascript
// After other route imports
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);
```

Add to `package.json` dependencies:

```json
"@anthropic-ai/sdk": "^0.10.0"
```

Add to `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Create agents.json

Copy `agents.json.template` to `admin/agents.json` and replace placeholders:

- `{{BUSINESS_NAME}}` → Your business name
- `{{BUSINESS_TYPE}}` → Industry type (restaurant, salon, etc.)
- `{{BUSINESS_ADDRESS}}` → Business address
- `{{BUSINESS_PHONE}}` → Phone number
- `{{GENERATED_AT}}` → Current timestamp

### 3. Frontend Setup

Import and use the component:

```jsx
import AgentChat from './components/AgentChat';

function AdminDashboard() {
  return (
    <div>
      <h1>AI Agents</h1>
      <AgentChat apiBase="http://localhost:5000" />
    </div>
  );
}
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ai/agents` | List available agents |
| POST | `/api/ai/chat` | Chat with an agent |
| GET | `/api/ai/health` | Health check |

### Chat Request

```json
POST /api/ai/chat
{
  "agentId": "support",
  "message": "What are your hours?",
  "conversationHistory": []
}
```

### Chat Response

```json
{
  "agentId": "support",
  "agentName": "Support",
  "agentIcon": "🎧",
  "message": "We're open Monday-Friday 9am-5pm...",
  "usage": {
    "inputTokens": 150,
    "outputTokens": 75
  }
}
```

## Customizing Agents

Edit `admin/agents.json` to:

- Add new agents
- Modify system prompts
- Change icons and colors
- Adjust token limits

Example agent:

```json
{
  "id": "custom-agent",
  "name": "My Agent",
  "role": "Custom Role",
  "icon": "🤖",
  "color": "#3B82F6",
  "category": "operations",
  "systemPrompt": "You are a custom agent...",
  "capabilities": ["task1", "task2"]
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiBase` | string | `''` | Backend API URL |
| `defaultAgent` | string | `null` | Agent ID to auto-select |
| `showAgentList` | boolean | `true` | Show agent selector buttons |
| `className` | string | `''` | Additional CSS classes |
