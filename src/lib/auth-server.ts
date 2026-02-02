import { sql } from '@/lib/neon'
import { getBearerTokenFromHeader, verifyJwt } from '@/lib/jwt'

export async function getAuthUser(request: Request) {
  const bearer = getBearerTokenFromHeader(request.headers.get('authorization'))

  const cookieHeader = request.headers.get('cookie')
  const cookieToken = cookieHeader
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('tj_token='))
    ?.split('=')[1]

  const token = bearer ?? (cookieToken ? decodeURIComponent(cookieToken) : null)
  if (!token) {
    return { user: null, error: 'Authorization header is required', status: 401 as const }
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return { user: null, error: 'JWT_SECRET is not set', status: 500 as const }
  }

  let payload
  try {
    payload = verifyJwt(token, secret)
  } catch {
    return { user: null, error: 'Invalid token', status: 401 as const }
  }

  const userId = Number(payload.sub)
  if (!Number.isFinite(userId)) {
    return { user: null, error: 'Invalid token', status: 401 as const }
  }

  const users = await sql`
    SELECT id, email, created_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `

  if (users.length === 0) {
    return { user: null, error: 'Invalid token', status: 401 as const }
  }

  return { user: users[0], error: null, status: 200 as const }
}
