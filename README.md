# Trading Journal

A simple, open-source trading journal built with Next.js and NeonDB. Track trades, analyze performance, and improve your strategy.

## Quick Start

1. Set up NeonDB and get your `DATABASE_URL`
2. Create `.env.local`:
   ```env
   DATABASE_URL=your-neon-database-url
   JWT_SECRET=a-random-jwt-secret
   RESEND_API_KEY=your-resend-api-key  # Optional: for real emails
   NEXT_PUBLIC_APP_URL=http://localhost:3000
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
   - `RESEND_API_KEY` (optional, for real emails)
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
4. Deploy

Notes:
- Auth uses a JWT stored in an **HttpOnly cookie** (`tj_token`).
- Cookies are marked `Secure` automatically in production.
- Email verification is required before login.
- Password reset is available via email.

## Features

- Trade journal with P&L calculation
- Analytics dashboard with charts
- Loss/profit reason tracking
- Daily trades drill-down
- SEBI guidelines
- Email verification & password reset
- Rate limiting on auth endpoints
- Mobile responsive
- Light mode only

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: NeonDB (PostgreSQL)
- Auth: JWT with HttpOnly cookies
- Email: Resend (3,000 free emails/month)
- Charts: Recharts

## Authentication Flow

1. **Registration**: User signs up → receives verification email → must verify before login
2. **Login**: User must have verified email → JWT issued in HttpOnly cookie
3. **Password Reset**: User requests reset → receives email link → sets new password

### Email Setup (Optional)

For real emails (instead of console logs):

1. Sign up at [Resend](https://resend.com)
2. Get API key from dashboard
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com  # Optional custom domain
   ```
4. Verify your domain in Resend (for custom from email)

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (sends verification email)
- `POST /api/auth/login` - Login (requires verified email)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Confirm password reset

### Data
- `GET /api/trades` - Get user trades
- `POST /api/trades` - Create trade
- `PUT /api/trades/[id]` - Update trade
- `DELETE /api/trades/[id]` - Delete trade
- `GET /api/analytics` - Get analytics data
- `GET /api/insights` - Get AI insights
- `GET /api/daily-trades` - Get daily trades

## Development

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

## Security Features

- Rate limiting on all auth endpoints
- Password hashing with bcrypt
- JWT tokens in HttpOnly cookies
- Email verification required
- CSRF protection via SameSite cookies
- Input validation and sanitization

## License

MIT License

## Developer

https://github.com/tirthachetry-zoho
