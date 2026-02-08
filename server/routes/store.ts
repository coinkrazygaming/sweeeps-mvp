import { RequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import pool from '../db';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

export const listPackages: RequestHandler = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const packages = await client.query(
        'SELECT * FROM gc_packages WHERE is_active = true ORDER BY display_order ASC'
      );

      res.json({
        packages: packages.rows.map((p) => ({
          id: p.id,
          name: p.name,
          goldCoins: parseFloat(p.gold_coins),
          bonusSweeepstakesCoins: parseFloat(p.bonus_sweepstakes_coins),
          priceCents: p.price_cents,
          description: p.description,
        })),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('List packages error:', error);
    res.status(500).json({ error: 'Failed to list packages' });
  }
};

export const createCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { packageId, promoCode } = req.body;

    if (!packageId) {
      res.status(400).json({ error: 'Package ID is required' });
      return;
    }

    const client = await pool.connect();
    try {
      // Get package details
      const pkg = await client.query('SELECT * FROM gc_packages WHERE id = $1', [packageId]);

      if (pkg.rows.length === 0) {
        res.status(404).json({ error: 'Package not found' });
        return;
      }

      const pkgData = pkg.rows[0];
      let finalPrice = pkgData.price_cents;
      let bonusGC = 0;
      let bonusSC = parseFloat(pkgData.bonus_sweepstakes_coins);

      // Apply promo code if provided
      if (promoCode) {
        const promo = await client.query(
          `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true 
           AND (expiry_date IS NULL OR expiry_date > NOW())
           AND (max_uses = -1 OR current_uses < max_uses)`,
          [promoCode.toUpperCase()]
        );

        if (promo.rows.length > 0) {
          const promoData = promo.rows[0];
          if (promoData.bonus_type === 'percentage') {
            finalPrice = Math.floor(finalPrice * (1 - promoData.bonus_amount / 100));
          } else if (promoData.bonus_type === 'fixed') {
            finalPrice = Math.max(0, finalPrice - promoData.bonus_amount * 100);
          } else if (promoData.bonus_type === 'gc_bonus') {
            bonusGC = parseFloat(promoData.bonus_amount);
          } else if (promoData.bonus_type === 'sc_bonus') {
            bonusSC += parseFloat(promoData.bonus_amount);
          }

          // Increment promo usage
          await client.query(
            'UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = $1',
            [promoData.id]
          );
        }
      }

      // For MVP, we'll create a checkout session but use a test token
      // In production, use real Stripe
      const sessionId = uuid();

      res.json({
        sessionId,
        clientSecret: `test_${sessionId}`,
        amount: finalPrice,
        currency: 'usd',
        package: {
          id: pkgData.id,
          goldCoins: parseFloat(pkgData.gold_coins) + bonusGC,
          bonusSweeepstakesCoins: bonusSC,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const completePurchase: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { packageId, stripeTransactionId, promoCode } = req.body;

    if (!packageId || !stripeTransactionId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get package
      const pkg = await client.query('SELECT * FROM gc_packages WHERE id = $1', [packageId]);

      if (pkg.rows.length === 0) {
        res.status(404).json({ error: 'Package not found' });
        return;
      }

      const pkgData = pkg.rows[0];
      let bonusGC = 0;
      let bonusSC = parseFloat(pkgData.bonus_sweepstakes_coins);

      // Apply promo if provided
      if (promoCode) {
        const promo = await client.query(
          'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
          [promoCode.toUpperCase()]
        );

        if (promo.rows.length > 0) {
          const promoData = promo.rows[0];
          if (promoData.bonus_type === 'gc_bonus') {
            bonusGC = parseFloat(promoData.bonus_amount);
          } else if (promoData.bonus_type === 'sc_bonus') {
            bonusSC += parseFloat(promoData.bonus_amount);
          }
        }
      }

      // Get current balance
      const balance = await client.query(
        'SELECT gold_coins, sweepstakes_coins FROM user_balances WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [userId]
      );

      const currentBalance = balance.rows[0] || { gold_coins: 0, sweepstakes_coins: 0 };
      const newGC = parseFloat(currentBalance.gold_coins) + parseFloat(pkgData.gold_coins) + bonusGC;
      const newSC = parseFloat(currentBalance.sweepstakes_coins) + bonusSC;

      // Update balance
      await client.query(
        'INSERT INTO user_balances (user_id, gold_coins, sweepstakes_coins) VALUES ($1, $2, $3)',
        [userId, newGC, newSC]
      );

      // Record purchase
      const purchaseId = uuid();
      await client.query(
        `INSERT INTO purchases (id, user_id, package_id, amount_cents, stripe_transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [purchaseId, userId, packageId, pkgData.price_cents, stripeTransactionId, 'completed']
      );

      // Log transactions
      await client.query(
        `INSERT INTO transactions (user_id, type, currency_type, amount, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          'purchase',
          'GC',
          parseFloat(pkgData.gold_coins) + bonusGC,
          `Purchased ${pkgData.name}`,
          JSON.stringify({ purchaseId, stripeTransactionId }),
        ]
      );

      if (bonusSC > 0) {
        await client.query(
          `INSERT INTO transactions (user_id, type, currency_type, amount, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'purchase_bonus', 'SC', bonusSC, 'Sweepstakes bonus from purchase']
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        purchaseId,
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
    console.error('Complete purchase error:', error);
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
};

export const validatePromoCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const client = await pool.connect();
    try {
      const promo = await client.query(
        `SELECT * FROM promo_codes WHERE code = $1 AND is_active = true 
         AND (expiry_date IS NULL OR expiry_date > NOW())
         AND (max_uses = -1 OR current_uses < max_uses)`,
        [code.toUpperCase()]
      );

      if (promo.rows.length === 0) {
        res.status(404).json({ error: 'Invalid or expired promo code' });
        return;
      }

      const promoData = promo.rows[0];

      res.json({
        valid: true,
        code: promoData.code,
        description: promoData.description,
        bonusType: promoData.bonus_type,
        bonusAmount: parseFloat(promoData.bonus_amount),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
};
