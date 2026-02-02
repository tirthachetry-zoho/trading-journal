import { NextResponse, NextRequest } from 'next/server'

import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'
import { getCachedData, setCachedData, CACHE_TTL } from '@/lib/cache'
import type { Insight } from '@/types/trade'

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

    const cacheKey = `insights:${user.id}`
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const trades = await sql`
      SELECT *
      FROM trades
      WHERE user_id = ${user.id}
      ORDER BY trade_date ASC
    `

    const insights: Insight[] = []

    if (!trades || trades.length === 0) {
      return NextResponse.json(insights)
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

    const symbolPLMap = new Map<string, { totalPL: number; count: number }>()
    const dayOfWeekPLMap = new Map<number, { totalPL: number; count: number }>()
    const dailyTradeCountMap = new Map<string, number>()
    let maxLosingStreak = 0
    let losingStreak = 0

    tradesWithPL.forEach((trade: { symbol: string; trade_date: string; pl: number }) => {
      const symbol = trade.symbol
      const currentSymbolPL = symbolPLMap.get(symbol) || { totalPL: 0, count: 0 }
      symbolPLMap.set(symbol, {
        totalPL: currentSymbolPL.totalPL + trade.pl,
        count: currentSymbolPL.count + 1,
      })

      const dayOfWeek = new Date(trade.trade_date).getDay()
      const currentDayPL = dayOfWeekPLMap.get(dayOfWeek) || { totalPL: 0, count: 0 }
      dayOfWeekPLMap.set(dayOfWeek, {
        totalPL: currentDayPL.totalPL + trade.pl,
        count: currentDayPL.count + 1,
      })

      const dateKey = new Date(trade.trade_date).toISOString().slice(0, 10)
      const currentDayTrades = dailyTradeCountMap.get(dateKey) || 0
      dailyTradeCountMap.set(dateKey, currentDayTrades + 1)

      if (trade.pl < 0) {
        losingStreak++
        maxLosingStreak = Math.max(maxLosingStreak, losingStreak)
      } else {
        losingStreak = 0
      }
    })

    const mostProfitableSymbol = Array.from(symbolPLMap.entries())
      .reduce((best, [symbol, data]) =>
        data.totalPL > best.totalPL ? { symbol, totalPL: data.totalPL, count: data.count } : best
      , { symbol: '', totalPL: 0, count: 0 })

    if (mostProfitableSymbol.symbol && mostProfitableSymbol.totalPL > 0) {
      insights.push({
        type: 'success',
        title: 'Most Profitable Symbol',
        description: `${mostProfitableSymbol.symbol} has generated ₹${mostProfitableSymbol.totalPL.toLocaleString()} across ${mostProfitableSymbol.count} trades`,
      })
    }

    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const bestDayOfWeek = Array.from(dayOfWeekPLMap.entries())
      .filter(([, data]) => data.count >= 3)
      .reduce((best, [day, data]) =>
        data.totalPL > best.totalPL ? { day: dayOfWeekNames[day], totalPL: data.totalPL, count: data.count } : best
      , { day: '', totalPL: 0, count: 0 })

    if (bestDayOfWeek.day && bestDayOfWeek.totalPL > 0) {
      insights.push({
        type: 'info',
        title: 'Best Trading Day',
        description: `${bestDayOfWeek.day}s show the best performance with ₹${bestDayOfWeek.totalPL.toLocaleString()} from ${bestDayOfWeek.count} trades`,
      })
    }

    if (maxLosingStreak >= 3) {
      insights.push({
        type: 'warning',
        title: 'Losing Streak Detected',
        description: `You've had a streak of ${maxLosingStreak} consecutive losing trades. Consider reviewing your strategy`,
      })
    }

    const avgTradesPerDay = Array.from(dailyTradeCountMap.values()).reduce((sum, count) => sum + count, 0) / dailyTradeCountMap.size
    const maxTradesInDay = Math.max(...Array.from(dailyTradeCountMap.values()))

    if (maxTradesInDay > 10) {
      insights.push({
        type: 'warning',
        title: 'Potential Overtrading',
        description: `You've made ${maxTradesInDay} trades in a single day. Consider focusing on quality over quantity`,
      })
    }

    if (avgTradesPerDay > 5) {
      insights.push({
        type: 'info',
        title: 'High Trading Frequency',
        description: `You average ${avgTradesPerDay.toFixed(1)} trades per day. Ensure you're maintaining your risk management rules`,
      })
    }

    const recentTrades = tradesWithPL.slice(-10)
    const recentWinRate = recentTrades.filter((t: { pl: number }) => t.pl > 0).length / recentTrades.length * 100

    if (recentWinRate < 30 && recentTrades.length >= 5) {
      insights.push({
        type: 'warning',
        title: 'Recent Performance Decline',
        description: `Your last 10 trades show a ${recentWinRate.toFixed(0)}% win rate. Consider taking a break or reviewing your strategy`,
      })
    }

    const totalWinningTrades = tradesWithPL.filter((t: { pl: number }) => t.pl > 0).length
    const totalLosingTrades = tradesWithPL.filter((t: { pl: number }) => t.pl < 0).length
    const profitFactor = totalLosingTrades > 0 
      ? tradesWithPL.filter((t: { pl: number }) => t.pl > 0).reduce((sum: number, t: { pl: number }) => sum + t.pl, 0) / 
        Math.abs(tradesWithPL.filter((t: { pl: number }) => t.pl < 0).reduce((sum: number, t: { pl: number }) => sum + t.pl, 0))
      : 0

    if (profitFactor > 2 && totalWinningTrades >= 5) {
      insights.push({
        type: 'success',
        title: 'Excellent Risk Management',
        description: `Your profit factor is ${profitFactor.toFixed(2)}, showing great risk-reward management`,
      })
    } else if (profitFactor < 1 && totalLosingTrades >= 5) {
      insights.push({
        type: 'warning',
        title: 'Risk Management Alert',
        description: `Your profit factor is ${profitFactor.toFixed(2)}. Consider improving your win rate or reducing losses`,
      })
    }

    setCachedData(cacheKey, insights, CACHE_TTL.INSIGHTS)
    return NextResponse.json(insights)
  } catch (err) {
    console.error('Error generating insights:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
