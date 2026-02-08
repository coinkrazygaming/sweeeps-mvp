import { RequestHandler } from "express";
import { v4 as uuid } from "uuid";
import pool from "../db";

const MINIMUM_REDEMPTION_AMOUNT = 100; // Minimum SC to redeem

export const createRedemptionRequest: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { sweepstakesCoins, prizeDescription } = req.body;

    if (!sweepstakesCoins || sweepstakesCoins < MINIMUM_REDEMPTION_AMOUNT) {
      res
        .status(400)
        .json({
          error: `Minimum redemption amount is ${MINIMUM_REDEMPTION_AMOUNT} SC`,
        });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get current balance
      const balance = await client.query(
        "SELECT sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      if (
        balance.rows.length === 0 ||
        parseFloat(balance.rows[0].sweepstakes_coins) < sweepstakesCoins
      ) {
        res.status(409).json({ error: "Insufficient sweepstakes coins" });
        await client.query("ROLLBACK");
        return;
      }

      // Create redemption request
      const redemptionId = uuid();
      await client.query(
        `INSERT INTO redemptions (id, user_id, sweepstakes_coins, prize_description, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          redemptionId,
          userId,
          sweepstakesCoins,
          prizeDescription || "Sweepstakes prize",
          "pending",
        ],
      );

      // Hold the coins (deduct from balance)
      const currentGC = await client.query(
        "SELECT gold_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const newSC =
        parseFloat(balance.rows[0].sweepstakes_coins) - sweepstakesCoins;
      const newGC = parseFloat(currentGC.rows[0].gold_coins);

      await client.query(
        "INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins) VALUES ($1, $2, $3)",
        [userId, newGC, newSC],
      );

      // Log transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "redemption_pending",
          "SC",
          -sweepstakesCoins,
          "Redemption request",
          JSON.stringify({ redemptionId }),
        ],
      );

      await client.query("COMMIT");

      res.status(201).json({
        redemptionId,
        status: "pending",
        sweepstakesCoins,
        newBalance: {
          sweepstakesCoins: newSC,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create redemption error:", error);
    res.status(500).json({ error: "Failed to create redemption request" });
  }
};

export const getRedemptionStatus: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { redemptionId } = req.params;

    const client = await pool.connect();
    try {
      const redemption = await client.query(
        "SELECT * FROM redemptions WHERE id = $1 AND user_id = $2",
        [redemptionId, userId],
      );

      if (redemption.rows.length === 0) {
        res.status(404).json({ error: "Redemption not found" });
        return;
      }

      const r = redemption.rows[0];

      res.json({
        id: r.id,
        sweepstakesCoins: parseFloat(r.sweepstakes_coins),
        prizeDescription: r.prize_description,
        status: r.status,
        adminNotes: r.admin_notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get redemption error:", error);
    res.status(500).json({ error: "Failed to get redemption status" });
  }
};

export const getUserRedemptions: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { status, limit = "20", offset = "0" } = req.query;

    const client = await pool.connect();
    try {
      let sql =
        "SELECT id, sweepstakes_coins, prize_description, status, created_at FROM redemptions WHERE user_id = $1";
      let params: any[] = [userId];

      if (status) {
        sql += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit as string), parseInt(offset as string));

      const redemptions = await client.query(sql, params);

      res.json({
        redemptions: redemptions.rows.map((r) => ({
          id: r.id,
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
    console.error("Get user redemptions error:", error);
    res.status(500).json({ error: "Failed to get redemptions" });
  }
};

export const cancelRedemption: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { redemptionId } = req.params;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const redemption = await client.query(
        "SELECT * FROM redemptions WHERE id = $1 AND user_id = $2 AND status = $3",
        [redemptionId, userId, "pending"],
      );

      if (redemption.rows.length === 0) {
        res
          .status(404)
          .json({ error: "Redemption not found or cannot be cancelled" });
        await client.query("ROLLBACK");
        return;
      }

      const r = redemption.rows[0];

      // Update status
      await client.query(
        "UPDATE redemptions SET status = $1, updated_at = NOW() WHERE id = $2",
        ["cancelled", redemptionId],
      );

      // Refund coins
      const currentBalance = await client.query(
        "SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const newSC =
        parseFloat(currentBalance.rows[0].sweepstakes_coins) +
        parseFloat(r.sweepstakes_coins);

      await client.query(
        "INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins) VALUES ($1, $2, $3)",
        [userId, parseFloat(currentBalance.rows[0].gold_coins), newSC],
      );

      // Log transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          "redemption_cancelled",
          "SC",
          parseFloat(r.sweepstakes_coins),
          "Redemption cancelled",
        ],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        newBalance: { sweepstakesCoins: newSC },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Cancel redemption error:", error);
    res.status(500).json({ error: "Failed to cancel redemption" });
  }
};
