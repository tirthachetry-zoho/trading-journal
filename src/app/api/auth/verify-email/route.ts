import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)
    const rl = checkRateLimit(`verify-email:${ip}`, { windowMs: 15 * 60 * 1000, max: 10 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user with valid verification token
    const users = await sql`
      SELECT id, email, email_verification_expires 
      FROM users 
      WHERE email_verification_token = ${token}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const user = users[0]

    // Check if token has expired
    if (new Date() > new Date(user.email_verification_expires)) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Verify email and clear token
    await sql`
      UPDATE users 
      SET email_verified = TRUE, 
          email_verification_token = NULL, 
          email_verification_expires = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
