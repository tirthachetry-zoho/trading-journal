# Trading Journal

A simple, open-source trading journal built with Next.js and NeonDB. Track trades, analyze performance, and improve your strategy.

## Quick Start

1. Set up NeonDB and get your `DATABASE_URL`
2. Create `.env.local`:
   ```env
   DATABASE_URL=your-neon-database-url
   JWT_SECRET=a-random-jwt-secret
   ```
3. Install: `npm install`
4. Set up database:
   ```bash
   curl -X POST http://localhost:3000/api/setup-db
   ```
5. Run: `npm run dev`
6. Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy

Notes:
- Auth uses a JWT stored in an **HttpOnly cookie** (`tj_token`).
- Cookies are marked `Secure` automatically in production.

## Features

- Trade journal with P&L calculation
- Analytics dashboard with charts
- Loss/profit reason tracking
- Daily trades drill-down
- SEBI guidelines
- Dark mode
- Mobile responsive

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: NeonDB (PostgreSQL)
- Auth: JWT
- Charts: Recharts

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  trade_date DATE NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  exchange VARCHAR(50) NOT NULL,
  instrument VARCHAR(50) NOT NULL,
  side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  entry_price DECIMAL(10, 2) NOT NULL,
  exit_price DECIMAL(10, 2) NOT NULL,
  charges DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  loss_reason TEXT,
  profit_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

## License

MIT License

## Developer

https://github.com/tirthachetry-zoho
