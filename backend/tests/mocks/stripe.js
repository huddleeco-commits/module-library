/**
 * Stripe API Mock
 *
 * Mocks all Stripe API calls for testing without making real API requests.
 * Provides configurable responses for different test scenarios.
 */

// Default mock data
const defaultData = {
  customers: new Map(),
  subscriptions: new Map(),
  checkoutSessions: new Map(),
  paymentIntents: new Map(),
  invoices: new Map()
};

// Mock state
let mockData = { ...defaultData };
let mockResponses = {};
let shouldFail = false;
let failureError = null;

/**
 * Create a mock checkout session
 */
const createCheckoutSession = jest.fn().mockImplementation(async (params) => {
  if (shouldFail) {
    throw failureError || new Error('Stripe checkout failed');
  }

  const sessionId = `cs_test_${Date.now()}`;
  const session = {
    id: sessionId,
    object: 'checkout.session',
    customer: params.customer || null,
    customer_email: params.customer_email,
    client_reference_id: params.client_reference_id,
    mode: params.mode || 'subscription',
    payment_status: 'unpaid',
    status: 'open',
    url: `https://checkout.stripe.com/test/${sessionId}`,
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    subscription: params.mode === 'subscription' ? `sub_test_${Date.now()}` : null,
    metadata: params.metadata || {},
    line_items: params.line_items,
    created: Math.floor(Date.now() / 1000)
  };

  mockData.checkoutSessions.set(sessionId, session);
  return session;
});

/**
 * Create a mock customer
 */
const createCustomer = jest.fn().mockImplementation(async (params) => {
  if (shouldFail) {
    throw failureError || new Error('Stripe customer creation failed');
  }

  const customerId = `cus_test_${Date.now()}`;
  const customer = {
    id: customerId,
    object: 'customer',
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
    created: Math.floor(Date.now() / 1000)
  };

  mockData.customers.set(customerId, customer);
  return customer;
});

/**
 * Retrieve a mock subscription
 */
const retrieveSubscription = jest.fn().mockImplementation(async (subscriptionId) => {
  if (shouldFail) {
    throw failureError || new Error('Stripe subscription retrieval failed');
  }

  // Check if we have a stored subscription
  if (mockData.subscriptions.has(subscriptionId)) {
    return mockData.subscriptions.get(subscriptionId);
  }

  // Return a default subscription
  return {
    id: subscriptionId,
    object: 'subscription',
    status: 'active',
    customer: 'cus_test_123',
    current_period_start: Math.floor(Date.now() / 1000) - 86400 * 30,
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
    items: {
      data: [{
        id: 'si_test_123',
        price: {
          id: 'price_test_pro_monthly',
          product: 'prod_test_pro',
          unit_amount: 2900,
          currency: 'usd',
          recurring: {
            interval: 'month'
          }
        }
      }]
    },
    metadata: {}
  };
});

/**
 * Cancel a mock subscription
 */
const cancelSubscription = jest.fn().mockImplementation(async (subscriptionId) => {
  if (shouldFail) {
    throw failureError || new Error('Stripe subscription cancellation failed');
  }

  const subscription = mockData.subscriptions.get(subscriptionId) || {
    id: subscriptionId,
    object: 'subscription'
  };

  subscription.status = 'canceled';
  subscription.canceled_at = Math.floor(Date.now() / 1000);
  mockData.subscriptions.set(subscriptionId, subscription);

  return subscription;
});

/**
 * Create billing portal session
 */
const createBillingPortalSession = jest.fn().mockImplementation(async (params) => {
  if (shouldFail) {
    throw failureError || new Error('Stripe portal session creation failed');
  }

  return {
    id: `bps_test_${Date.now()}`,
    object: 'billing_portal.session',
    customer: params.customer,
    url: `https://billing.stripe.com/test/session_${Date.now()}`,
    return_url: params.return_url,
    created: Math.floor(Date.now() / 1000)
  };
});

/**
 * Construct webhook event
 */
const constructEvent = jest.fn().mockImplementation((payload, signature, secret) => {
  if (shouldFail) {
    throw failureError || new Error('Webhook signature verification failed');
  }

  // Parse the payload if it's a buffer
  const body = Buffer.isBuffer(payload) ? JSON.parse(payload.toString()) : payload;

  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: body.type || 'checkout.session.completed',
    data: body.data || {
      object: {
        id: 'cs_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        client_reference_id: '1'
      }
    },
    created: Math.floor(Date.now() / 1000)
  };
});

/**
 * The main mock object that mimics the Stripe SDK structure
 */
const stripeMock = {
  checkout: {
    sessions: {
      create: createCheckoutSession,
      retrieve: jest.fn().mockImplementation(async (sessionId) => {
        return mockData.checkoutSessions.get(sessionId) || {
          id: sessionId,
          object: 'checkout.session',
          payment_status: 'paid',
          status: 'complete'
        };
      })
    }
  },
  customers: {
    create: createCustomer,
    retrieve: jest.fn().mockImplementation(async (customerId) => {
      return mockData.customers.get(customerId) || {
        id: customerId,
        object: 'customer',
        email: 'test@example.com'
      };
    }),
    update: jest.fn().mockResolvedValue({ id: 'cus_test_123', object: 'customer' })
  },
  subscriptions: {
    retrieve: retrieveSubscription,
    cancel: cancelSubscription,
    update: jest.fn().mockImplementation(async (subscriptionId, params) => {
      const subscription = mockData.subscriptions.get(subscriptionId) || { id: subscriptionId };
      return { ...subscription, ...params };
    })
  },
  billingPortal: {
    sessions: {
      create: createBillingPortalSession
    }
  },
  webhooks: {
    constructEvent: constructEvent
  },
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: `pi_test_${Date.now()}`,
      status: 'requires_payment_method',
      client_secret: 'pi_test_secret'
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_123',
      status: 'succeeded'
    })
  },

  // Test utilities
  _reset: () => {
    mockData = {
      customers: new Map(),
      subscriptions: new Map(),
      checkoutSessions: new Map(),
      paymentIntents: new Map(),
      invoices: new Map()
    };
    mockResponses = {};
    shouldFail = false;
    failureError = null;
    jest.clearAllMocks();
  },

  _setMockResponse: (method, response) => {
    mockResponses[method] = response;
  },

  _setFailure: (error = null) => {
    shouldFail = true;
    failureError = error;
  },

  _clearFailure: () => {
    shouldFail = false;
    failureError = null;
  },

  _addSubscription: (subscriptionId, subscriptionData) => {
    mockData.subscriptions.set(subscriptionId, subscriptionData);
  },

  _addCustomer: (customerId, customerData) => {
    mockData.customers.set(customerId, customerData);
  }
};

module.exports = stripeMock;
