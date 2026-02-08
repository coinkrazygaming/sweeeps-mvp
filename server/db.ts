import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost/casino',
});

export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Enable uuid extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        kyc_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
        jurisdiction VARCHAR(50) DEFAULT 'US'
      )
    `);

    // User balances table (append-only ledger)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_balances (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gold_coins DECIMAL(20, 2) DEFAULT 0,
        sweepstakes_coins DECIMAL(20, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transaction ledger (immutable)
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        currency_type VARCHAR(10) NOT NULL,
        amount DECIMAL(20, 2) NOT NULL,
        description VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_currency CHECK (currency_type IN ('GC', 'SC'))
      )
    `);

    // Games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        rtp_percentage DECIMAL(5, 2) DEFAULT 95.0,
        min_bet DECIMAL(20, 2) DEFAULT 1,
        max_bet DECIMAL(20, 2) DEFAULT 1000,
        is_active BOOLEAN DEFAULT true,
        game_config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Game sessions (sessions/plays)
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        game_id UUID NOT NULL REFERENCES games(id),
        bet_amount DECIMAL(20, 2) NOT NULL,
        currency_type VARCHAR(10) NOT NULL,
        win_amount DECIMAL(20, 2) DEFAULT 0,
        result JSONB,
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_currency CHECK (currency_type IN ('GC', 'SC'))
      )
    `);

    // Gold coin packages
    await client.query(`
      CREATE TABLE IF NOT EXISTS gc_packages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        gold_coins DECIMAL(20, 2) NOT NULL,
        bonus_sweepstakes_coins DECIMAL(20, 2) DEFAULT 0,
        price_cents INTEGER NOT NULL,
        description TEXT,
        display_order INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Purchases
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        package_id UUID NOT NULL REFERENCES gc_packages(id),
        amount_cents INTEGER NOT NULL,
        stripe_transaction_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Promo codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(255),
        bonus_type VARCHAR(20),
        bonus_amount DECIMAL(20, 2),
        max_uses INTEGER DEFAULT -1,
        current_uses INTEGER DEFAULT 0,
        expiry_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Redemption requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS redemptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sweepstakes_coins DECIMAL(20, 2) NOT NULL,
        prize_description VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin audit log
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID NOT NULL REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        target_user_id UUID REFERENCES users(id),
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON game_sessions(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status)');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
