import { NextResponse, NextRequest } from 'next/server'
import { sql } from '@/lib/neon'
import bcrypt from 'bcryptjs'
import type { RegisterCredentials } from '@/types/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail, generateVerificationToken, getTokenExpiration } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`register:${ip}`, { windowMs: 60 * 60 * 1000, max: 10 })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body: RegisterCredentials = await request.json()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered. Try logging in instead.' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const verificationExpires = getTokenExpiration(24) // 24 hours

    // Create new user with verification token
    const result = await sql`
      INSERT INTO users (email, password, email_verification_token, email_verification_expires) 
      VALUES (${email}, ${hashedPassword}, ${verificationToken}, ${verificationExpires}) 
      RETURNING id, email, email_verified
    `
    
    const user = result[0]

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    await sendEmail(
      email,
      'Verify your email address',
      `
        <h2>Welcome to Trading Journal!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
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
      user: { id: user.id, email: user.email, email_verified: user.email_verified },
      message: 'Account created successfully. Please check your email to verify your account.'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
