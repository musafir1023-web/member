import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/messages?roomId=xxx&before=xxx&limit=50
export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get('roomId')
    const before = request.nextUrl.searchParams.get('before')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)

    if (!roomId) {
      return NextResponse.json({ error: 'roomId diperlukan' }, { status: 400 })
    }

    const where: Record<string, unknown> = { roomId }
    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await db.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Return in chronological order (oldest first), serialize dates
    const serialized = messages.reverse().map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }))
    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Chat messages error:', error)
    return NextResponse.json({ error: 'Gagal memuat pesan' }, { status: 500 })
  }
}