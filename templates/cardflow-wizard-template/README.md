# CardFlow Wizard Template

AI-powered onboarding wizard with a 5-step setup flow and intelligent assistant. This template provides a complete, customizable setup wizard for web applications.

## Features

- **5-Step Wizard Flow**: Welcome → Project Type → Business Info → Preferences → Review
- **AI Assistant**: Context-aware Claude-powered chat assistant
- **Dark Theme UI**: Modern, responsive design with smooth animations
- **Customizable Steps**: Easy to modify wizard steps and options
- **State Persistence**: Setup data saved to localStorage
- **Mobile Responsive**: Works on all screen sizes

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Anthropic API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and Express backend (port 3001).

## Project Structure

```
cardflow-wizard-template/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   ├── screens/
│   │   ├── CardFlowSetupWizard.jsx  # Main wizard component
│   │   └── index.js
│   └── components/
│       ├── CardFlowAssistant.jsx    # AI chat assistant
│       ├── index.js
│       └── wizard/
│           ├── CollapsibleSection.jsx
│           ├── WizardBreadcrumb.jsx
│           ├── Tooltip.jsx
│           ├── WhatYouGetCard.jsx
│           ├── IndustryBanner.jsx
│           ├── styles.js
│           └── index.js
├── lib/
│   └── services/
│       └── cardflow-api.cjs       # AI assistant API endpoint
├── server.cjs                     # Express server
├── vite.config.js                 # Vite configuration
├── package.json
├── .env.example
└── index.html
```

## Customization

### Modifying Wizard Steps

Edit `src/screens/CardFlowSetupWizard.jsx`:

```javascript
const STEPS = [
  { id: 'welcome', name: 'Welcome', icon: '👋' },
  { id: 'project-type', name: 'Project Type', icon: '🎯' },
  // Add or modify steps here
];
```

### Changing Project Types

Edit `PROJECT_TYPES` array in `CardFlowSetupWizard.jsx`:

```javascript
const PROJECT_TYPES = [
  {
    id: 'website',
    icon: '🌐',
    name: 'Business Website',
    desc: 'Multi-page website with full business functionality',
    features: ['Multiple pages', 'Contact forms', 'SEO optimized'],
    color: '#22c55e',
    recommended: true
  },
  // Add your custom project types
];
```

### Customizing the AI Assistant

Edit `lib/services/cardflow-api.cjs` to modify:
- System prompt and personality
- Step-specific knowledge
- Response format

Edit `src/components/CardFlowAssistant.jsx` to modify:
- UI appearance
- Quick prompts per step
- Tip content

### Styling

All styles use inline JavaScript objects for easy customization. Main style objects are in:
- `CardFlowSetupWizard.jsx` - Wizard styles
- `CardFlowAssistant.jsx` - Chat widget styles
- `wizard/styles.js` - Shared component styles

## Integration

### Using the Wizard in Your App

```javascript
import { CardFlowSetupWizard } from './screens/CardFlowSetupWizard';

function App() {
  const handleComplete = (setupData) => {
    // setupData contains:
    // {
    //   projectType: 'website',
    //   businessName: 'My Business',
    //   industry: 'Technology',
    //   location: 'Austin, TX',
    //   workflowMode: 'guided',
    //   enableTutorials: true,
    //   autoSave: true,
    //   completedAt: '2024-01-15T...'
    // }
    console.log('Setup complete:', setupData);
    // Navigate to your main application
  };

  return (
    <CardFlowSetupWizard
      onComplete={handleComplete}
      onSkip={() => console.log('Skipped')}
      initialData={{ workflowMode: 'guided' }}
    />
  );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onComplete` | `function` | Called when wizard finishes with setup data |
| `onSkip` | `function` | Called when user skips setup |
| `onBack` | `function` | Called when user goes back from step 1 |
| `initialData` | `object` | Pre-fill wizard with existing data |

### Accessing Saved Data

Setup data is persisted in localStorage:

```javascript
const isSetupComplete = localStorage.getItem('blink_setup_complete') === 'true';
const setupData = JSON.parse(localStorage.getItem('blink_setup_data') || '{}');
```

## API Reference

### POST /api/ai/cardflow-chat

Send messages to the AI assistant.

**Request:**
```json
{
  "message": "What project type should I choose?",
  "currentStep": "project-type",
  "wizardContext": {
    "projectType": null,
    "businessName": "My Bakery"
  },
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "For a bakery, I'd recommend...",
  "suggestions": {
    "projectType": "website"
  }
}
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Deploy to Railway

1. Connect your repository to Railway
2. Set environment variables (ANTHROPIC_API_KEY)
3. Deploy automatically on push

## Tech Stack

- **Frontend**: React 18, Vite 5
- **Backend**: Express 5, Node.js
- **AI**: Anthropic Claude API
- **Styling**: CSS-in-JS (inline styles)

## License

MIT
