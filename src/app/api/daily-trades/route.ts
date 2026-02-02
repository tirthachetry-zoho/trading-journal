import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'
import { getCachedData, setCachedData, CACHE_TTL } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = `daily-trades:${user.id}:${date}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const trades = await sql`
      SELECT *
      FROM trades
      WHERE user_id = ${user.id}
        AND trade_date = ${date}::date
      ORDER BY trade_date DESC
    `

    const tradesWithPL = (trades || []).map(trade => {
      const entry = typeof trade.entry_price === 'number' ? trade.entry_price : parseFloat(trade.entry_price)
      const exit = typeof trade.exit_price === 'number' ? trade.exit_price : parseFloat(trade.exit_price)
      const charges = typeof trade.charges === 'number' ? trade.charges : parseFloat(trade.charges)

      const grossPL = trade.side === 'BUY'
        ? (exit - entry) * trade.quantity
        : (entry - exit) * trade.quantity
      const pl = grossPL - (Number.isFinite(charges) ? charges : 0)
      return { ...trade, pl }
    })

    // Cache the daily trades data
    setCachedData(cacheKey, tradesWithPL, CACHE_TTL.DAILY_TRADES)

    return NextResponse.json(tradesWithPL)
  } catch (error) {
    console.error('Error fetching daily trades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily trades' },
      { status: 500 }
    )
  }
}
