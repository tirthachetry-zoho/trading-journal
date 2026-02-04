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
    const body = await request.json()
    const { fromDate, toDate } = body

    // Set default date range if not provided
    const today = new Date()
    const defaultFromDate = new Date(today.getFullYear(), today.getMonth(), 1) // First day of current month
    const defaultToDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) // Yesterday

    const startDate = fromDate ? new Date(fromDate) : defaultFromDate
    const endDate = toDate ? new Date(toDate) : defaultToDate

    // Validate date range
    if (startDate >= endDate) {
      return NextResponse.json({
        success: false,
        error: 'Start date must be before end date'
      }, { status: 400 })
    }

    // Don't allow marking future dates
    if (endDate > today) {
      return NextResponse.json({
        success: false,
        error: 'Cannot mark no-trade days for future dates'
      }, { status: 400 })
    }

    // Get all weekdays in the date range
    const dates = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (dates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No weekdays found in the specified date range'
      }, { status: 400 })
    }

    // Get existing trades for these dates
    const dateStrings = dates.map(date => date.toISOString().split('T')[0])
    const tradesQuery = await sql`
      SELECT DISTINCT trade_date
      FROM trades
      WHERE user_id = ${user.id} 
      AND trade_date = ANY(${dateStrings})
    `
    
    const datesWithTrades = new Set(tradesQuery.map(row => row.trade_date))

    // Get existing no-trade days to avoid duplicates
    const existingNoTradeDaysQuery = await sql`
      SELECT trade_date
      FROM no_trade_days
      WHERE user_id = ${user.id}
      AND trade_date = ANY(${dateStrings})
    `
    
    const existingNoTradeDays = new Set(existingNoTradeDaysQuery.map(row => row.trade_date))

    // Filter dates that need no-trade day marking
    const datesToMark = dateStrings.filter(dateStr => 
      !datesWithTrades.has(dateStr) && 
      !existingNoTradeDays.has(dateStr)
    )

    if (datesToMark.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new no-trade days to mark. All weekdays in the range already have trades or no-trade days.',
        data: {
          totalWeekdays: dates.length,
          datesWithTrades: datesWithTrades.size,
          existingNoTradeDays: existingNoTradeDays.size,
          newlyMarked: 0
        }
      })
    }

    // Batch insert no-trade days using individual inserts for safety
    for (const dateStr of datesToMark) {
      await sql`
        INSERT INTO no_trade_days (user_id, trade_date, reason, auto_created)
        VALUES (${user.id}, ${dateStr}, 'No trades executed - automatically marked', TRUE)
        ON CONFLICT (user_id, trade_date) DO NOTHING
      `
    }

    return NextResponse.json({
      success: true,
      message: `Successfully marked ${datesToMark.length} no-trade day(s)`,
      data: {
        totalWeekdays: dates.length,
        datesWithTrades: datesWithTrades.size,
        existingNoTradeDays: existingNoTradeDays.size,
        newlyMarked: datesToMark.length,
        datesMarked: datesToMark
      }
    })

  } catch (error) {
    console.error('Error auto-marking no-trade days:', error)
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
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    // Set default date range if not provided
    const today = new Date()
    const defaultFromDate = new Date(today.getFullYear(), today.getMonth(), 1) // First day of current month
    const defaultToDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) // Yesterday

    const startDate = fromDate ? new Date(fromDate) : defaultFromDate
    const endDate = toDate ? new Date(toDate) : defaultToDate

    // Get all weekdays in the date range
    const dates = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    const dateStrings = dates.map(date => date.toISOString().split('T')[0])

    // Get trades and no-trade days statistics
    const [tradesStats, noTradeDaysStats] = await Promise.all([
      sql`
        SELECT trade_date, COUNT(*) as trade_count
        FROM trades
        WHERE user_id = ${user.id} 
        AND trade_date = ANY(${dateStrings})
        GROUP BY trade_date
      `,
      sql`
        SELECT trade_date, reason, auto_created, created_at
        FROM no_trade_days
        WHERE user_id = ${user.id}
        AND trade_date = ANY(${dateStrings})
        ORDER BY trade_date DESC
      `
    ])

    const tradesMap = new Map(tradesStats.map(row => [row.trade_date, parseInt(row.trade_count)]))
    const noTradeDaysMap = new Map(noTradeDaysStats.map(row => [row.trade_date, row]))

    // Analyze each date
    const analysis = dateStrings.map(dateStr => {
      const hasTrades = tradesMap.has(dateStr)
      const hasNoTradeDay = noTradeDaysMap.has(dateStr)
      const tradeCount = tradesMap.get(dateStr) || 0
      const noTradeDayInfo = noTradeDaysMap.get(dateStr)

      return {
        date: dateStr,
        dayOfWeek: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
        hasTrades,
        tradeCount,
        hasNoTradeDay,
        noTradeDayInfo,
        needsNoTradeDay: !hasTrades && !hasNoTradeDay
      }
    })

    const summary = {
      totalWeekdays: dates.length,
      datesWithTrades: tradesMap.size,
      datesWithNoTradeDays: noTradeDaysMap.size,
      datesNeedingNoTradeDay: analysis.filter(d => d.needsNoTradeDay).length,
      dateRange: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        analysis
      }
    })

  } catch (error) {
    console.error('Error analyzing no-trade days:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
