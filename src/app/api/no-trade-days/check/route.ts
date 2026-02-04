import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: authResult.status || 401 }
      )
    }

    const user = authResult.user

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const marketCloseTimeInMinutes = 15 * 60 + 30 // 3:30 PM = 15:30 = 930 minutes

    // Check if it's after 3:30 PM
    if (currentTimeInMinutes < marketCloseTimeInMinutes) {
      return NextResponse.json({
        success: false,
        message: 'Market has not closed yet. No-trade-day can only be marked after 3:30 PM.',
        currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`
      })
    }

    // Check if today is a weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentTime.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({
        success: false,
        message: 'No-trade-day is only created for weekdays (Monday-Friday).'
      })
    }

    // Check if there are any trades for today
    const trades = await sql`
      SELECT COUNT(*) as trade_count
      FROM trades
      WHERE user_id = ${user.id} AND trade_date = ${today}
    `

    const tradeCount = parseInt(trades[0].trade_count)

    if (tradeCount > 0) {
      return NextResponse.json({
        success: false,
        message: `You already have ${tradeCount} trade(s) for today. No-trade-day not needed.`
      })
    }

    // Check if no-trade-day already exists for today
    const existingNoTradeDay = await sql`
      SELECT id FROM no_trade_days
      WHERE user_id = ${user.id} AND trade_date = ${today}
    `

    if (existingNoTradeDay.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'No-trade-day already marked for today.'
      })
    }

    // Create no-trade-day entry
    await sql`
      INSERT INTO no_trade_days (user_id, trade_date, reason, auto_created)
      VALUES (${user.id}, ${today}, 'No trades executed today - automatically marked after market close', TRUE)
    `

    return NextResponse.json({
      success: true,
      message: 'No-trade-day marked successfully for today.',
      date: today,
      time: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`
    })

  } catch (error) {
    console.error('Error checking no-trade-day:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const today = new Date().toISOString().split('T')[0]
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const marketCloseTimeInMinutes = 15 * 60 + 30 // 3:30 PM

    // Check if there are any trades for today
    const trades = await sql`
      SELECT COUNT(*) as trade_count
      FROM trades
      WHERE user_id = ${user.id} AND trade_date = ${today}
    `

    const tradeCount = parseInt(trades[0].trade_count)

    // Check if no-trade-day already exists for today
    const existingNoTradeDay = await sql`
      SELECT id, created_at FROM no_trade_days
      WHERE user_id = ${user.id} AND trade_date = ${today}
    `

    const hasNoTradeDay = existingNoTradeDay.length > 0
    const afterMarketClose = currentTimeInMinutes >= marketCloseTimeInMinutes
    const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6

    return NextResponse.json({
      success: true,
      data: {
        date: today,
        currentTime: `${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
        tradeCount,
        hasNoTradeDay,
        afterMarketClose,
        isWeekend,
        canCreateNoTradeDay: afterMarketClose && !isWeekend && tradeCount === 0 && !hasNoTradeDay,
        message: afterMarketClose && !isWeekend && tradeCount === 0 && !hasNoTradeDay
          ? 'You can mark today as a no-trade-day'
          : hasNoTradeDay
          ? 'No-trade-day already marked for today'
          : tradeCount > 0
          ? `You have ${tradeCount} trade(s) today`
          : !afterMarketClose
          ? 'Market has not closed yet (after 3:30 PM)'
          : 'Weekend - no-trade-day not applicable'
      }
    })

  } catch (error) {
    console.error('Error getting no-trade-day status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
