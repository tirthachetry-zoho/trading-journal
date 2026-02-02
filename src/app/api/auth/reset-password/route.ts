import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail, generateResetToken, getTokenExpiration } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)
    const rl = checkRateLimit(`reset-password:${ip}`, { windowMs: 60 * 60 * 1000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user
    const users = await sql`
      SELECT id, email
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = generateResetToken()
    const resetExpires = getTokenExpiration(1) // 1 hour

    // Update user with reset token
    await sql`
      UPDATE users 
      SET password_reset_token = ${resetToken}, 
          password_reset_expires = ${resetExpires}
      WHERE id = ${user.id}
    `

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/confirm?token=${resetToken}`
    await sendEmail(
      email,
      'Reset your password',
      `
        <h2>Reset your password</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
      `
    )

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent. Please check your email.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
