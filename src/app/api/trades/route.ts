import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'
import { clearCache, clearCacheByPrefix } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const symbol = searchParams.get('symbol')
    const exchange = searchParams.get('exchange')

    const fromDate = dateFrom || null
    const toDate = dateTo || null

    const trades = await sql`
      SELECT
        id,
        trade_date,
        symbol,
        exchange,
        instrument,
        side,
        quantity,
        entry_price,
        exit_price,
        charges,
        notes,
        loss_reason,
        profit_reason
      FROM trades
      WHERE user_id = ${user.id}
        AND (${fromDate}::date IS NULL OR trade_date >= ${fromDate}::date)
        AND (${toDate}::date IS NULL OR trade_date <= ${toDate}::date)
        AND (${symbol}::text IS NULL OR symbol = ${symbol}::text)
        AND (${exchange}::text IS NULL OR exchange = ${exchange}::text)
      ORDER BY trade_date DESC
    `

    return NextResponse.json(trades || [])
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const {
      tradeDate,
      symbol,
      exchange,
      instrument,
      side,
      quantity,
      entryPrice,
      exitPrice,
      charges,
      notes,
      lossReason,
      profitReason
    } = body

    if (!/^\d{4}-\d{2}-\d{2}$/.test(tradeDate)) {
      return NextResponse.json({ error: 'Invalid tradeDate. Expected YYYY-MM-DD' }, { status: 400 })
    }
    const today = new Date().toISOString().slice(0, 10)
    if (tradeDate > today) {
      return NextResponse.json({ error: 'tradeDate cannot be in the future' }, { status: 400 })
    }
    if (side !== 'BUY' && side !== 'SELL') {
      return NextResponse.json({ error: 'Invalid side. Expected BUY or SELL' }, { status: 400 })
    }

    const qty = Number.parseInt(quantity, 10)
    const entry = Number.parseFloat(entryPrice)
    const exit = Number.parseFloat(exitPrice)
    const chg = charges ? Number.parseFloat(charges) : 0

    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }
    if (!Number.isFinite(entry) || entry <= 0) {
      return NextResponse.json({ error: 'Invalid entryPrice' }, { status: 400 })
    }
    if (!Number.isFinite(exit) || exit <= 0) {
      return NextResponse.json({ error: 'Invalid exitPrice' }, { status: 400 })
    }
    if (!Number.isFinite(chg) || chg < 0) {
      return NextResponse.json({ error: 'Invalid charges' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO trades (
        user_id,
        trade_date,
        symbol,
        exchange,
        instrument,
        side,
        quantity,
        entry_price,
        exit_price,
        charges,
        notes,
        loss_reason,
        profit_reason
      ) VALUES (
        ${user.id},
        ${tradeDate},
        ${symbol},
        ${exchange},
        ${instrument},
        ${side},
        ${qty},
        ${entry},
        ${exit},
        ${chg},
        ${notes || null},
        ${lossReason || null},
        ${profitReason || null}
      )
      RETURNING *
    `

    clearCache(`analytics:${user.id}`)
    clearCache(`insights:${user.id}`)
    clearCacheByPrefix(`daily-trades:${user.id}:`)

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    )
  }
}
