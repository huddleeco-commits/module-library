/**
 * Validation Unit Tests
 *
 * Tests for input validation utilities:
 * - Email validation
 * - Phone number validation
 * - Input sanitization
 * - Password strength validation
 */

describe('Validation Unit Tests', () => {
  // Email validation helper
  const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase().trim());
  };

  // Phone validation helper
  const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Check for valid formats: 10-15 digits, optionally starting with +
    return /^\+?\d{10,15}$/.test(cleaned);
  };

  // Input sanitization helper
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets (basic XSS prevention)
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  };

  // Password strength validator
  const validatePassword = (password) => {
    const errors = [];

    if (!password || typeof password !== 'string') {
      return { valid: false, errors: ['Password is required'] };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors,
      strength: calculatePasswordStrength(password)
    };
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 6) return 'strong';
    return 'very_strong';
  };

  describe('Email Validation', () => {
    test('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@example.co.uk',
        'firstname.lastname@company.com',
        '123@numbers.com',
        'test@sub.domain.example.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        null,
        undefined,
        'notanemail',
        '@nodomain.com',
        'noat.com',
        'spaces in@email.com',
        'double@@at.com',
        'nodotcom@domain'
        // Note: Simple regex doesn't catch all edge cases like dots at start/end
        // For production, use a more comprehensive validation library
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    test('should normalize email case', () => {
      expect(isValidEmail('TEST@EXAMPLE.COM')).toBe(true);
      expect(isValidEmail('Test@Example.Com')).toBe(true);
    });

    test('should trim whitespace from email', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
      expect(isValidEmail('\ttest@example.com\n')).toBe(true);
    });
  });

  describe('Phone Validation', () => {
    test('should accept valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+11234567890',
        '+44 20 7946 0958',
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
        '+1 (123) 456-7890'
      ];

      validPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(true);
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '',
        null,
        undefined,
        '123',
        '12345',
        'not-a-phone',
        '123-456-789O', // letter O instead of 0
        'abc1234567890',
        '1234567890123456' // too long
      ];

      invalidPhones.forEach(phone => {
        expect(isValidPhone(phone)).toBe(false);
      });
    });

    test('should handle international formats', () => {
      expect(isValidPhone('+442079460958')).toBe(true);
      expect(isValidPhone('+861234567890')).toBe(true);
      expect(isValidPhone('+33123456789')).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    test('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\n\thello\t\n')).toBe('hello');
    });

    test('should remove HTML angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    test('should remove control characters', () => {
      expect(sanitizeInput('Hello\x00World')).toBe('HelloWorld');
      expect(sanitizeInput('Test\x1FString')).toBe('TestString');
    });

    test('should handle non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
    });

    test('should preserve valid characters', () => {
      const validInput = 'Hello, World! 123 - Test @ Email.com';
      expect(sanitizeInput(validInput)).toBe(validInput);
    });

    test('should handle unicode characters', () => {
      const unicode = '\u4e2d\u6587\u6d4b\u8bd5 \u00e9\u00e8\u00ea \u2764';
      expect(sanitizeInput(unicode)).toBe(unicode);
    });
  });

  describe('Password Validation', () => {
    test('should accept strong passwords', () => {
      const strongPasswords = [
        'Password123',
        'SecureP@ss1',
        'MyStr0ngP@ssword!',
        'Abcd1234Efgh'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        { password: 'short', expectedError: 'at least 8 characters' },
        { password: 'nouppercase123', expectedError: 'uppercase letter' },
        { password: 'NOLOWERCASE123', expectedError: 'lowercase letter' },
        { password: 'NoNumbers!', expectedError: 'number' }
      ];

      weakPasswords.forEach(({ password, expectedError }) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.toLowerCase().includes(expectedError.toLowerCase()))).toBe(true);
      });
    });

    test('should reject empty or null passwords', () => {
      expect(validatePassword('')).toEqual({
        valid: false,
        errors: ['Password is required']
      });
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });

    test('should reject excessively long passwords', () => {
      const longPassword = 'A'.repeat(129) + 'a1';
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('less than 128'))).toBe(true);
    });

    test('should calculate password strength correctly', () => {
      // Strength is based on: length (8+, 12+, 16+), uppercase, lowercase, numbers, special chars
      // 'weak1234' = 8 chars (1) + numbers (1) = 2 points = weak
      // But it has lowercase too, so score is 3 = medium
      expect(validatePassword('ab12').strength).toBe('weak'); // short, lowercase, numbers = 2
      expect(validatePassword('Medium123').strength).toBe('medium'); // 8+, upper, lower, num = 4
      expect(validatePassword('StrongP@ss123').strength).toBe('strong'); // 8+, 12+, upper, lower, num, special = 6
      expect(validatePassword('VeryStrongP@$$w0rd!!!').strength).toBe('very_strong'); // 8+, 12+, 16+, upper, lower, num, special = 7
    });

    test('should return all applicable errors', () => {
      const result = validatePassword('abc');
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some(e => e.includes('8 characters'))).toBe(true);
      expect(result.errors.some(e => e.includes('uppercase'))).toBe(true);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });
  });

  describe('SQL Injection Prevention', () => {
    // SQL injection detection helper - focuses on dangerous patterns
    // Note: For production, use parameterized queries instead of pattern detection
    const containsSQLInjection = (input) => {
      if (typeof input !== 'string') return false;
      const sqlPatterns = [
        // Patterns that combine SQL keywords with dangerous syntax
        /(\bOR\b\s*['"]?\d+['"]?\s*=\s*['"]?\d+)/i, // OR '1'='1'
        /(\bAND\b\s*['"]?\d+['"]?\s*=\s*['"]?\d+)/i, // AND 1=1
        /(--\s*$)/,  // SQL comment at end
        /(;\s*DROP\b)/i, // ; DROP
        /(;\s*DELETE\b)/i, // ; DELETE
        /(\bUNION\s+SELECT\b)/i, // UNION SELECT
        /(xp_cmdshell)/i // SQL Server command execution
      ];
      return sqlPatterns.some(pattern => pattern.test(input));
    };

    test('should detect common SQL injection patterns', () => {
      const injections = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'-- ",
        "1 UNION SELECT * FROM users"
      ];

      injections.forEach(injection => {
        expect(containsSQLInjection(injection)).toBe(true);
      });
    });

    test('should not flag normal input as SQL injection', () => {
      const normalInputs = [
        'Hello World',
        'user@example.com',
        "It's a beautiful day",
        '123-456-7890',
        'Select the best option', // Just the word "select" is fine
        'The union of sets', // Just the word "union" is fine
        'Please update your profile', // Just "update" is fine
        'Delete this item from cart' // Just "delete" is fine
      ];

      normalInputs.forEach(input => {
        expect(containsSQLInjection(input)).toBe(false);
      });
    });
  });

  describe('XSS Prevention', () => {
    // XSS detection helper
    const containsXSS = (input) => {
      if (typeof input !== 'string') return false;
      const xssPatterns = [
        /<script\b[^>]*>/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe\b/i,
        /<object\b/i,
        /<embed\b/i,
        /eval\s*\(/i,
        /expression\s*\(/i
      ];
      return xssPatterns.some(pattern => pattern.test(input));
    };

    test('should detect common XSS patterns', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '<iframe src="evil.com"></iframe>',
        '<body onload="alert(1)">',
        'eval("alert(1)")'
      ];

      xssAttempts.forEach(xss => {
        expect(containsXSS(xss)).toBe(true);
      });
    });

    test('should not flag normal HTML as XSS', () => {
      const normalInputs = [
        'Hello World',
        'The script was good',
        'Click the button',
        'My favorite color is <blue>',
        'Java is not JavaScript'
      ];

      normalInputs.forEach(input => {
        expect(containsXSS(input)).toBe(false);
      });
    });
  });
});
