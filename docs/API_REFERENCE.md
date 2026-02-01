# BLINK API Reference

Complete documentation for the BLINK API endpoints.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscriptionTier": "free",
    "isAdmin": false
  }
}
```

**Errors:**
- `400` - Invalid email or password format
- `409` - Email already registered

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscriptionTier": "free",
    "isAdmin": false,
    "points": 150,
    "tier": "bronze"
  }
}
```

**Demo Accounts:**
- `demo@demo.com` / `demo1234` - Standard user
- `admin@demo.com` / `admin1234` - Admin user

---

### GET /api/auth/me

Get current user profile. Requires authentication.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "subscriptionTier": "premium",
    "isAdmin": false
  }
}
```

---

### POST /api/auth/refresh

Refresh an expiring JWT token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST /api/auth/logout

Invalidate the current session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/forgot-password

Request a password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### POST /api/auth/reset-password

Reset password using a token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Configuration Endpoints

### GET /api/config/bundles

Get available feature bundles.

**Response:**
```json
{
  "success": true,
  "bundles": [
    {
      "id": "core",
      "name": "Core Bundle",
      "description": "Essential features for any website",
      "modules": ["auth", "dashboard", "notifications"]
    },
    {
      "id": "commerce",
      "name": "Commerce Bundle",
      "modules": ["stripe-payments", "orders", "inventory"]
    }
  ]
}
```

---

### GET /api/config/industries

Get industry presets with recommended configurations.

**Response:**
```json
{
  "success": true,
  "industries": [
    {
      "id": "restaurant",
      "name": "Restaurant",
      "icon": "🍽️",
      "bundles": ["core", "commerce", "booking"],
      "pages": ["home", "menu", "about", "contact", "reservations"],
      "colorPreset": {
        "primary": "#8B4513",
        "secondary": "#D2691E"
      }
    }
  ]
}
```

---

### GET /api/config/layout-options

Get available layout configurations.

**Response:**
```json
{
  "success": true,
  "layouts": [
    {
      "id": "hero-split",
      "name": "Split Hero",
      "description": "Hero with image on one side, content on the other",
      "category": "modern"
    }
  ]
}
```

---

### GET /api/config/visual-archetypes

Get design archetypes (luxury, local, ecommerce).

**Response:**
```json
{
  "success": true,
  "archetypes": [
    {
      "id": "luxury",
      "name": "Luxury",
      "description": "Premium, high-end aesthetics",
      "colors": { "primary": "#1a1a2e", "accent": "#d4af37" },
      "typography": { "heading": "Playfair Display", "body": "Inter" }
    }
  ]
}
```

---

### GET /api/config/icons

Get available Lucide icon mappings.

**Response:**
```json
{
  "success": true,
  "icons": {
    "home": "Home",
    "menu": "Menu",
    "phone": "Phone",
    "calendar": "Calendar"
  }
}
```

---

## Orchestrator Endpoints

### POST /api/orchestrate

Generate a complete website from a single sentence description.

**Request Body:**
```json
{
  "input": "Create a luxury steakhouse website for Aurelius in Manhattan with online reservations",
  "deviceTarget": "both",
  "autoDeploy": false,
  "includeCompanionApp": false
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| input | string | Yes | Natural language description (min 3 chars) |
| deviceTarget | string | No | `"desktop"`, `"mobile"`, or `"both"` (default) |
| autoDeploy | boolean | No | Deploy immediately after generation |
| includeCompanionApp | boolean | No | Generate mobile companion app |
| industryKey | string | No | Override AI industry detection |

**Response:**
```json
{
  "success": true,
  "project": {
    "name": "aurelius-steakhouse",
    "path": "/path/to/generated-projects/aurelius-steakhouse",
    "tier": "L3",
    "industry": "restaurant",
    "pages": ["home", "menu", "reservations", "about", "contact"]
  },
  "analysis": {
    "detectedIndustry": "restaurant",
    "recommendedTier": "L3",
    "extractedFeatures": ["reservations", "menu", "gallery"]
  },
  "timing": {
    "total": 45000,
    "analysis": 2000,
    "generation": 40000,
    "validation": 3000
  }
}
```

**Rate Limit:** 10 requests per minute

---

### POST /api/orchestrate/detect-intent

Analyze user input without generating.

**Request Body:**
```json
{
  "input": "pizza shop with online ordering"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "industry": "restaurant",
    "subIndustry": "pizzeria",
    "businessName": null,
    "location": null,
    "features": ["online-ordering", "menu"],
    "recommendedTier": "L3",
    "confidence": 0.92
  }
}
```

---

### POST /api/orchestrate/recommend

Get tier and feature recommendations.

**Request Body:**
```json
{
  "industry": "restaurant",
  "features": ["booking", "payments"],
  "budget": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "tier": "L3",
    "estimatedCost": "$0.80",
    "estimatedTime": "5 minutes",
    "includedModules": ["auth", "booking", "stripe-payments"],
    "suggestedPages": ["home", "menu", "reservations", "about", "contact"]
  }
}
```

---

## App Generation Endpoints

### POST /api/apps/generate

Generate a focused application (expense tracker, habit tracker, etc.).

**Request Body:**
```json
{
  "templateId": "expense-tracker",
  "config": {
    "appName": "My Budget App",
    "features": ["categories", "charts", "export"]
  },
  "branding": {
    "primaryColor": "#6366f1",
    "logo": "https://example.com/logo.png"
  }
}
```

**Available Templates:**
- `expense-tracker`
- `habit-tracker`
- `todo-app`
- `workout-log`
- `meal-planner`

**Response:**
```json
{
  "success": true,
  "project": {
    "name": "My Budget App",
    "path": "/path/to/output/apps/my-budget-app-1234567890.html",
    "filename": "my-budget-app-1234567890.html",
    "type": "app",
    "template": "expense-tracker",
    "downloadUrl": "/api/apps/download/my-budget-app-1234567890.html",
    "previewUrl": "/api/apps/preview/my-budget-app-1234567890.html"
  }
}
```

---

### GET /api/apps/templates

List available app templates.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "expense-tracker",
      "name": "Expense Tracker",
      "description": "Track income and expenses with charts",
      "features": ["categories", "recurring", "charts", "export"]
    }
  ]
}
```

---

### GET /api/apps/preview/:filename

Preview a generated app in the browser.

---

### GET /api/apps/download/:filename

Download a generated app HTML file.

---

## Deployment Endpoints

### POST /api/deploy

Deploy a generated project to Railway.

**Request Body:**
```json
{
  "projectPath": "/path/to/generated-projects/my-project",
  "projectName": "my-project",
  "adminEmail": "admin@example.com",
  "appType": "fullstack",
  "stream": true
}
```

**Response (non-streaming):**
```json
{
  "success": true,
  "deployment": {
    "id": "deploy-123",
    "status": "deploying",
    "urls": {
      "frontend": "https://my-project.up.railway.app",
      "admin": "https://admin-my-project.up.railway.app",
      "backend": "https://api-my-project.up.railway.app"
    }
  }
}
```

**SSE Streaming (when `stream: true`):**
The endpoint returns Server-Sent Events with progress updates.

---

### GET /api/deploy/status/:deploymentId

Check deployment status.

**Response:**
```json
{
  "success": true,
  "status": "deployed",
  "deployment": {
    "id": "deploy-123",
    "startedAt": "2024-01-18T12:00:00Z",
    "completedAt": "2024-01-18T12:02:30Z",
    "urls": {
      "frontend": "https://my-project.up.railway.app",
      "admin": "https://admin-my-project.up.railway.app"
    }
  }
}
```

**Status Values:**
- `pending` - Waiting to start
- `deploying` - In progress
- `deployed` - Successfully deployed
- `failed` - Deployment failed

---

### GET /api/deploy/railway-status

Check Railway service status and quota.

**Response:**
```json
{
  "success": true,
  "railway": {
    "connected": true,
    "projects": 5,
    "quota": {
      "used": "$12.50",
      "limit": "$25.00"
    }
  }
}
```

---

## Studio Endpoints

### POST /api/studio/preview

Generate a design preview without saving.

**Request Body:**
```json
{
  "industry": "restaurant",
  "businessName": "Mario's Pizza",
  "colors": {
    "primary": "#c41e3a",
    "secondary": "#ffd700"
  },
  "layout": "hero-centered"
}
```

**Response:**
```json
{
  "success": true,
  "preview": {
    "html": "<html>...",
    "css": "/* styles */",
    "thumbnail": "data:image/png;base64,..."
  }
}
```

---

### POST /api/studio/style

Apply styling to a project.

**Request Body:**
```json
{
  "projectPath": "/path/to/project",
  "theme": {
    "colors": { "primary": "#6366f1" },
    "fonts": { "heading": "Playfair Display" },
    "borderRadius": "8px"
  }
}
```

---

### GET /api/studio/themes

Get predefined themes.

**Response:**
```json
{
  "success": true,
  "themes": [
    {
      "id": "midnight",
      "name": "Midnight",
      "colors": { "primary": "#1a1a2e", "accent": "#e94560" }
    }
  ]
}
```

---

## Content Generation Endpoints

### POST /api/content/generate

Generate content using AI.

**Request Body:**
```json
{
  "type": "blog-post",
  "topic": "5 Tips for Restaurant Marketing",
  "industry": "restaurant",
  "tone": "professional",
  "length": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "title": "5 Tips for Restaurant Marketing",
    "body": "...",
    "summary": "...",
    "keywords": ["restaurant", "marketing", "tips"]
  }
}
```

---

### POST /api/content/schedule

Schedule content for publishing.

**Request Body:**
```json
{
  "contentId": "content-123",
  "platforms": ["twitter", "facebook"],
  "scheduledAt": "2024-01-20T10:00:00Z"
}
```

---

## Social Media Endpoints

### GET /api/social/accounts

Get connected social media accounts.

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "platform": "twitter",
      "username": "@mybusiness",
      "connected": true
    }
  ]
}
```

---

### POST /api/social/publish

Publish content to social platforms.

**Request Body:**
```json
{
  "content": "Check out our new menu!",
  "platforms": ["twitter", "facebook"],
  "image": "https://example.com/image.jpg"
}
```

---

## Utility Endpoints

### POST /api/utility/extract-pdf

Extract text from a PDF file.

**Request:** `multipart/form-data` with PDF file

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "pages": 5
}
```

---

### POST /api/utility/screenshot

Generate a screenshot of a URL.

**Request Body:**
```json
{
  "url": "https://example.com",
  "width": 1200,
  "height": 800,
  "fullPage": false
}
```

**Response:**
```json
{
  "success": true,
  "screenshot": "data:image/png;base64,..."
}
```

---

## Health & Status Endpoints

### GET /api/health

Basic health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-18T12:00:00Z",
  "version": "2.0.0"
}
```

---

### GET /api/auth/health

Authentication service health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-18T12:00:00Z",
  "database": "connected"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limits

| Endpoint Category | Limit |
|------------------|-------|
| Authentication | 5 requests/minute |
| Orchestrator | 10 requests/minute |
| Content Generation | 20 requests/minute |
| General API | 100 requests/minute |

Exceeded limits return `429` with a `Retry-After` header.

---

## WebSocket Events

For real-time updates, connect to: `ws://localhost:3001/ws`

**Event Types:**
- `generation:progress` - Generation progress updates
- `deployment:status` - Deployment status changes
- `build:result` - Build validation results

Example:
```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.payload);
};
```
