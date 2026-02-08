import { RequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db';

// Simple admin check - in production, use proper role-based access control
const checkAdmin = (userId: string): Promise<boolean> => {
  // For MVP, just check if user email ends with @admin (placeholder)
  // In production, check a roles table
  return Promise.resolve(userId === process.env.ADMIN_USER_ID);
};

export const searchUsers: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { query, limit = '50', offset = '0' } = req.query;

    const client = await pool.connect();
    try {
      let sql = 'SELECT id, email, username, is_active, created_at FROM users';
      let params: any[] = [];

      if (query) {
        sql += ` WHERE email ILIKE $1 OR username ILIKE $1`;
        params.push(`%${query}%`);
      }

      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const users = await client.query(sql, params);

      // Get balances for each user
      const enriched = await Promise.all(
        users.rows.map(async (u) => {
          const balance = await client.query(
            'SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [u.id]
          );
          const bal = balance.rows[0] || { gold_coins: 0, sweepstakes_coins: 0 };
          return {
            id: u.id,
            email: u.email,
            username: u.username,
            isActive: u.is_active,
            goldCoins: parseFloat(bal.gold_coins),
            sweepstakesCoins: parseFloat(bal.sweepstakes_coins),
            createdAt: u.created_at,
          };
        })
      );

      res.json({ users: enriched });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

export const adjustBalance: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { targetUserId, currencyType, amount, reason } = req.body;

    if (!targetUserId || !currencyType || amount === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current balance
      const balance = await client.query(
        'SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [targetUserId]
      );

      if (balance.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        await client.query('ROLLBACK');
        return;
      }

      const currentBalance = balance.rows[0];
      const newGC = currencyType === 'GC' ? parseFloat(currentBalance.gold_coins) + amount : parseFloat(currentBalance.gold_coins);
      const newSC = currencyType === 'SC' ? parseFloat(currentBalance.sweepstakes_coins) + amount : parseFloat(currentBalance.sweepstakes_coins);

      // Update balance
      await client.query(
        'INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins) VALUES ($1, $2, $3)',
        [targetUserId, newGC, newSC]
      );

      // Log transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          targetUserId,
          'admin_adjustment',
          currencyType,
          amount,
          reason || 'Admin adjustment',
          JSON.stringify({ adminId }),
        ]
      );

      // Log audit
      await client.query(
        `INSERT INTO audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [adminId, 'balance_adjustment', targetUserId, JSON.stringify({ currencyType, amount, reason })]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        newBalance: {
          goldCoins: newGC,
          sweepstakesCoins: newSC,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Adjust balance error:', error);
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
};

export const freezeAccount: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { targetUserId, freeze } = req.body;

    if (!targetUserId || freeze === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('UPDATE users SET is_active = $1 WHERE id = $2', [!freeze, targetUserId]);

      await client.query(
        `INSERT INTO audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [adminId, freeze ? 'account_frozen' : 'account_unfrozen', targetUserId, JSON.stringify({})]
      );

      res.json({ success: true, frozen: freeze });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Freeze account error:', error);
    res.status(500).json({ error: 'Failed to freeze account' });
  }
};

export const listRedemptions: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { status = 'pending', limit = '50', offset = '0' } = req.query;

    const client = await pool.connect();
    try {
      const redemptions = await client.query(
        `SELECT r.id, r.user_id, u.email, u.username, r.sweepstakes_coins, r.prize_description, 
         r.status, r.created_at 
         FROM redemptions r
         JOIN users u ON r.user_id = u.id
         WHERE r.status = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [status, parseInt(limit as string), parseInt(offset as string)]
      );

      res.json({
        redemptions: redemptions.rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          email: r.email,
          username: r.username,
          sweepstakesCoins: parseFloat(r.sweepstakes_coins),
          prizeDescription: r.prize_description,
          status: r.status,
          createdAt: r.created_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List redemptions error:', error);
    res.status(500).json({ error: 'Failed to list redemptions' });
  }
};

export const approveRedemption: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { redemptionId, notes } = req.body;

    if (!redemptionId) {
      res.status(400).json({ error: 'Redemption ID is required' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const redemption = await client.query('SELECT * FROM redemptions WHERE id = $1', [redemptionId]);

      if (redemption.rows.length === 0) {
        res.status(404).json({ error: 'Redemption not found' });
        await client.query('ROLLBACK');
        return;
      }

      const redemptionData = redemption.rows[0];

      // Update redemption status
      await client.query(
        'UPDATE redemptions SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3',
        ['approved', notes || '', redemptionId]
      );

      // Log audit
      await client.query(
        `INSERT INTO audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [
          adminId,
          'redemption_approved',
          redemptionData.user_id,
          JSON.stringify({ redemptionId, sweepstakesCoins: redemptionData.sweepstakes_coins }),
        ]
      );

      await client.query('COMMIT');

      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Approve redemption error:', error);
    res.status(500).json({ error: 'Failed to approve redemption' });
  }
};

export const rejectRedemption: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { redemptionId, notes } = req.body;

    if (!redemptionId) {
      res.status(400).json({ error: 'Redemption ID is required' });
      return;
    }

    const client = await pool.connect();
    try {
      const redemption = await client.query('SELECT * FROM redemptions WHERE id = $1', [redemptionId]);

      if (redemption.rows.length === 0) {
        res.status(404).json({ error: 'Redemption not found' });
        return;
      }

      const redemptionData = redemption.rows[0];

      // Update redemption status
      await client.query(
        'UPDATE redemptions SET status = $1, admin_notes = $2, updated_at = NOW() WHERE id = $3',
        ['rejected', notes || '', redemptionId]
      );

      // Log audit
      await client.query(
        `INSERT INTO audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [
          adminId,
          'redemption_rejected',
          redemptionData.user_id,
          JSON.stringify({ redemptionId, reason: notes }),
        ]
      );

      res.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reject redemption error:', error);
    res.status(500).json({ error: 'Failed to reject redemption' });
  }
};

export const getAnalytics: RequestHandler = async (req, res) => {
  try {
    const adminId = req.userId;
    if (!adminId || !(await checkAdmin(adminId))) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const client = await pool.connect();
    try {
      // DAU/MAU
      const dau = await client.query(
        `SELECT COUNT(DISTINCT user_id) FROM game_sessions WHERE created_at >= NOW() - INTERVAL '1 day'`
      );
      const mau = await client.query(
        `SELECT COUNT(DISTINCT user_id) FROM game_sessions WHERE created_at >= NOW() - INTERVAL '30 days'`
      );

      // Total users
      const totalUsers = await client.query('SELECT COUNT(*) FROM users');

      // Revenue (purchases)
      const totalRevenue = await client.query(
        `SELECT SUM(amount_cents) as total FROM purchases WHERE status = 'completed'`
      );

      // Currency distribution
      const currencyDistribution = await client.query(`
        SELECT 
          SUM(gold_coins) as total_gold,
          SUM(sweepstakes_coins) as total_sweepstakes
        FROM user_balances
      `);

      res.json({
        dau: parseInt(dau.rows[0].count),
        mau: parseInt(mau.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalRevenueCents: totalRevenue.rows[0].total || 0,
        currencyDistribution: {
          totalGoldCoins: parseFloat(currencyDistribution.rows[0]?.total_gold || 0),
          totalSweeepstakesCoins: parseFloat(currencyDistribution.rows[0]?.total_sweepstakes || 0),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};
