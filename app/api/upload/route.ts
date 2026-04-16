import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic'])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const photosDir = join(process.cwd(), 'public', 'photos')
    await mkdir(photosDir, { recursive: true })

    const results: { name: string; src: string }[] = []

    for (const file of files) {
      // Validate type
      const ext = extname(file.name).toLowerCase()
      if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 }
        )
      }

      // Generate a unique filename to avoid collisions
      const uniqueName = `${randomUUID()}${ext || '.jpg'}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(join(photosDir, uniqueName), buffer)

      results.push({ name: uniqueName, src: `/photos/${uniqueName}` })
    }

    return NextResponse.json({ ok: true, uploaded: results })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
