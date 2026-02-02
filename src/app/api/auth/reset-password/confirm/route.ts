import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import bcrypt from 'bcryptjs'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)
    const rl = checkRateLimit(`reset-password-confirm:${ip}`, { windowMs: 60 * 60 * 1000, max: 5 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user with valid reset token
    const users = await sql`
      SELECT id, email, password_reset_expires 
      FROM users 
      WHERE password_reset_token = ${token}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const user = users[0]

    // Check if token has expired
    if (new Date() > new Date(user.password_reset_expires)) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, 
          password_reset_token = NULL, 
          password_reset_expires = NULL
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    })
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
