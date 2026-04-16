import { createHmac } from 'crypto'

export const COOKIE_NAME = 'gallery_auth'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getExpectedToken(): string {
  const password = process.env.GALLERY_PASSWORD
  if (!password) throw new Error('GALLERY_PASSWORD env var is not set')
  return createHmac('sha256', password).update('gallery_session_v1').digest('hex')
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  try {
    const expected = getExpectedToken()
    return token === expected
  } catch {
    return false
  }
}
