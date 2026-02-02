import crypto from 'crypto'

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(input: string) {
  const pad = input.length % 4
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .concat(pad ? '='.repeat(4 - pad) : '')
  return Buffer.from(base64, 'base64')
}

export type JwtPayload = {
  sub: string
  email: string
  exp: number
  iat: number
}

export function signJwt(payload: Omit<JwtPayload, 'iat'>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const fullPayload: JwtPayload = { ...payload, iat }

  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`

  const signature = crypto.createHmac('sha256', secret).update(data).digest()
  const sigB64 = base64UrlEncode(signature)

  return `${data}.${sigB64}`
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token format')
  }

  const [headerB64, payloadB64, sigB64] = parts
  const data = `${headerB64}.${payloadB64}`

  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest()
  const expectedSigB64 = base64UrlEncode(expectedSig)

  const a = Buffer.from(expectedSigB64)
  const b = Buffer.from(sigB64)

  // constant time compare
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Invalid token signature')
  }

  const payloadJson = base64UrlDecode(payloadB64).toString('utf8')
  const payload = JSON.parse(payloadJson) as JwtPayload

  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    throw new Error('Token expired')
  }

  return payload
}

export function getBearerTokenFromHeader(authorizationHeader: string | null) {
  if (!authorizationHeader) return null
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
