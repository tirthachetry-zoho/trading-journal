import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'
import { clearCache, clearCacheByPrefix } from '@/lib/cache'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { id } = await params
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
      UPDATE trades
      SET
        trade_date = ${tradeDate},
        symbol = ${symbol},
        exchange = ${exchange},
        instrument = ${instrument},
        side = ${side},
        quantity = ${qty},
        entry_price = ${entry},
        exit_price = ${exit},
        charges = ${chg},
        notes = ${notes || null},
        loss_reason = ${lossReason || null},
        profit_reason = ${profitReason || null}
      WHERE id = ${id}
        AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    clearCache(`analytics:${user.id}`)
    clearCache(`insights:${user.id}`)
    clearCacheByPrefix(`daily-trades:${user.id}:`)

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error updating trade:', error)
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { id } = await params
    
    const result = await sql`
      DELETE FROM trades
      WHERE id = ${id}
        AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    clearCache(`analytics:${user.id}`)
    clearCache(`insights:${user.id}`)
    clearCacheByPrefix(`daily-trades:${user.id}:`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    )
  }
}
