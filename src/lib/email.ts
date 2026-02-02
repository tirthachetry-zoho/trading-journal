import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  // In development, still log but also try to send real email
  if (process.env.NODE_ENV === 'development') {
    console.log('--- EMAIL ---')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html}`)
    console.log('--- END EMAIL ---')
  }

  // Only send real email if RESEND_API_KEY is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email logged only.')
    return { success: true, logged: true, mock: true }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject,
      html,
    })
    
    console.log('Email sent successfully:', result)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getTokenExpiration(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}
