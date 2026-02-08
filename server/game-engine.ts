import pool from './db';

// Server-side RNG service
export class RNGService {
  static generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomArray(length: number, min: number = 0, max: number = 9): number[] {
    return Array.from({ length }, () => this.generateRandomNumber(min, max));
  }

  static shouldWin(rtpPercentage: number): boolean {
    return Math.random() * 100 < rtpPercentage;
  }
}

// Game result types
export interface GameResult {
  gameId: string;
  betAmount: number;
  winAmount: number;
  won: boolean;
  resultData: any;
  rtp: number;
}

export interface SlotResult extends GameResult {
  reels: number[][];
}

export interface BlackjackResult extends GameResult {
  playerHand: string[];
  dealerHand: string[];
  playerTotal: number;
  dealerTotal: number;
}

export interface RouletteResult extends GameResult {
  spinResult: number;
  selectedNumber: number;
}

export interface DiceResult extends GameResult {
  diceRolls: number[];
  selectedNumber: number;
}

export interface ScratchCardResult extends GameResult {
  symbols: string[];
  matched: boolean;
}

// Game configurations
export const GAME_CONFIGS = {
  SLOTS_CLASSIC: {
    id: 'slots-classic',
    name: 'Classic Slots',
    category: 'slots',
    reels: 3,
    rows: 3,
    rtp: 95.0,
  },
  SLOTS_DELUXE: {
    id: 'slots-deluxe',
    name: 'Deluxe Slots',
    category: 'slots',
    reels: 5,
    rows: 3,
    rtp: 96.0,
  },
  BLACKJACK: {
    id: 'blackjack',
    name: 'Blackjack',
    category: 'table',
    rtp: 99.5,
  },
  ROULETTE: {
    id: 'roulette',
    name: 'Roulette',
    category: 'table',
    rtp: 97.3,
  },
  DICE: {
    id: 'dice',
    name: 'Dice Roll',
    category: 'dice',
    rtp: 96.5,
  },
  SCRATCH_CARD: {
    id: 'scratch-card',
    name: 'Scratch Card',
    category: 'scratch',
    rtp: 95.0,
  },
};

export class SlotsGame {
  static play(betAmount: number, rtp: number): SlotResult {
    const reels: number[][] = [];
    for (let i = 0; i < 3; i++) {
      reels.push(RNGService.generateRandomArray(3, 0, 9));
    }

    const shouldWin = RNGService.shouldWin(rtp);
    let winAmount = 0;

    if (shouldWin) {
      // Create a winning pattern
      const winSymbol = RNGService.generateRandomNumber(0, 7);
      reels[0][0] = winSymbol;
      reels[1][0] = winSymbol;
      reels[2][0] = winSymbol;
      winAmount = betAmount * (RNGService.generateRandomNumber(2, 50));
    }

    return {
      gameId: GAME_CONFIGS.SLOTS_CLASSIC.id,
      betAmount,
      winAmount,
      won: winAmount > 0,
      resultData: { reels },
      reels,
      rtp,
    };
  }
}

export class BlackjackGame {
  static play(betAmount: number, rtp: number): BlackjackResult {
    const shouldWin = RNGService.shouldWin(rtp);

    const playerHand = [this.drawCard(), this.drawCard()];
    const dealerHand = [this.drawCard(), this.drawCard()];

    const playerTotal = this.calculateTotal(playerHand);
    const dealerTotal = this.calculateTotal(dealerHand);

    let winAmount = 0;
    let won = false;

    if (shouldWin && playerTotal > dealerTotal && playerTotal <= 21) {
      winAmount = betAmount * 2;
      won = true;
    } else if (playerTotal === 21 && playerHand.length === 2) {
      winAmount = Math.floor(betAmount * 2.5);
      won = true;
    }

    return {
      gameId: GAME_CONFIGS.BLACKJACK.id,
      betAmount,
      winAmount,
      won,
      resultData: { playerHand, dealerHand },
      playerHand,
      dealerHand,
      playerTotal,
      dealerTotal,
      rtp,
    };
  }

  private static drawCard(): string {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return ranks[RNGService.generateRandomNumber(0, 12)] + suits[RNGService.generateRandomNumber(0, 3)];
  }

  private static calculateTotal(hand: string[]): number {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      const rank = card.slice(0, -1);
      if (rank === 'A') aces++;
      else if (['J', 'Q', 'K'].includes(rank)) total += 10;
      else total += parseInt(rank, 10);
    }

    total += aces;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }
}

export class RouletteGame {
  static play(betAmount: number, selectedNumber: number, rtp: number): RouletteResult {
    const spinResult = RNGService.generateRandomNumber(0, 36);
    const shouldWin = RNGService.shouldWin(rtp) && spinResult === selectedNumber;

    let winAmount = 0;
    if (shouldWin) {
      winAmount = betAmount * 35;
    }

    return {
      gameId: GAME_CONFIGS.ROULETTE.id,
      betAmount,
      winAmount,
      won: shouldWin,
      resultData: { spinResult, selectedNumber },
      spinResult,
      selectedNumber,
      rtp,
    };
  }
}

export class DiceGame {
  static play(betAmount: number, selectedNumber: number, rtp: number): DiceResult {
    const diceRolls = [RNGService.generateRandomNumber(1, 6), RNGService.generateRandomNumber(1, 6)];
    const total = diceRolls.reduce((a, b) => a + b, 0);

    const shouldWin = RNGService.shouldWin(rtp) && total === selectedNumber;
    const winAmount = shouldWin ? betAmount * 6 : 0;

    return {
      gameId: GAME_CONFIGS.DICE.id,
      betAmount,
      winAmount,
      won: shouldWin,
      resultData: { diceRolls, total, selectedNumber },
      diceRolls,
      selectedNumber,
      rtp,
    };
  }
}

export class ScratchCardGame {
  static play(betAmount: number, rtp: number): ScratchCardResult {
    const symbols = ['💎', '⭐', '🎉', '🍀', '💰'];
    const scratched = [
      symbols[RNGService.generateRandomNumber(0, 4)],
      symbols[RNGService.generateRandomNumber(0, 4)],
      symbols[RNGService.generateRandomNumber(0, 4)],
    ];

    const shouldWin = RNGService.shouldWin(rtp);
    const matched = shouldWin && scratched[0] === scratched[1] && scratched[1] === scratched[2];

    let winAmount = 0;
    if (matched) {
      winAmount = betAmount * (RNGService.generateRandomNumber(3, 25));
    }

    return {
      gameId: GAME_CONFIGS.SCRATCH_CARD.id,
      betAmount,
      winAmount,
      won: matched,
      resultData: { scratched },
      symbols: scratched,
      matched,
      rtp,
    };
  }
}

// Seed initial games to database
export async function seedGames() {
  const client = await pool.connect();
  try {
    const games = [
      {
        name: 'Classic Slots',
        category: 'slots',
        description: 'Traditional 3x3 slot machine',
        rtp_percentage: 95.0,
        min_bet: 1,
        max_bet: 1000,
        game_config: { reels: 3, rows: 3 },
      },
      {
        name: 'Deluxe Slots',
        category: 'slots',
        description: 'Premium 5x3 slot machine',
        rtp_percentage: 96.0,
        min_bet: 1,
        max_bet: 2000,
        game_config: { reels: 5, rows: 3 },
      },
      {
        name: 'Ultra Slots',
        category: 'slots',
        description: 'Extended 5x5 slot machine',
        rtp_percentage: 94.5,
        min_bet: 5,
        max_bet: 5000,
        game_config: { reels: 5, rows: 5 },
      },
      {
        name: 'Mega Slots',
        category: 'slots',
        description: 'Massive 6x4 slot machine with multipliers',
        rtp_percentage: 96.5,
        min_bet: 10,
        max_bet: 10000,
        game_config: { reels: 6, rows: 4 },
      },
      {
        name: 'Golden Slots',
        category: 'slots',
        description: 'Gold-themed 5x4 slot machine',
        rtp_percentage: 95.5,
        min_bet: 5,
        max_bet: 5000,
        game_config: { reels: 5, rows: 4 },
      },
      {
        name: 'Blackjack',
        category: 'table',
        description: 'Classic Blackjack card game',
        rtp_percentage: 99.5,
        min_bet: 1,
        max_bet: 1000,
        game_config: {},
      },
      {
        name: 'Roulette',
        category: 'table',
        description: 'European Roulette',
        rtp_percentage: 97.3,
        min_bet: 1,
        max_bet: 5000,
        game_config: { wheelSize: 37 },
      },
      {
        name: 'Dice Roll',
        category: 'dice',
        description: 'Two-dice game with custom payout',
        rtp_percentage: 96.5,
        min_bet: 1,
        max_bet: 1000,
        game_config: { dice: 2 },
      },
      {
        name: 'Scratch Card',
        category: 'scratch',
        description: 'Instant scratch card game',
        rtp_percentage: 95.0,
        min_bet: 0.5,
        max_bet: 500,
        game_config: { symbols: 3 },
      },
      {
        name: 'Keno',
        category: 'lottery',
        description: 'Numbers-based lottery game',
        rtp_percentage: 92.0,
        min_bet: 1,
        max_bet: 2000,
        game_config: { numbers: 20 },
      },
    ];

    for (const game of games) {
      const existing = await client.query('SELECT id FROM games WHERE name = $1', [game.name]);
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO games (name, category, description, rtp_percentage, min_bet, max_bet, game_config)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            game.name,
            game.category,
            game.description,
            game.rtp_percentage,
            game.min_bet,
            game.max_bet,
            JSON.stringify(game.game_config),
          ]
        );
      }
    }

    console.log('Games seeded successfully');
  } finally {
    client.release();
  }
}
