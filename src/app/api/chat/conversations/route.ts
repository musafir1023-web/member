import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/conversations?userId=xxx&role=customer|admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
    }

    if (role === 'admin') {
      // Admin sees all conversations, ordered by last message
      const conversations = await db.conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        select: {
          id: true,
          userId: true,
          userName: true,
          userPhone: true,
          lastMessage: true,
          lastMessageAt: true,
          unreadAdmin: true,
          createdAt: true,
          _count: { select: { messages: true } },
        },
      })
      return NextResponse.json(conversations)
    } else {
      // Customer sees only their conversation
      const conversation = await db.conversation.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          userName: true,
          userPhone: true,
          lastMessage: true,
          lastMessageAt: true,
          unreadUser: true,
          createdAt: true,
          _count: { select: { messages: true } },
        },
      })
      return NextResponse.json(conversation ? [conversation] : [])
    }
  } catch (error) {
    console.error('[Chat Conversations GET]', error)
    return NextResponse.json({ error: 'Gagal memuat percakapan' }, { status: 500 })
  }
}

// POST /api/chat/conversations - Create or get existing conversation
export async function POST(req: NextRequest) {
  try {
    const { userId, userName, userPhone } = await req.json()

    if (!userId || !userName) {
      return NextResponse.json({ error: 'userId and userName required' }, { status: 400 })
    }

    // Upsert: find existing or create new
    let conversation = await db.conversation.findUnique({
      where: { userId },
    })

    if (!conversation) {
      conversation = await db.conversation.create({
        data: { userId, userName, userPhone: userPhone || null },
      })
    } else {
      // Update name/phone if changed
      conversation = await db.conversation.update({
        where: { userId },
        data: { userName, userPhone: userPhone || null },
      })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('[Chat Conversations POST]', error)
    return NextResponse.json({ error: 'Gagal membuat percakapan' }, { status: 500 })
  }
}