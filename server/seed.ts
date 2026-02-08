import "dotenv/config";
import { v4 as uuid } from "uuid";
import { hashPassword } from "./auth";
import pool from "./db";
import { initializeDatabase } from "./db";

const ADMIN_EMAIL = "coinkrazy26@gmail.com";
const ADMIN_PASSWORD = "admin123";

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  const client = await pool.connect();
  try {
    // Initialize database schema
    console.log("📊 Initializing database schema...");
    await initializeDatabase();

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminId = uuid();
    const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);

    try {
      // Check if admin exists
      const existingAdmin = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [ADMIN_EMAIL],
      );

      if (existingAdmin.rows.length > 0) {
        console.log(`⚠️  Admin user already exists`);
      } else {
        await client.query(
          `INSERT INTO users (id, email, password_hash, username, role, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [adminId, ADMIN_EMAIL, adminPasswordHash, "admin", "ADMIN", true],
        );

        // Initialize admin balance
        await client.query(
          `INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins)
           VALUES ($1, $2, $3)`,
          [adminId, 999999, 999999],
        );

        console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
      }
    } catch (error) {
      console.log(`⚠️  Error with admin user: ${(error as any).message}`);
    }

    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);

    // Create demo users
    console.log("👥 Creating demo users...");
    const demoUsers = [
      { email: "john@example.com", username: "john_player", gc: 100, sc: 500 },
      { email: "jane@example.com", username: "jane_winner", gc: 250, sc: 1500 },
      { email: "bob@example.com", username: "bob_slots", gc: 50, sc: 200 },
      {
        email: "alice@example.com",
        username: "alice_lucky",
        gc: 500,
        sc: 3000,
      },
      {
        email: "charlie@example.com",
        username: "charlie_frequent",
        gc: 75,
        sc: 750,
      },
    ];

    for (const demoUser of demoUsers) {
      const userId = uuid();
      const passwordHash = await hashPassword("password123");

      try {
        await client.query(
          `INSERT INTO users (id, email, password_hash, username, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, demoUser.email, passwordHash, demoUser.username, true],
        );

        await client.query(
          `INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins)
           VALUES ($1, $2, $3)`,
          [userId, demoUser.gc, demoUser.sc],
        );

        console.log(`  ✓ Created ${demoUser.username}`);
      } catch (error) {
        console.log(`  ⚠️  ${demoUser.username} already exists`);
      }
    }

    // Create coin packages
    console.log("📦 Creating coin packages...");
    const packages = [
      {
        name: "Starter Pack",
        goldCoins: 100,
        bonusSwc: 50,
        priceCents: 99,
        order: 1,
      },
      {
        name: "Silver Pack",
        goldCoins: 500,
        bonusSwc: 300,
        priceCents: 499,
        order: 2,
      },
      {
        name: "Gold Pack",
        goldCoins: 1500,
        bonusSwc: 1200,
        priceCents: 1499,
        order: 3,
      },
      {
        name: "Platinum Pack",
        goldCoins: 5000,
        bonusSwc: 5000,
        priceCents: 4999,
        order: 4,
      },
      {
        name: "Diamond Pack",
        goldCoins: 10000,
        bonusSwc: 15000,
        priceCents: 9999,
        order: 5,
      },
    ];

    for (const pkg of packages) {
      const packageId = uuid();
      try {
        await client.query(
          `INSERT INTO gc_packages (id, name, gold_coins, bonus_sweepstakes_coins, price_cents, display_order, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            packageId,
            pkg.name,
            pkg.goldCoins,
            pkg.bonusSwc,
            pkg.priceCents,
            pkg.order,
            true,
          ],
        );
        console.log(`  ✓ Created package: ${pkg.name}`);
      } catch (error) {
        console.log(`  ⚠️  Package ${pkg.name} already exists`);
      }
    }

    // Create promo codes
    console.log("🎟️  Creating promo codes...");
    const promoCodes = [
      {
        code: "WELCOME50",
        description: "50 bonus sweepstakes coins for new players",
        bonusType: "SC",
        bonusAmount: 50,
        maxUses: 1000,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        code: "GOLD100",
        description: "100 bonus gold coins",
        bonusType: "GC",
        bonusAmount: 100,
        maxUses: 500,
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      {
        code: "LUCK777",
        description: "777 bonus sweepstakes coins",
        bonusType: "SC",
        bonusAmount: 777,
        maxUses: 100,
        expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    ];

    for (const promo of promoCodes) {
      try {
        await client.query(
          `INSERT INTO promo_codes (code, description, bonus_type, bonus_amount, max_uses, expiry_date, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            promo.code,
            promo.description,
            promo.bonusType,
            promo.bonusAmount,
            promo.maxUses,
            promo.expiry,
            true,
          ],
        );
        console.log(`  ✓ Created promo: ${promo.code}`);
      } catch (error) {
        console.log(`  ⚠️  Promo ${promo.code} already exists`);
      }
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📝 Admin Credentials:");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\n🎮 Demo User Credentials (password: password123):");
    demoUsers.forEach((user) => {
      console.log(`   ${user.email}`);
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seedDatabase();
