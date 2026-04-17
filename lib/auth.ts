// Uses the Web Crypto API (globalThis.crypto.subtle) instead of the Node.js
// 'crypto' built-in. This is required because Next.js middleware runs on
// Vercel's Edge Runtime, which does NOT have Node.js built-ins like 'crypto'.
// The Web Crypto API is available in both Edge Runtime and Node.js 18+.

export const COOKIE_NAME = 'gallery_auth'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getExpectedToken(): Promise<string> {
  const password = process.env.GALLERY_PASSWORD
  if (!password) throw new Error('GALLERY_PASSWORD env var is not set')
  return hmacSha256(password, 'gallery_session_v1')
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const expected = await getExpectedToken()
    return token === expected
  } catch {
    return false
  }
}
