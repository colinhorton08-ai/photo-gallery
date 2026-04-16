import { NextResponse } from 'next/server'
import { readdirSync } from 'fs'
import { join } from 'path'

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.gif'])

export async function GET() {
  try {
    const photosDir = join(process.cwd(), 'public', 'photos')
    const files = readdirSync(photosDir)

    const photos = files
      .filter((file) => {
        const ext = file.slice(file.lastIndexOf('.')).toLowerCase()
        return SUPPORTED_EXTENSIONS.has(ext)
      })
      .map((file) => ({
        src: `/photos/${file}`,
        name: file,
      }))

    return NextResponse.json({ photos })
  } catch {
    return NextResponse.json({ photos: [] })
  }
}
