import { RequestHandler } from "express";
import { v4 as uuid } from "uuid";
import pool from "../db";
import {
  SlotsGame,
  BlackjackGame,
  RouletteGame,
  DiceGame,
  ScratchCardGame,
} from "../game-engine";

export const listGames: RequestHandler = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const games = await client.query(
        "SELECT * FROM games WHERE is_active = true ORDER BY name",
      );

      res.json({
        games: games.rows.map((g) => ({
          id: g.id,
          name: g.name,
          category: g.category,
          description: g.description,
          rtpPercentage: parseFloat(g.rtp_percentage),
          minBet: parseFloat(g.min_bet),
          maxBet: parseFloat(g.max_bet),
          gameConfig: g.game_config,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("List games error:", error);
    res.status(500).json({ error: "Failed to list games" });
  }
};

export const getGameDetails: RequestHandler = async (req, res) => {
  try {
    const { gameId } = req.params;

    const client = await pool.connect();
    try {
      const game = await client.query("SELECT * FROM games WHERE id = $1", [
        gameId,
      ]);

      if (game.rows.length === 0) {
        res.status(404).json({ error: "Game not found" });
        return;
      }

      const g = game.rows[0];

      res.json({
        id: g.id,
        name: g.name,
        category: g.category,
        description: g.description,
        rtpPercentage: parseFloat(g.rtp_percentage),
        minBet: parseFloat(g.min_bet),
        maxBet: parseFloat(g.max_bet),
        gameConfig: g.game_config,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get game details error:", error);
    res.status(500).json({ error: "Failed to get game details" });
  }
};

export const playGame: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { gameId, betAmount, currencyType, gameData } = req.body;

    if (!gameId || !betAmount || !currencyType) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!["GC", "SC"].includes(currencyType)) {
      res.status(400).json({ error: "Invalid currency type" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Get game details
      const game = await client.query("SELECT * FROM games WHERE id = $1", [
        gameId,
      ]);
      if (game.rows.length === 0) {
        res.status(404).json({ error: "Game not found" });
        return;
      }

      const gameRow = game.rows[0];
      const rtp = parseFloat(gameRow.rtp_percentage);

      // Get current balance
      const balance = await client.query(
        "SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [userId],
      );

      const currentBalance = balance.rows[0];
      const balanceKey =
        currencyType === "GC" ? "gold_coins" : "sweepstakes_coins";

      if (parseFloat(currentBalance[balanceKey]) < betAmount) {
        res.status(409).json({ error: "Insufficient balance" });
        await client.query("ROLLBACK");
        return;
      }

      // Play game based on game type
      let result: any = null;
      const gameName = gameRow.name.toLowerCase();

      if (gameName.includes("slots")) {
        result = SlotsGame.play(betAmount, rtp);
      } else if (gameName.includes("blackjack")) {
        result = BlackjackGame.play(betAmount, rtp);
      } else if (gameName.includes("roulette")) {
        result = RouletteGame.play(
          betAmount,
          gameData?.selectedNumber || 17,
          rtp,
        );
      } else if (gameName.includes("dice")) {
        result = DiceGame.play(betAmount, gameData?.selectedNumber || 7, rtp);
      } else if (gameName.includes("scratch")) {
        result = ScratchCardGame.play(betAmount, rtp);
      } else {
        // Default to slots
        result = SlotsGame.play(betAmount, rtp);
      }

      // Calculate new balance
      let newGC = parseFloat(currentBalance.gold_coins);
      let newSC = parseFloat(currentBalance.sweepstakes_coins);

      if (currencyType === "GC") {
        newGC -= betAmount;
        newGC += result.winAmount;
      } else {
        newSC -= betAmount;
        newSC += result.winAmount;
      }

      // Update balance
      await client.query(
        `INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins)
         VALUES ($1, $2, $3)`,
        [userId, newGC, newSC],
      );

      // Record game session
      const sessionId = uuid();
      await client.query(
        `INSERT INTO game_sessions (id, user_id, game_id, bet_amount, currency_type, win_amount, result)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          userId,
          gameId,
          betAmount,
          currencyType,
          result.winAmount,
          JSON.stringify(result),
        ],
      );

      // Log transactions
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          "game_bet",
          currencyType,
          -betAmount,
          `Bet on ${gameRow.name}`,
          JSON.stringify({ gameId, sessionId }),
        ],
      );

      if (result.winAmount > 0) {
        await client.query(
          `INSERT INTO transactions (user_id, type, currency_type, amount, description, metadata)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            "game_win",
            currencyType,
            result.winAmount,
            `Won on ${gameRow.name}`,
            JSON.stringify({ gameId, sessionId }),
          ],
        );
      }

      await client.query("COMMIT");

      res.json({
        sessionId,
        gameId,
        betAmount,
        winAmount: result.winAmount,
        won: result.won,
        result: result.resultData,
        newBalance: {
          goldCoins: newGC,
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
    console.error("Play game error:", error);
    res.status(500).json({ error: "Failed to play game" });
  }
};
