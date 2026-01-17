/**
 * Auth Unit Tests
 *
 * Tests for authentication utilities:
 * - Password hashing and verification
 * - JWT token generation and validation
 * - Auth middleware
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Unit Tests', () => {
  describe('Password Hashing', () => {
    const testPassword = 'SecureP@ssw0rd!';

    test('should hash a password successfully', async () => {
      const hash = await bcrypt.hash(testPassword, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });

    test('should verify correct password against hash', async () => {
      const hash = await bcrypt.hash(testPassword, 10);
      const isValid = await bcrypt.compare(testPassword, hash);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password against hash', async () => {
      const hash = await bcrypt.hash(testPassword, 10);
      const isValid = await bcrypt.compare('wrongpassword', hash);

      expect(isValid).toBe(false);
    });

    test('should generate unique hashes for same password', async () => {
      const hash1 = await bcrypt.hash(testPassword, 10);
      const hash2 = await bcrypt.hash(testPassword, 10);

      expect(hash1).not.toBe(hash2); // Different salts = different hashes
    });

    test('should handle empty password', async () => {
      const hash = await bcrypt.hash('', 10);
      const isValid = await bcrypt.compare('', hash);

      expect(isValid).toBe(true);
    });

    test('should handle unicode passwords', async () => {
      const unicodePassword = 'P@$$w0rd_\u00e9\u00e8\u00ea\u4e2d\u6587';
      const hash = await bcrypt.hash(unicodePassword, 10);
      const isValid = await bcrypt.compare(unicodePassword, hash);

      expect(isValid).toBe(true);
    });

    test('should handle very long passwords', async () => {
      // bcrypt has a 72-byte limit, but should still work
      const longPassword = 'a'.repeat(100);
      const hash = await bcrypt.hash(longPassword, 10);
      const isValid = await bcrypt.compare(longPassword, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    const secret = process.env.JWT_SECRET;
    const testPayload = {
      id: 1,
      userId: 1,
      email: 'test@example.com'
    };

    test('should generate a valid JWT token', () => {
      const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });

      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include all payload fields in token', () => {
      const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    test('should set correct expiration time', () => {
      const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);

      const expectedExp = Math.floor(Date.now() / 1000) + 3600;
      expect(decoded.exp).toBeCloseTo(expectedExp, -1); // Within 10 seconds
    });

    test('should fail verification with wrong secret', () => {
      const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });

      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow(jwt.JsonWebTokenError);
    });

    test('should fail verification with expired token', () => {
      const token = jwt.sign(testPayload, secret, { expiresIn: '-1h' });

      expect(() => {
        jwt.verify(token, secret);
      }).toThrow(jwt.TokenExpiredError);
    });

    test('should fail verification with malformed token', () => {
      expect(() => {
        jwt.verify('not.a.valid.token', secret);
      }).toThrow(jwt.JsonWebTokenError);
    });

    test('should handle admin flag in payload', () => {
      const adminPayload = { ...testPayload, is_admin: true };
      const token = jwt.sign(adminPayload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);

      expect(decoded.is_admin).toBe(true);
    });
  });

  describe('JWT Token Validation', () => {
    const secret = process.env.JWT_SECRET;

    test('should extract user data from valid token', () => {
      const payload = { id: 42, userId: 42, email: 'user42@test.com' };
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);

      expect(decoded.id).toBe(42);
      expect(decoded.email).toBe('user42@test.com');
    });

    test('should detect token tampering', () => {
      const token = jwt.sign({ id: 1 }, secret, { expiresIn: '1h' });
      const [header, payload, signature] = token.split('.');

      // Tamper with payload
      const tamperedPayload = Buffer.from(JSON.stringify({ id: 999 })).toString('base64');
      const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

      expect(() => {
        jwt.verify(tamperedToken, secret);
      }).toThrow();
    });

    test('should handle token with extra fields', () => {
      const payload = {
        id: 1,
        userId: 1,
        email: 'test@example.com',
        customField: 'customValue',
        nested: { foo: 'bar' }
      };
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);

      expect(decoded.customField).toBe('customValue');
      expect(decoded.nested.foo).toBe('bar');
    });
  });

  describe('Auth Middleware', () => {
    // Mock the middleware behavior
    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
      }

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: user.id,
          userId: user.id,
          email: user.email,
          is_admin: user.is_admin || false
        };
        next();
      } catch (err) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
      }
    };

    test('should reject request without authorization header', () => {
      const req = global.testUtils.createMockRequest({ headers: {} });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', () => {
      const req = global.testUtils.createMockRequest({
        headers: { authorization: 'Bearer invalid_token' }
      });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept valid token and set req.user', () => {
      const token = global.testUtils.generateTestToken(1, 'test@example.com');
      const req = global.testUtils.createMockRequest({
        headers: { authorization: `Bearer ${token}` }
      });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
      expect(req.user.email).toBe('test@example.com');
    });

    test('should set is_admin flag from token', () => {
      const token = global.testUtils.generateTestToken(1, 'admin@example.com', true);
      const req = global.testUtils.createMockRequest({
        headers: { authorization: `Bearer ${token}` }
      });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(req.user.is_admin).toBe(true);
    });

    test('should reject expired token', () => {
      const token = global.testUtils.generateExpiredToken(1, 'test@example.com');
      const req = global.testUtils.createMockRequest({
        headers: { authorization: `Bearer ${token}` }
      });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle malformed authorization header', () => {
      const req = global.testUtils.createMockRequest({
        headers: { authorization: 'NotBearer token123' }
      });
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      authenticateToken(req, res, next);

      // Should try to verify "token123" which is invalid
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Admin Middleware', () => {
    const isAdmin = (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
      if (!req.user.is_admin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      next();
    };

    test('should reject request without user object', () => {
      const req = { user: null };
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject non-admin user', () => {
      const req = { user: { id: 1, is_admin: false } };
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin access required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should allow admin user', () => {
      const req = { user: { id: 1, is_admin: true } };
      const res = global.testUtils.createMockResponse();
      const next = jest.fn();

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
