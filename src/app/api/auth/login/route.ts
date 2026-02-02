import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

import { sql } from '@/lib/neon'
import { signJwt } from '@/lib/jwt'
import type { LoginCredentials } from '@/types/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`login:${ip}`, { windowMs: 10 * 60 * 1000, max: 20 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body: LoginCredentials = await request.json()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const users = await sql`
      SELECT id, email, password, created_at, email_verified
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]
    
    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in. Check your inbox for the verification link.' },
        { status: 401 }
      )
    }
    
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: 'JWT_SECRET is not set' },
        { status: 500 }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const expiresInSeconds = 60 * 60 * 24 * 7
    const token = signJwt(
      {
        sub: user.id.toString(),
        email: user.email,
        exp: now + expiresInSeconds,
      },
      secret
    )

    const response = NextResponse.json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    })

    response.cookies.set({
      name: 'tj_token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: expiresInSeconds,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
