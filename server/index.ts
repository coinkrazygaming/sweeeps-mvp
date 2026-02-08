import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./db";
import { authMiddleware, errorHandler } from "./middleware";
import { seedGames } from "./game-engine";

// Auth routes
import { signup, login, refresh } from "./routes/auth";

// User routes
import {
  getProfile,
  getBalance,
  getTransactionHistory,
  getGameHistory,
  addDailyBonus,
} from "./routes/users";

// Game routes
import { listGames, getGameDetails, playGame } from "./routes/games";

// Store routes
import {
  listPackages,
  createCheckoutSession,
  completePurchase,
  validatePromoCode,
} from "./routes/store";

// Redemption routes
import {
  createRedemptionRequest,
  getRedemptionStatus,
  getUserRedemptions,
  cancelRedemption,
} from "./routes/redemptions";

// Admin routes
import {
  searchUsers,
  adjustBalance,
  freezeAccount,
  listRedemptions,
  approveRedemption,
  rejectRedemption,
  getAnalytics,
} from "./routes/admin";

let initialized = false;

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on first request
  app.use(async (req, res, next) => {
    if (!initialized) {
      try {
        await initializeDatabase();
        await seedGames();
        initialized = true;
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    }
    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.post("/api/auth/refresh", refresh);

  // User routes
  app.get("/api/users/profile", authMiddleware, getProfile);
  app.get("/api/users/balance", authMiddleware, getBalance);
  app.get("/api/users/transactions", authMiddleware, getTransactionHistory);
  app.get("/api/users/games", authMiddleware, getGameHistory);
  app.post("/api/users/daily-bonus", authMiddleware, addDailyBonus);

  // Game routes
  app.get("/api/games", listGames);
  app.get("/api/games/:gameId", getGameDetails);
  app.post("/api/games/play", authMiddleware, playGame);

  // Store routes
  app.get("/api/store/packages", listPackages);
  app.post("/api/store/checkout", authMiddleware, createCheckoutSession);
  app.post("/api/store/purchase", authMiddleware, completePurchase);
  app.post("/api/store/validate-promo", validatePromoCode);

  // Redemption routes
  app.post("/api/redemptions", authMiddleware, createRedemptionRequest);
  app.get("/api/redemptions/:redemptionId", authMiddleware, getRedemptionStatus);
  app.get("/api/redemptions", authMiddleware, getUserRedemptions);
  app.delete("/api/redemptions/:redemptionId", authMiddleware, cancelRedemption);

  // Admin routes
  app.get("/api/admin/users/search", authMiddleware, searchUsers);
  app.post("/api/admin/users/balance", authMiddleware, adjustBalance);
  app.post("/api/admin/users/freeze", authMiddleware, freezeAccount);
  app.get("/api/admin/redemptions", authMiddleware, listRedemptions);
  app.post("/api/admin/redemptions/approve", authMiddleware, approveRedemption);
  app.post("/api/admin/redemptions/reject", authMiddleware, rejectRedemption);
  app.get("/api/admin/analytics", authMiddleware, getAnalytics);

  // Error handler (last)
  app.use(errorHandler);

  return app;
}
