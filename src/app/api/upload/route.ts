import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Map MIME types to base64 prefix
const MIME_PREFIX: Record<string, string> = {
  'image/jpeg': 'data:image/jpeg;base64,',
  'image/png': 'data:image/png;base64,',
  'image/gif': 'data:image/gif;base64,',
  'image/webp': 'data:image/webp;base64,',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 })
    }

    // Convert file to base64 data URL (no filesystem write needed — works on Vercel)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const url = `${MIME_PREFIX[file.type] || 'data:image/png;base64,'}${base64}`

    return NextResponse.json({ url })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const msg = error instanceof Error ? error.message : 'Gagal mengunggah gambar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}