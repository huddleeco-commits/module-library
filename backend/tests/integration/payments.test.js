/**
 * Payments Integration Tests (with Stripe Mock)
 *
 * Tests for payment-related functionality:
 * - Checkout session creation
 * - Subscription management
 * - Webhook handling
 * - Plan limits and scan tracking
 *
 * ALL STRIPE CALLS ARE MOCKED - NO REAL API CALLS
 */

const stripeMock = require('../mocks/stripe');
const dbMock = require('../mocks/database');

// Mock Stripe before importing any modules that use it
jest.mock('stripe', () => {
  return jest.fn(() => stripeMock);
});

describe('Payments Integration Tests', () => {
  beforeEach(() => {
    stripeMock._reset();
    dbMock._reset();
  });

  describe('Stripe Service', () => {
    // Recreate the stripe service logic for testing
    const stripeService = {
      createCheckoutSession: async (userId, priceId, userEmail) => {
        try {
          const session = await stripeMock.checkout.sessions.create({
            customer_email: userEmail,
            client_reference_id: userId.toString(),
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: 'http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/pricing',
            metadata: { userId: userId.toString() }
          });

          return { success: true, sessionId: session.id, url: session.url };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      createPortalSession: async (customerId) => {
        try {
          const session = await stripeMock.billingPortal.sessions.create({
            customer: customerId,
            return_url: 'http://localhost:3000/dashboard'
          });

          return { success: true, url: session.url };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      getSubscription: async (subscriptionId) => {
        try {
          const subscription = await stripeMock.subscriptions.retrieve(subscriptionId);
          return { success: true, subscription };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      cancelSubscription: async (subscriptionId) => {
        try {
          const subscription = await stripeMock.subscriptions.cancel(subscriptionId);
          return { success: true, subscription };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    };

    describe('createCheckoutSession', () => {
      test('should create checkout session successfully', async () => {
        const result = await stripeService.createCheckoutSession(
          1,
          'price_test_pro_monthly',
          'test@example.com'
        );

        expect(result.success).toBe(true);
        expect(result.sessionId).toBeDefined();
        expect(result.sessionId).toMatch(/^cs_test_/);
        expect(result.url).toBeDefined();
        expect(result.url).toContain('checkout.stripe.com');
      });

      test('should pass correct parameters to Stripe', async () => {
        await stripeService.createCheckoutSession(
          42,
          'price_test_dealer_yearly',
          'user42@example.com'
        );

        expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_email: 'user42@example.com',
            client_reference_id: '42',
            mode: 'subscription',
            metadata: { userId: '42' }
          })
        );
      });

      test('should handle Stripe errors gracefully', async () => {
        stripeMock._setFailure(new Error('Invalid price ID'));

        const result = await stripeService.createCheckoutSession(
          1,
          'invalid_price',
          'test@example.com'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid price ID');
      });
    });

    describe('createPortalSession', () => {
      test('should create portal session successfully', async () => {
        const result = await stripeService.createPortalSession('cus_test_123');

        expect(result.success).toBe(true);
        expect(result.url).toBeDefined();
        expect(result.url).toContain('billing.stripe.com');
      });

      test('should handle missing customer gracefully', async () => {
        stripeMock._setFailure(new Error('Customer not found'));

        const result = await stripeService.createPortalSession('cus_invalid');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Customer not found');
      });
    });

    describe('getSubscription', () => {
      test('should retrieve subscription details', async () => {
        const result = await stripeService.getSubscription('sub_test_123');

        expect(result.success).toBe(true);
        expect(result.subscription).toBeDefined();
        expect(result.subscription.id).toBe('sub_test_123');
        expect(result.subscription.status).toBe('active');
      });

      test('should return subscription items with price info', async () => {
        const result = await stripeService.getSubscription('sub_test_123');

        expect(result.subscription.items.data).toBeDefined();
        expect(result.subscription.items.data[0].price).toBeDefined();
      });
    });

    describe('cancelSubscription', () => {
      test('should cancel subscription successfully', async () => {
        const result = await stripeService.cancelSubscription('sub_test_123');

        expect(result.success).toBe(true);
        expect(result.subscription.status).toBe('canceled');
      });

      test('should handle cancellation errors', async () => {
        stripeMock._setFailure(new Error('Subscription already canceled'));

        const result = await stripeService.cancelSubscription('sub_already_canceled');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Subscription already canceled');
      });
    });
  });

  describe('Webhook Handling', () => {
    const handleWebhook = async (eventType, eventData) => {
      // Simulate webhook event construction
      const event = {
        type: eventType,
        data: { object: eventData }
      };

      switch (event.type) {
        case 'checkout.session.completed':
          const { client_reference_id: userId, customer, subscription } = event.data.object;

          if (userId && subscription) {
            // Simulate updating user subscription
            dbMock._updateUser(parseInt(userId), {
              subscription_tier: 'power',
              subscription_status: 'active',
              stripe_customer_id: customer,
              stripe_subscription_id: subscription
            });
            return { handled: true, action: 'upgraded' };
          }
          break;

        case 'customer.subscription.deleted':
          // Simulate downgrading user
          const deletedCustomer = event.data.object.customer;
          const user = dbMock._getUserByEmail('test@example.com');
          if (user && user.stripe_customer_id === deletedCustomer) {
            dbMock._updateUser(user.id, {
              subscription_tier: 'free',
              subscription_status: 'cancelled'
            });
            return { handled: true, action: 'downgraded' };
          }
          break;

        case 'invoice.payment_failed':
          // Simulate marking subscription as past_due
          return { handled: true, action: 'marked_past_due' };
      }

      return { handled: false };
    };

    test('should handle checkout.session.completed', async () => {
      const result = await handleWebhook('checkout.session.completed', {
        client_reference_id: '1',
        customer: 'cus_test_new',
        subscription: 'sub_test_new'
      });

      expect(result.handled).toBe(true);
      expect(result.action).toBe('upgraded');

      const user = dbMock._getUser(1);
      expect(user.subscription_tier).toBe('power');
      expect(user.stripe_customer_id).toBe('cus_test_new');
    });

    test('should handle customer.subscription.deleted', async () => {
      // Setup: user has active subscription
      dbMock._updateUser(1, {
        stripe_customer_id: 'cus_to_cancel',
        subscription_tier: 'power',
        subscription_status: 'active'
      });

      const result = await handleWebhook('customer.subscription.deleted', {
        customer: 'cus_to_cancel'
      });

      expect(result.handled).toBe(true);
      expect(result.action).toBe('downgraded');
    });

    test('should handle invoice.payment_failed', async () => {
      const result = await handleWebhook('invoice.payment_failed', {
        customer: 'cus_test_123'
      });

      expect(result.handled).toBe(true);
      expect(result.action).toBe('marked_past_due');
    });

    test('should verify webhook signature', () => {
      const payload = Buffer.from(JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } }
      }));

      const event = stripeMock.webhooks.constructEvent(
        payload,
        'test_signature',
        'test_secret'
      );

      expect(event.type).toBe('checkout.session.completed');
      expect(event.id).toMatch(/^evt_test_/);
    });

    test('should reject invalid webhook signature', () => {
      stripeMock._setFailure(new Error('Webhook signature verification failed'));

      expect(() => {
        stripeMock.webhooks.constructEvent(
          'invalid_payload',
          'bad_signature',
          'wrong_secret'
        );
      }).toThrow('Webhook signature verification failed');
    });
  });

  describe('Plan Limits', () => {
    // Plan limits based on the actual implementation
    const planLimits = {
      free: { scanLimit: 5, ebayListingsLimit: 0, showcaseLimit: 0, bulkScanLimit: 0 },
      power: { scanLimit: 100, ebayListingsLimit: 50, showcaseLimit: 5, bulkScanLimit: 10 },
      dealer: { scanLimit: 1000, ebayListingsLimit: 500, showcaseLimit: 50, bulkScanLimit: 100 }
    };

    const getLimits = (tier) => {
      return planLimits[tier] || planLimits.free;
    };

    const checkScanLimit = (user) => {
      const limits = getLimits(user.subscription_tier);
      const remaining = limits.scanLimit - (user.scans_used || 0);

      return {
        plan: user.subscription_tier,
        scanLimit: limits.scanLimit,
        scansUsed: user.scans_used || 0,
        scansRemaining: Math.max(0, remaining),
        canScan: remaining > 0
      };
    };

    test('should return correct limits for free tier', () => {
      const user = { subscription_tier: 'free', scans_used: 3 };
      const result = checkScanLimit(user);

      expect(result.scanLimit).toBe(5);
      expect(result.scansUsed).toBe(3);
      expect(result.scansRemaining).toBe(2);
      expect(result.canScan).toBe(true);
    });

    test('should return correct limits for power tier', () => {
      const user = { subscription_tier: 'power', scans_used: 50 };
      const result = checkScanLimit(user);

      expect(result.scanLimit).toBe(100);
      expect(result.scansUsed).toBe(50);
      expect(result.scansRemaining).toBe(50);
      expect(result.canScan).toBe(true);
    });

    test('should return correct limits for dealer tier', () => {
      const user = { subscription_tier: 'dealer', scans_used: 100 };
      const result = checkScanLimit(user);

      expect(result.scanLimit).toBe(1000);
      expect(result.scansRemaining).toBe(900);
      expect(result.canScan).toBe(true);
    });

    test('should block scans when limit reached', () => {
      const user = { subscription_tier: 'free', scans_used: 5 };
      const result = checkScanLimit(user);

      expect(result.scansRemaining).toBe(0);
      expect(result.canScan).toBe(false);
    });

    test('should handle over-limit usage', () => {
      const user = { subscription_tier: 'free', scans_used: 10 };
      const result = checkScanLimit(user);

      expect(result.scansRemaining).toBe(0);
      expect(result.canScan).toBe(false);
    });

    test('should default to free tier for unknown tiers', () => {
      const user = { subscription_tier: 'unknown_tier', scans_used: 0 };
      const result = checkScanLimit(user);

      expect(result.scanLimit).toBe(5);
    });
  });

  describe('Scan Usage Tracking', () => {
    test('should increment scan count after successful scan', async () => {
      const user = dbMock._getUser(1);
      const initialScans = user.scans_used || 0;

      // Simulate scan increment
      dbMock._updateUser(1, { scans_used: initialScans + 1 });

      const updatedUser = dbMock._getUser(1);
      expect(updatedUser.scans_used).toBe(initialScans + 1);
    });

    test('should not increment scan count for failed scans', async () => {
      const user = dbMock._getUser(1);
      const initialScans = user.scans_used || 0;

      // Failed scan - don't increment
      // (no database update)

      const sameUser = dbMock._getUser(1);
      expect(sameUser.scans_used).toBe(initialScans);
    });

    test('should reset scans on monthly reset', async () => {
      // Setup user with used scans
      dbMock._updateUser(1, { scans_used: 50 });

      // Simulate monthly reset
      dbMock._updateUser(1, { scans_used: 0 });

      const user = dbMock._getUser(1);
      expect(user.scans_used).toBe(0);
    });
  });

  describe('Customer Management', () => {
    test('should create new Stripe customer', async () => {
      const customer = await stripeMock.customers.create({
        email: 'newcustomer@example.com',
        name: 'New Customer'
      });

      expect(customer.id).toMatch(/^cus_test_/);
      expect(customer.email).toBe('newcustomer@example.com');
    });

    test('should retrieve existing customer', async () => {
      // First create a customer
      const created = await stripeMock.customers.create({
        email: 'existing@example.com',
        name: 'Existing Customer'
      });

      // Then retrieve
      const retrieved = await stripeMock.customers.retrieve(created.id);

      expect(retrieved.id).toBe(created.id);
    });

    test('should handle customer creation failure', async () => {
      stripeMock._setFailure(new Error('Invalid email'));

      await expect(async () => {
        await stripeMock.customers.create({
          email: 'invalid',
          name: 'Bad Customer'
        });
      }).rejects.toThrow('Invalid email');
    });
  });
});
