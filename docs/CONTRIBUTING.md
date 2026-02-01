# Contributing to BLINK

This guide covers development practices, code standards, and contribution workflows.

## Development Setup

### Prerequisites

- Node.js 18.0.0+
- PostgreSQL 14+
- Redis 6+
- Git
- VS Code (recommended)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd module-library

# Install dependencies
cd module-assembler-ui
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your local settings

# Start development servers
npm run dev          # Terminal 1: Frontend
node server.cjs      # Terminal 2: Backend
```

### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## Project Structure

Understanding the codebase organization:

```
module-assembler-ui/
├── server.cjs           # API entry point
├── src/                 # React frontend
│   ├── components/      # Reusable components
│   ├── screens/         # Page components
│   └── admin/           # Admin dashboard
├── lib/                 # Backend core
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── generators/      # Code generators
│   └── configs/         # Configuration
└── backend/             # Pre-built modules
```

## Code Standards

### JavaScript/Node.js

We use CommonJS (`.cjs`) for backend compatibility:

```javascript
// Good
const express = require('express');
const { myFunction } = require('./utils.cjs');

// Export pattern
function createRoutes(deps) {
  const router = express.Router();
  // ...
  return router;
}

module.exports = { createRoutes };
```

### React Components

Functional components with hooks:

```jsx
// components/MyComponent.jsx
import React, { useState, useEffect } from 'react';

function MyComponent({ title, onAction }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

export default MyComponent;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (routes) | kebab-case.cjs | `auth-routes.cjs` |
| Files (components) | PascalCase.jsx | `UserProfile.jsx` |
| Functions | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| React Components | PascalCase | `UserProfile` |
| CSS Classes | kebab-case | `user-profile` |

### API Endpoints

Follow RESTful conventions:

```javascript
// Route patterns
GET    /api/users          // List all
GET    /api/users/:id      // Get one
POST   /api/users          // Create
PUT    /api/users/:id      // Update (full)
PATCH  /api/users/:id      // Update (partial)
DELETE /api/users/:id      // Delete
```

### Response Format

Consistent API responses:

```javascript
// Success
res.json({
  success: true,
  data: { ... }
});

// Error
res.status(400).json({
  success: false,
  error: 'Human-readable message',
  code: 'ERROR_CODE'
});
```

## Adding Features

### Adding a New Route

1. Create route file:

```javascript
// lib/routes/my-feature.cjs
const express = require('express');

function createMyFeatureRoutes(deps) {
  const router = express.Router();
  const { db, services } = deps;

  router.get('/items', async (req, res) => {
    try {
      const items = await services.getItems();
      res.json({ success: true, items });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { createMyFeatureRoutes };
```

2. Register in server.cjs:

```javascript
const { createMyFeatureRoutes } = require('./lib/routes/my-feature.cjs');
app.use('/api/my-feature', createMyFeatureRoutes(deps));
```

### Adding a New Service

```javascript
// lib/services/my-service.cjs

async function performAction(input, options = {}) {
  // Validate input
  if (!input) {
    throw new Error('Input required');
  }

  // Perform operation
  const result = await doSomething(input);

  // Return result
  return {
    success: true,
    data: result
  };
}

module.exports = {
  performAction
};
```

### Adding a New Component

```jsx
// src/components/NewComponent.jsx
import React, { useState } from 'react';

function NewComponent({ initialValue, onChange }) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div style={styles.container}>
      {/* Component content */}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    borderRadius: '8px',
    background: '#fff'
  }
};

export default NewComponent;
```

### Adding a New Backend Module

1. Create module directory:

```
backend/my-module/
├── index.js         # Router
├── controller.js    # Request handlers
├── service.js       # Business logic
├── model.js         # Database queries
└── README.md        # Documentation
```

2. Implement the module:

```javascript
// backend/my-module/index.js
const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);

module.exports = router;
```

3. Add to bundle configuration:

```javascript
// lib/configs/bundles.cjs
const BUNDLES = {
  myBundle: {
    modules: ['my-module', 'other-module'],
    description: 'My new feature bundle'
  }
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- my-component.test.jsx
```

### Writing Tests

```javascript
// src/__tests__/MyComponent.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### API Testing

```javascript
// __tests__/api/auth.test.js
const request = require('supertest');
const app = require('../../server.cjs');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
```

## Git Workflow

### Branch Naming

```
feature/add-user-profile
bugfix/fix-login-error
hotfix/security-patch
refactor/improve-generator
```

### Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: resolve login authentication error
docs: update API documentation
refactor: simplify generator logic
test: add tests for auth service
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with clear commits
3. Run tests: `npm test`
4. Create pull request
5. Request code review
6. Address feedback
7. Merge when approved

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No console.log statements
```

## Code Review Guidelines

### What to Look For

1. **Functionality** - Does it work as intended?
2. **Security** - Any vulnerabilities?
3. **Performance** - Any obvious bottlenecks?
4. **Readability** - Is the code clear?
5. **Testing** - Are there adequate tests?

### Review Etiquette

- Be constructive and specific
- Explain the "why" behind suggestions
- Acknowledge good work
- Use questions over statements

## Error Handling

### Backend Errors

```javascript
// Use try-catch consistently
router.post('/action', async (req, res) => {
  try {
    const result = await performAction(req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('[action] Error:', error.message);

    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});
```

### Frontend Errors

```jsx
// Use error boundaries
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Security Guidelines

### Input Validation

Always validate user input:

```javascript
const { body, validationResult } = require('express-validator');

router.post('/create',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    // ... proceed
  }
);
```

### SQL Injection Prevention

Use parameterized queries:

```javascript
// Good
const result = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Bad - Never do this
const result = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### Authentication

Always verify tokens:

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
```

## Performance Guidelines

### Database Queries

```javascript
// Use indexes for frequently queried columns
// Limit results when possible
const users = await db.query(
  'SELECT id, email, name FROM users ORDER BY created_at DESC LIMIT 50'
);

// Use transactions for multiple operations
const client = await db.pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO...');
  await client.query('UPDATE...');
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

### Frontend Performance

```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Render logic
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething();
}, []);
```

## Documentation

### Code Comments

```javascript
/**
 * Generate a complete website from a single sentence description.
 *
 * @param {string} input - Natural language description
 * @param {Object} options - Generation options
 * @param {string} options.deviceTarget - 'desktop', 'mobile', or 'both'
 * @param {boolean} options.autoDeploy - Deploy immediately after generation
 * @returns {Promise<Object>} Generated project details
 */
async function orchestrate(input, options = {}) {
  // Implementation
}
```

### README for New Modules

```markdown
# Module Name

Brief description of what this module does.

## Installation

How to add this module to a project.

## Configuration

Required environment variables or settings.

## API Reference

### GET /api/module/endpoint

Description of what this endpoint does.

**Request:**
```json
{ "param": "value" }
```

**Response:**
```json
{ "success": true, "data": {} }
```

## Examples

Code examples showing usage.
```

## Getting Help

### Resources

1. Read existing code for patterns
2. Check existing documentation
3. Search issues for similar problems
4. Ask in development chat

### Reporting Issues

Include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant error messages/logs
