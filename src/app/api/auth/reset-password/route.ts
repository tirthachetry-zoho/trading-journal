import { NextResponse } from 'next/server'

export async function POST() {
  try {
    return NextResponse.json(
      { error: 'Password reset not implemented yet' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
