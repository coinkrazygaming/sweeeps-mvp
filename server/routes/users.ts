import { RequestHandler } from "express";
import pool from "../db";

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const client = await pool.connect();
    try {
      const user = await client.query(
        "SELECT id, email, username, created_at FROM users WHERE id = $1",
        [userId],
      );

      if (user.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const balances = await client.query(
        "SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const userData = user.rows[0];
      const balance = balances.rows[0] || {
        gold_coins: 0,
        sweepstakes_coins: 0,
      };

      res.json({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        goldCoins: parseFloat(balance.gold_coins),
        sweepstakesCoins: parseFloat(balance.sweepstakes_coins),
        createdAt: userData.created_at,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

export const getBalance: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const client = await pool.connect();
    try {
      const balances = await client.query(
        "SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const balance = balances.rows[0] || {
        gold_coins: 0,
        sweepstakes_coins: 0,
      };

      res.json({
        goldCoins: parseFloat(balance.gold_coins),
        sweepstakesCoins: parseFloat(balance.sweepstakes_coins),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({ error: "Failed to get balance" });
  }
};

export const getTransactionHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { limit = "20", offset = "0" } = req.query;

    const client = await pool.connect();
    try {
      const transactions = await client.query(
        `SELECT id, type, currency_type, amount, description, created_at 
         FROM transactions 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, parseInt(limit as string), parseInt(offset as string)],
      );

      res.json({
        transactions: transactions.rows.map((t) => ({
          id: t.id,
          type: t.type,
          currencyType: t.currency_type,
          amount: parseFloat(t.amount),
          description: t.description,
          timestamp: t.created_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to get transaction history" });
  }
};

export const getGameHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { limit = "20", offset = "0" } = req.query;

    const client = await pool.connect();
    try {
      const sessions = await client.query(
        `SELECT gs.id, g.name, gs.bet_amount, gs.win_amount, gs.currency_type, gs.created_at
         FROM game_sessions gs
         JOIN games g ON gs.game_id = g.id
         WHERE gs.user_id = $1
         ORDER BY gs.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, parseInt(limit as string), parseInt(offset as string)],
      );

      res.json({
        games: sessions.rows.map((s) => ({
          id: s.id,
          gameName: s.name,
          betAmount: parseFloat(s.bet_amount),
          winAmount: parseFloat(s.win_amount),
          currencyType: s.currency_type,
          timestamp: s.created_at,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get game history error:", error);
    res.status(500).json({ error: "Failed to get game history" });
  }
};

export const addDailyBonus: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const client = await pool.connect();
    try {
      // Check if user already got bonus today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastBonus = await client.query(
        `SELECT created_at FROM transactions 
         WHERE user_id = $1 AND type = 'daily_bonus' AND created_at >= $2
         ORDER BY created_at DESC LIMIT 1`,
        [userId, today.toISOString()],
      );

      if (lastBonus.rows.length > 0) {
        res.status(409).json({ error: "Daily bonus already claimed" });
        return;
      }

      const bonusAmount = 25; // 25 sweepstakes coins
      const currentBalance = await client.query(
        "SELECT sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const newBalance =
        parseFloat(currentBalance.rows[0]?.sweepstakes_coins || 0) +
        bonusAmount;

      // Update balance
      await client.query(
        "INSERT INTO user_balances (user_id, sweepstakes_coins, gold_coins) VALUES ($1, $2, (SELECT gold_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1))",
        [userId, newBalance],
      );

      // Log transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, "daily_bonus", "SC", bonusAmount, "Daily login bonus"],
      );

      res.json({ success: true, bonusAmount, newBalance });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Daily bonus error:", error);
    res.status(500).json({ error: "Failed to claim daily bonus" });
  }
};

export const submitKYC: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { fullName, dateOfBirth, address, city, state, zipCode, country } =
      req.body;

    if (!fullName || !dateOfBirth || !address) {
      res.status(400).json({ error: "Missing required KYC fields" });
      return;
    }

    const client = await pool.connect();
    try {
      // Update user with KYC data
      const kycData = JSON.stringify({
        fullName,
        dateOfBirth,
        address,
        city,
        state,
        zipCode,
        country,
      });

      await client.query(
        `UPDATE users SET kyc_flags = array_append(kyc_flags, $1) WHERE id = $2`,
        ["KYC_SUBMITTED", userId],
      );

      // Store KYC in audit log for now (in production, use a separate table)
      await client.query(
        `INSERT INTO audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [userId, "KYC_SUBMISSION", userId, { kycData }],
      );

      res.json({
        success: true,
        message: "KYC information submitted successfully",
        status: "PENDING",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("KYC submission error:", error);
    res.status(500).json({ error: "Failed to submit KYC" });
  }
};

export const getKYCStatus: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const client = await pool.connect();
    try {
      const user = await client.query(
        "SELECT kyc_flags FROM users WHERE id = $1",
        [userId],
      );

      if (user.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const kycFlags = user.rows[0].kyc_flags || [];
      let status = "UNVERIFIED";

      if (kycFlags.includes("KYC_VERIFIED")) {
        status = "VERIFIED";
      } else if (kycFlags.includes("KYC_SUBMITTED")) {
        status = "PENDING";
      }

      res.json({ kycStatus: status, flags: kycFlags });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get KYC status error:", error);
    res.status(500).json({ error: "Failed to get KYC status" });
  }
};
