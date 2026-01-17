/**
 * Fraud Detection Unit Tests
 *
 * Tests for fraud detection services:
 * - Risk scoring algorithms
 * - Velocity tracking
 * - Device fingerprinting
 * - Duplicate device detection
 */

const crypto = require('crypto');

describe('Fraud Detection Unit Tests', () => {
  describe('Risk Scoring', () => {
    // Risk scoring algorithm based on fraud-detection.js
    const calculateRiskScore = (checks) => {
      let score = 0;

      if (checks.suspiciousFingerprint) score += 30;
      if (checks.velocityViolation) score += 50;
      if (checks.fastCompletion) score += 40;
      if (checks.duplicateDevice) score += 60;
      if (checks.vpnDetected) score += 20;
      if (checks.proxyDetected) score += 25;
      if (checks.torDetected) score += 40;
      if (checks.knownBadIP) score += 100;

      return Math.min(score, 100); // Cap at 100
    };

    const isHighRisk = (score) => score >= 50;

    test('should return 0 for clean request', () => {
      const checks = {
        suspiciousFingerprint: false,
        velocityViolation: false,
        fastCompletion: false,
        duplicateDevice: false
      };

      expect(calculateRiskScore(checks)).toBe(0);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(false);
    });

    test('should add 30 points for suspicious fingerprint', () => {
      const checks = {
        suspiciousFingerprint: true,
        velocityViolation: false,
        fastCompletion: false,
        duplicateDevice: false
      };

      expect(calculateRiskScore(checks)).toBe(30);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(false);
    });

    test('should add 50 points for velocity violation', () => {
      const checks = {
        suspiciousFingerprint: false,
        velocityViolation: true,
        fastCompletion: false,
        duplicateDevice: false
      };

      expect(calculateRiskScore(checks)).toBe(50);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(true);
    });

    test('should add 40 points for fast completion', () => {
      const checks = {
        suspiciousFingerprint: false,
        velocityViolation: false,
        fastCompletion: true,
        duplicateDevice: false
      };

      expect(calculateRiskScore(checks)).toBe(40);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(false);
    });

    test('should add 60 points for duplicate device', () => {
      const checks = {
        suspiciousFingerprint: false,
        velocityViolation: false,
        fastCompletion: false,
        duplicateDevice: true
      };

      expect(calculateRiskScore(checks)).toBe(60);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(true);
    });

    test('should accumulate scores from multiple flags', () => {
      const checks = {
        suspiciousFingerprint: true, // 30
        velocityViolation: true,     // 50
        fastCompletion: false,
        duplicateDevice: false
      };

      expect(calculateRiskScore(checks)).toBe(80);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(true);
    });

    test('should cap risk score at 100', () => {
      const checks = {
        suspiciousFingerprint: true,  // 30
        velocityViolation: true,      // 50
        fastCompletion: true,         // 40
        duplicateDevice: true,        // 60
        knownBadIP: true              // 100
      };

      expect(calculateRiskScore(checks)).toBe(100);
    });

    test('should flag known bad IP as high risk', () => {
      const checks = {
        suspiciousFingerprint: false,
        velocityViolation: false,
        fastCompletion: false,
        duplicateDevice: false,
        knownBadIP: true
      };

      expect(calculateRiskScore(checks)).toBe(100);
      expect(isHighRisk(calculateRiskScore(checks))).toBe(true);
    });
  });

  describe('Velocity Tracking', () => {
    // In-memory velocity tracker for testing
    class VelocityTracker {
      constructor() {
        this.store = new Map();
      }

      _getKey(userId, action, window) {
        return `velocity:${userId}:${action}:${window}`;
      }

      _getHourWindow() {
        const now = new Date();
        return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
      }

      _getDayWindow() {
        const now = new Date();
        return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
      }

      async increment(userId, action = 'survey') {
        const hourKey = this._getKey(userId, action, this._getHourWindow());
        const dayKey = this._getKey(userId, action, this._getDayWindow());

        const hourCount = (this.store.get(hourKey) || 0) + 1;
        const dayCount = (this.store.get(dayKey) || 0) + 1;

        this.store.set(hourKey, hourCount);
        this.store.set(dayKey, dayCount);

        return { hourCount, dayCount };
      }

      async getCounts(userId, action = 'survey') {
        const hourKey = this._getKey(userId, action, this._getHourWindow());
        const dayKey = this._getKey(userId, action, this._getDayWindow());

        return {
          hourCount: this.store.get(hourKey) || 0,
          dayCount: this.store.get(dayKey) || 0
        };
      }

      async checkLimits(userId, limits = {}) {
        const { maxPerHour = 20, maxPerDay = 100 } = limits;
        const counts = await this.getCounts(userId);

        const violations = [];

        if (counts.hourCount >= maxPerHour) {
          violations.push({
            type: 'hourly_limit',
            current: counts.hourCount,
            limit: maxPerHour
          });
        }

        if (counts.dayCount >= maxPerDay) {
          violations.push({
            type: 'daily_limit',
            current: counts.dayCount,
            limit: maxPerDay
          });
        }

        return {
          allowed: violations.length === 0,
          violations,
          counts
        };
      }

      reset() {
        this.store.clear();
      }
    }

    let tracker;

    beforeEach(() => {
      tracker = new VelocityTracker();
    });

    test('should start with zero counts', async () => {
      const counts = await tracker.getCounts('user1');

      expect(counts.hourCount).toBe(0);
      expect(counts.dayCount).toBe(0);
    });

    test('should increment counts correctly', async () => {
      await tracker.increment('user1');
      await tracker.increment('user1');
      await tracker.increment('user1');

      const counts = await tracker.getCounts('user1');

      expect(counts.hourCount).toBe(3);
      expect(counts.dayCount).toBe(3);
    });

    test('should track users independently', async () => {
      await tracker.increment('user1');
      await tracker.increment('user1');
      await tracker.increment('user2');

      const counts1 = await tracker.getCounts('user1');
      const counts2 = await tracker.getCounts('user2');

      expect(counts1.hourCount).toBe(2);
      expect(counts2.hourCount).toBe(1);
    });

    test('should allow requests under limits', async () => {
      for (let i = 0; i < 5; i++) {
        await tracker.increment('user1');
      }

      const result = await tracker.checkLimits('user1', { maxPerHour: 20, maxPerDay: 100 });

      expect(result.allowed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('should block requests at hourly limit', async () => {
      // Simulate hitting hourly limit
      for (let i = 0; i < 20; i++) {
        await tracker.increment('user1');
      }

      const result = await tracker.checkLimits('user1', { maxPerHour: 20, maxPerDay: 100 });

      expect(result.allowed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe('hourly_limit');
    });

    test('should return current counts with limit check', async () => {
      await tracker.increment('user1');
      await tracker.increment('user1');

      const result = await tracker.checkLimits('user1');

      expect(result.counts.hourCount).toBe(2);
      expect(result.counts.dayCount).toBe(2);
    });

    test('should track different actions separately', async () => {
      await tracker.increment('user1', 'survey');
      await tracker.increment('user1', 'survey');
      await tracker.increment('user1', 'login');

      const surveyCounts = await tracker.getCounts('user1', 'survey');
      const loginCounts = await tracker.getCounts('user1', 'login');

      expect(surveyCounts.hourCount).toBe(2);
      expect(loginCounts.hourCount).toBe(1);
    });
  });

  describe('Device Fingerprinting', () => {
    // Fingerprint generation based on fingerprint.js
    const generateFingerprint = (req) => {
      const components = [
        req.headers['user-agent'] || '',
        req.headers['accept-language'] || '',
        req.headers['accept-encoding'] || '',
        req.headers['accept'] || '',
        req.ip || req.connection?.remoteAddress || '',
        req.headers['sec-ch-ua'] || '',
        req.headers['sec-ch-ua-platform'] || '',
        req.headers['sec-ch-ua-mobile'] || ''
      ];

      const raw = components.join('|');
      return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
    };

    const generateClientFingerprint = (clientData) => {
      if (!clientData) return null;

      const components = [
        clientData.screenResolution || '',
        clientData.timezone || '',
        clientData.language || '',
        clientData.platform || '',
        clientData.cookiesEnabled || '',
        clientData.canvas || '',
        clientData.webgl || '',
        clientData.fonts || ''
      ];

      const raw = components.join('|');
      return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
    };

    test('should generate 32-character fingerprint', () => {
      const req = global.testUtils.createMockRequest();
      const fingerprint = generateFingerprint(req);

      expect(fingerprint).toHaveLength(32);
      expect(/^[a-f0-9]{32}$/.test(fingerprint)).toBe(true);
    });

    test('should generate same fingerprint for same request', () => {
      const req = global.testUtils.createMockRequest();
      const fp1 = generateFingerprint(req);
      const fp2 = generateFingerprint(req);

      expect(fp1).toBe(fp2);
    });

    test('should generate different fingerprints for different user agents', () => {
      const req1 = global.testUtils.createMockRequest({
        headers: { 'user-agent': 'Mozilla/5.0 Chrome/100' }
      });
      const req2 = global.testUtils.createMockRequest({
        headers: { 'user-agent': 'Mozilla/5.0 Firefox/100' }
      });

      const fp1 = generateFingerprint(req1);
      const fp2 = generateFingerprint(req2);

      expect(fp1).not.toBe(fp2);
    });

    test('should generate different fingerprints for different IPs', () => {
      const req1 = global.testUtils.createMockRequest({ ip: '192.168.1.1' });
      const req2 = global.testUtils.createMockRequest({ ip: '192.168.1.2' });

      const fp1 = generateFingerprint(req1);
      const fp2 = generateFingerprint(req2);

      expect(fp1).not.toBe(fp2);
    });

    test('should handle missing headers gracefully', () => {
      const req = { headers: {}, ip: '127.0.0.1' };
      const fingerprint = generateFingerprint(req);

      expect(fingerprint).toHaveLength(32);
    });

    test('should return null for null client data', () => {
      expect(generateClientFingerprint(null)).toBeNull();
      expect(generateClientFingerprint(undefined)).toBeNull();
    });

    test('should generate client fingerprint from browser data', () => {
      const clientData = {
        screenResolution: '1920x1080',
        timezone: 'America/New_York',
        language: 'en-US',
        platform: 'Win32',
        cookiesEnabled: 'true',
        canvas: 'canvas_hash_123',
        webgl: 'webgl_hash_456',
        fonts: 'Arial,Helvetica,Times'
      };

      const fingerprint = generateClientFingerprint(clientData);

      expect(fingerprint).toHaveLength(32);
    });
  });

  describe('Bot Detection', () => {
    const isSuspiciousFingerprint = (fingerprint, userAgent) => {
      // Headless browser detection patterns
      const botPatterns = [
        /headless/i,
        /phantom/i,
        /selenium/i,
        /webdriver/i,
        /puppeteer/i,
        /playwright/i
      ];

      if (userAgent && botPatterns.some(p => p.test(userAgent))) {
        return { suspicious: true, reason: 'bot_user_agent' };
      }

      // Missing or very short user agent
      if (!userAgent || userAgent.length < 20) {
        return { suspicious: true, reason: 'missing_user_agent' };
      }

      return { suspicious: false };
    };

    test('should detect headless Chrome', () => {
      const result = isSuspiciousFingerprint(
        'abc123',
        'Mozilla/5.0 HeadlessChrome/100.0.0'
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('bot_user_agent');
    });

    test('should detect Phantom.js', () => {
      const result = isSuspiciousFingerprint(
        'abc123',
        'Mozilla/5.0 (Windows) PhantomJS/2.1.1'
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('bot_user_agent');
    });

    test('should detect Selenium', () => {
      const result = isSuspiciousFingerprint(
        'abc123',
        'Mozilla/5.0 Selenium/4.0'
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('bot_user_agent');
    });

    test('should detect Puppeteer', () => {
      const result = isSuspiciousFingerprint(
        'abc123',
        'Mozilla/5.0 Puppeteer/1.0'
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('bot_user_agent');
    });

    test('should detect Playwright', () => {
      const result = isSuspiciousFingerprint(
        'abc123',
        'Mozilla/5.0 Playwright/1.0'
      );

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('bot_user_agent');
    });

    test('should flag missing user agent', () => {
      const result = isSuspiciousFingerprint('abc123', null);

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('missing_user_agent');
    });

    test('should flag very short user agent', () => {
      const result = isSuspiciousFingerprint('abc123', 'curl/7.0');

      expect(result.suspicious).toBe(true);
      expect(result.reason).toBe('missing_user_agent');
    });

    test('should accept normal browser user agents', () => {
      const normalUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      ];

      normalUserAgents.forEach(ua => {
        const result = isSuspiciousFingerprint('abc123', ua);
        expect(result.suspicious).toBe(false);
      });
    });
  });

  describe('Completion Time Analysis', () => {
    const checkCompletionTime = (startTime, endTime, expectedMinTime = 30) => {
      const completionTime = (endTime - startTime) / 1000; // in seconds

      if (completionTime < expectedMinTime) {
        return {
          passed: false,
          completionTime,
          expectedMin: expectedMinTime,
          reason: 'too_fast'
        };
      }

      return {
        passed: true,
        completionTime
      };
    };

    test('should pass normal completion time', () => {
      const start = Date.now() - 60000; // 60 seconds ago
      const end = Date.now();

      const result = checkCompletionTime(start, end, 30);

      expect(result.passed).toBe(true);
      expect(result.completionTime).toBeGreaterThanOrEqual(60);
    });

    test('should fail suspiciously fast completion', () => {
      const start = Date.now() - 5000; // 5 seconds ago
      const end = Date.now();

      const result = checkCompletionTime(start, end, 30);

      expect(result.passed).toBe(false);
      expect(result.reason).toBe('too_fast');
      expect(result.completionTime).toBeLessThan(10);
    });

    test('should use custom minimum time', () => {
      const start = Date.now() - 15000; // 15 seconds ago
      const end = Date.now();

      // Should fail with 20 second minimum
      const result1 = checkCompletionTime(start, end, 20);
      expect(result1.passed).toBe(false);

      // Should pass with 10 second minimum
      const result2 = checkCompletionTime(start, end, 10);
      expect(result2.passed).toBe(true);
    });

    test('should handle edge case at exact minimum', () => {
      const start = Date.now() - 30000; // exactly 30 seconds ago
      const end = Date.now();

      const result = checkCompletionTime(start, end, 30);

      expect(result.passed).toBe(true);
    });
  });

  describe('Duplicate Device Detection', () => {
    class DeviceTracker {
      constructor() {
        this.deviceMap = new Map(); // userId -> Set of fingerprints
      }

      checkDuplicateDevice(userId, fingerprint) {
        // Check if fingerprint is registered to another user
        for (const [existingUserId, fingerprints] of this.deviceMap) {
          if (fingerprints.has(fingerprint) && existingUserId !== userId) {
            return { found: true, otherUserId: existingUserId };
          }
        }

        // Register this device for user
        if (!this.deviceMap.has(userId)) {
          this.deviceMap.set(userId, new Set());
        }
        this.deviceMap.get(userId).add(fingerprint);

        return { found: false };
      }

      reset() {
        this.deviceMap.clear();
      }
    }

    let deviceTracker;

    beforeEach(() => {
      deviceTracker = new DeviceTracker();
    });

    test('should allow new device for user', () => {
      const result = deviceTracker.checkDuplicateDevice('user1', 'fp_abc123');

      expect(result.found).toBe(false);
    });

    test('should allow same device for same user', () => {
      deviceTracker.checkDuplicateDevice('user1', 'fp_abc123');
      const result = deviceTracker.checkDuplicateDevice('user1', 'fp_abc123');

      expect(result.found).toBe(false);
    });

    test('should detect device used by another user', () => {
      deviceTracker.checkDuplicateDevice('user1', 'fp_abc123');
      const result = deviceTracker.checkDuplicateDevice('user2', 'fp_abc123');

      expect(result.found).toBe(true);
      expect(result.otherUserId).toBe('user1');
    });

    test('should allow different devices for different users', () => {
      deviceTracker.checkDuplicateDevice('user1', 'fp_abc123');
      const result = deviceTracker.checkDuplicateDevice('user2', 'fp_def456');

      expect(result.found).toBe(false);
    });

    test('should track multiple devices per user', () => {
      deviceTracker.checkDuplicateDevice('user1', 'fp_device1');
      deviceTracker.checkDuplicateDevice('user1', 'fp_device2');
      deviceTracker.checkDuplicateDevice('user1', 'fp_device3');

      // All should be fine for same user
      expect(deviceTracker.checkDuplicateDevice('user1', 'fp_device1').found).toBe(false);
      expect(deviceTracker.checkDuplicateDevice('user1', 'fp_device2').found).toBe(false);
      expect(deviceTracker.checkDuplicateDevice('user1', 'fp_device3').found).toBe(false);

      // But flagged for different user
      expect(deviceTracker.checkDuplicateDevice('user2', 'fp_device2').found).toBe(true);
    });
  });
});
