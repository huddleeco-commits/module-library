# test5 Loyalty Program

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Features
- User registration & login
- Points earning & spending
- Tier system: Bronze, Silver, Gold, Platinum
- Rewards redemption
- Admin dashboard

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/points/balance
- POST /api/rewards/redeem/:id