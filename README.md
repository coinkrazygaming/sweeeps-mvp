# FORTUNE - Sweepstakes Social Casino MVP

A production-ready full-stack MVP for a U.S.-compliant sweepstakes social casino platform. This project features a modern React frontend with a beautiful casino UI, a Node.js Express backend, PostgreSQL database, and a scalable game framework.

## Features

### Core Platform
- ✅ Email + Password Authentication with JWT
- ✅ Dual-Currency System (Gold Coins & Sweepstakes Coins)
- ✅ User Profiles with Balance Management
- ✅ Transaction Ledger System
- ✅ Daily Login Bonuses
- ✅ Game Session Tracking

### Gaming System
- ✅ Scalable Game Framework (supports 100+ games)
- ✅ 10 Playable Games:
  - Classic Slots (3x3)
  - Deluxe Slots (5x3)
  - Ultra Slots (5x5)
  - Mega Slots (6x4)
  - Golden Slots (5x4)
  - Blackjack
  - Roulette
  - Dice Roll
  - Scratch Cards
  - Keno
- ✅ Server-Side RNG (cryptographically secure)
- ✅ Configurable RTP & Payout Tables
- ✅ Real-time Game Results

### Store & Purchases
- ✅ Gold Coin Packages
- ✅ Promo Code System
- ✅ Purchase History
- ✅ Stripe Integration (Test Mode)

### Sweepstakes Compliance
- ✅ No Purchase Required for Sweepstakes Coins
- ✅ Redemption Request System
- ✅ Minimum Redemption Threshold
- ✅ Admin Approval Workflow
- ✅ Jurisdiction-Based Access Rules
- ✅ Audit Logging

### Admin Panel
- ✅ User Search & Management
- ✅ Balance Adjustments with Audit Trail
- ✅ Account Freeze/Unfreeze
- ✅ Redemption Management
- ✅ Analytics & Reporting
- ✅ Game Configuration

### Modern UI
- ✅ Casino-Style Dark Theme with Gold/Purple Accents
- ✅ Mobile-First Responsive Design
- ✅ Glass-Morphism Effects
- ✅ Smooth Animations
- ✅ Accessible Components

## Tech Stack

### Frontend
- **React 18** - UI Framework
- **React Router 6** - Client-side routing
- **TypeScript** - Type safety
- **TailwindCSS 3** - Utility-first CSS
- **Lucide Icons** - Icon library
- **React Query** - Data fetching
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **PostgreSQL 13+** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization ready
- **Netlify** - Deployment ready

## Project Structure

```
├── client/                    # React SPA Frontend
│   ├── pages/                # Route pages (Login, Dashboard, etc.)
│   ├── components/ui/        # Reusable UI components
│   ├── lib/
│   │   ├── api-client.ts     # API communication
│   │   ├── auth-context.tsx  # Auth state management
│   │   └── utils.ts          # Utility functions
│   ├── App.tsx               # App entry & routing setup
│   └── global.css            # Theme & global styles
│
├── server/                    # Express Backend
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── users.ts          # User profile endpoints
│   │   ├── games.ts          # Game play endpoints
│   │   ├── store.ts          # Store & purchase endpoints
│   │   ├── redemptions.ts    # Redemption endpoints
│   │   └── admin.ts          # Admin management endpoints
│   ├── db.ts                 # Database initialization
│   ├── auth.ts               # JWT & password utilities
│   ├── middleware.ts         # Express middleware
│   ├── game-engine.ts        # Game logic & RNG
│   └── index.ts              # Server setup
│
├── shared/                    # Shared types & interfaces
├── netlify/functions/        # Serverless functions (optional)
└── .env.example              # Environment template
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- pnpm (recommended) or npm/yarn

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository>
   cd fortune-casino
   pnpm install
   ```

2. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb fortune_casino
   
   # The app will auto-initialize the schema on first run
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   
   # Edit .env with your values:
   # - DATABASE_URL: PostgreSQL connection string
   # - JWT_SECRET: Generate a secure random string
   # - STRIPE_SECRET_KEY: (optional) for payment processing
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:8080`

### Database Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]

Example:
postgresql://postgres:password@localhost:5432/fortune_casino
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/balance` - Get current balance
- `GET /api/users/transactions` - Get transaction history
- `GET /api/users/games` - Get game history
- `POST /api/users/daily-bonus` - Claim daily bonus

### Games
- `GET /api/games` - List all games
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/play` - Play a game

### Store
- `GET /api/store/packages` - List coin packages
- `POST /api/store/checkout` - Create checkout session
- `POST /api/store/purchase` - Complete purchase
- `POST /api/store/validate-promo` - Validate promo code

### Redemptions
- `POST /api/redemptions` - Create redemption request
- `GET /api/redemptions/:redemptionId` - Get redemption status
- `GET /api/redemptions` - Get user redemptions
- `DELETE /api/redemptions/:redemptionId` - Cancel redemption

### Admin
- `GET /api/admin/users/search` - Search users
- `POST /api/admin/users/balance` - Adjust balance
- `POST /api/admin/users/freeze` - Freeze account
- `GET /api/admin/redemptions` - List redemptions
- `POST /api/admin/redemptions/approve` - Approve redemption
- `POST /api/admin/redemptions/reject` - Reject redemption
- `GET /api/admin/analytics` - Get analytics data

## Game Framework

### Adding a New Game

Games can be added in two ways:

#### 1. Configuration-Based (No Code Changes)
Add a new entry to the `games` table with JSON configuration:

```sql
INSERT INTO games (name, category, description, rtp_percentage, min_bet, max_bet, game_config)
VALUES (
  'My New Game',
  'slots',
  'Description',
  95.5,
  1,
  1000,
  '{
    "reels": 5,
    "rows": 3,
    "paylines": 25
  }'::JSONB
);
```

#### 2. Code-Based (For Complex Logic)
Add a new game class in `server/game-engine.ts`:

```typescript
export class MyNewGame {
  static play(betAmount: number, rtp: number): GameResult {
    const shouldWin = RNGService.shouldWin(rtp);
    const winAmount = shouldWin ? betAmount * 5 : 0;
    
    return {
      gameId: 'my-new-game',
      betAmount,
      winAmount,
      won: winAmount > 0,
      resultData: { /* game-specific data */ },
      rtp,
    };
  }
}
```

Register in `server/routes/games.ts`:

```typescript
} else if (gameName.includes('my game')) {
  result = MyNewGame.play(betAmount, rtp);
}
```

## Compliance Features

### No Purchase Necessary (NPN)
- Sweepstakes Coins are granted for free via daily bonuses
- Purchase-based wording separated from sweepstakes messaging
- Clear compliance notices on auth pages

### Audit Trail
Every transaction and admin action is logged:
- User balance changes
- Game plays
- Purchases
- Redemption requests
- Admin adjustments

### Redemption Management
- Minimum threshold enforcement
- Admin review required
- Status tracking
- Denial reasons logged

### Jurisdiction Controls
Database ready for jurisdiction-based access rules:
```typescript
// Example: Restrict by state
if (user.jurisdiction === 'BLOCKED_STATE') {
  return res.status(403).json({ error: 'Not available in your jurisdiction' });
}
```

## Deployment

### Netlify
```bash
pnpm build
netlify deploy --prod
```

### Vercel
```bash
pnpm build
vercel deploy --prod
```

### Docker
```bash
docker build -t fortune-casino .
docker run -p 8080:8080 fortune-casino
```

## Testing

Run tests:
```bash
pnpm test
```

Run TypeScript check:
```bash
pnpm typecheck
```

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ HTTPS enforced in production
- ✅ Server-side RNG (not client-side)
- ✅ Transaction immutability
- ✅ Admin audit logging
- ✅ Environment variables for secrets

### Production Checklist
- [ ] Change `JWT_SECRET` to a random string
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Implement proper admin authentication
- [ ] Review compliance with state laws
- [ ] Set up legal disclaimers
- [ ] Implement KYC if required

## Compliance & Legal

This project is built for compliance with U.S. sweepstakes laws:
- No purchase required to play or win
- Alternate method of entry (mail-in) ready
- Clear probability disclosures (RTP)
- Audit trail for all transactions
- Admin controls for accountability

**Note**: This is a template. Before launching:
- Consult with legal counsel
- Review state-specific regulations
- Implement required disclaimers
- Obtain necessary licenses/approvals

## Database Schema

The database includes the following key tables:
- `users` - User accounts
- `user_balances` - Current balance snapshot
- `transactions` - Immutable ledger of all transactions
- `games` - Game definitions & configurations
- `game_sessions` - Individual game plays
- `gc_packages` - Coin packages for purchase
- `purchases` - Purchase records
- `promo_codes` - Promotional code system
- `redemptions` - Redemption requests
- `audit_log` - Admin action logging

## Contributing

To contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure `pnpm typecheck` passes
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues or questions:
- Check existing issues
- Review the FAQ section
- Contact support@fortunecasino.com

## Roadmap

### Planned Features
- [ ] Video-based games
- [ ] Multiplayer games
- [ ] Leaderboards
- [ ] VIP tiers
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Live dealer games
- [ ] Social features

## Credits

Built with ❤️ using modern web technologies.

---

**No Purchase Necessary | Responsible Gaming | 18+ Only**

This is a sweepstakes social casino. All games are for entertainment. Play responsibly.
