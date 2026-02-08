# CrownPlay - Sweepstakes Casino MVP Setup Guide

A production-ready full-stack MVP for a sweepstakes social casino platform built with React, Express, and PostgreSQL.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Seeding Data](#seeding-data)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Production Checklist](#production-checklist)

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secret

# 3. Create PostgreSQL database
createdb crownplay_mvp

# 4. Seed database with demo data
pnpm seed

# 5. Start development server
pnpm dev
```

The app will be available at `http://localhost:8080`

## 📦 Prerequisites

- **Node.js**: 18+ 
- **pnpm**: 10.14.0+ (or npm/yarn)
- **PostgreSQL**: 13+
- **Git**: For version control

## ⚙️ Environment Setup

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Configure database

Edit `.env` and set `DATABASE_URL`:

```
DATABASE_URL=postgresql://[user]:[password]@localhost:5432/crownplay_mvp
```

**Example for local development:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/crownplay_mvp
```

### 3. Generate JWT Secret

```bash
# On macOS/Linux
openssl rand -hex 32

# On Windows (PowerShell)
$bytes = New-Object Byte[] 32; [Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes); $bytes | ForEach-Object { "{0:X2}" -f $_ } | Join-String
```

Add the generated secret to `.env`:
```
JWT_SECRET=your-generated-32-character-hex-string
```

### 4. Set Node environment

```
NODE_ENV=development
PORT=8080
```

## 🗄️ Database Setup

### Create Database

```bash
# Using psql
createdb crownplay_mvp

# Or with connection string
psql -c "CREATE DATABASE crownplay_mvp;"
```

### Initialize Schema

The schema is automatically created when you run the application for the first time. Tables include:

- `users` - User accounts with role-based access
- `user_balances` - Dual-currency balances (Gold Coins & Sweepstakes Coins)
- `transactions` - Immutable ledger of all transactions
- `games` - Game definitions and configurations
- `game_sessions` - Individual game plays
- `gc_packages` - Coin packages for purchase
- `purchases` - Purchase records
- `promo_codes` - Promotional codes system
- `redemptions` - Redemption requests from players
- `audit_log` - Admin action logging

## 🎮 Running the Application

### Development Mode

```bash
pnpm dev
```

This starts:
- **Frontend**: Vite dev server with hot reload
- **Backend**: Express server with TypeScript compilation
- **Database**: PostgreSQL connection initialized

Access the app at `http://localhost:8080`

### Building for Production

```bash
pnpm build
```

Generates:
- Client bundle in `dist/spa/`
- Server bundle in `dist/server/`

### Running Production Build

```bash
# After build
pnpm start
```

## 🌱 Seeding Data

The seed script creates:
- **Admin user** (`coinkrazy26@gmail.com` / `admin123`)
- **5 demo players** with various balances
- **5 coin packages** (Starter, Silver, Gold, Platinum, Diamond)
- **3 promo codes** (WELCOME50, GOLD100, LUCK777)

### Run Seed Script

```bash
pnpm seed
```

**Output:**
```
🌱 Starting database seed...
📊 Initializing database schema...
👤 Creating admin user...
✅ Admin user created: coinkrazy26@gmail.com
👥 Creating demo users...
  ✓ Created john_player
  ✓ Created jane_winner
  ... (more users)
📦 Creating coin packages...
  ✓ Created package: Starter Pack
  ... (more packages)
🎟️  Creating promo codes...
  ✓ Created promo: WELCOME50
  ... (more promos)

✨ Database seeding completed successfully!

📝 Admin Credentials:
   Email: coinkrazy26@gmail.com
   Password: admin123

🎮 Demo User Credentials (password: password123):
   john@example.com
   jane@example.com
   bob@example.com
   alice@example.com
   charlie@example.com
```

## 📁 Project Structure

```
.
├── client/                      # React SPA frontend
│   ├── pages/                  # Route pages (Login, Dashboard, etc.)
│   ├── components/             # Reusable UI components
│   │   └── KYCForm.tsx        # KYC collection form
│   ├── lib/                    # Utilities and API client
│   │   ├── api-client.ts      # API communication
│   │   ├── auth-context.tsx   # Auth state management
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                 # App entry point and routing
│   └── global.css              # Theme and global styles
│
├── server/                      # Express backend
│   ├── routes/                 # API endpoint handlers
│   │   ├── auth.ts            # Authentication (signup, login)
│   │   ├── users.ts           # User profiles and KYC
│   │   ├── games.ts           # Game play endpoints
│   │   ├── store.ts           # Store and purchases
│   │   ├── redemptions.ts     # Redemption requests
│   │   └── admin.ts           # Admin management
│   ├── db.ts                   # Database initialization
│   ├── auth.ts                 # JWT and crypto utilities
│   ├── middleware.ts           # Express middleware
│   ├── game-engine.ts          # Game logic and RNG
│   ├── seed.ts                 # Database seed script
│   └── index.ts                # Server setup and routes
│
├── shared/                      # Shared types
│   └── api.ts                  # Shared API types
│
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## 📡 API Documentation

### Authentication

```
POST /api/auth/signup
  - Request: { email, password, username }
  - Response: { accessToken, refreshToken, user }

POST /api/auth/login
  - Request: { email, password }
  - Response: { accessToken, refreshToken, user }

POST /api/auth/refresh
  - Request: { refreshToken }
  - Response: { accessToken }
```

### Users

```
GET /api/users/profile (auth required)
  - Response: User profile with balances

GET /api/users/balance (auth required)
  - Response: { goldCoins, sweepstakesCoins }

GET /api/users/transactions (auth required)
  - Response: { transactions: [...] }

GET /api/users/games (auth required)
  - Response: { games: [...] }

POST /api/users/daily-bonus (auth required)
  - Response: { success, bonusAmount, newBalance }

POST /api/users/kyc (auth required)
  - Request: { fullName, dateOfBirth, address, city, state, zipCode, country }
  - Response: { success, message, status: "PENDING" }

GET /api/users/kyc/status (auth required)
  - Response: { kycStatus: "UNVERIFIED|PENDING|VERIFIED" }
```

### Games

```
GET /api/games
  - Response: { games: [...] }

GET /api/games/:gameId
  - Response: Game details

POST /api/games/play (auth required)
  - Request: { gameId, betAmount, currencyType: "GC"|"SC" }
  - Response: { result, newBalance }
```

### Store

```
GET /api/store/packages
  - Response: { packages: [...] }

POST /api/store/checkout (auth required)
  - Request: { packageId }
  - Response: Stripe checkout session

POST /api/store/purchase (auth required)
  - Request: { packageId, stripeTransactionId, promoCode? }
  - Response: { success, newBalance }

POST /api/store/validate-promo
  - Request: { code }
  - Response: { valid, bonus }
```

### Redemptions

```
POST /api/redemptions (auth required)
  - Request: { amount, prizeDescription }
  - Response: { redemptionId, status: "PENDING" }

GET /api/redemptions/:redemptionId (auth required)
  - Response: Redemption details

GET /api/redemptions (auth required)
  - Response: { redemptions: [...] }

DELETE /api/redemptions/:redemptionId (auth required)
  - Response: { success }
```

### Admin

```
GET /api/admin/users/search (auth required, admin only)
  - Query: { q: search term }
  - Response: { users: [...] }

POST /api/admin/users/balance (auth required, admin only)
  - Request: { userId, goldCoins, sweepstakesCoins }
  - Response: { success, newBalance }

POST /api/admin/users/freeze (auth required, admin only)
  - Request: { userId, frozen: boolean }
  - Response: { success }

GET /api/admin/redemptions (auth required, admin only)
  - Query: { status: "pending"|"approved"|"rejected" }
  - Response: { redemptions: [...] }

POST /api/admin/redemptions/approve (auth required, admin only)
  - Request: { redemptionId }
  - Response: { success }

POST /api/admin/redemptions/reject (auth required, admin only)
  - Request: { redemptionId, reason }
  - Response: { success }

GET /api/admin/analytics (auth required, admin only)
  - Response: Analytics metrics
```

## 🚀 Deployment

### Option 1: Netlify

```bash
# Build
pnpm build

# Deploy
netlify deploy --prod
```

### Option 2: Vercel

```bash
# Build
pnpm build

# Deploy
vercel deploy --prod
```

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

### Option 4: Manual VPS/EC2

```bash
# SSH into server
ssh ubuntu@your-server.com

# Clone and setup
git clone https://github.com/yourusername/crownplay.git
cd crownplay
pnpm install

# Setup environment
echo "DATABASE_URL=..." > .env
echo "JWT_SECRET=..." >> .env

# Run migrations
pnpm seed

# Start with PM2
npm install -g pm2
pm2 start "pnpm start" --name crownplay
```

## ✅ Production Checklist

- [ ] **Environment Variables**
  - [ ] Change `JWT_SECRET` to a random string
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure `DATABASE_URL` to production database
  - [ ] Add `STRIPE_SECRET_KEY` if using Stripe
  - [ ] Configure email service (SendGrid, etc.)

- [ ] **Database**
  - [ ] Backup strategy in place
  - [ ] Connection pooling configured
  - [ ] Indexes created for performance
  - [ ] Regular maintenance scheduled

- [ ] **Security**
  - [ ] HTTPS/SSL enabled
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] XSS protection enabled
  - [ ] CSRF protection for forms

- [ ] **Monitoring & Logging**
  - [ ] Error tracking (Sentry, etc.) configured
  - [ ] Application logs stored
  - [ ] Performance monitoring enabled
  - [ ] Uptime monitoring configured

- [ ] **Compliance**
  - [ ] Age verification (18+) implemented
  - [ ] Terms of Service agreeable
  - [ ] Privacy Policy compliant
  - [ ] GDPR compliance (if EU users)
  - [ ] Responsible gaming messaging
  - [ ] No Purchase Necessary disclosure

- [ ] **Testing**
  - [ ] Unit tests passing
  - [ ] Integration tests completed
  - [ ] Load testing done
  - [ ] Security audit completed

- [ ] **Performance**
  - [ ] Assets optimized
  - [ ] Caching configured
  - [ ] CDN enabled
  - [ ] Database queries optimized

- [ ] **Admin Access**
  - [ ] Admin credentials secured
  - [ ] Admin audit logging enabled
  - [ ] IP whitelisting (optional)
  - [ ] 2FA for admin accounts (recommended)

## 🔐 Security Considerations

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for authentication
- ✅ Server-side RNG (not client-side)
- ✅ Transaction immutability
- ✅ Admin audit logging
- ✅ Role-based access control

### Additional Recommendations

1. **Rate Limiting**: Implement on auth endpoints
2. **HTTPS**: Always use in production
3. **Secrets Management**: Use environment variables or secret manager
4. **Regular Audits**: Schedule security audits
5. **Penetration Testing**: Before production launch
6. **Backup & Recovery**: Daily database backups

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Check PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows (PostgreSQL as service)
# Use Services.msc
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solution**: Change port in .env or kill process using the port

### Seed Script Fails

```
Error: relation "users" does not exist
```

**Solution**: Database schema not initialized
```bash
# The schema auto-initializes on first app run
pnpm dev

# Then try seed again
pnpm seed
```

## 📞 Support & Documentation

- **Main README**: See `README.md` for project overview
- **API Docs**: See API section above
- **FAQ**: Visit `/faq` page in the application
- **Terms**: See `/terms` page
- **Privacy**: See `/privacy` page

## 📄 License

[Specify your license]

## 🙏 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

**Questions?** Open an issue or contact support@crownplay.com
