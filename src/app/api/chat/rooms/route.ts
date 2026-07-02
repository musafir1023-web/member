import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/rooms — list rooms (admin: all, customer: own room)
// POST /api/chat/rooms — create or get room for customer
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const role = request.nextUrl.searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 })
    }

    if (role === 'admin') {
      const rooms = await db.chatRoom.findMany({
        orderBy: { lastMessageAt: 'desc' },
        select: {
          id: true,
          customerId: true,
          customerName: true,
          lastMessage: true,
          lastMessageAt: true,
          unreadAdmin: true,
          _count: { select: { messages: true } },
        },
      })
      return NextResponse.json(rooms)
    }

    // Customer: get or create their room
    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    let room = await db.chatRoom.findUnique({ where: { customerId: userId } })

    if (!room) {
      room = await db.chatRoom.create({
        data: { customerId: userId, customerName: user.name },
      })
    }

    return NextResponse.json([room])
  } catch (error) {
    console.error('Chat rooms error:', error)
    return NextResponse.json({ error: 'Gagal memuat chat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name } = body

    if (!userId || !name) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Find existing room or create new
    const existing = await db.chatRoom.findUnique({ where: { customerId: userId } })

    if (existing) {
      return NextResponse.json(existing)
    }

    const room = await db.chatRoom.create({
      data: { customerId: userId, customerName: name },
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Create chat room error:', error)
    return NextResponse.json({ error: 'Gagal membuat chat' }, { status: 500 })
  }
}