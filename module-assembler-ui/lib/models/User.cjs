/**
 * User Model - SlabTrack Pattern
 * PostgreSQL ORM-style model for user management
 *
 * Features:
 * - Static methods for CRUD operations
 * - Password hashing via bcryptjs
 * - Parameterized queries for security
 * - snake_case to camelCase transformation
 */

const bcrypt = require('bcryptjs');

class User {
  static tableName = 'users';

  /**
   * Get database pool
   * @param {Object} db - Database connection pool
   */
  static setDb(db) {
    User.db = db;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User object or null
   */
  static async findById(id) {
    if (!User.db) return null;

    const result = await User.db.query(
      `SELECT id, email, full_name, subscription_tier, is_admin, points, tier,
              phone, avatar_url, created_at, updated_at
       FROM ${User.tableName} WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? User.transform(result.rows[0]) : null;
  }

  /**
   * Find user by email
   * @param {string} email - User email (case-insensitive)
   * @returns {Object|null} User object or null
   */
  static async findByEmail(email) {
    if (!User.db) return null;

    const result = await User.db.query(
      `SELECT id, email, password_hash, full_name, subscription_tier, is_admin,
              points, tier, phone, avatar_url, reset_token, reset_token_expires,
              created_at, updated_at
       FROM ${User.tableName} WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    return result.rows[0] ? User.transform(result.rows[0]) : null;
  }

  /**
   * Find user by reset token
   * @param {string} token - Password reset token
   * @returns {Object|null} User object or null
   */
  static async findByResetToken(token) {
    if (!User.db) return null;

    const result = await User.db.query(
      `SELECT id, email, full_name, reset_token, reset_token_expires
       FROM ${User.tableName}
       WHERE reset_token = $1 AND reset_token_expires > NOW()`,
      [token]
    );

    return result.rows[0] ? User.transform(result.rows[0]) : null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  static async create(userData) {
    if (!User.db) throw new Error('Database not available');

    const { email, password, fullName, phone } = userData;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await User.db.query(
      `INSERT INTO ${User.tableName}
        (email, password_hash, full_name, phone, subscription_tier, is_admin, points, tier)
       VALUES ($1, $2, $3, $4, 'free', false, 0, 'bronze')
       RETURNING id, email, full_name, subscription_tier, is_admin, points, tier, created_at`,
      [email.toLowerCase(), passwordHash, fullName || 'User', phone || null]
    );

    return User.transform(result.rows[0]);
  }

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated user
   */
  static async update(id, updates) {
    if (!User.db) throw new Error('Database not available');

    const allowedFields = ['full_name', 'phone', 'avatar_url', 'subscription_tier'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = User.toSnakeCase(key);
      if (allowedFields.includes(snakeKey)) {
        setClauses.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return User.findById(id);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await User.db.query(
      `UPDATE ${User.tableName}
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, full_name, subscription_tier, is_admin, points, tier,
                 phone, avatar_url, created_at, updated_at`,
      values
    );

    return result.rows[0] ? User.transform(result.rows[0]) : null;
  }

  /**
   * Update password
   * @param {number} id - User ID
   * @param {string} newPassword - New password (plain text)
   * @returns {boolean} Success
   */
  static async updatePassword(id, newPassword) {
    if (!User.db) throw new Error('Database not available');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await User.db.query(
      `UPDATE ${User.tableName}
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, id]
    );

    return true;
  }

  /**
   * Set password reset token
   * @param {number} id - User ID
   * @param {string} token - Reset token
   * @param {Date} expiresAt - Token expiration
   * @returns {boolean} Success
   */
  static async setResetToken(id, token, expiresAt) {
    if (!User.db) throw new Error('Database not available');

    await User.db.query(
      `UPDATE ${User.tableName}
       SET reset_token = $1, reset_token_expires = $2, updated_at = NOW()
       WHERE id = $3`,
      [token, expiresAt, id]
    );

    return true;
  }

  /**
   * Verify password
   * @param {string} plainPassword - Password to verify
   * @param {string} hashedPassword - Stored hash
   * @returns {boolean} Password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {boolean} Email exists
   */
  static async emailExists(email) {
    if (!User.db) return false;

    const result = await User.db.query(
      `SELECT 1 FROM ${User.tableName} WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    return result.rows.length > 0;
  }

  /**
   * Get user count
   * @param {Object} filters - Optional filters
   * @returns {number} User count
   */
  static async count(filters = {}) {
    if (!User.db) return 0;

    let query = `SELECT COUNT(*) FROM ${User.tableName}`;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (filters.isAdmin !== undefined) {
      conditions.push(`is_admin = $${paramIndex}`);
      values.push(filters.isAdmin);
      paramIndex++;
    }

    if (filters.subscriptionTier) {
      conditions.push(`subscription_tier = $${paramIndex}`);
      values.push(filters.subscriptionTier);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await User.db.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Transform database row to camelCase object
   * @param {Object} row - Database row
   * @returns {Object} Transformed object
   */
  static transform(row) {
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      name: row.full_name, // Alias for compatibility
      subscriptionTier: row.subscription_tier || 'free',
      isAdmin: row.is_admin || false,
      points: row.points || 0,
      tier: row.tier || 'bronze',
      phone: row.phone,
      avatarUrl: row.avatar_url,
      resetToken: row.reset_token,
      resetTokenExpires: row.reset_token_expires,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * Convert camelCase to snake_case
   * @param {string} str - camelCase string
   * @returns {string} snake_case string
   */
  static toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

module.exports = { User };
