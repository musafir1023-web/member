import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/chat/mark-read - Mark messages as read
export async function POST(req: NextRequest) {
  try {
    const { conversationId, role } = await req.json()

    if (!conversationId || !role) {
      return NextResponse.json({ error: 'conversationId and role required' }, { status: 400 })
    }

    // Update messages
    if (role === 'admin') {
      await db.message.updateMany({
        where: { conversationId, readByAdmin: false },
        data: { readByAdmin: true },
      })
      await db.conversation.update({
        where: { id: conversationId },
        data: { unreadAdmin: 0 },
      })
    } else {
      await db.message.updateMany({
        where: { conversationId, readByUser: false },
        data: { readByUser: true },
      })
      await db.conversation.update({
        where: { id: conversationId },
        data: { unreadUser: 0 },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Chat Mark Read]', error)
    return NextResponse.json({ error: 'Gagal update pesan' }, { status: 500 })
  }
}