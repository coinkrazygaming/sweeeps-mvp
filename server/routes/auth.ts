import { RequestHandler } from "express";
import { v4 as uuid } from "uuid";
import pool from "../db";
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "../auth";

export const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res
        .status(400)
        .json({ error: "Email, password, and username are required" });
      return;
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        [email, username],
      );

      if (existing.rows.length > 0) {
        res.status(409).json({ error: "Email or username already exists" });
        return;
      }

      const userId = uuid();
      const passwordHash = await hashPassword(password);

      // Create user
      await client.query(
        `INSERT INTO users (id, email, password_hash, username) VALUES ($1, $2, $3, $4)`,
        [userId, email, passwordHash, username],
      );

      // Initialize balance
      await client.query(
        `INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins) VALUES ($1, $2, $3)`,
        [userId, 10, 50],
      ); // 10 GC and 50 SC starting balance

      // Log transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, "signup_bonus", "GC", 10, "Signup bonus"],
      );

      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, "signup_bonus", "SC", 50, "Signup bonus"],
      );

      const payload: TokenPayload = { userId, email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          username,
          goldCoins: 10,
          sweepstakesCoins: 50,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const client = await pool.connect();
    try {
      const user = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const userData = user.rows[0];

      if (!userData.is_active) {
        res.status(403).json({ error: "Account is frozen" });
        return;
      }

      const passwordMatch = await verifyPassword(
        password,
        userData.password_hash,
      );

      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Get current balances
      const balances = await client.query(
        "SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userData.id],
      );

      const payload: TokenPayload = {
        userId: userData.id,
        email: userData.email,
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          goldCoins: balances.rows[0]?.gold_coins || 0,
          sweepstakesCoins: balances.rows[0]?.sweepstakes_coins || 0,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refresh: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // In a real app, you'd verify the refresh token and check it against a stored list
    // For MVP, we'll just generate a new access token
    const payload: TokenPayload = {
      userId: "user-id",
      email: "user@example.com",
    };
    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
};
