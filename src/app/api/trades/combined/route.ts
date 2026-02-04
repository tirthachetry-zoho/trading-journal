import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: authResult.status || 401 }
      )
    }

    const user = authResult.user
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const symbol = searchParams.get('symbol')
    const exchange = searchParams.get('exchange')

    // Build WHERE conditions
    const conditions = ['user_id = $1']
    const params = [user.id]
    let paramIndex = 2

    if (dateFrom) {
      conditions.push(`trade_date >= $${paramIndex++}`)
      params.push(dateFrom)
    }
    if (dateTo) {
      conditions.push(`trade_date <= $${paramIndex++}`)
      params.push(dateTo)
    }
    if (symbol) {
      conditions.push(`symbol = $${paramIndex++}`)
      params.push(symbol)
    }
    if (exchange) {
      conditions.push(`exchange = $${paramIndex++}`)
      params.push(exchange)
    }

    // Get trades
    const tradesQuery = `
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
        profit_reason,
        created_at,
        updated_at,
        'trade' as type
      FROM trades
      WHERE ${conditions.join(' AND ')}
      ORDER BY trade_date DESC, created_at DESC
    `
    
    const trades = await sql.query(tradesQuery, params)

    // Get no-trade days for the same date range
    const noTradeDaysQuery = `
      SELECT 
        id,
        trade_date,
        reason,
        auto_created,
        created_at,
        'no_trade_day' as type
      FROM no_trade_days
      WHERE user_id = $1
      ${dateFrom ? `AND trade_date >= $${paramIndex++}` : ''}
      ${dateTo ? `AND trade_date <= $${paramIndex++}` : ''}
      ORDER BY trade_date DESC
    `

    const noTradeDaysParams = [user.id]
    let noTradeParamIndex = 2
    
    if (dateFrom) {
      noTradeDaysParams.push(dateFrom)
      noTradeParamIndex++
    }
    if (dateTo) {
      noTradeDaysParams.push(dateTo)
      noTradeParamIndex++
    }

    const noTradeDays = await sql.query(noTradeDaysQuery, noTradeDaysParams)

    // Combine and sort by date
    const combinedData = [...trades, ...noTradeDays].sort((a, b) => {
      const dateCompare = new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
      if (dateCompare !== 0) return dateCompare
      
      // For same date, trades come before no-trade days
      if (a.type === 'trade' && b.type === 'no_trade_day') return -1
      if (a.type === 'no_trade_day' && b.type === 'trade') return 1
      return 0
    })

    // Calculate streaks
    const streaks = calculateStreaks(combinedData)

    return NextResponse.json({
      success: true,
      data: {
        items: combinedData,
        streaks,
        summary: {
          totalTrades: trades.length,
          totalNoTradeDays: noTradeDays.length,
          dateRange: {
            from: dateFrom || null,
            to: dateTo || null
          }
        }
      }
    })

  } catch (error) {
    console.error('Error fetching trade history with no-trade days:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateStreaks(items: any[]) {
  const streaks = {
    currentGainStreak: 0,
    currentLossStreak: 0,
    currentNoTradeStreak: 0,
    longestGainStreak: 0,
    longestLossStreak: 0,
    longestNoTradeStreak: 0,
    recentStreaks: [] as any[]
  }

  let tempGainStreak = 0
  let tempLossStreak = 0
  let tempNoTradeStreak = 0
  let maxGainStreak = 0
  let maxLossStreak = 0
  let maxNoTradeStreak = 0

  // Group by date to calculate daily P&L
  const dailyData = new Map<string, { trades: any[], hasNoTradeDay: boolean }>()

  items.forEach(item => {
    const date = item.trade_date
    if (!dailyData.has(date)) {
      dailyData.set(date, { trades: [], hasNoTradeDay: false })
    }
    
    if (item.type === 'trade') {
      dailyData.get(date)!.trades.push(item)
    } else if (item.type === 'no_trade_day') {
      dailyData.get(date)!.hasNoTradeDay = true
    }
  })

  // Sort dates in descending order (most recent first)
  const sortedDates = Array.from(dailyData.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  // Calculate streaks
  sortedDates.forEach((date, index) => {
    const dayData = dailyData.get(date)!
    let dayResult: 'gain' | 'loss' | 'no_trade' | 'mixed'

    if (dayData.hasNoTradeDay && dayData.trades.length === 0) {
      dayResult = 'no_trade'
    } else if (dayData.trades.length === 0) {
      return // Skip days with no data
    } else {
      // Calculate daily P&L
      const dailyPL = dayData.trades.reduce((total, trade) => {
        const entry = typeof trade.entry_price === 'number' ? trade.entry_price : parseFloat(trade.entry_price)
        const exit = typeof trade.exit_price === 'number' ? trade.exit_price : parseFloat(trade.exit_price)
        const charges = typeof trade.charges === 'number' ? trade.charges : parseFloat(trade.charges)

        const grossPL = trade.side === 'BUY'
          ? (exit - entry) * trade.quantity
          : (entry - exit) * trade.quantity
        return total + (grossPL - (Number.isFinite(charges) ? charges : 0))
      }, 0)

      dayResult = dailyPL > 0 ? 'gain' : dailyPL < 0 ? 'loss' : 'mixed'
    }

    // Update current streaks (only for the most recent consecutive days)
    if (index === 0) {
      // First (most recent) day starts current streaks
      if (dayResult === 'gain') {
        streaks.currentGainStreak = 1
        tempGainStreak = 1
      } else if (dayResult === 'loss') {
        streaks.currentLossStreak = 1
        tempLossStreak = 1
      } else if (dayResult === 'no_trade') {
        streaks.currentNoTradeStreak = 1
        tempNoTradeStreak = 1
      }
    } else {
      // Check if streak continues
      const prevDayResult = index === 0 ? null : (() => {
        const prevDate = sortedDates[index - 1]
        const prevData = dailyData.get(prevDate)!
        
        if (prevData.hasNoTradeDay && prevData.trades.length === 0) {
          return 'no_trade'
        } else if (prevData.trades.length === 0) {
          return null
        } else {
          const dailyPL = prevData.trades.reduce((total, trade) => {
            const entry = typeof trade.entry_price === 'number' ? trade.entry_price : parseFloat(trade.entry_price)
            const exit = typeof trade.exit_price === 'number' ? trade.exit_price : parseFloat(trade.exit_price)
            const charges = typeof trade.charges === 'number' ? trade.charges : parseFloat(trade.charges)

            const grossPL = trade.side === 'BUY'
              ? (exit - entry) * trade.quantity
              : (entry - exit) * trade.quantity
            return total + (grossPL - (Number.isFinite(charges) ? charges : 0))
          }, 0)
          return dailyPL > 0 ? 'gain' : dailyPL < 0 ? 'loss' : 'mixed'
        }
      })()

      if (dayResult === 'gain' && prevDayResult === 'gain') {
        tempGainStreak++
        streaks.currentGainStreak = tempGainStreak
      } else if (dayResult === 'loss' && prevDayResult === 'loss') {
        tempLossStreak++
        streaks.currentLossStreak = tempLossStreak
      } else if (dayResult === 'no_trade' && prevDayResult === 'no_trade') {
        tempNoTradeStreak++
        streaks.currentNoTradeStreak = tempNoTradeStreak
      } else {
        // Reset current streak counters
        if (dayResult === 'gain') {
          tempGainStreak = 1
          tempLossStreak = 0
          tempNoTradeStreak = 0
        } else if (dayResult === 'loss') {
          tempLossStreak = 1
          tempGainStreak = 0
          tempNoTradeStreak = 0
        } else if (dayResult === 'no_trade') {
          tempNoTradeStreak = 1
          tempGainStreak = 0
          tempLossStreak = 0
        }
      }
    }

    // Update longest streaks
    if (dayResult === 'gain') {
      maxGainStreak++
      maxLossStreak = 0
      maxNoTradeStreak = 0
    } else if (dayResult === 'loss') {
      maxLossStreak++
      maxGainStreak = 0
      maxNoTradeStreak = 0
    } else if (dayResult === 'no_trade') {
      maxNoTradeStreak++
      maxGainStreak = 0
      maxLossStreak = 0
    }

    streaks.longestGainStreak = Math.max(streaks.longestGainStreak, maxGainStreak)
    streaks.longestLossStreak = Math.max(streaks.longestLossStreak, maxLossStreak)
    streaks.longestNoTradeStreak = Math.max(streaks.longestNoTradeStreak, maxNoTradeStreak)

    // Add to recent streaks (last 10 days)
    if (index < 10) {
      streaks.recentStreaks.push({
        date,
        result: dayResult,
        trades: dayData.trades.length,
        hasNoTradeDay: dayData.hasNoTradeDay
      })
    }
  })

  return streaks
}
