import { NextResponse, NextRequest } from 'next/server'

import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'
import { getCachedData, setCachedData, CACHE_TTL } from '@/lib/cache'

type TradeRow = Record<string, unknown> & {
  id: string
  trade_date: string
  symbol: string
  exchange: string
  instrument: string
  side: string
  quantity: number
  entry_price: number | string
  exit_price: number | string
  charges: number | string
  notes?: string
  loss_reason?: string
  profit_reason?: string
}

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    const cacheKey = `analytics:${user.id}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

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
      ORDER BY trade_date ASC
    `

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        totalTrades: 0,
        netPL: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: { symbol: '', pl: 0 },
        worstTrade: { symbol: '', pl: 0 },
        equityCurve: [],
        dailyPL: [],
        monthlyPL: [],
      })
    }

    const tradesWithPL = (trades as TradeRow[]).map((trade) => {
      const entry = typeof trade.entry_price === 'number' ? trade.entry_price : parseFloat(String(trade.entry_price))
      const exit = typeof trade.exit_price === 'number' ? trade.exit_price : parseFloat(String(trade.exit_price))
      const charges = typeof trade.charges === 'number' ? trade.charges : parseFloat(String(trade.charges))

      const grossPL = trade.side === 'BUY'
        ? (exit - entry) * trade.quantity
        : (entry - exit) * trade.quantity
      const pl = grossPL - (Number.isFinite(charges) ? charges : 0)

      return { ...trade, pl }
    })

    const winningTrades = tradesWithPL.filter((t: { pl: number }) => t.pl > 0)
    const losingTrades = tradesWithPL.filter((t: { pl: number }) => t.pl < 0)

    const totalTrades = trades.length
    const netPL = tradesWithPL.reduce((sum: number, t: { pl: number }) => sum + t.pl, 0)
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum: number, t: { pl: number }) => sum + t.pl, 0) / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum: number, t: { pl: number }) => sum + t.pl, 0) / losingTrades.length : 0

    const bestTrade = tradesWithPL.reduce((best: { pl: number; symbol: string }, current: { pl: number; symbol: string }) =>
      current.pl > best.pl ? current : best
    , tradesWithPL[0])

    const worstTrade = tradesWithPL.reduce((worst: { pl: number; symbol: string }, current: { pl: number; symbol: string }) =>
      current.pl < worst.pl ? current : worst
    , tradesWithPL[0])

    const dailyPLMap = new Map<string, number>()
    const equityCurve: Array<{ date: string; value: number }> = []
    let cumulativePL = 0

    tradesWithPL.forEach((trade: { trade_date: string; pl: number }) => {
      const date = new Date(trade.trade_date).toISOString().slice(0, 10)
      const currentPL = dailyPLMap.get(date) || 0
      dailyPLMap.set(date, currentPL + trade.pl)
    })

    const sortedDates = Array.from(dailyPLMap.keys()).sort()
    sortedDates.forEach(date => {
      cumulativePL += dailyPLMap.get(date) || 0
      equityCurve.push({ date, value: cumulativePL })
    })

    const dailyPL = sortedDates.map(date => ({
      date,
      pl: dailyPLMap.get(date) || 0,
    }))

    const monthlyPLMap = new Map<string, number>()
    tradesWithPL.forEach((trade: { trade_date: string; pl: number }) => {
      const date = new Date(trade.trade_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const currentPL = monthlyPLMap.get(monthKey) || 0
      monthlyPLMap.set(monthKey, currentPL + trade.pl)
    })

    const monthlyPL = Array.from(monthlyPLMap.entries())
      .map(([month, pl]) => ({ month, pl }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const analyticsData = {
      totalTrades,
      netPL,
      winRate,
      avgWin,
      avgLoss,
      bestTrade: { symbol: bestTrade.symbol, pl: bestTrade.pl },
      worstTrade: { symbol: worstTrade.symbol, pl: worstTrade.pl },
      equityCurve,
      dailyPL,
      monthlyPL,
    }

    setCachedData(cacheKey, analyticsData, CACHE_TTL.ANALYTICS)
    return NextResponse.json(analyticsData)
  } catch (err) {
    console.error('Error fetching analytics:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
