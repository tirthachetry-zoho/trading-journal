import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail, generateVerificationToken, getTokenExpiration } from '@/lib/email'

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
    const rl = checkRateLimit(`resend-verification:${ip}`, { windowMs: 60 * 60 * 1000, max: 3 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user
    const users = await sql`
      SELECT id, email, email_verified
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      // Don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a verification link has been sent.'
      })
    }

    const user = users[0]

    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'This email is already verified. You can log in.'
      })
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = getTokenExpiration(24) // 24 hours

    // Update user with new token
    await sql`
      UPDATE users 
      SET email_verification_token = ${verificationToken}, 
          email_verification_expires = ${verificationExpires}
      WHERE id = ${user.id}
    `

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    await sendEmail(
      email,
      'Verify your email address',
      `
        <h2>Verify your email address</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `
    )

    return NextResponse.json({
      success: true,
      message: 'Verification link sent. Please check your email.'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
