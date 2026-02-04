import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { getAuthUser } from '@/lib/auth-server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUser(request)
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: authResult.status || 401 }
      )
    }

    const user = authResult.user
    const { id: noTradeDayId } = await params

    // Delete the no-trade day (only if it belongs to the user)
    const result = await sql`
      DELETE FROM no_trade_days
      WHERE id = ${noTradeDayId} AND user_id = ${user.id}
      RETURNING id, trade_date
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'No-trade day not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'No-trade day deleted successfully',
      data: {
        id: result[0].id,
        trade_date: result[0].trade_date
      }
    })

  } catch (error) {
    console.error('Error deleting no-trade day:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
