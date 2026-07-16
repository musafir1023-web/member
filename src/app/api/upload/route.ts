import { NextRequest, NextResponse } from 'next/server'

// Vercel serverless function config
export const maxDuration = 10
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const MIME_PREFIX: Record<string, string> = {
  'image/jpeg': 'data:image/jpeg;base64,',
  'image/png': 'data:image/png;base64,',
  'image/gif': 'data:image/gif;base64,',
  'image/webp': 'data:image/webp;base64,',
}

export async function POST(request: NextRequest) {
  // Always return JSON — even on unexpected errors
  const json = (status: number, data: Record<string, string>) =>
    new NextResponse(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return json(400, { error: 'File tidak ditemukan' })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return json(400, { error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.' })
    }

    if (file.size > MAX_FILE_SIZE) {
      return json(400, { error: 'Ukuran file maksimal 2MB' })
    }

    // Convert to base64 data URL (no filesystem write — works on Vercel read-only)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const url = `${MIME_PREFIX[file.type] || 'data:image/png;base64,'}${base64}`

    return json(200, { url })
  } catch (error: unknown) {
    console.error('[Upload error]', error)
    const msg = error instanceof Error ? error.message : 'Gagal mengunggah gambar'
    return json(500, { error: msg })
  }
}