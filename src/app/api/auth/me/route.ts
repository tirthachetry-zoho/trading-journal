import { NextResponse, NextRequest } from 'next/server'

import { getAuthUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error }, { status })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
