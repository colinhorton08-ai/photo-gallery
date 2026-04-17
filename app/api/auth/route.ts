import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, COOKIE_MAX_AGE, getExpectedToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    const expectedPassword = process.env.GALLERY_PASSWORD
    if (!expectedPassword) {
      console.error('GALLERY_PASSWORD environment variable is not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await getExpectedToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
