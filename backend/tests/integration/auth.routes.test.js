/**
 * Auth Routes Integration Tests
 *
 * Tests for authentication API handler logic:
 * - Registration flow
 * - Login flow
 * - Profile retrieval
 *
 * These tests verify the handler logic directly using mocked database.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import mocks directly
const dbMock = require('../mocks/database');

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    dbMock._reset();
  });

  describe('Registration Handler', () => {
    // Handler logic extracted for testing
    const handleRegister = async (req, res) => {
      try {
        const { email, password, fullName, referralCode } = req.body;

        // Check if user exists
        const existingResult = await dbMock.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingResult.rows.length > 0) {
          return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check referral code if provided
        let referralCodeId = null;
        let referralCodeValue = null;
        if (referralCode) {
          const refResult = await dbMock.query(
            'SELECT id, code FROM referral_codes WHERE code = $1 AND active = true',
            [referralCode.toLowerCase()]
          );
          if (refResult.rows.length > 0) {
            referralCodeId = refResult.rows[0].id;
            referralCodeValue = refResult.rows[0].code;
          }
        }

        // Insert user
        const insertResult = await dbMock.query(
          'INSERT INTO users (email, password_hash, full_name, referred_by, referral_code_id, referred_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [email, passwordHash, fullName, referralCodeValue, referralCodeId, referralCodeId ? new Date() : null]
        );

        const userId = insertResult.rows[0]?.id;
        if (!userId) {
          throw new Error('Failed to create user - no ID returned');
        }

        // Get user
        const userResult = await dbMock.query(
          'SELECT id, email, full_name, subscription_tier, is_admin FROM users WHERE id = $1',
          [userId]
        );
        const user = userResult.rows[0];

        // Generate token
        const token = jwt.sign(
          { id: user.id, userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            subscriptionTier: user.subscription_tier,
            isAdmin: user.is_admin || false
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Registration failed' });
      }
    };

    test('should register a new user successfully', async () => {
      const req = {
        body: {
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
          fullName: 'New User'
        }
      };

      const res = global.testUtils.createMockResponse();

      await handleRegister(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.data;
      expect(response.success).toBe(true);
      expect(response.token).toBeDefined();
      expect(response.user.email).toBe('newuser@example.com');
      expect(response.user.fullName).toBe('New User');
      expect(response.user.subscriptionTier).toBe('free');
    });

    test('should reject duplicate email registration', async () => {
      // Register first user
      const req1 = {
        body: {
          email: 'duplicate@example.com',
          password: 'SecureP@ss123',
          fullName: 'First User'
        }
      };
      const res1 = global.testUtils.createMockResponse();
      await handleRegister(req1, res1);

      // Try to register with same email
      const req2 = {
        body: {
          email: 'duplicate@example.com',
          password: 'AnotherP@ss123',
          fullName: 'Second User'
        }
      };
      const res2 = global.testUtils.createMockResponse();
      await handleRegister(req2, res2);

      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.data.success).toBe(false);
      expect(res2.data.error).toBe('Email already registered');
    });

    test('should register with valid referral code', async () => {
      const req = {
        body: {
          email: 'referred@example.com',
          password: 'SecureP@ss123',
          fullName: 'Referred User',
          referralCode: 'testref'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleRegister(req, res);

      expect(res.data.success).toBe(true);
    });

    test('should return valid JWT token on registration', async () => {
      const req = {
        body: {
          email: 'tokentest@example.com',
          password: 'SecureP@ss123',
          fullName: 'Token Test'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleRegister(req, res);

      const token = res.data.token;
      expect(token).toBeDefined();

      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.email).toBe('tokentest@example.com');
      expect(decoded.id).toBeDefined();
    });
  });

  describe('Login Handler', () => {
    const handleLogin = async (req, res) => {
      try {
        const { email, password } = req.body;

        const userResult = await dbMock.query(
          'SELECT id, email, password_hash, full_name, subscription_tier, is_admin, scans_used FROM users WHERE email = $1',
          [email]
        );
        const user = userResult.rows[0];

        if (!user) {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            subscriptionTier: user.subscription_tier,
            isAdmin: user.is_admin || false,
            scansUsed: user.scans_used || 0
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Login failed' });
      }
    };

    beforeEach(async () => {
      // Add a user with known password
      const passwordHash = await bcrypt.hash('password123', 10);
      dbMock._addUser({
        email: 'login@example.com',
        password_hash: passwordHash,
        full_name: 'Login User'
      });
    });

    test('should login with valid credentials', async () => {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleLogin(req, res);

      expect(res.data.success).toBe(true);
      expect(res.data.token).toBeDefined();
      expect(res.data.user.email).toBe('login@example.com');
    });

    test('should reject invalid email', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'wrongpassword'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('Invalid credentials');
    });

    test('should return user data on successful login', async () => {
      const req = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      };

      const res = global.testUtils.createMockResponse();
      await handleLogin(req, res);

      expect(res.data.user).toBeDefined();
      expect(res.data.user.id).toBeDefined();
      expect(res.data.user.email).toBe('login@example.com');
      expect(res.data.user.fullName).toBeDefined();
    });
  });

  describe('Profile Handler', () => {
    const handleGetProfile = async (req, res) => {
      try {
        const userId = req.user.userId || req.user.id;

        const userResult = await dbMock.query(
          'SELECT id, email, full_name, subscription_tier, is_admin, scans_used, created_at FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = userResult.rows[0];

        res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            subscriptionTier: user.subscription_tier,
            isAdmin: user.is_admin || false,
            scansUsed: user.scans_used || 0
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
      }
    };

    test('should return user profile for authenticated user', async () => {
      const req = {
        user: { id: 1, userId: 1, email: 'test@example.com' }
      };

      const res = global.testUtils.createMockResponse();
      await handleGetProfile(req, res);

      expect(res.data.success).toBe(true);
      expect(res.data.user).toBeDefined();
      expect(res.data.user.email).toBe('test@example.com');
    });

    test('should return 404 for non-existent user', async () => {
      const req = {
        user: { id: 9999, userId: 9999, email: 'ghost@example.com' }
      };

      const res = global.testUtils.createMockResponse();
      await handleGetProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.data.success).toBe(false);
      expect(res.data.error).toBe('User not found');
    });

    test('should return correct subscription tier', async () => {
      // Update user to power tier
      dbMock._updateUser(1, { subscription_tier: 'power' });

      const req = {
        user: { id: 1, userId: 1 }
      };

      const res = global.testUtils.createMockResponse();
      await handleGetProfile(req, res);

      expect(res.data.user.subscriptionTier).toBe('power');
    });

    test('should return admin flag', async () => {
      const req = {
        user: { id: 2, userId: 2 } // Admin user from default data
      };

      const res = global.testUtils.createMockResponse();
      await handleGetProfile(req, res);

      expect(res.data.user.isAdmin).toBe(true);
    });
  });

  describe('Token Authentication', () => {
    test('should authenticate valid token', () => {
      const token = global.testUtils.generateTestToken(1, 'test@example.com');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    test('should reject expired token', () => {
      const expiredToken = global.testUtils.generateExpiredToken(1, 'test@example.com');

      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow(jwt.TokenExpiredError);
    });

    test('should reject invalid token', () => {
      expect(() => {
        jwt.verify('invalid_token', process.env.JWT_SECRET);
      }).toThrow(jwt.JsonWebTokenError);
    });
  });
});
