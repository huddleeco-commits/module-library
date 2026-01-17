/**
 * Database Mock
 *
 * Mocks PostgreSQL database queries for testing without a real database.
 * Provides an in-memory data store and query simulation.
 */

// In-memory data stores
let users = new Map();
let subscriptions = new Map();
let referralCodes = new Map();
let apiUsage = new Map();
let fraudEvents = new Map();

// Default test data
const defaultUsers = [
  {
    id: 1,
    email: 'test@example.com',
    password_hash: '$2a$10$test_hash_for_password123', // password: 'password123'
    full_name: 'Test User',
    subscription_tier: 'free',
    subscription_status: 'active',
    is_admin: false,
    scans_used: 5,
    ebay_listings_used: 0,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: new Date(),
    reset_token: null,
    reset_token_expires: null
  },
  {
    id: 2,
    email: 'admin@example.com',
    password_hash: '$2a$10$test_hash_for_admin123',
    full_name: 'Admin User',
    subscription_tier: 'dealer',
    subscription_status: 'active',
    is_admin: true,
    scans_used: 0,
    ebay_listings_used: 0,
    stripe_customer_id: 'cus_test_admin',
    stripe_subscription_id: 'sub_test_admin',
    created_at: new Date(),
    reset_token: null,
    reset_token_expires: null
  },
  {
    id: 3,
    email: 'pro@example.com',
    password_hash: '$2a$10$test_hash_for_pro123',
    full_name: 'Pro User',
    subscription_tier: 'power',
    subscription_status: 'active',
    is_admin: false,
    scans_used: 45,
    ebay_listings_used: 10,
    stripe_customer_id: 'cus_test_pro',
    stripe_subscription_id: 'sub_test_pro',
    created_at: new Date(),
    reset_token: null,
    reset_token_expires: null
  }
];

const defaultReferralCodes = [
  { id: 1, code: 'testref', active: true, total_signups: 5 },
  { id: 2, code: 'inactive', active: false, total_signups: 0 }
];

// Initialize with default data
function initializeData() {
  users.clear();
  subscriptions.clear();
  referralCodes.clear();
  apiUsage.clear();
  fraudEvents.clear();

  defaultUsers.forEach(user => users.set(user.id, { ...user }));
  defaultReferralCodes.forEach(code => referralCodes.set(code.id, { ...code }));
}

// Initialize on module load
initializeData();

// Track last insert ID for auto-increment simulation
let lastUserId = defaultUsers.length;
let lastSubscriptionId = 0;

// Mock state
let shouldFail = false;
let failureError = null;
let queryLog = [];

/**
 * Parse SQL query and execute against in-memory store
 */
function executeQuery(text, params = []) {
  queryLog.push({ text, params, timestamp: new Date() });

  if (shouldFail) {
    throw failureError || new Error('Database query failed');
  }

  // Normalize query
  const normalizedQuery = text.toLowerCase().trim();

  // SELECT queries
  if (normalizedQuery.startsWith('select')) {
    return handleSelect(text, params);
  }

  // INSERT queries
  if (normalizedQuery.startsWith('insert')) {
    return handleInsert(text, params);
  }

  // UPDATE queries
  if (normalizedQuery.startsWith('update')) {
    return handleUpdate(text, params);
  }

  // DELETE queries
  if (normalizedQuery.startsWith('delete')) {
    return handleDelete(text, params);
  }

  // Default: return empty result
  return { rows: [], rowCount: 0 };
}

function handleSelect(text, params) {
  const lowerText = text.toLowerCase();

  // Users table
  if (lowerText.includes('from users')) {
    if (lowerText.includes('where email')) {
      const email = params[0];
      const user = Array.from(users.values()).find(u => u.email === email);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (lowerText.includes('where id')) {
      const id = parseInt(params[0]);
      const user = users.get(id);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (lowerText.includes('where stripe_customer_id')) {
      const customerId = params[0];
      const user = Array.from(users.values()).find(u => u.stripe_customer_id === customerId);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    if (lowerText.includes('where reset_token')) {
      const token = params[0];
      const user = Array.from(users.values()).find(u =>
        u.reset_token === token && u.reset_token_expires > params[1]
      );
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }
    // Return all users
    return { rows: Array.from(users.values()), rowCount: users.size };
  }

  // Subscriptions table
  if (lowerText.includes('from subscriptions')) {
    if (lowerText.includes('where user_id')) {
      const userId = parseInt(params[0]);
      const userSubs = Array.from(subscriptions.values())
        .filter(s => s.user_id === userId)
        .sort((a, b) => b.created_at - a.created_at);
      return { rows: userSubs.slice(0, 1), rowCount: userSubs.length > 0 ? 1 : 0 };
    }
    return { rows: Array.from(subscriptions.values()), rowCount: subscriptions.size };
  }

  // Referral codes table
  if (lowerText.includes('from referral_codes')) {
    if (lowerText.includes('where code')) {
      const code = params[0]?.toLowerCase();
      const refCode = Array.from(referralCodes.values())
        .find(r => r.code === code && r.active === true);
      return { rows: refCode ? [refCode] : [], rowCount: refCode ? 1 : 0 };
    }
    return { rows: Array.from(referralCodes.values()), rowCount: referralCodes.size };
  }

  // API usage table
  if (lowerText.includes('from api_usage')) {
    if (lowerText.includes('count(*)')) {
      const userId = parseInt(params[0]);
      const count = Array.from(apiUsage.values())
        .filter(u => u.user_id === userId)
        .length;
      return { rows: [{ scan_count: count }], rowCount: 1 };
    }
    return { rows: Array.from(apiUsage.values()), rowCount: apiUsage.size };
  }

  return { rows: [], rowCount: 0 };
}

function handleInsert(text, params) {
  const lowerText = text.toLowerCase();

  // Users table
  if (lowerText.includes('into users')) {
    lastUserId++;
    const newUser = {
      id: lastUserId,
      email: params[0],
      password_hash: params[1],
      full_name: params[2],
      referred_by: params[3] || null,
      referral_code_id: params[4] || null,
      referred_at: params[5] || null,
      subscription_tier: 'free',
      subscription_status: 'active',
      is_admin: false,
      scans_used: 0,
      ebay_listings_used: 0,
      created_at: new Date()
    };
    users.set(lastUserId, newUser);
    return { rows: [{ id: lastUserId }], rowCount: 1 };
  }

  // Subscriptions table
  if (lowerText.includes('into subscriptions')) {
    lastSubscriptionId++;
    const newSub = {
      id: lastSubscriptionId,
      user_id: parseInt(params[0]),
      stripe_customer_id: params[1],
      stripe_subscription_id: params[2],
      stripe_price_id: params[3],
      plan_name: params[4],
      status: 'active',
      created_at: new Date()
    };
    subscriptions.set(lastSubscriptionId, newSub);
    return { rows: [{ id: lastSubscriptionId }], rowCount: 1 };
  }

  return { rows: [], rowCount: 1 };
}

function handleUpdate(text, params) {
  const lowerText = text.toLowerCase();

  // Users table
  if (lowerText.includes('update users')) {
    let userId;
    let updateData = {};

    // Parse the WHERE clause to find the user ID
    if (lowerText.includes('where id')) {
      userId = parseInt(params[params.length - 1]);
    } else if (lowerText.includes('where stripe_customer_id')) {
      const customerId = params[params.length - 1];
      const user = Array.from(users.values()).find(u => u.stripe_customer_id === customerId);
      userId = user?.id;
    }

    if (userId && users.has(userId)) {
      const user = users.get(userId);

      // Parse SET clauses (simplified - handles common patterns)
      if (lowerText.includes('subscription_tier')) {
        user.subscription_tier = params[0] || 'free';
      }
      if (lowerText.includes('subscription_status')) {
        const statusIdx = lowerText.indexOf('subscription_status');
        user.subscription_status = params[statusIdx > -1 ? 0 : 1] || 'active';
      }
      if (lowerText.includes('stripe_customer_id')) {
        user.stripe_customer_id = params.find(p => p?.startsWith('cus_')) || null;
      }
      if (lowerText.includes('stripe_subscription_id')) {
        user.stripe_subscription_id = params.find(p => p?.startsWith('sub_')) || null;
      }
      if (lowerText.includes('password_hash')) {
        user.password_hash = params[0];
      }
      if (lowerText.includes('reset_token')) {
        if (params[0] === null || lowerText.includes('reset_token = null')) {
          user.reset_token = null;
          user.reset_token_expires = null;
        } else {
          user.reset_token = params[0];
          user.reset_token_expires = params[1];
        }
      }
      if (lowerText.includes('scans_used = 0')) {
        user.scans_used = 0;
      }

      users.set(userId, user);
      return { rows: [user], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  // Referral codes table
  if (lowerText.includes('update referral_codes')) {
    const refId = parseInt(params[params.length - 1]);
    if (referralCodes.has(refId)) {
      const code = referralCodes.get(refId);
      if (lowerText.includes('total_signups')) {
        code.total_signups++;
      }
      referralCodes.set(refId, code);
      return { rows: [code], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  return { rows: [], rowCount: 1 };
}

function handleDelete(text, params) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('from users')) {
    const userId = parseInt(params[0]);
    if (users.has(userId)) {
      users.delete(userId);
      return { rowCount: 1 };
    }
  }

  return { rowCount: 0 };
}

/**
 * Mock database query function
 */
const query = jest.fn().mockImplementation(async (text, params = []) => {
  return executeQuery(text, params);
});

/**
 * The main mock database object
 */
const dbMock = {
  query,

  // Pool-like interface for compatibility
  pool: {
    query,
    connect: jest.fn().mockResolvedValue({
      query,
      release: jest.fn()
    }),
    end: jest.fn().mockResolvedValue(undefined)
  },

  // Test utilities
  _reset: () => {
    initializeData();
    lastUserId = defaultUsers.length;
    lastSubscriptionId = 0;
    shouldFail = false;
    failureError = null;
    queryLog = [];
    jest.clearAllMocks();
  },

  _setFailure: (error = null) => {
    shouldFail = true;
    failureError = error;
  },

  _clearFailure: () => {
    shouldFail = false;
    failureError = null;
  },

  _addUser: (userData) => {
    lastUserId++;
    const user = {
      id: lastUserId,
      email: userData.email,
      password_hash: userData.password_hash || '$2a$10$test_hash',
      full_name: userData.full_name || 'Test User',
      subscription_tier: userData.subscription_tier || 'free',
      subscription_status: userData.subscription_status || 'active',
      is_admin: userData.is_admin || false,
      scans_used: userData.scans_used || 0,
      ebay_listings_used: userData.ebay_listings_used || 0,
      stripe_customer_id: userData.stripe_customer_id || null,
      stripe_subscription_id: userData.stripe_subscription_id || null,
      created_at: userData.created_at || new Date(),
      reset_token: userData.reset_token || null,
      reset_token_expires: userData.reset_token_expires || null,
      ...userData
    };
    users.set(lastUserId, user);
    return user;
  },

  _getUser: (userId) => users.get(userId),

  _getUserByEmail: (email) => Array.from(users.values()).find(u => u.email === email),

  _updateUser: (userId, updates) => {
    if (users.has(userId)) {
      const user = users.get(userId);
      users.set(userId, { ...user, ...updates });
      return users.get(userId);
    }
    return null;
  },

  _deleteUser: (userId) => {
    return users.delete(userId);
  },

  _getQueryLog: () => [...queryLog],

  _clearQueryLog: () => {
    queryLog = [];
  },

  // Access to internal data for assertions
  _data: {
    users: () => new Map(users),
    subscriptions: () => new Map(subscriptions),
    referralCodes: () => new Map(referralCodes),
    apiUsage: () => new Map(apiUsage)
  },

  // Default test users for reference
  testUsers: defaultUsers
};

module.exports = dbMock;
