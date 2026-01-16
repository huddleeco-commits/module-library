/**
 * User Balance Database Service
 * Handles all database operations for user wallets and transactions
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool (reuses existing pool if available)
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[user-balance] Unexpected pool error:', err);
    });
  }
  return pool;
}

// Initialize the schema
async function initializeSchema() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await getPool().query(schema);
    console.log('[user-balance] Schema initialized');
    return true;
  } catch (err) {
    console.error('[user-balance] Schema init failed:', err.message);
    return false;
  }
}

// ============================================
// BALANCE OPERATIONS
// ============================================

/**
 * Get or create user balance record
 */
async function getBalance(userId) {
  const db = getPool();

  // Try to get existing balance
  let result = await db.query(
    'SELECT * FROM user_balances WHERE user_id = $1',
    [userId]
  );

  // Create if doesn't exist
  if (result.rows.length === 0) {
    result = await db.query(
      `INSERT INTO user_balances (user_id, available_balance, pending_balance, lifetime_earnings)
       VALUES ($1, 0.00, 0.00, 0.00)
       RETURNING *`,
      [userId]
    );
  }

  return result.rows[0];
}

/**
 * Get full balance summary with earnings breakdown
 */
async function getBalanceSummary(userId) {
  const db = getPool();

  // Get balance
  const balance = await getBalance(userId);

  // Get earnings for different periods
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const earningsQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN created_at >= $2 THEN amount ELSE 0 END), 0) as today_earnings,
      COALESCE(SUM(CASE WHEN created_at >= $3 THEN amount ELSE 0 END), 0) as week_earnings,
      COALESCE(SUM(CASE WHEN created_at >= $4 THEN amount ELSE 0 END), 0) as month_earnings
    FROM balance_transactions
    WHERE user_id = $1 AND amount > 0 AND status = 'completed'
  `;

  const earnings = await db.query(earningsQuery, [
    userId,
    todayStart.toISOString(),
    weekStart.toISOString(),
    monthStart.toISOString()
  ]);

  return {
    userId: parseInt(userId),
    available: parseFloat(balance.available_balance) || 0,
    pending: parseFloat(balance.pending_balance) || 0,
    lifetimeEarnings: parseFloat(balance.lifetime_earnings) || 0,
    todayEarnings: parseFloat(earnings.rows[0]?.today_earnings) || 0,
    weekEarnings: parseFloat(earnings.rows[0]?.week_earnings) || 0,
    monthEarnings: parseFloat(earnings.rows[0]?.month_earnings) || 0,
    currency: balance.currency || 'USD',
    lastUpdated: balance.updated_at
  };
}

/**
 * Credit user balance (add money)
 */
async function creditBalance(userId, amount, type, description, referenceId = null, metadata = {}) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get or create balance
    let balanceResult = await client.query(
      'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      balanceResult = await client.query(
        `INSERT INTO user_balances (user_id, available_balance, pending_balance, lifetime_earnings)
         VALUES ($1, 0.00, 0.00, 0.00)
         RETURNING *`,
        [userId]
      );
    }

    const currentBalance = parseFloat(balanceResult.rows[0].available_balance) || 0;
    const currentLifetime = parseFloat(balanceResult.rows[0].lifetime_earnings) || 0;
    const newBalance = currentBalance + amount;
    const newLifetime = currentLifetime + amount;

    // Update balance
    await client.query(
      `UPDATE user_balances
       SET available_balance = $2, lifetime_earnings = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, newBalance, newLifetime]
    );

    // Create transaction record
    const txnResult = await client.query(
      `INSERT INTO balance_transactions
       (user_id, type, amount, description, reference_id, status, balance_after, metadata)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7)
       RETURNING *`,
      [userId, type, amount, description, referenceId, newBalance, JSON.stringify(metadata)]
    );

    await client.query('COMMIT');

    return {
      success: true,
      transaction: formatTransaction(txnResult.rows[0]),
      newBalance: newBalance
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[user-balance] Credit failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Debit user balance (remove money)
 */
async function debitBalance(userId, amount, type, description, referenceId = null, metadata = {}) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Get balance with lock
    const balanceResult = await client.query(
      'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      throw new Error('User balance not found');
    }

    const currentBalance = parseFloat(balanceResult.rows[0].available_balance) || 0;

    // Check sufficient balance
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance - amount;

    // Update balance
    await client.query(
      `UPDATE user_balances
       SET available_balance = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, newBalance]
    );

    // Create transaction record (negative amount for debit)
    const txnResult = await client.query(
      `INSERT INTO balance_transactions
       (user_id, type, amount, description, reference_id, status, balance_after, metadata)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6, $7)
       RETURNING *`,
      [userId, type, -amount, description, referenceId, newBalance, JSON.stringify(metadata)]
    );

    await client.query('COMMIT');

    return {
      success: true,
      transaction: formatTransaction(txnResult.rows[0]),
      newBalance: newBalance
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[user-balance] Debit failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Move balance from available to pending (for cashout requests)
 */
async function holdBalance(userId, amount, referenceId) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const balanceResult = await client.query(
      'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      throw new Error('User balance not found');
    }

    const available = parseFloat(balanceResult.rows[0].available_balance) || 0;
    const pending = parseFloat(balanceResult.rows[0].pending_balance) || 0;

    if (available < amount) {
      throw new Error('Insufficient available balance');
    }

    await client.query(
      `UPDATE user_balances
       SET available_balance = $2, pending_balance = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, available - amount, pending + amount]
    );

    // Record as pending transaction
    await client.query(
      `INSERT INTO balance_transactions
       (user_id, type, amount, description, reference_id, status, balance_after)
       VALUES ($1, 'cashout_hold', $2, 'Balance held for cashout', $3, 'pending', $4)`,
      [userId, -amount, referenceId, available - amount]
    );

    await client.query('COMMIT');

    return { success: true, newAvailable: available - amount, newPending: pending + amount };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Release held balance (cashout completed or cancelled)
 */
async function releaseHold(userId, amount, referenceId, completed = true) {
  const db = getPool();
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const balanceResult = await client.query(
      'SELECT * FROM user_balances WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      throw new Error('User balance not found');
    }

    const available = parseFloat(balanceResult.rows[0].available_balance) || 0;
    const pending = parseFloat(balanceResult.rows[0].pending_balance) || 0;

    if (completed) {
      // Cashout completed - remove from pending
      await client.query(
        `UPDATE user_balances
         SET pending_balance = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId, Math.max(0, pending - amount)]
      );

      // Update hold transaction to completed
      await client.query(
        `UPDATE balance_transactions SET status = 'completed'
         WHERE user_id = $1 AND reference_id = $2 AND status = 'pending'`,
        [userId, referenceId]
      );
    } else {
      // Cashout cancelled - return to available
      await client.query(
        `UPDATE user_balances
         SET available_balance = $2, pending_balance = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId, available + amount, Math.max(0, pending - amount)]
      );

      // Update hold transaction to reversed
      await client.query(
        `UPDATE balance_transactions SET status = 'reversed'
         WHERE user_id = $1 AND reference_id = $2 AND status = 'pending'`,
        [userId, referenceId]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ============================================
// TRANSACTION HISTORY
// ============================================

/**
 * Get transaction history for user
 */
async function getTransactions(userId, options = {}) {
  const db = getPool();
  const { type, status, limit = 50, offset = 0 } = options;

  let query = `
    SELECT * FROM balance_transactions
    WHERE user_id = $1
  `;
  const params = [userId];
  let paramIndex = 2;

  if (type) {
    query += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (status) {
    query += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) FROM balance_transactions WHERE user_id = $1';
  const countParams = [userId];
  if (type) {
    countQuery += ' AND type = $2';
    countParams.push(type);
  }
  const countResult = await db.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  return {
    transactions: result.rows.map(formatTransaction),
    count: result.rows.length,
    total: totalCount,
    hasMore: offset + result.rows.length < totalCount
  };
}

/**
 * Get earnings breakdown by type for a period
 */
async function getEarningsBreakdown(userId, period = 'month') {
  const db = getPool();

  let dateFilter;
  const now = new Date();

  switch (period) {
    case 'today':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      dateFilter = new Date(now);
      dateFilter.setDate(dateFilter.getDate() - 7);
      break;
    case 'month':
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      dateFilter = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      dateFilter = new Date(0);
      break;
    default:
      dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const result = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'survey' THEN amount ELSE 0 END), 0) as surveys,
      COALESCE(SUM(CASE WHEN type = 'spin' THEN amount ELSE 0 END), 0) as spins,
      COALESCE(SUM(CASE WHEN type = 'streak_bonus' THEN amount ELSE 0 END), 0) as streak_bonuses,
      COALESCE(SUM(CASE WHEN type = 'achievement' THEN amount ELSE 0 END), 0) as achievements,
      COALESCE(SUM(CASE WHEN type = 'referral' THEN amount ELSE 0 END), 0) as referrals,
      COALESCE(SUM(CASE WHEN type NOT IN ('survey', 'spin', 'streak_bonus', 'achievement', 'referral', 'cashout', 'cashout_hold') THEN amount ELSE 0 END), 0) as other,
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as total
    FROM balance_transactions
    WHERE user_id = $1 AND created_at >= $2 AND status = 'completed'
  `, [userId, dateFilter.toISOString()]);

  const row = result.rows[0];

  return {
    surveys: parseFloat(row.surveys) || 0,
    spins: parseFloat(row.spins) || 0,
    streakBonuses: parseFloat(row.streak_bonuses) || 0,
    achievements: parseFloat(row.achievements) || 0,
    referrals: parseFloat(row.referrals) || 0,
    other: parseFloat(row.other) || 0,
    total: parseFloat(row.total) || 0,
    period
  };
}

// ============================================
// HELPERS
// ============================================

function formatTransaction(row) {
  return {
    id: `txn_${row.id}`,
    userId: row.user_id,
    type: row.type,
    amount: parseFloat(row.amount),
    description: row.description,
    referenceId: row.reference_id,
    status: row.status,
    balanceAfter: parseFloat(row.balance_after),
    metadata: row.metadata || {},
    createdAt: row.created_at
  };
}

module.exports = {
  initializeSchema,
  getBalance,
  getBalanceSummary,
  creditBalance,
  debitBalance,
  holdBalance,
  releaseHold,
  getTransactions,
  getEarningsBreakdown
};
