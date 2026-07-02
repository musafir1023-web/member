import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/chat/send — send a message (REST fallback)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, senderId, senderName, senderRole, content } = body

    if (!roomId || !senderId || !senderName || !senderRole || !content?.trim()) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId,
        senderName,
        senderRole,
        content: content.trim(),
      },
    })

    // Update room
    const unreadField = senderRole === 'admin' ? 'unreadCustomer' : 'unreadAdmin'
    await db.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: content.trim().slice(0, 100),
        lastMessageAt: message.createdAt,
        [unreadField]: { increment: 1 },
      },
    })

    return NextResponse.json({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}