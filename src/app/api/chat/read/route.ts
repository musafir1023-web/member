import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/chat/read — mark messages as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, role } = body

    if (!roomId || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Mark messages from the OTHER role as read
    const otherRole = role === 'admin' ? 'customer' : 'admin'
    await db.chatMessage.updateMany({
      where: { roomId, read: false, senderRole: otherRole },
      data: { read: true },
    })

    const updateField = role === 'admin' ? 'unreadAdmin' : 'unreadCustomer'
    await db.chatRoom.update({
      where: { id: roomId },
      data: { [updateField]: 0 },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: 'Gagal update pesan' }, { status: 500 })
  }
}