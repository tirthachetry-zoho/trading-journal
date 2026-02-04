import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

export async function POST() {
  try {
    console.log('Setting up database tables...')
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Create trades table
    await sql`
      CREATE TABLE IF NOT EXISTS trades (
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
      )
    `
    
    // Create no_trade_days table
    await sql`
      CREATE TABLE IF NOT EXISTS no_trade_days (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        trade_date DATE NOT NULL,
        reason VARCHAR(255) DEFAULT 'No trades executed today',
        auto_created BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, trade_date)
      )
    `
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(trade_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol)`
    await sql`CREATE INDEX IF NOT EXISTS idx_no_trade_days_user_id ON no_trade_days(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_no_trade_days_date ON no_trade_days(trade_date)`
    
    console.log('Database setup completed successfully!')
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      tables: tables
    })
    
  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database setup failed'
    }, { status: 500 })
  }
}
