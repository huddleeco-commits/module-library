# Blink Platform Test Suite

Comprehensive test suite for the Blink platform covering backend modules, frontend components, and integration testing.

## Test Structure

```
module-library/
├── backend/
│   ├── tests/
│   │   ├── jest.config.js       # Backend Jest configuration
│   │   ├── setup.js             # Test setup and global mocks
│   │   ├── globalSetup.js       # Runs once before all tests
│   │   ├── globalTeardown.js    # Runs once after all tests
│   │   ├── mocks/
│   │   │   ├── stripe.js        # Stripe API mock
│   │   │   ├── claude.js        # Claude/Anthropic API mock
│   │   │   ├── ebay.js          # eBay API mock
│   │   │   └── database.js      # PostgreSQL mock
│   │   ├── unit/
│   │   │   ├── auth.test.js     # Authentication unit tests
│   │   │   ├── validation.test.js # Input validation tests
│   │   │   └── fraud.test.js    # Fraud detection tests
│   │   └── integration/
│   │       ├── auth.routes.test.js  # Auth API tests
│   │       ├── payments.test.js     # Stripe integration tests
│   │       └── ai.test.js           # Claude integration tests
│   └── package.json
│
├── module-assembler-ui/
│   ├── src/
│   │   └── __tests__/
│   │       ├── jest.config.js   # Frontend Jest configuration
│   │       ├── setup.js         # React Testing Library setup
│   │       ├── mocks/
│   │       │   └── fileMock.js  # Static asset mock
│   │       ├── components/
│   │       │   ├── Button.test.jsx
│   │       │   └── FileUpload.test.jsx
│   │       └── hooks/
│   │           └── useWindowSize.test.js
│   ├── babel.config.cjs
│   └── package.json
│
└── .github/
    └── workflows/
        └── test.yml             # CI/CD workflow
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd module-assembler-ui

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Categories

### Backend Unit Tests

| Test File | Coverage |
|-----------|----------|
| `auth.test.js` | Password hashing, JWT generation/validation, middleware |
| `validation.test.js` | Email, phone, password validation, XSS/SQL injection detection |
| `fraud.test.js` | Risk scoring, velocity tracking, fingerprinting, bot detection |

### Backend Integration Tests

| Test File | Coverage |
|-----------|----------|
| `auth.routes.test.js` | Register, login, profile endpoints |
| `payments.test.js` | Stripe checkout, subscriptions, webhooks |
| `ai.test.js` | Claude Vision card scanning, response parsing |

### Frontend Tests

| Test File | Coverage |
|-----------|----------|
| `Button.test.jsx` | Button rendering, interactions, variants |
| `FileUpload.test.jsx` | Drag-and-drop, file validation, preview |
| `useWindowSize.test.js` | Responsive breakpoint detection |

## Mock Services

All external APIs are fully mocked to ensure:
- **No real API calls** during tests
- **Fast test execution**
- **Consistent, predictable results**
- **No API keys required**

### Stripe Mock (`mocks/stripe.js`)

```javascript
// Configure mock responses
stripeMock._setFailure(new Error('Card declined'));
stripeMock._addSubscription('sub_123', { status: 'active' });

// Access mock data
const session = await stripeMock.checkout.sessions.create({...});
```

### Claude Mock (`mocks/claude.js`)

```javascript
// Set custom card response
claudeMock._setCardResponse({
  player: 'Custom Player',
  year: 2024,
  is_graded: true,
  grade: '10'
});

// Simulate API failure
claudeMock._setFailure(new Error('Rate limit exceeded'));
```

### Database Mock (`mocks/database.js`)

```javascript
// Add test user
dbMock._addUser({
  email: 'test@example.com',
  subscription_tier: 'power'
});

// Query database
const result = await dbMock.query('SELECT * FROM users WHERE id = $1', [1]);
```

## Test Utilities

Available via `global.testUtils` in backend tests:

```javascript
// Generate JWT token
const token = global.testUtils.generateTestToken(userId, email, isAdmin);

// Create mock request/response
const req = global.testUtils.createMockRequest({ headers: {...} });
const res = global.testUtils.createMockResponse();

// Wait for async operations
await global.testUtils.wait(100);
```

## CI/CD Integration

Tests run automatically on:
- Push to `main`, `master`, or `develop` branches
- Pull requests targeting these branches

The GitHub Actions workflow:
1. Runs backend tests (Node 18.x and 20.x)
2. Runs frontend tests (Node 18.x and 20.x)
3. Builds the frontend
4. Uploads coverage reports to Codecov

## Writing New Tests

### Backend Test Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Reset mocks
    stripeMock._reset();
    dbMock._reset();
  });

  test('should do something', async () => {
    // Arrange
    const input = {...};

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

### Frontend Test Template

```jsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('Component Name', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByTestId('my-element')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Backend Branches | 50% | - |
| Backend Functions | 50% | - |
| Backend Lines | 50% | - |
| Frontend Branches | 30% | - |
| Frontend Functions | 30% | - |
| Frontend Lines | 30% | - |

Coverage thresholds are intentionally conservative for initial setup. Increase as test coverage grows.

## Troubleshooting

### Tests Failing with "Module not found"

Ensure all dependencies are installed:
```bash
npm install
```

### Timeout Errors

Increase test timeout in jest.config.js:
```javascript
testTimeout: 15000
```

### Mock Not Working

Ensure mocks are imported before the module under test:
```javascript
// Correct order
jest.mock('stripe', () => require('./mocks/stripe'));
const stripeService = require('../services/stripe');
```

### Frontend Tests Failing

Check that babel.config.cjs exists and is configured correctly.
